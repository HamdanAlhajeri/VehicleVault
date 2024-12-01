import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import config from '../config';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Redirect if not admin
  useEffect(() => {
    if (!currentUser || currentUser.isAdmin !== 1) {
      navigate('/');
      return;
    }
    
    fetchUsers();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const handleToggleAdmin = async (userId, currentIsAdmin) => {
    if (userId === currentUser.id) {
      alert("You cannot modify your own admin status!");
      return;
    }

    try {
      console.log('Sending request to update admin status:', userId, !currentIsAdmin); // Debug log

      const response = await fetch(`${config.apiUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isAdmin: !currentIsAdmin 
        })
      });

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update admin status');
      }

      // Update local state with the response data
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isAdmin: !currentIsAdmin } : user
      ));

      // Show success message
      setError(''); // Clear any existing errors
    } catch (error) {
      console.error('Error toggling admin status:', error);
      setError(error.message || 'Failed to update admin status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own account!");
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all associated data.')) {
      try {
        const response = await fetch(`${config.apiUrl}/api/users/${userId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete user');
        }

        // Remove user from local state
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.message);
      }
    }
  };

  return (
    <div className="page">
      <Navigation />
      <div className="admin-container">
        <h1>User Management</h1>
        
        {error && (
          <div className="error-message" style={{ color: 'red', margin: '10px 0' }}>
            {error}
          </div>
        )}

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span 
                      className={`status-badge ${user.isAdmin ? 'admin' : 'user'}`}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: user.isAdmin ? '#4CAF50' : '#2196F3',
                        color: 'white'
                      }}
                    >
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                        disabled={user.id === currentUser.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: user.isAdmin ? '#ff9800' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: user.id === currentUser.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser.id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: user.id === currentUser.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers; 