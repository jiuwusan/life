<template>
  <div v-if="data" class="page-box">
    <professional-infos :data="data.infos" />
    <professional-skills :data="data.skills" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ProfessionalInfos from './professional-infos.vue'
import ProfessionalSkills from './professional-skills.vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = ref<{ infos: Record<string, any>; skills: Record<string, any> }>()
const route = useRoute()
onMounted(() => {
  ;(async () => {
    data.value = await import(`./${route.params.name}.json`)
    console.log(data.value)
  })()
})
</script>

<style lang="scss" scoped>
@import './styles.scss';
</style>
