const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const {
    body,
    validationResult
} = require("express-validator");

const app = express();

const PORT = 3000;

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------

app.use(express.urlencoded({ extended: true }));

// Serve uploaded files/images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// EJS configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ----------------------------------------------------
// Create upload folders if they don't exist
// ----------------------------------------------------

const profileDir = path.join(__dirname, "uploads", "profile");
const othersDir = path.join(__dirname, "uploads", "others");

if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}

if (!fs.existsSync(othersDir)) {
    fs.mkdirSync(othersDir, { recursive: true });
}


// ----------------------------------------------------
// Multer configuration
// ----------------------------------------------------

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "profilePic") {
            cb(null, profileDir);
        }
        else if (file.fieldname === "otherPics") {
            cb(null, othersDir);
        }
        else {
            cb(new Error("Invalid file field"));
        }
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});


// ----------------------------------------------------
// File filter
// ----------------------------------------------------

const fileFilter = function (req, file, cb) {

    const allowedTypes = /jpeg|jpg|png|gif/;

    const extension =
        allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );

    const mimeType =
        allowedTypes.test(file.mimetype);

    if (extension && mimeType) {
        cb(null, true);
    }
    else {
        cb(new Error(
            "Only JPG, JPEG, PNG and GIF files are allowed."
        ));
    }
};


// ----------------------------------------------------
// Multer upload configuration
// ----------------------------------------------------

const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024
    }
});


// ----------------------------------------------------
// GET registration form
// ----------------------------------------------------

app.get("/", (req, res) => {

    res.render("form", {
        errors: [],
        old: {},
        uploadError: null
    });

});


// ----------------------------------------------------
// POST registration form
// ----------------------------------------------------

app.post(
    "/register",

    upload.fields([
        {
            name: "profilePic",
            maxCount: 1
        },
        {
            name: "otherPics",
            maxCount: 5
        }
    ]),

    [

        // Username validation
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required.")
            .isLength({ min: 3, max: 20 })
            .withMessage("Username must be between 3 and 20 characters.")
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage(
                "Username can contain only letters, numbers and underscore."
            ),

        // Password validation
        body("password")
            .notEmpty()
            .withMessage("Password is required.")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long."),

        // Confirm password
        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm password is required.")
            .custom((value, { req }) => {

                if (value !== req.body.password) {
                    throw new Error("Passwords do not match.");
                }

                return true;
            }),

        // Email
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required.")
            .isEmail()
            .withMessage("Enter a valid email address."),

        // Gender
        body("gender")
            .notEmpty()
            .withMessage("Please select your gender.")
            .isIn(["Male", "Female", "Other"])
            .withMessage("Invalid gender selected."),

        // Hobbies
        body("hobbies")
            .custom((value) => {

                if (!value) {
                    throw new Error("Select at least one hobby.");
                }

                return true;
            })

    ],

    (req, res) => {

        // ------------------------------------------------
        // Validation errors
        // ------------------------------------------------

        const errors = validationResult(req);

        // ------------------------------------------------
        // Validate uploaded files
        // ------------------------------------------------

        let uploadError = null;

        if (!req.files || !req.files.profilePic) {

            uploadError = "Profile picture is required.";

        }


        // ------------------------------------------------
        // If validation fails
        // ------------------------------------------------

        if (!errors.isEmpty() || uploadError) {

            res.render("form", {

                errors: errors.array(),

                old: req.body,

                uploadError: uploadError

            });

            return;
        }


        // ------------------------------------------------
        // Get uploaded files
        // ------------------------------------------------

        const profilePic =
            req.files.profilePic
                ? req.files.profilePic[0]
                : null;

        const otherPics =
            req.files.otherPics
                ? req.files.otherPics
                : [];


        // ------------------------------------------------
        // Prepare registration data
        // ------------------------------------------------

        const userData = {

            username: req.body.username,

            email: req.body.email,

            gender: req.body.gender,

            hobbies: Array.isArray(req.body.hobbies)
                ? req.body.hobbies
                : [req.body.hobbies],

            profilePic: profilePic,

            otherPics: otherPics

        };


        // ------------------------------------------------
        // Display result
        // ------------------------------------------------

        res.render("result", {
            user: userData
        });

    }
);


// ----------------------------------------------------
// Download profile picture
// ----------------------------------------------------

app.get("/download/profile/:filename", (req, res) => {

    const filePath = path.join(
        profileDir,
        req.params.filename
    );

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found.");
    }

    res.download(filePath);

});


// ----------------------------------------------------
// Download other picture
// ----------------------------------------------------

app.get("/download/other/:filename", (req, res) => {

    const filePath = path.join(
        othersDir,
        req.params.filename
    );

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found.");
    }

    res.download(filePath);

});


// ----------------------------------------------------
// General error handler
// ----------------------------------------------------

app.use((err, req, res, next) => {

    console.error(err);

    if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {

            return res.render("form", {

                errors: [],

                old: req.body || {},

                uploadError:
                    "Each image must be less than 2 MB."

            });
        }

        return res.render("form", {

            errors: [],

            old: req.body || {},

            uploadError: err.message

        });
    }

    if (err) {

        return res.render("form", {

            errors: [],

            old: req.body || {},

            uploadError: err.message

        });

    }

    next(err);

});



app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
