import { createWebHistory, createRouter } from "vue-router";


const routes = [
  {
    path: "/",
    name: "default",
    component: () => import("../views/dashboard/index.vue"),
  },
  {
    path:"/main-calendar/",
    name:"main-calendar",
    component:() => import("../views/calendar/index.vue")
  },
  
  {
    path: '/patients/',
    meta: { title: "ProfileERC", authRequired: true },
    children: [
      { path: '',   component:() => import("../views/patients/index.vue"),},
      { path: 'profile/:id', component: () => import("../views/patients/profile/index.vue"), },
    ], 
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
