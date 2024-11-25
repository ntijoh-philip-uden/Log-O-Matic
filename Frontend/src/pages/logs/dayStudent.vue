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
import { IStudent, useUserStore } from "@/stores/userStore";

const logStore = useLogStore();
const userStore = useUserStore();

const route = useRoute();

const day = ref((route.query.day as string) || "");
const week = ref((route.query.week as string) || "");

const dayMap: { [key: string]: number } = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
};

const dayId = ref(dayMap[day.value.toLowerCase()] || 0);

const students = ref([] as IStudent[]);
const logs = ref([] as ILog[]);
const allStudentLogs = ref({} as Record<number, ILog[]>); // Logs grouped by student
const questions = ref([] as IQuestion[]);
const answers = ref([] as IAnswer[]);
const comments = ref([] as IComment[]);
const currentStudentId = ref(0);

onMounted(async () => {
  await userStore.loadUsers();
  students.value = userStore.allStudents();
  if (students.value.length > 0) {
    currentStudentId.value = students.value[0].id;

    if (week.value) {
      await logStore.fetchLogsByWeek(week.value);
      logs.value = logStore.logs;

      // Group logs by student
      allStudentLogs.value = students.value.reduce((acc, student) => {
        acc[student.id] = logs.value.filter(
          (log) =>
            new Date(log.timestamp).getDay() === dayId.value &&
            log.user_id === student.id
        );
        return acc;
      }, {} as Record<number, ILog[]>);
    }
  }
});

watch(week, async (newWeek) => {
  if (newWeek) {
    await logStore.fetchLogsByWeek(newWeek);
    logs.value = logStore.logs;

    // Update logs grouped by student
    allStudentLogs.value = students.value.reduce((acc, student) => {
      acc[student.id] = logs.value.filter(
        (log) =>
          new Date(log.timestamp).getDay() === dayId.value &&
          log.user_id === student.id
      );
      return acc;
    }, {} as Record<number, ILog[]>);
  }
});

watch(currentStudentId, (newStudentId) => {
  if (newStudentId !== null) {
    const selectedLog = logs.value.find(
      (log) =>
        new Date(log.timestamp).getDay() === dayId.value &&
        log.user_id === newStudentId
    );
    if (selectedLog) {
      questions.value = logStore.getQuestionsByLogId(selectedLog.id);
      answers.value = logStore.getAnswersByLogId(selectedLog.id);
      comments.value = logStore.commentsByLogId(selectedLog.id);
    } else {
      questions.value = [];
      answers.value = [];
      comments.value = [];
    }
  }
});

function capitalizeFirstLetter(string: string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function onCarouselChange(newIndex: number) {
  currentStudentId.value = newIndex;
}

const checkBox = ref("1");
</script>

<template>
  <v-container class="spacing-playground pa-8">
    <v-card class="mx-auto" elevation="8" max-width="448" rounded="lg">
      <v-card-text
        class="text-medium-emphasis font-weight-bold justify-center align-center fill-height d-flex text-h5"
      >
        {{ capitalizeFirstLetter(day) }} Week {{ week }}
      </v-card-text>
      <v-radio-group
        v-model="checkBox"
        inline
        class="d-flex justify-center align-center"
      >
        <v-radio label="One at a Time" value="1" class="mr-4"></v-radio>
        <v-radio label="All at Once" value="2"></v-radio>
      </v-radio-group>
      <v-carousel
        v-if="checkBox === '1'"
        v-model="currentStudentId"
        @update:modelValue="onCarouselChange"
        height="80"
        hide-delimiters
      >
        <v-carousel-item
          v-for="(student, index) in students"
          :key="student.id"
          :value="student.id"
        >
          <v-sheet height="100%">
            <v-card-text
              class="d-flex fill-height justify-center align-center text-h6"
            >
              {{ student.name }}
            </v-card-text>
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
    </v-card>

    <!-- All at Once View -->
    <v-container v-if="checkBox === '2'" class="mt-8">
      <div v-for="student in students" :key="student.id">
        <v-card elevation="6" class="mb-6">
          <v-card-title>{{ student.name }}</v-card-title>
          <v-container>
            <v-card
              v-if="allStudentLogs[student.id].length"
              v-for="(log, index) in allStudentLogs[student.id]"
              :key="index"
              class="py-2"
            >
              <v-container
                v-if="logStore.getQuestionsByLogId(log.id).length > 0"
                v-for="question in logStore.getQuestionsByLogId(log.id)"
              >
                <v-card-title>
                  {{ question?.question || "No question found" }}
                </v-card-title>
                <v-card-text>
                  {{
                    logStore
                      .getAnswersByQuestionId(question?.id)
                      .find((answer) => answer.question_id === question.id)
                      ?.answer || "No answer found"
                  }}
                </v-card-text>
              </v-container>
              <v-container v-else>
                <v-card-title> No question found </v-card-title>
                <v-card-text> No answers available </v-card-text>
              </v-container>
            </v-card>
            <v-card v-else>
              <v-card-title> Could not find log! </v-card-title>
            </v-card>
          </v-container>
        </v-card>
      </div>
    </v-container>

    <!-- Single Student View -->
    <v-card
      v-else-if="
        logs.some(
          (log) =>
            new Date(log.timestamp).getDay() === dayId &&
            log.user_id === currentStudentId
        ) && checkBox === '1'
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
