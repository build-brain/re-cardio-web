<template>
    <BCard no-body class="card-animate">

        <div id="chart">
            <p class="fw-bold p-2 fs-4">Прогноз летальности для активных ЭКР</p>
            <apexchart type="bar" height="350" :options="chartOptions1" :series="series1"></apexchart>
        </div>

    </BCard>
    <BCard no-body>
        <BCardBody class="p-0 ">
            <div>
                <p class="fw-bold p-2 fs-4">Средняя дистанция ходьбы (м)</p>
                <apexchart type="radar" height="350" :options="chartOptions" :series="series"></apexchart>
            </div>
        </BCardBody>
    </BCard>
    <BCard no-body>
        <BCardBody class="p-0 ">
            <div>
                <p class="fw-bold p-2 fs-4">Классификация пациентов по шкале NYHA</p>
                <apexchart type="line" height="350" :options="chartOptions3" :series="series3"></apexchart>
            </div>
        </BCardBody>
    </BCard>
</template>

<script setup>
import { ref, reactive, computed, watch, watchEffect } from 'vue';
import { useStore } from 'vuex';
const store = useStore();

const avgWalkingDistance = computed(() => store.getters['dashboard/avgWalkingDistance']);
const series = ref([]);
watchEffect(() => {
    const male = avgWalkingDistance.value.filter(item => item.er_card__patient__gender === 'male')
        .map(item => ({
            x: item.er_card__patient__region__name,
            y: item.avg_distance
        }));
    const female = avgWalkingDistance.value
        .filter(item => item.er_card__patient__gender === 'female')
        .map(item => ({
            x: item.er_card__patient__region__name,
            y: item.avg_distance
        }));
    series.value = [
        {
            name: 'Мужчины',
            data: male,
        },
        {
            name: 'Женщины',
            data: female
        }
    ];
});
const chartOptions = reactive({
    chart: {
        height: 350,
        type: 'radar',
    },

    yaxis: {
        tickAmount: 7,
    },
    legend: {
        horizontalAlign: 'left',
        offsetX: 40,
    },

});

// Функция для обновления данных графика

const lethalityForecast = computed(() => store.getters['dashboard/lethalityForecast']);


// Определение уровней риска и полов
const riskLevels = ['low', 'medium', 'high', 'null'];
const genders = ['female', 'male'];

// Реактивные данные для графика
const series1 = ref([]);
const chartOptions1 = ref({
    chart: {
        type: "bar",
        height: 350,
    },
    colors: ["#FFC107", "#0D6EFD"],
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: "55%",
            endingShape: "rounded",
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
    },
    xaxis: {
        categories: ["низкий", "средний", "высокий", "неизвестный"],
    },
    yaxis: {
        title: {
            text: "",
        },
    },
    fill: {
        opacity: 1,
    },
    tooltip: {
        y: {
            formatter: (val) => val,
        },
    },
    legend: {
        position: 'bottom'
    },
});

// Наблюдение за изменениями в lethalityForecast
watch(lethalityForecast, (newForecast) => {
    // Обновляем данные графика
    series1.value = genders.map(gender => ({
        name: gender === 'female' ? 'Женщины' : 'Мужчины',
        data: riskLevels.map(level => {
            return newForecast
                .filter(item =>
                    item.patient__gender === gender &&
                    (item.ca_sheet__risk_hospital === level || (item.ca_sheet__risk_hospital === null && level === 'null'))
                )
                .reduce((sum, item) => sum + item.count, 0);
        })
    }));
}, { immediate: true });

const nyhaDistribution = computed(() => store.getters['dashboard/nyhaDistribution']);
const series3 = ref([]);
const chartOptions3 = reactive({
    chart: {
        type: 'line',
        height: 350,
    },
    colors: ['#0D6EFD', '#f5803e'], // Синий и оранжевый цвета
    markers: {
        size: 10, // Размер маркеров
        shape: "square", // Форма маркеров - квадрат
        colors: ["#0D6EFD", "#f5803e"], // Цвета маркеров
        strokeWidth: 2, // Толщина обводки маркеров
        strokeColors: ["#fff", "#fff"], // Цвета обводки - белый
        hover: {
            sizeOffset: 4 // Увеличение размера при наведении
        }
    },
    dataLabels: {
        enabled: true,
        style: {
            fontSize: '12px',
            colors: ['#333'] // Цвет текста меток - темный
        },
        formatter: function (val) {
            return val; // Отображаем значение count
        }
    },

    stroke: {
        curve: 'straight', // Прямые линии
    },
    xaxis: {
        categories: [], // Будем обновлять динамически
        title: {
            text: '', // Не нужно название оси X
        },
    },
    yaxis: {
        title: {
            text: '', // Не нужно название оси Y
        },
    },
    legend: {
        position: 'bottom',
    },
});

watchEffect(() => {
    const data = nyhaDistribution.value;
    if (!data || !Array.isArray(data)) {
        console.error('Invalid data for nyhaDistribution');
        return;
    }
    // Группируем данные по полу

    const male = nyhaDistribution.value
    .filter(item => item.patient__gender === 'male')
    .map(item => ({
        x: item.ca_sheet__nyha !== null ? item.ca_sheet__nyha : 'Не указано',  // Заменяем null на 'Не указано'
        y: item.count !== null ? item.count : 0  // Заменяем null на 0
    }));

const female = nyhaDistribution.value
    .filter(item => item.patient__gender === 'female')
    .map(item => ({
        x: item.ca_sheet__nyha !== null ? item.ca_sheet__nyha : 'Не указано',  // Заменяем null на 'Не указано'
        y: item.count !== null ? item.count : 0  // Заменяем null на 0
    }));

    // Устанавливаем данные для графика
    series3.value = [
        {
            name: 'Женщины',
            data: female,
        },
        {
            name: 'Мужчины',
            data: male,
        },
    ];

});

</script>


<style></style>