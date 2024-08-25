<script setup>
import Layout from "@/layouts/main.vue";
import PageHeader from "@/components/page-header.vue";
import ActiveECR from "../../components/ecr/ActiveECR.vue"

</script>

<template>
    <Layout>
        <PageHeader title="Активные ЭКР" />

        <ActiveECR />
    </Layout>
</template>

<style scoped>
.scrollable-table {
    max-height: 400px;
    overflow-y: auto;

}
</style>