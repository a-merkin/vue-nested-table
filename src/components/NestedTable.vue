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
              <div v-for="resource in event.resources" :key="resource.id">
                <div v-for="operation in getOperationsForDate(resource, date)" :key="operation.id"
                     class="operation-cell">
                  {{ operation.name }}
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
import { computed } from 'vue';
import type { Well, Resource, Operation } from '../types/table';

const props = defineProps<{
  wells: Well[];
}>();

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

.operation-cell {
  background-color: #e3f2fd;
  margin: 2px 0;
  padding: 4px;
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