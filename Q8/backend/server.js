const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "students.sqlite",
  logging: false
});

const Student = sequelize.define("Student", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Home
app.get("/", (req, res) => {
  res.send("Q8 Student CRUD API is running");
});

// CREATE
app.post("/api/students", async (req, res) => {
  try {
    const { name, email, course, age } = req.body;

    if (!name || !email || !course || age === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = await Student.create({
      name,
      email,
      course,
      age
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [["id", "DESC"]]
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ ONE
app.get("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { name, email, course, age } = req.body;

    await student.update({
      name,
      email,
      course,
      age
    });

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.destroy();

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

sequelize.sync()
  .then(() => {
    console.log("SQLite database connected");
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Database error:", error.message);
  });
