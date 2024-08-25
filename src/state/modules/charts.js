import { axiosInstance } from "../../axios";

export const state = {
    arterial_pressure_statistic: [],
    blood_saturation: [],
    body_temperature: [],
    dyspnea: [],
    fatigue: [],
    heart_pain: [],
    medicine_taken: [],
    physical_activity: [],
    pulse_rate: [],
    respiratory_condition: [],
    respiratory_rate: [],
    reverseSort: false, // Начальное значение направления сортировки
    sortKey: 'creation_date', 
    currentDataKey: '', //
};

export const mutations = {
    setArterialPressureStatistic(state, data) {
        state.arterial_pressure_statistic = data;
    },
    setBloodSaturation(state, data) {
        state.blood_saturation = data;
    },
    setBodyTemperature(state, data) {
        state.body_temperature = data;
    },
    setDyspnea(state, data) {
        state.dyspnea = data;
    },
    setFatigue(state, data) {
        state.fatigue = data;
    },
    setHeartPain(state, data) {
        state.heart_pain = data;
    },
    setMedicineTaken(state, data) {
        state.medicine_taken = data;
    },
    setPhysicalActivity(state, data) {
        state.physical_activity = data;
    },
    setPulseRate(state, data) {
        state.pulse_rate = data;
    },
    setRespiratoryCondition(state, data) {
        state.respiratory_condition = data;
    },
    setRespiratoryRate(state, data) {
        state.respiratory_rate = data;
    },

    sortData(state, { dataKey, sortKey }) {
        const dataList = state[dataKey].slice(); // Создаем копию массива для сортировки
    
        // Меняем направление сортировки при клике на колонку
        if (state.sortKey === sortKey && state.currentDataKey === dataKey) {
            state.reverseSort = !state.reverseSort; // Изменяем направление сортировки
        } else {
            state.reverseSort = false; // Сбрасываем направление сортировки, если меняется ключ
        }
        state.sortKey = sortKey; // Устанавливаем новый ключ сортировки
        state.currentDataKey = dataKey; // Устанавливаем текущий массив данных
    
        // Сортировка по выбранному ключу и текущему направлению
        dataList.sort((a, b) => {
            let aValue = a[sortKey];
            let bValue = b[sortKey];
    
            // Преобразуем значения при необходимости (например, даты)
            if (sortKey === 'creation_date') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                aValue = aValue ? 1 : 0;
                bValue = bValue ? 1 : 0;
            }
    
            if (state.reverseSort) {
                if (aValue < bValue) return 1;
                if (aValue > bValue) return -1;
                return 0;
            } else {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
                return 0;
            }
        });
    
        // Обновляем состояние с отсортированным списком
        state[dataKey] = dataList;
    }
    
};

export const actions = {
    getCharts: async ({ commit }, { ecr }) => {
        try {
            const response = await axiosInstance.get(`/health-diary-records/`, {
                params: {
                    er_card: ecr
                }
            });

            const records = response.data;
            const arterialPressureStatistic = [];
            const bloodSaturation = [];
            const bodyTemperature = [];
            const dyspnea = [];
            const fatigue = [];
            const heartPain = [];
            const medicineTaken = [];
            const physicalActivity = [];
            const pulseRate = [];
            const respiratoryCondition = [];
            const respiratoryRate = [];

            records.forEach(record => {
                arterialPressureStatistic.push({
                    systolic_pressure: record.systolic_pressure,
                    diastolic_pressure: record.diastolic_pressure,
                    creation_date: record.creation_date
                });

                bloodSaturation.push({
                    blood_saturation: record.blood_saturation,
                    creation_date: record.creation_date
                });

                bodyTemperature.push({
                    body_temperature: record.body_temperature,
                    creation_date: record.creation_date
                });

                dyspnea.push({
                    dyspnea: record.dyspnea,
                    dyspnea_type: record.dyspnea_type,
                    creation_date: record.creation_date
                });

                fatigue.push({
                    fatigue: record.fatigue,
                    fatigue_type: record.fatigue_type,
                    creation_date: record.creation_date
                });

                heartPain.push({
                    heart_pain: record.heart_pain,
                    heart_pain_type: record.heart_pain_type,
                    creation_date: record.creation_date
                });

                medicineTaken.push({
                    medicine_taken: record.medicine_taken,
                    creation_date: record.creation_date
                });

                physicalActivity.push({
                    walking_duration: record.walking_duration,
                    distance_covered: record.distance_covered,
                    step_count: record.step_count,
                    creation_date: record.creation_date
                });

                pulseRate.push({
                    pulse_rate: record.pulse_rate,
                    pulse_on_exertion: record.pulse_on_exertion,
                    creation_date: record.creation_date
                });

                respiratoryCondition.push({
                    moist_rales: record.moist_rales,
                    peripheral_edema: record.peripheral_edema,
                    creation_date: record.creation_date
                });

                respiratoryRate.push({
                    respiratory_rate: record.respiratory_rate,
                    breathing_rhythm: record.breathing_rhythm,
                    creation_date: record.creation_date
                });
            });

            commit('setArterialPressureStatistic', arterialPressureStatistic);
            commit('setBloodSaturation', bloodSaturation);
            commit('setBodyTemperature', bodyTemperature);
            commit('setDyspnea', dyspnea);
            commit('setFatigue', fatigue);
            commit('setHeartPain', heartPain);
            commit('setMedicineTaken', medicineTaken);
            commit('setPhysicalActivity', physicalActivity);
            commit('setPulseRate', pulseRate);
            commit('setRespiratoryCondition', respiratoryCondition);
            commit('setRespiratoryRate', respiratoryRate);

        } catch (error) {
            console.error(error);
        }
    }
};
  
export const getters = {
    arterialPressureStatistic: state => state.arterial_pressure_statistic,
    bloodSaturation: state => state.blood_saturation,
    bodyTemperature: state => state.body_temperature,
    dyspnea: state => state.dyspnea,
    fatigue: state => state.fatigue,
    heartPain: state => state.heart_pain,
    medicineTaken: state => state.medicine_taken,
    physicalActivity: state => state.physical_activity,
    pulseRate: state => state.pulse_rate,
    respiratoryCondition: state => state.respiratory_condition,
    respiratoryRate: state => state.respiratory_rate
};
  

  //arterial_pressure_statistic:[],

//   {
//     "systolic_pressure": null,
//     "diastolic_pressure": null,
//     "creation_date": null
// }

 //blood_saturation:[],
// {
//     "blood_saturation": null,
//     "creation_date": null
// }

//body_temperature:[],
// {
//     "body_temperature": null,
//     "creation_date": null
// }

//dyspnea
// {
//     "dyspnea": false,
//     "dyspnea_type": null,
//     "creation_date": null
// }

//fatigue:[]
// {
//     "fatigue": false,
//     "fatigue_type": null,
//     "creation_date": null
// }

//heart_pain:[]
// "heart_pain": false,
// "heart_pain_type": null,
// "creation_date": null

//medicine_taken:[]
// {
//     "medicine_taken": false,
//     "creation_date": null
// }

//physical activity:[]
// {
//     "walking_speed": null,
//     "walking_duration": null,
//     "distance_covered": null,
//     "step_count": null,
//     "borg_scale": null,
//     "creation_date": null
// }

//pulse_rate:[]
// {
//     "pulse_rate": null,
//     "pulse_on_exertion": null,
//     "creation_date": null
// }

//respiratory_condition:[]
// {
//     "moist_rales": false,
//     "peripheral_edema": false,
//     "creation_date": null
// }

//respiratory_rate:[]
// {
//     "respiratory_rate": null,
//     "breathing_rhythm": null,
//     "creation_date": null
// }

// {
//     "id": 1,
//     "creation_date": "2024-07-16",
//     "general_condition": null,
//     "body_temperature": 35.0,
//     "systolic_pressure": null,
//     "diastolic_pressure": null,
//     "pulse_rate": null,
//     "pulse_on_exertion": null,
//     "blood_saturation": null,
//     "respiratory_rate": null,
//     "breathing_rhythm": null,
//     "moist_rales": false,
//     "peripheral_edema": null,
//     "dyspnea": null,
//     "dyspnea_type": null,
//     "fatigue": null,
//     "fatigue_type": null,
//     "heart_pain": null,
//     "heart_pain_type": null,
//     "walking_speed": null,
//     "walking_duration": null,
//     "distance_covered": null,
//     "step_count": null,
//     "borg_scale": null,
//     "created_at": "2024-07-16T09:04:11.723525Z",
//     "updated_at": "2024-07-16T09:04:11.723540Z",
//     "er_card": "6ec37270-2d36-48ea-aad2-ddf74490da22"
// },