import "./MapPage.css";
import { MAP_IMAGE_URL } from "./constants";

function MapPage({ onBack }) {
  return (
    <div className="map-page">
      <div className="map-page__header">
        <div className="map-page__title">MAP</div>
      </div>

      <div className="map-page__content">
        <img 
          src={MAP_IMAGE_URL} 
          alt="Quest Map" 
          className="map-page__image"
        />
      </div>

      <div className="map-page__buttons">
        <button className="map-page__back-button" onClick={onBack}>
          BACK
        </button>
      </div>
    </div>
  );
}

export default MapPage;

