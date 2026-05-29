import React, { useState } from 'react';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, User, Mail, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../Auth/AuthLayout';

const Register = ({ setAuthenticated }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Calculate password strength
    if (e.target.name === 'password') {
      const strength = calculatePasswordStrength(e.target.value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength < 50) {
      toast.error('Password is too weak. Please use a stronger password.');
      return;
    }

    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      toast.success('Account created successfully! 🎉');
      setAuthenticated(true);
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#ef4444';
    if (passwordStrength < 50) return '#f97316';
    if (passwordStrength < 75) return '#facc15';
    return '#22c55e';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <AuthLayout
      headingMain={"CREATE"}
      headingAccent={"ACCOUNT"}
      description={"Join OrderTrack today and start managing your orders efficiently. Get started with just a few simple steps."}
      smallBullets={["🚀 Fast", "🔒 Secure"]}
    >
      <div className="auth-form">
        <header>
          <h2 className="auth-form__title">Register</h2>
          <p className="auth-form__subtitle">Fill in your details to get started</p>
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
                placeholder="Choose a username"
                required
                minLength={3}
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label">
              <Mail size={14} />
              Email
            </label>
            <div className="auth-field__control">
              <span className="auth-field__icon"><Mail size={16} /></span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="auth-field__input"
                placeholder="Enter your email"
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
                placeholder="Create a password"
                required
                minLength={6}
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
            {formData.password && (
              <div className="auth-strength">
                <div className="auth-strength__row">
                  <span>Password strength</span>
                  <span style={{ color: getPasswordStrengthColor(), fontWeight: 700 }}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="auth-strength__bar">
                  <div
                    className="auth-strength__fill"
                    style={{ width: `${passwordStrength}%`, background: getPasswordStrengthColor() }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-field__label">
              <Lock size={14} />
              Confirm Password
            </label>
            <div className="auth-field__control">
              <span className="auth-field__icon"><Lock size={16} /></span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-field__input"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="auth-field__toggle"
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className={`auth-hint ${formData.password === formData.confirmPassword ? 'auth-hint--ok' : ''}`}>
                {formData.password === formData.confirmPassword ? (
                  <>
                    <Check size={14} style={{ verticalAlign: 'text-top', marginRight: '6px' }} />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <span>Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
          >
            {loading ? (
              <>
                <span className="auth-submit__spinner" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Register</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
