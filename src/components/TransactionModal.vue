<template>
  <div v-if="modelValue" 
       class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
       @click="close">
    <div class="bg-white w-full sm:w-[480px] sm:rounded-t-2xl sm:rounded-b-2xl max-h-[90vh] flex flex-col pb-12 md:pb-2"
         @click.stop>
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ category?.name }}</h2>
          <p class="text-sm text-gray-500 mt-1">Transaction History</p>
        </div>
        <button class="p-2 -m-2 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors" 
                @click="close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="overflow-y-auto flex-1">
        <div v-if="transactions.length === 0" 
             class="flex flex-col items-center justify-center py-12 px-4">
          <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-500 text-center">No transactions found for this category</p>
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="transaction in transactions" 
               :key="transaction.id" 
               class="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate">
                  {{ transaction.description }}
                </p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ new Date(transaction.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) }}
                </p>
              </div>
              <div class="font-medium" 
                   :class="transaction.amount.amount < 0 ? 'text-red-500' : 'text-gray-900'">
                {{ transaction.amount.currencyCode }} {{ Math.abs(transaction.amount.amount).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/stores/transactions'

interface Props {
  modelValue: boolean
  category: { id: string; name: string } | null
  transactions: Transaction[]
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const close = () => {
  emit('update:modelValue', false)
}
</script> 