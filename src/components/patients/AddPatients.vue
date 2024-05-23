<script>

import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { vMaska } from "maska";
import useVuelidate from "@vuelidate/core";
import { ref, watch } from "vue";
import { axiosInstance } from "../../axios";
// import { useRouter } from 'vue-router';
// import { useStore } from "vuex";
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
            age: null,
            gender: null,
            ethnicity: null,
            social_group: null,
            profession: null,
            additional_phone_number: "",
            email: "",
            telegram_username: "",
            region: "",
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


        let files = ref([]);
        let dropzoneFile = ref("");
        const drop = (e) => {
            dropzoneFile.value = e.dataTransfer.files[0];
            files.value.push(dropzoneFile.value);
        };
        const selectedFile = () => {
            dropzoneFile.value = document.querySelector(".dropzoneFile").files[0];
            files.value.push(dropzoneFile.value);
        };
        const deleteMultipleFile = (index) => {
            files.value.splice(index, 1);
        };
        const active = ref(false);

        const toggleActive = () => {
            active.value = !active.value;
        };
        watch(
            () => [...files.value],
            (currentValue) => {
                return currentValue;
            }
        );



        // const resetFormData = () => {
        //     dropzoneFile.value = null;
        //     files.value = null;
        //     for (const key in form.value) {
        //         if (Object.prototype.hasOwnProperty.call(form.value, key)) {
        //             form.value[key] = "";
        //         }
        //     }
        //     for (const key in admissionDataForm.value) {
        //         if (
        //             Object.prototype.hasOwnProperty.call(admissionDataForm.value, key)
        //         ) {
        //             admissionDataForm.value[key] = null;
        //         }
        //     }

        //     // Очищаем список файлов
        //     multipleFiles.value = [];

        // };
        function translate(text) {
            const translations = {
                phone: "Телефон",
                birth_date: "Дата рождения",
                pinfl: "ПИНФЛ",
                age: "Возраст",
                gender: "Пол",
                "This field may not be blank.": "Это поле не может быть пустым.",
                "This field may not be null.": "Это поле не может быть пустым."
            };
            return translations[text] || text;
        }

        const handleSubmit = async () => {



            try {
                form.value.phone = form.value.phone.replace(/[\s()-]/g, "");
                form.value.additional_phone_number = form.value.additional_phone_number.replace(/[\s()-]/g, "");
                form.value.passport = form.value.passport.replace(' ', '');
                const responsePatient = await axiosInstance.post("/patients/", form.value);

                if (responsePatient.status === 201 || responsePatient.status === 200) {
                    Swal.fire({
                        title: "Успешно",
                        text: "Пациент успешно добавлен!",
                        icon: "success",
                        timer: 2500,
                        timerProgressBar: true
                    });
                }

            } catch (error) {
                if (error.response && error.response.data) {
                    let errorMessage = "<div>";
                    for (const key in error.response.data) {
                        if (key in error.response.data) {
                            errorMessage += `<p class="fs-8">${translate(key)}: ${translate(error.response.data[key][0])}</p>`;
                        }
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
                        text: "Произошла ошибка при выполнении операции",
                        icon: "error"
                    });
                }
            }



        };



        const options = {
            preProcess: val => val.toUpperCase()
        };

        const selectedRegion = ref(null);
        const regions = ref(["Самаркандская область"]);



        return {
            timeConfig,
            DateConfig,
            dateTimeConfig,
            form,
            handleSubmit,
            files,
            dropzoneFile,
            selectedRegion,
            regions,
            v$: useVuelidate(),
            tabIndex,
            drop,
            selectedFile,
            deleteMultipleFile,
            toggleActive,
            active,

            options
        };
    },

    components: {
        flatPickr,

    },

    directives: { maska: vMaska },
};
</script>

<template>

        <BRow>
            <BCol class="col-xl-12">
                <BCard no-body>
                    <BCardBody class="checkout-tab">
                        <BForm action="#">
                            <div class="step-arrow-nav mt-n3 mx-n3 mb-3">
                                <BTabs nav-class="nav-pills nav-justified custom-nav" v-model="tabIndex">
                                    <BTab active class="nav-item nav-link p-3">
                                        <template #title>
                                            <div class="fs-15">
                                                <i
                                                    class="ri-passport-line fs-16 avatar-xs d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle align-middle me-2"></i>
                                                Пасспортные данные
                                            </div>
                                        </template>
                                        <div class="mt-3">
                                            <BRow>
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label for="billinginfo-firstName"
                                                            class="form-label">Фамилия</label>
                                                        <input v-model="form.last_name" type="text" class="form-control"
                                                            id="billinginfo-firstName" placeholder="Введите Фамилию"
                                                            value="" />
                                                    </div>
                                                </BCol>

                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label for="billinginfo-lastName" class="form-label">Имя</label>
                                                        <input v-model="form.first_name" type="text"
                                                            class="form-control" id="billinginfo-lastName"
                                                            placeholder="Введите Имя" value="" />
                                                    </div>
                                                </BCol>
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label for="billinginfo-thirdName"
                                                            class="form-label">Отчество</label>
                                                        <input v-model="form.middle_name" type="text"
                                                            class="form-control" id="billinginfo-thirdName"
                                                            placeholder="Введите Отчество" value="" />
                                                    </div>
                                                </BCol>
                                            </BRow>

                                            <BRow>
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label>Дата рождения</label>
                                                        <div class="input-group">
                                                            <span class="input-group-text"><i
                                                                    class="ri-calendar-event-line"></i></span>
                                                            <flat-pickr placeholder="Выберите дату"
                                                                v-model="form.birth_date" :config="DateConfig"
                                                                class="form-control flatpickr-input"
                                                                id="caledate"></flat-pickr>
                                                        </div>
                                                    </div>
                                                </BCol>

                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label class="form-label">ПИНФЛ</label>
                                                        <input v-model="form.pinfl" v-maska data-maska="##############"
                                                            class="form-control" type="text"
                                                            placeholder="12421231453726" />
                                                    </div>
                                                </BCol>

                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label class="form-label">Серия и номерм паспорта /
                                                            ID-карты</label>
                                                        <input class="form-control" v-maska:[options]
                                                            data-maska="AA #######" data-maska-tokens="A:[A-Z]"
                                                            placeholder="AA #######" v-model="form.passport" />
                                                    </div>
                                                </BCol>
                                            </BRow>

                                            <BRow>


                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label class="form-label">Прикрепить Файл
                                                            <span class="text-muted">
                                                                (Максимальный размер 10 мб)</span></label>

                                                        <div @dragenter.prevent="toggleActive"
                                                            @dragleave.prevent="toggleActive" @dragover.prevent
                                                            @drop.prevent="drop" :class="{ 'active-dropzone': active }"
                                                            class="dropzone position-relative">
                                                            <div>
                                                                <i
                                                                    class="display-6 text-muted ri-upload-cloud-2-fill"></i>
                                                            </div>
                                                            <small>Drop files here or click to upload.</small>
                                                            <label for="dropzoneFile2"
                                                                class="stretched-link">Upload</label>
                                                            <input type="file" id="dropzoneFile2"
                                                                class="dropzoneFile btn btn-primary"
                                                                @change="selectedFile" multiple />
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
                                                                            Delete
                                                                        </BButton>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </ul>
                                                    </div>
                                                </BCol>
                                                <BCol>
                                                    <div class="mb-3">
                                                        <label class="form-label"
                                                            for="des-info-description-input">Примечания</label>
                                                        <textarea v-model="form.additional_information"
                                                            class="form-control"
                                                            placeholder="Введите примечания при необходимости"
                                                            id="des-info-description-input" rows="3"></textarea>
                                                    </div>
                                                </BCol>
                                            </BRow>
                                        </div>
                                        <div class="d-flex align-items-start gap-3 mt-4">
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
                                                Демографические данные
                                            </div>
                                        </template>

                                        <div class="mt-3">
                                            <BRow>
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label for="billinginfo-firstName"
                                                            class="form-label">Возраст</label>
                                                        <input v-model="form.age" type="number" class="form-control"
                                                            placeholder="18" />
                                                    </div>
                                                </BCol>
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label>Пол</label>
                                                        <BFormSelect v-model="form.gender" class="mb-3"
                                                            aria-label="Default select example">
                                                            <BFormSelectOption :value="null" disabled>Выберите пол
                                                            </BFormSelectOption>
                                                            <BFormSelectOption value="male">Мужчина
                                                            </BFormSelectOption>
                                                            <BFormSelectOption value="female">
                                                                Женщина
                                                            </BFormSelectOption>
                                                        </BFormSelect>
                                                    </div>
                                                </BCol>
                                            </BRow>
                                            <BRow>
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label>Социальная демографическая группа</label>
                                                        <BFormSelect v-model="form.social_group" class="mb-3"
                                                            aria-label="Default select example">
                                                            <BFormSelectOption :value="null" disabled>Выберите группу
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
                                                        <label>Этическая принадлежность</label>
                                                        <BFormSelect v-model="form.ethnicity" class="mb-3"
                                                            aria-label="Default select example">
                                                            <BFormSelectOption :value="null" disabled>Выберите
                                                                принадлежность
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
                                                        <label>Профессия или род деятельности</label>
                                                        <BFormSelect v-model="form.profession" class="mb-3"
                                                            aria-label="Default select example">
                                                            <BFormSelectOption :value="null" disabled>Выберите профессию
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
                                                        <label class="form-label"
                                                            for="info-description-input">Примечания</label>
                                                        <textarea v-model="form.demographic_additional"
                                                            class="form-control"
                                                            placeholder="Введите примечания при необходимости"
                                                            id="info-description-input" rows="3"></textarea>
                                                    </div>
                                                </BCol>
                                            </BRow>
                                        </div>
                                        <div class="d-flex align-items-start gap-3 mt-4">
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
                                    </BTab>

                                    <BTab class="nav-item nav-link fs-15 p-3">
                                        <template #title>
                                            <div class="fs-15">
                                                <i
                                                    class="ri-contacts-book-line fs-16 avatar-xs d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle align-middle me-2"></i>
                                                Контактные данные
                                            </div>
                                        </template>
                                        <div class="mt-3">
                                            <BRow class="mb-2">
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label>Основной номер мобильного телефона</label>
                                                        <input v-model="form.phone" type="text" class="form-control"
                                                            placeholder="+998 (___) ___-__-__" v-maska
                                                            data-maska="+998 (##) ###-##-##" />
                                                    </div>
                                                </BCol>
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <div class="mb-3">
                                                            <label>Дополнительный номер телефона</label>
                                                            <input v-model="form.additional_phone_number" type="text"
                                                                class="form-control" placeholder="+998 (___) ___-__-__"
                                                                v-maska data-maska="+998 (##) ###-##-##" />
                                                        </div>
                                                    </div>
                                                </BCol>

                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <div class="mb-3">
                                                            <label>Адресс электронной почты</label>
                                                            <input v-model="form.email" type="email"
                                                                class="form-control"
                                                                placeholder="somepatient@somedomain.uz" />
                                                        </div>
                                                    </div>
                                                </BCol>
                                            </BRow>
                                            <small><b>Адресс постоянного проживания</b>
                                                <span class="text-muted">(или адрес постоянной
                                                    регистрации)</span></small>
                                            <BRow class="mt-3">
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label>Область</label>
                                                        <BFormSelect class="mb-3" v-model="form.district"
                                                            aria-label="Default select example">
                                                            <BFormSelectOption :value="null" disabled>Выберите область
                                                            </BFormSelectOption>
                                                            <BFormSelectOption v-for="(region, index) in regions"
                                                                :key="index" :value="1">{{ region }}
                                                            </BFormSelectOption>
                                                        </BFormSelect>
                                                    </div>
                                                </BCol>

                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label for="town">Район</label>
                                                        <input v-model="form.region" type="text" class="form-control"
                                                            id="town" placeholder="Введите район" />
                                                    </div>
                                                </BCol>
                                                <BCol sm="4">
                                                    <div class="mb-3">
                                                        <label for="сity">Населенный пункт</label>
                                                        <input v-model="form.city" type="text" class="form-control"
                                                            id="сity" placeholder="Введите название" />
                                                    </div>
                                                </BCol>
                                            </BRow>

                                            <BRow class="mt-3">
                                                <BCol sm="3">
                                                    <div class="mb-3">
                                                        <label>Махалля</label>
                                                        <input v-model="form.mahalla" type="text" class="form-control"
                                                            placeholder="Введите название" />
                                                    </div>
                                                </BCol>
                                                <BCol sm="3">
                                                    <div class="mb-3">
                                                        <label>Улица</label>
                                                        <input v-model="form.street" type="text" class="form-control"
                                                            placeholder="Введите название" />
                                                    </div>
                                                </BCol>
                                                <BCol sm="2">
                                                    <div class="mb-3">
                                                        <label>Номер здания</label>
                                                        <input v-model="form.building" type="text" class="form-control"
                                                            placeholder="Введите название" />
                                                    </div>
                                                </BCol>
                                                <BCol sm="2">
                                                    <div class="mb-3">
                                                        <label>Геолокация</label>
                                                        <input v-model="form.latitude" type="text"
                                                            class="form-control mb-3" placeholder="Введите широту" />
                                                        <input v-model="form.longitude" type="text" class="form-control"
                                                            placeholder="Введите долготу" />
                                                    </div>
                                                </BCol>
                                                <BCol sm="2">
                                                    <div class="mb-3">
                                                        <label>Юзернейм в Телеграмме</label>
                                                        <input v-model="form.telegram_username" type="text"
                                                            class="form-control" placeholder="@some_tg_user" />
                                                    </div>
                                                </BCol>
                                            </BRow>
                                        </div>
                                        <div class="d-flex align-items-start gap-3 mt-4">
                                            <button type="button" class="btn btn-light btn-label previestab"
                                                @click="tabIndex--">
                                                <i class="ri-arrow-left-line label-icon align-middle fs-lg me-2"></i>
                                                Назад
                                            </button>
                                            <button type="button" class="btn btn-primary   ms-auto nexttab nexttab"
                                                @click="handleSubmit">
                                                Добавить
                                            </button>
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
