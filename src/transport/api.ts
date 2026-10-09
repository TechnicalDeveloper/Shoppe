import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.dev.cwe.su/api',
});

export const getPromos = async (): Promise<any[]> => {
  const { data } = await api.get('/promos?populate=product');
  return data.data;
};

export const getProducts = async (params: any = {}): Promise<{ data: any[], meta: any }> => {
  const queryParams = new URLSearchParams();
  queryParams.append('populate', '*');

  if (typeof params === 'number') {
    params = { limit: params };
  }
  
  if (params.limit) {
    queryParams.append('pagination[pageSize]', params.limit.toString());
  }
  if (params.page) {
    queryParams.append('pagination[page]', params.page.toString());
  }
  if (params.search) {
    queryParams.append('filters[title][$contains]', params.search);
  }
  if (params.onSale) {
    queryParams.append('filters[discountPercent][$gt]', '0');
  }
  if (params.inStock) {
    queryParams.append('filters[itemsInStock][$gt]', '0');
  }
  if (params.sortBy) {
    if (params.sortBy === 'price') {
      queryParams.append('sort', 'price:asc');
    } else if (params.sortBy === 'date') {
      queryParams.append('sort', 'createdAt:asc');
    }
  }

  const { data } = await api.get(`/products?${queryParams.toString()}`);
  return data;
};

export const getProductById = async (documentId: string): Promise<any> => {
  const { data } = await api.get(`/products/${documentId}?populate=*`);
  return data.data;
};

export const addReview = async (productId: string, review: { author: string, text: string, rate: number }): Promise<any> => {
  const { data } = await api.post('/reviews', {
    data: {
      ...review,
      product: productId
    }
  });
  return data.data;
};
