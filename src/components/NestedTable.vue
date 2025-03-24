<template>
  <div class="nested-table">
    <table>
      <thead>
        <tr>
          <th>Скважина</th>
          <th>Бригада</th>
          <th v-for="date in dates" :key="date">{{ formatDate(date) }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="well in wells" :key="well.id">
          <tr v-for="(event, eventIndex) in well.events" :key="event.id">
            <td v-if="eventIndex === 0" :rowspan="getWellRowspan(well)" :class="getWellStateClass(well.state)">
              {{ well.name }}
            </td>
            <td v-for="resource in event.resources" :key="resource.id">
              {{ resource.name }}
            </td>
            <td v-for="date in dates" :key="date">
              <div v-for="resource in event.resources" :key="resource.id" class="resource-operations">
                <div v-if="hasOperationsOnDate(resource, date)" 
                     class="resource-name"
                     :class="[
                       { 'expanded': isResourceExpanded(resource.id, date) },
                       getEventKindClass(event.kind),
                       getEventTypeClass(event.type)
                     ]"
                     @click="toggleResource(resource.id, date)">
                  <span class="resource-icon">{{ isResourceExpanded(resource.id, date) ? '▼' : '▶' }}</span>
                  {{ resource.name }}
                </div>
                <div v-if="isResourceExpanded(resource.id, date)" class="operations-list">
                  <div v-for="operation in getOperationsForDate(resource, date)" 
                       :key="operation.id"
                       class="operation-cell">
                    {{ operation.name }}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Well, Resource, Operation, EventKind, OperatingState, EventType } from '../types/table';

const props = defineProps<{
  wells: Well[];
}>();

const expandedResources = ref<Set<string>>(new Set());

const toggleResource = (resourceId: string, date: string) => {
  const key = `${resourceId}-${date}`;
  if (expandedResources.value.has(key)) {
    expandedResources.value.delete(key);
  } else {
    expandedResources.value.add(key);
  }
};

const isResourceExpanded = (resourceId: string, date: string): boolean => {
  return expandedResources.value.has(`${resourceId}-${date}`);
};

const dates = computed(() => {
  const allDates = new Set<string>();
  props.wells.forEach(well => {
    well.events.forEach(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        allDates.add(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
  });
  return Array.from(allDates).sort();
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const getWellRowspan = (well: Well) => {
  return well.events.reduce((total, event) => total + event.resources.length, 0);
};

const hasOperationsOnDate = (resource: Resource, date: string): boolean => {
  return resource.operations.some(operation => {
    const operationDate = new Date(operation.startDate).toISOString().split('T')[0];
    return operationDate === date;
  });
};

const getOperationsForDate = (resource: Resource, date: string): Operation[] => {
  return resource.operations.filter(operation => {
    const operationDate = new Date(operation.startDate).toISOString().split('T')[0];
    return operationDate === date;
  });
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
</script>

<style scoped>
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
  position: sticky;
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
</style> 