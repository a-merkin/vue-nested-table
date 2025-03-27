<script setup lang="ts">
import NestedTable from './components/NestedTable.vue';
import type { Well } from './types/table';

const wells: Well[] = [
  {
    id: "well_1",
    name: "Скважина 1",
    state: "operating_state_prod",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    events: [
      {
        id: "well_1.base",
        name: "Баз. добыча",
        type: "base_production",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        operating_states: [
          {
            state: "operating_state_prod",
            startDate: "2025-01-01",
            endDate: "2025-04-11"
          },
          {
            state: "operating_state_idle",
            startDate: "2025-04-11",
            endDate: "2025-12-31"
          }
        ]
      },
      {
        id: "event_1",
        name: "ГРП",
        type: "event_type_grp",
        kind: "event_kind_gtm",
        startDate: "2025-04-01",
        endDate: "2025-04-10",
        resources: [
          {
            id: "resource_1",
            name: "Флот ГРП",
            type: "resource_grp",
            startDate: "2025-04-01",
            endDate: "2025-04-10",
            operations: [
              {
                id: "operation_1",
                name: "Мобилизация",
                startDate: "2025-04-01",
                endDate: "2025-04-02"
              },
              {
                id: "operation_2",
                name: "Выполнение работ",
                startDate: "2025-04-02",
                endDate: "2025-04-09"
              },
              {
                id: "operation_3",
                name: "Демобилизация",
                startDate: "2025-04-09",
                endDate: "2025-04-10"
              }
            ]
          },
          {
            id: "resource_2",
            name: "Дополнительная техника",
            type: "resource_grp_tools",
            startDate: "2025-04-01",
            endDate: "2025-04-09",
            operations: [
              {
                id: "operation_4",
                name: "Доставка",
                startDate: "2025-04-01",
                endDate: "2025-04-03"
              },
              {
                id: "operation_5",
                name: "Использование в работе",
                startDate: "2025-04-03",
                endDate: "2025-04-09"
              }
            ]
          }
        ]
      },
      {
        id: "event_2",
        name: "ППР",
        type: "event_type_ppr",
        kind: "event_kind_otm",
        startDate: "2025-05-01",
        endDate: "2025-05-05",
        resources: [
          {
            id: "resource_3",
            name: "Бригада ППР",
            type: "resource_ppr",
            startDate: "2025-05-01",
            endDate: "2025-05-05",
            operations: [
              {
                id: "operation_6",
                name: "Осмотр оборудования",
                startDate: "2025-05-01",
                endDate: "2025-05-03"
              },
              {
                id: "operation_7",
                name: "Ремонт",
                startDate: "2025-05-03",
                endDate: "2025-05-05"
              },
              {
                id: "operation_8",
                name: "Проверка работы",
                startDate: "2025-05-05",
                endDate: "2025-05-05"
              }
            ]
          }
        ]
      }
    ]
  }
];

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
