import React, { useEffect, useMemo, useState } from 'react';
import './AuthLayout.css';

const AuthLayout = ({ headingMain, headingAccent, description, children, smallBullets = [] }) => {
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: `${7 + Math.random() * 8}s`,
        delay: `${Math.random() * 4}s`,
      })),
    []
  );

  useEffect(() => setMounted(true), []);

  return (
    <div className="auth-page">
      <div className="auth-page__mesh" />
      <div className="auth-page__orb auth-page__orb--one" />
      <div className="auth-page__orb auth-page__orb--two" />

      <div className="auth-page__particles" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="auth-page__particle"
            style={{
              left: particle.left,
              top: particle.top,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className={`auth-shell ${mounted ? 'auth-shell--mounted' : ''}`}>
        <section className="auth-hero">
          <div className="auth-hero__logo" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="white" />
            </svg>
          </div>
          <h1 className="auth-hero__title">
            {headingMain}
            <span>{headingAccent}</span>
          </h1>
          <p className="auth-hero__description">{description}</p>
          {smallBullets.length > 0 && (
            <div className="auth-hero__chips">
              {smallBullets.map((bullet, index) => (
                <span key={`${bullet}-${index}`} className="auth-chip">
                  {bullet}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="auth-card">{children}</section>
      </div>
    </div>
  );
};

export default AuthLayout;
