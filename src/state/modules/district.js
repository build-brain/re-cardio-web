import { axiosInstance } from "../../axios";

export const state = {
    regions: [],
    districts: [],
    selectedRegionId: null,
};

export const getters = {
    disricts: state => state.disricts,

};

export const mutations = {
    setRegions(state, regions) {
        state.regions = regions;
      },
      setDistricts(state, districts) {
        state.districts = districts;
      },
      setSelectedRegionId(state, regionId) {
        state.selectedRegionId = regionId;
      },
};

export const actions = {
    async fetchRegions({ commit }) {
      try {
        const response = await axiosInstance.get('/regions/');
        commit('setRegions', response.data.results);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    },
    async fetchDistricts({ commit }, regionId) {
      try {
        const response = await axiosInstance.get(`/districts/?region=${regionId}`);
        commit('setDistricts', response.data.results);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    },
};

    
