<script setup>

import { axiosInstance } from "../../axios";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
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
    await getRecepts();
});

</script>

<template>

    <BRow>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="d-flex justify-content-between ">
                    <h2 class="fs-4">Назначение лекарственных препаратов</h2>


                    <router-link :to="`/ecr/list-reciept/${$route.params.id}/`">
                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                            <i class="ri-eye-fill text-primary align-bottom me-1"></i>
                            <span class="text-primary fw-bold text-opacity-100">Просмотр</span>
                        </button>
                    </router-link>
                </BCardHeader>

                <BCardBody class="pt-3">
                    <div>
                        <div class="table-responsive table-card mb-1" v-if="filteredResults && filteredResults.length > 0">
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
                                            <td v-if="index === 0" :rowspan="item.medicines.length">{{ item.id }}</td>
                                            <td>{{ med.name }}</td>
                                            <td>{{ med.dose }} мг</td>
                                            <td> <span class="d-flex flex-column" v-for="raps in med.schedule"
                                                            :key="raps">
                                                            {{ formatTime(raps) }} ч./мин.
                                                        </span></td>

                                          
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
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


</template>

<style scoped>
.scrollable-table {
    max-height: 400px;
    overflow-y: auto;

}
</style>