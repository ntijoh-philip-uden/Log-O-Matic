<script lang="ts" setup>
import { ref, defineProps, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";

// Define the component's props
const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

const userStore = useUserStore();

// Headers for the tables
const teachersHeaders = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "", key: "exclusive", sortable: false },
];
const studentsHeaders = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Teacher", key: "teacher", sortable: false },
  { title: "", key: "exclusive", sortable: false },
];

// Reactive references for teachers and students lists
const teachers = computed(() => userStore.allTeachers() || []);
const students = computed(() => userStore.allStudents() || []);

const loading = ref(false);
const teacherPasswordInputs = ref<Record<number, string>>({});
const studentPasswordInputs = ref<Record<number, string>>({});

// For managing teacher assignments
const studentTeacherInputs = computed(() =>
  students.value.reduce((acc: Record<number, number>, student) => {
    acc[student.id] = student.teacherId ?? null;
    return acc;
  }, {})
);

async function handleResetTeacherPassword(idToReset: number) {
  loading.value = true;
  try {
    await userStore.resetPassword(
      idToReset,
      teacherPasswordInputs.value[idToReset]
    );
    teacherPasswordInputs.value[idToReset] = "";
  } catch (error) {
    console.error("Error resetting teacher password:", error);
  } finally {
    loading.value = false;
  }
}

async function changeTeacher(studentId: number) {
  const newTeacherId = studentTeacherInputs.value[studentId];
  await userStore.changeTeacher(studentId, newTeacherId);

  // Directly update the student data in the local state
  const studentIndex = students.value.findIndex(
    (student) => student.id === studentId
  );
  if (studentIndex !== -1) {
    students.value[studentIndex] = {
      ...students.value[studentIndex],
      teacherId: newTeacherId,
      name:
        teachers.value.find((teacher) => teacher.id === newTeacherId)?.name ||
        "No Teacher Assigned",
    };
  }
}

async function handleResetStudentPassword(idToReset: number) {
  loading.value = true;
  try {
    await userStore.resetPassword(
      idToReset,
      studentPasswordInputs.value[idToReset]
    );
    studentPasswordInputs.value[idToReset] = "";
  } catch (error) {
    console.error("Error resetting student password:", error);
  } finally {
    loading.value = false;
  }
}

// Initial load of users
onMounted(async () => {
  await userStore.loadUsers();
});
</script>

<template>
  <v-card class="mt-4">
    <v-container>
      <v-app-bar-title class="text-h5">
        {{ props.type === "teacher" ? "Teachers" : "Students" }}
      </v-app-bar-title>
    </v-container>

    <v-container>
      <!-- Data table for teachers -->
      <v-data-table
        v-if="props.type === 'teacher'"
        :items="teachers"
        :headers="teachersHeaders"
        hide-default-footer
      >
        <template v-slot:item.exclusive="{ item }">
          <v-form
            @submit.prevent="handleResetTeacherPassword(item.id)"
            :key="item.id"
          >
            <v-row no-gutters>
              <v-col xs="12" sm="12" md="12">
                <v-text-field
                  v-model="teacherPasswordInputs[item.id]"
                  label="Password"
                  required
                  style="max-width: 100%"
                  hide-details="auto"
                  type="password"
                >
                  <template v-slot:append>
                    <v-btn
                      variant="outlined"
                      type="submit"
                      block
                      :disabled="loading"
                      :loading="loading"
                    >
                      Reset
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </template>
      </v-data-table>

      <!-- Data table for students -->
      <v-data-table
        v-else
        :items="students"
        :headers="studentsHeaders"
        hide-default-footer
      >
        <template v-slot:item.teacher="{ item }">
          <v-select
            v-model="studentTeacherInputs[item.id]"
            :items="teachers"
            item-title="name"
            item-value="id"
            hide-details="auto"
            @update:model-value="changeTeacher(item.id)"
          ></v-select>
        </template>

        <template v-slot:item.exclusive="{ item }">
          <v-form
            @submit.prevent="handleResetStudentPassword(item.id)"
            :key="item.id"
          >
            <v-row no-gutters>
              <v-col xs="12" sm="12" md="12">
                <v-text-field
                  v-model="studentPasswordInputs[item.id]"
                  label="Password"
                  required
                  style="max-width: 100%"
                  hide-details="auto"
                  type="password"
                >
                  <template v-slot:append>
                    <v-btn
                      variant="outlined"
                      type="submit"
                      block
                      :disabled="loading"
                      :loading="loading"
                    >
                      Reset
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </template>
      </v-data-table>
    </v-container>
  </v-card>
</template>
