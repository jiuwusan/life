<template>
  <div class="module-box">
    <div class="module-title">
      <iconfont name="work" class="module-title-icon" />
      {{ data.name }} <span style="font-size: 14px">{{ data.englishName }}</span>
    </div>
    <div class="company-box">
      <div v-for="item in data.list" :key="item.company" class="company-item">
        <div class="company-name">
          <div class="company-item-time">{{ item.date }}</div>
          <div class="company-item-circle" />
          <div>
            {{ item.company }}<span v-if="item.position" style="font-size: 16px">（{{ item.position }}）</span>
          </div>
        </div>
        <ul class="company-ul">
          <li v-for="duty in item.duties" :key="duty" class="company-li">
            {{ duty }}
          </li>
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

<style lang="scss" scoped>
@use './styles.scss' as *;
.company-box {
  position: relative;
  margin: 10px 0 0 20px;
}

.company-item {
  position: relative;
  margin-top: 20px;
  opacity: 0.8;
}

.company-item::after {
  position: absolute;
  height: calc(100% + 20px);
  left: 95px;
  top: 10px;
  z-index: -1;
  border: 1px solid #3679bd;
  content: '';
}

.company-item:last-child::after {
  height: calc(100% - 15px);
}

.company-name {
  display: flex;
  font-weight: bold;
  position: relative;
  z-index: 99;
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
}

.company-item-time {
  width: 80px;
  text-align: right;
}

.company-item-circle {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(54, 121, 189, 0.65);
  border-radius: 50%;
  margin: 0px 10px;
}

.company-item-circle::after {
  width: 7px;
  height: 7px;
  background-color: rgba(54, 121, 189, 1);
  border-radius: 50%;
  content: '';
}

.company-ul {
  margin: 10px 0 0 100px;
}

.company-li {
  line-height: 1.4;
}
</style>
