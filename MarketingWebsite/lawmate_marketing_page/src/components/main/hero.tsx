import React from 'react';
import '../../styles/hero.css';
import StatItem from "../statItem";

interface Stat {
  number: string;
  label: string;
  style?: React.CSSProperties;
  numberClassName?: string;
  labelClassName?: string;
  delay?: number;
}

const Hero: React.FC = () => {
  const stats: Stat[] = [
    { number: "500+", label: "Verified Lawyers", delay: 0, style: { '--stat-number-color': '#0f172a' } as React.CSSProperties },
    { number: "10,000+", label: "Cases Resolved", delay: 200, style: { '--stat-number-color': '#0f172a' } as React.CSSProperties },
    { number: "98%", label: "Client Satisfaction", delay: 400, style: { '--stat-number-color': '#0f172a' } as React.CSSProperties },
    { number: "24/7", label: "Support Available", delay: 600, style: { '--stat-number-color': '#0f172a' } as React.CSSProperties }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero-section">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Your Perfect
              <span className="gradient-text"> Legal Match</span>
            </h1>
            <p className="hero-description">
              Connect with verified lawyers across Sri Lanka. Get expert legal help for your case in minutes, not days.
            </p>

            <div className="app-store-buttons">
              <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="store-button">
                <div className="store-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </div>
                <div className="store-text">
                  <div className="store-download">Download on the</div>
                  <div className="store-name">App Store</div>
                </div>
              </a>
              <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="store-button">
                <div className="store-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                </div>
                <div className="store-text">
                  <div className="store-download">GET IT ON</div>
                  <div className="store-name">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          <div className="hero-card-container">
            <div className="hero-card">
              <div className="card-header">
                <div>
                  <div className="badge">
                    🎯 Sri Lanka's Trusted Legal Platform
                  </div>
                </div>
              </div>
              <div className="card-features">
                <div className="feature-item blue">
                  <span className="check">✓</span>
                  <span>Verified Professionals</span>
                </div>
                <div className="feature-item purple">
                  <span className="check">✓</span>
                  <span>Instant Matching</span>
                </div>
                <div className="feature-item green">
                  <span className="check">✓</span>
                  <span>Secure Platform</span>
                </div>
              </div>
              <button className="btn-primary full-width" onClick={() => scrollToSection('contact')}>
                Get in Touch
              </button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <StatItem
              key={i}
              number={s.number}
              label={s.label}
              delay={s.delay}
              style={s.style}
              numberClassName={s.numberClassName}
              labelClassName={s.labelClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
