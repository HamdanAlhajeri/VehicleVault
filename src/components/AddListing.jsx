import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddListing.css';

function AddListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    specs: {
      mileage: '',
      transmission: '',
      fuelType: '',
      color: ''
    }
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  if (!user) {
    return navigate('/login', { state: { from: '/add-listing' } });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('specs.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let imageData = null;
      if (imageFile) {
        imageData = await convertToBase64(imageFile);
      }

      const newCar = {
        id: Date.now(),
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        specs: formData.specs,
        seller: {
          id: user.id,
          name: user.name
        },
        images: imageData ? [imageData] : [],
        createdAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/car-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCar)
      });

      if (!response.ok) {
        throw new Error('Failed to add listing');
      }

      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to add listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="add-listing-container">
      <h2>Add New Car Listing</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="add-listing-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., 2020 Toyota Camry"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="Enter price"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe your car"
          />
        </div>

        <div className="specs-section">
          <h3>Car Specifications</h3>
          
          <div className="form-group">
            <label htmlFor="mileage">Mileage</label>
            <input
              type="text"
              id="mileage"
              name="specs.mileage"
              value={formData.specs.mileage}
              onChange={handleChange}
              placeholder="e.g., 50,000 miles"
            />
          </div>

          <div className="form-group">
            <label htmlFor="transmission">Transmission</label>
            <input
              type="text"
              id="transmission"
              name="specs.transmission"
              value={formData.specs.transmission}
              onChange={handleChange}
              placeholder="e.g., Automatic"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fuelType">Fuel Type</label>
            <input
              type="text"
              id="fuelType"
              name="specs.fuelType"
              value={formData.specs.fuelType}
              onChange={handleChange}
              placeholder="e.g., Gasoline"
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Color</label>
            <input
              type="text"
              id="color"
              name="specs.color"
              value={formData.specs.color}
              onChange={handleChange}
              placeholder="e.g., Silver"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image">Car Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Adding...' : 'Add Listing'}
        </button>
      </form>
    </div>
  );
}

export default AddListing;