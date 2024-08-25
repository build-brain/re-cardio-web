<script setup>
import { useRoute } from 'vue-router';
import { axiosInstance } from "../../axios";

import { onMounted, ref, computed } from "vue";




const patient = ref([]);

const route = useRoute();

const defaultLocation = {
    lat: 39.65417, // Координаты Самарканда
    lng: 66.95972,
};

const mapSrc = computed(() => {
    const lat = patient.value.latitude || defaultLocation.lat;
    const lng = patient.value.longitude || defaultLocation.lng;

    return `https://yandex.ru/map-widget/v1/?um=constructor%3A&ll=${lng}%2C${lat}&z=12&pt=${lng},${lat},pm2rdl`;
});
const getPatientProfile = async () => {
    try {
        const response = await axiosInstance.get(`/patients/${route.params.id}/`);
        if (response.status === 200) {
            patient.value = response.data;
        }
    } catch (error) {
        console.error(error);
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

onMounted(async () => {
    await getPatientProfile();
});



</script>

<template>

    <BRow>
        <BCol sm="4">
            <BCard no-body>
                <BCardBody class="p-4 text-start">
                    <BRow class="flex-column flex-sm-row">
                        <BCol xxl="4" sm="12" class="mb-4 mb-md-0">
                            <div class="d-flex justify-content-center flex-column align-items-center">
                                <div class="mb-3">
                                    <BAvatar :src="patient.avatar" rounded="circle" size="6rem" />
                                </div>
                                <h5 class="card-title mb-1 text-muted">Пациент</h5>
                            </div>
                        </BCol>

                        <BCol xxl="8" sm="12">
                            <div class="text-start card-text">

                                <div class="d-flex justify-content-between mb-1">
                                    <strong>Имя:</strong> {{ patient.first_name }}<br />
                                </div>
                                <div class="d-flex justify-content-between mb-1">
                                    <strong>Фамилия:</strong> {{ patient.last_name }}<br />
                                </div>

                                <div class="d-flex justify-content-between mb-1">
                                    <strong>Отчество:</strong> {{ patient.middle_name }} <br />
                                </div>
                                <div class="d-flex justify-content-between mb-1">
                                    <strong>Дата рождения:</strong> {{ patient.birth_date }}<br />
                                </div>
                                <div class="d-flex justify-content-between mb-1">
                                    <strong>Дата регистрации:</strong> 19.04.2023<br />
                                </div>
                                <div class="d-flex justify-content-between mb-1" v-if="patient.is_active === true">
                                    <strong>Статус ЭКР:</strong>Активен<br /><br />
                                </div>
                                <div class="d-flex justify-content-between mb-1" v-if="patient.is_active === false">
                                    <strong>Статус ЭКР:</strong>Не Активен<br /><br />
                                </div>
                            </div>
                        </BCol>
                    </BRow>
                </BCardBody>
            </BCard>

            <BCard>
                <BCardHeader class="d-flex justify-content-between p-2 px-0 mb-2">
                    <h2 class="fs-5">Демографические данные</h2>
                    <div>
                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                            <router-link :to="`/patients/edit/${patient.id}`">
                                <span class="text-primary fw-bold text-opacity-100">Правка</span>
                            </router-link>

                        </button>
                    </div>
                </BCardHeader>
                <div class="col-12">
                    <div class="patient-info">
                        <div class="info-row">
                            <strong>Пол:</strong>
                            <span v-if="patient.gender === 'male'">Мужчина</span>
                            <span v-else>Женщина</span>
                        </div>
                        <div class="info-row">
                            <strong>Возраст:</strong>
                            <span>{{ patient.age }}</span>
                        </div>
                        <div class="info-row">
                            <strong>Этнич. группа:</strong>
                            <span v-if="patient.ethnicity === 'asian'">Азиаты</span>
                            <span v-if="patient.ethnicity === 'european'">Европейцы</span>
                            <span v-if="patient.ethnicity === 'other'">Прочие</span>
                        </div>
                        <div class="info-row">
                            <strong>Род деятельности:</strong>
                            <span v-if="patient.profession === 'farmer'">дехкане</span>
                            <span v-if="patient.profession === 'worker'">рабочие</span>
                            <span v-if="patient.profession === 'employee'">служащие</span>
                            <span v-if="patient.profession === 'freelancer'">лица свободных профессий</span>
                            <span v-if="patient.profession === 'priest'">священнослужители</span>
                            <span v-if="patient.profession === 'other'">прочее</span>
                        </div>
                    </div>
                </div>
            </BCard>
            <BCard>
                <BCardHeader class="d-flex justify-content-between p-2 px-0 mb-2">
                    <h4 class="fs-5">Контакты</h4>
                    <div>
                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                            <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                            <router-link :to="`/patients/edit/${patient.id}`">
                                <span class="text-primary fw-bold text-opacity-100">Правка</span>
                            </router-link>
                        </button>

                    </div>
                </BCardHeader>
                <div class="col-12">
                    <div class="d-flex flex-column">
                        <div class="d-flex justify-content-between  mb-2">
                            <strong>Мобильный:</strong>
                            <span class="text-muted">{{ patient.phone }}</span>
                        </div>
                        <div class="d-flex justify-content-between  mb-2">
                            <strong>Доп. тел.:</strong>
                            <span class="text-muted">{{ patient.additional_phone_number }}</span>
                        </div>
                        <div class="d-flex flex-wrap justify-content-between  mb-2">
                            <strong class="text-nowrap pe-2 ">Э-почта:</strong>
                            <span class="text-muted text-wrap">{{ patient.email }}</span>
                        </div>
                        <div class="d-flex justify-content-between  mb-2">
                            <strong>Адрес:</strong>
                            <span class="text-muted">{{ patient.street }} {{ patient.mahalla }} {{ patient.city
                                }}</span>
                        </div>
                    </div>
                </div>
            </BCard>
            <BCard no-body>
                <BCardBody>
                    <BCardTitle>Геолокация</BCardTitle>
                    <iframe :src="mapSrc" width="100%" height="300px" frameborder="0" allowfullscreen></iframe>
                </BCardBody>
            </BCard>
        </BCol>
        <BCol sm="8">
            <BRow>
                <BCol sm="12">
                    <BCard no-body>
                        <BCardHeader class="mb-0 pb-1">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title">История ЭКР</h5>
                            </div>
                        </BCardHeader>
                        <BCardBody>


                            <div class="table-responsive table-card mb-1">
                                <table class="table table-nowrap align-middle" id="jobListTable">
                                    <thead class="text-muted table-light">
                                        <tr class="text-uppercase">
                                            <th class="sort">№</th>
                                            <th class="sort">Статус</th>
                                            <th class="sort">Дата начала</th>
                                            <th class="sort">Дата завершения</th>
                                            <th class="sort">Исход КР</th>
                                            <th class="sort">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody class="list form-check-all">
                                        <tr v-for="(items, index) in patient.er_cards" :key="items.id">
                                            <td class="company">
                                                {{ index + 1 }}
                                            </td>
                                            <td class="px-4">
                                                <div class="d-flex justify-content-center bg-success bg-opacity-25 rounded p-1"
                                                    v-if="items.is_active === true">
                                                    <span class="fw-bold text-success">Активная</span>
                                                </div>

                                                <div class="d-flex justify-content-center bg-danger bg-opacity-25 rounded p-1"
                                                    v-else>
                                                    <span class="fw-bold text-danger">Архивная</span>
                                                </div>
                                            </td>
                                            <td class="px-4">
                                                {{ items.created_date }}
                                            </td>
                                            <td class="px-4">
                                                {{ items.archivation_date }}
                                            </td>
                                            <td class="px-4">
                                                <div>
                                                    <div v-if="items.archivation_reason === 'FO'">
                                                        Летальный исход
                                                    </div>
                                                    <div v-else-if="items.archivation_reason === 'RHA'">
                                                        Повторный инфаркт миокарда
                                                    </div>
                                                    <div v-else-if="items.archivation_reason === 'OT'">
                                                        Иное
                                                    </div>
                                                    <div v-else-if="items.archivation_reason === 'FR'">
                                                        Трудоспособность восстановлена полностью
                                                    </div>
                                                    <div v-else-if="items.archivation_reason === 'PR'">
                                                        Трудоспособность восстановлена частично
                                                    </div>
                                                    <div v-else-if="items.archivation_reason === 'NR'">
                                                        Пациент нетрудоспособен
                                                    </div>
                                                    <div v-else-if="items.archivation_reason === 'SQL'">
                                                        Качество жизни соответствует таковому до инфаркта (шкала SAQ)
                                                    </div>
                                                    <div v-else-if="items.archivation_reason === 'BQL'">
                                                        Качество жизни лучше, чем до инфаркта (шкала SAQ)
                                                    </div>
                                                    <div v-else-if="items.archivation_reason === 'WQL'">
                                                        Качество жизни ниже, чем до инфаркта (шкала SAQ)
                                                    </div>
                                                    <div v-else>
                                                        {{ items.archivation_reason }}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <button type="button" v-if="items.is_active === true"
                                                    class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                                    <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                                    <router-link :to="`/ecr/profile-erc/${items.id}`">
                                                        <span
                                                            class="text-primary fw-bold text-opacity-100">Открыть</span>
                                                    </router-link>
                                                </button>
                                                <button type="button" v-if="items.is_active === false"
                                                    class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                                    <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                                    <router-link :to="`/archive-ecr/profile-erc/${items.id}`">
                                                        <span
                                                            class="text-primary fw-bold text-opacity-100">Открыть</span>
                                                    </router-link>
                                                </button>
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>
                            </div>

                        </BCardBody>
                    </BCard>
                </BCol>
            </BRow>

        </BCol>
    </BRow>
</template>

<style scoped>
.card-height {
    max-height: 22.2rem;
}

.extra-small-text {
    font-size: 0.6rem;

}

.custom-text {
    color: #0c1722;
    font-weight: bold;
    opacity: 100;
}

.patient-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* Расстояние между строками */
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid transparent;
    /* Похожий на border-0 */
    margin-bottom: 4px;
    /* Похожий на mb-1 */
}
</style>
