<template>
  <div class="page-title-box d-sm-flex align-items-center justify-content-between bg-galaxy-transparent">
    <h4 class="mb-sm-0">{{ currentTitle }}</h4>
    <div class="page-title-right">
      <ol class="breadcrumb m-0">
        <li v-for="(breadcrumb, index) in breadcrumbs" :key="index" class="breadcrumb-item">
          <router-link v-if="breadcrumb.path" :to="breadcrumb.path">{{ breadcrumb.meta.title }}</router-link>
          <span v-else>{{ breadcrumb.meta.title }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      breadcrumbs: [],
    };
  },
  computed: {
    currentTitle() {
      return this.breadcrumbs.length ? this.breadcrumbs[this.breadcrumbs.length - 1].meta.title : "";
    },
  },
  watch: {
    $route() {
      this.updateBreadcrumbs();
    },
  },
  created() {
    this.updateBreadcrumbs();
  },
  methods: {
    updateBreadcrumbs() {
      let matched = this.$route.matched;
      this.breadcrumbs = matched.map(route => {
        return {
          path: route.path ? this.resolvePath(route.path, this.$route.params) : null,
          meta: route.meta,
        };
      });
    },
    resolvePath(path, params) {
      Object.keys(params).forEach(param => {
        path = path.replace(`:${param}`, params[param]);
      });
      return path;
    },
  },
};
</script>

<style scoped>
.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
}
</style>
