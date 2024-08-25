<template>
    <PageHeader />
    <div>
      <BRow>
        <BCol lg="12">
          <BCard no-body id="applicationList">
            <BCardHeader class="border-0">
              <div class="d-md-flex align-items-center">
                <h5 class="card-title mb-3 mb-md-0 flex-grow-1 fw-bold">Календарь событий</h5>
               
              </div>
            </BCardHeader>
  
            <BCardBody class="pt-3">
              <div>
                <div class="table-responsive table-card mb-1">
                  <table class="table table-nowrap align-middle" id="jobListTable" v-if="events.length !== 0">
                    <thead class="text-muted table-light">
                      <tr class="text-uppercase">
                        <th>название</th>
                        <th>тип</th>
                        <th>начало</th>
                        <th>завершение</th>
                        <th>локация</th>
                       
                        <th>статус</th>
                      </tr>
                    </thead>
                    <tbody class="list form-check-all">
                      <tr v-for="activities in events" :key="activities.id">
                        <td>
  
                          <p class="d-flex flex-column">
                            {{ activities.title }}
                          </p>
                          <p class="d-flex flex-column">
                            {{ activities.description }}
                          </p>
                        </td>
                        <td>
                          {{ getCategoryName(activities.type) }}
                        </td>
  
                        <td>{{ activities.start_date ? formatDate(activities.start_date) : '' }}</td>
                        <td>{{ activities.end_date ? formatDate(activities.end_date) : '' }}</td>
                        <td>{{ getLocationName(activities.location) }}</td>
                 
                        <td>
                          <span
                            :class="[getStatusStyle(activities.status).textClass, getStatusStyle(activities.status).bgClass]">
                            {{ getStatusStyle(activities.status).displayName }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="noresult" v-else>
                    <div class="text-center">
                      <lottie class="avatar-xl" colors="primary:#121331,secondary:#08a88a" :options="defaultOptions"
                        :height="75" :width="75" />
                      <h5 class="mt-2">Пусто! Нет результатов</h5>
                      <p class="text-muted mb-0">
                        Перезагрузите страницу или входите заново.
                      </p>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-end mt-3">
                    <router-link :to="`/archive-ecr/profile-erc/${route.params.id}`">
                    <b-button variant="danger">назад</b-button>
  
                  </router-link>
  
  
                </div>
              </div>
            </BCardBody>
          </BCard>
        </BCol>
      </BRow>
  
 
  
  
  
  
  
  
  
    
  
  
  
    </div>
  </template>
  
  <script setup>
  import PageHeader from "../../../../components/page-header.vue";
  import animationData from "@/components/widgets/msoeawqm.json";
  import Lottie from "../../../../components/widgets/lottie.vue";
  import { ref, onMounted } from 'vue';
  import { axiosInstance } from '../../../../axios';
  import { useRoute } from 'vue-router';
  import formatDate from "@/common/formatDate";
  

  const defaultOptions = { animationData: animationData };
  const route = useRoute();
  
  const events = ref([]);



  const categories = ref([
    {
      name: 'Плановый осмотр',
      value: 'bg-success-subtle',
    },
    {
      name: 'Неплановый осмотр',
      value: 'bg-info-subtle',
    },
    {
      name: 'Изменение активности',
      value: 'bg-warning-subtle',
    },
    {
      name: 'Тредмил-тест',
      value: 'bg-danger-subtle',
    },
    {
      name: 'Оценка состояния',
      value: 'bg-primary-subtle',
    },
  ]);

  const getCategoryName = (type) => {
    const category = categories.value.find(cat => cat.value === type);
    return category ? category.name : 'Неизвестная категория';
  };
  const locations = ref([
    { resuscitation_room: 'Палата реанимации и интенсивной терапии ЛПУ' },
    { inpatient_ward: 'Палата стационарного отделения ЛПУ' },
    { inpatient_department: 'Стационарное отделение ЛПУ' },
    { outpatient_department: 'Амбулаторное отделение ЛПУ' },
    { home_rehabilitation: 'Реабилитация в домашних условиях' }
  ]);
  const getLocationName = (locationKey) => {
    const location = locations.value.find(loc => Object.keys(loc)[0] === locationKey);
    return location ? location[locationKey] : 'Неизвестное местоположение';
  };
  const statusTranslations = ref({
    scheduled: {
      displayName: 'Запланировано',
      textClass: 'text-primary',
      bgClass: 'bg-primary-subtle p-2 rounded-3'
    },
    cancelled: {
      displayName: 'Отменено',
      textClass: 'text-danger',
      bgClass: 'bg-danger-subtle p-2 rounded-3'
    },
    completed: {
      displayName: 'Завершено',
      textClass: 'text-success',
      bgClass: 'bg-success-subtle p-2 rounded-3'
    }
  });
  
  const getStatusStyle = (status) => {
    return statusTranslations.value[status] || {
      displayName: 'Неизвестно',
      textClass: 'text-muted',
      bgClass: 'bg-light'
    };
  };
  
  
  
  
  




  const getAcivities = async () => {
    try {
      const response = await axiosInstance.get(`/er-cards/${route.params.id}/`);
      events.value = response.data.events;
    } catch (error) {
      console.log(error)
    }
  };
  

  
  

  
  

  
  
  onMounted(async () => {
    await getAcivities();
  })
  
  
  
  </script>
  