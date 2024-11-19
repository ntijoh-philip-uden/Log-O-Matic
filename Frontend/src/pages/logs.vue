<template>
  <v-container>
    <!-- Your Students Section -->
    <v-card>
      <v-card-title class="text-h6">Your Students</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="yourStudents()"
          item-value="name"
          class="elevation-1"
          hide-default-footer
        >
          <!-- Updated Days as Buttons (without colors) -->
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
                <v-btn @click="goToStudentsLogs(student.name)">
                  {{ student.name }}
                </v-btn>
              </td>

              <td v-for="(status, index) in student.status" :key="index">
                <v-btn
                  v-if="status === 'missing'"
                  @click="goToLogs(student.name, headers[index + 1].key)"
                  icon
                >
                  <v-icon color="orange">mdi-alert-circle</v-icon>
                </v-btn>

                <v-btn
                  v-else-if="status === 'unread'"
                  @click="goToLogs(student.name, headers[index + 1].key)"
                  icon
                >
                  <v-icon color="grey">mdi-check</v-icon>
                  <v-badge color="grey" :content="student.comments[index]" offset-x="-10" offset-y="-15"></v-badge>
                </v-btn>

                <v-btn
                  v-else-if="status === 'read'"
                  @click="goToLogs(student.name, headers[index + 1].key)"
                  icon
                >
                  <v-icon color="blue">mdi-check</v-icon>
                  <v-badge v-if="student.comments[index] !== 0" color="blue" :content="student.comments[index]" offset-x="-10" offset-y="-15"></v-badge>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <br><br>

    <!-- Other Students Section -->
    <v-card>
      <v-card-title class="text-h6">Other Students</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="otherStudents()"
          item-value="name"
          class="elevation-1"
          hide-default-footer
        >
          <!-- Updated Days as Buttons (without colors) -->
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
                <v-btn @click="goToStudentsLogs(student.name)">
                  {{ student.name }}
                </v-btn>
              </td>

              <td v-for="(status, index) in student.status" :key="index">
                <v-btn
                  v-if="status === 'missing'"
                  @click="goToLogs(student.name, headers[index + 1].key)"
                  icon
                >
                  <v-icon color="orange">mdi-alert-circle</v-icon>
                </v-btn>

                <v-btn
                  v-else-if="status === 'unread'"
                  @click="goToLogs(student.name, headers[index + 1].key)"
                  icon
                >
                  <v-icon color="grey">mdi-check</v-icon>
                  <v-badge color="grey" :content="student.comments[index]" offset-x="-10" offset-y="-15"></v-badge>
                </v-btn>

                <v-btn
                  v-else-if="status === 'read'"
                  @click="goToLogs(student.name, headers[index + 1].key)"
                  icon
                >
                  <v-icon color="blue">mdi-check</v-icon>
                  <v-badge v-if="student.comments[index] !== 0" color="blue" :content="student.comments[index]" offset-x="-10" offset-y="-15"></v-badge>
                </v-btn>

                <v-badge v-else color="green" :content="student.comments[index]" overlap>
                  <v-icon>mdi-check-circle</v-icon>
                </v-badge>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import router from "@/router";

// Define the current teacher
const teacherName = 'Philip';

// Define the headers for the data table
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

// Sample students data
const allStudents = [
  { id: 1, name: "Lynwood Satterfield", teacher: 'Philip', status: ["read", "unread", "read", "read", "unread"], comments: [5, 2, 3, 0, 1] },
  { id: 2, name: "Andrew Robel", teacher: 'Philip', status: ["missing", "read", "missing", "read", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 3, name: "Magdalena Gibson", teacher: 'Philip', status: ["read", "read", "read", "read", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 4, name: "Neil Doyle", teacher: 'Philip', status: ["unread", "missing", "read", "read", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 5, name: "Trinidad Reynolds", teacher: 'Philip', status: ["unread", "unread", "read", "missing", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 6, name: "asd qwe", teacher: 'qwert', status: ["unread", "unread", "read", "missing", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 7, name: "dfhfrj 12313", teacher: 'qwert', status: ["unread", "unread", "read", "missing", "read"], comments: [1, 2, 3, 4, 5] },
];

// Computed: Your Students
function yourStudents(){
  return allStudents.filter(student => student.teacher === teacherName);
};

// Computed: Other Students
function otherStudents() {
  return allStudents.filter(student => student.teacher !== teacherName);
};

// Methods: Navigation to logs for a specific day
function goTodayLogs(day: string | "name") {
  router.push(`/logs/day?day=${encodeURIComponent(day)}`);
}

// Method to view detailed logs for a specific student
function goToStudentsLogs(student: string) {
  router.push(`/logs/students/?student=${encodeURIComponent(student)}`);
}

// Method to view logs for a specific student on a specific day
function goToLogs(student: string, day: string | "name") {
  router.push(`/logs/students/day?student=${encodeURIComponent(student)}&day=${encodeURIComponent(day)}`);
}
</script>
