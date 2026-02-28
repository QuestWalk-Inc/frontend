import { API_BASE_URL } from "./constants";

/**
 * Fetch user data by userId
 * @param {string|number} userId
 * @returns {Promise<object>} User data
 */
export async function fetchUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);
  if (!response.ok) throw new Error("User not found");
  return response.json();
}

/**
 * Fetch trainings for a user and transform into workouts format
 * @param {string|number} userId
 * @returns {Promise<Array>} Array of workout objects
 */
export async function fetchTrainings(userId) {
  const response = await fetch(`${API_BASE_URL}/trainings/${userId}`);

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Failed to load workouts");
  }

  const data = await response.json();

  // Group trainings by date and workout_time into workouts
  const workoutsByKey = {};

  data.forEach((item, index) => {
    if (!item.date) return;

    const dateKey = new Date(item.date).toISOString().slice(0, 10);
    const workoutTime = item.workout_time || null;
    const baseKey = `${dateKey}-${workoutTime || "notime"}`;
    const key = item.id ? `${baseKey}-${item.id}` : `${baseKey}-${index}`;

    if (!workoutsByKey[key]) {
      workoutsByKey[key] = {
        id: `${key}`,
        dateKey,
        time: workoutTime,
        name: "Workout 1",
        exercises: [],
      };
    }

    let rawExercises = [];
    if (Array.isArray(item.name_exercise)) {
      rawExercises = item.name_exercise;
    } else if (item.name_exercise && typeof item.name_exercise === "object") {
      rawExercises = [item.name_exercise];
    } else if (typeof item.name_exercise === "string") {
      rawExercises = [
        {
          exercise_name: item.name_exercise,
          reapeats: item.repeat ?? 1,
          tries: item.tries ?? 1,
        },
      ];
    }

    const mappedExercises = rawExercises.map((exercise, exIndex) => ({
      id: `${item.id || index}-${exIndex}`,
      name: exercise.exercise_name || "Exercise",
      repeats: String(
        typeof exercise.reapeats === "number"
          ? exercise.reapeats
          : exercise.repeat ?? item.repeat ?? 1
      ),
      tries: String(
        typeof exercise.tries === "number"
          ? exercise.tries
          : item.tries ?? 1
      ),
    }));

    workoutsByKey[key].exercises.push(...mappedExercises);
  });

  return Object.values(workoutsByKey);
}

/**
 * Create a new training
 * @param {object} body - { user_id, date, name_exercise, workout_time? }
 * @returns {Promise<Response>}
 */
export async function createTraining(body) {
  return fetch(`${API_BASE_URL}/trainings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * Update an existing training
 * @param {string|number} userId
 * @param {string} dateKey
 * @param {string} workoutTime
 * @param {object} payload - { name_exercise, workout_time? }
 * @returns {Promise<Response>}
 */
export async function updateTraining(userId, dateKey, workoutTime, payload) {
  return fetch(
    `${API_BASE_URL}/trainings/${userId}/${dateKey}/${encodeURIComponent(
      workoutTime
    )}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Delete a training
 * @param {string|number} userId
 * @param {string} dateKey
 * @param {string} workoutTime
 * @returns {Promise<Response>}
 */
export async function deleteTraining(userId, dateKey, workoutTime) {
  return fetch(
    `${API_BASE_URL}/trainings/${userId}/${dateKey}/${encodeURIComponent(
      workoutTime
    )}`,
    { method: "DELETE" }
  );
}
