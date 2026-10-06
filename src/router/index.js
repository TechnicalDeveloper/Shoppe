import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue')
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../pages/ShopPage.vue')
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../pages/ProductDetailPage.vue')
    }
  ]
})

export default router
