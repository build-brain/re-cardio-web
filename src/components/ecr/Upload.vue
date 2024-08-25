<script setup>
import Swal from "sweetalert2";
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { axiosInstance } from "../../axios";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import animationData1 from "@/components/widgets/gsqxdxog.json";
import { required, minLength } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
const route = useRoute();

const dateConfig = ref({
    enableTime: false,
    altInput: true,
    dateFormat: "Y-m-d",  // Ensure this matches the backend requirement
    altFormat: "d M Y",   // Changed to use space instead of comma
    mode: "single",
    time_24hr: false,
});
const medicial_data = ref([]);
const deleteModal = ref(false);

const getMedicialrecords = async () => {
    const response = await axiosInstance.get(`/medical-records/?er_card=${route.params.id}`);
    if (response.status === 200) {
        medicial_data.value = response.data;
    }
}



const isModalVisible = ref(false);

const formData = ref({
    name: '',
    attachment: null,
    creation_date: '',
    type: null,
    context: {
        notes: '',
    },

    er_card: `${route.params.id}`,
});

const rules = {
    name: { required, minLength: minLength(3) }, // Поле name должно быть обязательным и минимум 3 символа
    attachment: { required }, // attachment должно быть обязательным
    creation_date: { required }, // creation_date должно быть обязательным
};

const v$ = useVuelidate(rules, formData);



let file = ref(null);
const maxFileSize = 10 * 1024 * 1024; // 10 MB

const drop = (e) => {
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile.size > maxFileSize) {
        alert("Файл превышает максимальный размер 10 МБ.");
        return;
    }
    file.value = droppedFile;
};

const selectedFile = () => {
    const selectedFile = document.querySelector(".dropzoneFile").files[0];
    if (selectedFile.size > maxFileSize) {
        alert("Файл превышает максимальный размер 10 МБ.");
        return;
    }
    file.value = selectedFile;
    formData.value.attachment = selectedFile; // Обновление поля формы
};

const deleteFile = () => {
    file.value = null;
    formData.value.attachment = null; // Обновление поля формы
};
const active = ref(false);

const toggleActive = () => {
    active.value = !active.value;
};




const submitForm = async () => {
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
    const data = new FormData();

    data.append('name', formData.value.name);

    data.append('attachment', file.value);

    data.append('creation_date', formData.value.creation_date);
    data.append('er_card', formData.value.er_card);

    const ecgData = {
        notes: formData.value.context.notes
    };
    data.append('context', JSON.stringify(ecgData));


    try {
        await axiosInstance.post('/medical-records/', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        hideModal();
        formData.value = {
            name: '',
            attachment: null,
            creation_date: '',
            type: null,
            context: {
                notes: '',
            },

            er_card: `${route.params.id}`,
        }
        Swal.fire({
            title: "Успешно",
            text: "Файл добавлен!",
            icon: "success",
            timer: 2500,
            timerProgressBar: true
        });
        await getMedicialrecords();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: "Ошибка",
            text: "Файл не добавлен!",
            icon: "error",
            timer: 2500,
            timerProgressBar: true
        });
    }
};


const showModal = () => {
    isModalVisible.value = true;
};

const hideModal = () => {
    isModalVisible.value = false;
};

const deleteid = ref(null);
const deleteModalToggle = (id) => {
    deleteModal.value = true;
    deleteid.value = id;
}
const onDeleteFile = async () => {
    try {

        await axiosInstance.delete(`/medical-records/${deleteid.value}/`);
        medicial_data.value = medicial_data.value.filter(item => item.id !== deleteid.value);
        Swal.fire({
            title: "Успешно",
            text: "Файл удален!",
            icon: "success",
            timer: 2500,
            timerProgressBar: true
        });
        deleteModal.value = false;
    } catch (error) {
        console.error('Failed to delete patient:', error);
        Swal.fire({
            title: "Ошибка",
            text: "Файл не удален!",
            icon: "error",
            timer: 2500,
            timerProgressBar: true
        });
    }
}
const defaultOptions = {
    animationData: animationData
};
const defaultOptions1 = {
    animationData: animationData1
};



onMounted(async () => {
    await getMedicialrecords();
})















</script>

<template>



    <BRow>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Список медицинских файлов</h5>
                        <div class="flex-shrink-0">
                            <div class="d-flex gap-1 flex-wrap">
                                <BButton variant="success" @click="showModal">
                                    <i class="ri-add-line align-bottom me-1"></i> {{ $t('add') }}
                                </BButton>


                            </div>
                        </div>
                    </div>
                </BCardHeader>
                <BCardBody class="pt-3">
                    <div>


                        <div class="table-responsive table-card mb-1">
                            <table class="table table-nowrap table-hover align-middle" id="jobListTable">
                                <thead class="text-muted table-light">
                                    <tr class="text-uppercase">

                                        <th class="small-font">
                                            ID
                                        </th>
                                        <th class="small-font">
                                            Название
                                        </th>
                                        <th class="small-font">
                                            Дата
                                        </th>

                                        <th class="small-font" rowspan="10">
                                            Примечания
                                        </th>

                                        <th class="small-font">
                                            Действия
                                        </th>


                                    </tr>
                                </thead>
                                <tbody class="list form-check-all">

                                    <tr v-for="files in medicial_data" :key="files.id">
                                        <td>
                                            {{ files.id }}
                                        </td>
                                        <td>
                                            {{ files.name }}
                                        </td>
                                        <td>
                                            {{ new Date(files.created_at).toLocaleDateString('ru-RU') }}
                                        </td>
                                        <td class="w-25">
                                            <div v-for="(value, key) in files.context" :key="key">

                                                <div class="d-flex flex-column flex-wrap">
                                                    {{ value }}
                                                </div>

                                            </div>
                                        </td>

                                        <td>

                                            <button type="button" class="btn btn-sm btn-danger me-2"
                                                @click="deleteModalToggle(files.id)">
                                                <i class="ri-delete-bin-6-line"></i>
                                            </button>

                                            <a :href="files.attachment" download>
                                                <button type="button" class="btn btn-sm btn-success">
                                                    <i class="ri-folder-download-fill" />
                                                </button>
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="noresult" v-if="medicial_data.length < 1">
                                <div class="text-center">
                                    <lottie class="avatar-xl" colors="primary:#121331,secondary:#08a88a"
                                        :options="defaultOptions" :height="75" :width="75" />
                                    <h5 class="mt-2">Пусто! Нет результатов</h5>

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
    <b-modal id="formModal" v-model="isModalVisible" title="Добавить новый файл" centered hide-footer>
        <form @submit.prevent="submitForm">
            <div class="mb-3">
                <label for="name" class="form-label">Название:</label>
                <input id="name" v-model="formData.name" type="text" class="form-control"
                    :class="{ 'is-invalid': v$.name.$error }">
                <span v-if="v$.name.$error" class="text-danger">Поле обязательно для заполнения.</span>
            </div>

            <div class="mb-3">
                <label class="form-label">{{ $t('add_file') }} <span class="text-muted">{{ $t('max_MB')
                        }}</span></label>

<div
      @dragenter.prevent="toggleActive"
      @dragleave.prevent="toggleActive"
      @dragover.prevent
      @drop.prevent="drop"
      :class="[
        'dropzone',
        'position-relative',
        { 'active-dropzone': active, 'border-danger': !v$.attachment.$pending && v$.attachment.$error }
      ]"
    >
                    <div>
                        <i class="display-6 text-muted ri-upload-cloud-2-fill"></i>
                    </div>
                    <small>Перетащите файл сюда или нажмите для загрузки</small>
                    <label for="dropzoneFile2" class="stretched-link">Загрузить</label>
                    <input type="file" id="dropzoneFile2" class="dropzoneFile btn btn-primary" @change="selectedFile" />
                </div>
                <span v-if="!v$.attachment.$pending && v$.attachment.$error" class="text-danger">
                    Поле обязательно для заполнения.
                </span>

                <ul class="list-unstyled mb-0" id="dropzone-preview" v-if="file">
                    <div class="border rounded">
                        <div class="d-flex p-2">
                            <div class="flex-grow-1">
                                <div class="pt-1">
                                    <h5 class="fs-14 mb-1">
                                        {{ file.name }}
                                    </h5>
                                    <p class="fs-13 text-muted mb-0">
                                        <strong>{{ (file.size / 1024).toFixed(2) }}</strong> KB
                                    </p>
                                </div>
                            </div>
                            <div class="flex-shrink-0 ms-3">
                                <BButton variant="danger" size="sm" @click="deleteFile">
                                    Удалить
                                </BButton>
                            </div>
                        </div>
                    </div>
                </ul>
            </div>

            <div class="mb-3">
                <label for="creation_date" class="form-label">Дата создания:</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                    <flat-pickr placeholder="Выберите дату" v-model="formData.creation_date" :config="dateConfig"
                        class="form-control flatpickr-input" id="caledate" />
                </div>
                <span v-if="!v$.creation_date.$pending && v$.creation_date.$error" class="text-danger">
                    Поле обязательно для заполнения.
                </span>
            </div>




            <div class="mb-3">
                <label class="form-label">Примечания:</label>
                <textarea v-model="formData.context.notes" cols="30" rows="5" class="form-control"></textarea>
            </div>

            <div class="d-flex gap-2 justify-content-between mt-4 mb-2">
                <b-button type="button" variant="danger" class="w-sm btn-hover"
                    @click="isModalVisible = false">Отмена</b-button>
                <b-button type="submit" variant="success" class="w-sm btn-hover">
                    Сохранить
                </b-button>
            </div>
        </form>
    </b-modal>
    <BModal v-model="deleteModal" body-class="p-5 text-center" modal-class="flip" hide-footer no-close-on-backdrop
        centered>
        <div class="text-center">
            <div class="text-danger">
                <lottie class="avatar-xl" colors="primary:#405189,secondary:#f06548" :options="defaultOptions1"
                    :height="75" :width="75" />
            </div>
            <div class="mt-4">
                <h3 class="mb-2">Удалить файл ?</h3>
                <p class="text-muted fs-lg mx-3 mb-0">Уверены!!</p>
            </div>
        </div>
        <div class="d-flex gap-2 justify-content-center mt-4 mb-2">
            <BButton type="button" variant="light" class="w-sm btn-hover" @click="deleteModal = false">Отмена</BButton>
            <BButton type="button" variant="danger" class="w-sm btn-hover" id="delete-record"
                @click="onDeleteFile(deletePatientId)">Да, удалить</BButton>
        </div>
    </BModal>





</template>

<style scoped>
/* Делаем наше поле ввода файла невидимым */
.custom-file-input {
    display: none;
    /* "Скрываем" поле ввода */
}

/* Создаем "подмену" кнопки */
.file-btn {
    background: #f1f1f1;
    border: 1px solid #d3d3;
    padding: 5px 15px;
    border-radius: 5px;
    cursor: pointer;
    display: inline-block;
}
</style>