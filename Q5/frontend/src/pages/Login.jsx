import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const [email, setEmail] = useState("employee@gmail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await api("/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page center">
      <form className="card login-card" onSubmit={login}>
        <h1>Employee Login</h1>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button className="primary" type="submit">Login</button>

        {/* <div className="demo">
          <b>Demo Login</b>
          <br />
          employee@gmail.com
          <br />
          123456
        </div> */}
      </form>
    </div>
  );
}