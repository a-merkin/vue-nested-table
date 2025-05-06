<template>
  <div class="nested-table">
    <div class="table-controls">
      <div class="expand-all-switch">
        <Switch v-model="expandAll" @switch="handleExpandAllChange">
          <template #prefix>
            <span class="expand-all-label">Раскрыть:</span>
          </template>
        </Switch>
      </div>
      <DetailLevelSelector v-model="granularity" />
    </div>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th
              class="well-header"
              :style="{
                position: 'sticky',
                left: stickyLefts.well + 'px',
                zIndex: 3,
                background: 'white',
                width: columns.well + 'px',
                minWidth: columns.well + 'px',
                maxWidth: columns.well + 'px',
              }"
            >
              <div style="width: 100%">Скважина</div>
              <ColumnResizer @resize="width => updateColumnWidth('well', width)" />
            </th>
            <th
              class="team-header"
              :style="{
                position: 'sticky',
                left: stickyLefts.team + 'px',
                zIndex: 3,
                background: 'white',
                width: columns.team + 'px',
                minWidth: columns.team + 'px',
                maxWidth: columns.team + 'px',
              }"
            >
              Мероприятие
              <ColumnResizer @resize="width => updateColumnWidth('team', width)" />
            </th>
            <th
              class="date-start-header"
              :style="{
                position: 'sticky',
                left: stickyLefts['date-start'] + 'px',
                zIndex: 3,
                background: 'white',
                width: columns['date-start'] + 'px',
                minWidth: columns['date-start'] + 'px',
                maxWidth: columns['date-start'] + 'px',
              }"
            >
              Начало
              <ColumnResizer @resize="width => updateColumnWidth('date-start', width)" />
            </th>
            <th
              class="date-end-header"
              :style="{
                position: 'sticky',
                left: stickyLefts['date-end'] + 'px',
                zIndex: 3,
                background: 'white',
                width: columns['date-end'] + 'px',
                minWidth: columns['date-end'] + 'px',
                maxWidth: columns['date-end'] + 'px',
              }"
            >
              Окончание
              <ColumnResizer @resize="width => updateColumnWidth('date-end', width)" />
            </th>
            <TimelineHeader
              v-if="groupedDates.length > 0"
              :dates="groupedDates"
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
              :sticky-lefts="stickyLefts"
              :selected-id="selectedId"
              @toggle-event="toggleEvent"
              @toggle-resource="toggleResource"
              @event-action="handleEventAction"
              @event-dates-change="handleEventDatesChange"
              @select-row="handleSelectRow"
            />
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from 'vue'
import type { Well, DateGranularity } from '../types/table'
import type { DateRange } from '../composables/useDateRanges'
import { useDateRanges } from '../composables/useDateRanges'
import { useExpansionState } from '../composables/useExpansionState'
import DetailLevelSelector from './nested-table/DetailLevelSelector.vue'
import TimelineHeader from './nested-table/TimelineHeader.vue'
import WellEvents from './nested-table/WellEvents.vue'
import Switch from './nested-table/Switch.vue'
import ColumnResizer from './nested-table/ColumnResizer.vue'

// Пропсы
const props = defineProps<{
  wells: Well[]
}>()

// Эмиты
const emit = defineEmits<{
  (
    e: 'event-action',
    payload: { type: 'edit' | 'add'; eventId: string; wellId: string; wellName: string }
  ): void
  (
    e: 'resource-dates-change',
    payload: { resourceId: string; startDate: string; endDate: string }
  ): void
  (e: 'select-row', showId: string): void
  (e: 'event-dates-change', payload: { eventId: string; startDate: string; endDate: string }): void
}>()

// Состояние
const granularity = ref<DateGranularity>('month')
const expandAll = ref(false)
const selectedId = ref<string | null>(null)
export type ColumnKey = 'well' | 'team' | 'date-start' | 'date-end'
const columns = reactive<Record<ColumnKey, number>>({
  well: 200,
  team: 240,
  'date-start': 120,
  'date-end': 120,
})

// Композиции
const { expandedEvents, expandedResources, toggleEvent, toggleResource } = useExpansionState()
const { groupedDates, formatDate } = useDateRanges(props.wells, granularity)

// TODO: сделать реактивные значения ширины колонок, использовать их в :style у колонок хедера и цеплять width и left

// Функция для обновления ширины колонок
const updateColumnWidth = (column: keyof typeof columns, width: number) => {
  columns[column] = width
}

const stickyLefts = computed<Record<ColumnKey, number>>(() => {
  const result: Partial<Record<ColumnKey, number>> = {}
  let offset = 0
  for (const key of Object.keys(columns) as ColumnKey[]) {
    result[key] = offset
    offset += columns[key]
  }
  return result as Record<ColumnKey, number>
})

const handleEventAction = (payload: {
  type: 'edit' | 'add'
  eventId: string
  wellId: string
  wellName: string
}) => {
  const well = props.wells.find(w => w.id === payload.wellId)
  if (well) {
    const event = well.events.find(e => e.id === payload.eventId)
    if (event) {
      const showId = event.well_id || event.id
      handleSelectRow(showId)
    }
  }
  emit('event-action', payload)
}

const handleEventDatesChange = (payload: {
  eventId: string
  startDate: string
  endDate: string
}) => {
  emit('event-dates-change', payload)
}

const handleExpandAllChange = () => {
  if (expandAll.value) {
    // Expand all events
    props.wells.forEach(well => {
      well.events.forEach(event => {
        if (!expandedEvents.value.has(event.id)) {
          expandedEvents.value.add(event.id)
        }
      })
    })
  } else {
    // Collapse all events and resources
    expandedEvents.value.clear()
    expandedResources.value.clear()
  }
}

const handleSelectRow = (showId: string) => {
  selectedId.value = showId
  emit('select-row', showId)
}

// Watch for changes in wells to update expandAll state
watch(
  () => props.wells,
  newWells => {
    const allEventsExpanded = newWells.every(well =>
      well.events.every(event => expandedEvents.value.has(event.id))
    )
    expandAll.value = allEventsExpanded
  },
  { deep: true }
)
</script>

<style scoped>
.nested-table {
  position: relative;
  width: 100%;
  height: 100%;
  --table-border-color: #c0c0c0;
  --table-header-bg: #f5f5f5;
  --table-header-color: #333333;
  font-family: 'Montserrat';
}

.table-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  top: 0;
  z-index: 1;
  background-color: white;
}

th {
  /* padding: 8px; */
  text-align: left;
  border: 1px solid var(--table-border-color);
  background-color: white;
  position: sticky;
  /* position: relative; */
  user-select: none;
}

.resizer {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 5px;
  cursor: col-resize;
  z-index: 2;
}

.resizer::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: transparent;
  transition: background-color 0.2s;
}

.resizer:hover::after,
.resizer:active::after {
  background-color: #c0c0c0;
}

.well-header,
.team-header,
.date-start-header,
.date-end-header {
  white-space: nowrap;
  font-weight: 700;
  color: var(--table-header-color);
  overflow: hidden;
  text-overflow: ellipsis;
  border-right: 2px solid var(--table-border-color);
}

.well-header {
  text-align: center;
  position: sticky;
  z-index: 3;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  background-color: var(--table-header-bg);
}

.team-header {
  text-align: center;
  position: sticky;
  z-index: 3;
  width: 150px;
  min-width: 150px;
  max-width: 150px;
  background-color: var(--table-header-bg);
}

.date-start-header {
  text-align: center;
  position: sticky;
  z-index: 3;
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  background-color: var(--table-header-bg);
}

.date-end-header {
  text-align: center;
  position: sticky;
  z-index: 3;
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  background-color: var(--table-header-bg);
}
th:not(.well-header):not(.team-header):not(.date-start-header):not(.date-end-header) {
  min-width: 45px;
}

.well-group-separator {
  border-bottom: 2px solid #bfbfbf;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.expand-all-switch {
  display: flex;
  align-items: center;
}

.expand-all-label {
  font-size: 0.875rem;
  color: #333333;
  white-space: nowrap;
}

.date-grid-container {
  margin-top: 20px;
  border: 1px solid var(--table-border-color);
  border-radius: 4px;
  overflow: hidden;
}
</style>
