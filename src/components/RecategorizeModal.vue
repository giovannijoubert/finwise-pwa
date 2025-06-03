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
 
            <Multiselect
              v-model="selectedCategoryId"
              :options="categories"
              :searchable="true"
              value-prop="id"
              label="name"
              placeholder="Select a category"
              class="mt-1"
              :classes="{
                container: 'relative mx-auto w-full flex items-center justify-end box-border cursor-pointer border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 leading-snug outline-none',
                containerDisabled: 'cursor-default opacity-50',
                containerOpen: 'rounded-b-none',
                containerOpenTop: 'rounded-t-none',
                containerActive: 'ring-2 ring-emerald-500',
                singleLabel: 'flex items-center h-full max-w-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3.5 pr-16 box-border rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-3.5',
                singleLabelText: 'overflow-ellipsis overflow-hidden block whitespace-nowrap max-w-full',
                multipleLabel: 'flex items-center flex-wrap w-full py-1.5 px-3 bg-transparent',
                search: 'w-full absolute inset-0 outline-none focus:ring-0 appearance-none box-border border-0 text-base font-sans bg-white dark:bg-gray-700 rounded-md pl-3.5 rtl:pl-0 rtl:pr-3.5',
                tags: 'flex-grow flex-shrink flex flex-wrap gap-1 p-1.5',
                tag: 'bg-emerald-500 text-white text-sm font-semibold py-0.5 pl-2 rounded mr-1 mb-1 flex items-center whitespace-nowrap',
                tagDisabled: 'pr-2 opacity-50',
                tagRemove: 'flex items-center justify-center text-emerald-200 hover:text-white hover:bg-emerald-600 rounded-r px-1',
                tagRemoveIcon: 'bg-multiselect-remove bg-center bg-no-repeat opacity-30 inline-block w-3 h-3',
                tagsSearchWrapper: 'inline-block relative mx-1 mb-1 flex-grow flex-shrink h-full',
                tagsSearch: 'absolute inset-0 border-0 outline-none focus:ring-0 appearance-none p-0 text-base font-sans box-border w-full',
                tagsSearchCopy: 'invisible whitespace-pre-wrap inline-block h-px',
                placeholder: 'flex items-center h-full absolute left-0 top-0 pointer-events-none bg-transparent leading-snug pl-3.5 text-gray-500 dark:text-gray-400',
                clear: 'pr-3.5 relative z-10 opacity-40 transition duration-300 flex-shrink-0 flex-grow-0 flex hover:opacity-80',
                clearIcon: 'bg-multiselect-remove bg-center bg-no-repeat w-2.5 h-4 py-px box-content',
                spinner: 'bg-multiselect-spinner bg-center bg-no-repeat w-4 h-4 z-10 mr-3.5 animate-spin flex-shrink-0 flex-grow-0',
                dropdown: 'max-h-60 absolute -left-px -right-px bottom-0 transform translate-y-full border border-gray-300 dark:border-gray-600 -mt-px overflow-y-scroll z-50 flex flex-col rounded-b bg-white dark:bg-gray-700',
                dropdownTop: '-translate-y-full top-px bottom-auto flex-col-reverse rounded-b-none rounded-t',
                dropdownHidden: 'hidden',
                options: 'flex flex-col p-0 m-0 list-none',
                optionsTop: 'flex-col-reverse',
                option: 'flex items-center justify-start box-border text-left cursor-pointer text-base leading-snug py-2 px-3',
                optionPointed: 'text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-600',
                optionSelected: 'text-white bg-emerald-500',
                optionDisabled: 'text-gray-300 cursor-not-allowed',
                optionSelectedPointed: 'text-white bg-emerald-500 opacity-90',
                optionSelectedDisabled: 'text-emerald-100 bg-emerald-500 bg-opacity-50 cursor-not-allowed',
                fakeInput: 'bg-transparent absolute left-0 right-0 -bottom-px w-full h-px',
                spacer: 'h-9 py-px box-content',
              }"
            />
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
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="markAsTransfer"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Updating...' : 'Mark as Transfer' }}
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
import Multiselect from '@vueform/multiselect'
import '@vueform/multiselect/themes/default.css'

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

const markAsTransfer = async () => {
  if (!props.transaction) {
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
        isTransfer: true
      })
    })

    if (!response.ok) {
      throw new Error('Failed to mark transaction as transfer')
    }

    emit('category-updated')
    emit('refresh')
    close()
  } catch (error) {
    console.error('Error marking transaction as transfer:', error)
    // You might want to show an error message to the user here
  } finally {
    isUpdating.value = false
  }
}
</script> 