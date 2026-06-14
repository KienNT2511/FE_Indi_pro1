import vi from './translations/vi'
import en from './translations/en'

export type Lang = 'vi' | 'en'

export interface Translations {
  common: { appName: string; appDescription: string; save: string; cancel: string }
  auth: {
    login: {
      title: string; subtitle: string; email: string; password: string
      forgotPassword: string; submit: string; footerText: string; footerLink: string; error: string
    }
    register: {
      title: string; subtitle: string; name: string; nameOptional: string; namePlaceholder: string
      email: string; password: string; passwordPlaceholder: string
      confirmPassword: string; confirmPlaceholder: string
      submit: string; footerText: string; footerLink: string; mismatch: string; error: string
    }
  }
  nav: {
    dashboard: string; products: string; customers: string; orders: string; changePassword: string; logout: string
    language: string; signedIn: string; account: string
    logoutConfirmTitle: string; logoutConfirmDesc: string; logoutConfirm: string; logoutCancel: string
  }
  dashboard: { title: string; subtitle: string; welcome: string }
  account: { title: string; subtitle: string; accountInfo: string; id: string; email: string }
  products: {
    title: string; subtitle: string
    searchPlaceholder: string; filterPlaceholder: string; allCategories: string; addBtn: string; importBtn: string
    colName: string; colPrice: string; colQuantity: string; colMaterial: string; colCategory: string; colActions: string
    empty: string; loading: string; total: string; page: string; prev: string; next: string
    createTitle: string; editTitle: string
    fName: string; fPrice: string; fQuantity: string; fMaterial: string; fCategory: string; materialOptional: string
    namePlaceholder: string; pricePlaceholder: string; quantityPlaceholder: string; materialPlaceholder: string; categoryPlaceholder: string
    saveBtn: string; createBtn: string; cancelBtn: string
    deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
    importTitle: string; importDesc: string; chooseFile: string; uploadBtn: string
    importedLabel: string; failedLabel: string; rowLabel: string; close: string
    createSuccess: string; updateSuccess: string; deleteSuccess: string
    saveError: string; loadError: string; importError: string
    nameRequired: string; categoryRequired: string
    fMinStock: string; fUnit: string; minStockPlaceholder: string; unitPlaceholder: string; unitOptional: string
    fCost: string; costPlaceholder: string
  }
  customers: {
    title: string; subtitle: string
    searchPlaceholder: string; filterPlaceholder: string; addBtn: string
    colName: string; colPhone: string; colEmail: string; colAddress: string; colActions: string
    empty: string; loading: string; total: string; page: string; prev: string; next: string
    createTitle: string; editTitle: string; optional: string
    fName: string; fPhone: string; fEmail: string; fAddress: string; fNote: string
    namePlaceholder: string; phonePlaceholder: string; emailPlaceholder: string; addressPlaceholder: string; notePlaceholder: string
    saveBtn: string; createBtn: string; cancelBtn: string
    deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
    createSuccess: string; updateSuccess: string; deleteSuccess: string
    saveError: string; loadError: string; nameRequired: string
  }
  orders: {
    title: string; subtitle: string
    searchPlaceholder: string; filterPlaceholder: string; addBtn: string
    allStatuses: string; allPayments: string
    status: { pending: string; confirmed: string; shipping: string; completed: string; cancelled: string }
    payMethod: { cash: string; bank_transfer: string; card: string; cod: string }
    payStatus: { unpaid: string; partial: string; paid: string }
    colCode: string; colCustomer: string; colDate: string; colTotal: string; colStatus: string; colPayment: string; colActions: string
    empty: string; loading: string; total: string; page: string; prev: string; next: string
    createTitle: string; viewTitle: string; editTitle: string; optional: string
    fCustomer: string; fOrderDate: string; fPaymentMethod: string; fNote: string
    selectCustomer: string; selectProduct: string
    itemsTitle: string; colProduct: string; colQty: string; colUnitPrice: string; colLineTotal: string; addItem: string; noItems: string
    subtotal: string; discount: string; taxRate: string; taxAmount: string; shippingFee: string; totalLabel: string; amountPaid: string; remaining: string
    saveBtn: string; createBtn: string; cancelBtn: string; closeBtn: string
    viewAction: string; editAction: string; deleteAction: string; changeStatusTitle: string
    deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
    detailInfo: string; detailItems: string; detailSummary: string
    customerLabel: string; phoneLabel: string; dateLabel: string; statusLabel: string; paymentLabel: string; noteLabel: string
    createSuccess: string; updateSuccess: string; statusSuccess: string; deleteSuccess: string
    saveError: string; loadError: string; customerRequired: string; itemsRequired: string
  }
  changePassword: {
    title: string; subtitle: string; sectionTitle: string
    currentPassword: string; currentPlaceholder: string
    newPassword: string; newPlaceholder: string
    confirmPassword: string; confirmPlaceholder: string
    submit: string; success: string; error: string; mismatch: string
    tipsTitle: string; tips: readonly string[]
  }
  strength: { weak: string; medium: string; fair: string; strong: string; minLength: string; uppercase: string; number: string }
  inventory: {
    nav: {
      group: string; stock: string; lowStock: string; movements: string; warehouses: string
      batches: string; receipts: string; issues: string; transfers: string; counts: string
    }
    common: {
      total: string; page: string; prev: string; next: string; loading: string; empty: string
      optional: string; cancel: string; save: string; create: string; close: string; actions: string
      search: string; allWarehouses: string; selectWarehouse: string; selectProduct: string
    }
    warehouses: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      colCode: string; colName: string; colAddress: string; colStatus: string; colActions: string
      active: string; inactive: string; createTitle: string; editTitle: string
      fCode: string; fName: string; fAddress: string; fActive: string
      codePlaceholder: string; namePlaceholder: string; addressPlaceholder: string
      codeRequired: string; nameRequired: string
      createSuccess: string; updateSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      saveError: string; loadError: string
    }
    batches: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      colCode: string; colProduct: string; colMfg: string; colExpiry: string; colStatus: string; colActions: string
      expiringFilter: string; allBatches: string; expiring7: string; expiring30: string
      statusExpired: string; statusSoon: string; statusValid: string; noExpiry: string
      createTitle: string; editTitle: string
      fCode: string; fProduct: string; fMfg: string; fExpiry: string; fNote: string
      codePlaceholder: string; notePlaceholder: string; codeRequired: string; productRequired: string
      createSuccess: string; updateSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      saveError: string; loadError: string
    }
    stock: {
      title: string; subtitle: string; searchPlaceholder: string; onlyInStock: string
      colProduct: string; colWarehouse: string; colBatch: string; colExpiry: string; colQty: string; colUnit: string
      noBatch: string; loadError: string
    }
    lowStock: {
      title: string; subtitle: string; searchPlaceholder: string
      colProduct: string; colCategory: string; colQty: string; colMinStock: string; colShortage: string; colUnit: string
      empty: string; loadError: string
    }
    movements: {
      title: string; subtitle: string; searchPlaceholder: string; allTypes: string
      colDate: string; colType: string; colProduct: string; colWarehouse: string; colChange: string; colBalance: string; colDoc: string
      types: { receipt: string; issue: string; transfer_in: string; transfer_out: string; adjust: string }
      empty: string; loadError: string
    }
    docs: {
      status: { posted: string; cancelled: string }
      receipt: { title: string; subtitle: string; addBtn: string; createTitle: string; partnerLabel: string; partnerPlaceholder: string }
      issue: { title: string; subtitle: string; addBtn: string; createTitle: string; partnerLabel: string; partnerPlaceholder: string }
      transfer: { title: string; subtitle: string; addBtn: string; createTitle: string; partnerLabel: string; partnerPlaceholder: string }
      count: { title: string; subtitle: string; addBtn: string; createTitle: string; partnerLabel: string; partnerPlaceholder: string }
      searchPlaceholder: string; allStatuses: string
      colCode: string; colDate: string; colWarehouse: string; colCounter: string; colPartner: string; colItems: string; colStatus: string; colActions: string
      fWarehouse: string; fCounterWarehouse: string; fReason: string; reasonPlaceholder: string; fDate: string; fNote: string; notePlaceholder: string
      itemsTitle: string; iProduct: string; iBatch: string; iBatchPlaceholder: string; iQty: string; iCountedQty: string; iSystemQty: string; iDiff: string; iNote: string
      addItem: string; noItems: string
      createBtn: string; cancelBtn: string; closeBtn: string
      viewTitle: string; detailInfo: string; detailItems: string
      viewAction: string; cancelAction: string; deleteAction: string
      cancelTitle: string; cancelDesc: string; cancelConfirm: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      createSuccess: string; cancelSuccess: string; deleteSuccess: string
      saveError: string; loadError: string
      warehouseRequired: string; counterRequired: string; itemsRequired: string
    }
  }
  purchasing: {
    nav: { group: string; suppliers: string; requests: string; orders: string; debts: string }
    common: {
      total: string; page: string; prev: string; next: string; loading: string; empty: string
      optional: string; cancel: string; save: string; create: string; close: string; actions: string
      search: string; selectSupplier: string; selectProduct: string; allStatuses: string
    }
    suppliers: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      colName: string; colPhone: string; colEmail: string; colTaxCode: string; colActions: string
      createTitle: string; editTitle: string
      fName: string; fPhone: string; fEmail: string; fAddress: string; fTaxCode: string; fNote: string
      namePlaceholder: string; phonePlaceholder: string; emailPlaceholder: string; addressPlaceholder: string; taxCodePlaceholder: string; notePlaceholder: string
      nameRequired: string
      createSuccess: string; updateSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      saveError: string; loadError: string
    }
    requests: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      status: { draft: string; submitted: string; approved: string; rejected: string; converted: string }
      colCode: string; colDate: string; colRequestedBy: string; colItems: string; colStatus: string; colActions: string
      createTitle: string; fRequestedBy: string; fRequestDate: string; fNote: string
      requestedByPlaceholder: string; notePlaceholder: string
      itemsTitle: string; iProduct: string; iQty: string; addItem: string; noItems: string
      createBtn: string; cancelBtn: string; closeBtn: string
      viewTitle: string; detailInfo: string; detailItems: string
      viewAction: string; deleteAction: string; changeStatus: string
      convertAction: string; convertTitle: string; convertDesc: string; convertConfirm: string
      statusSuccess: string; convertSuccess: string; createSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      saveError: string; loadError: string; itemsRequired: string; supplierRequired: string
    }
    orders: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string; allPayments: string
      status: { pending: string; confirmed: string; partially_received: string; received: string; cancelled: string }
      colCode: string; colSupplier: string; colDate: string; colTotal: string; colStatus: string; colPayment: string; colActions: string
      createTitle: string; fSupplier: string; fOrderDate: string; fExpectedDate: string; fPaymentMethod: string; fNote: string
      itemsTitle: string; iProduct: string; iQty: string; iReceived: string; iUnitCost: string; iLineTotal: string; addItem: string; noItems: string
      subtotal: string; discount: string; taxRate: string; taxAmount: string; shippingFee: string; totalLabel: string; amountPaid: string; remaining: string
      createBtn: string; cancelBtn: string; closeBtn: string
      viewTitle: string; detailInfo: string; detailItems: string; detailPayments: string
      viewAction: string; receiveAction: string; payAction: string; cancelAction: string; deleteAction: string; statusLabel: string
      receiveTitle: string; receiveWarehouse: string; receiveSelectWarehouse: string; receiveQtyLabel: string; receiveRemaining: string; receiveBatch: string; receiveBatchPlaceholder: string; receiveConfirm: string; receiveSuccess: string; receiveNothing: string
      payTitle: string; payAmount: string; payMethodLabel: string; payDate: string; payNote: string; payConfirm: string; paySuccess: string; payHistory: string; noPayments: string
      cancelTitle: string; cancelDesc: string; cancelConfirm: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      createSuccess: string; updateSuccess: string; statusSuccess: string; deleteSuccess: string
      saveError: string; loadError: string; supplierRequired: string; itemsRequired: string
      statTotalValue: string; statPaid: string; statOutstanding: string; statOrders: string
    }
    debts: {
      title: string; subtitle: string; searchPlaceholder: string
      colSupplier: string; colPhone: string; colOrders: string; colTotal: string; colPaid: string; colOutstanding: string
      empty: string; loadError: string
    }
  }
  sales: {
    nav: { group: string; quotations: string; deliveries: string; receivables: string; crm: string }
    common: {
      total: string; page: string; prev: string; next: string; loading: string; empty: string
      optional: string; cancel: string; save: string; create: string; close: string; actions: string
      search: string; selectCustomer: string; selectProduct: string; allStatuses: string
    }
    quotations: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      status: { draft: string; sent: string; accepted: string; rejected: string; converted: string }
      colCode: string; colCustomer: string; colDate: string; colTotal: string; colStatus: string; colActions: string
      createTitle: string; fCustomer: string; fQuoteDate: string; fValidUntil: string; fNote: string
      itemsTitle: string; iProduct: string; iQty: string; iUnitPrice: string; iLineTotal: string; addItem: string; noItems: string
      subtotal: string; discount: string; taxRate: string; taxAmount: string; totalLabel: string
      createBtn: string; cancelBtn: string; closeBtn: string
      viewTitle: string; detailInfo: string; detailItems: string; viewAction: string; deleteAction: string
      changeStatus: string; convertAction: string; convertTitle: string; convertDesc: string; convertConfirm: string
      statusSuccess: string; convertSuccess: string; createSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      saveError: string; loadError: string; customerRequired: string; itemsRequired: string
    }
    deliveries: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      colCode: string; colOrder: string; colWarehouse: string; colDate: string; colItems: string; colActions: string
      createTitle: string; fOrder: string; fWarehouse: string; selectOrder: string; selectWarehouse: string; fDeliveryDate: string; fNote: string
      iProduct: string; iOrdered: string; iDelivered: string; iRemaining: string; iQty: string; iBatch: string; iBatchPlaceholder: string
      nothingToDeliver: string; createBtn: string; cancelBtn: string; closeBtn: string
      viewTitle: string; detailInfo: string; detailItems: string; viewAction: string
      createSuccess: string; saveError: string; loadError: string; orderRequired: string; warehouseRequired: string; itemsRequired: string
    }
    receivables: {
      title: string; subtitle: string; searchPlaceholder: string
      colCustomer: string; colPhone: string; colOrders: string; colTotal: string; colPaid: string; colOutstanding: string; colActions: string
      collectAction: string; empty: string; loadError: string
      statRevenue: string; statCollected: string; statOutstanding: string; statOrders: string
      collectTitle: string; collectSelectOrder: string; collectNoOrders: string; collectAmount: string; collectMethod: string; collectDate: string; collectNote: string; collectConfirm: string; collectSuccess: string; amountRequired: string; orderRequired: string
    }
    crm: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string; allTypes: string
      type: { call: string; email: string; meeting: string; note: string; other: string }
      colDate: string; colCustomer: string; colType: string; colSubject: string; colFollowUp: string; colActions: string
      createTitle: string; editTitle: string
      fCustomer: string; fType: string; fSubject: string; fContent: string; fDate: string; fFollowUp: string
      subjectPlaceholder: string; contentPlaceholder: string
      createBtn: string; cancelBtn: string
      createSuccess: string; updateSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      saveError: string; loadError: string; customerRequired: string; subjectRequired: string
    }
  }
  production: {
    nav: { group: string; boms: string; orders: string }
    common: {
      total: string; page: string; prev: string; next: string; loading: string; empty: string
      optional: string; cancel: string; save: string; create: string; close: string; actions: string
      search: string; selectProduct: string; selectWarehouse: string; allStatuses: string
    }
    boms: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      colCode: string; colName: string; colProduct: string; colItems: string; colStatus: string; colActions: string
      active: string; inactive: string; createTitle: string; editTitle: string
      fName: string; fProduct: string; fActive: string; fNote: string; namePlaceholder: string; notePlaceholder: string
      itemsTitle: string; iMaterial: string; iQty: string; addItem: string; noItems: string
      createBtn: string; cancelBtn: string; nameRequired: string; productRequired: string; itemsRequired: string
      createSuccess: string; updateSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      saveError: string; loadError: string
    }
    orders: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      status: { planned: string; in_progress: string; completed: string; cancelled: string }
      colCode: string; colProduct: string; colProgress: string; colStatus: string; colDue: string; colActions: string
      createTitle: string; fProduct: string; fBom: string; fWarehouse: string; fPlannedQty: string; fStartDate: string; fDueDate: string; fLaborCost: string; fOverheadCost: string; fNote: string
      selectBom: string; noBom: string; createBtn: string; cancelBtn: string; closeBtn: string
      viewTitle: string; detailInfo: string; detailCosting: string; detailEntries: string
      viewAction: string; reportAction: string; cancelAction: string; deleteAction: string; progressLabel: string
      reportTitle: string; reportQty: string; reportRemaining: string; reportDate: string; reportNote: string; reportConfirm: string; reportSuccess: string; reportNothing: string
      costingTitle: string; cMaterial: string; cQtyPerUnit: string; cUnitCost: string; cLineCost: string; cPerUnitMaterial: string; cLabor: string; cOverhead: string; cUnitTotal: string; cTotalPlanned: string
      entriesTitle: string; eDate: string; eQty: string; eMaterialCost: string; noEntries: string
      cancelTitle: string; cancelDesc: string; cancelConfirm: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string
      createSuccess: string; statusSuccess: string; deleteSuccess: string; saveError: string; loadError: string
      productRequired: string; warehouseRequired: string; qtyRequired: string
      statOrders: string; statPlanned: string; statProduced: string
    }
  }
  finance: {
    nav: { group: string; reports: string; transactions: string; debts: string; accounts: string }
    common: {
      total: string; page: string; prev: string; next: string; loading: string; empty: string
      optional: string; cancel: string; save: string; create: string; close: string; actions: string
      search: string; selectAccount: string; allTypes: string
    }
    type: { receipt: string; payment: string }
    accountType: { cash: string; bank: string }
    category: {
      sales: string; other_income: string; capital: string
      purchase: string; salary: string; rent: string; utilities: string; tax: string; other_expense: string
    }
    accounts: {
      title: string; subtitle: string; addBtn: string; searchPlaceholder: string
      colCode: string; colName: string; colType: string; colBank: string; colBalance: string; colStatus: string; colActions: string
      active: string; inactive: string; createTitle: string; editTitle: string
      fCode: string; fName: string; fType: string; fBankName: string; fAccountNumber: string; fOpeningBalance: string; fActive: string; fNote: string
      codePlaceholder: string; namePlaceholder: string; bankPlaceholder: string; accountNumberPlaceholder: string; notePlaceholder: string
      codeRequired: string; nameRequired: string
      createSuccess: string; updateSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string; saveError: string; loadError: string
    }
    transactions: {
      title: string; subtitle: string; receiptBtn: string; paymentBtn: string; searchPlaceholder: string
      colCode: string; colDate: string; colType: string; colCategory: string; colAccount: string; colPartner: string; colAmount: string; colActions: string
      receiptTitle: string; paymentTitle: string
      fAccount: string; fCategory: string; fAmount: string; fPartner: string; fDate: string; fNote: string; partnerPlaceholder: string
      createBtn: string; accountRequired: string; amountRequired: string
      createSuccess: string; deleteSuccess: string
      deleteTitle: string; deleteDesc: string; deleteConfirm: string; deleteCancel: string; saveError: string; loadError: string
    }
    debts: {
      title: string; subtitle: string; tabReceivable: string; tabPayable: string
      colName: string; colPhone: string; colOrders: string; colTotal: string; colPaid: string; colOutstanding: string
      empty: string; loadError: string
    }
    reports: {
      title: string; subtitle: string
      statBalance: string; statReceivable: string; statPayable: string; statNet: string
      accountsTitle: string; cashflowTitle: string; incomeTitle: string
      from: string; to: string; apply: string
      totalIn: string; totalOut: string; netFlow: string
      revenue: string; purchases: string; grossProfit: string; otherIncome: string; otherExpense: string; netProfit: string
      inflows: string; outflows: string; noData: string; loadError: string
    }
  }
}

export const translations: Record<Lang, Translations> = {
  vi: vi as Translations,
  en: en as Translations,
}
