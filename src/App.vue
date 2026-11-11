<script setup>
import { onMounted } from 'vue'
import { useCategoriesStore } from './stores/categories'
import { useThemeStore } from './stores/theme'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

// Не вызываем хранилища на верхнем уровне до app.use(pinia)!
onMounted(() => {
  const themeStore = useThemeStore()
  const categoriesStore = useCategoriesStore()

  themeStore.applyTheme()
  categoriesStore.fetchCategories()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
    <!-- Шапка сайта -->
    <Navbar />

    <!-- Динамическая страница -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Подвал сайта -->
    <Footer />
  </div>
</template>