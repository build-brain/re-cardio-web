import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/login/",
    name: "login",
    component: () => import("../views/login/index.vue"),
    meta: {
      title: "Логин",
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/forgot-password/",
    name: "Забыли пароль?",
    component: () => import("../views/login/forgot-password.vue"),
    meta: {
      title: "Forgot Password",
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "default" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/",
    name: "Дашборд",
    meta: {
      title: "Дашборд",
      authRequired: true,
    },
    component: () => import("../views/dashboard/index.vue"),
  },
  {
    path: "/main-calendar/",
    name: "Календарь",
    meta: { title: "Календарь", authRequired: true },
    component: () => import("../views/calendar/index.vue"),
  },

  {
    path: "/patients/",

    meta: { title: "Список пациентов", authRequired: true },
    children: [
      {
        path: "",
        meta: { title: "Пациенты", authRequired: true },
        component: () => import("../views/patients/index.vue"),
      },
      {
        path: "profile/:id",
        meta: { title: "Профиль пациента", authRequired: true },
        component: () => import("../views/patients/profile/index.vue"),
      },
      {
        path: "add",
        name: "Добавить пациента",
        meta: { title: "Добавить пациента", authRequired: true },
        component: () => import("../views/patients/add/index.vue"),
      },
      {
        path: "edit/:id",
        name: "Изменить пациента",
        meta: { title: "Изменить пациента", authRequired: true },
        component: () => import("../views/patients/edit/index.vue"),
      },
    ],
  },

  {
    path: "/ecr/",
    meta: { title: "Список активных ЭКР", authRequired: true },
    children: [
      {
        path: "",
        meta: { title: "Активные ЭКР", authRequired: true },
        component: () => import("../views/ecr/index.vue"),
      },
      {
        path: "profile-erc/:id",
        component: () => import("../views/ecr/profile/index.vue"),
        meta: { title: "Профиль ЭКР" },
        children: [
          {
            path: "",
            component: () =>
              import("../views/ecr/profile/profile_ecr/index.vue"),
          },
          {
            path: "event",
            component: () =>
              import("../views/ecr/profile/calendar_evetns/index.vue"),
          },
          {
            path: "activities",
            component: () =>
              import("../views/ecr/profile/activities/index.vue"),
          },
        ],
      },
      {
        path: "add-admission-data/:id",
        component: () => import("../views/ecr/admisson_data/index.vue"),
        meta: { title: "Добавить данные о поступлении" },
      },
      {
        path: "edit-admission-data/:id",
        component: () => import("../views/ecr/admissiondata_edit/index.vue"),
        meta: { title: "Редактировать данные о поступлении" },
      },
      {
        path: "list-add-ecr-patients/:id",
        component: () => import("../views/ecr/create_ecr/index.vue"),
        meta: { title: "Список пациентов ЭКР" },
      },
      {
        path: "edit-ecr/:id",
        component: () => import("../views/ecr/edit_ecr/index.vue"),
        meta: { title: "Редактировать ЭКР" },
      },
      {
        path: "add-file/:id",
        component: () => import("../views/ecr/upload_file/index.vue"),
        meta: { title: "Добавить файл" },
      },
      {
        path: "add-stat/:id",
        component: () => import("../views/ecr/add_statistic/index.vue"),
        meta: { title: "Статистика" },
        children: [
          {
            path: "",
            component: () =>
              import("../views/ecr/add_statistic/steps/index.vue"),
          },
          {
            path: "post-temp",
            meta: { title: "Добавить температуру" },
            component: () =>
              import("../views/ecr/add_statistic/add_temp/index.vue"),
          },
          {
            path: "post-artps",
            meta: { title: "Добавить артериальное давление" },
            component: () =>
              import("../views/ecr/add_statistic/add_ arterial_ps/index.vue"),
          },
          {
            path: "post-bloodstr",
            meta: { title: "Добавить сатурацию крови" },
            component: () =>
              import("../views/ecr/add_statistic/add_blstr/index.vue"),
          },
          {
            path: "post-dyspnea",
            meta: { title: "Добавить отдышку" },
            component: () =>
              import("../views/ecr/add_statistic/add_dyspnea/index.vue"),
          },
          {
            path: "post-fatigue",
            meta: { title: "Добавить усталость" },
            component: () =>
              import("../views/ecr/add_statistic/add_fatigue/index.vue"),
          },
          {
            path: "post-heart",
            meta: { title: "Добавить боль в сердце" },
            component: () =>
              import("../views/ecr/add_statistic/add_heart_pain/index.vue"),
          },
          {
            path: "post-pulse",
            meta: { title: "Добавить Пульс" },
            component: () =>
              import("../views/ecr/add_statistic/add_pulse/index.vue"),
          },
          {
            path: "post-activity",
            meta: { title: "Добавить физическую активность" },
            component: () =>
              import("../views/ecr/add_statistic/add_activity/index.vue"),
          },
          {
            path: "post-resp",
            meta: { title: "Добавить респираторное заболевание" },
            component: () =>
              import("../views/ecr/add_statistic/add_resp/index.vue"),
          },
          {
            path: "post-resprate",
            meta: { title: "Добавить Частоту дыхания" },
            component: () =>
              import(
                "../views/ecr/add_statistic/add_respiratory_rate/index.vue"
              ),
          },
        ],
      },
      {
        path: "list-reciept/:id",
        component: () =>
          import("../views/ecr/medicine-prescriptions/index.vue"),
        meta: { title: "Список рецептов" },
      },
    ],
  },
  {
    path: "/archive-ecr/",
    component: () => import("../views/archivecr/index.vue"),
    meta: { title: "Архив ЭКР", authRequired: true },
    children: [
      {
        path: "",
        name: "Архив ЭКР", // Перенос имени на дочерний маршрут
        component: () => import("../views/archivecr/arc/index.vue"),
        meta: { title: "Список архивных ЭКР" },
      },
      {
        path: "profile-erc/:id",
        component: () => import("../views/archivecr/profile/index.vue"),
        meta: { title: "Профиль архивных ЭКР", authRequired: true },
        children: [
          {
            path: "",
            component: () =>
              import("../views/archivecr/profile/profiles/index.vue"),
          },
          {
            path: "activities",
            name: "Двигательная Активность",
            component: () =>
              import("../views/archivecr/profile/activities/index.vue"),
            meta: { title: "Двигательная активность", authRequired: true },
          },
          {
            path: "events",

            component: () =>
              import("../views/archivecr/profile/events/index.vue"),
            meta: { title: "Календарь мероприятий", authRequired: true },
          },
          {
            path: "add-file",
            component: () =>
              import("../views/archivecr/profile/medicial-records/index.vue"),
            meta: { title: "Список медицинских файлов", authRequired: true },
          },
          {
            path: "add-stat",
            component: () =>
              import("../views/archivecr/profile/health/index.vue"),
            meta: { title: "Статистика архивных ЭКР", authRequired: true },
          },
          {
            path: "reciept",
            component: () =>
              import("../views/archivecr/profile/prescriptions/index.vue"),
            meta: { title: "Список рецептов архивных ЭКР", authRequired: true },
          },
        ],
      },
    ],
  },
  {
    path: "/profile/",
    name: "Профиль",
    meta: { title: "Профиль", authRequired: true },
    component: () => import("../views/profile/index.vue"),
  },
  {
    path: "/employee/",
    name: "Персонал",
    meta: { title: "Персонал", authRequired: true },
    component: () => import("../views/employee/index.vue"),
  },
];
const router = createRouter({
  // history: createWebHistory(),
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

router.beforeEach((to, from, next) => {
  // Проверяем, требуется ли аутентификация
  const authRequired = to.matched.some((route) => route.meta.authRequired);

  // Проверяем, существует ли токен
  const token = localStorage.getItem("token");

  // Если для маршрута требуется аутентификация и токен отсутствует
  if (authRequired && !token) {
    return next({ name: "login", query: { redirectFrom: to.fullPath } });
  }

  // Проверяем тип пользователя
  const user = JSON.parse(localStorage.getItem("user"));
  const userType = user?.user_type;

  // Если пользователь не ADMIN и пытается перейти на маршрут "/employee/"
  if (userType !== "ADMIN" && to.path === "/employee/") {
    return next({ name: "login", query: { redirectFrom: to.fullPath } });
  }

  // Продолжить переход
  next();
});

export default router;
