<template>
    <div>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Отдышка</h5>
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
                                        placeholder="Поиск.....">
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

                                        <th class="small-font sort" @click="sortBy('creation_date', 'dyspnea')">
                                            Дата
                                        </th>
                                        <th class="small-font sort" @click="sortBy('dyspnea', 'dyspnea')">
                                            Отдышка
                                        </th>
                                        <th class="small-font sort" @click="sortBy('dyspnea_type', 'dyspnea')">
                                            Тип Отдышки
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="list form-check-all">
                                    <tr v-for="(item, index) in filteredTempList" :key="index">
                                        <td class="company">
                                            {{ item.creation_date }}
                                        </td>
                                        <td class="designation">
                                            <span class="ps-4">
                                                {{ item.dyspnea ? 'Да' : 'Нет' }}
                                            </span>
                                           
                                        </td>
                                        <td class="designation">
                                            <span class="ps-4">
                                            {{
                                    item.dyspnea_type
                                        ? (item.dyspnea_type === 'inspiratory' ? 'инспираторная'
                                            : item.dyspnea_type === 'expiratory' ? 'экспираторная'
                                                : 'смешанная')
                                        : 'не указана'
                                }}
</span>
                                           
                                        </td>
                                    </tr>
                                    <tr v-if="filteredTempList.length === 0">
                                        <td colspan="4" class="text-center">Пусто! Нет результатов</td>
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

        <BModal v-model="createAppModal" id="showModal" title="Отдышка" header-class="bg-light p-3"
            title-class="exampleModalLabel" hide-footer class="v-modal-custom" centered>
            <BForm autocomplete="off" id="addform" class="tablelist-form">
                <BCardBody class="border  border-0">
                    <BForm @submit.prevent="addTemp">
                        <BRow class="g-3">
                            <BCol sm="12">
                                <div class="mb-3">
                                    <label class="form-label">Отдышка</label>
                                    <input v-model="form_temp.dyspnea" type="checkbox" placeholder="Отдышка"
                                        class="form-check" />

                                </div>
                                <div class="my-3">
                                    <label class="form-label">Тип Отдышки </label>
                                    <select class="form-select" v-model="form_temp.dyspnea_type" :class="{'is-invalid': v$.dyspnea_type.$error}">
                                        <option disabled selected :value="null">Выберите тип</option>
                                        <option value="inspiratory">инспираторная</option>
                                        <option value="expiratory">экспираторная</option>
                                        <option value="mixed">смешанная</option>
                                    </select>
                                    <span class="text-danger" v-if="v$.dyspnea_type.$error">Это поле обязательное.</span>
                                </div>
                                <div class="my-3">
                                    <label class="form-label">Дата </label>
                                    <flat-pickr placeholder="Выберите дату" v-model="form_temp.creation_date"
                                        :config="dateConfig" class="form-control flatpickr-input"
                                        id="caledate"></flat-pickr>
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
import { required } from '@vuelidate/validators';


const store = useStore();
const route = useRoute();

const form_temp = ref({
    dyspnea: false,
    dyspnea_type: null,
    creation_date: new Date().toISOString().split('T')[0]
});

const rules = {
    dyspnea_type: { required },
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
    return store.state.charts.dyspnea.filter(item => item.dyspnea !== null && item.dyspnea_type !== null);
});
const searchTerm = ref('');
const sortBy = (key, dataKey) => {

    store.commit('charts/sortData', { dataKey, sortKey: key });
};


const dyspneaTypeTranslations = {
    'inspiratory': 'инспираторная',
    'expiratory': 'экспираторная',
    'mixed': 'смешанная'
};

const filteredTempList = computed(() => {
    const tempList = temp_list.value.slice();
    const searchTermTrimmed = searchTerm.value.trim().toLowerCase();

    if (searchTermTrimmed !== '') {
        return tempList.filter(item => {
            const dyspneaMatches = item.dyspnea !== null && (item.dyspnea ? 'да' : 'нет').includes(searchTermTrimmed);
            const creationDateMatches = item.creation_date !== null && item.creation_date.toString().toLowerCase().includes(searchTermTrimmed);
            const dyspneaTypeMatches = item.dyspnea_type !== null && dyspneaTypeTranslations[item.dyspnea_type].toLowerCase().includes(searchTermTrimmed);

            return dyspneaMatches || creationDateMatches || dyspneaTypeMatches;
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
        const response = await axiosInstance.post(`/health-diary-records/add_dyspnea/?by_er_card=${route.params.id}`, form_temp.value);
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Успешно',
                text: 'Данные добавлены!',
                timer: 2500,
                timerProgressBar: true
            });
            form_temp.value = {
                dyspnea: false,
                dyspnea_type: null,
                creation_date: new Date().toISOString().split('T')[0]
            }
            createAppModal.value = false;
            await store.dispatch('charts/getCharts', { ecr: route.params.id });
            temp_list.value = store.state.charts.dyspnea;
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

<style scoped>
/* Добавьте стили для поисковой иконки, если необходимо */
</style>