import React, { useState } from 'react';
import './SearchFilters.css';

function SearchFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    search: '',
    priceRange: {
      min: '',
      max: ''
    },
    make: '',
    model: '',
    fuelType: '',
    transmission: '',
    year: {
      min: '',
      max: ''
    },
    evSpecific: {
      isEV: false,
      batteryRange: {
        min: '',
        max: ''
      },
      chargingType: ''
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Handle nested objects
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        newFilters[parent] = {
          ...newFilters[parent],
          [child]: value
        };
      } else if (type === 'checkbox') {
        newFilters.evSpecific.isEV = checked;
      } else {
        newFilters[name] = value;
      }
      
      return newFilters;
    });

    // Notify parent component of filter changes
    onFilterChange(filters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      priceRange: { min: '', max: '' },
      make: '',
      model: '',
      fuelType: '',
      transmission: '',
      year: { min: '', max: '' },
      evSpecific: {
        isEV: false,
        batteryRange: { min: '', max: '' },
        chargingType: ''
      }
    });
    onFilterChange({});
  };

  return (
    <div className="search-filters">
      <div className="search-bar">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleChange}
          placeholder="Search by make, model, or keywords..."
          className="search-input"
        />
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        
        <div className="filter-group">
          <label>Price Range</label>
          <div className="range-inputs">
            <input
              type="number"
              name="priceRange.min"
              value={filters.priceRange.min}
              onChange={handleChange}
              placeholder="Min"
            />
            <span>to</span>
            <input
              type="number"
              name="priceRange.max"
              value={filters.priceRange.max}
              onChange={handleChange}
              placeholder="Max"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Make</label>
          <select name="make" value={filters.make} onChange={handleChange}>
            <option value="">All Makes</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Tesla">Tesla</option>
            {/* Add more makes */}
          </select>
        </div>

        <div className="filter-group">
          <label>Model</label>
          <input
            type="text"
            name="model"
            value={filters.model}
            onChange={handleChange}
            placeholder="Enter model"
          />
        </div>

        <div className="filter-group">
          <label>Fuel Type</label>
          <select name="fuelType" value={filters.fuelType} onChange={handleChange}>
            <option value="">All Types</option>
            <option value="Gasoline">Gasoline</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Year Range</label>
          <div className="range-inputs">
            <input
              type="number"
              name="year.min"
              value={filters.year.min}
              onChange={handleChange}
              placeholder="From"
            />
            <span>to</span>
            <input
              type="number"
              name="year.max"
              value={filters.year.max}
              onChange={handleChange}
              placeholder="To"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              name="evSpecific.isEV"
              checked={filters.evSpecific.isEV}
              onChange={handleChange}
            />
            Electric Vehicle
          </label>
        </div>

        {filters.evSpecific.isEV && (
          <>
            <div className="filter-group">
              <label>Battery Range (miles)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  name="evSpecific.batteryRange.min"
                  value={filters.evSpecific.batteryRange.min}
                  onChange={handleChange}
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  name="evSpecific.batteryRange.max"
                  value={filters.evSpecific.batteryRange.max}
                  onChange={handleChange}
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Charging Type</label>
              <select
                name="evSpecific.chargingType"
                value={filters.evSpecific.chargingType}
                onChange={handleChange}
              >
                <option value="">All Types</option>
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="DC Fast Charging">DC Fast Charging</option>
              </select>
            </div>
          </>
        )}

        <button onClick={clearFilters} className="clear-filters">
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

export default SearchFilters; 