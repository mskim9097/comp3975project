import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <nav className="navbar navbar-expand-lg student-navbar">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-semibold" to="/main">
          <img
            src="/images/bcit-logo.png"
            alt="BCIT Logo"
            className="brand-logo"
          />
          <span className="brand-text">BCIT Lost &amp; Found</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#studentNavbar"
          aria-controls="studentNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="studentNavbar">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link student-nav-link" to="/items">
                Items List
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link student-nav-link" to="/add-item">
                Add Item
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link student-nav-link" href="#">
                Contact Us
              </a>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className="btn btn-primary student-logout-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;