import { useState, useEffect, useRef } from "react";
import "./dashboardPage.css";
import {
  openNewWorkoutDraft,
  addExerciseToDraft,
  updateExerciseInDraft,
  saveWorkoutDraft,
  deleteWorkoutDraft,
  deleteWorkoutById,
  startEditingWorkout,
} from "./newWorkout";

function DashboardPage({ onBack }) {
  const today = new Date();
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const [selectedDate, setSelectedDate] = useState(today);
  const [workouts, setWorkouts] = useState([]);
  const [isNewWorkoutOpen, setIsNewWorkoutOpen] = useState(false);
  const [newWorkoutExercises, setNewWorkoutExercises] = useState([]);
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
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
    openNewWorkoutDraft(
      setIsNewWorkoutOpen,
      setNewWorkoutExercises,
      setEditingWorkoutId
    );
  };

  const handleAddExercise = () => {
    addExerciseToDraft(setNewWorkoutExercises);
  };

  const handleExerciseChange = (id, field, value) => {
    updateExerciseInDraft(setNewWorkoutExercises, id, field, value);
  };

  const handleSaveWorkout = () => {
    saveWorkoutDraft({
      selectedDate,
      editingWorkoutId,
      newWorkoutExercises,
      setWorkouts,
      setIsNewWorkoutOpen,
      setNewWorkoutExercises,
      setEditingWorkoutId,
    });
  };

  const handleDeleteWorkoutDraft = () => {
    deleteWorkoutDraft(
      setIsNewWorkoutOpen,
      setNewWorkoutExercises,
      setEditingWorkoutId
    );
  };

  const handleDeleteWorkout = (workoutId) => {
    deleteWorkoutById(setWorkouts, workoutId);
  };

  const handleEditWorkout = (workout) => {
    startEditingWorkout(
      workout,
      setIsNewWorkoutOpen,
      setEditingWorkoutId,
      setNewWorkoutExercises
    );
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
                const exercises = workout.exercises || [];
                return (
                  <li
                    key={workout.id}
                    className="inventory-page__workout-item"
                  >
                    <div className="inventory-page__workout-header">
                      <span className="inventory-page__workout-label">
                        {label || "Workout"}
                      </span>
                      <span className="inventory-page__workout-number-circle">
                        {number || index + 1}
                      </span>
                    </div>

                    {exercises.length > 0 && (
                      <ul className="inventory-page__workout-exercises">
                        {exercises.map((exercise) => (
                          <li
                            key={exercise.id}
                            className="inventory-page__workout-exercise"
                          >
                            <span className="inventory-page__workout-exercise-name">
                              {exercise.name || "Exercise"}
                            </span>
                            <span className="inventory-page__workout-exercise-meta">
                              {exercise.repeats || "1"} repeats ×{" "}
                              {exercise.tries || "1"} tries
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="inventory-page__workout-actions">
                      <button
                        type="button"
                        className="inventory-page__workout-action-button inventory-page__workout-action-button--edit"
                        onClick={() => handleEditWorkout(workout)}
                      >
                        Edit workout
                      </button>
                      <button
                        type="button"
                        className="inventory-page__workout-action-button inventory-page__workout-action-button--delete"
                        onClick={() => handleDeleteWorkout(workout.id)}
                      >
                        Delete workout
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}

        {isNewWorkoutOpen && (
          <div className="inventory-page__new-workout-panel">
            <div className="inventory-page__new-workout-title">
              {editingWorkoutId ? "Edit Workout" : "New Workout"}
            </div>

            <button
              type="button"
              className="inventory-page__new-workout-add-exercise"
              onClick={handleAddExercise}
            >
              Add new exercise +
            </button>

            {newWorkoutExercises.length > 0 && (
              <ul className="inventory-page__new-workout-exercises">
                {newWorkoutExercises.map((exercise) => (
                  <li
                    key={exercise.id}
                    className="inventory-page__new-workout-exercise-row"
                  >
                    <input
                      type="text"
                      className="inventory-page__new-workout-input"
                      placeholder="Exercise name"
                      value={exercise.name}
                      onChange={(e) =>
                        handleExerciseChange(
                          exercise.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <select
                      className="inventory-page__new-workout-select"
                      value={exercise.repeats}
                      onChange={(e) =>
                        handleExerciseChange(
                          exercise.id,
                          "repeats",
                          e.target.value
                        )
                      }
                    >
                      {[...Array(20)].map((_, idx) => {
                        const value = String(idx + 1);
                        return (
                          <option key={value} value={value}>
                            {value} repeats
                          </option>
                        );
                      })}
                    </select>
                    <select
                      className="inventory-page__new-workout-select"
                      value={exercise.tries}
                      onChange={(e) =>
                        handleExerciseChange(
                          exercise.id,
                          "tries",
                          e.target.value
                        )
                      }
                    >
                      {[...Array(10)].map((_, idx) => {
                        const value = String(idx + 1);
                        return (
                          <option key={value} value={value}>
                            {value} tries
                          </option>
                        );
                      })}
                    </select>
                  </li>
                ))}
              </ul>
            )}

            <div className="inventory-page__new-workout-actions">
              <button
                type="button"
                className="inventory-page__new-workout-save-button"
                onClick={handleSaveWorkout}
              >
                Save workout
              </button>
              <button
                type="button"
                className="inventory-page__new-workout-delete-button"
                onClick={handleDeleteWorkoutDraft}
              >
                Delete workout
              </button>
            </div>
          </div>
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