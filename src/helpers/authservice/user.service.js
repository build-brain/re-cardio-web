
import { axiosInstance } from '../../axios'; 
export const userService = {
    login,
    logout,
    getAll,
};

async function  login(data) {


    return axiosInstance.post('/api/token/', data)
    .then(user => {
      // login successful if there's a jwt token in the response
      if (user.data) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('token', JSON.stringify(user.data.access));
      }
      return user.data;
    });

}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('token');
}


async function getAll() {
        return await axiosInstance.get(`/users/me/`).then(res => res.data).catch(e => console.error(e));
}

