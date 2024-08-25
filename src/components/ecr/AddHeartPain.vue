<template>
    <div>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Боль в сердце</h5>
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

                                        <th class="small-font sort" @click="sortBy('creation_date', 'heart_pain')">
                                            Дата
                                        </th>
                                        <th class="small-font sort" @click="sortBy('heart_pain', 'heart_pain')">
                                            Боль в сердце
                                        </th>
                                        <th class="small-font sort" @click="sortBy('heart_pain_type', 'heart_pain')">
                                            Тип Боли
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
                                                {{ item.heart_pain ? 'Да' : 'Нет' }}
                                            </span>
                                          
                                        </td>
                                        <td class="designation">
                                            <span class="ps-4">

                                         
                                            {{ 
    item.heart_pain_type
        ? (item.heart_pain_type === 'irregular' ? 'нерегулярная'
            : item.heart_pain_type === 'relieved_without_nitroglycerin' ? 'проходящая без нитроглицерина'
            : item.heart_pain_type === 'relieved_only_nitroglycerin' ? 'проходящая только с нитроглицерином'
            : 'не указана')
        : 'не указана'
}}   </span>
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

        <BModal v-model="createAppModal" id="showModal" title="Добавить боль в сердце" header-class="bg-light p-3"
            title-class="exampleModalLabel" hide-footer class="v-modal-custom" centered>
            <BForm autocomplete="off" id="addform" class="tablelist-form">
                <BCardBody class="border  border-0">
                    <BForm @submit.prevent="addTemp">
                        <BRow class="g-3">
                            <BCol sm="12">
                                <div class="mb-3">
                                    <label class="form-label">Боль в сердце</label>
                                    <input v-model="form_temp.heart_pain" type="checkbox"
                                        class="form-check" />

                                </div>
                                <div class="my-3">
                                    <label class="form-label">Тип Боли </label>
                                    <select class="form-select" v-model="form_temp.heart_pain_type"  :class="{'is-invalid': v$.heart_pain_type.$error }">
                                        <option disabled selected :value="null">Выберите тип</option>
                                        <option v-for="(translation, key) in fatigueTypeTranslations" :key="key" :value="key">{{ translation }}</option>
                                    </select>
                                    <span v-if="v$.heart_pain_type.$error" class="text-danger">Это обязательное поле</span>
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
    heart_pain: false,
    heart_pain_type: null,
    creation_date: new Date().toISOString().split('T')[0]
});
const rules = {
    heart_pain_type: { required },
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
    return store.state.charts.heart_pain.filter(item => item.heart_pain !== null && item.heart_pain_type !== null);
});
const searchTerm = ref('');
const sortBy = (key, dataKey) => {

    store.commit('charts/sortData', { dataKey, sortKey: key });
};


const fatigueTypeTranslations = {
    'irregular': 'нерегулярная',
        'relieved_without_nitroglycerin': 'проходящая без нитроглицерина',
        'relieved_only_nitroglycerin': 'проходящая только с нитроглицерином'
};

const filteredTempList = computed(() => {
    const tempList = temp_list.value.slice();
    const searchTermTrimmed = searchTerm.value.trim().toLowerCase();

    if (searchTermTrimmed !== '') {
        return tempList.filter(item => {
            const dyspneaMatches = item.heart_pain !== null && (item.heart_pain ? 'да' : 'нет').includes(searchTermTrimmed);
            const creationDateMatches = item.creation_date !== null && item.creation_date.toString().toLowerCase().includes(searchTermTrimmed);
            const dyspneaTypeMatches = item.heart_pain_type !== null && fatigueTypeTranslations[item.heart_pain_type].toLowerCase().includes(searchTermTrimmed);

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
        const response = await axiosInstance.post(`/health-diary-records/add_heart_pain/?by_er_card=${route.params.id}`, form_temp.value);
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Успешно',
                text: 'Данные добавлены!',
                timer: 2500,
                timerProgressBar: true
            });
            form_temp.value = {
                heart_pain: false,
    heart_pain_type: null,
    creation_date: new Date().toISOString().split('T')[0]
            }
            createAppModal.value = false;
            await store.dispatch('charts/getCharts', { ecr: route.params.id });
            temp_list.value = store.state.charts.heart_pain;
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