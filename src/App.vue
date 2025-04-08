<script setup lang="ts">
import NestedTable from './components/NestedTable.vue';
import type { Well } from './types/table';

const wells: Well[] = [
    {
        id: "152",
        name: "60",
        state: "operating_state_prod",
        events: [
            {
                id: "152.base",
                name: "База",
                type: "base_production",
                startDate: null,
                endDate: null,
                operating_states: [
                    {
                        startDate: "2025-03-01",
                        endDate: "2025-04-01",
                        state: "operating_state_prod"
                    }
                ]
            },
            {
                id: "group_1.gtm_2",
                name: "ЗБС_60",
                kind: "event_kind_gtm",
                type: "event_type_zbs",
                startDate: null,
                endDate: null,
                resources: []
            }
        ]
    },
    {
        id: "155",
        name: "61",
        state: "operating_state_idle",
        events: [
            {
                id: "155.base",
                name: "База",
                type: "base_production",
                startDate: null,
                endDate: null,
                operating_states: [
                    {
                        startDate: "2025-03-01",
                        endDate: "2025-04-01",
                        state: "operating_state_idle"
                    }
                ]
            },
            {
                id: "group_1.gtm_3",
                name: "ГРП_61",
                kind: "event_kind_gtm",
                type: "event_type_grp",
                startDate: null,
                endDate: null,
                resources: []
            }
        ]
    },
    {
        id: "group_1.gtm_1",
        name: "ВНС_1",
        state: "operating_state_prod",
        events: [
            {
                id: "group_1.gtm_1",
                name: "ВНС_1",
                kind: "event_kind_gtm",
                type: "event_type_vns",
                startDate: null,
                endDate: null,
                resources: []
            }
        ]
    }
]


</script>

<template>
  <div class="app">
    <!-- <h1>Планирование работ на скважинах</h1> -->
    <NestedTable :wells="wells" />
  </div>
</template>

<style>
.app {
  /* padding: 20px; */
  font-family: Arial, sans-serif;
  /* width: 2000px; */
}

h1 {
  color: #333;
  /* margin-bottom: 20px; */
}
</style>
