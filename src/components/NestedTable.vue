<template>
  <div class="nested-table">
    <GranularitySelector
      v-model="granularity"
    />
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="well-header">Скважина</th>
            <th class="team-header">Мероприятие</th>
            <th class="dates-header">Период</th>
            <TimelineHeader
              v-if="(groupedDates as unknown as DateRange[]).length > 1"
              :dates="groupedDates as unknown as DateRange[]"
              :format-date="formatDate"
            />
          </tr>
        </thead>
        <tbody>
          <template v-for="(well, wellIndex) in wells" :key="well.id">
            <WellEvents
              :well="well"
              :grouped-dates="groupedDates as unknown as DateRange[]"
              :expanded-events="expandedEvents as unknown as Set<string>"
              :expanded-resources="expandedResources as unknown as Set<string>"
              :is-last-well="wellIndex === wells.length - 1"
              @toggle-event="toggleEvent"
              @toggle-resource="toggleResource"
              @well-action="handleWellAction"
            />
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Well, DateGranularity } from '../types/table';
import type { DateRange } from '../composables/useDateRanges';
import { useDateRanges } from '../composables/useDateRanges';
import { useExpansionState } from '../composables/useExpansionState';
import GranularitySelector from './nested-table/GranularitySelector.vue';
import TimelineHeader from './nested-table/TimelineHeader.vue';
import WellEvents from './nested-table/WellEvents.vue';

// Пропсы
const props = defineProps<{
  wells: Well[];
}>();

// Эмиты
const emit = defineEmits<{
  (e: 'well-action', payload: { type: 'edit' | 'add', wellId: string }): void;
}>();

// Состояние
const granularity = ref<DateGranularity>('month');

// Композиции
const { expandedEvents, expandedResources, toggleEvent, toggleResource } = useExpansionState();
const { groupedDates, formatDate } = useDateRanges(props.wells, granularity);

// Обработчики
const handleWellAction = (payload: { type: 'edit' | 'add', wellId: string }) => {
  emit('well-action', payload);
};
</script>

<style scoped>
.nested-table {
  width: 100%;
  --table-border-color: #C0C0C0;
  --table-header-bg: #f5f5f5;
  --table-header-color: #333333;
}

.table-container {
  position: relative;
  overflow-x: auto;
  width: 100%;
}

table {
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
  table-layout: fixed;
}

th {
  border: 1px solid var(--table-border-color);
  padding: 2px 4px;
  text-align: left;
  min-width: 45px;
}

.well-header {
  position: sticky;
  left: 0;
  z-index: 3;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  background-color: var(--table-header-bg);
}

.team-header {
  position: sticky;
  left: 120px;
  z-index: 3;
  width: 150px;
  min-width: 150px;
  max-width: 150px;
  background-color: var(--table-header-bg);
}

.dates-header {
  position: sticky;
  left: 270px;
  z-index: 3;
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  background-color: var(--table-header-bg);
}

th:not(.well-header):not(.team-header):not(.dates-header) {
  min-width: 45px;
}

.well-header, .team-header, .dates-header {
  white-space: nowrap;
  font-weight: 700;
  color: var(--table-header-color);
  overflow: hidden;
  text-overflow: ellipsis;
}

.well-group-separator {
  border-bottom: 2px solid #e0e0e0;
}
</style>
