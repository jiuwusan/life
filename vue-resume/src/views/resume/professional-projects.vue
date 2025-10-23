<template>
  <div class="module-box">
    <div class="module-title">
      <iconfont name="project" class="module-title-icon" />
      {{ data.name }} <span style="font-size: 14px">{{ data.englishName }}</span>
    </div>
    <div style="padding: 0 0 0 16px">
      <div v-for="item in data.list" :key="item.name" class="project-item">
        <div class="project-name">
          {{ item.name }}<span class="project-date">{{ item.date }}</span>
        </div>
        <div class="project-row"><span class="project-label">技术栈：</span>{{ item.tech }}</div>
        <div class="project-row"><span class="project-label">项目描述：</span>{{ item.desc }}</div>
        <div v-if="item.highlights" class="project-row">
          <div class="project-label">项目亮点</div>
          <ul class="project-ul">
            <li v-for="hl in item.highlights" :key="hl" class="project-li">{{ hl }}</li>
          </ul>
        </div>
        <div v-if="item.duties" class="project-row">
          <div class="project-label">详细职责</div>
          <ul class="project-ul">
            <li v-for="duty in item.duties" :key="duty" class="project-li">{{ duty }}</li>
          </ul>
        </div>
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
@use './styles.scss' as *;

.project-item {
  display: flex;
  flex-direction: column;
  margin: 20px 0 0 0;
}
.project-row {
  margin: 8px 0 0 0;
}
.project-label {
  color: #000000;
  font-weight: 500;
}

.project-name {
  color: #000000;
  font-size: 22px;
  line-height: 24px;
  font-weight: 500;
}

.project-date {
  color: #666666;
  font-size: 20px;
  font-weight: 400;
  margin: 0 0 0 16px;
}
</style>
