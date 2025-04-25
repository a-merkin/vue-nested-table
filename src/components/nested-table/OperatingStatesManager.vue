<template>
  <div class="operating-states-manager">
    <div
v-for="(state, index) in modelValue" 
         :key="index"
         class="operating-state-entry">
      <select
v-model="state.state" 
              class="state-select"
              @change="validateAndEmit">
        <option value="operating_state_prod">Добыча</option>
        <option value="operating_state_inje">Закачка</option>
        <option value="operating_state_idle">Простой</option>
        <option value="operating_state_intake">Поглощение</option>
      </select>
      <input
v-model="state.startDate" 
             type="date"
             class="date-input"
             :min="getMinStartDate(index)"
             :max="getMaxStartDate(index)"
             @change="validateAndEmit">
      <input
v-model="state.endDate"
             type="date"
             class="date-input"
             :min="state.startDate"
             :max="getMaxEndDate(index)"
             @change="validateAndEmit">
      <button
class="remove-button"
              :disabled="modelValue.length === 1"
              @click="removeState(index)">
        ✕
      </button>
    </div>
    <button
class="add-button"
            :disabled="!canAddState"
            @click="addState">
      Добавить состояние
    </button>
    <div v-if="!isValid" class="error-message">
      Состояния должны идти последовательно без перекрытий
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { OperatingStateEntry } from '../../types/table';
import { validateOperatingStates } from '../../types/table';

const props = defineProps<{
  modelValue: OperatingStateEntry[];
  periodStart: string;
  periodEnd: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: OperatingStateEntry[]): void;
}>();

const isValid = ref(true);

const validateAndEmit = () => {
  isValid.value = validateOperatingStates(props.modelValue);
  if (isValid.value) {
    emit('update:modelValue', props.modelValue);
  }
};

const getMinStartDate = (index: number): string => {
  if (index === 0) return props.periodStart;
  return props.modelValue[index - 1].endDate;
};

const getMaxStartDate = (index: number): string => {
  if (index === props.modelValue.length - 1) return props.periodEnd;
  return props.modelValue[index + 1].startDate;
};

const getMaxEndDate = (index: number): string => {
  if (index === props.modelValue.length - 1) return props.periodEnd;
  return props.modelValue[index + 1].startDate;
};

const canAddState = computed(() => {
  if (props.modelValue.length === 0) return true;
  const lastState = props.modelValue[props.modelValue.length - 1];
  return new Date(lastState.endDate) < new Date(props.periodEnd);
});

const addState = () => {
  const lastState = props.modelValue[props.modelValue.length - 1];
  const newState: OperatingStateEntry = {
    state: 'operating_state_prod',
    startDate: lastState ? lastState.endDate : props.periodStart,
    endDate: props.periodEnd
  };
  emit('update:modelValue', [...props.modelValue, newState]);
};

const removeState = (index: number) => {
  const newStates = [...props.modelValue];
  newStates.splice(index, 1);
  emit('update:modelValue', newStates);
};

// Начальная валидация
watch(() => props.modelValue, validateAndEmit, { immediate: true });
</script>

<style scoped>
.operating-states-manager {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.operating-state-entry {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.state-select,
.date-input {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.state-select {
  min-width: 120px;
}

.remove-button {
  padding: 6px 10px;
  border: none;
  background: #ff4444;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.remove-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.add-button {
  margin-top: 8px;
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 8px;
  color: #ff4444;
  font-size: 14px;
}
</style> 