import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
    }
  }, [activeTab]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/conversations?participants_like=${user.id}`);
      const data = await response.json();

      // Fetch additional details for each conversation
      const detailedConversations = await Promise.all(
        data.map(async (conv) => {
          // Get the other participant's details
          const otherUserId = conv.participants.find(id => id !== user.id);
          const userResponse = await fetch(`http://localhost:3001/users/${otherUserId}`);
          const otherUser = await userResponse.json();

          // Get the last few messages
          const messagesResponse = await fetch(
            `http://localhost:3001/messages?conversationId=${conv.id}&_sort=timestamp&_order=desc&_limit=1`
          );
          const messages = await messagesResponse.json();

          return {
            ...conv,
            otherUser,
            lastMessage: messages[0]
          };
        })
      );

      setConversations(detailedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="profile-info">
      {/* Your existing profile content */}
    </div>
  );

  const renderMessagesTab = () => (
    <div className="messages-tab">
      <h3>My Conversations</h3>
      {loading ? (
        <p>Loading conversations...</p>
      ) : conversations.length === 0 ? (
        <p>No conversations yet</p>
      ) : (
        <div className="conversations-list">
          {conversations.map(conv => (
            <div 
              key={conv.id} 
              className="conversation-card"
              onClick={() => navigate('/messages', { state: { conversationId: conv.id } })}
            >
              <div className="conversation-header">
                <h4>Chat with {conv.otherUser?.name}</h4>
                <span className="timestamp">
                  {new Date(conv.lastMessage?.timestamp || conv.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="conversation-details">
                <p className="car-info">Re: {conv.carTitle}</p>
                <p className="last-message">
                  {conv.lastMessage ? (
                    <>
                      <strong>
                        {conv.lastMessage.senderId === user.id ? 'You: ' : `${conv.otherUser?.name}: `}
                      </strong>
                      {conv.lastMessage.content}
                    </>
                  ) : (
                    'No messages yet'
                  )}
                </p>
              </div>

              <div className="conversation-status">
                <span className={`status ${conv.status || 'active'}`}>
                  {conv.status || 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          My Messages
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' ? renderProfileTab() : renderMessagesTab()}
      </div>
    </div>
  );
}

export default Profile;
