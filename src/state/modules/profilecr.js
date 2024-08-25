import { axiosInstance } from "../../axios";

export const state = {
  admissiondata: [],
  patient: [],
};

export const mutations = {
  setEcr(state, newValue) {
    state.ecr = newValue;
  },
  setEcr(state, newValue) {
    state.ecr = newValue;
  },
};

export const actions = {
  fetchEcr: async ({ commit, state }) => {
    try {
      const response = await axiosInstance.get("/er-cards/", {
        params: {
          page: state.page,
          is_active: true,
        },
      });

      commit("setEcr", response.data);
      commit("setPageCount", response.data.page_count);
      commit("setCount", response.data.count);
    } catch (error) {
      console.error(error);
    }
  },
};
