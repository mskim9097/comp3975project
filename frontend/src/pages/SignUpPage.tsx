import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function SignUpPage() {
    const [studentId, setStudentId] = useState('A0');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            navigate('/main');
        }
    }, [navigate]);

    const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        if (!value.startsWith('A0')) {
            value = 'A0';
        }

        const numbers = value.slice(2).replace(/\D/g, '');

        const trimmed = numbers.slice(0, 7);

        setStudentId('A0' + trimmed);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        student_id: studentId,
                        first_name: firstName,
                        last_name: lastName,
                        email,
                        password,
                        password_confirmation: confirmPassword,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Signup failed.');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/main');

        } catch (error) {
            console.error(error);
            setError('Something went wrong.');
        }
    };

    return (
        <div className="auth-page d-flex justify-content-center align-items-center">
            <div className="auth-card text-center">
                <img
                    src="/images/bcit-logo.png"
                    alt="BCIT Logo"
                    className="brand-logo mb-3"
                />

                <h1 className="auth-title">BCIT Lost &amp; Found</h1>
                <p className="auth-subtitle">Create your account</p>

                <form onSubmit={handleSubmit} className="mt-4 text-start">
                    {error && (
                        <div className="alert alert-danger mb-3">
                            {error}
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label text-primaryLight fw-semibold">
                            Student ID
                        </label>
                        <input
                            type="text"
                            className="form-control custom-input"
                            value={studentId}
                            onChange={handleStudentIdChange}
                            placeholder="A01234567"
                            maxLength={9}
                            required
                        />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label text-primaryLight fw-semibold">
                                First Name
                            </label>
                            <input
                                type="text"
                                className="form-control custom-input"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label text-primaryLight fw-semibold">
                                Last Name
                            </label>
                            <input
                                type="text"
                                className="form-control custom-input"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

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

                    <div className="mb-3">
                        <label className="form-label text-primaryLight fw-semibold">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="form-control custom-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 auth-btn">
                        Create Account
                    </button>
                </form>

                <p className="mt-4 text-muted">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-primary fw-semibold">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignUpPage;