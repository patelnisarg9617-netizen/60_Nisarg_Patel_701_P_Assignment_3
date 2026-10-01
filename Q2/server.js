const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");

const app = express();

const PORT = 3000;




app.use(express.urlencoded({ extended: true }));





app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);





app.use(
    session({

        store: new FileStore({
            path: "./sessions"
        }),

        secret: "my-secret-key",

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 30
        }

    })
);





app.get("/", (req, res) => {

    res.render("login", {
        error: null
    });

});





app.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;


    // Demo username/password

    if (
        username === "admin" &&
        password === "12345"
    ) {

        // Create session

        req.session.user = {
            username: username
        };

        return res.redirect("/home");

    }


    // Invalid login

    res.render("login", {
        error: "Invalid username or password"
    });

});

 

function checkLogin(req, res, next) {

    if (req.session.user) {

        next();

    }
    else {

        res.redirect("/");

    }

}


 

app.get(
    "/home",
    checkLogin,
    (req, res) => {

        res.render("home", {
            username: req.session.user.username
        });

    }
);

 

app.get(
    "/profile",
    checkLogin,
    (req, res) => {

        res.render("profile", {
            username: req.session.user.username
        });

    }
);


 

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.send(
                "Unable to logout"
            );

        }

        res.redirect("/");

    });

});


 
app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
