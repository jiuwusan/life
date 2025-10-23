<template>
  <div class="project-item">
    <div class="project-row">
      <div class="project-name">
        <iconfont name="zuanshi2" style="margin-right: 4px; color: #333333" />{{ data.name }}<span class="project-date">{{ data.date }}</span>
      </div>
    </div>
    <div style="padding: 0 0 0 22px">
      <div v-for="item in data.list" :key="item.id" class="project-row">
        <div>
          <span class="project-label">{{ item.label }}：</span>{{ item.text || '' }}
        </div>
        <ul v-if="item.ul" class="project-ul">
          <li v-for="it in item.ul" :key="it" class="project-li">{{ it }}</li>
        </ul>
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

<style scoped lang="scss">
.project-item {
  display: flex;
  flex-direction: column;
  margin: 16px 0 0 0;
}
.project-row {
  margin: 4px 0 0 0;
}
.project-label {
  color: #333333;
  font-weight: 500;
}

.project-name {
  color: #000000;
  font-size: 18px;
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
