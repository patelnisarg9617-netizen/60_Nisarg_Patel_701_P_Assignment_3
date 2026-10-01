const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmployeeEmail(
    employee,
    plainPassword
) {
    const mailOptions = {
        from: process.env.EMAIL_USER,

        to: employee.email,

        subject: "ERP Employee Account Created",

        html: `
            <h2>Welcome to the ERP System</h2>

            <p>Hello <b>${employee.name}</b>,</p>

            <p>Your employee account has been created.</p>

            <table border="1" cellpadding="8">
                <tr>
                    <td><b>Employee ID</b></td>
                    <td>${employee.empid}</td>
                </tr>

                <tr>
                    <td><b>Email</b></td>
                    <td>${employee.email}</td>
                </tr>

                <tr>
                    <td><b>Department</b></td>
                    <td>${employee.department}</td>
                </tr>

                <tr>
                    <td><b>Designation</b></td>
                    <td>${employee.designation}</td>
                </tr>

                <tr>
                    <td><b>Temporary Password</b></td>
                    <td>${plainPassword}</td>
                </tr>
            </table>

            <p>
                Please change your password after your first login.
            </p>
        `
    };

    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendEmployeeEmail
};
