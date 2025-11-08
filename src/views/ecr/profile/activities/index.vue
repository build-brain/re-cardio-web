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
                  <BButton type="button" class="add-btn" variant="success" id="create-btn"
                    @click="createAppModal = true">
                    <i class="ri-add-line align-bottom me-1"></i> {{ $t('add') }}
                  </BButton>

                  <BButton type="button" variant="primary" @click="printWord" class="btn"> <i
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
                      <th>действия</th>
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
                      <td>
                        <ul class="list-inline hstack gap-2 mb-0">


                          <li class="list-inline-item" data-bs-toggle="tooltip" data-bs-trigger="hover"
                            data-bs-placement="top" title="Remove">
                            <button class="btn btn-sm btn-danger d-inline-block remove-item-btn"
                              @click="deleteDA(activities.id)">
                              <i class="ri-delete-bin-5-fill fs-16"></i>
                            </button>
                          </li>
                        </ul>
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
    <BModal v-model="createAppModal" centered
      :title="isEditing ? 'Изменить цель двигательной активности' : 'Добавить цель двигательной активности'">
      <template v-slot:default>
        <BTabs nav-class="nav nav-tabs nav-tabs-custom nav-success" class="w-100" v-model="tabIndex"
          style="height: 30rem;">
          <BTab active class="nav-item nav-link p-3">
            <template #title>
              <div class="fs-15">
                5 - ступень ДА
              </div>
            </template>

            <form @submit.prevent="postMessage" class="mt-3">
              <div class="mb-3">
                <label class="form-label fw-bold">Ступень ДА: 5</label>
              </div>
              <BRow class="mb-3">
                <BCol sm="6">
                  <label class="form-label fw-bold">Дата начало</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                    <flatPickr v-model="dataDa.start_date" placeholder="Дата начало" :config="dateConfig"
                      class="form-control flatpickr-input" ></flatPickr>
                  </div>
                  <div v-if="v$.start_date.$error" class="text-danger">
                    Укажите дату начала.
                  </div>
                </BCol>
                <BCol sm="6">
                  <label class="form-label fw-bold">Дата завершения</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                    <flatPickr v-model="dataDa.end_date" placeholder="Дата завершения" :config="dateConfig"
                      class="form-control flatpickr-input" ></flatPickr>
                  </div>
                  <div v-if="v$.end_date.$error" class="text-danger">
                    Укажите дату завершения.
                  </div>
                </BCol>
              </BRow>
              <div class="mb-3">
                <label class="form-label fw-bold">Цель двигательной активности</label>
                <textarea name="message" class="form-control" v-model="dataDa.goal" cols="20" rows="5"
                  :class="{ 'is-invalid': v$.goal.$error }"></textarea>
                <div v-if="v$.goal.$error" class="invalid-feedback">
                  Пожалуйста, укажите цель двигательной активности.
                </div>
              </div>
              <BRow class="mb-3">
                <BCol sm="5">
                  <label class="form-label">Дистанция ходьбы (м.)</label>
                  <BFormInput type="number" v-model="dataDa.distance" :class="{ 'is-invalid': v$.distance.$error }" />
                  <div v-if="v$.distance.$error" class="invalid-feedback">
                    Это поле обязательное.
                  </div>
                </BCol>
                <BCol sm="7">
                  <BRow>
                    <label class="form-label">Темп ходьбы (ш./м.)</label>
                    <BCol sm="5">
                      <BFormInput type="number" v-model="dataDa.walkingstart"
                        :class="{ 'is-invalid': v$.walkingstart.$error }" />
                      
                    </BCol>
                    <BCol sm="2" class="d-flex align-items-center justify-content-center">
                      <span>-</span>
                    </BCol>
                    <BCol sm="5">
                      <BFormInput type="number" v-model="dataDa.walkingend" :class="{ 'is-invalid': v$.walkingend.$error }" />
                    
                    </BCol>
                  </BRow>
                </BCol>
              </BRow>
            </form>
          </BTab>
        </BTabs>
      </template>

      <template #footer class="d-flex justify-content-between">
        <div>
          <b-button variant="danger" @click="createAppModal = false">Отмена</b-button>
        </div>
        <div v-if="isEditing === false">
          <b-button variant="success" @click="addDA" >Добавить</b-button>
        </div>
        <div v-else>
          <b-button variant="primary" @click="putdDA" :disabled="v$.$invalid">Изменить</b-button>
        </div>
      </template>
    </BModal>

  </div>
</template>

<script setup>
import PageHeader from "../../../../components/page-header.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import Lottie from "../../../../components/widgets/lottie.vue";
import { ref, onMounted, watch, reactive } from 'vue';
import { axiosInstance } from '../../../../axios';
import { useRoute } from 'vue-router';
import formatDate from "@/common/formatDate";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import font from '@/assets/fonts/Roboto-Regular-normal.js'; // Используйте правильный путь к вашему файлу
import Swal from 'sweetalert2';
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import useVuelidate from "@vuelidate/core";
import { required, numeric } from "@vuelidate/validators";
import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
} from 'docx';

const defaultOptions = { animationData: animationData };
const route = useRoute();
const activities = ref([]);
const generateFile = ref([]);
const patient = ref([]);
const ca_sheets = ref([]);
const createAppModal = ref(false);

const tabIndex = ref(0);
const dataDa = reactive({
  activity_stage: 5,  // Значение по умолчанию
  goal: null,
  walking_tempo: null,
  distance: null,
  start_date: null,
  end_date: null,
  er_card: `${route.params.id}`,
  walkingstart: null,
  walkingend: null
});

const rules = {
  goal: { required },
  distance: { required, numeric },
  start_date: { required },
  end_date: { required },
  walkingstart: { required, numeric },
  walkingend: { required, numeric },
};

const v$ = useVuelidate(rules, dataDa);
const dateConfig = ref({
  enableTime: false,
  altInput: true,
  dateFormat: "Y-m-d",
  altFormat: "d M,Y",
  mode: "single",
  time_24hr: false,
});
const isEditing = ref(false); // Переменная для отслеживания режима
const editId = ref(null);
const editDA = (activity) => {
  dataDa.value = { ...activity };
  editId.value = activity.id;

  // Проверка, что walking_tempo не является null или undefined
  if (activity.walking_tempo) {
    const tempos = activity.walking_tempo.split('-');
    walkingstart.value = Number(tempos[0]) || null; // Устанавливаем null, если не удается преобразовать
    walkingend.value = Number(tempos[1]) || null;
  } else {
    walkingstart.value = null;
    walkingend.value = null;
  }

  isEditing.value = true; // Устанавливаем режим редактирования
  createAppModal.value = true;
};
const updateWalkingTempo = () => {
  dataDa.walking_tempo = `${Number(dataDa.walkingstart)}-${Number(dataDa.walkingend)}`;
};

// Слежение за изменениями в walkingstart и walkingend
watch([() => dataDa.walkingstart, () => dataDa.walkingend], () => {
  updateWalkingTempo();
});


const addDA = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) {
    Swal.fire({
      title: "Ошибка валидации!",
      text: "Исправьте все ошибки!",
      icon: "error",
      timer: 2500,
      timerProgressBar: true
    });
    return;
  }

  // Обновляем walking_tempo
  updateWalkingTempo();

  // Создаем объект для отправки, исключая walkingstart и walkingend
  const { walkingstart, walkingend, ...dataToSend } = dataDa;
  console.log(dataToSend);

  try {
    await axiosInstance.post('/activities/', dataToSend);
    Swal.fire({
      icon: 'success',
      title: 'Успешно',
      text: 'Двигательная активность успешно добавлена!',
      timer: 2500,
      timerProgressBar: true
    });
    createAppModal.value = false;
    // Сброс данных
    Object.assign(dataDa, {
      goal: null,
      distance: null,
      start_date: null,
      end_date: null,
      walking_tempo: null,
      walkingstart: null,
      walkingend: null
    });
    await getAcivities();
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Ошибка',
      text: 'Ошибка, попробуйте позже!',
      timer: 2500,
      timerProgressBar: true
    });
  }
};

const putdDA = async () => {
  try {
    dataDa.value.walking_tempo = Number(walkingstart.value) + "-" + Number(walkingend.value);
    if (tabIndex.value === 1) {
      dataDa.value.activity_stage = 5;
    }
    await axiosInstance.put(`/activities/${editId.value}`, dataDa.value);
    Swal.fire({
      icon: 'success',
      title: 'Успешно',
      text: 'Двигательная активность успешно изменена!',
      timer: 2500,
      timerProgressBar: true
    });
    createAppModal.value = false;

    await getAcivities();
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Ошибка',
      text: 'Ошибка, попробуйте позже!',
      timer: 2500,
      timerProgressBar: true
    });
  }
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
      await axiosInstance.delete(`/activities/${id}`);
      Swal.fire({
        icon: 'success',
        title: 'Удалено!',
        text: 'Двигательная активность успешно удалена.',
        timer: 2500,
        timerProgressBar: true
      });

      // Обновите список активностей после удаления
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

const printWord = async () => {
  try {
    const patientFullName = `${patient.value.last_name} ${patient.value.first_name} ${patient.value.middle_name}`;
    const patientBirthDate = new Date(patient.value.birth_date);
    const patientAge = new Date().getFullYear() - patientBirthDate.getFullYear();
    const dateOIM = new Date(patient.value.created_at).toLocaleDateString();
    const severityClass = ca_sheets.value.patient_severity_class;

    // 🔹 Заголовок документа
    const title = new Paragraph({
      children: [
        new TextRun({
          text: 'ПРОГРАММА ФИЗИЧЕСКОЙ РЕАБИЛИТАЦИИ',
          bold: true,
          size: 28,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    });

    // 🔹 Таблица с данными пациента
    const patientTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: 'single', size: 1 },
        bottom: { style: 'single', size: 1 },
        left: { style: 'single', size: 1 },
        right: { style: 'single', size: 1 },
        insideHorizontal: { style: 'single', size: 1 },
        insideVertical: { style: 'single', size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Пациент', alignment: AlignmentType.CENTER, bold: true })],
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Год рождения', alignment: AlignmentType.CENTER, bold: true })],
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Возраст', alignment: AlignmentType.CENTER, bold: true })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(patientFullName)] }),
            new TableCell({
              children: [new Paragraph(String(patientBirthDate.getFullYear()))],
            }),
            new TableCell({ children: [new Paragraph(String(patientAge))] }),
          ],
        }),
      ],
    });

    // 🔹 Таблица с датой ОИМ и классом тяжести
    const infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: 'single', size: 1 },
        bottom: { style: 'single', size: 1 },
        left: { style: 'single', size: 1 },
        right: { style: 'single', size: 1 },
        insideHorizontal: { style: 'single', size: 1 },
        insideVertical: { style: 'single', size: 1 },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Дата ОИМ', alignment: AlignmentType.CENTER, bold: true })],
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Класс Тяжести', alignment: AlignmentType.CENTER, bold: true })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(dateOIM)] }),
            new TableCell({ children: [new Paragraph(String(severityClass))] }),
          ],
        }),
      ],
    });

    // 🔹 Таблица со ступенями ДА
    const activityRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Ступени ДА', bold: true, alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Сроки ДА (Начало)', bold: true, alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Сроки ДА (Окончание)', bold: true, alignment: AlignmentType.CENTER })],
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Описание целей двигательной активности', bold: true, alignment: AlignmentType.CENTER })],
          }),
        ],
      }),

      // 🔸 Строки активности
      ...activities.value.map((a) => {
        const stage = a.activity_stage ? String(a.activity_stage) : '-';
        const start = a.start_date ? new Date(a.start_date).toLocaleDateString() : '-';
        const end = a.end_date ? new Date(a.end_date).toLocaleDateString() : '-';
        const goal = a.goal?.trim() ? a.goal : '-';

        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: stage, alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: start, alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: end, alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              children: [new Paragraph({ text: goal })],
            }),
          ],
        });
      }),
    ];

    const activityTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: 'single', size: 1 },
        bottom: { style: 'single', size: 1 },
        left: { style: 'single', size: 1 },
        right: { style: 'single', size: 1 },
        insideHorizontal: { style: 'single', size: 1 },
        insideVertical: { style: 'single', size: 1 },
      },
      rows: activityRows,
    });

    // 🔹 Итоговый документ
    const doc = new Document({
      sections: [
        {
          children: [
            title,
            patientTable,
            new Paragraph({ text: '' }), // Отступ
            infoTable,
            new Paragraph({ text: '' }), // Отступ
            activityTable,
          ],
        },
      ],
    });

    // 💾 Сохраняем как .docx
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'rehabilitation_program.docx');
  } catch (error) {
    console.error('Ошибка при создании Word-документа:', error);
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