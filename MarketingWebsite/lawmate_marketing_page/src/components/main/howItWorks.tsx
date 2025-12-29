import React, { useState } from 'react';
import '../../styles/howItWorks.css';

interface Step {
    number: string;
    title: string;
    desc: string;
}

const HowItWorks: React.FC = () => {
    const [activeWorkflow, setActiveWorkflow] = useState<'client' | 'lawyer'>('client');

    const clientSteps: Step[] = [
        { number: "01", title: "Create Account", desc: "Create an account to get the help to resolve your legal case." },
        { number: "02", title: "Chat with Lawly", desc: "Get the help of chatbot to identify the law area" },
        { number: "03", title: "Make Appointments", desc: "Search for lawyers and book sessions to get the legal help." }
    ];

    const lawyerSteps: Step[] = [
        { number: "01", title: "Create Account", desc: "Sign up with your professional details and credentials" },
        { number: "02", title: "Connect with Clients", desc: "Start receiving case requests and build your practice" },
        { number: "03", title: "Share your Insights", desc: "Share your articles in Knowledge Hub" }
    ];

    return (
        <section id="how-it-works" className="how-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Simple steps to get started</p>
                </div>

                <div className="workflow-tabs">
                    <button
                        className={`workflow-tab ${activeWorkflow === 'client' ? 'active' : ''}`}
                        onClick={() => setActiveWorkflow('client')}
                    >
                        <span className="tab-icon">👤</span>
                        For Clients
                    </button>
                    <button
                        className={`workflow-tab ${activeWorkflow === 'lawyer' ? 'active' : ''}`}
                        onClick={() => setActiveWorkflow('lawyer')}
                    >
                        <span className="tab-icon">⚖️</span>
                        For Lawyers
                    </button>
                </div>

                {activeWorkflow === 'client' && (
                    <div className="steps-grid">
                        {clientSteps.map((step, idx) => (
                            <div key={idx} className="step-card">
                                <div className="step-number">{step.number}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.desc}</p>
                                {idx < clientSteps.length - 1 && <div className="step-arrow">
                                    {/*→*/}
                                </div>}
                            </div>
                        ))}
                    </div>
                )}

                {activeWorkflow === 'lawyer' && (
                    <div className="steps-grid">
                        {lawyerSteps.map((step, idx) => (
                            <div key={idx} className="step-card">
                                <div className="step-number">{step.number}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.desc}</p>
                                {idx < lawyerSteps.length - 1 && <div className="step-arrow">
                                    {/*→*/}
                                </div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HowItWorks;