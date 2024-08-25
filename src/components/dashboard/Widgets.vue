<script setup>
import { useStore } from 'vuex';
import { computed, ref } from 'vue';

const store = useStore();
const stat = computed(() => store.getters['dashboard/currenrstat']);

const outcomes = computed(() => stat.value?.outcomes || {
    positive: 0,
    rehospitalization: 0,
    lethal: 0
});
const getCountByClassAndGender = (severityClass, gender) => {
    if (!stat.value || !stat.value.severity_class_distribution) {
        return 0;
    }

    const item = stat.value.severity_class_distribution.find(
        item => item.ca_sheet__patient_severity_class === severityClass && item.patient__gender === gender
    );
    return item ? item.count : 0;
};

</script>

<template>
    <BCol xl="4">
        <BCard no-body class="card-animate">
            <BCardBody>
                <p class="text-muted text-uppercase fs-5 fw-bold">Активные ЭКР</p>
                <div class="d-flex align-items-center mb-3">
                    <div
                        class="bg-primary-subtle me-3 px-3 py-2 rounded-1 text-primary d-flex align-items-center justify-content-center">
                        <i class="ri-hospital-fill fs-3"></i>
                    </div>
                    <span class="fs-3 fw-bold">{{ stat.active_ercard_count }}</span>
                </div>
                <div class="container p-0">
                    <div class="row text-center my-2">

                        <div class="col text-primary">К / Т</div>
                        <div class="col text-primary">I</div>
                        <div class="col text-primary">II</div>
                        <div class="col text-primary">III</div>
                        <div class="col text-primary">IV</div>
                    </div>

                    <div v-for="gender in ['female', 'male']" :key="gender" class="row text-center my-2">
                        <div class="col">{{ gender === 'female' ? 'Жен.' : 'Муж.' }}</div>
                        <div v-for="severityClass in [1, 2, 3, 4]" :key="severityClass" class="col">
                            {{ getCountByClassAndGender(severityClass, gender) }}
                        </div>
                    </div>



                </div>
            </BCardBody>
        </BCard>



    </BCol>
    <BCol xl="8">
        <BCard no-body class="card-animate">
            <BCardBody>
                <p class="text-muted text-uppercase fs-5 fw-bold">Архивные ЭКР</p>

                <div class="d-flex align-items-center mb-2">
                    <div
                        class="bg-warning-subtle me-3 px-3 py-2 rounded-1 text-warning d-flex align-items-center justify-content-center">
                        <i class="ri-award-fill fs-3"></i>
                    </div>
                    <span class="fs-3 fw-bold">{{ stat.archived_ercard_count }}</span>
                </div>
                <div class="container d-grid p-0">
                    <div class="row">
                        <div class="col col-4 text-center">
                            <div class="p-3 bg-success rounded-1 text-white">
                                Положительный исход
                            </div>
                            <div class="fs-3 fw-bold" >
                                {{ outcomes.positive }}
                            </div>
                        </div>

                        <div class="col col-4 text-center">
                            <div class="p-3 bg-warning-subtle  rounded-1  text-warning">
                                Повторная госпитализация
                            </div>
                            <div class="fs-3 fw-bold">
                                {{ outcomes.rehospitalization }}
                            </div>
                        </div>

                        <div class="col col-4 text-center">
                            <div class="p-3 bg-danger  rounded-1 text-white">
                                Летальный исход
                            </div>
                            <div class="fs-3 fw-bold">
                                {{ outcomes.lethal }}
                            </div>
                        </div>
                    </div>

                </div>
            </BCardBody>
        </BCard>

    </BCol>


</template>

<style scoped></style>