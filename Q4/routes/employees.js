const express = require("express");
const bcrypt = require("bcrypt");

const Employee = require("../models/Employee");

const generateEmployeeId = require("../utils/employeeId");

const {
    generatePassword,
    hashPassword
} = require("../utils/password");

const {
    sendEmployeeEmail
} = require("../utils/mailer");

const router = express.Router();


// ==========================================
// EMPLOYEE LIST
// ==========================================

router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find()
            .sort({ createdAt: -1 });

        res.render("employees/list", {
            employees
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});


// ==========================================
// ADD EMPLOYEE PAGE
// ==========================================

router.get("/add", (req, res) => {
    res.render("employees/add", {
        error: null
    });
});


// ==========================================
// ADD EMPLOYEE
// ==========================================

router.post("/add", async (req, res) => {
    try {
        const {
            name,
            email,
            department,
            designation,
            basicSalary
        } = req.body;

        // Generate employee ID
        const empid = await generateEmployeeId();

        // Generate temporary password
        const plainPassword = generatePassword();

        // Hash password
        const hashedPassword =
            await hashPassword(plainPassword);

        // Salary calculation
        const basic = Number(basicSalary);

        const hra = basic * 0.20;
        const da = basic * 0.10;

        const grossSalary =
            basic + hra + da;

        const pf = basic * 0.12;

        const netSalary =
            grossSalary - pf;

        const employee = new Employee({
            empid,
            name,
            email,
            department,
            designation,
            basicSalary: basic,

            hra,
            da,
            pf,

            grossSalary,
            netSalary,

            password: hashedPassword
        });

        await employee.save();

        // Send credentials by email
        try {
            await sendEmployeeEmail(
                employee,
                plainPassword
            );
        } catch (emailError) {
            console.error(
                "Email failed:",
                emailError
            );
        }

        res.redirect("/employees");

    } catch (error) {
        console.error(error);

        res.render("employees/add", {
            error: error.message
        });
    }
});


// ==========================================
// EDIT PAGE
// ==========================================

router.get("/edit/:id", async (req, res) => {
    try {
        const employee =
            await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404)
                .send("Employee not found");
        }

        res.render("employees/edit", {
            employee,
            error: null
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});


// ==========================================
// UPDATE EMPLOYEE
// ==========================================

router.post("/edit/:id", async (req, res) => {
    try {
        const {
            name,
            email,
            department,
            designation,
            basicSalary
        } = req.body;

        const basic = Number(basicSalary);

        const hra = basic * 0.20;
        const da = basic * 0.10;

        const grossSalary =
            basic + hra + da;

        const pf = basic * 0.12;

        const netSalary =
            grossSalary - pf;

        await Employee.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                department,
                designation,
                basicSalary: basic,

                hra,
                da,
                pf,

                grossSalary,
                netSalary
            },
            {
                runValidators: true
            }
        );

        res.redirect("/employees");

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Unable to update employee"
        );
    }
});


// ==========================================
// DELETE EMPLOYEE
// ==========================================

router.post("/delete/:id", async (req, res) => {
    try {
        await Employee.findByIdAndDelete(
            req.params.id
        );

        res.redirect("/employees");

    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Unable to delete employee"
        );
    }
});

module.exports = router;
