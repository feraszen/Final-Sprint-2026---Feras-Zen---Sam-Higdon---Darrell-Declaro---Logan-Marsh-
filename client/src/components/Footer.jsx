import { FaFacebook, FaInstagram } from "react-icons/fa";
import { SiX } from "react-icons/si";

function Footer() {
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <footer className="footer">
      <div className="container footer-content">
        
        {/* LEFT: Social Icons */}
        <div className="footer-left">
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
            <FaFacebook />
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
          <a href="https://www.x.com" target="_blank" rel="noreferrer">
            <SiX />
          </a>
        </div>

        {/* CENTER: Copyright */}
        <div className="footer-center">
          © 2026 KeyTop Fresh. All Rights Reserved.
        </div>

        {/* RIGHT: Back to Top */}
        <div className="footer-right">
          <button onClick={scrollToTop} className="back-to-top">
            ↑ Top
          </button>
        </div>

      </div>
    </footer>
  );
}

export default Footer;

