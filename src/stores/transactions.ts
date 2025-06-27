import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Amount {
  amount: number
  currencyCode: string
}

export interface Transaction {
  id: string
  createdAt: string
  updatedAt: string
  description: string
  originalDescription: string
  accountId: string
  amount: Amount
  date: string
  transactionCategoryId: string
  originalTransactionCategoryId: string | null
  merchantId: string
  originalMerchantId: string
  parentTransactionId: string | null
  splits: Record<string, unknown> | null
  isManual: boolean | null
  isTransfer: boolean
  notes: string | null
  userId: string
  archivedAt: string | null
  effectiveDate: string | null
  dataImportId: string | null
  needsReview: boolean
  isPending: boolean | null
  pendingTransactionId: string | null
  internalNotes: string | null
  originalAccountId: string
  goCardlessDetails: Record<string, unknown> | null
  transactionTags: Record<string, unknown>[]
  fileRecords: Record<string, unknown>[]
}

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function getApiKey(): string | null {
    return localStorage.getItem('api_key')
  }

  async function fetchTransactions() {
    loading.value = true
    error.value = null

    const apiKey = getApiKey()
    if (!apiKey) {
      error.value = 'API key not set.'
      loading.value = false
      return
    }

    try {
      console.log('Fetching transactions...')
      // Get date range from 27th of previous month to today
      const now = new Date()
      const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 59, 59, 999)
      const fromDate = new Date(
        now.getFullYear(),
        now.getMonth() - (now.getDate() >= 27 ? 0 : 1),
        26,
        22,
        0,
        0,
        0,
      )

      const filters = encodeURIComponent(
        JSON.stringify({
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          excludeExcludedTransactions: true,
          excludeParentTransactions: true,
          excludeTransfers: true,
          excludeArchived: true,
        }),
      )
      const pagination = encodeURIComponent(JSON.stringify({ pageSize: 2000, pageNumber: 1 }))
      const url = `https://api.finwiseapp.io/transactions?filters=${filters}&pagination=${pagination}`

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
      transactions.value = data
      console.log('Store transactions after update:', transactions.value)
    } catch (e) {
      console.error('Error fetching transactions:', e)
      error.value = e instanceof Error ? e.message : 'An error occurred while fetching transactions'
    } finally {
      loading.value = false
    }
  }

  function getTransactionsForCategory(categoryId: string): Transaction[] {
    return transactions.value.filter((t) => t.transactionCategoryId === categoryId)
  }

  function getTotalSpentForCategory(categoryId: string): number {
    return getTransactionsForCategory(categoryId).reduce(
      (total, transaction) => total + transaction.amount.amount,
      0,
    )
  }

  function getTotalIncomeForCategory(categoryId: string): number {
    return getTransactionsForCategory(categoryId)
      .filter((transaction) => transaction.amount.amount > 0)
      .reduce((total, transaction) => total + transaction.amount.amount, 0)
  }

  function getTotalExpenseForCategory(categoryId: string): number {
    // Return as positive value for display
    return Math.abs(
      getTransactionsForCategory(categoryId)
        .filter((transaction) => transaction.amount.amount < 0)
        .reduce((total, transaction) => total + transaction.amount.amount, 0),
    )
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    getTransactionsForCategory,
    getTotalSpentForCategory,
    getTotalIncomeForCategory,
    getTotalExpenseForCategory,
  }
})
