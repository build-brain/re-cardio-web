import axios from 'axios';

const getToken = () => {
  let user = localStorage.getItem('token');
  if (user) {
    user = JSON.parse(user);
    return user;
  }
  return null;
};

// const baseURL = 'https://api-cardio.build-brain.uz'
const baseURL = 'https://api.recardio.uz';
// 'http://192.168.31.50:8000';

export const axiosInstance = axios.create({ baseURL });

axiosInstance.interceptors.request.use(
  function (config) {

    const user = getToken();
    if (user) {
     
      config.headers.Authorization = `Bearer ${user}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

   
    if (error?.response?.status === 401 || error?.response?.status === 403) {
 
      localStorage.clear();
    
    }


    return axios(config);
  }
);

