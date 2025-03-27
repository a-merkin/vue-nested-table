<template>
  <div class="nested-table">
    <div class="controls">
      <div class="granularity-selector">
        <label>Детализация:</label>
        <select v-model="granularity">
          <option value="day">День</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
        </select>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th class="well-header">Скважина</th>
          <th class="team-header">Мероприятие</th>
          <th class="dates-header">Период</th>
          <th v-for="date in groupedDates" :key="date.key" class="date-header">
            {{ formatDate(date.start, date.end) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="well in wells" :key="well.id">
          <template v-for="(event, eventIndex) in well.events" :key="event.id">
            <!-- Строка события -->
            <tr :class="{ 'event-row': true }">
              <td v-if="eventIndex === 0" 
                  :rowspan="getWellTotalRowspan(well)" 
                  :class="getWellStateClass(well.state)">
                {{ well.name }}
              </td>
              <td class="team-cell">
                <div class="event-name" @click="toggleEvent(event.id)" :title="event.name">
                  <span class="expand-icon">{{ isEventExpanded(event.id) ? '▼' : '▶' }}</span>
                  {{ event.name }}
                </div>
              </td>
              <td class="dates-cell" :title="formatDateRange(event.startDate, event.endDate).full">
                {{ formatDateRange(event.startDate, event.endDate).short }}
              </td>
              <td :colspan="groupedDates.length" class="gantt-timeline">
                <div class="gantt-bar-container">
                  <div class="gantt-bar"
                       :class="[
                         getEventKindClass(event.kind),
                         getEventTypeClass(event.type)
                       ]"
                       :style="getEventBarStyle(event)"
                       :title="event.name">
                    <div class="gantt-bar-label">{{ event.name }}</div>
                  </div>
                </div>
              </td>
            </tr>
            <!-- Строки ресурсов и их операций -->
            <template v-if="isEventExpanded(event.id)">
              <template v-for="resource in event.resources" :key="resource.id">
                <!-- Строка ресурса -->
                <tr class="resource-row">
                  <td class="team-cell resource-name">
                    <div class="resource-title" @click="toggleResource(resource.id)" :title="resource.name">
                      <span class="expand-icon resource-icon">{{ isResourceExpanded(resource.id) ? '▼' : '▶' }}</span>
                      {{ resource.name }}
                    </div>
                  </td>
                  <td class="dates-cell" :title="formatDateRange(resource.operations[0]?.startDate, resource.operations[resource.operations.length - 1]?.endDate).full">
                    {{ formatDateRange(resource.operations[0]?.startDate, resource.operations[resource.operations.length - 1]?.endDate).short }}
                  </td>
                  <td :colspan="groupedDates.length" class="gantt-timeline">
                    <div class="gantt-bar-container">
                      <div class="gantt-bar resource-bar"
                           :class="[
                             getEventKindClass(event.kind),
                             getEventTypeClass(event.type)
                           ]"
                           :style="getGanttBarStyle(resource)"
                           :title="resource.name">
                        <div class="gantt-bar-label">{{ resource.name }}</div>
                      </div>
                    </div>
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
                      <div class="gantt-bar-container">
                        <div class="gantt-bar operation-bar"
                             :class="[
                               getEventKindClass(event.kind),
                               getEventTypeClass(event.type)
                             ]"
                             :style="getOperationBarStyle(operation)"
                             :title="operation.name">
                          <div class="gantt-bar-label">{{ operation.name }}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Well, Resource, Operation, EventKind, OperatingState, EventType, DateGranularity } from '../types/table';

// Типы
type DateRange = {
  start: Date;
  end: Date;
  key: string;
};

type FormatDateResult = {
  short: string;
  full: string;
};

// Константы
const DATE_FORMATS = {
  SHORT: {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  },
  FULL: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
} as const;

// Пропсы
const props = defineProps<{
  wells: Well[];
}>();

// Состояние
const granularity = ref<DateGranularity>('month');
const expandedEvents = ref<Set<string>>(new Set());
const expandedResources = ref<Set<string>>(new Set());

// Вычисляемые свойства
const groupedDates = computed<DateRange[]>(() => {
  const { minDate, maxDate } = findDateRange(props.wells);
  if (!minDate || !maxDate) return [];
  return getDateRanges(minDate, maxDate, granularity.value);
});

// Методы для работы с датами
const findDateRange = (wells: Well[]) => {
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  wells.forEach(well => {
    well.events.forEach(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      if (!minDate || startDate < minDate) minDate = startDate;
      if (!maxDate || endDate > maxDate) maxDate = endDate;
    });
  });

  return { minDate, maxDate };
};

const getDateRanges = (startDate: Date, endDate: Date, granularity: DateGranularity): DateRange[] => {
  const ranges: DateRange[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const rangeEnd = calculateRangeEnd(currentDate, granularity);
    ranges.push({
      start: new Date(currentDate),
      end: rangeEnd,
      key: currentDate.toISOString()
    });
    currentDate = getNextDate(currentDate, granularity);
  }

  return ranges;
};

const calculateRangeEnd = (date: Date, granularity: DateGranularity): Date => {
  const end = new Date(date);
  
  switch (granularity) {
    case 'day':
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      end.setDate(date.getDate() + (6 - date.getDay()));
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return end;
};

const getNextDate = (date: Date, granularity: DateGranularity): Date => {
  const next = new Date(date);
  
  switch (granularity) {
    case 'day':
      next.setDate(next.getDate() + 1);
      break;
    case 'week':
      next.setDate(next.getDate() + 7);
      break;
    case 'month':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  
  return next;
};

// Форматирование дат
const formatDate = (start: Date, end: Date): string => {
  switch (granularity.value) {
    case 'day':
      return start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    case 'week':
      return `${start.toLocaleDateString('ru-RU', { day: 'numeric' })} - ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
    case 'month':
      return start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    default:
      return '';
  }
};

const formatDateRange = (startDate: string, endDate: string): FormatDateResult => {
  if (!startDate || !endDate) {
    return { short: '', full: '' };
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return {
    short: formatDateToString(start, end, DATE_FORMATS.SHORT),
    full: formatDateToString(start, end, DATE_FORMATS.FULL)
  };
};

const formatDateToString = (start: Date, end: Date, options: Intl.DateTimeFormatOptions): string => {
  const startStr = start.toLocaleDateString('ru-RU', options);
  const endStr = end.toLocaleDateString('ru-RU', options);
  
  if (options === DATE_FORMATS.FULL) {
    const startTime = start.toLocaleTimeString('ru-RU');
    const endTime = end.toLocaleTimeString('ru-RU');
    return `${startStr}, ${startTime} - ${endStr}, ${endTime}`;
  }
  
  return `${startStr} - ${endStr}`;
};

// Управление состоянием разворачивания
const toggleEvent = (eventId: string): void => {
  if (expandedEvents.value.has(eventId)) {
    expandedEvents.value.delete(eventId);
    expandedResources.value.clear();
  } else {
    expandedEvents.value.add(eventId);
  }
};

const toggleResource = (resourceId: string): void => {
  if (expandedResources.value.has(resourceId)) {
    expandedResources.value.delete(resourceId);
  } else {
    expandedResources.value.add(resourceId);
  }
};

const isEventExpanded = (eventId: string): boolean => expandedEvents.value.has(eventId);
const isResourceExpanded = (resourceId: string): boolean => expandedResources.value.has(resourceId);

// Вычисление стилей для диаграммы Ганта
const calculateGanttBarStyle = (startDate: string, endDate: string): { left: string; width: string; minWidth: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  const timelineStart = new Date(groupedDates.value[0].start);
  const timelineEnd = new Date(groupedDates.value[groupedDates.value.length - 1].end);
  
  timelineStart.setHours(0, 0, 0, 0);
  
  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(0, ((start.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const width = Math.min(100 - startOffset, ((end.getTime() - start.getTime()) / timelineDuration) * 100);
  
  return {
    left: `${startOffset}%`,
    width: `${Math.max(width, 5)}%`,
    minWidth: '20px'
  };
};

const getEventBarStyle = (event: { startDate: string; endDate: string }) => 
  calculateGanttBarStyle(event.startDate, event.endDate);

const getGanttBarStyle = (resource: Resource) => {
  if (resource.operations.length === 0) return {};
  
  const firstOperation = resource.operations[0];
  const lastOperation = resource.operations[resource.operations.length - 1];
  
  return calculateGanttBarStyle(firstOperation.startDate, lastOperation.endDate || lastOperation.startDate);
};

const getOperationBarStyle = (operation: Operation) => 
  calculateGanttBarStyle(operation.startDate, operation.endDate || operation.startDate);

// Вспомогательные методы для классов
const getWellTotalRowspan = (well: Well): number => {
  return well.events.reduce((total, event) => {
    if (!isEventExpanded(event.id)) {
      return total + 1;
    }
    return total + 1 + event.resources.reduce((resourceTotal, resource) => {
      return resourceTotal + 1 + (isResourceExpanded(resource.id) ? resource.operations.length : 0);
    }, 0);
  }, 0);
};

const getEventKindClass = (kind: EventKind): string => `event-kind-${kind.replace('event_kind_', '')}`;
const getEventTypeClass = (type: EventType): string => `event-type-${type.replace('event_type_', '')}`;
const getWellStateClass = (state: OperatingState): string => `well-state-${state.replace('operating_state_', '')}`;
</script>

<style scoped>
.nested-table {
  overflow-x: auto;
  /* margin: 20px; */
  /* font-family: 'IBM Plex Mono', monospace; */
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 800px;
  table-layout: fixed;
}

th, td {
  border: 1px solid #C0C0C0;
  padding: 2px 4px;
  text-align: left;
}

.well-header, .team-header, .dates-header {
  width: fit-content;
  white-space: nowrap;
  background-color: #f5f5f5;
  font-weight: 700;
  color: #333333;
  width: 10%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.well-header {
  max-width: 100px;
}

.team-header {
  max-width: 150px;
}

.team-cell {
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  padding: 2px 4px;
}

.event-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.03);
  transition: background-color 0.2s;
}

.resource-title {
  /* display: flex; */
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  color: #333333;
  padding: 2px 4px 2px 16px;
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.02);
  transition: background-color 0.2s;
}

.operation-name {
  font-size: 11px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 2px 4px 2px 28px;
}

.expand-icon {
  margin-right: 4px;
  font-size: 10px;
  transition: transform 0.2s;
  opacity: 0.7;
  min-width: 10px;
}

.resource-name {
  font-weight: bold;
  color: #1976d2;
  padding: 2px 4px;
  background-color: #e3f2fd;
  border-radius: 2px;
  cursor: pointer;
  /* display: flex; */
  align-items: center;
  transition: background-color 0.2s;
  margin: 0;
}

.dates-header, .dates-cell {
  width: 10%;
  max-width: 200px;
  text-align: center;
  font-size: 12px;
  color: #666;
  background-color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-header {
  background-color: #f5f5f5;
  font-weight: 700;
  font-size: 12px;
  color: #333333;
  text-align: center;
  width: auto;
}

.gantt-timeline {
  padding: 0;
  position: relative;
  vertical-align: top;
  width: auto;
  background: repeating-linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.03) 0px,
    rgba(0, 0, 0, 0.03) 1px,
    transparent 1px,
    transparent 20px
  );
}

.gantt-bar-container {
  height: 30px;
  position: relative;
  margin: 2px 0;
  width: 100%;
  padding: 0 2px;
  box-sizing: border-box;
}

.gantt-bar {
  position: absolute;
  height: 24px;
  top: 3px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  z-index: 1;
}

.gantt-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.gantt-bar-label {
  font-size: 11px;
  padding: 4px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333333;
  /* position: sticky; */
  left: 4px;
  max-width: calc(100% - 8px);
}

.team-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
  font-size: 12px;
}

.resource-icon {
  margin-right: 8px;
  font-size: 0.8em;
  transition: transform 0.2s;
}

.resource-name.expanded .resource-icon {
  transform: rotate(0deg);
}

.operations-list {
  margin-left: 20px;
  border-left: 2px solid #e3f2fd;
  padding-left: 8px;
}

.operation-cell {
  background-color: #f5f5f5;
  margin: 2px 0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f5f5f5;
}

/* Цвета для видов мероприятий (основной фон) */
.event-kind-gtm {
  background-color: #e3f2fd;
  border-left-color: #1976d2;
}
.event-kind-otm {
  background-color: #f3e5f5;
  border-left-color: #7b1fa2;
}
.event-kind-start {
  background-color: #e8f5e9;
  border-left-color: #388e3c;
}
.event-kind-shut {
  background-color: #ffebee;
  border-left-color: #d32f2f;
}

/* Цвета для типов мероприятий (дополнительная индикация) */
.event-type-grp {
  border-right: 3px solid #1976d2;
}
.event-type-opz {
  border-right: 3px solid #2196f3;
}
.event-type-zbs {
  border-right: 3px solid #64b5f6;
}
.event-type-vns {
  border-right: 3px solid #90caf9;
}

.event-type-krs {
  border-right: 3px solid #7b1fa2;
}
.event-type-trs {
  border-right: 3px solid #9c27b0;
}
.event-type-ppr {
  border-right: 3px solid #ba68c8;
}

.event-type-start {
  border-right: 3px solid #388e3c;
}

.event-type-conservation {
  border-right: 3px solid #d32f2f;
}
.event-type-liquidation {
  border-right: 3px solid #f44336;
}

/* Цвета для состояний скважин */
.well-state-prod {
  background-color: #e8f5e9;
  color: #2e7d32;
  font-weight: bold;
}
.well-state-prod:hover {
  background-color: #c8e6c9;
}

.well-state-inje {
  background-color: #e3f2fd;
  color: #1565c0;
  font-weight: bold;
}
.well-state-inje:hover {
  background-color: #bbdefb;
}

.well-state-idle {
  background-color: #fff3e0;
  color: #ef6c00;
  font-weight: bold;
}
.well-state-idle:hover {
  background-color: #ffe0b2;
}

.well-state-intake {
  background-color: #f3e5f5;
  color: #7b1fa2;
  font-weight: bold;
}
.well-state-intake:hover {
  background-color: #e1bee7;
}

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

.operations-dropdown,
.operation-item {
  display: none;
}

.event-row {
  background-color: #ffffff;
}

.resource-name {
  padding-left: 24px;
  background-color: #f8f9fa;
}

.resource-bar {
  height: 22px;
  opacity: 0.9;
}

.operation-row {
  background-color: #f8f9fa;
}

.operation-bar {
  height: 20px;
  opacity: 0.8;
}

.operation-bar .gantt-bar-label {
  font-size: 10px;
}

/* События - самый высокий уровень */
.event-row .gantt-bar {
  height: 28px;
  top: 1px;
  border-width: 2px;
  border-style: solid;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  font-weight: 600;
}

.event-row .gantt-bar-label {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
}

/* Ресурсы - средний уровень */
.resource-row .gantt-bar {
  height: 24px;
  top: 3px;
  border-width: 1px;
  border-style: solid;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5));
}

.resource-row .gantt-bar-label {
  font-size: 11px;
  font-weight: 500;
  color: #333333;
}

/* Операции - нижний уровень */
.operation-row .gantt-bar {
  height: 20px;
  top: 5px;
  border-width: 1px;
  border-style: dashed;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3));
}

.operation-row .gantt-bar-label {
  font-size: 10px;
  font-weight: 400;
  color: #666666;
}

/* Обновленные стили для видов мероприятий с учетом иерархии */
.event-kind-gtm {
  background: linear-gradient(to right, rgba(227, 242, 253, 0.9), rgba(227, 242, 253, 0.7));
  border-color: #1976d2;
}

.event-kind-otm {
  background: linear-gradient(to right, rgba(243, 229, 245, 0.9), rgba(243, 229, 245, 0.7));
  border-color: #7b1fa2;
}

.event-kind-start {
  background: linear-gradient(to right, rgba(232, 245, 233, 0.9), rgba(232, 245, 233, 0.7));
  border-color: #388e3c;
}

.event-kind-shut {
  background: linear-gradient(to right, rgba(255, 235, 238, 0.9), rgba(255, 235, 238, 0.7));
  border-color: #d32f2f;
}

/* Стили для названий в левой колонке */
.event-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.03);
  transition: background-color 0.2s;
}

.event-name:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.resource-title {
  /* display: flex; */
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  color: #333333;
  padding: 4px 8px 4px 32px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.02);
  transition: background-color 0.2s;
}

.resource-title:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.operation-name {
  padding: 3px 8px 3px 48px;
  font-size: 11px;
  color: #666666;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.operation-row:hover .operation-name {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Обновленные стили для иконок разворачивания */
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

/* Стили для строк */
.event-row {
  background-color: rgba(255, 255, 255, 0.7);
}

.resource-row {
  background-color: rgba(249, 250, 251, 0.7);
}

.operation-row {
  background-color: rgba(250, 250, 250, 0.5);
}

/* Hover эффекты для строк */
.event-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.resource-row:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

.operation-row:hover {
  background-color: rgba(0, 0, 0, 0.005);
}
</style> 