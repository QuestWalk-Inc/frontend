export function createNewWorkoutForDate(
  selectedDate,
  setWorkouts,
  exercises = [],
  workoutTime
) {
  if (!selectedDate || !setWorkouts) return;

  const dateKey = selectedDate.toISOString().slice(0, 10);

  setWorkouts((prev) => {
    const existingForDate = prev.filter((workout) => workout.dateKey === dateKey);
    const newWorkoutNumber = existingForDate.length + 1;

    const newWorkout = {
      id: `${dateKey}-${Date.now()}`,
      dateKey,
      name: `Workout ${newWorkoutNumber}`,
      exercises,
      // Store full workout datetime ISO string (used for backend delete)
      time: workoutTime || null,
    };

    return [...prev, newWorkout];
  });
}

export function openNewWorkoutDraft(
  setIsNewWorkoutOpen,
  setNewWorkoutExercises,
  setEditingWorkoutId,
  setNewWorkoutTime
) {
  setIsNewWorkoutOpen(true);
  setNewWorkoutExercises([]);
  setEditingWorkoutId(null);
  if (setNewWorkoutTime) {
    setNewWorkoutTime("");
  }
}

export function addExerciseToDraft(setNewWorkoutExercises) {
  setNewWorkoutExercises((prev) => [
    ...prev,
    {
      id: `${Date.now()}-${Math.random()}`,
      name: "",
      repeats: "1",
      tries: "1",
    },
  ]);
}

export function updateExerciseInDraft(
  setNewWorkoutExercises,
  id,
  field,
  value
) {
  setNewWorkoutExercises((prev) =>
    prev.map((exercise) =>
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    )
  );
}

export function saveWorkoutDraft({
  selectedDate,
  editingWorkoutId,
  newWorkoutExercises,
  workoutTime,
  setWorkouts,
  setIsNewWorkoutOpen,
  setNewWorkoutExercises,
  setEditingWorkoutId,
}) {
  if (!selectedDate) return;

  if (editingWorkoutId) {
    setWorkouts((prev) =>
      prev.map((workout) => {
        if (workout.id !== editingWorkoutId) return workout;
        const updated = { ...workout, exercises: newWorkoutExercises };
        if (typeof workoutTime !== "undefined") {
          updated.time = workoutTime;
        }
        return updated;
      })
    );
  } else {
    createNewWorkoutForDate(
      selectedDate,
      setWorkouts,
      newWorkoutExercises,
      workoutTime
    );
  }

  setIsNewWorkoutOpen(false);
  setNewWorkoutExercises([]);
  setEditingWorkoutId(null);
}

export function deleteWorkoutDraft(
  setIsNewWorkoutOpen,
  setNewWorkoutExercises,
  setEditingWorkoutId
) {
  setIsNewWorkoutOpen(false);
  setNewWorkoutExercises([]);
  setEditingWorkoutId(null);
}

export function deleteWorkoutById(setWorkouts, workoutId) {
  setWorkouts((prev) => prev.filter((workout) => workout.id !== workoutId));
}

export function startEditingWorkout(
  workout,
  setIsNewWorkoutOpen,
  setEditingWorkoutId,
  setNewWorkoutExercises,
  setNewWorkoutTime
) {
  if (!workout) return;

  setIsNewWorkoutOpen(true);
  setEditingWorkoutId(workout.id);
  setNewWorkoutExercises(
    (workout.exercises || []).map((exercise) => ({ ...exercise }))
  );
  if (setNewWorkoutTime) {
    if (workout.time) {
      try {
        const d = new Date(workout.time);
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        setNewWorkoutTime(`${hours}:${minutes}`);
      } catch {
        setNewWorkoutTime("");
      }
    } else {
      setNewWorkoutTime("");
    }
  }
}

