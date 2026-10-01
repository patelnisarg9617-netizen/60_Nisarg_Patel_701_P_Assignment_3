const express = require("express");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");

const router = express.Router();

// Login page
router.get("/login", (req, res) => {
    res.render("login", {
        error: null
    });
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({
            email: email.toLowerCase()
        });

        if (!admin) {
            return res.render("login", {
                error: "Invalid email or password"
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            admin.password
        );

        if (!validPassword) {
            return res.render("login", {
                error: "Invalid email or password"
            });
        }

        req.session.admin = {
            id: admin._id,
            email: admin.email
        };

        res.redirect("/dashboard");

    } catch (error) {
        console.error(error);

        res.render("login", {
            error: "Login failed"
        });
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Unable to logout");
        }

        res.clearCookie("connect.sid");

        res.redirect("/login");
    });
});

module.exports = router;
