<template>
    <v-container>
      <v-card>
        <v-card-title>Your Students</v-card-title>
        <v-data-table
          :items="students"
          class="elevation-1"
          hide-default-footer
        >
          <!-- Student Name Column -->
          <template v-slot:[`item.student`]="{ item }">
            {{ item.student }}
          </template>
  
          <!-- Generate the table columns for each day using headers dynamically -->
          <template v-slot:[`item.${header.value}`]="{ item }" v-for="header in headers.slice(1)" :key="header.value">
            
            <v-btn v-if="item[header.value]?.comments === 2 && item[header.value]?.unread"
            icon="mdi-comment-alert"></v-btn>

            <v-btn v-else-if="item[header.value]?.comments === 1" 
            icon="mdi-comment-check"></v-btn>

            <v-btn v-else-if="item[header.value]?.missing" 
            icon="mdi-alert-circle-outline"></v-btn>

            <v-btn v-else 
            icon="mdi-check-circle-outline"></v-btn>

          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        headers: [
          { text: 'Student', value: 'student' },
          { text: 'Monday', value: 'monday' },
          { text: 'Tuesday', value: 'tuesday' },
          { text: 'Wednesday', value: 'wednesday' },
          { text: 'Thursday', value: 'thursday' },
          { text: 'Friday', value: 'friday' }
        ],
        students: [
          {
            student: 'Lynwood Satterfield',
            monday: { comments: 2, unread: true, missing: false },
            tuesday: { comments: 1, unread: false, missing: false },
            wednesday: { comments: 0, unread: false, missing: false },
            thursday: { comments: 0, unread: false, missing: true },
            friday: { comments: 1, unread: false, missing: false },
          },
          {
            student: 'Andrew Robel',
            monday: { comments: 0, unread: false, missing: true },
            tuesday: { comments: 0, unread: false, missing: false },
            wednesday: { comments: 0, unread: false, missing: false },
            thursday: { comments: 0, unread: false, missing: true },
            friday: { comments: 0, unread: false, missing: false },
          },
          {
            student: 'Magdalena Gibson',
            monday: { comments: 1, unread: false, missing: false },
            tuesday: { comments: 2, unread: true, missing: false },
            wednesday: { comments: 0, unread: false, missing: true },
            thursday: { comments: 1, unread: false, missing: false },
            friday: { comments: 2, unread: true, missing: false },
          },
          {
            student: 'Neil Doyle',
            monday: { comments: 0, unread: false, missing: false },
            tuesday: { comments: 1, unread: false, missing: false },
            wednesday: { comments: 0, unread: false, missing: true },
            thursday: { comments: 2, unread: true, missing: false },
            friday: { comments: 0, unread: false, missing: false },
          }
        ]
      };
    }
  };
  </script>
  

  