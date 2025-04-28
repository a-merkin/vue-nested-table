<template>
  <div class="slider" :style="sliderDotWith" :class="{ 'slider--disabled': disabled }">
    <div class="slider__track">
      <div class="slider__track-background"></div>
      <div v-for="option in options" :key="option.id" class="slider__dot-wrapper">
        <div
          class="slider__dot"
          :class="{ 'slider__dot--active': option.id === selectedOption }"
          @click.stop="selectOption(option)"
        ></div>
        <div class="slider__dot__details">
          <span class="slider__dot__details-text"> {{ option.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Option {
  id: string
  name: string
}

interface Props {
  modelValue: string
  options: Option[]
  disabled: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  disabled: false,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'selectOption', value: string): void
}>()

const selectedOption = ref(props.modelValue || props.options[0]?.id)

const selectOption = (option: Option) => {
  selectedOption.value = option.id
  emit('update:modelValue', selectedOption.value)
  emit('selectOption', selectedOption.value)
}

const sliderDotWith = computed(() => {
  return {
    '--option-width': `${100 / props.options.length}%`,
  }
})
</script>

<style scoped>
.slider {
  width: 100%;
}

.slider--disabled {
  cursor: default;
  opacity: 0.38;
  pointer-events: none;
}

.slider__track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.slider__track-background {
  position: absolute;
  width: 100%;
  height: 18px;
  background-color: #62636c;
  border-radius: 0.5rem;
  top: 5px;
}

.slider__dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #999999;
  cursor: pointer;
  transition: background-color 0.1s;
  position: relative;
}

.slider__dot:hover {
  background-color: #0d8b33;
}

.slider__dot--active {
  background-color: #0f9d3b;
}

.slider__dot-wrapper {
  width: var(--option-width);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider__dot-wrapper:last-child {
  align-items: end;
}

.slider__dot-wrapper:nth-child(2) {
  align-items: start;
}

.slider__dot__details {
  position: absolute;
  top: 100%;
  width: var(--option-width);
  text-align: center;
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  text-wrap: nowrap;
  transition: all 0.5s;
}

.slider__dot__details-text {
  font-size: 1rem;
  font-weight: 400;
}
</style>
