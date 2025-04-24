<template>
  <div class="nested-table">
    <div class="table-controls">
      <GranularitySelector
        v-model="granularity"
      />
      <label class="expand-all-checkbox">
        <input 
          type="checkbox" 
          v-model="expandAll" 
          @change="handleExpandAllChange"
        />
        Раскрыть все
      </label>
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="well-header">Скважина</th>
            <th class="team-header">Мероприятие</th>
            <th class="date-start-header">Дата начала</th>
            <th class="date-end-header">Дата конца</th>
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
              @event-action="handleEventAction"
              @event-dates-change="handleEventDatesChange"
              @resource-dates-change="handleResourceDatesChange"
            />
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Well, DateGranularity, Event } from '../types/table';
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
  (e: 'event-action', payload: { type: 'edit' | 'add', eventId: string, wellId: string, wellName: string }): void;
  (e: 'resource-dates-change', payload: { resourceId: string, startDate: string, endDate: string }): void;
}>();

// Состояние
const granularity = ref<DateGranularity>('month');
const expandAll = ref(false);

// Композиции
const { expandedEvents, expandedResources, toggleEvent, toggleResource } = useExpansionState();
const { groupedDates, formatDate } = useDateRanges(props.wells, granularity);

// Обработчики
const handleWellAction = (payload: { type: 'edit' | 'add', wellId: string }) => {
  // Implementation needed
};

const handleEventAction = (payload: { type: 'edit' | 'add', eventId: string, wellId: string, wellName: string }) => {
  emit('event-action', payload);
};

const handleEventDatesChange = (payload: { eventId: string, startDate: string, endDate: string }) => {
  // Implementation needed
};

const handleResourceDatesChange = (payload: { resourceId: string, startDate: string, endDate: string }) => {
  emit('resource-dates-change', payload);
};

const handleExpandAllChange = () => {
  if (expandAll.value) {
    // Expand all events
    props.wells.forEach(well => {
      well.events.forEach(event => {
        if (!expandedEvents.value.has(event.id)) {
          expandedEvents.value.add(event.id);
        }
      });
    });
  } else {
    // Collapse all events and resources
    expandedEvents.value.clear();
    expandedResources.value.clear();
  }
};

// Watch for changes in wells to update expandAll state
watch(() => props.wells, (newWells) => {
  const allEventsExpanded = newWells.every(well => 
    well.events.every(event => expandedEvents.value.has(event.id))
  );
  expandAll.value = allEventsExpanded;
}, { deep: true });
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

.date-start-header {
  position: sticky;
  left: 270px;
  z-index: 3;
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  background-color: var(--table-header-bg);
}

.date-end-header {
  position: sticky;
  left: 370px;
  z-index: 3;
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  background-color: var(--table-header-bg);
}
th:not(.well-header):not(.team-header):not(.date-start-header):not(.date-end-header) {
  min-width: 45px;
}

.well-header, .team-header, .date-start-header, .date-end-header {
  white-space: nowrap;
  font-weight: 700;
  color: var(--table-header-color);
  overflow: hidden;
  text-overflow: ellipsis;
}

.well-group-separator {
  border-bottom: 2px solid #e0e0e0;
}

.table-controls {
  display: flex;
  align-items: start;
  gap: 16px;
}

.expand-all-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.expand-all-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
