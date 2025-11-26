import { useEffect, useState } from "react";
import "./TavernPage.css";
import { API_BASE_URL } from "./constants";

function TavernPage({ userId, onBack }) {
  const [missions, setMissions] = useState(null);
  const [error, setError] = useState(null);
  const [validatableMissions, setValidatableMissions] = useState({});

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

  // Check which missions are validatable via /missions/{id} endpoint
  useEffect(() => {
    if (!missions || missions.length === 0) return;

    const checkValidatable = async () => {
      try {
        const results = await Promise.all(
          missions.map(async (mission) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/missions/${mission.id}`
              );
              if (!response.ok) {
                return [mission.id, false];
              }
              const data = await response.json();
              const isTrue =
                data === true ||
                data?.is_valid === true ||
                data?.can_validate === true ||
                data?.result === true;
              return [mission.id, isTrue];
            } catch {
              return [mission.id, false];
            }
          })
        );

        setValidatableMissions(Object.fromEntries(results));
      } catch {
        // silently ignore for now
      }
    };

    checkValidatable();
  }, [missions]);

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

  const availableMissions = missions.filter(
    (mission) => mission.is_passed === false
  );

  return (
    <div className="map-page">
      <div className="map-page__header">
        <div className="map-page__title">TAVERN</div>
      </div>

      <div className="map-page__content">
        <div className="map-page__info">
          <div className="tavern-page__missions-title">Available Missions</div>

          {availableMissions.length === 0 ? (
            <div className="tavern-page__no-missions">
              No missions available right now.
            </div>
          ) : (
            <ul className="tavern-page__missions-list">
              {availableMissions.map((mission) => (
                <li key={mission.id} className="tavern-page__mission-item">
                  <button
                    type="button"
                    className="tavern-page__mission-button"
                  >
                    {mission.mission_name ||
                      mission.title ||
                      `Mission #${mission.id}`}
                  </button>
                  {validatableMissions[mission.id] && (
                    <button
                      type="button"
                      className="tavern-page__validate-button"
                    >
                      VALIDATE
                    </button>
                  )}
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


