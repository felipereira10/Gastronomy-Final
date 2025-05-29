import Navbar from "./components/navbar/navbar"
import { Outlet } from "react-router-dom"
import Footer from "./components/footer/footer"
import { CartProvider } from "./contexts/useCartContext"

export default function App() {

	return (
		<CartProvider>
			<div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
			<Navbar />
			<main style={{ flex: 1 }}>
				<Outlet />
			</main>
			<Footer />
			</div>
		</CartProvider>
		);
}

