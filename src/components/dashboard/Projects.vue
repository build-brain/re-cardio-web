<template>
  <BCard no-body>
    <BCardBody class="p-0 pb-2">
      <div>
        <p class="fw-bold p-2 fs-3">Госпитализация пациентов с ИМ</p>
        <apexchart type="line" height="490" :options="chartOptions" :series="series"></apexchart>
      </div>
    </BCardBody>
  </BCard>
  <BCard no-body>
    <BCardBody class="p-0 pb-2">
      <div>
        <p class="fw-bold p-2 fs-3">Распределение пациентов по областям</p>
        <apexchart  height="490" :options="chartOptions2" :series="series2"></apexchart>
      </div>
    </BCardBody>
  </BCard>
</template>



<script setup>
import { ref, computed, reactive, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const admissionsOverTime = computed(() => store.getters['dashboard/patientAdmissionOverTime']);
const series = ref([]);
const chartOptions = reactive({
  chart: {
    height: 350,
    type: 'line',
    stacked: false,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [0, 2, 2],
    curve: 'smooth',
  },
  fill: {
    type: ['gradient', 'solid', 'solid'],
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.5,
      opacityFrom: 0.8,
      opacityTo: 0.2,
      stops: [0, 100]
    },
    colors: ['#D3D3D3', '#007bff', '#fd7e14']
  },
  markers: {
    size: 5,
    colors: ['#D3D3D3', '#007bff', '#fd7e14'],
    strokeWidth: 2,
  },
  xaxis: {
    categories: [], // Обновляем категории внутри watchEffect
  },
  yaxis: [
    {
      axisTicks: { show: true },
      axisBorder: { show: true, color: '#008FFB' },
      labels: { style: { colors: '#008FFB' } },
      title: { text: 'Возраст', style: { color: '#008FFB' } },
    },
    {
      opposite: true,
      axisTicks: { show: true },
      axisBorder: { show: true, color: '#263238' },
      labels: { style: { colors: '#263238' } },
      title: { text: 'Количество', style: { color: '#263238' } },
    },
  ],
  tooltip: { shared: true },
  legend: { horizontalAlign: 'left', offsetX: 40 },
});

watchEffect(() => {
  try {
    const admissions = admissionsOverTime.value;
    if (!admissions || !Array.isArray(admissions)) {
      throw new Error('Invalid data for admissionsOverTime');
    }

    // Извлекаем уникальные месяцы
    const months = [...new Set(admissions.map(item => item.month_name))];
    const monthNames = {
      'January': 'Январь',
      'February': 'Февраль',
      'March': 'Март',
      'April': 'Апрель',
      'May': 'Май',
      'June': 'Июнь',
      'July': 'Июль',
      'August': 'Август',
      'September': 'Сентябрь',
      'October': 'Октябрь',
      'November': 'Ноябрь',
      'December': 'Декабрь'
    };

    // Группируем данные по месяцу и полу
    const groupedData = admissions.reduce((acc, item) => {
      const key = `${item.month_name}-${item.er_card__patient__gender}`;
      acc[key] = (acc[key] || 0) + item.count;
      return acc;
    }, {});


    // Формируем данные для графика
    const maleSeriesData = months.map(month => ({
      x: monthNames[month],
      y: groupedData[`${month}-male`] || 0
    }));

    const femaleSeriesData = months.map(month => ({
      x: monthNames[month],
      y: groupedData[`${month}-female`] || 0
    }));

    const avgAgeSeriesData = months.map(month => {
      const avgAgeItem = admissions.find(item => item.month_name === month);
      return {
        x: monthNames[month],
        y: avgAgeItem ? avgAgeItem.avg_age : 0
      };
    });

    series.value = [
      {
        name: 'Женщины',
        type: 'line',
        data: femaleSeriesData,
      },
      {
        name: 'Мужчины',
        type: 'line',
        data: maleSeriesData
      },
      {
        name: 'Ср. возраст',
        type: 'area',
        data: avgAgeSeriesData
      }
    ];



  } catch (error) {
    console.error('Error in watchEffect:', error);
  }
});

const patientDistribution = computed(() => store.getters['dashboard/patientDistribution']);
const series2 = ref([]);
const chartOptions2 = reactive({
      chart: {
        type: 'bar',
        height: 350,
      },
      colors: ['#FFC107', '#0D6EFD'],
      plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '10%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
      xaxis: {
    
        title: {
          text: 'Регион',
        },
        tickPlacement: 'on',
      },
      yaxis: {
        title: {
          text: 'Количество',
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: 'bottom',
      },
     
    });

    watchEffect(() => {
    const male = patientDistribution.value
        .filter(item => item?.patient__gender === 'male' && item?.patient__region__name && item?.count)
        .map(item => ({
            x: item.patient__region__name,
            y: item.count
        }));

    const female = patientDistribution.value
        .filter(item => item?.patient__gender === 'female' && item?.patient__region__name && item?.count)
        .map(item => ({
            x: item.patient__region__name,
            y: item.count
        }));

    series2.value = [
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




</script>