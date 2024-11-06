import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import SearchFilters from './SearchFilters';
import './Home.css';

function Home() {
  const [carListings, setCarListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredListings, setFilteredListings] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCarListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [carListings, activeFilters]);

  const fetchCarListings = async () => {
    try {
      const staticListings = [
        {
          id: 1,
          title: "2022 Toyota Camry",
          price: 25000,
          description: "Excellent condition, low mileage sedan",
          specs: {
            mileage: "15000",
            transmission: "Automatic",
            fuelType: "Gasoline",
            color: "Silver"
          },
          seller: {
            id: 1,
            name: "John Doe"
          },
          images: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "2021 Honda CR-V",
          price: 27500,
          description: "Well-maintained SUV with all features",
          specs: {
            mileage: "22000",
            transmission: "Automatic",
            fuelType: "Gasoline",
            color: "Blue"
          },
          seller: {
            id: 2,
            name: "Jane Smith"
          },
          images: [],
          createdAt: new Date().toISOString()
        }
      ];

      setCarListings(staticListings);
      setFilteredListings(staticListings);
      setError(null);
    } catch (error) {
      console.error('Error loading car listings:', error);
      setError('Failed to load car listings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTestListing = async () => {
    try {
      const testListing = {
        id: Date.now(),
        title: "Test Car",
        price: 25000,
        description: "This is a test car listing",
        specs: {
          mileage: "50000",
          transmission: "Automatic",
          fuelType: "Gasoline",
          color: "Blue"
        },
        seller: {
          id: 1,
          name: "Test Seller"
        },
        images: [],
        createdAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/car-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testListing)
      });

      if (!response.ok) {
        throw new Error('Failed to add test listing');
      }

      fetchCarListings(); // Refresh the listings
    } catch (error) {
      console.error('Error adding test listing:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...carListings];

    if (activeFilters.search) {
      const searchTerm = activeFilters.search.toLowerCase();
      filtered = filtered.filter(car => 
        car.title.toLowerCase().includes(searchTerm) ||
        car.description.toLowerCase().includes(searchTerm)
      );
    }

    if (activeFilters.priceRange?.min) {
      filtered = filtered.filter(car => 
        car.price >= Number(activeFilters.priceRange.min)
      );
    }

    if (activeFilters.priceRange?.max) {
      filtered = filtered.filter(car => 
        car.price <= Number(activeFilters.priceRange.max)
      );
    }

    if (activeFilters.make) {
      filtered = filtered.filter(car => 
        car.make === activeFilters.make
      );
    }

    if (activeFilters.model) {
      filtered = filtered.filter(car => 
        car.model.toLowerCase().includes(activeFilters.model.toLowerCase())
      );
    }

    if (activeFilters.fuelType) {
      filtered = filtered.filter(car => 
        car.specs.fuelType === activeFilters.fuelType
      );
    }

    // Add more filter conditions as needed

    setFilteredListings(filtered);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleAddListing = () => {
    if (!user) {
      navigate('/login', { 
        state: { from: '/' },
        replace: true 
      });
      return;
    }
    navigate('/add-listing');
  };

  const handleMessageSeller = async (car) => {
    if (!user) {
      navigate('/login', { state: { from: '/' } });
      return;
    }

    // Don't allow messaging yourself
    if (user.id === car.seller.id) {
      alert("This is your listing");
      return;
    }

    try {
      // Check if conversation already exists
      const response = await fetch(
        `http://localhost:3001/conversations?participants_like=${user.id}&participants_like=${car.seller.id}&carId=${car.id}`
      );
      const existingConversations = await response.json();

      if (existingConversations.length > 0) {
        navigate('/messages', { state: { conversationId: existingConversations[0].id } });
      } else {
        // Start new conversation
        const newConversation = {
          participants: [user.id, car.seller.id],
          carId: car.id,
          carTitle: car.title,
          lastMessage: null,
          createdAt: new Date().toISOString()
        };

        const createResponse = await fetch('http://localhost:3001/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newConversation)
        });

        if (createResponse.ok) {
          navigate('/messages');
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (isLoading) {
    return <div className="loading-message">Loading car listings...</div>;
  }

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <aside className="filters-sidebar">
          <SearchFilters onFilterChange={handleFilterChange} />
        </aside>
        
        <main className="main-content">
          <div className="header-section">
            <h1>Welcome to Car Marketplace</h1>
            <p>Find your perfect car or list your vehicle for sale</p>
            <button 
              className="add-listing-btn"
              onClick={handleAddListing}
            >
              {!user ? 'Login to Add Listing' : '+ Add New Car Listing'}
            </button>
          </div>
          
          <div className="car-listings">
            <h2>Available Cars ({filteredListings.length})</h2>
            {filteredListings.length === 0 ? (
              <p>No cars match your search criteria.</p>
            ) : (
              <div className="listings-grid">
                {filteredListings.map(car => (
                  <div key={car.id} className="car-card">
                    <div className="car-image-container">
                      {car.images && car.images.length > 0 ? (
                        <img 
                          src={car.images[0]} 
                          alt={car.title}
                          className="car-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-car.png'; // Add a default image to your public folder
                          }}
                        />
                      ) : (
                        <div className="no-image">
                          <span>No Image Available</span>
                        </div>
                      )}
                    </div>
                    <div className="car-details">
                      <h3>{car.title}</h3>
                      <p className="price">${car.price?.toLocaleString()}</p>
                      <div className="specs">
                        {car.specs && (
                          <>
                            <p>Mileage: {car.specs.mileage}</p>
                            <p>Transmission: {car.specs.transmission}</p>
                            <p>Fuel Type: {car.specs.fuelType}</p>
                            <p>Color: {car.specs.color}</p>
                          </>
                        )}
                      </div>
                      <p className="description">{car.description}</p>
                      <div className="card-actions">
                        {user && user.id !== car.seller.id && (
                          <button 
                            onClick={() => handleMessageSeller(car)}
                            className="message-button"
                          >
                            Message Seller
                          </button>
                        )}
                        <p className="seller-info">Posted by: {car.seller?.name || 'Anonymous'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
