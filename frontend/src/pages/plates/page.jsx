import platesServices from "../../services/plates";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading/Loading.jsx";
// import PlateCard from "../../components/plateCard/plateCard";
import PlateGrid from "../../components/plateGrid/plateGrid.jsx";
import styles from './page.module.css';
import PlatePopup from "../../components/platePopup/platePopup.jsx";
import { useCartContext } from "../../contexts/useCartContext.jsx";

export default function Plates() {

    const { getAvailablePlates, platesList, platesLoading, refetchPlates } = platesServices()
    const [plateSelected, setPlateSelected] = useState(null)
    const { addToCart } = useCartContext()

    useEffect(() => {
        if(refetchPlates) {
            getAvailablePlates()
        }
    }, [refetchPlates])

    const handlePlateSelected = (plate) => {
        setPlateSelected(plate)
    }

    const handleClosePopup = () => {
        setPlateSelected(null)
    }

    const handleAddToCart = (itemToAdd) => {
        addToCart(itemToAdd)
        handleClosePopup()
    }

    if(platesLoading) {
        return <Loading />;
    }

    if (platesLoading) {
        return <Loading />;
    }

    return (
        <>
        {/* Renderize o grid UMA vez, passando a lista e a função de seleção */}
        <PlateGrid plates={platesList} onPlateSelect={handlePlateSelected} />

        {plateSelected && (
            <PlatePopup
            plateData={plateSelected}
            onClose={handleClosePopup}
            onAddToCart={handleAddToCart}
            />
        )}
        </>
    );
    }