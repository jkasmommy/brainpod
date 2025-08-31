'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { getCurrentUser, initializeAuth, createDemoAccount } from '@/lib/auth';

export default function SignIn() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'parent' | 'teacher',
    age: '',
    parentalConsent: false
  });

  useEffect(() => {
    initializeAuth();
    createDemoAccount();
    
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleDemoLogin = () => {
    setFormData(prev => ({
      ...prev,
      email: 'demo@brainpod.com',
      password: 'demo123'
    }));
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (isSignUp) {
      if (!formData.name) {
        setError('Name is required');
        return false;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }

      if (formData.role === 'student') {
        const age = parseInt(formData.age);
        if (!age || age < 5 || age > 18) {
          setError('Please enter a valid age between 5 and 18');
          return false;
        }

        if (age < 13 && !formData.parentalConsent) {
          setError('Parental consent is required for users under 13');
          return false;
        }
      }
    }

    return true;
  };

  const handleSignIn = async () => {
    const users = JSON.parse(localStorage.getItem('bp_users') || '[]');
    const user = users.find((u: User) => u.email === formData.email);

    if (!user) {
      setError('No account found with this email address');
      return;
    }

    // In a real app, you'd hash and compare passwords securely
    const storedPassword = localStorage.getItem(`bp_password_${user.id}`);
    if (storedPassword !== formData.password) {
      setError('Incorrect password');
      return;
    }

    // Update last login
    user.lastLogin = Date.now();
    const updatedUsers = users.map((u: User) => u.id === user.id ? user : u);
    localStorage.setItem('bp_users', JSON.stringify(updatedUsers));

    // Set current user session
    localStorage.setItem('bp_current_user', JSON.stringify(user));
    
    setSuccess('Sign in successful! Redirecting...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleSignUp = async () => {
    const users = JSON.parse(localStorage.getItem('bp_users') || '[]');
    
    // Check if email already exists
    const existingUser = users.find((u: User) => u.email === formData.email);
    if (existingUser) {
      setError('An account with this email already exists');
      return;
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      createdAt: Date.now()
    };

    // Save user and password (in production, use proper hashing)
    users.push(newUser);
    localStorage.setItem('bp_users', JSON.stringify(users));
    localStorage.setItem(`bp_password_${newUser.id}`, formData.password);

    // Save additional profile data
    if (formData.role === 'student' && formData.age) {
      localStorage.setItem(`bp_profile_${newUser.id}`, JSON.stringify({
        age: parseInt(formData.age),
        parentalConsent: formData.parentalConsent
      }));
    }

    // Set current user session
    localStorage.setItem('bp_current_user', JSON.stringify(newUser));

    setSuccess('Account created successfully! Redirecting...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-gray-900 dark:to-violet-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-lg backdrop-blur-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {isSignUp ? 'Start your personalized learning journey' : 'Sign in to continue your learning journey'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field for signup */}
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                      placeholder="Enter your full name"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    placeholder="student@example.com"
                    required
                  />
                </div>
              </div>

              {/* Role selection for signup */}
              {isSignUp && (
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    I am a...
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
              )}

              {/* Age field for student signup */}
              {isSignUp && formData.role === 'student' && (
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="5"
                    max="18"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    placeholder="Enter your age"
                    required
                  />
                </div>
              )}
              
              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm password for signup */}
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:text-gray-200 focus:outline-none"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Parental consent for young students */}
              {isSignUp && formData.role === 'student' && parseInt(formData.age) < 13 && parseInt(formData.age) > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="parentalConsent"
                      checked={formData.parentalConsent}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 mt-1"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      I confirm that a parent or guardian has given permission for this account and will supervise its use.
                    </span>
                  </label>
                </div>
              )}
              
              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-sm"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccess('');
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      role: 'student',
                      age: '',
                      parentalConsent: false
                    });
                  }}
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-sm"
                >
                  {isSignUp ? 'Sign in here' : 'Sign up for free'}
                </button>
              </p>
            </div>

            {/* Demo Account Info */}
            <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-2">
                🎯 <strong>Demo Account:</strong>
              </p>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">
                Email: demo@brainpod.com | Password: demo123
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full px-4 py-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 text-sm font-medium rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-colors"
              >
                Fill Demo Credentials
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                🛡️ Child accounts require parental consent and supervision
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
