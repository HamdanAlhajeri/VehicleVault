import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import config from '../config';

function AddCar() {
  const navigate = useNavigate();
  const [carData, setCarData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    description: '',
    color: '',
    isEV: false,
    range: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      setPreviewUrl(URL.createObjectURL(file));
      
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          data: reader.result.split(',')[1], // Get base64 data
          type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`${config.apiUrl}/api/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...carData,
          userId: userData.id,
          image: image.data,
          imageType: image.type
        }),
      });

      if (response.ok) {
        alert('Car listing added successfully!');
        navigate('/');
      } else {
        throw new Error('Failed to add car listing');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add car listing. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="page">
      <Navigation />
      <div className="add-car-container">
        <h2>Add New Car Listing</h2>
        <form onSubmit={handleSubmit} className="add-car-form">
          <div className="form-group">
            <label htmlFor="make">Make:</label>
            <input
              type="text"
              id="make"
              name="make"
              value={carData.make}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">Model:</label>
            <input
              type="text"
              id="model"
              name="model"
              value={carData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Year:</label>
            <input
              type="number"
              id="year"
              name="year"
              value={carData.year}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price:</label>
            <input
              type="number"
              id="price"
              name="price"
              value={carData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={carData.color}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group ev-group">
            <label htmlFor="isEV">Electric Vehicle:</label>
            <input
              type="checkbox"
              id="isEV"
              name="isEV"
              checked={carData.isEV}
              onChange={(e) => {
                setCarData(prev => ({
                  ...prev,
                  isEV: e.target.checked
                }));
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="range">Range (KM):</label>
            <input
              type="number"
              id="range"
              name="range"
              value={carData.range}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Car Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={carData.description}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Add Car Listing</button>
        </form>
      </div>
    </div>
  );
}

export default AddCar; 