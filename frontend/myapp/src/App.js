import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';
import AddCar from './pages/AddCar';
import ChatbotWindow from './components/ChatbotWindow';
import CarDetails from './pages/CarDetails';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminCars from './pages/AdminCars';
import AdminUsers from './pages/AdminUsers';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<Users />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-car" element={<AddCar />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/cars" element={<AdminCars />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
        <ChatbotWindow />
      </div>
    </Router>
  );
}

export default App;