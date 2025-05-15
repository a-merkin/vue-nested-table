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
              :class="{
                'sort-asc': sortState.well === 'asc',
                'sort-desc': sortState.well === 'desc',
              }"
              :style="{
                position: 'sticky',
                left: stickyLefts.well + 'px',
                zIndex: 3,
                background: 'white',
                width: columns.well + 'px',
                minWidth: columns.well + 'px',
                maxWidth: columns.well + 'px',
              }"
              @click="handleSort('well')"
            >
              Скважина
              <ColumnResizer @resize="width => updateColumnWidth('well', width)" />
            </th>
            <th
              class="team-header"
              :class="{
                'sort-asc': sortState.team === 'asc',
                'sort-desc': sortState.team === 'desc',
              }"
              :style="{
                position: 'sticky',
                left: stickyLefts.team + 'px',
                zIndex: 3,
                background: 'white',
                width: columns.team + 'px',
                minWidth: columns.team + 'px',
                maxWidth: columns.team + 'px',
              }"
              @click="handleSort('team')"
            >
              Мероприятие
              <ColumnResizer @resize="width => updateColumnWidth('team', width)" />
            </th>
            <th
              class="date-start-header"
              :class="{
                'sort-asc': sortState['date-start'] === 'asc',
                'sort-desc': sortState['date-start'] === 'desc',
              }"
              :style="{
                position: 'sticky',
                left: stickyLefts['date-start'] + 'px',
                zIndex: 3,
                background: 'white',
                width: columns['date-start'] + 'px',
                minWidth: columns['date-start'] + 'px',
                maxWidth: columns['date-start'] + 'px',
              }"
              @click="handleSort('date-start')"
            >
              Начало
              <ColumnResizer @resize="width => updateColumnWidth('date-start', width)" />
            </th>
            <th
              class="date-end-header"
              :class="{
                'sort-asc': sortState['date-end'] === 'asc',
                'sort-desc': sortState['date-end'] === 'desc',
              }"
              :style="{
                position: 'sticky',
                left: stickyLefts['date-end'] + 'px',
                zIndex: 3,
                background: 'white',
                width: columns['date-end'] + 'px',
                minWidth: columns['date-end'] + 'px',
                maxWidth: columns['date-end'] + 'px',
              }"
              @click="handleSort('date-end')"
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
          <template v-for="(well, wellIndex) in sortedWells" :key="well.id">
            <WellEvents
              :well="well"
              :grouped-dates="groupedDates as unknown as DateRange[]"
              :expanded-events="expandedEvents as unknown as Set<string>"
              :expanded-resources="expandedResources as unknown as Set<string>"
              :is-last-well="wellIndex === sortedWells.length - 1"
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
type ColumnKey = 'well' | 'team' | 'date-start' | 'date-end'
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

type SortDirection = 'asc' | 'desc' | null
type SortableColumn = 'well' | 'team' | 'date-start' | 'date-end'

const sortState = reactive<Record<SortableColumn, SortDirection>>({
  well: null,
  team: null,
  'date-start': null,
  'date-end': null,
})

const sortedWells = computed(() => {
  const activeSort = Object.entries(sortState).find(([_, direction]) => direction !== null)
  if (!activeSort) return props.wells

  const [column, direction] = activeSort
  return [...props.wells].sort((a, b) => {
    if (column === 'well') {
      return direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }
    if (column === 'team') {
      const aTeam = a.events[0]?.name || ''
      const bTeam = b.events[0]?.name || ''
      return direction === 'asc' ? aTeam.localeCompare(bTeam) : bTeam.localeCompare(aTeam)
    }
    if (column === 'date-start') {
      // Get the earliest start date from all events
      const aDates = a.events
        .map(e => e.startDate)
        .filter((date): date is string => typeof date === 'string')
      const bDates = b.events
        .map(e => e.startDate)
        .filter((date): date is string => typeof date === 'string')

      if (aDates.length === 0 || bDates.length === 0) return 0

      const aDate = aDates.sort()[0]
      const bDate = bDates.sort()[0]

      return direction === 'asc' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
    }
    if (column === 'date-end') {
      // Get the latest end date from all events
      const aDates = a.events
        .map(e => e.endDate)
        .filter((date): date is string => typeof date === 'string')
      const bDates = b.events
        .map(e => e.endDate)
        .filter((date): date is string => typeof date === 'string')

      if (aDates.length === 0 || bDates.length === 0) return 0

      const aDate = aDates.sort().reverse()[0]
      const bDate = bDates.sort().reverse()[0]

      return direction === 'asc' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
    }
    return 0
  })
})

const handleSort = (column: SortableColumn) => {
  const currentDirection = sortState[column]
  const newDirection: SortDirection =
    currentDirection === null ? 'asc' : currentDirection === 'asc' ? 'desc' : null

  // Reset all other columns
  Object.keys(sortState).forEach(key => {
    if (key !== column) {
      sortState[key as SortableColumn] = null
    }
  })

  sortState[column] = newDirection
}
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
  border-top: 1px solid var(--table-border-color);
  border-bottom: 1px solid var(--table-border-color);
  background-color: white;
  position: sticky;
  /* position: relative; */
  user-select: none;
  cursor: pointer;
  position: relative;
  padding-right: 20px;
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
  /* border-right: 2px solid var(--table-border-color); */
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

th::after {
  content: '↕';
  position: absolute;
  right: 10px;
  opacity: 0.3;
}

th.sort-asc::after {
  content: '↑';
  opacity: 1;
}

th.sort-desc::after {
  content: '↓';
  opacity: 1;
}
</style>
