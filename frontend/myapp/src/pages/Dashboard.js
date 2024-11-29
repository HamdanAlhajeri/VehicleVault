import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="page">
      <Navigation />
      
      <div className="dashboard-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Welcome, {user.name}!</h1>
          <button onClick={handleLogout}>Logout</button>
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          padding: '20px 0'
        }}>
          {/* Stats Card */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <h3>Statistics</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px', 
              marginTop: '15px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>0</div>
                <div>Cars Sold</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>0</div>
                <div>Cars Bought</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <h3>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => navigate('/add-car')}>Add Car</button>
              <button onClick={() => navigate('/messages')}>Messages</button>
              <button>View Profile</button>
              <button>Settings</button>
            </div>
          </div>

          {/* Notifications Card */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <h3>Notifications</h3>
            <ul>
              <li>No new notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;