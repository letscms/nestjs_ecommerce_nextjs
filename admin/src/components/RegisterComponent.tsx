'use client';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface RegisterProps {
  onRegister?: (data: RegisterFormData) => void;
}

export default function RegisterComponent() {
const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.firstName.trim()) newErrors.push('First name is required');
    if (!formData.lastName.trim()) newErrors.push('Last name is required');
    if (!formData.email.trim()) newErrors.push('Email is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.push('Email is invalid');
    if (!formData.password) newErrors.push('Password is required');
    if (formData.password.length < 6) newErrors.push('Password must be at least 6 characters');
    if (formData.password !== formData.confirmPassword) newErrors.push('Passwords do not match');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors([]);


    try {
      // API call to register
      const response = await register(formData);

      if (response) {
        // Redirect or show success message
        console.log('Registration successful:', response);
      } else {
        setErrors(['Registration failed']);
      }
    } catch (error) {
      setErrors(['Network error. Please try again later.']);
    } finally {
      setLoading(false);
    }


  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                    <div className="card shadow">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 p-3 mb-3">
                                    <svg className="text-primary" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="h3 fw-bold text-dark mb-2">Create  Account</h2>
                                {/* <p className="text-muted small">
                                    Already have an account? {' '}
                                    <Link to="/login" className="text-primary text-decoration-none fw-medium">
                                        Sign in
                                    </Link> 
                                </p> */}
                            </div>

                            <form onSubmit={handleSubmit}>
                                {errors.length > 0 && (
                                    <div className="alert alert-danger d-flex align-items-start mb-4" role="alert">
                                        <svg className="flex-shrink-0 me-2 text-danger" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <strong>Please fix the following errors:</strong>
                                            <ul className="mb-0 mt-1 ps-3">
                                                {errors.map((error, index) => (
                                                    <li key={index}>{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="row g-3 mb-3">
                                    <div className="col-sm-6">
                                        <label htmlFor="firstName" className="form-label">First Name</label>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required
                                            className="form-control"
                                            placeholder="First name"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="lastName" className="form-label">Last Name</label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            required
                                            className="form-control"
                                            placeholder="Last name"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="form-control"
                                        placeholder="Email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <div className="position-relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            required
                                            className="form-control pe-5"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 text-muted"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {showPassword ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                )}
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="form-control"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="d-grid mb-3">
                                    <label htmlFor="phone" className="form-label">Phone Number</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        className="form-control"
                                        placeholder="Phone number"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="d-grid mb-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-primary btn-lg"
                                    >
                                        {loading && (
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        )}
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>

                                <div className="text-center">
                                    <small className="text-muted">
                                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                                    </small>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
