import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import config from '../config';

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${config.apiUrl}/api/cars/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Car not found');
        }
        return response.json();
      })
      .then(data => {
        setCar(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navigation />
        <div className="container">
          <p className="error">{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="car-details-container">
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
        
        <div className="car-details">
          <div className="car-images">
            <img 
              src={`${config.apiUrl}/api/cars/${id}/image`}
              alt={`${car.make} ${car.model}`}
              className="main-image"
            />
          </div>

          <div className="car-info">
            <h1>{car.make} {car.model}</h1>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Year:</span>
                <span className="value">{car.year}</span>
              </div>
              <div className="info-item">
                <span className="label">Price:</span>
                <span className="value">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                  }).format(car.price)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Type:</span>
                <span className="value">{car.isEV ? 'Electric Vehicle' : 'Gasoline'}</span>
              </div>
              {car.mileage && (
                <div className="info-item">
                  <span className="label">Mileage:</span>
                  <span className="value">{car.mileage.toLocaleString()} miles</span>
                </div>
              )}
              {car.color && (
                <div className="info-item">
                  <span className="label">Color:</span>
                  <span className="value">{car.color}</span>
                </div>
              )}
            </div>

            {car.description && (
              <div className="description">
                <h2>Description</h2>
                <p>{car.description}</p>
              </div>
            )}

            <div className="contact-section">
              <h2>Interested in this vehicle?</h2>
              <button className="contact-button">
                Contact Dealer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetails; 