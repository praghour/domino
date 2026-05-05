<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue']);
</script>

<template>
  <button
    class="checkbox"
    :class="{ checked: modelValue }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span v-if="modelValue">✓</span>
  </button>
</template>

<style scoped>
.checkbox {
  width: 24px;
  height: 24px;

  border: 2px solid #374151;
  border-radius: 4px;
  background: white;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #2f75ff;
  font-size: 22px;
  font-weight: 700;

  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.checkbox.checked {
  border-color: #2f75ff;
}
</style>