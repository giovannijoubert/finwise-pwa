<template>
  <div class="min-h-screen">
    <div class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div v-if="apiKeyMissing" class="flex flex-col items-center justify-center min-h-screen">
        <div
          class="bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 w-full max-w-md flex flex-col items-center"
        >
          <h2 class="text-xl font-semibold mb-4">Enter your API Key</h2>
          <input
            v-model="apiKeyInput"
            type="text"
            placeholder="Paste your API key here"
            class="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            @click="saveApiKey"
            class="w-full bg-emerald-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors"
          >
            Save API Key
          </button>
        </div>
      </div>
      <div v-else>
        <div class="max-w-3xl mx-auto px-4 py-6">
          <header class="mb-6 flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-semibold">Budget Overview</h1>
              <p class="text-sm text-gray-500 mt-1">Track your income and expenses</p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="refreshAll"
                class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Refresh"
              >
                <ArrowPathIcon :class="['w-6 h-6', isRefreshing ? 'animate-spin text-emerald-500' : 'text-gray-500 dark:text-gray-300']" />
              </button>
              <button
                @click="showConfig = true"
                class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                aria-label="Settings"
              >
                <Cog6ToothIcon class="w-6 h-6 text-gray-500 dark:text-gray-300" />
              </button>
            </div>
          </header>
          <!-- Config Modal -->
          <SettingsModal
            v-model="showConfig"
            v-model:darkMode="darkMode"
            v-model:includeCollapsed="includeCollapsed"
            @toggle-dark-mode="toggleDarkMode"
          />

          <transition name="fade">
            <div v-if="isRefreshing" class="flex items-center justify-center py-2">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
              <span class="ml-2 text-emerald-500 text-sm">Refreshing...</span>
            </div>
          </transition>

          <div
            v-if="store.loading || budgetsStore.loading || transactionsStore.loading"
            class="flex items-center justify-center py-12"
          >
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
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
            <div
              v-if="store.categories.length === 0"
              class="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm"
            >
              <p class="text-gray-500">No categories found</p>
            </div>
            <div v-else class="space-y-6">
              <!-- Income Section -->
              <div>
                <button
                  @click="showIncome = !showIncome"
                  class="flex items-center w-full mb-2 group"
                >
                  <span class="text-lg font-medium text-gray-900 dark:text-gray-200 mr-2">Income</span>
                  <svg
                    :class="showIncome ? 'rotate-90' : ''"
                    class="w-4 h-4 text-gray-500 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <transition name="fade">
                  <div
                    v-show="
                      showIncome &&
                      (groupedIncomeCategories.ungrouped.length > 0 ||
                        Object.keys(groupedIncomeCategories.grouped).length > 0)
                    "
                    class="space-y-3"
                  >
                  
                    <!-- Ungrouped Income Categories -->
                    <div
                      v-for="category in groupedIncomeCategories.ungrouped"
                      :key="category.id"
                      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                    >
                      <button
                        class="w-full flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        @click="openCategoryModal(category)"
                      >
                        <span class="text-2xl mr-4">{{ category.emoji }}</span>
                        <div class="flex-1 text-left">
                          <h3 class="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            {{ category.name }}
                          </h3>
                          <div class="mt-2">
                            <div
                              class="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
                            >
                              <div
                                class="absolute inset-y-0 left-0 rounded-full transition-all duration-300 bg-emerald-500"
                                :style="{
                                  width: `${getProgressPercentage(category.id, 'income')}%`,
                                }"
                              ></div>
                            </div>
                            <div class="flex items-center justify-between mt-1">
                              <div class="text-left">
                                <div class="text-lg font-medium text-gray-900 dark:text-gray-100">
                                  {{ getCategoryIncome(category.id) }}
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-300">
                                  Expected: {{ getCategoryBudget(category.id, 'income') }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <svg
                          class="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Stat Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col items-center">
                  <div class="text-xs text-gray-500 mb-1">Total Budgeted</div>
                  <div class="text-2xl font-semibold">{{ formatCurrency(totalBudgeted) }}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col items-center">
                  <div class="text-xs text-gray-500 mb-1">Total Spent</div>
                  <div class="text-2xl font-semibold">{{ formatCurrency(totalSpent) }}</div>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-col items-center">
                  <div class="text-xs text-gray-500 mb-1">Total Available</div>
                  <div class="text-2xl font-semibold">{{ formatCurrency(totalAvailableFromBudget) }}</div>
                </div>
              </div>
              <!-- Hidden groups chip row -->
              <div v-if="hiddenGroups.length > 0" class="mb-4 flex flex-wrap gap-2 items-center">
                <span class="text-xs text-gray-500 mr-2">Hidden groups:</span>
                <span v-for="groupId in hiddenGroups" :key="groupId" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {{ categoryGroupsStore.groups.find(g => g.id === groupId)?.name || 'Unknown' }}
                  <button class="ml-1 p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" @click="unhideGroup(groupId)" title="Show group">
                    <EyeIcon class="w-4 h-4 text-gray-500" />
                  </button>
                </span>
              </div>

              <!-- Budget Section -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <button
                    @click="showBudget = !showBudget"
                    class="flex items-center group"
                  >
                    <span class="text-lg font-medium text-gray-900 dark:text-gray-200 mr-2">Budget</span>
                    <svg
                      :class="showBudget ? 'rotate-90' : ''"
                      class="w-4 h-4 text-gray-500 dark:text-gray-300 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <div class="relative w-64">
                    <input
                      v-model="budgetSearch"
                      type="text"
                      placeholder="Search categories..."
                      class="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <svg
                      v-if="budgetSearch"
                      @click="budgetSearch = ''"
                      class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
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
                  </div>
                </div>
                <transition name="fade">
                  <div
                    v-show="
                      showBudget &&
                      (groupedBudgetCategories.ungrouped.length > 0 ||
                        Object.keys(groupedBudgetCategories.grouped).length > 0)
                    "
                  >
                    <!-- Grouped Budget Categories -->
                    <div v-for="group in categoryGroupsStore.groups" :key="group.id">
                      <template
                        v-if="
                          groupedBudgetCategories.grouped[group.id] &&
                          groupedBudgetCategories.grouped[group.id].length > 0
                        "
                      >
                       
                        <transition name="fade">
                          <div v-show="!budgetGroupCollapse[group.id]" class="space-y-3 ">
                            <div
                              v-for="category in groupedBudgetCategories.grouped[group.id]"
                              :key="category.id"
                              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                            >
                              <button
                                class="w-full flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                @click="openCategoryModal(category)"
                              >
                                <span class="text-2xl mr-4">{{ category.emoji }}</span>
                                <div class="flex-1 text-left">
                                  <h3 class="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                    {{ category.name }}
                                    <span v-if="category.transactionCategoryGroupId" class="ml-auto opacity-50 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 relative group">
                                      {{ categoryGroupsStore.groups.find(g => g.id === category.transactionCategoryGroupId)?.name }}
                                      <button
                                        v-if="groupedBudgetCategories.grouped[category.transactionCategoryGroupId]"
                                        class="ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                                        @click.stop="hideGroup(category.transactionCategoryGroupId)"
                                        title="Hide group"
                                      >
                                        <EyeSlashIcon class="w-4 h-4 text-gray-500" />
                                      </button>
                                    </span>
                                  </h3>
                                  <div class="mt-2">
                                    <div
                                      class="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
                                    >
                                      <div
                                        class="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                                        :class="getProgressBarClass(category.id)"
                                        :style="{
                                          width: `${getProgressPercentage(category.id, 'expense')}%`,
                                        }"
                                      ></div>
                                      <div
                                        v-if="isOverBudget(category.id)"
                                        class="absolute inset-y-0 left-0 rounded-full bg-red-500/30"
                                        :style="{
                                          width: `${getOverBudgetPercentage(category.id)}%`,
                                        }"
                                      ></div>
                                    </div>
                                    <div class="flex items-center justify-between mt-1">
                                      <div class="text-left">
                                        <div
                                          class="text-lg font-medium"
                                          :class="isOverBudget(category.id) ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'"
                                        >
                                          {{ getCategoryRemainderExpense(category.id) }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-300">
                                          Budget: {{ getCategoryBudget(category.id, 'expense') }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-300">
                                          Spent: {{ getCategoryExpense(category.id) }}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <svg
                                  class="w-5 h-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </transition>
                      </template>
                    </div>
                    <!-- Ungrouped Budget Categories -->
                    <div
                      v-for="category in groupedBudgetCategories.ungrouped"
                      :key="category.id"
                      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden my-3"
                    >
                      <button
                        class="w-full flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        @click="openCategoryModal(category)"
                      >
                        <span class="text-2xl mr-4">{{ category.emoji }}</span>
                        <div class="flex-1 text-left">
                          <h3 class="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            {{ category.name }} 
                            <span v-if="category.transactionCategoryGroupId" class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 relative group">
                              {{ categoryGroupsStore.groups.find(g => g.id === category.transactionCategoryGroupId)?.name }}
                              <button
                                v-if="groupedBudgetCategories.grouped[category.transactionCategoryGroupId]?.[0]?.id === category.id"
                                class="ml-1 p-0.5 rounded hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors invisible group-hover:visible"
                                @click.stop="hideGroup(category.transactionCategoryGroupId)"
                                title="Hide group"
                              >
                                <EyeSlashIcon class="w-4 h-4 text-emerald-500" />
                              </button>
                            </span>
                          </h3>
                          <div class="mt-2">
                            <div class="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                class="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                                :class="getProgressBarClass(category.id)"
                                :style="{
                                  width: `${getProgressPercentage(category.id, 'expense')}%`,
                                }"
                              ></div>
                              <div
                                v-if="isOverBudget(category.id)"
                                class="absolute inset-y-0 left-0 rounded-full bg-red-500/30"
                                :style="{ width: `${getOverBudgetPercentage(category.id)}%` }"
                              ></div>
                            </div>
                            <div class="flex items-center justify-between mt-1">
                              <div class="text-left">
                                <div
                                  class="text-lg font-medium"
                                  :class="isOverBudget(category.id) ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'"
                                >
                                  {{ getCategoryRemainderExpense(category.id) }}
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-300">
                                  Budget: {{ getCategoryBudget(category.id, 'expense') }}
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-300">
                                  Spent: {{ getCategoryExpense(category.id) }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <svg
                          class="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <TransactionModal
          v-model="showModal"
          :category="selectedCategory"
          :transactions="selectedCategoryTransactions"
          @refresh="refreshAll"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import {
  useTransactionCategoriesStore,
} from '@/stores/transactionCategories'
import type { TransactionCategory } from '@/stores/transactionCategories'
import { useCategoryBudgetsStore } from '@/stores/categoryBudgets'
import { useTransactionsStore, type Transaction } from '@/stores/transactions'
import { useTransactionCategoryGroupsStore } from '@/stores/transactionCategoryGroups'
import TransactionModal from '@/components/TransactionModal.vue'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'
import SettingsModal from '@/components/SettingsModal.vue'
import { EyeIcon, EyeSlashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

defineOptions({
  name: 'HomeView',
})

const store = useTransactionCategoriesStore()
const budgetsStore = useCategoryBudgetsStore()
const transactionsStore = useTransactionsStore()
const categoryGroupsStore = useTransactionCategoryGroupsStore()

const showModal = ref(false)
const selectedCategory = ref<{ id: string; name: string } | null>(null)
const selectedCategoryTransactions = ref<Transaction[]>([])
const apiKey = ref<string | null>(null)
const apiKeyInput = ref('')
const apiKeyMissing = ref(false)
const showIncome = ref(false) // collapsed by default
const showBudget = ref(true) // expanded by default
const showConfig = ref(false)
const theme = ref('light')
const darkMode = ref(false)
const includeCollapsed = ref(true)

// State for group collapses (collapsed by default)
const incomeGroupCollapse = ref<Record<string, boolean>>({})
const budgetGroupCollapse = ref<Record<string, boolean>>({})

// Replace hiddenCategories with hiddenGroups
const hiddenGroups = ref<string[]>([])

const isRefreshing = ref(false)

const budgetSearch = ref('')

// Debug store state changes
watch(
  () => store.categories,
  (newCategories) => {
    console.log('Categories changed in component:', newCategories)
  },
  { deep: true },
)

watch(
  () => budgetsStore.budgets,
  (newBudgets) => {
    console.log('Budgets changed in component:', newBudgets)
  },
  { deep: true },
)

watch(
  () => transactionsStore.transactions,
  (newTransactions) => {
    console.log('Transactions changed in component:', newTransactions)
  },
  { deep: true },
)

const getIncomeCategories = computed(() => {
  return store.categories
    .filter((category) => transactionsStore.getTotalIncomeForCategory(category.id) > 0)
    .sort((a, b) => {
      const receivedA = transactionsStore.getTotalIncomeForCategory(a.id)
      const receivedB = transactionsStore.getTotalIncomeForCategory(b.id)
      if (receivedB !== receivedA) {
        return receivedB - receivedA // Sort by received value high to low
      }
      // If received values are equal, categories with a budget come first
      const budgetA = budgetsStore.budgets.find((budget) => budget.transactionCategoryId === a.id)
      const budgetB = budgetsStore.budgets.find((budget) => budget.transactionCategoryId === b.id)
      if (budgetA && !budgetB) return -1
      if (!budgetA && budgetB) return 1
      return 0
    })
})

const getExpenseCategories = computed(() => {
  return store.categories
    .filter((category) => {
      const hasTransactions = transactionsStore.getTotalExpenseForCategory(category.id) > 0
      const matchesSearch = !budgetSearch.value || 
        category.name.toLowerCase().includes(budgetSearch.value.toLowerCase())
      return hasTransactions && matchesSearch
    })
    .sort((a, b) => {
      const budgetA = budgetsStore.budgets.find((budget) => budget.transactionCategoryId === a.id)
      const budgetB = budgetsStore.budgets.find((budget) => budget.transactionCategoryId === b.id)
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

// Helper to determine if a category should be included in tally
function isCategoryIncluded(category: TransactionCategory, mode: 'income' | 'expense'): boolean {
  if (includeCollapsed.value) return true;
  // Only check for grouped categories
  const groupId = category.transactionCategoryGroupId;
  if (!groupId) return true;
  // Exclude if group is hidden
  if (isGroupHidden(groupId)) return false;
  if (mode === 'income') {
    return !incomeGroupCollapse.value[groupId];
  } else {
    return !budgetGroupCollapse.value[groupId];
  }
}

const totalBudgeted = computed(() => {
  // Only sum budgets for categories that are included
  const includedCategoryIds = store.categories.filter(c => isCategoryIncluded(c, 'expense')).map(c => c.id)
  return budgetsStore.budgets
    .filter((b) => b.transactionType === 'debit' && includedCategoryIds.includes(b.transactionCategoryId))
    .reduce((sum, b) => sum + b.amount.amount, 0)
})

const totalSpent = computed(() => {
  return store.categories
    .filter((c) => isCategoryIncluded(c, 'expense'))
    .reduce((sum, category) => sum + transactionsStore.getTotalExpenseForCategory(category.id), 0)
})

const totalAvailableFromBudget = computed(() => {
  // Only sum budgets and spent for included categories
  const includedCategoryIds = store.categories.filter(c => isCategoryIncluded(c, 'expense')).map(c => c.id)
  const totalBudget = budgetsStore.budgets
    .filter((b) => b.transactionType === 'debit' && includedCategoryIds.includes(b.transactionCategoryId))
    .reduce((sum, b) => sum + b.amount.amount, 0)
  const totalSpent = store.categories
    .filter((c) => isCategoryIncluded(c, 'expense'))
    .reduce((sum, category) => sum + transactionsStore.getTotalExpenseForCategory(category.id), 0)
  return totalBudget - totalSpent
})

function formatCurrency(amount: number): string {
  const prefix = amount < 0 ? '-R' : 'R'
  return `${prefix}${Math.abs(amount).toLocaleString()}`
}

function getCategoryBudget(categoryId: string, mode: 'income' | 'expense'): string {
  const type = mode === 'income' ? 'credit' : 'debit'
  const budget = budgetsStore.budgets.find(
    (b) => b.transactionCategoryId === categoryId && b.transactionType === type,
  )
  const spent = Math.abs(transactionsStore.getTotalSpentForCategory(categoryId))
  if (!budget && spent > 0) return formatCurrency(0)
  if (!budget) return 'No budget'
  return formatCurrency(budget.amount.amount)
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

function getCategoryRemainderExpense(categoryId: string): string {
  // Only use expense budget (debit) and actual expenses
  const budget = budgetsStore.budgets.find(
    (b) => b.transactionCategoryId === categoryId && b.transactionType === 'debit',
  )
  const spent = transactionsStore.getTotalExpenseForCategory(categoryId)
  if (!budget && spent > 0) return formatCurrency(-spent)
  if (!budget) return 'No budget'
  const remainder = budget.amount.amount - spent
  return formatCurrency(remainder)
}

function isOverBudget(categoryId: string): boolean {
  const spent = Math.abs(transactionsStore.getTotalSpentForCategory(categoryId))
  const budget = budgetsStore.budgets.find((b) => b.transactionCategoryId === categoryId)
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
  const budget = budgetsStore.budgets.find((b) => b.transactionCategoryId === categoryId)
  if (!budget) {
    // If there are transactions but no budget, show full bar
    return value > 0 ? 100 : 0
  }
  return Math.min((value / budget.amount.amount) * 100, 100)
}

function getOverBudgetPercentage(categoryId: string): number {
  const spent = Math.abs(transactionsStore.getTotalSpentForCategory(categoryId))
  const budget = budgetsStore.budgets.find((b) => b.transactionCategoryId === categoryId)
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

// Grouped categories for Income
const groupedIncomeCategories = computed(() => {
  const grouped: Record<string, TransactionCategory[]> = {}
  const ungrouped: TransactionCategory[] = []
  getIncomeCategories.value.forEach((category) => {
    if (isCategoryHidden(category)) return
    if (category.transactionCategoryGroupId) {
      if (!grouped[category.transactionCategoryGroupId])
        grouped[category.transactionCategoryGroupId] = []
      grouped[category.transactionCategoryGroupId].push(category)
    } else {
      ungrouped.push(category)
    }
  })
  return { grouped, ungrouped }
})

// Grouped categories for Budget
const groupedBudgetCategories = computed(() => {
  const grouped: Record<string, TransactionCategory[]> = {}
  const ungrouped: TransactionCategory[] = []
  getExpenseCategories.value.forEach((category) => {
    if (isCategoryHidden(category)) return
    if (category.transactionCategoryGroupId) {
      if (!grouped[category.transactionCategoryGroupId])
        grouped[category.transactionCategoryGroupId] = []
      grouped[category.transactionCategoryGroupId].push(category)
    } else {
      ungrouped.push(category)
    }
  })
  return { grouped, ungrouped }
})

function applyTheme(newTheme: string) {
  if (typeof window !== 'undefined') {
    const html = document.documentElement
    if (newTheme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
}

function toggleDarkMode() {
  theme.value = darkMode.value ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
  applyTheme(theme.value)
}

watch(theme, (newTheme) => {
  applyTheme(newTheme)
})

onMounted(() => {
  apiKey.value = localStorage.getItem('api_key')
  apiKeyMissing.value = !apiKey.value ? true : false
  if (!apiKeyMissing.value) {
    // Get first day of current month in UTC
    const now = new Date()
    const firstDayOfMonthUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const dateString = firstDayOfMonthUTC.toISOString()
    store.fetchCategories()
    budgetsStore.fetchBudgets(dateString)
    transactionsStore.fetchTransactions()
    categoryGroupsStore.fetchGroups()
  }
  // Load theme from localStorage
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme === 'dark') {
    theme.value = 'dark'
    darkMode.value = true
  } else {
    theme.value = 'light'
    darkMode.value = false
  }
  applyTheme(theme.value)
  // Persist includeCollapsed in localStorage
  const storedIncludeCollapsed = localStorage.getItem('includeCollapsed')
  if (storedIncludeCollapsed !== null) {
    includeCollapsed.value = storedIncludeCollapsed === 'true'
  }
  // On mount, load hidden groups from localStorage
  const storedHiddenGroups = localStorage.getItem('hiddenGroups')
  if (storedHiddenGroups) {
    try {
      hiddenGroups.value = JSON.parse(storedHiddenGroups)
    } catch {}
  }
  // Attach pull-to-refresh listeners for mobile
  const scrollableEl = document.querySelector('.min-h-screen')
  if (scrollableEl) {
    scrollableEl.addEventListener('touchstart', (e) => {
      if (e instanceof TouchEvent) onTouchStart(e)
    }, { passive: true })
    scrollableEl.addEventListener('touchmove', (e) => {
      if (e instanceof TouchEvent) onTouchMove(e)
    }, { passive: true })
    scrollableEl.addEventListener('touchend', (e) => {
      if (e instanceof TouchEvent) onTouchEnd()
    }, { passive: true })
  }
})

watch(includeCollapsed, (val) => {
  localStorage.setItem('includeCollapsed', val ? 'true' : 'false')
})

function saveApiKey() {
  if (apiKeyInput.value.trim()) {
    localStorage.setItem('api_key', apiKeyInput.value.trim())
    apiKey.value = apiKeyInput.value.trim()
    apiKeyMissing.value = false
    window.location.reload()
  }
}

// Watch for changes to hiddenGroups and persist
watch(hiddenGroups, (val) => {
  localStorage.setItem('hiddenGroups', JSON.stringify(val))
}, { deep: true })

// Helper to hide/unhide groups
function hideGroup(groupId: string) {
  if (!hiddenGroups.value.includes(groupId)) {
    hiddenGroups.value.push(groupId)
  }
}
function unhideGroup(groupId: string) {
  hiddenGroups.value = hiddenGroups.value.filter(id => id !== groupId)
}
function isGroupHidden(groupId: string): boolean {
  return hiddenGroups.value.includes(groupId)
}

// Helper to check if a category is in a hidden group
function isCategoryHidden(category: TransactionCategory): boolean {
  return !!category.transactionCategoryGroupId && isGroupHidden(category.transactionCategoryGroupId)
}

function refreshAll() {
  isRefreshing.value = true
  const now = new Date()
  const firstDayOfMonthUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const dateString = firstDayOfMonthUTC.toISOString()
  Promise.all([
    store.fetchCategories(),
    budgetsStore.fetchBudgets(dateString),
    transactionsStore.fetchTransactions(),
    categoryGroupsStore.fetchGroups(),
  ]).finally(() => {
    setTimeout(() => { isRefreshing.value = false }, 500) // show spinner for at least 0.5s
  })
}

// Pull-to-refresh logic for mobile
let startY = 0
let pulling = false

function onTouchStart(e: TouchEvent) {
  if (window.scrollY === 0) {
    startY = e.touches[0].clientY
    pulling = true
  }
}
function onTouchMove(e: TouchEvent) {
  if (!pulling) return
  const currentY = e.touches[0].clientY
  if (currentY - startY > 60 && !isRefreshing.value) {
    pulling = false
    refreshAll()
  }
}
function onTouchEnd() {
  pulling = false
}
</script>

