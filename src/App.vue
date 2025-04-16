<script setup lang="ts">
import NestedTable from './components/NestedTable.vue';
import { ref } from 'vue';
import type { Well } from './types/well';

const wells = ref<Well[]>([
    {
        "id": "152",
        "name": "60",
        "state": "operating_state_prod",
        "events": [
            {
                "id": "152.base",
                "name": "База",
                "type": "base_production",
                "startDate": null,
                "endDate": null,
                "resources": [],
                "operating_states": [
                    {
                        "startDate": "2025-03-01",
                        "endDate": "2025-04-01",
                        "state": "operating_state_prod"
                    }
                ],
                "stop_well": false,
                "shut_well": false
            },
            {
                "id": "group_1.gtm_2",
                "name": "ГРП_60",
                "kind": "event_kind_gtm",
                "type": "event_type_grp",
                "startDate": null,
                "endDate": null,
                "resources": [],
                "operating_states": [
                    {
                        "startDate": "2025-03-01",
                        "endDate": "2025-04-01",
                        "state": null
                    }
                ],
                "stop_well": false,
                "shut_well": false
            }
        ]
    },
    {
        "id": "group_1.gtm_1",
        "name": "ВНС_1",
        "state": "operating_state_prod",
        "events": [
            {
                "id": "group_1.gtm_1",
                "name": "ВНС_1",
                "kind": "event_kind_gtm",
                "type": "event_type_vns",
                "startDate": null,
                "endDate": null,
                "resources": [],
                "operating_states": [
                    {
                        "startDate": "2025-03-01",
                        "endDate": "2025-04-01",
                        "state": null
                    }
                ],
                "stop_well": false,
                "shut_well": false
            }
        ]
    },
    {
        "id": "otm_1",
        "name": "ЛАР_безым.",
        "state": null,
        "events": [
            {
                "id": "otm_1",
                "name": "ЛАР_безым.",
                "kind": "event_kind_otm",
                "type": "event_type_lar",
                "startDate": "2025-04-01",
                "endDate": "2025-04-16",
                "resources": [
                    {
                        "id": "resource_krs",
                        "name": "Бригады КРС",
                        "type": "resource_krs",
                        "startDate": "2025-04-10",
                        "endDate": "2025-04-16",
                        "stages": [
                            {
                                "id": "stage_operations",
                                "name": "Работы",
                                "startDate": "2025-04-10"
                            },
                            {
                                "id": "stage_mobilization",
                                "name": "Мобилизация",
                                "startDate": "2025-04-14"
                            }
                        ]
                    }
                ],
                "operating_states": [
                    {
                        "startDate": "2025-03-01",
                        "endDate": "2025-04-01",
                        "state": null
                    }
                ],
                "stop_well": false,
                "shut_well": false
            }
        ]
    },
    {
        "id": "otm_2",
        "name": "ЛАР_безым. (1)",
        "state": null,
        "events": [
            {
                "id": "otm_2",
                "name": "ЛАР_безым. (1)",
                "kind": "event_kind_otm",
                "type": "event_type_lar",
                "startDate": "2025-04-01",
                "endDate": "2025-04-16",
                "resources": [
                    {
                        "id": "resource_krs",
                        "name": "Бригады КРС",
                        "type": "resource_krs",
                        "startDate": "2025-04-16",
                        "endDate": "2025-04-16",
                        "stages": [
                            {"id": "stage_mobilization",
                                "name": "Мобилизация",
                                "startDate": "2025-04-16"
                            }
                        ]
                    }
                ],
                "operating_states": [
                    {
                        "startDate": "2025-03-01",
                        "endDate": "2025-04-01",
                        "state": null
                    }
                ],
                "stop_well": false,
                "shut_well": false
            }
        ]
    },
    {
        "id": "otm_3",
        "name": "ЛАР_безым. (2)",
        "state": null,
        "events": [
            {
                "id": "otm_3",
                "name": "ЛАР_безым. (2)",
                "kind": "event_kind_otm",
                "type": "event_type_lar",
                "startDate": "2025-04-01",
                "endDate": "2025-04-16",
                "resources": [
                    {
                        "id": "resource_krs",
                        "name": "Бригады КРС",
                        "type": "resource_krs",
                        "startDate": "2025-04-16",
                        "endDate": "2025-04-16",
                        "stages": [
                            {
                                "id": "stage_mobilization",
                                "name": "Мобилизация",
                                "startDate": "2025-04-16"
                            }
                        ]
                    }
                ],
                "operating_states": [
                    {
                        "startDate": "2025-03-01",
                        "endDate": "2025-04-01",
                        "state": null
                    }
                ],
                "stop_well": false,
                "shut_well": false
            }
        ]
    },
    {
        "id": "otm_4",
        "name": "ЛАР_безым. (3)",
        "state": null,
        "events": [
            {
                "id": "otm_4",
                "name": "ЛАР_безым. (3)",
                "kind": "event_kind_otm",
                "type": "event_type_lar",
                "startDate": "2025-04-01",
                "endDate": "2025-04-30",
                "resources": [
                    {
                        "id": "resource_krs",
                        "name": "Бригады КРС",
                        "type": "resource_krs",
                        "startDate": "2025-04-16",
                        "endDate": "2025-04-30",
                        "stages": [
                            {
                                "id": "stage_mobilization",
                                "name": "Мобилизация",
                                "startDate": "2025-04-16"
                            }
                        ]
                    }
                ],
                "operating_states": [
                    {
                        "startDate": "2025-03-01",
                        "endDate": "2025-04-01",
                        "state": null
                    }
                ],
                "stop_well": false,
                "shut_well": false
            }
        ]
    },
    {
        "id": "otm_5",
        "name": "ЛАР_безым. (4)",
        "state": null,
        "events": [
            {
                "id": "otm_5",
                "name": "ЛАР_безым. (4)",
                "kind": "event_kind_otm",
                "type": "event_type_lar",
                "startDate": "2025-04-01",
                "endDate": "2025-04-30",
                "resources": [
                    {
                        "id": "resource_krs",
                        "name": "Бригады КРС",
                        "type": "resource_krs",
                        "startDate": "2025-04-16",
                        "endDate": "2025-04-30",
                        "stages": [
                            {
                                "id": "stage_mobilization",
                                "name": "Мобилизация",
                                "startDate": "2025-04-16"
                            }]
                    }
                ],
                "operating_states": [
                    {
                        "startDate": "2025-03-01",
                        "endDate": "2025-04-01",
                        "state": null
                    }
                ],
                "stop_well": false,
                "shut_well": false
            }
        ]
    }
]
)

// Обработчики событий
const handleWellAction = (payload: { type: 'edit' | 'add', wellId: string }) => {
  const well = wells.value.find(w => w.id === payload.wellId);
  if (!well) return;

  if (payload.type === 'edit') {
    // Здесь можно добавить логику редактирования скважины
    console.log('Редактирование скважины:', payload.wellId);
    // Например, открыть модальное окно для редактирования
  } else {
    // Здесь можно добавить логику добавления мероприятия
    console.log('Добавление мероприятия для скважины:', payload.wellId);
    // Например, открыть модальное окно для добавления мероприятия
  }
};

const handleEventAction = (payload: { type: 'edit' | 'add', eventId: string }) => {
  const [wellId, eventId] = payload.eventId.split('.');
  const well = wells.value.find(w => w.id === wellId);
  if (!well) return;

  if (payload.type === 'edit') {
    // Здесь можно добавить логику редактирования мероприятия
    console.log('Редактирование мероприятия:', payload.eventId);
    // Например, открыть модальное окно для редактирования
  } else {
    // Здесь можно добавить логику добавления мероприятия
    console.log('Добавление мероприятия:', payload.eventId);
    // Например, открыть модальное окно для добавления
  }
};
</script>

<template>
  <div class="app">
    <!-- <h1>Планирование работ на скважинах</h1> -->
    <NestedTable
      :wells="wells"
      @well-action="handleWellAction"
      @event-action="handleEventAction"
    />
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
