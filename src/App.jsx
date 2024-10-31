import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import AddListing from './components/AddListing';
import Login from './components/Login';
import Register from './components/Register';
import NavBar from './components/NavBar';
import { AuthProvider } from './context/AuthContext';
import Profile from './components/Profile';
import Messages from './components/Messages/Messages';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
