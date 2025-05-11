<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-sm relative"
      >
        <button
          @click="$emit('update:modelValue', false)"
          class="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg
            class="w-5 h-5 text-gray-500 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 class="text-lg font-semibold mb-4">Settings</h2>
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-800 dark:text-gray-200">Dark Mode</span>
          <label class="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              :checked="darkMode"
              @change="$emit('update:darkMode', ($event.target as HTMLInputElement)?.checked); $emit('toggle-dark-mode')"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 dark:bg-gray-700 rounded-full peer peer-checked:bg-emerald-600 transition-colors"
            ></div>
            <div
              class="absolute left-1 top-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full h-4 w-4 transition-transform"
              :class="darkMode ? 'translate-x-5' : ''"
            ></div>
          </label>
        </div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-800 dark:text-gray-200">Include collapsed groups in stat cards</span>
          <label class="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              :checked="includeCollapsed"
              @change="$emit('update:includeCollapsed', ($event.target as HTMLInputElement)?.checked)"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 dark:bg-gray-700 rounded-full peer peer-checked:bg-emerald-600 transition-colors"
            ></div>
            <div
              class="absolute left-1 top-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-full h-4 w-4 transition-transform"
              :class="includeCollapsed ? 'translate-x-5' : ''"
            ></div>
          </label>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps({
  modelValue: Boolean,
  darkMode: Boolean,
  includeCollapsed: Boolean,
})
defineEmits(['update:modelValue', 'update:darkMode', 'toggle-dark-mode', 'update:includeCollapsed'])
</script> 