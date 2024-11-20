<script lang="ts" setup>
import LogCardComponent from "@/components/LogCardComponent.vue"

const teacherName = 'Philip';

// Sample students data
const allStudents = [
  { id: 1, name: "Lynwood Satterfield", teacher: 'Philip', status: [ "unread", "read", "read", "unread", "read"], comments: [2, 3, 0, 1, 0] },
  { id: 2, name: "Andrew Robel", teacher: 'Philip', status: ["missing", "read", "missing", "read", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 3, name: "Magdalena Gibson", teacher: 'Philip', status: ["read", "read", "read", "read", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 4, name: "Neil Doyle", teacher: 'Philip', status: ["unread", "missing", "read", "read", "read"], comments: [5, 2, 3, 0, 6] },
  { id: 5, name: "Trinidad Reynolds", teacher: 'Philip', status: ["unread", "unread", "read", "missing", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 6, name: "asd qwe", teacher: 'qwert', status: ["unread", "unread", "read", "missing", "read"], comments: [5, 2, 3, 0, 1] },
  { id: 7, name: "dfhfrj 12313", teacher: 'qwert', status: ["unread", "unread", "read", "missing", "read"], comments: [1, 2, 3, 4, 5] },
];

function yourStudents(){
  return allStudents.filter(student => student.teacher === teacherName);
};

function otherStudents() {
  return allStudents.filter(student => student.teacher !== teacherName);
};
</script>

<template>
  <v-container>
    <!-- Your Students Section -->
      <LogCardComponent :Students="yourStudents()"/>
    <br><br>
    <!-- Other Students Section -->
    <LogCardComponent :Students="otherStudents()"/>
  </v-container>
</template>
