<template>
    <div>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Температура</h5>
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
                                        placeholder="Поиск по температуре">
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
                                            @click="sortBy('creation_date', 'body_temperature')">
                                            Дата
                                        </th>
                                        <th class="small-font sort"
                                            @click="sortBy('body_temperature', 'body_temperature')">
                                            Температура
                                        </th>

                                    </tr>
                                </thead>
                                <tbody class="list form-check-all">
                                    <tr v-for="(item, index) in filteredTempList" :key="index">
                                        <td class="company">
                                            {{ item.creation_date }}
                                        </td>
                                        <td class="designation">
                                            {{ item.body_temperature }} °C
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

        <BModal v-model="createAppModal" id="showModal" title="Добавить Температуру" header-class="bg-light p-3"
            title-class="exampleModalLabel" hide-footer class="v-modal-custom" centered>
            <BForm autocomplete="off" id="addform" class="tablelist-form">
                <BCardBody class="border  border-0">
                    <BForm @submit.prevent="addTemp">
                        <BRow class="g-3">
                            <BCol sm="12">
                                <div class="my-3">
                                    <label class="form-label">Темепература °C </label>

                                    <input v-model="form_temp.body_temperature" type="number" placeholder="°C"
                                        class="form-control" :class="{ 'is-invalid': v$.body_temperature.$error }" />
                                    <div v-if="v$.body_temperature.$error" class="invalid-feedback">
                                        Температура тела должна быть между 34 и 44 градусами.
                                    </div>
                                </div>
                                <div class="my-3">
                                    <label class="form-label">Дата </label>
                                    <flat-pickr placeholder="Выберите дату" v-model="form_temp.creation_date"
                                        :config="dateConfig" class="form-control flatpickr-input"
                                        id="caledate"></flat-pickr>
                                    <div v-if="v$.creation_date.$error" class="invalid-feedback">
                                        Это поле обязательное.
                                    </div>
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
import { required, numeric, between } from '@vuelidate/validators';

const store = useStore();
const route = useRoute();

const form_temp = ref({
    body_temperature: null,
    creation_date: new Date().toISOString().split('T')[0]
});

const rules = {
    body_temperature: {
        required,
        numeric,
        between: between(34, 44)
    },
    creation_date: { required }
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
    return store.state.charts.body_temperature.filter(item => item.body_temperature !== null && item.creation_date !== null);
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
                (item.body_temperature !== null && item.body_temperature.toString().includes(searchTerm.value.trim())) ||
                (item.creation_date !== null && item.creation_date.includes(searchTerm.value.trim()))
            );
        });
    }

    return tempList;
});

const addTemp = async () => {
    v$.value.$touch();
    if (v$.value.$invalid) {
        return;
    }
    try {
        const response = await axiosInstance.post(`/health-diary-records/add_body_temperature/?by_er_card=${route.params.id}`, form_temp.value);
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Успешно',
                text: 'Температура добавлена!',
                timer: 2500,
                timerProgressBar: true
            });
            form_temp.value = {
                body_temperature: null,
                creation_date: new Date().toISOString().split('T')[0]
            };
            createAppModal.value = false;
            await store.dispatch('charts/getCharts', { ecr: route.params.id });
            temp_list.value = store.state.charts.body_temperature;
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