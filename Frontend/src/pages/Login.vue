<script lang="ts" setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";

const authStore = useAuthStore();

const visible = ref(false);
const loading = ref(false);

const email = ref("");
const password = ref("");

async function login() {
  loading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await authStore.login(email.value, password.value);
  } catch (error) {
    console.error("Error adding login:", error);
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

const passwordRules = ref([
  (v: string) => {
    return loading.value || !!v || "Password is required";
  },
]);
</script>

<template>
  <v-container
    fluid
    class="d-flex justify-center align-center"
    style="height: 100%"
  >
    <v-card
      class="mx-auto pa-12 pb-8"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <v-card v-if="authStore.error" class="mb-4" color="red" variant="tonal">
        <v-card-text class="text-high-emphasis text-caption">
          {{ authStore.error }}
        </v-card-text>
      </v-card>

      <v-form @submit.prevent="login()">
        <div class="text-subtitle-1 text-medium-emphasis">Account</div>

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

        <v-card class="mt-4 mb-10" color="surface-variant" variant="tonal">
          <v-card-text class="text-medium-emphasis text-caption">
            Warning: After 3 consecutive failed login attempts, you account will
            be temporarily locked for three hours. If you must login now, you
            can also click "Forgot login password?" below to reset the login
            password.
          </v-card-text>
        </v-card>

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
