import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '../views/SearchPage.vue'

const routes = [
    {
        path: '/',
        name: 'Search',
        component: SearchPage
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router