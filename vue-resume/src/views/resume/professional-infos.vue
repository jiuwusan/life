<template>
  <div class="column">
    <div class="my-name">
      <iconfont name="info" class="my-name-icon" />
      <div>
        {{ data.name }} - <span style="font-size: 16px">{{ data.position }}</span>
      </div>
    </div>
    <div class="person">
      <div v-for="item in data.others" :key="item.label" class="person-li"><iconfont :name="item.icon" style="color: #3679bd; margin: 0 4px 0 0" />{{ item.value }}</div>
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
.my-name {
  font-size: 22px;
  font-weight: bold;
  margin-left: 5px;
  color: #3679bd;
  display: flex;
  align-items: center;
}

.my-name-icon {
  margin-right: 6px;
  font-size: 20px;
}

.person {
  display: flex;
  margin: 10px 0 0 10px;
  flex-wrap: wrap;
}

.person-ul {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.person-li {
  width: 50%;
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.person-li-icon {
  margin-right: 6px;
}
</style>
