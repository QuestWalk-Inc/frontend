import { useState, useEffect } from "react";
import "./MainPage.css";
import { API_BASE_URL } from "../constants";

function MainPage({ userId, onInventoryClick, onMapClick }) {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/${userId}`
        );

        if (!response.ok) throw new Error("User not found");

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      }
    };


    loadUser();
  }, [userId]);

  if (error) return (
    <div className="main-page">
      <div className="main-page__error">Error: {error}</div>
      <div className="main-page__buttons">
        <button className="main-page__button" onClick={() => window.location.reload()}>
          RETRY
        </button>
      </div>
    </div>
  );
  
  if (!userData) return (
    <div className="main-page">
      <div className="main-page__loading">Loading...</div>
    </div>
  );

  return (
    <div className="main-page">
      <div className="main-page__header">
        <div className="main-page__level">LVL: {userData.level}</div>
      </div>
      <div className="main-page__buttons">
        <button className="main-page__button" onClick={onInventoryClick}>
          DASHBOARD
        </button>
      </div>
    </div>
  );
}

export default MainPage;
