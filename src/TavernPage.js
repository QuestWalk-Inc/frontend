import { useEffect, useState } from "react";
import "./TavernPage.css";
import { API_BASE_URL } from "./constants";

function TavernPage({ userId, onBack }) {
  const [missions, setMissions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMissions = async () => {
      try {
        // Adjust this endpoint to match your FastAPI/Supabase backend
        // It is expected to return missions where is_passed == false
        const url = new URL(`${API_BASE_URL}/missions`);
        url.searchParams.set("is_passed", "false");
        if (userId) {
          // Optional: if your backend filters missions by user
          url.searchParams.set("user_id", userId);
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Failed to load missions");
        }

        const data = await response.json();
        setMissions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      }
    };

    loadMissions();
  }, [userId]);

  if (error) {
    return (
      <div className="map-page">
        <div className="map-page__header">
          <div className="map-page__title">TAVERN</div>
        </div>
        <div className="map-page__content">
          <div className="map-page__info">
            Error loading missions: {error}
          </div>
        </div>
        <div className="map-page__buttons">
          <button className="map-page__back-button" onClick={onBack}>
            BACK
          </button>
        </div>
      </div>
    );
  }

  if (!missions) {
    return (
      <div className="map-page">
        <div className="map-page__header">
          <div className="map-page__title">TAVERN</div>
        </div>
        <div className="map-page__content">
          <div className="map-page__info">Loading missions...</div>
        </div>
        <div className="map-page__buttons">
          <button className="map-page__back-button" onClick={onBack}>
            BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page">
      <div className="map-page__header">
        <div className="map-page__title">TAVERN</div>
      </div>

      <div className="map-page__content">
        <div className="map-page__info">
          <div className="tavern-page__missions-title">Available Missions</div>

          {missions.length === 0 ? (
            <div className="tavern-page__no-missions">
              No missions available right now.
            </div>
          ) : (
            <ul className="tavern-page__missions-list">
              {missions.map((mission) => (
                <li key={mission.id} className="tavern-page__mission-item">
                  <div className="tavern-page__mission-title">
                    {mission.title || `Mission #${mission.id}`}
                  </div>
                  {mission.description && (
                    <div className="tavern-page__mission-description">
                      {mission.description}
                    </div>
                  )}
                  {mission.reward && (
                    <div className="tavern-page__mission-reward">
                      Reward: {mission.reward}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="map-page__buttons">
        <button className="map-page__back-button" onClick={onBack}>
          BACK
        </button>
      </div>
    </div>
  );
}

export default TavernPage;


