<template>
  <div class="operating-states-container">
    <div v-for="state in validOperatingStates"
         :key="state.startDate"
         class="operating-state"
         :class="[getStateClass(state.state), styleType]"
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
  styleType?: 'primary' | 'secondary' | 'background';
}

const props = withDefaults(defineProps<Props>(), {
  styleType: 'primary'
});

const validOperatingStates = computed(() => {
  const states = props.operating_states ?? [];
  return validateOperatingStates(states) ? states : [];
});

const calculateStateStyle = (state: OperatingStateEntry) => {
  const start = new Date(state.startDate);
  const end = new Date(state.endDate);

  const timelineStart = new Date(props.groupedDates[0].start);
  const timelineEnd = new Date(props.groupedDates[props.groupedDates.length - 1].end);

  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(0, ((start.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const endOffset = Math.min(100, ((end.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const width = Math.max(0, endOffset - startOffset);

  return {
    left: `${startOffset}%`,
    width: `${width}%`
  };
};

const getStateClass = (state: string | null): string => {
  if (state === null) return 'state-null';
  return `state-${state.replace('operating_state_', '')}`;
};
</script>

<style scoped>
.operating-states-container {
  position: absolute;
  height: 100%;
  width: 100%;
  margin: 0;
}

.operating-state {
  position: absolute;
  height: 100%;
  transition: all 0.2s;
  border-radius: 4px;
}

/* Цвета для состояний работы скважины */
.state-prod {
  background-color: rgba(76, 175, 80, 0.2);
  border-right: 1px solid rgba(76, 175, 80, 0.2);
}

.state-inje {
  background-color: rgba(33, 150, 243, 0.2);
  border-right: 1px solid rgba(33, 150, 243, 0.2);
}

.state-idle {
  background-color: rgba(244, 67, 54, 0.2);
  border-right: 1px solid rgba(244, 67, 54, 0.2);
}

.state-intake {
  background-color: rgba(156, 39, 176, 0.2);
  border-right: 1px solid rgba(156, 39, 176, 0.2);
}

/* Стиль для null состояния */
.state-null {
  background-color: rgba(200, 200, 200, 0.05);
  background-image: radial-gradient(circle at 50% 50%, rgba(128, 128, 128, 0.2) 2px, transparent 2px);
  background-size: 8px 8px;
  border-right: 1px solid rgba(128, 128, 128, 0.2);
}
</style>
