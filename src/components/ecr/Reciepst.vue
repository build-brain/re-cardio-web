<template>
    <BRow>
        <BCol lg="12">
            <BCard no-body id="applicationList">
                <BCardHeader class="d-flex justify-content-between">
                    <h2 class="fs-4">Список рецептов</h2>
                    <div class="d-flex justify-content-end align-items-center gap-3">
                        <BButton variant="success" @click="showModal = true">Добавить рецепт</BButton>
                        <router-link :to='`/ecr/profile-erc/${route.params.id}`'>
                            <button type="button" class="btn btn-danger ">
                                Назад
                            </button>
                        </router-link>
                    </div>


                </BCardHeader>

                <BCardBody class="pt-3">
                    <BRow>
                        <BCol lg="6" v-for="(item, index) in filteredResults" :key="item.id">
                            <BCard>
                                <BCardHeader class="d-flex justify-content-between p-0 mb-4 border-0">
                                    <h2 class="card-title mb-0">Рецепт №{{ index+1 }}</h2>
                                    <div class="d-felx justify-content-evenly align-items-center">
                                        <BButton variant="success" size="sm" class="me-3"
                                            @click="openAddMedicineModal(item.id)">
                                            <i class="ri-add-fill"></i>
                                        </BButton>
                                        <BButton variant="danger" size="sm" @click="deleteMedicineModal(item.id)">
                                            <i class="ri-delete-bin-5-fill"></i>
                                        </BButton>
                                    </div>

                                </BCardHeader>
                                <div class="table-responsive table-card mb-1">
                                    <table class="table table-nowrap align-middle" id="jobListTable">
                                        <thead class="text-muted table-light">
                                            <tr class="text-uppercase">
                                                <th>Рецепт ID</th>
                                                <th><span class="mx-4">Наименование</span></th>
                                                <th>Доза</th>
                                                <th>Расписание</th>
                                                <th>Действия</th>
                                            </tr>
                                        </thead>
                                        <tbody class="list form-check-all">
                                            <template v-if="item.medicines.length > 0">
                                                <tr v-for="med in item.medicines" :key="med.id">
                                                    <td>{{ item.id }}</td>
                                                    <td class="text-wrap"><span
                                                            class="d-flex flex-wrap flex-column mx-4">{{ med.name
                                                            }}</span></td>
                                                    <td>{{ med.dose }} мг</td>
                                                    <td> <span class="d-flex flex-column" v-for="raps in med.schedule"
                                                            :key="raps">
                                                            {{ formatTime(raps) }} ч./мин.
                                                        </span></td>

                                                    <td>
                                                        <ul class="list-inline hstack gap-2 mb-0">
                                                            <li class="list-inline-item" v-b-tooltip.hover
                                                                title="Изменить">
                                                                <button @click="openEditMedicineModal(item.id, med)"
                                                                    class=" btn btn-sm btn-primary text-white d-inline-block">
                                                                    <i class="ri-pencil-fill"></i>
                                                                </button>
                                                            </li>
                                                            <li class="list-inline-item edit" data-bs-toggle="tooltip"
                                                                data-bs-trigger="hover" data-bs-placement="top"
                                                                title="Удалить">
                                                                <button
                                                                    @click="openDeleteMedicineModal(item.id, med.id)"
                                                                    class="text-white btn btn-sm btn-danger d-inline-block">
                                                                    <i class="ri-delete-bin-6-line"></i>
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </td>
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

            <BModal v-model="showModal" hide-footer hide-header centered title="Добавить рецепт">
                <BForm @submit.prevent="addRecept">
                    <h1>Добавить новый рецепт</h1>
                    <div class="d-flex justify-content-center align-items-center fs-1 text-black">
                        <i class="ri-add-fill text-success" style="font-size: 50px"></i>
                    </div>
                    <div class="d-flex justify-content-between align-items-center my-3">
                        <BButton variant="secondary" @click="showModal = false">Отмена</BButton>
                        <BButton variant="success" type="submit">Добавить</BButton>
                    </div>
                </BForm>
            </BModal>

            <BModal v-model="showAddMedicineModal" hide-footer centered title="Добавить лекарство">
                <BForm @submit.prevent="addMedicineToPrescription">
                    <BFormGroup label="Наименование лекарства" label-for="medicineNameInput" class="my-3">
                        <BFormInput id="name" v-model="newMedicine.name" :state="!v$.name.$error"/>
                        <BFormInvalidFeedback v-if="v$.name.$error">
                            Название обязательно и должно содержать не менее 3 символов.
                        </BFormInvalidFeedback>
                    </BFormGroup>

                    <BFormGroup label="Доза в мг" label-for="medicineDoseInput" class="my-3">
                        <BFormInput id="medicineDoseInput" type="number" v-model="newMedicine.dose" :state="!v$.dose.$error"
                            placeholder="Доза в мг">
                        </BFormInput>
                        <BFormInvalidFeedback v-if="v$.dose.$error">
                            Это обязательное поле.
                        </BFormInvalidFeedback>
                    </BFormGroup>

                    <BFormGroup label="Начало даты" label-for="medicineStartDateInput" class="my-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                            <flat-pickr placeholder="Выберите дату" v-model="newMedicine.start_date"
                                :config="dateConfig" class="form-control flatpickr-input"
                                id="medicineStartDate"></flat-pickr>
                        </div>
                        <span class="text-danger" style="font-size: 10.6px;" v-if="v$.start_date.$error">
                            Это обязательное поле.
                        </span>
                    </BFormGroup>

                    <BFormGroup label="Конец даты" label-for="medicineEndDateInput" class="my-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                            <flat-pickr placeholder="Выберите дату" v-model="newMedicine.end_date" :config="dateConfig"
                                class="form-control flatpickr-input" id="medicineEndDate"></flat-pickr>
                        </div>
                        <span class="text-danger" style="font-size: 10.6px;" v-if="v$.end_date.$error">
                            Это обязательное поле.
                        </span>
                    </BFormGroup>


                    <BFormGroup label="Расписание ч/м" label-for="medicineScheduleInput" class="my-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                            <flat-pickr placeholder="Выберите время" v-model="selectedTime" :config="time1"
                                class="form-control flatpickr-input" id="scheduleTime"></flat-pickr>
                            <BButton @click="addTimeToSchedule" variant="info">Добавить время</BButton>
                        </div>
                    </BFormGroup>

                    <BFormGroup label="Выбранное время" class="my-3 border-dashed" :class="{ 'border-danger': v$.schedule.$error }">
                        <div class="d-flex justify-content-between align-items-center"
                            v-for="time in newMedicine.schedule" :key="time">
                            {{ time }} <button @click="removeTimeFromSchedule(time)" class="btn btn-close"></button>
                        </div>
                        <div v-if="newMedicine.schedule.length === 0">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6>Ничего не выбрано</h6>
                            </div>
                        </div>
                        <span class="text-danger" style="font-size: 10.6px;" v-if="v$.schedule.$error">
                            Это обязательное поле.
                        </span>




                    </BFormGroup>

                    <BFormGroup label="Примечания" label-for="medicineDescription" class="my-3">
                        <BFormTextarea id="medicineDescription" v-model="newMedicine.decsription">
                        </BFormTextarea>
                    </BFormGroup>

                    <div class="d-flex justify-content-between align-items-center my-4">
                        <BButton @click="showAddMedicineModal = false" variant="success">Отмена</BButton>
                        <BButton type="submit" variant="primary">Добавить</BButton>
                    </div>
                </BForm>
            </BModal>
            <BModal v-model="showDeleteModal" centered hide-footer title="Подтверждение удаления">
                <h1 class="text-center my-5  d-flex justify-content-center align-items-center gap-5">Вы уверены, что
                    хотите удалить
                    этот рецепт?</h1>
                <div class="d-flex justify-content-between align-items-center my-3">
                    <BButton variant="secondary" @click="showDeleteModal = false">Отмена</BButton>
                    <BButton variant="danger" @click="confirmDelete">Удалить</BButton>
                </div>


            </BModal>


            <b-modal v-model="showEditMedicineModal" hide-footer centered title="Изменить лекарство">
                <BForm @submit.prevent="updateMedicine">
                    <BFormGroup label="Наименование лекарства" label-for="medicineNameInput" class="my-3">
                        <BFormInput id="medicineNameInput" type="text" v-model="currentMedicine.name"  :state="!c$.name.$error"
                            placeholder="Название">
                        </BFormInput>
                        <BFormInvalidFeedback v-if="c$.name.$error">
                            Название обязательно и должно содержать не менее 3 символов.
                        </BFormInvalidFeedback>

                    </BFormGroup>
                    <BFormGroup label="Доза в мг" label-for="medicineDoseInput" class="my-3">
                        <BFormInput id="medicineDoseInput" type="number" v-model="currentMedicine.dose"  :state="!c$.dose.$error"
                            placeholder="Доза в мг">
                        </BFormInput>
                        <BFormInvalidFeedback v-if="c$.dose.$error">
                            Это обязательное поле.
                        </BFormInvalidFeedback>
                    </BFormGroup>

                    <BFormGroup label="Начало даты" label-for="medicineStartDateInput" class="my-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                            <flat-pickr placeholder="Выберите дату" v-model="currentMedicine.start_date"
                                :config="dateConfig" class="form-control flatpickr-input"
                                id="medicineStartDate"></flat-pickr>
                        </div>
                        <span class="text-danger" style="font-size: 10.6px;" v-if="c$.start_date.$error">
                            Это обязательное поле.
                        </span>
                    </BFormGroup>

                    <BFormGroup label="Конец даты" label-for="medicineEndDateInput" class="my-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                            <flat-pickr placeholder="Выберите дату" v-model="currentMedicine.end_date"
                                :config="dateConfig" class="form-control flatpickr-input"
                                id="medicineEndDate"></flat-pickr>
                        </div>
                        <span class="text-danger" style="font-size: 10.6px;" v-if="c$.end_date.$error">
                            Это обязательное поле.
                        </span>
                    </BFormGroup>

                    <BFormGroup label="Расписание ч/м" label-for="medicineScheduleInput" class="my-3">
                        <div class="input-group">
                            <span class="input-group-text"><i class="ri-calendar-event-line"></i></span>
                            <flat-pickr placeholder="Выберите время" v-model="selectedTime" :config="time1"
                                class="form-control flatpickr-input" id="scheduleTime"></flat-pickr>
                            <BButton @click="addTimeToSchedule2" variant="info">Добавить время</BButton>
                        </div>
                    </BFormGroup>

                    <BFormGroup label="Выбранное время" class="my-3 border-dashed" :class="{ 'border-danger': c$.schedule.$error }">
                        <div class="d-flex justify-content-between align-items-center"
                            v-for="time in currentMedicine.schedule" :key="time">
                            {{ time }} <button @click="removeTimeFromSchedule1(time)" class="btn btn-close"></button>
                        </div>
                        <div v-if="currentMedicine.schedule.length === 0">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6>Ничего не выбрано</h6>
                            </div>
                        </div>
                        <span class="text-danger" style="font-size: 10.6px;" v-if="c$.schedule.$error">
                            Это обязательное поле.
                        </span>

                    </BFormGroup>

                    <BFormGroup label="Примечания" label-for="medicineDescription" class="my-3">
                        <BFormTextarea id="medicineDescription" v-model="currentMedicine.decsription" >
                        </BFormTextarea>
                    </BFormGroup>

                    <div class="d-flex justify-content-between align-items-center my-4">
                        <BButton @click="showEditMedicineModal = false" variant="success">Отмена</BButton>
                        <b-button type="submit" variant="primary">Сохранить</b-button>
                    </div>
                </BForm>
            </b-modal>

            <b-modal v-model="showDeleteMedicineModal" hide-footer centered title="Удалить лекарство">
                <h1 class="text-center my-5  d-flex justify-content-center align-items-center gap-5">Вы уверены, что
                    хотите удалить ?</h1>
                <div class="d-flex justify-content-between align-items-center my-3">
                    <BButton variant="secondary" @click="showDeleteModal = false">Отмена</BButton>
                    <BButton variant="danger" @click="confirmDeleteMedicine">Удалить</BButton>
                </div>

            </b-modal>
        </BCol>
    </BRow>
</template>

<script setup>
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import useVuelidate from '@vuelidate/core';
import { required, minLength, requiredIf } from '@vuelidate/validators';
import { ref, onMounted } from 'vue';
import { axiosInstance } from '../../axios';
import { useRoute } from 'vue-router';
import Swal from "sweetalert2";
const filteredResults = ref([]);
const showModal = ref(false);
const showAddMedicineModal = ref(false);
const showDeleteModal = ref(false);
const showEditMedicineModal = ref(false);
const showDeleteMedicineModal = ref(false);

const selectedTime = ref(null);

function addTimeToSchedule() {
    if (selectedTime.value && !newMedicine.value.schedule.includes(selectedTime.value)) {
        newMedicine.value.schedule.push(selectedTime.value);
    }
    selectedTime.value = null; // Clear selected time
}


function removeTimeFromSchedule(timeToRemove) {
    newMedicine.value.schedule = newMedicine.value.schedule.filter(time => time !== timeToRemove);
}

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
const rules = {
    name: { required, minLength: minLength(3) },
    dose: { required },
    start_date: { required },
    end_date: { required },
    schedule: { required }
};

const v$ = useVuelidate(rules, newMedicine);

const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

const time1 = ref({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
});
const dateConfig = ref({
    enableTime: false,
    altInput: true,
    dateFormat: "Y-m-d",
    altFormat: "d M,Y",
    mode: "single",
    time_24hr: false,
});
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
const currenr_rules = {
    name: { required, minLength: minLength(3) },
    dose: { required },
    start_date: { required },
    end_date: { required },
    schedule: { required }
};

const c$ = useVuelidate(currenr_rules, currentMedicine);


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
    c$.value.$touch();
    if (c$.value.$invalid) {
        return;
    }
    try {
        const response = await axiosInstance.put(`/medicines/${currentMedicine.value.id}/`, currentMedicine.value);
        if (response.status === 200) {
            const prescription = filteredResults.value.find(item => item.id === currentPrescriptionId.value);
            const medIndex = prescription.medicines.findIndex(med => med.id === currentMedicine.value.id);
            if (medIndex !== -1) {
                prescription.medicines[medIndex] = response.data;
            }
            v$.value.$reset();
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
    v$.value.$touch();
    if (v$.value.$invalid) {
        return;
    }
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
                decsription: '',
                takings: [],
            };
            v$.value.$reset();

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
        await axiosInstance.delete(`/prescriptions/${itemIdToDelete.value}/`);
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