import axiosInstance from './config';

export const get = (url: string, params?: any) => {
  return axiosInstance.get(url, { params });
};

// PDF və digər fayllar üçün xüsusi get funksiyası
export const getFile = (url: string, options?: any) => {
  return axiosInstance.get(url, {
    responseType: 'blob', // PDF üçün vacib
    ...options
  });
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