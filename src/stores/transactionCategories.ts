import { ref } from 'vue'
import { defineStore } from 'pinia'

interface TransactionCategory {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  userId: string
  transactionCategoryGroupId: string | null
  color: string | null
  emoji: string | null
  markTransactionsAsTransfers: boolean | null
  excludeTransactionsFromBudget: boolean | null
  consolidateInBudget: boolean | null
  enableRollover: boolean | null
  rolloverFromDate: string | null
}

export const useTransactionCategoriesStore = defineStore('transactionCategories', () => {
  const categories = ref<TransactionCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getApiKey(): string | null {
    return localStorage.getItem('api_key')
  }

  async function fetchCategories() {
    loading.value = true
    error.value = null

    const apiKey = getApiKey()
    if (!apiKey) {
      error.value = 'API key not set.'
      loading.value = false
      return
    }

    try {
      console.log('Fetching categories...')
      const response = await fetch('https://api.finwiseapp.io/transaction-categories', {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9',
          authorization: apiKey,
          'cache-control': 'no-cache',
          dnt: '1',
          origin: 'https://app.finwiseapp.io',
          pragma: 'no-cache',
          priority: 'u=1, i',
          referer: 'https://app.finwiseapp.io/',
          'sec-ch-ua': '"Not.A/Brand";v="99", "Chromium";v="136"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      categories.value = data
      console.log('Store categories after update:', categories.value)
    } catch (e) {
      console.error('Error fetching categories:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred while fetching categories'
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
  }
})
