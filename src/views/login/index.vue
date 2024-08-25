<script>

import { userService } from '../../helpers/authservice/user.service'

import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation, Pagination } from "swiper/modules";


import "swiper/css";
import "swiper/css/autoplay";
import 'swiper/css/navigation';
import 'swiper/css/pagination';



export default {
  data() {
    return {
      phone: "",
      password: "",
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
      processing: false,
      togglePassword: false,
      Autoplay: Autoplay, Pagination: Pagination, Navigation: Navigation,
      pagination: {
        clickable: true,
        el: '.swiper-pagination',
        renderBullet: function (index, className) {
          return '<span class=' + className + '>' + (index + 1) + '</span>';
        },
      },
    };
  },
  components: {
    Swiper,
    SwiperSlide,
  },


  methods: {

    tryToLogIn() {
      this.processing = true;
      this.submitted = true;
      // stop here if form is invalid
      this.$touch;

      if (this.$invalid) {
        return;
      } else {

        this.tryingToLogIn = true;
        // Reset the authError if it existed.
        this.authError = null;
        return (
          userService.login({
            phone: this.phone,
            password: this.password,
          })
            // eslint-disable-next-line no-unused-vars
            .then(() => {
              this.tryingToLogIn = true;
              this.isAuthError = false;

              userService.getAll()
                .then(response => {
                  localStorage.setItem('user', JSON.stringify(response));

                     // Redirect to the originally requested page, or to the home page
                  this.$router.push({
                    path: '/'
                  });
                })
                .catch(error => {
                  console.error(error);
                });

            })
            .catch((error) => {
              this.tryingToLogIn = false;
              this.authError = error ? error : "";
              this.isAuthError = true;
              this.processing = false;
            })

        );

      }
    },

  },

};

</script>

<template>

  <div class="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
    <div class="bg-overlay"></div>
    <div class="auth-page-content overflow-hidden pt-lg-5">
      <BContainer>
        <BRow>
          <BCol lg="12">
            <BCard no-body class="overflow-hidden  card-bg-fill galaxy-border-none">
              <BRow class="g-0">
                <BCol lg="6">
                  <div class="p-lg-5 p-4 auth-one-bg h-100">
                    <div class="bg-overlay"></div>
                    <div class="position-relative h-100 d-flex flex-column">
                      <div class="mb-4">
                        <router-link to="/" class="d-block">
                          <img src="@/assets/images/svg/RE.CARDIO.svg" alt="" height="18">
                        </router-link>
                      </div>
                      <div class="mt-auto">
                   

                        <div id="qoutescarouselIndicators" class="carousel slide" data-bs-ride="carousel">
                          <Swiper class=" text-center text-white-50 pb-5"
                            :autoplay="{ delay: 3000, disableOnInteraction: false }" :loop="true"
                            :modules="[Autoplay, Navigation, Pagination]"
                            :pagination="{ clickable: true, el: '.swiper-pagination' }">
                            <swiper-slide>
                              <div class="active">
                                <p class="fs-15 fst-italic">Кардиореабилитация — комплекс мероприятий, направленных на восстановление трудоспособности пациентов с сердечно-сосудистыми заболеваниями.</p>
                              </div>
                            </swiper-slide>
                            <swiper-slide>
                              <div>
                                <p class="fs-15 fst-italic">Телемониторинг используется для дистанционного наблюдения за состоянием здоровья пациентов.</p>
                              </div>
                            </swiper-slide>
                            <swiper-slide>
                              <div>
                                <p class="fs-15 fst-italic">Одна из целей дистанционной кардиореабилитации — это укрепление самоконтроля и приверженность к программам реабилитации среди пациентов.</p>
                              </div>
                            </swiper-slide>
                            <div class="swiper-pagination"></div>
                          </Swiper>
                        </div>
                      </div>
                    </div>
                  </div>
                </BCol>

                <BCol lg="6">
                  <div class="p-lg-5 p-4">
                    <div>
                      <h5 class="text-primary">Добро пожаловать !</h5>
                      <p class="text-muted">Войдите для продолжения работы с RE.Cardio.</p>
                    </div>

                    <div class="mt-4">
                      <form @submit.prevent="tryToLogIn">
                        <b-alert v-model="authError" variant="danger" class="mt-3" dismissible>{{ authError }}</b-alert>

                        <div class="mb-3">
                          <label for="username" class="form-label">Логин</label>
                          <input v-model="phone" type="text" class="form-control" id="username"
                            placeholder="Введите номер телефона">
                        </div>

                        <div class="mb-3">
                          <div class="float-end">
                            <router-link to="/forgot-password" class="text-muted">
                              Забыли пароль?</router-link>
                          </div>
                          <label class="form-label" for="password-input">Пароль</label>
                          <div class="position-relative auth-pass-inputgroup mb-3">
                            <input v-model="password" :type="togglePassword ? 'text' : 'password'"
                              class="form-control pe-5" placeholder="Введите пароль" id="password-input">
                            <BButton variant="link"
                              class="position-absolute end-0 top-0 text-decoration-none text-muted material-shadow-none"
                              type="button" id="password-addon" @click="togglePassword = !togglePassword"><i
                                class="ri-eye-fill align-middle"></i></BButton>
                          </div>
                        </div>

                        <div class="mt-4">
                          <BButton variant="success" class="w-100" type="submit">Войти</BButton>
                        </div>



                      </form>
                    </div>
                  </div>
                </BCol>
              </BRow>
            </BCard>
          </BCol>
        </BRow>
      </BContainer>
    </div>


  </div>

</template>