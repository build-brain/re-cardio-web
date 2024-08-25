<script>
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import animationData1 from "@/components/widgets/gsqxdxog.json";
import formatDate from '@/common/formatDate.js';
// import Swal from "sweetalert2";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { axiosInstance } from '../../axios'
import Swal from "sweetalert2";
import { mapState, mapActions, mapMutations } from 'vuex';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      createAppModal: false,
      date: null,
      countries: [],
      id_patient:'',
      emptyMessage: "No options",
      user: JSON.parse(localStorage.getItem("user")),
      isLoading: false,
      doctormodal: false,
      active: '',
      search: '',
      date_birth: '',
      gender: '',
      district: '',
      social_group: '',
      ethnicity: '',
      timeConfig: {
        enableTime: false,
        dateFormat: "d M, Y",
      },
      page: 1,
      statuscategory: '',
      defaultOptions: { animationData: animationData },
      defaultOptions1: { animationData: animationData1 },
      deleteModal: false,
      deletePatientId: null,

      rangeDateConfig: {
        enableTime: false,
        altInput: true,
        dateFormat: "Y-m-d",
        altFormat: "d M, Y",
        mode: "range",
        onReady: this.onFlatpickrReady,
      },
      datadoctor: {
        doctor: ''
      }

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
    formatDate,
    asyncFind(query) {
      this.isLoading = true;
      axiosInstance.get(`/doctors/?search=${query}`).then(response => {
        this.countries = response.data.results.map(item => ({
          value: item.id,
          label: `${item.first_name} ${item.last_name} ${item.middle_name}`
        }));
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
      });
    },

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
      let after = null;
      let before = null;

      // Check if date_birth contains ' — ' indicating a range
      if (this.date_birth && this.date_birth.includes(' — ')) {
        [after, before] = this.date_birth.split(' — ').map(date => date.trim() || null);
      } else if (this.date_birth) {
        // If date_birth is not empty but doesn't contain ' — ', assume it's a single date
        after = this.date_birth.trim() || null;
        before = null; // or you can set it to a specific default value if needed
      }
      await this.fetchPatients({
        search: this.search,
        after: after || '', // Send empty string if after is null
        before: before || '', // Send empty string if before is null
        socialGroup: this.social_group,
        ethnicity: this.ethnicity,
        gender: this.gender,
        district: this.district,
        active: this.active
      });
    },
    generateCSV() {

      // Найдите вашу таблицу
      const table = document.getElementById('jobListTable');

      // Создайте рабочий лист из таблицы HTML
      const worksheet = XLSX.utils.table_to_sheet(table);

      // Создайте новую книгу и добавьте в нее рабочий лист
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');

      // Запишите книгу в формат XLSX
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Создайте Blob и ссылку для скачивания
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Список пациентов.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

    onFlatpickrReady(dateObj, dateStr, instance) {
      const calendar = instance.calendarContainer;
      if (!calendar.querySelector('.flatpickr-clear')) {

        const clearButton = document.createElement('button');
        clearButton.className = 'btn btn-primary flatpickr-clear';
        clearButton.textContent = 'Очистить';
        clearButton.style.width = '100%';
        calendar.appendChild(clearButton);

        clearButton.addEventListener('click', () => {
          instance.clear();
          instance.close();
        });
      }
    },


    async changecategory(data) {
      this.statuscategory = data;
      try {
        await this.fetchPatients({
          active: data
        });
      } catch (error) {

      }

    },
    async changecategory2(data) {
      try {
        await this.fetchPatients({
          with_active: data
        });
      } catch (error) {

      }
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
    async onSearch() {
      const [after, before] = this.date_birth.split(' — ').map(date => date.trim() || null);

      const birthDate = {
        after: after,
        before: before,
      };

      await this.fetchPatients({
        search: this.search,
        birthDate,
        socialGroup: this.social_group,
        ethnicity: this.ethnicity,
        gender: this.gender,
        district: this.district,
        active: this.active
      });
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
    async ReplaceOpenDoctor(id){
      this.doctormodal = true;
      this.id_patient = id;

    },
    async ReplaceDoctor(){
      try {
        await axiosInstance.post(`/patients/${this.id_patient}/change_curator/`, this.datadoctor);
        this.doctormodal = false;
        Swal.fire({
                icon: 'success',
                title: 'Успешно',
                text: 'Наблюдающий врач успешно заменён!',
                timer: 2500,
                timerProgressBar: true
            });
            await this.fetchPatients(this.page);

      } catch (e) {
        console.error(e);

      }
    }

  },
  components: {

    lottie: Lottie,
    Multiselect,
    flatPickr
  },

  async mounted() {
    await this.fetchPatients(this.page);
    await this.asyncFind('');
  }


};
</script>

<template>

  <BRow>

    <BCol lg="12">
      <BCard no-body id="applicationList">
        <BCardHeader class="border-0">
          <div class="d-md-flex align-items-center">
            <h5 class="card-title mb-3 mb-md-0 flex-grow-1">{{ $t('t-patient-list') }}</h5>
            <div class="flex-shrink-0">
              <div class="d-flex gap-1 flex-wrap">
                <router-link to="/patients/add" class="text-white">
                  <BButton type="button" class="add-btn" variant="success" id="create-btn">
                    <i class="ri-add-line align-bottom me-1"></i> {{ $t('add') }}

                  </BButton>
                </router-link>
                <BButton type="button" @click="generateCSV" variant="info"><i
                    class="ri-file-download-line align-bottom me-1"></i>{{ $t('importCSV') }}
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
                  <input v-model="search" type="search" class="form-control search" placeholder="Поиск..."
                    @input="onSearch" /><i class="ri-search-line search-icon"></i>
                </div>
              </BCol>
              <BCol xxl="2" sm="6">
                <div>
                  <flat-pickr v-model="date_birth" :config="rangeDateConfig" class="form-control"
                    placeholder="Год рождения от... до..."></flat-pickr>
                </div>
              </BCol>

              <BCol xxl="2" sm="4">
                <div>

                  <Multiselect v-model="gender" class="form-control" :close-on-select="true" :searchable="false"
                    :create-option="true" placeholder="Пол" :options="[
              { value: 'male', label: 'Мужчина' },
              { value: 'female', label: 'Женщина' },

            ]" />
                </div>
              </BCol>
              <BCol xxl="2" sm="4">

                <Multiselect class="form-control" :close-on-select="true" :searchable="false" :create-option="true"
                  placeholder="Род деятельности" :options="[
              { value: 'worker', label: 'рабочие' },
              { value: 'employee', label: 'служащие' },
              { value: 'freelancer', label: 'лица свободных профессий' },
              { value: 'priest', label: 'священнослужители' },
              { value: 'other', label: 'прочее' },

            ]" />


              </BCol>
              <BCol xxl="2" sm="4">

                <BButton @click="filterPatients" type="button" variant="primary" class="w-100 form-control"> <i
                    class="ri-equalizer-fill me-1 align-bottom "></i>
                  {{ $t('filtr') }}
                </BButton>

              </BCol>
            </BRow>
            <BRow class="mt-3">
              <BCol xxl="3" sm="4">

                <Multiselect v-model="social_group" class="form-control" :close-on-select="true" :searchable="false"
                  placeholder="Социально демографическая группа" :create-option="true" :options="[
              { value: 'child', label: 'Дети' },
              { value: 'pensioner', label: 'Пенсионеры' },
              { value: 'adult', label: 'Трудоспобоные' },
              { value: 'disabled', label: 'Не трудоспобоные' },

            ]" />


              </BCol>
              <BCol xxl="3" sm="4">

                <Multiselect v-model="ethnicity" class="form-control" :close-on-select="true" :searchable="false"
                  :create-option="true" placeholder="Этническая принадлежность" :options="[
              { value: 'asian', label: 'Азиаты' },
              { value: 'european', label: 'Европейцы' },
              { value: 'other', label: 'Прочие' },


            ]" />

              </BCol>



            </BRow>
          </BForm>
        </BCardBody>
        <BCardBody class="pt-0">
          <div>
            <ul class="nav nav-tabs nav-tabs-custom nav-success mb-3" role="tablist">
              <li class="nav-item">
                <BLink class="nav-link py-3" data-bs-toggle="tab" id="All" href="#" role="tab" aria-selected="true"
                  @click="changecategory('true')">
                  {{ $t('ecr.t-open') }}
                </BLink>
              </li>
              <li class="nav-item">
                <BLink class="nav-link py-3 New" data-bs-toggle="tab" id="New" href="#" role="tab" aria-selected="false"
                  @click="changecategory('false')">
                  {{ $t('ecr.t-archiv') }}
                </BLink>
              </li>
              <li class="nav-item">
                <BLink class="nav-link py-3 Pending" data-bs-toggle="tab" id="Pending" href="#" role="tab"
                  aria-selected="false" @click="changecategory2('true')">
                  {{ $t('ecr.t-notecr') }}

                </BLink>
              </li>
              <li class="nav-item">
                <BLink class="nav-link py-3 Approved" :class="statuscategory === '' ? 'active' : ''"
                  data-bs-toggle="tab" id="Approved" href="#" role="tab" aria-selected="false"
                  @click="changecategory('')">
                  {{ $t('ecr.all-ecr') }}
                </BLink>
              </li>

            </ul>

            <div class="table-responsive table-card mb-1">
              <table class="table table-nowrap align-middle" id="jobListTable">
                <thead class="text-muted table-light">
                  <tr class="text-uppercase">
                    <th class="sort" data-sort="company" @click="onSort('first_name')">{{ $t('table-patients.fullname')
                      }}</th>
                    <th class="sort" data-sort="designation" @click="onSort('phone')">{{ $t('table-patients.phone') }}
                    </th>
                    <th class="sort" data-sort="date" @click="onSort('age')">{{ $t('table-patients.age') }}</th>
                    <th class="sort" data-sort="contacts" @click="onSort('date_joined')">{{ $t('table-patients.date') }}
                    </th>
                    <th class="sort" data-sort="type" @click="onSort('type')">{{ $t('table-patients.created_by') }}</th>
                    <th>{{ $t('table-patients.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="list form-check-all" v-for="(data, index) in patients.results" :key="index">
                  <tr>
                    <td class="company">
                      <div class="d-flex align-items-center">
                        <div class="flex-shrink-0">
                          <img :src="data.avatar" alt="" class="avatar-xxs rounded-circle image_src object-fit-cover">
                        </div>
                        <div class="flex-grow-1 ms-2">{{ data.first_name }} {{ data.last_name }} {{ data.middle_name
                          }}</div>
                      </div>
                    </td>
                    <td class="designation">

                      {{ data.phone }}
                    </td>
                    <td class="date">
                      <span class="ms-4">
                        {{ data.age }}
                      </span>
                    </td>
                    <td class="contacts"> <span class="ms-4">{{ formatDate(data.date_joined) }}</span></td>

                    <td class="type">
                      <span class="ms-4" v-if="data.curator">
                        {{ data.curator.first_name }} {{ data.curator.last_name }} {{ data.curator.middle_name }}
                      </span>
                      <span class="text-black bg-light p-1 px-2 rounded-3 ms-4" v-else>-
                      </span>
                    </td>
                    <td>
                      <ul class="list-inline hstack gap-2 mb-0">
                        <li class="list-inline-item" v-b-tooltip.hover title="просмотр">
                          <router-link :to="`/patients/profile/${data.id}`" class="text-primary d-inline-block">
                            <i class="ri-eye-fill fs-16"></i>
                          </router-link>
                        </li>
                        <li class="list-inline-item edit" data-bs-toggle="tooltip" data-bs-trigger="hover"
                          data-bs-placement="top" title="изменить">
                          <router-link :to="`/patients/edit/${data.id}`"
                            class="text-primary d-inline-block edit-item-btn">
                            <i class="ri-pencil-fill fs-16"></i>
                          </router-link>
                        </li>
                        <li class="list-inline-item edit" data-bs-toggle="tooltip" data-bs-trigger="hover" v-if="user.user_type === 'ADMIN'"
                          data-bs-placement="top" title="заменить врача">
                          <button class="btn text-primary" @click="ReplaceOpenDoctor(data.id)">
                            <i class="ri-find-replace-fill"></i>
                          </button>
                        </li>

                        <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover"
                          data-bs-placement="top" title="удалить">
                          <BLink class="text-danger d-inline-block remove-item-btn" @click="deleteModalToggle(data.id)">
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
                <BLink class="page-item pagination-next" href="#" :disabled="page >= page_count" @click="incrementPage">
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
        <h3 class="mb-2">Удалить пациента ?</h3>
        <p class="text-muted fs-lg mx-3 mb-0">Уверены!!</p>
      </div>
    </div>
    <div class="d-flex gap-2 justify-content-center mt-4 mb-2">
      <BButton type="button" variant="light" class="w-sm btn-hover" @click="deleteModal = false">Отмена</BButton>
      <BButton type="button" variant="danger" class="w-sm btn-hover" id="delete-record"
        @click="onDeletePatient(deletePatientId)">Да, удалить</BButton>
    </div>
  </BModal>
  <BModal v-model="doctormodal" title="Заменить наблюдающего врача" modal-class="flip" hide-footer centered>
    <div class="col-12">
      <div class="mb-3">
        <label class="form-label">Наблюдающие врачи</label>
        <Multiselect v-model="datadoctor.doctor" :close-on-select="true" :searchable="true" placeholder="Поиск врача"
          :create-option="true" :options="countries" @search-change="asyncFind"
          no-options-text="Введите Ф.И.О. врача" />
      </div>
    </div>
    <div class="d-flex gap-2 justify-content-between mt-4 mb-2">
      <BButton type="button" variant="light" class="w-sm btn-hover" @click="doctormodal = false">Отмена</BButton>
      <BButton type="button" variant="danger" class="w-sm btn-hover" id="delete-record"
        @click="ReplaceDoctor()">Заменить</BButton>
    </div>

  </BModal>
</template>