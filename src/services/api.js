import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.dev.cwe.su/api',
});

export const getPromos = async () => {
  const { data } = await api.get('/promos?populate=product');
  return data.data;
};

export const getProducts = async (limit = null) => {
  const url = limit
    ? `/products?pagination[pageSize]=${limit}&populate=*`
    : '/products?populate=*';
  const { data } = await api.get(url);
  return data.data;
};

export const getProductById = async (documentId) => {
  const { data } = await api.get(`/products/${documentId}?populate=*`);
  return data.data;
};
