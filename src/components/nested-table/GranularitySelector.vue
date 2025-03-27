<template>
  <div class="controls">
    <div class="granularity-selector">
      <label>Детализация:</label>
      <select :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
        <option value="day">День</option>
        <option value="week">Неделя</option>
        <option value="month">Месяц</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DateGranularity } from '../../types/table';

defineProps<{
  modelValue: DateGranularity;
}>();

defineEmits<{
  (e: 'update:modelValue', value: DateGranularity): void;
}>();
</script>

<style scoped>
.controls {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.granularity-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.granularity-selector select {
  padding: 0.5rem;
  border: 1px solid #C0C0C0;
  border-radius: 4px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}

.granularity-selector label {
  font-size: 12px;
  color: #333333;
}
</style> 