<script>

import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { vMaska } from "maska";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

import { onMounted, ref, watch, computed } from "vue";
import { axiosInstance } from "../../axios";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import Swal from "sweetalert2";


export default {
    setup() {
        const tabIndex = ref(1);
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
        const files = ref(null);
        const multipleFiles = ref([]);

        const isImage = (file) => /\.(jpg|jpeg|png|gif)$/i.test(file);
        const isPDF = (file) => /\.pdf$/i.test(file);
        const isDocument = (file) => /\.(doc|docx|txt)$/i.test(file);



        const admissionDataForm = ref({
            admission_date: null,
            delivery_time: null,
            patient_condition: null,
            patient_complaints: "",
            heart_stopped: false,
            pci_duration: "",
            hospitalization_type: null,
            diagnosed_by: null,
            additional_information: "",
            preliminary_diagnosis: null,
            attachments: [],
        });
        const rules = computed(() => ({
            admission_date: { required },
            pci_duration: { },
            hospitalization_type: { required },
            patient_condition: { required },
        }));

        const v$ = useVuelidate(rules, admissionDataForm);


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

            for (const key in admissionDataForm.value) {
                if (
                    Object.prototype.hasOwnProperty.call(admissionDataForm.value, key)
                ) {
                    admissionDataForm.value[key] = null;
                }
            }

            // Очищаем список файлов
            multipleFiles.value = [];

        };

        function translate(text) {
            const translations = {
                "admission_date": "Дата и время поступления",
                "pci_duration": "Время выполнения ЧКВ",
                "hospitalization_type": "Тип госпитализации",
                "patient_condition": "Состояние пациента при поступлении",
                "This field should be at least 6 characters long": "Минимальная длина — 6 символов.",
                "New password must be at least 6 characters long!": "Новый пароль должен быть длиной не менее 6 символов!",
                "The value must be equal to the other value": "Пароли не совпадают",
                "Value is required": "Это поле обязательно для заполнения.",
                "This field is required.": "Это поле обязательно для заполнения.",
                "This field may not be blank.": "Это поле не может быть пустым.",
                "This field may not be null.": "Это поле не может быть пустым.",
                "Enter a valid email address.": "Введите корректный адрес электронной почты.",
                "Invalid format.": "Неверный формат.",
                "Invalid value": "Недопустимое значение.",
                "Invalid input": "Неверный ввод.",
                "Value is required Value is required": "Это поле обязательно для заполнения.",
                "Value must be numeric": "Значение должно быть числом.",
                "Value must be a valid number": "Введите корректное число.",
                "Value is too short": "Слишком короткое значение.",
                "Value is too long": "Слишком длинное значение.",
                "Ensure this field has at least 14 characters.": "Минимальная длина — 14 символов.",
                "Ensure this field has no more than 14 characters.": "Максимальная длина — 14 символов.",
                "Ensure this field has at least 6 characters.": "Минимальная длина — 6 символов.",
                "Ensure this field has no more than 6 characters.": "Максимальная длина — 6 символов."
            };
            return translations[text] || text;
        }

        const handleSubmit = async () => {
            v$.value.$touch();
            if (v$.value.$invalid) {
                v$.value.$touch();
                    
                let errorMessage = "<div style='text-align:left;'>";

                for (const key in v$.value) {
                    const field = v$.value[key];
                        if (field?.$errors?.length) {
                        const fieldName = translate(key); // используем твою translate-функцию
                        const messages = field.$errors.map(err => {
                            return translate(err.$message) ? translate(err.$message) : err.$message
                        } 
                    ).join(", ");
                        errorMessage += `<p><strong>${fieldName}:</strong> ${messages}</p>`;
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

            let timerInterval;
            try {

                const admissionResponse = await axiosInstance.post(`/er-cards/${route.params.id}/add_admission_data/`, {
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
                        text: "Данные при госпитализации успешно добавлены!",
                        icon: "success",
                        timer: 2500,
                        timerProgressBar: true
                    });

                    setTimeout(() => {
                        router.push(`/ecr/profile-erc/${route.params.id}`);
                    }, 2000);


                } else {

                    Swal.fire({
                        title: "Ошибка",
                        // text: `$${admissionResponse.statusText}`, // TODO: check translation
                        text: `Ошибка при добавлении данных при госпитализации: (${admissionResponse.status})`,
                        icon: "error"
                    });
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    const errors = error.response.data;
                    let errorMessage = "<div style='text-align:left;'>";

                    for (const [key, value] of Object.entries(errors)) {
                        const translatedField = translate(key);
                        const translatedMessage = translate(value[0]);
                        errorMessage += `<p><strong>${translatedField}:</strong> ${translatedMessage}</p>`;
                    }

                    errorMessage += "</div>";

                    Swal.fire({
                        title: "Ошибка валидации",
                        html: errorMessage,
                        icon: "error"
                    });
                } else {
                    Swal.fire({
                        title: "Ошибка",
                        text: "Не удалось сохранить данные. Попробуйте позже.",
                        icon: "error"
                    });
                }
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
        const selectedRegion = ref(null);
        const regions = {
            AN: "Андижан",
            BU: "Бухара",
            FE: "Фергана",
            JI: "Джиззах",
            KH: "Хорезм",
            NA: "Намангам",
            NI: "Навои",
            KA: "Кашкадарья",
            KN: "Каракалпакстан",
            SA: "Самарканд",
            SI: "Сырдарья",
            SU: "Сурхандарья",
            TO: "Ташкент",
            TS: "Ташкент Город",
        };


        return {
            timeConfig,
            DateConfig,
            dateTimeConfig,

            admissionDataForm,
            deleteRecord,
            handleSubmit,
            route,
            files,
            dropzoneFile,
            selectedRegion,
            regions,
            v$,
            selectedMultipleFiles,
            deleteMultipleFile,
            toggleActive,
            active,
            multipleFiles,
            isImage,
            isPDF,
            isDocument,
            drop2,
            tabIndex,
            icd,
            options
        };
    },

    components: {

        flatPickr,

    },

    directives: { maska: vMaska },
};
</script>


<template #title>

    <BCard>

        <div class="mt-3">
            <BRow>
                <BCol sm="6">
                    <BRow>
                        <BCol sm="4">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Дата и время поступления <span class="required_field">*</span></label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                                    <flat-pickr placeholder="Выбрать... " v-model="admissionDataForm.admission_date"
                                        :config="dateTimeConfig" class="form-control flatpickr-input"
                                        id="caledate"></flat-pickr>
                                    <span class="text-danger" v-if="v$.admission_date.$error">Дата и время поступления
                                        обязательна</span>
                                </div>
                            </div>
                        </BCol>

                        <BCol sm="4">
                            <div class="mb-3">
                                <label class="form-label fw-bold">
                                    <small class="form-label">Время доставки в приемное
                                        отделение </small></label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="ri-time-line"></i></span>
                                    <flat-pickr placeholder="Выбрать...  ч./мин." :config="timeConfig"
                                        v-model="admissionDataForm.delivery_time" class="form-control flatpickr-input"
                                        id="caledate"></flat-pickr>
                                </div>
                            </div>
                        </BCol>
                        <BCol sm="4">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Состояние пациента при
                                    поступлении <span class="required_field">*</span></label>
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
                        <!-- <BCol sm="4">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Время выполнения ЧКВ</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                                    <flat-pickr placeholder="Выберите дату" v-model="admissionDataForm.pci_duration
                                        " :config="DateConfig" class="form-control flatpickr-input"
                                        id="caledate"></flat-pickr>
                                    <span class="text-danger" v-if="v$.pci_duration?.$error">Дата госпитализации
                                        обязательна</span>
                                </div>
                            </div>
                        </BCol> -->
                        <BCol sm="4">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Время выполнения ЧКВ</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="ri-time-line"></i></span>
                                    <flat-pickr placeholder="Выбрать...  ч./мин." v-model="admissionDataForm.pci_duration
                                        " :config="timeConfig" class="form-control flatpickr-input"
                                        id="caledate"></flat-pickr>
                                    <span class="text-danger" v-if="v$.pci_duration?.$error">Дата госпитализации
                                        обязательна</span>
                                </div>
                            </div>
                        </BCol>
                        <BCol sm="4">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Тип госпитализации <span class="required_field">*</span></label>
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
                                <span class="text-danger" v-if="v$.pci_duration.$error">Тип госпитализации
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
                                <BFormSelect v-model="admissionDataForm.preliminary_diagnosis"
                                    aria-label="Default select example" class="mb-3">
                                    <BFormSelectOption :value="null" disabled>Выберите
                                    </BFormSelectOption>
                                    <BFormSelectOption v-for="(item, index) in icd" :key="index" :value="item.id">{{
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
                <BCol sm="6">
                    <BRow>
                        <BCol sm="12">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Прикрепить Файл
                                    <span class="text-muted">
                                        (Максимальный размер 10 мб)</span></label>

                                <div @dragenter.prevent="toggleActive" @dragleave.prevent="toggleActive"
                                    @dragover.prevent @drop.prevent="drop2" :class="{ 'active-dropzone': active }"
                                    class="dropzone position-relative">
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
                            <div class="border rounded border-dashed p-2" v-for="(file, index) in multipleFiles"
                                :key="index">

                                <div class="d-flex flex-wrap align-items-center">
                                    <div class="me-3">
                                        <div class="avatar-sm">
                                            <div class="avatar-title bg-light text-secondary rounded fs-24">

                                                <i v-if="isImage(file.name)" class="ri-folder-image-line "></i>
                                                <i v-else-if="isPDF(file.name)" class="ri-file-pdf-2-line "></i>
                                                <i v-else-if="isDocument(file.name)" class="ri-file-list-line "></i>
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
        <div class="d-flex justify-content-end align-items-start gap-3 mt-4">
            <router-link :to='`/ecr/profile-erc/${route.params.id}`'>
                <button type="button" class="btn btn-danger ">
                    Назад
                </button>
            </router-link>

            <button type="button" class="btn btn-primary" @click="handleSubmit">
                Отправить
            </button>
        </div>
    </BCard>

</template>