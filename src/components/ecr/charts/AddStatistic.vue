<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import dayjs from 'dayjs';
const rawData = ref([]);
const store = useStore();
const series = ref([]);
const route = useRoute();
watchEffect(() => {
    const temperatureData = rawData.value.map(item => ({
        x: item.creation_date,
        y: item.body_temperature
    }));
    series.value = [
        {
            name: 'Температура',
            data: temperatureData,
        },
    ];
});
const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const chartOptions = ref({
    chart: {
        type: 'scatter',
        height: 200,
        stacked: true,
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
        curve: 'straight'
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
        position: 'right',
        offsetY: 40,
    },
    fill: {
        opacity: 1,
    },
    colors: ['#22BAA6', '#E91E63', '#9C27B0'],
});


const arterial_statistic = ref([]);
const art_series = ref([]);

const activeIntervalAD = ref('1d');
const currentPage = ref(1);
const itemsPerPage = ref(1); // Один график на странице

const groupDataByInterval = (data, interval) => {
    if (!Array.isArray(data)) {
        console.error('data is not an array:', data);
        return {};
    }

    const groupedData = {};
    data.forEach(item => {
        const date = dayjs(item.creation_date);
        let key;

        switch (interval) {
            case '1d':
                key = date.format('YYYY-MM-DD');
                break;
            case '1w':
                key = date.startOf('week').format('YYYY-MM-DD');
                break;
            case '1m':
                key = date.startOf('month').format('YYYY-MM-DD');
                break;
            case '6m':
                key = date.startOf('month').subtract(date.month() % 6, 'months').format('YYYY-MM-DD');
                break;
            case '1y':
                key = date.startOf('year').format('YYYY-MM-DD');
                break;
            default:
                key = 'Unknown';
        }

        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push(item);
    });

    return groupedData;
};

const aggregateData = (groupedData, interval) => {
    const aggregatedData = Object.keys(groupedData).map(key => {
        const items = groupedData[key];
        const averageSystolic = items.reduce((sum, item) => sum + item.systolic_pressure, 0) / items.length;
        const averageDiastolic = items.reduce((sum, item) => sum + item.diastolic_pressure, 0) / items.length;

        return {
            date: key,
            averageSystolic,
            averageDiastolic
        };
    });

    return aggregatedData;
};
const getPaginateArterialPressure = (interval) => {
    activeIntervalAD.value = interval;
    if (!Array.isArray(arterial_statistic.value)) {
        console.error('arterial_statistic.value is not an array:', arterial_statistic.value);
        return;
    }

    const filteredData = groupDataByInterval(arterial_statistic.value, interval);
    const aggregatedData = aggregateData(filteredData, interval);

    // Пагинация
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    const paginatedData = aggregatedData.slice(startIndex, endIndex);

    // Преобразование данных для графика
    const systolicData = paginatedData.map(item => ({
        x: item.date,
        y: item.averageSystolic,
    }));

    const diastolicData = paginatedData.map(item => ({
        x: item.date,
        y: item.averageDiastolic,
    }));

    art_series.value = [
        {
            name: 'Среднее систолическое',
            data: systolicData,
        },
        {
            name: 'Среднее диастолическое',
            data: diastolicData,
        },
    ];
};

// Функция для смены страницы (интервала)
const goToPage = (page, interval) => {
    currentPage.value = page;
    activeIntervalAD.value = interval; // Обновляем активный интервал
    getPaginateArterialPressure(interval);
};
watchEffect(() => {
    const systolicData = arterial_statistic.value.map(item => ({
        x: item.creation_date,
        y: item.systolic_pressure,
    }));

    const diastolicData = arterial_statistic.value.map(item => ({
        x: item.creation_date,
        y: item.diastolic_pressure,
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

const blood_saturation = ref([]);
const blood_series = ref([]);

watchEffect(() => {
    const blooddata = blood_saturation.value.map(item => ({
        x: item.creation_date,
        y: item.blood_saturation,
    }));

    blood_series.value = [
        {
            name: 'Насыщение крови',
            data: blooddata,
        }
    ];
});

const chartOptionsBloodSaturation = ref({
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
    markers: {

        colors: ['#FFA500'], // Оранжевый цвет точек
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
    },
});


const dyspneaStatistic = ref([]);
const fatigueStatistic = ref([]);
const heartPainStatistic = ref([]);

const pulse_rate = ref([]);
const pulse_series = ref([]);

watchEffect(() => {
    const pulse = pulse_rate.value.map(item => ({
        x: item.creation_date,
        y: item.pulse_rate,
        pulse_on_exertion: item.pulse_on_exertion
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
const chartOptionsPulseRate = ref({
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
    markers: {
        colors: ['#FFA500'], // Оранжевый цвет точек
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



const physical_statistic = ref([]);
const physical_series = ref([]);

watchEffect(() => {
    const w_duration = physical_statistic.value.map(item => ({
        x: item.creation_date,
        y: item.walking_duration,
    }));

    const distance_covered = physical_statistic.value.map(item => ({
        x: item.creation_date,
        y: item.distance_covered,
    }));
    const step_count = physical_statistic.value.map(item => ({
        x: item.creation_date,
        y: item.step_count
    }))

    physical_series.value = [
        {
            name: 'Период ходьбы',
            data: w_duration,
        },
        {
            name: 'Дистанция (м)',
            data: distance_covered,
        },
        {
            name: 'Шаги',
            data: step_count,
        },
    ];
});

const chartOptionsPhysical = ref({
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

    colors: ['#8A2BE2', '#483D8B', '#FFFF00'],
    tooltip: {
        shared: true,
        intersect: false,
        x: {
            format: 'dd MMM yyyy'
        },
    },
});
const respiratory_condition = ref([]);

const raspiratory_ratedata = ref([]);
const raspiratory_series = ref([]);

watchEffect(() => {
    const rate = raspiratory_ratedata.value.map(item => ({
        x: item.creation_date,
        y: item.respiratory_rate,
        rythm: item.breathing_rhythm
    }));

    raspiratory_series.value = [
        {
            name: 'Частота дыхания',
            data: rate,
        }
    ];
});

const translateRaspiratoryOnExertion = (type) => {
    const types = {
        'rhythmic': 'ритмичный',
        'arrhythmic': 'аритмичный',
    };
    return types[type] || type;
};
const chartOptionsRaspiratory = ref({
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
    markers: {
        colors: ['#FFA500'], // Оранжевый цвет точек
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
                const rythmOnExertion = translateRaspiratoryOnExertion(w.config.series[seriesIndex].data[dataPointIndex].rythm);
                return `${val} | Тип ритмичности: ${rythmOnExertion}`;
            }
        }
    }
});


onMounted(async () => {
    await store.dispatch('charts/getCharts', { ecr: route.params.id });
    rawData.value = store.state.charts.body_temperature.filter(item => item.body_temperature !== null);
    arterial_statistic.value = store.state.charts.arterial_pressure_statistic.filter(item => item.systolic_pressure !== null || item.diastolic_pressure !== null);
    getPaginateArterialPressure(activeIntervalAD.value);
    blood_saturation.value = store.state.charts.blood_saturation;

    const filteredData = store.state.charts.dyspnea.filter(item => item.dyspnea !== null || item.dyspnea_type !== null);
    dyspneaStatistic.value = filteredData.map(record => ({
        x: record.creation_date,
        y1: record.dyspnea,
        y2: record.dyspnea_type
    }));
    const filterfatigue = store.state.charts.fatigue.filter(item => item.fatigue !== null || item.fatigue_type !== null);
    fatigueStatistic.value = filterfatigue.map(record => ({
        x: record.creation_date,
        fatigue: record.fatigue,
        fatigue_type: record.fatigue_type
    }));

    const filtereHeartpain = store.state.charts.heart_pain.filter(item => item.heart_pain !== null || item.heart_pain_type !== null);
    heartPainStatistic.value = filtereHeartpain.map(record => ({
        x: record.creation_date,
        heart_pain: record.heart_pain,
        heart_pain_type: record.heart_pain_type
    }));

    pulse_rate.value = store.state.charts.pulse_rate.filter(item => item.pulse_on_exertion !== null && item.pulse_rate !== null);
    physical_statistic.value = store.state.charts.physical_activity.filter(item => item.walking_duration !== null && item.distance_covered !== null || item.step_count !== null);
    respiratory_condition.value = store.state.charts.respiratory_condition.filter(item => item.moist_rales !== null && item.peripheral_edema !== null);
    raspiratory_ratedata.value = store.state.charts.respiratory_rate.filter(item => item.breathing_rhythm !== null && item.respiratory_rate !== null);

});


const translateDyspneaType = (type) => {
    const types = {
        'inspiratory': 'инспираторная',
        'expiratory': 'экспираторная',
        'mixed': 'смешанная'
    };
    return types[type] || type;
};

const fields = [
    { key: 'x', label: 'Дата' },
    { key: 'y1', label: 'Отдышка' },
    { key: 'y2', label: 'Тип Отдышки' }
];
const fieldsfatigue = [
    { key: 'x', label: 'Дата' },
    { key: 'fatigue', label: 'Усталость' },
    { key: 'fatigue_type', label: 'Тип усталости' }
];

const translateFatigueType = (type) => {
    const types = {
        'moderate': 'умеренная',
        'quickly_passing': 'быстро проходящая',
        'short_term': 'краткосрочная',
        'long_term': 'долгосрочная'
    };
    return types[type] || type;
};


const fieldsheart = [
    { key: 'x', label: 'Дата' },
    { key: 'heart_pain', label: 'Боль в сердце' },
    { key: 'heart_pain_type', label: 'Тип боли' }
];

const translateHeartPainType = (type) => {
    const types = {
        'irregular': 'нерегулярная',
        'relieved_without_nitroglycerin': 'проходящая без нитроглицерина',
        'relieved_only_nitroglycerin': 'проходящая только с нитроглицерином'
    };
    return types[type] || type;
};


const fieldsConditions = [
    { key: 'creation_date', label: 'Дата' },
    { key: 'moist_rales', label: 'Влажные хрипы' },
    { key: 'peripheral_edema', label: 'Периферические отеки' }
];



</script>

<template>
    <BRow class="project-wrapper">
        <BCol xxl="12">
            <BRow>
                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>АД</BCardTitle>
                                <div class="d-flex gap-2">
                                    <!-- <b-button-group class="btn-group-sm">
                                        <b-button v-for="(interval, index) in ['1d', '1w', '1m', '6m', '1y']"
                                            :key="interval"
                                            :class="{ 'btn-outline-success': activeIntervalAD !== interval, 'btn-success': activeIntervalAD === interval }"
                                            @click="goToPage(1, interval)">
                                            {{ interval === '1d' ? '1д' : interval === '1w' ? '1н' : interval === '1m' ?
                                            '1м' : interval === '6m' ? '6м' : '1г' }}
                                        </b-button>
                                    </b-button-group> -->


                                    <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">

                                        <router-link :to="`/ecr/add-stat/${route.params.id}/post-artps`">
                                            <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                                <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                                <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                            </button>
                                        </router-link>
                                    </div>
                                </div>

                            </BCardHeader>
                            <BCardBody>
                                <p class="fw-bold">мм.рт.ст</p>
                                <apexchart class="apex-charts" height="350" :series="art_series"
                                    :options="chartOptionsArterial">
                                </apexchart>
                            </BCardBody>
                        </BCard>

                    </BCard>
                </BCol>

                <BCol xxl="4" xl="6">

                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>ЧСС</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">

                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-pulse`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>

                            </BCardHeader>
                            <BCardBody>
                                <p class="fw-bold">уд/мин</p>
                                <apexchart class="apex-charts" height="350" :series="pulse_series"
                                    :options="chartOptionsPulseRate">
                                </apexchart>
                            </BCardBody>
                        </BCard>

                    </BCard>

                </BCol>

                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>ЧДД</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">

                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-resprate`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>

                            </BCardHeader>
                            <BCardBody>
                                <p class="fw-bold">в.в./мин</p>
                                <apexchart class="apex-charts" height="350" :series="raspiratory_series"
                                    :options="chartOptionsRaspiratory">
                                </apexchart>
                            </BCardBody>
                        </BCard>

                    </BCard>

                </BCol>
                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>Т</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">

                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-temp`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>

                            </BCardHeader>
                            <BCardBody>
                                <p class="fw-bold">°C</p>
                                <apexchart class="apex-charts" height="350" :series="series" :options="chartOptions">
                                </apexchart>
                            </BCardBody>
                        </BCard>

                    </BCard>

                </BCol>
                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>SpO₂</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">

                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-bloodstr`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>

                            </BCardHeader>
                            <BCardBody>
                                <p class="fw-bold">%</p>
                                <apexchart class="apex-charts" height="350" :series="blood_series"
                                    :options="chartOptionsBloodSaturation">
                                </apexchart>
                            </BCardBody>
                        </BCard>

                    </BCard>
                   
                </BCol>
                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>ДА</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">

                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-activity`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>

                            </BCardHeader>
                            <BCardBody>
                                <p class="fw-bold">Показатели физического состояния</p>
                                <apexchart class="apex-charts" height="350" :series="physical_series"
                                    :options="chartOptionsPhysical">
                                </apexchart>
                            </BCardBody>
                        </BCard>

                    </BCard>

                </BCol>
                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>Боль в сердце</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">
                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-heart`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>
                            </BCardHeader>
                            <BCardBody style="max-height: 350px; min-height: 350px; overflow-y: scroll;">
                                <b-table :items="heartPainStatistic" :fields="fieldsheart" responsive="sm">
                                    <template #cell(heart_pain)="data">
                                        <span>{{ data.value ? 'Да' : 'Нет' }}</span>
                                    </template>
                                    <template #cell(heart_pain_type)="data">
                                        <span>{{ translateHeartPainType(data.value) }}</span>
                                    </template>
                                </b-table>
                            </BCardBody>
                        </BCard>
                    </BCard>
                </BCol>
                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>Отдышка</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">

                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-dyspnea`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>

                            </BCardHeader>
                            <BCardBody style="max-height: 350px; min-height:350px; overflow-y: scroll;">

                                <b-table :items="dyspneaStatistic" :fields="fields" responsive="sm">
                                    <template #cell(y1)="data">
                                        <span>{{ data.value ? 'Да' : 'Нет' }}</span>
                                    </template>
                                    <template #cell(y2)="data">
                                        <span>{{ translateDyspneaType(data.value) }}</span>
                                    </template>
                                </b-table>

                            </BCardBody>
                        </BCard>

                    </BCard>
                </BCol>
                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>Дополнительно</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">

                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-resp`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>

                            </BCardHeader>
                            <BCardBody style="max-height: 350px; min-height:350px; overflow-y: scroll;">

                                <b-table :items="respiratory_condition" :fields="fieldsConditions" responsive="sm">
                                    <template #cell(moist_rales)="data">
                                        <span>{{ data.value ? 'Да' : 'Нет' }}</span>
                                    </template>
                                    <template #cell(peripheral_edema)="data">
                                        <span>{{ data.value ? 'Да' : 'Нет' }}</span>
                                    </template>
                                </b-table>

                            </BCardBody>
                        </BCard>

                    </BCard>
                </BCol>
                <BCol xxl="4" xl="6">
                    <BCard no-body class="card-animate">
                        <BCard no-body>
                            <BCardHeader class="justify-content-between d-flex align-items-center">
                                <BCardTitle>Усталость</BCardTitle>
                                <div class="d-flex justify-content-end flex-wrap gap-3 align-items-center">
                                    <router-link :to="`/ecr/add-stat/${route.params.id}/post-fatigue`">
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                            <span class="text-primary fw-bold text-opacity-100">Подробнее</span>
                                        </button>
                                    </router-link>
                                </div>
                            </BCardHeader>
                            <BCardBody style="max-height: 350px; min-height:350px; overflow-y: scroll;">
                                <b-table :items="fatigueStatistic" :fields="fieldsfatigue" responsive="sm">
                                    <template #cell(fatigue)="data">
                                        <span>{{ data.value ? 'Да' : 'Нет' }}</span>
                                    </template>
<template #cell(fatigue_type)="data">
                                        <span>{{ translateFatigueType(data.value) }}</span>
                                    </template>
</b-table>
</BCardBody>
</BCard>
</BCard>
                </BCol>



            </BRow>
        </BCol>

    </BRow>
</template>