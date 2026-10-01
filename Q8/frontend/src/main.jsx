import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "http://localhost:5000/api/students";

function App() {
  const emptyForm = {
    name: "",
    email: "",
    course: "",
    age: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStudents() {
    try {
      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load students");
      }

      setStudents(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const url = editId ? `${API}/${editId}` : API;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage(editId ? "Student updated successfully" : "Student added successfully");
      setForm(emptyForm);
      setEditId(null);
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  }

  function editStudent(student) {
    setEditId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
      age: student.age
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteStudent(id) {
    if (!window.confirm("Delete this student?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("Student deleted successfully");
      loadStudents();
    } catch (err) {
      setError(err.message);
    }
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  return (
    <div className="container">
      <h1>Student CRUD</h1>
      <p>Express + Sequelize + React</p>

      <div className="box">
        <h2>{editId ? "Edit Student" : "Add Student"}</h2>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Course</label>
          <input
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          />

          <label>Age</label>
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            required
          />

          <button type="submit">
            {editId ? "Update Student" : "Add Student"}
          </button>

          {editId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>

      <div className="box">
        <h2>Student List</h2>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Age</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.age}</td>
                  <td>
                    <button onClick={() => editStudent(student)}>
                      Edit
                    </button>
                    <button onClick={() => deleteStudent(student.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {students.length === 0 && <p>No students found.</p>}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
