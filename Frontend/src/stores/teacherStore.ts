import { defineStore } from "pinia";
import router from "../router";

export interface ITeacher {
    id: number;
    email: string;
    name: string;
}

export const useTeachersStore = defineStore("teachers", {
  state: () => ({
    teachers: [{
        id: 0,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley",
    },
    {
        id: 1,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley",
    },
    {
        id: 2,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley",
    },
    {
        id: 3,
        email: "kevin.radley@elev.ga.ntig.se",
        name: "Kevin Radley",
    }] as ITeacher[]
  }),

  getters: {
    byId(state) {
        return (id: number): ITeacher | undefined => {
            return state.teachers.find((teacher) => teacher.id === id);
        };
    },
  },

  actions: {
    async addNew(name: string, email: string, password: string) {

    },
    async resetPassword(teacher: ITeacher, newPassword: string) {
        
    }
  },
});
