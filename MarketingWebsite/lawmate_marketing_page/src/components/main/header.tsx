import React, { useState, useEffect } from 'react';
import '../../styles/header.css';
import logo from "../../assets/logo.png";

const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);

            const sections = ['home', 'features', 'how-it-works', 'about', 'contact'];
            const current = sections.find(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top <= 100 && rect.bottom >= 100;
                }
                return false;
            });
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <nav className="navbar">
                <div className="nav-content">
                    <div className="logo">
                        <img src={logo} alt="Logo" className="logo-icon" />
                    </div>

                    <div className="nav-links desktop-nav">
                        {['home', 'features', 'how-it-works', 'about', 'contact'].map((section) => (
                            <button
                                key={section}
                                onClick={() => scrollToSection(section)}
                                className={`nav-link ${activeSection === section ? 'active' : ''}`}
                            >
                                {section === 'how-it-works' ? 'How It Works' : section.charAt(0).toUpperCase() + section.slice(1)}
                            </button>
                        ))}
                        <button className="btn-primary" onClick={() => scrollToSection('contact')}>Get Started</button>
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        {['home', 'features', 'how-it-works', 'about', 'contact'].map((section) => (
                            <button
                                key={section}
                                onClick={() => scrollToSection(section)}
                                className="mobile-nav-link"
                            >
                                {section === 'how-it-works' ? 'How It Works' : section.charAt(0).toUpperCase() + section.slice(1)}
                            </button>
                        ))}
                        <button className="btn-primary" onClick={() => scrollToSection('contact')}>Get Started</button>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;