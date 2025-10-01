import { Dialog } from "@mui/material"
import styles from './platePopup.module.css'

export default function PlatePopup({ plateData, onClose, onAddToCart }) {

    return (
        <Dialog
            open={true}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                style: {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    margin: 0,
                    width: "100%",
                    overflowX: "hidden",
                }
            }}
        >
            <div className={styles.popupContainer}>
                <img src={plateData.imgUrl} alt="" />
                <div className={styles.popupContent}>
                    <h2>{plateData.name}</h2>
                    <p className={styles.ingredients}>[{String(plateData.ingredients)}]</p>
                    <p>{plateData.description}</p>
                    <h2 className={styles.price}>$ {plateData.price}</h2>
                    <button className={styles.platesBtn} onClick={() => { onAddToCart(plateData) }}>Add to cart</button>
                </div>
            </div>
        </Dialog>

    )
}