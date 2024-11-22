<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { ILog, useLogStore } from '@/stores/logStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const userStore = useUserStore();
const logStore = useLogStore();

onMounted(async () => {
  await userStore.loadUsers();
  await logStore.fetchLogsByWeek("47");
});

const yourStudents = computed(() => {
  if (logStore.loading) return [];
  const teacherName = authStore.username;
  if (!teacherName) return [];

  const teacherStudents = userStore.users.filter(
    (user) => user.teacherId != null && userStore.byId(user.teacherId)?.name === teacherName
  );

  const teacherStudentLogs = logStore.logs.filter((log) =>
    teacherStudents.some((student) => student.id === log.user_id)
  );

  return transformLogsToStudents(teacherStudentLogs);
});

const otherStudents = computed(() => {
  if (logStore.loading) return [];
  const teacherName = authStore.username;
  if (!teacherName) return [];

  const teacherStudents = userStore.users.filter(
    (user) => user.teacherId != null && userStore.byId(user.teacherId)?.name === teacherName
  );

  const teacherStudentIds = new Set(teacherStudents.map((student) => student.id));
  const nonTeacherStudentLogs = logStore.logs.filter(
    (log) => !teacherStudentIds.has(log.user_id)
  );

  return transformLogsToStudents(nonTeacherStudentLogs);
});

const transformLogsToStudents = (logs: ILog[]) => {
  return logs.map(log => ({
    id: log.user_id,
    name: userStore.byId(log.user_id)?.name || 'Unknown',
    status: ['missing', 'unread', 'read'],
    comments: [0, 1, 2], // Example structure for comments
  }));
};
</script>


<template>
  <v-container>
    <div v-if="logStore.loading">Loading logs...</div> <!-- Show loading indicator -->
    
    <div v-else>
      <!-- Your Students Section -->
      <LogCardComponent :Students="yourStudents" :yourStudents="true"/>
      <br /><br />
      <!-- Other Students Section -->
      <LogCardComponent :Students="otherStudents" :yourStudents="false"/>
    </div>
  </v-container>
</template>
