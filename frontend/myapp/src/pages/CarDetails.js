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
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date 30 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Updated time slots with more realistic dealership hours
  const timeSlots = [
    { value: '09:00', label: '9:00 AM' },
    { value: '09:30', label: '9:30 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '10:30', label: '10:30 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '11:30', label: '11:30 AM' },
    { value: '13:00', label: '1:00 PM' },  // After lunch break
    { value: '13:30', label: '1:30 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '14:30', label: '2:30 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '15:30', label: '3:30 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '16:30', label: '4:30 PM' },
    { value: '17:00', label: '5:00 PM' }
  ];

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      const response = await fetch(`${config.apiUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: car.userId, // Assuming the car object includes the seller's userId
          subject: 'Car Inquiry',
          content: messageContent
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      alert('Message sent successfully!');
      setMessageContent('');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

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

            {currentUser && currentUser.id !== car.userId && (
              <>
                <div className="test-drive-section">
                  <h2>Schedule a Test Drive</h2>
                  <div className="scheduling-controls">
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={today}
                      max={maxDateStr}
                      className="date-select"
                    />

                    {selectedDate && (
                      <select 
                        value={selectedTime} 
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="time-select"
                      >
                        <option value="">Select a Time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {selectedDate && selectedTime && (
                      <button 
                        className="schedule-button"
                        onClick={() => {
                          const selectedTimeLabel = timeSlots.find(slot => slot.value === selectedTime)?.label;
                          const formattedDate = new Date(selectedDate)
                            .toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            });

                          fetch(`${config.apiUrl}/api/schedule-test-drive`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              carId: id,
                              date: formattedDate,
                              time: selectedTimeLabel,
                              userId: currentUser.id
                            })
                          })
                          .then(response => response.json())
                          .then(data => {
                            alert('Test drive scheduled successfully!');
                            setSelectedDate('');
                            setSelectedTime('');
                          })
                          .catch(error => {
                            console.error('Error scheduling test drive:', error);
                            alert('Failed to schedule test drive. Please try again.');
                          });
                        }}
                      >
                        Schedule Test Drive
                      </button>
                    )}
                  </div>
                </div>

                <div className="contact-section">
                  <h2>Interested in this vehicle?</h2>
                  <button 
                    className="contact-button"
                    onClick={() => setShowMessageModal(true)}
                  >
                    Contact Dealer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showMessageModal && (
        <div className="modal-overlay">
          <form onSubmit={handleSendMessage} className="modal-content">
            <h2>Contact Dealer</h2>
            <div className="message-input">
              <label>Message:</label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message about this vehicle..."
                required
              />
            </div>
            <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button type="submit">Send</button>
              <button type="button" onClick={() => setShowMessageModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CarDetails; 