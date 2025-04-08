import type { App } from 'vue'
import NestedTable from './components/NestedTable.vue'
import type { Well, DateGranularity } from './types/table'

export { NestedTable }
export type { Well, DateGranularity }

export default {
  install: (app: App) => {
    app.component('NestedTable', NestedTable)
  }
}
