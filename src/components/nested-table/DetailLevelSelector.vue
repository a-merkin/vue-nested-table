<template>
  <div class="detail-level-selector">
    <label class="detail-level-label">Детализация:</label>
    <Slider
      v-model="selectedLevel"
      :options="detailLevels"
      :disabled="false"
      @selectOption="handleLevelChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Slider from './Slider.vue'
import type { DateGranularity } from '../../types/table'

const props = defineProps<{
  modelValue: DateGranularity
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: DateGranularity): void
}>()

const detailLevels = [
  { id: 'day', name: 'День' },
  { id: 'month', name: 'Месяц' },
  { id: 'year', name: 'Год' },
]

const selectedLevel = ref(props.modelValue)

const handleLevelChange = (value: string) => {
  emit('update:modelValue', value as DateGranularity)
}

watch(
  () => props.modelValue,
  newValue => {
    selectedLevel.value = newValue
  }
)
</script>

<style scoped>
.detail-level-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  width: 400px;
}

.detail-level-label {
  font-size: 0.875rem;
  color: #333;
  white-space: nowrap;
}
</style>
