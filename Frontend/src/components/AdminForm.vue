<script lang="ts" setup>
import { ref, defineProps } from "vue";
import { useTeachersStore } from "@/stores/teacherStore";
import { useStudentsStore } from "@/stores/studentStore";

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

const teacherStore = useTeachersStore();
const studentStore = useStudentsStore();

const loading = ref(false);

const newTeacher = ref({ email: "", name: "", password: "" });
const newStudent = ref({ email: "", name: "", teacher: "", password: "" });

const teachers = teacherStore.teachers;

async function handleAddTeacher() {
  loading.value = true;
  try {
    await teacherStore.addNew(
      newTeacher.value.email,
      newTeacher.value.name,
      newTeacher.value.password
    );
    newTeacher.value = { email: "", name: "", password: "" };
  } catch (error) {
    console.error("Error adding teacher:", error);
  } finally {
    loading.value = false;
  }
}

async function handleAddStudent() {
  loading.value = true;
  try {
    await studentStore.addNew(
      newStudent.value.email,
      newStudent.value.name,
      newStudent.value.password,
      parseInt(newStudent.value.teacher)
    );
    newStudent.value = { email: "", name: "", teacher: "", password: "" };
  } catch (error) {
    console.error("Error adding student:", error);
  } finally {
    loading.value = false;
  }
}

const emailRules = ref([
  (v: string) => {
    if (loading.value) return true;
    return !!v || "Email is required";
  },
  (v: string) =>
    loading.value ||
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ||
    "Enter a valid email address",
]);

const nameRules = ref([
  (v: string) => {
    return loading.value || !!v || "Name is required";
  },
]);

const passwordRules = ref([
  (v: string) => {
    return loading.value || !!v || "Password is required";
  },
]);

const teacherRules = ref([
  (v: string) => {
    return loading.value || !!v || "Teacher is required";
  },
]);
</script>

<template>
  <!-- Conditionally render the form based on the `type` prop -->
  <v-card class="mt-4" v-if="props.type === 'student'">
    <v-container>
      <v-app-bar-title class="text-h5">Add New Student</v-app-bar-title>
    </v-container>
    <v-container>
      <v-form @submit.prevent="handleAddStudent">
        <v-row no-gutters>
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
