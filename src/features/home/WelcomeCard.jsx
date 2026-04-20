import { useEffect, useState } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { supabase } from '../../lib/supabase';
import styles from './HomeView.module.css';

function greetingFor(hour) {
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

function formatTime(date) {
  let h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}.${m} ${ampm}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function sunriseTime() {
  return '08:10 AM';
}

export function WelcomeCard({ dragHandleClassName }) {
  const [now, setNow] = useState(() => new Date());
  const [firstName, setFirstName] = useState('there');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const meta = data?.session?.user?.user_metadata || {};
      const name =
        meta.first_name ||
        (meta.full_name ? meta.full_name.split(' ')[0] : null) ||
        (data?.session?.user?.email ? data.session.user.email.split('@')[0] : null);
      if (name) setFirstName(name.charAt(0).toUpperCase() + name.slice(1));
    });
  }, []);

  const greeting = greetingFor(now.getHours());

  return (
    <div className={[styles.welcomeCard, dragHandleClassName].filter(Boolean).join(' ')}>
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeGreeting}>{greeting}, {firstName}</div>
        <button className={styles.welcomeLocation} type="button">
          <Icon name="solar:map-point-linear" size={14} />
          Rajshahi, Bangladesh
          <Icon name="solar:alt-arrow-down-linear" size={12} />
        </button>
      </div>
      <div className={styles.welcomeClock}>
        <div className={styles.welcomeTime}>{formatTime(now)}</div>
        <div className={styles.welcomeDate}>
          {formatDate(now)}
          <span className={styles.welcomeDateSep}>|</span>
          {sunriseTime()}
        </div>
      </div>
      <div className={styles.welcomeWeather}>
        <div className={styles.welcomeWeatherBody}>
          <div className={styles.welcomeWeatherLabel}>Weather Forecast</div>
          <div className={styles.welcomeWeatherMain}>Partly Cloudy</div>
          <div className={styles.welcomeWeatherDesc}>Isolated thunderstorms, Precipitation: 30%</div>
        </div>
        <Icon name="meteocons:partly-cloudy-day-rain-fill" size={64} className={styles.welcomeWeatherIcon} />
      </div>
    </div>
  );
}
