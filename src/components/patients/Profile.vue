<script>

import { LMap, LMarker, LTileLayer, LIcon } from "@vue-leaflet/vue-leaflet";
import { latLng } from "leaflet";
import { useRoute } from 'vue-router';
import { axiosInstance } from "../../axios";
import { onMounted, ref, computed } from "vue";
export default {
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LIcon
    },

    setup() {
        const patient = ref([]);
        const admission_data = ref([]);
        const icd = ref([]);
        const icd_id = ref(null);

        const zoom = ref(6);
        const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        const staticAnchor = [16, 37];
        const attribution = '&copy; <BLink href="http://osm.org/copyright">OpenStreetMap</BLink> contributors';

        const route = useRoute();

        const center = computed(() => {
            if (patient.value.latitude && patient.value.longitude) {
                return latLng(patient.value.latitude, patient.value.longitude);
            } else {
                return latLng(51.505, -0.09);
            }
        });

        const markers = computed(() => {
            if (patient.value.latitude && patient.value.longitude) {
                return [{
                    id: "m1",
                    position: { lat: patient.value.latitude, lng: patient.value.longitude },
                    draggable: true,
                    visible: true
                }];
            } else {
                return [];
            }
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

            try {
                axiosInstance.get(`/admission-data/${route.params.id}/`).then((response) => {
                    if (response.status === 200) {
                        icd_id.value = response.data.preliminary_diagnosis;
                        admission_data.value = response.data;
                        if(icd_id.value !== null){
                            axiosInstance.get(`/icd/${icd_id.value}/`).then((response) => {
                            if (response.status === 200) {
                                icd.value = response.data;
                            }
                        })
                        }

                        
                    }
                });

            } catch (e) {
                console.error(e);
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


        return {
            patient, admission_data,
            zoom,
            center,
            url,
            staticAnchor,
            attribution,
            markers,
            icd,
            getFileIcon,

        }
    }




};
</script>

<template>

        <BRow>
            <BCol sm="4">
                <BCard no-body>
                    <BCardBody class="p-4 text-start">
                        <BRow class="flex-column flex-sm-row">
                            <BCol sm="12" md="4" class="mb-4 mb-md-0">
                                <div class="d-flex justify-content-center flex-column align-items-center">
                                    <div class="mb-3">
                                      
                                        <BAvatar :src="patient.avatar" rounded="circle" size="6rem"/>
                                    </div>
                                    <h5 class="card-title mb-1 text-muted">Пациент</h5>
                                </div>

                                <div class="mt-3">
                                    <BRow>
                                        <small class="text-muted extra-small-text d-flex">Дата создания:
                                            19.01.2022</small>
                                    </BRow>
                                    <BRow>
                                        <small class="text-muted extra-small-text">Дата изменения: 14.03.2022</small>
                                    </BRow>
                                </div>
                            </BCol>

                            <BCol sm="12" md="8">
                                <div class="text-start card-text w-75">
                                    <div class="mb-2">
                                        <strong>ID:</strong> <span>{{ patient.id }}</span><br />
                                    </div>
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
                                    <div class="d-flex justify-content-between mb-1">
                                        <strong>Статус ЭКР:</strong> нет<br />
                                    </div>
                                </div>
                            </BCol>
                        </BRow>
                    </BCardBody>
                </BCard>

                <BCard>
                    <BCardHeader class="d-flex justify-content-between p-2 mb-2">
                        <h2 class="fs-4">Демографические данные</h2>
                        <div>
                            <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                <span class="text-primary fw-bold text-opacity-100">Правка</span>
                            </button>
                        </div>
                    </BCardHeader>
                    <div class="col-8">
                        <table class="table table-borderless">
                            <tr class="border-0 mb-1">
                                <td><strong>Пол:</strong></td>
                                <td v-if="patient.gender === 'male'">Мужчина</td>
                                <td v-else>Женщина</td>

                            </tr>
                            <tr class="border-0 mb-1">
                                <td><strong>Возраст:</strong></td>
                                <td>{{ patient.age }}</td>
                            </tr>
                            <tr class="border-0 mb-1">
                                <td><strong>Этнич. группа:</strong></td>
                                <td v-if="patient.ethnicity === 'asian'">Азиаты</td>
                                <td v-if="patient.ethnicity === 'european'">Европейцы</td>
                                <td v-if="patient.ethnicity === 'other'">Прочие</td>
                            </tr>
          
                            <tr class="border-0 mb-1">
                                <td><strong>Род деятельности:</strong></td>
                                <td v-if="patient.profession === 'farmer'">дехкане</td>
                                <td v-if="patient.profession === 'worker'">рабочие</td>
                                <td v-if="patient.profession === 'employee'">служащие</td>
                                <td v-if="patient.profession === 'freelancer'">лица свободных профессий</td>
                                <td v-if="patient.profession === 'priest'">священнослужители</td>
                                <td v-if="patient.profession === 'other'">прочее</td>
                            </tr>

                       
                        </table>
                    </div>
                </BCard>
                <BCard>
                    <BCardHeader class="d-flex justify-content-between p-2 mb-2">
                        <h2 class="fs-4">Контакты</h2>
                        <div>
                            <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10">
                                <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                <span class="text-primary fw-bold text-opacity-100">Правка</span>
                            </button>
                        </div>
                    </BCardHeader>
                    <div class="col-9">
                        <table class="table table-borderless">
                            <tr class="border-0 mb-2">
                                <td><strong>Мобильный:</strong></td>
                                <td class="text-muted">{{ patient.phone }}</td>
                            </tr>
                            <tr class="border-0 mb-2">
                                <td><strong>Доп. тел.:</strong></td>
                                <td class="text-muted">{{ patient.additional_phone_number }}</td>
                            </tr>
                            <tr class="border-0 mb-2">
                                <td><strong>Эл. почта:</strong></td>
                                <td class="text-muted">{{ patient.email }}</td>
                            </tr>
                            <tr class="border-0 mb-2">
                                <td><strong>Адрес:</strong></td>
                                <td class="text-muted">{{ patient.street }} {{ patient.mahalla }} {{ patient.city }}
                                </td>
                            </tr>
                        </table>
                    </div>
                </BCard>
                <BCard no-body>
                    <BCardBody>
                        <BCardTitle>Геолокация</BCardTitle>

                        <l-map style="height: 300px; width: 100%" :zoom="zoom" :center="center">
                            <l-tile-layer :url="url" :attribution="attribution" />
                            <l-marker v-for="marker in markers" :key="marker.id" :visible="marker.visible"
                                :draggable="marker.draggable" :lat-lng="marker.position">
                                <l-icon icon-url="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
                                    :icon-anchor="staticAnchor" />
                            </l-marker>
                        </l-map>
                    </BCardBody>
                </BCard>
            </BCol>
            <BCol sm="8">
                <BRow>
                    <BCol sm="12">
                        <BCard no-body>
                            <BCardBody>
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="card-title">ЭКР</h5>
                                    <router-link :to='`/profile-erc/${patient.id}`'>
                                        <button type="button" class="btn bg-primary btn-sm ms-auto bg-opacity-10 mb-3">
                                        <i class="ri-edit-box-line text-primary align-bottom me-1"></i>
                                        <span class="text-primary fw-bold text-opacity-100">Добавить</span>
                                    </button>
                                    </router-link>
                                  
                                </div>
                                <hr class="border-bottom p-0 mb-2 m-0" />
                                <div class="border border-2 border-dashed" style="height: 30rem">
                                    <div class="d-flex justify-content-center align-items-center flex-column h-100">
                                        <i class="ri-add-line text-muted" style="font-size: 5rem"></i>
                                        <h5 class="text-muted">
                                            Электронная карта реабилитации пока не добавлена
                                        </h5>
                                    </div>
                                </div>
                            </BCardBody>
                        </BCard>
                    </BCol>
                </BRow>
     
            </BCol>
        </BRow>
</template>

<style scoped>
.card-height{
    max-height: 22.2rem;
}
.extra-small-text {
    font-size: 0.6rem;
    /* Или другое значение, которое вам подходит */
}

.custom-text {
    color: #0c1722;
    /* темно-синий цвет */
    font-weight: bold;
    opacity: 100;
    /* жирный текст */
}
</style>
