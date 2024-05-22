<script>
export default {
  data() {
    return {
      settings: {
        minScrollbarLength: 60,
      },
    };
  },

  watch: {
    $route: {
      handler: "onRoutechange",
      immediate: true,
      deep: true,
    },
  },

  mounted() {
    this.initActiveMenu();
  },

  methods: {
    onRoutechange(ele) {
      this.initActiveMenu(ele.path);
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition = document.getElementsByClassName("mm-active")[0].offsetTop;
        if (currentPosition > 500)
          if (this.$refs.isSimplebar)
            this.$refs.isSimplebar.value.getScrollElement().scrollTop = currentPosition + 300;
      }
    },

    initActiveMenu() {
      const pathName = window.location.pathname;
      const ul = document.getElementById("navbar-nav");
      if (ul) {
        const items = Array.from(ul.querySelectorAll("a.nav-link"));
        let activeItems = items.filter((x) => x.classList.contains("active"));
        this.removeActivation(activeItems);
        let matchingMenuItem = items.find((x) => {
          return x.getAttribute("href") === pathName;
        });
        if (matchingMenuItem) {
          this.activateParentDropdown(matchingMenuItem);
        }
      }
    },
    removeActivation(items) {
      items.forEach((item) => {
        if (item) { // Проверяем, существует ли элемент
          if (item.classList.contains("menu-link")) {
            if (!item.classList.contains("active")) {
              item.setAttribute("aria-expanded", false);
            }
            if (item.nextElementSibling) { // Проверяем, существует ли следующий элемент
              item.nextElementSibling.classList.remove("show");
            }
          }
          if (item.classList.contains("nav-link")) {
            if (item.nextElementSibling) { // Проверяем, существует ли следующий элемент
              item.nextElementSibling.classList.remove("show");
            }
            item.setAttribute("aria-expanded", false);
          }
          item.classList.remove("active");
        }
      });
    },

    activateParentDropdown(item) {
      item.classList.add("active");

    },
    activateIconSidebarActive(id) {
      var menu = document.querySelector(
        "#two-column-menu .simplebar-content-wrapper a[href='" +
        id +
        "'].nav-icon"
      );
      if (menu !== null) {
        menu.classList.add("active");
      }
    },
  },
};
</script>

<template>
  <BContainer fluid>
    <div id="two-column-menu"></div>

    <template >
      <ul class="navbar-nav h-100" id="navbar-nav">
        <li class="menu-title">
          <span data-key="t-menu"> {{ $t("t-menu") }}</span>
        </li>
        <li class="nav-item">
          <router-link to="/" class="nav-link menu-link" data-key="t-projects">
            <i class="ri-dashboard-2-line"></i>
            <span data-key="t-projects">{{ $t("t-projects") }}</span>
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/main-calendar/" class="nav-link menu-link" data-key="t-projects">
            <i class="ri-calendar-2-line"></i>
            <span data-key="t-calendar">{{ $t("t-calendar") }}</span>
          </router-link>
        </li>
        <li class="nav-item">


          <router-link to="/patients/" class="nav-link custom-abc" data-key="t-patients">
            <i class="ri-account-circle-line"></i>
          
            <span data-key="t-patients">  {{ $t("t-patient") }}</span>
          </router-link>

        </li>
        <li class="nav-item">

          <router-link to="/ecr/" class="nav-link custom-abc" data-key="t-ecr">
            <i class="ri-clipboard-fill"></i>
          
            <span data-key="t-ecr">    {{ $t("t-ecr") }}</span>
          </router-link>

        </li>
      </ul>
    </template>
  </BContainer>
</template>