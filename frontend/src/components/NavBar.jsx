import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("vibe254_token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Vibe254</Link>
      <div className="nav-links">
        <Link to="/">Discover</Link>
        <Link to="/matches">Matches</Link>
        <Link to="/subscription">Premium</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
