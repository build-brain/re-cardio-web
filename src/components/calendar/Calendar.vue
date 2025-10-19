<script>
import Swal from "sweetalert2";
import "@fullcalendar/core";
import simpleBar from "simplebar-vue"
import { CalendarIcon } from "@zhuowenli/vue-feather-icons";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { axiosInstance } from "../../axios";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import listPlugin from "@fullcalendar/list";
import { mapState, mapActions, mapGetters } from 'vuex';
import Multiselect from "@vueform/multiselect";

import FullCalendar from "@fullcalendar/vue3";

import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";

const translations = {
  title: "Название",
  category: "Тип события",
  location: "Локация",
  er_card: "Пациент",
  start_datetime: "Начало даты",
  end_datetime: "Конец даты",
}

export default {
  setup() {
    return { v$: useVuelidate() };
  },
  validations: {
    event: {
      title: {
        required: helpers.withMessage("Название обязательно", required),
      },
      category: {
        required: helpers.withMessage("Тип события обязательна", required),
      },
      location: {
        required: helpers.withMessage("Локация обязательна", required),
      },
      er_card: {
        required: helpers.withMessage("Пациент обязательное поле", required),
      },
      start_datetime: {
        required: helpers.withMessage("Начало даты обязательное поле", required),
      },
      end_datetime: {
        required: helpers.withMessage("Конец даты обязательное поле", required),
      }
    },
    editevent: {
      editTitle: {
        required: helpers.withMessage("Название обязательно", required),
      },
      editcategory: {
        required: helpers.withMessage("Тип события обязательна", required),
      },
      editlocation: {
        required: helpers.withMessage("Локация обязательна", required),
      },
      editer_card: {
        required: helpers.withMessage("Пациент обязательное поле", required),
      },
      start_datetime: {
        required: helpers.withMessage("Начало даты обязательное поле", required),
      },
      end_datetime: {
        required: helpers.withMessage("Конец даты обязательное поле", required),
      }
    }
  },

  data() {
    return {
      events: [],
      selectedCountries: [],
      countries: [],
      emptyMessage: "Нет вариантов",
      isLoading: false,
      calendarOptions: {
        locale: 'ru',
        timeZone: "local",
        droppable: false,
        navLinks: true,
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          bootstrapPlugin,
          listPlugin,
        ],
        buttonText: {
          prev: '<',
          next: '>',
          today: 'Сегодня',
          month: 'Месяц',
          week: 'Неделя',
          day: 'День',
          list: 'Список',
        },
        themeSystem: "bootstrap",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        },
        windowResize: () => {
          this.getInitialView();
        },
        initialView: this.getInitialView(),
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        dateClick: this.dateClicked,
        moreLinkText: function (numEvents) {  // Перевод "more"
          return `+${numEvents} ещё`;
        },
        eventClick: this.editEvent,
        eventsSet: this.handleEvents,
        allDayText: 'Весь день',
        events: this.events
      },
      currentEvents: [],
      showModal: false,
      eventModal: false,
      eventEditModal: false,
      categories: [
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
        }
      ],
      locations: [
        { resuscitation_room: 'Палата реанимации и интенсивной терапии ЛПУ' },
        { inpatient_ward: 'Палата стационарного отделения ЛПУ' },
        { inpatient_department: 'Стационарное отделение ЛПУ' },
        { outpatient_department: 'Амбулаторное отделение ЛПУ' },
        { home_rehabilitation: 'Реабилитация в домашних условиях' }
      ],
      submitted: false,
      submit: false,
      newEventData: {},
      edit: {},
      deleteId: {},

      event: {
        title: "",
        category: "",
        location: "",
        descri: "",
        start_datetime: "",
        end_datetime: "",
        time: '',
        er_card: null,
      },
      editevent: {
        editTitle: "",
        editcategory: "",
        editlocation: "",
        editdescri: "",
        start_datetime: "",
        end_datetime: "",
        editcalendardates: "",
        editer_card: null,
      },
      config: {
        wrap: true,
        altFormat: "M j, Y",
        altInput: true,
        dateFormat: "d M, Y",
        mode: "range",
      },
      timeConfig: {
        enableTime: true,
        altInput: true,
        dateFormat: "Y-m-d H:i",
        altFormat: "d M, Y H:i",
        mode: "single",
        time_24hr: true,
      },
      timeConfig2: {
        enableTime: true,
        altInput: true,
        dateFormat: "Y-m-d H:i",
        altFormat: "d M, Y H:i",
        mode: "single",
        time_24hr: true,
      },

      date2: null,
    };
  },
  components: {
    Layout,
    PageHeader,
    FullCalendar,
    CalendarIcon,
    flatPickr,
    simpleBar
  },
  computed: {

    ...mapState('ecr', {
      eventsall: (state) => state.events,
    }),

  },

  methods: {
    ...mapActions('ecr', ['fetchEvents']),
    asyncFind(query) {
      this.isLoading = true;
      axiosInstance.get(`/patients/?search=${query}`).then(response => {
        this.countries = response.data.results.map(item => ({
          value: item.active_ercard_id,
          label: `${item.first_name} ${item.last_name} ${item.middle_name}`
        }));
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
      });
    },

    clearAll() {
      this.selectedCountries = [];
    },
    formatDate(date) {
      var monthNames = [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
      ];
      var d = new Date(date),
        month = "" + monthNames[d.getMonth()].slice(0, 3),
        day = "" + d.getDate(),
        year = d.getFullYear();
      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;
      return [day + " " + month, year].join(" ");
    },



    dateStamp(start, end) {
      let date;
      if (end == null) {
        date = this.formatDate(start);
      }
      else {
        date = this.formatDate(start) + " - " + this.formatDate(end);
      }
      return date;
    },




     formatTime(params) {
  params = new Date(params);
  if (params.getHours() != null) {
    let hour = params.getHours();
    let minute = params.getMinutes();
    minute = (minute < 10) ? "0" + minute : minute;
    return hour + ":" + minute;
  }
},


    timeStamp(start, end) {
      let time;
      if (this.formatTime(start) == this.formatTime(end)) {
        time = "Мероприятие на целый день";
      } else {
        time = this.formatTime(start) + " - " + this.formatTime(end);
      }
      return time;
    },

    getInitialView() {
      if (window.innerWidth >= 768 && window.innerWidth < 1200) {
        return "timeGridWeek";
      } else if (window.innerWidth <= 768) {
        return "listMonth";
      } else {
        return "dayGridMonth";
      }
    },




    /**
     * Modal form submit
     */
    // eslint-disable-next-line no-unused-vars
    handleSubmit(e) {
      this.submitted = true;

      this.v$.$touch();

      if (this.v$.event.$invalid) {
        let errorMessage = "<div style='text-align:left;'>";

        for (const key in this.v$.event) {
          const field = this.v$.event[key];
          if (field?.$errors?.length) {
            const messages = field.$errors.map(err => err.$message).join(", ");
            errorMessage += `<p><strong>${translations[key]}:</strong> ${messages}</p>`;
          }
        }

        errorMessage += "</div>";

        Swal.fire({
          title: "Ошибка валидации",
          html: errorMessage,
          icon: "error"
        });

        return;
      }

      const eventDataForServer = {
        title: this.event.title,
        type: this.event.category,
        location: this.event.location,
        description: this.event.descri,
        start_date: this.event.start_datetime,
        end_date: this.event.end_datetime,
        er_card: this.event.er_card
      };


      axiosInstance.post('/events/', eventDataForServer)
        .then(response => {

          const eventData = response.data;


          const calendarApi = this.$refs.fullCalendar.getApi();

          calendarApi.addEvent({
            id: eventData.id,
            title: `${eventData.patient_first_name} ${eventData.patient_last_name}`, // Это можно использовать для заголовка
            start: eventData.start_date,
            end: eventData.end_date,
            className: String(eventData.type),
            extendedProps: {
              location: eventData.location,
              description: eventData.description,
              patient_first_name: eventData.patient_first_name,
              patient_last_name: eventData.patient_last_name,
              patient_middle_name: eventData.patient_middle_name,
              er_card: eventData.er_card
            },

          });

          this.successmsg();
          this.showModal = false;
          this.event = {};
        })
        .catch(error => {
          console.error('Error creating event:', error);
          // Обработка ошибки при создании события
          Swal.fire({
            icon: 'error',
            title: 'Ошибка!',
            text: 'Произошла ошибка при создании события.'
          });
        })
        .finally(() => {
          this.submitted = false;
        });
    },



    // eslint-disable-next-line no-unused-vars
    hideModal(e) {
      this.submitted = false;
      this.showModal = false;
      this.event = {};
    },
    /**
     * Edit event modal submit
     */
    // eslint-disable-next-line no-unused-vars
    editSubmit(e) {
      this.submit = true;
      const editTitle = this.editevent.editTitle;
      const editcategory = this.editevent.editcategory;
      const editlocation = this.editevent.editlocation;
      const editdescri = this.editevent.editdescri;
      const editer_card = this.editevent.editer_card;
      const startDate = this.editevent.start_datetime;
      const endDate = this.editevent.end_datetime;


      const eventDataForServer = {
        title: editTitle,
        type: editcategory,
        location: editlocation,
        description: editdescri,
        er_card: editer_card,
        start_date: startDate,
        end_date: endDate,
      };

      axiosInstance.put(`/events/${this.edit.id}/`, eventDataForServer)
        .then(response => {
          this.edit.setProp("title", editTitle);
          this.edit.setProp("classNames", editcategory);
          this.edit.setStart(startDate);
          this.edit.setEnd(endDate);
          this.edit.setExtendedProp("location", editlocation);
          this.edit.setExtendedProp("description", editdescri);
          this.successmsg();
          this.fetchEvents();
          this.eventModal = false;
          this.eventEditModal = false;

        })
        .catch(error => {
          console.error('Error editing event:', error);
          Swal.fire({
            icon: 'error',
            title: 'Ошибка',
            text: 'Возникла проблема с редактированием события. Попробуйте еще раз.'
          });
        })
        .finally(() => {
          this.submit = false;
        });

    },

    /**
     * Delete event
     */
    deleteEvent() {
      axiosInstance.delete(`/events/${this.edit.id}/`)
        .then(response => {
          this.edit.remove();
          this.successmsg();
          this.eventModal = false;
          this.eventEditModal = false;
        })
        .catch(error => {
          console.error('Error deleting event:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Произошла ошибка при удалении события. Пожалуйста, попробуйте снова.'
          });
        });
    },

    /**
     * Modal open for add event
     */
    dateClicked(info) {
      this.newEventData = info;
      this.showModal = true;
    },
    /**
     * Modal open for edit event
     */
    editEvent(info) {
      this.edit = info.event;
      // TODO: add debounce to search patient
      // TODO: fix edit event

      this.editevent.editTitle = this.edit.title;
      const category = Array.isArray(this.edit.classNames) ? this.edit.classNames[0] : this.edit.classNames;

      this.editevent.editcategory = category;

      this.editevent.editlocation = this.edit.extendedProps.location;
      this.editevent.editdescri = this.edit.extendedProps.description;
      this.editevent.editer_card = this.edit.extendedProps.er_card;
      this.editevent.start_datetime = this.edit.start;
      this.editevent.end_datetime = this.edit.end;

      this.eventEditModal = true;
    },

    closeModal() {
      this.eventModal = false;
      this.eventEditModal = false;
    },

    confirm() {
      Swal.fire({
        title: "Вы уверены?",
        text: "Вы хотите  удалить это!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#34c38f",
        cancelButtonColor: "#f46a6a",
        confirmButtonText: "Да удалить!",
        cancelButtonText: "Отмена",
      }).then((result) => {
        if (result.value) {
          this.deleteEvent();
          Swal.fire("Удалено!", "Мероприятие удалено.", "success");
        }
      });
    },

    /**
     * Show list of events
     */
    handleEvents(events) {
      this.currentEvents = events.reverse();
    },

    /**
     * Show successfull Save Dialog
     */
    successmsg() {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Событие успешно сохранено!",
        showConfirmButton: false,
        timer: 1000,
      });
    },
  },

  async mounted() {
    await this.fetchEvents();
    this.asyncFind('');
    this.calendarOptions.events = this.eventsall;

  },



};
</script>

<template>

  <BRow>
    <BCol cols="12">
      <BRow>
        <BCol xl="3">
          <BCard no-body class="card-h-100">
            <BCardBody>
              <BButton variant="primary" class="w-100" id="btn-new-event" @click="showModal = true">
                <i class="mdi mdi-plus"></i> {{ $t('t-events.t-event') }}
              </BButton>

              <div id="external-events">
                <br />
                <div class="external-event fc-event bg-success-subtle text-success" data-class="bg-success-subtle">
                  <i class="mdi mdi-checkbox-blank-circle me-2"></i>{{ $t('t-events.t-event-inspect1') }}
                </div>
                <div class="external-event fc-event bg-info-subtle text-info" data-class="bg-info-subtle">
                  <i class="mdi mdi-checkbox-blank-circle me-2"></i>{{ $t('t-events.unplanned_inspection') }}
                </div>
                <div class="external-event fc-event bg-warning-subtle text-warning" data-class="bg-warning-subtle">
                  <i class="mdi mdi-checkbox-blank-circle me-2"></i>{{ $t('t-events.activity_change') }}
                </div>
                <div class="external-event fc-event bg-danger-subtle text-danger" data-class="bg-danger-subtle">
                  <i class="mdi mdi-checkbox-blank-circle me-2"></i>{{ $t('t-events.treadmill_test') }}
                </div>

              </div>
            </BCardBody>
          </BCard>
          <div>
            <h5 class="mb-1">Предстоящие события</h5>
            <p class="text-muted">Не пропустите запланированные мероприятия</p>
            <simpleBar class="upcoming-events pe-2 me-n1 mb-3" data-simplebar="init" style="height: 400px">

              <BCard no-body class="mb-3" v-for="event in currentEvents" :key="event.id">
                <BCardBody>
                  <div class="d-flex mb-3">
                    <div class="flex-grow-1">
                      <span class="fw-medium">{{ this.dateStamp(event.start, event.end) }}</span>
                    </div>

                    <div class="flex-shrink-0">
                      <BBadge tag="small" variant="primary-subtle" class="bg-primary-subtle text-primary ms-auto">{{
                this.timeStamp(event.start, event.end)
              }}</BBadge>
                    </div>
                  </div>
                  <h6 class="card-title fs-16">{{ event.extendedProps.patient_first_name }} {{
                event.extendedProps.patient_last_name }} {{ event.extendedProps.patient_middle_name }}</h6>
                  <p class="text-muted text-truncate-two-lines mb-0">{{ (event.extendedProps &&
                event.extendedProps.description) ?
                event.extendedProps.description : "N.A."
                    }}</p>
                </BCardBody>
              </BCard>
            </simpleBar>
          </div>

        </BCol>
        <BCol xl="9">
          <BCard no-body class="card-h-100">
            <BCardBody>
              <FullCalendar ref="fullCalendar" :options="calendarOptions" />
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>
      <div style="clear: both"></div>
    </BCol>
  </BRow>

  <BModal v-model="showModal" title="Добавить новое событие" body-class="p-4" header-class="p-3 bg-info-subtle"
    hide-footer class="v-modal-custom" centered>
    <form @submit.prevent="handleSubmit" name="event-form" id="form-event">
      <div class="text-end">
        <a href="#" class="btn btn-sm btn-soft-primary" id="edit-event-btn" data-id="new-event"
          onclick="editEvent(this)" role="button" hidden="true">Изменить</a>
      </div>
      <div class="row event-form">
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Тип cобытия</label>
            <select v-model="event.category" class="form-control" name="category"
              :class="{ 'is-invalid': submitted && v$.event.category.$error }">
              <option value="" selected disabled>Выберите событие</option>
              <option v-for="option in categories" :key="option.backgroundColor" :value="`${option.value}`">
                {{ option.name }}
              </option>
            </select>
            <div v-if="submitted && v$.event.category.$error" class="invalid-feedback">
              <span v-if="v$.event.category.required.$message">{{ v$.event.category.required.$message }}</span>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Пациенты</label>
            <Multiselect :class="{ 'is-invalid': submitted && v$.event.er_card.$error }" v-model="event.er_card"
              :close-on-select="true" :searchable="true" placeholder="Поиск пациента" :create-option="true"
              :options="countries" @search-change="asyncFind" no-options-text="Введите Ф.И.О. пациента" />
            <div v-if="submitted && v$.event.er_card.$error" class="invalid-feedback">
              <span v-if="v$.event.er_card.required.$message">{{ v$.event.er_card.required.$message }}</span>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Название событий</label>
            <input id="name" v-model="event.title" type="text" class="form-control"
              placeholder="Введите название события" :class="{ 'is-invalid': submitted && v$.event.title.$error }" />
            <div v-if="submitted && v$.event.title.$error" class="invalid-feedback">
              <span v-if="v$.event.title.required.$message">{{
                v$.event.title.required.$message
              }}</span>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="row">
            <div class="col-6 mb-3">
              <label>Дата и время начало</label>
              <div class="input-group">
                <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                <flat-pickr placeholder="Выберите начало" v-model="event.start_datetime" :config="timeConfig"
                  :class="['form-control', { 'is-invalid': submitted && v$.event.start_datetime.$error }]"
                  id="caledate">
                </flat-pickr>
                <div v-if="submitted && v$.event.start_datetime.$error" class="invalid-feedback">
                  <span v-if="v$.event.start_datetime.required.$message">
                    {{ v$.event.start_datetime.required.$message }}
                  </span>
                </div>
              </div>
            </div>

            <div class="col-6 mb-3">
              <label>Дата и время окончания</label>

              <div class="input-group">
                <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                <flat-pickr placeholder="Выберите конец" v-model="event.end_datetime" :config="timeConfig"
                  :class="['form-control', { 'is-invalid': submitted && v$.event.end_datetime.$error }]" id="caledate">
                </flat-pickr>
                <div v-if="submitted && v$.event.end_datetime.$error" class="invalid-feedback">
                  <span v-if="v$.event.end_datetime.required.$message">
                    {{ v$.event.end_datetime.required.$message }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Локация</label>
            <select v-model="event.location" class="form-select" name="location"
              :class="{ 'is-invalid': submitted && v$.event.location.$error }">
              <option value="" selected disabled>Выберите локацию</option>
              <option v-for="location in locations" :key="Object.keys(location)[0]" :value="Object.keys(location)[0]">
                {{ Object.values(location)[0] }}
              </option>
            </select>
            <div v-if="submitted && v$.event.location.$error" class="invalid-feedback">
              <span v-if="v$.event.location.required.$message">
                {{ v$.event.location.required.$message }}
              </span>
            </div>

          </div>
        </div>
      </div>

      <div class="col-12">
        <div class="mb-3">
          <label class="form-label">Описание</label>
          <textarea class="form-control d-block" id="event-description" v-model="event.descri"
            placeholder="Введите описание" rows="3" spellcheck="false"></textarea>



        </div>
      </div>

      <div class="text-end pt-3">
        <BButton variant="light" @click="hideModal">Закрыть</BButton>
        <BButton type="submit" variant="success" class="ms-1">Создать событие</BButton>
      </div>
    </form>
  </BModal>


  <BModal v-model="eventModal" :title="this.editevent.editTitle" hide-footer body-class="p-4"
    header-class="p-3 bg-info-subtle" class="v-modal-custom" centered>
    <div class="text-end">
      <a href="#" class="btn btn-sm btn-soft-primary" id="edit-event-btn" data-id="edit-event" role="button"
        @click="this.eventEditModal = true, this.eventModal = false">Изменить</a>
    </div>
    <div class="event-details">
      <div class="d-flex mb-2">
        <div class="flex-grow-1 d-flex align-items-center">
          <div class="flex-shrink-0 me-3">
            <i class="ri-calendar-event-line text-muted fs-16"></i>
          </div>
          <div class="flex-grow-1">
            <h6 class="d-block fw-semibold mb-0" id="event-start-date-tag">
              {{ this.editevent.editdates }}
            </h6>
          </div>
        </div>
      </div>
      <div class="d-flex align-items-center mb-2">
        <div class="flex-shrink-0 me-3">
          <i class="ri-time-line text-muted fs-16"></i>
        </div>
        <div class="flex-grow-1">
          <h6 class="d-block fw-semibold mb-0"><span id="event-timepicker1-tag"></span> - <span
              id="event-timepicker2-tag"></span></h6>
        </div>
      </div>
      <div class="d-flex align-items-center mb-2">
        <div class="flex-shrink-0 me-3">
          <i class="ri-map-pin-line text-muted fs-16"></i>
        </div>
        <div class="flex-grow-1">
          <h6 class="d-block fw-semibold mb-0"> <span id="event-location-tag">
              {{ this.editevent.editlocation }}
            </span></h6>
        </div>
      </div>
      <div class="d-flex mb-3">
        <div class="flex-shrink-0 me-3">
          <i class="ri-discuss-line text-muted fs-16"></i>
        </div>
        <div class="flex-grow-1">
          <p class="d-block text-muted mb-0" id="event-description-tag">
            {{ this.editevent.editdescri || "N.A." }}
          </p>
        </div>
      </div>
    </div>
    <div class="hstack gap-2 justify-content-end">
      <BButton variant="soft-danger" id="btn-delete-event" @click="confirm"><i class="ri-close-line align-bottom"></i>
        Удалить</BButton>
    </div>
  </BModal>

  <BModal v-model="eventEditModal" title="Изменить событие" title-class="text-black font-18" body-class="p-4"
    header-class="p-3 bg-info-subtle" hide-footer class="v-modal-custom" centered>
    <form @submit.prevent="editSubmit" name="event-form" id="form-event">
      <div class="row event-form">

        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Тип cобытия</label>
            <select v-model="editevent.editcategory" class="form-control" name="category"
              :class="{ 'is-invalid': submitted && v$.editevent.editcategory.$error }">
              <option value="" selected disabled>Выберите событие</option>
              <option v-for="option in categories" :key="option.backgroundColor" :value="`${option.value}`">
                {{ option.name }}
              </option>
            </select>
            <div v-if="submitted && v$.editevent.editcategory.$error" class="invalid-feedback">
              <span v-if="v$.editevent.editcategory.required.$message">{{ v$.editevent.editcategory.required.$message
                }}</span>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label">Пациенты</label>
          <Multiselect v-model="editevent.editer_card" class="form-control" :close-on-select="true" :searchable="true"
            placeholder="Поиск Пациента" :create-option="true" :options="countries" @search-change="asyncFind" />
        </div>
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Название события</label>
            <input id="name" v-model="editevent.editTitle" type="text" class="form-control"
              placeholder="Введите название события" />
          </div>
        </div>
        <div class="col-12">
          <div class="row">
            <div class="col-6 mb-3">
              <label>Дата и время начало</label>
              <div class="input-group">
                <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                <flat-pickr placeholder="Выберите начало" v-model="editevent.start_datetime" :config="timeConfig"
                  class="form-control flatpickr-input" id="caledate"></flat-pickr>

              </div>
            </div>
            <div class="col-6 mb-3">
              <label>Дата и время окончания</label>
              <div class="input-group">
                <flat-pickr placeholder="Выберите конец" v-model="editevent.end_datetime" :config="timeConfig2"
                  class="form-control flatpickr-input" id="caledate"></flat-pickr>
                <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Локация</label>
            <select v-model="editevent.editlocation" class="form-select" name="location">
              <option value="" selected disabled>Выберите локацию</option>
              <option v-for="location in locations" :key="Object.keys(location)[0]" :value="Object.keys(location)[0]">
                {{ Object.values(location)[0] }}
              </option>
            </select>

          </div>
        </div>
        <div class="col-12">
          <div class="mb-3">
            <label class="form-label">Описание</label>
            <textarea class="form-control d-block" id="event-description" v-model="editevent.editdescri"
              placeholder="Enter a description" rows="3" spellcheck="false"></textarea>
          </div>
        </div>
      </div>
      <div class="hstack gap-2 justify-content-end">
        <BButton variant="soft-danger" id="btn-delete-event" @click="confirm"><i class="ri-close-line align-bottom"></i>
          Удалить</BButton>
        <BButton variant="success" type="submit" id="btn-save-event">Обновить</BButton>
      </div>
    </form>
  </BModal>


</template>