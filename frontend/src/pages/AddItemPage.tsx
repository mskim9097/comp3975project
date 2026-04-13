import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AddItemPage() {
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

          <h1 className="auth-title">Add Item</h1>
          <p className="auth-subtitle">Register a lost item</p>

          <div className="mt-4 p-3 rounded-3 bg-light border">
            <p className="mb-0 text-secondary">
              Item registration form will be added here.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default AddItemPage;