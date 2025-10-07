import React, { useState } from 'react';

const DirectLoginTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectLogin = async () => {
    setLoading(true);
    setResult('Starting direct login test...\n');
    
    try {
      // Test 1: Health check
      setResult(prev => prev + '1. Testing health endpoint...\n');
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      setResult(prev => prev + `✅ Health: ${healthData.message}\n`);
      
      // Test 1.5: Emergency user count (no auth)
      setResult(prev => prev + '1.5. Testing emergency user endpoint...\n');
      const testResponse = await fetch('/api/test/users');
      const testData = await testResponse.json();
      setResult(prev => prev + `📊 Users in DB: ${testData.totalUsers}, Admins: ${testData.adminUsers}\n`);
      
      // Test 2: Direct login
      setResult(prev => prev + '2. Testing login endpoint...\n');
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@petadoption.com',
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        setResult(prev => prev + `✅ Login successful!\n`);
        setResult(prev => prev + `👤 User: ${loginData.user.name}\n`);
        setResult(prev => prev + `🔑 Role: ${loginData.user.role}\n`);
        setResult(prev => prev + `🎫 Token: ${loginData.token ? 'Generated' : 'Missing'}\n`);
        
        // Test 3: Try accessing protected endpoint
        setResult(prev => prev + '3. Testing protected endpoint...\n');
        const statsResponse = await fetch('/api/users/stats/overview', {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setResult(prev => prev + `✅ Stats: ${JSON.stringify(statsData)}\n`);
        } else {
          const statsError = await statsResponse.json();
          setResult(prev => prev + `❌ Stats error: ${JSON.stringify(statsError)}\n`);
        }
        
      } else {
        setResult(prev => prev + `❌ Login failed: ${loginResponse.status}\n`);
        setResult(prev => prev + `📝 Error: ${JSON.stringify(loginData)}\n`);
      }
      
    } catch (error) {
      setResult(prev => prev + `❌ Network error: ${error.message}\n`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Direct Login Test</h2>
      
      <button
        onClick={testDirectLogin}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Run Direct Login Test'}
      </button>
      
      {result && (
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-line max-h-96 overflow-y-auto">
          {result}
        </div>
      )}
    </div>
  );
};

export default DirectLoginTest;
