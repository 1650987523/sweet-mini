<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  min: 1,
  max: 10,
  step: 1,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const minusDisabled = computed(() => props.modelValue <= props.min || props.disabled)

const plusDisabled = computed(() => props.modelValue >= props.max || props.disabled)

function handleMinus() {
  if (minusDisabled.value)
    return
  emit('update:modelValue', props.modelValue - props.step)
}

function handlePlus() {
  if (plusDisabled.value)
    return
  emit('update:modelValue', props.modelValue + props.step)
}
</script>

<template>
  <view class="flex items-center gap-1">
    <up-button
      text="-"
      :disabled="minusDisabled"
      :custom-style="{ width: '28px', height: '28px', fontSize: '14px', borderRadius: '4px', backgroundColor: minusDisabled ? '#f5f5f5' : '#f5f5f5' }"
      @click="handleMinus"
    />
    <view
      class="flex items-center justify-center"
      :style="{ width: '40px', height: '28px' }"
    >
      <text>{{ modelValue }}</text>
    </view>
    <up-button
      text="+"
      type="primary"
      :disabled="plusDisabled"
      :custom-style="{ width: '28px', height: '28px', fontSize: '14px', borderRadius: '4px', backgroundColor: plusDisabled ? 'var(--theme-color)' : 'var(--theme-color)' }"
      @click="handlePlus"
    />
  </view>
</template>

<style lang="scss" scoped>
</style>
