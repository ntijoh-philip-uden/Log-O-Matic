<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import {
  IAnswer,
  IComment,
  ILog,
  IQuestion,
  useLogStore,
} from "@/stores/logStore";
import { useUserStore } from "@/stores/userStore";

const logStore = useLogStore();
const userStore = useUserStore();

const route = useRoute();

// Extract studentId, week, and day from the route
const studentId = ref(
  route.query.studentId ? parseInt(route.query.studentId as string, 10) : -1
);
const week = ref((route.query.week as string) || "");
const day = ref((route.query.day as string) || "");

const dayId = ref(
  (() => {
    switch (day.value) {
      case "monday":
        return 1;
      case "tuesday":
        return 2;
      case "wednesday":
        return 3;
      case "thursday":
        return 4;
      case "friday":
        return 5;
      case "saturday":
        return 6;
      case "sunday":
        return 0;
      default:
        return null;
    }
  })()
);

// Initialize reactive references for logs, questions, answers, and comments
const logs = ref([] as ILog[]);
const logFound = ref(false);
const questions = ref([] as IQuestion[]);
const answers = ref([] as IAnswer[]);
const comments = ref([] as IComment[]);

onMounted(async () => {
  await userStore.loadUsers();

  // Fetch logs from the store when the component mounts
  await logStore.fetchLogsByWeek(week.value);
  logs.value = logStore.logs;

  // Filter the logs for the selected day (reactively)
  updateLogs();
});

// Function to update logs based on the selected day
function updateLogs() {
  const filteredLogs = logs.value.filter(
    (log) =>
      new Date(log.timestamp).getDay() === dayId.value &&
      log.user_id === studentId.value
  );

  console.log(filteredLogs);

  // If logs are found, update questions, answers, and comments
  if (filteredLogs.length > 0) {
    logFound.value = true;
    const selectedLog = filteredLogs[0]; // You can handle multiple logs if needed
    questions.value = logStore.getQuestionsByLogId(selectedLog.id);
    answers.value = logStore.getAnswersByLogId(selectedLog.id);
    comments.value = logStore.commentsByLogId(selectedLog.id);
  } else {
    // If no logs found, clear questions, answers, and comments
    questions.value = [];
    answers.value = [];
    comments.value = [];
  }
}

// Watch for changes in `logs` or `dayId` to update the displayed data
watch([logs, dayId], updateLogs);

function capitalizeFirstLetter(string: string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}
</script>

<template>
  <v-container class="spacing-playground pa-8">
    <v-card class="mx-auto" elevation="8" max-width="448" rounded="lg">
      <v-card-text
        class="text-medium-emphasis font-weight-bold justify-center align-center fill-height d-flex text-h5"
      >
        <!-- Här kan man få elevnamnet att uppdateras dynamiskt, pallar bara inte -->
        {{ userStore.byId(studentId)?.name }}
        {{ capitalizeFirstLetter(day) }} Week {{ week }}
      </v-card-text>
    </v-card>
    <v-card
      v-if="logFound"
      class="mx-auto mt-8"
      elevation="8"
      max-width="800"
      rounded="lg"
    >
      <v-container>
        <v-card
          width="100%"
          class="border-b-lg py-2"
          v-for="(question, index) in questions"
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
          <!-- Opposite Slot -->
          <template v-slot:opposite>
            {{ userStore.byId(comment.user_id)?.name || "Unknown" }}
          </template>

          <p>{{ comment.comment }}</p>
        </v-timeline-item>
      </v-timeline>

      <v-textarea
        label="Comment"
        variant="solo-filled"
        class="mx-6 mb-14"
      ></v-textarea>

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
