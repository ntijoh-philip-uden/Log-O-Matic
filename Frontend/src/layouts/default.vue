<template>
  <v-app>

    <v-system-bar>
        <v-icon icon="mdi-wifi-strength-4"></v-icon>
        <v-icon icon="mdi-signal" class="ms-2"></v-icon>
        <v-icon icon="mdi-battery" class="ms-2"></v-icon>
    </v-system-bar>

    <v-header>
      <v-app-bar :elevation="6">
        <v-app-bar-title>Log-O-Matic</v-app-bar-title>

        <template v-slot:append>
          <v-btn v-if="Token && Teacher" @click="router.push('/Admin')">
            <v-icon icon="mdi-cog" />
            Admin
          </v-btn>

          <v-btn v-if="Token" @click="router.push('/Logs')">
            <v-icon icon="mdi-format-list-bulleted" />
            Logs
          </v-btn>

          <v-btn v-if="!Token" @click="router.push('/Login')">
            <v-icon icon="mdi-lock-open" />
            Sign in
          </v-btn>

          <v-btn v-if="Token" @click="router.push('/Logout')">
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

<script lang="ts" setup>
  import router from '@/router'
  const Token = ""
  const Teacher = true
</script>
