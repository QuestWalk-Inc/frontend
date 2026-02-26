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

