import "./MapPage.css";

const MAP_URL = "https://dsrljeikegnnkujbjitp.supabase.co/storage/v1/object/sign/questwalk_inventory/map.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81MTQ4YTcwMS0xN2YzLTQ1ZTEtYjA2ZC00M2Q0OGU3ZDYyMDgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJxdWVzdHdhbGtfaW52ZW50b3J5L21hcC5wbmciLCJpYXQiOjE3NjM4MTI4NDcsImV4cCI6MTU5NDQzODEyODQ3fQ.FuGXBGMCXvzm-GeGrrtCKtNjuj1V6nuS4mxkDasG1QQ";

function MapPage({ onBack }) {
  return (
    <div className="map-page">
      <div className="map-page__header">
        <div className="map-page__title">MAP</div>
      </div>

      <div className="map-page__content">
        <img 
          src={MAP_URL} 
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

