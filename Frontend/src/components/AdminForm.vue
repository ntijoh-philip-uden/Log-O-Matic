<script lang="ts" setup>
// Import required Vue and store modules
import { ref, defineProps } from "vue";
import { useTeachersStore } from "@/stores/teacherStore";
import { useStudentsStore } from "@/stores/studentStore";

// Define component props
const props = defineProps({
  type: {
    type: String,
    required: true, // Determines whether the form is for 'teacher' or 'student'
  },
});

// Initialize teacher and student stores
const teacherStore = useTeachersStore();
const studentStore = useStudentsStore();

// Loading state to disable inputs while submitting
const loading = ref(false);

// Reactive objects for new teacher and student input fields
const newTeacher = ref({ email: "", name: "", password: "" });
const newStudent = ref({ email: "", name: "", teacher: "", password: "" });

// List of teachers to populate the dropdown in the student form
const teachers = teacherStore.teachers;

// Function to handle adding a new teacher
async function handleAddTeacher() {
  loading.value = true; // Start loading state
  try {
    await teacherStore.addNew(
      newTeacher.value.email,
      newTeacher.value.name,
      newTeacher.value.password
    );
    newTeacher.value = { email: "", name: "", password: "" }; // Clear form on success
  } catch (error) {
    console.error("Error adding teacher:", error);
  } finally {
    loading.value = false; // End loading state
  }
}

// Function to handle adding a new student
async function handleAddStudent() {
  loading.value = true; // Start loading state
  try {
    await studentStore.addNew(
      newStudent.value.email,
      newStudent.value.name,
      newStudent.value.password,
      parseInt(newStudent.value.teacher)
    );
    newStudent.value = { email: "", name: "", teacher: "", password: "" }; // Clear form on success
  } catch (error) {
    console.error("Error adding student:", error);
  } finally {
    loading.value = false; // End loading state
  }
}

// Validation rules for input fields
const emailRules = ref([
  (v: string) => {
    if (loading.value) return true; // Skip validation if loading
    return !!v || "Email is required"; // Check if input is non-empty
  },
  (v: string) =>
    loading.value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || "Enter a valid email address", // Validate email format
]);

const nameRules = ref([
  (v: string) => loading.value || !!v || "Name is required", // Ensure name is non-empty
]);

const passwordRules = ref([
  (v: string) => loading.value || !!v || "Password is required", // Ensure password is non-empty
]);

const teacherRules = ref([
  (v: string) => loading.value || !!v || "Teacher is required", // Ensure teacher selection is made
]);
</script>

<template>
  <!-- Add Student Form -->
  <v-card class="mt-4" v-if="props.type === 'student'">
    <v-container>
      <v-app-bar-title class="text-h5">Add New Student</v-app-bar-title>
    </v-container>
    <v-container>
      <v-form @submit.prevent="handleAddStudent">
        <v-row no-gutters>
          <!-- Email input for new student -->
          <v-col xs="3" sm="3" md="3">
            <v-text-field
              v-model="newStudent.email"
              :rules="emailRules"
              label="Email"
              required
              style="max-width: 100%"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <!-- Name input for new student -->
          <v-col xs="3" sm="3" md="3">
            <v-text-field
              v-model="newStudent.name"
              :rules="nameRules"
              label="Name"
              required
              style="max-width: 100%"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <!-- Teacher selection for new student -->
          <v-col xs="3" sm="3" md="3">
            <v-select
              v-model="newStudent.teacher"
              :rules="teacherRules"
              :items="teachers"
              label="Teacher"
              item-title="name"
              item-value="id"
              required
              hide-details="auto"
            ></v-select>
          </v-col>
          <!-- Password input for new student -->
          <v-col xs="3" sm="3" md="3">
            <v-text-field
              v-model="newStudent.password"
              :rules="passwordRules"
              label="Password"
              required
              style="max-width: 100%"
              hide-details="auto"
              type="password"
            ></v-text-field>
          </v-col>
        </v-row>
        <!-- Submit button -->
        <v-row justify="end" no-gutters class="mt-4">
          <v-col xs="1" sm="1" md="1">
            <v-btn
              variant="outlined"
              type="submit"
              block
              :disabled="loading"
              :loading="loading"
              >Create</v-btn
            >
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </v-card>

  <!-- Add Teacher Form -->
  <v-card class="mt-4" v-if="props.type === 'teacher'">
    <v-container>
      <v-app-bar-title class="text-h5">Add New Teacher</v-app-bar-title>
    </v-container>
    <v-container>
      <v-form @submit.prevent="handleAddTeacher">
        <v-row no-gutters>
          <!-- Email input for new teacher -->
          <v-col xs="4" sm="4" md="4">
            <v-text-field
              v-model="newTeacher.email"
              :rules="emailRules"
              label="Email"
              required
              style="max-width: 100%"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <!-- Name input for new teacher -->
          <v-col xs="4" sm="4" md="4">
            <v-text-field
              v-model="newTeacher.name"
              :rules="nameRules"
              label="Name"
              required
              style="max-width: 100%"
              hide-details="auto"
            ></v-text-field>
          </v-col>
          <!-- Password input for new teacher -->
          <v-col xs="4" sm="4" md="4">
            <v-text-field
              v-model="newTeacher.password"
              :rules="passwordRules"
              label="Password"
              required
              style="max-width: 100%"
              hide-details="auto"
              type="password"
            ></v-text-field>
          </v-col>
        </v-row>
        <!-- Submit button -->
        <v-row justify="end" no-gutters class="mt-4">
          <v-col xs="1" sm="1" md="1">
            <v-btn
              variant="outlined"
              type="submit"
              block
              :disabled="loading"
              :loading="loading"
              >Create</v-btn
            >
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </v-card>
</template>

