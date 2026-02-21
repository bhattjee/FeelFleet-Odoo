import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { ROUTES } from '../../constants/routes';
import styles from './LoginPage.module.css';
import { TruckIcon } from '../../assets/icons';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.DASHBOARD);
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your credentials');
      return;
    }

    try {
      await login({ email, password });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      <div className={styles.card}>
        <div className={styles.logoCircle}>
          <TruckIcon size={40} color="#f59e0b" />
        </div>

        <h1 className={styles.heading}>Login</h1>
        <p className={styles.subheading}>Access your FleetFlow dashboard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" className={styles.submitBtn}>
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          <a href="#" className={styles.link}>
            Forgot Password?
          </a>
          <p className={styles.registerText}>
            Don't have an account?
            <Link to={ROUTES.REGISTER} className={styles.registerLink}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
