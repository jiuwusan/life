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
  margin-top: 12px;
  opacity: 0.8;
}

.company-item::after {
  position: absolute;
  height: calc(100% + 20px);
  left: 94px;
  top: 12px;
  z-index: -1;
  border: 1px solid #999999;
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
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.company-item-time {
  width: 80px;
  text-align: right;
}

.company-item-circle {
  width: 10px;
  height: 10px;
  background-color: #666666;
  border-radius: 50%;
  margin: 0px 10px;
  position: relative;
}

.company-item-circle::after {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  transform: translate(-50%, -50%);
  width: 5px;
  height: 5px;
  background-color: #999999;
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
