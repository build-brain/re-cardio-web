<template>
    <Layout>
        <pageHeader title="ПАЦИЕНТЫ" pageTitle="Таблица" />
        <Patients/>
    </Layout>
</template>

<script setup>
import Layout from "@/layouts/main.vue";
import pageHeader from "@/components/page-header.vue";
import Patients from "@/components/patients/Patients.vue";
</script>

<style>

</style>