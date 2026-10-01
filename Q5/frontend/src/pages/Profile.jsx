import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Profile() {
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/profile")
      .then(setEmployee)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <div className="container">
        <Link to="/home">← Back to Home</Link>
        <div className="card">
          <h1>Employee Profile</h1>

          {error && <p className="error">{error}</p>}
          {!employee && !error && <p>Loading...</p>}

          {employee && (
            <div className="profile">
              <p><b>Name:</b> {employee.name}</p>
              <p><b>Email:</b> {employee.email}</p>
              <p><b>Department:</b> {employee.department}</p>
              <p><b>Employee ID:</b> {employee._id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}