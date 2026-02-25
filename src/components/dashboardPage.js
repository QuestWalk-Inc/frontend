import { useState, useEffect, useRef } from "react";
import "./dashboardPage.css";

function DashboardPage({ onBack }) {
  const today = new Date();
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const [selectedDate, setSelectedDate] = useState(today);
  const calendarRef = useRef(null);

  const formattedSelectedDate = selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startOffset = -180;
  const endOffset = 365;
  const days = [];

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

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  useEffect(() => {
    if (calendarRef.current) {
      const activeButton = calendarRef.current.querySelector(
        ".inventory-page__calendar-day--active"
      );
      const arrow = calendarRef.current.querySelector(
        ".inventory-page__calendar-selected-arrow"
      );

      if (activeButton && arrow) {
        const buttonLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.offsetWidth;
        arrow.style.left = `${buttonLeft + buttonWidth / 2}px`;

        const parentWidth = calendarRef.current.offsetWidth;
        calendarRef.current.scrollLeft =
          buttonLeft - parentWidth / 2 + buttonWidth / 2;
      }
    }
  }, [selectedDate]);

  return (
    <div className="inventory-page">
      <div className="inventory-page__header">
        <div className="inventory-page__title">DASHBOARD</div>
      </div>

      {/* TODAY button между DASHBOARD и датой */}
      <div className="inventory-page__calendar-today-button-wrapper">
        <button
          type="button"
          className="inventory-page__calendar-today-button"
          onClick={handleGoToToday}
        >
          TODAY
        </button>
      </div>

      {/* выбранная дата */}
      <div className="inventory-page__calendar-today">{formattedSelectedDate}</div>

      {/* стрелка под датой */}
      <div className="inventory-page__calendar-selected-arrow">▼</div>

      {/* календарная полоса с кружками */}
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
              <span className="inventory-page__calendar-day-label">{day.label}</span>
              <span className="inventory-page__calendar-day-circle">{day.dateNumber}</span>
            </button>
          );
        })}
      </div>

      <div className="inventory-page__content">
        {/* контент */}
      </div>

      <div className="inventory-page__buttons">
        <button className="inventory-page__back-button" onClick={onBack}>
          BACK
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;