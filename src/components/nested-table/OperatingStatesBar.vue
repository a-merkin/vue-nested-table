<template>
  <div class="operating-states-container">
    <div v-for="state in validOperatingStates" 
         :key="state.startDate" 
         class="operating-state"
         :class="getStateClass(state.state)"
         :style="calculateStateStyle(state)">
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OperatingStateEntry } from '../../types/table';
import { validateOperatingStates } from '../../types/table';

interface Props {
  operating_states?: OperatingStateEntry[];
  groupedDates: Array<{
    start: Date;
    end: Date;
    key: string;
  }>;
}

const props = defineProps<Props>();

const validOperatingStates = computed(() => {
  const states = props.operating_states ?? [];
  return validateOperatingStates(states) ? states : [];
});

const calculateStateStyle = (state: OperatingStateEntry) => {
  const start = new Date(state.startDate);
  const end = new Date(state.endDate);
  
  // Устанавливаем начало дня для начальной даты
  start.setHours(0, 0, 0, 0);
  
  // Для конечной даты берем начало дня (не включаем саму дату окончания)
  end.setHours(0, 0, 0, 0);
  
  const timelineStart = new Date(props.groupedDates[0].start);
  const timelineEnd = new Date(props.groupedDates[props.groupedDates.length - 1].end);
  
  timelineStart.setHours(0, 0, 0, 0);
  
  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(0, ((start.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const width = Math.min(100 - startOffset, ((end.getTime() - start.getTime()) / timelineDuration) * 100);
  
  return {
    left: `${startOffset}%`,
    width: `${width}%`
  };
};

const getStateClass = (state: string): string => `state-${state.replace('operating_state_', '')}`;
</script>

<style scoped>
.operating-states-container {
  position: relative;
  height: 30px;
  width: 100%;
  margin: 2px 0;
}

.operating-state {
  position: absolute;
  height: 100%;
  transition: all 0.2s;
}

/* Цвета для состояний работы скважины */
.state-prod {
  background: linear-gradient(to right, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.2));
  border-right: 2px solid rgba(76, 175, 80, 0.5);
}

.state-inje {
  background: linear-gradient(to right, rgba(33, 150, 243, 0.3), rgba(33, 150, 243, 0.2));
  border-right: 2px solid rgba(33, 150, 243, 0.5);
}

.state-idle {
  background: linear-gradient(to right, rgba(244, 67, 54, 0.3), rgba(244, 67, 54, 0.2));
  border-right: 2px solid rgba(244, 67, 54, 0.5);
}

.state-intake {
  background: linear-gradient(to right, rgba(156, 39, 176, 0.3), rgba(156, 39, 176, 0.2));
  border-right: 2px solid rgba(156, 39, 176, 0.5);
}
</style> 