<template>
  <template v-for="(event, eventIndex) in well.events" :key="event.id">
    <!-- Строка события -->
    <tr
      :class="[
        'event-row',
        { 'well-group-separator': eventIndex === well.events.length - 1 && !isLastWell },
        { selected: selectedId === (event.well_id || event.id) },
      ]"
      @click="handleRowClick(event)"
    >
      <td
        v-if="eventIndex === 0"
        :rowspan="getWellTotalRowspan(well)"
        :class="[
          'well-name-cell',
          getWellStateClass(well.state_id),
          { selected: selectedId === well.id },
        ]"
        :style="{
          left: stickyLefts.well + 'px',
        }"
        @click.stop="handleRowClick(event)"
      >
        <div class="well-name-container" :title="well.name">
          <span class="well-name">{{ well.name }}</span>
        </div>
      </td>
      <td
        class="team-cell"
        :style="{
          left: stickyLefts.team + 'px',
        }"
      >
        <div class="event-name" :title="event.name">
          <div class="event-name-content" @click.stop="$emit('toggle-event', event.id)">
            <span class="expand-icon">{{ isEventExpanded(event.id) ? '▼' : '▶' }}</span>
            <span class="event-name-text">{{ event.name }}</span>
          </div>
          <div class="event-actions">
            <button
              v-if="event.type === 'base_production'"
              class="action-button add-button"
              title="Добавить мероприятие"
              @click.stop="
                $emit('event-action', {
                  type: 'add',
                  eventId: event.id,
                  wellId: well.id,
                  wellName: well.name,
                })
              "
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button
              v-else
              class="action-button edit-button"
              title="Редактировать мероприятие"
              @click.stop="
                $emit('event-action', {
                  type: 'edit',
                  eventId: event.id,
                  wellId: well.id,
                  wellName: well.name,
                })
              "
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              v-if="event.type !== 'base_production'"
              class="action-button delete-button"
              title="Удалить мероприятие"
              @click.stop="
                $emit('event-action', {
                  type: 'delete',
                  eventId: event.id,
                  wellId: well.id,
                  wellName: well.name,
                })
              "
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 6h18"></path>
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </td>
      <td
        class="date-start-cell"
        :style="{
          left: stickyLefts['date-start'] + 'px',
        }"
      >
        <input
          v-model="event.startDate"
          v-maska
          data-maska="####-##-##"
          placeholder="гггг-мм-дд"
          class="date-input"
          :disabled="!event.editable_dates"
          @blur="
            $emit('event-dates-change', {
              eventId: event.id,
              startDate: event.startDate || '',
              endDate: event.endDate || '',
            })
          "
        />
      </td>
      <td
        class="date-end-cell"
        :style="{
          left: stickyLefts['date-end'] + 'px',
        }"
      >
        <input
          v-model="event.endDate"
          v-maska
          data-maska="####-##-##"
          placeholder="гггг-мм-дд"
          class="date-input"
          :disabled="!event.editable_dates"
          @blur="
            $emit('event-dates-change', {
              eventId: event.id,
              startDate: event.startDate || '',
              endDate: event.endDate || '',
            })
          "
        />
      </td>
      <td :colspan="groupedDates.length" class="gantt-timeline">
        <template v-if="event.operating_states && event.operating_states.length > 0">
          <div class="timeline-container">
            <OperatingStatesBar
              :operating_states="event.operating_states"
              :grouped-dates="groupedDates"
              :style-type="'background'"
            />
            <GanttBar
              :item="event"
              :grouped-dates="groupedDates"
              :kind="event.kind"
              :type="event.type"
              :style-type="'event'"
            />
          </div>
        </template>
        <template v-else-if="event.startDate && event.endDate">
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
            <div class="resource-title" :title="resource.name">
              <div class="resource-title-content" @click="$emit('toggle-resource', resource.id)">
                <span>{{ resource.name }}</span>
              </div>
            </div>
          </td>
          <td :colspan="groupedDates.length" class="gantt-timeline">
            <GanttBar
              v-if="resource.startDate && resource.endDate"
              :item="resource"
              :grouped-dates="groupedDates"
              :kind="event.kind"
              :type="event.type"
              :style-type="'resource'"
            />
          </td>
        </tr>
      </template>
    </template>
  </template>
</template>

<script setup lang="ts">
import type { Well, Event as TableEvent } from '../../types/table'
import GanttBar from './GanttBar.vue'
import OperatingStatesBar from './OperatingStatesBar.vue'
import { vMaska } from 'maska/vue'

type DateRange = {
  start: Date
  end: Date
  key: string
}

type ColumnKey = 'well' | 'team' | 'date-start' | 'date-end'

const props = defineProps<{
  well: Well
  groupedDates: DateRange[]
  expandedEvents: Set<string>
  expandedResources: Set<string>
  isLastWell: boolean
  selectedId: string | null
  stickyLefts: Record<ColumnKey, number>
  teamColumnWidth: number
}>()

const emit = defineEmits<{
  (e: 'toggle-event', eventId: string): void
  (e: 'toggle-resource', resourceId: string): void
  (e: 'well-action', payload: { type: 'edit' | 'add'; wellId: string }): void
  (
    e: 'event-action',
    payload: { type: 'edit' | 'add' | 'delete'; eventId: string; wellId: string; wellName: string }
  ): void
  (e: 'event-dates-change', payload: { eventId: string; startDate: string; endDate: string }): void
  (
    e: 'resource-dates-change',
    payload: { resourceId: string; startDate: string; endDate: string }
  ): void
  (e: 'select-row', showId: string): void
}>()

const isEventExpanded = (eventId: string): boolean => props.expandedEvents.has(eventId)

const getWellTotalRowspan = (well: Well): number => {
  return well.events.reduce((total, event) => {
    if (!isEventExpanded(event.id)) {
      return total + 1
    }
    return total + 1 + (event.resources?.length ?? 0)
  }, 0)
}

const getWellStateClass = (state: string | null): string => {
  if (!state) return 'well-state-unknown'
  return `well-state-${state.replace('operating_state_', '')}`
}

const handleRowClick = (event: TableEvent) => {
  const showId = event.well_id || event.id
  emit('select-row', showId)
}
</script>

<style scoped>
/* Фиксированные ширины для первых трех колонок */
.well-name-cell {
  position: sticky;
  left: inherit;
  z-index: 10;
  background-color: #ffffff;
  text-align: center;
}

.team-cell {
  position: sticky;
  left: inherit;
  z-index: 10;
  overflow: hidden;
  padding: 2px 4px;
  white-space: nowrap;
  background-color: #ffffff;
}

.date-start-cell,
.date-end-cell {
  position: sticky;
  left: inherit;
  z-index: 10;
  padding: 0;
  text-align: center;
  font-size: 12px;
  color: #666666;
  background-color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.gantt-timeline {
  padding: 0;
  position: relative;
  vertical-align: top;
  width: auto;
  background: repeating-linear-gradient(90deg, #f7f7f7 0px, #f7f7f7 1px, #ffffff 1px, #ffffff 45px);
}

.gantt-timeline > * {
  min-width: 45px;
}

.event-name {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  border-radius: 4px;
  background-color: #f7f7f7;
  transition: background-color 0.2s;
  position: relative;
}

.event-name-content {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  padding-right: 40px;
}

.event-name:hover {
  background-color: #f0f0f0;
}

.event-actions {
  position: absolute;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 1;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.action-button:active {
  background-color: #e0e0e0;
}

.edit-button,
.add-button {
  color: #2196f3;
}

.delete-button {
  color: #f44336;
}

.edit-button:hover,
.add-button:hover {
  color: #1976d2;
}

.delete-button:hover {
  color: #d32f2f;
}

.resource-title {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #333333;
  padding: 4px 8px 4px 32px;
  border-radius: 4px;
  background-color: #f9f9f9;
  transition: background-color 0.2s;
  max-width: 100%;
  overflow: hidden;
}

.resource-title-content {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.resource-title:hover {
  background-color: #f0f0f0;
}

.operation-name {
  padding: 3px 8px 3px 48px;
  font-size: 11px;
  color: #666666;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.operation-row:hover .operation-name {
  background-color: #f9f9f9;
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

.event-name-text {
  max-width: v-bind('teamColumnWidth - 40 + "px"');
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-title .expand-icon {
  font-size: 10px;
  opacity: 0.7;
}

/* Цвета для состояний скважин */
.well-state-prod {
  background-color: #c8e6c9;
  border-right: 1px solid #4caf50;
}

.well-state-inje {
  background-color: #bbdefb;
  border-right: 1px solid #2196f3;
}

.well-state-idle {
  background-color: #ffcdd2;
  border-right: 1px solid #f44336;
}

.well-state-intake {
  background-color: #e1bee7;
  border-right: 1px solid #9c27b0;
}

.well-state-unknown {
  background-color: #eeeeee;
  background-image: radial-gradient(circle at 50% 50%, #9e9e9e 2px, transparent 2px);
  background-size: 8px 8px;
  border-right: 1px solid #9e9e9e;
}

/* Стили для строк */
.event-row {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.well-name-cell.selected::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #2196f3;
}

.resource-row {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

/* Убираем бордер между событием и его ресурсами */
.event-row + .resource-row {
  border-top: none;
}

/* Добавляем бордер только между разными группами */
.well-group-separator {
  border-bottom: 2px solid #bfbfbf;
}

.well-name-container {
  padding: 0 2px;
  min-height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.well-name {
  margin-right: 2px;
  font-size: 11px;
  font-weight: 500;
}

.well-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.well-name-cell:hover .well-actions {
  opacity: 1;
}

.date-input {
  width: 95%;
  padding: 0 2px;
  border: 1px solid #c0c0c0;
  border-radius: 3px;
  font-size: 10px;
  height: 18px;
  box-sizing: border-box;
  line-height: 1;
  margin: 0 auto;
  display: block;
}

.date-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.date-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 1px rgba(74, 144, 226, 0.2);
}

.timeline-container {
  position: relative;
  height: 22px;
  width: 100%;
}

.timeline-container :deep(.gantt-bar) {
  z-index: 2;
}

.timeline-container :deep(.operating-states-container) {
  z-index: 1;
}

.event-row,
.resource-row {
  min-height: 22px;
  height: 26px;
}

.team-cell,
.date-start-cell,
.date-end-cell {
  padding: 1px 4px;
  font-size: 12px;
  height: 22px;
}

.event-name {
  padding: 2px 4px;
  font-size: 12px;
}

.resource-title {
  font-size: 11px;
  padding: 2px 4px 2px 16px;
}
</style>
