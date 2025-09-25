import { axiosInstance } from "../../axios";

export const state = {
    patients: {},
    count: 0,
    page_count: 1,
    page:1,
    icd:[],
};

export const getters = {
    patients: state => state.patients,
    icd: state => state.icd
};

export const mutations = {
    setPatients(state, newValue) {
        state.patients = newValue;
    },
    setCount(state, count) {
        state.count = count;
    },
    setPageCount(state, page_count) {
        state.page_count = page_count;
    },

    setIcd(state, newValue){
        state.icd = newValue;
    },
    sortPatients(state, { column, direction }) {
        state.patients.results.sort((a, b) => {
          const res = a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0;
          return direction === 'asc' ? res : -res;
        });
    },
    removePatient(state, { id }) {
 
        if (Array.isArray(state.patients.results)) {
          state.patients.results = state.patients.results.filter(patient => patient.id !== id);
        } else {  console.error('state.patients is not an array in removePatient mutation');
        }
      }
};

export const actions = {
    fetchPatients: async ({ commit, state }, { after, before, ethnicity, socialGroup, gender, district, search, active, with_active, page }) => {
        try {
            const response = await axiosInstance.get('/patients/', {
                params: {
                  page: page ?? state.page,
                  birth_date_after: after,
                  birth_date_before: before,
                  social_group: socialGroup,
                  gender: gender,
                  district: district,
                  search: search,
                  has_active_ercard: active,
                  ethnicity: ethnicity,
                  without_er_card: with_active,
                },
              });
    
            commit('setPatients', response.data);
            commit('setPageCount', response.data.page_count);
            commit('setCount', response.data.count);
        } catch (error) {
            console.error(error);
        }
    },
    getICD: async({commit }) =>{
        try{
            const response = await axiosInstance.get('/icd/');
            commit('setIcd', response.data);
          
        }
        catch(e){
            console.error(e)
        }
    },
    deletePatient: async ({ commit }, id) => {
        try {
            const response = await axiosInstance.delete(`/patients/${id}/`);
            if (response.status === 204) {
                commit('removePatient', { id });
            }
        } catch (error) {
            console.error('Failed to delete patient:', error);
            throw error;
        }
    }

};

    
