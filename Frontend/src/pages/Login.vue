<script lang="ts" setup>
import { ref } from "vue"; // Import `ref` to create reactive state variables.
import { useAuthStore } from "@/stores/authStore"; // Import the authentication store for managing login state.

const authStore = useAuthStore(); // Initialize the authentication store.

const visible = ref(false); // State to toggle visibility of the password (e.g., show/hide).
const loading = ref(false); // State to indicate if the login process is in progress.

const email = ref(""); // Reactive state for the user's email input.
const password = ref(""); // Reactive state for the user's password input.

async function login() {
  loading.value = true; // Set `loading` to true to disable UI interactions while logging in.

  try {
    // Simulate a delay to mimic an API call (2 seconds).
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Call the login method from the authentication store, passing email and password.
    await authStore.login(email.value, password.value);
  } catch (error) {
    console.error("Error during login:", error); // Log any errors that occur.
  } finally {
    loading.value = false; // Always reset `loading` state after login attempt.
  }
}

// Validation rules for the email input.
const emailRules = ref([
  (v: string) => {
    if (loading.value) return true; // Skip validation if the form is loading.
    return !!v || "Email is required"; // Ensure the email is not empty.
  },
  (v: string) =>
    loading.value || 
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 
    "Enter a valid email address", // Ensure the email matches a valid format.
]);

// Validation rules for the password input.
const passwordRules = ref([
  (v: string) => {
    return loading.value || !!v || "Password is required"; // Ensure the password is not empty.
  },
]);
</script>


<template>
  <v-container
    fluid
    class="d-flex justify-center align-center"
    style="height: 100%"
  >
    <!-- Container to center the card within the view, taking the full height of the viewport. -->
    <v-card
      class="mx-auto pa-12 pb-8"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <!-- A Vuetify card component styled with padding and elevation. -->
      <!-- Shows error messages from the `authStore` if present. -->
      <v-card v-if="authStore.error" class="mb-4" color="red" variant="tonal">
        <v-card-text class="text-high-emphasis text-caption">
          {{ authStore.error }}
        </v-card-text>
      </v-card>

      <!-- Login form submission handled by the `login` function. -->
      <v-form @submit.prevent="login()">
        <div class="text-subtitle-1 text-medium-emphasis">Account</div>
        <!-- Section title for the email input. -->

        <!-- Email input field with validation rules and icon. -->
        <v-text-field
          v-model="email"
          :rules="emailRules"
          density="compact"
          placeholder="Email address"
          prepend-inner-icon="mdi-email-outline"
          variant="outlined"
        ></v-text-field>

        <div
          class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between"
        >
          Password
        </div>
        <!-- Section title for the password input. -->

        <!-- Password input field with visibility toggle and validation rules. -->
        <v-text-field
          v-model="password"
          :rules="passwordRules"
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          density="compact"
          placeholder="Enter your password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visible = !visible"
        ></v-text-field>

        <!-- Information card with a warning about failed login attempts. -->
        <v-card class="mt-4 mb-10" color="surface-variant" variant="tonal">
          <v-card-text class="text-medium-emphasis text-caption">
            Warning: After 3 consecutive failed login attempts, your account will
            be temporarily locked for three hours. If you must log in now, you
            can also click "Forgot login password?" below to reset the login
            password.
          </v-card-text>
        </v-card>

        <!-- Login button, disabled and showing a loading indicator while `loading` is true. -->
        <v-btn
          class="mb-8"
          color="blue"
          size="large"
          variant="tonal"
          block
          type="submit"
          :disabled="loading"
          :loading="loading"
        >
          Log In
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

