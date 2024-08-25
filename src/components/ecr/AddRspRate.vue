<template>
    <div>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">ЧДД</h5>
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

                                        <th class="small-font sort"
                                            @click="sortBy('creation_date', 'respiratory_rate')">
                                            Дата
                                        </th>
                                        <th class="small-font sort"
                                            @click="sortBy('respiratory_rate', 'respiratory_rate')">
                                            Частота Дыхания
                                        </th>
                                        <th class="small-font sort"
                                            @click="sortBy('breathing_rhythm', 'respiratory_rate')">
                                            Ритм дыхания
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="list form-check-all">
                                    <tr v-for="(item, index) in filteredTempList" :key="index">
                                        <td class="company">
                                            {{ item.creation_date }}
                                        </td>
                                        <td class="designation">
                                            {{ item.respiratory_rate }}
                                        </td>
                                        <td class="designation">
                                            {{
                                    item.breathing_rhythm
                                        ? (item.breathing_rhythm === 'rhythmic' ? 'ритмичный'
                                            : item.breathing_rhythm === 'arrhythmic' ? 'аритмичный'
                                                : 'не указано')
                                        : 'не указано'
                                }}
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

        <BModal v-model="createAppModal" id="showModal" title="Частота Дыхания" header-class="bg-light p-3"
            title-class="exampleModalLabel" hide-footer class="v-modal-custom" centered>
            <BForm autocomplete="off" id="addform" class="tablelist-form">
                <BCardBody class="border  border-0">
                    <BForm @submit.prevent="addTemp">
                        <BRow class="g-3">
                            <BCol sm="12">
                                <div class="mb-3">
                                    <label class="form-label">ЧДД</label>
                                    <input v-model="form_temp.respiratory_rate" type="number" placeholder="в.в./мин" :class="{'is-invalid': v$.respiratory_rate.$error }"
                                        class="form-control" />
                                        <span v-if="v$.respiratory_rate.$error" class="text-danger">Это обязательное поле</span>

                                </div>
                                <div class="my-3">
                                    <label class="form-label">Ритм дыхания </label>
                                    <select class="form-select" v-model="form_temp.breathing_rhythm" :class="{'is-invalid': v$.breathing_rhythm.$error }">
                                        <option disabled selected :value="null">Выберите тип</option>
                                        <option v-for="(translation, key) in pulseTypeTranslations" :key="key"
                                            :value="key">{{ translation }}</option>
                                    </select>
                                    <span v-if="v$.breathing_rhythm.$error" class="text-danger">Это обязательное поле</span>

                                </div>
                                <div class="my-3">
                                    <label class="form-label">Дата </label>
                                    <flat-pickr placeholder="Выберите дату" v-model="form_temp.creation_date"
                                        :config="dateConfig" class="form-control flatpickr-input"
                                        id="caledate"></flat-pickr>
                                        <span v-if="v$.creation_date.$error" class="text-danger">Это обязательное поле</span>

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
    respiratory_rate: null,
    breathing_rhythm: null,
    creation_date: new Date().toISOString().split('T')[0]
});
const rules = {
    respiratory_rate: { required, numeric },
    breathing_rhythm: { required },
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
    return store.state.charts.respiratory_rate.filter(item => item.respiratory_rate !== null && item.creation_date !== null);
});
const searchTerm = ref('');
const sortBy = (key, dataKey) => {

    store.commit('charts/sortData', { dataKey, sortKey: key });
};

const pulseTypeTranslations = {
    'rhythmic': 'ритмичный',
    'arrhythmic': 'аритмичный',
};

const filteredTempList = computed(() => {
    const tempList = temp_list.value.slice();
    const searchTermTrimmed = searchTerm.value.trim().toLowerCase();

    if (searchTermTrimmed !== '') {
        return tempList.filter(item => {
            const dyspneaMatches = item.respiratory_rate !== null && item.respiratory_rate.toString().includes(searchTermTrimmed);
            const creationDateMatches = item.creation_date !== null && item.creation_date.toString().toLowerCase().includes(searchTermTrimmed);
            const breathingRhythmMatches = item.breathing_rhythm !== null &&
                (item.breathing_rhythm.toLowerCase() === searchTermTrimmed ||
                    pulseTypeTranslations[item.breathing_rhythm]?.toLowerCase() === searchTermTrimmed);

            return dyspneaMatches || creationDateMatches || breathingRhythmMatches;
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
        const response = await axiosInstance.post(`/health-diary-records/add_respiratory_rate/?by_er_card=${route.params.id}`, form_temp.value);
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Успешно',
                text: 'Данные добавлены!',
                timer: 2500,
                timerProgressBar: true
            });
            form_temp.value = {
                respiratory_rate: false,
                breathing_rhythm: null,
                creation_date: new Date().toISOString().split('T')[0]
            }
            createAppModal.value = false;
            await store.dispatch('charts/getCharts', { ecr: route.params.id });
            temp_list.value = store.state.charts.respiratory_rate;
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