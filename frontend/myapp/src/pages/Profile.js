import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import config from '../config';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userCars, setUserCars] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setEditedUser(parsedUser);

    // Fetch user's cars
    fetch(`${config.apiUrl}/api/cars/user/${parsedUser.id}`)
      .then(response => response.json())
      .then(data => setUserCars(data))
      .catch(error => console.error('Error fetching user cars:', error));
  }, [navigate]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiUrl}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleEditCar = (car) => {
    setEditingCar({
      ...car,
      price: car.price.toString()
    });
    setShowEditCarModal(true);
  };

  const handleEditCarSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.apiUrl}/api/cars/${editingCar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingCar,
          price: parseFloat(editingCar.price),
          year: parseInt(editingCar.year),
          isEV: Boolean(editingCar.isEV),
        }),
      });

      if (response.ok) {
        const updatedCar = await response.json();
        setUserCars(userCars.map(car => 
          car.id === updatedCar.id ? updatedCar : car
        ));
        setShowEditCarModal(false);
      }
    } catch (error) {
      console.error('Error updating car:', error);
      alert('Failed to update car. Please try again.');
    }
  };

  const handleMarkAsSold = async (car) => {
    if (window.confirm('Are you sure you want to mark this car as sold?')) {
      try {
        const response = await fetch(`${config.apiUrl}/api/cars/${car.id}/sold`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            isSold: true
          })
        });

        if (response.ok) {
          // Remove the car from the userCars list
          setUserCars(userCars.filter(c => c.id !== car.id));
          // Dispatch event to update dashboard
          window.dispatchEvent(new Event('carSold'));
        }
      } catch (error) {
        console.error('Error marking car as sold:', error);
        alert('Failed to mark car as sold. Please try again.');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      <Navigation />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Profile</h1>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="profile-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editedUser.name}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                value={editedUser.phone || ''}
                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={editedUser.location || ''}
                onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
              />
            </div>

            <div className="button-group">
              <button type="submit" className="save-button">Save Changes</button>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setEditedUser(user);
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <label>Name:</label>
              <p>{user.name}</p>
            </div>
            <div className="info-group">
              <label>Email:</label>
              <p>{user.email}</p>
            </div>
            {user.phone && (
              <div className="info-group">
                <label>Phone:</label>
                <p>{user.phone}</p>
              </div>
            )}
            {user.location && (
              <div className="info-group">
                <label>Location:</label>
                <p>{user.location}</p>
              </div>
            )}
          </div>
        )}

        <div className="user-cars-section">
          <h2>Your Cars</h2>
          <div className="user-cars-grid">
            {userCars.map(car => (
              <div key={car.id} className="car-card">
                <img 
                  src={`${config.apiUrl}/api/cars/${car.id}/image`}
                  alt={`${car.make} ${car.model}`}
                />
                <div className="car-info">
                  <h3>{car.make} {car.model}</h3>
                  <p>${car.price.toLocaleString()}</p>
                  <div className="action-buttons">
                    <button 
                      onClick={() => navigate(`/car/${car.id}`)}
                      className="view-button"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleEditCar(car)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleMarkAsSold(car)}
                      className="sold-button"
                    >
                      Mark as Sold
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEditCarModal && editingCar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Car Listing</h2>
            <form onSubmit={handleEditCarSubmit} className="add-car-form">
              <div className="form-group">
                <label htmlFor="make">Make:</label>
                <input
                  type="text"
                  id="make"
                  value={editingCar.make}
                  onChange={(e) => setEditingCar({...editingCar, make: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Model:</label>
                <input
                  type="text"
                  id="model"
                  value={editingCar.model}
                  onChange={(e) => setEditingCar({...editingCar, model: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year:</label>
                <input
                  type="number"
                  id="year"
                  value={editingCar.year}
                  onChange={(e) => setEditingCar({...editingCar, year: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price:</label>
                <input
                  type="number"
                  id="price"
                  value={editingCar.price}
                  onChange={(e) => setEditingCar({...editingCar, price: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Color:</label>
                <input
                  type="text"
                  id="color"
                  value={editingCar.color || ''}
                  onChange={(e) => setEditingCar({...editingCar, color: e.target.value})}
                  required
                />
              </div>

              <div className="form-group ev-group">
                <label htmlFor="isEV">Electric Vehicle:</label>
                <input
                  type="checkbox"
                  id="isEV"
                  checked={editingCar.isEV}
                  onChange={(e) => setEditingCar({...editingCar, isEV: e.target.checked})}
                />
              </div>

              {editingCar.isEV && (
                <div className="form-group">
                  <label htmlFor="range">Range (KM):</label>
                  <input
                    type="number"
                    id="range"
                    value={editingCar.range || ''}
                    onChange={(e) => setEditingCar({...editingCar, range: e.target.value})}
                    min="0"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  value={editingCar.description || ''}
                  onChange={(e) => setEditingCar({...editingCar, description: e.target.value})}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">Save Changes</button>
                <button 
                  type="button" 
                  onClick={() => setShowEditCarModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile; 