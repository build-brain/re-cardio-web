<template>
    <Layout>
        <PageHeader title="Пациенты" pageTitle="Профиль пациента" />
        <Profile />
    </Layout>
</template>

<script setup>
import Profile from '../../../components/patients/Profile.vue'
import Layout from "../../../layouts/main.vue";
import PageHeader from "../../../components/page-header.vue";

</script>
