require("dotenv").config()
const mongoose = require("mongoose")
const accountModel = require("../src/models/account.model")

async function migrateBalances() {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to DB, starting migration...")

    const accounts = await accountModel.find()
    console.log(`Found ${accounts.length} accounts to migrate`)

    for (const account of accounts) {
        const realBalance = await account.getBalance()
        await accountModel.updateOne(
            { _id: account._id },
            { balance: realBalance }
        )
        console.log(`Account ${account._id}: balance set to ${realBalance}`)
    }

    console.log("Migration complete!")
    await mongoose.disconnect()
    process.exit(0)
}

migrateBalances().catch((err) => {
    console.error("Migration failed:", err)
    process.exit(1)
})