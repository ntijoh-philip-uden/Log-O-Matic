<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import {
  IAnswer,
  IComment,
  IQuestion,
  ILog,
  useLogStore,
} from "@/stores/logStore";
import { useUserStore } from "@/stores/userStore";

const logStore = useLogStore();
const userStore = useUserStore();

const route = useRoute();

// Extract studentId and week from the route query
const studentId = ref(
  route.query.studentId ? parseInt(route.query.studentId as string, 10) : -1
);
const week = ref((route.query.week as string) || "");

const currentDay = ref("Monday");
const currentDayId = ref(0);

// Mapping days to their corresponding numeric IDs
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const dayMap: { [key: string]: number } = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
};

// Reactive references for logs, questions, answers, and comments
const logs = ref([] as ILog[]);
const questions = ref([] as IQuestion[]);
const answers = ref([] as IAnswer[]);
const comments = ref([] as IComment[]);

onMounted(async () => {
  await userStore.loadUsers();
  if (studentId.value !== -1 && week.value) {
    await logStore.fetchLogsByWeekAndUser(studentId.value, week.value); // Fetch logs for a specific student and week
    logs.value = logStore.logs; // Store the fetched logs
    updateCurrentDayId(); // Update current day ID when logs are loaded
    if (logs.value.length > 0 && currentDayId.value !== null) {
      const selectedLog = logs.value.find((log) => {
        return new Date(log.timestamp).getDay() === currentDayId.value + 1;
      }); // Find the log based on the current day ID
      console.log(selectedLog);
      if (selectedLog) {
        questions.value = logStore.getQuestionsByLogId(selectedLog.id);
        answers.value = logStore.getAnswersByLogId(selectedLog.id);
        comments.value = logStore.commentsByLogId(selectedLog.id);
      }
    }
  }
});

// Watch for changes to the week value and update the logs accordingly
watch(week, async (newWeek) => {
  if (studentId.value !== -1 && newWeek) {
    await logStore.fetchLogsByWeekAndUser(studentId.value, newWeek);
    logs.value = logStore.logs;
  }
});

// Watch for changes in the current day and update the day ID accordingly
watch(currentDay, () => {
  updateCurrentDayId();
});

// Function to update the current day ID based on the selected day string
function updateCurrentDayId() {
  currentDayId.value = dayMap[currentDay.value.toLowerCase()] || 0;
}

// Watch the logs to filter the log by the selected day
watch(currentDayId, (newDayId) => {
  if (logs.value.length > 0 && newDayId !== null) {
    const selectedLog = logs.value.find((log) => {
      return (
        new Date(log.timestamp).getDay() === newDayId + 1 &&
        log.user_id === studentId.value
      );
    });
    if (selectedLog) {
      questions.value = logStore.getQuestionsByLogId(selectedLog.id);
      answers.value = logStore.getAnswersByLogId(selectedLog.id);
      comments.value = logStore.commentsByLogId(selectedLog.id);
    } else {
      questions.value = [];
      answers.value = [];
      comments.value = [];
    }
  } else {
    questions.value = [];
    answers.value = [];
    comments.value = [];
  }
});
</script>

<template>
  <v-container class="spacing-playground pa-8">
    <!-- Card displaying student's name and current week -->
    <v-card class="mx-auto" elevation="8" max-width="448" rounded="lg">
      <v-card-text
        class="text-medium-emphasis font-weight-bold justify-center align-center fill-height d-flex text-h5 pb-2"
      >
        Week {{ week }}
      </v-card-text>
      <v-card-text
        class="text-medium-emphasis font-weight-bold justify-center align-center fill-height d-flex text-h5 pt-0 pb-0"
      >
        {{ userStore.byId(studentId)?.name || "Student Not Found" }}
      </v-card-text>

      <!-- Carousel to scroll through days of the week -->
      <v-carousel v-model="currentDayId" height="80" hide-delimiters>
        <v-carousel-item v-for="(day, index) in days" :key="index">
          <v-sheet height="100%">
            <v-card-text
              class="d-flex fill-height justify-center align-center text-h6"
            >
              {{ day }}
            </v-card-text>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </v-card>

    <!-- Logs for the selected student and week -->
    <v-card
      v-if="
        logs.some(
          (log) => new Date(log.timestamp).getDay() === currentDayId + 1
        )
      "
      class="mx-auto mt-8"
      elevation="8"
      max-width="800"
      rounded="lg"
    >
      <v-container>
        <v-card
          v-for="(question, index) in questions"
          :key="index"
          width="100%"
          class="border-b-lg py-2"
        >
          <v-card-title> {{ question.question }} </v-card-title>
          <v-card-text>
            {{
              answers.find((answer) => answer.question_id === question.id)
                ?.answer
            }}
          </v-card-text>
        </v-card>
      </v-container>

      <v-timeline align="start" width="100%" class="px-8 mb-4">
        <v-timeline-item v-for="(comment, index) in comments" :key="index">
          <template v-slot:opposite>
            {{ userStore.byId(comment.user_id)?.name || "Unknown" }}
          </template>
          <p>{{ comment.comment }}</p>
        </v-timeline-item>
      </v-timeline>

      <!-- Textarea for new comment -->
      <v-textarea
        label="Comment"
        variant="solo-filled"
        class="mx-6 mb-14"
      ></v-textarea>

      <!-- Button to send new comment -->
      <v-btn color="green" class="position-absolute right-0 bottom-0 mr-6 mb-4">
        SEND COMMENT
      </v-btn>
    </v-card>

    <!-- Fallback when no logs are found -->
    <v-card
      v-else
      class="mx-auto mt-8"
      elevation="8"
      max-width="800"
      rounded="lg"
    >
      <v-card-title> Could not find log! </v-card-title>
    </v-card>
  </v-container>
</template>
