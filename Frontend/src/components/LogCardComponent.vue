<script lang="ts" setup>
import { defineProps } from "vue";
import router from "@/router";

interface IStudents {
  id: number;
  name: string;
  teacher: string;
  status: string[];
  comments: number[];
}

const props = defineProps<{
  Students: readonly IStudents[];
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

// Router navigation functions
function goTodayLogs(day: string | "name") {
  router.push(`/logs/day?day=${encodeURIComponent(day)}`);
}

function goToStudentsLogs(student: string) {
  router.push(`/logs/students/?student=${encodeURIComponent(student)}`);
}

function goToLogs(student: string, day: string | "name") {
  router.push(`/logs/students/day?student=${encodeURIComponent(student)}&day=${encodeURIComponent(day)}`);
}
</script>



<template>
    <v-card>
      <v-card-title class="text-h6">Your Students</v-card-title>
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
              <th v-for="(column, index) in columns.slice(1)" :key="column.key || index">
                <v-btn v-if="column.key" @click="goTodayLogs(column.key)" class="ma-1" small>
                  {{ column.title }}
                </v-btn>
              </th>
            </tr>
          </template>
  
          <template v-slot:body="{ items }">
            <tr v-for="student in items" :key="student.name">
              <td>
                <v-btn @click="goToStudentsLogs(student.name)">
                  {{ student.name }}
                </v-btn>
              </td>
  
              <!-- Iterate over days and show appropriate status or dash -->
              <td
                v-for="(header, index) in headers.slice(1)"
                :key="index"
              >
                <!-- Check if the day exists in the student's status array -->
                <template v-if="student.status[index] !== undefined">
                  <v-btn
                    v-if="student.status[index] === 'missing'"
                    @click="goToLogs(student.name, header.key)"
                    icon
                  >
                    <v-icon color="orange">mdi-alert-circle</v-icon>
                  </v-btn>
  
                  <v-btn
                    v-else-if="student.status[index] === 'unread'"
                    @click="goToLogs(student.name, header.key)"
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
                    @click="goToLogs(student.name, header.key)"
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
  
  