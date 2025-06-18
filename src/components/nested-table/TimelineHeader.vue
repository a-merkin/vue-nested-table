<template>
  <th v-for="date in dates" :key="date.key" class="date-header">
    {{ formatDate(date.start, date.end) }}
  </th>
</template>

<script setup lang="ts">
type DateRange = {
  start: Date
  end: Date
  key: string
}

defineProps<{
  dates: DateRange[]
  formatDate: (start: Date, end: Date) => string
}>()
</script>

<style scoped>
.date-header {
  background-color: #f5f5f5;
  font-weight: 700;
  font-size: 11px;
  color: #333333;
  text-align: center;
  min-width: 18px;
  border: 1px solid #c0c0c0;
  padding: 1px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 22px;
}
</style>
