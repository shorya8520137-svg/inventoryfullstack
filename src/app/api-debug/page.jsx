"use client";

export default function ApiDebugPage() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;
    
    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>API Debug Information</h1>
            <div style={{ background: '#f5f5f5', padding: '10px', margin: '10px 0' }}>
                <strong>NEXT_PUBLIC_API_BASE:</strong> {apiBase || 'NOT SET'}
            </div>
            <div style={{ background: '#f5f5f5', padding: '10px', margin: '10px 0' }}>
                <strong>Expected:</strong> https://16.171.5.50.nip.io
            </div>
            <div style={{ background: apiBase === 'https://16.171.5.50.nip.io' ? '#d4edda' : '#f8d7da', padding: '10px', margin: '10px 0' }}>
                <strong>Status:</strong> {apiBase === 'https://16.171.5.50.nip.io' ? '✅ CORRECT' : '❌ INCORRECT'}
            </div>
            
            <h2>Environment Variables</h2>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                {JSON.stringify({
                    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
                    NODE_ENV: process.env.NODE_ENV
                }, null, 2)}
            </pre>
            
            <h2>Test API Connection</h2>
            <button 
                onClick={async () => {
                    try {
                        const response = await fetch(`${apiBase}/api/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: 'test', password: 'test' })
                        });
                        console.log('API Response:', response.status);
                        alert(`API Response: ${response.status}`);
                    } catch (error) {
                        console.error('API Error:', error);
                        alert(`API Error: ${error.message}`);
                    }
                }}
                style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Test API Connection
            </button>
        </div>
    );
}