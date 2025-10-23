<template>
  <div class="module-box">
    <div class="module-title">
      <iconfont name="project" class="module-title-icon" />
      {{ data.name }} <span style="font-size: 14px">{{ data.englishName }}</span>
    </div>
    <div>
      <professional-project-item v-for="item in data.list" :key="item.name" :data="item" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfessionalProjectItem from './professional-project-item.vue'
import Iconfont from '@/components/Iconfont.vue'
defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}>()
</script>

<style lang="scss" scoped>
@use './styles.scss' as *;
</style>
