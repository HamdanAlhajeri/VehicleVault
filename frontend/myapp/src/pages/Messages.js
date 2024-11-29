import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import config from '../config';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessageContent, setNewMessageContent] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from:', `${config.apiUrl}/api/users`);
      const response = await fetch(`${config.apiUrl}/api/users`);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', response.status, errorData);
        throw new Error(`Failed to fetch users: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      // Filter out current user from the list
      const filteredUsers = data.filter(user => user.id !== currentUser.id);
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to fetch users: ${err.message}`);
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseChat = () => {
    setSelectedMessage(null);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/messages/${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = async (e) => {
    e.preventDefault();
    if (!newMessageContent.trim()) return;

    const recipientId = selectedMessage 
      ? selectedMessage.otherUserId 
      : selectedUser?.id;

    if (!recipientId) return;

    try {
      const response = await fetch(`${config.apiUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: recipientId,
          subject: 'Message',
          content: newMessageContent
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Fetch updated messages
      const updatedMessagesResponse = await fetch(`${config.apiUrl}/api/messages/${currentUser.id}`);
      const updatedMessages = await updatedMessagesResponse.json();
      
      setMessages(updatedMessages);
      
      // Update selectedMessage with the new conversation
      if (selectedMessage) {
        const updatedConversation = updatedMessages.find(
          conv => conv.otherUserId === selectedMessage.otherUserId
        );
        setSelectedMessage(updatedConversation);
      }

      setNewMessageContent('');
      
      if (!selectedMessage) {
        setSelectedUser(null);
        setShowNewMessageModal(false);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="page">
      <Navigation />
      
      <div className="messages-content">
        <header className="messages-header">
          <h1>Messages</h1>
          <button onClick={() => setShowNewMessageModal(true)}>New Message</button>
        </header>

        <div className="messages-list">
          {messages.map(conversation => (
            <div 
              key={conversation.otherUserId} 
              className="message-item"
              onClick={() => handleMessageClick(conversation)}
            >
              <div className="message-sender">
                <span>{conversation.otherUserName}</span>
                {conversation.messages.some(m => m.unread) && <span className="unread-indicator" />}
              </div>
              <div className="message-preview">{conversation.messages[0].content}</div>
              <div className="message-date">
                {new Date(conversation.messages[0].createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {selectedMessage && (
          <div className="chat-overlay">
            <div className="chat-container">
              <div className="chat-header">
                <h3>Chat with {selectedMessage.otherUserName}</h3>
                <button onClick={handleCloseChat}>Close</button>
              </div>
              <div className="messages-wrapper">
                <div className="chat-messages">
                  {[...selectedMessage.messages].reverse().map(message => (
                    <div 
                      key={message.id} 
                      className={`chat-message ${message.senderId === currentUser.id ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{message.content}</p>
                        <small>{new Date(message.createdAt).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chat-footer">
                <form onSubmit={handleNewMessage} className="chat-input">
                  <input
                    type="text"
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button type="submit">Send</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {showNewMessageModal && (
          <div className="modal-overlay">
            <form onSubmit={handleNewMessage} className="modal-content">
              <h2>New Message</h2>
              <div className="user-select">
                <label>Select User:</label>
                <select 
                  value={selectedUser?.id || ''} 
                  onChange={(e) => setSelectedUser(users.find(u => u.id === Number(e.target.value)))}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="message-input">
                <label>Message:</label>
                <textarea
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  required
                />
              </div>
              <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button type="submit">Send</button>
                <button type="button" onClick={() => setShowNewMessageModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;