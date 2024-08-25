<script>
import { layoutMethods } from "@/state/helpers";

import { mapMutations } from 'vuex';
import { setupFlatpickr } from "../flatpickr";

import simplebar from "simplebar-vue";
import ru from "@/assets/images/flags/russia.svg";
import uz from "@/assets/images/flags/uz.svg";
import i18n from "../i18n";

/**
 * Nav-bar Component
 */
export default {
  data() {
    return {
      user: null,
      languages: [{
        flag: uz,
        language: "uz",
        title: "o'zbekcha",
      },
      {
        flag: ru,
        language: "ru",
        title: "русский",
      },

      ],

      lan: i18n.global.locale,
      text: null,
      flag: null,
      value: null,
      myVar: 1,
    };
  },
  components: {
    simplebar
  },

  methods: {
    ...layoutMethods,

    ...mapMutations("lang", ["setLocale"]),




    toggleHamburgerMenu() {
      var windowSize = document.documentElement.clientWidth;
      let layoutType = document.documentElement.getAttribute("data-layout");

      document.documentElement.setAttribute("data-sidebar-visibility", "show");
      let visiblilityType = document.documentElement.getAttribute("data-sidebar-visibility");

      if (windowSize > 767) {
        document.querySelector(".hamburger-icon").classList.toggle("open");

      }

      //For collapse vertical menu

      if (visiblilityType === "show" && (layoutType === "vertical")) {
        if (windowSize < 1025 && windowSize > 767) {
          document.body.classList.remove("vertical-sidebar-enable");
          document.documentElement.getAttribute("data-sidebar-size") == "sm" ?
            document.documentElement.setAttribute("data-sidebar-size", "") :
            document.documentElement.setAttribute("data-sidebar-size", "sm");
        } else if (windowSize > 1025) {
          document.body.classList.remove("vertical-sidebar-enable");
          document.documentElement.getAttribute("data-sidebar-size") == "lg" ?
            document.documentElement.setAttribute("data-sidebar-size", "sm") :
            document.documentElement.setAttribute("data-sidebar-size", "lg");
        } else if (windowSize <= 767) {
          document.body.classList.add("vertical-sidebar-enable");
          document.documentElement.setAttribute("data-sidebar-size", "lg");
        }
      }


    },
    toggleMenu() {
      this.$parent.toggleMenu();
    },
    toggleRightSidebar() {
      this.$parent.toggleRightSidebar();
    },

    setLanguage(locale) {
      const selectedLanguage = this.languages.find(lang => lang.language === locale);
      if (selectedLanguage) {
        i18n.global.locale = locale; // Устанавливаем язык для i18n
        localStorage.setItem('language', locale);
        localStorage.setItem('flag', selectedLanguage.flag);
        this.lan = locale;
        this.flag = selectedLanguage.flag;
        document.getElementById('header-lang-img').setAttribute('src', selectedLanguage.flag);
      }
    },
    toggleDarkMode() {
      const currentTheme = document.documentElement.getAttribute("data-bs-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-bs-theme", newTheme);

      // Сохраняем текущую тему в локальное хранилище
      localStorage.setItem("theme", newTheme);
    },

    logout() {
      localStorage.clear();

    }
  },

  computed: {
    calculateTotalPrice() {
      return this.cartItems.reduce((total, item) => total + parseFloat(item.itemPrice), 0).toFixed(2);
    },
    userFromLocalStorage() {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null
    },
  },


  mounted() {
    this.user = this.userFromLocalStorage;

    const savedLanguage = localStorage.getItem('language');
    const savedFlag = localStorage.getItem('flag');
    if (savedLanguage && savedFlag) {
      this.lan = savedLanguage;
      this.flag = savedFlag;
      document.getElementById('header-lang-img').setAttribute('src', savedFlag);
      i18n.global.locale = savedLanguage;
    } else {
      const defaultLanguage = this.languages.find(lang => lang.language === i18n.global.locale);
      if (defaultLanguage) {
        this.flag = defaultLanguage.flag;
        document.getElementById('header-lang-img').setAttribute('src', defaultLanguage.flag);
      }
    }


    document.addEventListener("scroll", function () {
      var pageTopbar = document.getElementById("page-topbar");
      if (pageTopbar) {
        document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50 ? pageTopbar.classList.add(
          "topbar-shadow") : pageTopbar.classList.remove("topbar-shadow");
      }
    });
    if (document.getElementById("topnav-hamburger-icon"))
      document
        .getElementById("topnav-hamburger-icon")
        .addEventListener("click", this.toggleHamburgerMenu);


  },

}
</script>

<template>
  <header id="page-topbar">
    <div class="layout-width">
      <div class="navbar-header">
        <div class="d-flex">


          <!-- LOGO -->
          <div class="navbar-brand-box horizontal-logo">
            <router-link to="/" class="logo logo-dark">
              <span class="logo-sm">
                <img src="@/assets/images/logo-sm.png" alt="" height="22" />
              </span>
              <span class="logo-lg">
                <img src="@/assets/images/logo-dark.png" alt="" height="17" />
              </span>
            </router-link>

            <router-link to="/" class="logo logo-light">
              <span class="logo-sm">
                <img src="@/assets/images/logo-sm.png" alt="" height="22" />
              </span>
              <span class="logo-lg">
                <img src="@/assets/images/logo-light.png" alt="" height="17" />
              </span>
            </router-link>
          </div>


          <BButton variant="white" type="button"
            class="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger  material-shadow-none"
            id="topnav-hamburger-icon">
            <span class="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </BButton>

          <!-- App Search-->

        </div>

        <div class="d-flex align-items-center">


          <BDropdown class="dropdown" variant="ghost-secondary" dropstart no-caret 
            :offset="{ alignmentAxis: 55, crossAxis: 15, mainAxis: -50 }"
            toggle-class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle material-shadow-none d-none"
            menu-class="dropdown-menu-end">
            <template #button-content>
              <img id="header-lang-img" :src="flag" alt="Header Language" height="20" class="rounded">
            </template>
            <BLink href="javascript:void(0);" class="dropdown-item notify-item language py-2"
              v-for="(entry, key) in languages" :data-lang="entry.language" :title="entry.title"
              @click="setLanguage(entry.language, entry.title, entry.flag)" :key="key">
              <img :src="entry.flag" alt="user-image" class="me-2 rounded" height="18">
              <span class="align-middle">{{ entry.title }}</span>
            </BLink>
          </BDropdown>






          <BDropdown variant="link" class="ms-sm-3 header-item topbar-user"
            toggle-class="rounded-circle material-shadow-none" no-caret id="page-header-user-dropdown"
            menu-class="dropdown-menu-end" :offset="{ alignmentAxis: -14, crossAxis: 0, mainAxis: 0 }" v-if="user">
            <template #button-content>
              <span class="d-flex align-items-center">

                <img class="rounded-circle header-profile-user" :src="user.avatar" alt="Header Avatar">
                <span class="text-start ms-xl-2">
                  <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{{ user.first_name }}
                    {{ user.last_name }}</span>
                  <span class="d-none d-xl-block ms-1 fs-12 user-name-sub-text">{{ user.user_type }}</span>
                </span>
              </span>
            </template>
            <router-link class="dropdown-item" to="/profile"><i
                class="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
              <span class="align-middle"> Профиль</span>
            </router-link>


            <div class="dropdown-divider"></div>

            <router-link to="/login" @click="logout" class="dropdown-item"><i
                class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
              <span class="align-middle" data-key="t-logout">Выход</span>
            </router-link>
          </BDropdown>
        </div>
      </div>
    </div>
  </header>
</template>