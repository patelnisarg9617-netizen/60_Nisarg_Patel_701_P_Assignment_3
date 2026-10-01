import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="page">
      <div className="container">
        <div className="header">
          <h1>Employee Home Page</h1>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="grid">
          <Link className="menu-card" to="/profile">
            <h2>Page 1</h2>
            <p>Display Employee Profile</p>
          </Link>

          <Link className="menu-card" to="/leave">
            <h2>Page 2</h2>
            <p>Application for Leave</p>
            <small>Add & List Leave Applications</small>
          </Link>
        </div>
      </div>
    </div>
  );
}