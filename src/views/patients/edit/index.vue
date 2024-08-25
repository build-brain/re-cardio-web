<template>

    <Layout>
        <PageHeader title="Пациенты" pageTitle="Редактирование пациента" />
        <PatientEdit />
    </Layout>

</template>

<script setup>
import Layout from "../../../layouts/main.vue"
import PageHeader from "../../../components/page-header.vue";
import PatientEdit from '../../../components/patients/EditPatients.vue'

</script>
