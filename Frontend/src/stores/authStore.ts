import { defineStore } from "pinia";
import { API_BASE_URL } from "../../config";
import router from "../router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") as string | null,
    username: localStorage.getItem("username") as string | null,
    role: localStorage.getItem("role") as string | null,
    loginTries: 1,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.role,
    isAdmin: (state) => (state.role ? parseInt(state.role) == 1 : false),
    isTeacher: (state) =>
      state.role
        ? parseInt(state.role) == 2 && parseInt(state.role) == 1
        : false,
    isStudent: (state) => (state.role ? parseInt(state.role) == 3 : false),
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
          this.error = errorData.message || "Login failed";
          return;
        }

        this.loginTries = 0;

        const data = (await response.json()) as {
          token: string;
          username: string;
          role: number;
        };

        this.token = data.token;
        this.username = data.username;
        this.role = data.role.toString();

        localStorage.setItem("token", this.token!);
        localStorage.setItem("username", this.username!);
        localStorage.setItem("role", this.role!);

        switch (this.role ? parseInt(this.role) : -1) {
          case 1:
            router.push("/admin");
            break;
          case 2:
            router.push("/logs");
            break;
          case 3:
            router.push("/studentindex");
            break;
          default:
            router.push("/");
            break;
        }
      } catch (err: any) {
        this.error = "An error occurred";
      }
    },
    logout() {
      this.token = null;
      this.username = null;
      this.role = null;
      this.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");

      router.push("/Login");
    },
  },
});
