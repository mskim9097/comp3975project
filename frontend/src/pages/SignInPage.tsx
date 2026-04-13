import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            navigate('/main');
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Login failed.');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/main');

        } catch (error) {
            setError('Something went wrong.');
            console.error(error);
        }
    };

    return (
        <div className="auth-page d-flex justify-content-center align-items-center">
            <div className="auth-card text-center">

                {/* Logo */}
                <img
                    src="/images/bcit-logo.png"
                    alt="BCIT Logo"
                    className="brand-logo mb-3"
                />

                {/* Title */}
                <h1 className="auth-title">BCIT Lost &amp; Found</h1>
                <p className="auth-subtitle">Sign in to your account</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 text-start">

                    {error && (
                        <div className="alert alert-danger mb-3">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-3">
                        <label className="form-label text-primaryLight fw-semibold">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control custom-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-3">
                        <label className="form-label text-primaryLight fw-semibold">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control custom-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Button */}
                    <button type="submit" className="btn btn-primary w-100 auth-btn">
                        Log in
                    </button>
                </form>

                {/* Bottom link */}
                <p className="mt-4 text-muted">
                    Don’t have an account?{' '}
                    <Link to="/signup" className="text-primary fw-semibold">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignInPage;