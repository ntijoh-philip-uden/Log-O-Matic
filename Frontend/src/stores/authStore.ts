import { defineStore } from "pinia";
import { API_BASE_URL } from "../../config";
import router from "../router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") as string | null,
    username: localStorage.getItem("username") as string | null,
    userId: localStorage.getItem("userId")
      ? parseInt(localStorage.getItem("userId")!, 10)
      : null,
    role: localStorage.getItem("role")
      ? parseInt(localStorage.getItem("role")!, 10)
      : null,
    loginTries: 1,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.role,
    isAdmin: (state) => state.role === 1,
    isTeacher: (state) => state.role === 2,
    isStudent: (state) => state.role === 3,
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
          id: number;
          role: number;
        };

        this.token = data.token;
        this.username = data.username;
        this.userId = data.id;
        this.role = data.role;

        localStorage.setItem("token", this.token!);
        localStorage.setItem("username", this.username!);
        localStorage.setItem("UserId", this.userId!.toString());
        localStorage.setItem("role", this.role!.toString());

        switch (this.role) {
          case 1:
            router.push("/admin");
            break;
          case 2:
            router.push("/logs/logs");
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
      this.userId = null;
      this.role = null;
      this.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");

      router.push("/Login");
    },
  },
});
