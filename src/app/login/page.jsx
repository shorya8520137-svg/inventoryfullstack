"use client";

import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // 2FA States
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState("");
    const [userId, setUserId] = useState(null);
    const [isBackupCode, setIsBackupCode] = useState(false);

    // ENHANCED LOGIN LOGIC WITH 2FA SUPPORT
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        console.log("🚀 Form submitted - JavaScript is working!");

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://52.221.231.85:8443";
            console.log("🔗 API Base:", apiBase);

            // Prepare request body
            const requestBody = { 
                email, 
                password,
                ...(requires2FA && twoFactorToken && { 
                    two_factor_token: twoFactorToken,
                    isBackupCode: isBackupCode 
                })
            };
            console.log("� Request body:", { ...requestBody, password: "***" });

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

            // Handle 2FA requirement
            if (data.requires_2fa && !requires2FA) {
                console.log("🔐 2FA Required - Showing 2FA input");
                setRequires2FA(true);
                setUserId(data.user_id);
                setLoading(false);
                return;
            }

            // Handle successful login
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log("✅ Login successful! Redirecting...");
                window.location.href = "/products";
            } else {
                setError(data.message || "Invalid credentials");
                console.log("❌ Login failed:", data.message);
                
                // Reset 2FA state on error
                if (requires2FA) {
                    setTwoFactorToken("");
                }
            }
        } catch (error) {
            console.error("❌ Network error:", error);
            setError("Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle 2FA token submission
    const handle2FASubmit = async (e) => {
        e.preventDefault();
        
        if (!twoFactorToken.trim()) {
            setError("Please enter your 2FA code");
            return;
        }

        // Trigger the main login flow with 2FA token
        await handleSubmit(e);
    };

    // Reset 2FA flow
    const reset2FA = () => {
        setRequires2FA(false);
        setTwoFactorToken("");
        setUserId(null);
        setIsBackupCode(false);
        setError("");
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundImage: 'url(/background.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            fontFamily: 'system-ui, sans-serif',
            padding: '20px',
            position: 'relative'
        }}>
            {/* Light overlay for better text readability */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                zIndex: 1
            }}></div>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '40px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Logo and Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <img 
                            src="/hunhuny.jpeg" 
                            alt="hunyhuny logo"
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                objectFit: 'cover',
                                marginRight: '12px',
                                border: '2px solid #e5e7eb'
                            }}
                        />
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ 
                                fontSize: '24px', 
                                fontWeight: 'bold', 
                                color: '#ffffff',
                                lineHeight: '1.2',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                            }}>
                                hunyhuny
                            </div>
                            <div style={{ 
                                fontSize: '14px', 
                                color: 'rgba(255, 255, 255, 0.8)',
                                lineHeight: '1.2',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                            }}>
                                Inventory Management
                            </div>
                        </div>
                    </div>
                    <h1 style={{ 
                        fontSize: '28px', 
                        fontWeight: 'bold', 
                        color: '#ffffff',
                        margin: '0 0 8px 0',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{ 
                        color: 'rgba(255, 255, 255, 0.9)', 
                        margin: '0',
                        fontSize: '16px',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}>
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={requires2FA ? handle2FASubmit : handleSubmit}>
                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            color: '#dc2626',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ marginRight: '8px', flexShrink: 0 }}>
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Show 2FA input when required */}
                    {requires2FA ? (
                        <>
                            {/* 2FA Header */}
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    border: '2px solid rgba(79, 70, 229, 0.2)'
                                }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <circle cx="12" cy="16" r="1"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                                <h2 style={{ 
                                    fontSize: '20px', 
                                    fontWeight: 'bold', 
                                    color: '#ffffff',
                                    margin: '0 0 8px 0',
                                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                                }}>
                                    Two-Factor Authentication
                                </h2>
                                <p style={{ 
                                    color: 'rgba(255, 255, 255, 0.8)', 
                                    margin: '0',
                                    fontSize: '14px',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                                }}>
                                    Enter the 6-digit code from your authenticator app
                                </p>
                            </div>

                            {/* 2FA Token Input */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                                }}>
                                    {isBackupCode ? 'Backup Code' : 'Authentication Code'}
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        width: '20px',
                                        height: '20px'
                                    }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12l2 2 4-4"/>
                                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                                    </svg>
                                    <input
                                        type="text"
                                        value={twoFactorToken}
                                        onChange={(e) => setTwoFactorToken(e.target.value)}
                                        placeholder={isBackupCode ? "Enter 8-character backup code" : "Enter 6-digit code"}
                                        required
                                        autoFocus
                                        maxLength={isBackupCode ? 8 : 6}
                                        style={{
                                            width: '100%',
                                            padding: '16px 16px 16px 48px',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '12px',
                                            fontSize: '18px',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                            color: '#ffffff',
                                            transition: 'all 0.2s',
                                            textAlign: 'center',
                                            letterSpacing: '0.1em'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.08)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Backup Code Toggle */}
                            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsBackupCode(!isBackupCode);
                                        setTwoFactorToken("");
                                        setError("");
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                                    }}
                                >
                                    {isBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
                                </button>
                            </div>

                            {/* Back Button */}
                            <div style={{ marginBottom: '20px' }}>
                                <button
                                    type="button"
                                    onClick={reset2FA}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        marginBottom: '12px'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                >
                                    ← Back to login
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Regular Login Form */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                                }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'rgba(255, 255, 255, 0.7)',
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
                                        placeholder="Enter your email"
                                        required
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            padding: '16px 16px 16px 48px',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                            color: '#ffffff',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.08)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '8px', 
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                                }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <svg style={{
                                        position: 'absolute',
                                        left: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        width: '20px',
                                        height: '20px'
                                    }} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '16px 48px 16px 48px',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                            color: '#ffffff',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.08)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'rgba(255, 255, 255, 0.7)',
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
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (requires2FA && !twoFactorToken.trim())}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: loading || (requires2FA && !twoFactorToken.trim()) ? '#9ca3af' : '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading || (requires2FA && !twoFactorToken.trim()) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseOver={(e) => {
                            if (!loading && !(requires2FA && !twoFactorToken.trim())) {
                                e.target.style.backgroundColor = '#4338ca';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!loading && !(requires2FA && !twoFactorToken.trim())) {
                                e.target.style.backgroundColor = '#4f46e5';
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
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                {requires2FA ? 'Verifying...' : 'Signing in...'}
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                    {requires2FA ? (
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    ) : (
                                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    )}
                                </svg>
                                {requires2FA ? 'Verify Code' : 'Sign In'}
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                input::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                input::-webkit-input-placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                input::-moz-placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                input:-ms-input-placeholder {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
            `}</style>
        </div>
    );
}