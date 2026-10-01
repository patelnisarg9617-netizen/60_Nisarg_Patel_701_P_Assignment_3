const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;
const JWT_SECRET = "employee_secret";

mongoose.connect("mongodb://127.0.0.1:27017/employeeDB")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  department: String
});

const Employee = mongoose.model("Employee", employeeSchema);

const leaveSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  date: String,
  reason: String,
  grant: String
});

const Leave = mongoose.model("Leave", leaveSchema);

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ")
    ? header.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.employeeId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Create demo employee if database is empty
async function createDemoEmployee() {
  const count = await Employee.countDocuments();
  if (count === 0) {
    await Employee.create({
      name: "Demo Employee",
      email: "employee@gmail.com",
      password: "123456",
      department: "IT"
    });
    console.log("Demo employee created:");
    console.log("Email: employee@gmail.com");
    console.log("Password: 123456");
  }
}

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email, password });

    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: employee._id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/profile", authenticate, async (req, res) => {
  try {
    const employee = await Employee.findById(req.employeeId).select("-password");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/leave", authenticate, async (req, res) => {
  try {
    const { date, reason, grant } = req.body;

    if (!date || !reason || !grant) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leave = await Leave.create({
      employeeId: req.employeeId,
      date,
      reason,
      grant
    });

    res.status(201).json({
      message: "Leave application added",
      leave
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/leave", authenticate, async (req, res) => {
  try {
    const leaves = await Leave.find({
      employeeId: req.employeeId
    }).sort({ _id: -1 });

    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Employee API is running");
});

mongoose.connection.once("open", async () => {
  await createDemoEmployee();

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
});