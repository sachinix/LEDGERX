const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")


/**
 * ============================================================
 * CREATE TRANSACTION
 * ============================================================
 *
 * Normal user can transfer money only from their own account.
 *
 * POST /api/transactions
 *
 * UPDATED FLOW (race-condition safe):
 *
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. (Fast-fail only, NOT the real guard) Rough balance check
 * 5. Create transaction (PENDING)
 * 6. ATOMIC conditional debit on fromAccount (balance >= amount)
 *    -> if this fails, someone else already spent the balance
 * 7. Atomic credit on toAccount
 * 8. Create DEBIT ledger entry
 * 9. Create CREDIT ledger entry
 * 10. Mark transaction COMPLETED
 * 11. Commit MongoDB session
 * 12. Send email notification
 *
 */

async function createTransaction(req, res) {

    /**
     * 1. Validate request
     */

    const {
        toAccount,
        amount,
        idempotencyKey
    } = req.body


    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }


    /**
     * Get sender account from authenticated user
     *
     * We DO NOT take fromAccount from req.body.
     * This prevents a user from transferring money
     * from somebody else's account.
     */

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })


    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    }).populate("user")


    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }


    /**
     * Prevent transferring to the same account
     */

    if (
        fromUserAccount._id.toString() ===
        toUserAccount._id.toString()
    ) {
        return res.status(400).json({
            message: "Cannot transfer to the same account"
        })
    }


    /**
     * Currency validation
     */

    if (fromUserAccount.currency !== toUserAccount.currency) {
        return res.status(400).json({
            message: "Currency mismatch between fromAccount and toAccount"
        })
    }


    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExists =
        await transactionModel.findOne({
            idempotencyKey
        })


    if (isTransactionAlreadyExists) {

        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }


        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still processing"
            })
        }


        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }


        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }


    /**
     * 3. Check account status
     */

    if (
        fromUserAccount.status !== "ACTIVE" ||
        toUserAccount.status !== "ACTIVE"
    ) {
        return res.status(400).json({
            message:
                "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }


    /**
     * 4. Fast-fail balance check (UX only — NOT the real guard).
     *    This can still race, but it lets us reject obviously-bad
     *    requests early without opening a session. The REAL guard
     *    is the atomic $gte + $inc update inside the transaction below.
     */

    const roughBalance = await fromUserAccount.getBalance()

    if (!req.user.systemUser && roughBalance < amount) {
        return res.status(400).json({
            message:
                `Insufficient balance. Current balance is ${roughBalance}. Requested amount is ${amount}`
        })
    }


    let transaction
    let session


    try {

        /**
         * 5. Create transaction (PENDING)
         */

        session = await mongoose.startSession()

        session.startTransaction()


        transaction = (
            await transactionModel.create(
                [{
                    fromAccount: fromUserAccount._id,
                    toAccount: toUserAccount._id,
                    amount,
                    idempotencyKey,
                    status: "PENDING"
                }],
                {
                    session
                }
            )
        )[0]


        /**
         * 6. ATOMIC conditional debit.
         *
         * This is the actual race-condition fix: the balance check
         * and the debit happen in a SINGLE atomic database operation.
         * MongoDB guarantees no other write can interleave between
         * "check balance >= amount" and "subtract amount" for this
         * document. If two concurrent requests race here, only one
         * can succeed — the second will get updatedFromAccount = null
         * because by the time it runs, balance no longer satisfies
         * the $gte condition.
         *
         * System users bypass the balance guard (matches old behavior).
         */

        const debitFilter = {
            _id: fromUserAccount._id,
            ...(req.user.systemUser ? {} : { balance: { $gte: amount } })
        }

        const updatedFromAccount = await accountModel.findOneAndUpdate(
            debitFilter,
            { $inc: { balance: -amount } },
            { session, new: true }
        )

        if (!updatedFromAccount) {
            // Balance changed under us (or account gone) — real
            // insufficient-funds case, not just the rough check above.
            throw new Error(
                "Insufficient balance at time of transfer, please retry"
            )
        }


        /**
         * 7. Atomic credit on receiver (no guard needed for credits)
         */

        await accountModel.findOneAndUpdate(
            { _id: toUserAccount._id },
            { $inc: { balance: amount } },
            { session }
        )


        /**
         * 8. Create DEBIT ledger entry
         */

        await ledgerModel.create(
            [{
                account: fromUserAccount._id,
                amount,
                transaction: transaction._id,
                type: "DEBIT"
            }],
            {
                session
            }
        )


        /**
         * 9. Create CREDIT ledger entry
         */

        await ledgerModel.create(
            [{
                account: toUserAccount._id,
                amount,
                transaction: transaction._id,
                type: "CREDIT"
            }],
            {
                session
            }
        )


        /**
         * 10. Mark transaction COMPLETED
         */

        await transactionModel.findOneAndUpdate(
            {
                _id: transaction._id
            },
            {
                status: "COMPLETED"
            },
            {
                session
            }
        )


        /**
         * 11. Commit MongoDB session
         */

        await session.commitTransaction()

        session.endSession()


        transaction.status = "COMPLETED"


    } catch (error) {

        if (session) {

            await session.abortTransaction()

            session.endSession()

        }


        console.error("Transaction failed:", error)


        /**
         * Mark transaction as FAILED
         */

        if (transaction) {

            await transactionModel.findOneAndUpdate(
                {
                    _id: transaction._id
                },
                {
                    status: "FAILED",
                    failureReason:
                        error.message || "Unknown error"
                }
            ).catch((updateErr) => {

                console.error(
                    "Failed to mark transaction as FAILED:",
                    updateErr
                )

            })
        }


        /**
         * Send LedgerX transaction failure email
         */

        emailService
            .sendTransactionFailureEmail(
                req.user.email,
                req.user.name,
                amount,
                fromUserAccount.currency,
                toUserAccount._id
            )
            .catch((emailErr) => {

                console.error(
                    "Failed to send failure email:",
                    emailErr
                )

            })


        return res.status(500).json({
            message:
                error.message === "Insufficient balance at time of transfer, please retry"
                    ? error.message
                    : "Transaction failed, please retry after sometime"
        })
    }


    /**
     * Send response first.
     */

    res.status(201).json({
        message: "Transaction completed successfully",
        transaction
    })


    /**
     * 12. Send LedgerX transaction success email
     *
     * Fire-and-forget so email failure does not
     * affect successful transaction response.
     */

    emailService
        .sendTransactionEmail(
            req.user.email,
            req.user.name,
            amount,
            fromUserAccount.currency,
            toUserAccount._id
        )
        .catch((err) => {
            console.error(
                "Failed to send transaction email:",
                err
            )
        })

    if (toUserAccount.user?.email) {
        emailService
            .sendTransactionReceivedEmail(
                toUserAccount.user.email,
                toUserAccount.user.name,
                amount,
                fromUserAccount.currency,
                fromUserAccount._id
            )
            .catch((err) => {
                console.error(
                    "Failed to send transaction received email:",
                    err
                )
            })
    }
}


/**
 * ============================================================
 * CREATE ADMIN TRANSACTION
 * ============================================================
 *
 * Admin/System can transfer money from any account
 * to any account.
 *
 * POST /api/transactions/admin/transfer
 *
 */

async function createAdminTransaction(req, res) {

    /**
     * 1. Validate request
     */

    const {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey
    } = req.body


    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message:
                "fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }


    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount
    })


    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })


    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }


    /**
     * Prevent same account transfer
     */

    if (
        fromUserAccount._id.toString() ===
        toUserAccount._id.toString()
    ) {
        return res.status(400).json({
            message: "Cannot transfer to the same account"
        })
    }


    /**
     * Currency validation
     */

    if (fromUserAccount.currency !== toUserAccount.currency) {
        return res.status(400).json({
            message: "Currency mismatch between fromAccount and toAccount"
        })
    }


    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExists =
        await transactionModel.findOne({
            idempotencyKey
        })


    if (isTransactionAlreadyExists) {

        return res.status(200).json({
            message: "Transaction already processed",
            transaction: isTransactionAlreadyExists
        })
    }


    /**
     * 3. Check account status
     */

    if (
        fromUserAccount.status !== "ACTIVE" ||
        toUserAccount.status !== "ACTIVE"
    ) {
        return res.status(400).json({
            message:
                "Both fromAccount and toAccount must be ACTIVE to process transaction"
        })
    }


    /**
     * 4. Admin can transfer any amount from any eligible account.
     *    We still keep the `balance` field in sync via atomic $inc
     *    below, but WITHOUT the $gte guard (matches old behavior of
     *    not enforcing balance checks for system/admin transfers).
     */

    let transaction
    let session


    try {

        /**
         * 5. Create transaction (PENDING)
         */

        session = await mongoose.startSession()

        session.startTransaction()


        transaction = (
            await transactionModel.create(
                [{
                    fromAccount: fromUserAccount._id,
                    toAccount: toUserAccount._id,
                    amount,
                    idempotencyKey,
                    status: "PENDING"
                }],
                {
                    session
                }
            )
        )[0]


        /**
         * 6. Atomic debit (no balance guard for admin transfers)
         */

        await accountModel.findOneAndUpdate(
            { _id: fromUserAccount._id },
            { $inc: { balance: -amount } },
            { session }
        )


        /**
         * 7. Atomic credit
         */

        await accountModel.findOneAndUpdate(
            { _id: toUserAccount._id },
            { $inc: { balance: amount } },
            { session }
        )


        /**
         * 8. Create DEBIT ledger entry
         */

        await ledgerModel.create(
            [{
                account: fromUserAccount._id,
                amount,
                transaction: transaction._id,
                type: "DEBIT"
            }],
            {
                session
            }
        )


        /**
         * 9. Create CREDIT ledger entry
         */

        await ledgerModel.create(
            [{
                account: toUserAccount._id,
                amount,
                transaction: transaction._id,
                type: "CREDIT"
            }],
            {
                session
            }
        )


        /**
         * 10. Mark transaction COMPLETED
         */

        await transactionModel.findOneAndUpdate(
            {
                _id: transaction._id
            },
            {
                status: "COMPLETED"
            },
            {
                session
            }
        )


        /**
         * 11. Commit MongoDB session
         */

        await session.commitTransaction()

        session.endSession()


        transaction.status = "COMPLETED"


    } catch (error) {

        if (session) {

            await session.abortTransaction()

            session.endSession()

        }


        console.error(
            "Admin transaction failed:",
            error
        )


        /**
         * Mark transaction as FAILED
         */

        if (transaction) {

            await transactionModel.findOneAndUpdate(
                {
                    _id: transaction._id
                },
                {
                    status: "FAILED",
                    failureReason:
                        error.message || "Unknown error"
                }
            ).catch((err) => {

                console.error(
                    "Failed to mark transaction as FAILED:",
                    err
                )

            })
        }


        return res.status(500).json({
            message:
                "Admin transaction failed, please retry after sometime"
        })
    }


    /**
     * 12. Send response
     *
     * No email for admin/system transfers.
     */

    return res.status(201).json({
        message:
            "Admin transaction completed successfully",
        transaction
    })
}


/**
 * ============================================================
 * CREATE INITIAL FUNDS TRANSACTION
 * ============================================================
 * (UNCHANGED from your latest version — already has try/catch.
 *  Not touching balance guard here since system seeding
 *  intentionally allows the system account to go negative,
 *  same as before.)
 * ============================================================
 */

async function createInitialFundsTransaction(req, res) {
    const {
        toAccount,
        amount,
        idempotencyKey
    } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message:
                "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    let transaction
    let session

    try {
        session = await mongoose.startSession()

        session.startTransaction()

        transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        })

        /**
         * Keep balance field in sync too (optional but recommended
         * for consistency with the two functions above)
         */

        await accountModel.findOneAndUpdate(
            { _id: fromUserAccount._id },
            { $inc: { balance: -amount } },
            { session }
        )

        await accountModel.findOneAndUpdate(
            { _id: toAccount },
            { $inc: { balance: amount } },
            { session }
        )

        /**
         * DEBIT system account
         */

        await ledgerModel.create(
            [{
                account: fromUserAccount._id,
                amount,
                transaction: transaction._id,
                type: "DEBIT"
            }],
            {
                session
            }
        )

        /**
         * CREDIT user's account
         */

        await ledgerModel.create(
            [{
                account: toAccount,
                amount,
                transaction: transaction._id,
                type: "CREDIT"
            }],
            {
                session
            }
        )

        transaction.status = "COMPLETED"

        await transaction.save({
            session
        })

        await session.commitTransaction()

        session.endSession()

        return res.status(201).json({
            message:
                "Initial funds transaction completed successfully",
            transaction
        })
    } catch (error) {
        if (session) {
            await session.abortTransaction()
            session.endSession()
        }

        console.error("Initial funds transaction failed:", error)

        if (transaction) {
            await transactionModel.findOneAndUpdate(
                {
                    _id: transaction._id
                },
                {
                    status: "FAILED",
                    failureReason:
                        error.message || "Unknown error"
                }
            ).catch((err) => {
                console.error(
                    "Failed to mark initial funds transaction as FAILED:",
                    err
                )
            })
        }

        return res.status(500).json({
            message:
                "Initial funds transaction failed, please retry after sometime"
        })
    }
}

async function getTransactionHistory(req, res) {
    const userAccounts = await accountModel.find({ user: req.user._id }, { _id: 1 })
    const accountIds = userAccounts.map((account) => account._id)

    const transactions = await transactionModel
        .find({
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } }
            ]
        })
        .sort({ createdAt: -1 })
        .populate({
            path: 'fromAccount',
            populate: {
                path: 'user',
                select: 'name email systemUser'
            }
        })
        .populate({
            path: 'toAccount',
            populate: {
                path: 'user',
                select: 'name email systemUser'
            }
        })

    res.status(200).json({ transactions })
}

async function getAllTransactions(req, res) {
    const transactions = await transactionModel
        .find()
        .sort({ createdAt: -1 })
        .populate({
            path: 'fromAccount',
            populate: {
                path: 'user',
                select: 'name email systemUser'
            }
        })
        .populate({
            path: 'toAccount',
            populate: {
                path: 'user',
                select: 'name email systemUser'
            }
        });

    res.status(200).json({ transactions });
}

module.exports = {
    createTransaction,
    getTransactionHistory,
    getAllTransactions,
    createAdminTransaction,
    createInitialFundsTransaction
}