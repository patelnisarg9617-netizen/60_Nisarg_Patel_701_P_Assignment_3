const express = require("express");
const session = require("express-session");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");
const path = require("path");

const auth = require("./middleware/auth");

const app = express();

// Read JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create Redis client
const redisClient = createClient({
    url: "redis://localhost:6379"
});

// Redis error handling
redisClient.on("error", (err) => {
    console.log("Redis Error:", err);
});

// Connect to Redis
redisClient.connect()
    .then(() => {
        console.log("Connected to Redis");
    })
    .catch((err) => {
        console.log("Redis connection failed:", err);
    });

// Session configuration
app.use(
    session({
        store: new RedisStore({
            client: redisClient,
            prefix: "myapp:"
        }),

        secret: "mysecret123",

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge: 1000 * 60 * 60
        }
    })
);


 

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});


 

app.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Simple username and password
    if (username === "admin" && password === "12345") {

        // Store user information in session
        req.session.user = {
            username: username
        };

        res.send(`
            <h1>Login Successful</h1>
            <p>Welcome ${username}</p>

            <a href="/profile">Profile</a>
            <br><br>

            <a href="/dashboard">Dashboard</a>
            <br><br>

            <a href="/logout">Logout</a>
        `);

    } else {

        res.send(`
            <h1>Login Failed</h1>
            <p>Invalid username or password</p>

            <a href="/">Try Again</a>
        `);
    }
});

 

app.get("/profile", auth, (req, res) => {

    res.send(`
        <h1>Profile Page</h1>

        <p>This is a protected route.</p>

        <p>Welcome ${req.session.user.username}</p>

        <br>

        <a href="/dashboard">Dashboard</a>
        <br><br>

        <a href="/logout">Logout</a>
    `);
});


 

app.get("/dashboard", auth, (req, res) => {

    res.send(`
        <h1>Dashboard</h1>

        <p>This is the second protected route.</p>

        <p>Logged in user: ${req.session.user.username}</p>

        <br>

        <a href="/profile">Profile</a>
        <br><br>

        <a href="/logout">Logout</a>
    `);
});

 

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Logout failed");
        }

        res.send(`
            <h1>Logout Successful</h1>

            <p>You have been logged out.</p>

            <a href="/">Login Again</a>
        `);
    });
});


 

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});