import React, { useState } from 'react';
import axios from 'axios';

const LoginTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      console.log('Testing backend connection...');
      
      // Test 1: Check if backend is reachable
      const healthResponse = await axios.get('/api/health');
      console.log('Health check:', healthResponse.data);
      setResult(prev => prev + '\n✅ Backend is reachable');
      
      // Test 2: Try login with demo admin credentials
      const loginResponse = await axios.post('/api/auth/login', {
        email: 'admin@petadoption.com',
        password: 'password123'
      });
      
      console.log('Login response:', loginResponse.data);
      setResult(prev => prev + '\n✅ Login successful!');
      setResult(prev => prev + `\n👤 User: ${loginResponse.data.user.name}`);
      setResult(prev => prev + `\n🔑 Role: ${loginResponse.data.user.role}`);
      
    } catch (error) {
      console.error('Login test error:', error);
      setResult(prev => prev + `\n❌ Error: ${error.message}`);
      
      if (error.response) {
        setResult(prev => prev + `\n📊 Status: ${error.response.status}`);
        setResult(prev => prev + `\n📝 Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Login Test</h2>
      
      <button
        onClick={testLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Admin Login'}
      </button>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-line">
          {result}
        </div>
      )}
    </div>
  );
};

export default LoginTest;
