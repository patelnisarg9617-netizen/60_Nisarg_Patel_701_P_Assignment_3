require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const {MongoStore} = require("connect-mongo");
const bcrypt = require("bcrypt");

const Admin = require("./models/Admin");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");

const isAuthenticated =
    require("./middleware/auth");

const app = express();


// ==========================================
// MONGODB
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error(
            "MongoDB connection error:",
            error
        );
    });


// ==========================================
// VIEW ENGINE
// ==========================================

app.set("view engine", "ejs");


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use(express.static("public"));


// ==========================================
// SESSION
// ==========================================

app.use(
    session({
        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI
        }),

        cookie: {
            maxAge: 1000 * 60 * 60,

            httpOnly: true,

            secure: false
        }
    })
);


// ==========================================
// ROUTES
// ==========================================

app.use(authRoutes);


// Dashboard
app.get(
    "/dashboard",
    isAuthenticated,
    (req, res) => {

        res.render("dashboard", {
            admin: req.session.admin
        });
    }
);


// Employees
app.use(
    "/employees",
    isAuthenticated,
    employeeRoutes
);


// ==========================================
// CREATE DEFAULT ADMIN
// ==========================================

async function createDefaultAdmin() {

    try {

        const existingAdmin =
            await Admin.findOne({
                email: process.env.ADMIN_EMAIL
            });

        if (!existingAdmin) {

            const hashedPassword =
                await bcrypt.hash(
                    process.env.ADMIN_PASSWORD,
                    12
                );

            await Admin.create({
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword
            });

            console.log(
                "Default admin created"
            );
        }

    } catch (error) {

        console.error(
            "Admin creation error:",
            error
        );
    }
}


// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, async () => {

    console.log(
        `Server running on port ${PORT}`
    );

    await createDefaultAdmin();
});
