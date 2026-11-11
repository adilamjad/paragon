/**
 * Paragon - Parents' Household Fund, Income & Expense Tracker
 * Managed by Adil, Faiza, and Haseeb
 * Features: Expense & Income Tracking, Custom Categories, Real-Time Firebase Sync,
 *           Unified Budget Dual-Bars, 50/75/90/100% Alerts, CSV Import/Export, PWA Offline Support
 */

(() => {
  'use strict';

  // --- Isolated Constants & Config for Paragon ---
  const STORAGE_KEY = 'paragon_transactions_v1';
  const SETTINGS_KEY = 'paragon_settings_v1';
  const CUSTOM_CATEGORIES_KEY = 'paragon_custom_categories_v1';
  const ALERTS_KEY = 'paragon_alerted_thresholds_v1';
  const DUE_DATES_KEY = 'paragon_due_dates_v1';
  const DUE_ALERTED_KEY = 'paragon_due_alerted_v1';
  const PROFILE_STORAGE_KEY = 'paragon_device_profile_v1';
  const DEFAULT_HOUSEHOLD_ID = 'paragon_household';

  // Google Firebase Configuration (Project: spending-tracker-6db2d, isolated room: paragon_household)
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCZV_am4fczF_wwHI8XtZKepX7uS8kBLl8",
    authDomain: "spending-tracker-6db2d.firebaseapp.com",
    projectId: "spending-tracker-6db2d",
    storageBucket: "spending-tracker-6db2d.firebasestorage.app",
    messagingSenderId: "322899616916",
    appId: "1:322899616916:web:c91fc0eb6e19e9533ec081",
    measurementId: "G-0VXK48K8Z8"
  };

  // Siblings managing Parents' Household
  const FAMILY_MEMBERS = [
    { id: 'adil', name: 'Adil', avatar: '👨', color: '#3b82f6' },
    { id: 'faiza', name: 'Faiza', avatar: '👩', color: '#ec4899' },
    { id: 'haseeb', name: 'Haseeb', avatar: '🧑', color: '#10b981' }
  ];

  // Default Monthly Budgets for the Pre-Configured Expense Categories (in PKR, Total: 531,500)
  const BUDGET_DEFAULTS_VERSION = 2;
  const DEFAULT_BUDGETS = {
    'bills': 100000,
    'salaries': 80500,
    'groceries': 80000,
    'rent': 96000,
    'others': 5000,
    'medical': 30000,
    'pocket': 140000,
    'services': 0,
    '_v': BUDGET_DEFAULTS_VERSION
  };

  // Pre-Configured Expense Categories for Parents' Household
  const DEFAULT_EXPENSE_CATEGORIES = [
    {
      id: 'bills',
      name: 'Bills',
      type: 'expense',
      icon: 'zap',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.16)',
      glow: 'rgba(245, 158, 11, 0.35)'
    },
    {
      id: 'salaries',
      name: 'Salaries',
      type: 'expense',
      icon: 'briefcase',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.16)',
      glow: 'rgba(139, 92, 246, 0.35)'
    },
    {
      id: 'groceries',
      name: 'Groceries',
      type: 'expense',
      icon: 'shopping-cart',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.16)',
      glow: 'rgba(16, 185, 129, 0.35)'
    },
    {
      id: 'rent',
      name: 'Rent',
      type: 'expense',
      icon: 'home',
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.16)',
      glow: 'rgba(99, 102, 241, 0.35)'
    },
    {
      id: 'pocket',
      name: 'Pocket',
      type: 'expense',
      icon: 'wallet',
      color: '#14b8a6',
      bg: 'rgba(20, 184, 166, 0.16)',
      glow: 'rgba(20, 184, 166, 0.35)'
    },
    {
      id: 'medical',
      name: 'Medical',
      type: 'expense',
      icon: 'pill',
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.16)',
      glow: 'rgba(236, 72, 153, 0.35)'
    },
    {
      id: 'others',
      name: 'Others',
      type: 'expense',
      icon: 'more-horizontal',
      color: '#64748b',
      bg: 'rgba(100, 116, 139, 0.16)',
      glow: 'rgba(100, 116, 139, 0.35)'
    },
    {
      id: 'services',
      name: 'Services',
      type: 'expense',
      icon: 'wrench',
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.16)',
      glow: 'rgba(6, 182, 212, 0.35)'
    }
  ];

  // Pre-Configured Income Categories (House Fund Contributions)
  const DEFAULT_INCOME_CATEGORIES = [
    {
      id: 'monthly-contribution',
      name: 'Monthly Contribution',
      type: 'income',
      icon: 'wallet',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.16)',
      glow: 'rgba(16, 185, 129, 0.35)'
    },
    {
      id: 'extra-fund',
      name: 'Extra Support',
      type: 'income',
      icon: 'trending-up',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.16)',
      glow: 'rgba(59, 130, 246, 0.35)'
    },
    {
      id: 'other-income',
      name: 'Other Income',
      type: 'income',
      icon: 'gift',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.16)',
      glow: 'rgba(245, 158, 11, 0.35)'
    }
  ];

  // Color Palette for Custom Categories
  const CATEGORY_COLORS = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#f59e0b', // Amber
    '#ea580c', // Orange
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6'  // Purple
  ];

  // SVG Icons collection (used for default + custom categories)
  const ICONS = {
    'home': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    'briefcase': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    'zap': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    'wrench': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    'shopping-cart': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
    'pill': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
    'more-horizontal': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/><circle cx="5" cy="12" r="2" fill="currentColor"/></svg>`,
    'wallet': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`,
    'trending-up': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    'gift': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
    'car': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-4"/></svg>`,
    'fuel': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`,
    'shopping-bag': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    'heart': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
    'shield': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    'globe': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    'graduation-cap': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    'tag': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`,
    'plus': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    'check': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    'trash': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    'edit': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
    'transfer': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`
  };

  // Pickable icons in Add Category Modal
  const PICKABLE_ICONS = [
    'home', 'briefcase', 'zap', 'wrench', 'shopping-cart', 'pill',
    'wallet', 'trending-up', 'gift', 'car', 'fuel', 'shopping-bag',
    'heart', 'shield', 'globe', 'graduation-cap', 'tag', 'more-horizontal'
  ];

  // --- Application State ---
  let transactions = [];
  let customCategories = [];
  let selectedTxType = 'expense'; // 'expense' | 'income' | 'transfer'
  let selectedCategory = DEFAULT_EXPENSE_CATEGORIES[0].id;
  let selectedPaidFrom = 'buffer'; // 'buffer' | 'faiza_wallet'
  let dateSelectionMode = 'now'; // 'now', 'yesterday', 'custom'
  let activeTab = 'tab-add';
  let historySearchQuery = '';
  let historyTypeFilter = 'all'; // 'all', 'expense', 'income', 'transfer'
  let historyCategoryFilter = 'all';
  let historyMemberFilter = 'all'; // 'all', 'adil', 'faiza', 'haseeb'
  let deviceProfile = 'adil'; // active sibling using this device
  let selectedSpentBy = 'adil'; // sibling selected on add form
  let editSelectedSpentBy = 'adil'; // sibling selected in edit modal
  let editSelectedType = 'expense'; // transaction type in edit modal
  let editSelectedPaidFrom = 'buffer'; // paidFrom in edit modal
  let lastDeletedTx = null;
  let editingTxId = null;
  let editingBudgetId = null;
  let alertedThresholds = {};
  let dueDateItems = [];
  let alertedDueKeys = {};
  let dueModalPaidFrom = 'buffer';
  let activePayingDueId = null;
  let stagedImportTransactions = [];

  // Custom Category Modal State
  let newCatType = 'expense';
  let newCatIcon = 'tag';
  let newCatColor = CATEGORY_COLORS[0];

  // Firebase Firestore State
  let db = null;
  let firestoreUnsubscribe = null;
  let firestoreBudgetsUnsubscribe = null;
  let firestoreCategoriesUnsubscribe = null;
  let firestoreCycleUnsubscribe = null;
  let firestoreDueDatesUnsubscribe = null;
  let isSyncingFromCloud = false;
  let cloudSyncStatus = 'offline';

  let settings = {
    currency: 'PKR',
    currencySymbol: 'PKR',
    theme: 'dark',
    budgets: Object.assign({}, DEFAULT_BUDGETS),
    pushNotifications: false,
    householdId: DEFAULT_HOUSEHOLD_ID,
    cycleStartDay: 1,
    cycleStartDate: '',
    cycleEndDate: '',
    cycleLockedCustom: false
  };

  // --- Category Helpers ---
  function hexToRgba(hex, alpha) {
    const clean = (hex || '#6366f1').replace('#', '');
    const bigint = parseInt(clean, 16);
    if (isNaN(bigint)) return `rgba(99, 102, 241, ${alpha})`;
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function getExpenseCategories() {
    const customExp = customCategories.filter(c => (c.type || 'expense') === 'expense');
    const hasCustomPocket = customExp.some(c => (c.name || '').trim().toLowerCase() === 'pocket');
    const defaults = hasCustomPocket
      ? DEFAULT_EXPENSE_CATEGORIES.filter(c => c.id !== 'pocket')
      : DEFAULT_EXPENSE_CATEGORIES;
    return [...defaults, ...customExp];
  }

  function getIncomeCategories() {
    const customInc = customCategories.filter(c => c.type === 'income');
    return [...DEFAULT_INCOME_CATEGORIES, ...customInc];
  }

  function getAllCategories() {
    return [...getExpenseCategories(), ...getIncomeCategories()];
  }

  function getActiveFormCategories() {
    return selectedTxType === 'income' ? getIncomeCategories() : getExpenseCategories();
  }

  function findCategoryById(catId) {
    return getAllCategories().find(c => c.id === catId);
  }

  // --- Initializer ---
  function init() {
    loadCustomCategories();
    loadSettings();
    loadDueDates();
    loadDeviceProfile();
    loadTransactions();
    loadAlertedThresholds();
    applyTheme(settings.theme);
    setupEventListeners();
    updateTxTypeUI();
    renderCategoriesGrid();
    renderCategoryFilters();
    updateDateSelectorUI();
    renderTransactionsHistory();
    updateAnalytics();
    renderDueDatesUI();
    updateCSVPreview();
    updateMonthSummaryBadge();
    updateNotificationStatusUI();
    initFirebase();
    registerServiceWorker();
  }

  // --- Member Profiles & UI Helpers ---
  function getMemberInfo(memberId) {
    if (!memberId) return FAMILY_MEMBERS[0];
    const low = String(memberId).toLowerCase();
    return FAMILY_MEMBERS.find(m => m.id === low || m.name.toLowerCase() === low) || FAMILY_MEMBERS[0];
  }

  function getTxPaidFrom(tx) {
    if (!tx) return 'buffer';
    if (tx.type === 'transfer') return 'buffer';
    if (tx.paidFrom === 'faiza_wallet' || tx.paidFrom === 'buffer') return tx.paidFrom;
    const mem = getMemberInfo(tx.spentBy || 'adil');
    return mem.id === 'faiza' ? 'faiza_wallet' : 'buffer';
  }

  /**
   * Computes both cumulative running balances (all-time) for Buffer Account & Faiza's Wallet
   * and current cycle totals so that carried-over funds are always accurately reflected.
   */
  function computeFundBalances(cycle) {
    const activeCycle = cycle || getCyclePeriod(0);

    let allTimeBufferIn = 0;
    let allTimeBufferExp = 0;
    let allTimeFaizaExp = 0;
    let allTimeTransfers = 0;

    let cycleIncome = 0;
    let cycleExpense = 0;
    let cycleBufferExp = 0;
    let cycleFaizaExp = 0;
    let cycleTransfers = 0;

    const siblingStats = {};
    FAMILY_MEMBERS.forEach(m => {
      siblingStats[m.id] = {
        member: m,
        contributed: 0,
        spent: 0,
        transferred: 0,
        allTimeContributed: 0,
        allTimeSpent: 0
      };
    });

    transactions.forEach(tx => {
      if (!tx) return;
      const amt = Number(tx.amount) || 0;
      const tType = tx.type || 'expense';
      const mem = getMemberInfo(tx.spentBy || 'adil');
      const inCycle = activeCycle.isInCycle(tx.date || tx.timestamp);

      if (tType === 'income') {
        allTimeBufferIn += amt;
        if (siblingStats[mem.id]) siblingStats[mem.id].allTimeContributed += amt;
        if (inCycle) {
          cycleIncome += amt;
          if (siblingStats[mem.id]) siblingStats[mem.id].contributed += amt;
        }
      } else if (tType === 'transfer') {
        allTimeTransfers += amt;
        if (inCycle) {
          cycleTransfers += amt;
          if (siblingStats[mem.id]) siblingStats[mem.id].transferred += amt;
        }
      } else {
        const paidFrom = getTxPaidFrom(tx);
        if (paidFrom === 'faiza_wallet') {
          allTimeFaizaExp += amt;
          if (inCycle) cycleFaizaExp += amt;
        } else {
          allTimeBufferExp += amt;
          if (inCycle) cycleBufferExp += amt;
        }
        if (siblingStats[mem.id]) siblingStats[mem.id].allTimeSpent += amt;
        if (inCycle) {
          cycleExpense += amt;
          if (siblingStats[mem.id]) siblingStats[mem.id].spent += amt;
        }
      }
    });

    const bufferRunningBalance = allTimeBufferIn - allTimeBufferExp - allTimeTransfers;
    const faizaWalletRunningBalance = allTimeTransfers - allTimeFaizaExp;
    const netRunningBalance = bufferRunningBalance + faizaWalletRunningBalance;

    return {
      allTimeBufferIn,
      allTimeBufferExp,
      allTimeFaizaExp,
      allTimeTransfers,
      bufferRunningBalance,
      faizaWalletRunningBalance,
      netRunningBalance,
      cycleIncome,
      cycleExpense,
      cycleBufferExp,
      cycleFaizaExp,
      cycleTransfers,
      siblingStats
    };
  }

  function loadDeviceProfile() {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved && FAMILY_MEMBERS.some(m => m.id === saved)) {
        deviceProfile = saved;
      }
    } catch (e) {}
    selectedSpentBy = deviceProfile;
    selectedPaidFrom = deviceProfile === 'faiza' ? 'faiza_wallet' : 'buffer';
    updateMemberSelectorsUI();
  }

  function setDeviceProfile(memberId) {
    if (!FAMILY_MEMBERS.some(m => m.id === memberId)) return;
    deviceProfile = memberId;
    selectedSpentBy = memberId;
    selectedPaidFrom = memberId === 'faiza' ? 'faiza_wallet' : 'buffer';
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, memberId);
    } catch (e) {}
    updateMemberSelectorsUI();
    const mem = getMemberInfo(memberId);
    showToast(`✅ Profile set to ${mem.avatar} ${mem.name} for this phone`);
  }

  function updateMemberSelectorsUI() {
    // Form member pills
    document.querySelectorAll('#form-member-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-member') === selectedSpentBy);
    });

    // Form paid-from pills (Buffer Account vs Faiza's Wallet)
    document.querySelectorAll('#form-paid-from-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-paid-from') === selectedPaidFrom);
    });

    // Settings profile pills
    document.querySelectorAll('#settings-profile-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-profile') === deviceProfile);
    });

    // History member filter chips
    document.querySelectorAll('#member-filter-row .member-filter-chip').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-member') === historyMemberFilter);
    });

    // History type filter chips
    document.querySelectorAll('#type-filter-row .member-filter-chip').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tx-type') === historyTypeFilter);
    });

    // Edit modal member pills
    document.querySelectorAll('#edit-member-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-edit-member') === editSelectedSpentBy);
    });

    // Edit modal paid-from pills
    document.querySelectorAll('#edit-paid-from-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-edit-paid-from') === editSelectedPaidFrom);
    });
  }

  // --- Transaction Type UI (Expense vs Fund In vs Transfer to Faiza's Wallet) ---
  function setTransactionType(type) {
    if (type === 'income' || type === 'transfer') {
      selectedTxType = type;
    } else {
      selectedTxType = 'expense';
    }

    if (selectedTxType === 'transfer' && selectedSpentBy === 'faiza') {
      // Adil (or Haseeb) dispenses from Buffer Account to Faiza's Wallet
      selectedSpentBy = 'adil';
      updateMemberSelectorsUI();
    } else if (selectedTxType === 'expense') {
      selectedPaidFrom = selectedSpentBy === 'faiza' ? 'faiza_wallet' : 'buffer';
      updateMemberSelectorsUI();
    }

    if (selectedTxType !== 'transfer') {
      const activeCats = getActiveFormCategories();
      if (!activeCats.some(c => c.id === selectedCategory)) {
        selectedCategory = activeCats[0]?.id || 'rent';
      }
      renderCategoriesGrid();
    }
    updateTxTypeUI();
  }

  function updateTransferFormBalancePreview() {
    const bufferBalEl = document.getElementById('transfer-form-buffer-bal');
    const faizaBalEl = document.getElementById('transfer-form-faiza-bal');
    if (!bufferBalEl && !faizaBalEl) return;
    const stats = computeFundBalances();
    if (bufferBalEl) {
      bufferBalEl.textContent = `Avail: ${settings.currency} ${formatNumber(stats.bufferRunningBalance)}`;
    }
    if (faizaBalEl) {
      faizaBalEl.textContent = `Bal: ${settings.currency} ${formatNumber(stats.faizaWalletRunningBalance)}`;
    }
  }

  function updateTxTypeUI() {
    const isIncome = selectedTxType === 'income';
    const isTransfer = selectedTxType === 'transfer';
    const isExpense = selectedTxType === 'expense';

    document.querySelectorAll('#tx-type-switcher .tx-type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-type') === selectedTxType);
    });

    const heroCard = document.getElementById('amount-hero-card');
    const heroLabel = document.getElementById('amount-hero-label');
    const transferRouteCard = document.getElementById('transfer-route-card');
    const catSectionHeader = document.getElementById('category-section-header');
    const catGrid = document.getElementById('category-grid');
    const paidFromGroup = document.getElementById('expense-paid-from-group');
    const catSectionTitle = document.getElementById('category-section-title');
    const memberLabelText = document.getElementById('form-member-label-text');
    const submitBtn = document.getElementById('save-expense-btn');
    const submitBtnText = document.getElementById('save-expense-btn-text');
    const notesInput = document.getElementById('notes-input');

    if (heroCard) {
      heroCard.classList.toggle('income-mode', isIncome);
      heroCard.classList.toggle('transfer-mode', isTransfer);
    }
    if (heroLabel) {
      heroLabel.textContent = isTransfer
        ? "Transfer Amount to Faiza's Wallet"
        : isIncome
        ? 'Buffer Account Contribution / Fund In'
        : 'Expenditure Amount';
    }
    if (transferRouteCard) {
      transferRouteCard.style.display = isTransfer ? 'block' : 'none';
      if (isTransfer) updateTransferFormBalancePreview();
    }
    if (catSectionHeader) {
      catSectionHeader.style.display = isTransfer ? 'none' : 'flex';
    }
    if (catGrid) {
      catGrid.style.display = isTransfer ? 'none' : 'grid';
    }
    if (paidFromGroup) {
      paidFromGroup.style.display = isExpense ? 'flex' : 'none';
    }
    if (catSectionTitle) {
      catSectionTitle.textContent = isIncome ? 'Select Income Category' : 'Select Expense Category';
    }
    if (memberLabelText) {
      memberLabelText.textContent = isTransfer
        ? 'Transferred By'
        : isIncome
        ? 'Contributed By (into Buffer Account)'
        : 'Spent By';
    }
    if (submitBtn) {
      submitBtn.classList.toggle('income-mode', isIncome);
      submitBtn.classList.toggle('transfer-mode', isTransfer);
    }
    if (submitBtnText) {
      submitBtnText.textContent = isTransfer
        ? "Transfer to Faiza's Wallet"
        : isIncome
        ? 'Add to Buffer Account'
        : 'Save Expenditure';
    }
    if (notesInput) {
      notesInput.placeholder = isTransfer
        ? 'e.g. Sent to Faiza for groceries & household expenses...'
        : isIncome
        ? 'e.g. Monthly house fund transfer to buffer account...'
        : 'e.g. Monthly house rent, staff salary, pharmacy, utility bill...';
    }
  }

  // --- Storage ---
  function loadCustomCategories() {
    try {
      const saved = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          customCategories = parsed;
        }
      }
    } catch (e) {
      console.error('Error loading custom categories', e);
      customCategories = [];
    }
    updateCategoriesSettingsSubtitle();
  }

  function saveCustomCategories(skipCloudSync = false) {
    try {
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customCategories));
    } catch (e) {
      console.error('Error saving custom categories', e);
    }
    updateCategoriesSettingsSubtitle();
    if (!skipCloudSync && db) {
      uploadCustomCategoriesToCloud(customCategories);
    }
  }

  function updateCategoriesSettingsSubtitle() {
    const sub = document.getElementById('settings-categories-sub');
    if (sub) {
      const expCount = getExpenseCategories().length;
      const incCount = getIncomeCategories().length;
      sub.textContent = `${expCount} expense & ${incCount} income categories active`;
    }
  }

  function syncCustomPocketBudget() {
    const customPocket = customCategories.find(
      c => (c.type || 'expense') === 'expense' && (c.name || '').trim().toLowerCase() === 'pocket'
    );
    if (customPocket) {
      if (!settings.budgets[customPocket.id]) {
        settings.budgets[customPocket.id] = DEFAULT_BUDGETS.pocket;
      }
      settings.budgets.pocket = 0;
    }
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        settings = Object.assign(settings, parsed);
        if (!parsed.budgets || parsed.budgets._v !== BUDGET_DEFAULTS_VERSION) {
          // Apply updated v2 default budgets (Total: PKR 531,500)
          settings.budgets = Object.assign({}, parsed.budgets || {}, DEFAULT_BUDGETS);
        } else {
          settings.budgets = Object.assign({}, DEFAULT_BUDGETS, parsed.budgets || {});
        }
      } else {
        settings.budgets = Object.assign({}, DEFAULT_BUDGETS);
      }
    } catch (e) {
      console.error('Error loading settings', e);
    }
    syncCustomPocketBudget();
    settings.householdId = DEFAULT_HOUSEHOLD_ID;
    settings.cycleStartDay = Math.min(31, Math.max(1, parseInt(settings.cycleStartDay, 10) || 1));
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
    updateCurrencyDisplay();
    updateCycleSettingsSubtitle();
  }

  function saveSettings(skipCloudSync = false) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
    updateCurrencyDisplay();
    updateCycleSettingsSubtitle();
    if (!skipCloudSync && db) {
      uploadBudgetsToCloud(settings.budgets);
      uploadCycleToCloud();
    }
  }

  // ==========================================================================
  // CONFIGURABLE MONTHLY BUDGET & ANALYTICS CYCLE HELPERS
  // ==========================================================================

  function createClampedDate(year, monthIndex, day) {
    const maxDay = new Date(year, monthIndex + 1, 0).getDate();
    return new Date(year, monthIndex, Math.min(Math.max(1, day), maxDay));
  }

  function getOrdinalSuffix(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  const MONTH_NAME_MAP = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12
  };

  function normalizeDateYMD(rawDate, fallbackTimestamp) {
    if (rawDate) {
      const str = String(rawDate).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return str;
      }
      const clean = str.replace(/[,/.\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const parts = clean.split('-');
      if (parts.length === 3) {
        const parseMonthToken = (tok) => {
          const low = String(tok).toLowerCase();
          if (MONTH_NAME_MAP[low]) return MONTH_NAME_MAP[low];
          const num = parseInt(tok, 10);
          return (!isNaN(num) && num >= 1 && num <= 12) ? num : null;
        };

        let y = null, m = null, d = null;
        if (parts[0].length === 4 && !isNaN(parseInt(parts[0], 10))) {
          y = parseInt(parts[0], 10);
          m = parseMonthToken(parts[1]);
          d = parseInt(parts[2], 10);
        } else if (parts[2].length === 4 && !isNaN(parseInt(parts[2], 10))) {
          y = parseInt(parts[2], 10);
          const mMid = parseMonthToken(parts[1]);
          const mFirst = parseMonthToken(parts[0]);
          if (mMid !== null && !isNaN(parseInt(parts[0], 10))) {
            d = parseInt(parts[0], 10);
            m = mMid;
          } else if (mFirst !== null && !isNaN(parseInt(parts[1], 10))) {
            m = mFirst;
            d = parseInt(parts[1], 10);
          }
        }
        if (y && m && d && d >= 1 && d <= 31) {
          return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
      }
      const parsedDt = new Date(str);
      if (!isNaN(parsedDt.getTime())) {
        return formatDateYMD(parsedDt);
      }
    }
    if (fallbackTimestamp) {
      const tsDt = new Date(fallbackTimestamp);
      if (!isNaN(tsDt.getTime())) {
        return formatDateYMD(tsDt);
      }
    }
    return '';
  }

  /**
   * Computes the active or offset monthly expenditure cycle period.
   * For example, if cycleStartDay is 23 (or cycleStartDate is '2026-10-23'),
   * the cycle runs from 23 Oct 2026 to 22 Nov 2026 ("November 2026 Budget").
   */
  function getCyclePeriod(offsetMonths = 0, customStartDateStr = null, customStartDay = null, customEndDateStr = null) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeDateStr = customStartDateStr !== null ? customStartDateStr : (settings.cycleStartDate || '');
    const activeEndStr = customEndDateStr !== null ? customEndDateStr : (settings.cycleEndDate || '');
    const activeDay = customStartDay !== null
      ? Math.min(31, Math.max(1, parseInt(customStartDay, 10) || 1))
      : Math.min(31, Math.max(1, parseInt(settings.cycleStartDay, 10) || 1));

    let baseStartYear = today.getFullYear();
    let baseStartMonth = today.getMonth();
    let startDay = activeDay;

    // If a cycleStartDate is configured (or passed for preview), anchor directly to it
    let usedExplicitAnchor = false;
    if (activeDateStr && /^\d{4}-\d{2}-\d{2}$/.test(activeDateStr)) {
      const parts = activeDateStr.split('-').map(n => parseInt(n, 10));
      baseStartYear = parts[0];
      baseStartMonth = parts[1] - 1;
      startDay = parts[2];
      usedExplicitAnchor = true;
    }

    if (!usedExplicitAnchor) {
      // Automatically compute current cycle containing today based on recurring startDay
      const clampedThisMonthStart = createClampedDate(today.getFullYear(), today.getMonth(), startDay);
      if (today >= clampedThisMonthStart) {
        baseStartYear = today.getFullYear();
        baseStartMonth = today.getMonth();
      } else {
        baseStartYear = today.getFullYear();
        baseStartMonth = today.getMonth() - 1;
      }
    }

    const targetMonthIndex = baseStartMonth + offsetMonths;
    const cycleStart = createClampedDate(baseStartYear, targetMonthIndex, startDay);
    let cycleEnd;

    if (offsetMonths === 0 && activeEndStr && /^\d{4}-\d{2}-\d{2}$/.test(activeEndStr)) {
      const endParts = activeEndStr.split('-').map(n => parseInt(n, 10));
      const parsedEnd = new Date(endParts[0], endParts[1] - 1, endParts[2]);
      if (parsedEnd >= cycleStart) {
        cycleEnd = parsedEnd;
      }
    }

    if (!cycleEnd) {
      const nextCycleStart = createClampedDate(baseStartYear, targetMonthIndex + 1, startDay);
      cycleEnd = new Date(nextCycleStart.getFullYear(), nextCycleStart.getMonth(), nextCycleStart.getDate() - 1);
    }

    const startYMD = formatDateYMD(cycleStart);
    const endYMD = formatDateYMD(cycleEnd);

    // Determine primary month name for this expenditure cycle:
    // If cycle starts on or after the 15th (e.g., 23-Oct to 22-Nov), it represents the upcoming month (November).
    // Otherwise (e.g., 1-Nov to 30-Nov), it represents the start month (November).
    const labelRefDate = cycleStart.getDate() >= 15 ? cycleEnd : cycleStart;
    const monthYearName = labelRefDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const shortMonthName = labelRefDate.toLocaleDateString(undefined, { month: 'short' });

    const fmtShort = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    const fmtFull = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

    const rangeLabel = `${fmtShort(cycleStart)} – ${fmtShort(cycleEnd)}`;
    const fullRangeLabel = `${fmtFull(cycleStart)} – ${fmtFull(cycleEnd)}`;

    const totalDays = Math.max(1, Math.round((cycleEnd - cycleStart) / 86400000) + 1);
    let daysElapsed = totalDays;
    if (today < cycleStart) {
      daysElapsed = 1;
    } else if (today <= cycleEnd) {
      daysElapsed = Math.max(1, Math.round((today - cycleStart) / 86400000) + 1);
    }

    return {
      startDate: cycleStart,
      endDate: cycleEnd,
      startYMD,
      endYMD,
      startDay: cycleStart.getDate(),
      monthYearName,
      shortMonthName,
      title: `${monthYearName} Budget`,
      rangeLabel,
      fullRangeLabel,
      cycleKey: `${startYMD}_${endYMD}`,
      totalDays,
      daysElapsed,
      isInCycle: (dateOrTs) => {
        const norm = typeof dateOrTs === 'number'
          ? normalizeDateYMD('', dateOrTs)
          : normalizeDateYMD(dateOrTs);
        return Boolean(norm && norm >= startYMD && norm <= endYMD);
      }
    };
  }

  function updateCycleSettingsSubtitle() {
    const cycle = getCyclePeriod(0);
    const subEl = document.getElementById('settings-cycle-sub');
    if (subEl) {
      subEl.textContent = `Starts on ${getOrdinalSuffix(cycle.startDay)} (${cycle.rangeLabel})`;
    }
    const pillTextEl = document.getElementById('analytics-cycle-range-text');
    if (pillTextEl) {
      pillTextEl.textContent = cycle.rangeLabel;
    }
    const fundPillTextEl = document.getElementById('fund-cycle-range-text');
    if (fundPillTextEl) {
      fundPillTextEl.textContent = cycle.rangeLabel;
    }
    const exportSelect = document.getElementById('export-range-select');
    if (exportSelect) {
      const prevCycle = getCyclePeriod(-1);
      const optAll = exportSelect.querySelector('option[value="all"]');
      const optThis = exportSelect.querySelector('option[value="this_month"]');
      const optPrev = exportSelect.querySelector('option[value="prev_month"]');
      if (optAll) optAll.textContent = `All Transactions (${transactions.length})`;
      if (optThis) optThis.textContent = `This Cycle (${cycle.rangeLabel})`;
      if (optPrev) optPrev.textContent = `Previous Cycle (${prevCycle.rangeLabel})`;
    }
  }

  function loadAlertedThresholds() {
    try {
      const saved = localStorage.getItem(ALERTS_KEY);
      if (saved) {
        alertedThresholds = JSON.parse(saved);
      }
    } catch (e) {
      alertedThresholds = {};
    }
  }

  function saveAlertedThresholds() {
    try {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alertedThresholds));
    } catch (e) {}
  }

  function loadTransactions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        transactions = JSON.parse(data);
        if (Array.isArray(transactions)) {
          transactions.forEach(tx => {
            if (tx) {
              const norm = normalizeDateYMD(tx.date, tx.timestamp);
              if (norm) tx.date = norm;
              tx.amount = Number(tx.amount) || 0;
            }
          });
        }
      } else {
        transactions = [];
      }
    } catch (e) {
      console.error('Error loading transactions', e);
      transactions = [];
    }
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions', e);
    }
    renderTransactionsHistory();
    updateAnalytics();
    renderDueDatesUI();
    updateCSVPreview();
    updateMonthSummaryBadge();
  }

  // ==========================================================================
  // FIREBASE CLOUD FIRESTORE REAL-TIME SYNC (Isolated: paragon_household)
  // ==========================================================================

  function initFirebase() {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded, using offline local storage');
      updateCloudStatusUI('offline', 'Offline');
      return;
    }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }
      db = firebase.firestore();

      // Enable offline persistence in browser
      db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firestore multi-tab persistence active');
        } else {
          console.warn('Firestore persistence status:', err.code);
        }
      });

      updateCloudStatusUI('syncing', 'Connecting...');
      setupFirestoreListeners();
    } catch (err) {
      console.error('Firebase initialization error:', err);
      updateCloudStatusUI('offline', 'Sync Error');
    }
  }

  function updateCloudStatusUI(status, label) {
    cloudSyncStatus = status;
    const headerPill = document.getElementById('cloud-status-pill');
    const headerText = document.getElementById('cloud-status-text');
    const settingsBadge = document.getElementById('settings-cloud-badge');
    const settingsText = document.getElementById('settings-cloud-text');

    const statusClass = status === 'connected' ? 'connected' : status === 'syncing' ? 'syncing' : 'offline';
    const headerLabel = (status === 'connected' ? 'Live' : status === 'syncing' ? 'Syncing' : 'Offline');
    const fullText = label || (status === 'connected' ? 'Live Cloud Sync' : status === 'syncing' ? 'Syncing...' : 'Offline');

    if (headerPill) headerPill.className = `cloud-status-pill ${statusClass}`;
    if (headerText) headerText.textContent = headerLabel;
    if (settingsBadge) settingsBadge.className = `cloud-status-pill ${statusClass}`;
    if (settingsText) settingsText.textContent = fullText;
  }

  function setupFirestoreListeners() {
    if (!db) return;
    const householdId = DEFAULT_HOUSEHOLD_ID;

    // 1. Listen for real-time transactions across Adil, Faiza, and Haseeb's devices
    const txCollection = db.collection('households').doc(householdId).collection('transactions');

    firestoreUnsubscribe = txCollection.onSnapshot((snapshot) => {
      isSyncingFromCloud = true;
      const cloudTxs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.id) {
          const normDate = normalizeDateYMD(data.date, data.timestamp);
          if (normDate) data.date = normDate;
          data.amount = Number(data.amount) || 0;
          cloudTxs.push(data);
        }
      });

      if (cloudTxs.length > 0) {
        const cloudIds = new Set(cloudTxs.map(t => t.id));
        let missingUploadCount = 0;
        transactions.forEach((localTx) => {
          if (!cloudIds.has(localTx.id)) {
            uploadTransactionToCloud(localTx);
            cloudTxs.push(localTx);
            missingUploadCount++;
          }
        });

        cloudTxs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        transactions = cloudTxs;

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        } catch (e) {}

        renderTransactionsHistory();
        updateAnalytics();
        renderDueDatesUI();
        updateCSVPreview();
        updateMonthSummaryBadge();
        updateCloudStatusUI('connected', 'Live Sync');

        if (missingUploadCount > 0) {
          showToast(`☁️ Synced ${missingUploadCount} offline records to Paragon cloud!`);
        }
      } else if (transactions.length > 0) {
        uploadAllLocalTransactionsToCloud();
      } else {
        updateCloudStatusUI('connected', 'Live Sync');
      }

      isSyncingFromCloud = false;
    }, (err) => {
      console.warn('Firestore snapshot error:', err);
      updateCloudStatusUI('offline', 'Offline');
      isSyncingFromCloud = false;
    });

    // 2. Listen for shared category budgets
    const budgetDoc = db.collection('households').doc(householdId).collection('settings').doc('budgets');
    firestoreBudgetsUnsubscribe = budgetDoc.onSnapshot((doc) => {
      if (doc.exists) {
        const cloudBudgets = doc.data();
        if (cloudBudgets) {
          if (cloudBudgets._v !== BUDGET_DEFAULTS_VERSION) {
            // Migrate cloud budgets to v2 defaults (Total: PKR 531,500)
            settings.budgets = Object.assign({}, cloudBudgets, DEFAULT_BUDGETS);
            syncCustomPocketBudget();
            saveSettings(false);
          } else {
            settings.budgets = Object.assign({}, DEFAULT_BUDGETS, cloudBudgets);
            syncCustomPocketBudget();
            saveSettings(true);
          }
          updateAnalytics();
        }
      } else {
        uploadBudgetsToCloud(settings.budgets);
      }
    }, (err) => {
      console.warn('Firestore budget snapshot error:', err);
    });

    // 3. Listen for shared custom categories
    const categoriesDoc = db.collection('households').doc(householdId).collection('settings').doc('categories');
    firestoreCategoriesUnsubscribe = categoriesDoc.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data && Array.isArray(data.items)) {
          // Merge any local custom categories not yet in cloud
          const cloudIds = new Set(data.items.map(c => c.id));
          let hasNewLocal = false;
          const merged = [...data.items];
          customCategories.forEach(localCat => {
            if (!cloudIds.has(localCat.id)) {
              merged.push(localCat);
              hasNewLocal = true;
            }
          });
          customCategories = merged;
          syncCustomPocketBudget();
          saveCustomCategories(!hasNewLocal);
          renderCategoriesGrid();
          renderCategoryFilters();
          updateAnalytics();
        }
      } else if (customCategories.length > 0) {
        uploadCustomCategoriesToCloud(customCategories);
      }
    }, (err) => {
      console.warn('Firestore categories snapshot error:', err);
    });

    // 4. Listen for shared monthly cycle start date configuration
    const cycleDoc = db.collection('households').doc(householdId).collection('settings').doc('cycle');
    firestoreCycleUnsubscribe = cycleDoc.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data && data.cycleStartDay) {
          settings.cycleStartDay = Math.min(31, Math.max(1, parseInt(data.cycleStartDay, 10) || 1));
          settings.cycleStartDate = data.cycleStartDate || '';
          settings.cycleEndDate = data.cycleEndDate || '';
          settings.cycleLockedCustom = Boolean(data.cycleLockedCustom);
          saveSettings(true);
          updateAnalytics();
          renderDueDatesUI();
          updateCSVPreview();
          updateMonthSummaryBadge();
        }
      }
    }, (err) => {
      console.warn('Firestore cycle snapshot error:', err);
    });

    // 5. Listen for shared expenditure due dates & alerts
    const dueDatesDoc = db.collection('households').doc(householdId).collection('settings').doc('dueDates');
    firestoreDueDatesUnsubscribe = dueDatesDoc.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data && Array.isArray(data.items)) {
          dueDateItems = data.items;
          saveDueDates(true);
          renderDueDatesUI();
        }
      } else if (dueDateItems.length > 0) {
        uploadDueDatesToCloud(dueDateItems);
      }
    }, (err) => {
      console.warn('Firestore dueDates snapshot error:', err);
    });
  }

  function uploadTransactionToCloud(tx) {
    if (!db) return;
    const householdId = DEFAULT_HOUSEHOLD_ID;
    updateCloudStatusUI('syncing', 'Syncing...');

    if (!tx.spentBy) {
      const mem = getMemberInfo(deviceProfile || 'adil');
      tx.spentBy = mem.id;
      tx.spentByName = mem.name;
      tx.spentByAvatar = mem.avatar;
    }
    if (!tx.type) {
      tx.type = 'expense';
    }

    db.collection('households').doc(householdId).collection('transactions').doc(tx.id).set(tx)
      .then(() => {
        updateCloudStatusUI('connected', 'Live Sync');
      })
      .catch((err) => {
        console.warn('Firestore upload tx error:', err);
        updateCloudStatusUI('offline', 'Offline (Queued)');
      });
  }

  function deleteTransactionFromCloud(txId) {
    if (!db) return;
    const householdId = DEFAULT_HOUSEHOLD_ID;
    updateCloudStatusUI('syncing', 'Syncing...');
    db.collection('households').doc(householdId).collection('transactions').doc(txId).delete()
      .then(() => {
        updateCloudStatusUI('connected', 'Live Sync');
      })
      .catch((err) => {
        console.warn('Firestore delete tx error:', err);
        updateCloudStatusUI('offline', 'Offline (Queued)');
      });
  }

  function uploadBudgetsToCloud(budgets) {
    if (!db) return;
    const householdId = DEFAULT_HOUSEHOLD_ID;
    db.collection('households').doc(householdId).collection('settings').doc('budgets').set(budgets)
      .catch((err) => console.warn('Firestore budget upload error:', err));
  }

  function uploadCustomCategoriesToCloud(catList) {
    if (!db) return;
    const householdId = DEFAULT_HOUSEHOLD_ID;
    db.collection('households').doc(householdId).collection('settings').doc('categories').set({
      items: catList,
      updatedAt: Date.now()
    }).catch((err) => console.warn('Firestore custom categories upload error:', err));
  }

  function uploadCycleToCloud() {
    if (!db) return;
    const householdId = DEFAULT_HOUSEHOLD_ID;
    db.collection('households').doc(householdId).collection('settings').doc('cycle').set({
      cycleStartDay: settings.cycleStartDay || 1,
      cycleStartDate: settings.cycleStartDate || '',
      cycleEndDate: settings.cycleEndDate || '',
      cycleLockedCustom: Boolean(settings.cycleLockedCustom),
      updatedAt: Date.now()
    }).catch((err) => console.warn('Firestore cycle upload error:', err));
  }

  function uploadDueDatesToCloud(list) {
    if (!db) return;
    const householdId = DEFAULT_HOUSEHOLD_ID;
    db.collection('households').doc(householdId).collection('settings').doc('dueDates').set({
      items: list || dueDateItems,
      updatedAt: Date.now()
    }).catch((err) => console.warn('Firestore dueDates upload error:', err));
  }

  function uploadAllLocalTransactionsToCloud() {
    if (!db || transactions.length === 0) return;
    const householdId = DEFAULT_HOUSEHOLD_ID;
    updateCloudStatusUI('syncing', 'Uploading...');
    const batch = db.batch();
    const col = db.collection('households').doc(householdId).collection('transactions');

    transactions.forEach((tx) => {
      if (!tx.spentBy) {
        const mem = getMemberInfo(deviceProfile || 'adil');
        tx.spentBy = mem.id;
        tx.spentByName = mem.name;
        tx.spentByAvatar = mem.avatar;
      }
      if (!tx.type) tx.type = 'expense';
      const ref = col.doc(tx.id);
      batch.set(ref, tx);
    });

    batch.commit()
      .then(() => {
        updateCloudStatusUI('connected', 'Live Sync');
        showToast('☁️ All records synced to Paragon household cloud!');
      })
      .catch((err) => {
        console.warn('Batch upload error:', err);
        updateCloudStatusUI('offline', 'Offline (Queued)');
      });
  }

  // ==========================================================================
  // CATEGORY GRID & CUSTOM CATEGORY CREATION
  // ==========================================================================

  function renderCategoriesGrid() {
    const grid = document.getElementById('category-grid');
    const countBadge = document.getElementById('category-count-badge');
    if (!grid) return;

    const activeCategories = getActiveFormCategories();
    if (countBadge) {
      countBadge.textContent = `${activeCategories.length} Categories`;
    }

    const cardsHtml = activeCategories.map((cat) => {
      const isSelected = cat.id === selectedCategory;
      return `
        <button type="button" 
                class="category-card ${isSelected ? 'selected' : ''}" 
                data-id="${escapeHTML(cat.id)}"
                style="--cat-color: ${cat.color}; --cat-bg: ${cat.bg}; --cat-glow: ${cat.glow};"
                aria-pressed="${isSelected}">
          <div class="category-icon-wrapper">
            ${ICONS[cat.icon] || ICONS['tag']}
          </div>
          <span class="category-name">${escapeHTML(cat.name)}</span>
          <span class="category-badge-check">${ICONS['check']}</span>
        </button>
      `;
    }).join('');

    // Append "+ Add" tile right in the category grid
    const addTileHtml = `
      <button type="button"
              class="category-card add-category-card"
              data-action="open-add-category"
              title="Create a new category">
        <div class="category-icon-wrapper" style="color: var(--primary); background: rgba(59, 130, 246, 0.14);">
          ${ICONS['plus']}
        </div>
        <span class="category-name" style="color: var(--primary);">+ Add New</span>
      </button>
    `;

    grid.innerHTML = cardsHtml + addTileHtml;
  }

  function openAddCategoryModal(defaultType) {
    const modal = document.getElementById('add-category-modal');
    const nameInput = document.getElementById('new-cat-name-input');
    const budgetInput = document.getElementById('new-cat-budget-input');
    if (!modal) return;

    newCatType = defaultType || selectedTxType || 'expense';
    newCatIcon = 'tag';
    newCatColor = CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];

    if (nameInput) nameInput.value = '';
    if (budgetInput) budgetInput.value = '';

    updateAddCategoryModalUI();
    modal.classList.add('active');
    setTimeout(() => nameInput?.focus(), 150);
  }

  function updateAddCategoryModalUI() {
    // Type selector pills
    document.querySelectorAll('#new-cat-type-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat-type') === newCatType);
    });

    // Show/hide initial budget input based on Expense vs Income
    const budgetGroup = document.getElementById('new-cat-budget-group');
    if (budgetGroup) {
      budgetGroup.style.display = newCatType === 'expense' ? 'flex' : 'none';
    }

    // Icon picker
    const iconGrid = document.getElementById('new-cat-icon-grid');
    if (iconGrid) {
      iconGrid.innerHTML = PICKABLE_ICONS.map(iconKey => `
        <button type="button"
                class="icon-picker-btn ${iconKey === newCatIcon ? 'active' : ''}"
                data-icon="${iconKey}"
                title="${iconKey}">
          ${ICONS[iconKey]}
        </button>
      `).join('');
    }

    // Color picker
    const colorGrid = document.getElementById('new-cat-color-grid');
    if (colorGrid) {
      colorGrid.innerHTML = CATEGORY_COLORS.map(colorHex => `
        <button type="button"
                class="color-picker-btn ${colorHex === newCatColor ? 'active' : ''}"
                data-color="${colorHex}"
                style="background: ${colorHex};"
                aria-label="Color ${colorHex}">
        </button>
      `).join('');
    }

    // Existing custom categories list
    const manageSection = document.getElementById('custom-categories-manage-section');
    const manageList = document.getElementById('custom-categories-manage-list');
    if (manageSection && manageList) {
      if (customCategories.length === 0) {
        manageSection.style.display = 'none';
      } else {
        manageSection.style.display = 'block';
        manageList.innerHTML = customCategories.map(cat => `
          <div class="custom-cat-item">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="cat-dot" style="background: ${cat.color};"></span>
              <span style="font-weight: 700;">${escapeHTML(cat.name)}</span>
              <span style="font-size: 0.7rem; color: var(--text-muted);">(${cat.type === 'income' ? 'Income' : 'Expense'})</span>
            </div>
            <button type="button" class="custom-cat-delete-btn" data-delete-cat="${escapeHTML(cat.id)}">
              Delete
            </button>
          </div>
        `).join('');
      }
    }
  }

  function handleSaveNewCategory() {
    const nameInput = document.getElementById('new-cat-name-input');
    const budgetInput = document.getElementById('new-cat-budget-input');
    const rawName = (nameInput?.value || '').trim();

    if (!rawName) {
      showToast('⚠️ Please enter a category name');
      nameInput?.focus();
      return;
    }

    // Check duplicate name within the same type
    const existingList = newCatType === 'income' ? getIncomeCategories() : getExpenseCategories();
    if (existingList.some(c => c.name.toLowerCase() === rawName.toLowerCase())) {
      showToast(`⚠️ Category "${rawName}" already exists`);
      return;
    }

    const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cat';
    const newId = `custom_${slug}_${Date.now().toString(36).slice(-4)}`;

    const newCatObj = {
      id: newId,
      name: rawName,
      type: newCatType,
      icon: newCatIcon || 'tag',
      color: newCatColor || '#6366f1',
      bg: hexToRgba(newCatColor, 0.16),
      glow: hexToRgba(newCatColor, 0.35),
      isCustom: true
    };

    customCategories.push(newCatObj);
    saveCustomCategories();

    // If expense category and budget entered, save budget
    if (newCatType === 'expense') {
      const bVal = parseFloat(budgetInput?.value) || 0;
      settings.budgets[newId] = Math.max(0, bVal);
      saveSettings();
    }

    // Switch form to this type & select the new category
    selectedTxType = newCatType;
    selectedCategory = newId;
    updateTxTypeUI();
    renderCategoriesGrid();
    renderCategoryFilters();
    updateAnalytics();
    closeAddCategoryModal();
    triggerHaptic();
    showToast(`✅ Added new ${newCatType} category: "${rawName}"`);
  }

  function handleDeleteCustomCategory(catId) {
    const cat = customCategories.find(c => c.id === catId);
    if (!cat) return;
    if (!confirm(`Delete custom category "${cat.name}"? Existing transactions will keep their category label.`)) {
      return;
    }

    customCategories = customCategories.filter(c => c.id !== catId);
    saveCustomCategories();

    const activeCats = getActiveFormCategories();
    if (!activeCats.some(c => c.id === selectedCategory)) {
      selectedCategory = activeCats[0]?.id || 'rent';
    }

    updateAddCategoryModalUI();
    renderCategoriesGrid();
    renderCategoryFilters();
    updateAnalytics();
    showToast(`Removed category "${cat.name}"`);
  }

  function closeAddCategoryModal() {
    document.getElementById('add-category-modal')?.classList.remove('active');
  }

  // --- Render Category Filters in History ---
  function renderCategoryFilters() {
    const container = document.getElementById('filter-pills-container');
    if (!container) return;

    if (historyTypeFilter === 'transfer') {
      container.innerHTML = `
        <button type="button" class="filter-chip active" data-cat="all">
          🔄 All Buffer → Faiza Transfers
        </button>
      `;
      return;
    }

    let catsToShow = getAllCategories();
    if (historyTypeFilter === 'expense') {
      catsToShow = getExpenseCategories();
    } else if (historyTypeFilter === 'income') {
      catsToShow = getIncomeCategories();
    }

    let html = `
      <button type="button" class="filter-chip ${historyCategoryFilter === 'all' ? 'active' : ''}" data-cat="all">
        All Categories
      </button>
    `;

    catsToShow.forEach((cat) => {
      const isActive = historyCategoryFilter === cat.id;
      html += `
        <button type="button" class="filter-chip ${isActive ? 'active' : ''}" data-cat="${escapeHTML(cat.id)}">
          ${escapeHTML(cat.name)}
        </button>
      `;
    });

    container.innerHTML = html;
  }

  // --- Date/Time Selection ---
  function updateDateSelectorUI() {
    const nowPill = document.getElementById('date-pill-now');
    const yesterdayPill = document.getElementById('date-pill-yesterday');
    const customPill = document.getElementById('date-pill-custom');
    const customContainer = document.getElementById('custom-datetime-container');
    const customDateInput = document.getElementById('custom-date-input');
    const customTimeInput = document.getElementById('custom-time-input');

    if (!nowPill) return;

    [nowPill, yesterdayPill, customPill].forEach(p => p.classList.remove('active'));

    if (dateSelectionMode === 'now') {
      nowPill.classList.add('active');
      customContainer.classList.remove('visible');
    } else if (dateSelectionMode === 'yesterday') {
      yesterdayPill.classList.add('active');
      customContainer.classList.remove('visible');
    } else if (dateSelectionMode === 'custom') {
      customPill.classList.add('active');
      customContainer.classList.add('visible');

      const now = new Date();
      if (!customDateInput.value) {
        customDateInput.value = formatDateYMD(now);
      }
      if (!customTimeInput.value) {
        customTimeInput.value = formatTimeHM(now);
      }
    }
  }

  function getActiveTimestamp() {
    const now = new Date();
    if (dateSelectionMode === 'now') {
      return now;
    } else if (dateSelectionMode === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    } else if (dateSelectionMode === 'custom') {
      const dateInput = document.getElementById('custom-date-input').value;
      const timeInput = document.getElementById('custom-time-input').value || '12:00';
      if (dateInput) {
        const dt = new Date(`${dateInput}T${timeInput}:00`);
        if (!isNaN(dt.getTime())) {
          return dt;
        }
      }
      return now;
    }
    return now;
  }

  // --- Quick Amount Chips ---
  function handleQuickAmount(addValue) {
    const input = document.getElementById('amount-input');
    let current = parseFloat(input.value) || 0;
    current += addValue;
    input.value = current.toFixed(current % 1 === 0 ? 0 : 2);
    triggerHaptic();
  }

  function handleClearAmount() {
    const input = document.getElementById('amount-input');
    input.value = '';
    input.focus();
    triggerHaptic();
  }

  // --- Add Transaction (Expense, Fund In, or Transfer to Faiza's Wallet) ---
  function handleAddExpense(e) {
    if (e) e.preventDefault();

    const amountInput = document.getElementById('amount-input');
    const notesInput = document.getElementById('notes-input');

    const amount = parseFloat(amountInput.value);
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast('⚠️ Please enter a valid amount');
      amountInput.focus();
      return;
    }

    const timestampObj = getActiveTimestamp();
    const memInfo = getMemberInfo(selectedSpentBy || deviceProfile || 'adil');
    const txType = (selectedTxType === 'income' || selectedTxType === 'transfer') ? selectedTxType : 'expense';

    let categoryId = 'rent';
    let categoryName = 'Rent';
    let paidFrom = 'buffer';
    let transferTo = '';

    if (txType === 'transfer') {
      categoryId = 'transfer-to-faiza';
      categoryName = "Transfer to Faiza's Wallet";
      paidFrom = 'buffer';
      transferTo = 'faiza_wallet';
    } else {
      const activeCats = getActiveFormCategories();
      const categoryObj = activeCats.find(c => c.id === selectedCategory) || activeCats[0];
      categoryId = categoryObj.id;
      categoryName = categoryObj.name;
      paidFrom = txType === 'expense'
        ? (selectedPaidFrom || (memInfo.id === 'faiza' ? 'faiza_wallet' : 'buffer'))
        : 'buffer';
    }

    // Calculate current category spend before adding if it's an expense
    const currentCycle = getCyclePeriod(0);
    const oldSpent = txType === 'expense'
      ? transactions
          .filter(t => (t.type || 'expense') === 'expense' && t.categoryId === categoryId && currentCycle.isInCycle(t.date))
          .reduce((sum, t) => sum + t.amount, 0)
      : 0;

    const newTransaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: txType,
      amount: Math.round(amount * 100) / 100,
      currency: settings.currency,
      categoryId: categoryId,
      categoryName: categoryName,
      paidFrom: paidFrom,
      transferTo: transferTo,
      paidDueId: activePayingDueId || '',
      spentBy: memInfo.id,
      spentByName: memInfo.name,
      spentByAvatar: memInfo.avatar,
      notes: notesInput.value.trim(),
      date: formatDateYMD(timestampObj),
      time: formatTimeHMS(timestampObj),
      timestamp: timestampObj.getTime()
    };

    // If user clicked "Pay Now" on a due date alert, mark that due item as paid for this month
    if (txType === 'expense' && activePayingDueId) {
      const dueItem = dueDateItems.find(d => d.id === activePayingDueId);
      if (dueItem) {
        const ymKey = newTransaction.date.slice(0, 7);
        dueItem.paidPeriods = dueItem.paidPeriods || {};
        dueItem.paidPeriods[ymKey] = true;
        saveDueDates();
      }
      activePayingDueId = null;
    }

    transactions.unshift(newTransaction);
    saveTransactions();
    updateTransferFormBalancePreview();

    // Upload to Firebase Cloud
    if (db) {
      uploadTransactionToCloud(newTransaction);
    }

    // Check budget thresholds only for expenses in the current configured cycle
    if (txType === 'expense' && currentCycle.isInCycle(newTransaction.date)) {
      const newSpent = oldSpent + newTransaction.amount;
      checkBudgetThresholds(categoryId, oldSpent, newSpent);
    }

    // Reset Form
    amountInput.value = '';
    notesInput.value = '';
    dateSelectionMode = 'now';
    updateDateSelectorUI();

    triggerHaptic();
    if (txType === 'transfer') {
      showToast(`🔄 ${memInfo.avatar} ${memInfo.name} transferred ${settings.currency} ${formatNumber(newTransaction.amount)} to 👛 Faiza's Wallet`, true, newTransaction.id);
    } else if (txType === 'income') {
      showToast(`💰 ${memInfo.avatar} ${memInfo.name} added +${settings.currency} ${formatNumber(newTransaction.amount)} to 🏦 Buffer Account`, true, newTransaction.id);
    } else {
      const sourceLabel = paidFrom === 'faiza_wallet' ? "👛 Faiza's Wallet" : '🏦 Buffer';
      showToast(`✅ ${memInfo.avatar} ${memInfo.name} spent ${settings.currency} ${formatNumber(newTransaction.amount)} in ${categoryName} (${sourceLabel})`, true, newTransaction.id);
    }
  }

  // --- Render Transaction History ---
  function renderTransactionsHistory() {
    const container = document.getElementById('transactions-container');
    if (!container) return;

    let filtered = [...transactions];

    // Filter by Transaction Type (All / Expense / Income / Transfer)
    if (historyTypeFilter !== 'all') {
      filtered = filtered.filter(tx => (tx.type || 'expense') === historyTypeFilter);
    }

    // Filter by Category
    if (historyCategoryFilter !== 'all' && historyTypeFilter !== 'transfer') {
      filtered = filtered.filter(tx => tx.categoryId === historyCategoryFilter);
    }

    // Filter by Sibling Member
    if (historyMemberFilter !== 'all') {
      filtered = filtered.filter(tx => getMemberInfo(tx.spentBy).id === historyMemberFilter);
    }

    // Filter by Search Query
    if (historySearchQuery) {
      const q = historySearchQuery.toLowerCase();
      filtered = filtered.filter(tx =>
        (tx.notes && tx.notes.toLowerCase().includes(q)) ||
        (tx.categoryName && tx.categoryName.toLowerCase().includes(q)) ||
        (tx.spentByName && tx.spentByName.toLowerCase().includes(q)) ||
        (tx.amount.toString().includes(q))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${ICONS['shopping-cart']}</div>
          <div class="empty-title">No transactions found</div>
          <p class="empty-desc">Expenses, Buffer Account contributions, and transfers to Faiza's Wallet will appear here.</p>
        </div>
      `;
      return;
    }

    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Group by Day
    const groups = {};
    filtered.forEach(tx => {
      const groupKey = tx.date;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(tx);
    });

    let html = '';
    const todayYMD = formatDateYMD(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayYMD = formatDateYMD(yesterday);

    Object.keys(groups).forEach(dateStr => {
      const dayTxs = groups[dateStr];
      const dayExp = dayTxs.filter(t => (t.type || 'expense') === 'expense').reduce((s, t) => s + t.amount, 0);
      const dayInc = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const dayTrans = dayTxs.filter(t => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);

      let dayTitle = dateStr;
      if (dateStr === todayYMD) {
        dayTitle = 'Today';
      } else if (dateStr === yesterdayYMD) {
        dayTitle = 'Yesterday';
      } else {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const d = new Date(parts[0], parts[1] - 1, parts[2]);
          dayTitle = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }
      }

      const summaryParts = [];
      if (dayInc > 0) summaryParts.push(`<span style="color: var(--accent-green);">+${formatNumber(dayInc)}</span>`);
      if (dayExp > 0) summaryParts.push(`<span>-${formatNumber(dayExp)}</span>`);
      if (dayTrans > 0) summaryParts.push(`<span style="color: #a78bfa;">🔄 ${formatNumber(dayTrans)}</span>`);
      const daySummaryHtml = summaryParts.join(' • ') || `<span>${settings.currency} 0.00</span>`;

      html += `
        <div class="history-group">
          <div class="group-title">
            <span>${escapeHTML(dayTitle)}</span>
            <span>${daySummaryHtml}</span>
          </div>
          <div class="transactions-list">
            ${dayTxs.map(tx => {
              const isInc = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              let cat;
              if (isTransfer) {
                cat = {
                  name: "Buffer → Faiza's Wallet",
                  icon: 'transfer',
                  color: '#a78bfa',
                  bg: 'rgba(139, 92, 246, 0.16)'
                };
              } else {
                cat = findCategoryById(tx.categoryId) || {
                  name: tx.categoryName || (isInc ? 'Income' : 'Expense'),
                  icon: isInc ? 'wallet' : 'home',
                  color: isInc ? '#10b981' : '#3b82f6',
                  bg: isInc ? 'rgba(16, 185, 129, 0.16)' : 'rgba(59, 130, 246, 0.15)'
                };
              }

              const timeDisplay = formatTime12(tx.time);
              const mem = getMemberInfo(tx.spentBy || 'adil');
              const paidFrom = getTxPaidFrom(tx);
              const sourceBadgeHtml = (!isInc && !isTransfer)
                ? (paidFrom === 'faiza_wallet'
                    ? `<span class="tx-source-badge faiza">👛 Faiza's Wallet</span>`
                    : `<span class="tx-source-badge buffer">🏦 Buffer</span>`)
                : '';

              return `
                <div class="transaction-card" data-id="${escapeHTML(tx.id)}">
                  <div class="tx-left">
                    <div class="tx-icon-badge" style="background: ${cat.bg}; color: ${cat.color};">
                      ${ICONS[cat.icon] || ICONS['tag']}
                    </div>
                    <div class="tx-details">
                      <div class="tx-category-title">
                        ${escapeHTML(cat.name)}
                        ${isInc ? `<span class="tx-type-badge income">🏦 Fund In</span>` : ''}
                        ${isTransfer ? `<span class="tx-type-badge transfer">🔄 To Faiza</span>` : ''}
                      </div>
                      ${tx.notes ? `<div class="tx-notes">${escapeHTML(tx.notes)}</div>` : ''}
                      <div class="tx-meta">
                        ${timeDisplay} • <span class="tx-member-pill member-${mem.id}">${mem.avatar} ${escapeHTML(mem.name)}</span>
                        ${sourceBadgeHtml ? `• ${sourceBadgeHtml}` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="tx-right">
                    <div class="tx-amount ${isInc ? 'income-amount' : isTransfer ? 'transfer-amount' : ''}">
                      ${isInc ? '+' : isTransfer ? '🔄 ' : ''}${settings.currency} ${formatNumber(tx.amount)}
                    </div>
                    <div class="tx-actions">
                      <button type="button" class="tx-action-btn edit" data-id="${escapeHTML(tx.id)}" title="Edit" aria-label="Edit transaction">
                        ${ICONS['edit']}
                      </button>
                      <button type="button" class="tx-action-btn delete" data-id="${escapeHTML(tx.id)}" title="Delete" aria-label="Delete transaction">
                        ${ICONS['trash']}
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================================================
  // ANALYTICS: HOUSE FUND OVERVIEW + MONTHLY BUDGET DUAL-BARS
  // ==========================================================================

  function updateAnalytics() {
    const txCountEl = document.getElementById('analytics-tx-count');
    const dailyAvgEl = document.getElementById('analytics-daily-avg');
    const breakdownList = document.getElementById('analytics-breakdown-list');
    const alertsContainer = document.getElementById('budget-alerts-section');

    const currentCycle = getCyclePeriod(0);
    updateCycleSettingsSubtitle();
    updateTransferFormBalancePreview();

    // Filter transactions strictly by the chosen timeframe (currentCycle)
    const thisMonthAllTxs = transactions.filter(t => currentCycle.isInCycle(t.date || t.timestamp));
    const thisMonthExpenses = thisMonthAllTxs.filter(t => (t.type || 'expense') === 'expense');
    const totalSpend = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

    // --- 0. House Fund Overview (Cumulative Running Balances + Chosen Timeframe Breakdown) ---
    const fundStats = computeFundBalances(currentCycle);
    const {
      bufferRunningBalance,
      faizaWalletRunningBalance,
      netRunningBalance,
      cycleIncome,
      cycleExpense,
      cycleBufferExp,
      cycleFaizaExp,
      cycleTransfers,
      siblingStats
    } = fundStats;

    const bufferBalEl = document.getElementById('buffer-running-balance');
    const bufferLinesEl = document.getElementById('buffer-breakdown-lines');
    const faizaBalEl = document.getElementById('faiza-wallet-running-balance');
    const faizaLinesEl = document.getElementById('faiza-wallet-breakdown-lines');

    if (bufferBalEl) {
      bufferBalEl.textContent = bufferRunningBalance >= 0
        ? `${settings.currency} ${formatNumber(bufferRunningBalance)}`
        : `-${settings.currency} ${formatNumber(Math.abs(bufferRunningBalance))}`;
      bufferBalEl.classList.toggle('negative', bufferRunningBalance < 0);
    }
    if (bufferLinesEl) {
      bufferLinesEl.innerHTML = `
        <div class="bucket-line"><span>Cycle In:</span><span class="val-pos">+${formatNumber(cycleIncome)}</span></div>
        <div class="bucket-line"><span>Direct Bills:</span><span class="val-neg">-${formatNumber(cycleBufferExp)}</span></div>
        <div class="bucket-line"><span>To Faiza:</span><span class="val-trans">-${formatNumber(cycleTransfers)}</span></div>
      `;
    }

    if (faizaBalEl) {
      faizaBalEl.textContent = faizaWalletRunningBalance >= 0
        ? `${settings.currency} ${formatNumber(faizaWalletRunningBalance)}`
        : `-${settings.currency} ${formatNumber(Math.abs(faizaWalletRunningBalance))}`;
      faizaBalEl.classList.toggle('negative', faizaWalletRunningBalance < 0);
    }
    if (faizaLinesEl) {
      faizaLinesEl.innerHTML = `
        <div class="bucket-line"><span>Cycle Recv:</span><span class="val-trans">+${formatNumber(cycleTransfers)}</span></div>
        <div class="bucket-line"><span>Cycle Spent:</span><span class="val-neg">-${formatNumber(cycleFaizaExp)}</span></div>
        <div class="bucket-line"><span>All-Time Recv:</span><span>${formatNumber(fundStats.allTimeTransfers)}</span></div>
      `;
    }

    const fundIncomeEl = document.getElementById('fund-total-income');
    const fundSpentEl = document.getElementById('fund-total-spent');
    const fundBalanceEl = document.getElementById('fund-net-balance');
    const fundStatusBadge = document.getElementById('fund-status-badge');
    const siblingGrid = document.getElementById('sibling-fund-grid');
    const fundCycleRangeText = document.getElementById('fund-cycle-range-text');

    if (fundCycleRangeText) fundCycleRangeText.textContent = currentCycle.rangeLabel;
    if (fundIncomeEl) fundIncomeEl.textContent = `${settings.currency} ${formatNumber(cycleIncome)}`;
    if (fundSpentEl) fundSpentEl.textContent = `${settings.currency} ${formatNumber(cycleExpense)}`;
    if (fundBalanceEl) {
      if (netRunningBalance >= 0) {
        fundBalanceEl.textContent = `${settings.currency} ${formatNumber(netRunningBalance)}`;
        fundBalanceEl.className = 'stat-val positive';
      } else {
        fundBalanceEl.textContent = `-${settings.currency} ${formatNumber(Math.abs(netRunningBalance))}`;
        fundBalanceEl.className = 'stat-val negative';
      }
    }
    if (fundStatusBadge) {
      if (netRunningBalance >= 0) {
        fundStatusBadge.textContent = 'Net Surplus';
        fundStatusBadge.className = 'fund-status-badge';
      } else {
        fundStatusBadge.textContent = 'Net Deficit';
        fundStatusBadge.className = 'fund-status-badge negative';
      }
    }

    if (siblingGrid) {
      siblingGrid.innerHTML = FAMILY_MEMBERS.map(m => {
        const st = siblingStats[m.id];
        return `
          <div class="sibling-fund-item">
            <div class="sibling-fund-name">
              <span>${m.avatar}</span>
              <span>${escapeHTML(m.name)}</span>
            </div>
            <div class="sibling-fund-line">
              <span>Fund In:</span>
              <span style="color: var(--accent-green); font-weight: 700;">${formatNumber(st.contributed)}</span>
            </div>
            <div class="sibling-fund-line">
              <span>Spent:</span>
              <span style="color: var(--text-primary); font-weight: 700;">${formatNumber(st.spent)}</span>
            </div>
            ${st.transferred > 0 ? `
            <div class="sibling-fund-line">
              <span>To Faiza:</span>
              <span style="color: #a78bfa; font-weight: 700;">${formatNumber(st.transferred)}</span>
            </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    // --- 1. Monthly Expense Budget Analytics (Configurable Cycle Range) ---
    const overallTitle = document.getElementById('overall-budget-title');
    if (overallTitle) overallTitle.textContent = currentCycle.title;
    const cycleRangeText = document.getElementById('analytics-cycle-range-text');
    if (cycleRangeText) cycleRangeText.textContent = currentCycle.rangeLabel;

    // Key metrics
    if (txCountEl) txCountEl.textContent = thisMonthAllTxs.length.toString();
    const dailyAvg = totalSpend / Math.max(1, currentCycle.daysElapsed);
    if (dailyAvgEl) dailyAvgEl.textContent = `${settings.currency} ${formatNumber(dailyAvg)}`;

    // Calculate totals for all Expense categories (default + custom)
    const expenseCategories = getExpenseCategories();
    const catData = {};
    let totalMonthlyBudget = 0;

    expenseCategories.forEach(c => {
      const budget = Number(settings.budgets[c.id]) || 0;
      totalMonthlyBudget += budget;
      catData[c.id] = {
        cat: c,
        spent: 0,
        budget: budget,
        count: 0
      };
    });

    thisMonthExpenses.forEach(tx => {
      if (!catData[tx.categoryId]) {
        // Fallback if a custom category was deleted
        const fallbackId = 'others';
        if (catData[fallbackId]) {
          catData[fallbackId].spent += tx.amount;
          catData[fallbackId].count += 1;
        }
      } else {
        catData[tx.categoryId].spent += tx.amount;
        catData[tx.categoryId].count += 1;
      }
    });

    // Overall Monthly Budget Card
    const totalRemaining = totalMonthlyBudget - totalSpend;
    const overallTotalBudgetEl = document.getElementById('overall-total-budget');
    const overallTotalSpentEl = document.getElementById('overall-total-spent');
    const overallTotalRemainingEl = document.getElementById('overall-total-remaining');
    const overallSpentSeg = document.getElementById('overall-spent-segment');
    const overallRemSeg = document.getElementById('overall-remaining-segment');
    const overallSpentLabel = document.getElementById('overall-spent-label');
    const overallRemLabel = document.getElementById('overall-remaining-label');
    const overallPctText = document.getElementById('overall-pct-spent-text');
    const overallRemText = document.getElementById('overall-remaining-text');
    const overallUnifiedBar = document.getElementById('overall-unified-bar');

    if (overallTotalBudgetEl) overallTotalBudgetEl.textContent = `${settings.currency} ${formatNumber(totalMonthlyBudget)}`;
    if (overallTotalSpentEl) overallTotalSpentEl.textContent = `${settings.currency} ${formatNumber(totalSpend)}`;

    if (overallTotalRemainingEl) {
      if (totalRemaining >= 0) {
        overallTotalRemainingEl.textContent = `${settings.currency} ${formatNumber(totalRemaining)}`;
        overallTotalRemainingEl.className = 'stat-val positive';
      } else {
        overallTotalRemainingEl.textContent = `-${settings.currency} ${formatNumber(Math.abs(totalRemaining))}`;
        overallTotalRemainingEl.className = 'stat-val negative';
      }
    }

    if (overallUnifiedBar) {
      const overallPct = totalMonthlyBudget > 0 ? (totalSpend / totalMonthlyBudget) * 100 : 0;
      const isOverallOver = totalSpend > totalMonthlyBudget && totalMonthlyBudget > 0;

      if (isOverallOver) {
        overallUnifiedBar.classList.add('over-budget');
        overallSpentSeg.style.width = '100%';
        overallSpentLabel.textContent = `${overallPct.toFixed(1)}% (Over)`;
        if (overallRemSeg) overallRemSeg.style.display = 'none';
        if (overallPctText) overallPctText.textContent = `${overallPct.toFixed(1)}% of total budget spent`;
        if (overallRemText) {
          overallRemText.textContent = `Over by ${settings.currency} ${formatNumber(Math.abs(totalRemaining))}`;
          overallRemText.className = 'label-over-highlight';
        }
      } else {
        overallUnifiedBar.classList.remove('over-budget');
        const spentWidth = Math.min(100, Math.max(0, overallPct));
        const remWidth = Math.max(0, 100 - spentWidth);

        overallSpentSeg.style.width = `${spentWidth}%`;
        overallSpentLabel.textContent = `${spentWidth.toFixed(0)}%`;

        if (overallRemSeg) {
          overallRemSeg.style.display = 'flex';
          overallRemSeg.style.width = `${remWidth}%`;
          overallRemLabel.textContent = `${settings.currency} ${formatNumber(totalRemaining)} left`;
        }

        if (overallPctText) overallPctText.textContent = `${overallPct.toFixed(1)}% of total budget spent`;
        if (overallRemText) {
          overallRemText.textContent = `${settings.currency} ${formatNumber(totalRemaining)} remaining`;
          overallRemText.className = 'label-remaining-highlight';
        }

        overallSpentSeg.className = 'bar-segment-spent ' + getThresholdColorClass(overallPct);
      }
    }

    // --- 2. Active Alerts Banner (50%, 75%, 90%, 100% reached) ---
    const activeAlerts = [];
    Object.values(catData).forEach(item => {
      if (item.budget > 0) {
        const pct = (item.spent / item.budget) * 100;
        if (pct >= 100) {
          activeAlerts.push({ ...item, pct, level: 100, severity: 4, msg: `Exceeded budget limit! (${pct.toFixed(0)}%)` });
        } else if (pct >= 90) {
          activeAlerts.push({ ...item, pct, level: 90, severity: 3, msg: `Critical: 90% reached! Only ${settings.currency} ${formatNumber(item.budget - item.spent)} left.` });
        } else if (pct >= 75) {
          activeAlerts.push({ ...item, pct, level: 75, severity: 2, msg: `Warning: 75% of budget used (${pct.toFixed(0)}%).` });
        } else if (pct >= 50) {
          activeAlerts.push({ ...item, pct, level: 50, severity: 1, msg: `Notice: 50% milestone reached.` });
        }
      }
    });

    if (alertsContainer) {
      if (activeAlerts.length > 0) {
        activeAlerts.sort((a, b) => b.severity - a.severity);
        alertsContainer.style.display = 'flex';
        alertsContainer.innerHTML = `
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; display: flex; align-items: center; gap: 6px;">
            <span>⚠️ Active Budget Alerts (${activeAlerts.length})</span>
          </div>
          ${activeAlerts.map(a => `
            <div class="budget-alert-card warning-${a.level}" data-cat="${escapeHTML(a.cat.id)}">
              <div class="alert-left">
                <span class="alert-icon">${a.level >= 100 ? '🛑' : a.level >= 90 ? '🚨' : a.level >= 75 ? '⚠️' : 'ℹ️'}</span>
                <div class="alert-texts">
                  <span class="alert-title">${escapeHTML(a.cat.name)}: ${a.pct.toFixed(0)}% reached</span>
                  <span class="alert-desc">${a.msg}</span>
                </div>
              </div>
              <button type="button" class="btn-quick-edit-budget" data-cat="${escapeHTML(a.cat.id)}">Adjust</button>
            </div>
          `).join('')}
        `;
      } else {
        alertsContainer.style.display = 'none';
        alertsContainer.innerHTML = '';
      }
    }

    // --- 3. Category Budgets & Spending List (Dual Bars) ---
    if (!breakdownList) return;

    const allCategoryItems = Object.values(catData).sort((a, b) => {
      const pctA = a.budget > 0 ? a.spent / a.budget : (a.spent > 0 ? 0.01 : 0);
      const pctB = b.budget > 0 ? b.spent / b.budget : (b.spent > 0 ? 0.01 : 0);
      if (pctB !== pctA) return pctB - pctA;
      return b.spent - a.spent;
    });

    breakdownList.innerHTML = allCategoryItems.map(item => {
      const budget = item.budget;
      const spent = item.spent;
      const remaining = budget - spent;
      const hasBudget = budget > 0;
      const pct = hasBudget ? (spent / budget) * 100 : 0;
      const isOver = hasBudget && spent > budget;

      let badgeHtml = '';
      let colorClass = 'color-normal';

      if (!hasBudget) {
        badgeHtml = `<span style="font-size:0.68rem; color: var(--text-muted); font-weight: 600;">NO BUDGET</span>`;
      } else if (isOver) {
        badgeHtml = `<span class="threshold-badge level-100">100% EXCEEDED</span>`;
        colorClass = 'color-100';
      } else if (pct >= 90) {
        badgeHtml = `<span class="threshold-badge level-90">90% CRITICAL</span>`;
        colorClass = 'color-90';
      } else if (pct >= 75) {
        badgeHtml = `<span class="threshold-badge level-75">75% WARNING</span>`;
        colorClass = 'color-75';
      } else if (pct >= 50) {
        badgeHtml = `<span class="threshold-badge level-50">50% REACHED</span>`;
        colorClass = 'color-50';
      } else {
        badgeHtml = `<span class="threshold-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">${pct.toFixed(0)}% USED</span>`;
        colorClass = 'color-normal';
      }

      const spentWidth = hasBudget ? Math.min(100, Math.max(0, pct)) : (spent > 0 ? 100 : 0);
      const remWidth = hasBudget && !isOver ? Math.max(0, 100 - spentWidth) : 0;

      return `
        <div class="category-budget-item" data-cat="${escapeHTML(item.cat.id)}">
          <div class="cat-budget-header">
            <div class="cat-budget-left">
              <div class="cat-dot" style="background: ${item.cat.color};"></div>
              <span class="cat-budget-name">
                ${escapeHTML(item.cat.name)}
                ${badgeHtml}
              </span>
            </div>
            <div class="cat-budget-amounts">
              <span class="cat-budget-spent">${settings.currency} ${formatNumber(spent)}</span>
              <span class="cat-budget-total"> / ${hasBudget ? `${settings.currency} ${formatNumber(budget)}` : 'No budget'}</span>
            </div>
          </div>

          <div class="unified-bar-wrapper">
            <div class="unified-bar-track ${isOver ? 'over-budget' : ''}">
              <div class="bar-segment-spent ${colorClass}" style="width: ${spentWidth}%;">
                <span>${spent > 0 ? `${formatNumber(spent)} (${pct.toFixed(0)}%)` : ''}</span>
              </div>
              ${(hasBudget && !isOver && remaining > 0) ? `
                <div class="bar-segment-remaining" style="width: ${remWidth}%;">
                  <span>Rem: ${formatNumber(remaining)}</span>
                </div>
              ` : ''}
            </div>

            <div class="unified-bar-labels">
              <div>
                ${isOver ? `
                  <span class="label-over-highlight">⚠️ Over budget by ${settings.currency} ${formatNumber(Math.abs(remaining))}</span>
                ` : hasBudget ? `
                  <span class="label-remaining-highlight">${settings.currency} ${formatNumber(remaining)} remaining</span>
                  <span style="color: var(--text-muted); font-size: 0.7rem;">(${((remaining / budget) * 100).toFixed(0)}% left)</span>
                ` : `
                  <span style="color: var(--text-muted);">Set a monthly target to track remaining balance</span>
                `}
              </div>
              <button type="button" class="btn-quick-edit-budget" data-cat="${escapeHTML(item.cat.id)}" title="Edit budget for ${escapeHTML(item.cat.name)}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
                ${hasBudget ? 'Edit' : '+ Set'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getThresholdColorClass(pct) {
    if (pct >= 100) return 'color-100';
    if (pct >= 90) return 'color-90';
    if (pct >= 75) return 'color-75';
    if (pct >= 50) return 'color-50';
    return 'color-normal';
  }

  // --- CSV Export Logic ---
  function getFilteredExportTransactions(dateFilter = 'all') {
    let list = [...transactions];
    const currentCycle = getCyclePeriod(0);
    const prevCycle = getCyclePeriod(-1);

    if (dateFilter === 'this_month') {
      list = list.filter(t => currentCycle.isInCycle(t.date || t.timestamp));
    } else if (dateFilter === 'prev_month') {
      list = list.filter(t => prevCycle.isInCycle(t.date || t.timestamp));
    }

    list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    return list;
  }

  function generateCSV(dateFilter = 'all') {
    const list = getFilteredExportTransactions(dateFilter);

    const headers = ['Date', 'Time', 'Type', 'Account', 'Category', 'Member', 'Amount', 'Currency', 'Notes', 'Transaction_ID'];
    const rows = [headers.join(',')];

    list.forEach(tx => {
      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const mem = getMemberInfo(tx.spentBy || 'adil');
      const txTypeLabel = tx.type === 'income'
        ? 'Income'
        : tx.type === 'transfer'
        ? 'Transfer'
        : 'Expense';
      const accountLabel = tx.type === 'income'
        ? 'Buffer Account'
        : tx.type === 'transfer'
        ? "Buffer -> Faiza's Wallet"
        : getTxPaidFrom(tx) === 'faiza_wallet'
        ? "Faiza's Wallet"
        : 'Buffer Account';
      const amtNum = Number(tx.amount) || 0;
      const cleanDate = normalizeDateYMD(tx.date, tx.timestamp) || tx.date || '';

      const row = [
        escapeCSV(cleanDate),
        escapeCSV(tx.time || '12:00:00'),
        escapeCSV(txTypeLabel),
        escapeCSV(accountLabel),
        escapeCSV(tx.categoryName || ''),
        escapeCSV(mem.name),
        amtNum.toFixed(2),
        escapeCSV(tx.currency || settings.currency),
        escapeCSV(tx.notes || ''),
        escapeCSV(tx.id || '')
      ];
      rows.push(row.join(','));
    });

    return rows.join('\r\n');
  }

  async function handleExportCSV() {
    if (transactions.length === 0) {
      showToast('⚠️ No transactions to export');
      return;
    }

    const rangeSelect = document.getElementById('export-range-select');
    let filter = rangeSelect ? rangeSelect.value : 'all';
    let filteredList = getFilteredExportTransactions(filter);

    if (filteredList.length === 0 && filter !== 'all') {
      if (confirm(`No transactions match the selected timeframe (${filter === 'this_month' ? 'This Cycle' : 'Previous Cycle'}). Would you like to export all ${transactions.length} transactions instead?`)) {
        filter = 'all';
        if (rangeSelect) rangeSelect.value = 'all';
        updateCSVPreview();
        filteredList = getFilteredExportTransactions('all');
      } else {
        return;
      }
    }

    const csvContent = generateCSV(filter);
    const todayStr = formatDateYMD(new Date());
    const filename = `paragon_${filter}_${todayStr}.csv`;

    // Prepend UTF-8 BOM (\uFEFF) so Excel, Numbers, and Google Sheets open all rows accurately
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    showToast(`✅ Exported ${filteredList.length} transactions to ${filename}`);
  }

  function updateCSVPreview() {
    const container = document.getElementById('csv-preview-container');
    if (!container) return;

    updateCycleSettingsSubtitle();

    const rangeSelect = document.getElementById('export-range-select');
    const filter = rangeSelect ? rangeSelect.value : 'all';

    const list = getFilteredExportTransactions(filter).slice().reverse();

    const countEl = document.getElementById('export-count-badge');
    const totalEl = document.getElementById('export-total-badge');
    if (countEl) countEl.textContent = `${list.length} transactions`;
    if (totalEl) {
      const expTot = list.filter(t => (t.type || 'expense') === 'expense').reduce((s, t) => s + t.amount, 0);
      const incTot = list.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      totalEl.textContent = incTot > 0
        ? `Spent: ${settings.currency} ${formatNumber(expTot)} | In: ${formatNumber(incTot)}`
        : `${settings.currency} ${formatNumber(expTot)}`;
    }

    if (list.length === 0) {
      container.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No records for selected range</div>`;
      return;
    }

    const previewItems = list.slice(0, 5);
    let tableHtml = `
      <table class="csv-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Account</th>
            <th>Category</th>
            <th>Member</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
    `;

    previewItems.forEach(tx => {
      const mem = getMemberInfo(tx.spentBy || 'adil');
      const isInc = tx.type === 'income';
      const isTrans = tx.type === 'transfer';
      const acctShort = isInc
        ? '🏦 Buffer'
        : isTrans
        ? '🔄 → Faiza'
        : getTxPaidFrom(tx) === 'faiza_wallet'
        ? '👛 Faiza'
        : '🏦 Buffer';
      tableHtml += `
        <tr>
          <td>${escapeHTML(tx.date)}</td>
          <td>${isInc ? 'Income' : isTrans ? 'Transfer' : 'Expense'}</td>
          <td>${escapeHTML(acctShort)}</td>
          <td>${escapeHTML(tx.categoryName)}</td>
          <td>${escapeHTML(mem.name)}</td>
          <td>${isInc ? '+' : isTrans ? '🔄 ' : ''}${formatNumber(tx.amount)}</td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    if (list.length > 5) {
      tableHtml += `<div style="padding: 6px 10px; font-size: 0.72rem; color: var(--text-muted); text-align: center;">... and ${list.length - 5} more rows</div>`;
    }

    container.innerHTML = tableHtml;
  }

  // ==========================================================================
  // CSV IMPORT ENGINE (RFC 4180 Compliant Parser & Importer)
  // ==========================================================================

  function parseCSVText(text) {
    if (!text) return [];
    if (text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    const rows = [];
    let currentRow = [];
    let currentVal = '';
    let inQuotes = false;
    let i = 0;
    const len = text.length;

    while (i < len) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentVal += '"';
            i += 2;
            continue;
          } else {
            inQuotes = false;
            i++;
            continue;
          }
        } else {
          currentVal += char;
          i++;
          continue;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
          i++;
          continue;
        } else if (char === ',') {
          currentRow.push(currentVal.trim());
          currentVal = '';
          i++;
          continue;
        } else if (char === '\r') {
          if (nextChar === '\n') {
            i++;
          }
          currentRow.push(currentVal.trim());
          rows.push(currentRow);
          currentRow = [];
          currentVal = '';
          i++;
          continue;
        } else if (char === '\n') {
          currentRow.push(currentVal.trim());
          rows.push(currentRow);
          currentRow = [];
          currentVal = '';
          i++;
          continue;
        } else {
          currentVal += char;
          i++;
          continue;
        }
      }
    }

    if (currentVal.length > 0 || currentRow.length > 0) {
      currentRow.push(currentVal.trim());
      rows.push(currentRow);
    }

    return rows.filter(row => row.some(cell => cell.length > 0));
  }

  function processImportCSV(file) {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsedRows = parseCSVText(text);

        if (!parsedRows || parsedRows.length === 0) {
          showToast('⚠️ CSV file is empty');
          return;
        }

        let headerIdx = -1;
        let colMap = {
          date: 0,
          time: 1,
          category: 2,
          amount: 3,
          currency: 4,
          notes: 5,
          id: 6
        };

        for (let r = 0; r < Math.min(3, parsedRows.length); r++) {
          const lowerRow = parsedRows[r].map(c => c.toLowerCase());
          const hasDate = lowerRow.some(c => c.includes('date'));
          const hasAmount = lowerRow.some(c => c.includes('amount') || c.includes('spend') || c.includes('total') || c.includes('cost'));
          const hasCat = lowerRow.some(c => c.includes('cat'));

          if (hasDate || hasAmount || hasCat) {
            headerIdx = r;
            lowerRow.forEach((cell, idx) => {
              if (cell.includes('date')) colMap.date = idx;
              else if (cell.includes('time')) colMap.time = idx;
              else if (cell.includes('type')) colMap.type = idx;
              else if (cell.includes('account') || cell.includes('wallet') || cell.includes('bucket') || cell.includes('source')) colMap.account = idx;
              else if (cell.includes('cat')) colMap.category = idx;
              else if (cell.includes('spent') || cell.includes('member') || cell.includes('sibling') || cell.includes('user') || cell.includes('who') || cell.includes('person')) colMap.spentBy = idx;
              else if (cell.includes('amount') || cell.includes('spend') || cell.includes('cost') || cell.includes('total')) colMap.amount = idx;
              else if (cell.includes('curr')) colMap.currency = idx;
              else if (cell.includes('note') || cell.includes('desc') || cell.includes('memo')) colMap.notes = idx;
              else if (cell.includes('id')) colMap.id = idx;
            });
            break;
          }
        }

        const dataRows = headerIdx >= 0 ? parsedRows.slice(headerIdx + 1) : parsedRows;
        const validEntries = [];
        let totalImportAmount = 0;
        const allCats = getAllCategories();

        dataRows.forEach((row, idx) => {
          if (!row || row.length === 0) return;

          let rawAmount = row[colMap.amount];
          if (!rawAmount) return;
          rawAmount = String(rawAmount).replace(/[^0-9.-]/g, '');
          const amount = Math.abs(parseFloat(rawAmount));
          if (isNaN(amount) || amount <= 0) return;

          // Parse Type
          let txType = 'expense';
          if (colMap.type !== undefined && row[colMap.type]) {
            const rawT = String(row[colMap.type]).trim().toLowerCase();
            if (rawT.includes('trans') || rawT.includes('to faiza')) {
              txType = 'transfer';
            } else if (rawT.includes('inc') || rawT.includes('fund') || rawT.includes('contrib') || rawT.includes('in')) {
              txType = 'income';
            }
          }

          // Parse Date
          let rawDate = row[colMap.date] || '';
          let dateYMD = normalizeDateYMD(rawDate) || formatDateYMD(new Date());

          // Parse Time
          let rawTime = row[colMap.time] || '';
          let timeHMS = formatTimeHMS(new Date());
          if (rawTime && rawTime.includes(':')) {
            const tParts = rawTime.trim().split(':');
            const hh = String(parseInt(tParts[0], 10) || 0).padStart(2, '0');
            const mm = String(parseInt(tParts[1], 10) || 0).padStart(2, '0');
            const ss = tParts[2] ? String(parseInt(tParts[2], 10) || 0).padStart(2, '0') : '00';
            timeHMS = `${hh}:${mm}:${ss}`;
          }

          // Parse Sibling Member
          let mem = getMemberInfo(deviceProfile || 'adil');
          if (colMap.spentBy !== undefined && row[colMap.spentBy]) {
            const rawM = String(row[colMap.spentBy]).trim().toLowerCase();
            if (rawM.includes('faiza') || rawM.includes('sis')) mem = getMemberInfo('faiza');
            else if (rawM.includes('haseeb')) mem = getMemberInfo('haseeb');
            else if (rawM.includes('adil')) mem = getMemberInfo('adil');
          }

          // Parse Account / PaidFrom
          let paidFrom = mem.id === 'faiza' ? 'faiza_wallet' : 'buffer';
          if (colMap.account !== undefined && row[colMap.account]) {
            const rawAcct = String(row[colMap.account]).trim().toLowerCase();
            if (rawAcct.includes('->') || rawAcct.includes('transfer')) {
              txType = 'transfer';
              paidFrom = 'buffer';
            } else if (rawAcct.includes('faiza') || rawAcct.includes('wallet')) {
              paidFrom = 'faiza_wallet';
            } else if (rawAcct.includes('buffer')) {
              paidFrom = 'buffer';
            }
          }

          // Parse Category
          const rawCat = (row[colMap.category] || '').trim();
          let matchedCat = allCats.find(c => c.name.toLowerCase() === rawCat.toLowerCase());

          if (txType === 'transfer') {
            matchedCat = { id: 'transfer-to-faiza', name: "Transfer to Faiza's Wallet" };
          } else if (!matchedCat && rawCat) {
            const low = rawCat.toLowerCase();
            if (low.includes('transfer') && low.includes('faiza')) {
              txType = 'transfer';
              matchedCat = { id: 'transfer-to-faiza', name: "Transfer to Faiza's Wallet" };
            } else if (low.includes('rent') || low.includes('house')) matchedCat = findCategoryById('rent');
            else if (low.includes('salar') || low.includes('staff') || low.includes('maid') || low.includes('driver')) matchedCat = findCategoryById('salaries');
            else if (low.includes('bill') || low.includes('electric') || low.includes('water') || low.includes('gas')) matchedCat = findCategoryById('bills');
            else if (low.includes('service') || low.includes('repair') || low.includes('maint')) matchedCat = findCategoryById('services');
            else if (low.includes('grocer') || low.includes('food') || low.includes('supermarket')) matchedCat = findCategoryById('groceries');
            else if (low.includes('med') || low.includes('pharm') || low.includes('doctor') || low.includes('hosp')) matchedCat = findCategoryById('medical');
            else if (low.includes('contrib') || low.includes('fund')) {
              matchedCat = findCategoryById('monthly-contribution');
              txType = 'income';
            } else {
              matchedCat = findCategoryById('others');
            }
          }

          if (!matchedCat) {
            matchedCat = txType === 'income' ? DEFAULT_INCOME_CATEGORIES[0] : (findCategoryById('others') || DEFAULT_EXPENSE_CATEGORIES[0]);
          }

          const notes = (row[colMap.notes] || '').trim();
          const existingId = (row[colMap.id] || '').trim();
          const txId = existingId && existingId.length > 3
            ? existingId
            : 'tx_imp_' + Date.now() + '_' + idx + '_' + Math.random().toString(36).substr(2, 4);

          const dtObj = new Date(`${dateYMD}T${timeHMS}`);
          const timestamp = isNaN(dtObj.getTime()) ? Date.now() : dtObj.getTime();

          validEntries.push({
            id: txId,
            type: txType,
            amount: Math.round(amount * 100) / 100,
            currency: (row[colMap.currency] || settings.currency).trim(),
            categoryId: matchedCat.id,
            categoryName: matchedCat.name,
            paidFrom: txType === 'expense' ? paidFrom : 'buffer',
            transferTo: txType === 'transfer' ? 'faiza_wallet' : '',
            spentBy: mem.id,
            spentByName: mem.name,
            spentByAvatar: mem.avatar,
            notes: notes,
            date: dateYMD,
            time: timeHMS,
            timestamp: timestamp
          });

          totalImportAmount += amount;
        });

        if (validEntries.length === 0) {
          showToast('⚠️ No valid transaction rows could be parsed from CSV');
          return;
        }

        stagedImportTransactions = validEntries;
        openImportPreviewModal(validEntries, totalImportAmount);

      } catch (err) {
        console.error('CSV Import Error', err);
        showToast('⚠️ Could not parse CSV file');
      }
    };

    reader.readAsText(file);
  }

  function openImportPreviewModal(entries, totalAmount) {
    const modal = document.getElementById('import-csv-modal');
    const totalBadge = document.getElementById('import-modal-total-badge');
    const countBadge = document.getElementById('import-modal-count-badge');
    const previewContainer = document.getElementById('import-csv-preview-container');
    const desc = document.getElementById('import-modal-desc');

    if (!modal) return;

    if (totalBadge) totalBadge.textContent = `${settings.currency} ${formatNumber(totalAmount)}`;
    if (countBadge) countBadge.textContent = `${entries.length} records ready`;
    if (desc) desc.textContent = `Found ${entries.length} transactions totaling ${settings.currency} ${formatNumber(totalAmount)} in the uploaded CSV.`;

    const previewRows = entries.slice(0, 5);
    let html = `
      <table class="csv-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Member</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
    `;

    previewRows.forEach(tx => {
      html += `
        <tr>
          <td>${escapeHTML(tx.date)}</td>
          <td>${tx.type === 'income' ? 'Income' : tx.type === 'transfer' ? 'Transfer' : 'Expense'}</td>
          <td>${escapeHTML(tx.categoryName)}</td>
          <td>${escapeHTML(tx.spentByName)}</td>
          <td>${formatNumber(tx.amount)}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    if (entries.length > 5) {
      html += `<div style="padding: 6px 10px; font-size: 0.72rem; color: var(--text-muted); text-align: center;">... and ${entries.length - 5} more rows</div>`;
    }

    if (previewContainer) previewContainer.innerHTML = html;
    modal.classList.add('active');
  }

  function confirmCSVImport() {
    if (!stagedImportTransactions || stagedImportTransactions.length === 0) return;

    const replaceMode = document.getElementById('import-mode-replace')?.checked;
    const count = stagedImportTransactions.length;

    if (replaceMode) {
      if (confirm(`Are you sure you want to REPLACE all current records with the ${count} items from this CSV?`)) {
        transactions = [...stagedImportTransactions];
      } else {
        return;
      }
    } else {
      const existingIds = new Set(transactions.map(t => t.id));
      stagedImportTransactions.forEach(tx => {
        if (!existingIds.has(tx.id)) {
          transactions.push(tx);
          existingIds.add(tx.id);
        }
      });
    }

    transactions.sort((a, b) => b.timestamp - a.timestamp);
    saveTransactions();

    const currentCycle = getCyclePeriod(0);
    getExpenseCategories().forEach(cat => {
      const budget = Number(settings.budgets[cat.id]) || 0;
      if (budget > 0) {
        const catSpent = transactions
          .filter(t => (t.type || 'expense') === 'expense' && t.categoryId === cat.id && currentCycle.isInCycle(t.date))
          .reduce((sum, t) => sum + t.amount, 0);
        checkBudgetThresholds(cat.id, 0, catSpent);
      }
    });

    closeImportCSVModal();
    triggerHaptic();
    showToast(`✅ Successfully imported ${count} transactions from CSV!`);

    if (db) {
      uploadAllLocalTransactionsToCloud();
    }

    switchTab('tab-history');
  }

  function closeImportCSVModal() {
    stagedImportTransactions = [];
    document.getElementById('import-csv-modal')?.classList.remove('active');
    const fileInput = document.getElementById('import-csv-file-input');
    if (fileInput) fileInput.value = '';
  }

  // --- Delete & Undo ---
  function deleteTransaction(txId) {
    const idx = transactions.findIndex(t => t.id === txId);
    if (idx === -1) return;

    lastDeletedTx = transactions[idx];
    transactions.splice(idx, 1);
    saveTransactions();

    if (db) {
      deleteTransactionFromCloud(txId);
    }

    triggerHaptic();
    showToast(`Deleted "${lastDeletedTx.categoryName}"`, true, 'undo_delete');
  }

  function undoLastDelete() {
    if (!lastDeletedTx) return;
    transactions.unshift(lastDeletedTx);
    saveTransactions();

    if (db) {
      uploadTransactionToCloud(lastDeletedTx);
    }

    lastDeletedTx = null;
    showToast('Transaction restored!');
  }

  // --- Edit Transaction ---
  function populateEditCategorySelect(txType, selectedCatId) {
    const categoryGroup = document.getElementById('edit-category-group');
    const paidFromGroup = document.getElementById('edit-paid-from-group');
    const categorySelect = document.getElementById('edit-category-select');

    if (categoryGroup) {
      categoryGroup.style.display = txType === 'transfer' ? 'none' : 'flex';
    }
    if (paidFromGroup) {
      paidFromGroup.style.display = txType === 'expense' ? 'flex' : 'none';
    }
    if (!categorySelect || txType === 'transfer') return;

    const list = txType === 'income' ? getIncomeCategories() : getExpenseCategories();
    categorySelect.innerHTML = list.map(c => `
      <option value="${escapeHTML(c.id)}" ${c.id === selectedCatId ? 'selected' : ''}>
        ${escapeHTML(c.name)}
      </option>
    `).join('');
  }

  function openEditModal(txId) {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    editingTxId = txId;
    editSelectedSpentBy = getMemberInfo(tx.spentBy || 'adil').id;
    editSelectedType = (tx.type === 'income' || tx.type === 'transfer') ? tx.type : 'expense';
    editSelectedPaidFrom = getTxPaidFrom(tx);

    const modal = document.getElementById('edit-modal');
    const amountInput = document.getElementById('edit-amount-input');
    const dateInput = document.getElementById('edit-date-input');
    const timeInput = document.getElementById('edit-time-input');
    const notesInput = document.getElementById('edit-notes-input');

    amountInput.value = tx.amount;
    dateInput.value = tx.date;
    timeInput.value = (tx.time || '12:00').substr(0, 5);
    notesInput.value = tx.notes || '';

    document.querySelectorAll('#edit-type-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-edit-type') === editSelectedType);
    });

    document.querySelectorAll('#edit-member-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-edit-member') === editSelectedSpentBy);
    });

    document.querySelectorAll('#edit-paid-from-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-edit-paid-from') === editSelectedPaidFrom);
    });

    populateEditCategorySelect(editSelectedType, tx.categoryId);
    modal.classList.add('active');
  }

  function saveEditedTransaction() {
    if (!editingTxId) return;
    const idx = transactions.findIndex(t => t.id === editingTxId);
    if (idx === -1) return;

    const amountInput = document.getElementById('edit-amount-input');
    const categorySelect = document.getElementById('edit-category-select');
    const dateInput = document.getElementById('edit-date-input');
    const timeInput = document.getElementById('edit-time-input');
    const notesInput = document.getElementById('edit-notes-input');

    const amt = parseFloat(amountInput.value);
    if (!amt || isNaN(amt) || amt <= 0) {
      showToast('⚠️ Please enter a valid amount');
      return;
    }

    const memInfo = getMemberInfo(editSelectedSpentBy);
    const dVal = dateInput.value || transactions[idx].date;
    const tVal = (timeInput.value ? timeInput.value + ':00' : transactions[idx].time);

    const updatedDate = new Date(`${dVal}T${tVal}`);
    const ts = isNaN(updatedDate.getTime()) ? transactions[idx].timestamp : updatedDate.getTime();

    let catId = 'transfer-to-faiza';
    let catName = "Transfer to Faiza's Wallet";
    if (editSelectedType !== 'transfer') {
      const catList = editSelectedType === 'income' ? getIncomeCategories() : getExpenseCategories();
      const catObj = catList.find(c => c.id === categorySelect.value) || catList[0];
      catId = catObj.id;
      catName = catObj.name;
    }

    transactions[idx].type = editSelectedType;
    transactions[idx].amount = Math.round(amt * 100) / 100;
    transactions[idx].categoryId = catId;
    transactions[idx].categoryName = catName;
    transactions[idx].paidFrom = editSelectedType === 'expense' ? editSelectedPaidFrom : 'buffer';
    transactions[idx].transferTo = editSelectedType === 'transfer' ? 'faiza_wallet' : '';
    transactions[idx].spentBy = memInfo.id;
    transactions[idx].spentByName = memInfo.name;
    transactions[idx].spentByAvatar = memInfo.avatar;
    transactions[idx].date = dVal;
    transactions[idx].time = tVal;
    transactions[idx].timestamp = ts;
    transactions[idx].notes = notesInput.value.trim();

    saveTransactions();

    if (db) {
      uploadTransactionToCloud(transactions[idx]);
    }

    closeEditModal();
    showToast('Transaction updated');

    const currentCycle = getCyclePeriod(0);
    if (editSelectedType === 'expense' && currentCycle.isInCycle(dVal)) {
      const catSpent = transactions
        .filter(t => (t.type || 'expense') === 'expense' && t.categoryId === catId && currentCycle.isInCycle(t.date))
        .reduce((sum, t) => sum + t.amount, 0);
      checkBudgetThresholds(catId, 0, catSpent);
    }
  }

  function closeEditModal() {
    editingTxId = null;
    document.getElementById('edit-modal')?.classList.remove('active');
  }

  // ==========================================================================
  // BUDGET ALERTS & NOTIFICATIONS (50%, 75%, 90%, 100%)
  // ==========================================================================

  function playBudgetAlertChime(level) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const freqs = level >= 100
        ? [880, 698, 880]
        : level >= 90
        ? [784, 880]
        : level >= 75
        ? [659, 784]
        : [523, 659];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = level >= 90 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx + 1) * 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + (idx + 1) * 0.18);
      });
    } catch (e) {
      console.log('Audio chime not available or user interaction needed:', e);
    }
  }

  function checkBudgetThresholds(categoryId, oldSpent, newSpent) {
    const budget = Number(settings.budgets[categoryId]) || 0;
    if (budget <= 0) return;

    const categoryObj = getExpenseCategories().find(c => c.id === categoryId);
    if (!categoryObj) return;

    const currentCycle = getCyclePeriod(0);
    const currentMonthKey = currentCycle.cycleKey;
    const oldPct = (oldSpent / budget) * 100;
    const newPct = (newSpent / budget) * 100;

    const thresholds = [50, 75, 90, 100];
    let triggeredThreshold = null;

    thresholds.forEach(t => {
      const alertKey = `${currentMonthKey}_${categoryId}_${t}`;
      if (oldPct < t && newPct >= t && !alertedThresholds[alertKey]) {
        triggeredThreshold = t;
        alertedThresholds[alertKey] = true;
      }
    });

    if (triggeredThreshold !== null) {
      saveAlertedThresholds();
      fireBudgetAlert(categoryObj, triggeredThreshold, newSpent, budget);
    }
  }

  function fireBudgetAlert(categoryObj, threshold, spent, budget) {
    const remaining = Math.max(0, budget - spent);
    const isOver = spent > budget;

    playBudgetAlertChime(threshold);
    if (window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(threshold >= 90 ? [120, 60, 120, 60, 150] : [100, 50, 100]);
      } catch (e) {}
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const title = threshold >= 100
          ? `🛑 100% Budget Reached: ${categoryObj.name}`
          : threshold >= 90
          ? `🚨 90% Critical Alert: ${categoryObj.name}`
          : threshold >= 75
          ? `⚠️ 75% Budget Warning: ${categoryObj.name}`
          : `ℹ️ 50% Milestone: ${categoryObj.name}`;

        const body = isOver
          ? `Exceeded monthly budget! Spent: ${settings.currency} ${formatNumber(spent)} of ${settings.currency} ${formatNumber(budget)}.`
          : `Spent: ${settings.currency} ${formatNumber(spent)} of ${settings.currency} ${formatNumber(budget)}. Only ${settings.currency} ${formatNumber(remaining)} remaining.`;

        new Notification(title, {
          body: body,
          icon: './icons/icon-192.png',
          badge: './icons/icon-192.png',
          tag: `paragon_budget_${categoryObj.id}_${threshold}`
        });
      } catch (err) {
        console.warn('System push notification error:', err);
      }
    }

    openBudgetAlertModal(categoryObj, threshold, spent, budget, remaining);
  }

  function openBudgetAlertModal(categoryObj, threshold, spent, budget, remaining) {
    const modal = document.getElementById('budget-alert-modal');
    const badge = document.getElementById('alert-popup-badge');
    const title = document.getElementById('modal-alert-title');
    const msg = document.getElementById('alert-popup-message');
    const spentTxt = document.getElementById('alert-popup-spent-txt');
    const remTxt = document.getElementById('alert-popup-rem-txt');
    const barSpent = document.getElementById('alert-popup-bar-spent');
    const barRem = document.getElementById('alert-popup-bar-rem');
    const barSpentTxt = document.getElementById('alert-popup-bar-spent-txt');
    const barRemTxt = document.getElementById('alert-popup-bar-rem-txt');

    if (!modal) return;

    badge.className = `alert-popup-icon-badge badge-${threshold}`;

    if (threshold >= 100) {
      badge.textContent = '🛑';
      title.textContent = `100% Limit Reached: ${categoryObj.name}`;
      msg.innerHTML = `Household spending has reached <b>100%</b> of the monthly budget for <b>${escapeHTML(categoryObj.name)}</b>. Total spent: <b>${settings.currency} ${formatNumber(spent)}</b> of ${settings.currency} ${formatNumber(budget)}.`;
    } else if (threshold >= 90) {
      badge.textContent = '🚨';
      title.textContent = `90% Critical Alert: ${categoryObj.name}`;
      msg.innerHTML = `Household spending has reached <b>90%</b> of the <b>${escapeHTML(categoryObj.name)}</b> budget! Only <b>${settings.currency} ${formatNumber(remaining)}</b> remains for this month.`;
    } else if (threshold >= 75) {
      badge.textContent = '⚠️';
      title.textContent = `75% Budget Warning: ${categoryObj.name}`;
      msg.innerHTML = `Household spending has reached <b>75%</b> of the <b>${escapeHTML(categoryObj.name)}</b> monthly budget. Remaining balance: <b>${settings.currency} ${formatNumber(remaining)}</b>.`;
    } else {
      badge.textContent = 'ℹ️';
      title.textContent = `50% Milestone: ${categoryObj.name}`;
      msg.innerHTML = `Half (<b>50%</b>) of the <b>${escapeHTML(categoryObj.name)}</b> budget has been used (<b>${settings.currency} ${formatNumber(spent)}</b> / ${settings.currency} ${formatNumber(budget)}).`;
    }

    const pct = Math.min(100, (spent / budget) * 100);
    const remPct = Math.max(0, 100 - pct);

    if (spentTxt) spentTxt.textContent = `Spent: ${settings.currency} ${formatNumber(spent)}`;
    if (remTxt) {
      if (spent > budget) {
        remTxt.textContent = `Over by ${settings.currency} ${formatNumber(spent - budget)}`;
        remTxt.className = 'label-over-highlight';
      } else {
        remTxt.textContent = `Remaining: ${settings.currency} ${formatNumber(remaining)}`;
        remTxt.className = 'label-remaining-highlight';
      }
    }

    if (barSpent) {
      barSpent.style.width = `${pct}%`;
      barSpent.className = 'bar-segment-spent ' + getThresholdColorClass(pct);
    }
    if (barSpentTxt) barSpentTxt.textContent = `${pct.toFixed(0)}%`;

    if (barRem) {
      barRem.style.width = `${remPct}%`;
      barRem.style.display = (spent > budget) ? 'none' : 'flex';
    }
    if (barRemTxt) barRemTxt.textContent = `${settings.currency} ${formatNumber(remaining)}`;

    modal.classList.add('active');
  }

  // --- Budget Manager Modal (All Expense Categories) ---
  function openBudgetManagerModal() {
    const modal = document.getElementById('budget-manager-modal');
    const list = document.getElementById('budget-manager-list');
    const totalSumEl = document.getElementById('budget-modal-total-sum');

    if (!modal || !list) return;

    let currentTotal = 0;
    const currentCycle = getCyclePeriod(0);

    list.innerHTML = getExpenseCategories().map(cat => {
      const bVal = Number(settings.budgets[cat.id]) || 0;
      currentTotal += bVal;

      const catSpent = transactions
        .filter(t => (t.type || 'expense') === 'expense' && t.categoryId === cat.id && currentCycle.isInCycle(t.date))
        .reduce((sum, t) => sum + t.amount, 0);

      return `
        <div class="budget-input-row" data-cat="${escapeHTML(cat.id)}">
          <div class="budget-input-label">
            <span class="cat-dot" style="background: ${cat.color};"></span>
            <div>
              <div style="font-size: 0.9rem; font-weight: 700;">${escapeHTML(cat.name)}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Spent: ${settings.currency} ${formatNumber(catSpent)}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">${settings.currency}</span>
            <input type="number" 
                   class="budget-number-input" 
                   data-cat="${escapeHTML(cat.id)}" 
                   value="${bVal}" 
                   min="0" 
                   step="any"
                   placeholder="0">
          </div>
        </div>
      `;
    }).join('');

    if (totalSumEl) totalSumEl.textContent = `Total: ${settings.currency} ${formatNumber(currentTotal)}`;

    list.querySelectorAll('.budget-number-input').forEach(input => {
      input.addEventListener('input', () => {
        let sum = 0;
        list.querySelectorAll('.budget-number-input').forEach(i => {
          sum += parseFloat(i.value) || 0;
        });
        if (totalSumEl) totalSumEl.textContent = `Total: ${settings.currency} ${formatNumber(sum)}`;
      });
    });

    modal.classList.add('active');
  }

  function saveAllBudgets() {
    const list = document.getElementById('budget-manager-list');
    if (!list) return;

    list.querySelectorAll('.budget-number-input').forEach(input => {
      const catId = input.getAttribute('data-cat');
      const val = parseFloat(input.value) || 0;
      settings.budgets[catId] = Math.max(0, val);
    });

    saveSettings();
    updateAnalytics();
    closeBudgetManagerModal();
    showToast('✅ All category budgets updated');
  }

  function closeBudgetManagerModal() {
    document.getElementById('budget-manager-modal')?.classList.remove('active');
  }

  // --- Quick Single-Category Budget Modal ---
  function openQuickBudgetModal(categoryId) {
    const modal = document.getElementById('quick-budget-modal');
    const title = document.getElementById('modal-quick-budget-title');
    const desc = document.getElementById('quick-budget-desc');
    const input = document.getElementById('quick-budget-amount-input');
    const spendEl = document.getElementById('quick-budget-current-spend');

    const catObj = getExpenseCategories().find(c => c.id === categoryId);
    if (!modal || !catObj) return;

    editingBudgetId = categoryId;
    title.textContent = `Budget: ${catObj.name}`;
    desc.textContent = `Set monthly budget limit for ${catObj.name}. Alerts trigger at 50%, 75%, 90%, and 100%.`;

    const currentCycle = getCyclePeriod(0);
    const catSpent = transactions
      .filter(t => (t.type || 'expense') === 'expense' && t.categoryId === categoryId && currentCycle.isInCycle(t.date))
      .reduce((sum, t) => sum + t.amount, 0);

    input.value = settings.budgets[categoryId] || 0;
    if (spendEl) spendEl.textContent = `Spent this cycle (${currentCycle.rangeLabel}): ${settings.currency} ${formatNumber(catSpent)}`;

    modal.classList.add('active');
    setTimeout(() => input.focus(), 150);
  }

  function saveQuickBudget() {
    if (!editingBudgetId) return;
    const input = document.getElementById('quick-budget-amount-input');
    const val = parseFloat(input.value) || 0;

    settings.budgets[editingBudgetId] = Math.max(0, val);
    saveSettings();
    updateAnalytics();
    closeQuickBudgetModal();

    const catObj = getExpenseCategories().find(c => c.id === editingBudgetId);
    showToast(`✅ Budget for ${catObj ? catObj.name : ''} set to ${settings.currency} ${formatNumber(val)}`);
    editingBudgetId = null;
  }

  function closeQuickBudgetModal() {
    editingBudgetId = null;
    document.getElementById('quick-budget-modal')?.classList.remove('active');
  }

  // --- Configurable Month Start Date (Budget Cycle) Modal ---
  function openCycleSettingsModal() {
    const modal = document.getElementById('cycle-settings-modal');
    const dateInput = document.getElementById('cycle-start-date-input');
    const endInput = document.getElementById('cycle-end-date-input');
    if (!modal || !dateInput) return;

    const currentCycle = getCyclePeriod(0);
    dateInput.value = currentCycle.startYMD;
    if (endInput) endInput.value = currentCycle.endYMD;
    updateCycleModalPreview(currentCycle.startYMD, currentCycle.endYMD);
    modal.classList.add('active');
  }

  function updateCycleModalPreview(dateStr, customEndStr = null, autoComputeEnd = false) {
    const previewRangeEl = document.getElementById('cycle-preview-range');
    const previewLabelEl = document.getElementById('cycle-preview-label');
    const endInput = document.getElementById('cycle-end-date-input');

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;

    const parts = dateStr.split('-').map(n => parseInt(n, 10));
    const day = parts[2] || 1;

    // If start date changed, compute default 1-month end date
    if (autoComputeEnd && endInput) {
      const defaultCycle = getCyclePeriod(0, dateStr, day, '');
      endInput.value = defaultCycle.endYMD;
      customEndStr = defaultCycle.endYMD;
    } else if (customEndStr === null && endInput) {
      customEndStr = endInput.value || '';
    }

    const previewCycle = getCyclePeriod(0, dateStr, day, customEndStr || '');

    if (previewRangeEl) {
      previewRangeEl.textContent = previewCycle.fullRangeLabel;
    }
    if (previewLabelEl) {
      previewLabelEl.textContent = `${previewCycle.title} • Evaluates Parents' Household Fund & Monthly Budgets in this range`;
    }

    document.querySelectorAll('#cycle-quick-day-chips .chip-btn').forEach(btn => {
      const chipDay = parseInt(btn.getAttribute('data-cycle-day'), 10);
      btn.classList.toggle('active', chipDay === previewCycle.startDay);
    });
  }

  function handleQuickCycleDaySelect(dayNum) {
    const day = Math.min(31, Math.max(1, parseInt(dayNum, 10) || 1));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const candidateThisMonth = createClampedDate(today.getFullYear(), today.getMonth(), day);

    let startDateObj;
    if (today >= candidateThisMonth) {
      startDateObj = candidateThisMonth;
    } else {
      startDateObj = createClampedDate(today.getFullYear(), today.getMonth() - 1, day);
    }

    const ymd = formatDateYMD(startDateObj);
    const dateInput = document.getElementById('cycle-start-date-input');
    if (dateInput) {
      dateInput.value = ymd;
    }
    updateCycleModalPreview(ymd, null, true);
    triggerHaptic();
  }

  function saveCycleSettings() {
    const dateInput = document.getElementById('cycle-start-date-input');
    const endInput = document.getElementById('cycle-end-date-input');
    const val = (dateInput?.value || '').trim();
    const endVal = (endInput?.value || '').trim();
    if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      showToast('⚠️ Please select a valid cycle start date');
      dateInput?.focus();
      return;
    }

    const parts = val.split('-').map(n => parseInt(n, 10));
    const pickedDay = Math.min(31, Math.max(1, parts[2] || 1));

    settings.cycleStartDay = pickedDay;
    settings.cycleStartDate = val;
    settings.cycleEndDate = (endVal && /^\d{4}-\d{2}-\d{2}$/.test(endVal) && endVal >= val) ? endVal : '';
    settings.cycleLockedCustom = true;

    saveSettings();
    updateAnalytics();
    updateCSVPreview();
    updateMonthSummaryBadge();
    closeCycleSettingsModal();
    triggerHaptic();

    const activeCycle = getCyclePeriod(0);
    showToast(`✅ Timeframe set to ${activeCycle.rangeLabel} (${activeCycle.title})`);
  }

  function closeCycleSettingsModal() {
    document.getElementById('cycle-settings-modal')?.classList.remove('active');
  }

  // ==========================================================================
  // EXPENDITURE DUE DATES & ALERTS (Rent, Bills, Salaries, etc.)
  // ==========================================================================

  function loadDueDates() {
    try {
      const saved = localStorage.getItem(DUE_DATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dueDateItems = parsed;
        }
      }
    } catch (e) {
      console.error('Error loading due dates', e);
      dueDateItems = [];
    }

    try {
      const savedAlerts = localStorage.getItem(DUE_ALERTED_KEY);
      if (savedAlerts) {
        alertedDueKeys = JSON.parse(savedAlerts) || {};
      }
    } catch (e) {
      alertedDueKeys = {};
    }
  }

  function saveDueDates(skipCloudSync = false) {
    try {
      localStorage.setItem(DUE_DATES_KEY, JSON.stringify(dueDateItems));
    } catch (e) {
      console.error('Error saving due dates', e);
    }
    if (!skipCloudSync && db) {
      uploadDueDatesToCloud(dueDateItems);
    }
  }

  function saveAlertedDueKeys() {
    try {
      localStorage.setItem(DUE_ALERTED_KEY, JSON.stringify(alertedDueKeys));
    } catch (e) {}
  }

  /**
   * Evaluates a due date item against today's date and current transactions.
   * Returns status ('paid' | 'overdue' | 'due-today' | 'due-soon' | 'scheduled'),
   * badgeText, targetDateStr, daysDiff, ymKey, and whether an active alert banner should show.
   */
  function evaluateDueDateItem(item) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = Math.min(31, Math.max(1, parseInt(item.dueDay, 10) || 1));
    const remindDays = Math.max(0, parseInt(item.remindDaysBefore, 10) || 0);

    const thisMonthDue = createClampedDate(today.getFullYear(), today.getMonth(), dueDay);
    const ymKey = `${thisMonthDue.getFullYear()}-${String(thisMonthDue.getMonth() + 1).padStart(2, '0')}`;

    const isItemPaidForMonth = (targetYm, targetDueDate) => {
      if (item.paidPeriods && item.paidPeriods[targetYm]) {
        return true;
      }
      // Also auto-detect if a matching expense was logged in this YYYY-MM
      const titleLow = (item.title || '').trim().toLowerCase();
      return transactions.some(tx => {
        if (!tx || (tx.type || 'expense') !== 'expense') return false;
        const txYm = (tx.date || '').slice(0, 7);
        if (txYm !== targetYm) return false;
        if (tx.paidDueId && tx.paidDueId === item.id) return true;
        if (tx.categoryId === item.categoryId) {
          if (item.categoryId === 'rent' && titleLow.includes('rent')) return true;
          const notesLow = (tx.notes || '').toLowerCase();
          if (titleLow && notesLow && (notesLow.includes(titleLow) || titleLow.includes(notesLow))) {
            return true;
          }
        }
        return false;
      });
    };

    const paidThisMonth = isItemPaidForMonth(ymKey, thisMonthDue);
    const fmtDateShort = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

    if (paidThisMonth) {
      // Check if next month's due date is already within the advance reminder window
      const nextMonthDue = createClampedDate(today.getFullYear(), today.getMonth() + 1, dueDay);
      const nextYmKey = `${nextMonthDue.getFullYear()}-${String(nextMonthDue.getMonth() + 1).padStart(2, '0')}`;
      const daysToNext = Math.round((nextMonthDue - today) / 86400000);
      const paidNextMonth = isItemPaidForMonth(nextYmKey, nextMonthDue);

      if (!paidNextMonth && daysToNext <= remindDays) {
        return {
          status: daysToNext === 0 ? 'due-today' : 'due-soon',
          badgeText: daysToNext === 0 ? 'Due Today' : `Due in ${daysToNext}d`,
          dueDateObj: nextMonthDue,
          dueDateFormatted: fmtDateShort(nextMonthDue),
          daysDiff: daysToNext,
          ymKey: nextYmKey,
          isPaid: false,
          shouldAlert: true,
          severity: daysToNext === 0 ? 3 : 2
        };
      }

      return {
        status: 'paid',
        badgeText: '✅ Paid',
        dueDateObj: thisMonthDue,
        dueDateFormatted: fmtDateShort(thisMonthDue),
        daysDiff: Math.round((thisMonthDue - today) / 86400000),
        ymKey,
        isPaid: true,
        shouldAlert: false,
        severity: 0
      };
    }

    const daysDiff = Math.round((thisMonthDue - today) / 86400000);

    if (daysDiff < 0) {
      const overdueDays = Math.abs(daysDiff);
      return {
        status: 'overdue',
        badgeText: `Overdue ${overdueDays}d`,
        dueDateObj: thisMonthDue,
        dueDateFormatted: fmtDateShort(thisMonthDue),
        daysDiff,
        ymKey,
        isPaid: false,
        shouldAlert: true,
        severity: 4
      };
    } else if (daysDiff === 0) {
      return {
        status: 'due-today',
        badgeText: 'Due Today!',
        dueDateObj: thisMonthDue,
        dueDateFormatted: fmtDateShort(thisMonthDue),
        daysDiff: 0,
        ymKey,
        isPaid: false,
        shouldAlert: true,
        severity: 3
      };
    } else if (daysDiff <= remindDays) {
      return {
        status: 'due-soon',
        badgeText: `Due in ${daysDiff}d`,
        dueDateObj: thisMonthDue,
        dueDateFormatted: fmtDateShort(thisMonthDue),
        daysDiff,
        ymKey,
        isPaid: false,
        shouldAlert: true,
        severity: 2
      };
    }

    return {
      status: 'scheduled',
      badgeText: `Due ${getOrdinalSuffix(dueDay)}`,
      dueDateObj: thisMonthDue,
      dueDateFormatted: fmtDateShort(thisMonthDue),
      daysDiff,
      ymKey,
      isPaid: false,
      shouldAlert: false,
      severity: 1
    };
  }

  function renderDueDatesUI() {
    const listContainer = document.getElementById('settings-due-dates-list');
    const subEl = document.getElementById('settings-due-dates-sub');
    const addBanner = document.getElementById('due-alerts-banner-add');
    const analyticsBanner = document.getElementById('due-alerts-banner-analytics');

    const evaluated = dueDateItems.map(item => ({
      item,
      evalInfo: evaluateDueDateItem(item),
      cat: findCategoryById(item.categoryId) || DEFAULT_EXPENSE_CATEGORIES[0]
    }));

    // Sort: Overdue -> Due Today -> Due Soon -> Scheduled -> Paid
    evaluated.sort((a, b) => {
      if (b.evalInfo.severity !== a.evalInfo.severity) {
        return b.evalInfo.severity - a.evalInfo.severity;
      }
      return (a.item.dueDay || 1) - (b.item.dueDay || 1);
    });

    const activeAlerts = evaluated.filter(e => e.evalInfo.shouldAlert);

    if (subEl) {
      if (dueDateItems.length === 0) {
        subEl.textContent = 'Configure monthly reminders for Rent & Bills';
      } else if (activeAlerts.length > 0) {
        subEl.textContent = `${dueDateItems.length} configured • ⚠️ ${activeAlerts.length} due or upcoming`;
      } else {
        subEl.textContent = `${dueDateItems.length} monthly due date reminders active`;
      }
    }

    // 1. Render Settings Due Dates List
    if (listContainer) {
      if (evaluated.length === 0) {
        listContainer.innerHTML = `
          <div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 0.8rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
            No expenditure due dates configured yet. Tap <b>+ Add Due Alert</b> or use a Quick Add chip above (e.g. 🏠 House Rent, ⚡ Electricity).
          </div>
        `;
      } else {
        listContainer.innerHTML = evaluated.map(({ item, evalInfo, cat }) => {
          const paidFromLabel = item.paidFrom === 'faiza_wallet' ? "👛 Faiza's Wallet" : '🏦 Buffer';
          const remindLabel = Number(item.remindDaysBefore) === 0
            ? 'Alert on due date'
            : `Alert ${item.remindDaysBefore}d before`;

          return `
            <div class="due-date-card status-${evalInfo.status}" data-due-id="${escapeHTML(item.id)}">
              <div class="due-card-left">
                <div class="tx-icon-badge" style="background: ${cat.bg}; color: ${cat.color}; width: 38px; height: 38px; flex-shrink: 0;">
                  ${ICONS[cat.icon] || ICONS['tag']}
                </div>
                <div class="due-card-info">
                  <div class="due-card-title-row">
                    <span class="due-card-title">${escapeHTML(item.title)}</span>
                    <span class="due-status-badge ${evalInfo.status}">${escapeHTML(evalInfo.badgeText)}</span>
                  </div>
                  <div class="due-card-meta">
                    <span>📅 ${getOrdinalSuffix(item.dueDay)} of month (${escapeHTML(evalInfo.dueDateFormatted)})</span>
                    <span>• 🔔 ${escapeHTML(remindLabel)}</span>
                    <span>• ${escapeHTML(paidFromLabel)}</span>
                  </div>
                </div>
              </div>
              <div class="due-card-right">
                ${item.expectedAmount > 0 ? `
                  <div class="due-card-amount">${settings.currency} ${formatNumber(item.expectedAmount)}</div>
                ` : ''}
                <div class="due-card-actions">
                  ${!evalInfo.isPaid ? `
                    <button type="button" class="btn-due-mini pay" data-due-action="pay" data-due-id="${escapeHTML(item.id)}" title="Pre-fill Add Expense form to pay this bill">
                      Pay
                    </button>
                    <button type="button" class="btn-due-mini mark-paid" data-due-action="toggle-paid" data-due-id="${escapeHTML(item.id)}" data-ym="${escapeHTML(evalInfo.ymKey)}" title="Mark as Paid for this month">
                      ✓ Paid
                    </button>
                  ` : `
                    <button type="button" class="btn-due-mini unmark" data-due-action="toggle-paid" data-due-id="${escapeHTML(item.id)}" data-ym="${escapeHTML(evalInfo.ymKey)}" title="Unmark Paid status">
                      Undo Paid
                    </button>
                  `}
                  <button type="button" class="tx-action-btn edit" data-due-action="edit" data-due-id="${escapeHTML(item.id)}" title="Edit Due Date">
                    ${ICONS['edit']}
                  </button>
                  <button type="button" class="tx-action-btn delete" data-due-action="delete" data-due-id="${escapeHTML(item.id)}" title="Delete Due Date">
                    ${ICONS['trash']}
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Render Active Due Date Banners on Add Tab & Analytics Tab
    const renderBannerHtml = (alerts) => {
      if (alerts.length === 0) return '';
      return `
        <div style="font-size: 0.76rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; display: flex; align-items: center; justify-content: space-between;">
          <span>🔔 Expenditure Due Date Alerts (${alerts.length})</span>
          <button type="button" class="btn-due-mini" data-due-action="open-settings" style="font-size: 0.68rem; padding: 2px 7px;">Configure</button>
        </div>
        ${alerts.map(({ item, evalInfo }) => {
          const iconEmoji = evalInfo.status === 'overdue' ? '🚨' : evalInfo.status === 'due-today' ? '⏰' : '📅';
          const amtText = item.expectedAmount > 0 ? ` • ${settings.currency} ${formatNumber(item.expectedAmount)}` : '';
          const paidFromText = item.paidFrom === 'faiza_wallet' ? "👛 Faiza's Wallet" : '🏦 Buffer Account';
          return `
            <div class="due-alert-banner-card ${evalInfo.status}">
              <div class="due-alert-banner-left">
                <span style="font-size: 1.25rem;">${iconEmoji}</span>
                <div class="due-alert-banner-texts">
                  <div class="due-alert-banner-title">
                    <span>${escapeHTML(item.title)}</span>
                    <span class="due-status-badge ${evalInfo.status}">${escapeHTML(evalInfo.badgeText)}</span>
                  </div>
                  <div class="due-alert-banner-sub">
                    Due ${escapeHTML(evalInfo.dueDateFormatted)} (${getOrdinalSuffix(item.dueDay)})${escapeHTML(amtText)} • ${escapeHTML(paidFromText)}
                  </div>
                </div>
              </div>
              <div class="due-alert-banner-actions">
                <button type="button" class="btn-due-mini pay" data-due-action="pay" data-due-id="${escapeHTML(item.id)}">
                  Pay Now
                </button>
                <button type="button" class="btn-due-mini mark-paid" data-due-action="toggle-paid" data-due-id="${escapeHTML(item.id)}" data-ym="${escapeHTML(evalInfo.ymKey)}" title="Mark as already paid">
                  ✓ Paid
                </button>
              </div>
            </div>
          `;
        }).join('')}
      `;
    };

    if (addBanner) {
      if (activeAlerts.length > 0) {
        addBanner.style.display = 'flex';
        addBanner.innerHTML = renderBannerHtml(activeAlerts);
      } else {
        addBanner.style.display = 'none';
        addBanner.innerHTML = '';
      }
    }

    if (analyticsBanner) {
      if (activeAlerts.length > 0) {
        analyticsBanner.style.display = 'flex';
        analyticsBanner.innerHTML = renderBannerHtml(activeAlerts);
      } else {
        analyticsBanner.style.display = 'none';
        analyticsBanner.innerHTML = '';
      }
    }

    checkAndFireDueDateNotifications(activeAlerts);
  }

  function checkAndFireDueDateNotifications(activeAlerts) {
    if (!activeAlerts || activeAlerts.length === 0) return;
    let newlyTriggered = [];

    activeAlerts.forEach(({ item, evalInfo }) => {
      const alertKey = `${evalInfo.ymKey}_${item.id}_${evalInfo.status}`;
      if (!alertedDueKeys[alertKey]) {
        alertedDueKeys[alertKey] = true;
        newlyTriggered.push({ item, evalInfo });
      }
    });

    if (newlyTriggered.length > 0) {
      saveAlertedDueKeys();
      const top = newlyTriggered[0];
      playBudgetAlertChime(top.evalInfo.status === 'overdue' ? 95 : 75);

      if ('Notification' in window && Notification.permission === 'granted') {
        newlyTriggered.forEach(({ item, evalInfo }) => {
          try {
            const title = evalInfo.status === 'overdue'
              ? `🚨 Overdue Payment: ${item.title}`
              : evalInfo.status === 'due-today'
              ? `⏰ Due Today: ${item.title}`
              : `📅 Upcoming Due Date: ${item.title}`;
            const amtStr = item.expectedAmount > 0 ? ` (${settings.currency} ${formatNumber(item.expectedAmount)})` : '';
            new Notification(title, {
              body: `${item.title}${amtStr} is ${evalInfo.badgeText.toLowerCase()} (${evalInfo.dueDateFormatted}).`,
              icon: './icons/icon-192.png',
              tag: `paragon_due_${item.id}_${evalInfo.ymKey}`
            });
          } catch (e) {}
        });
      }
    }
  }

  function populateDueCategorySelect(selectedCatId = 'rent') {
    const select = document.getElementById('due-category-select');
    if (!select) return;
    const cats = getExpenseCategories();
    select.innerHTML = cats.map(c => `
      <option value="${escapeHTML(c.id)}" ${c.id === selectedCatId ? 'selected' : ''}>
        ${escapeHTML(c.name)}
      </option>
    `).join('');
  }

  function updateDueModalPaidFromUI() {
    document.querySelectorAll('#due-paid-from-selector .member-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-due-paid-from') === dueModalPaidFrom);
    });
  }

  function updateDueDayChipsUI(dayVal) {
    const num = parseInt(dayVal, 10);
    document.querySelectorAll('#due-day-quick-chips .chip-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-due-day'), 10) === num);
    });
  }

  function openDueDateModal(editId = null, preset = null) {
    const modal = document.getElementById('due-date-modal');
    const modalTitle = document.getElementById('modal-due-date-title');
    const idInput = document.getElementById('due-item-id-input');
    const titleInput = document.getElementById('due-title-input');
    const amountInput = document.getElementById('due-amount-input');
    const dayInput = document.getElementById('due-day-input');
    const remindSelect = document.getElementById('due-remind-days-select');

    if (!modal) return;

    if (editId) {
      const existing = dueDateItems.find(d => d.id === editId);
      if (!existing) return;
      if (modalTitle) modalTitle.textContent = 'Edit Expenditure Due Date Alert';
      if (idInput) idInput.value = existing.id;
      if (titleInput) titleInput.value = existing.title || '';
      if (amountInput) amountInput.value = existing.expectedAmount > 0 ? existing.expectedAmount : '';
      if (dayInput) dayInput.value = existing.dueDay || 5;
      if (remindSelect) remindSelect.value = String(existing.remindDaysBefore ?? 3);
      dueModalPaidFrom = existing.paidFrom || 'buffer';
      populateDueCategorySelect(existing.categoryId || 'rent');
      updateDueDayChipsUI(existing.dueDay || 5);
    } else {
      if (modalTitle) modalTitle.textContent = 'Add Expenditure Due Date Alert';
      if (idInput) idInput.value = '';
      const defTitle = preset?.title || '';
      const defCat = preset?.categoryId || 'rent';
      const defDay = preset?.dueDay || 5;
      dueModalPaidFrom = preset?.paidFrom || 'buffer';

      if (titleInput) titleInput.value = defTitle;
      if (amountInput) {
        const defaultAmt = defCat === 'rent' && settings.budgets?.rent ? settings.budgets.rent : '';
        amountInput.value = defaultAmt;
      }
      if (dayInput) dayInput.value = defDay;
      if (remindSelect) remindSelect.value = '3';
      populateDueCategorySelect(defCat);
      updateDueDayChipsUI(defDay);
    }

    updateDueModalPaidFromUI();
    modal.classList.add('active');
    setTimeout(() => titleInput?.focus(), 120);
  }

  function closeDueDateModal() {
    document.getElementById('due-date-modal')?.classList.remove('active');
  }

  function handleSaveDueDateItem() {
    const idInput = document.getElementById('due-item-id-input');
    const titleInput = document.getElementById('due-title-input');
    const catSelect = document.getElementById('due-category-select');
    const amountInput = document.getElementById('due-amount-input');
    const dayInput = document.getElementById('due-day-input');
    const remindSelect = document.getElementById('due-remind-days-select');

    const rawTitle = (titleInput?.value || '').trim();
    if (!rawTitle) {
      showToast('⚠️ Please enter an expenditure or bill name (e.g. House Rent)');
      titleInput?.focus();
      return;
    }

    const dueDay = Math.min(31, Math.max(1, parseInt(dayInput?.value, 10) || 1));
    const remindDaysBefore = Math.max(0, parseInt(remindSelect?.value, 10) || 0);
    const expectedAmount = Math.max(0, parseFloat(amountInput?.value) || 0);
    const categoryId = catSelect?.value || 'rent';
    const existingId = (idInput?.value || '').trim();

    if (existingId) {
      const idx = dueDateItems.findIndex(d => d.id === existingId);
      if (idx !== -1) {
        dueDateItems[idx] = {
          ...dueDateItems[idx],
          title: rawTitle,
          categoryId,
          dueDay,
          remindDaysBefore,
          expectedAmount,
          paidFrom: dueModalPaidFrom
        };
      }
    } else {
      dueDateItems.push({
        id: 'due_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        title: rawTitle,
        categoryId,
        dueDay,
        remindDaysBefore,
        expectedAmount,
        paidFrom: dueModalPaidFrom,
        paidPeriods: {}
      });
    }

    saveDueDates();
    renderDueDatesUI();
    closeDueDateModal();
    triggerHaptic();
    showToast(`✅ Due date alert saved for "${rawTitle}" (${getOrdinalSuffix(dueDay)} of each month)`);
  }

  function handleDeleteDueDateItem(dueId) {
    const item = dueDateItems.find(d => d.id === dueId);
    if (!item) return;
    if (!confirm(`Delete monthly due date alert for "${item.title}"?`)) return;

    dueDateItems = dueDateItems.filter(d => d.id !== dueId);
    saveDueDates();
    renderDueDatesUI();
    triggerHaptic();
    showToast(`Removed due date alert "${item.title}"`);
  }

  function toggleMarkDuePaid(dueId, ymKey) {
    const item = dueDateItems.find(d => d.id === dueId);
    if (!item) return;
    const targetYm = ymKey || formatDateYMD(new Date()).slice(0, 7);
    item.paidPeriods = item.paidPeriods || {};

    if (item.paidPeriods[targetYm]) {
      delete item.paidPeriods[targetYm];
      showToast(`Marked "${item.title}" as unpaid for ${targetYm}`);
    } else {
      item.paidPeriods[targetYm] = true;
      showToast(`✅ Marked "${item.title}" as Paid for this month!`);
    }

    saveDueDates();
    renderDueDatesUI();
    triggerHaptic();
  }

  function handlePayDueItem(dueId) {
    const item = dueDateItems.find(d => d.id === dueId);
    if (!item) return;

    activePayingDueId = item.id;
    selectedTxType = 'expense';
    selectedCategory = item.categoryId || 'rent';
    selectedPaidFrom = item.paidFrom || 'buffer';
    if (selectedPaidFrom === 'faiza_wallet') {
      selectedSpentBy = 'faiza';
    } else if (selectedSpentBy === 'faiza') {
      selectedSpentBy = 'adil';
    }

    updateTxTypeUI();
    updateMemberSelectorsUI();
    renderCategoriesGrid();
    switchTab('tab-add');

    const amountInput = document.getElementById('amount-input');
    const notesInput = document.getElementById('notes-input');
    if (amountInput) {
      amountInput.value = item.expectedAmount > 0 ? item.expectedAmount : '';
      amountInput.focus();
    }
    if (notesInput) {
      notesInput.value = item.title;
    }

    triggerHaptic();
    showToast(`📝 Ready to log "${item.title}" — confirm amount & tap Save Expenditure`);
  }

  // --- Push Notifications Settings Helper ---
  function updateNotificationStatusUI() {
    const statusText = document.getElementById('push-notification-status-text');
    const btn = document.getElementById('btn-enable-push-notifications');
    if (!statusText || !btn) return;

    if (!('Notification' in window)) {
      statusText.textContent = 'In-app audio & modal alerts active';
      btn.style.display = 'none';
      return;
    }

    if (Notification.permission === 'granted') {
      statusText.textContent = 'Push, Audio & Modal alerts active';
      btn.textContent = 'Active ✅';
      btn.style.opacity = '0.7';
    } else if (Notification.permission === 'denied') {
      statusText.textContent = 'Push blocked in browser (In-app audio active)';
      btn.textContent = 'Blocked';
    } else {
      statusText.textContent = 'In-app audio active (Enable for phone push)';
      btn.textContent = 'Enable Push';
    }
  }

  async function handleEnablePushNotifications() {
    if (!('Notification' in window)) {
      showToast('⚠️ Notifications not supported on this browser (in-app alerts will be used)');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      updateNotificationStatusUI();
      if (permission === 'granted') {
        showToast('✅ Push notifications enabled for Paragon budget alerts!');
        new Notification('Paragon Budget Alerts', {
          body: 'Budget alerts enabled! You will be notified when household spending reaches 50%, 75%, 90%, and 100%.',
          icon: './icons/icon-192.png'
        });
      } else {
        showToast('Push permission was not granted (in-app alerts will still trigger)');
      }
    } catch (e) {
      console.warn('Notification permission error', e);
    }
  }

  // --- Header Summary Badge (Cumulative Running Balances for Buffer & Faiza's Wallet) ---
  function updateMonthSummaryBadge() {
    const badge = document.getElementById('header-month-badge');
    if (!badge) return;

    const currentCycle = getCyclePeriod(0);
    const stats = computeFundBalances(currentCycle);

    if (stats.allTimeBufferIn > 0 || stats.allTimeTransfers > 0) {
      badge.textContent = `🏦 Buffer: ${settings.currency} ${formatNumber(stats.bufferRunningBalance)} • 👛 Faiza: ${settings.currency} ${formatNumber(stats.faizaWalletRunningBalance)}`;
    } else {
      badge.textContent = `${currentCycle.shortMonthName} Spent: ${settings.currency} ${formatNumber(stats.cycleExpense)}`;
    }
  }

  // --- Currency & Theme ---
  function updateCurrencyDisplay() {
    const els = document.querySelectorAll('.currency-symbol');
    els.forEach(el => el.textContent = settings.currencySymbol || settings.currency);

    const select = document.getElementById('setting-currency-select');
    if (select) select.value = settings.currency;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.getElementById('theme-toggle-btn');
    if (themeIcon) {
      themeIcon.innerHTML = theme === 'dark'
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }
  }

  function toggleTheme() {
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme(settings.theme);
    saveSettings();
  }

  // --- JSON Backup & Restore ---
  function handleBackupJSON() {
    const payload = {
      app: 'paragon',
      version: 1,
      exportDate: new Date().toISOString(),
      settings: settings,
      customCategories: customCategories,
      dueDateItems: dueDateItems,
      transactions: transactions
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const filename = `paragon_backup_${formatDateYMD(new Date())}.json`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('✅ Backup downloaded');
  }

  function handleRestoreJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.transactions && Array.isArray(data.transactions)) {
          if (confirm(`Restore ${data.transactions.length} transactions from backup? This will merge with your current entries.`)) {
            if (Array.isArray(data.customCategories)) {
              const existingCatIds = new Set(customCategories.map(c => c.id));
              data.customCategories.forEach(c => {
                if (!existingCatIds.has(c.id)) {
                  customCategories.push(c);
                  existingCatIds.add(c.id);
                }
              });
              saveCustomCategories();
              renderCategoriesGrid();
              renderCategoryFilters();
            }

            if (Array.isArray(data.dueDateItems)) {
              const existingDueIds = new Set(dueDateItems.map(d => d.id));
              data.dueDateItems.forEach(d => {
                if (!existingDueIds.has(d.id)) {
                  dueDateItems.push(d);
                  existingDueIds.add(d.id);
                }
              });
              saveDueDates();
              renderDueDatesUI();
            }

            const existingIds = new Set(transactions.map(t => t.id));
            let addedCount = 0;
            data.transactions.forEach(item => {
              if (!existingIds.has(item.id)) {
                transactions.push(item);
                existingIds.add(item.id);
                addedCount++;
              }
            });
            saveTransactions();
            showToast(`✅ Restored ${addedCount} transactions!`);
          }
        } else {
          showToast('⚠️ Invalid backup file structure');
        }
      } catch (err) {
        showToast('⚠️ Could not parse JSON backup');
      }
    };
    reader.readAsText(file);
  }

  function handleClearAllData() {
    if (confirm('Are you sure you want to clear local transactions on this device? Make sure to export CSV or JSON backup first.')) {
      if (confirm('Final confirmation: Clear local transaction data?')) {
        transactions = [];
        saveTransactions();
        showToast('Local transaction data cleared');
      }
    }
  }

  // --- Tab Navigation ---
  function switchTab(tabId) {
    activeTab = tabId;

    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    if (tabId === 'tab-history') {
      renderCategoryFilters();
      renderTransactionsHistory();
    } else if (tabId === 'tab-analytics') {
      updateAnalytics();
      renderDueDatesUI();
    } else if (tabId === 'tab-export') {
      renderDueDatesUI();
      updateCSVPreview();
    } else if (tabId === 'tab-add') {
      renderDueDatesUI();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Utilities & Toast ---
  let toastTimer = null;
  function showToast(message, showUndo = false, actionId = '') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastUndo = document.getElementById('toast-undo-btn');

    if (!toast) return;
    if (toastTimer) clearTimeout(toastTimer);

    toastMsg.textContent = message;

    if (showUndo) {
      toastUndo.style.display = 'inline-block';
      toastUndo.onclick = () => {
        if (actionId === 'undo_delete') {
          undoLastDelete();
        } else {
          deleteTransaction(actionId);
          showToast('Undone!');
        }
        toast.classList.remove('show');
      };
    } else {
      toastUndo.style.display = 'none';
    }

    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  function triggerHaptic() {
    if (window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(12);
      } catch (e) {}
    }
  }

  function formatNumber(num) {
    if (isNaN(num)) return '0.00';
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDateYMD(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function formatTimeHMS(d) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  function formatTimeHM(d) {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function formatTime12(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- Service Worker Registration ---
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log('SW registration skipped or failed:', err);
        });
      });
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
      });
    });

    // Theme toggle
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

    // Transaction Type Switcher (Expense vs Income / House Fund)
    document.getElementById('tx-type-switcher')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.tx-type-btn');
      if (btn) {
        setTransactionType(btn.getAttribute('data-type'));
        triggerHaptic();
      }
    });

    // Category Grid selection & "+ Add New" tile
    const grid = document.getElementById('category-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.category-card');
        if (!card) return;
        if (card.getAttribute('data-action') === 'open-add-category') {
          openAddCategoryModal(selectedTxType);
          triggerHaptic();
          return;
        }
        selectedCategory = card.getAttribute('data-id');
        renderCategoriesGrid();
        triggerHaptic();
      });
    }

    // Open Add Category Modal buttons
    document.getElementById('btn-open-add-category')?.addEventListener('click', () => openAddCategoryModal(selectedTxType));
    document.getElementById('btn-analytics-add-category')?.addEventListener('click', () => openAddCategoryModal('expense'));
    document.getElementById('btn-settings-add-category')?.addEventListener('click', () => openAddCategoryModal('expense'));

    // Add Category Modal events
    document.getElementById('new-cat-type-selector')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.member-pill');
      if (pill) {
        newCatType = pill.getAttribute('data-cat-type') || 'expense';
        updateAddCategoryModalUI();
        triggerHaptic();
      }
    });

    document.getElementById('new-cat-icon-grid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.icon-picker-btn');
      if (btn) {
        newCatIcon = btn.getAttribute('data-icon') || 'tag';
        updateAddCategoryModalUI();
        triggerHaptic();
      }
    });

    document.getElementById('new-cat-color-grid')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.color-picker-btn');
      if (btn) {
        newCatColor = btn.getAttribute('data-color') || CATEGORY_COLORS[0];
        updateAddCategoryModalUI();
        triggerHaptic();
      }
    });

    document.getElementById('custom-categories-manage-list')?.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.custom-cat-delete-btn');
      if (delBtn) {
        handleDeleteCustomCategory(delBtn.getAttribute('data-delete-cat'));
      }
    });

    document.getElementById('add-cat-cancel-btn')?.addEventListener('click', closeAddCategoryModal);
    document.getElementById('add-cat-save-btn')?.addEventListener('click', handleSaveNewCategory);
    document.getElementById('add-category-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'add-category-modal') closeAddCategoryModal();
    });

    // Quick Amount buttons
    document.querySelectorAll('.chip-btn[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        handleQuickAmount(parseFloat(btn.getAttribute('data-add')));
      });
    });

    document.getElementById('clear-amount-btn')?.addEventListener('click', handleClearAmount);

    // Date selector pills
    document.getElementById('date-pill-now')?.addEventListener('click', () => {
      dateSelectionMode = 'now';
      updateDateSelectorUI();
    });
    document.getElementById('date-pill-yesterday')?.addEventListener('click', () => {
      dateSelectionMode = 'yesterday';
      updateDateSelectorUI();
    });
    document.getElementById('date-pill-custom')?.addEventListener('click', () => {
      dateSelectionMode = 'custom';
      updateDateSelectorUI();
    });

    // Add Expense / Income Form
    document.getElementById('expense-form')?.addEventListener('submit', handleAddExpense);

    // History Search
    document.getElementById('history-search-input')?.addEventListener('input', (e) => {
      historySearchQuery = e.target.value;
      renderTransactionsHistory();
    });

    // History Type Filter Row
    document.getElementById('type-filter-row')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.member-filter-chip');
      if (chip) {
        historyTypeFilter = chip.getAttribute('data-tx-type') || 'all';
        historyCategoryFilter = 'all';
        updateMemberSelectorsUI();
        renderCategoryFilters();
        renderTransactionsHistory();
      }
    });

    // History Category Filter Pills
    document.getElementById('filter-pills-container')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (chip) {
        historyCategoryFilter = chip.getAttribute('data-cat');
        renderCategoryFilters();
        renderTransactionsHistory();
      }
    });

    // History Member Filter Row
    document.getElementById('member-filter-row')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.member-filter-chip');
      if (chip) {
        historyMemberFilter = chip.getAttribute('data-member') || 'all';
        updateMemberSelectorsUI();
        renderTransactionsHistory();
      }
    });

    // Form Spent By / Contributed By Member Selector
    document.getElementById('form-member-selector')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.member-pill');
      if (pill) {
        selectedSpentBy = pill.getAttribute('data-member') || 'adil';
        if (selectedTxType === 'expense') {
          selectedPaidFrom = selectedSpentBy === 'faiza' ? 'faiza_wallet' : 'buffer';
        }
        updateMemberSelectorsUI();
        triggerHaptic();
      }
    });

    // Form Paid From Selector (Buffer Account vs Faiza's Wallet)
    document.getElementById('form-paid-from-selector')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.member-pill');
      if (pill) {
        selectedPaidFrom = pill.getAttribute('data-paid-from') || 'buffer';
        updateMemberSelectorsUI();
        triggerHaptic();
      }
    });

    // Settings Profile Selector ("Who is using this phone?")
    document.getElementById('settings-profile-selector')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.member-pill');
      if (pill) {
        const profileId = pill.getAttribute('data-profile');
        if (profileId) {
          setDeviceProfile(profileId);
          triggerHaptic();
        }
      }
    });

    // Edit Modal Type Selector
    document.getElementById('edit-type-selector')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.member-pill');
      if (pill) {
        editSelectedType = pill.getAttribute('data-edit-type') || 'expense';
        document.querySelectorAll('#edit-type-selector .member-pill').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-edit-type') === editSelectedType);
        });
        populateEditCategorySelect(editSelectedType, '');
        triggerHaptic();
      }
    });

    // Edit Modal Paid From Selector
    document.getElementById('edit-paid-from-selector')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.member-pill');
      if (pill) {
        editSelectedPaidFrom = pill.getAttribute('data-edit-paid-from') || 'buffer';
        document.querySelectorAll('#edit-paid-from-selector .member-pill').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-edit-paid-from') === editSelectedPaidFrom);
        });
        triggerHaptic();
      }
    });

    // Edit Modal Member Selector
    document.getElementById('edit-member-selector')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.member-pill');
      if (pill) {
        editSelectedSpentBy = pill.getAttribute('data-edit-member') || 'adil';
        if (editSelectedType === 'expense') {
          editSelectedPaidFrom = editSelectedSpentBy === 'faiza' ? 'faiza_wallet' : 'buffer';
          document.querySelectorAll('#edit-paid-from-selector .member-pill').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-edit-paid-from') === editSelectedPaidFrom);
          });
        }
        document.querySelectorAll('#edit-member-selector .member-pill').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-edit-member') === editSelectedSpentBy);
        });
        triggerHaptic();
      }
    });

    // Force Cloud Sync Button
    document.getElementById('btn-force-sync')?.addEventListener('click', () => {
      triggerHaptic();
      if (!db) {
        showToast('⚠️ Connecting to Firebase...');
        initFirebase();
        return;
      }
      uploadAllLocalTransactionsToCloud();
      uploadBudgetsToCloud(settings.budgets);
      uploadCustomCategoriesToCloud(customCategories);
      uploadCycleToCloud();
      uploadDueDatesToCloud(dueDateItems);
      showToast('☁️ Synced all transactions, budgets, categories, due dates, and cycle dates with Paragon Cloud!');
    });

    // Transaction Action buttons (Edit & Delete delegation)
    document.getElementById('transactions-container')?.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.tx-action-btn.delete');
      if (delBtn) {
        const id = delBtn.getAttribute('data-id');
        if (confirm('Delete this transaction entry?')) {
          deleteTransaction(id);
        }
        return;
      }

      const editBtn = e.target.closest('.tx-action-btn.edit');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        openEditModal(id);
        return;
      }
    });

    // Edit Modal events
    document.getElementById('edit-cancel-btn')?.addEventListener('click', closeEditModal);
    document.getElementById('edit-save-btn')?.addEventListener('click', saveEditedTransaction);
    document.getElementById('edit-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'edit-modal') closeEditModal();
    });

    // Export & Settings events
    document.getElementById('btn-export-csv')?.addEventListener('click', handleExportCSV);
    document.getElementById('export-range-select')?.addEventListener('change', updateCSVPreview);

    document.getElementById('setting-currency-select')?.addEventListener('change', (e) => {
      settings.currency = e.target.value;
      settings.currencySymbol = e.target.value;
      saveSettings();
      renderTransactionsHistory();
      updateAnalytics();
      updateCSVPreview();
      updateMonthSummaryBadge();
      showToast(`Currency changed to ${settings.currency}`);
    });

    document.getElementById('btn-backup-json')?.addEventListener('click', handleBackupJSON);

    const restoreInput = document.getElementById('restore-file-input');
    document.getElementById('btn-restore-json')?.addEventListener('click', () => {
      restoreInput?.click();
    });
    if (restoreInput) {
      restoreInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleRestoreJSON(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    document.getElementById('btn-clear-all')?.addEventListener('click', handleClearAllData);

    // CSV Import Events
    const importFileInput = document.getElementById('import-csv-file-input');
    document.getElementById('btn-trigger-import-csv')?.addEventListener('click', () => {
      importFileInput?.click();
    });
    if (importFileInput) {
      importFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          processImportCSV(e.target.files[0]);
        }
      });
    }
    document.getElementById('import-csv-confirm-btn')?.addEventListener('click', confirmCSVImport);
    document.getElementById('import-csv-cancel-btn')?.addEventListener('click', closeImportCSVModal);
    document.getElementById('import-csv-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'import-csv-modal') closeImportCSVModal();
    });

    // Budget Manager Events
    document.getElementById('btn-open-budget-manager')?.addEventListener('click', openBudgetManagerModal);
    document.getElementById('btn-quick-set-budgets')?.addEventListener('click', openBudgetManagerModal);
    document.getElementById('btn-settings-open-budgets')?.addEventListener('click', openBudgetManagerModal);
    document.getElementById('budget-modal-cancel-btn')?.addEventListener('click', closeBudgetManagerModal);
    document.getElementById('budget-modal-save-btn')?.addEventListener('click', saveAllBudgets);
    document.getElementById('budget-manager-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'budget-manager-modal') closeBudgetManagerModal();
    });

    // Configurable Month Start Date (Budget Cycle) Modal Events
    document.getElementById('btn-open-cycle-settings')?.addEventListener('click', openCycleSettingsModal);
    document.getElementById('btn-fund-open-cycle-settings')?.addEventListener('click', openCycleSettingsModal);
    document.getElementById('btn-settings-open-cycle')?.addEventListener('click', openCycleSettingsModal);
    document.getElementById('cycle-start-date-input')?.addEventListener('input', (e) => {
      updateCycleModalPreview(e.target.value, null, true);
    });
    document.getElementById('cycle-start-date-input')?.addEventListener('change', (e) => {
      updateCycleModalPreview(e.target.value, null, true);
    });
    document.getElementById('cycle-end-date-input')?.addEventListener('input', (e) => {
      const startVal = document.getElementById('cycle-start-date-input')?.value || '';
      updateCycleModalPreview(startVal, e.target.value, false);
    });
    document.getElementById('cycle-end-date-input')?.addEventListener('change', (e) => {
      const startVal = document.getElementById('cycle-start-date-input')?.value || '';
      updateCycleModalPreview(startVal, e.target.value, false);
    });
    document.getElementById('cycle-quick-day-chips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn[data-cycle-day]');
      if (chip) {
        handleQuickCycleDaySelect(chip.getAttribute('data-cycle-day'));
      }
    });
    document.getElementById('cycle-modal-cancel-btn')?.addEventListener('click', closeCycleSettingsModal);
    document.getElementById('cycle-modal-save-btn')?.addEventListener('click', saveCycleSettings);
    document.getElementById('cycle-settings-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'cycle-settings-modal') closeCycleSettingsModal();
    });

    // Single Category Quick Budget Modal Events
    document.getElementById('quick-budget-cancel-btn')?.addEventListener('click', closeQuickBudgetModal);
    document.getElementById('quick-budget-save-btn')?.addEventListener('click', saveQuickBudget);
    document.getElementById('quick-budget-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'quick-budget-modal') closeQuickBudgetModal();
    });

    // Expenditure Due Dates & Alerts Events
    document.getElementById('btn-open-add-due-date')?.addEventListener('click', () => openDueDateModal());
    document.getElementById('btn-settings-add-due-date')?.addEventListener('click', () => openDueDateModal());

    document.getElementById('due-preset-chips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.due-preset-chip');
      if (chip) {
        openDueDateModal(null, {
          title: chip.getAttribute('data-preset-title') || '',
          categoryId: chip.getAttribute('data-preset-cat') || 'bills',
          dueDay: parseInt(chip.getAttribute('data-preset-day'), 10) || 5,
          paidFrom: chip.getAttribute('data-preset-paid') || 'buffer'
        });
        triggerHaptic();
      }
    });

    document.getElementById('due-day-quick-chips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn[data-due-day]');
      if (chip) {
        const dVal = parseInt(chip.getAttribute('data-due-day'), 10) || 5;
        const dayInput = document.getElementById('due-day-input');
        if (dayInput) dayInput.value = dVal;
        updateDueDayChipsUI(dVal);
        triggerHaptic();
      }
    });

    document.getElementById('due-day-input')?.addEventListener('input', (e) => {
      updateDueDayChipsUI(e.target.value);
    });

    document.getElementById('due-paid-from-selector')?.addEventListener('click', (e) => {
      const pill = e.target.closest('.member-pill');
      if (pill) {
        dueModalPaidFrom = pill.getAttribute('data-due-paid-from') || 'buffer';
        updateDueModalPaidFromUI();
        triggerHaptic();
      }
    });

    document.getElementById('due-modal-cancel-btn')?.addEventListener('click', closeDueDateModal);
    document.getElementById('due-modal-save-btn')?.addEventListener('click', handleSaveDueDateItem);
    document.getElementById('due-date-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'due-date-modal') closeDueDateModal();
    });

    // Delegated click for "Edit Budget" and Due Date actions across cards and banners
    document.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-quick-edit-budget');
      if (editBtn) {
        const catId = editBtn.getAttribute('data-cat');
        if (catId) openQuickBudgetModal(catId);
        return;
      }

      const dueActionBtn = e.target.closest('[data-due-action]');
      if (dueActionBtn) {
        const action = dueActionBtn.getAttribute('data-due-action');
        const dueId = dueActionBtn.getAttribute('data-due-id');
        if (action === 'open-settings') {
          switchTab('tab-export');
        } else if (action === 'pay' && dueId) {
          handlePayDueItem(dueId);
        } else if (action === 'toggle-paid' && dueId) {
          toggleMarkDuePaid(dueId, dueActionBtn.getAttribute('data-ym'));
        } else if (action === 'edit' && dueId) {
          openDueDateModal(dueId);
        } else if (action === 'delete' && dueId) {
          handleDeleteDueDateItem(dueId);
        }
      }
    });

    // Budget Alert Modal Close
    document.getElementById('budget-alert-modal-close')?.addEventListener('click', () => {
      document.getElementById('budget-alert-modal')?.classList.remove('active');
    });
    document.getElementById('budget-alert-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'budget-alert-modal') {
        document.getElementById('budget-alert-modal')?.classList.remove('active');
      }
    });

    // Push Notifications Toggle
    document.getElementById('btn-enable-push-notifications')?.addEventListener('click', handleEnablePushNotifications);

    // Install instructions helper modal toggle
    document.getElementById('btn-how-to-install')?.addEventListener('click', () => {
      document.getElementById('install-modal')?.classList.add('active');
    });
    document.getElementById('install-modal-close')?.addEventListener('click', () => {
      document.getElementById('install-modal')?.classList.remove('active');
    });
    document.getElementById('install-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'install-modal') {
        document.getElementById('install-modal')?.classList.remove('active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
