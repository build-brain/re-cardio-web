<script setup>

import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { vMaska } from "maska";
import { onMounted, ref, watch, computed } from "vue";
import { axiosInstance } from "../../axios";
import { useStore } from "vuex";
import Swal from "sweetalert2";
import { useRoute, useRouter } from "vue-router";
import useVuelidate from '@vuelidate/core';
import { required, email, minLength, maxLength, numeric, sameAs } from '@vuelidate/validators';
import { helpers } from '@vuelidate/validators';
const digitsOnlyValidator = helpers.withMessage(
    'Неверный формат номера телефона',
    (value) => {
        console.log(value);
        
        if (!value) return false;
        const digitsCount = (value.match(/\d/g) || []).length;
        return digitsCount === 12;
    }
);
const optionaDigitsOnlyValidator = helpers.withMessage(
  'Неверный формат номера телефона',
  (value) => {
    if (!value) return true;
    const digitsCount = (value.match(/\d/g) || []).length;
    return digitsCount === 12;
  }
);
const store = useStore();
const router = useRouter();
const route = useRoute();
const tabIndex = ref(1);
const DateConfig = ref({
    enableTime: false,
    altInput: true,
    dateFormat: "Y-m-d",
    altFormat: "d M, Y",
    mode: "single",
});

const form = ref({
    first_name: "",
    last_name: "",
    is_active: false,
    date_joined: null,
    phone: "",
    middle_name: "",
    birth_date: null,
    pinfl: "",
    passport: "",
    password: "",
    age: null,
    gender: null,
    ethnicity: null,
    social_group: null,
    profession: null,
    additional_phone_number: "",
    email: "",
    telegram_username: "",
    region: null,
    city: "",
    mahalla: "",
    street: "",
    building: "",
    latitude: null,
    longitude: null,
    district: null,
    demographic_additional: "",
    additional_information: "",
    avatar: null,
});
const calculatedAge = computed(() => {
    if (!form.value.birth_date) return null;

    const today = new Date();
    const birthDate = new Date(form.value.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
});

watch(() => form.value.birth_date, (newVal) => {
    form.value.age = calculatedAge.value;
});

const maxLengthWithoutSpaces = (max) => (value) => {
    return !value || value.replace(/\s/g, '').length <= max;
};

const showPassword = ref(false)
const rules = {
    first_name: { required },
    last_name: { required },
    middle_name: {},
    birth_date: { },
    // pinfl: { required, minLength: minLength(14), maxLength: maxLength(14), numeric },
    passport: { required, maxLengthWithoutSpaces: maxLengthWithoutSpaces(9) },
    age: { required, numeric },
    gender: { required },
    ethnicity: {},
    social_group: {},
    profession: {},
    phone: {
        required: helpers.withMessage('Поле обязательно для заполнения', required),
        digitsOnlyValidator
    },
    password: { minLength: minLength(6) },
    // confirm_password: {
    //     // required: helpers.withMessage('Подтвердите пароль', required),
    //     sameAsPassword: sameAs(computed(() => form.value.password)),
    // },
    additional_phone_number: {
        digitsOnlyValidator: optionaDigitsOnlyValidator
    },
    email: { email },
    telegram_username: {},
    region: {},
    city: {},
    mahalla: {},
    street: {},
    building: {},
    latitude: { numeric },
    longitude: { numeric },
    district: {},
};

const v$ = useVuelidate(rules, form);



let files = ref([]);
let dropzoneFile = ref("");

const drop = (e) => {
    const file = e.dataTransfer.files[0];
    if (file instanceof File) {
        files.value.push({ file });
    } else {
        console.error("Dropped item is not a file");
    }
};

const selectedFile = () => {
    const file = document.querySelector(".dropzoneFile").files[0];
    if (file instanceof File) {
        files.value.push({ file });
    } else {
        console.error("Selected item is not a file");
    }
};

const deleteMultipleFile = async (file, index) => {
    if (file.id) {
        try {
            const response = await axiosInstance.delete(`/patient-attachments/${file.id}/`);
            if (response.status === 204) {
                files.value.splice(index, 1);
            }
        } catch (error) {
            console.error("Ошибка при удалении файла", error);
        }
    } else {
        files.value.splice(index, 1);
    }
};

const active = ref(false);

const toggleActive = () => {
    active.value = !active.value;
};

watch(
    () => [...files.value],
    (currentValue) => currentValue
);

function translate(text) {
    const translations = {
        first_name: "Имя",
        last_name: "Фамилия",
        middle_name: "Отчество",
        birth_date: "Дата рождения",
        age: "Возраст",
        gender: "Пол",
        phone: "Телефон",
        password: "Пароль",
        additional_phone_number: "Дополнительный телефон",
        email: "Электронная почта",
        telegram_username: "Телеграм",
        pinfl: "ПИНФЛ",
        passport: "Паспорт",

        // 📍 Адрес
        region: "Регион",
        district: "Район",
        city: "Город",
        mahalla: "Махалля",
        street: "Улица",
        building: "Дом",
        latitude: "Широта",
        longitude: "Долгота",

        // 👥 Социальные и демографические данные
        ethnicity: "Национальность",
        social_group: "Социальная группа",
        profession: "Профессия",
        demographic_additional: "Дополнительные демографические данные",
        additional_information: "Дополнительная информация",

        // 📅 Прочее
        date_joined: "Дата регистрации",
        is_active: "Активен",
        avatar: "Аватар",
        // phone: "Телефон",
        // birth_date: "Дата рождения",
        // pinfl: "ПИНФЛ",
        // age: "Возраст",
        // gender: "Пол",
        // phone: "Телефон",
        // birth_date: "Дата рождения",
        // pinfl: "ПИНФЛ",
        // age: "Возраст",
        // gender: "Пол",
        // password: "Пароль",
        // passport: "Паспорт",
        // region: "Регион",
        // district: "Район",
        // "This field may not be blank.": "Это поле не может быть пустым.",
        // "This field may not be null.": "Это поле не может быть пустым.",

        // "Enter a valid email address.": "Введите корректный адрес электронной почты.",
        // "Ensure this field has at least 14 characters.": "Минимальная длина — 14 символов.",
        // "Ensure this field has no more than 14 characters.": "Максимальная длина — 14 символов.",
        // "Invalid format.": "Неверный формат.",
        // "This field is required.": "Это поле обязательно к заполнению.",
        // "This field may not be blank.": "Это поле не может быть пустым.",
        // "This field may not be null.": "Это поле не может быть пустым."

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


const getEditInstance = async () => {
    try {
        const response = await axiosInstance.get(`/patients/${route.params.id}/`);
        if (response.status === 200) {
            const patientData = response.data;
            files.value = patientData.attachments.map((attachment) => ({
                id: attachment.id,
                name: attachment.name,
                size: attachment.size,
                url: attachment.url,
            }));
            for (const key in patientData) {
                if (Object.hasOwnProperty.call(patientData, key) && Object.hasOwnProperty.call(form.value, key)) {
                    form.value[key] = patientData[key];
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
};

const handleSubmit = async () => {
    v$.value.$touch();

    if (v$.value.$invalid) {
        v$.value.$touch();

        // Собираем все ошибки
        let errorMessage = "<div style='text-align:left;'>";

        // Перебираем все поля валидации
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

    try {
        console.log(form.value);
        
        form.value.phone = form.value.phone.replace(/[\s()-]/g, "");
        form.value.additional_phone_number = form.value.additional_phone_number.replace(/[\s()-]/g, "");
        form.value.passport = form.value.passport.replace(/[\s()-]/g, '');
        // delete form.value.confirm_password
        if (form.value.password && form.value.password.trim() !== '') {
            form.value.password = `${form.value.password}`;
        } else {
            delete form.value.password
        }


        const responsePatient = await axiosInstance.put(`/patients/${route.params.id}/`, form.value);

        if (responsePatient.status === 201 || responsePatient.status === 200) {
            const patientId = responsePatient.data.id;

            for (const fileObj of files.value) {
                if (fileObj.file instanceof File) {
                    const formData = new FormData();
                    formData.append("name", fileObj.file.name);
                    formData.append("attachment", fileObj.file);
                    formData.append("patient", patientId);

                    try {
                        await axiosInstance.post(`/patient-attachments/`, formData, {
                            headers: {
                                "Content-Type": "multipart/form-data",
                            },
                        });
                    } catch (error) {

                        Swal.fire({
                            title: "Ошибка",
                            text: "Ошибка при загрузке файла",
                            icon: "error"
                        });
                        console.error("Ошибка при загрузке файла", error);
                    }
                }
            }
            Swal.fire({
                title: "Успешно",
                text: "Пациент успешно изменен!",
                icon: "success",
                timer: 2500,
                timerProgressBar: true
            });
            setTimeout(() => {
                router.push('/patients/');
            }, 2000);


        }
    } catch (error) {
        // Swal.fire({
        //     title: "Ошибка",
        //     text: "Произошла ошибка при выполнении операции",
        //     icon: "error"
        // });
        
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
    }
};




const options = {
    preProcess: val => val.toUpperCase()
};

if (route.params.tab) {

    tabIndex.value = parseInt(route.params.tab, 10);
}
const regions = computed(() => store.state.district.regions);
const districts = computed(() => store.state.district.districts);

const onRegionChange = (event) => {
    const regionId = event.target.value;
    form.value.region = regionId;
    form.value.district = null;
    store.dispatch('district/fetchDistricts', regionId);
};

const mapRegionAndDistrict = async() => {
    const region = regions.value.find(r => r.name === form.value.region);
    if (region) {
        form.value.region = region.id;
        store.dispatch('district/fetchDistricts', region.id).then(() => {
            const district = districts.value.find(d => d.name === form.value.district);
            if (district) {
                form.value.district = district.id;
            }
        });
    }
};
onMounted(async () => {
    await getEditInstance();
    await store.dispatch('district/fetchRegions');
    await mapRegionAndDistrict();
});





</script>

<template>

    <BRow>
        <BCol class="col-xl-12">
            <BCard no-body>
                <BCardBody class="checkout-tab">
                    <BForm action="#">
                        <div class="step-arrow-nav mt-n3 mx-n3 mb-3">
                            <BTabs nav-class="nav-pills nav-justified " v-model="tabIndex">
                                <BTab active class="nav-item nav-link p-3">
                                    <template #title>
                                        <div class="fs-15">
                                            <i
                                                class="ri-passport-line fs-16 avatar-xs d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle align-middle me-2"></i>
                                            {{ $t('passport') }}
                                        </div>
                                    </template>
                                    <div class="mt-3">
                                        <BRow>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label for="billinginfo-firstName" class="form-label">{{
                                $t('first_name') }} <span class="required_field">*</span></label>
                                                    <input v-model="form.first_name" type="text"
                                                        :class="['form-control', { 'is-invalid': v$.first_name.$error }]"
                                                        id="billinginfo-firstName" placeholder="Введите фамилию" />
                                                    <div v-if="v$.first_name.$error" class="invalid-feedback">
                                                        Поле обязательное для заполнения
                                                    </div>
                                                </div>
                                            </BCol>

                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label for="billinginfo-lastName" class="form-label">{{
                                $t('last_name') }} <span class="required_field">*</span></label>
                                                    <input v-model="form.last_name" type="text"
                                                        :class="['form-control', { 'is-invalid': v$.last_name.$error }]"
                                                        id="billinginfo-lastName" placeholder="Введите имя" />
                                                    <div v-if="v$.last_name.$error" class="invalid-feedback">
                                                        Поле обязательное для заполнения
                                                    </div>
                                                </div>
                                            </BCol>

                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label for="billinginfo-thirdName" class="form-label">{{
                                $t('middle_name') }}</label>
                                                    <input v-model="form.middle_name" type="text" class="form-control"
                                                        id="billinginfo-thirdName" placeholder="Введите отчество" />

                                                </div>
                                            </BCol>
                                        </BRow>

                                        <BRow>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label>{{ $t('birth_date') }} <span class="required_field">*</span></label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="ri-calendar-event-line"></i></span>
                                                        <flat-pickr placeholder="Введите дату рождения"
                                                            v-model="form.birth_date" :config="DateConfig"
                                                            :class="['form-control', { 'is-invalid': v$.birth_date.$error }]"
                                                            id="caledate"></flat-pickr>
                                                        <div v-if="v$.birth_date.$error" class="invalid-feedback">
                                                            Поле обязательное для заполнения
                                                        </div>
                                                    </div>
                                                </div>
                                            </BCol>
                                            <!-- <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">ПИНФЛ</label>
                                                    <input v-model="form.pinfl" v-maska data-maska="##############"
                                                        :class="['form-control', { 'is-invalid': v$.pinfl.$error }]"
                                                        type="text" placeholder="12421231453726" />
                                                    <div v-if="v$.pinfl.$error" class="invalid-feedback">
                                                        Поле должно содержать 14 цифр
                                                    </div>
                                                </div>
                                            </BCol> -->

                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('id_card') }} <span class="required_field">*</span></label>
                                                    <input class="form-control" v-maska:[options]
                                                        data-maska="AA #######" data-maska-tokens="A:[A-Z]"
                                                        :class="{ 'is-invalid': v$.passport.$error }"
                                                        placeholder="AA #######" v-model="form.passport" />
                                                    <div v-if="v$.passport.$error" class="invalid-feedback">
                                                        Поле должно содержать максимум 9 символов
                                                    </div>
                                                </div>
                                            </BCol>

                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">Пароль
                                                    </label>
                                                    <div class="input-group">
                                                    <input
                                                        :type="showPassword ? 'text' : 'password'"
                                                        v-model="form.password"
                                                        class="form-control"
                                                        :class="{ 'is-invalid': v$.password.$error }"
                                                        placeholder="Введите пароль"
                                                    />
                                                    <button
                                                        type="button"
                                                        class="btn btn-outline-secondary"
                                                        @click="showPassword = !showPassword"
                                                        tabindex="-1"
                                                    >
                                                        <i :class="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                                                    </button>
                                                    <div v-if="v$.password.$error" class="invalid-feedback">
                                                        <div
                                                        v-for="error in v$.password.$errors"
                                                        :key="error.$uid"
                                                        >
                                                        {{ translate(error.$message) ?? error.$message }}
                                                        </div>
                                                    </div>
                                                    </div>
                                                </div>
                                            </BCol>
                                            <!-- 
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">Повторите пароль</label>
                                                    <input
                                                        v-model="form.confirm_password"
                                                        :type="showPassword ? 'text' : 'password'"
                                                        class="form-control"
                                                        :class="{ 'is-invalid': v$.confirm_password.$error }"
                                                        placeholder="Повторите пароль"
                                                    />
                                                    <div v-if="v$.confirm_password.$error" class="invalid-feedback">
                                                        <div v-for="error in v$.confirm_password.$errors" :key="error.$uid">
                                                            {{ translate(error.$message) ?? error.$message }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </BCol> -->
                                        
                                        </BRow>


                                        <BRow>


                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('add_file') }}
                                                        <span class="text-muted">
                                                            {{ $t('max_MB') }}</span></label>

                                                    <div @dragenter.prevent="toggleActive"
                                                        @dragleave.prevent="toggleActive" @dragover.prevent
                                                        @drop.prevent="drop" :class="{ 'active-dropzone': active }"
                                                        class="dropzone position-relative">
                                                        <div>
                                                            <i class="display-6 text-muted ri-upload-cloud-2-fill"></i>
                                                        </div>
                                                        <small>Перетащите файлы сюда или нажмите для
                                                            загрузки</small>
                                                        <label for="dropzoneFile2"
                                                            class="stretched-link">Загрузить</label>
                                                        <input type="file" id="dropzoneFile2"
                                                            class="dropzoneFile btn btn-primary" @change="selectedFile"
                                                            multiple />
                                                    </div>
                                                    <ul class="list-unstyled mb-0" id="dropzone-preview">
                                                        <div class="border rounded" v-for="(file, index) of files"
                                                            :key="index">
                                                            <div class="d-flex p-2">
                                                                <div class="flex-grow-1">
                                                                    <div class="pt-1">
                                                                        <h5 class="fs-14 mb-1" data-dz-name="">
                                                                            {{ file.name }}
                                                                        </h5>
                                                                        <p class="fs-13 text-muted mb-0"
                                                                            data-dz-size="">
                                                                            <strong>{{ file.size / 1024
                                                                                }}</strong> KB
                                                                        </p>
                                                                        <strong class="error text-danger"
                                                                            data-dz-errormessage=""></strong>
                                                                    </div>
                                                                </div>
                                                                <div class="flex-shrink-0 ms-3">
                                                                    <BButton variant="danger" size="sm"
                                                                        data-dz-remove=""
                                                                        @click="deleteMultipleFile(index)">
                                                                        Удалить
                                                                    </BButton>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </ul>
                                                </div>
                                            </BCol>
                                            <BCol>
                                                <div class="mb-3">
                                                    <label class="form-label" for="des-info-description-input">{{
                                $t('notes') }}</label>
                                                    <textarea v-model="form.additional_information" class="form-control"
                                                        placeholder="Введите примечания при необходимости"
                                                        id="des-info-description-input" rows="3"></textarea>
                                                </div>
                                            </BCol>
                                        </BRow>
                                    </div>
                                    <div class="d-flex align-items-start gap-3 mt-4">
                                        <router-link :to='`/patients/`'>
                                            <button type="button" class="btn btn-danger ">
                                                Отмена
                                            </button>
                                        </router-link>
                                        <button type="button"
                                            class="btn btn-primary btn-label right ms-auto nexttab nexttab"
                                            @click="tabIndex++">
                                            <i class="ri-arrow-right-line label-icon align-middle fs-lg ms-2"></i>
                                            Далее
                                        </button>
                                    </div>
                                </BTab>
                                <BTab class="nav-item nav-link fs-15 p-3">
                                    <template #title>
                                        <div class="fs-15">
                                            <i
                                                class="ri-group-line fs-16 avatar-xs d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle align-middle me-2"></i>
                                            {{ $t('demog_contact.title') }}
                                        </div>
                                    </template>

                                    <div class="mt-3">
                                        <BRow>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label for="billinginfo-firstName" class="form-label"> {{
                                $t('demog_contact.old') }}</label>
                                                    <input v-model="form.age" :disabled="true" type="number"
                                                        class="form-control"
                                                        :class="['form-control', { 'is-invalid': v$.age.$error }]"
                                                        placeholder="Введите ваш возраст" />
                                                    <div v-if="v$.age.$error" class="invalid-feedback">
                                                        Поле обязательное для заполнения
                                                    </div>
                                                </div>

                                            </BCol>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label> {{ $t('demog_contact.gender') }} <span class="required_field">*</span></label>
                                                    <BFormSelect v-model="form.gender"
                                                        :class="['form-control', { 'is-invalid': v$.gender.$error }]"
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выбрать...
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="male">Мужчина
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="female">
                                                            Женщина
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                    <div v-if="v$.gender.$error" class="invalid-feedback">
                                                        Поле обязательное для заполнения
                                                    </div>

                                                </div>

                                            </BCol>
                                        </BRow>
                                        <BRow>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label"> {{ $t('demog_contact.group')
                                                        }}</label>
                                                    <BFormSelect v-model="form.social_group" class="mb-3"
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выбрать...
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="child">Дети</BFormSelectOption>
                                                        <BFormSelectOption value="pensioner">Пенсионеры
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="adult">
                                                            Трудоспобоные
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="disabled">
                                                            Не трудоспобоные
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                </div>
                                            </BCol>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.ethnicity')
                                                        }}</label>
                                                    <BFormSelect v-model="form.ethnicity" class="mb-3"
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выбрать...
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="asian">Азиаты</BFormSelectOption>
                                                        <BFormSelectOption value="european">Европейцы
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="other">
                                                            Прочие</BFormSelectOption>
                                                    </BFormSelect>
                                                </div>
                                            </BCol>
                                        </BRow>

                                        <BRow>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.prof') }}</label>
                                                    <BFormSelect v-model="form.profession" class="mb-3"
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выбрать...
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="farmer">дехкане
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="worker">рабочие
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="employee">
                                                            служащие
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="freelancer">
                                                            лица свободных профессий
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="priest">
                                                            священнослужители
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="other">
                                                            прочее
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                </div>
                                            </BCol>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label" for="info-description-input">{{
                                $t('demog_contact.notes') }}</label>
                                                    <textarea v-model="form.demographic_additional" class="form-control"
                                                        placeholder="Введите примечания при необходимости"
                                                        id="info-description-input" rows="3"></textarea>
                                                </div>
                                            </BCol>
                                        </BRow>
                                    </div>

                                    <div class="d-flex justify-content-between align-items-start gap-3 mt-4">
                                        <div>
                                            <router-link :to='`/patients/`'>
                                                <button type="button" class="btn btn-danger ">
                                                    Отмена
                                                </button>
                                            </router-link>
                                        </div>
                                        <div class="d-flex gap-3 align-items-center">
                                            <button type="button" class="btn btn-light btn-label previestab"
                                                @click="tabIndex--">
                                                <i class="ri-arrow-left-line label-icon align-middle fs-lg me-2"></i>
                                                Назад
                                            </button>
                                            <button type="button"
                                                class="btn btn-primary btn-label right ms-auto nexttab nexttab"
                                                @click="tabIndex++">
                                                <i class="ri-arrow-right-line label-icon align-middle fs-lg ms-2"></i>
                                                Далее
                                            </button>
                                        </div>

                                    </div>
                                </BTab>

                                <BTab class="nav-item nav-link fs-15 p-3">
                                    <template #title>
                                        <div class="fs-15">
                                            <i
                                                class="ri-contacts-book-line fs-16 avatar-xs d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle align-middle me-2"></i>
                                            {{ $t('demog_contact.kontact') }}
                                        </div>
                                    </template>
                                    <div class="mt-3">
                                        <BRow class="mb-2">
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.basic_contact')
                                                        }} <span class="required_field">*</span></label>
                                                    <input v-model="form.phone"
                                                        :class="['form-control', { 'is-invalid': v$.phone.$error }]"
                                                        type="text" placeholder="+998 (___) ___-__-__" v-maska
                                                        data-maska="+998 (##) ###-##-##" />
                                                    <div v-if="v$.phone.$error" class="invalid-feedback">
                                                        <div v-for="error in v$.phone.$errors" :key="error.$message">
                                                            {{ error.$message }}
                                                        </div>
                                                    </div>
                                                </div>

                                            </BCol>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <div class="mb-3">
                                                        <label class="form-label">{{
                                $t('demog_contact.additional_contact') }}</label>
                                                        <input v-model="form.additional_phone_number" type="text"
                                                            class="form-control" placeholder="+998 (___) ___-__-__"
                                                            v-maska data-maska="+998 (##) ###-##-##" :class="{ 'is-invalid': v$.additional_phone_number.$error }" />
                                                            <div v-if="v$.additional_phone_number.$error"class="invalid-feedback">
                                                                <div v-for="error in v$.additional_phone_number.$errors" :key="error.$message">
                                                                    {{ translate(error.$message) ?? error.$message }} 
                                                                </div>
                                                            </div>
                                                    </div>
                                                </div>
                                            </BCol>

                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <div class="mb-3">
                                                        <label class="form-label">{{
                                $t('demog_contact.address_gmail') }}</label>
                                                        <input v-model="form.email" type="email" class="form-control"
                                                            placeholder="somepatient@somedomain.uz" />
                                                    </div>
                                                </div>
                                            </BCol>
                                        </BRow>
                                        <small><b>{{ $t('demog_contact.address') }}</b>
                                        </small>
                                        <BRow class="mt-3">
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.city') }} <span class="required_field">*</span></label>
                                                    <BFormSelect class="mb-3" v-model="form.region"
                                                        @change="onRegionChange">
                                                        <BFormSelectOption :value="null" disabled>Выберите область
                                                        </BFormSelectOption>
                                                        <BFormSelectOption v-for="region in regions" :key="region.id"
                                                            :value="region.id">

                                                            {{ region.name }}
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                </div>
                                            </BCol>

                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label" for="district">{{
                                $t('demog_contact.town') }} <span class="required_field">*</span></label>
                                                    <BFormSelect class="mb-3" v-model="form.district"
                                                        :disabled="!form.region">
                                                        <BFormSelectOption :value="null" disabled>Выберите район
                                                        </BFormSelectOption>
                                                        <BFormSelectOption v-for="district in districts"
                                                            :key="district.id" :value="district.id">
                                                            {{ district.name }}
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                </div>
                                            </BCol>
                                            <BCol sm="4">
                                                <div class="mb-3">
                                                    <label class="form-label" for="сity">{{
                                $t('demog_contact.punkt') }}</label>
                                                    <input v-model="form.city" type="text" class="form-control"
                                                        id="сity" placeholder="Введите название" />
                                                </div>
                                            </BCol>
                                        </BRow>

                                        <BRow class="mt-3">
                                            <BCol sm="3">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.mahalla')
                                                        }}</label>
                                                    <input v-model="form.mahalla" type="text" class="form-control"
                                                        placeholder="Введите название" />
                                                </div>
                                            </BCol>
                                            <BCol sm="3">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.street')
                                                        }}</label>
                                                    <input v-model="form.street" type="text" class="form-control"
                                                        placeholder="Введите название" />
                                                </div>
                                            </BCol>
                                            <BCol sm="2">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.house_number')
                                                        }}</label>
                                                    <input v-model="form.building" type="text" class="form-control"
                                                        placeholder="Введите номер" />
                                                </div>
                                            </BCol>
                                            <BCol sm="2">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.goe') }}</label>
                                                    <input v-model="form.latitude" type="text" class="form-control mb-3"
                                                        placeholder="Введите широту" />
                                                    <input v-model="form.longitude" type="text" class="form-control"
                                                        placeholder="Введите долготу" />
                                                </div>
                                            </BCol>
                                            <BCol sm="2">
                                                <div class="mb-3">
                                                    <label class="form-label">{{ $t('demog_contact.user_tg')
                                                        }}</label>
                                                    <input v-model="form.telegram_username" type="text"
                                                        class="form-control" placeholder="@some_tg_user" />
                                                </div>
                                            </BCol>
                                        </BRow>
                                    </div>

                                    <div class="d-flex justify-content-between align-items-start gap-3 mt-4">
                                        <div>
                                            <router-link :to='`/patients/`'>
                                                <button type="button" class="btn btn-danger ">
                                                    Отмена
                                                </button>
                                            </router-link>
                                        </div>
                                        <div class="d-flex gap-3 align-items-center">
                                            <button type="button" class="btn btn-light btn-label previestab"
                                                @click="tabIndex--">
                                                <i class="ri-arrow-left-line label-icon align-middle fs-lg me-2"></i>
                                                Назад
                                            </button>
                                            <button type="button" class="btn btn-primary   ms-auto nexttab nexttab"
                                                @click="handleSubmit">
                                                Изменить
                                            </button>
                                        </div>

                                    </div>
                                </BTab>


                            </BTabs>
                        </div>
                    </BForm>
                </BCardBody>
            </BCard>
        </BCol>
    </BRow>
</template>
