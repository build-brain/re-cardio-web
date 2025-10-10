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
    setup() {
        const stage_activity = ref(false);
        const flag_record = ref(false);
        const timeConfig = ref({
            enableTime: true,
            altInput: true,
            dateFormat: "Y-m-d H:i",
            altFormat: "d M, Y H:i",
            mode: "single",
            time_24hr: true,
        });
        const formData = ref({
            transfer: true,
            contraindications: '',
            rescheduling_events: null,
        })

        const options = ref([
            { value: 'type_0', display_name: 'Тип 0' },
            { value: 'type_1', display_name: 'Тип 1' },
            { value: 'type_2', display_name: 'Тип 2' },
            { value: 'type_3a', display_name: 'Тип 3a' },
            { value: 'type_3b', display_name: 'Тип 3b' },
            { value: 'type_3c', display_name: 'Тип 3c' },
            { value: 'type_4', display_name: 'Тип 4' },
            { value: 'type_5', display_name: 'Тип 5' }
        ]);
        const fcOptions = ref([
            { value: 1, display_name: 'ФК I' },
            { value: 2, display_name: 'ФК II' },
            { value: 3, display_name: 'ФК III' },
            { value: 4, display_name: 'ФК IV' }
        ]);



        const formDataPointsRecord = ref({
            fatal_outcome: false,
            rehospitalization: false,
            increased_angina: false,
            cas_score: null,
            cas_class: null,
            nonfatal_myocardial_infarction: false,
            acute_cerebrovascular_accident: false,
            bleeding: false,
            barc_classifier: null,
            diabetes_decompensation: false,
            repeat_pci_need: false,
            cabg_need: false,
            description: ""
        });
        const selectedId = ref(null);
        const id = ref(null);
        const openModalFlag = (id) => {
            selectedId.value = id;
            flag_record.value = true;
        };
        const openModalStage = (id) => {
            id.value = id;
            stage_activity.value = true;
        }


        const updateActitvityStage = async () => {
            try {
                await axiosInstance.post(`/er-cards/${selectedId.value}/update_activity_stage/`, formData.value);
                Swal.fire({
                    icon: 'success',
                    title: 'Отправлено!',
                    text: 'Событие успешно отправлено.',
                    timer: 2500,
                    timerProgressBar: true
                });
                stage_activity.value = false;
                formData.value = {
                    transfer: true,
                    contraindications: '',
                    rescheduling_events: null,
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Ошибка при отправке, попробуйте позже!',
                    timer: 2500,
                    timerProgressBar: true
                });
            }
        };

        const createPointsRecord = async () => {
            try {
                const response = await axiosInstance.post(`/er-cards/${id.value}/add_checkpoint_record/`, formDataPointsRecord.value);

                if (response.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Отправлено!',
                        text: 'Контрольная точка успешно отправлено.',
                        timer: 2500,
                        timerProgressBar: true
                    });
                    flag_record.value = false;
                    formDataPointsRecord.value = {
                        fatal_outcome: false,
                        rehospitalization: false,
                        increased_angina: false,
                        cas_score: null,
                        cas_class: null,
                        nonfatal_myocardial_infarction: false,
                        acute_cerebrovascular_accident: false,
                        bleeding: false,
                        barc_classifier: null,
                        diabetes_decompensation: false,
                        repeat_pci_need: false,
                        cabg_need: false,
                        description: "",
                    }
                }
            } catch (e) {
                console.error(e);
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Ошибка при отправке, попробуйте позже!',
                    timer: 2500,
                    timerProgressBar: true
                });
            }
        };
        return {
            updateActitvityStage,
            options,
            fcOptions,
            formDataPointsRecord,
            createPointsRecord,
            stage_activity,
            flag_record,
            formData,
            timeConfig,
            openModalFlag,
            openModalStage
        }

    },
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
            formPlanned: {
                type: 'PL',
                reason: null,
                archive_date: null,
                context: {
                    fa: null,
                    ss: null,
                    ts: null,
                    ul: null,
                    vb: null
                }
            },
            formUnplanned: {
                type: 'UP',
                reason: null,
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
                active: true,
                killip: this.killip,
                stenokard: this.stenokard,
                mi_type: this.mi_type
            });
        },
        handleSwitchChange(switchNumber) {
            if (switchNumber === 1) {

                this.isSwitch2On = false; // Ensure the other switch is off

            } else if (switchNumber === 2) {

                this.isSwitch1On = false; // Ensure the other switch is off

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

        debouncedSearch() {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = setTimeout(() => {
                this.fetchPatient({ active: true, without_or_archived_er_card: true, search: this.searchQuery.trim() });
            }, 300);
        },
        toggleModal() {
            this.createAppModal = true;
            this.dataEdit = false;


            this.submitted = false;
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
        openModal(id) {
            this.er_card = id;
            this.modal = true
        },
        async postMessage() {
            try {
                let payload = {};

                if (this.tabIndex === 0) {
                    // Handle "Плановое" tab
                    payload = {
                        type: this.formPlanned.type,
                        reason: this.formPlanned.reason,
                        archive_date: this.formPlanned.archive_date,
                        context: this.isSwitch2On ? this.formPlanned.context : null, // Only include context if switch is on
                    };
                } else if (this.tabIndex === 1) {
                    // Handle "Внеплановое" tab
                    payload = {
                        type: this.formUnplanned.type,
                        reason: this.formUnplanned.reason,
                        archive_date: this.formUnplanned.archive_date,
                        context: this.formUnplanned.context,
                    };
                }

                // Optionally include context as 'other' if the reason is 'OT'
                if (payload.reason === 'OT') {
                    payload.context = { other: payload.context };
                }

                await axiosInstance.post(`/er-cards/${this.er_card}/archivation/`, payload);

                await this.fetchEcr({ page: this.page, active: true, search_active: this.search });
                await this.fetchPatient({ active: true, without_or_archived_er_card: true, search: this.searchQuery, order: "-created_at" });
                this.modal = false;
                Swal.fire({
                    icon: 'success',
                    title: 'Успешно',
                    text: 'Архивация прошла успешно'
                });
            } catch (error) {
                console.log(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Ошибка',
                    text: 'Ошибка при архивации. Попробуйте еще раз.'
                });
            }
        }

    },
    async mounted() {
        this.fetchEcr({ page: this.page, active: true, search_active: this.search });

        await this.getDoctor();
        this.fetchPatient({ active: true, search: this.searchQuery, without_or_archived_er_card: true, order: "-created_at" });
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
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">{{ $t('active_ecr.title') }}</h5>
                        <div class="flex-shrink-0">
                            <div class="d-flex gap-1 flex-wrap">
                                <BButton type="button" class="add-btn" variant="success" id="create-btn"
                                    @click="toggleModal">
                                    <i class="ri-add-line align-bottom me-1"></i> {{ $t('add') }}
                                </BButton>

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
                                            <div class="ms-4">
                                                {{ item.rc_progress }}%
                                                <div class="progress progress-sm w-50">
                                                    <div class="progress-bar bg-primary" role="progressbar"
                                                        :style="{ width: `${item.rc_progress}%` }" aria-valuenow="100"
                                                        aria-valuemin="0" aria-valuemax="100"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="date"><span class="ms-4">{{ item.rc_day }}</span></td>
                                        <td class="contacts">
                                            <span class="ms-4">{{
                            item.activity_stage
                        }}</span>
                                            <!-- <li class="list-inline-item" v-b-tooltip.hover title="Ступень ДА">
                                                <button @click="openModalStage(item.id)"
                                                    class="btn btn-sm text-primary d-inline-block">
                                                    <i class="ri-bar-chart-grouped-line fs-6"></i>
                                                </button>
                                            </li> -->
                                        </td>
                                        <td class="type">
                                            <div class="ms-4">
                                                {{ item.grace_score }}
                                                <span class="me-1" v-if="item.risk_hospital === 'high'">(высокий)</span>
                                                <span class="me-1" v-if="item.risk_hospital === 'low'">(низкий)</span>
                                                <span class="me-1"
                                                    v-if="item.risk_hospital === 'medium'">(средний)</span>
                                                <span class="me-1"
                                                    v-if="item.risk_hospital === 'unknown'">(неизвестный)</span>
                                                <span v-if="item.grace_score === null"
                                                    class="text-black bg-light p-1 px-2 rounded-3">-</span>
                                            </div>

                                        </td>
                                        <td>
                                            <span class="ms-4"> {{ item.nyha }}</span>
                                            <span v-if="item.nyha === null"
                                                class="text-black bg-light p-1 px-2 rounded-3">-</span>
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
                                                <li class="list-inline-item" v-b-tooltip.hover title="просмотр">
                                                    <router-link :to="`/ecr/profile-erc/${item.id}`"
                                                        class="text-primary d-inline-block">
                                                        <i class="ri-eye-fill fs-16"></i>
                                                    </router-link>
                                                </li>
                                                <li class="list-inline-item edit" data-bs-toggle="tooltip"
                                                    @click="openModal(item.id)" data-bs-trigger="hover"
                                                    data-bs-placement="top" title="архивация">
                                                    <BLink class="text-primary d-inline-block edit-item-btn">
                                                        <i class="ri-inbox-archive-fill"></i>
                                                    </BLink>
                                                </li>
                                                <!-- <li class="list-inline-item" v-b-tooltip.hover
                                                    title="запись контрольной точки">
                                                    <span @click="openModalFlag(item.id)" style="cursor: pointer;"
                                                        class="text-primary d-inline-block">
                                                        <i class="ri-flag-line"></i>
                                                    </span>
                                                </li> -->

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

    <!-- create app modal  -->
    <BModal v-model="createAppModal" id="showModal" title="Новая электронная карта реабилитации"
        header-class="bg-light p-3" title-class="exampleModalLabel" hide-footer class="v-modal-custom" centered>
        <BForm autocomplete="off" id="addform" class="tablelist-form">
            <BCardBody class="border border-dashed border-end-0 border-start-0">
                <BForm>
                    <BRow class="g-3">
                        <BCol sm="12">
                            <div class="search-box mb-3">
                                <input type="search" class="form-control search" v-model="searchQuery"
                                    @input="debouncedSearch" placeholder="Поиск пациентов">
                                <i class="ri-search-line search-icon"></i>

                            </div>
                        </BCol>
                        <div>
                            <div class="table-responsive table-card mb-1 scrollable-table">
                                <table class="table table-nowrap align-middle" id="jobListTable">
                                    <thead class="text-muted table-light">
                                        <tr class="text-uppercase">


                                            <th>
                                                Ф.И.О
                                            </th>

                                            <th>Дата
                                                регистрации
                                            </th>

                                        </tr>
                                    </thead>
                                    <tbody class="list form-check-all" v-for="(pat, index) in patient.results"
                                        :key="pat.id">
                                        <tr @click="toggleRow(index)" style="cursor: pointer;"
                                            :class="{ 'bg-opacity-25 bg-dark': selectedIndex === index }">
                                            <td class="company">
                                                <div class="d-flex align-items-center">
                                                    <div class="flex-shrink-0">
                                                        <img alt="" :src="pat.avatar"
                                                            class="avatar-xxs rounded-circle image_src object-fit-cover">
                                                    </div>
                                                    <div class="flex-grow-1 ms-2">{{ pat.first_name }} {{
                            pat.last_name }} {{
                            pat.middle_name }}</div>
                                                </div>
                                            </td>
                                            <td class="date">{{ formatDate(pat.date_joined) }}</td>
                                        </tr>
                                    </tbody>
                                </table>

                            </div>

                        </div>





                    </BRow>
                </BForm>
            </BCardBody>

            <div class="hstack gap-2 justify-content-end mt-3">
                <BButton type="button" variant="light" id="close-modal" @click="createAppModal = false">Закрыть
                </BButton>
                <BButton type="button" variant="success" @click="AddToServer">Добавить</BButton>
            </div>
        </BForm>
    </BModal>
    <BModal v-model="modal" centered title="Архивация ЭКР">
        <template v-slot:default>
            <BTabs nav-class="nav nav-tabs nav-tabs-custom nav-success" class="w-100" v-model="tabIndex"
                style="height: 30rem;">

                <BTab active class="nav-item nav-link p-3">
                    <template #title>
                        <div class="fs-15">Плановое</div>
                    </template>
                    <form @submit.prevent="postMessage">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Дата</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                                <flat-pickr v-model="formPlanned.archive_date" placeholder="Введите дату"
                                    :config="dateConfig" class="form-control flatpickr-input"
                                    id="caledate"></flat-pickr>
                            </div>
                        </div>

                        <div class="my-3">

                            <div class="my-3">
                                <div class="d-flex">
                                    <BFormCheckbox v-model="isSwitch1On" switch @change="handleSwitchChange(1)">
                                    </BFormCheckbox>
                                    <label class="form-label fw-bold">Имеется заключение ВТЭК</label>
                                </div>

                                <div :class="{ 'text-muted': !isSwitch1On }">
                                    <BFormRadio name="some-radios1" class="fw-bold" v-model="formPlanned.reason"
                                        value="FR" :disabled="!isSwitch1On">
                                        Трудоспособность восстановлена полностью
                                    </BFormRadio>
                                    <BFormRadio name="some-radios1" class="fw-bold" v-model="formPlanned.reason"
                                        value="PR" :disabled="!isSwitch1On">
                                        Трудоспособность восстановлена частично
                                    </BFormRadio>
                                    <BFormRadio name="some-radios1" class="fw-bold" v-model="formPlanned.reason"
                                        value="NR" :disabled="!isSwitch1On">
                                        Пациент не трудоспособен
                                    </BFormRadio>
                                </div>
                            </div>

                            <div class="my-3">
                                <div class="d-flex">
                                    <BFormCheckbox v-model="isSwitch2On" switch @change="handleSwitchChange(2)">
                                    </BFormCheckbox>
                                    <label class="form-label fw-bold">Отсутствует заключение ВТЭК</label>
                                </div>

                                <div :class="{ 'text-muted': !isSwitch2On }">
                                    <BFormRadio name="some-radios2" class="fw-bold" v-model="formPlanned.reason"
                                        value="SQL" :disabled="!isSwitch2On">
                                        Качество жизни соответствует таковому до инфаркта
                                    </BFormRadio>
                                    <BFormRadio name="some-radios2" class="fw-bold" v-model="formPlanned.reason"
                                        value="BQL" :disabled="!isSwitch2On">
                                        Качество жизни лучше, чем до инфаркта
                                    </BFormRadio>
                                    <BFormRadio name="some-radios2" class="fw-bold" v-model="formPlanned.reason"
                                        value="WQL" :disabled="!isSwitch2On">
                                        Качество жизни ниже, чем до инфаркта
                                    </BFormRadio>
                                </div>
                            </div>

                            <div class="mt-2" :class="{ 'text-muted': !isSwitch2On }">
                                <div class="form-group">
                                    <BRow>
                                        <BCol sm="2">
                                            <label class="form-label fw-bold">Опросник SAQ</label>
                                        </BCol>
                                        <BCol sm="2">
                                            <label class="form-label fw-bold">ФА%</label>
                                            <BFormInput v-model="formPlanned.context.fa" type="number"
                                                :disabled="!isSwitch2On" />
                                        </BCol>
                                        <BCol sm="2">
                                            <label class="form-label fw-bold">СС%</label>
                                            <BFormInput v-model="formPlanned.context.ss" type="number"
                                                :disabled="!isSwitch2On" />
                                                
                                        </BCol>
                                        <BCol sm="2">
                                            <label class="form-label fw-bold">ТС%</label>
                                            <BFormInput v-model="formPlanned.context.ts" type="number"
                                                :disabled="!isSwitch2On" />
                                        </BCol>
                                        <BCol sm="2">
                                            <label class="form-label fw-bold">УЛ%</label>
                                            <BFormInput v-model="formPlanned.context.ul" type="number"
                                                :disabled="!isSwitch2On" />
                                        </BCol>
                                        <BCol sm="2">
                                            <label class="form-label fw-bold">ВБ%</label>
                                            <BFormInput v-model="formPlanned.context.vb" type="number"
                                                :disabled="!isSwitch2On" />
                                        </BCol>
                                    </BRow>
                                </div>
                            </div>
                        </div>
                    </form>
                </BTab>

                <BTab class="nav-item nav-link p-3">
                    <template #title>
                        <div class="fs-15">Внеплановое</div>
                    </template>
                    <form @submit.prevent="postMessage">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Дата</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                                <flat-pickr v-model="formUnplanned.archive_date" placeholder="Введите дату"
                                    :config="dateConfig" class="form-control flatpickr-input"
                                    id="caledate"></flat-pickr>
                            </div>
                        </div>

                        <div class="mb-3">
                            <BFormRadio name="some-radios" v-model="formUnplanned.reason" class="fw-bold mb-2"
                                value="FO">
                                Летальный исход
                            </BFormRadio>
                            <BFormRadio name="some-radios" v-model="formUnplanned.reason" class="fw-bold mb-2"
                                value="RHA">
                                Повторная госпитализация
                            </BFormRadio>
                            <div class="d-flex align-items-center my-3 gap-3">
                                <BFormRadio v-model="formUnplanned.reason" name="some-radios" class="fw-bold me-2"
                                    value="OT">
                                    Иное
                                </BFormRadio>
                                <BFormInput v-model="formUnplanned.context" type="text" class="form-control-sm"
                                    style="width: 200px; height:10px" />
                            </div>
                        </div>
                    </form>
                </BTab>
            </BTabs>
        </template>
        <template #footer class="d-flex justify-content-between">
            <div>
                <b-button variant="danger" @click="modal = false">Отмена</b-button>
            </div>
            <div>
                <b-button variant="success" @click="postMessage">Архивация</b-button>
            </div>
        </template>
    </BModal>
    <BModal v-model="stage_activity" title="Перевод на 3 ступень ДА" body-class="p-4" header-class="p-3 bg-info-subtle"
        hide-footer class="v-modal-custom" centered>
        <form @submit.prevent="updateActitvityStage">
            <div class="mb-3">
                <BFormRadio class="fw-bold" v-model="formData.transfer" :value="true">
                    Да
                </BFormRadio>
                <BFormRadio class="fw-bold" v-model="formData.transfer" :value="false">
                    Нет
                </BFormRadio>
            </div>
            <div class="mb-3">
                <label class="form-label">Противопоказания</label>
                <textarea cols="30" class="form-control" rows="5" :disabled="formData.transfer"
                    :class="{ 'text-muted': formData.transfer }" v-model="formData.contraindications">
            </textarea>
            </div>

            <div class="mb-3">
                <label class="form-label">Перенос даты следующего события (сутки)</label>
                <select v-model="formData.rescheduling_events" class="form-select" :disabled="formData.transfer">
                    <option v-for="n in 24" :key="n" :value="n">
                        {{ n }}
                    </option>
                </select>
            </div>
            <div class="text-end pt-3">
                <BButton variant="light" @click="stage_activity = false" class="me-2">Закрыть</BButton>
                <BButton type="submit" variant="success" class="ms-1">ОК</BButton>
            </div>
        </form>
    </BModal>





    <BModal v-model="flag_record" title="Добавить запись контрольной точки" body-class="p-4"
        header-class="p-3 bg-info-subtle" hide-footer class="v-modal-custom" centered>
        <form @submit.prevent="createPointsRecord">
            <!-- Чекбоксы -->
            <div class="d-flex align-items-center mb-3">
                <BFormCheckbox v-model="formDataPointsRecord.fatal_outcome">
                    летальный исход
                </BFormCheckbox>
            </div>
            <div class="d-flex align-items-center mb-3">
                <BFormCheckbox v-model="formDataPointsRecord.rehospitalization">
                    повторная госпитализация, связанная с дестабилизацией ИБС
                </BFormCheckbox>
            </div>
            <div class="d-flex align-items-center mb-3">
                <BFormCheckbox v-model="formDataPointsRecord.increased_angina">
                    нарастание стенокардии (без госпитализации)
                </BFormCheckbox>
            </div>
 
            <div class="mb-3">
                <BRow>
                    <BCol sm="3">
                        <div class="d-flex flex-wrap">
                            <span class="fw-bold">Шкала ШОКС:</span>
                            (0-20 балл)
                        </div>
                    </BCol>
                    <BCol sm="4">
                        <BFormInput v-model="formDataPointsRecord.cas_score" type="number">
                        </BFormInput>
                    </BCol>
                    <BCol sm="2">
                        <div class="d-flex flex-column">
                            <span class="fw-bold">ФК:</span>
                            (1-4)
                        </div>
                    </BCol>
                    <BCol sm="3">
                        <select v-model="formDataPointsRecord.cas_class" class="form-select">
                            <option v-for="option in fcOptions" :key="option.value" :value="option.value">
                                {{ option.display_name }}
                            </option>
                        </select>
                    </BCol>
                </BRow>
            </div>

            <div class="d-flex align-items-center mb-3">
                <BFormCheckbox v-model="formDataPointsRecord.bleeding">
                    кровотечение
                </BFormCheckbox>
            </div>
            <BRow :class="{ 'mb-3': true, 'text-muted': !formDataPointsRecord.bleeding }">
                <BCol sm="4">
                    <div class="d-flex flex-wrap">
                        <span class="fw-bold">Классификатор BARC:</span>
                    </div>
                </BCol>
                <BCol sm="8">
                    <select v-model="formDataPointsRecord.barc_classifier"
                        :class="{ 'form-select': true, 'text-muted': !formDataPointsRecord.bleeding }"
                        :disabled="!formDataPointsRecord.bleeding">
                        <option v-for="option in options" :key="option.value" :value="option.value">
                            {{ option.display_name }}
                        </option>
                    </select>
                </BCol>
            </BRow>

            <!-- Остальные чекбоксы -->
            <div class="d-flex align-items-center mb-3">
                <BFormCheckbox v-model="formDataPointsRecord.diabetes_decompensation">
                    декомпенсация диабета (если есть)
                </BFormCheckbox>
            </div>
            <div class="d-flex align-items-center mb-3">
                <BFormCheckbox v-model="formDataPointsRecord.repeat_pci_need">
                    потребность в повторном ЧКВ
                </BFormCheckbox>
            </div>
            <div class="d-flex align-items-center mb-3">
                <BFormCheckbox v-model="formDataPointsRecord.cabg_need">
                    потребность в АКШ
                </BFormCheckbox>
            </div>

            <div class="mb-3">
                <label class="form-label">Примечания</label>
                <textarea v-model="formDataPointsRecord.description" cols="30" class="form-control" rows="5"></textarea>
            </div>
            <div class="text-end pt-3">
                <BButton variant="light" @click="flag_record = false" class="me-2">Закрыть</BButton>
                <BButton type="submit" variant="success" class="ms-1">Сохранить</BButton>
            </div>
        </form>
    </BModal>




</template>

<style scoped>
.scrollable-table {
    max-height: 400px;
    overflow-y: auto;

}
</style>