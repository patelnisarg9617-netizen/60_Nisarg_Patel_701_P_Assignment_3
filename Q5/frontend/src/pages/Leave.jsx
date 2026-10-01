import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Leave() {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [grant, setGrant] = useState("No");
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadLeaves() {
    try {
      const data = await api("/leave");
      setLeaves(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function addLeave(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api("/leave", {
        method: "POST",
        body: JSON.stringify({ date, reason, grant })
      });

      setDate("");
      setReason("");
      setGrant("No");
      setMessage("Leave application added successfully.");
      loadLeaves();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <Link to="/home">← Back to Home</Link>

        <div className="card">
          <h1>Application for Leave</h1>

          <form onSubmit={addLeave} className="leave-form">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <label>Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for leave"
              required
            />

            <label>Grant</label>
            <select
              value={grant}
              onChange={(e) => setGrant(e.target.value)}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <button className="primary" type="submit">Add Leave</button>
          </form>

          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </div>

        <div className="card">
          <h2>Leave List</h2>

          {leaves.length === 0 ? (
            <p>No leave applications found.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Grant</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.date}</td>
                      <td>{leave.reason}</td>
                      <td>{leave.grant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}