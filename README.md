# Spendl — Your money, your rhythm 🪙

> **A portfolio-grade creative fintech web app** combining a Java Spring Boot & MySQL backend with an editorial, warm minimalist React dashboard.
> Built by **Rudra Vijay Chaudhari** (BTech Computer Science & Engineering).

---

## 🎨 Visual Identity & Art Direction

- **Name:** Spendl — *"Your money, your rhythm."*
- **Theme:** Warm minimalism, Gen Z editorial, playful sophistication.
- **Color Palette:**
  - Background: `#F8F5EF`
  - Primary Surface: `#FFFFFF`
  - Accent (Terracotta): `#E87952` & `#B95337`
  - Text: `#282820` (Main), `#858276` (Secondary)
  - Income / Positive: `#DDE8D8` (Soft Sage) & `#3E6B3B`
  - Savings / Highlights: `#EAE3F7` (Pale Lavender) & `#F6E6A9` (Soft Yellow)
  - Borders: `#EAE5DC`
- **Typography:** DM Sans (Clean UI body) & Fraunces (Editorial serif headings and currency numbers).

---

## 🏛 Architecture & Tech Stack

```
expense-tracker/
├── src/                                  # Spring Boot 4 Backend
│   └── main/java/com/rudra/expense_tracker/
│       ├── controller/
│       │   ├── TransactionController.java
│       │   └── AllowanceController.java
│       ├── service/
│       │   ├── TransactionService.java
│       │   ├── AllowanceService.java
│       │   └── SurvivalCalculatorService.java
│       ├── repository/
│       │   ├── TransactionRepository.java
│       │   ├── AllowanceCycleRepository.java
│       │   └── AllowanceEventRepository.java
│       ├── entity/
│       │   ├── Transaction.java
│       │   ├── TransactionType.java      # INCOME, EXPENSE
│       │   ├── AllowanceCycle.java       # Student allowance plans
│       │   └── AllowanceEvent.java       # Top-ups & pocket money
│       └── dto/
│           ├── TransactionRequest.java
│           ├── AllowanceRequest.java
│           ├── AllowanceEventRequest.java
│           └── SurvivalDashboardResponse.java
├── frontend/                             # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                  # Header, Sidebar, MobileNav, Toast, ConfirmModal, Skeleton
│   │   │   ├── dashboard/               # HeroBanner, SummaryCards, SpendingChart, CategoryDonutChart, RecentTransactions, BudgetTeaserCard
│   │   │   ├── survival/                # StudentSurvivalDashboard, SetupModal, TopUpModal, HistoryModal
│   │   │   ├── transactions/            # TransactionTable, TransactionModal (Add/Edit)
│   │   │   ├── analytics/               # AnalyticsDeepDive, Insights, Category Leaderboard
│   │   │   ├── budgets/                 # BudgetsView & roadmap specifications
│   │   │   └── settings/                # SettingsView (currency selector, backend latency ping)
│   │   ├── services/
│   │   │   ├── api.js                   # Central fetch client with error handling & base URL
│   │   │   ├── transactionService.js    # Spring Boot REST API calls
│   │   │   └── allowanceService.js      # Student Survival Mode API client
│   │   ├── hooks/
│   │   │   └── useTransactions.js       # Live state management & synchronization
│   │   ├── utils/                       # currency.js, date.js, analytics.js, categoryIcons.jsx
│   │   ├── styles/                      # variables.css, animations.css, index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js                   # Dev server proxy `/api` → `http://localhost:8080`
│   └── package.json
├── pom.xml
└── README.md
```

---

## 🚀 Running the Project Locally

### 1. Start the MySQL Database
Ensure MySQL is running on port `3306` with the `expense_tracker` database:
```sql
CREATE DATABASE IF NOT EXISTS expense_tracker;
```
Configure your credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expense_tracker
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 2. Start the Spring Boot Backend (Port 8080)
```bash
./mvnw spring-boot:run
```
The backend initializes Hibernate JPA, connects to MySQL, and listens on `http://localhost:8080`.

### 3. Start the Frontend Development Server (Port 5173)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at **`http://localhost:5173`**.

---

## 📡 REST API Reference

The frontend connects directly to the following Spring Boot REST endpoints:

| Method | Endpoint | Description | Request Body | Status |
|---|---|---|---|---|
| `GET` | `/api/transactions` | Retrieve all transactions (sorted newest first) | None | `200 OK` |
| `GET` | `/api/transactions/{id}` | Retrieve single transaction by ID | None | `200 OK` |
| `POST` | `/api/transactions` | Record new transaction | `TransactionRequest` JSON | `201 Created` |
| `PUT` | `/api/transactions/{id}` | Update existing transaction | `TransactionRequest` JSON | `200 OK` |
| `DELETE`| `/api/transactions/{id}` | Delete transaction | None | `204 No Content` |
| `GET` | `/api/transactions/type/{type}` | Filter by `INCOME` or `EXPENSE` | None | `200 OK` |
| `GET` | `/api/transactions/category/{cat}`| Filter by category name | None | `200 OK` |
| `GET` | `/api/transactions/summary` | Calculate `totalIncome`, `totalExpenses`, `balance` | None | `200 OK` |
| `POST` | `/api/allowances` | Create & activate student allowance cycle | `AllowanceRequest` JSON | `201 Created` |
| `GET` | `/api/allowances/active` | Retrieve active allowance plan | None | `200 OK` |
| `GET` | `/api/allowances/active/survival` | Live survival metrics, safe daily limits & diagnostics | None | `200 OK` |
| `GET` | `/api/allowances/history` | Historical allowance cycles list | None | `200 OK` |
| `PUT` | `/api/allowances/{id}` | Update allowance plan parameters | `AllowanceRequest` JSON | `200 OK` |
| `POST` | `/api/allowances/events` | Record pocket money / allowance top-up | `AllowanceEventRequest` JSON | `201 Created` |
| `GET` | `/api/allowances/{id}/survival` | Historical cycle survival report | None | `200 OK` |
| `GET` | `/api/allowances/{id}/weekly-report`| 7-day spending report & dynamic insights | None | `200 OK` |

### Transaction DTO Structure (`TransactionRequest`):
```json
{
  "title": "Software Internship Stipend",
  "amount": 2500.00,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-10-28"
}
```

---

## 🌟 Key Features

1. **Student Survival Mode:**
   - **Daily Safe Spending Limit**: Automatically recalculates discretionary daily spending allowance based on remaining days, emergency reserve, and real-time eligible expenses.
   - **Survival Status Meter**: Visual GREEN / YELLOW / RED health indicators based on monthly consumption pace.
   - **Pocket Money Top-ups**: Instantly record extra cash or freelance income with live dashboard recalculation.
   - **Student Spending Categories**: Automatically categorizes transactions into student essentials (Food & Canteen, College Supplies, Transportation, Rent, Entertainment, Emergency).
   - **7-Day Survival Report**: Recharts-powered daily bar chart comparing daily expenditures against your safe daily benchmark.
   - **Allowance History**: Comprehensive audit and inspection of current and completed cycles.
2. **Live Dashboard:**
   - 4 animated metric cards: **Total Balance**, **Total Income**, **Total Expenses**, and **Savings Rate** (computed accurately from real transactions).
   - Recharts-powered **Cash Flow Overview** (monthly income vs. expense bar chart).
   - Recharts **Category Outflow Donut Chart** with active hover state and center balance display.
   - **Recent Ledger** with category badges, date formatting, and inline quick-actions.
3. **Transaction Management:**
   - Search by title or category in real time.
   - Filter by type (`All`, `Income`, `Expense`) and by category.
   - Sort by Date (newest/oldest) or Amount (highest/lowest).
   - Add & Edit modal with comprehensive client validation matching Spring Boot constraints.
   - Deletion with accessible confirmation dialog.
4. **Deep Analytics:**
   - Automated dynamic insights (e.g. top spending category percentage, largest outflow, savings buffer).
   - Category spending leaderboard with visual progress bars.
5. **Budget Architecture Guidance:**
   - Honest, transparent status communicating that persistent budgets require backend budget entities, coupled with a 50/30/20 budget rhythm estimation calculator.
6. **Preferences & Diagnostics:**
   - Multi-currency support (USD `$`, INR `₹`, EUR `€`, GBP `£`).
   - Live backend roundtrip latency ping test against Spring Boot.
   - Fully responsive design tested across mobile, tablet, and desktop viewports.
