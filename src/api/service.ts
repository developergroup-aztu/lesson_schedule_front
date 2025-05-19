import axiosInstance from './config';

export const get = (url: string, params?: any) => {
  return axiosInstance.get(url, { params });
};

export const post = (url: string, data: any) => {
  return axiosInstance.post(url, data);
};

export const put = (url: string, data: any) => {
  return axiosInstance.put(url, data);
};

export const del = (url: string) => {
  return axiosInstance.delete(url);
};

export const getProfile = () => {
  return axiosInstance.get('/api/profile');
};