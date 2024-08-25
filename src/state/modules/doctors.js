import { axiosInstance } from "../../axios";

export const state = {
    doctors: [],
    count: 0,
    page_count: 1,
    page:1,
};

export const getters = {
    doctors: state => state.doctors,
};
export const mutations = {
    setDoctors(state, newValue) {
        state.doctors = newValue;
    },
    setCount(state, count) {
        state.count = count;
    },
    setPageCount(state, page_count) {
        state.page_count = page_count;
    }, 
    sortPatients(state, { column, direction }) {
        state.doctors.results.sort((a, b) => {
          const res = a[column] < b[column] ? -1 : a[column] > b[column] ? 1 : 0;
          return direction === 'asc' ? res : -res;
        });
    },
    removeDoctors(state, { id }) {
 
        if (Array.isArray(state.doctors.results)) {
          state.doctors.results = state.doctors.results.filter(patient => patient.id !== id);
        } else {  console.error('state.patients is not an array in removePatient mutation');
        }
      }
};

export const actions = {
    fetchDoctors: async ({ commit, state }) => {
        try {
            const response = await axiosInstance.get('/doctors/', {
                params: {
                  page: state.page,
                },
              });
    
            commit('setDoctors', response.data);
            commit('setPageCount', response.data.page_count);
            commit('setCount', response.data.count);
        } catch (error) {
            console.error(error);
        }
    },
    deleteDoctor: async ({ commit }, id) => {
        try {
            const response = await axiosInstance.delete(`/doctors/${id}/`);
            if (response.status === 204) {
                commit('removeDoctors', { id });
            }
        } catch (error) {
            console.error('Failed to delete patient:', error);
            throw error;
        }
    }

};

    
