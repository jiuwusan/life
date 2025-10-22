<template>
  <span :class="classStrs" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
}>()

const classStrs = computed(() => {
  return `iconfont jws-icon_${props.name}`
})
</script>

<style scoped lang="scss"></style>
