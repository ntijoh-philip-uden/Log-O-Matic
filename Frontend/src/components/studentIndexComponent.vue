  
<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { useAuthStore } from "@/stores/authStore";
  import { useUserStore } from '@/stores/userStore';
  import { useLogStore } from '@/stores/logStore';
import { tryStatement } from '@babel/types';
  
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
      questions: { id: 1, value: 'What is Vue?' },
      answers: { id: 1, value: 'A progressive JavaScript framework.' },
    },
  ]);
  
  // Track today's actual week and day
  const todayWeek = ref<number>(0); // Today's actual week
  const todayDay = ref<number>(0); // Today's actual day index (1 = Monday, 5 = Friday)
  
  // Days of the week (excluding weekends)
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Function that fetches logs
  async function getLogs() {
    try {
      await userStore.loadUsers();
      const loggedInUser = userStore.byName(authStore.username)[0];
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
      const userLogs = logStore.logs.filter(log => log.user_id === userId);
  
      // Further filter logs to match the current day
      const dayLogs = userLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const logDay = weekdays[logDate.getDay() - 1]; // Get day as a string (e.g., "Monday")
        return logDay === currentDay.value;
      });
  
      // Debugging the filtered logs
      console.log("Filtered logs for current day:", dayLogs);
      console.log("This is the answers: ", logStore.answers);
  
      // Clear currentLogData before adding new entries
      currentLogData.value = [];
  
      // Wrap the loop in a try-catch
      try {
        for (let i = 0; i < logStore.questions.length; i++) {
          const question: any = logStore.questions[i]; // Access the current question object
  
          if (!question) {
            console.warn(`Missing data for question at index ${i}`);
            continue;
          }
  
          // Log the question for debugging
          console.log(`id: ${question.id}, Value: ${question.question}`);
  
          // Get corresponding answers
          try {
            if (logStore.answers.length === 0) {
              console.warn("No answers found in logStore.answers");
            }
  
            for (let j = 0; j < logStore.answers.length; j++) {
              const answer = logStore.answers[j];
  
              // Check for matching log ID and question ID
              if (answer.log_id === dayLogs[0]?.id && answer.question_id === question.id) {
                // Add question and corresponding answer to currentLogData
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
          } catch (error) {
            console.error("Error processing answers:", error);
          }
        }
      } catch (error) {
        console.error("Error processing questions:", error);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  
    // Successfully pushed to currentLogData!
    console.log(currentLogData.value);
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
    // Prevent navigating beyond today's week and day
    if (currentWeek.value < todayWeek.value) return false;
    if (currentWeek.value === todayWeek.value) {
      const currentDayIndex = weekdays.indexOf(currentDay.value) + 1;
      return currentDayIndex >= todayDay.value; // Cannot go beyond today
    }
    return true; // Beyond current week
  });
  
  // Navigate to the next day (skipping weekends and future days)
  function nextDay(): void {
    if (isAtFutureLimit.value) return; // Prevent forward navigation into the future
  
    // Get the current day index
    let dayIndex = weekdays.indexOf(currentDay.value);
  
    // Move to the next weekday
    if (dayIndex < weekdays.length - 1) {
      currentDay.value = weekdays[dayIndex + 1];
    } else {
      // If it's Friday, move to the next week's Monday
      currentDay.value = "Monday";
      currentWeek.value += 1;
    }
    getLogs();
  }
  
  // Navigate to the previous day (skipping weekends)
  function prevDay(): void {
    // Get the current day index
    let dayIndex = weekdays.indexOf(currentDay.value);
  
    // Move to the previous weekday
    if (dayIndex > 0) {
      currentDay.value = weekdays[dayIndex - 1];
    } else {
      // If it's Monday, move to the previous week's Friday
      currentDay.value = "Friday";
      currentWeek.value -= 1;
    }
    getLogs();
  }
  
  // Initialize today's data when the component is mounted
  onMounted(() => {
    initializeToday();
    try{logStore.logs = []}
    catch{console.log("There was an error intiting logs")}
    getLogs();
  });
</script>

<template>
    <v-container class="text-center" style="max-width: 600px;">
      <!-- Header Card -->
      <v-card elevation="2" class="pa-4">
        <!-- Header -->
        <div class="d-flex justify-center">
          <h3>Week {{ currentWeek }}</h3>
        </div>
        <!-- Sub-header -->
        <div class="d-flex justify-center">
          <h4>{{ authStore.username }}</h4>
        </div>
        <!-- Navigation -->
        <div class="d-flex justify-space-between align-center mt-4">
          <!-- Left Arrow Button -->
          <v-btn icon @click="prevDay">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
  
          <!-- Day Label -->
          <span>{{ currentDay }}</span>
  
          <!-- Right Arrow Button -->
          <v-btn icon @click="nextDay" :disabled="isAtFutureLimit">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </v-card>
  
      <!-- Display Questions and Answers -->
      <div v-if="currentLogData.length" class="mt-4">
        <div
          v-for="(log, index) in currentLogData"
          :key="index"
          class="mb-4"
        >
          <!-- Combined Question and Answer Card -->
          <v-card elevation="1" class="pa-4">
            <!-- Question -->
            <h5 class="font-weight-bold text-left">
              {{ log.questions.value }}
            </h5>
            <!-- Divider Line -->
            <v-divider class="my-2"></v-divider>
            <!-- Answer -->
            <p class="text-body-2 text-left">
              {{ log.answers.value }}
            </p>
          </v-card>
        </div>
      </div>
  
      <!-- Message if no logs -->
      <div v-else class="mt-4">
        <v-card elevation="2" class="pa-4">
          <p>No logs available for the selected day.</p>
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
  
  
  