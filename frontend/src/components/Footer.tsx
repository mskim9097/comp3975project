import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

function Footer() {
  return (
    <footer className="student-footer">
      <div className="container py-4">
        <div className="row align-items-center g-3">
          <div className="col-md-6">
            <h5 className="footer-title mb-1">BCIT Lost &amp; Found</h5>
            <p className="footer-text mb-0">
              Helping students reconnect with lost belongings through a simple and secure experience.
            </p>
          </div>

          <div className="col-md-6">
            <div className="d-flex flex-wrap justify-content-md-end gap-3">
              <a href="#" className="footer-link">Contact</a>
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
            </div>
          </div>
        </div>

        <div className="footer-divider my-3"></div>

        <p className="footer-copy mb-0 text-center text-md-start">
          © 2026 BCIT Lost &amp; Found. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;