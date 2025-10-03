import './home.css';
import { FaUtensils, FaLeaf, FaSmile, FaWineGlassAlt, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ChatWidget from '../../components/Chat/ChatWidget.jsx';

export default function Home() {
  return (
    <div className="home-wrapper">
      {/* Título */}
      <motion.h1
        className="home-title"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to My Gastronomy
      </motion.h1>

      {/* Cards principais */}
      <div className="card-container">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FaUtensils className="card-icon" />
          <h2>Established in 2006</h2>
          <p>
            A culinary journey that blends tradition with innovation, offering dishes that delight all senses.
          </p>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FaLeaf className="card-icon" />
          <h2>Signature Cuisine</h2>
          <p>
            Fresh ingredients, creative chefs, and unique recipes crafted to deliver unforgettable flavors.
          </p>
        </motion.div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <FaSmile className="card-icon" />
          <h2>Unforgettable Experience</h2>
          <p>
            A cozy, elegant space designed to turn each meal into a memorable moment with friends and family.
          </p>
        </motion.div>
      </div>

      {/* Nova seção: Destaques */}
      <motion.section
        className="specialties"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2>Our Specialties</h2>
        <div className="specialties-container">
          <div className="specialty">
            <FaWineGlassAlt className="specialty-icon" />
            <h3>Fine Wines</h3>
            <p>Exclusive wine selection curated to pair with every dish.</p>
          </div>
          <div className="specialty">
            <FaUtensils className="specialty-icon" />
            <h3>Chef’s Specials</h3>
            <p>Unique seasonal dishes prepared with passion and precision.</p>
          </div>
        </div>
      </motion.section>

      {/* Nova seção: Localização / Contato */}
      <motion.section
        className="contact-home"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="contact-home">
          <h2>Visit Us</h2>
          <div className="contact-info">
            <p><FaUtensils /> Av. Paulista, 1000 - São Paulo</p>
            <p><FaLeaf /> Open: Mon-Sun, 10:00 - 23:00</p>
            <p><FaSmile /> Phone: (11) 99999-9999</p>
          </div>
          <a href="mailto:reservas@mygastronomy.com" className="contact-btn">
            Reserve a Table
          </a>
        </div>
      </motion.section>

      {/* Componente Chat Widget - Flutuante no canto */}
      <ChatWidget />
    </div>

  );
}