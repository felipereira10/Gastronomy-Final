import PlateCard from '../plateCard/plateCard.jsx';
import styles from '../plateCard/plateCard.module.css';

export default function PlateGrid({ plates }) {
  if (!plates || !Array.isArray(plates)) return <p>Loading...</p>;

  return (
    <div className={styles.cardList}>
      {plates.map(plate => (
        <PlateCard key={plate._id} plateData={plate} />
      ))}
    </div>
  );
}
