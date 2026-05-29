import React, { useState } from 'react';
import { login } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../Auth/AuthLayout';

const Login = ({ setAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      toast.success('Welcome back! 🎉');
      setAuthenticated(true);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headingMain={"WELCOME"}
      headingAccent={"BACK!"}
      description={"Access your OrderTrack dashboard and manage your orders with ease. Your secure gateway to efficient order tracking."}
      smallBullets={["🚀 Fast", "🔒 Secure"]}
    >
      <div className="auth-form">
        <header>
          <h2 className="auth-form__title">Login</h2>
          <p className="auth-form__subtitle">Enter your credentials to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-field__label">
              <User size={14} />
              Username
            </label>
            <div className="auth-field__control">
              <span className="auth-field__icon"><User size={16} /></span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="auth-field__input"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label">
              <Lock size={14} />
              Password
            </label>
            <div className="auth-field__control">
              <span className="auth-field__icon"><Lock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="auth-field__input"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="auth-field__toggle"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading ? (
              <>
                <span className="auth-submit__spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
