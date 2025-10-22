<template>
  <div v-if="data" class="page-box">
    <professional-infos :data="data.infos" />
    <professional-skills :data="data.skills" />
    <professional-works :data="data.works" />
    <professional-projects :data="data.projects" />
    <div class="thanks">感谢您花时间阅读我的简历，期待能有机会和您共事。</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ProfessionalInfos from './professional-infos.vue'
import ProfessionalSkills from './professional-skills.vue'
import ProfessionalWorks from './professional-works.vue'
import ProfessionalProjects from './professional-projects.vue'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data = ref<{ infos: Record<string, any>; skills: Record<string, any>; works: Record<string, any>; projects: Record<string, any> }>()
const route = useRoute()
onMounted(() => {
  ;(async () => {
    data.value = await import(`./${route.params.name}.json`)
    console.log(data.value)
    document.title = route.params.name as string
  })()
})
</script>

<style lang="scss" scoped>
@import './styles.scss';
</style>
