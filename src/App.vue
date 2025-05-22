<script setup lang="ts">
import NestedTable from './components/NestedTable.vue'
import { ref } from 'vue'
import type { Well } from './types/table'

const wells = ref<Well[]>([])

const handleEventAction = (payload: { type: 'edit' | 'add'; eventId: string }) => {
  console.log(payload)
}

const handleEventDatesChange = (payload: {
  eventId: string
  startDate: string
  endDate: string
}) => {
  console.log(payload)
  wells.value = wells.value.map(well => {
    const updatedEvents = well.events.map(event =>
      event.id === payload.eventId
        ? { ...event, startDate: payload.startDate, endDate: payload.endDate }
        : event
    )
    return { ...well, events: updatedEvents }
  })
}

const handleSelectRow = (showId: string) => {
  console.log('Selected row:', showId)
}
</script>

<template>
  <div class="app">
    <!-- <h1>Планирование работ на скважинах</h1> -->
    <NestedTable
      :wells="wells"
      :max-height="200"
      @event-action="handleEventAction"
      @event-dates-change="handleEventDatesChange"
      @select-row="handleSelectRow"
    />
    <p>paspdp</p>
  </div>
</template>

<style>
@import './assets/styles/fonts.css';

.app {
  /* padding: 20px; */
  font-family: 'Montserrat';
  /* width: 2000px; */
}

h1 {
  color: #333;
  /* margin-bottom: 20px; */
}
</style>
