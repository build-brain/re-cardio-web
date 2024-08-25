<template>
  <PageHeader />
  <div>
    <BRow>
      <BCol lg="12">
        <BCard no-body id="applicationList">
          <BCardHeader class="border-0">
            <div class="d-md-flex align-items-center">
              <h5 class="card-title mb-3 mb-md-0 flex-grow-1 fw-bold">Календарь событий</h5>
              <div class="flex-shrink-0">
                <div class="d-flex gap-1 flex-wrap">
                  <BButton type="button" class="add-btn" variant="success" id="create-btn" @click="handleAddClick">
                    <i class="ri-add-line align-bottom me-1"></i> {{ $t('add') }}
                  </BButton>


                </div>
              </div>
            </div>
          </BCardHeader>

          <BCardBody class="pt-3">
            <div>
              <div class="table-responsive table-card mb-1">
                <table class="table table-nowrap align-middle" id="jobListTable" v-if="events.length !== 0">
                  <thead class="text-muted table-light">
                    <tr class="text-uppercase">
                      <th>название</th>
                      <th>тип</th>
                      <th>начало</th>
                      <th>завершение</th>
                      <th>локация</th>
                      <th>действия</th>
                      <th>статус</th>
                    </tr>
                  </thead>
                  <tbody class="list form-check-all">
                    <tr v-for="activities in events" :key="activities.id">
                      <td>

                        <p class="d-flex flex-column">
                          {{ activities.title }}
                        </p>
                        <p class="d-flex flex-column">
                          {{ activities.description }}
                        </p>
                      </td>
                      <td>
                        {{ getCategoryName(activities.type) }}
                      </td>

                      <td>{{ activities.start_date ? formatDate(activities.start_date) : '' }}</td>
                      <td>{{ activities.end_date ? formatDate(activities.end_date) : '' }}</td>
                      <td>{{ getLocationName(activities.location) }}</td>
                      <td>
                        <ul class="list-inline hstack gap-2 mb-0">

                          <li class="list-inline-item edit" data-bs-toggle="tooltip" data-bs-trigger="hover"
                            data-bs-placement="top" title="изменить">
                            <span class="text-primary d-inline-block" @click="openEditModal(activities)"
                              style="cursor: pointer;">
                              <!-- Pass the activity to edit -->
                              <i class="ri-pencil-fill fs-16"></i>
                            </span>
                          </li>
                          <li class="list-inline-item" v-b-tooltip.hover title="cтупень ДА"
                            v-if="activities.type === 'bg-warning-subtle'">
                            <button @click="OpenDa(activities.id)" :class="{
                    'text-muted border-0': new Date() < convertToLocalTime(activities.start_date),
                    'text-primary': new Date() >= convertToLocalTime(activities.start_date)
                  }"
                              :style="{ cursor: new Date() < convertToLocalTime(activities.start_date) ? 'not-allowed' : 'pointer' }"
                              :disabled="new Date() < convertToLocalTime(activities.start_date)"
                              class="btn btn-sm d-inline-block">
                              <i class="ri-bar-chart-grouped-line fs-6"></i>
                            </button>
                          </li>

                          <li class="list-inline-item" v-b-tooltip.hover title="уведомление"
                            v-if="activities.type !== 'bg-warning-subtle' && activities.type !== 'bg-success-subtle'">
                            <span :class="{
                    'text-muted border-0': new Date() < convertToLocalTime(activities.start_date),
                    'text-primary': new Date() >= convertToLocalTime(activities.start_date)
                  }"
                              :style="{ cursor: new Date() < convertToLocalTime(activities.start_date) ? 'not-allowed' : 'pointer' }"
                              class="btn btn-sm d-inline-block">
                              <i class="ri-notification-fill fs-6"></i>
                            </span>
                          </li>


                          <li class="list-inline-item" v-b-tooltip.hover title="запись контрольной точки"
                            v-if="activities.type === 'bg-success-subtle'">
                            <button @click="OpenCH(activities.id)"
                              :style="{ cursor: new Date() >= convertToLocalTime(activities.start_date) ? 'pointer' : 'not-allowed' }"
                              :class="{
                    'text-muted border-0': new Date() < convertToLocalTime(activities.start_date),
                    'text-primary': new Date() >= convertToLocalTime(activities.start_date)
                  }"
                              :disabled="new Date() < convertToLocalTime(activities.start_date)"
                              class="btn btn-sm d-inline-block">
                              <i class="ri-flag-fill"></i>
                            </button>
                          </li>
                          <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover"
                            data-bs-placement="top" title="удалить">
                            <span @click="deleteDA(activities.id)" style="cursor: pointer;"
                              class="text-danger d-inline-block remove-item-btn">
                              <i class="ri-delete-bin-5-fill fs-16"></i>
                            </span>
                          </li>


                        </ul>
                      </td>
                      <td>
                        <span
                          :class="[getStatusStyle(activities.status).textClass, getStatusStyle(activities.status).bgClass]">
                          {{ getStatusStyle(activities.status).displayName }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div class="noresult" v-else>
                  <div class="text-center">
                    <lottie class="avatar-xl" colors="primary:#121331,secondary:#08a88a" :options="defaultOptions"
                      :height="75" :width="75" />
                    <h5 class="mt-2">Пусто! Нет результатов</h5>
                    <p class="text-muted mb-0">
                      Перезагрузите страницу или входите заново.
                    </p>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-end mt-3">
                <router-link :to="`/ecr/profile-erc/${route.params.id}`">
                  <b-button variant="danger">назад</b-button>

                </router-link>

              </div>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

    <BModal v-model="createAppModal" :title="modalTitle" body-class="p-4" header-class="p-3 bg-info-subtle" hide-footer
      class="v-modal-custom" centered>
      <form @submit.prevent="handleSubmit" name="event-form" id="form-event">
        <div class="row event-form">
          <div class="col-12">
            <div class="mb-3">
              <label class="form-label">Тип события</label>
              <select v-model="event.type" class="form-select" name="category"
                :class="{ 'is-invalid': v$.type.$error }">
                <option :value="null" selected disabled>Выберите событие</option>
                <option v-for="option in categories" :key="option.value" :value="`${option.value}`">
                  {{ option.name }}
                </option>
              </select>
              <div v-if="v$.type.$error" class="invalid-feedback">
                Это поле обязательное.
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="mb-3">
              <label class="form-label">Название событий</label>
              <input id="name" v-model="event.title" type="text" class="form-control"
                :class="{ 'is-invalid': v$.title.$error }" placeholder="Введите название события" />
              <span v-if="v$.title.$error" class="invalid-feedback">
                Это поле обязательное.
              </span>
            </div>
          </div>

          <div class="col-12">
            <div class="row">
              <div class="col-6 mb-3">
                <label>Дата и время начало событии</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                  <flat-pickr placeholder="Выберите начало" v-model="event.start_date" :config="timeConfig"
                    class="form-control flatpickr-input" id="caledate"></flat-pickr>

                </div>
                <span v-if="v$.start_date.$error" class="text-danger">
                  Это поле обязательное.
                </span>
              </div>
              <div class="col-6 mb-3">
                <label>Дата и время окончания событии</label>
                <div class="input-group">
                  <flat-pickr placeholder="Выберите конец" v-model="event.end_date" :config="timeConfig"
                    class="form-control flatpickr-input" id="caledate"></flat-pickr>
                  <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                </div>
                <span v-if="v$.end_date.$error" class="text-danger">
                  Это поле обязательное.
                </span>
              </div>
            </div>
          </div>
          <div class="col-12">
            <div class="mb-3">
              <label class="form-label">Локация</label>
              <select v-model="event.location" class="form-select" name="location"
                :class="{ 'is-invalid': v$.location.$error }">
                <option value="" selected disabled>Выберите локацию</option>
                <option v-for="location in locations" :key="Object.keys(location)[0]" :value="Object.keys(location)[0]">
                  {{ Object.values(location)[0] }}
                </option>
              </select>
              <span v-if="v$.location.$error" class="text-danger">
                Это поле обязательное.
              </span>
            </div>
          </div>
          <div class="col-12">
            <div class="mb-3">
              <label class="form-label">Статус события</label>
              <select v-model="event.status" class="form-select" name="status"
                :class="{ 'is-invalid': v$.status.$error }">
                <option :value="null" selected disabled>Выберите статус</option>
                <option v-for="status in statuses" :key="status.value" :value="status.value">
                  {{ status.display_name }}
                </option>
              </select>
              <span v-if="v$.status.$error" class="text-danger">
                Это поле обязательное.
              </span>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Описание</label>
            <textarea class="form-control d-block" id="event-description" v-model="event.description"
              placeholder="Введите описание" rows="3" spellcheck="false"></textarea>
          </div>
        </div>

        <div class="text-end pt-3">
          <BButton variant="light" @click="createAppModal = false" class="me-2">Закрыть</BButton>
          <BButton type="submit" variant="success" class="ms-1">{{ modalButtonText }}</BButton>
        </div>
      </form>
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
            <option v-for="n in 3" :key="n" :value="n">
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




  </div>
</template>

<script setup>
import PageHeader from "../../../../components/page-header.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import Lottie from "../../../../components/widgets/lottie.vue";
import useVuelidate from '@vuelidate/core';
import { required, minLength } from '@vuelidate/validators';
import { ref, onMounted, computed, watch } from 'vue';
import { axiosInstance } from '../../../../axios';
import { useRoute } from 'vue-router';
import formatDate from "@/common/formatDate";

import Swal from 'sweetalert2';
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

const defaultOptions = { animationData: animationData };
const route = useRoute();

const events = ref([]);
const createAppModal = ref(false);
const stage_activity = ref(false);
const flag_record = ref(false);

const event = ref({
  title: "",
  category: "",
  location: "",
  description: "",
  start_date: "",
  end_date: "",
  status: null,
  type: null,
  er_card: `${route.params.id}`,
});


const rules = {
  title: { required, minLength: minLength(3) },
  type: { required },
  location: { required },
  status: { required },
  start_date: { required },
  end_date: { required }
};

const v$ = useVuelidate(rules, event);

const timeConfig = {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
};

const convertToLocalTime = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000); // Корректировка на часовой пояс
};

const formData = ref({
  transfer: true,
  contraindications: '',
  rescheduling_events: null,
  event: null,
})

const categories = ref([
  {
    name: 'Плановый осмотр',
    value: 'bg-success-subtle',
  },
  {
    name: 'Неплановый осмотр',
    value: 'bg-info-subtle',
  },
  {
    name: 'Изменение активности',
    value: 'bg-warning-subtle',
  },
  {
    name: 'Тредмил-тест',
    value: 'bg-danger-subtle',
  },
  {
    name: 'Оценка состояния',
    value: 'bg-primary-subtle',
  },
]);
const statuses = ref([
  {
    value: "scheduled",
    display_name: "Запланировано",
  },
  {
    value: "cancelled",
    display_name: "Отменено",
  },
  {
    value: "completed",
    display_name: "Завершено",
  },
]);
const getCategoryName = (type) => {
  const category = categories.value.find(cat => cat.value === type);
  return category ? category.name : 'Неизвестная категория';
};
const locations = ref([
  { resuscitation_room: 'Палата реанимации и интенсивной терапии ЛПУ' },
  { inpatient_ward: 'Палата стационарного отделения ЛПУ' },
  { inpatient_department: 'Стационарное отделение ЛПУ' },
  { outpatient_department: 'Амбулаторное отделение ЛПУ' },
  { home_rehabilitation: 'Реабилитация в домашних условиях' }
]);
const getLocationName = (locationKey) => {
  const location = locations.value.find(loc => Object.keys(loc)[0] === locationKey);
  return location ? location[locationKey] : 'Неизвестное местоположение';
};
const statusTranslations = ref({
  scheduled: {
    displayName: 'Запланировано',
    textClass: 'text-primary',
    bgClass: 'bg-primary-subtle p-2 rounded-3'
  },
  cancelled: {
    displayName: 'Отменено',
    textClass: 'text-danger',
    bgClass: 'bg-danger-subtle p-2 rounded-3'
  },
  completed: {
    displayName: 'Завершено',
    textClass: 'text-success',
    bgClass: 'bg-success-subtle p-2 rounded-3'
  }
});

const getStatusStyle = (status) => {
  return statusTranslations.value[status] || {
    displayName: 'Неизвестно',
    textClass: 'text-muted',
    bgClass: 'bg-light'
  };
};





const isEditMode = ref(false);

const modalTitle = computed(() => (isEditMode.value ? "Изменить событие" : "Добавить новое событие"));
const modalButtonText = computed(() => (isEditMode.value ? "Сохранить изменения" : "Сохранить"));

const handleSubmit = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) {
    Swal.fire({
      title: 'Ошибка валидации!',
      text: 'Исправьте все ошибки!',
      icon: 'error',
      timer: 2500,
      timerProgressBar: true
    });
    return;
  }
  try {
    const response = isEditMode.value
      ? await axiosInstance.put(`/events/${event.value.id}/`, event.value)
      : await axiosInstance.post("/events/", event.value);

    if (response.status === (isEditMode.value ? 200 : 201)) {
      Swal.fire({
        icon: "success",
        title: isEditMode.value ? "Изменено!" : "Создано!",
        text: isEditMode.value ? "Событие успешно изменено." : "Успешно создано событие.",
        timer: 2500,
        timerProgressBar: true,
      });

      createAppModal.value = false;
      resetEvent();
      await getAcivities();
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Ошибка",
      text: "Ошибка при обработке события, попробуйте позже!",
      timer: 2500,
      timerProgressBar: true,
    });
  }
};

const resetEvent = () => {
  event.value = {
    title: "",
    category: "",
    location: "",
    description: "",
    start_date: "",
    end_date: "",
    status: null,
    type: null,
    er_card: `${route.params.id}`,
  };
};


const handleAddClick = () => {
  resetEvent(); // Сброс формы перед добавлением
  isEditMode.value = false;
  createAppModal.value = true;
};
// Function to open the modal for editing
const openEditModal = (activity) => {
  isEditMode.value = true;
  createAppModal.value = true;

  const convertToLocalTime = (dateStr) => {
    const date = new Date(dateStr);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000); // Корректировка на часовой пояс
  };

  event.value = {
    ...activity,
    start_date: convertToLocalTime(activity.start_date),
    end_date: convertToLocalTime(activity.end_date),
    er_card: `${route.params.id}` // Explicitly set er_card
  };
};



const deleteDA = async (id) => {
  const result = await Swal.fire({
    title: 'Вы уверены?',
    text: 'Это действие нельзя будет отменить!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Да, удалить!',
    cancelButtonText: 'Отмена'
  });

  if (result.isConfirmed) {
    try {
      await axiosInstance.delete(`/events/${id}`);
      Swal.fire({
        icon: 'success',
        title: 'Удалено!',
        text: 'Событие успешно удалена.',
        timer: 2500,
        timerProgressBar: true
      });
      await getAcivities();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Ошибка',
        text: 'Ошибка при удалении, попробуйте позже!',
        timer: 2500,
        timerProgressBar: true
      });
    }
  }
};

const getAcivities = async () => {
  try {
    const response = await axiosInstance.get(`/er-cards/${route.params.id}/`);
    events.value = response.data.events;
  } catch (error) {
    console.log(error)
  }
};

const id_activity = ref(null);

const OpenDa = (id) => {

  id_activity.value = id;
  stage_activity.value = true;
}

const updateActitvityStage = async (id) => {

  try {
    formData.value.event = id_activity.value;
    await axiosInstance.post(`/er-cards/${route.params.id}/update_activity_stage/`, formData.value);
    Swal.fire({
      icon: 'success',
      title: 'Отправлено!',
      text: 'Событие успешно отправлено.',
      timer: 2500,
      timerProgressBar: true
    });
    stage_activity.value = false;
    formData.value = {
      event: null,
      transfer: true,
      contraindications: '',
      rescheduling_events: null,
    }
    await getAcivities();
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
}

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
  description: "",
  event: null
});
const id_flag = ref(null);

const OpenCH = (id) => {
  id_flag.value = id;
  flag_record.value = true;
}


const createPointsRecord = async () => {
  try {
    formDataPointsRecord.value.event = id_flag.value;
    const response = await axiosInstance.post(`/er-cards/${route.params.id}/add_checkpoint_record/`, formDataPointsRecord.value);

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
      await getAcivities();
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
}


onMounted(async () => {
  await getAcivities();
})



</script>
