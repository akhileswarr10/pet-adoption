import React, { useState } from 'react';
import './LoginPage.css'; // Import the CSS file for styling

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Login attempt with:', { email, password });
    // Here you would typically handle the login logic, e.g.,
    // making an API call to authenticate the user.
    // For this example, we'll just log the credentials.
    alert(`Attempting to log in with email: ${email}`);

    // Reset form fields after submission
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">🐾 Pet Adoption Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
        <p className="login-footer">
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;