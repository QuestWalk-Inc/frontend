import "./StartPage.css";

function StartPage({ onStart }) {
  return (
    <div className="start-page">
      <h1 className="start-page__title">QuestWalk</h1>
      <button className="start-page__button" onClick={onStart}>
        Start Journey
      </button>
    </div>
  );
}

export default StartPage;

