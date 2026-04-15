import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            navigate('/main');
        }
    }, [navigate]);

    return (
        <div className="landing-page">
            <nav className="navbar navbar-expand-lg landing-navbar">
                <div className="container py-2">
                    <a className="navbar-brand d-flex align-items-center gap-3 fw-semibold" href="#">
                        <img
                            src="/images/bcit-logo.png"
                            alt="BCIT Logo"
                            className="brand-logo"
                        />
                        <span className="brand-text">BCIT Lost &amp; Found</span>
                    </a>

                    <div className="d-flex align-items-center gap-2">
                        <Link to="/signin" className="btn btn-light nav-btn">
                            Sign In
                        </Link>

                        <Link to="/signup" className="btn btn-primary nav-btn nav-btn-primary">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <div className="hero-copy">
                                <div className="hero-badge">AI-powered campus recovery</div>

                                <h1 className="hero-title">
                                    Find your lost items faster at <span>BCIT</span>
                                </h1>

                                <p className="hero-subtitle">
                                    Describe what you lost, chat with AI, and get matched with
                                    possible items reported to Lost &amp; Found without exposing
                                    sensitive details publicly.
                                </p>

                                <div className="d-flex flex-wrap gap-3 mt-4">
                                    <Link to="/signin" className="btn btn-primary hero-btn-primary">
                                        Get Started
                                    </Link>
                                    <a href="#how-it-works" className="btn btn-outline-primary hero-btn-secondary">
                                        How It Works
                                    </a>
                                </div>

                                <div className="hero-stats mt-5">
                                    <div className="stat-card">
                                        <h3>AI Matching</h3>
                                        <p>Find likely matches using item details and chat.</p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Privacy First</h3>
                                        <p>Only general item info is shown to prevent false claims.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="hero-visual-wrap">
                                <div className="hero-glow"></div>

                                <div className="phone-card main-card">
                                    <div className="card-header-mini">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>

                                    <div className="chat-preview">
                                        <div className="chat-bubble user-bubble">
                                            I lost a black wallet near the library this afternoon.
                                        </div>
                                        <div className="chat-bubble ai-bubble">
                                            I found 2 possible matches. One black wallet was reported
                                            near SE14 around 3 PM.
                                        </div>
                                        <div className="match-card">
                                            <div className="match-pill">Possible Match</div>
                                            <h4>Black Wallet</h4>
                                            <p>Location: Library area</p>
                                            <p>Time: Afternoon</p>
                                            <p>Status: In Lost &amp; Found</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="floating-card top-card">
                                    <p className="floating-label">Campus-wide</p>
                                    <h5>Safe item discovery</h5>
                                </div>

                                <div className="floating-card bottom-card">
                                    <p className="floating-label">Student-friendly</p>
                                    <h5>Simple chat-based search</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="features-section">
                <div className="container">
                    <div className="section-heading text-center">
                        <p className="section-tag">Why use it</p>
                        <h2>A smarter campus Lost &amp; Found experience</h2>
                        <p>
                            Built for students who want a faster, clearer way to recover
                            personal belongings.
                        </p>
                    </div>

                    <div className="row g-4 mt-2">
                        <div className="col-md-4">
                            <div className="feature-card">
                                <div className="feature-icon">01</div>
                                <h3>Describe your item</h3>
                                <p>
                                    Tell the system what you lost, where you think it happened,
                                    and when it was last seen.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-card">
                                <div className="feature-icon">02</div>
                                <h3>Get AI-assisted matches</h3>
                                <p>
                                    The platform compares your description with reported items and
                                    suggests likely matches.
                                </p>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="feature-card">
                                <div className="feature-icon">03</div>
                                <h3>Verify safely</h3>
                                <p>
                                    Only limited public details are shown, helping reduce false
                                    claims while keeping the process simple.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div className="container">
                    <div className="cta-card text-center">
                        <p className="section-tag mb-2">Ready to begin?</p>
                        <h2>Let AI help you reconnect with what you lost.</h2>
                        <p>
                            Start by signing in and describing your item.
                        </p>
                        <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
                            <Link to="/signin" className="btn btn-primary hero-btn-primary">
                                Sign In
                            </Link>

                            <Link to="/signup" className="btn btn-light cta-secondary-btn">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LandingPage;