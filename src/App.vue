<script setup lang="ts">
import NestedTable from './components/NestedTable.vue';
import type { Well } from './types/table';

const wells: Well[] = [
  {
    id: "well_1",
    name: "Скважина 1",
    state: "operating_state_prod",
    events: [
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
            operations: [
              {
                id: "operation_1",
                name: "Мобилизация",
                startDate: "2025-04-01",
              },
              {
                id: "operation_2",
                name: "Выполнение работ",
                startDate: "2025-04-02",
              },
              {
                id: "operation_3",
                name: "Демобилизация",
                startDate: "2025-04-09",
              }
            ]
          },
          {
            id: "resource_2",
            name: "Дополнительная техника",
            type: "resource_grp_tools",
            operations: [
              {
                id: "operation_4",
                name: "Доставка",
                startDate: "2025-04-01",
              },
              {
                id: "operation_5",
                name: "Использование в работе",
                startDate: "2025-04-03",
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
            operations: [
              {
                id: "operation_6",
                name: "Осмотр оборудования",
                startDate: "2025-05-01",
              },
              {
                id: "operation_7",
                name: "Ремонт",
                startDate: "2025-05-03",
              },
              {
                id: "operation_8",
                name: "Проверка работы",
                startDate: "2025-05-05",
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
}

h1 {
  color: #333;
  /* margin-bottom: 20px; */
}
</style>
