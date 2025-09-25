<script>


import "flatpickr/dist/flatpickr.css";
import { axiosInstance } from "../../axios";
import Layout from "@/layouts/main.vue";
import { userService } from '../../helpers/authservice/user.service'

import { ref } from "vue";
import Swal from 'sweetalert2';
import flatPickr from 'vue-flatpickr-component'; // Убедитесь, что flatPickr импортирован

export default {
  components: { flatPickr, Layout },
  setup() {
    const user = ref(JSON.parse(localStorage.getItem('user')));
    const toggle_password = ref(true);
    const password = ref({ password: "", new_password: '', confirm_password: '' })

    const updateAvatar = async (file) => {
      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await axiosInstance.post('/users/change-avatar/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status !== 200) {
          throw new Error('Не удалось изменить аватар.');
        }


        localStorage.setItem('user', JSON.stringify(user.value));


        Swal.fire({
          icon: 'success',
          title: 'Аватар обновлен',
          text: 'Ваш аватар был успешно обновлен.',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Ошибка',
          // text: error.message, // TODO: check translation
          text: `Ошибка при обновлении аватара: ${error.message}`,
        });
      }
    };

    const updateUserDetails = async () => {
      try {
        const response = await axiosInstance.put('/users/me/', user.value);

        if (response.status !== 200) {
          throw new Error('Не удалось обновить данные пользователя.');
        }

        userService.getAll()
          .then(response => {
            localStorage.setItem('user', JSON.stringify(response));
            location.reload();
          })
          .catch(error => {
            console.error(error);
          });

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Ошибка',
          // text: error.message, // TODO: check translation
          text: `Ошибка при обновлении данных пользователя: ${error.message}`,
        });
      }
    };

    const updatePassword = async () => {
      if(password.value.password.trim() == '' || password.value.new_password.trim() == '') return

      if (password.value.new_password.length < 6) {
        Swal.fire({
          icon: 'error',
          title: 'Ошибка',
          text: 'Пароль должен содержать минимум 6 символов.',
        });
        return;
      }

      if (password.value.new_password !== password.value.confirm_password) {
        Swal.fire({
          icon: 'error',
          title: 'Ошибка',
          text: 'Пароли не совпадают.',
        });
        return;
      }


      try {
        const response = await axiosInstance.post('/users/me/change-password/', password.value);

        if (response.status !== 200) {
          throw new Error('Не удалось обновить пароль.');
        }

        password.value = { password: "", new_password: '', confirm_password: '' }; // Сбросить поля пароля

       Swal.fire({
          icon: 'success',
          title: 'Пароль обновлен',
          text: 'Ваш пароль был успешно обновлен.',
        });

      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Ошибка',
          // text: error.message, // TODO: check translation
          text: `Ошибка при обновлении пароля: ${error.message}`,
        });
      }
    }

    return {
      user,
      password,
      toggle_password,
      handleAvatarChange(event) {
        const file = event.target.files[0];
        if (file) {
          updateAvatar(file).then(() => updateUserDetails());
        }
      },
      updatePassword,
      updateUserDetails
    };
  }
};
</script>

<template>
  <Layout>
    <div class="position-relative mx-n4 mt-n4">
      <div class="profile-wid-bg profile-setting-img">
        <img src="@/assets/images/profile-bg.jpg" class="profile-wid-img" alt="" />

      </div>
    </div>

    <BRow>
      <BCol xxl="3">
        <BCard no-body class="mt-n5">
          <BCardBody class="p-4">
            <div class="text-center">
              <div class="profile-user position-relative d-inline-block mx-auto mb-4">
                <img :src="user.avatar"
                  class="rounded-circle avatar-xl img-thumbnail user-profile-image material-shadow"
                  alt="user-profile-image" />
                <div class="avatar-xs p-0 rounded-circle profile-photo-edit">
                  <input id="profile-img-file-input" type="file" class="profile-img-file-input"
                    @change="handleAvatarChange" />
                  <label for="profile-img-file-input" class="profile-photo-edit avatar-xs">
                    <span class="avatar-title rounded-circle bg-light text-body material-shadow">
                      <i class="ri-camera-fill"></i>
                    </span>
                  </label>
                </div>
              </div>
              <h5 class="fs-16 mb-1">{{ user.first_name }} {{ user.last_name }} {{ user.middle_name }}</h5>
            </div>
          </BCardBody>
        </BCard>
      </BCol>
      <BCol xxl="9">
        <BCard no-body class="mt-xxl-n5">
          <BCardBody class="p-4 pt-2">
            <form @submit.prevent="updateUserDetails">
              <BRow class="pt-4">
                <BCol lg="6">
                  <div class="mb-3">
                    <label for="firstnameInput" class="form-label">Имя</label>
                    <input type="text" v-model="user.first_name" class="form-control" id="firstnameInput"
                      placeholder="Введите ваше имя" />
                  </div>
                </BCol>
                <BCol lg="6">
                  <div class="mb-3">
                    <label for="lastnameInput" class="form-label">Фамилия</label>
                    <input type="text" v-model="user.last_name" class="form-control" id="lastnameInput"
                      placeholder="Введите вашу фамилию" />
                  </div>
                </BCol>
                <BCol lg="6">
                  <div class="mb-3">
                    <label for="phonenumberInput" class="form-label">Телефон</label>
                    <input type="text" v-model="user.phone" class="form-control" id="phonenumberInput"
                      placeholder="Введите ваш номер телефона" />
                  </div>
                </BCol>
                <BCol lg="6">
                  <div class="mb-3">
                    <label for="emailInput" class="form-label">Электронная почта @gmail.com</label>
                    <input type="email" v-model="user.email" class="form-control" id="emailInput"
                      placeholder="test@gmail.com" />
                  </div>
                </BCol>
                <BCol lg="6">
                  <div class="mb-3">
                    <label for="passportInput" class="form-label">Паспорт</label>
                    <input type="text" v-model="user.passport" class="form-control" id="passportInput"
                      placeholder="Введите паспортные данные" />
                  </div>
                </BCol>
                <BCol lg="6">
                  <div class="mb-3">
                    <label for="pinflInput" class="form-label">ПИНФЛ</label>
                    <input type="text" v-model="user.pinfl" class="form-control" id="pinflInput"
                      placeholder="Введите ПИНФЛ" />
                  </div>
                </BCol>
                <BCol lg="4">
                  <div class="mb-3">
                    <label for="roleInput" class="form-label">Роль</label>
                  <span class="form-control" v-if="user.user_type === 'DOCTOR'">Врач-кардиолог</span>
                  </div>
                </BCol>
                <BCol lg="4">
                  <div class="mb-3">
                    <label for="birthDateInput" class="form-label">Дата рождения</label>
                    <flatPickr v-model="user.birth_date" class="form-control" id="birthDateInput"></flatPickr>
                  </div>
                </BCol>
                <BCol lg="4">
                  <div class="mb-3">
                    <label for="createdAtInput" class="form-label">Дата создания профиля</label>
                    <flatPickr v-model="user.created_at" class="form-control" id="createdAtInput"></flatPickr>
                  </div>
                </BCol>
                <BCol lg="12">
                  <div class="mb-3 pb-2">
                    <label for="additionalInfoTextarea" class="form-label">Дополнительная информация</label>
                    <textarea class="form-control" id="additionalInfoTextarea" v-model="user.additional_information"
                      placeholder="Введите дополнительную информацию" rows="3"></textarea>
                  </div>
                </BCol>
                <BCol lg="12">
                  <div class="hstack gap-2 justify-content-end">
                    <BButton type="submit" variant="primary">Обновить</BButton>
                    <router-link to="/">
                      <BButton type="button" variant="soft-success">Отменить</BButton>
                    </router-link>
                  </div>
                </BCol>
              </BRow>
            </form>
          </BCardBody>
        </BCard>
        <BCard no-body class="mt-4">
          <BCardBody class="p-4 pt-2">
            <form @submit.prevent="updatePassword">
              <BRow class="pt-4">
                <BCol lg="4">
                  <div class="mb-3">
                    <label for="password" class="form-label">Введите текущий пароль</label>
                    <div class="position-relative auth-pass-inputgroup mb-3">
                      <input :type="!toggle_password ? 'text' : 'password'" v-model="password.password" class="form-control" id="password"
                        placeholder="Введите текущий пароль" />
                        <BButton variant="link"
                          class="position-absolute end-0 top-0 text-decoration-none text-muted material-shadow-none"
                          type="button" id="password-addon" @click="toggle_password = !toggle_password"><i
                            class="ri-eye-fill align-middle"></i></BButton>
                    </div>
                    <p class="required_field light" v-if="!password.password==='' && password?.password?.lenght < 6">Пароль должен содержать минимум 6 цифр</p>
                  </div>
                </BCol>
                <BCol lg="4">
                  <div class="mb-3">
                    <label for="new_password" class="form-label">Новый пароль</label>
                    <input :type="!toggle_password ? 'text' : 'password'" v-model="password.new_password" class="form-control" id="new_password"
                      placeholder="Введите новый пароль" />
                    <p class="required_field light" v-if="!password.new_password==='' && password?.new_password?.lenght < 6">Пароль должен содержать минимум 6 цифр</p>
                  </div>
                </BCol>
                <BCol lg="4">
                  <div class="mb-3">
                    <label for="confirm_password" class="form-label">Повторите новый пароль</label>
                    <input :type="!toggle_password ? 'text' : 'password'" v-model="password.confirm_password" class="form-control" id="confirm_password"
                      placeholder="Повторите новый пароль" />
                    <p class="required_field light" v-if="!password.new_password==='' && (password?.new_password === password?.confirm_password)">Пароль должен содержать минимум 6 цифр</p>
                  </div>
                </BCol>
                <BCol lg="12">
                  <div class="hstack gap-2 justify-content-end">
                    <BButton type="submit" variant="primary">Обновить</BButton>
                    <router-link to="/">
                      <BButton type="button" variant="soft-success">Отменить</BButton>
                    </router-link>
                  </div>
                </BCol>
              </BRow>
            </form>
          </BCardBody>
        </BCard>
      </BCol>
    </BRow>

  </Layout>
</template>