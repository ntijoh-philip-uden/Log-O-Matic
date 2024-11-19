<script lang="ts" setup>
import { ref, defineProps, computed, watch } from "vue";
import { useTeachersStore } from "@/stores/teacherStore";
import { useStudentsStore } from "@/stores/studentStore";

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
});

const teacherStore = useTeachersStore();
const studentStore = useStudentsStore();

const teachersHeaders = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "", key: "exclusive", sortable: false },
];

const studentsHeaders = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Teacher", key: "teacher", sortable: false },
  { title: "", key: "exclusive", sortable: false },
];

const teachers = ref(teacherStore.teachers);
const students = ref(studentStore.students);

const loading = ref(false);

const teacherPasswordInputs = ref<Record<number, string>>({});
const studentPasswordInputs = ref<Record<number, string>>({});
const studentTeacherInputs = computed(() => {
  return students.value.reduce((acc: Record<number, number>, student) => {
    acc[student.id] = student.teacherId;
    return acc;
  }, {});
});

async function handleResetTeacherPassword(idToReset: number) {
  loading.value = true;
  try {
    await teacherStore.resetPassword(
      teachers.value[idToReset],
      teacherPasswordInputs.value[idToReset]
    );
    teacherPasswordInputs.value[idToReset] = "";
  } catch (error) {
    console.error("Error resetting teacher password:", error);
  } finally {
    loading.value = false;
  }
}

async function handleResetStudentPassword(idToReset: number) {
  loading.value = true;
  try {
    await studentStore.resetPassword(
      students.value[idToReset],
      studentPasswordInputs.value[idToReset]
    );
    await studentStore.changeTeacher(
      students.value[idToReset],
      studentTeacherInputs.value[idToReset]
    );
    studentPasswordInputs.value[idToReset] = "";
  } catch (error) {
    console.error("Error resetting student password:", error);
  } finally {
    loading.value = false;
  }
}

watch(
  () => students.value,
  (newStudents) => {
    console.log("Students updated:", newStudents);
  },
  { deep: true }
);
</script>

<template>
  <v-card class="mt-4">
    <v-container>
      <v-app-bar-title class="text-h5">{{
        props.type === "teacher" ? "Teachers" : "Students"
      }}</v-app-bar-title>
    </v-container>

    <v-container>
      <v-data-table
        v-if="props.type === 'teacher'"
        :items="teachers"
        :headers="teachersHeaders"
        hide-default-footer
      >
        <template v-slot:item.exclusive="{ item }">
          <v-form
            @submit.prevent="handleResetTeacherPassword(item.id)"
            :key="item.id"
          >
            <v-row no-gutters>
              <v-col xs="12" sm="12" md="12">
                <v-text-field
                  v-model="teacherPasswordInputs[item.id]"
                  label="Password"
                  required
                  style="max-width: 100%"
                  hide-details="auto"
                  type="password"
                >
                  <template v-slot:append>
                    <v-btn
                      variant="outlined"
                      type="submit"
                      block
                      :disabled="loading"
                      :loading="loading"
                    >
                      Reset
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </template>
      </v-data-table>

      <v-data-table
        v-else
        :items="students"
        :headers="studentsHeaders"
        hide-default-footer
      >
        <template v-slot:item.teacher="{ item }">
          <v-select
            v-model="studentTeacherInputs[item.id]"
            :items="teachers"
            item-title="name"
            item-value="id"
            hide-details="auto"
          ></v-select>
        </template>
        <template v-slot:item.exclusive="{ item }">
          <v-form
            @submit.prevent="handleResetStudentPassword(item.id)"
            :key="item.id"
          >
            <v-row no-gutters>
              <v-col xs="12" sm="12" md="12">
                <v-text-field
                  v-model="studentPasswordInputs[item.id]"
                  label="Password"
                  required
                  style="max-width: 100%"
                  hide-details="auto"
                  type="password"
                >
                  <template v-slot:append>
                    <v-btn
                      variant="outlined"
                      type="submit"
                      block
                      :disabled="loading"
                      :loading="loading"
                    >
                      Reset
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </template>
      </v-data-table>
    </v-container>
  </v-card>
</template>
