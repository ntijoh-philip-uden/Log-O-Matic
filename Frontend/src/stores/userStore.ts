import { defineStore } from "pinia";
import { API_BASE_URL } from "../../config";
import { useAuthStore } from "./authStore";

const authStore = useAuthStore();

export interface IUsers {
  id: number;
  email: string;
  name: string;
  role: number;
  teacherId: number | null;
}

export interface IUsersFromFetch {
  id: number;
  email: string;
  username: string;
  role: number;
  teacher_id: number | null;
}

export interface ITeacher {
  id: number;
  email: string;
  name: string;
  role: number;
  teacherId: null;
}

export interface IStudent {
  id: number;
  email: string;
  name: string;
  role: number;
  teacherId: number;
}

export const useUserStore = defineStore("users", {
  state: () => ({
    users: [] as IUsers[],
    nextId: 4,
  }),

  getters: {
    byId(state) {
      return (id: number): IUsers | undefined => {
        return state.users.find((user) => user.id === id);
      };
    },
    byEmail(state) {
      return (email: string): IUsers[] | undefined => {
        return state.users.filter((user) => user.email === email);
      };
    },
    byName(state) {
      return (name: string): IUsers[] => {
        return state.users.filter((user) => user.name === name);
      };
    },
    byTeacherId(state) {
      return (teacherId: number): IUsers[] => {
        return state.users.filter((user) => user.teacherId === teacherId);
      };
    },
    allTeachers(state) {
      return (): ITeacher[] =>
        state.users.filter(
          (user) => user.role <= 2 && user.teacherId == null
        ) as ITeacher[];
    },
    allStudents(state) {
      return (): IStudent[] =>
        state.users
          .filter((user) => user.role === 3)
          .map((student) => {
            const teacher = state.users.find(
              (user) => user.id === student.teacherId
            );
            return {
              ...student,
              teacherName: teacher ? teacher.name : "No Teacher Assigned",
            };
          }) as IStudent[];
    },
  },

  actions: {
    async fetchWithAuth(url: string, options: RequestInit = {}) {
      const token = authStore.token;
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return response.json();
    },
    async loadUsers() {
      const data = (await this.fetchWithAuth(
        `${API_BASE_URL}/api/v1/users`
      )) as IUsersFromFetch[];
      this.users = data.map((innerData) => {
        return {
          id: innerData.id,
          email: innerData.email,
          name: innerData.username,
          role: innerData.role,
          teacherId: innerData.teacher_id,
        } as IUsers;
      });
    },
    async addNew(
      email: string,
      name: string,
      password: string,
      role: number,
      teacherId: number | null
    ) {
      await this.fetchWithAuth(`${API_BASE_URL}/api/v1/users`, {
        method: "POST",
        body: JSON.stringify({ email, name, password, role, teacherId }),
      });
      await this.loadUsers();
    },
    async resetPassword(id: number, password: string) {
      await this.fetchWithAuth(`${API_BASE_URL}/api/v1/user/resetPassword`, {
        method: "POST",
        body: JSON.stringify({ id, password }),
      });
      await this.loadUsers();
    },
    async changeTeacher(id: number, teacherId: number) {
      await this.fetchWithAuth(`${API_BASE_URL}/api/v1/student/changeTeacher`, {
        method: "POST",
        body: JSON.stringify({ id, teacherId }),
      });
      await this.loadUsers();
    },
  },
});
