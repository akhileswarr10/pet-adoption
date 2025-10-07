import React, { useState } from 'react';
import axios from 'axios';

const TestLogin = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testing login to:', `${axios.defaults.baseURL}/auth/login`);
      
      const response = await axios.post('/auth/login', {
        email: 'admin@petadoption.com',
        password: 'password123'
      });
      
      setResult({
        success: true,
        data: response.data,
        message: 'Login successful!'
      });
      
      console.log('Login response:', response.data);
      
    } catch (error) {
      console.error('Login error:', error);
      
      setResult({
        success: false,
        error: error.response?.data || error.message,
        message: 'Login failed!'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h3 className="text-lg font-bold mb-4">Admin Login Test</h3>
      
      <div className="mb-4">
        <p><strong>Email:</strong> admin@petadoption.com</p>
        <p><strong>Password:</strong> password123</p>
        <p><strong>API URL:</strong> {axios.defaults.baseURL}</p>
      </div>
      
      <button
        onClick={testLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Admin Login'}
      </button>
      
      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-semibold">{result.message}</p>
          
          {result.success && result.data && (
            <div className="mt-2 text-sm">
              <p><strong>User:</strong> {result.data.user?.name}</p>
              <p><strong>Role:</strong> {result.data.user?.role}</p>
              <p><strong>Token:</strong> {result.data.token ? 'Generated ✅' : 'Missing ❌'}</p>
            </div>
          )}
          
          {!result.success && (
            <div className="mt-2 text-sm">
              <p><strong>Error:</strong> {JSON.stringify(result.error, null, 2)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestLogin;
