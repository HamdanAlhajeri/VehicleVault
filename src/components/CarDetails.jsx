import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CarDetails.css';

function CarDetails() {
  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCar();
    }
  }, [user]);

  const fetchCar = async () => {
    try {
      const response = await fetch(`http://localhost:3001/car-listings/${user.id}`);
      const data = await response.json();
      setCar(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching car:', error);
      setLoading(false);
    }
  };

  const handleMessageSeller = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/car/${car.id}` } });
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

  if (loading) {
    return <div className="car-details-loading">Loading car details...</div>;
  }

  return (
    <div className="car-details-container">
      {car ? (
        <>
          <div className="car-details-header">
            <h1>{car.title}</h1>
            <button onClick={handleMessageSeller}>Message Seller</button>
          </div>

          <div className="car-details-content">
            {/* Add your car details components here */}
          </div>
        </>
      ) : (
        <div className="no-car-details">No car details available</div>
      )}
    </div>
  );
}

export default CarDetails; 