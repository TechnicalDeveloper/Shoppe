import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFavoritesStore = defineStore(
  'favorites',
  () => {
    const favorites = ref([]);

    const toggleFavorite = (product) => {
      const index = favorites.value.findIndex(
        (p) => p.documentId === product.documentId
      );
      if (index === -1) {
        favorites.value.push(product);
      } else {
        favorites.value.splice(index, 1);
      }
    };

    const isFavorite = (documentId) => {
      return favorites.value.some((p) => p.documentId === documentId);
    };

    return {
      favorites,
      toggleFavorite,
      isFavorite,
    };
  },
  {
    persist: true,
  }
);
