import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css';

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Car Marketplace</Link>
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        {user ? (
          <>
            <span className="nav-link">Welcome, {user.name}</span>
            <button onClick={logout} className="nav-link">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
        {user && (
          <Link to="/profile" className="nav-link">My Profile</Link>
        )}
      </div>
    </nav>
  );
}

export default NavBar; 