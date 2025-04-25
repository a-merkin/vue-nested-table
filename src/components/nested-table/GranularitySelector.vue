<template>
  <div class="controls">
    <div class="granularity-selector">
      <label>Детализация:</label>
      <select
        :value="modelValue"
        @input="
          $emit('update:modelValue', ($event.target as HTMLSelectElement).value as DateGranularity)
        "
      >
        <option value="day">День</option>
        <option value="month">Месяц</option>
        <option value="year">Год</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DateGranularity } from '../../types/table'

defineProps<{
  modelValue: DateGranularity
}>()

defineEmits<{
  (e: 'update:modelValue', value: DateGranularity): void
}>()
</script>

<style scoped>
.controls {
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
  border: 1px solid #c0c0c0;
  border-radius: 4px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
}

.granularity-selector label {
  font-size: 12px;
  color: #333333;
}
</style>
