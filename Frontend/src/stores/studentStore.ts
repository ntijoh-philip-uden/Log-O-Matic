import { defineStore } from "pinia";
import router from "../router";

export interface IStudent {
    id: number;
    email: string;
    name: string;
    teacherId: number;
}

export const useStudentsStore = defineStore("students", {
  state: () => ({
    students: [{
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
    }] as IStudent[]
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
            return state.students.filter((student) => student.teacherId === teacherId);
        };
    }
  },

  actions: {
    async addNew(name: string, email: string, password: string, teacherId: number) {

    },
    async resetPassword(student: IStudent, newPassword: string) {
        
    },
    async changeTeacher(student: IStudent, newTeacherId: number) {
        
    }
  },
});
