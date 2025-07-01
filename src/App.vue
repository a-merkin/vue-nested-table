<script setup lang="ts">
import NestedTable from './components/NestedTable.vue'
import { ref } from 'vue'
import type { Well } from './types/table'

const wells = ref<Well[]>([
  {
    id: '152',
    name: '60',
    state_id: 'operating_state_prod',
    state_name: 'В добыче',
    events: [
      {
        id: '152.base',
        name: 'База',
        type: 'base_production',
        startDate: null,
        endDate: null,
        editable_dates: false,
        well_id: '152',
        well_name: '60',
        operating_states: [
          {
            startDate: '2025-01-01',
            endDate: '2025-04-01',
            state_id: 'operating_state_prod',
            state_name: 'В добыче',
          },
        ],
      },
      {
        id: 'group_1.gtm_2',
        name: 'ГРП_60',
        kind: 'event_kind_gtm',
        type: 'event_type_grp',
        well_id: '152',
        well_name: '60',
        startDate: '2025-01-10',
        endDate: '2025-01-20',
        editable_dates: true,
        resources: [
          {
            id: 'resource_1',
            name: 'Бригада 1',
            type: 'team',
            startDate: '2025-01-10',
            endDate: '2025-01-15',
            stages: [
              {
                id: 'stage_1',
                name: 'Подготовка',
                startDate: '2025-01-10',
              },
            ],
          },
        ],
        operating_states: [
          {
            startDate: '2025-01-10',
            endDate: '2025-01-20',
            state_id: 'operating_state_none',
            state_name: 'Не введено',
          },
        ],
        stop_well: false,
        shut_well: false,
      },
    ],
  },
  {
    id: 'group_1.gtm_1',
    name: 'ГРП_1',
    state_id: 'operating_state_prod',
    state_name: 'В добыче',
    events: [
      {
        id: 'group_1.gtm_1',
        name: 'ГРП_1',
        kind: 'event_kind_gtm',
        type: 'event_type_grp',
        well_id: null,
        well_name: null,
        startDate: '2025-02-01',
        endDate: '2025-02-10',
        editable_dates: true,
        resources: [
          {
            id: 'resource_2',
            name: 'Бригада 2',
            type: 'team',
            startDate: '2025-02-01',
            endDate: '2025-02-05',
            stages: [
              {
                id: 'stage_2',
                name: 'Работы',
                startDate: '2025-02-01',
              },
            ],
          },
        ],
        operating_states: [
          {
            startDate: '2025-02-01',
            endDate: '2025-02-10',
            state_id: 'operating_state_none',
            state_name: 'Не введено',
          },
        ],
        stop_well: false,
        shut_well: false,
      },
      {
        id: 'group_1.otm_1',
        name: 'ОТМ_1',
        kind: 'event_kind_otm',
        type: 'event_type_opz',
        well_id: null,
        well_name: null,
        startDate: '2025-02-15',
        endDate: '2025-02-25',
        editable_dates: true,
        resources: [
          {
            id: 'resource_3',
            name: 'Бригада 3',
            type: 'team',
            startDate: '2025-02-15',
            endDate: '2025-02-20',
            stages: [
              {
                id: 'stage_3',
                name: 'Завершение',
                startDate: '2025-02-15',
              },
            ],
          },
        ],
        operating_states: [
          {
            startDate: '2025-02-15',
            endDate: '2025-02-25',
            state_id: 'operating_state_none',
            state_name: 'Не введено',
          },
        ],
        stop_well: false,
        shut_well: false,
      },
    ],
  },
  // Дополнительные скважины для теста
  ...Array.from({ length: 5 }).map(
    (_, i): Well => ({
      id: `well_${i + 2}`,
      name: `Скважина ${i + 2}`,
      state_id: 'operating_state_idle',
      state_name: 'Ожидание',
      events: [
        {
          id: `well_${i + 2}.base`,
          name: `База ${i + 2}`,
          type: 'base_production',
          startDate: null,
          endDate: null,
          editable_dates: false,
          well_id: `well_${i + 2}`,
          well_name: `Скважина ${i + 2}`,
          operating_states: [
            {
              startDate: `2025-03-0${i + 1}`,
              endDate: `2025-03-1${i + 1}`,
              state_id: 'operating_state_idle',
              state_name: 'Ожидание',
            },
          ],
        },
        {
          id: `well_${i + 2}.gtm`,
          name: `ГТМ_${i + 2}`,
          kind: 'event_kind_gtm',
          type: 'event_type_grp',
          well_id: `well_${i + 2}`,
          well_name: `Скважина ${i + 2}`,
          startDate: `2025-03-1${i + 1}`,
          endDate: `2025-03-2${i + 1}`,
          editable_dates: true,
          resources: [
            {
              id: `resource_${i + 4}`,
              name: `Бригада ${i + 4}`,
              type: 'team',
              startDate: `2025-03-1${i + 1}`,
              endDate: `2025-03-1${i + 2}`,
              stages: [
                {
                  id: `stage_${i + 4}`,
                  name: 'Работы',
                  startDate: `2025-03-1${i + 1}`,
                },
              ],
            },
          ],
          operating_states: [
            {
              startDate: `2025-03-1${i + 1}`,
              endDate: `2025-03-2${i + 1}`,
              state_id: 'operating_state_none',
              state_name: 'Не введено',
            },
          ],
          stop_well: false,
          shut_well: false,
        },
        {
          id: `well_${i + 2}.otm`,
          name: `ОТМ_${i + 2}`,
          kind: 'event_kind_otm',
          type: 'event_type_opz',
          well_id: `well_${i + 2}`,
          well_name: `Скважина ${i + 2}`,
          startDate: `2025-03-2${i + 1}`,
          endDate: `2025-03-${Math.min(31, 2 + i + 1)}`,
          editable_dates: true,
          resources: [
            {
              id: `resource_${i + 9}`,
              name: `Бригада ${i + 9}`,
              type: 'team',
              startDate: `2025-03-2${i + 1}`,
              endDate: `2025-03-${Math.min(31, 2 + i + 2)}`,
              stages: [
                {
                  id: `stage_${i + 9}`,
                  name: 'Завершение',
                  startDate: `2025-03-2${i + 1}`,
                },
              ],
            },
          ],
          operating_states: [
            {
              startDate: `2025-03-2${i + 1}`,
              endDate: `2025-03-${Math.min(31, 2 + i + 1)}`,
              state_id: 'operating_state_none',
              state_name: 'Не введено',
            },
          ],
          stop_well: false,
          shut_well: false,
        },
      ],
    })
  ),
])

const handleEventAction = (payload: {
  type: 'edit' | 'add' | 'delete'
  eventId: string
  wellId: string
  wellName: string
}) => {
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
