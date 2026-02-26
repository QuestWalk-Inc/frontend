export function createNewWorkoutForDate(
  selectedDate,
  setWorkouts,
  exercises = []
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
    };

    return [...prev, newWorkout];
  });
}

export function openNewWorkoutDraft(
  setIsNewWorkoutOpen,
  setNewWorkoutExercises,
  setEditingWorkoutId
) {
  setIsNewWorkoutOpen(true);
  setNewWorkoutExercises([]);
  setEditingWorkoutId(null);
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
  setWorkouts,
  setIsNewWorkoutOpen,
  setNewWorkoutExercises,
  setEditingWorkoutId,
}) {
  if (!selectedDate) return;

  if (editingWorkoutId) {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === editingWorkoutId
          ? { ...workout, exercises: newWorkoutExercises }
          : workout
      )
    );
  } else {
    createNewWorkoutForDate(selectedDate, setWorkouts, newWorkoutExercises);
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
  setNewWorkoutExercises
) {
  if (!workout) return;

  setIsNewWorkoutOpen(true);
  setEditingWorkoutId(workout.id);
  setNewWorkoutExercises(
    (workout.exercises || []).map((exercise) => ({ ...exercise }))
  );
}

