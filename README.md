# paragon
Initial repo for Paragon
=======
# 🏠 Paragon — Parents' Household Fund & Expense Tracker

A modern, fast, and privacy-first Progressive Web App (PWA) designed for **Adil**, **Faiza**, and **Haseeb** to collaboratively manage their parents' household fund—tracking both **incomes (fund contributions)** and **expenses** in real time with Google Firebase sync.

---

## 🌟 Key Features

1. **Pre-Configured Expense & Income Categories + Custom Categories**:
   - **Expense Categories**:
     - 🏠 **Rent**
     - 💼 **Salaries**
     - ⚡ **Bills**
     - 🔧 **Services**
     - 🛒 **Groceries**
     - 💊 **Medical**
     - ⋯ **Others**
   - **Income / House Fund Categories**:
     - 💰 **Monthly Contribution**
     - 📈 **Extra Support**
     - 🎁 **Other Income**
   - **➕ Add New Categories Anytime**: Create custom expense or income categories with custom icons, accent colors, and optional monthly budgets—automatically synced across all siblings' phones.

2. **Sibling Profiles (Adil, Faiza & Haseeb)**:
   - Tag every expenditure (*"Spent By"*) or fund contribution (*"Contributed By"*) to **👨 Adil**, **👩 Faiza**, or **🧑 Haseeb**.
   - Filter transaction history by sibling or transaction type (*All*, *Expenses*, *Incomes*).
   - View per-sibling total contributions and spending in the Analytics tab.

3. **Real-Time Firebase Cloud Sync (Isolated from `my_spending`)**:
   - Uses a dedicated Firestore household room (`paragon_household`) so all transactions, budgets, and custom categories stay 100% separate from `my_spending`.

4. **Monthly Budgets, Unified Dual-Bars & Threshold Alerts**:
   - Set monthly budgets per expense category.
   - Unified dual bars show **Spent** and **Remaining** in the same bar.
   - Automatic audio chimes, in-app alert modals, and browser push notifications at **50%**, **75%**, **90%**, and **100%** budget thresholds.

5. **RFC 4180 CSV Import & Export + JSON Backup**:
   - 1-tap CSV export & native mobile sharing (`Date, Time, Type, Category, Member, Amount, Currency, Notes, Transaction_ID`).
   - Full CSV import with live preview (Merge or Replace mode).

---

## 💻 How to Run Locally

```bash
cd /Users/firstcity/GIT/paragon
python3 -m http.server 3001
```

Then open your browser at `http://localhost:3001`.
