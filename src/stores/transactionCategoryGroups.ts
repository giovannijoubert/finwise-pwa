import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TransactionCategoryGroup {
  id: string
  name: string
  color: string | null
  emoji: string | null
}

export const useTransactionCategoryGroupsStore = defineStore('transactionCategoryGroups', () => {
  const groups = ref<TransactionCategoryGroup[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getApiKey(): string | null {
    return localStorage.getItem('api_key')
  }

  async function fetchGroups() {
    loading.value = true
    error.value = null
    const apiKey = getApiKey()
    if (!apiKey) {
      error.value = 'API key not set.'
      loading.value = false
      return
    }
    try {
      const res = await fetch(
        'https://api.finwiseapp.io/transaction-category-groups?pagination=%7B%22pageNumber%22:1,%22pageSize%22:10000%7D',
        {
          headers: {
            accept: 'application/json, text/plain, */*',
            authorization: apiKey,
          },
        },
      )
      if (!res.ok) throw new Error('Failed to fetch category groups')
      groups.value = await res.json()
    } catch (e: unknown) {
      if (e instanceof Error) {
        error.value = e.message
      } else {
        error.value = 'Unknown error'
      }
    } finally {
      loading.value = false
    }
  }

  return { groups, loading, error, fetchGroups }
})
