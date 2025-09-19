<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import { useVuelidate } from "@vuelidate/core";
import { vMaska } from "maska";
import {
    required,
    minLength,
    maxLength,
    numeric,
    helpers,
} from "@vuelidate/validators";
import "@vueform/multiselect/themes/default.css";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";
import animationData1 from "@/components/widgets/gsqxdxog.json";
import formatDate from "@/common/formatDate.js";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { axiosInstance } from "../../axios";
import Swal from "sweetalert2";

const store = useStore();

const page = ref(1);

const digitsOnlyValidator = helpers.withMessage(
    'Неверный формат номера телефона',
    (value) => {
        if (!value) return false;
        const digitsCount = (value.match(/\d/g) || []).length;
        return digitsCount === 12;
    }
);

const defaultOptions = { animationData };
const defaultOptions1 = { animationData: animationData1 };
const deleteModal = ref(false);
const deletePatientId = ref(null);
const doctors = computed(() => store.state.doctors.doctors);
const page_count = computed(() => store.state.doctors.page_count);

const fetchDoctors = async (page) => {
    await store.dispatch("doctors/fetchDoctors", page);
};

const deleteDoctor = async (id) => {
    return await store.dispatch("doctors/deleteDoctor", id);
};

const sortPatients = (payload) => {
    store.commit("doctors/sortPatients", payload);
};

const removeDoctors = (id) => {
    store.commit("doctors/removeDoctors", id);
};
function incrementPage() {
    if (page.value < page_count.value) {
        page.value++;
        fetchDoctors(page.value);
    }
}

function decrementPage() {
    if (page.value > 1) {
        page.value--;
        fetchDoctors(page.value);
    }
}
const direction = ref("asc");

function onSort(column) {
    direction.value = direction.value === "asc" ? "desc" : "asc"; // Переключение направления сортировки
    sortPatients({ column, direction: direction.value });
}

function deleteModalToggle(patientId) {
    deleteModal.value = true;
    deletePatientId.value = patientId;
}

async function onDeletePatient() {
    try {
        const response = await deleteDoctor(deletePatientId.value);
        if (response && response.success) {
            removeDoctors(deletePatientId.value);
        }
        deleteModal.value = false;
    } catch (error) {
        console.error("Failed to delete patient:", error);
    }
}
// Modal visibility
const doctor_add = ref(false);

// Form data
const form = ref({
    first_name: "",
    last_name: "",
    phone: "",
    middle_name: "",
    birth_date: null,
    // pinfl: "",
    passport: "",
    additional_information: "",
    specialty: "",
    mpi: "",
    department: "",

    password: "",
});

// Date picker configuration
const dateConfig = {
    enableTime: false,
    dateFormat: "Y-m-d",
};

// Validation rules
const rules = {

    first_name: { required },
    last_name: { required },
    phone: {
        required: helpers.withMessage('Поле обязательно для заполнения', required),
        digitsOnlyValidator
    },
    middle_name: {},
    birth_date: { required },
    // pinfl: {
    //     required,
    //     numeric,
    //     minLength: minLength(14),
    //     maxLength: maxLength(14),
    // },
    passport: {},
    specialty: {},
    mpi: {},
    department: {},
    additional_information: {},

    password: {
        required,
        minLength: minLength(6),
    }
};

const v$ = useVuelidate(rules, form);

async function submitForm() {
    v$.value.$touch(); // Запуск проверки валидации

    if (!v$.value.$error) {
        form.value.phone = form.value.phone?.replace(/[\s()-]/g, "");
        try {
            await axiosInstance.post("/doctors/", form.value);
            await fetchDoctors(page.value);
            Swal.fire({
                title: "Успешно",
                text: "Врач успешно добавлен!",
                icon: "success",
                timer: 2500,
                timerProgressBar: true
            });
            Object.keys(form).forEach((key) => (form[key] = ""));
            doctor_add.value = false;

        } catch (e) {
            console.error(e);
            Swal.fire({
                title: "Ошибка",
                text: "Врач не добавлен!",
                icon: "error",
                timer: 2500,
                timerProgressBar: true
            });
        }

    } else {
        console.log("Form contains errors");
    }
}



// Form data
const isEditModalVisible = ref(false);
const editForm = reactive({
    id:"",
    first_name: "",
    last_name: "",
    phone: "",
    middle_name: "",
    birth_date: null,
    // pinfl: "",
    passport: "",
    additional_information: "",
    specialty: "",
    mpi: "",
    department: "",

    password: "",
});


// Validation rules
const rulesEdit = {

    first_name: { required },
    last_name: { required },
    phone: {
        required: helpers.withMessage('Поле обязательно для заполнения', required),
        digitsOnlyValidator
    },
    middle_name: {},
    birth_date: { required },
    // pinfl: {
    //     required,
    //     numeric,
    //     minLength: minLength(14),
    //     maxLength: maxLength(14),
    // },
    passport: {},
    specialty: {},
    mpi: {},
    department: {},
    additional_information: {},

    password: {
        minLength: minLength(6),
    }
};

const $v = useVuelidate(rulesEdit, editForm);
const id_edit_doctor = ref("");

function editDoctor(doctor) {

    Object.assign(editForm, doctor);
    id_edit_doctor.value = doctor.id;
    isEditModalVisible.value = true;
}


async function submitEditForm() {
    $v.value.$touch(); // Запуск проверки валидации

    if ($v.value.$pending || !$v.value.$dirty || $v.value.$error) {
        console.log('Form contains errors');
        return;
    }
    editForm.phone = editForm.phone.replace(/[\s()-]/g, "");
        try {
            await axiosInstance.put(`/doctors/${id_edit_doctor.value}/`, editForm);
            await fetchDoctors(page.value);
            Swal.fire({
                title: "Успешно",
                text: "Врач успешно изменен!",
                icon: "success",
                timer: 2500,
                timerProgressBar: true
            });
            isEditModalVisible.value = false;

        } catch (e) {
            console.error(e);
            Swal.fire({
                title: "Ошибка",
                text: "Врач не изменен!",
                icon: "error",
                timer: 2500,
                timerProgressBar: true
            });
        }


        isEditModalVisible.value = false;
}

onMounted(async () => {
    await fetchDoctors(page.value);
});
</script>

<template>
    <Layout>
        <pageHeader />

        <BRow>
            <BCol lg="12">
                <BCard no-body id="applicationList">
                    <BCardHeader class="border-0">
                        <div class="d-md-flex align-items-center">
                            <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Список врачей</h5>
                            <div class="d-flex mb-2 flex-wrap">
                                <BButton type="button" class="add-btn" variant="success" id="create-btn"
                                    @click="doctor_add = true">
                                    <i class="ri-add-line align-bottom me-1"></i> {{ $t("add") }}
                                </BButton>
                            </div>
                        </div>
                    </BCardHeader>

                    <BCardBody class="pt-0">
                        <div>
                            <div class="table-responsive table-card mb-1">
                                <table class="table table-nowrap align-middle" id="jobListTable">
                                    <thead class="text-muted table-light">
                                        <tr class="text-uppercase">
                                            <th class="sort" data-sort="company" @click="onSort('first_name')">
                                                {{ $t("table-patients.fullname") }}
                                            </th>
                                            <th class="sort" data-sort="designation" @click="onSort('phone')">
                                                {{ $t("table-patients.phone") }}
                                            </th>

                                            <th class="sort" data-sort="contacts" @click="onSort('date_joined')">
                                                {{ $t("table-patients.date") }}
                                            </th>

                                            <th>{{ $t("table-patients.actions") }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="list form-check-all" v-for="(data, index) in doctors.results"
                                        :key="index">
                                        <tr>
                                            <td class="company">
                                                <div class="d-flex align-items-center">
                                                    <div class="flex-shrink-0">
                                                        <img :src="data.avatar" alt=""
                                                            class="avatar-xxs rounded-circle image_src object-fit-cover" />
                                                    </div>
                                                    <div class="flex-grow-1 ms-2">
                                                        {{ data.first_name }} {{ data.last_name }}
                                                        {{ data.middle_name }}
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="designation">
                                                {{ data.phone }}
                                            </td>

                                            <td class="contacts">
                                                <span class="ms-4">{{
                                        formatDate(data.date_joined)
                                    }}</span>
                                            </td>

                                            <td>
                                                <ul class="list-inline hstack gap-2 mb-0">
                                                    <li class="list-inline-item edit" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="изменить">
        <button class="btn text-primary d-inline-block edit-item-btn" @click="editDoctor(data)">
            <i class="ri-pencil-fill fs-16"></i>
        </button>
    </li>

                                                    <li class="list-inline-item" data-bs-toggle="tooltip"
                                                        data-bs-trigger="hover" data-bs-placement="top" title="удалить">
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
                                <div class="noresult" v-if="doctors.length < 1">
                                    <div class="text-center">
                                        <lottie class="avatar-xl" colors="primary:#121331,secondary:#08a88a"
                                            :options="defaultOptions" :height="75" :width="75" />
                                        <h5 class="mt-2">Пусто! Нет результатов</h5>
                                        <p class="text-muted mb-0">
                                            У вас нет ни одного пациента, перезагрузите страницу или
                                            входите заново.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-end">
                                <div class="pagination-wrap hstack gap-2">
                                    <BLink class="page-item pagination-prev" href="#" :disabled="page <= 1"
                                        @click="decrementPage">
                                        <i class="ri-arrow-left-line"></i>
                                    </BLink>
                                    <ul class="pagination listjs-pagination mb-0">
                                        <li :class="{
                                        active: pageNumber == page,
                                        disabled: pageNumber == '...',
                                    }" v-for="(pageNumber, index) in page_count" :key="index"
                                            @click="page = pageNumber">
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
        <b-modal v-model="doctor_add" id="showModal" title="Добавить врача" header-class="bg-light p-3" hide-footer
            centered>
            <form @submit.prevent="submitForm">
                <b-container>
                    <b-row>
                        <b-col md="6">
                            <b-form-group label="Имя" label-for="first_name" class="mb-3">
                                <b-form-input id="first_name" v-model="form.first_name" placeholder="Введите имя"
                                    :state="!v$.first_name.$error"></b-form-input>

                                <BFormInvalidFeedback v-if="v$.first_name.$error">
                                    Это обязательное поле.
                                </BFormInvalidFeedback>
                            </b-form-group>

                            <b-form-group label="Фамилия" label-for="last_name" class="mb-3">
                                <b-form-input id="last_name" v-model="form.last_name" placeholder="Введите фамилию"
                                    :state="!v$.last_name.$error"></b-form-input>
                                <BFormInvalidFeedback v-if="v$.last_name.$error">Фамилия обязательна
                                </BFormInvalidFeedback>
                            </b-form-group>
                            <b-form-group label="Отчество" label-for="middle_name" class="mb-3">
                                <b-form-input id="middle_name" v-model="form.middle_name"
                                    placeholder="Введите отчество"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Телефон" label-for="phone" class="mb-3">
                                <div class="mb-3">

                                    <b-form-input v-model="form.phone" :state="!v$.phone.$error"
                                        :class="['form-control', { 'is-invalid': v$.phone.$error }]" type="text"
                                        placeholder="+998 (___) ___-__-__" v-maska data-maska="+998 (##) ###-##-##" />

                                    <BFormInvalidFeedback v-if="v$.phone.$error">Телефон обязательна
                                    </BFormInvalidFeedback>
                                </div>

                            </b-form-group>
                            <b-form-group label="Дата рождения" label-for="birth_date" class="mb-3">
                                <flat-pickr id="birth_date" class="form-control" v-model="form.birth_date"
                                    :config="dateConfig" placeholder="Выберите дату рождения"></flat-pickr>
                            </b-form-group>

                            <!-- <b-form-group label="ПИНФЛ" label-for="pinfl" class="mb-3">
                                <b-form-input id="pinfl" v-model="form.pinfl" placeholder="Введите ПИНФЛ"
                                    class="form-control" v-maska data-maska="##############"
                                    :state="!v$.pinfl.$error"></b-form-input>
                                <BFormInvalidFeedback v-if="v$.pinfl.$error">ПИНФЛ должен содержать 14 цифр
                                </BFormInvalidFeedback>
                            </b-form-group> -->

                            <b-form-group label="Пароль" label-for="password" class="mb-3">
                                <b-form-input id="password" v-model="form.password"
                                    placeholder="Введите паролья" :state="!v$.password?.$error"></b-form-input>
                                <BFormInvalidFeedback v-if="v$.password?.$error">Пароль должен содержать минимум 6 цифр
                                </BFormInvalidFeedback>
                                <!-- <h1 v-if="v$.password?.$error">Hello</h1> -->
                                <!-- <pre>
                                    {{ v$.password }}
                                </pre> -->
                            </b-form-group>
                        </b-col>

                        <b-col md="6">
                            <b-form-group label="Паспорт" label-for="passport" class="mb-3">
                                <b-form-input id="passport" v-model="form.passport"
                                    placeholder="Введите паспортные данные"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Специальность" label-for="specialty" class="mb-3">
                                <b-form-input id="specialty" v-model="form.specialty"
                                    placeholder="Введите специальность"></b-form-input>
                            </b-form-group>

                            <b-form-group label="МПИ" label-for="mpi" class="mb-3">
                                <b-form-input id="mpi" v-model="form.mpi" placeholder="Введите МПИ"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Отделение" label-for="department" class="mb-3">
                                <b-form-input id="department" v-model="form.department"
                                    placeholder="Введите отделение"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Дополнительная информация" label-for="additional_information"
                                class="mb-3">
                                <b-form-textarea id="additional_information" v-model="form.additional_information"
                                    placeholder="Введите дополнительную информацию"></b-form-textarea>
                            </b-form-group>
                        </b-col>
                    </b-row>
                </b-container>

                <div class="d-flex justify-content-between gap-3 mt-3">
                    <b-button type="button" variant="danger" @click="doctor_add = false">Отмена</b-button>
                    <b-button type="submit" variant="success">Сохранить</b-button>
                </div>
            </form>
        </b-modal>

        <b-modal v-model="isEditModalVisible" id="editDoctorModal" title="Редактировать врача"
            header-class="bg-light p-3" hide-footer centered>
            <form @submit.prevent="submitEditForm">
                <b-container>
                    <b-row>
                        <b-col md="6">
                            <b-form-group label="Имя" label-for="first_name" class="mb-3">
                                <b-form-input id="first_name" v-model="editForm.first_name" placeholder="Введите имя"
                                    :state="!$v.first_name.$error"></b-form-input>

                                <BFormInvalidFeedback v-if="$v.first_name.$error">
                                    Это обязательное поле.
                                </BFormInvalidFeedback>
                            </b-form-group>

                            <b-form-group label="Фамилия" label-for="last_name" class="mb-3">
                                <b-form-input id="last_name" v-model="editForm.last_name" placeholder="Введите фамилию"
                                    :state="!$v.last_name.$error"></b-form-input>
                                <BFormInvalidFeedback v-if="$v.last_name.$error">Фамилия обязательна
                                </BFormInvalidFeedback>
                            </b-form-group>
                            <b-form-group label="Отчество" label-for="middle_name" class="mb-3">
                                <b-form-input id="middle_name" v-model="editForm.middle_name"
                                    placeholder="Введите отчество"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Телефон" label-for="phone" class="mb-3">
                                <div class="mb-3">

                                    <b-form-input v-model="editForm.phone" :state="!$v.phone.$error"
                                        :class="['form-control', { 'is-invalid': $v.phone.$error }]" type="text"
                                        placeholder="+998 (___) ___-__-__" v-maska data-maska="+998 (##) ###-##-##" />

                                    <BFormInvalidFeedback v-if="$v.phone.$error">Телефон обязательна
                                    </BFormInvalidFeedback>
                                </div>

                            </b-form-group>
                            <b-form-group label="Дата рождения" label-for="birth_date" class="mb-3">
                                <flat-pickr id="birth_date" class="form-control" v-model="editForm.birth_date"
                                    :config="dateConfig" placeholder="Выберите дату рождения"></flat-pickr>
                            </b-form-group>

                            <!-- <b-form-group label="ПИНФЛ" label-for="pinfl" class="mb-3">
                                <b-form-input id="pinfl" v-model="editForm.pinfl" placeholder="Введите ПИНФЛ"
                                    class="form-control" v-maska data-maska="##############"
                                    :state="!$v.pinfl.$error"></b-form-input>
                                <BFormInvalidFeedback v-if="$v.pinfl.$error">ПИНФЛ должен содержать 14 цифр
                                </BFormInvalidFeedback>
                            </b-form-group> -->

                            <b-form-group label="Пароль" label-for="password" class="mb-3">
                                <b-form-input id="password" v-model="editForm.password"
                                    placeholder="Введите паролья" :state="!$v.password?.$error"></b-form-input>
                                <BFormInvalidFeedback v-if="$v.password?.$error">Пароль должен содержать минимум 6 цифр
                                </BFormInvalidFeedback>
                            </b-form-group>
                        </b-col>

                        <b-col md="6">
                            <b-form-group label="Паспорт" label-for="passport" class="mb-3">
                                <b-form-input id="passport" v-model="editForm.passport"
                                    placeholder="Введите паспортные данные"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Специальность" label-for="specialty" class="mb-3">
                                <b-form-input id="specialty" v-model="editForm.specialty"
                                    placeholder="Введите специальность"></b-form-input>
                            </b-form-group>

                            <b-form-group label="МПИ" label-for="mpi" class="mb-3">
                                <b-form-input id="mpi" v-model="editForm.mpi" placeholder="Введите МПИ"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Отделение" label-for="department" class="mb-3">
                                <b-form-input id="department" v-model="editForm.department"
                                    placeholder="Введите отделение"></b-form-input>
                            </b-form-group>

                            <b-form-group label="Дополнительная информация" label-for="additional_information"
                                class="mb-3">
                                <b-form-textarea id="additional_information" v-model="editForm.additional_information"
                                    placeholder="Введите дополнительную информацию"></b-form-textarea>
                            </b-form-group>
                        </b-col>
                    </b-row>
                </b-container>

                <div class="d-flex justify-content-between gap-3 mt-3">
                    <b-button type="button" variant="danger" @click="isEditModalVisible = false">Отмена</b-button>
                    <b-button type="submit" variant="success">Изменить</b-button>
                </div>
            </form>
        </b-modal>

        <!-- delete modal-->
        <BModal v-model="deleteModal" body-class="p-5 text-center" modal-class="flip" hide-footer no-close-on-backdrop
            centered>
            <div class="text-center">
                <div class="text-danger">
                    <lottie class="avatar-xl" colors="primary:#405189,secondary:#f06548" :options="defaultOptions1"
                        :height="75" :width="75" />
                </div>
                <div class="mt-4">
                    <h3 class="mb-2">Удалить врача ?</h3>
                    <p class="text-muted fs-lg mx-3 mb-0">Уверены!!</p>
                </div>
            </div>
            <div class="d-flex gap-2 justify-content-center mt-4 mb-2">
                <BButton type="button" variant="light" class="w-sm btn-hover" @click="deleteModal = false">Отмена
                </BButton>
                <BButton type="button" variant="danger" class="w-sm btn-hover" id="delete-record"
                    @click="onDeletePatient(deletePatientId)">Да, удалить</BButton>
            </div>
        </BModal>
    </Layout>
</template>
