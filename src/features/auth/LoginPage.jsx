import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Icon } from '../../components/Icon/Icon';
import loginHero from '../../assets/login-hero.png';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError('Please enter email and password'); return; }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Invalid email or password' : authError.message);
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      {/* Left panel — illustration */}
      <div className={styles.leftPanel}>
        <div className={styles.heroWrap}>
          <div className={styles.gridBg} />
          <img src={loginHero} alt="Healthcare illustration" className={styles.heroImg} />
        </div>
        <div className={styles.dots}>
          <span className={styles.dotActive} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>

      {/* Right panel — login form */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          {/* Logo */}
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 290 290" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M290 145C290 159.088 284.404 172.599 274.442 182.561C264.48 192.522 250.969 198.119 236.881 198.119H145C137.334 198.119 129.839 200.392 123.465 204.651C117.09 208.911 112.122 214.965 109.188 222.047C106.254 229.13 105.487 236.924 106.982 244.443C108.478 251.962 112.17 258.869 117.591 264.29C123.012 269.711 129.919 273.403 137.438 274.899C144.957 276.394 152.751 275.627 159.834 272.693C166.917 269.759 172.97 264.791 177.23 258.416C181.489 252.042 183.762 244.548 183.762 236.881V212.475C183.762 210.571 184.519 208.746 185.865 207.399C187.211 206.053 189.037 205.297 190.941 205.297C192.844 205.297 194.67 206.053 196.016 207.399C197.363 208.746 198.119 210.571 198.119 212.475V236.881C198.119 247.387 195.003 257.657 189.167 266.392C183.33 275.128 175.034 281.936 165.328 285.957C155.622 289.977 144.941 291.029 134.637 288.979C124.333 286.93 114.868 281.871 107.439 274.442C100.011 267.013 94.9515 257.548 92.9019 247.244C90.8523 236.94 91.9042 226.26 95.9246 216.553C99.9451 206.847 106.753 198.551 115.489 192.714C124.224 186.878 134.494 183.762 145 183.762H236.881C247.162 183.762 257.021 179.678 264.29 172.409C271.56 165.14 275.644 155.28 275.644 145C275.644 134.72 271.56 124.86 264.29 117.591C257.021 110.321 247.162 106.238 236.881 106.238H212.475C210.571 106.238 208.746 105.481 207.4 104.135C206.053 102.789 205.297 100.963 205.297 99.0594C205.297 97.1556 206.053 95.3298 207.4 93.9836C208.746 92.6375 210.571 91.8812 212.475 91.8812H236.881C250.969 91.8812 264.48 97.4776 274.442 107.439C284.404 117.401 290 130.912 290 145ZM106.238 120.594C106.238 118.69 105.481 116.864 104.135 115.518C102.789 114.172 100.963 113.416 99.0594 113.416C97.1556 113.416 95.3298 114.172 93.9837 115.518C92.6375 116.864 91.8812 118.69 91.8812 120.594V145C91.8812 152.666 89.6078 160.161 85.3486 166.535C81.0893 172.91 75.0355 177.878 67.9526 180.812C60.8697 183.746 53.0758 184.513 45.5567 183.018C38.0375 181.522 31.1307 177.83 25.7097 172.409C20.2887 166.988 16.5969 160.081 15.1013 152.562C13.6056 145.043 14.3732 137.249 17.3071 130.166C20.2409 123.083 25.2092 117.03 31.5836 112.77C37.9581 108.511 45.4524 106.238 53.1188 106.238H169.406C171.298 106.201 173.103 105.433 174.441 104.094C175.779 102.756 176.547 100.952 176.584 99.0594C176.584 97.1556 175.828 95.3298 174.482 93.9836C173.136 92.6375 171.31 91.8812 169.406 91.8812H53.1188C42.6129 91.8812 32.343 94.9965 23.6076 100.833C14.8723 106.67 8.06389 114.966 4.04345 124.672C0.0230176 134.378-1.02891 145.059 1.02069 155.363C3.07029 165.667 8.12938 175.132 15.5582 182.561C22.987 189.989 32.4518 195.049 42.7559 197.098C53.0599 199.148 63.7403 198.096 73.4465 194.075C83.1527 190.055 91.4487 183.247 97.2855 174.511C103.122 165.776 106.238 155.506 106.238 145V120.594ZM99.0594 84.703C100.952 84.6662 102.756 83.8981 104.095 82.5598C105.433 81.2216 106.201 79.417 106.238 77.5247V53.1188C106.238 42.8384 110.322 32.979 117.591 25.7097C124.86 18.4403 134.72 14.3564 145 14.3564C155.28 14.3564 165.14 18.4403 172.409 25.7097C179.679 32.979 183.762 42.8384 183.762 53.1188V169.406C183.762 171.31 184.519 173.136 185.865 174.482C187.211 175.828 189.037 176.584 190.941 176.584C192.833 176.547 194.637 175.779 195.976 174.441C197.314 173.103 198.082 171.298 198.119 169.406V53.1188C198.119 46.1431 196.745 39.2358 194.075 32.7911C191.406 26.3464 187.493 20.4907 182.561 15.5581C177.628 10.6256 171.772 6.71289 165.328 4.04342C158.883 1.37395 151.976 0 145 0C138.024 0 131.117 1.37395 124.672 4.04342C118.228 6.71289 112.372 10.6256 107.439 15.5581C102.507 20.4907 98.5941 26.3464 95.9246 32.7911C93.2552 39.2358 91.8812 46.1431 91.8812 53.1188V77.5247C91.8812 79.4285 92.6375 81.2543 93.9837 82.6005C95.3298 83.9467 97.1556 84.703 99.0594 84.703Z" fill="#8C5AE2"/>
            </svg>
            <span className={styles.logoText}>Foldhealth</span>
          </div>

          {/* Welcome text */}
          <div className={styles.welcome}>
            <h1 className={styles.welcomeTitle}>
              <span className={styles.welcomePurple}>Welcome </span>
              <span className={styles.welcomeDark}>Back!</span>
            </h1>
            <p className={styles.welcomeSub}>Sign in to access your Fold Portal</p>
          </div>

          {/* Login form */}
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@fold.health"
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <button type="button" className={styles.forgotLink} onClick={() => {}}>
                  Forgot Password?
                </button>
              </div>
              <div className={styles.passwordWrap}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                  <Icon name={showPassword ? 'solar:eye-linear' : 'solar:eye-closed-linear'} size={16} color="#8A94A8" />
                </button>
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                <Icon name="solar:danger-triangle-linear" size={14} color="var(--status-error)" />
                {error}
              </div>
            )}

            <Button variant="primary" size="XL" fullWidth disabled={loading} onClick={handleLogin}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>or continue with</span>
            <span className={styles.dividerLine} />
          </div>

          {/* OAuth buttons */}
          <div className={styles.oauthRow}>
            <button className={styles.oauthBtn} onClick={() => handleOAuthLogin('google')} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className={styles.oauthBtn} onClick={() => handleOAuthLogin('azure')} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
              Microsoft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
