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
            <td v-if="eventIndex === 0" :rowspan="getWellRowspan(well)">
              {{ well.name }}
            </td>
            <td v-for="resource in event.resources" :key="resource.id">
              {{ resource.name }}
            </td>
            <td v-for="date in dates" :key="date">
              <div v-for="resource in event.resources" :key="resource.id" class="resource-operations">
                <div v-if="hasOperationsOnDate(resource, date)" 
                     class="resource-name"
                     :class="{ 'expanded': isResourceExpanded(resource.id, date) }"
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
import type { Well, Resource, Operation } from '../types/table';

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
</style> 