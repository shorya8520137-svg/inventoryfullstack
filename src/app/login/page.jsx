"use client";

import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // EXACT SAME LOGIC AS WORKING SIMPLE LOGIN
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        console.log("🚀 Form submitted - JavaScript is working!");

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://54.169.107.64:8443";
            console.log("🔗 API Base:", apiBase);

            const requestBody = { email, password };
            console.log("📤 Request body:", requestBody);

            const response = await fetch(`${apiBase}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log("📥 Response status:", response.status);
            const data = await response.json();
            console.log("📥 Response data:", data);

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log("✅ Login successful! Redirecting...");
                window.location.href = "/products";
            } else {
                setError(data.message || "Invalid credentials");
                console.log("❌ Login failed:", data.message);
            }
        } catch (error) {
            console.error("❌ Network error:", error);
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                animation: 'float 20s ease-in-out infinite'
            }}></div>

            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                width: '100%',
                maxWidth: '450px',
                position: 'relative',
                zIndex: 1,
                backdropFilter: 'blur(10px)'
            }}>
                {/* Logo and Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem'
                        }}>
                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                                <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.2"/>
                                <path d="M8 12h16M8 16h16M8 20h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 'bold', 
                                color: '#1f2937',
                                lineHeight: '1.2'
                            }}>
                                hunyhuny
                            </div>
                            <div style={{ 
                                fontSize: '0.875rem', 
                                color: '#6b7280',
                                lineHeight: '1.2'
                            }}>
                                Inventory Management
                            </div>
                        </div>
                    </div>
                    <h1 style={{ 
                        fontSize: '2rem', 
                        fontWeight: 'bold', 
                        color: '#1f2937',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ 
                        color: '#6b7280', 
                        margin: '0',
                        fontSize: '1rem'
                    }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #ef4444',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.875rem'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: '#374151',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                        }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <svg style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af',
                                width: '20px',
                                height: '20px'
                            }} viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@company.com"
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 3rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: '#374151',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <svg style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af',
                                width: '20px',
                                height: '20px'
                            }} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Admin@123"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 3rem 0.75rem 3rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid #ffffff',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    marginRight: '0.5rem'
                                }}></div>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div style={{ 
                    marginTop: '1.5rem', 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                }}>
                    <p style={{ margin: '0' }}>Test credentials:</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontFamily: 'monospace' }}>
                        admin@company.com / Admin@123
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
            `}</style>
        </div>
    );
}