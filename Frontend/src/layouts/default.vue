<script lang="ts" setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);

if (!isAuthenticated.value) {
  switch (router.currentRoute.value.path) {
    case "/Login":
      break;
    default:
      router.push("/Login");
      break;
  }
}
</script>

<template>
  <v-app>
    <v-system-bar>
      <v-icon icon="mdi-wifi-strength-4"></v-icon>
      <v-icon icon="mdi-signal" class="ms-2"></v-icon>
      <v-icon icon="mdi-battery" class="ms-2"></v-icon>
    </v-system-bar>

    <v-header>
      <v-app-bar :elevation="6">
        <v-app-bar-title class="text-h5" @click="router.push('/')"
          >Log-O-Matic</v-app-bar-title
        >

        <template v-slot:append>
          <v-btn
            v-if="isAuthenticated && isAdmin"
            @click="router.push('/admin')"
          >
            <v-icon icon="mdi-cog" />
            Admin
          </v-btn>

          <v-btn v-if="isAuthenticated" @click="router.push('/logs/logs')">
            <v-icon icon="mdi-format-list-bulleted" />
            Logs
          </v-btn>

          <v-btn v-if="!isAuthenticated" @click="router.push('/Login')">
            <v-icon icon="mdi-lock-open" />
            Sign in
          </v-btn>

          <v-btn v-if="isAuthenticated" @click="authStore.logout()">
            <v-icon icon="mdi-lock" />
            Log out
          </v-btn>
        </template>
      </v-app-bar>
    </v-header>
    <v-main>
      <router-view />
    </v-main>

    <AppFooter />
  </v-app>
</template>
