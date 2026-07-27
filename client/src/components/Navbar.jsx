import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          Recipe Swap Hub
        </Link>

        <nav className="navbar-links">
          <NavLink to="/recipes" className="navbar-link">
            Browse
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/favorites" className="navbar-link">
                Favorites
              </NavLink>
              <NavLink to="/recipes/new" className="navbar-link">
                Post a Recipe
              </NavLink>
              <NavLink to="/profile" className="navbar-link">
                {user?.name?.split(" ")[0] || "Profile"}
              </NavLink>
              <NavLink to="/settings" className="navbar-link">
                Settings
              </NavLink>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar-link">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
