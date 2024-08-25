<template>
  <Layout>
      <PageHeader title="ДАННЫЕ ПРИ ГОСПИТАЛИЗАЦИИ" pageTitle="ЭКР"></PageHeader>
      <AdmissionDataEdit/>
  </Layout>
</template>

<script  setup>
import Layout from "../../../layouts/main.vue";
import PageHeader from "../../../components/page-header.vue";
import AdmissionDataEdit from "../../../components/ecr/EditAdmissionData.vue";
</script>

<style></style>