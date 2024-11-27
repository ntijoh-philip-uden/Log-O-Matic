<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useLogStore } from "@/stores/logStore";
import { API_BASE_URL } from "../../config";

const logStore = useLogStore();
const userStore = useUserStore();
const authStore = useAuthStore();

// Reactive state for current week and day
const currentWeek = ref<number>(0); // Tracked week displayed
const currentDay = ref<string>("Monday"); // Tracked day displayed

interface Question {
  id: number;
  value: string;
}

interface Answer {
  id: number;
  value: string;
}

// Define the structure for each log entry
interface LogEntry {
  questions: Question;
  answers: Answer;
}

// Initialize `currentLogData` as a reactive array of `LogEntry` objects
const currentLogData = ref<LogEntry[]>([
  {
    questions: { id: 1, value: "What is Vue?" },
    answers: { id: 1, value: "A progressive JavaScript framework." },
  },
]);

// Default questions to show when there are no logs
const defaultQuestions = ref<string[]>([
  "Vad har du gjort under dagen?",
  "Vad har du lärt dig?",
  "Vad förstod du inte / Vilka frågor har du inte fått svar på?",
  "Vad vill du lära dig mer om?",
]);

// Reactive answers array for input fields
const answers = ref<string[]>(Array(defaultQuestions.value.length).fill(""));

// Track today's actual week and day
const todayWeek = ref<number>(0); // Today's actual week
const todayDay = ref<number>(0); // Today's actual day index (1 = Monday, 5 = Friday)

// Days of the week (excluding weekends)
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Function to fetch logs
async function getLogs() {
  try {
    await userStore.loadUsers();
    // const loggedInUser = userStore.byName(authStore.username)[0];
    if (!loggedInUser) {
      console.error("Logged-in user not found");
      return;
    }

    const userId = loggedInUser.id; // Logged-in user's ID
    const week = currentWeek.value.toString();

    logStore.logs = [];
    console.log(week);
    await logStore.fetchLogsByWeek(week);
    console.log("This is the logs in state: ", logStore.logs);

    // Filter logs for the logged-in user
    const userLogs = logStore.logs.filter((log) => log.user_id === userId);

    // Further filter logs to match the current day
    const dayLogs = userLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const logDay = weekdays[logDate.getDay() - 1]; // Get day as a string (e.g., "Monday")
      return logDay === currentDay.value;
    });

    // Debugging the filtered logs
    console.log("Filtered logs for current day:", dayLogs);

    // Clear currentLogData before adding new entries
    currentLogData.value = [];

    for (let i = 0; i < logStore.questions.length; i++) {
      const question = logStore.questions[i]; // Access the current question object

      if (!question) continue;

      // Get corresponding answers
      for (let j = 0; j < logStore.answers.length; j++) {
        const answer = logStore.answers[j];

        // Check for matching log ID and question ID
        if (answer.log_id === dayLogs[0]?.id && answer.question_id === question.id) {
          currentLogData.value.push({
            questions: {
              id: question.id,
              value: question.question,
            },
            answers: {
              id: answer.id,
              value: answer.answer,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
}

// Function to add logs
async function addLogs() {
  console.log(answers.value);

  try {
  const response = await fetch(`${API_BASE_URL}/api/v1/log/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authStore.token}`,
    },
    body: JSON.stringify( { appleee : answers.value }),
  });

  if (!response.ok) {
    throw new Error("Failed to add log");
  }
} catch (error: any) {
  console.log('ff');
} finally {
  console.log('lades färdigt!');
}

  
}

// Function to calculate the current week of the year
function calculateCurrentWeek(): number {
  const now: Date = new Date();
  const startOfYear: Date = new Date(now.getFullYear(), 0, 1);
  const dayOfYear: number =
    Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.ceil(dayOfYear / 7); // Return the calculated week
}

// Set today's actual week and day
function initializeToday(): void {
  const now: Date = new Date();
  todayWeek.value = calculateCurrentWeek(); // Today's week

  const dayIndex: number = now.getDay(); // Current day index (0 = Sunday, 6 = Saturday)
  todayDay.value = dayIndex >= 1 && dayIndex <= 5 ? dayIndex : 1; // Default to Monday if weekend
  currentWeek.value = todayWeek.value; // Start with today's week
  currentDay.value = weekdays[todayDay.value - 1]; // Set to today's weekday
}

// Navigation limits
const isAtFutureLimit = computed(() => {
  if (currentWeek.value < todayWeek.value) return false;
  if (currentWeek.value === todayWeek.value) {
    const currentDayIndex = weekdays.indexOf(currentDay.value) + 1;
    return currentDayIndex >= todayDay.value; // Cannot go beyond today
  }
  return true; // Beyond current week
});

// Navigation functions
function nextDay(): void {
  if (isAtFutureLimit.value) return;

  let dayIndex = weekdays.indexOf(currentDay.value);

  if (dayIndex < weekdays.length - 1) {
    currentDay.value = weekdays[dayIndex + 1];
  } else {
    currentDay.value = "Monday";
    currentWeek.value += 1;
  }
  getLogs();
}

function prevDay(): void {
  let dayIndex = weekdays.indexOf(currentDay.value);

  if (dayIndex > 0) {
    currentDay.value = weekdays[dayIndex - 1];
  } else {
    currentDay.value = "Friday";
    currentWeek.value -= 1;
  }
  getLogs();
}

onMounted(() => {
  initializeToday();
  logStore.logs = [];
  getLogs();
});
</script>

<template>
  <v-container class="text-center" style="max-width: 600px;">
    <!-- Header Card -->
    <v-card elevation="2" class="pa-4">
      <div class="d-flex justify-center">
        <h3>Week {{ currentWeek }}</h3>
      </div>
      <div class="d-flex justify-center">
        <h4>{{ authStore.username }}</h4>
      </div>
      <div class="d-flex justify-space-between align-center mt-4">
        <v-btn icon @click="prevDay">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <span>{{ currentDay }}</span>
        <v-btn icon @click="nextDay" :disabled="isAtFutureLimit">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </v-card>

    <!-- Display Questions and Answers -->
    <div v-if="currentLogData.length" class="mt-4">
      <div v-for="(log, index) in currentLogData" :key="index" class="mb-4">
        <v-card elevation="1" class="pa-4">
          <h5 class="font-weight-bold text-left">{{ log.questions.value }}</h5>
          <v-divider class="my-2"></v-divider>
          <p class="text-body-2 text-left">{{ log.answers.value }}</p>
        </v-card>
      </div>
    </div>

    <!-- Input Form if no logs -->
    <div v-else class="mt-4">
      <v-card elevation="2" class="pa-4">
        <div v-for="(question, index) in defaultQuestions" :key="index" class="mb-4">
          <h5 class="font-weight-bold text-left">{{ question }}</h5>
          <v-textarea outlined dense placeholder="Write your answer here..." v-model="answers[index]" class="mt-2"></v-textarea>
        </div>
        <v-btn color="green" class="mt-4" block @click="addLogs">Submit Answers</v-btn>
      </v-card>
    </div>
  </v-container>
</template>

<style scoped>
h3,
h4 {
  margin: 0;
}
</style>
