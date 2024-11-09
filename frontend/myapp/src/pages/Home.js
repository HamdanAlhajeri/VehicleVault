import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

function Home() {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/cars')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched cars:', data);
        setCars(data);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const filteredCars = cars.filter(car => 
    car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.year.toString().includes(searchTerm)
  );

  return (
    <div className="page">
      <Navigation />
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by make, model, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="cars-grid">
        {filteredCars.length === 0 ? (
          <p>No cars found.</p>
        ) : (
          filteredCars.map(car => (
            <div key={car.id} className="car-card">
              <img 
                src={`http://localhost:5000/api/cars/${car.id}/image`}
                alt={`${car.make} ${car.model}`} 
              />
              <h3>{car.make} {car.model}</h3>
              <p>Year: {car.year}</p>
              <p>Price: ${car.price}</p>
              <button onClick={() => window.location.href = `/car/${car.id}`}>
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;