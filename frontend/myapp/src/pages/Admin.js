import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || user.isAdmin !== 1) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="page">
      <Navigation />
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        
        <div className="admin-buttons">
          <button 
            onClick={() => navigate('/admin/cars')}
            className="admin-button"
          >
            Car Listings
          </button>
          
          <button 
            onClick={() => navigate('/admin/users')}
            className="admin-button"
          >
            Users
          </button>
        </div>
      </div>
    </div>
  );
}

export default Admin; 