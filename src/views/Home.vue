<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="apiKeyMissing" class="flex flex-col items-center justify-center min-h-screen">
      <div class="bg-white rounded-xl shadow-md p-8 w-full max-w-md flex flex-col items-center">
        <h2 class="text-xl font-semibold mb-4 text-gray-900">Enter your API Key</h2>
        <input
          v-model="apiKeyInput"
          type="text"
          placeholder="Paste your API key here"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="saveApiKey"
          class="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition-colors"
        >
          Save API Key
        </button>
      </div>
    </div>
    <div v-else>
      <div class="max-w-3xl mx-auto px-4 py-6">
        <header class="mb-6">
          <h1 class="text-2xl font-semibold text-gray-900">Budget Overview</h1>
          <p class="text-sm text-gray-500 mt-1">Track your income and expenses</p>
        </header>

        <div v-if="store.loading || budgetsStore.loading || transactionsStore.loading" 
             class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>

        <div v-else-if="store.error" class="bg-red-50 p-4 rounded-lg">
          <p class="text-red-600">{{ store.error }}</p>
        </div>
        <div v-else-if="budgetsStore.error" class="bg-red-50 p-4 rounded-lg">
          <p class="text-red-600">{{ budgetsStore.error }}</p>
        </div>
        <div v-else-if="transactionsStore.error" class="bg-red-50 p-4 rounded-lg">
          <p class="text-red-600">{{ transactionsStore.error }}</p>
        </div>
        <div v-else>
          <div v-if="store.categories.length === 0" 
               class="text-center py-12 bg-white rounded-xl shadow-sm">
            <p class="text-gray-500">No categories found</p>
          </div>
          <div v-else class="space-y-6">
            <!-- Income Section -->
            <div v-if="getIncomeCategories.length > 0">
              <h2 class="text-lg font-medium text-gray-900 mb-3">Income</h2>
              <div class="space-y-3">
                <div v-for="category in getIncomeCategories" 
                     :key="category.id" 
                     class="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button 
                    class="w-full flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    @click="openCategoryModal(category)"
                  >
                    <span class="text-2xl mr-4">{{ category.emoji }}</span>
                    <div class="flex-1 text-left">
                      <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
                      <div class="mt-2">
                        <div class="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            class="absolute inset-y-0 left-0 rounded-full transition-all duration-300 bg-emerald-500"
                            :style="{ width: `${getProgressPercentage(category.id, 'income')}%` }"
                          ></div>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                          <div class="text-left">
                            <div class="text-lg font-medium text-gray-900">
                              {{ getCategoryIncome(category.id) }}
                            </div>
                            <div class="text-xs text-gray-500">
                              Expected: {{ getCategoryBudget(category.id, 'income') }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Budget Section -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div class="text-xs text-gray-500 mb-1">Total Budgeted</div>
                <div class="text-2xl font-semibold text-gray-900">{{ formatCurrency(totalBudgeted) }}</div>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div class="text-xs text-gray-500 mb-1">Total Spent</div>
                <div class="text-2xl font-semibold text-gray-900">{{ formatCurrency(totalSpent) }}</div>
              </div>
              <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div class="text-xs text-gray-500 mb-1">Total Available</div>
                <div class="text-2xl font-semibold text-gray-900">{{ formatCurrency(totalAvailableFromBudget) }}</div>
              </div>
            </div>

            <div v-if="getExpenseCategories.length > 0">
              <h2 class="text-lg font-medium text-gray-900 mb-3">Budget</h2>
              <div class="space-y-3">
                <div v-for="category in getExpenseCategories" 
                     :key="category.id" 
                     class="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button 
                    class="w-full flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    @click="openCategoryModal(category)"
                  >
                    <span class="text-2xl mr-4">{{ category.emoji }}</span>
                    <div class="flex-1 text-left">
                      <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
                      <div class="mt-2">
                        <div class="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            class="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                            :class="getProgressBarClass(category.id)"
                            :style="{ width: `${getProgressPercentage(category.id, 'expense')}%` }"
                          ></div>
                          <div 
                            v-if="isOverBudget(category.id)"
                            class="absolute inset-y-0 left-0 rounded-full bg-red-500/30"
                            :style="{ width: `${getOverBudgetPercentage(category.id)}%` }"
                          ></div>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                          <div class="text-left">
                            <div class="text-lg font-medium" :class="isOverBudget(category.id) ? 'text-red-500' : 'text-gray-900'">
                              {{ getCategoryRemainderExpense(category.id) }}
                            </div>
                            <div class="text-xs text-gray-500">
                              Budget: {{ getCategoryBudget(category.id, 'expense') }}
                            </div>
                            <div class="text-xs text-gray-500">
                              Spent: {{ getCategoryExpense(category.id) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionModal
        v-model="showModal"
        :category="selectedCategory"
        :transactions="selectedCategoryTransactions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useTransactionCategoriesStore } from '@/stores/transactionCategories'
import { useCategoryBudgetsStore } from '@/stores/categoryBudgets'
import { useTransactionsStore, type Transaction } from '@/stores/transactions'
import TransactionModal from '@/components/TransactionModal.vue'

defineOptions({
  name: 'HomeView'
})

const store = useTransactionCategoriesStore()
const budgetsStore = useCategoryBudgetsStore()
const transactionsStore = useTransactionsStore()

const showModal = ref(false)
const selectedCategory = ref<{ id: string; name: string } | null>(null)
const selectedCategoryTransactions = ref<Transaction[]>([])
const apiKey = ref<string | null>(null)
const apiKeyInput = ref('')
const apiKeyMissing = ref(false)

// Debug store state changes
watch(() => store.categories, (newCategories) => {
  console.log('Categories changed in component:', newCategories)
}, { deep: true })

watch(() => budgetsStore.budgets, (newBudgets) => {
  console.log('Budgets changed in component:', newBudgets)
}, { deep: true })

watch(() => transactionsStore.transactions, (newTransactions) => {
  console.log('Transactions changed in component:', newTransactions)
}, { deep: true })

const getIncomeCategories = computed(() => {
  return store.categories
    .filter(category => transactionsStore.getTotalIncomeForCategory(category.id) > 0)
    .sort((a, b) => {
      const receivedA = transactionsStore.getTotalIncomeForCategory(a.id)
      const receivedB = transactionsStore.getTotalIncomeForCategory(b.id)
      if (receivedB !== receivedA) {
        return receivedB - receivedA // Sort by received value high to low
      }
      // If received values are equal, categories with a budget come first
      const budgetA = budgetsStore.budgets.find(budget => budget.transactionCategoryId === a.id)
      const budgetB = budgetsStore.budgets.find(budget => budget.transactionCategoryId === b.id)
      if (budgetA && !budgetB) return -1
      if (!budgetA && budgetB) return 1
      return 0
    })
})

const getExpenseCategories = computed(() => {
  return store.categories
    .filter(category => transactionsStore.getTotalExpenseForCategory(category.id) > 0)
    .sort((a, b) => {
      const budgetA = budgetsStore.budgets.find(budget => budget.transactionCategoryId === a.id)
      const budgetB = budgetsStore.budgets.find(budget => budget.transactionCategoryId === b.id)
      const spentA = transactionsStore.getTotalExpenseForCategory(a.id)
      const spentB = transactionsStore.getTotalExpenseForCategory(b.id)

      // Both have budget: sort by available amount
      if (budgetA && budgetB) {
        const availableA = budgetA.amount.amount - spentA
        const availableB = budgetB.amount.amount - spentB
        return availableB - availableA
      }
      // Only A has budget
      if (budgetA && !budgetB) return -1
      // Only B has budget
      if (!budgetA && budgetB) return 1

      // Neither has budget: sort by remainder (which is -spent), most negative to least negative
      if (spentA > 0 && spentB > 0) {
        const remainderA = -spentA
        const remainderB = -spentB
        return remainderB - remainderA // most negative to least negative
      }
      // Only A has spent
      if (spentA > 0 && spentB === 0) return -1
      // Only B has spent
      if (spentA === 0 && spentB > 0) return 1
      // Neither has spent
      return 0
    })
})

const totalAvailableFromBudget = computed(() => {
  // Sum all expense budgets (transactionType: 'debit')
  const totalBudget = budgetsStore.budgets
    .filter(b => b.transactionType === 'debit')
    .reduce((sum, b) => sum + b.amount.amount, 0)
  // Sum all actual expenses (only negative transactions, as positive values)
  const totalSpent = store.categories
    .reduce((sum, category) => sum + transactionsStore.getTotalExpenseForCategory(category.id), 0)
  return totalBudget - totalSpent
})

const totalBudgeted = computed(() => {
  return budgetsStore.budgets
    .filter(b => b.transactionType === 'debit')
    .reduce((sum, b) => sum + b.amount.amount, 0)
})

const totalSpent = computed(() => {
  return store.categories
    .reduce((sum, category) => sum + transactionsStore.getTotalExpenseForCategory(category.id), 0)
})

function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? '-R' : 'R'
  return `${prefix}${Math.abs(amount).toLocaleString()}`
}

function getCategoryBudget(categoryId: string, mode: 'income' | 'expense'): string {
  const type = mode === 'income' ? 'credit' : 'debit'
  const budget = budgetsStore.budgets.find(b => b.transactionCategoryId === categoryId && b.transactionType === type)
  const spent = Math.abs(transactionsStore.getTotalSpentForCategory(categoryId))
  if (!budget && spent > 0) return formatCurrency(0)
  if (!budget) return 'No budget'
  return formatCurrency(budget.amount.amount)
}

function getCategorySpent(categoryId: string): string {
  const spent = Math.abs(transactionsStore.getTotalSpentForCategory(categoryId))
  const budget = budgetsStore.budgets.find(b => b.transactionCategoryId === categoryId)
  if (!budget && spent === 0) return 'No budget'
  return formatCurrency(spent)
}

function getCategoryIncome(categoryId: string): string {
  const income = transactionsStore.getTotalIncomeForCategory(categoryId)
  if (income === 0) return 'No income'
  return formatCurrency(income)
}

function getCategoryExpense(categoryId: string): string {
  const expense = transactionsStore.getTotalExpenseForCategory(categoryId)
  if (expense === 0) return 'No expense'
  return formatCurrency(expense)
}

function getCategoryRemainder(categoryId: string): string {
  const spent = Math.abs(transactionsStore.getTotalSpentForCategory(categoryId))
  const budget = budgetsStore.budgets.find(b => b.transactionCategoryId === categoryId)
  if (!budget && spent > 0) return formatCurrency(-spent)
  if (!budget) return 'No budget'
  const remainder = budget.amount.amount - spent
  return formatCurrency(remainder)
}

function getCategoryRemainderExpense(categoryId: string): string {
  // Only use expense budget (debit) and actual expenses
  const budget = budgetsStore.budgets.find(b => b.transactionCategoryId === categoryId && b.transactionType === 'debit')
  const spent = transactionsStore.getTotalExpenseForCategory(categoryId)
  if (!budget && spent > 0) return formatCurrency(-spent)
  if (!budget) return 'No budget'
  const remainder = budget.amount.amount - spent
  return formatCurrency(remainder)
}

function isOverBudget(categoryId: string): boolean {
  const spent = Math.abs(transactionsStore.getTotalSpentForCategory(categoryId))
  const budget = budgetsStore.budgets.find(b => b.transactionCategoryId === categoryId)
  if (!budget && spent > 0) return true
  if (!budget) return false
  return spent > budget.amount.amount
}

function getProgressPercentage(categoryId: string, mode: 'income' | 'expense'): number {
  let value = 0
  if (mode === 'income') {
    value = transactionsStore.getTotalIncomeForCategory(categoryId)
  } else {
    value = transactionsStore.getTotalExpenseForCategory(categoryId)
  }
  const budget = budgetsStore.budgets.find(b => b.transactionCategoryId === categoryId)
  if (!budget) {
    // If there are transactions but no budget, show full bar
    return value > 0 ? 100 : 0
  }
  return Math.min((value / budget.amount.amount) * 100, 100)
}

function getOverBudgetPercentage(categoryId: string): number {
  const spent = Math.abs(transactionsStore.getTotalSpentForCategory(categoryId))
  const budget = budgetsStore.budgets.find(b => b.transactionCategoryId === categoryId)
  if (!budget) return 0
  const overBudget = spent - budget.amount.amount
  if (overBudget <= 0) return 0
  return Math.min((overBudget / budget.amount.amount) * 100, 100)
}

function getProgressBarClass(categoryId: string): string {
  const percentage = getProgressPercentage(categoryId, 'expense')
  if (percentage >= 100) return 'bg-orange-500'
  if (percentage >= 90) return 'bg-yellow-500'
  return 'bg-emerald-500'
}

function openCategoryModal(category: { id: string; name: string }) {
  selectedCategory.value = category
  selectedCategoryTransactions.value = transactionsStore.getTransactionsForCategory(category.id)
  showModal.value = true
}

onMounted(() => {
  apiKey.value = localStorage.getItem('api_key')
  apiKeyMissing.value = !apiKey.value
  if (!apiKeyMissing.value) {
    // Get first day of current month in UTC
    const now = new Date()
    const firstDayOfMonthUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const dateString = firstDayOfMonthUTC.toISOString()
    store.fetchCategories()
    budgetsStore.fetchBudgets(dateString)
    transactionsStore.fetchTransactions()
  }
})

function saveApiKey() {
  if (apiKeyInput.value.trim()) {
    localStorage.setItem('api_key', apiKeyInput.value.trim())
    apiKey.value = apiKeyInput.value.trim()
    apiKeyMissing.value = false
    window.location.reload()
  }
}
</script>

