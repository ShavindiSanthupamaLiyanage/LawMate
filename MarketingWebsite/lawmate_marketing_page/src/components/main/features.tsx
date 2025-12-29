import React from 'react';
import '../../styles/features.css';
import { Analytics, Books, Calendar, Clipboard, Lawyer, Notification, Shield, Clock } from "../../components/featuresIcon/featuresIcon.tsx";


interface Feature {
    icon: string;
    title: string;
    description: string;
}

const Features: React.FC = () => {
    const features: Feature[] = [
        {
            icon: Lawyer,
            title: "Find Expert Lawyers",
            description: "Connect with verified legal professionals specialized in your case type"
        },
        {
            icon: Clock,
            title: "Quick Response",
            description: "Get responses within 24 hours and schedule consultations instantly"
        },
        {
            icon: Shield,
            title: "Secure & Confidential",
            description: "Your information is protected with bank-level encryption"
        },
        {
            icon: Clipboard,
            title: "Case Management",
            description: "Track your case progress and documents in one convenient place"
        },
        {
            icon: Calendar,
            title: "Calendar Integration",
            description: "Schedule appointments and never miss important court dates"
        },
        {
            icon: Notification,
            title: "Smart Alerts",
            description: "Get timely reminders for deadlines, hearings, and appointments"
        },
        {
            icon: Books,
            title: "Legal Hub",
            description: "Access legal resources, templates, and knowledge base"
        },
        {
            icon: Analytics,
            title: "Personalized Dashboard",
            description: "Manage your cases, documents, and communications in one place"
        }
    ];

    return (
        <section id="features" className="features-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Why Choose LawMate?</h2>
                    <p className="section-subtitle">Everything you need to find and hire the right lawyer</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, idx) => (
                        <div key={idx} className="feature-card">
                            <div className="feature-icon"><img className="img" src={feature.icon} /></div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>

                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;