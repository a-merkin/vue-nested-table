# Vue Nested Table

Вложенная таблица для Vue 3 с поддержкой иерархических данных и временной шкалы.

## Установка

```bash
npm install vue-nested-table
```

## Использование

```vue
<template>
  <NestedTable :wells="wells" />
</template>

<script setup lang="ts">
import { NestedTable } from 'vue-nested-table'
import type { Well } from 'vue-nested-table'

const wells: Well[] = [
  {
    id: '1',
    name: 'Скважина 1',
    state: 'operating_state_prod',
    events: [
      {
        id: '1',
        name: 'Событие 1',
        type: 'base_production',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        resources: [
          {
            id: '1',
            name: 'Ресурс 1',
            type: 'type1',
            startDate: '2024-01-01',
            endDate: '2024-01-15',
            operations: [
              {
                id: '1',
                name: 'Операция 1',
                startDate: '2024-01-01',
                endDate: '2024-01-15'
              }
            ]
          }
        ]
      }
    ]
  }
]
</script>
```

## Типы данных

### Well
```typescript
interface Well {
  id: string;
  name: string;
  state: OperatingState;
  events: Event[];
}
```

### Event
```typescript
interface Event {
  id: string;
  name: string;
  type: EventType;
  kind?: EventKind;
  startDate: string | null;
  endDate: string | null;
  resources?: Resource[];
  operating_states?: { state: OperatingState; startDate: string; endDate: string; }[];
}
```

### Resource
```typescript
interface Resource {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  operations: Operation[];
}
```

### Operation
```typescript
interface Operation {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}
```

## События

Компонент поддерживает следующие события:
- `toggle-event` - при раскрытии/скрытии события
- `toggle-resource` - при раскрытии/скрытии ресурса

## Стилизация

Компонент использует scoped стили, но вы можете переопределить их через CSS-переменные:

```css
.nested-table {
  --table-border-color: #C0C0C0;
  --table-header-bg: #f5f5f5;
  --table-header-color: #333333;
}
```

## Лицензия

MIT

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
