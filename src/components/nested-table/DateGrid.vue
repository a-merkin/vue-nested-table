<template>
  <div class="date-grid" @keydown="handleKeyDown">
    <div class="grid-container">
      <div v-for="row in rows" :key="row" class="grid-row">
        <DateCell
          v-for="col in cols"
          :key="`${row}-${col}`"
          :value="getCellValue(row, col)"
          :is-selected="isCellSelected(row, col)"
          :is-active="isCellActive(row, col)"
          :row-index="row"
          :col-index="col"
          @update:value="value => setCellValue(row, col, value)"
          @select="handleCellSelect"
          @move-selection="handleMoveSelection"
          @drag-fill="handleDragFill"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DateCell from './DateCell.vue'
import { useTableSelection } from '../../composables/useTableSelection'
import { useDateAutofill } from '../../composables/useDateAutofill'
import type { CellPosition } from '../../composables/useTableSelection'

const props = defineProps<{
  rows: number
  cols: number
  initialValues?: string[][]
}>()

const emit = defineEmits<{
  (e: 'update:values', values: string[][]): void
}>()

const cellValues = ref<string[][]>(
  props.initialValues ||
    Array(props.rows)
      .fill(null)
      .map(() => Array(props.cols).fill(''))
)

const { selectedRange, activeCell, isCellSelected, isCellActive, selectCell, moveSelection } =
  useTableSelection(props.rows, props.cols)
const { autofillDates } = useDateAutofill()

const getCellValue = (row: number, col: number): string => {
  return cellValues.value[row]?.[col] || ''
}

const setCellValue = (row: number, col: number, value: string) => {
  if (!cellValues.value[row]) {
    cellValues.value[row] = []
  }
  cellValues.value[row][col] = value
  emit('update:values', cellValues.value)
}

const handleCellSelect = (position: CellPosition, isShiftKey: boolean) => {
  selectCell(position.row, position.col, isShiftKey)
}

const handleMoveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
  moveSelection(direction)
}

const handleDragFill = (startPosition: CellPosition, endPosition: CellPosition) => {
  const selectedValues: string[] = []
  const minRow = Math.min(startPosition.row, endPosition.row)
  const maxRow = Math.max(startPosition.row, endPosition.row)
  const minCol = Math.min(startPosition.col, endPosition.col)
  const maxCol = Math.max(startPosition.col, endPosition.col)

  // Collect selected values
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      selectedValues.push(getCellValue(row, col))
    }
  }

  // Generate new values based on pattern
  const newValues = autofillDates(selectedValues, selectedValues.length)

  // Apply new values
  let valueIndex = 0
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      if (valueIndex < newValues.length) {
        setCellValue(row, col, newValues[valueIndex])
        valueIndex++
      }
    }
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'c':
        // Copy
        const selectedValues = cellValues.value
          .map((row, rowIndex) =>
            row.map((value, colIndex) => (isCellSelected(rowIndex, colIndex) ? value : null))
          )
          .flat()
          .filter(Boolean)

        if (selectedValues.length > 0) {
          navigator.clipboard.writeText(selectedValues.join('\t'))
          event.preventDefault()
        }
        break
      case 'v':
        // Paste
        navigator.clipboard.readText().then(pastedData => {
          if (pastedData && activeCell.value) {
            const values = pastedData.split('\t')
            let row = activeCell.value.row
            let col = activeCell.value.col

            for (const value of values) {
              if (row < props.rows && col < props.cols) {
                setCellValue(row, col, value)
                col++
                if (col >= props.cols) {
                  col = 0
                  row++
                }
              }
            }
            event.preventDefault()
          }
        })
        break
    }
  }
}
</script>

<style scoped>
.date-grid {
  width: 100%;
  overflow: auto;
}

.grid-container {
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: flex;
}
</style>
