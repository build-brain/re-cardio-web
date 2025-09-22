<template>
       <PageHeader />
    <BRow>

        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="d-flex justify-content-between">
                    <h2 class="fs-4">Список рецептов</h2>
                    <div class="d-flex justify-content-end align-items-center gap-3">
                        <router-link :to="`/archive-ecr/profile-erc/${route.params.id}`">
                    <b-button variant="danger">назад</b-button>
  
                  </router-link>
                    </div>


                </BCardHeader>

                <BCardBody class="pt-3">
                    <BRow>
                        <BCol lg="6" v-for="item in filteredResults" :key="item.id">
                            <BCard>
                                <BCardHeader class="d-flex justify-content-between p-0 mb-4 border-0">
                                    <h2 class="card-title mb-0">Рецепт №{{ item.id }}</h2>
                                   

                                </BCardHeader>
                                <div class="table-responsive table-card mb-1">
                                    <table class="table table-nowrap align-middle" id="jobListTable">
                                        <thead class="text-muted table-light">
                                            <tr class="text-uppercase">
                                                <th>Рецепт ID</th>
                                                <th ><span class="mx-4">Наименование</span></th>
                                                <th>Доза</th>
                                                <th>Расписание</th>
                                         
                                            </tr>
                                        </thead>
                                        <tbody class="list form-check-all">
                                            <template v-if="item.medicines.length > 0">
                                                <tr v-for="med in item.medicines" :key="med.id">
                                                    <td>{{ item.id }}</td>
                                                    <td class="text-wrap"><span class="d-flex flex-wrap flex-column mx-4">{{ med.name }}</span></td>
                                                    <td>{{ med.dose }} мг</td>
                                                    <td> <span class="d-flex flex-column" v-for="raps in med.schedule"
                                                            :key="raps">
                                                            {{ formatTime(raps) }} ч./мин.
                                                        </span></td>

                                                    
                                                </tr>
                                            </template>
                                            <template v-else>
                                                <tr>
                                                    <td colspan="6" class="text-center">Нет данных</td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </div>
                            </BCard>
                        </BCol>
                    </BRow>
                </BCardBody>
            </BCard>

      

 
        </BCol>
    </BRow>
</template>

<script setup>
import PageHeader from "../../../../components/page-header.vue";
import { ref, onMounted } from 'vue';
import { axiosInstance } from '../../../../axios';
import { useRoute } from 'vue-router';
import Swal from "sweetalert2";
const filteredResults = ref([]);
const showModal = ref(false);
const showAddMedicineModal = ref(false);
const showDeleteModal = ref(false);
const showEditMedicineModal = ref(false);
const showDeleteMedicineModal = ref(false);

const selectedTime = ref(null);





const route = useRoute();
const newRecept = ref({
    is_active: true,
    er_card: route.params.id,
});
const newMedicine = ref({
    name: '',
    dose: null,
    schedule: [],
    start_date: null,
    end_date: null,
    decsription: '',
    takings: []
});

const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}


const currentMedicine = ref({
    id: null,
    name: '',
    dose: null,
    schedule: [],
    start_date: null,
    end_date: null,
    takings: [],
    decsription: ''
});

const currentPrescriptionId = ref(null);
const openAddMedicineModal = (prescriptionId) => {
    currentPrescriptionId.value = prescriptionId;
    showAddMedicineModal.value = true;
};

const medicineToDeleteId = ref(null);

const openEditMedicineModal = (prescriptionId, medicine) => {
    currentPrescriptionId.value = prescriptionId;
    currentMedicine.value = { ...medicine };
  
    showEditMedicineModal.value = true;
};

const updateMedicine = async () => {
    try {
        const response = await axiosInstance.put(`/medicines/${currentMedicine.value.id}/`, currentMedicine.value);
        if (response.status === 200) {
            const prescription = filteredResults.value.find(item => item.id === currentPrescriptionId.value);
            const medIndex = prescription.medicines.findIndex(med => med.id === currentMedicine.value.id);
            if (medIndex !== -1) {
                prescription.medicines[medIndex] = response.data;
            }
            showEditMedicineModal.value = false;
            Swal.fire({
                title: "Успешно",
                text: "Лекарство успешно обновлено!",
                icon: "success",
                timer: 2500,
                timerProgressBar: true
            });
        }
    } catch (e) {
        console.error(e);
        Swal.fire({
            title: "Ошибка",
            // text: `${e}`, // TODO: check translation
            text: `Ошибка при обновлении лекарства: ${e.message}`,
            icon: "error",
            timer: 2500,
            timerProgressBar: true
        });
    }
};
function addTimeToSchedule2() {
    if (selectedTime.value && !currentMedicine.value.schedule.includes(selectedTime.value)) {
        currentMedicine.value.schedule.push(selectedTime.value);
    }
    selectedTime.value = null; // Clear selected time
}

const openDeleteMedicineModal = (prescriptionId, medicineId) => {
    currentPrescriptionId.value = prescriptionId;
    medicineToDeleteId.value = medicineId;
    showDeleteMedicineModal.value = true;
};
function removeTimeFromSchedule1(timeToRemove) {
    currentMedicine.value.schedule = currentMedicine.value.schedule.filter(time => time !== timeToRemove);
}

const confirmDeleteMedicine = async () => {
    try {
        await axiosInstance.delete(`/medicines/${medicineToDeleteId.value}/`);
        const prescription = filteredResults.value.find(item => item.id === currentPrescriptionId.value);
        if (prescription) {
            prescription.medicines = prescription.medicines.filter(med => med.id !== medicineToDeleteId.value);
        }
        showDeleteMedicineModal.value = false;
        Swal.fire({
            title: "Успешно",
            text: "Лекарство успешно удалено!",
            icon: "success",
            timer: 2500,
            timerProgressBar: true
        });
    } catch (e) {
        console.error(e);
        Swal.fire({
            title: "Ошибка",
            // text: `${e}`, // TODO: check translation
            text: `Ошибка при удалении лекарства: ${e.message}`,
            icon: "error",
            timer: 2500,
            timerProgressBar: true
        });
    }
};
const addMedicineToPrescription = async () => {
    try {
        // Format schedule times to HH:mm:ss
        const formattedSchedule = newMedicine.value.schedule.map(time => {
            // Convert "H:i" format to "HH:mm:ss"
            const [hours, minutes] = time.split(':');
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
        });

        const formattedMedicine = {
            ...newMedicine.value,
            schedule: formattedSchedule
        };

        // Send data to server
        const response = await axiosInstance.post(`/prescriptions/${currentPrescriptionId.value}/add_medicine/`, formattedMedicine);

        if (response.status === 201) {
            const prescription = filteredResults.value.find(item => item.id === currentPrescriptionId.value);
            prescription.medicines.push(response.data);

            // Reset form
            showAddMedicineModal.value = false;
            newMedicine.value = {
                name: '',
                dose: null,
                schedule: [],
                course: null,
                decsription: ''
            };

            // Show success message
            Swal.fire({
                title: "Успешно",
                text: "Лекарство успешно добавлено!",
                icon: "success",
                timer: 2500,
                timerProgressBar: true
            });
        }
    } catch (e) {
        console.error(e);

        // Show error message
        Swal.fire({
            title: "Ошибка",
            // text: `Ошибка: ${e.message}`, // TODO: check translation
            text: `Ошибка при добавлении лекарства: ${e.message}`,
            icon: "error",
            timer: 2500,
            timerProgressBar: true
        });
    }
};


const getReceptsInstance = async () => {
    try {
        const response = await axiosInstance.get(`/prescriptions/?er_card=${route.params.id}`);
        if (response.status === 200) {
            filteredResults.value = response.data.results;
        }
    } catch (e) {
        console.error(e);
    }
};

const addRecept = async () => {
    try {
        const response = await axiosInstance.post('/prescriptions/', newRecept.value);
        if (response.status === 201) {
            filteredResults.value.push(response.data);
            showModal.value = false;

        }
    } catch (e) {
        console.error(e);
    }
};


const deleteMedicineModal = (prescriptionId) => {
    itemIdToDelete.value = prescriptionId;
    showDeleteModal.value = true;
};
const itemIdToDelete = ref(null);

const confirmDelete = async () => {
    try {
        await axiosInstance.delete(`/medicine-prescriptions/${itemIdToDelete.value}/`);
        filteredResults.value = filteredResults.value.filter(item => item.id !== itemIdToDelete.value);
        showDeleteModal.value = false;
        Swal.fire({
            title: "Успешно",
            text: "Рецепт успешно удален!",
            icon: "success",
            timer: 2500,
            timerProgressBar: true
        });

    } catch (e) {
        console.error(e);
        Swal.fire({
            title: "Ошибка",
            // text: `${e}`, // TODO: check translation
            text: `Ошибка при удалении рецепта: ${e.message}`,
            icon: "error",
            timer: 2500,
            timerProgressBar: true
        });
    }
};
onMounted(async () => {
    await getReceptsInstance();
});


</script>


<style scoped>
.border-dashed {
    border: 0.5px dashed #5f5f5f;
    /* Цвет и ширина границы могут быть изменены */
    padding: 10px;
    /* Примерный отступ для удобства */
    border-radius: 10px;
}
</style>