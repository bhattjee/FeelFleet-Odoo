import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { ROUTES } from '../../constants/routes';
import styles from './RegisterPage.module.css';
import { LockIcon } from '../../assets/icons';

const ROLE_OPTIONS = [
  { value: 'MANAGER', label: 'Manager' },
  { value: 'DISPATCHER', label: 'Dispatcher' },
  { value: 'SAFETY_OFFICER', label: 'Safety Officer' },
  { value: 'FINANCIAL_ANALYST', label: 'Financial Analyst' },
];

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('MANAGER');
  const [error, setError] = useState('');

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.DASHBOARD);
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({ email, password, name, role, confirmPassword });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      <div className={styles.card}>
        <div className={styles.logoCircle}>
          <LockIcon size={40} color="#f59e0b" />
        </div>

        <h1 className={styles.heading}>Sign Up</h1>
        <p className={styles.subheading}>Create your FleetFlow account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className={styles.field}>
            <label className={styles.label}>Role</label>
            <select
              className={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={error}
          />

          <Button type="submit" variant="primary" className={styles.submitBtn}>
            Create Account
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.loginText}>
            Already have an account?
            <Link to={ROUTES.LOGIN} className={styles.loginLink}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
