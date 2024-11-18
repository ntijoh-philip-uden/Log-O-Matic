import { defineStore } from "pinia";

export interface ITeacher {
  id: number;
  email: string;
  name: string;
}

export const useTeachersStore = defineStore("teachers", {
  state: () => ({
    teachers: [
      {
        id: 0,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley0",
      },
      {
        id: 1,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley1",
      },
      {
        id: 2,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley2",
      },
      {
        id: 3,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley3",
      },
    ] as ITeacher[],
    nextId: 4,
  }),

  getters: {
    byId(state) {
      return (id: number): ITeacher | undefined => {
        return state.teachers.find((teacher) => teacher.id === id);
      };
    },
  },

  actions: {
    async addNew(email: string, name: string, password: string) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace this with actual async operation
      this.teachers.push({
        id: this.nextId++,
        email: email,
        name: name,
      });
    },
    async resetPassword(teacher: ITeacher, newPassword: string) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace this with actual async operation
    },
  },
});
