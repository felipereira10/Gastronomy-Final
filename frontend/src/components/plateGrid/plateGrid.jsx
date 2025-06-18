import PlateCard from '../plateCard/plateCard.jsx';
import styles from '../plateCard/plateCard.module.css';

export default function PlateGrid({ plates, onPlateSelect }) {
  return (
    <div className={styles.cardList}>
      {plates.map(plate => (
        <div
          key={plate._id}
          className={styles.cardContainer}
          onClick={() => onPlateSelect(plate)}
        >
          <PlateCard plateData={plate} />
        </div>
      ))}
    </div>
  );
}
