<template>
  <div class="switch-wrapper">
    <slot name="prefix"></slot>
    <div
      class="switch"
      :class="{ 'switch--checked': checked, 'switch--disabled': disabled }"
      @click="toggleSwitch"
    >
      <div class="switch__slider" :class="{ 'switch__slider--disabled': disabled }"></div>
    </div>
    <slot name="postfix"></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'switch'])

const checked = ref(props.modelValue)

watch(
  () => props.modelValue,
  newValue => {
    checked.value = newValue
  }
)

const toggleSwitch = () => {
  checked.value = !checked.value
  emit('update:modelValue', checked.value)
  emit('switch', checked.value)
}
</script>

<style scoped>
.switch-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 55px;
  height: 19px;
  background-color: #62636c;
  border-radius: 14px;
  cursor: pointer;
}

.switch--disabled {
  cursor: default;
  opacity: 0.38;
  pointer-events: none;
}

.switch__slider {
  position: absolute;
  top: 50%;
  left: 0px;
  transform: translateY(-50%);
  width: 29px;
  height: 29px;
  background-color: #009639;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.switch--checked .switch__slider {
  transform: translate(28px, -50%);
}

.switch__slider--disabled {
  background-color: #999999;
}
</style>
