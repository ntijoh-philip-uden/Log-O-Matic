<script lang="ts" setup>
import { ref, defineProps, computed, watch } from "vue";
import { useTeachersStore } from "@/stores/teacherStore";
import { useStudentsStore } from "@/stores/studentStore";

// Define the component's props
const props = defineProps({
  type: {
    type: String,
    required: true, // Required prop to specify whether handling 'teacher' or 'student'
  },
});

// Stores for managing teachers and students
const teacherStore = useTeachersStore();
const studentStore = useStudentsStore();

// Headers for the teachers table
const teachersHeaders = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "", key: "exclusive", sortable: false }, // For actions like password reset
];

// Headers for the students table
const studentsHeaders = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Teacher", key: "teacher", sortable: false }, // Assign teacher
  { title: "", key: "exclusive", sortable: false }, // For actions like password reset
];

// Reactive data for teachers and students
const teachers = ref(teacherStore.teachers);
const students = ref(studentStore.students);

// Loading state for async operations
const loading = ref(false);

// Inputs for managing passwords and teacher assignments
const teacherPasswordInputs = ref<Record<number, string>>({});
const studentPasswordInputs = ref<Record<number, string>>({});

// Compute a mapping of student IDs to their assigned teacher IDs
const studentTeacherInputs = computed(() =>
  students.value.reduce((acc: Record<number, number>, student) => {
    acc[student.id] = student.teacherId;
    return acc;
  }, {})
);

// Function to reset a teacher's password
async function handleResetTeacherPassword(idToReset: number) {
  loading.value = true;
  try {
    await teacherStore.resetPassword(
      teachers.value[idToReset],
      teacherPasswordInputs.value[idToReset]
    );
    teacherPasswordInputs.value[idToReset] = ""; // Clear input on success
  } catch (error) {
    console.error("Error resetting teacher password:", error);
  } finally {
    loading.value = false;
  }
}

// Function to reset a student's password and change their teacher assignment
async function handleResetStudentPassword(idToReset: number) {
  loading.value = true;
  try {
    await studentStore.resetPassword(
      students.value[idToReset],
      studentPasswordInputs.value[idToReset]
    );
    await studentStore.changeTeacher(
      students.value[idToReset],
      studentTeacherInputs.value[idToReset]
    );
    studentPasswordInputs.value[idToReset] = ""; // Clear input on success
  } catch (error) {
    console.error("Error resetting student password:", error);
  } finally {
    loading.value = false;
  }
}

// Watch for changes in the students array and log updates
watch(
  () => students.value,
  (newStudents) => {
    console.log("Students updated:", newStudents);
  },
  { deep: true } // Deep watch to detect nested changes
);
</script>

<template>
  <!-- Main card container -->
  <v-card class="mt-4">
    <!-- Header displaying the entity type -->
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
        <!-- Slot for password reset functionality -->
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
                  <!-- Append reset button -->
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
        <!-- Slot for assigning teachers -->
        <template v-slot:item.teacher="{ item }">
          <v-select
            v-model="studentTeacherInputs[item.id]"
            :items="teachers"
            item-title="name"
            item-value="id"
            hide-details="auto"
          ></v-select>
        </template>

        <!-- Slot for password reset functionality -->
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
                  <!-- Append reset button -->
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
