import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Amount {
  amount: number
  currencyCode: string
}

interface CategoryBudget {
  id: string
  createdAt: string
  updatedAt: string
  amount: Amount
  transactionCategoryId: string
  userId: string
  appliesFromBudgetPeriod: string
  transactionType: string
  appliesToBudgetPeriod: string | null
  transactionCategoryGroupId: string | null
}

export const useCategoryBudgetsStore = defineStore('categoryBudgets', () => {
  const budgets = ref<CategoryBudget[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getApiKey(): string | null {
    return localStorage.getItem('api_key')
  }

  async function fetchBudgets(date: string) {
    loading.value = true
    error.value = null

    const apiKey = getApiKey()
    if (!apiKey) {
      error.value = 'API key not set.'
      loading.value = false
      return
    }

    try {
      console.log('Fetching budgets...')
      const filters = encodeURIComponent(JSON.stringify({ forDate: date }))
      const pagination = encodeURIComponent(JSON.stringify({ pageNumber: 1, pageSize: 10000 }))
      const url = `https://api.finwiseapp.io/category-budgets?filters=${filters}&pagination=${pagination}`

      const response = await fetch(url, {
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
      budgets.value = data
      console.log('Store budgets after update:', budgets.value)
    } catch (e) {
      console.error('Error fetching budgets:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred while fetching budgets'
    } finally {
      loading.value = false
    }
  }

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
  }
})
