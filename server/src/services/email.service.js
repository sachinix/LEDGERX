const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: "LedgerX <onboarding@resend.dev>",
            to,
            subject,
            text,
            html,
        });

        if (error) {
            console.error("Error sending email:", error);
            return;
        }

        console.log("Message sent:", data.id);

    } catch (error) {
        console.error("Error sending email:", error);
    }
};


// ======================================================
// REGISTRATION EMAIL
// ======================================================

async function sendRegistrationEmail(userEmail, name) {

    const subject = "Welcome to LedgerX!";

    const text = `Hello ${name},

Thank you for registering at LedgerX. We're excited to have you on board!

Best regards,
The LedgerX Team`;

    const html = `
    <div style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">

        <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="background-color:#f4f5f7; padding:32px 0;"
        >

            <tr>
                <td align="center">

                    <table
                        role="presentation"
                        width="480"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                            background-color:#ffffff;
                            border-radius:8px;
                            overflow:hidden;
                            box-shadow:0 1px 3px rgba(0,0,0,0.08);
                        "
                    >

                        <!-- Header -->
                        <tr>
                            <td style="background-color:#111827; padding:24px 32px;">
                                <span
                                    style="
                                        color:#ffffff;
                                        font-size:20px;
                                        font-weight:bold;
                                        letter-spacing:0.5px;
                                    "
                                >
                                    LedgerX
                                </span>
                            </td>
                        </tr>


                        <!-- Content -->
                        <tr>
                            <td style="padding:32px;">

                                <h1
                                    style="
                                        margin:0 0 16px 0;
                                        font-size:20px;
                                        color:#111827;
                                    "
                                >
                                    Welcome, ${name} 👋
                                </h1>

                                <p
                                    style="
                                        margin:0 0 16px 0;
                                        font-size:15px;
                                        line-height:1.6;
                                        color:#374151;
                                    "
                                >
                                    Thanks for registering at
                                    <strong>LedgerX</strong>.
                                    Your account has been created successfully
                                    and you're all set to get started.
                                </p>

                                <p
                                    style="
                                        margin:0 0 24px 0;
                                        font-size:15px;
                                        line-height:1.6;
                                        color:#374151;
                                    "
                                >
                                    If you didn't create this account,
                                    you can safely ignore this email.
                                </p>


                                <!-- Button -->
                                <table
                                    role="presentation"
                                    cellpadding="0"
                                    cellspacing="0"
                                >
                                    <tr>
                                        <td
                                            style="
                                                background-color:#111827;
                                                border-radius:6px;
                                            "
                                        >
                                            <a
                                                href="#"
                                                style="
                                                    display:inline-block;
                                                    padding:12px 24px;
                                                    font-size:14px;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    font-weight:bold;
                                                "
                                            >
                                                Go to Dashboard
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>


                        <!-- Footer -->
                        <tr>
                            <td
                                style="
                                    padding:20px 32px;
                                    background-color:#f9fafb;
                                    border-top:1px solid #e5e7eb;
                                "
                            >

                                <p
                                    style="
                                        margin:0;
                                        font-size:12px;
                                        color:#9ca3af;
                                    "
                                >
                                    Best regards,<br>
                                    The LedgerX Team
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>

        </table>

    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}


// ======================================================
// TRANSACTION SUCCESS EMAIL
// ======================================================

async function sendTransactionEmail(
    userEmail,
    name,
    amount,
    currency,
    toAccount
) {

    const subject = "Transaction Successful!";

    const text = `Hello ${name},

Your transaction of ${amount} ${currency} to account ${toAccount} was successful.

Best regards,
The LedgerX Team`;

    const html = `
    <div style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">

        <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="background-color:#f4f5f7; padding:32px 0;"
        >

            <tr>
                <td align="center">

                    <table
                        role="presentation"
                        width="480"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                            background-color:#ffffff;
                            border-radius:8px;
                            overflow:hidden;
                            box-shadow:0 1px 3px rgba(0,0,0,0.08);
                        "
                    >

                        <!-- Header -->
                        <tr>
                            <td style="background-color:#111827; padding:24px 32px;">
                                <span
                                    style="
                                        color:#ffffff;
                                        font-size:20px;
                                        font-weight:bold;
                                        letter-spacing:0.5px;
                                    "
                                >
                                    LedgerX
                                </span>
                            </td>
                        </tr>


                        <!-- Content -->
                        <tr>
                            <td style="padding:32px;">

                                <h1
                                    style="
                                        margin:0 0 16px 0;
                                        font-size:20px;
                                        color:#111827;
                                    "
                                >
                                    Transaction Successful ✅
                                </h1>

                                <p
                                    style="
                                        margin:0 0 16px 0;
                                        font-size:15px;
                                        line-height:1.6;
                                        color:#374151;
                                    "
                                >
                                    Hello ${name}, your transaction of
                                    <strong>${amount} ${currency}</strong>
                                    to account
                                    <strong>${toAccount}</strong>
                                    was completed successfully.
                                </p>

                                <p
                                    style="
                                        margin:0 0 24px 0;
                                        font-size:15px;
                                        line-height:1.6;
                                        color:#374151;
                                    "
                                >
                                    If you didn't authorize this transaction,
                                    please contact support immediately.
                                </p>


                                <!-- Button -->
                                <table
                                    role="presentation"
                                    cellpadding="0"
                                    cellspacing="0"
                                >
                                    <tr>
                                        <td
                                            style="
                                                background-color:#111827;
                                                border-radius:6px;
                                            "
                                        >
                                            <a
                                                href="#"
                                                style="
                                                    display:inline-block;
                                                    padding:12px 24px;
                                                    font-size:14px;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    font-weight:bold;
                                                "
                                            >
                                                View Transaction
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>


                        <!-- Footer -->
                        <tr>
                            <td
                                style="
                                    padding:20px 32px;
                                    background-color:#f9fafb;
                                    border-top:1px solid #e5e7eb;
                                "
                            >

                                <p
                                    style="
                                        margin:0;
                                        font-size:12px;
                                        color:#9ca3af;
                                    "
                                >
                                    Best regards,<br>
                                    The LedgerX Team
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>

        </table>

    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionReceivedEmail(
    userEmail,
    name,
    amount,
    currency,
    fromAccount
) {
    const subject = "You've received money!";

    const text = `Hello ${name},

You have received ${amount} ${currency} from account ${fromAccount}.

Best regards,
The LedgerX Team`;

    const html = `
    <div style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">

        <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="background-color:#f4f5f7; padding:32px 0;"
        >

            <tr>
                <td align="center">

                    <table
                        role="presentation"
                        width="480"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                            background-color:#ffffff;
                            border-radius:8px;
                            overflow:hidden;
                            box-shadow:0 1px 3px rgba(0,0,0,0.08);
                        "
                    >

                        <!-- Header -->
                        <tr>
                            <td style="background-color:#111827; padding:24px 32px;">
                                <span
                                    style="
                                        color:#ffffff;
                                        font-size:20px;
                                        font-weight:bold;
                                        letter-spacing:0.5px;
                                    "
                                >
                                    LedgerX
                                </span>
                            </td>
                        </tr>


                        <!-- Content -->
                        <tr>
                            <td style="padding:32px;">

                                <h1
                                    style="
                                        margin:0 0 16px 0;
                                        font-size:20px;
                                        color:#111827;
                                    "
                                >
                                    Money Received ✅
                                </h1>

                                <p
                                    style="
                                        margin:0 0 16px 0;
                                        font-size:15px;
                                        line-height:1.6;
                                        color:#374151;
                                    "
                                >
                                    Hello ${name}, you have received
                                    <strong>${amount} ${currency}</strong>
                                    from account
                                    <strong>${fromAccount}</strong>.
                                </p>

                                <p
                                    style="
                                        margin:0 0 24px 0;
                                        font-size:15px;
                                        line-height:1.6;
                                        color:#374151;
                                    "
                                >
                                    If you were not expecting this transfer,
                                    please contact support immediately.
                                </p>

                                <!-- Button -->
                                <table
                                    role="presentation"
                                    cellpadding="0"
                                    cellspacing="0"
                                >
                                    <tr>
                                        <td
                                            style="
                                                background-color:#111827;
                                                border-radius:6px;
                                            "
                                        >
                                            <a
                                                href="#"
                                                style="
                                                    display:inline-block;
                                                    padding:12px 24px;
                                                    font-size:14px;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    font-weight:bold;
                                                "
                                            >
                                                View Transaction
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>


                        <!-- Footer -->
                        <tr>
                            <td
                                style="
                                    padding:20px 32px;
                                    background-color:#f9fafb;
                                    border-top:1px solid #e5e7eb;
                                "
                            >

                                <p
                                    style="
                                        margin:0;
                                        font-size:12px;
                                        color:#9ca3af;
                                    "
                                >
                                    Best regards,<br>
                                    The LedgerX Team
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>

        </table>

    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}


// ======================================================
// TRANSACTION FAILURE EMAIL
// ======================================================

async function sendTransactionFailureEmail(
    userEmail,
    name,
    amount,
    currency,
    toAccount
) {

    const subject = "Transaction Failed";

    const text = `Hello ${name},

We regret to inform you that your transaction of ${amount} ${currency} to account ${toAccount} has failed.

Please try again later.

Best regards,
The LedgerX Team`;

    const html = `
    <div style="margin:0; padding:0; background-color:#f4f5f7; font-family:Arial, Helvetica, sans-serif;">

        <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="background-color:#f4f5f7; padding:32px 0;"
        >

            <tr>
                <td align="center">

                    <table
                        role="presentation"
                        width="480"
                        cellpadding="0"
                        cellspacing="0"
                        style="
                            background-color:#ffffff;
                            border-radius:8px;
                            overflow:hidden;
                            box-shadow:0 1px 3px rgba(0,0,0,0.08);
                        "
                    >

                        <!-- Header -->
                        <tr>
                            <td style="background-color:#111827; padding:24px 32px;">
                                <span
                                    style="
                                        color:#ffffff;
                                        font-size:20px;
                                        font-weight:bold;
                                        letter-spacing:0.5px;
                                    "
                                >
                                    LedgerX
                                </span>
                            </td>
                        </tr>


                        <!-- Content -->
                        <tr>
                            <td style="padding:32px;">

                                <h1
                                    style="
                                        margin:0 0 16px 0;
                                        font-size:20px;
                                        color:#111827;
                                    "
                                >
                                    Transaction Failed ❌
                                </h1>

                                <p
                                    style="
                                        margin:0 0 16px 0;
                                        font-size:15px;
                                        line-height:1.6;
                                        color:#374151;
                                    "
                                >
                                    Hello ${name}, we regret to inform you
                                    that your transaction of
                                    <strong>${amount} ${currency}</strong>
                                    to account
                                    <strong>${toAccount}</strong>
                                    could not be completed.
                                </p>

                                <p
                                    style="
                                        margin:0 0 24px 0;
                                        font-size:15px;
                                        line-height:1.6;
                                        color:#374151;
                                    "
                                >
                                    Please try again later, or contact support
                                    if the issue persists.
                                </p>


                                <!-- Button -->
                                <table
                                    role="presentation"
                                    cellpadding="0"
                                    cellspacing="0"
                                >
                                    <tr>
                                        <td
                                            style="
                                                background-color:#111827;
                                                border-radius:6px;
                                            "
                                        >
                                            <a
                                                href="#"
                                                style="
                                                    display:inline-block;
                                                    padding:12px 24px;
                                                    font-size:14px;
                                                    color:#ffffff;
                                                    text-decoration:none;
                                                    font-weight:bold;
                                                "
                                            >
                                                Try Again
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>


                        <!-- Footer -->
                        <tr>
                            <td
                                style="
                                    padding:20px 32px;
                                    background-color:#f9fafb;
                                    border-top:1px solid #e5e7eb;
                                "
                            >

                                <p
                                    style="
                                        margin:0;
                                        font-size:12px;
                                        color:#9ca3af;
                                    "
                                >
                                    Best regards,<br>
                                    The LedgerX Team
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>

        </table>

    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionReceivedEmail,
    sendTransactionFailureEmail,
};