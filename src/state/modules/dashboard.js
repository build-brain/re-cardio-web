
import { axiosInstance } from "@/axios";

export const state = {
   stat:[],
   
  lethalityForecast: [],
  avgWalkingDistance: [],
  patientDistribution: [],
  admissions_over_time:[],
  nyha_distribution: [],
  // добавьте другие состояния по необходимости
};

export const mutations = {
   setState(state, stat){
      state.stat = stat;
   },
  setLethalityForecast(state, data) {
    state.lethalityForecast = data;
  },
  setAvgWalkingDistance(state, data) {
    state.avgWalkingDistance = data;
  },
  setPatientDistribution(state, data) {
    state.patientDistribution = data;
  },
  setPatientAdmissionOverTime(state, data) {
    state.admissions_over_time = data;
  },
  setPatientnyhaDistribution(state, data) {
    state.nyha_distribution = data;
  }
  
  // добавьте другие мутации по необходимости
};

export const actions = {
  getStat: async ({ commit }) => {
    try {
      const response = await axiosInstance.get("/statistics/");
      const data = response.data;

      // Мутируйте состояние только с нужными данными
      commit("setState", response.data);
      commit("setLethalityForecast", data.lethality_forecast || []);
      commit("setAvgWalkingDistance", data.avg_walking_distance || []);
      commit("setPatientDistribution", data.patient_distribution || []);
      commit("setPatientAdmissionOverTime", data.admissions_over_time || []);
      commit("setPatientnyhaDistribution", data.nyha_distribution || []);
      // мутируйте другие данные по необходимости
    } catch (error) {
      console.error(error);
    }
  },
};

export const getters = {
   currenrstat: (state) => state.stat,
  lethalityForecast: (state) => state.lethalityForecast,
  avgWalkingDistance: (state) => state.avgWalkingDistance,
  patientDistribution: (state) => state.patientDistribution,
  patientAdmissionOverTime: (state) => state.admissions_over_time,
  nyhaDistribution: (state) => state.nyha_distribution,
  // добавьте другие геттеры по необходимости
};
