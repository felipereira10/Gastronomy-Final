import Navbar from "./components/navbar/navbar";
import { Outlet } from "react-router-dom";
import Footer from "./components/footer/footer";
import { CartProvider } from "./contexts/useCartContext";
import { useAuth } from "./contexts/AuthContext";
import TermsModal from "./components/terms/TermsModal.jsx";

export default function App() {
  const { authData, setAuthData } = useAuth();

  return (
    <CartProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
        <Footer />

        {/* Modal de Termos */}
        {authData?.mustAcceptTerms && authData?.currentTerms && (
          <TermsModal
            currentTerms={authData.currentTerms}
            onAccept={async () => {
              try {
                const response = await fetch("http://localhost:3000/auth/accept-terms", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authData.token}`,
                  },
                });

                const result = await response.json();
                if (result.success) {
                  const updatedAuth = {
                    ...authData,
                    mustAcceptTerms: false,
                    currentTerms: null,
                    user: {
                      ...authData.user,
                      acceptedTerms: {
                        version: authData.currentTerms.version,
                        acceptedAt: new Date().toISOString(),
                      },
                    },
                  };
                  localStorage.setItem("auth", JSON.stringify(updatedAuth));
                  setAuthData(updatedAuth);
                }
              } catch (err) {
                console.error("Erro ao aceitar os termos:", err);
                alert("Erro ao aceitar os termos. Tente novamente.");
              }
            }}
          />
        )}
      </div>
    </CartProvider>
  );
}