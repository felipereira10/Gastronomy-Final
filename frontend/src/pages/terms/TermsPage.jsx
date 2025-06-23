import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/loading/Loading";
import styles from "./terms.module.css";

export default function TermsPage() {
  const { authData, setAuthData } = useAuth();
  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/terms/active");
        const data = await res.json();
        if (data.success) {
          setTerm(data.term);
        }
      } catch (err) {
        console.error("Failed to fetch terms", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  const handleAcceptTerms = async () => {
    try {
      const res = await fetch("http://localhost:3000/auth/accept-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const updatedUser = {
          ...authData.user,
          acceptedTerms: {
            version: term.version,
            acceptedAt: new Date(),
          },
        };
        setAuthData({ user: updatedUser, token: authData.token });
        navigate("/profile");
      } else {
        alert("Failed to accept terms.");
      }
    } catch (err) {
      console.error("Error accepting terms", err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className={styles.termsContainer}>
      <h1>Terms of Use - Version {term.version}</h1>
      <div className={styles.termsContent}>
        <p>{term.content}</p>
      </div>
      <button className={styles.acceptButton} onClick={handleAcceptTerms}>
        ✅ Accept Terms and Continue
      </button>
    </div>
  );
}
