<script lang="ts" setup>
import AdminList from "@/components/AdminList.vue";
import AdminForm from "@/components/AdminForm.vue";
</script>

<template>
  <v-container>
    <AdminList type="teacher" />

    <AdminForm type="teacher" />

    <AdminList type="student" />

    <AdminForm type="student" />
  </v-container>
</template>
