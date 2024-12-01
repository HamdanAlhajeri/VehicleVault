import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import config from '../config';

function AdminCars() {
  const [cars, setCars] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.isAdmin !== 1) {
      navigate('/');
      return;
    }
    
    // Fetch cars
    fetch(`${config.apiUrl}/api/cars`)
      .then(response => response.json())
      .then(data => setCars(data))
      .catch(error => console.error('Error fetching cars:', error));
  }, [user, navigate]);

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        const response = await fetch(`${config.apiUrl}/api/cars/${carId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCars(cars.filter(car => car.id !== carId));
        }
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
  };

  const handleEdit = (car) => {
    setEditingCar({
      ...car,
      price: car.price.toString()
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
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
        setCars(cars.map(car => 
          car.id === updatedCar.id ? updatedCar : car
        ));
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating car:', error);
    }
  };

  return (
    <div className="page">
      <Navigation />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Car Listings Management</h1>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car.id}>
                  <td>{car.id}</td>
                  <td>
                    <img 
                      src={`${config.apiUrl}/api/cars/${car.id}/image`}
                      alt={`${car.make} ${car.model}`}
                      style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                    />
                  </td>
                  <td>{car.make}</td>
                  <td>{car.model}</td>
                  <td>{car.year}</td>
                  <td>${car.price.toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(car)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(car.id)}
                        className="delete-button"
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

        {showEditModal && editingCar && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Car Listing</h2>
              <form onSubmit={handleEditSubmit} className="add-car-form">
                <div className="form-group">
                  <label htmlFor="make">Make:</label>
                  <input
                    type="text"
                    id="make"
                    name="make"
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
                    name="model"
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
                    name="year"
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
                    name="price"
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
                    name="color"
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
                    name="isEV"
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
                      name="range"
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
                    name="description"
                    value={editingCar.description || ''}
                    onChange={(e) => setEditingCar({...editingCar, description: e.target.value})}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-button">Save Changes</button>
                  <button 
                    type="button" 
                    onClick={() => setShowEditModal(false)}
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
    </div>
  );
}

export default AdminCars; 