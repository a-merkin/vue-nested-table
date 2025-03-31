<template>
  <template v-for="(event, eventIndex) in well.events" :key="event.id">
    <!-- Строка события -->
    <tr :class="{ 'event-row': true }">
      <td v-if="eventIndex === 0" 
          :rowspan="getWellTotalRowspan(well)" 
          :class="['well-name-cell', getWellStateClass(well.state)]">
        {{ well.name }}
      </td>
      <td class="team-cell">
        <div class="event-name" @click="$emit('toggle-event', event.id)" :title="event.name">
          <span class="expand-icon">{{ isEventExpanded(event.id) ? '▼' : '▶' }}</span>
          {{ event.name }}
        </div>
      </td>
      <td class="dates-cell" :title="formatDateRange(event.startDate, event.endDate).full">
        {{ formatDateRange(event.startDate, event.endDate).short }}
      </td>
      <td :colspan="groupedDates.length" class="gantt-timeline">
        <template v-if="event.type === 'base_production'">
          <OperatingStatesBar
            :operating_states="event.operating_states"
            :grouped-dates="groupedDates"
          />
        </template>
        <template v-else>
          <GanttBar
            :item="event"
            :grouped-dates="groupedDates"
            :kind="event.kind"
            :type="event.type"
            :style-type="'event'"
          />
        </template>
      </td>
    </tr>
    <!-- Строки ресурсов и их операций -->
    <template v-if="isEventExpanded(event.id)">
      <template v-for="resource in event.resources" :key="resource.id">
        <!-- Строка ресурса -->
        <tr class="resource-row">
          <td class="team-cell resource-name">
            <div class="resource-title" @click="$emit('toggle-resource', resource.id)" :title="resource.name">
              <span class="expand-icon resource-icon">{{ isResourceExpanded(resource.id) ? '▼' : '▶' }}</span>
              {{ resource.name }}
            </div>
          </td>
          <td class="dates-cell" :title="formatDateRange(resource.operations[0]?.startDate, resource.operations[resource.operations.length - 1]?.endDate).full">
            {{ formatDateRange(resource.operations[0]?.startDate, resource.operations[resource.operations.length - 1]?.endDate).short }}
          </td>
          <td :colspan="groupedDates.length" class="gantt-timeline">
            <GanttBar
              :item="resource"
              :grouped-dates="groupedDates"
              :kind="event.kind"
              :type="event.type"
              :style-type="'resource'"
            />
          </td>
        </tr>
        <!-- Строки операций -->
        <template v-if="isResourceExpanded(resource.id)">
          <tr v-for="operation in resource.operations" 
              :key="operation.id"
              class="operation-row">
            <td class="team-cell operation-name" :title="operation.name">
              {{ operation.name }}
            </td>
            <td class="dates-cell" :title="formatDateRange(operation.startDate, operation.endDate || operation.startDate).full">
              {{ formatDateRange(operation.startDate, operation.endDate || operation.startDate).short }}
            </td>
            <td :colspan="groupedDates.length" class="gantt-timeline">
              <GanttBar
                :item="operation"
                :grouped-dates="groupedDates"
                :kind="event.kind"
                :type="event.type"
                :style-type="'operation'"
              />
            </td>
          </tr>
        </template>
      </template>
    </template>
  </template>
</template>

<script setup lang="ts">
import type { Well, Resource, Operation, EventKind, OperatingState, EventType } from '../../types/table';
import { useDateFormatting } from '../../composables/useDateFormatting';
import GanttBar from './GanttBar.vue';
import OperatingStatesBar from './OperatingStatesBar.vue';

type DateRange = {
  start: Date;
  end: Date;
  key: string;
};

const props = defineProps<{
  well: Well;
  groupedDates: DateRange[];
  expandedEvents: Set<string>;
  expandedResources: Set<string>;
}>();

defineEmits<{
  (e: 'toggle-event', eventId: string): void;
  (e: 'toggle-resource', resourceId: string): void;
}>();

const { formatDateRange } = useDateFormatting();

const isEventExpanded = (eventId: string): boolean => props.expandedEvents.has(eventId);
const isResourceExpanded = (resourceId: string): boolean => props.expandedResources.has(resourceId);

const getWellTotalRowspan = (well: Well): number => {
  return well.events.reduce((total, event) => {
    if (!isEventExpanded(event.id)) {
      return total + 1;
    }
    return total + 1 + (event.resources?.reduce((resourceTotal, resource) => {
      return resourceTotal + 1 + (isResourceExpanded(resource.id) ? resource.operations.length : 0);
    }, 0) ?? 0);
  }, 0);
};

const getWellStateClass = (state: OperatingState): string => `well-state-${state.replace('operating_state_', '')}`;
</script>

<style scoped>
/* Фиксированные ширины для первых трех колонок */
.well-name-cell {
  position: sticky;
  left: 0;
  z-index: 2;
  min-width: 120px;
  max-width: 120px;
  background-color: #FFFFFF;
}

.team-cell {
  position: sticky;
  left: 120px;
  z-index: 2;
  min-width: 150px;
  max-width: 150px;
  overflow: hidden;
  padding: 2px 4px;
  white-space: nowrap;
  background-color: #FFFFFF;
}

.dates-cell {
  position: sticky;
  left: 270px;
  z-index: 2;
  min-width: 100px;
  max-width: 100px;
  text-align: center;
  font-size: 12px;
  color: #666666;
  background-color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gantt-timeline {
  padding: 0;
  position: relative;
  vertical-align: top;
  width: auto;
  background: repeating-linear-gradient(
    90deg,
    #F7F7F7 0px,
    #F7F7F7 1px,
    #FFFFFF 1px,
    #FFFFFF 45px
  );
}

.gantt-timeline > * {
  min-width: 45px;
}

.event-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  border-radius: 4px;
  background-color: #F7F7F7;
  transition: background-color 0.2s;
}

.event-name:hover {
  background-color: #F0F0F0;
}

.resource-title {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  color: #333333;
  padding: 4px 8px 4px 32px;
  border-radius: 4px;
  background-color: #F9F9F9;
  transition: background-color 0.2s;
}

.resource-title:hover {
  background-color: #F0F0F0;
}

.operation-name {
  padding: 3px 8px 3px 48px;
  font-size: 11px;
  color: #666666;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.operation-row:hover .operation-name {
  background-color: #F9F9F9;
}

.expand-icon {
  margin-right: 8px;
  font-size: 10px;
  transition: transform 0.2s;
  opacity: 0.7;
}

.event-name .expand-icon {
  font-size: 11px;
  opacity: 0.8;
}

.resource-title .expand-icon {
  font-size: 10px;
  opacity: 0.7;
}

/* Цвета для состояний скважин */
.well-state-prod {
  background-color: #E8F5E9;
  /* border-left: 3px solid #4CAF50; */
}

.well-state-inje {
  background-color: #E3F2FD;
  color: #1565C0;
  font-weight: bold;
}

.well-state-inje:hover {
  background-color: #BBDEFB;
}

.well-state-idle {
  background-color: #FFEBEE;
  border-left: 3px solid #F44336;
}

.well-state-intake {
  background-color: #F3E5F5;
  color: #7B1FA2;
  font-weight: bold;
}

.well-state-intake:hover {
  background-color: #E1BEE7;
}

/* Стили для строк */
.event-row {
  background-color: #FFFFFF;
}

.resource-row {
  background-color: #FFFFFF;
}

.operation-row {
  background-color: #FFFFFF;
}

/* Hover эффекты для строк */
.event-row:hover {
  background-color: #F9F9F9;
}

.resource-row:hover {
  background-color: #FAFAFA;
}

.operation-row:hover {
  background-color: #FCFCFC;
}
</style> 