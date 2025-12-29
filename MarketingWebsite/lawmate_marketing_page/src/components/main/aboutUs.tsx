import React, { useState, useEffect } from 'react';
import '../../styles/aboutUs.css';
import shavindiPhoto from './../../assets/shavindi.jpg';
import pasinduPhoto from './../../assets/pasidu.png';
import gihanPhoto from './../../assets/gihan.jpg';
import isharaPhoto from './../../assets/ishara.jpg'
import devindiPhoto from './../../assets/devindi.jpg';
import benuriPhoto from './../../assets/benuri.jpg';

interface TeamMember {
    name: string;
    designation: string;
    image: string;
    github?: string;
    linkedin?: string;
}

const AboutUs: React.FC = () => {
    const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    const teamMembers: TeamMember[] = [
        {
            name: "Gihan Kanishka",
            designation: "Project Manager",
            image: gihanPhoto,
            github: "https://github.com/Gihanks",
            linkedin: "https://www.linkedin.com/in/gihanks?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app "
        },
        {
            name: "Devindi Nimalrathna",
            designation: "Business Analyst",
            image: devindiPhoto,
            github: "https://github.com/NelunikaNimalrathna",
            linkedin: "https://www.linkedin.com/in/devindinimalrathna/?originalSubdomain=lk"
        },
        {
            name: "Shavindi Liyanage",
            designation: "Full Stack Developer",
            image: shavindiPhoto,
            github: "https://github.com/ShavindiSanthupamaLiyanage",
            linkedin: "https://www.linkedin.com/in/shavindi-liyanage-782b26282?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
        },
        {
            name: "Namal Ishara",
            designation: "Full Stack Developer",
            image: isharaPhoto,
            github: "https://github.com/NamalIshara",
            linkedin: "https://www.linkedin.com/in/ishara-namal-04a917269?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
        },
        {
            name: "Pasindu Kaushalya",
            designation: "Full Stack Developer",
            image: pasinduPhoto,
            github: "https://github.com/dragonrator",
            linkedin: "https://www.linkedin.com/in/pasindu-kaushalya-134b25282"
        },
        {
            name: "Benuri Palihakkara",
            designation: "Quality Assurance Engineer",
            image: benuriPhoto,
            github: "https://github.com/BenuriChathurya",
            linkedin: "https://www.linkedin.com/in/benuri-chathurya-935b03289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
        }
    ];

    useEffect(() => {
        if (!isAutoRotating) return;

        const interval = setInterval(() => {
            setCurrentMemberIndex((prev) => (prev + 1) % teamMembers.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isAutoRotating, teamMembers.length]);

    const nextMember = () => {
        setIsAutoRotating(false);
        setCurrentMemberIndex((prev) => (prev + 1) % teamMembers.length);
        setTimeout(() => setIsAutoRotating(true), 5000);
    };

    const prevMember = () => {
        setIsAutoRotating(false);
        setCurrentMemberIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
        setTimeout(() => setIsAutoRotating(true), 5000);
    };

    const getCardPosition = (index: number) => {
        const diff = (index - currentMemberIndex + teamMembers.length) % teamMembers.length;

        if (diff === 0) return 'position-center';
        if (diff === 1 || diff === -(teamMembers.length - 1)) return 'position-right';
        if (diff === teamMembers.length - 1 || diff === -1) return 'position-left';
        return 'position-hidden';
    };

    return (
        <section id="about" className="about-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">About Us</h2>
                    <p className="section-subtitle">Meet the team behind LawMate</p>
                </div>

                <div className="about-content">
                    <p className="about-description">
                        LawMate revolutionizes how Sri Lankans access legal services. Our platform combines technology
                        with expertise to deliver exceptional legal connections. We're committed to making legal assistance
                        accessible, affordable, and efficient for everyone.
                    </p>

                    <div className="team-carousel-wrapper">
                        <button className="carousel-nav prev" onClick={prevMember} aria-label="Previous">
                            ‹
                        </button>

                        <div className="team-carousel">
                            <div className="team-carousel-track">
                                {teamMembers.map((member, idx) => (
                                    <div key={idx} className={`team-card ${getCardPosition(idx)}`}>
                                        <div className="team-image-wrapper">
                                            <img src={member.image} alt={member.name} className="team-image" />
                                            <div className="team-image-overlay">
                                                <div className="overlay-name">{member.name}</div>
                                                <div className="overlay-designation">{member.designation}</div>
                                            </div>
                                        </div>
                                        <h3 className="team-name">{member.name}</h3>
                                        <p className="team-designation">{member.designation}</p>

                                        <div className="team-social-links">
                                            {member.github && (
                                                <a
                                                    href={member.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="team-social-link github"
                                                    aria-label="GitHub"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="team-social-link linkedin"
                                                    aria-label="LinkedIn"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="carousel-nav next" onClick={nextMember} aria-label="Next">
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
