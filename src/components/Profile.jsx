import React from "react";
import { useNavigate } from "react-router-dom";

function Profile({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null); // Clear user
    navigate("/"); // Redirect to login
  };

  return (
    <div>
      <h2>Welcome, {user.username}!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Profile;
