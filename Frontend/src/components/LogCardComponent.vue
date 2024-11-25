<script lang="ts" setup>
import { defineProps } from "vue";
import router from "@/router";

function getCurrentWeek(): number {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor(
      (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  const currentWeek = Math.ceil(dayOfYear / 7);
  return currentWeek;
}

const currentWeek = getCurrentWeek();

interface IStudents1 {
  id: number;
  name: string;
  status: string[];
  comments: number[];
}

const props = defineProps<{
  Students: IStudents1[];
  yourStudents: boolean;
}>();

type Header = {
  title: string;
  key: string;
};

const headers: Header[] = [
  { title: "Name", key: "name" },
  { title: "Måndag", key: "monday" },
  { title: "Tisdag", key: "tuesday" },
  { title: "Onsdag", key: "wednesday" },
  { title: "Torsdag", key: "thursday" },
  { title: "Fredag", key: "friday" },
];

function goTodayLogs(day: string) {
  router.push(
    `/logs/dayStudent?week=${encodeURIComponent(
      currentWeek
    )}&day=${encodeURIComponent(day)}`
  );
}

function goToStudentsLogs(studentId: number) {
  router.push(
    `/logs/studentWeek?week=${encodeURIComponent(
      currentWeek
    )}&studentId=${encodeURIComponent(studentId)}`
  );
}

function goToLogs(studentId: number, day: string) {
  router.push(
    `/logs/specificStudent?studentId=${encodeURIComponent(
      studentId
    )}&week=${encodeURIComponent(currentWeek)}&day=${encodeURIComponent(day)}`
  );
}
</script>

<template>
  <v-card>
    <v-card-title class="text-h6" v-if="yourStudents"
      >Your Students</v-card-title
    >
    <v-card-title class="text-h6" v-if="!yourStudents"
      >All Other Students</v-card-title
    >
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="props.Students"
        item-value="name"
        class="elevation-1"
        hide-default-footer
      >
        <template v-slot:headers="{ columns }">
          <tr>
            <th v-if="columns[0].key === 'name'">
              <span class="mr-2">{{ columns[0].title }}</span>
            </th>
            <th
              v-for="(column, index) in columns.slice(1)"
              :key="column.key || index"
            >
              <v-btn
                v-if="column.key"
                @click="goTodayLogs(column.key)"
                class="ma-1"
                small
              >
                {{ column.title }}
              </v-btn>
            </th>
          </tr>
        </template>

        <template v-slot:body="{ items }">
          <tr v-for="student in items" :key="student.name">
            <td>
              <v-btn @click="goToStudentsLogs(student.id)">
                {{ student.name }}
              </v-btn>
            </td>

            <!-- Iterate over days and show appropriate status or dash -->
            <td v-for="(header, index) in headers.slice(1)" :key="index">
              <!-- Check if the day exists in the student's status array -->
              <template v-if="student.status[index] !== undefined">
                <v-btn
                  v-if="student.status[index] === 'missing'"
                  @click="goToLogs(student.id, header.key)"
                  icon
                >
                  <v-icon color="orange">mdi-alert-circle</v-icon>
                </v-btn>

                <v-btn
                  v-else-if="student.status[index] === 'unread'"
                  @click="goToLogs(student.id, header.key)"
                  icon
                >
                  <v-icon color="grey">mdi-check</v-icon>
                  <v-badge
                    color="grey"
                    :content="student.comments[index]"
                    offset-x="-10"
                    offset-y="-15"
                  ></v-badge>
                </v-btn>

                <v-btn
                  v-else-if="student.status[index] === 'read'"
                  @click="goToLogs(student.id, header.key)"
                  icon
                >
                  <v-icon color="blue">mdi-check</v-icon>
                  <v-badge
                    v-if="student.comments[index] !== 0"
                    color="blue"
                    :content="student.comments[index]"
                    offset-x="-10"
                    offset-y="-15"
                  ></v-badge>
                </v-btn>
              </template>

              <template v-else>
                <v-btn icon>
                  <v-icon color="grey">mdi-minus</v-icon>
                </v-btn>
              </template>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>
