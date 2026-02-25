import "./dashboardPage.css";

function DashboardPage({ onBack }) {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long"
  });

  const weekdayIndex = today.getDay(); // 0 (Sun) - 6 (Sat)
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    const diff = index - weekdayIndex;
    date.setDate(today.getDate() + diff);

    return {
      key: index,
      label: weekdayLabels[index],
      dateNumber: date.getDate(),
      isToday: index === weekdayIndex,
      isPast: index < weekdayIndex
    };
  });

  return (
    <div className="inventory-page">
      <div className="inventory-page__header">
        <button className="inventory-page__back-button" onClick={onBack}>
          BACK
        </button>
        <div className="inventory-page__title">DASHBOARD</div>
      </div>

      <div className="inventory-page__calendar">
        <div className="inventory-page__calendar-today">
          Today, {formattedDate}
        </div>

        <div className="inventory-page__calendar-strip">
          {weekDays.map((day) => (
            <div
              key={day.key}
              className={`inventory-page__calendar-day ${
                day.isToday
                  ? "inventory-page__calendar-day--active"
                  : day.isPast
                  ? "inventory-page__calendar-day--past"
                  : "inventory-page__calendar-day--future"
              }`}
            >
              <span className="inventory-page__calendar-day-label">
                {day.label}
              </span>
              <span className="inventory-page__calendar-day-circle">
                &nbsp;
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InventoryPage;
