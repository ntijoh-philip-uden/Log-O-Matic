import { defineStore } from "pinia";

export interface IStudent {
  id: number;
  email: string;
  name: string;
  teacherId: number;
}

export const useStudentsStore = defineStore("students", {
  state: () => ({
    students: [
      {
        id: 0,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley",
        teacherId: 0,
      },
      {
        id: 1,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley",
        teacherId: 1,
      },
      {
        id: 2,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley",
        teacherId: 2,
      },
      {
        id: 3,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley",
        teacherId: 3,
      },
    ] as IStudent[],
    nextId: 4,
  }),

  getters: {
    byId(state) {
      return (id: number): IStudent | undefined => {
        return state.students.find((student) => student.id === id);
      };
    },
    byEmail(state) {
      return (email: string): IStudent[] | undefined => {
        return state.students.filter((student) => student.email === email);
      };
    },
    byName(state) {
      return (name: string): IStudent[] => {
        return state.students.filter((student) => student.name === name);
      };
    },
    byTeacherId(state) {
      return (teacherId: number): IStudent[] => {
        return state.students.filter(
          (student) => student.teacherId === teacherId
        );
      };
    },
  },

  actions: {
    async addNew(
      email: string,
      name: string,
      password: string,
      teacherId: number
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace this with actual async operation
      this.students.push({
        id: this.nextId++,
        email: email,
        name: name,
        teacherId: teacherId,
      });
    },
    async resetPassword(student: IStudent, newPassword: string) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace this with actual async operation
    },
    async changeTeacher(student: IStudent, newTeacherId: number) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Replace this with actual async operation
      const findStudent = this.students.find(
        (findStudent) => (findStudent = student)
      );
      if (findStudent) {
        findStudent.teacherId = newTeacherId;
      }
    },
  },
});
