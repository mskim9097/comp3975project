import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ItemsListPage() {
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

          <h1 className="auth-title">Items List</h1>
          <p className="auth-subtitle">This page will show matched lost items later.</p>

          <div className="mt-4 p-3 rounded-3 bg-light border">
            <p className="mb-0 text-secondary">
              Placeholder page for the student item list.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ItemsListPage;