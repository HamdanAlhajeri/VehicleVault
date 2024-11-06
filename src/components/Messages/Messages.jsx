import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import './Messages.css';

function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch conversations when component mounts
  useEffect(() => {
    if (user) {
      fetchConversations();
      // If we have a conversationId from navigation, select it
      if (location.state?.conversationId) {
        fetchAndSelectConversation(location.state.conversationId);
      }
    } else {
      navigate('/login');
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`http://localhost:3001/conversations?participants_like=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      
      // Fetch user details for each conversation
      const conversationsWithDetails = await Promise.all(
        data.map(async (conv) => {
          const otherUserId = conv.participants.find(id => id !== user.id);
          const userResponse = await fetch(`http://localhost:3001/users/${otherUserId}`);
          const otherUser = await userResponse.json();
          return {
            ...conv,
            otherUser
          };
        })
      );
      
      setConversations(conversationsWithDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchAndSelectConversation = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:3001/conversations/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch conversation');
      const conversation = await response.json();
      
      // Fetch messages for this conversation
      const messagesResponse = await fetch(`http://localhost:3001/messages?conversationId=${conversationId}`);
      if (!messagesResponse.ok) throw new Error('Failed to fetch messages');
      const messages = await messagesResponse.json();
      
      // Fetch other user's details
      const otherUserId = conversation.participants.find(id => id !== user.id);
      const userResponse = await fetch(`http://localhost:3001/users/${otherUserId}`);
      const otherUser = await userResponse.json();
      
      setSelectedConversation({
        ...conversation,
        messages,
        otherUser
      });
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  const handleConversationSelect = async (conversation) => {
    await fetchAndSelectConversation(conversation.id);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = {
        conversationId: selectedConversation.id,
        senderId: user.id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      const response = await fetch('http://localhost:3001/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const savedMessage = await response.json();

      // Update conversation with new message
      setSelectedConversation(prev => ({
        ...prev,
        messages: [...prev.messages, savedMessage]
      }));

      // Update conversation's last message
      const convResponse = await fetch(`http://localhost:3001/conversations/${selectedConversation.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastMessage: newMessage.trim(),
          lastMessageTimestamp: new Date().toISOString()
        })
      });

      if (!convResponse.ok) throw new Error('Failed to update conversation');

      setNewMessage('');
      fetchConversations(); // Refresh conversations list
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return <div className="messages-loading">Loading conversations...</div>;
  }

  return (
    <div className="messages-container">
      <div className="conversations-list">
        <h2>Conversations</h2>
        {conversations.length === 0 ? (
          <p>No conversations yet</p>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
              onClick={() => handleConversationSelect(conv)}
            >
              <div className="conversation-preview">
                <h3>{conv.otherUser?.name || 'Unknown User'}</h3>
                <p className="car-title">Re: {conv.carTitle}</p>
                <p className="last-message">{conv.lastMessage || 'No messages yet'}</p>
                <span className="timestamp">
                  {new Date(conv.lastMessageTimestamp || conv.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="message-content">
        {selectedConversation ? (
          <>
            <div className="message-header">
              <h3>
                Chat with {selectedConversation.otherUser?.name} about: {selectedConversation.carTitle}
              </h3>
            </div>

            <div className="messages-list">
              {selectedConversation.messages.map(message => (
                <div
                  key={message.id}
                  className={`message ${message.senderId === user.id ? 'sent' : 'received'}`}
                >
                  <div className="message-bubble">
                    {message.content}
                  </div>
                  <div className="message-timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages; 