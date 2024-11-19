<script lang="ts" setup>
import AdminList from "@/components/AdminList.vue"; // Import the `AdminList` component, used to display lists of entities.
import AdminForm from "@/components/AdminForm.vue"; // Import the `AdminForm` component, used to create or edit entities.
</script>


<template>
  <v-container>
    <!-- Container to structure and provide padding for the layout. -->
    
    <!-- Display a list of teachers using the `AdminList` component. -->
    <AdminList type="teacher" />
    
    <!-- Display a form for managing teacher data (add/edit) using the `AdminForm` component. -->
    <AdminForm type="teacher" />

    <!-- Display a list of students using the `AdminList` component. -->
    <AdminList type="student" />
    
    <!-- Display a form for managing student data (add/edit) using the `AdminForm` component. -->
    <AdminForm type="student" />
  </v-container>
</template>

