import { ref } from 'vue';

export interface CellPosition {
  row: number;
  col: number;
}

export interface SelectionRange {
  start: CellPosition;
  end: CellPosition;
}

export function useTableSelection(rows: number, cols: number) {
  const selectedRange = ref<SelectionRange | null>(null);
  const activeCell = ref<CellPosition | null>(null);

  const isCellSelected = (row: number, col: number) => {
    if (!selectedRange.value) return false;
    
    const { start, end } = selectedRange.value;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  const isCellActive = (row: number, col: number) => {
    if (!activeCell.value) return false;
    return activeCell.value.row === row && activeCell.value.col === col;
  };

  const selectCell = (row: number, col: number, isShiftKey = false) => {
    if (isShiftKey && activeCell.value) {
      selectedRange.value = {
        start: activeCell.value,
        end: { row, col }
      };
    } else {
      activeCell.value = { row, col };
      selectedRange.value = {
        start: { row, col },
        end: { row, col }
      };
    }
  };

  const moveSelection = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!activeCell.value) {
      activeCell.value = { row: 0, col: 0 };
      return;
    }

    let newRow = activeCell.value.row;
    let newCol = activeCell.value.col;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, newRow - 1);
        break;
      case 'down':
        newRow = Math.min(rows - 1, newRow + 1);
        break;
      case 'left':
        newCol = Math.max(0, newCol - 1);
        break;
      case 'right':
        newCol = Math.min(cols - 1, newCol + 1);
        break;
    }

    activeCell.value = { row: newRow, col: newCol };
    selectedRange.value = {
      start: { row: newRow, col: newCol },
      end: { row: newRow, col: newCol }
    };
  };

  const getSelectedValues = (getCellValue: (row: number, col: number) => string) => {
    if (!selectedRange.value) return [];

    const { start, end } = selectedRange.value;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    const values: string[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        values.push(getCellValue(row, col));
      }
    }
    return values;
  };

  const setSelectedValues = (values: string[], setCellValue: (row: number, col: number, value: string) => void) => {
    if (!selectedRange.value) return;

    const { start, end } = selectedRange.value;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    let valueIndex = 0;
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        if (valueIndex < values.length) {
          setCellValue(row, col, values[valueIndex]);
          valueIndex++;
        }
      }
    }
  };

  return {
    selectedRange,
    activeCell,
    isCellSelected,
    isCellActive,
    selectCell,
    moveSelection,
    getSelectedValues,
    setSelectedValues
  };
} 