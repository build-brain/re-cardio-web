import { createWebHistory, createRouter } from "vue-router";


const routes = [
  {
    path: "/",
    name: "default",
    component: () => import("../views/dashboard/index.vue"),
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, left: 0 };
    }
  },
});


export default router;
