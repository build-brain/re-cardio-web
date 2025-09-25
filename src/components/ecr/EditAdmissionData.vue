<script setup>
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import { onMounted, ref, watch, computed } from "vue";
import { axiosInstance } from "../../axios";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import Swal from "sweetalert2";

const DateConfig = ref({
  enableTime: false,
  altInput: true,
  dateFormat: "Y-m-d",
  altFormat: "d M, Y",
  mode: "single",
});
const route = useRoute();
const router = useRouter();
const dateTimeConfig = ref({
  enableTime: true,
  altInput: true,
  dateFormat: "Y-m-d H:i",
  altFormat: "d M, Y H:i",
  mode: "single",
  time_24hr: true,
});
const timeConfig = ref({
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true,
});
let dropzoneFile = ref(null);

const multipleFiles = ref([]);
const admission_attachments = ref([]);




const deleteServerFile = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admission-attachments/${id}/`);
    if (response.status === 204) {
      admission_attachments.value.attachments = admission_attachments.value.attachments.filter(
        attachment => attachment.id !== id
      );
      Swal.fire({
        title: "Успешно",
        text: `Файл успешно удален`,
        icon: "success",
        timer: 2500,
        timerProgressBar: true
      });

    }
  } catch (error) {
    Swal.fire({
      title: "Ошибка",
      // text: `${error}`, // TODO: check translation
      text: `Ошибка при удалении файла: ${error.message}`,
      icon: "error",
      timer: 2500,
      timerProgressBar: true
    });
    console.error('Error deleting the file:', error);
  }
}



const getFileIcon = (url) => {
  const extension = url.split('.').pop().toLowerCase();
  console.log(extension);
  switch (extension) {
    case 'pdf':
      return 'file-pdf-2-line';
    case 'doc':
    case 'docx':
      return 'file-word-2-line';
    case 'xls':
    case 'xlsx':
      return 'file-excel-fill';
    case 'ppt':
    case 'pptx':
      return 'file-ppt-2-fill';
    case 'zip':
    case 'rar':
      return 'folder-zip-line';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'file-image-fill';
    default:
      return 'file-fill'; // fallback icon
  }
};

const admissionDataForm = ref({
  admission_date: null,
  delivery_time: null,
  patient_condition: null,
  patient_complaints: "",
  heart_stopped: false,
  hospitalization_date: "",
  hospitalization_type: null,
  diagnosed_by: null,
  additional_information: "",
  preliminary_diagnosis: null,
  er_card: route.params.id,
  attachments: [],
});
const rules = computed(() => ({
  admission_date: { required },
  hospitalization_date: { required },
  hospitalization_type: { required },
  patient_condition: { required },
}));

const v$ = useVuelidate(rules, admissionDataForm);


const getAttachments = async () => {
  try {
    const response = await axiosInstance.get(`/admission-data/${route.params.id}/`);
    admission_attachments.value = response.data;
    const data = response.data;

    // Set the form fields except for attachments
    admissionDataForm.value = {
      admission_date: data.admission_date,
      delivery_time: data.delivery_time,
      patient_condition: data.patient_condition,
      patient_complaints: data.patient_complaints,
      heart_stopped: data.heart_stopped,
      hospitalization_date: data.hospitalization_date,
      hospitalization_type: data.hospitalization_type,
      diagnosed_by: data.diagnosed_by,
      additional_information: data.additional_information,
      preliminary_diagnosis: data.preliminary_diagnosis?.id || null,
      er_card: data.er_card,
      attachments: [], // Clear or set empty array if needed
    };
  } catch (e) {
    Swal.fire({
      title: "Ошибка",
      // text: `${e}`, // TODO: check translation
      text: `Ошибка при получении данных при госпитализации: ${e.message}`,
      icon: "error",
      timer: 2500,
      timerProgressBar: true
    });
  }

}

const deleteRecord = (ele) => {
  ele.target.parentElement.parentElement.parentElement.remove();
};


const drop2 = (e) => {
  const file = e.dataTransfer.files[0];
  multipleFiles.value.push(file);
};


const selectedMultipleFiles = (e) => {
  const fileInput = e.target;
  const newFiles = Array.from(fileInput.files);
  let totalSize = multipleFiles.value.reduce(
    (acc, file) => acc + file.size,
    0
  );

  if (totalSize >= 10 * 1024 * 1024) {
    alert(
      "Превышен общий размер файлов (10 МБ). Дальнейшее добавление файлов невозможно."
    );
    return;
  }

  newFiles.forEach((file) => {

    if (totalSize + file.size <= 10 * 1024 * 1024) {

      multipleFiles.value.push(file);

      totalSize += file.size;
    } else {

      alert(
        `Файл ${file.name} превышает максимальный размер (10 МБ) и не будет добавлен.`
      );
    }
  });
};
const resetFormData = () => {
  // Очищаем список файлов
  multipleFiles.value = [];

};

const handleSubmit = async () => {

  v$.value.$touch();
  if (v$.value.$invalid) {

    return;
  }

  let timerInterval; // Объявляем переменную для хранения идентификатора интервала

  try {

    const admissionResponse = await axiosInstance.put(`/admission-data/${route.params.id}/`, {
      ...admissionDataForm.value,

    });


    // Если статус ответа успешный (2xx)
    if (admissionResponse.status >= 200 && admissionResponse.status < 300) {

      for (const file of multipleFiles.value) {
        const formData = new FormData();
        formData.append("name", file.name);
        formData.append("attachment", file);
        formData.append("admission_data", String(admissionResponse.data.er_card));
        await axiosInstance.post(`/admission-attachments/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      Swal.fire({
        title: "Успешно",
        text: "Данные при госпитализации успшено обновлены!",
        icon: "success",
        timer: 2500,
        timerProgressBar: true
      });

      resetFormData();
      setTimeout(() => {
        router.push(`/ecr/profile-erc/${route.params.id}`);
      }, 2500);

    }
  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Ошибка",
      text: `Данные при госпитализации не обновлены!!`,
      icon: "error"
    });
  } finally {
    clearInterval(timerInterval);
  }



};



const options = {
  preProcess: val => val.toUpperCase()
}

const store = useStore();

const icd = computed(() => store.state.patients.icd);



const getICD = async () => {
  store.dispatch('patients/getICD');
};




onMounted(async () => {
  await getICD();
  await getAttachments();
});

const deleteMultipleFile = (index) => {
  multipleFiles.value.splice(index, 1);
};
const active = ref(false);

const toggleActive = () => {
  active.value = !active.value;
};

watch(
  () => dropzoneFile.value,
  (currentValue) => {
    return currentValue;
  }
);




</script>


<template #title>
  <BRow>
    <BCol md="9">

      <BCard>

        <div class="mt-3">
          <BRow>
            <BCol sm="8">
              <BRow>
                <BCol sm="4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Дата и время поступления</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                      <flat-pickr placeholder="Выбрать... " v-model="admissionDataForm.admission_date"
                        :config="dateTimeConfig" class="form-control flatpickr-input" id="caledate"></flat-pickr>
                      <span class="text-danger" v-if="v$.admission_date.$error">Дата и время поступления
                        обязательна</span>
                    </div>
                  </div>
                </BCol>

                <BCol sm="4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">
                      <small class="form-label">Время доставки в приемное
                        отделение</small></label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ri-time-line"></i></span>
                      <flat-pickr placeholder="Выберите время" :config="timeConfig"
                        v-model="admissionDataForm.delivery_time" class="form-control flatpickr-input"
                        id="caledate"></flat-pickr>
                    </div>
                  </div>
                </BCol>
                <BCol sm="4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Состояние пациента при
                      поступлении</label>
                    <BFormSelect :class="{ 'is-invalid': v$.patient_condition.$error }"
                      v-model="admissionDataForm.patient_condition" aria-label="Default select example">
                      <BFormSelectOption :value="null" disabled>Выбрать...
                      </BFormSelectOption>
                      <BFormSelectOption value="satisfactory">
                        удовлетворительное
                      </BFormSelectOption>
                      <BFormSelectOption value="moderate">средней тяжести
                      </BFormSelectOption>
                      <BFormSelectOption value="severe">тяжёлое
                      </BFormSelectOption>
                      <BFormSelectOption value="extremely_severe">крайне
                        тяжёлое
                      </BFormSelectOption>
                    </BFormSelect>
                    <span class="text-danger" v-if="v$.patient_condition.$error">Состояние пациента при
                      поступлении обязательна</span>
                  </div>
                </BCol>
              </BRow>
              <BRow class="mt-3">
                <BCol sm="4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Дата госпитализации</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                      <flat-pickr placeholder="Выберите дату" v-model="admissionDataForm.hospitalization_date
                        " :config="DateConfig" class="form-control flatpickr-input"
                        id="caledate"></flat-pickr>
                      <span class="text-danger" v-if="v$.hospitalization_date.$error">Дата госпитализации
                        обязательна</span>

                    </div>
                  </div>
                </BCol>
                <BCol sm="4">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Тип госпитализации</label>
                    <BFormSelect v-model="admissionDataForm.hospitalization_type
                        " :class="{ 'is-invalid': v$.patient_condition.$error }"
                      aria-label="Default select example">
                      <BFormSelectOption :value="null" disabled>Выбрать...
                      </BFormSelectOption>
                      <BFormSelectOption value="planned">плановая
                      </BFormSelectOption>
                      <BFormSelectOption value="urgent">неотложная
                      </BFormSelectOption>
                      <BFormSelectOption value="emergency">экстренная
                      </BFormSelectOption>
                    </BFormSelect>
                    <span class="text-danger" v-if="v$.hospitalization_date.$error">Тип госпитализации
                      обязательна</span>
                  </div>
                </BCol>
                <BCol sm="4">
                  <div class="mb-3">
                    <BRow>
                      <BFormGroup>
                        <BFormCheckbox switch flex :checked="admissionDataForm.heart_stopped">
                          <small class="form-label fw-bold">
                            Остановка сердца при поступлении
                          </small>
                        </BFormCheckbox>
                      </BFormGroup>
                    </BRow>
                  </div>
                </BCol>
              </BRow>
              <BRow class="mt-4">
                <BCol sm="6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Предварительный диагноз по МКБ-10</label>
                    <BFormSelect v-model="admissionDataForm.preliminary_diagnosis" aria-label="Default select example"
                      class="mb-3">
                      <BFormSelectOption :value="null" disabled>Выберите
                      </BFormSelectOption>

                      <BFormSelectOption v-for="(item, index) in icd" :key="index" :value="Number(item.id)">{{
                        item.code }}&ensp;
                        {{ item.title }}</BFormSelectOption>
                    </BFormSelect>

                  </div>
                </BCol>

              </BRow>
              <BRow>
                <BCol sm="6">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Кем выставлен предварительный диагноз</label>
                    <BFormSelect v-model="admissionDataForm.diagnosed_by" class="mb-3"
                      aria-label="Default select example">
                      <BFormSelectOption :value="null" disabled>Выберите
                      </BFormSelectOption>
                      <BFormSelectOption value="outpatient_facility">
                        направившее ЛПУ
                      </BFormSelectOption>
                      <BFormSelectOption value="ambulance_brigade">бригада
                        СМП
                      </BFormSelectOption>
                      <BFormSelectOption value="reception_department">
                        приёмное отделение ЛПУ
                      </BFormSelectOption>
                      <BFormSelectOption value="inpatient_facility">
                        стационарное отделение ЛПУ
                      </BFormSelectOption>
                    </BFormSelect>
                  </div>
                </BCol>
              </BRow>
            </BCol>
            <BCol sm="4">
              <BRow>
                <BCol sm="12">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Прикрепить Файл
                      <span class="text-muted">
                        (Максимальный размер 10 мб)</span></label>

                    <div @dragenter.prevent="toggleActive" @dragleave.prevent="toggleActive" @dragover.prevent
                      @drop.prevent="drop2" :class="{ 'active-dropzone': active }" class="dropzone position-relative">
                      <div>
                        <i class="display-6 text-muted ri-upload-cloud-2-fill"></i>
                      </div>
                      <small>Drop files here or click to upload.</small>
                      <label for="dropzoneFile2" class="stretched-link">Upload</label>
                      <input type="file" id="dropzoneFile2" class="dropzoneFile btn btn-primary"
                        @change="selectedMultipleFiles" multiple />
                    </div>
                  </div>
                </BCol>
              </BRow>

              <BRow>
                <BCol sm="12">
                  <div class="mb-3">
                    <label class="form-label fw-bold" for="info-description-input">Примечания</label>
                    <textarea v-model="admissionDataForm.patient_complaints" class="form-control"
                      placeholder="Введите примечания при необходимости" id="info-description-input"
                      rows="8"></textarea>
                  </div>
                </BCol>
              </BRow>
            </BCol>
          </BRow>
        </div>
        <BRow>
          <BCol sm="12">

            <BCard no-body v-if="multipleFiles.length !== 0">
              <BCardBody>
                <h5 class="card-title mb-3 fw-bold">Прикрепленные файлы </h5>
                <div class="d-flex flex-wrap gap-2">
                  <div class="border rounded border-dashed p-2" v-for="(file, index) in multipleFiles" :key="index">

                    <div class="d-flex flex-wrap align-items-center">
                      <div class="me-3">
                        <div class="avatar-sm">
                          <div class="avatar-title bg-light text-secondary rounded fs-24">
                            <i :class="'ri-' + getFileIcon(file.name)"></i>
                          </div>
                        </div>
                      </div>
                      <div class="overflow-hidden">
                        <h5 class="fs-13 mb-1">
                          <BLink href="javascript:void(0);" class="text-body text-truncate d-block">
                            {{ file.name }}</BLink>
                        </h5>
                        <div>{{
                        (file.size / (1024 * 1024)).toFixed(2)
                      }}MB</div>
                      </div>
                      <div class="flex-shrink-0 ms-2">
                        <div class="d-flex gap-1">

                          <button type="button" @click="deleteMultipleFile(index)"
                            class="btn btn-icon text-muted btn-sm fs-18"><i
                              class="ri-delete-bin-fill align-bottom me-2 text-muted"></i></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </BCardBody>
            </BCard>
          </BCol>
        </BRow>
        <div class="d-flex align-items-start gap-3 mt-4">
          <router-link :to='`/ecr/profile-erc/${route.params.id}`'>
            <button type="button" class="btn btn-danger ">
              Назад
            </button>
          </router-link>
          <button type="button" class="btn btn-primary right ms-auto" @click="handleSubmit">
            Изменить
          </button>
        </div>
      </BCard>
    </BCol>
    <BCol md="3">
      <BCard no-body>
        <BCardBody class="overflow-y-scroll card-height">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-3">Загруженные файлы</h5>
          </div>
          <div class="vstack gap-2">
            <div v-for="attachment in admission_attachments.attachments" :key="attachment.id"
              v-if="admission_attachments.attachments" class="border rounded border-dashed p-2">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div class="avatar-sm">
                    <div class="avatar-title bg-light text-secondary rounded fs-24">
                      <i :class="'ri-' + getFileIcon(attachment.attachment)"></i>

                    </div>
                  </div>
                </div>
                <div class="flex-grow-1 overflow-hidden">
                  <h5 class="fs-13 mb-1">
                    <BLink href="javascript:void(0);" class="text-body text-truncate d-block">
                      {{ attachment.name }}
                    </BLink>
                  </h5>

                </div>
                <div class="flex-shrink-0 ms-2">
                  <div class="d-flex gap-1">
                    <a :href="attachment.attachment" download>
                      <button type="button" class="btn btn-icon text-muted btn-sm fs-18">
                        <i class="ri-download-2-line"></i>
                      </button>
                    </a>
                    <button type="button" @click="deleteServerFile(attachment.id)"
                      class="btn btn-icon text-muted btn-sm fs-18"><i
                        class="ri-delete-bin-fill align-bottom me-2 text-muted"></i></button>
                  </div>
                </div>
              </div>
            </div>
            <div class="border border-2 border-dashed" style="height: 20rem" v-else>
              <div class="d-flex justify-content-center align-items-center flex-column h-100">

                <h5 class="text-muted">
                  Нет данных
                </h5>
              </div>
            </div>
          </div>

        </BCardBody>

      </BCard>
    </BCol>

  </BRow>


</template>