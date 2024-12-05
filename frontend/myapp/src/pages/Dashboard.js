import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import config from '../config';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [soldCarsCount, setSoldCarsCount] = useState(0);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateError, setUpdateError] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) return;
    
    fetch(`${config.apiUrl}/api/notifications/${currentUser.id}`)
      .then(response => response.json())
      .then(data => {
        setNotifications(Array.isArray(data) ? data : []);
      })
      .catch(error => {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      });
  };

  const fetchSoldCarsCount = async (userId) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/users/${userId}/sold-cars-count`);
      if (response.ok) {
        const data = await response.json();
        setSoldCarsCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching sold cars count:', error);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    console.log('Current user data:', parsedUser);
    setUser(parsedUser);

    fetchNotifications();
    fetchSoldCarsCount(parsedUser.id);
  }, [navigate]);

  useEffect(() => {
    // Set up an event listener for car sales
    window.addEventListener('carSold', () => {
      if (user) {
        fetchSoldCarsCount(user.id);
      }
    });

    return () => {
      window.removeEventListener('carSold', () => {
        if (user) {
          fetchSoldCarsCount(user.id);
        }
      });
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNotificationClick = (notification) => {
    // Mark notification as read
    fetch(`${config.apiUrl}/api/notifications/${notification.id}/read`, {
      method: 'PUT'
    });

    // Navigate based on notification type
    if (notification.type === 'message') {
      navigate('/messages');
    } else if (notification.type === 'test_drive') {
      navigate(`/car/${notification.relatedId}`);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/users/${user.id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail || undefined,
          password: newPassword || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = await response.json();
      setUser({ ...user, email: updatedUser.email });
      setShowUpdateModal(false);
      setNewEmail('');
      setNewPassword('');
      setUpdateError('');
    } catch (error) {
      setUpdateError('Failed to update user details');
      console.error('Error updating user:', error);
    }
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
              gridTemplateColumns: 'repeat(1, 1fr)',
              gap: '15px', 
              marginTop: '15px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{soldCarsCount}</div>
                <div>Cars Sold</div>
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
              <button onClick={() => navigate('/profile')}>View Profile</button>
              {user.isAdmin === 1 && (
                <button 
                  onClick={() => navigate('/admin')}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white'
                  }}
                >
                  Admin Settings
                </button>
              )}
              <button 
                onClick={() => setShowUpdateModal(true)}
                style={{
                  backgroundColor: '#4a90e2',
                  color: 'white'
                }}
              >
                Update Account Details
              </button>
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
            <div style={{ marginTop: '15px' }}>
              {notifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {notifications.map(notification => (
                    <li 
                      key={notification.id}
                      style={{ 
                        padding: '10px',
                        background: notification.isRead ? '#f5f5f5' : '#e3f2fd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <div style={{ fontSize: '14px' }}>{notification.message}</div>
                      {notification.notificationType === 'test_drive' && notification.status === 'pending' && (
                        <div style={{ 
                          display: 'flex', 
                          gap: '10px', 
                          marginTop: '10px' 
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetch(`${config.apiUrl}/api/notifications/${notification.id}/respond`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  status: 'accepted',
                                  responderId: user.id
                                })
                              })
                              .then(response => response.json())
                              .then(() => {
                                // Refresh notifications
                                fetchNotifications();
                              })
                              .catch(error => console.error('Error accepting test drive:', error));
                            }}
                            style={{
                              background: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fetch(`${config.apiUrl}/api/notifications/${notification.id}/respond`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  status: 'declined',
                                  responderId: user.id
                                })
                              })
                              .then(response => response.json())
                              .then(() => {
                                // Refresh notifications
                                fetchNotifications();
                              })
                              .catch(error => console.error('Error declining test drive:', error));
                            }}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        marginTop: '5px'
                      }}>
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Update Modal */}
        {showUpdateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '400px'
            }}>
              <h2>Update Account Details</h2>
              {updateError && <p style={{ color: 'red' }}>{updateError}</p>}
              <div style={{ marginBottom: '15px' }}>
                <label>New Email (optional):</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>New Password (optional):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowUpdateModal(false)}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateUser}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#4a90e2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;