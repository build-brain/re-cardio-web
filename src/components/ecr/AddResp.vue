<template>
    <div>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Респираторное заболевание</h5>
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
                                            @click="sortBy('creation_date', 'respiratory_condition')">
                                            Дата
                                        </th>
                                        <th class="small-font sort"
                                            @click="sortBy('moist_rales', 'respiratory_condition')">
                                            Влажные хрипы
                                        </th>
                                        <th class="small-font sort"
                                            @click="sortBy('peripheral_edema', 'respiratory_condition')">
                                            Периферические отеки
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
                                                {{ item.moist_rales ? 'Да' : 'Нет' }}
                                            </span>
                                           
                                        </td>
                                        <td class="designation">
                                            <span class="ps-4">
                                            {{ item.peripheral_edema ? 'Да' : 'Нет' }}
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

        <BModal v-model="createAppModal" id="showModal" title="Респираторное заболевание" header-class="bg-light p-3"
            title-class="exampleModalLabel" hide-footer class="v-modal-custom" centered>
            <BForm autocomplete="off" id="addform" class="tablelist-form">
                <BCardBody class="border  border-0">
                    <BForm @submit.prevent="addTemp">
                        <BRow class="g-3">
                            <BCol sm="12">
                                <div class="mb-3">
                                    <label class="form-label">Влажные хрипы</label>
                                    <input v-model="form_temp.moist_rales" type="checkbox" class="form-check" />

                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Периферические отеки</label>
                                    <input v-model="form_temp.peripheral_edema" type="checkbox" class="form-check" />

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

const store = useStore();
const route = useRoute();

const form_temp = ref({
    moist_rales: false,
    peripheral_edema: false,
    creation_date: new Date().toISOString().split('T')[0]
});

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
    return store.state.charts.respiratory_condition.filter(item => item.moist_rales !== null && item.peripheral_edema !== null);
});
const searchTerm = ref('');
const sortBy = (key, dataKey) => {

    store.commit('charts/sortData', { dataKey, sortKey: key });
};



const filteredTempList = computed(() => {
    const tempList = temp_list.value.slice();
    const searchTermTrimmed = searchTerm.value.trim().toLowerCase();

    if (searchTermTrimmed !== '') {
        return tempList.filter(item => {
            const moist_ralesmatches = item.moist_rales !== null && (item.moist_rales ? 'да' : 'нет').includes(searchTermTrimmed);
            const peripheral_edemamatches = item.peripheral_edema !== null && (item.peripheral_edema ? 'да' : 'нет').includes(searchTermTrimmed);
            const creationDateMatches = item.creation_date !== null && item.creation_date.toString().toLowerCase().includes(searchTermTrimmed);

            return moist_ralesmatches || peripheral_edemamatches || creationDateMatches;
        });
    }

    return tempList;
});

const addTemp = async () => {
    try {
        const response = await axiosInstance.post(`/health-diary-records/add_respiratory_condition/?by_er_card=${route.params.id}`, form_temp.value);
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Успешно',
                text: 'Данные добавлены!',
                timer: 2500,
                timerProgressBar: true
            });
            form_temp.value = {
                moist_rales: false,
                peripheral_edema: false,
                creation_date: new Date().toISOString().split('T')[0]
            }
            createAppModal.value = false;
            await store.dispatch('charts/getCharts', { ecr: route.params.id });
            temp_list.value = store.state.charts.respiratory_condition;
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