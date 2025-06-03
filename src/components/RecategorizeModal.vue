<template>
  <div v-if="modelValue" 
       class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
       @click="close">
    <div class="bg-white dark:bg-gray-800 w-full sm:w-[480px] sm:rounded-t-2xl sm:rounded-b-2xl max-h-[90vh] flex flex-col pb-24 sm:pb-8"
         @click.stop>
      <div class="p-4 border-b border-gray-200 flex justify-between items-center dark:border-gray-700">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Recategorize Transaction</h2>
          <p class="text-sm text-gray-500 dark:text-gray-300 mt-1">{{ transaction?.description }}</p>
        </div>
        <button class="p-2 -m-2 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors dark:hover:bg-gray-800" 
                @click="close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-4">
        <div class="space-y-4">
          <div>
            <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              id="category"
              v-model="selectedCategoryId"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-gray-100"
            >
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              class="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              @click="close"
            >
              Cancel
            </button>
            <button
              type="button"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              @click="updateCategory"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Updating...' : 'Update' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Transaction } from '@/stores/transactions'
import { useTransactionCategoriesStore } from '@/stores/transactionCategories'

interface Props {
  modelValue: boolean
  transaction: Transaction | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'category-updated'): void
  (e: 'refresh'): void
}>()

const categoriesStore = useTransactionCategoriesStore()
const selectedCategoryId = ref(props.transaction?.transactionCategoryId || '')
const isUpdating = ref(false)

const categories = computed(() => categoriesStore.categories)

const close = () => {
  emit('update:modelValue', false)
}

const updateCategory = async () => {
  if (!props.transaction || selectedCategoryId.value === props.transaction.transactionCategoryId) {
    close()
    return
  }

  isUpdating.value = true
  try {
    const apiKey = localStorage.getItem('api_key')
    if (!apiKey) throw new Error('API key not found')

    const response = await fetch(`https://api.finwiseapp.io/transactions/${props.transaction.id}?timezone=Africa%2FJohannesburg`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'authorization': apiKey,
        'content-type': 'application/json',
        'origin': 'https://app.finwiseapp.io',
        'referer': 'https://app.finwiseapp.io/'
      },
      body: JSON.stringify({
        needsReview: false,
        transactionCategoryId: selectedCategoryId.value
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update transaction category')
    }

    emit('category-updated')
    emit('refresh')
    close()
  } catch (error) {
    console.error('Error updating transaction category:', error)
    // You might want to show an error message to the user here
  } finally {
    isUpdating.value = false
  }
}
</script> 