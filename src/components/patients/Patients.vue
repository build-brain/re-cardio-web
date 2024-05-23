<script>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import animationData1 from "@/components/widgets/gsqxdxog.json";

// import Swal from "sweetalert2";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

import { mapState, mapActions, mapMutations } from 'vuex';

export default {
  data() {
    return {
      createAppModal: false,
      date: null,

      search: '',
      date_birth: '',
      gender: '',
      district: '',
      social_group: '',




      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y",
      },
      page: 1,
      statuscategory: 'All',
      defaultOptions: { animationData: animationData },
      defaultOptions1: { animationData: animationData1 },
      deleteModal: false,
      deletePatientId: null,

      rangeDateconfig: {
        enableTime: false,
        altInput: true,
        dateFormat: "Y-m-d",
        altFormat: "d M, Y",
        mode: "single",
      },

    };
  },
  computed: {
    ...mapState('patients', {
      patients: (state) => state.patients,
      page_count: (state) => state.page_count,
    }),

  },



  methods: {
    ...mapActions('patients', ['fetchPatients', 'deletePatient']),

    incrementPage() {
      if (this.page < this.page_count) {
        this.page++;
        this.fetchPatients(this.page);
      }
    },
    decrementPage() {
      if (this.page > 1) {
        this.page--;
        this.fetchPatients(this.page);
      }
    },

    async filterPatients() {
      await this.fetchPatients({
        search: this.search,
        birthDate: this.date_birth,
        socialGroup: this.social_group,
        gender: this.gender,
        district: this.district
      });
    },
    generateCSV() {
      const csvContent = this.convertToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'patients.csv');
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    },
    convertToCSV() {
     
      const keys = Object.keys(this.patients.results[0]);

   
      const headerRow = keys.join(',') + '\n';

      
      const dataRows = this.patients.results.map(patient => {
    
        return keys.map(key => patient[key]).join('\t') + '\n';
      });

   
      return headerRow + dataRows.join('\n');
    },

    formatDate(dateString) {
  
      const date = new Date(dateString);

   
      const year = date.getFullYear();
    
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },



    changecategory(data) {
      this.statuscategory = data;
    },
    onChangeStatus(e) {
      this.statuscategory = e;
    },
    onChangeType(e) {
      this.isType = e;
    },
    ...mapMutations('patients', ['sortPatients', 'removePatient']),

    onSort(column) {
      const direction = this.direction === 'asc' ? 'desc' : 'asc';
      this.sortPatients({ column, direction });
      this.direction = direction;
    },



    deleteModalToggle(patientId) {
      this.deleteModal = true;
      this.deletePatientId = patientId;
    },
    async onDeletePatient() {
      try {

        const response = await this.deletePatient(this.deletePatientId);


        if (response && response.success) {
          this.removePatient(this.deletePatientId);
        }

        this.deleteModal = false;
      } catch (error) {
        console.error('Failed to delete patient:', error);
      }
    },

  },
  components: {

    lottie: Lottie,
    Multiselect,
    flatPickr
  },

  mounted() {

    this.fetchPatients(this.page);
  }


};
</script>

<template>

    <BRow>

      <BCol lg="12">
        <BCard no-body id="applicationList">
          <BCardHeader class="border-0">
            <div class="d-md-flex align-items-center">
              <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Список пациентов</h5>
              <div class="flex-shrink-0">
                <div class="d-flex gap-1 flex-wrap">
                  <router-link to="/patients/add" class="text-white">
                    <BButton type="button" class="add-btn" variant="success" id="create-btn">
                      <i class="ri-add-line align-bottom me-1"></i> Добавить

                    </BButton>
                  </router-link>
                  <BButton type="button" @click="generateCSV" variant="info"><i
                      class="ri-file-download-line align-bottom me-1"></i>Импорт в CSV
                  </BButton>

                </div>
              </div>
            </div>
          </BCardHeader>
          <BCardBody class="border border-dashed border-end-0 border-start-0">
            <BForm>
              <BRow class="g-3">
                <BCol xxl="4" sm="6">
                  <div class="search-box">
                    <input v-model="search" type="text" class="form-control search" placeholder="Поиск...">
                    <i class="ri-search-line search-icon"></i>
                  </div>
                </BCol>
                <BCol xxl="2" sm="6">
                  <div>
                    <flat-pickr v-model="date_birth" :config="rangeDateconfig" class="form-control"
                      placeholder="Дата рождения"></flat-pickr>
                  </div>
                </BCol>
                <BCol xxl="2" sm="4">
                  <div>
                    <Multiselect v-model="social_group" class="form-control" :close-on-select="true" :searchable="true"
                      placeholder="Социальная группа" :create-option="true" :options="[
                    { value: 'child', label: 'Дети' },
                    { value: 'pensioner', label: 'Пенсионеры' },
                    { value: 'adult', label: 'Трудоспобоные' },
                    { value: 'disabled', label: 'Не трудоспобоные' },

                  ]" />

                  </div>
                </BCol>
                <BCol xxl="2" sm="4">
                  <div>

                    <Multiselect v-model="gender" class="form-control" :close-on-select="true" :searchable="true"
                      :create-option="true" placeholder="Гендер" :options="[
                    { value: 'male', label: 'Мужчина' },
                    { value: 'female', label: 'Женщина' },

                  ]" />
                  </div>
                </BCol>
                <BCol xxl="2" sm="4">

                  <BButton @click="filterPatients" type="button" variant="primary" class="w-100 form-control"> <i
                      class="ri-equalizer-fill me-1 align-bottom "></i>
                    Фильтры
                  </BButton>

                </BCol>
              </BRow>
            </BForm>
          </BCardBody>
          <BCardBody class="pt-0">
            <div>
              <ul class="nav nav-tabs nav-tabs-custom nav-success mb-3" role="tablist">
                <li class="nav-item">
                  <BLink class="nav-link   py-3" data-bs-toggle="tab" id="All" href="#" role="tab" aria-selected="true"
                    @click="changecategory('All')">
                    С открытими ЭКР
                  </BLink>
                </li>
                <li class="nav-item">
                  <BLink class="nav-link py-3 New" data-bs-toggle="tab" id="New" href="#" role="tab"
                    aria-selected="false" @click="changecategory('New')">
                    С архиными ЭКР
                  </BLink>
                </li>
                <li class="nav-item">
                  <BLink class="nav-link py-3 Pending" data-bs-toggle="tab" id="Pending" href="#" role="tab"
                    aria-selected="false" @click="changecategory('Pending')">
                    Пациенты без ЭКР

                  </BLink>
                </li>
                <li class="nav-item">
                  <BLink class="nav-link py-3 Approved" data-bs-toggle="tab" id="Approved" href="#" role="tab"
                    aria-selected="false" @click="changecategory('Approved')">
                    Все пациенты
                  </BLink>
                </li>

              </ul>

              <div class="table-responsive table-card mb-1">
                <table class="table table-nowrap align-middle" id="jobListTable">
                  <thead class="text-muted table-light">
                    <tr class="text-uppercase">

                      <th class="sort" data-sort="id" style="width: 140px;" @click="onSort('id')">ID</th>
                      <th class="sort" data-sort="company" @click="onSort('first_name')">Ф.И.О</th>
                      <th class="sort" data-sort="designation" @click="onSort('phone')">Телефон</th>
                      <th class="sort" data-sort="date" @click="onSort('age')">Возраст</th>
                      <th class="sort" data-sort="contacts" @click="onSort('date_joined')">Дата регистрации</th>
                      <th class="sort" data-sort="type" @click="onSort('type')">Наблюдающий врач</th>
                      <th class="sort" data-sort="city" @click="onSort('action')">Действия</th>
                    </tr>
                  </thead>
                  <tbody class="list form-check-all" v-for="(data, index) in patients.results" :key="index">
                    <tr>
                      <td>
                        <BLink href="#" class="link-primary">{{ data.id }}</BLink>
                      </td>
                      <td class="company">
                        <div class="d-flex align-items-center">
                          <div class="flex-shrink-0">
                            <img :src="data.avatar" alt="" class="avatar-xxs rounded-circle image_src object-fit-cover">
                          </div>
                          <div class="flex-grow-1 ms-2">{{ data.first_name }} {{ data.last_name }} {{ data.middle_name
                            }}</div>
                        </div>
                      </td>
                      <td class="designation">{{ data.phone }}</td>
                      <td class="date">{{ data.age }}</td>
                      <td class="contacts">{{ formatDate(data.date_joined) }}</td>
                      <td class="type">{{ data.type }}</td>
                      <td>
                        <ul class="list-inline hstack gap-2 mb-0">
                          <li class="list-inline-item" v-b-tooltip.hover title="View">
                            <router-link :to="`/patients/profile/${data.id}`" class="text-primary d-inline-block">
                              <i class="ri-eye-fill fs-16"></i>
                            </router-link>
                          </li>
                          <li class="list-inline-item edit" data-bs-toggle="tooltip" data-bs-trigger="hover"
                            data-bs-placement="top" title="Edit">
                            <router-link :to="`/patients/edit/${data.id}`"
                              class="text-primary d-inline-block edit-item-btn">
                              <i class="ri-pencil-fill fs-16"></i>
                            </router-link>
                          </li>
                          <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover"
                            data-bs-placement="top" title="Remove">
                            <BLink class="text-danger d-inline-block remove-item-btn"
                              @click="deleteModalToggle(data.id)">
                              <i class="ri-delete-bin-5-fill fs-16"></i>
                            </BLink>
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="noresult" v-if="patients.length < 1">
                  <div class="text-center">
                    <lottie class="avatar-xl" colors="primary:#121331,secondary:#08a88a" :options="defaultOptions"
                      :height="75" :width="75" />
                    <h5 class="mt-2">Пусто! Нет результатов</h5>
                    <p class="text-muted mb-0">
                      У вас нет ни одного пациента, перезагрузите страницу или входите заново.
                    </p>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-end">
                <div class="pagination-wrap hstack gap-2">
                  <BLink class="page-item pagination-prev" href="#" :disabled="page <= 1" @click="decrementPage">
                    <i class="ri-arrow-left-line"></i>
                  </BLink>
                  <ul class="pagination listjs-pagination mb-0">
                    <li :class="{ active: pageNumber == page, disabled: pageNumber == '...', }"
                      v-for="(pageNumber, index) in page_count" :key="index" @click="page = pageNumber">
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


    <!-- delete modal-->
    <BModal v-model="deleteModal" body-class="p-5 text-center" modal-class="flip" hide-footer no-close-on-backdrop
      centered>
      <div class="text-center">
        <div class="text-danger">
          <lottie class="avatar-xl" colors="primary:#405189,secondary:#f06548" :options="defaultOptions1" :height="75"
            :width="75" />
        </div>
        <div class="mt-4">
          <h3 class="mb-2">You are about to delete a order ?</h3>
          <p class="text-muted fs-lg mx-3 mb-0">Deleting your order will remove all of your information from our
            database.</p>
        </div>
      </div>
      <div class="d-flex gap-2 justify-content-center mt-4 mb-2">
        <BButton type="button" variant="light" class="w-sm btn-hover" @click="deleteModal = false">Close</BButton>
        <BButton type="button" variant="danger" class="w-sm btn-hover" id="delete-record"
          @click="onDeletePatient(deletePatientId)">Yes,Delete
          It!</BButton>
      </div>
    </BModal>
</template>