import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import config from '../config';
import { Range } from 'react-range';

function Home() {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    priceRange: {
      min: 0,
      max: 200000,
      current: [0, 200000]
    },
    make: '',
    year: '',
    model: '',
    isEV: false
  });

  useEffect(() => {
    fetch(`${config.apiUrl}/api/cars`)
      .then(response => response.json())
      .then(data => {
        console.log('Fetched cars:', data);
        setCars(data);
      })
      .catch(error => console.error('Error:', error));
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.year.toString().includes(searchTerm);
    
    const matchesPrice = 
      car.price >= filters.priceRange.current[0] &&
      car.price <= filters.priceRange.current[1];
    
    const matchesMake = !filters.make || car.make.toLowerCase() === filters.make.toLowerCase();
    const matchesModel = !filters.model || car.model.toLowerCase().includes(filters.model.toLowerCase());
    const matchesYear = !filters.year || car.year.toString() === filters.year;
    const matchesEV = !filters.isEV || car.isEV === filters.isEV;

    return matchesSearch && matchesPrice && matchesMake && matchesModel && matchesYear && matchesEV;
  });

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePriceRangeChange = (e) => {
    const [min, max] = e.target.value.split(',').map(Number);
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        current: [min, max]
      }
    }));
  };

  return (
    <div>
      <Navigation />
      <div className="page-with-sidebar">
        <div className="filters-container">
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range-container">
              <label>Price Range:</label>
              <div className="price-display">
                <span>{formatPrice(filters.priceRange.current[0])}</span>
                <span>{formatPrice(filters.priceRange.current[1])}</span>
              </div>
              <Range
                step={1000}
                min={filters.priceRange.min}
                max={filters.priceRange.max}
                values={filters.priceRange.current}
                onChange={(values) => 
                  setFilters(prev => ({
                    ...prev,
                    priceRange: {
                      ...prev.priceRange,
                      current: values
                    }
                  }))
                }
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '4px',
                      width: '100%',
                      backgroundColor: '#ddd'
                    }}
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '16px',
                      width: '16px',
                      backgroundColor: '#007bff',
                      borderRadius: '50%'
                    }}
                  />
                )}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Make</h3>
            <input
              type="text"
              name="make"
              placeholder="Enter make"
              value={filters.make}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-section">
            <h3>Model</h3>
            <input
              type="text"
              name="model"
              placeholder="Enter model"
              value={filters.model}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-section">
            <h3>Year</h3>
            <input
              type="number"
              name="year"
              placeholder="Enter year"
              value={filters.year}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <div className="filter-section">
            <label className="ev-filter">
              <input
                type="checkbox"
                name="isEV"
                checked={filters.isEV}
                onChange={handleFilterChange}
              />
              Electric Vehicles Only
            </label>
          </div>
        </div>

        <div className="main-content">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search cars..."
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
                    src={`${config.apiUrl}/api/cars/${car.id}/image`}
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
      </div>
    </div>
  );
}

export default Home;