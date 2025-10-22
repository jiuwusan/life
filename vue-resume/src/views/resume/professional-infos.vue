<template>
  <div class="column">
    <div class="my-name">
      <iconfont name="info" class="my-name-icon" />
      <div>
        {{ data.name }} - <span style="font-size: 16px">{{ data.position }}</span>
      </div>
    </div>
    <div class="person">
      <div v-for="item in data.others" :key="item.label" class="person-li">
        <iconfont :name="item.icon" style="color: #3679bd; margin: 0 4px 0 0" />{{ item.value }}
      </div>
    </div>
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
@import './styles.scss';
</style>
