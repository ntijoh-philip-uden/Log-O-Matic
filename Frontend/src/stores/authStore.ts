import { defineStore } from "pinia";
import { API_BASE_URL } from "../../config";
import router from "../router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") as string | null,
    role: localStorage.getItem("role") as string | null,
    loginTries: 1,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.role,
  },

  actions: {
    async login(email: string, password: string) {
      if (this.loginTries > 3) {
        this.error = "To meny tries please try again later";
        return;
      }
      this.loginTries++;
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        });

        if (!response.ok) {
          this.loginTries++;
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        }

        const data = await response.json();
        this.token = data.token;
        this.role = data.role;

        localStorage.setItem("token", this.token!);
        localStorage.setItem("role", this.role!);

        router.push("/adminPage");
      } catch (err: any) {
        this.error = "An error occurred";
      }
    },
    logout() {
      this.token = null;
      this.role = null;
      this.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("role");

      router.push("/Login");
    },
  },
});
