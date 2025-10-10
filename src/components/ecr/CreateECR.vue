<script setup lang="js">

import flatPickr from "vue-flatpickr-component";
import useVuelidate from "@vuelidate/core";
import { required, minValue, numeric, maxValue } from "@vuelidate/validators";
import "flatpickr/dist/flatpickr.css";

import Multiselect from "@vueform/multiselect";
// import useVuelidate from "@vuelidate/core";
// import DropZone from "@/components/widgets/dropZone";
import { ref, onMounted, computed, watch } from "vue";
import { axiosInstance } from "../../axios";
import { useRoute, useRouter } from 'vue-router';
import { useStore } from "vuex";

import Types from '@/common/Types.js';
import Swal from "sweetalert2";


const route = useRoute();
const router = useRouter();
const tabIndex = ref(1);
const rangeValue = ref(1);
const isModalVisible = ref(false);

const affected_vessel = ref([]);


const modalTitle = ref('Добавить пораженные сосуды');
const affected_vessel_data = ref({
    ca_sheet: null,
    name: null,
    lesion_volume: null,
    index_syntax: null
});
let editingIndex = null;

const showModal = (type, item = {}, index = null) => {
    if (type === 'add') {
        modalTitle.value = 'Добавить пораженные сосуды';
        affected_vessel_data.value = {
            ca_sheet: null,
            name: null,
            lesion_volume: null,
            index_syntax: null
        };
        console.log(affected_vessel_data.value);
        editingIndex = null;
    } else if (type === 'edit') {
        modalTitle.value = 'Изменить пораженные сосуды';
        affected_vessel_data.value = { ...item };
        editingIndex = index;
    }
    isModalVisible.value = true;
};

const handleSubmit = () => {
    if (editingIndex !== null) {
        affected_vessel.value[editingIndex] = { ...affected_vessel_data.value };
    } else {
        affected_vessel.value.push({ ...affected_vessel_data.value });
    }
    isModalVisible.value = false;
};

const editItem = (item, index, event) => {
    event.preventDefault();
    event.stopPropagation();
    showModal('edit', item, index);
};

const deleteItem = (item, event) => {
    event.preventDefault();
    event.stopPropagation();
    affected_vessel.value = affected_vessel.value.filter(v =>
        v.name !== item.name ||
        v.lesion_volume !== item.lesion_volume ||
        v.index_syntax !== item.index_syntax
    );
};

const dateTimeConfig = ref({
    enableTime: false,
    altInput: true,
    dateFormat: "Y-m-d",
    altFormat: "d M, Y",
    mode: "single",
    time_24hr: false,
});

const ca_sheets = ref({
    complications: [],
    morisky_green: 1,
    examination_date: null,
    weight: null,
    height: null,
    body_temperature: null,
    systolic_pressure: null,
    diastolic_pressure: null,
    pulse_rate: null,
    respiratory_rate: null,
    spo2: null,
    moist_rales: false,
    lower_limb_edema: false,
    creatinine: null,
    troponin: null,
    coronary_insufficiency: null,
    killip: 1,
    nyha: 1,
    st_segment_elevation: false,
    t_wave_inversion: false,
    ami_clinical_case: false,
    ami_date: null,
    ami_localization: null,
    mi_type: null,
    myocardium_damage: null,
    acs_characteristics: null,
    coronary_angiography: false,
    stenting: false,
    revascularization: false,
    revascularization_type: null,
    coronary_lesion_degree: null,
    affected_vessel_name: null,
    vessel_lesion_volume: null,
    index_syntax: null,
    issue_date: null,
    accompanying_pathologies: false,
    primary_disease: null,
    q_wave: false,
    accompanying_pathologies_type: null,
    body_mass_index: null,
    anxiety_level: null,
    depression_level: null,

});
const rules = {
    examination_date: { required },
    weight: { required, numeric },
    height: { required, numeric },
    body_mass_index: { required, numeric },
    body_temperature: { required,numeric, minValue: minValue(34), maxValue: maxValue(44) },
    systolic_pressure: { required, numeric  },
    diastolic_pressure: { required, numeric },
    pulse_rate: { required,numeric, },
    creatinine: { required, numeric, },
    troponin: { required, numeric,  },
    coronary_insufficiency: { required },
    ami_localization: { required },
    mi_type: { required },
    myocardium_damage: { required },
    acs_characteristics: { required },
    issue_date: { required },
    anxiety_level: { required },
    depression_level: { required },
    complications: { required },
};

const v$ = useVuelidate(rules, ca_sheets);
const isDisabledCoronary = computed(() => !ca_sheets.value.coronary_angiography);



const DeepVastness = ref({
    1: "ИМ мелкоочаговый",
    2: "ИМ крупноочаговый нетрансмуральный",
    3: "ИМ трансмуральный или циркулярный субэндокардиальный",
});
const OKS = ref({
    "unstable_angina": "Нестабильная стенокардия",
    "mi_without_st": "ИМ без подъема сегмента ST",
    "mi_with_st": "ИМ с подъемом сегмента ST",

});

const localization = ref({
    "anterior_wall": "Передняя стенка",
    "anterior_apical": "Передневерхушечный",
    "anterolateral": "Переднебоковой",
    "anterior_septal": "Переднеперегородочный",
    "diaphragmatic": "Диафрагмальный",
    "inferolateral": "Нижнебоковой",
    "inferoposterior": "Нижнезадний",
    "inferobasal": "Нижнебазальный",
    "apical_lateral": "Верхушечно-боковой",
    "basalolateral": "Базальнолатеральный",
    "superolateral": "Верхнебоковой",
    "lateral": "Боковой",
    "rear": "Задний",
    "posterobasal": "Заднебазальный",
    "posterolateral": "Заднебоковой",
    "posteroseptal": "Заднеперегородочный",
    "septal": "Перегородочный",
    "right_ventricle": "Правый желудочек"
});
const coronary_arteries = ref({
    'left_coronary_artery_trunk': 'Ствол левой коронарной артерии',
    'anterior_descending_artery': 'Передняя нисходящая артерия',
    'diagonal_artery': 'Диагональная(ые) артерия(и)',
    'circumflex_artery': 'Огибающая артерия',
    'blunt_edge_branch': 'Ветвь тупого края',
    'septal_interventricular_branches': 'Перегородочные межжелудочковые ветви',
    'intermediate_artery': 'Промежуточная артерия',
    'right_coronary_artery': 'Правая коронарная артерия',
    'sharp_edge_branch': 'Ветвь острого края',
    'sinoatrial_node_artery': 'Артерия синоатриального узла',
    'posterior_interventricular_branch': 'Задняя межжелудочковая ветвь'
});


const store = useStore();

const icd = computed(() => store.state.patients.icd);



const formattedComplicationsGroup1 = computed(() => {
    const results = store.state.ecr.complication.results;
    if (!results) {
        return [];
    }
    return results
        .filter(item => item.group === 1)
        .map(item => ({
            value: item.id,
            name: item.name
        }));
});

const formattedComplicationsGroup2 = computed(() => {
    const results = store.state.ecr.complication.results;
    if (!results) {
        return [];
    }
    return results
        .filter(item => item.group === 2)
        .map(item => ({
            value: item.id,
            name: item.name
        }));
});

const formattedComplicationsGroup3 = computed(() => {
    const results = store.state.ecr.complication.results;
    if (!results) {
        return [];
    }
    return results
        .filter(item => item.group === 3)
        .map(item => ({
            value: item.id,
            name: item.name
        }));
});

const complication1 = ref([]);
const complication2 = ref([]);
const complication3 = ref([]);
watch([complication1, complication2, complication3], ([newComp1, newComp2, newComp3]) => {
    const combinedComplications = [
        ...newComp1,
        ...newComp2,
        ...newComp3
    ];
    ca_sheets.value.complications = combinedComplications;
}, { immediate: true });


const isDisabled = (group) => {
    switch (group) {
        case 1:
            return complication2.value.length > 0 || complication3.value.length > 0;
        case 2:
            return complication1.value.length > 0 || complication3.value.length > 0;
        case 3:
            return complication1.value.length > 0 || complication2.value.length > 0;
        default:
            return false;
    }
};

const bodyMassIndex = computed(() => {
    const heightInMeters = ca_sheets.value.height / 100;
    if (heightInMeters && ca_sheets.value.weight) {
        return (ca_sheets.value.weight / (heightInMeters * heightInMeters)).toFixed(2);
    }
    return null;
});


watch(bodyMassIndex, (newVal) => {
    ca_sheets.value.body_mass_index = newVal;
});








const getICD = async () => {
    await store.dispatch('patients/getICD');
    await store.dispatch('ecr/fetchComplication');


};
const backendMessageMap = {
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
const onHandlesubmit = async () => {

    v$.value.$touch();
    // if (v$.value.$invalid) {
    //     Swal.fire({
    //         title: "Ошибка валидации!",
    //         text: "Исправьте все ошибки!",
    //         icon: "error",
    //         timer: 2500,
    //         timerProgressBar: true
    //     });
    //     return;
    // }
    const isValid = await v$.value.$validate();

    if (!isValid) {
        // Собираем все ошибки из Vuelidate
        const errors = [];

        // Проходим по всем полям, где есть ошибки
        for (const [field, validation] of Object.entries(v$.value)) {
        if (validation?.$errors?.length) {
            validation.$errors.forEach((err) => {
            // Добавляем человекопонятное имя поля
            const fieldName = {
                examination_date: "Дата осмотра",
                weight: "Вес",
                height: "Рост",
                body_mass_index: "Индекс массы тела",
                body_temperature: "Температура тела",
                systolic_pressure: "Систолическое давление",
                diastolic_pressure: "Диастолическое давление",
                pulse: "Пульс",
                creatinine: "Креатинин",
                troponin: "Тропонин",
                coronary_insufficiency: "Коронарная недостаточность",
                ami_localization: "Локализация ИМ",
                mi_type: "Тип ИМ",
                myocardium_damage: "Поражение миокарда",
                acs_characteristics: "Характеристика ОКС",
                issue_date: "Дата выдачи",
                anxiety_level: "Уровень тревоги",
                depression_level: "Уровень депрессии",
                complications: "Осложнения",
            }[field] || field;

            // Добавляем сообщение об ошибке
            errors.push(`${fieldName}: ${backendMessageMap?.[err.$message] ?? err.$message}`);
            });
        }
        }

        // Показываем список ошибок в SweetAlert
        Swal.fire({
        title: "Ошибка валидации!",
        html: `
            <div style="text-align: left">
            <ul style="padding-left: 20px; margin: 0;">
                ${errors.map((e) => `<li>${e}</li>`).join("")}
            </ul>
            </div>
        `,
        icon: "error",
        confirmButtonText: "Понятно"
        });

        return;
    }
    try {


        const response = await axiosInstance.post(`/er-cards/${route.params.id}/add_ca_sheet/`, ca_sheets.value);
        if (response.status === 201) {
            const caSheetId = response.data.er_card;

            // Обновляем каждый объект в affected_vessel, добавляя ID ca_sheet
            const updatedAffectedVessels = affected_vessel.value.map(vessel => ({
                ...vessel,
                ca_sheet: caSheetId
            }));

            // Отправляем все объекты за один раз
            for (const vessel of updatedAffectedVessels) {
                await axiosInstance.post('/affected-vessels/', vessel);
            }
            // Обновляем локальный список пораженных сосудов
            affected_vessel.value = updatedAffectedVessels;

            // Очищаем форму и закрываем модальное окно
            affected_vessel_data.value = {
                ca_sheet: null,
                name: null,
                lesion_volume: null,
                index_syntax: null
            };
            isModalVisible.value = false;
            Swal.fire({
                title: "Успешно",
                text: "Данные листа оценки состояния пациента успешно добавлены!",
                icon: "success",
                timer: 2500,
                timerProgressBar: true
            });
            setTimeout(() => {
                router.push(`/ecr/profile-erc/${route.params.id}`)
            }, 2000);

        }
    } catch (e) {
        console.error(e);
    }
}
watch(() => ca_sheets.value.accompanying_pathologies, (newValue) => {
    if (!newValue) {
        ca_sheets.value.accompanying_pathologies_type = null;
    }
});
watch(() => ca_sheets.value.revascularization, (newValue) => {
    if (!newValue) {
        ca_sheets.value.revascularization_type = null;
    }
});


onMounted(async () => {
    await getICD();
});
</script>

<template>

    <BRow>
        <BCol class="col-xl-12">
            <BCard no-body>
                <BCardHeader class="border-0">
                    <span class="text-dark fw-bold fs-5">Данные листа оценки состояния пациента</span>
                </BCardHeader>
                <BCardBody class="checkout-tab">
                    <BForm action="#">
                        <div class="step-arrow-nav mt-n3 mx-n3 mb-3">
                            <BTabs nav-class="nav-pills nav-justified custom-nav" v-model="tabIndex">
                                <BTab active class="nav-item nav-link p-3">
                                    <template #title>
                                        <div class="fs-15">
                                            <span
                                                class="fs-16 avatar-xs d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle align-middle me-2">I</span>
                                            Основные данные
                                        </div>
                                    </template>
                                    <BRow>
                                        <BCol xxl="3" md="6">
                                            <BCard>
                                                <strong class="fs-7">Показатели ЖКФ</strong>
                                                <div class="my-3">
                                                    <label>Дата проведения</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="ri-calendar-event-line"></i></span>
                                                        <flat-pickr placeholder="Выберите дату"
                                                            v-model="ca_sheets.examination_date"
                                                            :config="dateTimeConfig"
                                                            class="form-control flatpickr-input"
                                                            id="caledate"></flat-pickr>

                                                    </div>
                                                    <span class="text-danger" v-if="v$.examination_date.$error">Дата
                                                        проведения обязательна</span>
                                                </div>
                                                <BRow class="mb-4">
                                                    <BCol sm="4">
                                                        <label for="hieght"
                                                            class="form-label fs-10 fw-bold">Рост&ensp;(см)</label>
                                                        <BFormInput v-model="ca_sheets.height" id="hieght"
                                                            :class="{ 'is-invalid': v$.height.$error }" type="number" />
                                                        <span class="text-danger"
                                                            v-if="v$.height.$error">Обязателено</span>
                                                    </BCol>
                                                    <BCol sm="4">
                                                        <label for="weight"
                                                            class="form-label fs-10 fw-bold">Вес&ensp;(кг)</label>
                                                        <BFormInput id="weight" v-model="ca_sheets.weight"
                                                            :class="{ 'is-invalid': v$.weight.$error }" type="number" />
                                                        <span class="text-danger"
                                                            v-if="v$.weight.$error">Обязателено</span>
                                                    </BCol>
                                                    <BCol sm="4">
                                                        <label for="imt"
                                                            class="form-label fs-10 fw-bold">&ensp;ИМТ</label>
                                                        <BFormInput :value="bodyMassIndex" id="bmi" type="number"
                                                            :class="{ 'is-invalid': v$.body_mass_index.$error }"
                                                            disabled />
                                                        <span class="text-danger"
                                                            v-if="v$.body_mass_index.$error">Обязателено</span>
                                                    </BCol>
                                                </BRow>
                                                <BRow class="mb-4">
                                                    <BCol sm="4">
                                                        <label for="temp" class="form-label fs-10 fw-bold">&ensp;Темп.
                                                            (°C)</label>
                                                        <BFormInput type="number" id="temp"
                                                            :class="{ 'is-invalid': v$.body_temperature.$error }"
                                                            v-model="ca_sheets.body_temperature" />
                                                        <span class="text-danger"
                                                            v-if="v$.body_temperature.$error">Обязателено 34°C-44°C</span>
                                                      
                                                    </BCol>
                                                    <BCol sm="8">
                                                        <BRow>
                                                            <label class="form-label fs-10 fw-bold">Ад: сист. /
                                                                диаст.(мм.рт.ст)</label>
                                                            <BCol sm="5">
                                                                <BFormInput v-model="ca_sheets.systolic_pressure"           :class="{ 'is-invalid': v$.systolic_pressure.$error }"
                                                                    type="number" />
                                                      
                                                            </BCol>
                                                            <BCol sm="2">
                                                                <span class="form-control border-0"> /</span>
                                                            </BCol>

                                                            <BCol sm="5">
                                                                <BFormInput type="number"  :class="{ 'is-invalid': v$.diastolic_pressure.$error }"
                                                                    v-model="ca_sheets.diastolic_pressure" />
                                                      
                                                            </BCol>
                                                        </BRow>
                                                        <span class="text-danger"
                                                            v-if="v$.diastolic_pressure.$error || v$.systolic_pressure.$error">Эти поля обязательные</span>
                                                                    
                                                    </BCol>
                                                </BRow>
                                                <BRow class="mb-4">
                                                    <BCol sm="4">
                                                        <label class="form-label fs-10 fw-bold">ЧСС
                                                            (уд./мин.)</label>
                                                        <BFormInput type="number" v-model="ca_sheets.pulse_rate"  :class="{ 'is-invalid': v$.pulse_rate.$error }"/>
                                                        <span class="text-danger"
                                                            v-if="v$.pulse_rate.$error">Обязательно</span>
                                                    </BCol>
                                                    <BCol sm="4">
                                                        <label class="form-label fs-10 fw-bold">ЧДД
                                                            (в.в./мин.)</label>
                                                        <BFormInput type="number"
                                                            v-model="ca_sheets.respiratory_rate" />
                                                            
                                                    </BCol>
                                                    <BCol sm="4">
                                                        <label class="form-label fs-10 fw-bold">SpO2 (%)</label>
                                                        <BFormInput type="number" v-model="ca_sheets.spo2" />
                                                    </BCol>
                                                </BRow>


                                            </BCard>
                                            <BCard>
                                                <label class="form-label fw-bold">БМНМ</label>

                                                <BRow>
                                                    <BCol sm="6">
                                                        <label class="form-label fw-bold">Тропонин I
                                                            <small>(нг/мл)</small></label>
                                                        <BFormInput type="number" v-model="ca_sheets.troponin"  :class="{ 'is-invalid': v$.troponin.$error }"/>
                                                        <span class="text-danger"
                                                            v-if="v$.troponin.$error">Обязательно</span>
                                                    </BCol>
                                                    <BCol sm="6">
                                                        <label class="form-label fw-bold">Креатинин
                                                            <small>(мкмоль/л)</small></label>
                                                        <BFormInput type="number" v-model="ca_sheets.creatinine"   :class="{ 'is-invalid': v$.creatinine.$error }"/>
                                                        <span class="text-danger"
                                                            v-if="v$.creatinine.$error">Обязательно</span>
                                                    </BCol>
                                                </BRow>
                                            </BCard>
                                            <BCard>

                                                <strong class="fs-7 mb-2">Шкала HADS</strong>

                                                <BRow>

                                                    <div class="my-3">
                                                        <label for="range-1" class="form-label fw-bold">Уровень
                                                            тревоги</label>
                                                        <div
                                                            class="d-flex justify-content-between align-items-center text-muted px-2 w-100">

                                                            <span v-for="i in 21" :key="i"
                                                                :class="{ 'text-primary fw-bold': ca_sheets.anxiety_level == i }">
                                                                {{ i }}
                                                            </span>
                                                        </div>
                                                    

                                                        <input class="form-range" v-model="ca_sheets.anxiety_level" :class="{ 'is-invalid': v$.anxiety_level.$error }"
                                                            type="range" min="1" max="21" />
                                                            <span class="text-danger"
                                                            v-if="v$.anxiety_level.$error">Обязательно</span>
                                                    </div>
                                                    <div class="my-3">
                                                        <label for="range-1" class="form-label fw-bold">Уровень
                                                            депрессии</label>
                                                        <div
                                                            class="d-flex justify-content-between align-items-center text-muted px-2 w-100">

                                                            <span v-for="i in 21" :key="i"
                                                                :class="{ 'text-primary fw-bold': ca_sheets.depression_level == i }">
                                                                {{ i }}
                                                            </span>
                                                        </div>

                                                        <input class="form-range" v-model="ca_sheets.depression_level" :class="{ 'is-invalid': v$.depression_level.$error }"
                                                            type="range" min="1" max="21" />
                                                            <span class="text-danger"
                                                            v-if="v$.depression_level.$error">Обязательно</span>
                                                    </div>



                                                </BRow>
                                            </BCard>



                                        </BCol>
                                        <BCol xxl="3" md="6">
                                            <BCard>
                                                <label class="form-label fw-bold">СН</label>
                                                <div class="my-3">
                                                    <label class="form-label fw-bold">Стенокардия</label>
                                                    <BFormSelect v-model="ca_sheets.coronary_insufficiency" :class="{ 'is-invalid': v$.coronary_insufficiency.$error }"
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выберите
                                                            стенокардию
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="1">стенокардия отсутствует
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="2">стенокардия редкая (без
                                                            изменений
                                                            ЭКГ)</BFormSelectOption>
                                                        <BFormSelectOption value="3">стенокардия умеренная (&lt;5
                                                            приступов в
                                                            сутки)</BFormSelectOption>
                                                        <BFormSelectOption value="4">стенокардия умеренная (&gt;5
                                                            приступов в
                                                            сутки)</BFormSelectOption>
                                                    </BFormSelect>
                                                    <span class="text-danger" v-if="v$.coronary_insufficiency.$error">Обязательно</span>
                                                </div>

                                                <div class="my-3">
                                                    <label for="range-1" class="form-label fw-bold">Класс тяжести
                                                        OCH (Killip)</label>
                                                    <div
                                                        class="d-flex justify-content-between align-items-center text-muted px-1">
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 1,
                            }">1</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 2,
                            }">2</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 3,
                            }">3</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 4,
                            }">4</span>
                                                    </div>

                                                    <input class="form-range" v-model="ca_sheets.killip" type="range"
                                                        min="1" max="4" />
                                                </div>
                                                <div class="my-3">
                                                    <label for="range-1" class="form-label fw-bold">Функциональный
                                                        класс по NYHA</label>
                                                    <div
                                                        class="d-flex justify-content-between align-items-center text-muted px-1">
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 1,
                            }">1</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 2,
                            }">2</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 3,
                            }">3</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 4,
                            }">4</span>
                                                    </div>

                                                    <BFormInput id="range-1" class="form-range" v-model="ca_sheets.nyha"
                                                        type="range" min="1" max="4" />
                                                </div>
                                                <div class="my-3">
                                                    <label for="range-1" class="form-label fw-bold">Комплаентность
                                                        по шкале Мориски Грина</label>
                                                    <div
                                                        class="d-flex justify-content-between align-items-center text-muted px-1">
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 1,
                            }">1</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 2,
                            }">2</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 3,
                            }">3</span>
                                                        <span class="text-primary fw-bold" :class="{
                                'text-primary fw-bold': rangeValue == 4,
                            }">4</span>
                                                    </div>

                                                    <BFormInput id="range-1" class="form-range"
                                                        v-model="ca_sheets.morisky_green" type="range" min="1"
                                                        max="4" />
                                                </div>

                                            </BCard>

                                            <BCard>
                                                <label class="form-label fw-bold">ЧКВ</label>

                                                <div class="my-3">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox"
                                                            v-model="ca_sheets.revascularization"
                                                            id="flexCheckDefault" />
                                                        <label class="form-check-label fw-bold"
                                                            for="flexCheckDefault">Реваскуляризация</label>

                                                        <div class="px-3 d-flex" :class="{
                                'opacity-50': !ca_sheets.revascularization,
                            }">
                                                            <div class="form-check me-2">
                                                                <input class="form-check-input" type="radio"
                                                                    :disabled="!ca_sheets.revascularization" :value="1"
                                                                    v-model="ca_sheets.revascularization_type" />
                                                                <label class="form-check-label fw-bold">Полная</label>
                                                            </div>
                                                            <div class="form-check">
                                                                <input class="form-check-input" type="radio"
                                                                    :disabled="!ca_sheets.revascularization" :value="0"
                                                                    v-model="ca_sheets.revascularization_type" />
                                                                <label class="form-check-label fw-bold">Неполная</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="my-3">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox"
                                                            v-model="ca_sheets.stenting" />
                                                        <label class="form-check-label fw-bold">Стентирование</label>
                                                    </div>
                                                </div>

                                                <div class="my-3">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox"
                                                            v-model="ca_sheets.coronary_angiography" />
                                                        <label
                                                            class="form-check-label fw-bold">Коронароангиография</label>
                                                    </div>
                                                </div>
                                                <div class="my-3"
                                                    :class="{ 'text-muted': !ca_sheets.coronary_angiography }">
                                                    <label class="form-label fw-bold">Степень поражения коронарного
                                                        русла:</label>
                                                    <BFormSelect class="mb-3" v-model="ca_sheets.coronary_lesion_degree"
                                                        :disabled="isDisabledCoronary"
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выберите
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="single_vessel">однососудистое
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="two_vessel">двухсосудистое
                                                        </BFormSelectOption>
                                                        <BFormSelectOption value="multivessel">многососудистое
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                </div>
                                                <BCard :class="{ 'text-muted': !ca_sheets.coronary_angiography }">
                                                    <div class="d-flex justify-content-between align-items-center">
                                                        <strong class="fs-7">Пораженные сосуды:</strong>
                                                        <button class="btn btn-sm border-0" @click="showModal('add')"
                                                            :disabled="isDisabledCoronary">
                                                            <i class="ri-add-line border-0 fs-2"></i>
                                                        </button>

                                                        <b-modal v-model="isModalVisible" centered :title="modalTitle"
                                                            hide-footer>
                                                            <form @submit.prevent="handleSubmit">
                                                                <div class="mb-3">
                                                                    <label class="form-label fw-bold">Название:</label>
                                                                    <BFormSelect v-model="affected_vessel_data.name"
                                                                        class="mb-3"
                                                                        aria-label="Default select example">
                                                                        <BFormSelectOption :value="null" selected
                                                                            disabled>Выберите</BFormSelectOption>
                                                                        <BFormSelectOption
                                                                            v-for="(item, key) in coronary_arteries"
                                                                            :key="key" :value="key">
                                                                            {{ item }}
                                                                        </BFormSelectOption>
                                                                    </BFormSelect>
                                                                </div>
                                                                <div class="mb-3">
                                                                    <label class="form-label fw-bold">Объем
                                                                        поражений</label>
                                                                    <input type="number"
                                                                        v-model="affected_vessel_data.lesion_volume"
                                                                        class="form-control" />
                                                                </div>
                                                                <div class="mb-3">
                                                                    <label class="form-label fw-bold">Индекс
                                                                        SYNTAX</label>
                                                                    <input type="number"
                                                                        v-model="affected_vessel_data.index_syntax"
                                                                        class="form-control" />
                                                                </div>
                                                                <div class="d-flex justify-content-between">
                                                                    <button type="button" class="btn btn-secondary"
                                                                        @click="isModalVisible = false">Отмена</button>
                                                                    <button type="submit"
                                                                        class="btn btn-primary">Сохранить</button>
                                                                </div>
                                                            </form>
                                                        </b-modal>
                                                    </div>

                                                    <div class="my-3" v-for="(item, index) in affected_vessel"
                                                        :key="index">
                                                        <div class="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <span class="fw-bold">{{ coronary_arteries[item.name]
                                                                    }}</span>
                                                                <div class="text-muted">Объем поражений: {{
                                item.lesion_volume }} мм</div>
                                                                <div class="text-muted">Индекс SYNTAX: {{
                                item.index_syntax }}</div>
                                                            </div>
                                                            <div
                                                                class="d-flex align-items-center justify-content-around flex-column">
                                                                <li class="list-inline-item edit"
                                                                    @click="editItem(item, index, $event)"
                                                                    data-bs-toggle="tooltip" data-bs-trigger="hover"
                                                                    data-bs-placement="top" title="Edit">
                                                                    <BLink
                                                                        class="text-primary d-inline-block edit-item-btn">
                                                                        <i class="ri-pencil-fill fs-16"></i>
                                                                    </BLink>
                                                                </li>
                                                                <li class="list-inline-item"
                                                                    @click="deleteItem(item, $event)"
                                                                    data-bs-toggle="tooltip" data-bs-trigger="hover"
                                                                    title="Remove">
                                                                    <BLink
                                                                        class="text-danger d-inline-block remove-item-btn">
                                                                        <i class="ri-delete-bin-5-fill fs-16"></i>
                                                                    </BLink>
                                                                </li>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </BCard>

                                            </BCard>
                                        </BCol>
                                        <BCol xxl="3" md="6">
                                            <BCard>
                                                <strong class="fs-7">ИМ</strong>
                                                <div class="my-3">
                                                    <label class="form-label fw-bold">Дата перенесенного ИМ</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="ri-calendar-event-line"></i></span>
                                                        <flat-pickr placeholder="Выберите дату"
                                                            v-model="ca_sheets.ami_date" :config="dateTimeConfig"
                                                            class="form-control flatpickr-input"
                                                            id="caledate"></flat-pickr>
                                                    </div>
                                                </div>
                                                <div class="my-3">
                                                    <label class="form-label fw-bold">Локализация</label>

                                                    <BFormSelect v-model="ca_sheets.ami_localization" :class="{ 'is-invalid': v$.ami_localization.$error }"
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выберите тип
                                                            локализации</BFormSelectOption>
                                                        <BFormSelectOption v-for="(value, key) in localization"
                                                            :key="key" :value="key">{{ value }}
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                    <span class="text-danger" v-if="v$.ami_localization.$error">Обязательно</span>
                                                </div>
                                                <div class="my-3">
                                                    <label class="form-label fw-bold">Тип</label>

                                                    <BFormSelect v-model="ca_sheets.mi_type" :class="{ 'is-invalid': v$.mi_type.$error }"
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выберите тип ИМ
                                                        </BFormSelectOption>
                                                        <BFormSelectOption v-for="(value, key) in Types" :key="key"
                                                            :value="key">{{ value }}
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                    <span class="text-danger" v-if="v$.mi_type.$error">Обязательно</span>
                                                </div>
                                                <div class="my-3">
                                                    <label class="form-label fw-bold">Глубины и обширность
                                                        поражения</label>
                                                    <BFormSelect :class="{ 'is-invalid': v$.myocardium_damage.$error }" v-model="ca_sheets.myocardium_damage" 
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выбрать
                                                        </BFormSelectOption>
                                                        <BFormSelectOption v-for="(item, key) in DeepVastness"
                                                            :key="key" :value="key">{{ item }}
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                    <span class="text-danger" v-if="v$.myocardium_damage.$error">Обязательно</span>
                                                </div>
                                                <div class="my-3">
                                                    <label class="form-label fw-bold">Характеристика</label>
                                                    <BFormSelect v-model="ca_sheets.acs_characteristics" :class="{ 'is-invalid': v$.acs_characteristics.$error }"  
                                                        aria-label="Default select example">
                                                        <BFormSelectOption :value="null" disabled>Выбрать
                                                        </BFormSelectOption>
                                                        <BFormSelectOption v-for="(item, key) in OKS" :key="key"
                                                            :value="key">{{ item }}
                                                        </BFormSelectOption>
                                                    </BFormSelect>
                                                    <span class="text-danger" v-if="v$.acs_characteristics.$error">Обязательно</span>
                                                </div>

                                                <div class="my-3">
                                                    <div class="d-flex justify-content-between mb-4">
                                                        <strong class="fs-7 mb-2">Зубец Q</strong>

                                                        <BFormGroup>
                                                            <BFormCheckbox switch flex v-model="ca_sheets.q_wave">
                                                            </BFormCheckbox>
                                                        </BFormGroup>
                                                    </div>

                                                </div>
                                            </BCard>
                                            <BCard>
                                                <strong class="fs-7">ЭКГ</strong>
                                                <BRow>
                                                    <div class="d-flex justify-content-between mb-4">
                                                        <strong class="fs-7 mb-2">Отклонение сегмента ST</strong>

                                                        <BFormGroup>
                                                            <BFormCheckbox switch flex
                                                                v-model="ca_sheets.st_segment_elevation">
                                                            </BFormCheckbox>
                                                        </BFormGroup>
                                                    </div>
                                                    <div class="d-flex justify-content-between mb-4">
                                                        <strong class="fs-7 mb-2">Инверсия зубца T</strong>

                                                        <BFormGroup>
                                                            <BFormCheckbox switch flex
                                                                v-model="ca_sheets.t_wave_inversion">
                                                            </BFormCheckbox>
                                                        </BFormGroup>
                                                    </div>
                                                    <div class="d-flex justify-content-between mb-4">
                                                        <strong class="fs-7 mb-2">Влажные пузырчатые хрипы в
                                                            легких</strong>

                                                        <BFormGroup>
                                                            <BFormCheckbox switch flex v-model="ca_sheets.moist_rales">
                                                            </BFormCheckbox>
                                                        </BFormGroup>
                                                    </div>
                                                    <div class="d-flex justify-content-between mb-4">
                                                        <strong class="fs-7 mb-2">Откети нижних конечностей</strong>

                                                        <BFormGroup>
                                                            <BFormCheckbox switch flex
                                                                v-model="ca_sheets.lower_limb_edema">
                                                            </BFormCheckbox>
                                                        </BFormGroup>
                                                    </div>

                                                </BRow>

                                            </BCard>



                                        </BCol>
                                        <BCol xxl="3" md="6">
                                            <BCard>
                                                <label class="form-label fw-bold">Диагноз</label>
                                                <div class="my-3">
                                                    <label class="form-label fw-bold">Дата постановки</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text"><i
                                                                class="ri-calendar-event-line"></i></span>
                                                        <flat-pickr placeholder="Выберите дату"
                                                            v-model="ca_sheets.issue_date" :config="dateTimeConfig"
                                                            class="form-control flatpickr-input"
                                                            id="caledate"></flat-pickr>
                                                         
                                                    </div>
                                                    <span class="text-danger" v-if="v$.issue_date.$error">Обязательно</span>
                                                </div>
                                                <div class="my-3">
                                                    <label class="form-label fw-bold">Основное заболевание
                                                    </label>

                                                    <BFormSelect aria-label="Default select example"
                                                        v-model="ca_sheets.primary_disease" class="mb-3">
                                                        <BFormSelectOption :value="null" disabled>Выберите
                                                        </BFormSelectOption>
                                                        <BFormSelectOption v-for="(item, index) in icd" :key="index"
                                                            :value="item.id">{{ item.code }}&ensp;
                                                            {{ item.title }}</BFormSelectOption>
                                                    </BFormSelect>
                                                </div>

                                                <div class="my-3">
                                                    <div class="d-flex justify-content-start mb-1">
                                                        <strong class="fs-7 mb-2">Сопутствующие патологии</strong>

                                                        <BFormGroup class="form-check-right">
                                                            <BFormCheckbox switch flex
                                                                v-model="ca_sheets.accompanying_pathologies">
                                                            </BFormCheckbox>
                                                        </BFormGroup>
                                                    </div>

                                                    <div>
                                                        <BFormSelect class="mb-3"
                                                            :disabled="!ca_sheets.accompanying_pathologies"
                                                            v-model="ca_sheets.accompanying_pathologies_type"
                                                            aria-label="Default select example">
                                                            <BFormSelectOption :value="null" disabled>Выберите
                                                            </BFormSelectOption>
                                                            <BFormSelectOption v-for="(item, index) in icd" :key="index"
                                                                :value="item.id">{{ item.code
                                                                }}&ensp;
                                                                {{ item.title }}</BFormSelectOption>
                                                        </BFormSelect>
                                                    </div>
                                         
                                                </div>
                                            </BCard>
                                            <BCard>
                                                <label class="form-label fw-bold">Осложнения</label>
                                                <p class="text-danger" v-if="v$.complications.$error">Осложнения не выбраны</p>
                                                <div class="my-3">
                                                    <label>Осложнения I группы</label>
                                                    <Multiselect v-model="complication1" mode="multiple"
                                                        placeholder="не выбрано" :close-on-select="false"
                                                        :options="formattedComplicationsGroup1"
                                                        :disabled="isDisabled(1)">
                                                        <template v-slot:multiplelabel="{ values }">
                                                            <div class="multiselect-multiple-label">
                                                                выбрано: {{ values.length }}
                                                            </div>
                                                        </template>
                                                        <template #option="props">
                                                            <div class="option__desc">
                                                                <span class="option__title">{{
                                props.option.name
                            }}</span>
                                                            </div>
                                                        </template>
                                                    </Multiselect>
                                                </div>
                                                <div class="my-3">
                                                    <label>Осложнения II группы</label>
                                                    <Multiselect v-model="complication2" mode="multiple"
                                                        placeholder="не выбрано" :close-on-select="false"
                                                        :options="formattedComplicationsGroup2"
                                                        :disabled="isDisabled(2)">
                                                        <template v-slot:multiplelabel="{ values }">
                                                            <div class="multiselect-multiple-label">
                                                                выбрано: {{ values.length }}
                                                            </div>
                                                        </template>
                                                        <template #option="props">
                                                            <div class="option__desc">
                                                                <span class="option__title">{{
                                props.option.name
                            }}</span>
                                                            </div>
                                                        </template>
                                                    </Multiselect>

                                                </div>
                                                <div class="my-3">
                                                    <label>Осложнения III группы</label>
                                                    <Multiselect v-model="complication3" mode="multiple"
                                                        class="bg-primary" placeholder="не выбрано"
                                                        :close-on-select="false" :options="formattedComplicationsGroup3"
                                                        :disabled="isDisabled(3)">
                                                        <template v-slot:multiplelabel="{ values }">
                                                            <div class="multiselect-multiple-label">
                                                                выбрано: {{ values.length }}
                                                            </div>
                                                        </template>
                                                        <template #option="props">
                                                            <div class="option__desc">
                                                                <span class="option__title">{{
                                                                    props.option.name
                                                                    }}</span>
                                                            </div>
                                                        </template>
                                                    </Multiselect>
                                                </div>
                                            </BCard>
                                        </BCol>
                                    </BRow>
                                </BTab>
                                <BTab class="nav-item nav-link fs-15 p-3">
                                    <template #title>
                                        <div class="fs-15">
                                            <span
                                                class="fs-16 avatar-xs d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle align-middle me-2">II</span>
                                            Этап
                                        </div>
                                    </template>
                                    <BRow>
                                        <BCol sm="3"> </BCol>

                                        <BCol sm="3"> </BCol>

                                        <BCol sm="3"> </BCol>
                                    </BRow>
                                </BTab>
                            </BTabs>
                        </div>
                    </BForm>
                </BCardBody>
                <div class="d-flex justify-content-end align-items-center gap-3 p-3">
                    <router-link :to='`/ecr/profile-erc/${route.params.id}`'>
                        <button type="button" class="btn btn-danger ">
                            Назад
                        </button>
                    </router-link>
                    <button class="btn btn-primary" @click="onHandlesubmit">Создать</button>
                </div>

            </BCard>
        </BCol>

    </BRow>

</template>

<style lang="scss">
@import "@vueform/slider/themes/default.css";

.slider-base .slider-connect {
    background-color: #405189 !important;
}

.slider-connect {
    background: #405189 !important;
    cursor: pointer;
}

.slider-base .slider-handle {
    background-color: #405189 !important;
    border: 1px solid #fff;
    box-shadow: none;
}

.slider-base .slider-tooltip {
    border-color: #405189;
    background: #405189;
    font-size: 11px;
}

.slider-tooltip {
    background: #405189;
    border: 1px solid #405189;
}

.text-size {
    font-size: 12px;
}

.multiselect.is-disabled {
    background: var(--ms-bg-disabled, #eff2f7) !important;
}

.custom-nav {
    display: none
}
</style>
<style src="@vueform/multiselect/themes/default.css"></style>
