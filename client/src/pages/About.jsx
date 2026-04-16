import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Navbar />

      <section className="menu-hero">
        <div className="container">
          <h1>About KeyTop Fresh</h1>
          <p>Fresh flavors. Family atmosphere. Real ingredients.</p>
        </div>
      </section>

      <main className="container">
        <section className="about-section">
          <h2>Our Story</h2>
          <p><center>
            KeyTop Fresh was created with one simple idea, bring fresh,
            healthy, and delicious drinks to families in St. John's.
          </center></p>
          <p><center>
            We focus on quality ingredients, vibrant flavors, and a welcoming
            atmosphere where everyone feels at home.
          </center></p>
        </section>

        <section className="about-section">
          <h2>Meet Our Team</h2>

          <div className="team-grid">
            <div className="team-card">
              <h3>Darrell Declaro</h3>
              <p>Co-Founder</p>
            </div>

            <div className="team-card">
              <h3>Sam Higdon</h3>
              <p>Co-Founder</p>
            </div>

            <div className="team-card">
              <h3>Feras Zen</h3>
              <p>Co-Founder</p>
            </div>

            <div className="team-card">
              <h3>Logan Marsh</h3>
              <p>Co-Founder</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Our Location</h2>
          <p>
            Avalon Mall <br />
            48 Kenmount Rd, St. John's, NL A1B 1W3
          </p>

          <div className="map-container">
            <iframe
              title="KeyTop Fresh Location"
              src="https://maps.google.com/maps?q=Avalon%20Mall%2048%20Kenmount%20Rd%20St.%20John%27s%20NL%20A1B%201W3&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              loading="lazy"
            ></iframe>
          </div>
        </section>
      </main>
    </>
  );
}

export default About;
