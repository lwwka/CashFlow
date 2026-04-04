# CashFlow MVP Wireframes

> Low-fidelity wireframes for Transaction List, Monthly Overview, and Reports.

## 1) Transaction List (列表)

```text
+----------------------------------------------------------------------------------+
| CashFlow                                  [Month: 2026-04 v] [ + Add Entry ]     |
+----------------------------------------------------------------------------------+
| Search: [ salary / rent / note...                      ] [Filters] [Export CSV] |
| Filters: Type (All/Income/Expense) Category (...) Amount (min-max) Date (...)   |
+----------------------------------------------------------------------------------+
| Date       | Type    | Category     | Note                        | Amount | ⋯   |
|------------|---------|--------------|-----------------------------|--------|-----|
| 2026-04-01 | Income  | Salary       | Company payroll             | +35000 |Edit |
| 2026-04-02 | Expense | Food         | Lunch with team             |  -120  |Edit |
| 2026-04-03 | Expense | Transport    | MTR                         |   -22  |Edit |
+----------------------------------------------------------------------------------+
| Total Income: 35,000   Total Expense: 142   Balance: 34,858                      |
+----------------------------------------------------------------------------------+
```

## 2) Monthly Overview (月總覽)

```text
+----------------------------------------------------------------------------------+
| Monthly Overview                              [Month: 2026-04 v] [Set Budget]     |
+----------------------------------------------------------------------------------+
| Income Card        | Expense Card       | Balance Card       | Budget Usage Card |
| 35,000             | 12,500             | 22,500             | 62%               |
+----------------------------------------------------------------------------------+
| Category Spending Progress                                                      |
| Food       [██████░░░░] 60%   3,000 / 5,000                                   |
| Transport  [████░░░░░░] 40%   800 / 2,000                                     |
| Shopping   [█████████░] 95%   4,750 / 5,000                                   |
+----------------------------------------------------------------------------------+
| Trend (last 6 months): income vs expense line chart placeholder                 |
+----------------------------------------------------------------------------------+
```

## 3) Reports (報表)

```text
+----------------------------------------------------------------------------------+
| Reports                                      [From 2026-01] [To 2026-04] [Apply] |
+----------------------------------------------------------------------------------+
| [Tab] Category Breakdown | Monthly Trend | Budget vs Actual                       |
+----------------------------------------------------------------------------------+
| Left: Pie chart (expense by category)      Right: Legend + values                |
| Food 35%, Rent 28%, Transport 10%, etc.                                        |
+----------------------------------------------------------------------------------+
| Monthly Trend (Bar/Line)                                                        |
| Jan   Income ████████  Expense ████                                              |
| Feb   Income ███████   Expense █████                                             |
| Mar   Income █████████ Expense ██████                                            |
| Apr   Income ████████  Expense █████                                             |
+----------------------------------------------------------------------------------+
```

## UX Notes
- Primary actions stay top-right (`+ Add Entry`, `Set Budget`) for one-click workflow.
- Filter and search are sticky to reduce repetitive input.
- Amount colors: income = green, expense = red for immediate cognitive parsing.
- Keep report range max at 24 months in MVP to avoid expensive heavy queries.
