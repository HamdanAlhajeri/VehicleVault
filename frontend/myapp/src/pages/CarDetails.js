import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import config from '../config';
import FinanceCalculator from '../components/FinanceCalculator';

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
  const [showTradeInModal, setShowTradeInModal] = useState(false);
  const [tradeInMessages, setTradeInMessages] = useState([]);
  const [tradeInInput, setTradeInInput] = useState('');
  const [isTradeInLoading, setIsTradeInLoading] = useState(false);
  const [estimatedDiscount, setEstimatedDiscount] = useState(null);
  const [showFinanceModal, setShowFinanceModal] = useState(false);

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
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');

      const response = await fetch(`${config.apiUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add authentication header
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: car.userId,
          subject: 'Car Inquiry',
          content: messageContent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      alert('Message sent successfully!');
      setMessageContent('');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    }
  };

  const handleFinancingMessage = (financingDetails) => {
    const message = `Hi, I'm interested in financing this ${car.year} ${car.make} ${car.model}.\n\n` +
      `Financing Details:\n` +
      `- Down Payment: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financingDetails.downPayment)}\n` +
      `- Loan Term: ${financingDetails.loanTerm} months\n` +
      `- Monthly Payment: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financingDetails.monthlyPayment)}\n` +
      `- Total Cost: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financingDetails.totalCost)}\n\n` +
      `Please contact me to discuss this financing option.`;

    setMessageContent(message);
    setShowMessageModal(true);
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
    <div className="page">
      <Navigation />
      <div className="back-link" style={{ padding: '20px', marginBottom: '20px' }}>
        <Link to="/" style={{
          textDecoration: 'none',
          color: '#007bff',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          width: 'fit-content'
        }}>
          ← Back to Home
        </Link>
      </div>
      
      {car && (
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

                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '20px' 
                }}>
                  <button 
                    onClick={() => setShowMessageModal(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#000',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Contact Dealer
                  </button>

                  <button 
                    onClick={() => setShowFinanceModal(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#0056b3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Calculate Financing
                  </button>

                  <button 
                    onClick={() => setShowTradeInModal(true)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Estimate Trade-In Value
                  </button>
                </div>
              </>
            )}

            {car.isEV && (
              <div className="ev-incentives-section">
                <h2>EV Incentives</h2>
                <div className="incentives-list">
                  {car.evIncentives?.map((incentive, index) => (
                    <div key={index} className="incentive-item">
                      <span className="incentive-icon">✓</span>
                      {incentive}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {showMessageModal && (
            <div className="modal-overlay">
              <div className="message-modal">
                <button 
                  className="close-button"
                  onClick={() => setShowMessageModal(false)}
                >
                  ×
                </button>
                <h2>Contact Dealer</h2>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                />
                <div className="button-container">
                  <button 
                    className="cancel-button"
                    onClick={() => setShowMessageModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="send-button"
                    onClick={handleSendMessage}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTradeInModal && (
            <div className="modal-overlay">
              <div className="modal-content trade-in-modal">
                <h2>Trade-In Estimator</h2>
                <div className="chat-messages">
                  {tradeInMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isTradeInLoading && <div className="typing-indicator">Typing...</div>}
                  {estimatedDiscount && (
                    <div className="estimate-result">
                      <h3>Estimated Trade-In Value:</h3>
                      <p className="discount-amount">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(estimatedDiscount)}
                      </p>
                    </div>
                  )}
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!tradeInInput.trim()) return;

                  const userMessage = { role: 'user', content: tradeInInput };
                  setTradeInMessages(prev => [...prev, userMessage]);
                  setIsTradeInLoading(true);

                  try {
                    const response = await fetch(`${config.apiUrl}/api/trade-in-estimate`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        message: tradeInInput,
                        targetCarPrice: car.price,
                        previousMessages: tradeInMessages
                      }),
                    });

                    const data = await response.json();
                    
                    setTradeInMessages(prev => [...prev, { 
                      role: 'assistant', 
                      content: data.reply 
                    }]);

                    if (data.estimatedValue) {
                      setEstimatedDiscount(data.estimatedValue);
                    }
                  } catch (error) {
                    console.error('Trade-in Error:', error);
                    setTradeInMessages(prev => [...prev, { 
                      role: 'assistant', 
                      content: 'Sorry, there was an error. Please try again.' 
                    }]);
                  } finally {
                    setIsTradeInLoading(false);
                    setTradeInInput('');
                  }
                }}>
                  <div className="input-group" style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    margin: '1rem 0',
                    width: '100%' 
                  }}>
                    <input
                      type="text"
                      value={tradeInInput}
                      onChange={(e) => setTradeInInput(e.target.value)}
                      placeholder="Type your response..."
                      disabled={isTradeInLoading}
                      style={{
                        flex: 1,
                        padding: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        minHeight: '50px',
                        lineHeight: '1.5',
                        width: '80%'
                      }}
                    />
                    <button 
                      type="submit" 
                      disabled={isTradeInLoading}
                      style={{
                        padding: '0 24px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Send
                    </button>
                  </div>
                </form>
                <button 
                  className="close-button"
                  onClick={() => {
                    setShowTradeInModal(false);
                    setTradeInMessages([]);
                    setEstimatedDiscount(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {showFinanceModal && (
            <div className="modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div className="modal-content" style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '90%',
                position: 'relative'
              }}>
                <FinanceCalculator 
                  carPrice={car.price} 
                  onClose={() => setShowFinanceModal(false)}
                  onContactDealer={handleFinancingMessage}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CarDetails; 