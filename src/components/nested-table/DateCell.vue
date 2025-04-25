<template>
  <div
    :class="['date-cell', { 'is-selected': isSelected, 'is-active': isActive, 'is-invalid': isInvalid }]"
    tabindex="0"
    @click="handleClick"
    @dblclick="startEditing"
  >
    <div v-if="isEditing" class="date-cell__editor">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="date"
        :min="minDate"
        :max="maxDate"
        @blur="finishEditing"
        @keydown.enter="finishEditing"
        @keydown.esc="cancelEditing"
        @keydown="handleKeydown"
      />
    </div>
    <div v-else class="date-cell__display">
      {{ formattedDate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { format, parse, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { CellPosition } from '../../composables/useTableSelection';

const props = defineProps<{
  value: string;
  isSelected?: boolean;
  isActive?: boolean;
  rowIndex: number;
  colIndex: number;
  minDate?: string;
  maxDate?: string;
}>();

const emit = defineEmits<{
  (e: 'update:value', value: string): void;
  (e: 'select', position: CellPosition, isMultiSelect: boolean): void;
  (e: 'move-selection', direction: 'up' | 'down' | 'left' | 'right'): void;
  (e: 'drag-fill', startPosition: CellPosition, endPosition: CellPosition): void;
}>();

const isEditing = ref(false);
const isInvalid = ref(false);
const inputValue = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const dragStartPosition = ref<CellPosition | null>(null);

const formattedDate = computed(() => {
  if (!props.value) return '';
  const date = parse(props.value, 'yyyy-MM-dd', new Date());
  return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
});

const handleClick = (event: MouseEvent) => {
  emit('select', { row: props.rowIndex, col: props.colIndex }, event.ctrlKey || event.metaKey);
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault();
    emit('move-selection', e.key === 'Enter' ? 'down' : 'right');
  }
};

const startEditing = () => {
  console.log('DateCell: startEditing called');
  isEditing.value = true;
  inputValue.value = props.value;
  nextTick(() => {
    console.log('DateCell: focusing input');
    inputRef.value?.focus();
  });
};

const finishEditing = () => {
  console.log('DateCell: finishEditing called with value:', inputValue.value);
  const parsedDate = parse(inputValue.value, 'yyyy-MM-dd', new Date());
  if (isValid(parsedDate)) {
    const formatted = format(parsedDate, 'yyyy-MM-dd');
    console.log('DateCell: emitting update with formatted date:', formatted);
    emit('update:value', formatted);
    isInvalid.value = false;
  } else {
    console.log('DateCell: invalid date in finishEditing');
    isInvalid.value = true;
    return;
  }
  isEditing.value = false;
};

const cancelEditing = () => {
  isEditing.value = false;
  isInvalid.value = false;
};

const handleMouseDown = (event: MouseEvent) => {
  if (!isEditing.value) {
    emit('select', { row: props.rowIndex, col: props.colIndex }, event.ctrlKey || event.metaKey);
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  dragStartPosition.value = null;
};

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value && dragStartPosition.value) {
    emit('drag-fill', dragStartPosition.value, { row: props.rowIndex, col: props.colIndex });
  }
};

const startDragFill = (event: MouseEvent) => {
  isDragging.value = true;
  dragStartPosition.value = { row: props.rowIndex, col: props.colIndex };
  event.stopPropagation();
};

onMounted(() => {
  if (props.isActive) {
    startEditing();
  }
  document.addEventListener('contextmenu', handleContextMenu);
});

onUnmounted(() => {
  document.removeEventListener('contextmenu', handleContextMenu);
});

const handleContextMenu = (event: MouseEvent) => {
  if (props.isSelected) {
    // Показываем стандартное контекстное меню
    return;
  }
  event.preventDefault();
};
</script>

<style scoped>
.date-cell {
  position: relative;
  padding: 2px 4px;
  min-width: 100px;
  height: 24px;
  border: 1px solid #c0c0c0;
  background-color: white;
  cursor: cell;
  user-select: none;
}

.date-cell.is-editing {
  padding: 0;
}

.date-cell.is-invalid {
  background-color: #ffebee;
}

.date-cell input {
  width: 100%;
  height: 100%;
  border: none;
  padding: 2px 4px;
  font: inherit;
}

.date-cell input:focus {
  outline: none;
}

.selection-handle {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  background-color: #000;
  cursor: crosshair;
}

.date-cell.is-selected {
  background-color: #e6f2ff;
}

.date-cell.is-active {
  border: 2px solid #1a73e8;
}
</style> 