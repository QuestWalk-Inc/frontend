import "./TavernPage.css";

function TavernPage({ onBack }) {
  return (
    <div className="map-page">
      <div className="map-page__header">
        <div className="map-page__title">TAVERN</div>
      </div>

      <div className="map-page__content">
        <div className="map-page__info">
          Tavern content goes here.
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


