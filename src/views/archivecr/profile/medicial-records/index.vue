<script setup>
import pageHeader from "@/components/page-header.vue";
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { axiosInstance } from "../../../../axios";

import "flatpickr/dist/flatpickr.css";
import Lottie from "@/components/widgets/lottie.vue";
import animationData from "@/components/widgets/msoeawqm.json";

const route = useRoute();


const medicial_data = ref([]);


const getMedicialrecords = async () => {
    const response = await axiosInstance.get(`/medical-records/?er_card=${route.params.id}`);
    if (response.status === 200) {
        medicial_data.value = response.data;
    }
}


const defaultOptions = {
    animationData: animationData
};



onMounted(async () => {
    await getMedicialrecords();
})















</script>

<template>

<pageHeader  />
  

    <BRow>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="border-0">
                    <div class="d-md-flex align-items-center">
                        <h5 class="card-title mb-3 mb-md-0 flex-grow-1">Список медицинских файлов</h5>
                        
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
                            <router-link :to="`/archive-ecr/profile-erc/${route.params.id}`">
                    <b-button variant="danger">назад</b-button>
  
                  </router-link>
                           
                        </div>

                    </div>
                </BCardBody>
            </BCard>
        </BCol>
    </BRow>






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