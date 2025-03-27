<template>
  <th v-for="date in dates" :key="date.key" class="date-header">
    {{ formatDate(date.start, date.end) }}
  </th>
</template>

<script setup lang="ts">
type DateRange = {
  start: Date;
  end: Date;
  key: string;
};

defineProps<{
  dates: DateRange[];
  formatDate: (start: Date, end: Date) => string;
}>();
</script>

<style scoped>
.date-header {
  background-color: #f5f5f5;
  font-weight: 700;
  font-size: 12px;
  color: #333333;
  text-align: center;
  width: auto;
  border: 1px solid #C0C0C0;
  padding: 2px 4px;
}
</style> 