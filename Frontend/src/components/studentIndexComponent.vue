<template>
    <v-container class="text-center" style="max-width: 600px;">
      <!-- Card -->
      <v-card elevation="2" class="pa-4">
        <!-- Header -->
        <div class="d-flex justify-center">
          <h3>Week {{ currentWeek }}</h3>
        </div>
        <!-- Sub-header -->
        <div class="d-flex justify-center">
          <h4>{{ authStore.username }}</h4>
          <button @click="getLogs">FortniteKnapp</button>
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
  
        <!-- Display Questions and Answers -->
         <h1>Here is the questions: {{ currentLogData.questions }}</h1>
      
      </v-card>
    </v-container>
  </template>
  
  
  <script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { useAuthStore } from "@/stores/authStore";
  import { API_BASE_URL } from "../../config";
  
  const authStore = useAuthStore();
  
  // Reactive state for current week and day
  const currentWeek = ref<number>(0); // Tracked week displayed
  const currentDay = ref<string>("Monday"); // Tracked day displayed
    const currentLogData = ref({
  logs: [
    {
      id: 1,
      user_id: 3,
      timestamp: '2024-11-20 12:14:35',
    },
  ],
  answers: [
    { id: 1, log_id: 1, question_id: 1, answer: '1 lorem' },
    { id: 2, log_id: 1, question_id: 2, answer: '1 lorem ipsum' },
    { id: 3, log_id: 1, question_id: 3, answer: '1 lorem ipsum banan' },
    { id: 4, log_id: 1, question_id: 4, answer: '1 lorem ipsum banan kaka' },
  ],
  questions: [
    { id: 1, question: 'Vad har du gjort under dagen?' },
    { id: 2, question: 'Vad har du lärt dig?' },
    { id: 3, question: 'Vad förstod du inte / Vilka frågor har du inte fått svar på?' },
    { id: 4, question: 'Vad vill du lära dig mer om?' },
  ],
});
  
  
  // Track today's actual week and day
  const todayWeek = ref<number>(0); // Today's actual week
  const todayDay = ref<number>(0); // Today's actual day index (1 = Monday, 5 = Friday)
  
  // Days of the week (excluding weekends)
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Array to store question objects (with placeholder answers)
//   const questions = ref<{ text: string; answer: string }[]>([
//     { text: "question1", answer: "" },
//     { text: "question2", answer: "" },
//     { text: "question3", answer: "" },
//     { text: "question4", answer: "" },
//   ]);
  
  // Function that fetches logs
  async function getLogs() {
    try {
      const userId = authStore.role; // Assuming userId is stored in authStore
      const week = currentWeek.value; // Use the current tracked week
      const dayName = currentDay.value; // Use the current tracked day (e.g., "Monday")
  
      // Derive today's date from the current week and day
      const today = new Date(); // Get current date
      const startOfYear = new Date(today.getFullYear(), 0, 1); // Start of the year
      const dayOfYear = (week - 1) * 7 + weekdays.indexOf(dayName) + 1; // Approximate day of the year
      const logDate = new Date(startOfYear.setDate(dayOfYear)); // Calculate the actual date
      
      // Extract year, month, and day in the expected format
      const year = logDate.getFullYear().toString();
      const month = (logDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
      const day = logDate.getDate().toString().padStart(2, '0');
  
      console.log(`Fetching logs for: Year=${year}, Month=${month}, Day=${day}, Week=${week}`);
  
      // Prepare query parameters
      const queryParams = new URLSearchParams({
        user: userId.toString(),
        week: week.toString(),
        year, // Send the year in YYYY format
        month, // Send the month in MM format
        day, // Send the day in DD format
      });
  
      const response = await fetch(`${API_BASE_URL}/api/v1/log?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
      });
  
      if (!response.ok) {
        // Handle non-200 responses
        const errorData = await response.json();
        console.error("Failed to fetch logs:", errorData.message);
        return;
      }
  
      // Data and logging
      const logs = await response.json();
      console.log("Fetched logs:", logs);
  
      if (logs.status === "success" && logs.data) {
        currentLogData.value = logs.data;
        console.log("The data in currentLogData: ", currentLogData.value)
      }
    } catch (err: any) {
      console.error("Error fetching logs:", err);
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
    
  });
  </script>
  
  <style scoped>
  h3,
  h4 {
    margin: 0;
  }
  </style>
  