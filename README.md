# Vue Nested Table

Вложенная таблица для Vue 3 с поддержкой группировки и раскрывающихся строк.

## Установка

```bash
npm install vue-nested-table
# или
yarn add vue-nested-table
```

## Использование

### Глобальная регистрация

```typescript
import { createApp } from 'vue'
import VueNestedTable from 'vue-nested-table'
import App from './App.vue'

const app = createApp(App)
app.use(VueNestedTable)
app.mount('#app')
```

### Локальная регистрация

```vue
<template>
  <NestedTable :wells="wells" />
</template>

<script setup lang="ts">
import { NestedTable } from 'vue-nested-table'
import type { Well } from 'vue-nested-table'

const wells: Well[] = [
  // ваши данные
]
</script>
```

## Типы данных

```typescript
interface Well {
  id: string | number
  name: string
  events: Event[]
}

interface Event {
  id: string | number
  name: string
  startDate: string | Date
  endDate: string | Date
  resources: Resource[]
}

interface Resource {
  id: string | number
  name: string
  startDate: string | Date
  endDate: string | Date
}

type DateGranularity = 'day' | 'week' | 'month'
```

## Пропсы

| Имя | Тип | Обязательный | Описание |
|-----|-----|--------------|-----------|
| wells | Well[] | Да | Массив данных для отображения в таблице |

## События

| Имя | Параметры | Описание |
|-----|-----------|-----------|
| toggle-event | (eventId: string \| number) => void | Вызывается при раскрытии/скрытии события |
| toggle-resource | (resourceId: string \| number) => void | Вызывается при раскрытии/скрытии ресурса |

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
