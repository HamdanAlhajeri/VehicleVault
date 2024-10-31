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
<<<<<<< HEAD
    <AuthProvider>
      <div className="App">
        <NavBar />
=======
    <Router>
      <div>
        {/* Navigation Bar Hello this is a test*/}
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            {user && (
              <li>
                <Link to="/profile">Profile</Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Routes for different components */}
>>>>>>> 97ea5d388bd31f9128fa8475b6c0e76720079a93
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
