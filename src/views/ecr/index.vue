<script>
import Layout from "../../layouts/main.vue";
import PageHeader from "../../components/page-header.vue";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";

import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

import { ref } from "vue";

import { mapState, mapActions, mapMutations,mapGetters } from 'vuex';


export default {
    data() {
        return {
            createAppModal: false,
            status: null,
            status1: null,
            value: null,
            value1: null,
            searchQuery: null,
            timeConfig: {
                enableTime: false,
                dateFormat: "d M, Y",
            },
            page: 1,
            defaultOptions: { animationData: animationData },

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

        ...mapActions('ecr', ['fetchEcr', 'fetchPatient', 'addToServerAndPushToEcr']),
        ...mapMutations('ecr', ['sortEcr', 'setSelectedIndex']),
        toggleRow(index) {
      if (this.selectedIndex === index) {

        this.setSelectedIndex(-1);
      } else {
    
        this.setSelectedIndex(index);
      }
    },
    addToServer() {
      if (this.selectedIndex !== -1) {
        this.addToServerAndPushToEcr();
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


        toggleModal() {
            this.createAppModal = true;
            this.dataEdit = false;


            this.submitted = false;
        },

    },
    mounted() {
        this.fetchEcr(this.page);
        this.fetchPatient();
    },
    components: {
        Layout,
        PageHeader,
        lottie: Lottie,
        Multiselect,
        flatPickr
    },

};
</script>

<template>
    <Layout>
        <PageHeader title="ЭЛЕКТРОННЫЕ КАРТЫ РЕАБИЛИТАЦИИ" pageTitle="ЭКР" />

        <BRow>
            <BCol lg="12">
                <BCard no-body id="applicationList">
                    <BCardHeader class="border-0">
                        <div class="d-md-flex align-items-center">
                            <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Список Активных ЭКР</h5>
                            <div class="flex-shrink-0">
                                <div class="d-flex gap-1 flex-wrap">
                                    <BButton type="button" class="add-btn" variant="success" id="create-btn"
                                        @click="toggleModal">
                                        <i class="ri-add-line align-bottom me-1"></i> Добавить
                                    </BButton>

                                    <BButton type="button" variant="primary" class="btn"> <i
                                            class="ri-equalizer-fill me-1 align-bottom"></i>
                                        Filters
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
                                        <input type="text" class="form-control search"
                                            placeholder="Search for application ID, company, designation status or something...">
                                        <i class="ri-search-line search-icon"></i>
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="6">
                                    <div>
                                        <flat-pickr v-model="date6" :config="rangeDateconfig" class="form-control"
                                            placeholder="Select date"></flat-pickr>
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="6">
                                    <div>
                                        <flat-pickr v-model="date6" :config="rangeDateconfig" class="form-control"
                                            placeholder="Select date"></flat-pickr>
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="4">
                                    <div>
                                        <Multiselect class="form-control" v-model="status1" :close-on-select="true"
                                            :searchable="true" placeholder="Select Status" :create-option="true"
                                            :options="[
                                            { value: 'All', label: 'All' },
                                            { value: 'Approved', label: 'Approved' },
                                            { value: 'New', label: 'New' },
                                            { value: 'Pending', label: 'Pending' },
                                            { value: 'Rejected', label: 'Rejected' },
                                        ]" />
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="4">
                                    <div>

                                        <Multiselect class="form-control" v-model="value1" :close-on-select="true"
                                            :searchable="true" :create-option="true" placeholder="Select Type" :options="[
                                            { value: 'All', label: 'All' },
                                            { value: 'Full Time', label: 'Full Time' },
                                            { value: 'Part Time', label: 'Part Time' },
                                        ]" />
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="4">
                                    <div>
                                        <Multiselect class="form-control" v-model="status1" :close-on-select="true"
                                            :searchable="true" placeholder="Select Status" :create-option="true"
                                            :options="[
                                            { value: 'All', label: 'All' },
                                            { value: 'Approved', label: 'Approved' },
                                            { value: 'New', label: 'New' },
                                            { value: 'Pending', label: 'Pending' },
                                            { value: 'Rejected', label: 'Rejected' },
                                        ]" />
                                    </div>
                                </BCol>




                            </BRow>
                            <BRow class="mt-3">
                                <BCol xxl="2" sm="4">
                                    <div>
                                        <Multiselect class="form-control" v-model="status1" :close-on-select="true"
                                            :searchable="true" placeholder="Select Status" :create-option="true"
                                            :options="[
                                            { value: 'All', label: 'All' },
                                            { value: 'Approved', label: 'Approved' },
                                            { value: 'New', label: 'New' },
                                            { value: 'Pending', label: 'Pending' },
                                            { value: 'Rejected', label: 'Rejected' },
                                        ]" />
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="4">
                                    <div>

                                        <Multiselect class="form-control" v-model="value1" :close-on-select="true"
                                            :searchable="true" :create-option="true" placeholder="Select Type" :options="[
                                            { value: 'All', label: 'All' },
                                            { value: 'Full Time', label: 'Full Time' },
                                            { value: 'Part Time', label: 'Part Time' },
                                        ]" />
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="4">
                                    <div>
                                        <Multiselect class="form-control" v-model="status1" :close-on-select="true"
                                            :searchable="true" placeholder="Select Status" :create-option="true"
                                            :options="[
                                            { value: 'All', label: 'All' },
                                            { value: 'Approved', label: 'Approved' },
                                            { value: 'New', label: 'New' },
                                            { value: 'Pending', label: 'Pending' },
                                            { value: 'Rejected', label: 'Rejected' },
                                        ]" />
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="6">
                                    <div>
                                        <flat-pickr v-model="date6" :config="rangeDateconfig" class="form-control"
                                            placeholder="Select date"></flat-pickr>
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="6">
                                    <div>
                                        <flat-pickr v-model="date6" :config="rangeDateconfig" class="form-control"
                                            placeholder="Select date"></flat-pickr>
                                    </div>
                                </BCol>
                                <BCol xxl="2" sm="6">
                                    <div class="search-box">
                                        <input type="text" class="form-control search"
                                            placeholder="Search for application ID, company, designation status or something...">
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


                                            <th class="sort" data-sort="company" @click="onSort('name')">Пациент
                                            </th>
                                            <th class="sort" data-sort="designation" @click="onSort('designation')">
                                                Прогресс КР</th>
                                            <th class="sort" data-sort="date" @click="onSort('date')">День КР</th>
                                            <th class="sort" data-sort="contacts" @click="onSort('contacts')">Ступень
                                                активности
                                            </th>
                                            <th class="sort" data-sort="type" @click="onSort('type')">GRACE</th>
                                            <th class="sort" data-sort="status" @click="onSort('status')">NYHA</th>
                                            <th class="sort" data-sort="city" @click="onSort('action')">Класс тяжести
                                            </th>
                                            <th class="sort" data-sort="city" @click="onSort('action')">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody class="list form-check-all" v-for="(item, index) in ecr.results"
                                        :key="index">

                                        <tr>


                                            <td class="company">
                                                <div class="d-flex align-items-center">
                                                    <div class="flex-shrink-0 me-2">
                                                        <img alt="" :src="item.patient_avatar"
                                                            class="avatar-xxs rounded-circle image_src object-fit-cover">
                                                    </div>
                                                    <div class="flex-grow-1 ms-2">
                                                        <span class="me-2">
                                                            {{ item.patient_first_name }}
                                                        </span>
                                                        <span>
                                                            {{ item.patient_middle_name }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="designation">dd</td>
                                            <td class="date">dd</td>
                                            <td class="contacts">dd</td>
                                            <td class="type">dd</td>
                                            <td>
                                                dkmv
                                            </td>

                                            <td>
                                                <div class="progress progress-sm w-50">
                                                    <div class="progress-bar bg-primary" role="progressbar"
                                                        style="width: 40%" aria-valuenow="65" aria-valuemin="0"
                                                        aria-valuemax="100"></div>
                                                </div>
                                            </td>

                                            <td>
                                                <ul class="list-inline hstack gap-2 mb-0">
                                                    <li class="list-inline-item" v-b-tooltip.hover title="View">
                                                        <router-link :to="`/profile-erc/${item.id}`"
                                                            class="text-primary d-inline-block">
                                                            <i class="ri-eye-fill fs-16"></i>
                                                        </router-link>
                                                    </li>
                                                    <li class="list-inline-item edit" data-bs-toggle="tooltip"
                                                        data-bs-trigger="hover" data-bs-placement="top" title="Edit">
                                                        <BLink class="text-primary d-inline-block edit-item-btn">
                                                            <i class="ri-pencil-fill fs-16"></i>
                                                        </BLink>
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
                                    <input type="text" class="form-control search"
                                        placeholder="Search for application ID, company, designation status or something...">
                                    <i class="ri-search-line search-icon"></i>
                                </div>
                            </BCol>
                            <div>
                                <div class="table-responsive table-card mb-1 scrollable-table">
                                    <table class="table table-nowrap align-middle" id="jobListTable">
                                        <thead class="text-muted table-light">
                                            <tr class="text-uppercase">


                                                <th class="sort" data-sort="company" @click="onSort('name')">
                                                    Ф.И.О
                                                </th>

                                                <th class="sort" data-sort="date" @click="onSort('date')">Дата
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
                    <BButton type="button" variant="success" @click="addToServer">Добавить</BButton>
                </div>
            </BForm>
        </BModal>


    </Layout>
</template>

<style scoped>
.scrollable-table {
    max-height: 400px;
    overflow-y: auto;

}
</style>