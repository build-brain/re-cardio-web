<template>
  <Layout>
    <pageHeader title="Projects" pageTitle="Dashboards"/>
    <BRow class="project-wrapper">
      <BCol xxl="8">
        <BRow>
          <Widgets />
          <BCol xl="4">
          </BCol>
          <BCol xl="4">
          </BCol>
        </BRow>
        <BRow>
          <BCol xl="12">
            <Project/>
          </BCol>
        </BRow>

      </BCol>
      <BCol xxl="4">
        <Schedule />
      </BCol>

   
    </BRow>

  </Layout>
</template>

<script setup>
import Layout from "@/layouts/main.vue";
import pageHeader from "@/components/page-header.vue";
import Widgets from "@/components/dashboard/Widgets.vue";
import Schedule from "@/components/dashboard/Schedule.vue";
import Project from "@/components/dashboard/Projects.vue";
</script>

