import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!token || !user) {
      navigate('/signin');
    }
  }, [token, user, navigate]);

  return (
    <>
      <Header />

      <div className="auth-page d-flex justify-content-center align-items-center">
        <div className="auth-card text-center">
          <img
            src="/images/bcit-logo.png"
            alt="BCIT Logo"
            className="brand-logo mb-3"
          />

          <h1 className="auth-title">BCIT Lost &amp; Found</h1>
          <p className="auth-subtitle">Main Page</p>

          <div className="mt-4">
            <p className="text-muted mb-2">
              Welcome{user?.first_name ? `, ${user.first_name}` : ''}.
            </p>
            <p className="text-muted mb-0">
              This is the temporary main page for the student portal.
            </p>
          </div>

          <div className="mt-4 p-3 rounded-3 bg-light border">
            <p className="mb-0 text-secondary">
              AI chat, matched item list, and other student features will be added here later.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default MainPage;