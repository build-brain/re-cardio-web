<script setup>
import Swal from "sweetalert2";
import { useRoute } from 'vue-router';
import { axiosInstance } from "../../../../axios";
import { onMounted, ref, watchEffect } from "vue";
import formatDate from '@/common/formatDate.js';
import Types from '@/common/Types.js';
import pageHeader from "@/components/page-header.vue";
const patient = ref([]);
const admission_data = ref({});
const patients_profile = ref({});
const activities = ref([]);
const events = ref([]);
const fieldsactivities = [
    { key: 'activity_stage', label: 'Ступень' },
    { key: 'start_date', label: 'Начало' },
    { key: 'end_date', label: 'Завершение' }
];
const fieldsaevents = [
    { key: 'start_date', label: 'Начало' },
    { key: 'end_date', label: 'Завершение' },
    { key: 'title', label: 'Название события' },
];


const ECR = ref({});
const primilitary_diagnosis = ref({});

const route = useRoute();
const activeInterval = ref('1d');
const activeIntervalP = ref('1d');
const chekpoint = ref([]);



const arterial_statistic = ref([]);
const art_series = ref([]);

const pulse_rate = ref([]);
const pulse_series = ref([]);

const fieldschekpoint = [
    { key: 'index', label: '№' },
    { key: 'record_summary', label: 'Запись' },
    { key: 'description', label: 'Описание' },
];

const generateRecordSummary = (record) => {
    const events = [];

    if (record.fatal_outcome) events.push('Летальный исход');
    if (record.rehospitalization) events.push('Повторная госпитализация');
    if (record.increased_angina) events.push('Нарастание стенокардии');
    if (record.nonfatal_myocardial_infarction) events.push('Нефатальный инфаркт миокарда');
    if (record.acute_cerebrovascular_accident) events.push('Острое нарушение мозгового кровообращения');
    if (record.bleeding) events.push(`Кровотечение (BARC: ${record.barc_classifier || 'N/A'})`);
    if (record.diabetes_decompensation) events.push('Декомпенсация диабета');
    if (record.repeat_pci_need) events.push('Потребность в повторном ЧКВ');
    if (record.cabg_need) events.push('Потребность в АКШ');

    return events.join(', ') + ` | Шкала ШОКС: ${record.cas_score}, ФК: ${record.cas_class || 'N/A'}`;
};
watchEffect(() => {
    const pulse = pulse_rate.value.map(item => ({
        x: item.x,
        y: item.y1,
        pulse_on_exertion: item.y2
    }));

    pulse_series.value = [
        {
            name: 'Пульс',
            data: pulse,
        }
    ];
});

const translatePulseOnExertion = (type) => {
    const types = {
        'recommended_limits': 'в рекомендуемых пределах',
        'brief_exceeding': 'кратковременное превышение',
        'prolonged_exceeding': 'длительное превышение'
    };
    return types[type] || type;
};


watchEffect(() => {

    const systolicData = arterial_statistic.value.map(item => ({
        x: item.x,
        y: item.y1,
    }));

    const diastolicData = arterial_statistic.value.map(item => ({
        x: item.x,
        y: item.y2,
    }));
    art_series.value = [
        {
            name: 'Систолическое',
            data: systolicData,
        },
        {
            name: 'Диастолическое',
            data: diastolicData,
        },
    ];
});
const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const chartOptionsArterial = ref({
    chart: {
        type: 'scatter',
        height: 200,
        stacked: false,
        toolbar: {
            show: false,
        },
        zoom: {
            enabled: true,
        },
    },

    responsive: [
        {
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom',
                    offsetX: -10,
                    offsetY: 0,
                },
            },
        },
    ],
    plotOptions: {
        bar: {
            horizontal: false,
            borderRadius: 0,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        curve: 'straight',
    },
    xaxis: {
        type: 'datetime',
        labels: {
            formatter: function (value, timestamp) {
                const date = new Date(timestamp);
                return monthNames[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
            }
        }
    },
    legend: {
        position: 'bottom',
        offsetX: 40,
    },
    fill: {
        opacity: 1,
    },

    colors: ['#22BAA6', '#E91E63'],
    tooltip: {
        shared: true,
        intersect: false,
        x: {
            format: 'dd MMM yyyy'
        },
    },
});
const chartOptionsPulseRate = ref({
    chart: {
        type: 'line',
        height: 200,
        stacked: false,
        toolbar: {
            show: false,
        },
        zoom: {
            enabled: true,
        },
    },
    responsive: [
        {
            breakpoint: 480,
            options: {
                legend: {
                    position: 'bottom',
                    offsetX: -10,
                    offsetY: 0,
                },
            },
        },
    ],
    plotOptions: {
        bar: {
            horizontal: false,
            borderRadius: 0,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        curve: 'smooth', // Убедитесь, что используется значение 'smooth' для кривизны линии
    },
    markers: {
        size: 7, // Размер точек
        colors: ['#FFA500'], // Цвет точек
        strokeColors: '#FFA500', // Цвет обводки точек
        strokeWidth: 2, // Ширина обводки точек
        hover: {
            size: 6, // Размер точек при наведении
        }
    },
    xaxis: {
        type: 'datetime',
        labels: {
            formatter: function (value, timestamp) {
                const date = new Date(timestamp);
                return monthNames[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
            }
        }
    },
    legend: {
        position: 'bottom',
        offsetX: 40,
    },
    fill: {
        opacity: 1,
    },
    colors: ['#FFA500', '#E91E63'],
    tooltip: {
        shared: true,
        intersect: false,
        y: {
            formatter: function (val, { seriesIndex, dataPointIndex, w }) {
                const pulseOnExertion = translatePulseOnExertion(w.config.series[seriesIndex].data[dataPointIndex].pulse_on_exertion);
                return `${val} | Тип пульса: ${pulseOnExertion}`;
            }
        }
    }
});

const getStratisticActivity = async () => {
    try {
        const response = await axiosInstance.get(`/health-diary-records/get_arterial_pressure_statistic/?by_er_card=${route.params.id}`);
        const get_pulse = await axiosInstance.get(`/health-diary-records/get_pulse_rate_statistic/?by_er_card=${route.params.id}`);
        if (response.status === 200) {
            arterial_statistic.value = response.data.filter(item => item.y1 !== null);
            console.log(arterial_statistic.value);
            pulse_rate.value = get_pulse.data.filter(item => item.y1 !== null && item.y2 !== null);

        }
    } catch (error) {
        console.error(error);
    }
};
const getPaginate = async (paginate) => {
    try {
        const response = await axiosInstance.get(`/health-diary-records/get_arterial_pressure_statistic/?time_range=${paginate}&by_er_card=${route.params.id}`);
        if (response.status === 200) {

            rawData.value = response.data;
        }
    } catch (error) {
        console.error(error);
    }
}
const getPaginatePulserate = async (paginate) => {
    activeIntervalP.value = paginate;
    try {
        const response = await axiosInstance.get(`/health-diary-records/get_pulse_rate_statistic/?time_range=${paginate}&by_er_card=${route.params.id}`);
        if (response.status === 200) {

            rawData.value = response.data;
        }
    } catch (error) {
        console.error(error);
    }
}



const getPatientProfile = async () => {
    try {
        const response = await axiosInstance.get(`/er-cards/${route.params.id}/`);
        if (response.status === 200) {
            patient.value = response.data;
            admission_data.value = patient.value.admission_data;
            ECR.value = response.data.ca_sheet;
            patients_profile.value = response.data.patient;
            activities.value = response.data.activities;
            events.value = response.data.events;
            primilitary_diagnosis.value = patient.value.admission_data.preliminary_diagnosis;
            chekpoint.value = response.data.checkpoint_records;


        }
    } catch (error) {
        console.error(error);
    }
};

const deleteServerFile = async (id) => {
    try {
        const response = await axiosInstance.delete(`/medical-records/${id}/`);
        if (response.status === 204) {
            patient.value.records = patient.value.records.filter(
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

const expandedRows = ref([]);

const toggleExpansion = (index) => {
    if (expandedRows.value.includes(index)) {
        expandedRows.value = expandedRows.value.filter(i => i !== index);
    } else {
        expandedRows.value.push(index);
    }
};

const isExpanded = (index) => {
    return expandedRows.value.includes(index);
};

const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.slice(0, maxLength) : text;
};

const isTruncated = (text, maxLength) => {
    return text.length > maxLength;
};

const setInterval = async (interval) => {
    activeInterval.value = interval;
    switch (interval) {
        case '1d':
            await getPaginate('1d');
            break;
        case '1w':
            await getPaginate('1w');
            break;
        case '1m':
            await getPaginate('1m');
            break;
        case '6m':
            await getPaginate('6m');
            break;
        case '1y':
            await getPaginate('1y');
            break;

        default: '1d';
            await getPaginate('1d');
            break;
    }
};

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
            return 'file-ppt-fill';
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
const filteredResults = ref([]);
const getRecepts = async () => {
    try {
        const response = await axiosInstance.get(`/prescriptions/?limit=5&ordering=created_at&er_card=${route.params.id}`);
        if (response.status === 200) {
            filteredResults.value = response.data.results.filter(item => item.medicines.length > 0);
        }
    } catch (e) {
        console.error(e);
    }
};
const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

onMounted(async () => {
    await getPatientProfile();
    await getStratisticActivity();
    await getRecepts();

});

</script>

<template>
    <pageHeader title="Архив ЭКР" />

    <BRow>

        <BCol lg="4">
            <BCard no-body>
                <BCardBody class="p-4 text-start">
                    <BRow class="flex-column flex-sm-row">
                        <BCol sm="12">
                            <div class="d-flex justify-content-center flex-column align-items-center">
                                <div class="mb-3">

                                    <BAvatar :src="patients_profile.avatar" rounded="circle" size="6rem"
                                        class="bg-light" />
                                </div>
                                <h5 class="card-title mb-1 text-muted">{{ $t('profile-patient.patient') }}</h5>
                            </div>
                        </BCol>

                        <BCol sm="12">
                            <div class="text-start card-text ">
                                <div class="d-flex justify-content-between mb-1">
                                    <strong>{{ $t('profile-patient.name') }}:</strong> {{ patients_profile.first_name
                                    }}<br />
                                </div>
                                <div class="d-flex justify-content-between mb-1">
                                    <strong>{{ $t('profile-patient.surname') }}:</strong> {{ patients_profile.last_name
                                    }}<br />
                                </div>

                                <div class="d-flex justify-content-between mb-1">
                                    <strong>{{ $t('profile-patient.middle_name') }}:</strong> {{
                                        patients_profile.middle_name }} <br />
                                </div>
                                <div class="d-flex justify-content-between mb-1">
                                    <strong>{{ $t('profile-patient.birth_date') }}:</strong> {{
                                        patients_profile.birth_date }}<br />
                                </div>
                                <div class="d-flex justify-content-between mb-1">
                                    <strong>{{ $t('profile-patient.register') }}</strong> {{
                                        formatDate(patients_profile.created_at)
                                    }}<br />
                                </div>

                            </div>

                        </BCol>
                    </BRow>
                </BCardBody>
            </BCard>

            <BCard>
                <BCardHeader class="d-flex justify-content-between p-0 mb-2">
                    <h2 class="fs-4">{{ $t('data-ercard.title') }}</h2>
                </BCardHeader>

                <div class="mb-2 d-flex justify-content-between align-items-center">
                    <strong>{{ $t('data-ercard.status') }}:</strong>
                    <span class="text-muted">{{ patient.is_active ? 'Активная' : 'Архивная' }}</span>
                </div>
                <div class="mb-2 d-flex justify-content-between align-items-center">
                    <strong>{{ $t('data-ercard.created_by') }}:</strong>
                    <span class="text-muted">{{ formatDate(patient.created_at) }}</span>
                </div>
                <div class="mb-2 d-flex justify-content-between align-items-center">
                    <strong>{{ $t('data-ercard.updated_by') }}:</strong>
                    <span class="text-muted">{{ formatDate(patient.updated_at) }}</span>
                </div>

            </BCard>
            <BCard>
                <BCardHeader class="d-flex justify-content-between p-0 mb-2">
                    <h2 class="fs-4">Данные при госпитализации</h2>
                </BCardHeader>
                <div class="col-12">
                    <div v-if="admission_data !== null" class="d-flex flex-column">
                        <div class="d-flex justify-content-between mb-1">
                            <div class="fw-bold pe-2">Дата госпитализации:</div>
                            <div class="text-muted">{{ admission_data.hospitalization_date }}</div>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <div class="fw-bold pe-2">Тип госпитализации:</div>
                            <div class="text-muted">
                                <span v-if="admission_data.hospitalization_type === 'planned'">плановая</span>
                                <span v-if="admission_data.hospitalization_type === 'urgent'">неотложная</span>
                                <span v-if="admission_data.hospitalization_type === 'emergency'">экстренная</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <div class="fw-bold pe-2">Дата создания:</div>
                            <div class="text-muted">{{ formatDate(admission_data.admission_date) }}</div>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <div class="fw-bold pe-2">Состояние при поступлении:</div>
                            <div class="text-muted">
                                <span v-if="admission_data.patient_condition === 'moderate'">средней тяжести</span>
                                <span v-if="admission_data.patient_condition === 'severe'">тяжёлое</span>
                                <span v-if="admission_data.patient_condition === 'extremely_severe'">крайне
                                    тяжёлое</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <div class="fw-bold pe-2">Предварительный диагноз:</div>
                            <div class="text-muted flex-grow-1 text-end">
                                <span v-if="primilitary_diagnosis !== null">
                                    {{ primilitary_diagnosis.code }} {{ primilitary_diagnosis.title }}
                                </span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between mb-1">
                            <div class="fw-bold pe-2">Предварительный диагноз выставлен:</div>
                            <div class="text-muted flex-grow-1 text-end">
                                <span v-if="admission_data.diagnosed_by === 'ambulance_brigade'">бригада СМП</span>
                                <span v-if="admission_data.diagnosed_by === 'reception_department'">приёмное отделение
                                    ЛПУ</span>
                                <span v-if="admission_data.diagnosed_by === 'inpatient_facility'">стационарное отделение
                                    ЛПУ</span>
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
            </BCard>





            <BCard>
                <BCardHeader class="d-flex justify-content-between p-0 mb-2">
                    <h2 class="fs-4">{{ $t('health_data.title') }}</h2>
                </BCardHeader>

                <div class="col-12" v-if="ECR !== null">
                    <BRow class="mb-3">
                        <BCol cols="6" sm="4">
                            <div class="d-flex flex-column ">
                                <strong class="text-primary size-profile"><i class="ri-ruler-line"></i>&ensp;{{
                                        $t('health_data.height') }}</strong>
                                <h1 class="text-success">{{ ECR.height }}</h1>
                            </div>
                        </BCol>
                        <BCol cols="6" sm="4">
                            <div class="d-flex flex-column">
                                <strong class="text-primary size-profile"><i class="ri-scales-2-fill"></i>&ensp;{{
                                        $t('health_data.weight') }}</strong>
                                <h1 class="text-success">{{ ECR.weight }}</h1>
                            </div>
                        </BCol>
                        <BCol cols="6" sm="4">
                            <div class="d-flex flex-column">
                                <strong class="text-primary size-profile"><i class="ri-scales-2-fill"></i>&ensp;{{
                                        $t('health_data.pulse') }}</strong>
                                <h1 class="text-success">{{ ECR.body_mass_index }}</h1>
                            </div>
                        </BCol>

                    </BRow>
                    <BRow class="mb-3">
                        <BCol cols="12" sm="4">
                            <div class="d-flex w-100">
                                <div class="d-flex flex-column">
                                    <strong class="text-primary size-profile"><i
                                            class="ri-stethoscope-line"></i>&ensp;{{ $t('health_data.chss') }}</strong>
                                    <div class="d-flex justify-content-evenly">
                                        <h1 class="text-success">{{ ECR.systolic_pressure }}</h1>
                                        <h6 class="text-success">/</h6>
                                        <h1 class="text-success">{{ ECR.diastolic_pressure }}</h1>
                                    </div>
                                </div>
                            </div>
                        </BCol>
                        <BCol cols="6" sm="4">
                            <div class="d-flex flex-column">
                                <strong class="text-primary size-profile"><i class="ri-heart-pulse-fill"></i>&ensp;ЧСС,
                                    уд/мин</strong>
                                <h1 class="text-success">{{ ECR.pulse_rate }}</h1>
                            </div>
                        </BCol>
                        <BCol cols="6" sm="4">
                            <div class="d-flex flex-column">
                                <strong class="text-primary size-profile"><i class="ri-windy-fill"></i>&ensp;ЧДД,
                                    в.в./мин</strong>
                                <h1 class="text-success">{{ ECR.respiratory_rate }}</h1>
                            </div>
                        </BCol>

                    </BRow>
                    <BRow class="mb-3">
                        <BCol cols="6" sm="4">
                            <div class="d-flex flex-column">
                                <strong class="text-primary size-profile"><i class="ri-temp-cold-fill"></i>&ensp;{{
                                        $t('health_data.temperature') }}</strong>
                                <h1 class="text-success">{{ ECR.body_temperature }}</h1>
                            </div>
                        </BCol>
                        <BCol cols="12" sm="4">
                            <div class="d-flex flex-column">
                                <strong class="text-primary size-profile">
                                    <img width="15" height="15" src="/oxygen-svgrepo-com.svg">&ensp;{{
                                        $t('health_data.spo2') }}
                                </strong>
                                <h1 class="text-success"> {{ ECR.spo2 }} %</h1>
                            </div>
                        </BCol>
                        <BCol cols="6" sm="4">
                            <div class="d-flex flex-column">
                                <strong class="text-primary size-profile"><i
                                        class="ri-emotion-sad-fill"></i>&ensp;HADS</strong>
                                <h1 class="text-success">{{ ECR.anxiety_level }}/{{ ECR.depression_level }}</h1>
                            </div>
                        </BCol>
                    </BRow>
                </div>
                <div class="border border-2 border-dashed" style="height: 20rem" v-else>
                    <div class="d-flex justify-content-center align-items-center flex-column h-100">
                        <h5 class="text-muted">
                            Нет данных
                        </h5>
                    </div>
                </div>
            </BCard>

            <BCard>
                <BCardHeader class="d-flex justify-content-between p-0 mb-2">
                    <h2 class="fs-4">Двигательная активность</h2>
                    <router-link :to='`/archive-ecr/profile-erc/${route.params.id}/activities`'>
                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                            <i class="ri-eye-fill text-primary align-bottom me-1"></i>
                            <span class="text-primary fw-bold text-opacity-100">Просмотр</span>
                        </button>
                    </router-link>
                </BCardHeader>
                <div style="max-height: 300px; min-height:300px; overflow-y: scroll;">
                    <b-table :items="activities" :fields="fieldsactivities" responsive="sm"></b-table>
                </div>
            </BCard>
            <BCard>
                <BCardHeader class="d-flex justify-content-between p-0 mb-2">
                    <h2 class="fs-4">Календарь мероприятий</h2>
                    <router-link :to='`/archive-ecr/profile-erc/${route.params.id}/events`'>
                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                            <i class="ri-eye-fill text-primary align-bottom me-1"></i>
                            <span class="text-primary fw-bold text-opacity-100">Просмотр</span>
                        </button>
                    </router-link>
                </BCardHeader>
                <div style="max-height: 300px; min-height:300px; overflow-y: scroll;">
                    <b-table :items="events" :fields="fieldsaevents" responsive="sm">
                        <template #cell(start_date)="data">
                            {{ formatDate(data.item.start_date) }}
                        </template>
                        <template #cell(end_date)="data">
                            {{ formatDate(data.item.end_date) }}
                        </template>
                        <template #cell(title)="data">
                            <span @click="toggleExpansion(data.index)" style="cursor: pointer;">
                                {{ isExpanded(data.index) ? data.item.title : truncateText(data.item.title, 20) }}
                                <span v-if="!isExpanded(data.index) && isTruncated(data.item.title, 20)">...</span>
                            </span>
                        </template>
                    </b-table>
                </div>
            </BCard>



        </BCol>
        <BCol lg="8">

            <BRow>
                <BCol sm="12">
                    <BCard>
                        <BCardHeader class="d-flex justify-content-between p-0 mb-2">
                            <h3>Лист оценки состояния пациента</h3>

                        </BCardHeader>


                        <div class="border border-2 border-dashed" style="height: 20rem" v-if="ECR === null">
                            <div class="d-flex justify-content-center align-items-center flex-column h-100">

                                <h5 class="text-muted">
                                    Нет данных
                                </h5>

                            </div>
                        </div>
                        <BRow v-else>
                            <BCol sm="4">
                                <div>
                                    <small class="mb-1 text-primary fw-bold">Диагноз:</small>
                                    <div class="text-muted my-2">
                                        {{ ECR.primary_disease }}
                                    </div>

                                    <small class="mb-1 text-primary fw-bold">Характеристики ОИМ:</small>
                                    <ul class="text-muted my-2 list-group list-unstyled">
                                        <div v-for="(description, typeKey) in Types" :key="typeKey">
                                            <li v-if="ECR.mi_type === typeKey">
                                                <i class="ri-subtract-line"></i>{{ description }}
                                            </li>
                                        </div>

                                        <li v-if="ECR.myocardium_damage === 1"> <i
                                                class="ri-subtract-line"></i>мелкоочаговый
                                        </li>
                                        <li v-if="ECR.myocardium_damage === 2"> <i
                                                class="ri-subtract-line"></i>крупноочаговый
                                        </li>
                                        <li v-if="ECR.myocardium_damage === 3"> <i
                                                class="ri-subtract-line"></i>трансмуральный
                                            или циркулярный
                                            субэндокардиальный</li>

                                        <li v-if="ECR.acs_characteristics === 'unstable_angina'"><i
                                                class="ri-subtract-line"></i>Нестабильная стенокардия</li>
                                        <li v-if="ECR.acs_characteristics === 'mi_without_st'"><i
                                                class="ri-subtract-line"></i>ИМ без подъема сегмента ST (ИМбST)</li>
                                        <li v-if="ECR.acs_characteristics === 'mi_with_st'"><i
                                                class="ri-subtract-line"></i>ИМ с
                                            элевацией сегмента ST (ИМсST)</li>
                                        <li v-if="ECR.acs_characteristics === 'mi_without_q_wave'"><i
                                                class="ri-subtract-line"></i>ИМ без зубца Q</li>
                                        <li v-if="ECR.acs_characteristics === 'mi_with_q_wave'"><i
                                                class="ri-subtract-line"></i>ИМ с зубцом Q</li>



                                        <li v-if="ECR.q_wave === true"><i class="ri-subtract-line"></i>с зубцом Q</li>

                                        <li v-if="ECR.q_wave === false"><i class="ri-subtract-line"></i>без зубца Q</li>
                                    </ul>
                                    <small class="mb-1 text-primary fw-bold">Стенокардия:</small>
                                    <div class="text-muted my-2">
                                        стенокардия редкая (без изменений ЭКГ)
                                    </div>


                                </div>
                            </BCol>
                            <BCol sm="4">
                                <div class="d-flex justify-content-between my-2">

                                    <div class="d-flex flex-column justify-content-center">
                                        <small class="fs-6 text-primary">Класс ОИМ</small>
                                        <small class="fs-5 text-primary fw-bold">KILLIP</small>
                                    </div>
                                    <div class="rounded-3 bg-success d-flex justify-content-center align-items-center"
                                        style="width: 35px; height: 35px;">
                                        <span class="text-white fw-bold fs-4">{{ ECR.killip }}</span>
                                    </div>


                                </div>
                                <div class="d-flex justify-content-between align-items-center my-2">

                                    <div class="d-flex flex-column justify-content-center">
                                        <small class="fs-6 text-primary">Класс по</small>
                                        <small class="fs-5 text-primary fw-bold">NYHA</small>
                                    </div>
                                    <div class="rounded-3 bg-success d-flex justify-content-center align-items-center"
                                        style="width: 35px; height: 35px;">
                                        <span class="text-white fw-bold fs-4">{{ ECR.nyha }}</span>
                                    </div>

                                </div>


                                <div class="d-flex justify-content-between my-3">
                                    <div class="d-flex flex-column">
                                        <span class="text-primary fs-6 p-0 m-0">Комплаетность</span>
                                        <span class="text-primary fw-bold fs-4">MMAS-4</span>
                                    </div>

                                    <div class="rounded-3 bg-success d-flex justify-content-center align-items-center"
                                        style="width: 35px; height: 35px;">
                                        <span class="text-white fw-bold fs-4">{{ ECR.morisky_green }}</span>
                                    </div>


                                </div>
                                <small class="mb-1 text-primary fw-bold">Осложнения:</small>
                                <div class="text-muted my-2">
                                    2 группа осложнений
                                </div>

                            </BCol>

                            <BCol sm="4">

                                <div class="d-flex flex-wrap justify-content-between my-3">
                                    <div class="d-flex flex-column">
                                        <span class="text-primary fs-6 p-0 m-0">Риск по</span>
                                        <span class="text-primary fw-bold fs-4">GRACE</span>
                                    </div>

                                    <div
                                        class="rounded-3 bg-success d-flex flex-wrap justify-content-center align-items-center">
                                        <span class="text-white fw-bold px-4 fs-3">{{ ECR.grace_score }}</span>
                                    </div>

                                    <div
                                        class="rounded-3 bg-warning d-flex justify-content-center align-items-center p-2">
                                        <span class="text-white fw-bold text-uppercase "
                                            v-if="ECR.risk_hospital === 'high'">высокий</span>
                                        <span class="text-white fw-bold text-uppercase "
                                            v-if="ECR.risk_hospital === 'low'">низкий</span>
                                        <span class="text-white fw-bold text-uppercase "
                                            v-if="ECR.risk_hospital === 'medium'">средний</span>
                                        <span class="text-white fw-bold text-uppercase"
                                            v-if="ECR.risk_hospital === 'unknown'">неизвестный</span>
                                    </div>

                                </div>
                                <div class="d-flex flex-wrap my-4">
                                    <div class="text-primary text-wrap fw-bold">Внутригоспитальная летальность:
                                        <span class="text-muted text-wrap">&ensp;{{ ECR.lethality_hospital }}
                                        </span>
                                    </div>


                                </div>
                                <div class="d-flex flex-wrap my-4">
                                    <div class="text-primary text-wrap fw-bold">6-ти месячная летальность:
                                        <span class="text-muted text-wrap">{{ ECR.lethality_six_months }}
                                        </span>
                                    </div>
                                </div>


                                <div class="d-flex flex-wrap justify-content-between align-items-center ">
                                    <p class="text-primary fw-bold text-uppercase" style="font-size: 1rem">Класс тяжести
                                        пациента</p>

                                    <p class="text-white fw-bold px-3 rounded-2"
                                        style="font-size: 2rem; background-color: #F06548;">{{
                                        ECR.patient_severity_class }}</p>


                                </div>

                            </BCol>



                        </BRow>


                    </BCard>
                </BCol>
                <BCol sm="12">
                    <BCard no-body>
                        <BCardBody class="card-height2">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-3">История мед. записей</h5>

                                <router-link :to="`/archive-ecr/profile-erc/${$route.params.id}/add-file/`">
                                    <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10 mb-3">
                                        <i class="ri-eye-fill text-primary align-bottom me-1"></i>
                                        <span class="text-primary fw-bold text-opacity-100">Просмотр</span>
                                    </button>
                                </router-link>
                            </div>


                            <div class="vstack gap-2 overflow-y-scroll card-height">
                                <div v-if="patient.records && patient.records.length > 0">
                                    <div v-for="attachment in patient.records" :key="attachment.id"
                                        class="border rounded border-dashed p-2">
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
                                                    <BLink href="javascript:void(0);"
                                                        class="text-body text-truncate d-block">
                                                        {{ attachment.name }}
                                                    </BLink>
                                                </h5>

                                            </div>
                                            <div class="flex-shrink-0 ms-2">
                                                <div class="d-flex gap-1">
                                                    <a :href="attachment.attachment" download>
                                                        <button type="button"
                                                            class="btn btn-icon text-muted btn-sm fs-18">
                                                            <i class="ri-download-2-line"></i>
                                                        </button>
                                                    </a>

                                                </div>
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

            <BRow>
                <BCol sm="12">

                    <BCard>
                        <BCardHeader class="d-flex justify-content-between p-0 mb-2">
                            <div class="d-flex align-items-center justify-content-center gap-3 mb-2 p-0">
                                <h2 class="fs-4">Дневник здоровья</h2>




                            </div>
                            <router-link :to="`/archive-ecr/profile-erc/${$route.params.id}/add-stat/`">
                                <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                    <i class="ri-eye-fill text-primary align-bottom me-1"></i>
                                    <span class="text-primary fw-bold text-opacity-100">Просмотр</span>
                                </button>
                            </router-link>
                        </BCardHeader>
                        <BRow>

                            <BCol md="6">
                                <BCard no-body>
                                    <BCardHeader class="justify-content-between d-flex align-items-center">
                                        <BCardTitle>Артериальное давление</BCardTitle>
                                        <!-- <b-button-group class="btn-group-sm">
                                            <b-button
                                                :class="{ 'btn-outline-success': activeInterval !== '1d', 'btn-success': activeInterval === '1d' }"
                                                @click="setInterval('1d')">1д</b-button>
                                            <b-button
                                                :class="{ 'btn-outline-success': activeInterval !== '1w', 'btn-success': activeInterval === '1w' }"
                                                @click="setInterval('1w')">1н</b-button>
                                            <b-button
                                                :class="{ 'btn-outline-success': activeInterval !== '1m', 'btn-success': activeInterval === '1m' }"
                                                @click="setInterval('1m')">1м</b-button>
                                            <b-button
                                                :class="{ 'btn-outline-success': activeInterval !== '6m', 'btn-success': activeInterval === '6m' }"
                                                @click="setInterval('6m')">6м</b-button>
                                            <b-button
                                                :class="{ 'btn-outline-success': activeInterval !== '1y', 'btn-success': activeInterval === '1y' }"
                                                @click="setInterval('1y')">1г</b-button>
                                        </b-button-group> -->
                                    </BCardHeader>
                                    <BCardBody>
                                        <p class="fw-bold">мм.рт.ст</p>
                                        <apexchart class="apex-charts" height="350" :series="art_series"
                                            :options="chartOptionsArterial"></apexchart>
                                    </BCardBody>
                                </BCard>
                            </BCol>
                            <BCol md="6">
                                <BCard no-body>
                                    <BCardHeader class="justify-content-between d-flex align-items-center">
                                        <BCardTitle>Пульс</BCardTitle>
                                        <!-- <b-button-group class="btn-group-sm">
                                            <b-button
                                                :class="{ 'btn-outline-warning': activeIntervalP !== '1d', 'btn-warning': activeIntervalP === '1d' }"
                                                @click="getPaginatePulserate('1d')">1д</b-button>
                                            <b-button
                                                :class="{ 'btn-outline-warning': activeIntervalP !== '1w', 'btn-warning': activeIntervalP === '1w' }"
                                                @click="getPaginatePulserate('1w')">1н</b-button>
                                            <b-button
                                                :class="{ 'btn-outline-warning': activeIntervalP !== '1m', 'btn-warning': activeIntervalP === '1m' }"
                                                @click="getPaginatePulserate('1m')">1м</b-button>
                                            <b-button
                                                :class="{ 'btn-outline-warning': activeIntervalP !== '6m', 'btn-warning': activeIntervalP === '6m' }"
                                                @click="getPaginatePulserate('6m')">6м</b-button>
                                            <b-button
                                                :class="{ 'btn-outline-warning': activeIntervalP !== '1y', 'btn-warning': activeIntervalP === '1y' }"
                                                @click="getPaginatePulserate('1y')">1г</b-button>
                                        </b-button-group> -->

                                    </BCardHeader>
                                    <BCardBody>
                                        <p class="fw-bold">уд/мин</p>
                                        <apexchart class="apex-charts" height="350" :series="pulse_series"
                                            :options="chartOptionsPulseRate">
                                        </apexchart>
                                    </BCardBody>
                                </BCard>
                            </BCol>

                        </BRow>



                    </BCard>


                </BCol>
            </BRow>

            <BRow>
                <BCol sm="12">
                    <BRow>
                        <BCol lg="12">
                            <BCard no-body id="applicationList">
                                <BCardHeader class="d-flex justify-content-between ">
                                    <h2 class="fs-4">Назначение лекарственных препаратов</h2>


                                    <router-link :to="`/archive-ecr/profile-erc/${$route.params.id}/reciept/`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-eye-fill text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Просмотр</span>
                                        </button>
                                    </router-link>
                                </BCardHeader>

                                <BCardBody class="pt-3">
                                    <div>
                                        <div class="table-responsive table-card mb-1"
                                            v-if="filteredResults && filteredResults.length > 0">
                                            <table class="table table-nowrap align-middle" id="jobListTable">
                                                <thead class="text-muted table-light">
                                                    <tr class="text-uppercase">
                                                        <th>Рецепт ID</th>
                                                        <th>Наименование</th>
                                                        <th>Доза</th>
                                                        <th>Расписание</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="list form-check-all">
                                                    <template v-for="item in filteredResults" :key="item.id">
                                                        <tr v-for="(med, index) in item.medicines" :key="med.id">
                                                            <td v-if="index === 0" :rowspan="item.medicines.length">{{
                                        item.id }}</td>
                                                            <td>{{ med.name }}</td>
                                                            <td>{{ med.dose }} мг</td>
                                                            <td> <span class="d-flex flex-column"
                                                                    v-for="raps in med.schedule" :key="raps">
                                                                    {{ formatTime(raps) }} ч./мин.
                                                                </span></td>


                                                        </tr>
                                                    </template>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="border border-2 border-dashed" style="height: 20rem" v-else>
                                            <div
                                                class="d-flex justify-content-center align-items-center flex-column h-100">

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


                </BCol>

                
            </BRow>
            <BRow>
                <BCol sm="12">

                    <BCard>
                        <BCardHeader class="d-flex justify-content-between p-0 mb-2">
                            <h2 class="fs-4">Запись контрольных событий и исхода КР</h2>

                        </BCardHeader>
                        <div v-if="chekpoint.length > 0"
                            style="max-height: 300px; min-height:300px; overflow-y: scroll;">
                            <b-table :items="chekpoint" :fields="fieldschekpoint" responsive="sm">
                                <template #cell(index)="data">
                                    {{ data.index + 1 }}
                                </template>
                                <template #cell(record_summary)="data">
                                    <div>
                                        <strong>{{ data.item.title }}</strong>
                                        <div>{{ generateRecordSummary(data.item) }}</div>
                                    </div>
                                </template>
                                <template #cell(description)="data">
                                    <div>{{ data.item.description }}</div>
                                </template>
                            </b-table>
                        </div>

                        <div v-else class="border border-2 border-dashed" style="height: 20rem">
                            <div class="d-flex justify-content-center align-items-center flex-column h-100">
                                <h5 class="text-muted">Нет данных</h5>
                            </div>
                        </div>
                    </BCard>

                </BCol>

            </BRow>


        </BCol>
    </BRow>



</template>

<style scoped>
.card-height {
    max-height: 20rem;
}

.card-height2 {
    min-height: 24rem;
}

.extra-small-text {
    font-size: 0.6rem;
}

.text-success {
    font-size: clamp(1rem, calc(2.4vw - 100%), 2rem);
}

.size-profile {
    font-size: calc(100dvh * 0.015);
}

.custom-text {
    color: #0c1722;
    font-weight: bold;
    opacity: 100;
}
</style>
