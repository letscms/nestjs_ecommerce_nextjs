'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function CommonLogin() {
    const [formData, setFormData] = useState<{
        email: string;
        password: string;
        type: 'user' | 'admin';
      }>({
        email: '',
        password: '',
        type: 'user'
      });
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      
      const { login } = useAuth();
      const router = useRouter();
    
      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
      };
    
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setLoading(true);
        setError('');
        
        try {
          const success = await login(formData.email, formData.password, formData.type);
        //   console.log('Login success:', success);
          if (success) {
            // Redirect based on login type
            if (formData.type === 'admin') {
              router.push('/admin');
            } else {
              router.push('/');
            }
          } else {
            setError('Invalid credentials. Please try again.');
          }
        } catch (err: any) {
          setError(err.message || 'Login failed. Please try again.');
        } finally {
        //   setLoading(false);
        }
      };
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6 col-lg-5 col-xl-4">
                <div className="card shadow-lg border-0">
                  <div className="card-body p-5">
                    {/* Logo/Brand */}
                    <div className="text-center mb-4">
                      <Image
                        src="/next.svg"
                        alt="Logo"
                        width={120}
                        height={25}
                        className="mb-3"
                      />
                      <h1 className="h4 text-gray-900 mb-2">Welcome Back</h1>
                      <p className="text-muted">Sign in to your account</p>
                    </div>
    
                    {/* Error Alert */}
                    {error && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setError('')}
                        ></button>
                      </div>
                    )}
    
                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-envelope"></i>
                          </span>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={`Enter your ${formData.type} email`}
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
    
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-lock"></i>
                          </span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
    
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="rememberMe"
                        />
                        <label className="form-check-label" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
    
                      <button
                        type="submit"
                        className={`btn w-100 py-2 ${formData.type === 'admin' ? 'btn-danger' : 'btn-primary'}`}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Signing in...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Sign In as {formData.type === 'admin' ? 'Admin' : 'User'}
                          </>
                        )}
                      </button>
                    </form>
    
                    <hr className="my-4" />
    
                    {/* Additional Links */}
                    <div className="text-center">
                      {formData.type === 'user' && (
                        <div className="mb-2">
                          <a href="/register" className="text-decoration-none">
                            <small>Don't have an account? Register here</small>
                          </a>
                        </div>
                      )}
                      <a href="/forgot-password" className="text-decoration-none">
                        <small>Forgot your password?</small>
                      </a>
                    </div>
                  </div>
                </div>
    
                {/* Footer */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    &copy; 2024 E-commerce Platform. All rights reserved.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}