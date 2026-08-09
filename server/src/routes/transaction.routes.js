const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require("../controllers/transaction.controller")


const transactionRoutes = Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction (normal user, only from own account)
 */
transactionRoutes.get("/", authMiddleware.authMiddleware, transactionController.getTransactionHistory)

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction)


/**
 * - POST /api/transactions/admin/transfer
 * - Create a transaction from ANY account to ANY account (admin/system only)
 */
transactionRoutes.get("/admin/all", authMiddleware.authSystemUserMiddleware, transactionController.getAllTransactions)

transactionRoutes.post("/admin/transfer", authMiddleware.authSystemUserMiddleware, transactionController.createAdminTransaction)


/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
transactionRoutes.post("/system/initial-funds", authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)


module.exports = transactionRoutes;