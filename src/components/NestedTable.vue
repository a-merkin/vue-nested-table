<template>
  <div class="nested-table">
    <GranularitySelector
      v-model="granularity"
    />
    <table>
      <thead>
        <tr>
          <th class="well-header">Скважина</th>
          <th class="team-header">Мероприятие</th>
          <th class="dates-header">Период</th>
          <TimelineHeader
            :dates="groupedDates"
            :format-date="formatDate"
          />
        </tr>
      </thead>
      <tbody>
        <template v-for="well in wells" :key="well.id">
          <WellEvents
            :well="well"
            :grouped-dates="groupedDates"
            :expanded-events="expandedEvents"
            :expanded-resources="expandedResources"
            @toggle-event="toggleEvent"
            @toggle-resource="toggleResource"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Well, DateGranularity } from '../types/table';
import { useDateRanges } from '../composables/useDateRanges';
import { useExpansionState } from '../composables/useExpansionState';
import GranularitySelector from './nested-table/GranularitySelector.vue';
import TimelineHeader from './nested-table/TimelineHeader.vue';
import WellEvents from './nested-table/WellEvents.vue';

// Пропсы
const props = defineProps<{
  wells: Well[];
}>();

// Состояние
const granularity = ref<DateGranularity>('month');

// Композиции
const { expandedEvents, expandedResources, toggleEvent, toggleResource } = useExpansionState();
const { groupedDates, formatDate } = useDateRanges(props.wells, granularity);
</script>

<style scoped>
.nested-table {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 800px;
  table-layout: fixed;
}

th {
  border: 1px solid #C0C0C0;
  padding: 2px 4px;
  text-align: left;
}

.well-header, .team-header, .dates-header {
  width: 10%;
  white-space: nowrap;
  background-color: #f5f5f5;
  font-weight: 700;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
}

.well-header { max-width: 100px; }
.team-header { max-width: 150px; }
</style> 