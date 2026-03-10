import { useState, useEffect, useRef } from "react";
import "./dashboardPage.css";
import {
  fetchTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
} from "../apiManipulations";
import {
  openNewWorkoutDraft,
  addExerciseToDraft,
  updateExerciseInDraft,
  removeExerciseFromDraft,
  saveWorkoutDraft,
  deleteWorkoutDraft,
  deleteWorkoutById,
  startEditingWorkout,
} from "./newWorkout";

function DashboardPage({ userId, onBack }) {
  const today = new Date();
  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const [selectedDate, setSelectedDate] = useState(today);
  const [workouts, setWorkouts] = useState([]);
  const [isNewWorkoutOpen, setIsNewWorkoutOpen] = useState(false);
  const [newWorkoutExercises, setNewWorkoutExercises] = useState([]);
  const [newWorkoutTime, setNewWorkoutTime] = useState("");
  const [editingWorkoutId, setEditingWorkoutId] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const calendarRef = useRef(null);

  // Load workouts from backend so they persist across navigation
  useEffect(() => {
    if (!userId) {
      setWorkouts([]);
      return;
    }

    const loadWorkouts = async () => {
      try {
        const workoutsData = await fetchTrainings(userId);
        setWorkouts(workoutsData);
      } catch (error) {
        console.error("Error loading workouts", error);
      }
    };

    loadWorkouts();
  }, [userId]);

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
      setEditingWorkoutId,
      setNewWorkoutTime
    );
  };

  const handleAddExercise = () => {
    addExerciseToDraft(setNewWorkoutExercises);
  };

  const handleExerciseChange = (id, field, value) => {
    updateExerciseInDraft(setNewWorkoutExercises, id, field, value);
  };

  const handleDeleteExercise = (exerciseId) => {
    removeExerciseFromDraft(setNewWorkoutExercises, exerciseId);
  };

  const handleSaveWorkout = async () => {
    // Compute a concrete workout datetime in ISO, if time is provided
    let workoutDateTimeISO = null;
    if (newWorkoutTime && selectedDate) {
      const [hoursStr, minutesStr] = newWorkoutTime.split(":");
      const hours = Number(hoursStr);
      const minutes = Number(minutesStr);

      if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
        const workoutDateTime = new Date(selectedDate);
        workoutDateTime.setHours(hours, minutes, 0, 0);
        workoutDateTimeISO = workoutDateTime.toISOString();
      }
    }

    if (!selectedDate || !newWorkoutExercises.length || !userId) {
      saveWorkoutDraft({
        selectedDate,
        editingWorkoutId,
        newWorkoutExercises,
        workoutTime: workoutDateTimeISO,
        setWorkouts,
        setIsNewWorkoutOpen,
        setNewWorkoutExercises,
        setEditingWorkoutId,
      });
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Common payload part: exercises array in JSONB format
      const nameExercisePayload = newWorkoutExercises.map((exercise) => ({
        exercise_name: exercise.name || "Exercise",
        // NOTE: backend JSONB uses "reapeats" key
        reapeats: Number(exercise.repeats || 1),
        tries: Number(exercise.tries || 1),
      }));

      let response;

      if (editingWorkoutId) {
        // Update existing workout in DB (PATCH),
        // matching by original date/time used when it was created.
        const originalWorkout = workouts.find(
          (w) => w.id === editingWorkoutId
        );

        if (originalWorkout && originalWorkout.time) {
          const dateKey = originalWorkout.dateKey;
          const payload = {
            name_exercise: nameExercisePayload,
          };

          // If user changed time, also update workout_time column
          if (
            workoutDateTimeISO &&
            workoutDateTimeISO !== originalWorkout.time
          ) {
            payload.workout_time = workoutDateTimeISO;
          }

          response = await updateTraining(
            userId,
            dateKey,
            originalWorkout.time,
            payload
          );
        } else {
          // Fallback: if we don't have enough info to PATCH, just save locally
          response = { ok: true };
        }
      } else {
        // Create a new workout row in DB (POST)
        const body = {
          user_id: Number(userId),
          date: selectedDate.toISOString(),
          name_exercise: nameExercisePayload,
        };

        if (workoutDateTimeISO) {
          body.workout_time = workoutDateTimeISO;
        }

        response = await createTraining(body);
      }

      if (!response.ok) {
        throw new Error("Failed to save workout to database");
      }

      saveWorkoutDraft({
        selectedDate,
        editingWorkoutId,
        newWorkoutExercises,
        workoutTime: workoutDateTimeISO,
        setWorkouts,
        setIsNewWorkoutOpen,
        setNewWorkoutExercises,
        setEditingWorkoutId,
      });
    } catch (error) {
      setSaveError(error.message || "Unknown error while saving workout");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkoutDraft = () => {
    deleteWorkoutDraft(
      setIsNewWorkoutOpen,
      setNewWorkoutExercises,
      setEditingWorkoutId
    );
  };

  const handleDeleteWorkout = async (workout) => {
    // Optimistically remove from UI
    deleteWorkoutById(setWorkouts, workout.id);

    if (!userId || !workout?.dateKey || !workout?.time) {
      return;
    }

    try {
      const response = await deleteTraining(
        userId,
        workout.dateKey,
        workout.time
      );

      if (response.status === 404) {
        // Nothing to delete in DB (already gone)
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete workout from database");
      }
    } catch (error) {
      console.error(error);
      setSaveError(
        error.message || "Unknown error while deleting workout from database"
      );
    }
  };

  const handleEditWorkout = (workout) => {
    startEditingWorkout(
      workout,
      setIsNewWorkoutOpen,
      setEditingWorkoutId,
      setNewWorkoutExercises,
      setNewWorkoutTime
    );
  };

  // Center selected day in calendar strip
  useEffect(() => {
    if (calendarRef.current) {
      const activeButton = calendarRef.current.querySelector(
        ".inventory-page__calendar-day--active"
      );
      if (activeButton) {
        const scroll =
          activeButton.offsetLeft -
          calendarRef.current.offsetWidth / 2 +
          activeButton.offsetWidth / 2;
        calendarRef.current.scrollLeft = scroll;
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

      {/* calendar wrapper: arrow centered, strip scrolls to center selected day */}
      <div className="inventory-page__calendar-wrapper">
        <div className="inventory-page__calendar-selected-arrow">▼</div>
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
      </div>

      <div className="inventory-page__content">
        {saveError && (
          <div className="inventory-page__error-message">
            {saveError}
          </div>
        )}
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
                const workoutTimeLabel =
                  workout.time &&
                  (() => {
                    try {
                      return new Date(workout.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch {
                      return null;
                    }
                  })();
                return (
                  <li
                    key={workout.id}
                    className="inventory-page__workout-item"
                  >
                    <div className="inventory-page__workout-header">
                      <div className="inventory-page__workout-title-group">
                        <span className="inventory-page__workout-label">
                          {label || "Workout"}
                        </span>
                        {workoutTimeLabel && (
                          <span className="inventory-page__workout-time">
                            {workoutTimeLabel}
                          </span>
                        )}
                      </div>
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
                        onClick={() => handleDeleteWorkout(workout)}
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

            <div className="inventory-page__new-workout-time-box">
              <label className="inventory-page__new-workout-time-label">
                Select a time:
                <input
                  type="time"
                  className="inventory-page__new-workout-input"
                  value={newWorkoutTime}
                  onChange={(e) => setNewWorkoutTime(e.target.value)}
                />
              </label>
            </div>

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
                      placeholder="Name"
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
                      aria-label="Repeats"
                    >
                      {[...Array(20)].map((_, idx) => {
                        const value = String(idx + 1);
                        return (
                          <option key={value} value={value}>
                            {value}x
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
                      aria-label="Tries"
                    >
                      {[...Array(10)].map((_, idx) => {
                        const value = String(idx + 1);
                        return (
                          <option key={value} value={value}>
                            {value}t
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      className="inventory-page__new-workout-delete-exercise"
                      onClick={() => handleDeleteExercise(exercise.id)}
                      title="Delete exercise"
                      aria-label="Delete exercise"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="inventory-page__new-workout-add-exercise"
              onClick={handleAddExercise}
            >
              Add new exercise +
            </button>

            <div className="inventory-page__new-workout-actions">
              <button
                type="button"
                className="inventory-page__new-workout-save-button"
                onClick={handleSaveWorkout}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save workout"}
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

      {/* BACK кнопка внизу - hidden when editing workout */}
      {!editingWorkoutId && (
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
      )}
    </div>
  );
}

export default DashboardPage;