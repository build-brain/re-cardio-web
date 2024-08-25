<template>
    <div>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Физическая активность</h5>
                        <div class="flex-shrink-0">
                            <div class="d-flex gap-1 flex-wrap">
                                <BButton @click="createAppModal = true" type="button" class="add-btn" variant="success"
                                    id="create-btn">
                                    <i class="ri-add-line align-bottom me-1"></i> {{ $t('add') }}
                                </BButton>
                                <BButton class="btn btn-soft-danger" id="remove-actions">
                                    <i class="ri-delete-bin-2-line"></i>
                                </BButton>
                            </div>
                        </div>
                    </div>
                </BCardHeader>
                <BCardBody class="border border-dashed border-end-0 border-start-0">
                    <BForm>
                        <BRow class="g-3">
                            <BCol xxl="2" sm="6">
                                <div class="search-box">
                                    <input v-model="searchTerm" type="search" class="form-control search"
                                        placeholder="Поиск....">
                                    <i class="ri-search-line search-icon"></i>
                                </div>
                            </BCol>
                        </BRow>
                    </BForm>
                </BCardBody>
                <BCardBody class="pt-3">
                    <div>
                        <div class="table-responsive table-card mb-1">
                            <table class="table table-nowrap align-middle" id="jobListTable">
                                <thead class="text-muted table-light">
                                    <tr class="text-uppercase">
                                        <th class="small-font sort"
                                            @click="sortBy('creation_date', 'physical_activity')">
                                            Дата
                                        </th>
                                        <th class="small-font sort"
                                            @click="sortBy('walking_duration', 'physical_activity')">
                                            Время Ходьбы
                                        </th>
                                        <th class="small-font sort"
                                            @click="sortBy('distance_covered', 'physical_activity')">
                                            Дистанция
                                        </th>
                                        <th class="small-font sort" @click="sortBy('step_count', 'physical_activity')">
                                            Количество Шагов
                                        </th>

                                    </tr>
                                </thead>
                                <tbody class="list form-check-all">
                                    <tr v-for="(item, index) in filteredTempList" :key="index">
                                        <td>
                                            <span>
                                                {{ item.creation_date }}
                                            </span>

                                        </td>
                                        <td>
                                            <span class="ps-4">
                                                {{ item.walking_duration }} мин
                                            </span>
                                        </td>

                                        <td>
                                            <span class="ps-4">
                                                {{ item.distance_covered }} м
                                            </span>
                                        </td>
                                        <td>
                                            <span class="ps-4">
                                                {{ item.step_count }}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredTempList.length === 0">
                                        <td colspan="2" class="text-center">Пусто! Нет результатов</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="d-flex justify-content-end align-items-center my-3">
                            <router-link :to="`/ecr/add-stat/${route.params.id}`">
                                <button type="button" class="btn btn-danger">Назад</button>
                            </router-link>
                        </div>
                    </div>
                </BCardBody>
            </BCard>
        </BCol>

        <BModal v-model="createAppModal" id="showModal" title="Добавить физическую активность"
            header-class="bg-light p-3" title-class="exampleModalLabel" hide-footer class="v-modal-custom" centered>
            <BForm autocomplete="off" id="addform" class="tablelist-form">
                <BCardBody class="border  border-0">
                    <BForm @submit.prevent="addTemp">
                        <BRow class="g-3">
                            <BCol sm="12">
                                <div class="mt-3">
                                    <label class="form-label">Дата </label>
                                    <flat-pickr placeholder="Выберите дату" v-model="form_temp.creation_date"
                                        :config="dateConfig" class="form-control flatpickr-input"
                                        id="caledate"></flat-pickr>
                                        <span v-if="v$.creation_date.$error" class="text-danger">Это обязательное поле</span>
                                </div>

                                <BRow>
                                    <BCol sm="6">
                                        <div class="my-3">
                                            <label class="form-label">Время ходьбы (мин)</label>
                                            <input v-model="form_temp.walking_duration" type="number" :class="{ 'is-invalid': v$.walking_duration.$error }"
                                                placeholder="Введите значение" class="form-control" />
                                                <span v-if="v$.walking_duration.$error" class="text-danger">Это обязательное поле</span>
                                        </div>
                                    </BCol>
                                    <BCol sm="6">
                                        <div class="my-3">
                                            <label class="form-label">Темп ходьбы (шаг/мин)</label>
                                            <select v-model="form_temp.walking_speed" class="form-select" :class="{ 'is-invalid': v$.walking_speed.$error }"> 
                                                <option :value="null" disabled selected>Выберите значение</option>
                                                <option value="80-90">80-90 (шаг/мин)</option>
                                                <option value="100-120">100-120 (шаг/мин)</option>
                                            </select>
                                            <span v-if="v$.walking_speed.$error" class="text-danger">Это обязательное поле</span>

                                        </div>

                                    </BCol>
                                </BRow>
                                <BRow>
                                    <BCol sm="6">
                                        <div class="my-3">
                                            <label class="form-label">Дистанция (м)</label>
                                            <input v-model="form_temp.distance_covered" type="number" :class="{ 'is-invalid': v$.distance_covered.$error }"
                                                placeholder="Введите значение" class="form-control" />
                                                <span v-if="v$.distance_covered.$error" class="text-danger">Это обязательное поле</span>

                                        </div>
                                    </BCol>
                                    <BCol sm="6">
                                        <div class="my-3">
                                            <label class="form-label">Количество шагов </label>
                                            <input v-model="form_temp.step_count" type="number" :class="{ 'is-invalid': v$.step_count.$error }"
                                                placeholder="Введите значение" class="form-control" />
                                                <span v-if="v$.step_count.$error" class="text-danger">Это обязательное поле</span>

                                        </div>
                                    </BCol>
                                </BRow>


                                <div class="mb-3">
                                    <label class="form-label"> Шкала Борга </label>
                                    <input v-model="form_temp.borg_scale" type="number" placeholder="Шкала Борга " :class="{ 'is-invalid': v$.borg_scale.$error }"
                                        class="form-control" />
                                        <span v-if="v$.borg_scale.$error" class="text-danger">Это обязательное поле</span>

                                </div>

                                <div class="d-flex justify-content-between">
                                    <button @click="createAppModal = false" type="button"
                                        class="btn btn-danger">Отменить</button>
                                    <button class="btn btn-success" type="submit"> Добавить</button>
                                </div>
                            </BCol>
                        </BRow>
                    </BForm>
                </BCardBody>
            </BForm>
        </BModal>
    </div>
</template>

<script setup>
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import Swal from 'sweetalert2';
import { axiosInstance } from '../../axios';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from "vuex";
import useVuelidate from '@vuelidate/core';
import { required, numeric } from '@vuelidate/validators';


const store = useStore();
const route = useRoute();

const form_temp = ref({
    walking_speed: null,
    walking_duration: null,
    distance_covered: null,
    step_count: null,
    borg_scale: null,
    creation_date: new Date().toISOString().split('T')[0]
});

const rules = {
      creation_date: { required },
      walking_duration: { required, numeric },
      walking_speed: { required },
      distance_covered: { required, numeric },
      step_count: { required, numeric },
      borg_scale: { required, numeric },
    };

    const v$ = useVuelidate(rules, form_temp);
const createAppModal = ref(false);

const dateConfig = ref({
    enableTime: false,
    altInput: true,
    dateFormat: "Y-m-d",
    altFormat: "d M,Y",
    mode: "single",
    time_24hr: false,
});

const temp_list = computed(() => {
    return store.state.charts.physical_activity.filter(item => item.walking_duration !== null && item.creation_date !== null);
});
const searchTerm = ref('');
const sortBy = (key, dataKey) => {

    store.commit('charts/sortData', { dataKey, sortKey: key });
};



const filteredTempList = computed(() => {
    const tempList = temp_list.value.slice();

    if (searchTerm.value.trim() !== '') {
        return tempList.filter(item => {
            return (
                (item.walking_duration !== null && item.walking_duration.toString().includes(searchTerm.value.trim())) ||
                (item.distance_covered !== null && item.distance_covered.toString().includes(searchTerm.value.trim())) ||
                (item.step_count !== null && item.step_count.toString().includes(searchTerm.value.trim())) ||
                (item.creation_date !== null && item.creation_date.includes(searchTerm.value.trim()))
            );
        });
    }

    return tempList;
});

const addTemp = async () => {
    v$.value.$touch();
    if(v$.value.$invalid) {
        return;
    }
    try {
        const response = await axiosInstance.post(`/health-diary-records/add_physical_activity/?by_er_card=${route.params.id}`, form_temp.value);
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Успешно',
                text: 'Данные добавлены!',
                timer: 2500,
                timerProgressBar: true
            });
            form_temp.value = {
                walking_speed: null,
                walking_duration: null,
                distance_covered: null,
                step_count: null,
                borg_scale: null,
                creation_date: new Date().toISOString().split('T')[0]
            }
            createAppModal.value = false;
            await store.dispatch('charts/getCharts', { ecr: route.params.id });
            temp_list.value = store.state.charts.physical_activity;
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Ошибка',
            text: 'Ошибка, попробуйте позже!',
            timer: 2500,
            timerProgressBar: true
        });
    }
};

onMounted(async () => {
    await store.dispatch('charts/getCharts', { ecr: route.params.id });
});
</script>

<style scoped></style>