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
              <td class="dates-cell">{{ formatDateRange(event.startDate, event.endDate) }}</td>
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
                  <td class="dates-cell">{{ formatDateRange(resource.operations[0]?.startDate, resource.operations[resource.operations.length - 1]?.endDate) }}</td>
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
                    <td class="dates-cell">{{ formatDateRange(operation.startDate, operation.endDate || operation.startDate) }}</td>
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

const props = defineProps<{
  wells: Well[];
}>();

const granularity = ref<DateGranularity>('month');

const expandedEvents = ref<Set<string>>(new Set());
const expandedResources = ref<Set<string>>(new Set());

const toggleEvent = (eventId: string) => {
  if (expandedEvents.value.has(eventId)) {
    expandedEvents.value.delete(eventId);
    // При сворачивании события сворачиваем все его ресурсы
    expandedResources.value.clear();
  } else {
    expandedEvents.value.add(eventId);
  }
};

const isEventExpanded = (eventId: string): boolean => {
  return expandedEvents.value.has(eventId);
};

const toggleResource = (resourceId: string) => {
  if (expandedResources.value.has(resourceId)) {
    expandedResources.value.delete(resourceId);
  } else {
    expandedResources.value.add(resourceId);
  }
};

const isResourceExpanded = (resourceId: string): boolean => {
  return expandedResources.value.has(resourceId);
};

const getDateRanges = (startDate: Date, endDate: Date, granularity: DateGranularity) => {
  const ranges: { start: Date; end: Date; key: string }[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    let rangeEnd: Date;
    
    switch (granularity) {
      case 'day':
        rangeEnd = new Date(currentDate);
        rangeEnd.setHours(23, 59, 59, 999);
        break;
      case 'week':
        rangeEnd = new Date(currentDate);
        rangeEnd.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
        rangeEnd.setHours(23, 59, 59, 999);
        break;
      case 'month':
        rangeEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
    }

    ranges.push({
      start: new Date(currentDate),
      end: rangeEnd,
      key: currentDate.toISOString()
    });

    // Переход к следующему периоду
    switch (granularity) {
      case 'day':
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        break;
      case 'week':
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
        break;
      case 'month':
        currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        break;
    }
  }

  return ranges;
};

const groupedDates = computed(() => {
  const allDates = new Set<string>();
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  // Находим минимальную и максимальную даты
  props.wells.forEach(well => {
    well.events.forEach(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      if (!minDate || startDate < minDate) minDate = startDate;
      if (!maxDate || endDate > maxDate) maxDate = endDate;
    });
  });

  if (!minDate || !maxDate) return [];

  return getDateRanges(minDate, maxDate, granularity.value);
});

const formatDate = (start: Date, end: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  switch (granularity.value) {
    case 'day':
      return start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    case 'week':
      return `${start.toLocaleDateString('ru-RU', { day: 'numeric' })} - ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
    case 'month':
      return start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  }
};

const formatDateRange = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };
  
  return `${start.toLocaleDateString('ru-RU', options)} - ${end.toLocaleDateString('ru-RU', options)}`;
};

const getWellTotalRowspan = (well: Well) => {
  return well.events.reduce((total, event) => {
    if (!isEventExpanded(event.id)) {
      return total + 1; // Только строка события
    }
    return total + 1 + event.resources.reduce((resourceTotal, resource) => {
      return resourceTotal + 1 + (isResourceExpanded(resource.id) ? resource.operations.length : 0);
    }, 0);
  }, 0);
};

const getEventBarStyle = (event: { startDate: string; endDate: string }) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  const timelineStart = new Date(groupedDates.value[0].start);
  const timelineEnd = new Date(groupedDates.value[groupedDates.value.length - 1].end);
  
  timelineStart.setHours(0, 0, 0, 0);
  
  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(0, ((startDate.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const width = Math.min(100 - startOffset, ((endDate.getTime() - startDate.getTime()) / timelineDuration) * 100);
  
  return {
    left: `${startOffset}%`,
    width: `${Math.max(width, 5)}%`,
    minWidth: '20px'
  };
};

const getEventTypeClass = (type: EventType): string => {
  switch (type) {
    // ГТМ
    case 'event_type_grp':
      return 'event-type-grp';
    case 'event_type_opz':
      return 'event-type-opz';
    case 'event_type_zbs':
      return 'event-type-zbs';
    case 'event_type_vns':
      return 'event-type-vns';
    // ОТМ
    case 'event_type_krs':
      return 'event-type-krs';
    case 'event_type_trs':
      return 'event-type-trs';
    case 'event_type_ppr':
      return 'event-type-ppr';
    // Запуски
    case 'event_type_start':
      return 'event-type-start';
    // Отключения
    case 'event_type_conservation':
      return 'event-type-conservation';
    case 'event_type_liquidation':
      return 'event-type-liquidation';
    default:
      return '';
  }
};

const getEventKindClass = (kind: EventKind): string => {
  switch (kind) {
    case 'event_kind_gtm':
      return 'event-kind-gtm';
    case 'event_kind_otm':
      return 'event-kind-otm';
    case 'event_kind_start':
      return 'event-kind-start';
    case 'event_kind_shut':
      return 'event-kind-shut';
    default:
      return '';
  }
};

const getWellStateClass = (state: OperatingState): string => {
  switch (state) {
    case 'operating_state_prod':
      return 'well-state-prod';
    case 'operating_state_inje':
      return 'well-state-inje';
    case 'operating_state_idle':
      return 'well-state-idle';
    case 'operating_state_intake':
      return 'well-state-intake';
    default:
      return '';
  }
};

const getGanttBarStyle = (resource: Resource) => {
  if (resource.operations.length === 0) return {};

  const firstOperation = resource.operations[0];
  const lastOperation = resource.operations[resource.operations.length - 1];
  
  const startDate = new Date(firstOperation.startDate);
  const endDate = new Date(lastOperation.endDate || lastOperation.startDate);
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  const timelineStart = new Date(groupedDates.value[0].start);
  const timelineEnd = new Date(groupedDates.value[groupedDates.value.length - 1].end);
  
  timelineStart.setHours(0, 0, 0, 0);
  
  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(0, ((startDate.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const width = Math.min(100 - startOffset, ((endDate.getTime() - startDate.getTime()) / timelineDuration) * 100);
  
  return {
    left: `${startOffset}%`,
    width: `${Math.max(width, 5)}%`,
    minWidth: '20px'
  };
};

const getOperationBarStyle = (operation: Operation) => {
  const startDate = new Date(operation.startDate);
  const endDate = new Date(operation.endDate || operation.startDate);
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  const timelineStart = new Date(groupedDates.value[0].start);
  const timelineEnd = new Date(groupedDates.value[groupedDates.value.length - 1].end);
  
  timelineStart.setHours(0, 0, 0, 0);
  
  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(0, ((startDate.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const width = Math.min(100 - startOffset, ((endDate.getTime() - startDate.getTime()) / timelineDuration) * 100);
  
  return {
    left: `${startOffset}%`,
    width: `${Math.max(width, 5)}%`,
    minWidth: '20px'
  };
};
</script>

<style scoped>
.nested-table {
  overflow-x: auto;
  /* margin: 20px; */
  font-family: 'IBM Plex Mono', monospace;
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 800px;
}

th, td {
  border: 1px solid #C0C0C0;
  padding: 8px;
  text-align: left;
}

.well-header, .team-header {
  /* position: sticky; */
  left: 0;
  background-color: #f5f5f5;
  z-index: 2;
}

.team-header {
  left: 120px;
}

.date-header {
  background-color: #f5f5f5;
  font-weight: 700;
  font-size: 12px;
  color: #333333;
  text-align: center;
  min-width: 150px;
}

.gantt-timeline {
  padding: 0;
  position: relative;
  vertical-align: top;
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

.team-cell {
  /* position: sticky; */
  left: 120px;
  background-color: #fff;
  z-index: 1;
  min-width: 120px;
}

.team-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
  font-size: 12px;
}

.expand-icon {
  margin-right: 8px;
  font-size: 10px;
  transition: transform 0.2s;
}

.operation-row {
  background-color: #f8f9fa;
}

.operation-name {
  padding-left: 24px;
  font-size: 11px;
  color: #666;
}

.operation-bar {
  height: 20px;
  opacity: 0.8;
}

.operation-bar .gantt-bar-label {
  font-size: 10px;
}

/* Обновленные стили для видов мероприятий */
.event-kind-gtm {
  background-color: rgba(227, 242, 253, 0.7);
  border: 2px solid #1976d2;
}

.event-kind-otm {
  background-color: rgba(243, 229, 245, 0.7);
  border: 2px solid #7b1fa2;
}

.event-kind-start {
  background-color: rgba(232, 245, 233, 0.7);
  border: 2px solid #388e3c;
}

.event-kind-shut {
  background-color: rgba(255, 235, 238, 0.7);
  border: 2px solid #d32f2f;
}

/* Остальные стили остаются без изменений */
.nested-table {
  overflow-x: auto;
  margin: 20px;
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 800px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f5f5f5;
  /* position: sticky; */
  top: 0;
  z-index: 1;
}

.resource-operations {
  margin: 4px 0;
}

.resource-name {
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 4px;
  padding: 4px 8px;
  background-color: #e3f2fd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.resource-name:hover {
  background-color: #bbdefb;
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

.event-name {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.resource-name {
  padding-left: 24px;
  background-color: #f8f9fa;
}

.resource-title {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 12px;
  color: #666;
}

.resource-bar {
  height: 22px;
  opacity: 0.9;
}

.operation-row {
  background-color: #f8f9fa;
}

.operation-name {
  padding-left: 48px;
  font-size: 11px;
  color: #666;
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
  display: flex;
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

.dates-header, .dates-cell {
  min-width: 200px;
  text-align: center;
  font-size: 12px;
  color: #666;
  background-color: #fff;
  white-space: nowrap;
}

.dates-header {
  background-color: #f5f5f5;
  font-weight: 700;
  color: #333333;
}
</style> 