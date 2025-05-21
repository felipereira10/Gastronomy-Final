import './home.css';
import { FaUtensils, FaLeaf, FaSmile } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="home-wrapper">
      <motion.h1 
        className="home-title"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to My Gastronomy
      </motion.h1>

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
    </div>
  );
}
