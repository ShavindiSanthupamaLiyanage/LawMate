import React from 'react';
import '../../styles/footer.css';
import bwlogo from "../../assets/logowhite.png";

const Footer: React.FC = () => {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Brand Section */}
                    <div className="footer-section footer-logo-section">
                        <div className="footer-logo">
                            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className="footer-logo" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                                <img src={bwlogo} alt="LawMate Logo" className="logo-icon" />
                            </a>
                        </div>
                        <p className="footer-description">
                            Connecting Sri Lanka with Legal Excellence. Your trusted platform for finding the right legal representation.
                        </p>
                        <div className="footer-social">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h3 className="footer-section-title">Quick Links</h3>
                        <div className="footer-links">
                            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className="footer-link">Home</a>
                            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="footer-link">Features</a>
                            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} className="footer-link">How It Works</a>
                            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="footer-link">About Us</a>
                            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="footer-link">Contact Us</a>
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="footer-section">
                        <h3 className="footer-section-title">Legal</h3>
                        <div className="footer-links">
                            <a href="" className="footer-link">Privacy Policy</a>
                            <a href="" className="footer-link">Terms of Service</a>
                            <a href="" className="footer-link">Cookie Policy</a>
                            <a href="" className="footer-link">Disclaimer</a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-section">
                        <h3 className="footer-section-title">Get in Touch</h3>
                        <div className="contact-info">
                            <div className="contact-item">
                                <svg className="contact-icon" fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>lawmate.infodesk@gmail.com</span>
                            </div>
                            <div className="contact-item">
                                <svg className="contact-icon" fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>+94 11 234 5678</span>
                            </div>
                            <div className="contact-item">
                                <svg className="contact-icon" fill="none" stroke="white" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Colombo, Sri Lanka</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <div className="footer-text">
                        © 2025 LawMate. All rights reserved.
                    </div>
                    <div className="footer-legal-links">
                        <a href="" className="footer-legal-link">Privacy</a>
                        <a href="" className="footer-legal-link">Terms</a>
                        <a href="" className="footer-legal-link">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;