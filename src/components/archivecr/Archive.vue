<script>

import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import { axiosInstance } from '../../axios'
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import Swal from "sweetalert2";
import { useRoute } from 'vue-router';

import { ref } from "vue";

import { mapState, mapActions, mapMutations, mapGetters } from 'vuex';


export default {
  
    data() {
        return {
            doctor: [],
            curator: '',
            gender: '',
            killip: '',
            stenokard: '',
            searchQuery: '',
            mi_type: '',
            isSwitch1On: true,
            isSwitch2On: false,
            tabIndex: 1,
            search: "",
            modal: false,
            createAppModal: false,
            status: null,
            status1: null,
            value: null,
            value1: null,
            searchQuery: null,
            er_card: null,
            form: {
                reason: null,
                type: null,
                archive_date: null,
                context: null
            },
            timeConfig: {
                enableTime: false,
                dateFormat: "d M, Y",
            },
            dateConfig: {
                enableTime: false,
                dateFormat: "Y-m-d",
                altInput: true,
            },
            page: 1,
            defaultOptions: { animationData: animationData },
            debounceTimer: null,
            statuscategory: 'All',

            isType: null,



            deleteModal: false,


            rangeDateconfig: {
                mode: "range",
                dateFormat: "d M, Y",
            },
            date6: ref(''),

        };
    },
    computed: {

        ...mapState('ecr', {
            ecr: (state) => state.ecr,
            page_count: (state) => state.page_count,
            patient: (state) => state.patient,
        }),
        ...mapGetters('ecr', ['selectedIndex']),



    },


    methods: {
        async getDoctor() {
            try {
                const response = await axiosInstance.get('/doctors/');
                this.doctor = response.data.results.map(doctor => {
                    return { label: `${doctor.first_name} ${doctor.last_name}`, value: doctor.id };
                });
                console.log(this.doctor);
            } catch (error) {
                console.error(error);
            }
        },
        async filterECR() {


            await this.fetchEcr({
                curator: this.curator,
                gender: this.gender,
                page: this.page,
                active: false,
                killip: this.killip,
                stenokard: this.stenokard,
                mi_type: this.mi_type
            });
        },
        handleSwitchChange(switchNumber) {
            if (switchNumber === 1) {
                if (!this.isSwitch1On) {
                    this.resetFormData();
                }
                this.isSwitch2On = false; // Ensure the other switch is off
                this.setFormType();
            } else if (switchNumber === 2) {
                if (!this.isSwitch2On) {
                    this.resetFormData();
                }
                this.isSwitch1On = false; // Ensure the other switch is off
                this.setFormType();
            }
        },
        handleTabChange() {
            this.setFormType();
        },
        setFormType() {
            if (this.tabIndex === 0) {
                this.form.type = 'PL'; // First tab


            } else if (this.tabIndex === 1) {
                this.form.type = 'UP'; // Second tab

            }

        },
        resetFormData() {
            this.form = {
                reason: null,
                type: this.form.type, // Retain the type
                archive_date: null,
                context: null,
                // FA: null,
                // SS: null,
                // TS: null,
                // UL: null,
                // VB: null,
            };
        },

        ...mapActions('ecr', ['fetchEcr', 'fetchPatient', 'fetchInactivePatients', 'addToServerAndPushToEcr']),
        ...mapMutations('ecr', ['sortEcr', 'setSelectedIndex']),
        toggleRow(index) {
            if (this.selectedIndex === index) {

                this.setSelectedIndex(-1);
            } else {

                this.setSelectedIndex(index);
            }
        },
        async onSearch() {
            await this.fetchEcr({ page: this.page, active: true, search_active: this.search });

        },
        onSort(column) {

            const direction = this.direction === 'asc' ? 'desc' : 'asc';
            this.sortEcr({ column, direction });
            this.direction = direction;
        },
        async AddToServer() {
            if (this.selectedIndex !== -1) {
                try {
                    await this.addToServerAndPushToEcr();
                    this.createAppModal = false;
                } catch (error) {
                    console.error("Ошибка при добавлении на сервер", error);
                }
            } else {
                console.error("Пациент не выбран");
            }
        },
        formatDate(dateString) {

            const date = new Date(dateString);


            const year = date.getFullYear();

            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

   
    
        incrementPage() {
            if (this.page < this.page_count) {
                this.page++;
                this.fetchEcr(this.page);
            }
        },
        decrementPage() {
            if (this.page > 1) {
                this.page--;
                this.fetchEcr(this.page);
            }
        },
   

    },
    async mounted() {
        this.fetchEcr({ page: this.page, active: false, search_active: this.search });
        await this.getDoctor();

    },
    components: {

        lottie: Lottie,
        Multiselect,
        flatPickr
    },

};
</script>

<template>

    <BRow>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Список архивных ЭКР</h5>
                        <div class="flex-shrink-0">
                            <div class="d-flex gap-1 flex-wrap">
                           

                                <BButton @click="filterECR" type="button" variant="primary" class="btn"> <i
                                        class="ri-equalizer-fill me-1 align-bottom"></i>
                                    {{ $t('filtr') }}
                                </BButton>
                                <BButton class="btn btn-soft-danger" id="remove-actions"><i
                                        class="ri-delete-bin-2-line"></i></BButton>
                            </div>
                        </div>
                    </div>
                </BCardHeader>
                <BCardBody class="border border-dashed border-end-0 border-start-0">
                    <BForm>
                        <BRow class="g-3">
                            <BCol xxl="2" sm="6">
                                <div class="search-box">
                                    <input type="search" class="form-control search" v-model="search" @input="onSearch"
                                        placeholder="Поиск по ЭКР">
                                    <i class="ri-search-line search-icon"></i>
                                </div>
                            </BCol>
                            <BCol xxl="2" sm="4">
                                <div>
                                    <Multiselect v-model="curator" class="form-control" :close-on-select="true"
                                        :searchable="true" placeholder="Наблюдающий врач" :create-option="true"
                                        :options="doctor" />
                                </div>
                            </BCol>
                            <BCol xxl="2" sm="4">
                                <div>
                                    <Multiselect class="form-control" v-model="gender" :close-on-select="true"
                                        :searchable="true" placeholder="Пол" :create-option="true" :options="[
                            { value: 'male', label: 'мужчина' },
                            { value: 'female', label: 'женщина' },

                        ]" />
                                </div>
                            </BCol>
                            <BCol xxl="2" sm="4">
                                <div>

                                    <Multiselect class="form-control" v-model="killip" :close-on-select="true"
                                        :searchable="true" :create-option="true" placeholder="Класс по Killip" :options="[
                            { value: '1', label: 'I' },
                            { value: '2', label: 'II' },
                            { value: '3', label: 'III' },
                            { value: '4', label: 'IV' },
                        ]" />
                                </div>
                            </BCol>
                            <BCol xxl="2" sm="4">
                                <div>
                                    <Multiselect class="form-control" v-model="stenokard" :close-on-select="true"
                                        :searchable="true" placeholder="Стенокардия" :create-option="true" :options="[
                            { value: '1', label: 'стенокардия редкая (без изменений)' },
                            { value: '3', label: 'стенокардия умеренная (&lt;5 приступов в сутки)' },
                            { value: '2', label: 'стенокардия редкая (без изменений ЭКГ)' },
                            { value: '4', label: 'стенокардия умеренная (&gt;5 приступов в сутки)' },

                        ]" />

                                </div>
                            </BCol>
                            <BCol xxl="2" sm="4">
                                <div>
                                    <Multiselect class="form-control" v-model="mi_type" :close-on-select="true"
                                        :searchable="true" placeholder="Тип ИМ" :create-option="true" :options="[
                            { value: 'type_1', label: 'Тип 1 Спонтанный ИМ, вызванный разрывом или эрозией АСБ' },
                            { value: 'type_2', label: 'Тип 2 Вторичный ИМ, связанный со снижением поступления кислорода' },
                            { value: 'type_3', label: 'Тип 3 Внезапная коронарная смерть' },
                            { value: 'type_4a', label: 'Тип 4а ИМ, связанный с ЧКВ' },
                            { value: 'type_4b', label: 'Тип 4б ИМ, связанный с тромбозом стента после ЧКВ' },
                            { value: 'type_4c', label: 'Тип 4с ИМ, связанный с рестенозом после ЧКВ' },
                            { value: 'type_5', label: 'Тип 5 ИМ, связанный с аортокоронарным шунтированием' }
                        ]" />
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


                                        <th class="sort small-font" data-sort="patient.first_name"
                                            @click="onSort('patient.first_name')">
                                            {{ $t('active_ecr.patient') }}
                                        </th>
                                        <th class="sort small-font" data-sort="rc_progress"
                                            @click="onSort('rc_progress')">
                                            {{ $t('active_ecr.progress') }}
                                        </th>
                                        <th class="sort small-font" data-sort="rc_day" @click="onSort('rc_day')">
                                            {{ $t('active_ecr.day_cr') }}
                                        </th>
                                        <th class="sort small-font" data-sort="activity_stage"
                                            @click="onSort('activity_stage')">
                                            {{ $t('active_ecr.activity') }}
                                        </th>
                                        <th class="sort small-font" data-sort="grace_score"
                                            @click="onSort('grace_score')">
                                            GRACE
                                        </th>
                                        <th class="sort small-font" data-sort="nyha" @click="onSort('nyha')">
                                            NYHA
                                        </th>
                                        <th class="sort small-font" data-sort="patient_severity_class"
                                            @click="onSort('patient_severity_class')">
                                            {{ $t('active_ecr.selivery') }}
                                        </th>
                                        <th class="small-font">
                                            {{ $t('active_ecr.actions') }}
                                        </th>


                                    </tr>
                                </thead>
                                <tbody class="list form-check-all" v-for="(item, index) in ecr.results" :key="index">

                                    <tr>


                                        <td class="company">
                                            <div class="d-flex align-items-center">
                                                <div class="flex-shrink-0 me-2">
                                                    <img alt="" :src="item.patient.avatar"
                                                        class="avatar-xxs rounded-circle image_src object-fit-cover">
                                                </div>
                                                <div class="flex-grow-1 ms-2">
                                                    <span class="me-2">
                                                        {{ item.patient.first_name }}
                                                    </span>
                                                    <span class="me-2">
                                                        {{ item.patient.middle_name }}
                                                    </span>
                                                    <span>
                                                        {{ item.patient.last_name }}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="designation">
                                            {{ item.rc_progress }}%
                                            <div class="progress progress-sm w-50">
                                                <div class="progress-bar bg-primary" role="progressbar"
                                                    :style="{ width: `${item.rc_progress}%` }" aria-valuenow="100"
                                                    aria-valuemin="0" aria-valuemax="100"></div>
                                            </div>
                                        </td>
                                        <td class="date"><span class="ms-4">{{ item.rc_day }}</span></td>
                                        <td class="contacts d-flex justify-content-evenly align-items-center gap-3">{{
                            item.activity_stage
                        }}
                                            <!-- <li class="list-inline-item" v-b-tooltip.hover title="Ступень ДА">
                                                <button @click="openModalStage(item.id)"
                                                    class="btn btn-sm text-primary d-inline-block">
                                                    <i class="ri-bar-chart-grouped-line fs-6"></i>
                                                </button>
                                            </li> -->
                                        </td>
                                        <td class="type">{{ item.grace_score }}
                                            <span class="me-1" v-if="item.risk_hospital === 'high'">(высокий)</span>
                                            <span class="me-1" v-if="item.risk_hospital === 'low'">(низкий)</span>
                                            <span class="me-1" v-if="item.risk_hospital === 'medium'">(средний)</span>
                                            <span class="me-1"
                                                v-if="item.risk_hospital === 'unknown'">(неизвестный)</span>
                                            <span v-if="item.grace_score === null"
                                                class="text-black bg-light p-1 px-2 rounded-3">-</span>
                                        </td>
                                        <td>
                                            <span class="ms-4"> {{ item.nyha }}</span>
                                            <span v-if="item.nyha === null"
                                                class="text-black bg-light p-1 px-2 rounded-3 ms-4">-</span>
                                        </td>

                                        <td>
                                            <span v-if="item.patient_severity_class === 3"
                                                class="text-white bg-warning p-1 px-2 rounded-3 ms-4">3</span>
                                            <span v-if="item.patient_severity_class === 1"
                                                class="text-white bg-success p-1 px-2 rounded-3 ms-4">1</span>
                                            <span v-if="item.patient_severity_class === 2"
                                                class="text-white bg-info p-1 px-2 rounded-3 ms-4">2</span>
                                            <span v-if="item.patient_severity_class === 4"
                                                class="text-white bg-danger p-1 px-2 rounded-3 ms-4">4</span>
                                            <span v-if="item.patient_severity_class === null"
                                                class="text-black bg-light p-1 px-2 rounded-3 ms-4">-</span>
                                        </td>


                                        <td>
                                            <ul class="list-inline hstack gap-2 mb-0">
  <li class="list-inline-item" v-b-tooltip.hover title="View">
    <router-link :to="`/archive-ecr/profile-erc/${item.id}`" class="text-primary d-inline-block">
      <i class="ri-eye-fill fs-16"></i>
    </router-link>
  </li>
</ul>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="noresult" v-if="ecr.length < 1">
                                <div class="text-center">
                                    <lottie class="avatar-xl" colors="primary:#121331,secondary:#08a88a"
                                        :options="defaultOptions" :height="75" :width="75" />
                                    <h5 class="mt-2">Пусто! Нет результатов</h5>
                                    <p class="text-muted mb-0">
                                        Перезагрузите страницу или входите заново.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex justify-content-end mt-3">
                            <div class="pagination-wrap hstack gap-2">
                                <BLink class="page-item pagination-prev" href="#" :disabled="page <= 1"
                                    @click="decrementPage">
                                    <i class="ri-arrow-left-line"></i>
                                </BLink>
                                <ul class="pagination listjs-pagination mb-0">
                                    <li :class="{ active: pageNumber == page, disabled: pageNumber == '...', }"
                                        v-for="(pageNumber, index) in page_count" :key="index"
                                        @click="page = pageNumber">
                                        <BLink class="page" href="#">{{ pageNumber }}</BLink>
                                    </li>
                                </ul>
                                <BLink class="page-item pagination-next" href="#" :disabled="page >= page_count"
                                    @click="incrementPage">
                                    <i class="ri-arrow-right-line"></i>
                                </BLink>
                            </div>
                        </div>

                    </div>
                </BCardBody>
            </BCard>
        </BCol>
    </BRow>






  



</template>

<style scoped>
.scrollable-table {
    max-height: 400px;
    overflow-y: auto;

}
</style>