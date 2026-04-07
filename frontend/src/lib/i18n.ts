export type Locale = 'en' | 'zh';

export type TranslationKey =
  | 'nav.dashboard'
  | 'nav.goals'
  | 'nav.reports'
  | 'nav.transactions'
  | 'nav.categories'
  | 'nav.budgets'
  | 'shell.title'
  | 'shell.description'
  | 'shell.filters'
  | 'shell.userEmail'
  | 'shell.month'
  | 'shell.monthHint'
  | 'shell.fromDate'
  | 'shell.toDate'
  | 'shell.customRangeHint'
  | 'shell.rangeModeMonth'
  | 'shell.rangeModeCustom'
  | 'shell.dashboardRangeHint'
  | 'shell.goalsRangeHint'
  | 'dashboard.eyebrow'
  | 'dashboard.title'
  | 'dashboard.description'
  | 'dashboard.scope'
  | 'dashboard.user'
  | 'dashboard.status'
  | 'dashboard.status.loading'
  | 'dashboard.status.ready'
  | 'dashboard.goalSummary'
  | 'dashboard.monthlyTarget'
  | 'dashboard.currentSavings'
  | 'dashboard.targetGap'
  | 'dashboard.savingsRate'
  | 'dashboard.projectedMonthEnd'
  | 'dashboard.projectedSavingsRate'
  | 'dashboard.goalStatus'
  | 'dashboard.goalProgress'
  | 'dashboard.targetReached'
  | 'dashboard.actionNeeded'
  | 'dashboard.monthEndSummary'
  | 'dashboard.status.onTrack'
  | 'dashboard.status.atRisk'
  | 'dashboard.status.offTrack'
  | 'dashboard.daysProgress'
  | 'dashboard.saveGoal'
  | 'dashboard.goalSaved'
  | 'dashboard.goalSaveFailed'
  | 'dashboard.spendingHotspots'
  | 'dashboard.topCategories'
  | 'dashboard.noExpenseData'
  | 'dashboard.budgetPulse'
  | 'dashboard.budgetVsActual'
  | 'dashboard.noBudgetData'
  | 'dashboard.actualSpend'
  | 'dashboard.remaining'
  | 'dashboard.overBudget'
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
  | 'transactions.import'
  | 'transactions.importDescription'
  | 'transactions.importFormat'
  | 'transactions.importPasteHint'
  | 'transactions.importPreview'
  | 'transactions.importRows'
  | 'transactions.importInvalidRows'
  | 'transactions.importLine'
  | 'transactions.importFixHint'
  | 'transactions.importIssueDate'
  | 'transactions.importIssueType'
  | 'transactions.importIssueAmount'
  | 'transactions.importRawRow'
  | 'transactions.importMoreIssues'
  | 'transactions.importButton'
  | 'transactions.importing'
  | 'transactions.imported'
  | 'transactions.importSkipped'
  | 'transactions.importSkippedList'
  | 'transactions.importSkippedMore'
  | 'transactions.importFailed'
  | 'transactions.importPlaceholder'
  | 'transactions.downloadTemplate'
  | 'transactions.templateHint'
  | 'transactions.uploadFile'
  | 'transactions.selectedFile'
  | 'transactions.clearImport'
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
  | 'status.failedBudget'
  | 'reports.title'
  | 'reports.description'
  | 'reports.transactions'
  | 'reports.summary'
  | 'reports.download'
  | 'reports.ready'
  | 'reports.failed'
  | 'reports.hint'

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  'nav.dashboard': 'Dashboard',
  'nav.goals': 'Goals',
  'nav.reports': 'Reports',
  'nav.transactions': 'Transactions',
  'nav.categories': 'Categories',
  'nav.budgets': 'Budgets',
  'shell.title': 'Personal Money Cockpit',
  'shell.description': 'A lightweight workspace for income, expenses, category budgets, and monthly balance.',
  'shell.filters': 'Filters',
  'shell.userEmail': 'User Email',
  'shell.month': 'Month',
  'shell.monthHint': 'Use Month for normal monthly planning. Budgets still follow this month selector.',
  'shell.fromDate': 'From date',
  'shell.toDate': 'To date',
  'shell.customRangeHint': 'Fill both dates to let Transactions and Reports switch from monthly view to a custom range.',
  'shell.rangeModeMonth': 'Current mode: monthly view. Transactions, reports, dashboard, and goals use the selected month.',
  'shell.rangeModeCustom': 'Current mode: custom range. Transactions, reports, dashboard, and goals now use your from/to dates.',
  'shell.dashboardRangeHint': 'Dashboard cards and transaction insights now use your custom range. Budget cards still use the selected month.',
  'shell.goalsRangeHint': 'Goal calculations now reflect your custom range, while the savings target editor still saves the selected month target.',
  'dashboard.eyebrow': 'Monthly Pulse',
  'dashboard.title': 'Keep your cash story visible',
  'dashboard.description':
    'This first-pass UI reads directly from your NestJS API. Use it to monitor your balance, review recent transactions, and shape category budgets before we move on to charts and auth.',
  'dashboard.scope': 'Active Scope',
  'dashboard.user': 'User',
  'dashboard.status': 'Status',
  'dashboard.status.loading': 'Syncing with API...',
  'dashboard.status.ready': 'Live data loaded',
  'dashboard.goalSummary': 'Goal summary',
  'dashboard.monthlyTarget': 'Monthly savings target',
  'dashboard.currentSavings': 'Current savings',
  'dashboard.targetGap': 'Target gap',
  'dashboard.savingsRate': 'Savings rate',
  'dashboard.projectedMonthEnd': 'Projected month-end balance',
  'dashboard.projectedSavingsRate': 'Projected savings rate',
  'dashboard.goalStatus': 'Goal status',
  'dashboard.goalProgress': 'Goal progress',
  'dashboard.targetReached': 'Target reached',
  'dashboard.actionNeeded': 'Action needed',
  'dashboard.monthEndSummary': 'Month-end summary',
  'dashboard.status.onTrack': 'On track',
  'dashboard.status.atRisk': 'At risk',
  'dashboard.status.offTrack': 'Off track',
  'dashboard.daysProgress': 'Days progress',
  'dashboard.saveGoal': 'Save monthly target',
  'dashboard.goalSaved': 'Monthly goal saved.',
  'dashboard.goalSaveFailed': 'Failed to save monthly goal',
  'dashboard.spendingHotspots': 'Spending hotspots',
  'dashboard.topCategories': 'Top expense categories',
  'dashboard.noExpenseData': 'No expense transactions for this month yet.',
  'dashboard.budgetPulse': 'Budget pulse',
  'dashboard.budgetVsActual': 'Budget vs actual',
  'dashboard.noBudgetData': 'No category budgets to compare yet.',
  'dashboard.actualSpend': 'Actual spend',
  'dashboard.remaining': 'Remaining',
  'dashboard.overBudget': 'Over budget',
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
  'transactions.import': 'Import Transactions',
  'transactions.importDescription': 'Fill the template in Excel, then Save As CSV and upload it here to import many days or months at once.',
  'transactions.importFormat': 'Standard columns: occurredOn,type,amount,categoryName,note',
  'transactions.importPasteHint': 'You can also copy rows directly from Excel and paste them into the box below.',
  'transactions.importPreview': 'Preview',
  'transactions.importRows': 'rows ready',
  'transactions.importInvalidRows': 'rows need fixes',
  'transactions.importLine': 'Line',
  'transactions.importFixHint': 'Fix the invalid rows below before importing.',
  'transactions.importIssueDate': 'date must be in YYYY-MM-DD format',
  'transactions.importIssueType': 'type must be income or expense',
  'transactions.importIssueAmount': 'amount must be a number greater than 0',
  'transactions.importRawRow': 'Raw row',
  'transactions.importMoreIssues': 'More invalid rows exist. Keep fixing them in the source data and paste again.',
  'transactions.importButton': 'Import Transactions',
  'transactions.importing': 'Importing...',
  'transactions.imported': 'transactions imported.',
  'transactions.importSkipped': 'duplicate rows skipped.',
  'transactions.importSkippedList': 'Skipped duplicate rows',
  'transactions.importSkippedMore': 'More duplicate rows were skipped. Adjust your source data if you want to import new ones only.',
  'transactions.importFailed': 'Failed to import transactions',
  'transactions.importPlaceholder': 'occurredOn,type,amount,categoryName,note',
  'transactions.downloadTemplate': 'Download CSV Template',
  'transactions.templateHint': 'Recommended flow: open the template in Excel, fill your rows, then use Save As -> CSV before uploading.',
  'transactions.uploadFile': 'Upload CSV File',
  'transactions.selectedFile': 'Selected file',
  'transactions.clearImport': 'Clear import data',
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
  'reports.title': 'Reports',
  'reports.description': 'Download Excel-friendly CSV files for your monthly records and financial summaries.',
  'reports.transactions': 'Monthly transactions CSV',
  'reports.summary': 'Monthly summary CSV',
  'reports.download': 'Download',
  'reports.ready': 'Report downloaded.',
  'reports.failed': 'Failed to download report',
  'reports.hint': 'Open the CSV directly in Excel to review, filter, and chart your own numbers.',
};

const zh: Dict = {
  'nav.dashboard': '總覽',
  'nav.goals': '目標',
  'nav.reports': '報表',
  'nav.transactions': '交易',
  'nav.categories': '分類',
  'nav.budgets': '預算',
  'shell.title': '個人現金流主控台',
  'shell.description': '收入、支出、分類預算與每月結餘的一站式工作台。',
  'shell.filters': '篩選',
  'shell.userEmail': '使用者電郵',
  'shell.month': '月份',
  'shell.monthHint': '一般每月規劃請用月份。預算相關卡片仍會跟這個月份走。',
  'shell.fromDate': '開始日期',
  'shell.toDate': '結束日期',
  'shell.customRangeHint': '同時填入開始和結束日期後，交易與報表頁會由單月模式切換成自訂時間範圍。',
  'shell.rangeModeMonth': '目前模式：單月檢視。交易、報表、總覽與目標都會使用所選月份。',
  'shell.rangeModeCustom': '目前模式：自訂時間。交易、報表、總覽與目標會改用你設定的開始/結束日期。',
  'shell.dashboardRangeHint': '總覽卡片與交易洞察已改用自訂時間範圍；預算卡片仍維持所選月份。',
  'shell.goalsRangeHint': '目標頁的數字已改用自訂時間範圍；每月儲蓄目標仍會儲存到所選月份。',
  'dashboard.eyebrow': '每月脈搏',
  'dashboard.title': '讓現金流一目了然',
  'dashboard.description': '這個第一版介面會直接讀取 NestJS API，讓你先查看結餘、最近交易與分類預算，之後再擴充圖表與登入功能。',
  'dashboard.scope': '目前範圍',
  'dashboard.user': '使用者',
  'dashboard.status': '狀態',
  'dashboard.status.loading': '正在同步資料...',
  'dashboard.status.ready': '資料已載入',
  'dashboard.goalSummary': '目標總覽',
  'dashboard.monthlyTarget': '每月儲蓄目標',
  'dashboard.currentSavings': '目前儲蓄',
  'dashboard.targetGap': '距離目標',
  'dashboard.savingsRate': '儲蓄率',
  'dashboard.projectedMonthEnd': '月底預測結餘',
  'dashboard.projectedSavingsRate': '月底預測儲蓄率',
  'dashboard.goalStatus': '目標狀態',
  'dashboard.goalProgress': '目標進度',
  'dashboard.targetReached': '已達標',
  'dashboard.actionNeeded': '仍需努力',
  'dashboard.monthEndSummary': '月底摘要',
  'dashboard.status.onTrack': '達標中',
  'dashboard.status.atRisk': '有風險',
  'dashboard.status.offTrack': '偏離目標',
  'dashboard.daysProgress': '月份進度',
  'dashboard.saveGoal': '儲存每月目標',
  'dashboard.goalSaved': '每月目標已儲存。',
  'dashboard.goalSaveFailed': '每月目標儲存失敗',
  'dashboard.spendingHotspots': '支出熱點',
  'dashboard.topCategories': '主要支出分類',
  'dashboard.noExpenseData': '本月尚未有支出交易。',
  'dashboard.budgetPulse': '預算脈搏',
  'dashboard.budgetVsActual': '預算與實際',
  'dashboard.noBudgetData': '尚未有可比較的分類預算。',
  'dashboard.actualSpend': '實際支出',
  'dashboard.remaining': '剩餘',
  'dashboard.overBudget': '已超預算',
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
  'transactions.import': '匯入交易',
  'transactions.importDescription': '建議先用 Excel 填範本，再另存為 CSV 後上傳，便可以一次匯入多日或多月份交易。',
  'transactions.importFormat': '標準欄位：occurredOn,type,amount,categoryName,note',
  'transactions.importPasteHint': '你也可以直接從 Excel 複製多行資料，再貼到下面輸入框。',
  'transactions.importPreview': '預覽',
  'transactions.importRows': '筆資料可匯入',
  'transactions.importInvalidRows': '筆資料需要修正',
  'transactions.importLine': '第',
  'transactions.importFixHint': '請先修正下面有問題的資料列，再進行匯入。',
  'transactions.importIssueDate': '日期格式必須是 YYYY-MM-DD',
  'transactions.importIssueType': '類型必須是 income 或 expense',
  'transactions.importIssueAmount': '金額必須是大於 0 的數字',
  'transactions.importRawRow': '原始資料列',
  'transactions.importMoreIssues': '還有更多錯誤列，請先回到來源資料修正後再貼一次。',
  'transactions.importButton': '匯入交易',
  'transactions.importing': '匯入中...',
  'transactions.imported': '筆交易已匯入。',
  'transactions.importSkipped': '筆重複資料已跳過。',
  'transactions.importSkippedList': '被跳過的重複資料',
  'transactions.importSkippedMore': '還有更多重複資料被跳過；如果只想匯入新資料，請先回到來源檔案調整。',
  'transactions.importFailed': '交易匯入失敗',
  'transactions.importPlaceholder': 'occurredOn,type,amount,categoryName,note',
  'transactions.downloadTemplate': '下載 CSV 範本',
  'transactions.templateHint': '建議流程：先用 Excel 開範本填資料，再用另存新檔 -> CSV，之後再上傳。',
  'transactions.uploadFile': '上傳 CSV 檔案',
  'transactions.selectedFile': '已選檔案',
  'transactions.clearImport': '清除匯入資料',
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
  'reports.title': '報表',
  'reports.description': '下載 Excel 友善 CSV，方便檢視、篩選和整理你每月的理財資料。',
  'reports.transactions': '每月交易明細 CSV',
  'reports.summary': '每月摘要 CSV',
  'reports.download': '下載',
  'reports.ready': '報表已下載。',
  'reports.failed': '報表下載失敗',
  'reports.hint': '你可以直接用 Excel 開啟 CSV，再按自己的方式做篩選、統計和圖表。',
};

export const dictionaries: Record<Locale, Dict> = { en, zh };
