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
          <h4>Student Name</h4>
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
    </v-container>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  
  // Reactive state for current week and day
  const currentWeek = ref<number>(0); // Tracked week displayed
  const currentDay = ref<string>("Monday"); // Tracked day displayed
  
  // Track today's actual week and day
  const todayWeek = ref<number>(0); // Today's actual week
  const todayDay = ref<number>(0); // Today's actual day index (1 = Monday, 5 = Friday)
  
  // Days of the week (excluding weekends)
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
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
  