<template>
  <div
    class="column-resizer"
    @mousedown="startResize"
    @mouseover="showResizer"
    @mouseout="hideResizer"
  >
    <div class="resizer-line" :class="{ 'resizer-line-visible': isResizerVisible }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  onResize: (width: number) => void
}>()

const isResizerVisible = ref(false)

const startResize = (e: MouseEvent) => {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = (e.target as HTMLElement).parentElement?.offsetWidth || 0

  const mouseMoveHandler = (e: MouseEvent) => {
    e.preventDefault()
    const width = startWidth + (e.clientX - startX)
    if (width > 50) {
      props.onResize(width)
    }
  }

  const mouseUpHandler = () => {
    document.removeEventListener('mousemove', mouseMoveHandler)
    document.removeEventListener('mouseup', mouseUpHandler)
  }

  document.addEventListener('mousemove', mouseMoveHandler)
  document.addEventListener('mouseup', mouseUpHandler)
}

const showResizer = () => {
  isResizerVisible.value = true
}

const hideResizer = () => {
  isResizerVisible.value = false
}
</script>

<style scoped>
.column-resizer {
  position: absolute;
  right: 2px;
  top: 0;
  height: 100%;
  width: 3px;
  cursor: col-resize;
  z-index: 10;
  padding: 5px;
}

.resizer-line {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: transparent;
  transition: background-color 0.2s;
  background-color: rgb(169, 169, 169);
}

.resizer-line-visible {
  background-color: #464646;
}
</style>
