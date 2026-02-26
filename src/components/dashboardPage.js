import { useState, useEffect, useRef } from "react";
import "./dashboardPage.css";
import { createNewWorkoutForDate } from "./newWorkout";

function DashboardPage({ onBack }) {
  const today = new Date();
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const [selectedDate, setSelectedDate] = useState(today);
  const [workouts, setWorkouts] = useState([]);
  const calendarRef = useRef(null);
  const arrowRef = useRef(null);

  const formattedSelectedDate = selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startOffset = -180;
  const endOffset = 365;
  const days = [];

  const selectedDateKey = selectedDate.toISOString().slice(0, 10);

  for (let offset = startOffset; offset <= endOffset; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    days.push({
      key: date.toISOString().slice(0, 10),
      label: weekdayLabels[date.getDay()],
      dateNumber: date.getDate(),
      isToday: offset === 0,
      isPast: offset < 0,
      date,
    });
  }

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const handleGoToToday = () => setSelectedDate(new Date());

  const handleNewWorkout = () => {
    createNewWorkoutForDate(selectedDate, setWorkouts);
  };

  // Центрирование выбранного дня под стрелкой
  useEffect(() => {
    if (calendarRef.current && arrowRef.current) {
      const activeButton = calendarRef.current.querySelector(
        ".inventory-page__calendar-day--active"
      );
      if (activeButton) {
        // Центрирование полоски календаря
        const scroll =
          activeButton.offsetLeft -
          calendarRef.current.offsetWidth / 2 +
          activeButton.offsetWidth / 2;
        calendarRef.current.scrollLeft = scroll;

        // Стрелка по центру выбранного кружка
        arrowRef.current.style.left =
          activeButton.offsetLeft + activeButton.offsetWidth / 2 + "px";
      }
    }
  }, [selectedDate]);

  return (
    <div className="inventory-page">
      <div className="inventory-page__header">
        <div className="inventory-page__title">DASHBOARD</div>
      </div>

      {/* TODAY button */}
      {!isSameDay(selectedDate, today) && (
        <div className="inventory-page__calendar-today-button-wrapper">
          <button
            type="button"
            className="inventory-page__calendar-today-button"
            onClick={handleGoToToday}
          >
            Go to Today
          </button>
        </div>
      )}

      {/* выбранная дата */}
      <div className="inventory-page__calendar-today">{formattedSelectedDate}</div>

      {/* стрелка под датой */}
      <div className="inventory-page__calendar-selected-arrow" ref={arrowRef}>
        ▼
      </div>

      {/* календарная полоска */}
      <div className="inventory-page__calendar-strip" ref={calendarRef}>
        {days.map((day) => {
          const isSelected = isSameDay(day.date, selectedDate);
          return (
            <button
              type="button"
              key={day.key}
              className={`inventory-page__calendar-day ${
                isSelected
                  ? "inventory-page__calendar-day--active"
                  : day.isToday
                  ? "inventory-page__calendar-day--today"
                  : day.isPast
                  ? "inventory-page__calendar-day--past"
                  : "inventory-page__calendar-day--future"
              }`}
              onClick={() => setSelectedDate(day.date)}
            >
              <span className="inventory-page__calendar-day-label">
                {day.label}
              </span>
              <span className="inventory-page__calendar-day-circle">
                {day.dateNumber}
              </span>
            </button>
          );
        })}
      </div>

      <div className="inventory-page__content">
        {workouts.filter((workout) => workout.dateKey === selectedDateKey)
          .length === 0 ? (
          <div className="inventory-page__no-workouts">
            No workouts for this date yet.
          </div>
        ) : (
          <ul className="inventory-page__workouts-list">
            {workouts
              .filter((workout) => workout.dateKey === selectedDateKey)
              .map((workout, index) => {
                const [label, number] = (workout.name || "").split(" ");
                return (
                  <li
                    key={workout.id}
                    className="inventory-page__workout-item"
                  >
                    <span className="inventory-page__workout-label">
                      {label || "Workout"}
                    </span>
                    <span className="inventory-page__workout-number-circle">
                      {number || index + 1}
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      {/* BACK кнопка внизу */}
      <div className="inventory-page__buttons">
        <button
          type="button"
          className="inventory-page__new-workout-button"
          onClick={handleNewWorkout}
        >
          New Workout
        </button>
        <button className="inventory-page__back-button" onClick={onBack}>
          BACK
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;