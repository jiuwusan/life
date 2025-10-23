<template>
  <div class="module-box">
    <div class="module-title">
      <iconfont name="skills" class="module-title-icon" />
      {{ data.name }} <span style="font-size: 14px">{{ data.englishName }}</span>
    </div>
    <ul class="module-ul">
      <li v-for="item in data.rows" :key="item" class="module-li">{{ item }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import Iconfont from '@/components/Iconfont.vue'
defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}>()
</script>

<style lang="scss" scoped>
@use './styles.scss' as *;
</style>
