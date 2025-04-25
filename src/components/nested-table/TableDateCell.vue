<template>
  <td
    :class="['date-cell', { 'is-selected': isSelected, 'is-active': isActive }]"
    tabindex="0"
    @click="handleClick"
    @dblclick="startEditing"
    @paste="handlePaste"
  >
    <DateCell
      :value="value"
      :is-selected="isSelected"
      :is-active="isActive"
      :row-index="rowIndex"
      :col-index="colIndex"
      :min-date="minDate"
      :max-date="maxDate"
      @update:value="handleValueUpdate"
      @select="handleSelect"
      @move-selection="handleMoveSelection"
      @drag-fill="handleDragFill"
    />
  </td>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DateCell from './DateCell.vue'
import type { CellPosition } from '../../composables/useTableSelection'
import { parse, isValid, format } from 'date-fns'

const props = defineProps<{
  value: string
  isSelected: boolean
  isActive: boolean
  rowIndex: number
  colIndex: number
  minDate?: string
  maxDate?: string
}>()

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'select', position: CellPosition, isMultiSelect: boolean): void
  (e: 'move-selection', direction: 'up' | 'down' | 'left' | 'right'): void
  (e: 'drag-fill', startPosition: CellPosition, endPosition: CellPosition): void
  (
    e: 'cell-move',
    move: { direction: 'up' | 'down' | 'left' | 'right'; position: CellPosition }
  ): void
  (e: 'bulk-update', payload: { startPosition: CellPosition; values: string[] }): void
}>()

const isInvalid = ref(false)

const handleValueUpdate = (newValue: string) => {
  console.log('TableDateCell: handleValueUpdate called with value:', newValue)
  // Validate the date format
  const date = parse(newValue, 'yyyy-MM-dd', new Date())
  if (!isValid(date)) {
    console.log('TableDateCell: invalid date in handleValueUpdate')
    isInvalid.value = true
    return
  }

  const formattedValue = format(date, 'yyyy-MM-dd')
  console.log('TableDateCell: formatted value:', formattedValue)

  if (props.minDate && formattedValue < props.minDate) {
    console.log('TableDateCell: value is less than minDate')
    isInvalid.value = true
    return
  }
  if (props.maxDate && formattedValue > props.maxDate) {
    console.log('TableDateCell: value is greater than maxDate')
    isInvalid.value = true
    return
  }

  console.log('TableDateCell: emitting update:value event with value:', formattedValue)
  emit('update:value', formattedValue)
  isInvalid.value = false
}

const handleSelect = (position: CellPosition, isMultiSelect: boolean) => {
  emit('select', position, isMultiSelect)
}

const handleMoveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
  emit('move-selection', direction)
}

const handleDragFill = (startPosition: CellPosition, endPosition: CellPosition) => {
  emit('drag-fill', startPosition, endPosition)
}

const startEditing = () => {
  if (props.isSelected) {
    const dateCell = document.querySelector('.date-cell.is-selected')
    if (dateCell) {
      const input = dateCell.querySelector('input')
      if (input) {
        input.focus()
      }
    }
  }
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pastedData = e.clipboardData?.getData('text')
  if (!pastedData) return

  const values = pastedData.split(/[\n\t]/).map(value => value.trim())
  const validDates = values
    .map(value => {
      const parsedDate = parse(value, 'yyyy-MM-dd', new Date())
      return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : null
    })
    .filter(date => date !== null)

  if (validDates.length === 0) {
    isInvalid.value = true
    return
  }

  if (validDates.length === 1) {
    emit('update:value', validDates[0])
  } else {
    emit('bulk-update', {
      startPosition: { row: props.rowIndex, col: props.colIndex },
      values: validDates,
    })
  }
}

const handleClick = (event: MouseEvent) => {
  event.stopPropagation()
  console.log('TableDateCell: handleClick called, isSelected:', props.isSelected)
  emit('select', { row: props.rowIndex, col: props.colIndex }, event.ctrlKey || event.metaKey)
}

const handleCopy = (event: ClipboardEvent) => {
  if (props.isSelected) {
    // Get the current cell's value directly from props
    const currentValue = props.value

    // Check if this is the only selected cell
    const selectedCells = document.querySelectorAll('td.date-cell.is-selected')
    if (selectedCells.length === 1) {
      // Single cell selection - copy just the value
      event.clipboardData?.setData('text/plain', currentValue)
    } else {
      // Multiple cell selection - format as pairs
      const dates = Array.from(selectedCells)
        .map(cell => {
          const display = cell.querySelector('.date-cell__display')
          return display?.textContent?.trim() || ''
        })
        .filter(Boolean)

      let formattedText = ''
      for (let i = 0; i < dates.length; i += 2) {
        if (i > 0) formattedText += '\n'
        formattedText += `${dates[i]} ${dates[i + 1] || ''}`
      }
      event.clipboardData?.setData('text/plain', formattedText)
    }
    event.preventDefault()
    event.stopPropagation()
  }
}

// Add copy event listener with once option
onMounted(() => {
  document.addEventListener('copy', handleCopy, { once: true })
})

onUnmounted(() => {
  document.removeEventListener('copy', handleCopy)
})
</script>

<style scoped>
.date-cell {
  padding: 0;
  min-width: 100px;
  max-width: 100px;
  background-color: white;
}
</style>
