<template>
    <PageHeader title="ЭЛЕКТРОННЫЕ КАРТЫ РЕАБИЛИТАЦИИ" pageTitle="Профиль пациента" />
    <div>
      <BRow>
        <BCol lg="12">
          <BCard no-body id="applicationList">
            <BCardHeader class="border-0">
              <div class="d-md-flex align-items-center">
                <h5 class="card-title mb-3 mb-md-0 flex-grow-1 fw-bold">Список целей двигательной активности</h5>
                <div class="flex-shrink-0">
                  <div class="d-flex gap-1 flex-wrap">
             
                    <BButton type="button" variant="primary" @click="printTable" class="btn"> <i
                        class="ri-file-line align-bottom"></i>
                      Экспрот
                    </BButton>
  
                  </div>
                </div>
              </div>
            </BCardHeader>
  
            <BCardBody class="pt-3">
              <div>
                <div class="table-responsive table-card mb-1">
                  <table class="table table-nowrap align-middle" id="jobListTable" v-if="activities.length !== 0">
                    <thead class="text-muted table-light">
                      <tr class="text-uppercase">
                        <th>ступень</th>
                        <th>начало</th>
                        <th>завершение</th>
                        <th>цель да</th>
                
                      </tr>
                    </thead>
                    <tbody class="list form-check-all">
                      <tr v-for="activities in activities" :key="activities.id">
                        <td>{{ activities.activity_stage }}</td>
                        <td>{{ formatDate(activities.start_date) }}</td>
                        <td> {{ formatDate(activities.end_date) }} </td>
                        <td> <span class="d-flex flex-column">
                            <p>{{ activities.goal }}</p>
                          </span> </td>
                        
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
                  <router-link :to="`/archive-ecr/profile-erc/${route.params.id}`">
                    <b-button variant="danger">назад</b-button>
  
                  </router-link>
  
                </div>
              </div>
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>
  
   
  
    </div>
  </template>
  
  <script setup>
  import PageHeader from "../../../../components/page-header.vue";
  import animationData from "@/components/widgets/msoeawqm.json";
  import Lottie from "../../../../components/widgets/lottie.vue";
  import { ref, onMounted } from 'vue';
  import { axiosInstance } from '../../../../axios';
  import { useRoute } from 'vue-router';
  import formatDate from "@/common/formatDate";
  import jsPDF from 'jspdf';
  import autoTable from 'jspdf-autotable';
  import font from '@/assets/fonts/Roboto-Regular-normal.js'; // Используйте правильный путь к вашему файлу

 
  const defaultOptions = { animationData: animationData };
  const route = useRoute();
  const activities = ref([]);
  const generateFile = ref([]);
  const patient = ref([]);
  const ca_sheets = ref([]);
  const createAppModal = ref(false);
  const walkingstart = ref(null);
  const walkingend = ref(null);
  const tabIndex = ref(0);
  const dataDa = ref({
    activity_stage: null,
    goal: "",
    walking_tempo: null,
    distance: null,
    start_date: null,
    end_date: null,
    er_card: `${route.params.id}`,
  });
  


  
  const getAcivities = async () => {
    try {
      const response = await axiosInstance.get(`/er-cards/${route.params.id}/`);
      activities.value = response.data.activities;
      generateFile.value = response.data;
      patient.value = response.data.patient;
      ca_sheets.value = response.data.ca_sheet;
    } catch (error) {
      console.log(error)
    }
  };
  
  
  
  const printTable = async () => {
    let doc = new jsPDF();
    doc.addFileToVFS('Roboto-Regular.ttf', font);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
  
    try {
      const patientFullName = `${patient.value.last_name} ${patient.value.first_name} ${patient.value.middle_name}`;
      const patientBirthDate = new Date(patient.value.birth_date);
      const patientAge = new Date().getFullYear() - patientBirthDate.getFullYear();
      const dateOIM = new Date(patient.value.created_at).toLocaleDateString();
      const severityClass = ca_sheets.value.patient_severity_class;
      let startY = 25;
  
      // Заголовок
      autoTable(doc, {
        head: [['ПРОГРАММА ФИЗИЧЕСКОЙ РЕАБИЛИТАЦИИ']],
        body: [],
        startY: 13,
        theme: 'grid',
        styles: {
          fontSize: 14,
          halign: 'center',
          cellPadding: 3,
          font: "Roboto",
          lineColor: [0, 0, 0], // Цвет линий сетки
          lineWidth: 0.2 // Толщина линий сетки
        },
        headStyles: {
          fillColor: null, // Убираем цвет фона заголовков
          textColor: [0, 0, 0], // Устанавливаем цвет текста заголовков
          lineWidth: 0.2 // Толщина линий заголовков
        },
        margin: { bottom: 200 },
        tableWidth: 180 // Установите желаемую ширину таблицы
      });
  
  
      autoTable(doc, {
        head: [['Пациент', 'Год рождения', 'Возраст']],
        body: [[patientFullName, patientBirthDate.getFullYear(), patientAge]],
        startY: startY,
        theme: 'grid',
        styles: {
          fontSize: 10,
          halign: 'center',
          cellPadding: 3,
          font: "Roboto",
          lineColor: [0, 0, 0], // Цвет линий сетки
          lineWidth: 0.2 // Толщина линий сетки
        },
        headStyles: {
          fillColor: null, // Убираем цвет фона заголовков
          textColor: [0, 0, 0], // Устанавливаем цвет текста заголовков
          lineWidth: 0.2 // Толщина линий заголовков
        },
        bodyStyles: {
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
  
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 50 },
          2: { cellWidth: 50 }
        },
        margin: { top: 0 },
      });
  
      // Вторая таблица (дата ОИМ и класс тяжести)
      startY += 20; // Увеличиваем Y-координату для следующей таблицы
      autoTable(doc, {
        head: [['Дата ОИМ', 'Класс Тяжести']],
        body: [[dateOIM, severityClass]],
        startY: startY,
        theme: 'grid',
        styles: {
          fontSize: 10,
          halign: 'center',
          cellPadding: 3,
          font: "Roboto",
          lineColor: [0, 0, 0], // Цвет линий сетки
          lineWidth: 0.2 // Толщина линий сетки
        },
        headStyles: {
          fillColor: null, // Убираем цвет фона заголовков
          textColor: [0, 0, 0], // Устанавливаем цвет текста заголовков
          lineWidth: 0.2  // Толщина линий заголовков
        },
        bodyStyles: {
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
  
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 90 }
        }
      });
  
      // Третья таблица (ступени ДА и описание активностей)
      startY += 20; // Увеличиваем Y-координату для следующей таблицы
      autoTable(doc, {
        head: [['Ступени ДА', 'Сроки ДА (Начало)', 'Сроки ДА (Окончание)', 'Описание целей двигательной активности']],
        body: activities.value.map(activity => {
          const stage = activity.activity_stage;
          const startDate = new Date(activity.start_date).toLocaleDateString();
          const endDate = new Date(activity.end_date).toLocaleDateString();
          const description = activity.goal;
          return [stage, startDate, endDate, description];
        }),
        startY: startY,
        theme: 'grid',
        styles: {
          fontSize: 10,
          halign: 'center',
          cellPadding: 3,
          font: "Roboto",
          lineColor: [0, 0, 0], // Цвет линий сетки
          lineWidth: 0.2 // Толщина линий сетки
        },
        headStyles: {
          fillColor: null, // Убираем цвет фона заголовков
          textColor: [0, 0, 0], // Устанавливаем цвет текста заголовков
          lineWidth: 0.2 // Толщина линий заголовков
        },
        bodyStyles: {
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
  
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Уменьшено на 10
          1: { cellWidth: 30 }, // Уменьшено на 10
          2: { cellWidth: 30 }, // Уменьшено на 10
          3: { cellWidth: 90 }  // Уменьшено на 10
        }
      });
  
      doc.save('rehabilitation_program.pdf');
    } catch (error) {
      console.error('Error fetching or embedding font:', error);
    }
  };
  
  onMounted(async () => {
    await getAcivities();
  })
  
  
  
  </script>
  
  <style>
  .print-only {
    display: none;
  }
  
  
  @media print {
    .print-only {
      display: block;
    }
  
  }
  </style>