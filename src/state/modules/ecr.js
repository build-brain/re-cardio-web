import Swal from "sweetalert2";
import { axiosInstance } from "../../axios";

export const state = {
  ecr: [],
  patient: [],
  count: 0,
  page_count: 1,
  page: 1,
  selectedIndex: -1,
  complication: [],
  events: [],
  sort: {
    column: "",
    direction: "asc",
  },
};

export const getters = {
  ecr: (state) => state.ecr,
  selectedIndex: (state) => state.selectedIndex,
  complication: (state) => state.complication,
  eventsall: (state) => state.events, // Геттер для получения событий календаря
};

export const mutations = {
  setEcr(state, newValue) {
    state.ecr = newValue;
  },
  setComplication(state, newValue) {
    state.complication = newValue;
  },
  pushToEcr(state, newItem) {
    state.ecr.results.unshift(newItem);
    state.count++;
  },
  setPatient(state, newValue) {
    state.patient = newValue;
  },
  setCount(state, count) {
    state.count = count;
  },
  setPageCount(state, page_count) {
    state.page_count = page_count;
  },
  sortEcr(state, { column, direction }) {
    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((acc, part) => acc && acc[part], obj);
    };

    state.ecr.results.sort((a, b) => {
      const valueA = getNestedValue(a, column);
      const valueB = getNestedValue(b, column);

      const res = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return direction === "asc" ? res : -res;
    });

    state.sort.column = column;
    state.sort.direction = direction;
  },
  removePatient(state, patientId) {
    state.patient.results = state.patient.results.filter(
      (patient) => patient.id !== patientId
    );
  },
  setSelectedIndex(state, index) {
    state.selectedIndex = index;
  },
  filterComplicationByGroup(state, group) {
    state.complication.results = state.complication.results.filter(
      (item) => item.group === group
    );
  },
  // Новая мутация для установки событий календаря
  setEvents(state, events) {
    state.events = events;
  },
};

export const actions = {
  fetchEcr: async (
    { commit },
    {
      page,
      active,
      search_active,
      search_archive,
      curator,
      gender,
      killip,
      stenokard,
      mi_type,
    }
  ) => {
    try {
      const response = await axiosInstance.get("/er-cards/", {
        params: {
          page: page,
          is_active: active,
          search_active: search_active,
          search_archive: search_archive,
          curator: curator,
          gender: gender,
          killip: killip,
          coronary_insufficiency: stenokard,
          mi_type: mi_type,
        },
      });

      commit("setEcr", response.data);
      commit("setPageCount", response.data.page_count);
      commit("setCount", response.data.count);
    } catch (error) {
      console.error(error);
    }
  },
  fetchPatient: async ({ commit }, { active, search, order, without_or_archived_er_card }) => {
    try {
      const response = await axiosInstance.get("/patients/?limit=5", {
        params: {
          has_active_ercard: active,
          search: search,
          ordering: order,
          // ...(without_or_archived_er_card !== undefined && {without_or_archived_er_card })
        },
      });
      commit("setPatient", response.data); // Используйте мутацию setPatients для обновления состояния
    } catch (error) {
      console.error(error);
    }
  },
  addToServerAndPushToEcr: async ({ commit, state }) => {
    try {
      if (state.selectedIndex !== -1) {
        const patientId = state.patient.results[state.selectedIndex].id;

        const response = await axiosInstance.post(
          `/patients/${patientId}/add_ercard/`,
          null
        );

        if (response.status === 201) {
          commit("pushToEcr", response.data);
          commit("setSelectedIndex", -1);
          commit("removePatient", patientId);
          console.log("Пациент успешно удален из списка");
        } else {
          console.error("Ошибка при добавлении записи");
        }
      } else {
        console.error("Пациент не выбран");
      }
      Swal.fire({
        title: "Успешно",
        text: "Пациент успешно добавлен!",
        icon: "success",
        timer: 2500,
        timerProgressBar: true,
      });
    } catch (error) {
      Swal.fire({
        title: "Ошибка",
        text: "Пациент не добавлен!",
        icon: "error",
        timer: 2500,
        timerProgressBar: true,
      });
      console.error(error);
    }
  },
  fetchComplication: async ({ commit }) => {
    try {
      const response = await axiosInstance.get("/complications/");
      commit("setComplication", response.data);
    } catch (error) {
      console.error(error);
    }
  },
  // Обновленный метод fetchEvents для загрузки событий календаря
  fetchEvents: async ({ commit }) => {
    try {
      const response = await axiosInstance.get("/events/");
      
      const events = response.data.map((event) => {

        return {
          id: event.id,
          title: `${event.patient_first_name} ${event.patient_last_name}`,
          start: event.start_date,
          end: event.end_date,
          className: String(event.type),
          extendedProps: {
            location: event.location,
            description: event.description,
            patient_first_name: event.patient_first_name,
            patient_last_name: event.patient_last_name,
            patient_middle_name: event.patient_middle_name,
          },
          er_card: event.er_card,
        };
  
      });
  
      console.log(events);
  
      commit("setEvents", events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  },
  
};
