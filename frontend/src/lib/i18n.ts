export type Locale = 'en' | 'zh';

export type TranslationKey =
  | 'nav.dashboard'
  | 'nav.transactions'
  | 'nav.categories'
  | 'nav.budgets'
  | 'shell.title'
  | 'shell.description'
  | 'shell.filters'
  | 'shell.userEmail'
  | 'shell.month'
  | 'dashboard.eyebrow'
  | 'dashboard.title'
  | 'dashboard.description'
  | 'dashboard.scope'
  | 'dashboard.user'
  | 'dashboard.status'
  | 'dashboard.status.loading'
  | 'dashboard.status.ready'
  | 'metric.income'
  | 'metric.expense'
  | 'metric.balance'
  | 'transactions.recent'
  | 'transactions.timeline'
  | 'transactions.empty'
  | 'transactions.uncategorized'
  | 'budgets.lanes'
  | 'budgets.planning'
  | 'budgets.wholeMonth'
  | 'budgets.empty'
  | 'transactions.create'
  | 'transactions.writeDb'
  | 'transactions.type'
  | 'transactions.type.expense'
  | 'transactions.type.income'
  | 'transactions.amount'
  | 'transactions.occurredOn'
  | 'transactions.category'
  | 'transactions.note'
  | 'transactions.note.placeholder'
  | 'transactions.categoryHint'
  | 'transactions.amountRequired'
  | 'transactions.createButton'
  | 'transactions.updateButton'
  | 'transactions.edit'
  | 'transactions.cancelEdit'
  | 'transactions.saving'
  | 'transactions.saved'
  | 'transactions.updated'
  | 'transactions.deleted'
  | 'transactions.list'
  | 'common.loading'
  | 'common.cancel'
  | 'common.delete'
  | 'categories.create'
  | 'categories.reusable'
  | 'categories.name'
  | 'categories.name.placeholder'
  | 'categories.helper'
  | 'categories.type'
  | 'categories.save'
  | 'categories.update'
  | 'categories.edit'
  | 'categories.cancelEdit'
  | 'categories.saved'
  | 'categories.updated'
  | 'categories.deleted'
  | 'categories.catalog'
  | 'categories.currentUser'
  | 'categories.empty'
  | 'budgets.writer'
  | 'budgets.categoryScope'
  | 'budgets.amount'
  | 'budgets.helper'
  | 'budgets.amountRequired'
  | 'budgets.save'
  | 'budgets.edit'
  | 'budgets.update'
  | 'budgets.cancelEdit'
  | 'budgets.saved'
  | 'budgets.deleted'
  | 'budgets.stored'
  | 'budgets.emptyMonth'
  | 'theme.dark'
  | 'theme.light'
  | 'theme.switch'
  | 'locale.switch'
  | 'status.failedTransaction'
  | 'status.failedCategory'
  | 'status.failedBudget';

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  'nav.dashboard': 'Dashboard',
  'nav.transactions': 'Transactions',
  'nav.categories': 'Categories',
  'nav.budgets': 'Budgets',
  'shell.title': 'Personal Money Cockpit',
  'shell.description': 'A lightweight workspace for income, expenses, category budgets, and monthly balance.',
  'shell.filters': 'Filters',
  'shell.userEmail': 'User Email',
  'shell.month': 'Month',
  'dashboard.eyebrow': 'Monthly Pulse',
  'dashboard.title': 'Keep your cash story visible',
  'dashboard.description':
    'This first-pass UI reads directly from your NestJS API. Use it to monitor your balance, review recent transactions, and shape category budgets before we move on to charts and auth.',
  'dashboard.scope': 'Active Scope',
  'dashboard.user': 'User',
  'dashboard.status': 'Status',
  'dashboard.status.loading': 'Syncing with API...',
  'dashboard.status.ready': 'Live data loaded',
  'metric.income': 'Income',
  'metric.expense': 'Expense',
  'metric.balance': 'Balance',
  'transactions.recent': 'Recent Transactions',
  'transactions.timeline': 'Timeline',
  'transactions.empty': 'No transactions found for this month yet.',
  'transactions.uncategorized': 'Uncategorized',
  'budgets.lanes': 'Budget Lanes',
  'budgets.planning': 'Planning',
  'budgets.wholeMonth': 'Whole month budget',
  'budgets.empty': 'No budgets stored for this month yet.',
  'transactions.create': 'Add Transaction',
  'transactions.writeDb': 'Write to PostgreSQL',
  'transactions.type': 'Type',
  'transactions.type.expense': 'Expense',
  'transactions.type.income': 'Income',
  'transactions.amount': 'Amount',
  'transactions.occurredOn': 'Occurred on',
  'transactions.category': 'Category',
  'transactions.note': 'Note',
  'transactions.note.placeholder': 'Lunch, salary, train...',
  'transactions.categoryHint': 'Create matching categories first if the selector is empty.',
  'transactions.amountRequired': 'Enter an amount greater than 0 before saving.',
  'transactions.createButton': 'Create Transaction',
  'transactions.updateButton': 'Update Transaction',
  'transactions.edit': 'Edit',
  'transactions.cancelEdit': 'Cancel edit',
  'transactions.saving': 'Saving...',
  'transactions.saved': 'Transaction saved.',
  'transactions.updated': 'Transaction updated.',
  'transactions.deleted': 'Transaction deleted.',
  'transactions.list': 'Transactions',
  'common.loading': 'Loading...',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'categories.create': 'Create Category',
  'categories.reusable': 'Reusable labels',
  'categories.name': 'Category name',
  'categories.name.placeholder': 'Food, Salary, Rent...',
  'categories.helper': 'Add income and expense labels first so transaction and budget forms stay clean.',
  'categories.type': 'Type',
  'categories.save': 'Save Category',
  'categories.update': 'Update Category',
  'categories.edit': 'Edit',
  'categories.cancelEdit': 'Cancel edit',
  'categories.saved': 'Category saved.',
  'categories.updated': 'Category updated.',
  'categories.deleted': 'Category deleted.',
  'categories.catalog': 'Category Catalog',
  'categories.currentUser': 'Current user',
  'categories.empty': 'No categories yet.',
  'budgets.writer': 'Budget Writer',
  'budgets.categoryScope': 'Category scope',
  'budgets.amount': 'Amount',
  'budgets.helper': 'You can save a whole-month cap or assign a budget to one expense category.',
  'budgets.amountRequired': 'Enter a budget amount of 0 or more.',
  'budgets.save': 'Save Budget',
  'budgets.edit': 'Edit Budget',
  'budgets.update': 'Update Budget',
  'budgets.cancelEdit': 'Cancel edit',
  'budgets.saved': 'Budget saved.',
  'budgets.deleted': 'Budget deleted.',
  'budgets.stored': 'Stored in PostgreSQL',
  'budgets.emptyMonth': 'No budgets for this month yet.',
  'theme.dark': 'Dark',
  'theme.light': 'Light',
  'theme.switch': 'Theme',
  'locale.switch': 'Language',
  'status.failedTransaction': 'Failed to save transaction',
  'status.failedCategory': 'Failed to save category',
  'status.failedBudget': 'Failed to save budget',
};

const zh: Dict = {
  'nav.dashboard': '總覽',
  'nav.transactions': '交易',
  'nav.categories': '分類',
  'nav.budgets': '預算',
  'shell.title': '個人現金流主控台',
  'shell.description': '收入、支出、分類預算與每月結餘的一站式工作台。',
  'shell.filters': '篩選',
  'shell.userEmail': '使用者電郵',
  'shell.month': '月份',
  'dashboard.eyebrow': '每月脈搏',
  'dashboard.title': '讓現金流一目了然',
  'dashboard.description': '這個第一版介面會直接讀取 NestJS API，讓你先查看結餘、最近交易與分類預算，之後再擴充圖表與登入功能。',
  'dashboard.scope': '目前範圍',
  'dashboard.user': '使用者',
  'dashboard.status': '狀態',
  'dashboard.status.loading': '正在同步資料...',
  'dashboard.status.ready': '資料已載入',
  'metric.income': '收入',
  'metric.expense': '支出',
  'metric.balance': '結餘',
  'transactions.recent': '最近交易',
  'transactions.timeline': '時間線',
  'transactions.empty': '本月尚未有交易。',
  'transactions.uncategorized': '未分類',
  'budgets.lanes': '預算區塊',
  'budgets.planning': '規劃',
  'budgets.wholeMonth': '整月總預算',
  'budgets.empty': '本月尚未設定預算。',
  'transactions.create': '新增交易',
  'transactions.writeDb': '寫入資料庫',
  'transactions.type': '類型',
  'transactions.type.expense': '支出',
  'transactions.type.income': '收入',
  'transactions.amount': '金額',
  'transactions.occurredOn': '發生日',
  'transactions.category': '分類',
  'transactions.note': '備註',
  'transactions.note.placeholder': '午餐、薪水、交通...',
  'transactions.categoryHint': '如果下拉選單沒有選項，請先建立對應類型的分類。',
  'transactions.amountRequired': '請先輸入大於 0 的金額再儲存。',
  'transactions.createButton': '新增交易',
  'transactions.updateButton': '更新交易',
  'transactions.edit': '編輯',
  'transactions.cancelEdit': '取消編輯',
  'transactions.saving': '儲存中...',
  'transactions.saved': '交易已儲存。',
  'transactions.updated': '交易已更新。',
  'transactions.deleted': '交易已刪除。',
  'transactions.list': '交易列表',
  'common.loading': '載入中...',
  'common.cancel': '取消',
  'common.delete': '刪除',
  'categories.create': '新增分類',
  'categories.reusable': '可重用標籤',
  'categories.name': '分類名稱',
  'categories.name.placeholder': '飲食、薪水、租金...',
  'categories.helper': '先建立收入與支出分類，後面的交易和預算表單會更順手。',
  'categories.type': '類型',
  'categories.save': '儲存分類',
  'categories.update': '更新分類',
  'categories.edit': '編輯',
  'categories.cancelEdit': '取消編輯',
  'categories.saved': '分類已儲存。',
  'categories.updated': '分類已更新。',
  'categories.deleted': '分類已刪除。',
  'categories.catalog': '分類清單',
  'categories.currentUser': '目前使用者',
  'categories.empty': '尚未有分類。',
  'budgets.writer': '預算設定',
  'budgets.categoryScope': '分類範圍',
  'budgets.amount': '金額',
  'budgets.helper': '你可以設定整月總預算，或只為單一支出分類設定上限。',
  'budgets.amountRequired': '請輸入大於或等於 0 的預算金額。',
  'budgets.save': '儲存預算',
  'budgets.edit': '編輯預算',
  'budgets.update': '更新預算',
  'budgets.cancelEdit': '取消編輯',
  'budgets.saved': '預算已儲存。',
  'budgets.deleted': '預算已刪除。',
  'budgets.stored': '已寫入資料庫',
  'budgets.emptyMonth': '本月尚未有預算。',
  'theme.dark': '黑色',
  'theme.light': '白色',
  'theme.switch': '主題',
  'locale.switch': '語言',
  'status.failedTransaction': '交易儲存失敗',
  'status.failedCategory': '分類儲存失敗',
  'status.failedBudget': '預算儲存失敗',
};

export const dictionaries: Record<Locale, Dict> = { en, zh };
