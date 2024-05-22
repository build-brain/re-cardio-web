<script>
localStorage.setItem("rightbar_isopen", false);
import { layoutMethods, layoutComputed } from "@/state/helpers";

/**
 * Right sidebar component
*/

export default {
  data() {
    return {
      show: false,
      showGradients: false,
      dataSidebarUserShow: false,
      resetLayoutMode: {},
    };
  },


  methods: {
    ...layoutMethods,
    click() {
      this.show = !this.show;
    },
    topFunction() {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    },

    resizeWindow() {
      var windowSize = document.documentElement.clientWidth;
      if (windowSize >= 1025) {
        if (
          document.documentElement.getAttribute("data-layout") === "vertical"
        ) {
          document.documentElement.setAttribute(
            "data-sidebar-size",
            this.$store.state.layout.sidebarSize
          );
        }
        
      } 
    },


    onSideBarColorClick(color) {
      if (color !== "gradient") {
        this.showGradients = false;
      } else {
        this.showGradients = true;
        this.gradiantColor();
      }
    },
    updateDocumentAttribute(value) {
      if (value) {
        document.documentElement.setAttribute('data-sidebar-user-show', 'true');
      } else {
        document.documentElement.removeAttribute('data-sidebar-user-show');
      }
    }
  },
  mounted() {
    let backtoTop = document.getElementById("back-to-top");

    if (backtoTop) {
      backtoTop = document.getElementById("back-to-top");
      window.onscroll = function () {
        if (
          document.body.scrollTop > 100 ||
          document.documentElement.scrollTop > 100
        ) {
          backtoTop.style.display = "block";
        } else {
          backtoTop.style.display = "none";
        }
      };
    }
    var setpreloader = document.getElementById("preloader");
    if (
      localStorage.getItem("data-preloader") &&
      localStorage.getItem("data-preloader") == "enable"
    ) {
      document.documentElement.setAttribute("data-preloader", "enable");
      if (setpreloader) {
        setTimeout(function () {
          setpreloader.style.opacity = "0";
          setpreloader.style.visibility = "hidden";
        }, 1000);
      }
    } else {
      document.documentElement.setAttribute("data-preloader", "disable");
      if (setpreloader) {
        setpreloader.style.opacity = "0";
        setpreloader.style.visibility = "hidden";
      }
    }
    if (document.getElementById("collapseBgGradient")) {
      Array.from(
        document.querySelectorAll("#collapseBgGradient .form-check input")
      ).forEach(function () {
        if (document.querySelector("[data-bs-target='#collapseBgGradient']")) {
          document
            .querySelector("[data-bs-target='#collapseBgGradient']")
            .addEventListener("click", function () {
              document.getElementById("sidebar-color-gradient").click();
            });
        }
      });
      Array.from(document.querySelectorAll("[name='data-sidebar']")).forEach(
        function (elem) {
          if (
            document.querySelector("[data-bs-target='#collapseBgGradient']")
          ) {
            if (
              document.querySelector(
                "#collapseBgGradient .form-check input:checked"
              )
            ) {
              document
                .querySelector("[data-bs-target='#collapseBgGradient']")
                .classList.add("active");
            } else {
              document
                .querySelector("[data-bs-target='#collapseBgGradient']")
                .classList.remove("active");
              document
                .getElementById("collapseBgGradient")
                .classList.remove("show");
            }

            elem.addEventListener("change", function () {
              if (
                document.querySelector(
                  "#collapseBgGradient .form-check input:checked"
                )
              ) {
                document
                  .querySelector("[data-bs-target='#collapseBgGradient']")
                  .classList.add("active");
              } else {
                document
                  .getElementById("collapseBgGradient")
                  .classList.remove("show");
                document
                  .querySelector("[data-bs-target='#collapseBgGradient']")
                  .classList.remove("active");
              }
            });
          }
        }
      );
    }
  },

  computed: {
    ...layoutComputed,
  },

  watch: {
    mode: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.documentElement.setAttribute("data-bs-theme", "dark");
              break;
            case "light":
              document.documentElement.setAttribute("data-bs-theme", "light");
              break;
          }
        }
      },
    },
    preloader: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "enable":
              document.documentElement.setAttribute("data-preloader", "enable");
              break;
            case "disable":
              document.documentElement.setAttribute(
                "data-preloader",
                "disable"
              );
              break;
          }
          localStorage.setItem("data-preloader", newVal);
        }
      },
    },
    layoutType: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "horizontal":
              document.documentElement.setAttribute(
                "data-layout",
                "horizontal"
              );
              break;
            case "vertical":
              document.documentElement.setAttribute("data-layout", "vertical");
              break;
            case "twocolumn":
              document.documentElement.setAttribute("data-layout", "twocolumn");
              break;
            case "semibox":
              document.documentElement.setAttribute("data-layout", "semibox");
              break;
          }
        }
      },
    },
    layoutWidth: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "fluid":
              document.documentElement.setAttribute(
                "data-layout-width",
                "fluid"
              );
              break;
            case "boxed":
              document.documentElement.setAttribute(
                "data-layout-width",
                "boxed"
              );
              break;
          }
        }
      },
    },
    position: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "fixed":
              document.documentElement.setAttribute(
                "data-layout-position",
                "fixed"
              );
              break;
            case "scrollable":
              document.documentElement.setAttribute(
                "data-layout-position",
                "scrollable"
              );
              break;
          }
        }
      },
    },
    topbar: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "light":
              document.documentElement.setAttribute("data-topbar", "light");
              break;
            case "dark":
              document.documentElement.setAttribute("data-topbar", "dark");
              break;
          }
        }
      },
    },
    sidebarSize: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "lg":
              document.documentElement.setAttribute("data-sidebar-size", "lg");
              break;
            case "sm":
              document.documentElement.setAttribute("data-sidebar-size", "sm");
              break;
            case "md":
              document.documentElement.setAttribute("data-sidebar-size", "md");
              break;
            case "sm-hover":
              document.documentElement.setAttribute(
                "data-sidebar-size",
                "sm-hover"
              );
              break;
          }
        }
      },
    },
    sidebarView: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "detached":
              document.documentElement.setAttribute(
                "data-layout-style",
                "detached"
              );
              break;
            case "default":
              document.documentElement.setAttribute(
                "data-layout-style",
                "default"
              );
              break;
          }
        }
      },
    },
    sidebarColor: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "dark":
              document.documentElement.setAttribute("data-sidebar", "dark");
              break;
            case "light":
              document.documentElement.setAttribute("data-sidebar", "light");
              break;
            case "gradient":
              document.documentElement.setAttribute("data-sidebar", "gradient");
              break;
            case "gradient-2":
              document.documentElement.setAttribute(
                "data-sidebar",
                "gradient-2"
              );
              break;
            case "gradient-3":
              document.documentElement.setAttribute(
                "data-sidebar",
                "gradient-3"
              );
              break;
            case "gradient-4":
              document.documentElement.setAttribute(
                "data-sidebar",
                "gradient-4"
              );
              break;
          }
        }
      },
    },
    sidebarImage: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "img-1":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "img-1"
              );
              break;
            case "img-2":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "img-2"
              );
              break;
            case "img-3":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "img-3"
              );
              break;
            case "img-4":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "img-4"
              );
              break;
            case "none":
              document.documentElement.setAttribute(
                "data-sidebar-image",
                "none"
              );
              break;
          }
        }
      },
    },
    visibility: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "show":
              document.documentElement.setAttribute(
                "data-sidebar-visibility",
                "show"
              );
              break;
            case "hidden":
              document.documentElement.setAttribute(
                "data-sidebar-visibility",
                "hidden"
              );
              break;
          }
        }
      },
    },
    bodybg: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "img-1":
              sessionStorage.setItem("data-sidebabodyr-image", "img-1");
              document.documentElement.setAttribute("data-body-image", "img-1");
              if (document.getElementById("theme-settings-offcanvas")) {
                document.documentElement.removeAttribute("data-sidebar-image");
              }
              break;
            case "img-2":
              sessionStorage.setItem("data-body-image", "img-2");
              document.documentElement.setAttribute("data-body-image", "img-2");
              break;
            case "img-3":
              sessionStorage.setItem("data-body-image", "img-3");
              document.documentElement.setAttribute("data-body-image", "img-3");
              break;
            case "none":
              sessionStorage.setItem("data-body-image", "none");
              document.documentElement.setAttribute("data-body-image", "none");
              break;

            default:
              if (sessionStorage.getItem("data-body-image") && sessionStorage.getItem("data-body-image") == "img-1") {
                sessionStorage.setItem("data-body-image", "img-1");
                document.documentElement.setAttribute("data-body-image", "img-1");

                if (document.getElementById("theme-settings-offcanvas")) {
                  document.getElementById("sidebar-img").style.display = "none";
                  document.documentElement.removeAttribute("data-sidebar-image");
                }
              } else if (sessionStorage.getItem("data-body-image") == "img-2") {
                sessionStorage.setItem("data-body-image", "img-2");
                document.documentElement.setAttribute("data-body-image", "img-2");
              } else if (sessionStorage.getItem("data-body-image") == "img-3") {
                sessionStorage.setItem("data-body-image", "img-3");
                document.documentElement.setAttribute("data-body-image", "img-3");
              } else if (sessionStorage.getItem("data-body-image") == "none") {
                sessionStorage.setItem("data-body-image", "none");
                document.documentElement.setAttribute("data-body-image", "none");
              }
              break;
          }
        }
      },
    },
    layoutThemes: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "default":
              document.documentElement.setAttribute("data-theme", "default");
              break;
            case "saas":
              document.documentElement.setAttribute("data-theme", "saas");
              break;
            case "corporate":
              document.documentElement.setAttribute("data-theme", "corporate");
              break;
            case "galaxy":
              document.documentElement.setAttribute("data-theme", "galaxy");
              break;
            case "material":
              document.documentElement.setAttribute("data-theme", "material");
              break;
            case "creative":
              document.documentElement.setAttribute("data-theme", "creative");
              break;
            case "minimal":
              document.documentElement.setAttribute("data-theme", "minimal");
              break;
            case "modern":
              document.documentElement.setAttribute("data-theme", "modern");
              break;
            case "interactive":
              document.documentElement.setAttribute("data-theme", "interactive");
              break;
            case "classic":
              document.documentElement.setAttribute("data-theme", "classic");
              break;
            case "vintage":
              document.documentElement.setAttribute("data-theme", "vintage");
              break;
          }
        }
      },
    },
    themeColor: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        if (newVal !== oldVal) {
          switch (newVal) {
            case "default":
              document.documentElement.setAttribute("data-theme-colors", "default");
              break;
            case "green":
              document.documentElement.setAttribute("data-theme-colors", "green");
              break;
            case "purple":
              document.documentElement.setAttribute("data-theme-colors", "purple");
              break;
            case "blue":
              document.documentElement.setAttribute("data-theme-colors", "blue");
              break;
          }
        }
      },
    },
    dataSidebarUserShow(newValue) {
      this.updateDocumentAttribute(newValue);
    }
  },

};
</script>
  
<template>
  <div>
    <div id="preloader">
      <div id="status">
        <div class="spinner-border text-primary avatar-sm" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>



  </div>
</template>

<style lang="scss">
.b-overlay-wrap {
  .b-overlay {
    z-index: 1005 !important;
  }
}
</style>
