import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

type User = { id: number; name: string; email: string; role: string }

type Employee = {
  employee_id: number
  employee_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  dob: string | null
  nic: string | null
  address: string | null
  role: string
  designation: string | null
  tax: string | null
  created_at: string
}

type Project = {
  project_id: number
  project_name: string
  customer_name: string
  description: string | null
  initial_cost_budget: number
  extra_budget_allocation: number
  payment_type: string
  status: string
}

type ProjectItem = {
  project_id: number
  requirements: string
  service_category: string
  unit_cost: number
  requirement_type: string
}

type Vendor = {
  vendor_id: number
  vendor_name: string
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean
  created_at: string
}

type Payable = {
  payable_id: number
  vendor_id: number
  payable_name: string
  description: string | null
  payable_type: string
  amount: number
  frequency: string | null
  start_date: string | null
  end_date: string | null
  project_id: number | null
  is_active: boolean
  created_at: string
  vendor_name?: string
  project_name?: string
  bank_account_id?: number | null
  payment_method?: string | null
  reference_number?: string | null
}

type PettyCashTransaction = {
  id: number
  petty_cash_account_id: number
  transaction_type: string
  amount: number
  description: string | null
  transaction_date: string | null
  project_id: number | null
  created_at: string
  source_bank_account_id: number | null
  payable_id: number | null
  project_name?: string
}

export default function Dashboard({ user, onLogout }: { user: User; onLogout?: () => void }) {
  const [tab, setTab] = useState<'home' | 'employees' | 'projects' | 'accounting'>('home')
  const [navOpen, setNavOpen] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [nic, setNic] = useState('')
  const [address, setAddress] = useState('')
  const [role, setRole] = useState<'IT' | 'Accounting' | 'Marketing'>('IT')
  const [designation, setDesignation] = useState('')
  const [tax, setTax] = useState('')
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [initialCostBudget, setInitialCostBudget] = useState('')
  const [extraBudgetAllocation, setExtraBudgetAllocation] = useState('')
  const [paymentType, setPaymentType] = useState('')
  const [projectStatus, setProjectStatus] = useState('')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [projectEditModalOpen, setProjectEditModalOpen] = useState(false)
  const [projectDeleteModalOpen, setProjectDeleteModalOpen] = useState(false)
  const [projectItemsModalOpen, setProjectItemsModalOpen] = useState(false)
  const [openAccountModalOpen, setOpenAccountModalOpen] = useState(false)
  const [accountingSubTab, setAccountingSubTab] = useState<'accounts' | 'payable' | 'petty_cash'>('accounts')
  const [employeeSubTab, setEmployeeSubTab] = useState<'employees' | 'vendors'>('employees')
  const [bankName, setBankName] = useState('')
  const [branch, setBranch] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [openingBalance, setOpeningBalance] = useState('')
  const [itemsTableModalOpen, setItemsTableModalOpen] = useState(false)
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false)
  const [bankLogoLocalFailed, setBankLogoLocalFailed] = useState<Record<string, boolean>>({})
  const [bankLogoRemoteFailed, setBankLogoRemoteFailed] = useState<Record<string, boolean>>({})
  // const [newCardHolder, setNewCardHolder] = useState('John Doe')
  // const [newCardNumber, setNewCardNumber] = useState('4242 4242 4242 4242')
  const [cardSaveConfirmVisible, setCardSaveConfirmVisible] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const [isAddingVendor, setIsAddingVendor] = useState(false)
  const [vendorName, setVendorName] = useState('')
  const [vendorEmail, setVendorEmail] = useState('')
  const [vendorPhone, setVendorPhone] = useState('')
  const [vendorIsActive, setVendorIsActive] = useState(true)
  const [payables, setPayables] = useState<Payable[]>([])
  const [payablesLoading, setPayablesLoading] = useState(false)
  const [isAddingBill, setIsAddingBill] = useState(false)
  const [isReplenishing, setIsReplenishing] = useState(false)
  const [replenishAmount, setReplenishAmount] = useState('')
  const [replenishSourceAccountId, setReplenishSourceAccountId] = useState('')
  const [replenishReference, setReplenishReference] = useState('')
  const [billVendorId, setBillVendorId] = useState('')
  const [billName, setBillName] = useState('')
  const [billDescription, setBillDescription] = useState('')
  const [billType, setBillType] = useState('ONE_TIME')
  const [billAmount, setBillAmount] = useState('')
  const [billFrequency, setBillFrequency] = useState('')
  const [billStartDate, setBillStartDate] = useState('')
  const [billEndDate, setBillEndDate] = useState('')
  const [billProjectId, setBillProjectId] = useState('')
  const [billIsActive, setBillIsActive] = useState(true)
  const [billBankAccountId, setBillBankAccountId] = useState('')
  const [billPaymentMethod, setBillPaymentMethod] = useState('')
  const [billReferenceNumber, setBillReferenceNumber] = useState('')
  const [isNewPayableName, setIsNewPayableName] = useState(false)
  const uniquePayableNames = useMemo(() => Array.from(new Set(payables.map(p => p.payable_name))).filter(Boolean).sort(), [payables])
  const [pettyCashBalance, setPettyCashBalance] = useState<number | null>(null)
  const [pettyCashTransactions, setPettyCashTransactions] = useState<PettyCashTransaction[]>([])
  const [pettyCashTransactionsLoading, setPettyCashTransactionsLoading] = useState(false)
  const bankInputRef = useRef<HTMLInputElement | null>(null)
  const bankOptions: { name: string; slug: string; logoLocal: string; logoRemote: string }[] = [
    { name: 'Bank of Ceylon (BOC)', slug: 'boc', logoLocal: '/banks/boc.png.png', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Bank_of_Ceylon_logo.svg/256px-Bank_of_Ceylon_logo.svg.png' },
    { name: 'People’s Bank', slug: 'peoples', logoLocal: '/banks/peoples.png.jpg', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/79/Peoples_Bank_Sri_Lanka_logo.png/240px-Peoples_Bank_Sri_Lanka_logo.png' },
    { name: 'Commercial Bank of Ceylon', slug: 'commercial', logoLocal: '/banks/commercial.png.png', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/31/Commercial_Bank_of_Ceylon_logo.svg/240px-Commercial_Bank_of_Ceylon_logo.svg.png' },
    { name: 'Sampath Bank', slug: 'sampath', logoLocal: '/banks/sampath.png.png', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Sampath_Bank_logo.svg/256px-Sampath_Bank_logo.svg.png' },
    { name: 'Hatton National Bank (HNB)', slug: 'hnb', logoLocal: '/banks/hnb.png.webp', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Hatton_National_Bank_logo.svg/256px-Hatton_National_Bank_logo.svg.png' },
    { name: 'Seylan Bank', slug: 'seylan', logoLocal: '/banks/seylan.png.png', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Seylan_Bank_logo.svg/256px-Seylan_Bank_logo.svg.png' },
    { name: 'DFCC Bank', slug: 'dfcc', logoLocal: '/banks/dfcc.png.png', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/DFCC_Bank_logo.svg/256px-DFCC_Bank_logo.svg.png' },
    { name: 'National Savings Bank (NSB)', slug: 'nsb', logoLocal: '/banks/National_Savings_Bank_logo.png', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/National_Savings_Bank_logo.png/240px-National_Savings_Bank_logo.png' },
    { name: 'Nations Trust Bank (NTB)', slug: 'ntb', logoLocal: '/banks/ntb.png', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nations_Trust_Bank_logo.svg/256px-Nations_Trust_Bank_logo.svg.png' },
    { name: 'NDB Bank', slug: 'ndb', logoLocal: '/banks/ndb.png', logoRemote: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/NDB_Bank_logo.svg/256px-NDB_Bank_logo.svg.png' },
  ]
  
  
  const [currentProjectForItems, setCurrentProjectForItems] = useState<Project | null>(null)
  const [itemRequirements, setItemRequirements] = useState('')
  const [itemServiceCategory, setItemServiceCategory] = useState('')
  const [itemUnitCost, setItemUnitCost] = useState('')
  const [itemRequirementType, setItemRequirementType] = useState('')
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null)
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([])
  type Account = {
    id: number
    bank_id: number
    account_number: string
    account_name: string | null
    opening_balance: number | string
    current_balance: number | string
    created_at: string
    bank_name: string
    branch: string | null
  }
  type Card = {
    id: number
    bank_account_id: number
    card_number_last4: string
    card_holder_name: string
    expiry_date: string
    is_active: boolean
    created_at: string
  }
  const [cards, setCards] = useState<Card[]>([])
  const [selectedAccountForCards, setSelectedAccountForCards] = useState<Account | null>(null)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [cardBankAccountId, setCardBankAccountId] = useState('')
  const [cardSelectedAccountLabel, setCardSelectedAccountLabel] = useState('')
  const [cardNumberLast4, setCardNumberLast4] = useState('')
  const [cardHolderName, setCardHolderName] = useState('')
  const [cardExpiryDate, setCardExpiryDate] = useState('')
  const [cardStatus, setCardStatus] = useState<'Active' | 'Inactive' | 'Blocked'>('Active')
  const [cardAccountDropdownOpen, setCardAccountDropdownOpen] = useState(false)
  const cardAccountInputRef = useRef<HTMLInputElement | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('http://localhost:3000/employees')
      if (!r.ok) {
        console.error('Failed to fetch employees')
        return
      }
      const data = await r.json()
      setEmployees(data.employees || [])
    } catch (err) {
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'employees') {
      fetchEmployees()
    }
  }, [tab, fetchEmployees])

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true)
    try {
      const r = await fetch('http://localhost:3000/projects')
      if (!r.ok) {
        console.error('Failed to fetch projects')
        return
      }
      const data = await r.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
    } finally {
      setProjectsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'projects' || tab === 'home') {
      fetchProjects()
    }
  }, [tab, fetchProjects])

  const fetchAccounts = useCallback(async () => {
    setAccountsLoading(true)
    try {
      const r = await fetch('http://localhost:3000/accounts')
      if (!r.ok) {
        console.error('Failed to fetch accounts')
        return
      }
      const data = await r.json()
      setAccounts(data.accounts || [])
    } catch (err) {
      console.error('Error fetching accounts:', err)
    } finally {
      setAccountsLoading(false)
    }
  }, [])

  const fetchCards = useCallback(async () => {
    try {
      const r = await fetch('http://localhost:3000/accounts/debit-cards')
      if (!r.ok) {
        console.error('Failed to fetch cards')
        return
      }
      const data = await r.json()
      setCards(data.cards || [])
    } catch (err) {
      console.error('Error fetching cards:', err)
    }
  }, [])

  const fetchPettyCashBalance = useCallback(async () => {
    try {
      const r = await fetch('http://localhost:3000/petty-cash/balance')
      if (r.ok) {
        const data = await r.json()
        setPettyCashBalance(data.current_balance !== undefined ? Number(data.current_balance) : 0)
      }
    } catch (err) {
      console.error('Error fetching petty cash balance:', err)
    }
  }, [])

  const fetchPettyCashTransactions = useCallback(async () => {
    setPettyCashTransactionsLoading(true)
    try {
      const r = await fetch('http://localhost:3000/petty-cash/transactions')
      if (r.ok) {
        const data = await r.json()
        setPettyCashTransactions(data || [])
      }
    } catch (err) {
      console.error('Error fetching petty cash transactions:', err)
    } finally {
      setPettyCashTransactionsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'accounting' && accountingSubTab === 'accounts') {
      fetchAccounts()
      fetchCards()
    }
    if (tab === 'accounting' && accountingSubTab === 'petty_cash') {
      fetchPettyCashBalance()
      fetchPettyCashTransactions()
    }
  }, [tab, accountingSubTab, fetchAccounts, fetchCards, fetchPettyCashBalance, fetchPettyCashTransactions])
  useEffect(() => {
    if (cardModalOpen) {
      fetchAccounts()
    }
  }, [cardModalOpen, fetchAccounts])
  const resetCardForm = () => {
    setCardBankAccountId('')
    setCardSelectedAccountLabel('')
    setCardNumberLast4('')
    setCardHolderName('')
    setCardExpiryDate('')
    setCardStatus('Active')
  }
  const submitCard = async () => {
    if (!cardBankAccountId || !cardNumberLast4 || !cardHolderName || !cardExpiryDate || !cardStatus) {
      return
    }
    if (!/^\d{4}$/.test(cardNumberLast4.trim())) {
      return
    }
    try {
      const r = await fetch('http://localhost:3000/accounts/debit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_account_id: Number(cardBankAccountId),
          card_number_last4: cardNumberLast4.trim(),
          card_holder_name: cardHolderName.trim(),
          expiry_date: cardExpiryDate,
          is_active: cardStatus === 'Active',
        }),
      })
      if (!r.ok) {
        await r.json().catch(() => ({}))
        setCardSaveConfirmVisible(true)
        setTimeout(() => setCardSaveConfirmVisible(false), 950)
        return
      }
      fetchCards()
      setCardModalOpen(false)
      resetCardForm()
      setCardSaveConfirmVisible(true)
      setTimeout(() => setCardSaveConfirmVisible(false), 950)
    } catch {
      setCardSaveConfirmVisible(true)
      setTimeout(() => setCardSaveConfirmVisible(false), 950)
    }
  }

  const fetchVendors = useCallback(async () => {
    setVendorsLoading(true)
    try {
      const r = await fetch('http://localhost:3000/vendors')
      if (r.ok) {
        const data = await r.json()
        setVendors(data.vendors)
      }
    } catch (e) {
      console.error('Failed to fetch vendors', e)
    } finally {
      setVendorsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'employees' && employeeSubTab === 'vendors') {
      fetchVendors()
    }
  }, [tab, employeeSubTab, fetchVendors])

  const handleSaveVendor = async () => {
    if (!vendorName) return alert('Vendor Name is required')
    setSaving(true)
    try {
      const r = await fetch('http://localhost:3000/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_name: vendorName,
          contact_email: vendorEmail,
          contact_phone: vendorPhone,
          is_active: vendorIsActive
        })
      })
      if (r.ok) {
        setVendorName('')
        setVendorEmail('')
        setVendorPhone('')
        setVendorIsActive(true)
        setIsAddingVendor(false)
        fetchVendors()
      } else {
        alert('Failed to create vendor')
      }
    } catch (e) {
      console.error(e)
      alert('Error creating vendor')
    } finally {
      setSaving(false)
    }
  }

  const fetchPayables = useCallback(async () => {
    setPayablesLoading(true)
    try {
      const r = await fetch('http://localhost:3000/payables')
      if (r.ok) {
        const data = await r.json()
        setPayables(data.payables || [])
      }
    } catch (e) {
      console.error('Failed to fetch payables', e)
    } finally {
      setPayablesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'accounting' && (accountingSubTab === 'payable' || accountingSubTab === 'petty_cash')) {
      fetchPayables()
      // We also need vendors and projects for the form
      fetchVendors()
      fetchProjects()
      fetchAccounts()
    }
  }, [tab, accountingSubTab, fetchPayables, fetchVendors, fetchProjects, fetchAccounts])

  // Reset UI state when tabs change to prevent state leaks (e.g. keeping "Add Bill" open when switching tabs)
  useEffect(() => {
    setIsAddingBill(false)
    setIsReplenishing(false)
    setIsNewPayableName(false)
  }, [tab, accountingSubTab])

  const handleSaveBill = async () => {
    // Validation
    if (billType === 'PETTY_CASH') {
      if (!billAmount) {
        alert('Missing required fields: Amount')
        return
      }
      // Handle Petty Cash Bill separately
      setSaving(true)
      try {
        const r = await fetch('http://localhost:3000/petty-cash/bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(billAmount),
            description: billDescription,
            project_id: billProjectId ? Number(billProjectId) : null,
            transaction_date: billStartDate || null
          })
        })
        if (r.ok) {
          setBillAmount('')
          setBillDescription('')
          setBillProjectId('')
          setBillStartDate('')
          setIsAddingBill(false)
          setIsNewPayableName(false)
          fetchPettyCashBalance()
          fetchPettyCashTransactions()
        } else {
          alert('Failed to add petty cash bill')
        }
      } catch (e) {
        console.error(e)
        alert('Error adding petty cash bill')
      } finally {
        setSaving(false)
      }
      return
    } else {
      if (!billVendorId || !billName || !billType || !billAmount) {
        alert('Missing required fields')
        return
      }
    }

    setSaving(true)
    try {
      const r = await fetch('http://localhost:3000/payables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: billVendorId ? Number(billVendorId) : null,
          payable_name: billName || (billType === 'PETTY_CASH' ? 'Petty Cash Expense' : ''),
          description: billDescription,
          payable_type: billType,
          amount: Number(billAmount),
          frequency: billFrequency || null,
          start_date: billStartDate || null,
          end_date: billEndDate || null,
          project_id: billProjectId ? Number(billProjectId) : null,
          is_active: billIsActive,
          bank_account_id: billBankAccountId ? Number(billBankAccountId) : null,
          payment_method: billPaymentMethod || null,
          reference_number: billReferenceNumber || null
        })
      })
      if (r.ok) {
        setBillVendorId('')
        setBillName('')
        setBillDescription('')
        setBillType('ONE_TIME')
        setBillAmount('')
        setBillFrequency('')
        setBillStartDate('')
        setBillEndDate('')
        setBillProjectId('')
        setBillIsActive(true)
        setBillBankAccountId('')
        setBillPaymentMethod('')
        setBillReferenceNumber('')
        setIsAddingBill(false)
        setIsNewPayableName(false)
        fetchPayables()
        if (billType === 'PETTY_CASH') {
          fetchPettyCashBalance()
        }
      } else {
        alert('Failed to create bill')
      }
    } catch (e) {
      console.error(e)
      alert('Error creating bill')
    } finally {
      setSaving(false)
    }
  }

  const openEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDetailsOpen(true)
  }

  const fetchProjectItems = useCallback(async () => {
    if (!currentProjectForItems) return
    try {
      const r = await fetch(`http://localhost:3000/projects/${currentProjectForItems.project_id}/items`)
      if (r.ok) {
        const data = await r.json()
        setProjectItems(data.items || [])
      }
    } catch (e) {
      console.error(e)
    }
  }, [currentProjectForItems])

  useEffect(() => {
    fetchProjectItems()
  }, [fetchProjectItems])

  const openProjectItemsModal = async (project: Project) => {
    setCurrentProjectForItems(project)
    setItemRequirements('')
    setItemServiceCategory('')
    setItemUnitCost('')
    setItemRequirementType('')
    setEditingItem(null)
    setProjectItemsModalOpen(true)
  }

  const clearItemForm = () => {
    setItemRequirements('')
    setItemServiceCategory('')
    setItemUnitCost('')
    setItemRequirementType('')
    setEditingItem(null)
  }

  const saveProjectItem = async () => {
    if (!currentProjectForItems) return
    if (!itemRequirements || !itemServiceCategory || itemUnitCost === '' || !itemRequirementType) {
      alert('Missing required fields for item')
      return
    }
    const body = {
      requirements: itemRequirements,
      service_category: itemServiceCategory,
      unit_cost: Number(itemUnitCost),
      requirement_type: itemRequirementType,
    }
    try {
      if (editingItem) {
        const r = await fetch(`http://localhost:3000/projects/${currentProjectForItems.project_id}/items/${encodeURIComponent(editingItem.requirements)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_category: itemServiceCategory,
            unit_cost: Number(itemUnitCost),
            requirement_type: itemRequirementType,
          }),
        })
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          alert(d.error || 'Failed to update item')
          return
        }
        alert('Item updated')
      } else {
        const r = await fetch(`http://localhost:3000/projects/${currentProjectForItems.project_id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          alert(d.error || 'Failed to create item')
          return
        }
        alert('Item created')
      }
      clearItemForm()
      await fetchProjects()
      await fetchProjectItems()
    } catch (err) {
      console.error(err)
      alert('Server error')
    }
  }

  const resetOpenAccountForm = () => {
    setBankName('')
    setBranch('')
    setAccountNumber('')
    setAccountName('')
    setOpeningBalance('')
  }

  const saveOpenAccount = async () => {
    if (!bankName || !branch || !accountNumber || !accountName || openingBalance === '') {
      alert('Missing required fields')
      return
    }
    const openingBalanceNum = Number(openingBalance)
    if (Number.isNaN(openingBalanceNum)) {
      alert('Opening balance must be a number')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('http://localhost:3000/accounts/open-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: bankName,
          branch,
          account_number: accountNumber,
          account_name: accountName || null,
          opening_balance: openingBalanceNum,
        }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        alert(d.error || 'Failed to open account')
        return
      }
      alert('Account created')
      setOpenAccountModalOpen(false)
      resetOpenAccountForm()
    } finally {
      setSaving(false)
    }
  }

  
  const resetForm = () => {
    setEmployeeNumber('')
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setDob('')
    setNic('')
    setAddress('')
    setRole('IT')
    setDesignation('')
    setTax('')
    setEditingEmployee(null)
  }

  const resetProjectForm = () => {
    setProjectName('')
    setCustomerName('')
    setProjectDescription('')
    setInitialCostBudget('')
    setExtraBudgetAllocation('')
    setPaymentType('')
    setProjectStatus('')
  }

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeNumber(employee.employee_number)
    setFirstName(employee.first_name)
    setLastName(employee.last_name)
    setEmail(employee.email)
    setPhone(employee.phone)
    setDob(employee.dob ? employee.dob.split('T')[0] : '')
    setNic(employee.nic || '')
    setAddress(employee.address || '')
    setRole(employee.role as 'IT' | 'Accounting' | 'Marketing')
    setDesignation(employee.designation || '')
    setTax(employee.tax || '')
    setEditOpen(true)
  }

  const openDeleteModal = (employee: Employee) => {
    setDeletingEmployee(employee)
    setDeleteOpen(true)
  }

  const addEmployee = async () => {
    if (!employeeNumber || !firstName || !lastName || !email || !phone || !role) {
      alert('Missing required fields')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('http://localhost:3000/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: employeeNumber,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          dob: dob || null,
          nic: nic || null,
          address: address || null,
          role,
          designation: designation || null,
          tax: tax || null,
        }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        alert(data.error || 'Failed to add employee')
        return
      }
      alert('Employee added')
      setAddOpen(false)
      resetForm()
      await fetchEmployees()
    } finally {
      setSaving(false)
    }
  }

  const updateEmployee = async () => {
    if (!editingEmployee || !employeeNumber || !firstName || !lastName || !email || !phone || !role) {
      alert('Missing required fields')
      return
    }
    setSaving(true)
    try {
      const r = await fetch(`http://localhost:3000/employees/${editingEmployee.employee_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: employeeNumber,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          dob: dob || null,
          nic: nic || null,
          address: address || null,
          role,
          designation: designation || null,
          tax: tax || null,
        }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        alert(data.error || 'Failed to update employee')
        return
      }
      alert('Employee updated')
      setEditOpen(false)
      resetForm()
      await fetchEmployees()
    } finally {
      setSaving(false)
    }
  }

  const deleteEmployee = async () => {
    if (!deletingEmployee) return
    setSaving(true)
    try {
      const r = await fetch(`http://localhost:3000/employees/${deletingEmployee.employee_id}`, {
        method: 'DELETE',
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        alert(data.error || 'Failed to delete employee')
        return
      }
      alert('Employee deleted')
      setDeleteOpen(false)
      setDeletingEmployee(null)
      await fetchEmployees()
    } finally {
      setSaving(false)
    }
  }

  const addProject = async () => {
    if (!projectName || !customerName || initialCostBudget === '' || !projectStatus) {
      alert('Missing required fields')
      return
    }
    const initialBudgetNum = Number(initialCostBudget)
    if (Number.isNaN(initialBudgetNum)) {
      alert('Budget fields must be numbers')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('http://localhost:3000/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          customer_name: customerName,
          description: projectDescription || null,
          initial_cost_budget: initialBudgetNum,
          extra_budget_allocation: 0,
          payment_type: 'Pending',
          status: projectStatus,
        }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        alert(data.error || 'Failed to add project')
        return
      }
      alert('Project added')
      setProjectModalOpen(false)
      resetProjectForm()
      await fetchProjects()
    } finally {
      setSaving(false)
    }
  }

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project)
    setProjectName(project.project_name)
    setCustomerName(project.customer_name)
    setProjectDescription(project.description || '')
    setInitialCostBudget(String(project.initial_cost_budget))
    setExtraBudgetAllocation(String(project.extra_budget_allocation))
    setPaymentType(project.payment_type)
    setProjectStatus(project.status)
    setProjectEditModalOpen(true)
  }

  const updateProject = async () => {
    if (!editingProject) return
    if (!projectName || !customerName || initialCostBudget === '' || extraBudgetAllocation === '' || !paymentType || !projectStatus) {
      alert('Missing required fields')
      return
    }
    const initialBudgetNum = Number(initialCostBudget)
    const extraBudgetNum = Number(extraBudgetAllocation)
    if (Number.isNaN(initialBudgetNum) || Number.isNaN(extraBudgetNum)) {
      alert('Budget fields must be numbers')
      return
    }
    setSaving(true)
    try {
      const r = await fetch(`http://localhost:3000/projects/${editingProject.project_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          customer_name: customerName,
          description: projectDescription || null,
          initial_cost_budget: initialBudgetNum,
          extra_budget_allocation: extraBudgetNum,
          payment_type: paymentType,
          status: projectStatus,
        }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        alert(data.error || 'Failed to update project')
        return
      }
      alert('Project updated')
      setProjectEditModalOpen(false)
      resetProjectForm()
      await fetchProjects()
    } finally {
      setSaving(false)
    }
  }

  const updateProjectStatus = async (project: Project, newStatus: string) => {
    try {
      const r = await fetch(`http://localhost:3000/projects/${project.project_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: project.project_name,
          customer_name: project.customer_name,
          description: project.description,
          initial_cost_budget: project.initial_cost_budget,
          extra_budget_allocation: project.extra_budget_allocation,
          payment_type: project.payment_type,
          status: newStatus,
        }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        alert(d.error || 'Failed to update status')
        return
      }
      await fetchProjects()
    } catch (err) {
      console.error(err)
      alert('Server error')
    }
  }

  const deleteProjectConfirm = async () => {
    if (!deletingProject) return
    setSaving(true)
    try {
      const r = await fetch(`http://localhost:3000/projects/${deletingProject.project_id}`, {
        method: 'DELETE',
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        alert(data.error || 'Failed to delete project')
        return
      }
      alert('Project deleted')
      setProjectDeleteModalOpen(false)
      setDeletingProject(null)
      await fetchProjects()
    } finally {
      setSaving(false)
    }
  }

  const handleReplenish = async () => {
    if (!replenishAmount || isNaN(Number(replenishAmount)) || Number(replenishAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('http://localhost:3000/petty-cash/replenish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(replenishAmount),
          source_account_id: replenishSourceAccountId ? Number(replenishSourceAccountId) : null,
          reference: replenishReference
        }),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        alert(data.error || 'Failed to replenish petty cash')
        return
      }
      alert('Petty cash replenished successfully')
      setIsReplenishing(false)
      setReplenishAmount('')
      setReplenishSourceAccountId('')
      setReplenishReference('')
      fetchPettyCashBalance()
    } catch (err) {
      console.error('Error replenishing:', err)
      alert('Error replenishing petty cash')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ height: '100vh', width: '100%', display: 'grid', gridTemplateRows: '56px 1fr', background: 'var(--bg)', color: '#111', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'var(--primary)', color: '#fff', overflow: 'hidden', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>BloomTech Dashboard</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span>{user.name} ({user.role})</span>
          <button onClick={onLogout} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff' }}>Logout</button>
        </div>
      </header>
      <main style={{ height: 'calc(100vh - 56px)', padding: 0, display: 'flex', overflow: 'hidden' }}>
        <aside style={{ width: navOpen ? 240 : 64, transition: 'width 0.2s ease', height: '100%', background: 'var(--primary)', color: '#fff', display: 'flex', flexDirection: 'column', gap: 4, padding: 12 }}>
          <button onClick={() => setNavOpen(o => !o)} aria-label="Collapse/Expand menu" style={{ textAlign: 'center', padding: '8px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}>{navOpen ? '«' : '»'}</button>
          <button onClick={() => setTab('home')} title="Overview" style={{ textAlign: navOpen ? 'left' : 'center', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: tab === 'home' ? 'var(--accent)' : 'transparent', color: '#fff', cursor: 'pointer' }}>{navOpen ? 'Overview' : '🏠'}</button>
          <button onClick={() => setTab('employees')} title="Employee Management" style={{ textAlign: navOpen ? 'left' : 'center', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: tab === 'employees' ? 'var(--accent)' : 'transparent', color: '#fff', cursor: 'pointer' }}>{navOpen ? 'Employee Management' : '👥'}</button>
          {tab === 'employees' && (
            <>
              <button onClick={() => setEmployeeSubTab('employees')} title="Employees" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: employeeSubTab === 'employees' ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Employees' : '👥'}</button>
              <button onClick={() => setEmployeeSubTab('vendors')} title="Vendors" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: employeeSubTab === 'vendors' ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Vendors' : '🏪'}</button>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '4px 0', marginLeft: navOpen ? 24 : 0 }} />
              <button onClick={() => setAddOpen(true)} title="Add Employee" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Add Employee' : '+'}</button>
            </>
          )}
          <button onClick={() => setTab('projects')} title="Projects" style={{ textAlign: navOpen ? 'left' : 'center', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: tab === 'projects' ? 'var(--accent)' : 'transparent', color: '#fff', cursor: 'pointer' }}>{navOpen ? 'Projects' : '📁'}</button>
          {tab === 'projects' && (
            <button onClick={() => setProjectModalOpen(true)} title="Add Project" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Add Project' : '+'}</button>
          )}
          <button onClick={() => setTab('accounting')} title="Accounting" style={{ textAlign: navOpen ? 'left' : 'center', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: tab === 'accounting' ? 'var(--accent)' : 'transparent', color: '#fff', cursor: 'pointer' }}>{navOpen ? 'Accounting' : '💼'}</button>
          {tab === 'accounting' && (
            <>
              <button onClick={() => setAccountingSubTab('accounts')} title="Accounts" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: accountingSubTab === 'accounts' ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Accounts' : '🏦'}</button>
              <button onClick={() => setAccountingSubTab('payable')} title="Payable" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: accountingSubTab === 'payable' ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Payable' : '💸'}</button>
              <button onClick={() => { setAccountingSubTab('petty_cash'); setBillType('PETTY_CASH') }} title="Petty Cash" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: accountingSubTab === 'petty_cash' ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Petty Cash' : '💰'}</button>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '4px 0', marginLeft: navOpen ? 24 : 0 }} />
              <button onClick={() => setOpenAccountModalOpen(true)} title="Open Account" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Open Account' : '+'}</button>
              <button onClick={() => setCardModalOpen(true)} title="Card Management" style={{ textAlign: navOpen ? 'left' : 'center', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--primary)', background: 'transparent', color: '#fff', cursor: 'pointer', marginLeft: navOpen ? 24 : 0 }}>{navOpen ? 'Card Management' : '💳'}</button>
            </>
          )}
        </aside>
        <section style={{ flex: 1, overflowY: 'auto', background: 'transparent', borderRadius: 0, border: 'none', padding: 24 }}>
          {tab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h1 style={{ marginTop: 0, fontSize: 28 }}>Dashboard Overview</h1>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 16px', color: '#666', fontSize: 16 }}>Total Project Income</h3>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--primary)' }}>
                    Rs. {projects.reduce((sum, p) => sum + Number(p.initial_cost_budget) + Number(p.extra_budget_allocation), 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 16px', color: '#666', fontSize: 16 }}>Ongoing Project Income</h3>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#2196F3' }}>
                    Rs. {projects.filter(p => p.status === 'ongoing').reduce((sum, p) => sum + Number(p.initial_cost_budget) + Number(p.extra_budget_allocation), 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 16px', color: '#666', fontSize: 16 }}>Completed Project Income</h3>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#4CAF50' }}>
                    Rs. {projects.filter(p => p.status === 'end' || p.status === 'completed').reduce((sum, p) => sum + Number(p.initial_cost_budget) + Number(p.extra_budget_allocation), 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === 'employees' && employeeSubTab === 'employees' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ marginTop: 0, fontSize: 28 }}>Employee Management</h1>
                <button onClick={() => setAddOpen(true)} style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Employee</button>
              </div>
              <p style={{ margin: 0 }}>Manage employees here. Add, edit, and view records.</p>
              {loading ? (
                <div style={{ padding: 24, textAlign: 'center' }}>Loading employees...</div>
              ) : employees.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', background: '#f5f5f5', borderRadius: 8 }}>No employees found. Add your first employee!</div>
              ) : (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Emp #</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>First Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Last Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Email</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, idx) => (
                        <tr
                          key={emp.employee_id}
                          style={{ borderBottom: idx < employees.length - 1 ? '1px solid #e0e0e0' : 'none', cursor: 'pointer' }}
                          onClick={() => openEmployeeDetails(emp)}
                        >
                          <td style={{ padding: '12px 16px' }}>{emp.employee_id}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.employee_number}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.first_name}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.last_name}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.email}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              )}
            </div>
          )}
          {tab === 'employees' && employeeSubTab === 'vendors' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              {isAddingVendor ? (
                <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: 600 }}>
                  <h2 style={{ marginTop: 0 }}>Add New Vendor</h2>
                  <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Vendor Name *</label>
                      <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Contact Email</label>
                      <input type="email" value={vendorEmail} onChange={e => setVendorEmail(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Contact Phone</label>
                      <input type="tel" value={vendorPhone} onChange={e => setVendorPhone(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" id="v_active" checked={vendorIsActive} onChange={e => setVendorIsActive(e.target.checked)} />
                      <label htmlFor="v_active">Active Vendor</label>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                      <button onClick={handleSaveVendor} disabled={saving} style={{ padding: '10px 16px', borderRadius: 6, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{saving ? 'Saving...' : 'Save Vendor'}</button>
                      <button onClick={() => setIsAddingVendor(false)} disabled={saving} style={{ padding: '10px 16px', borderRadius: 6, background: '#eee', color: '#333', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ marginTop: 0, fontSize: 28 }}>Vendors</h1>
                    <button onClick={() => setIsAddingVendor(true)} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Add Vendor</button>
                  </div>
                  {vendorsLoading ? (
                    <div style={{ padding: 24, textAlign: 'center' }}>Loading vendors...</div>
                  ) : vendors.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', background: '#f5f5f5', borderRadius: 12, border: '1px dashed #ddd' }}>
                      <div style={{ fontSize: 32, marginBottom: 16 }}>🏪</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>No vendors found</div>
                      <p style={{ color: '#666', margin: '8px 0 0' }}>Manage your vendor relationships here.</p>
                    </div>
                  ) : (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Vendor ID</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Vendor Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Contact Email</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Contact Phone</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendors.map((v, idx) => (
                            <tr key={v.vendor_id} style={{ borderBottom: idx < vendors.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                              <td style={{ padding: '12px 16px' }}>{v.vendor_id}</td>
                              <td style={{ padding: '12px 16px', fontWeight: 500 }}>{v.vendor_name}</td>
                              <td style={{ padding: '12px 16px' }}>{v.contact_email || '-'}</td>
                              <td style={{ padding: '12px 16px' }}>{v.contact_phone || '-'}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: 4, background: v.is_active ? '#e8f5e9' : '#ffebee', color: v.is_active ? '#2e7d32' : '#c62828', fontSize: 12, fontWeight: 600 }}>
                                  {v.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>{new Date(v.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {tab === 'projects' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ marginTop: 0, fontSize: 28 }}>Projects</h1>
              </div>
              <p style={{ margin: 0 }}>Track projects and budgets here.</p>
              {projectsLoading ? (
                <div style={{ padding: 24, textAlign: 'center' }}>Loading projects...</div>
              ) : projects.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', background: '#f5f5f5', borderRadius: 8 }}>No projects found. Add your first project!</div>
              ) : (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Project Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Customer Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Description</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Initial Budget</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Extra Budget</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Payment Type</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((proj, idx) => (
                        <tr key={proj.project_id} onClick={() => openProjectItemsModal(proj)} style={{ borderBottom: idx < projects.length - 1 ? '1px solid #e0e0e0' : 'none', cursor: 'pointer' }}>
                          <td style={{ padding: '12px 16px' }}>{proj.project_id}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.project_name}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.customer_name}</td>
                          <td style={{ padding: '12px 16px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={proj.description ?? ''}>{proj.description ?? '-'}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.initial_cost_budget}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.extra_budget_allocation}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.payment_type}</td>
                          <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                            <select
                              value={proj.status}
                              onChange={e => updateProjectStatus(proj, e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc', fontSize: '14px' }}
                            >
                              <option value="ongoing">ongoing</option>
                              <option value="pending">pending</option>
                              <option value="end">end</option>
                            </select>
                          </td>
                          <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                            <button onClick={(e) => { e.stopPropagation(); openEditProjectModal(proj); }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #4CAF50', background: '#4CAF50', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); setDeletingProject(proj); setProjectDeleteModalOpen(true); }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #f44336', background: '#f44336', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                            <button onClick={(e) => { e.stopPropagation(); openProjectItemsModal(proj); }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #2196F3', background: '#2196F3', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Items</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
            </div>
          )}
          {tab === 'accounting' && accountingSubTab === 'payable' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              {isAddingBill ? (
                <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add New Bill</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Vendor</label>
                      <select value={billVendorId} onChange={e => setBillVendorId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="">Select Vendor</option>
                        {vendors.map(v => (
                          <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Payable Name</label>
                      {isNewPayableName ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input 
                            type="text" 
                            value={billName} 
                            onChange={e => setBillName(e.target.value)} 
                            placeholder="e.g. Internet Bill" 
                            style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} 
                            autoFocus
                          />
                          <button 
                            onClick={() => { setIsNewPayableName(false); setBillName('') }}
                            style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
                            title="Select existing"
                          >
                            List
                          </button>
                        </div>
                      ) : (
                        <select 
                          value={billName} 
                          onChange={e => {
                            if (e.target.value === '__NEW__') {
                              setIsNewPayableName(true)
                              setBillName('')
                            } else {
                              setBillName(e.target.value)
                            }
                          }} 
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}
                        >
                          <option value="">Select Payable Name</option>
                          {uniquePayableNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                          <option value="__NEW__" style={{ fontWeight: 'bold' }}>+ Add New Name</option>
                        </select>
                      )}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Description</label>
                      <textarea value={billDescription} onChange={e => setBillDescription(e.target.value)} placeholder="Optional description" style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc', minHeight: 60 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Type</label>
                      <select value={billType} onChange={e => setBillType(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="ONE_TIME">One Time</option>
                        <option value="RECURRING">Recurring</option>
                        <option value="PETTY_CASH">Petty Cash</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Amount</label>
                      <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    {billType === 'RECURRING' && (
                      <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Frequency</label>
                        <select value={billFrequency} onChange={e => setBillFrequency(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}>
                          <option value="">Select Frequency</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="YEARLY">Yearly</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Start Date</label>
                      <input type="date" value={billStartDate} onChange={e => setBillStartDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>End Date</label>
                      <input type="date" value={billEndDate} onChange={e => setBillEndDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Project (Optional)</label>
                      <select value={billProjectId} onChange={e => setBillProjectId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="">Select Project</option>
                        {projects.map(p => (
                          <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Bank Account</label>
                      <select value={billBankAccountId} onChange={e => setBillBankAccountId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="">Select Bank Account</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.bank_name} - {a.account_number}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Payment Method</label>
                      <select value={billPaymentMethod} onChange={e => setBillPaymentMethod(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="">Select Method</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Reference Number</label>
                      <input type="text" value={billReferenceNumber} onChange={e => setBillReferenceNumber(e.target.value)} placeholder="Ref #" style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                        <input type="checkbox" checked={billIsActive} onChange={e => setBillIsActive(e.target.checked)} />
                        <span style={{ fontWeight: 500 }}>Is Active</span>
                      </label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    <button onClick={handleSaveBill} disabled={saving} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                      {saving ? 'Saving...' : 'Save Bill'}
                    </button>
                    <button onClick={() => setIsAddingBill(false)} disabled={saving} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', color: '#333', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ marginTop: 0, fontSize: 28 }}>Payables</h1>
                    <button onClick={() => setIsAddingBill(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <span>+</span> Add Bill
                    </button>
                  </div>
                  {payablesLoading ? (
                    <div style={{ padding: 24, textAlign: 'center' }}>Loading payables...</div>
                  ) : payables.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', background: '#f5f5f5', borderRadius: 8 }}>No bills found.</div>
                  ) : (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>ID</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Vendor ID</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Payable Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Description</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Type</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Amount</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Frequency</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Start Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>End Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Project ID</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Is Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payables.map((p, idx) => (
                            <tr key={p.payable_id} style={{ borderBottom: idx < payables.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                              <td style={{ padding: '12px 16px' }}>{p.payable_id}</td>
                              <td style={{ padding: '12px 16px' }}>{p.vendor_id}</td>
                              <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.payable_name}</td>
                              <td style={{ padding: '12px 16px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.description || ''}>{p.description || '-'}</td>
                              <td style={{ padding: '12px 16px' }}>{p.payable_type}</td>
                              <td style={{ padding: '12px 16px' }}>{p.amount}</td>
                              <td style={{ padding: '12px 16px' }}>{p.frequency || '-'}</td>
                              <td style={{ padding: '12px 16px' }}>{p.start_date ? new Date(p.start_date).toLocaleDateString() : '-'}</td>
                              <td style={{ padding: '12px 16px' }}>{p.end_date ? new Date(p.end_date).toLocaleDateString() : '-'}</td>
                              <td style={{ padding: '12px 16px' }}>{p.project_id || '-'}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: 4, background: p.is_active ? '#e8f5e9' : '#ffebee', color: p.is_active ? '#2e7d32' : '#c62828', fontSize: 12, fontWeight: 600 }}>
                                  {p.is_active ? 'True' : 'False'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {tab === 'accounting' && accountingSubTab === 'petty_cash' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ marginTop: 0, fontSize: 28, marginBottom: 16 }}>Petty Cash</h1>
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px 24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'inline-flex', flexDirection: 'column', gap: 4, minWidth: 200, border: '1px solid #eee' }}>
                    <div style={{ fontSize: 14, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Balance</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', letterSpacing: '-1px' }}>
                      <span style={{ fontSize: 18, marginRight: 4, fontWeight: 600, color: '#999', verticalAlign: 'middle' }}>LKR</span>
                      {(pettyCashBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                {!isAddingBill && !isReplenishing && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setIsReplenishing(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: '1px solid var(--primary)', background: '#fff', color: 'var(--primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      Replenish
                    </button>
                    <button onClick={() => { setBillType('PETTY_CASH'); setIsAddingBill(true) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                      <span>+</span> Add Bill
                    </button>
                  </div>
                )}
              </div>
              
              {isAddingBill ? (
                <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add Petty Cash Bill</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Amount</label>
                      <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Transaction Date</label>
                      <input type="date" value={billStartDate} onChange={e => setBillStartDate(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Description</label>
                      <input type="text" value={billDescription} onChange={e => setBillDescription(e.target.value)} placeholder="Description" style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Project (Optional)</label>
                      <select value={billProjectId} onChange={e => setBillProjectId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="">Select Project</option>
                        {projects.map(p => (
                          <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    <button onClick={handleSaveBill} disabled={saving} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                      {saving ? 'Saving...' : 'Save Bill'}
                    </button>
                    <button onClick={() => setIsAddingBill(false)} disabled={saving} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', color: '#333', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : isReplenishing ? (
                <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Replenish Petty Cash</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Amount</label>
                      <input type="number" value={replenishAmount} onChange={e => setReplenishAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Source Bank Account</label>
                      <select value={replenishSourceAccountId} onChange={e => setReplenishSourceAccountId(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }}>
                        <option value="">Select Bank Account</option>
                        {accounts.map(a => (
                          <option key={a.id} value={a.id}>{a.bank_name} - {a.account_number}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Reference / Notes</label>
                      <input type="text" value={replenishReference} onChange={e => setReplenishReference(e.target.value)} placeholder="e.g. Withdrawal from Bank" style={{ width: '100%', padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                    <button onClick={handleReplenish} disabled={saving} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                      {saving ? 'Saving...' : 'Save Replenishment'}
                    </button>
                    <button onClick={() => setIsReplenishing(false)} style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', color: '#333', cursor: 'pointer', fontWeight: 600 }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {pettyCashTransactionsLoading ? (
                    <div style={{ padding: 24, textAlign: 'center' }}>Loading transactions...</div>
                  ) : pettyCashTransactions.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', background: '#f5f5f5', borderRadius: 8 }}>No petty cash transactions found.</div>
                  ) : (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>ID</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Type</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Description</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Amount</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Project</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pettyCashTransactions.map((t, idx) => (
                            <tr key={t.id} style={{ borderBottom: idx < pettyCashTransactions.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                              <td style={{ padding: '12px 16px' }}>{t.id}</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ 
                                  padding: '4px 8px', 
                                  borderRadius: 4, 
                                  background: t.transaction_type === 'REPLENISHMENT' ? '#e3f2fd' : '#ffebee', 
                                  color: t.transaction_type === 'REPLENISHMENT' ? '#1565c0' : '#c62828',
                                  fontSize: 12, 
                                  fontWeight: 600 
                                }}>
                                  {t.transaction_type}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.description || ''}>{t.description || '-'}</td>
                              <td style={{ padding: '12px 16px', fontWeight: 600, color: t.transaction_type === 'REPLENISHMENT' ? '#2e7d32' : '#c62828' }}>
                                {t.transaction_type === 'REPLENISHMENT' ? '+' : '-'}{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '12px 16px' }}>{t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : '-'}</td>
                              <td style={{ padding: '12px 16px' }}>{t.project_name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {tab === 'accounting' && accountingSubTab === 'accounts' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ marginTop: 0, fontSize: 28 }}>Accounts</h1>
              </div>
              {accountsLoading ? (
                <div style={{ padding: 24, textAlign: 'center' }}>Loading accounts...</div>
              ) : accounts.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', background: '#f5f5f5', borderRadius: 8 }}>No accounts found. Use Open Account to add one.</div>
              ) : (
                <>
                  <style>
                    {`
                      .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                      }
                    `}
                  </style>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24, paddingBottom: 40 }}>
                    {accounts.map(acc => {
                      const opt = bankOptions.find(o => o.name === acc.bank_name) || null
                      const initials = String(acc.bank_name || '')
                        .replace(/\(|\)/g, '')
                        .split(' ')
                        .map(w => w[0])
                        .filter(Boolean)
                        .slice(0, 3)
                        .join('')
                        .toUpperCase()
                      const logoEl = !opt || bankLogoRemoteFailed[opt.slug] ? (
                        <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, backdropFilter: 'blur(4px)', border: '2px solid rgba(255,255,255,0.4)' }}>
                          {initials}
                        </span>
                      ) : (
                        <img
                          src={bankLogoLocalFailed[opt.slug] ? opt.logoRemote : opt.logoLocal}
                          alt={acc.bank_name}
                          style={{ width: 56, height: 56, objectFit: 'contain', background: '#fff', borderRadius: '50%', padding: 4, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                          referrerPolicy="no-referrer"
                          onError={() => {
                            if (!opt) return
                            if (!bankLogoLocalFailed[opt.slug]) {
                              setBankLogoLocalFailed(prev => ({ ...prev, [opt.slug]: true }))
                            } else {
                              setBankLogoRemoteFailed(prev => ({ ...prev, [opt.slug]: true }))
                            }
                          }}
                        />
                      )

                      return (
                        <div 
                          key={`${acc.id}-${acc.account_number}`}
                          onClick={() => setSelectedAccountForCards(acc)}
                          style={{ 
                            position: 'relative',
                            borderRadius: 24, 
                            overflow: 'hidden', 
                            background: '#fff', 
                            border: '1px solid rgba(0,0,0,0.08)', 
                            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-6px)'
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,97,255,0.15)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)'
                          }}
                        >
                            <div style={{ background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)', padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}>
                              {logoEl}
                              <div style={{ display: 'grid', gap: 4 }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)', lineHeight: 1.2 }}>{acc.bank_name}</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{acc.branch || 'Main Branch'}</div>
                              </div>
                            </div>
                            
                            <div style={{ padding: '24px', display: 'grid', gap: 20, flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e0e0e0', paddingBottom: 16 }}>
                                <span style={{ fontSize: 12, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Number</span>
                                <span style={{ fontSize: 16, color: '#333', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, letterSpacing: '-0.5px' }}>{acc.account_number}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Available Balance</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: '#063062', letterSpacing: '-1px', display: 'flex', alignItems: 'baseline' }}>
                                  <span style={{ fontSize: 16, marginRight: 6, fontWeight: 600, color: '#888' }}>LKR</span>
                                  {Number(acc.current_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            </div>

                            <div style={{ padding: '16px 24px', background: '#f8faff', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }}></div>
                                  <span style={{ fontSize: 13, color: '#4CAF50', fontWeight: 600 }}>Active</span>
                                </div>
                                <span style={{ fontSize: 13, color: '#0061ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  View Cards <span style={{ fontSize: 16 }}>→</span>
                                </span>
                            </div>
                        </div>
                      )
                    })}
                  </div>
              </>
            )}
            </div>
          )}

          
        </section>
      </main>
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => { setAddOpen(false); resetForm() }}>
          <div style={{ width: 'min(1000px, 96vw)', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Add Employee</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Employee Number *</span>
                  <input value={employeeNumber} onChange={e => setEmployeeNumber(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>First Name *</span>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Last Name *</span>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Email *</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Phone *</span>
                  <input value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Date of Birth</span>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>NIC</span>
                  <input value={nic} onChange={e => setNic(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Role *</span>
                  <select value={role} onChange={e => setRole(e.target.value as 'IT' | 'Accounting' | 'Marketing')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required>
                    <option value="IT">IT</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Designation</span>
                  <input value={designation} onChange={e => setDesignation(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Tax</span>
                  <input value={tax} onChange={e => setTax(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                </label>
              </div>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Address</span>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', resize: 'vertical' }} />
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => { setAddOpen(false); resetForm() }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
                <button disabled={saving} onClick={addEmployee} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Adding...' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {itemsTableModalOpen && currentProjectForItems && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1100, overflowY: 'auto', padding: '20px' }} onClick={() => setItemsTableModalOpen(false)}>
          <div style={{ width: 'min(900px, 92vw)', maxHeight: '90vh', padding: 24, borderRadius: 16, background: '#063062', color: '#fff', border: '1px solid var(--primary)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Project Items List</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Requirements</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Cost</th>
                  <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: 8 }}>{item.requirements}</td>
                    <td style={{ padding: 8 }}>{item.service_category}</td>
                    <td style={{ padding: 8 }}>{item.requirement_type}</td>
                    <td style={{ padding: 8 }}>{item.unit_cost}</td>
                    <td style={{ padding: 8, display: 'flex', gap: 8 }}>
                      <button onClick={() => {
                        setEditingItem(item)
                        setItemRequirements(item.requirements)
                        setItemServiceCategory(item.service_category)
                        setItemUnitCost(String(item.unit_cost))
                        setItemRequirementType(item.requirement_type)
                        setItemsTableModalOpen(false)
                      }} style={{ padding: '4px 8px', borderRadius: 4, background: '#4CAF50', border: 'none', color: '#fff', cursor: 'pointer' }}>Edit</button>
                      <button onClick={async () => {
                        if (!confirm('Delete item?')) return
                        try {
                          const r = await fetch(`http://localhost:3000/projects/${item.project_id}/items/${encodeURIComponent(item.requirements)}`, { method: 'DELETE' })
                          if (r.ok) {
                            fetchProjects()
                            fetchProjectItems()
                          }
                        } catch (e) { console.error(e) }
                      }} style={{ padding: '4px 8px', borderRadius: 4, background: '#f44336', border: 'none', color: '#fff', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {projectItems.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#ccc' }}>No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button onClick={() => setItemsTableModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {selectedAccountForCards && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1200, padding: 20 }} 
          onClick={() => setSelectedAccountForCards(null)}
        >
          <div 
            style={{ width: 'min(600px, 92vw)', maxHeight: '85vh', background: '#fff', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 700 }}>{selectedAccountForCards.bank_name}</h2>
                  <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{selectedAccountForCards.branch}</p>
               </div>
               <button 
                onClick={() => setSelectedAccountForCards(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
               >
                 ✕
               </button>
            </div>
            
            <div style={{ padding: 32, overflowY: 'auto', display: 'grid', gap: 24 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px dashed #eee' }}>
                  <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>ACCOUNT NUMBER</span>
                  <span style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: '#333' }}>{selectedAccountForCards.account_number}</span>
               </div>
               
               <h3 style={{ margin: '8px 0 0', fontSize: 16, color: '#333', fontWeight: 700 }}>Associated Debit Cards</h3>
               
               {cards.filter(c => c.bank_account_id === selectedAccountForCards.id).length > 0 ? (
                 <div style={{ display: 'grid', gap: 16 }}>
                    {cards.filter(c => c.bank_account_id === selectedAccountForCards.id).map(card => (
                       <div key={card.id} style={{ borderRadius: 16, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                          <div style={{ background: '#063062', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ height: 16, filter: 'brightness(0) invert(1)' }} />
                                <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Debit Card</span>
                             </div>
                             <div style={{ padding: '4px 8px', borderRadius: 4, background: card.is_active ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)', color: card.is_active ? '#81c784' : '#e57373', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                               {card.is_active ? 'Active' : 'Inactive'}
                             </div>
                          </div>
                          <div style={{ padding: 20, background: '#fcfcfc', display: 'grid', gap: 16 }}>
                             <div style={{ display: 'grid', gap: 6 }}>
                                <span style={{ fontSize: 11, color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Card Number</span>
                                <div style={{ fontSize: 16, fontFamily: 'monospace', color: '#333', fontWeight: 600, letterSpacing: '1px' }}>
                                   **** **** **** {card.card_number_last4}
                                </div>
                             </div>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ display: 'grid', gap: 6 }}>
                                   <span style={{ fontSize: 11, color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Card Holder</span>
                                   <div style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{card.card_holder_name}</div>
                                </div>
                                <div style={{ display: 'grid', gap: 6 }}>
                                   <span style={{ fontSize: 11, color: '#999', fontWeight: 700, textTransform: 'uppercase' }}>Expires</span>
                                   <div style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{card.expiry_date}</div>
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div style={{ padding: 40, textAlign: 'center', background: '#f9f9f9', borderRadius: 12, border: '1px dashed #ddd' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>💳</div>
                    <div style={{ color: '#666', fontWeight: 500 }}>No cards found for this account.</div>
                    <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>Add a card via Card Management.</div>
                 </div>
               )}
            </div>
            
            <div style={{ padding: '20px 32px', borderTop: '1px solid #eee', background: '#fff', textAlign: 'right' }}>
               <button 
                  onClick={() => setSelectedAccountForCards(null)}
                  style={{ padding: '10px 24px', borderRadius: 8, background: '#f0f0f0', color: '#333', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e0e0e0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f0f0f0'}
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
      {projectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => { setProjectModalOpen(false); resetProjectForm() }}>
          <div style={{ width: 'min(1000px, 96vw)', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Add Project</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Project Name *</span>
                  <input value={projectName} onChange={e => setProjectName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Customer Name *</span>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
              </div>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Description</span>
                <textarea value={projectDescription} onChange={e => setProjectDescription(e.target.value)} rows={3} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', resize: 'vertical' }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Initial Cost Budget *</span>
                  <input type="number" value={initialCostBudget} onChange={e => setInitialCostBudget(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Status *</span>
                  <select value={projectStatus} onChange={e => setProjectStatus(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required>
                    <option value="" disabled>Select Status</option>
                    <option value="ongoing">ongoing</option>
                    <option value="pending">pending</option>
                    <option value="end">end</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => { setProjectModalOpen(false); resetProjectForm() }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
                <button disabled={saving} onClick={addProject} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Adding...' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {editOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }} onClick={() => { setEditOpen(false); resetForm() }}>
          <div style={{ width: 'min(600px, 92vw)', maxHeight: '90vh', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Edit Employee</h2>
             <div style={{ display: 'grid', gap: 12 }}>
              <label style={{color: "#fff", display: 'grid', gap: 6 }}>
                <span>Employee Number *</span>
                <input value={employeeNumber} onChange={e => setEmployeeNumber(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{color: "#fff", display: 'grid', gap: 6 }}>
                <span>First Name *</span>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Last Name *</span>
                <input value={lastName} onChange={e => setLastName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Email *</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Phone *</span>
                <input value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Date of Birth</span>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>NIC</span>
                <input value={nic} onChange={e => setNic(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Address</span>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', resize: 'vertical' }} />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Role *</span>
                <select value={role} onChange={e => setRole(e.target.value as 'IT' | 'Accounting' | 'Marketing')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required>
                  <option value="IT">IT</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Designation</span>
                <input value={designation} onChange={e => setDesignation(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Tax</span>
                <input value={tax} onChange={e => setTax(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => { setEditOpen(false); resetForm() }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
                <button disabled={saving} onClick={updateEmployee} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Updating...' : 'Update'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteOpen && deletingEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }} onClick={() => { setDeleteOpen(false); setDeletingEmployee(null) }}>
          <div style={{ width: 'min(400px, 92vw)', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Delete Employee</h2>
            <p style={{ color: "#fff", margin: '16px 0' }}>
              Are you sure you want to delete employee <strong>{deletingEmployee.first_name} {deletingEmployee.last_name}</strong> (ID: {deletingEmployee.employee_id})?
            </p>
            <p style={{ color: "#fff", margin: '16px 0', fontSize: '14px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setDeleteOpen(false); setDeletingEmployee(null) }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
              <button disabled={saving} onClick={deleteEmployee} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#f44336', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
      {detailsOpen && selectedEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }} onClick={() => { setDetailsOpen(false); setSelectedEmployee(null) }}>
          <div style={{ width: 'min(700px, 92vw)', maxHeight: '90vh', padding: 24, borderRadius: 16, background: '#063062', color: '#fff', border: '1px solid var(--primary)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Employee Details</h2>
            <div style={{ display: 'grid', gap: 8 }}>
              <div><strong>ID:</strong> {selectedEmployee.employee_id}</div>
              <div><strong>Employee #:</strong> {selectedEmployee.employee_number}</div>
              <div><strong>Name:</strong> {selectedEmployee.first_name} {selectedEmployee.last_name}</div>
              <div><strong>Email:</strong> {selectedEmployee.email}</div>
              <div><strong>Phone:</strong> {selectedEmployee.phone}</div>
              <div><strong>DOB:</strong> {selectedEmployee.dob ? new Date(selectedEmployee.dob).toLocaleDateString() : '-'}</div>
              <div><strong>NIC:</strong> {selectedEmployee.nic || '-'}</div>
              <div style={{ maxWidth: '100%' }}><strong>Address:</strong> {selectedEmployee.address || '-'}</div>
              <div><strong>Role:</strong> {selectedEmployee.role}</div>
              <div><strong>Designation:</strong> {selectedEmployee.designation || '-'}</div>
              <div><strong>Tax:</strong> {selectedEmployee.tax || '-'}</div>
              <div><strong>Created At:</strong> {new Date(selectedEmployee.created_at).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setDetailsOpen(false); setSelectedEmployee(null) }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Close</button>
              <button onClick={() => { setDetailsOpen(false); setSelectedEmployee(null); openEditModal(selectedEmployee) }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #4CAF50', background: '#4CAF50', color: '#fff' }}>Edit</button>
              <button onClick={() => { setDetailsOpen(false); setSelectedEmployee(null); openDeleteModal(selectedEmployee) }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f44336', background: '#f44336', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {projectEditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }} onClick={() => { setProjectEditModalOpen(false); resetProjectForm() }}>
          <div style={{ width: 'min(600px, 92vw)', maxHeight: '90vh', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Edit Project</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Project Name *</span>
                <input value={projectName} onChange={e => setProjectName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Customer Name *</span>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Description</span>
                <textarea value={projectDescription} onChange={e => setProjectDescription(e.target.value)} rows={3} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', resize: 'vertical' }} />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Initial Cost Budget *</span>
                <input type="number" value={initialCostBudget} onChange={e => setInitialCostBudget(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Extra Budget Allocation *</span>
                <input type="number" value={extraBudgetAllocation} onChange={e => setExtraBudgetAllocation(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Payment Type *</span>
                <input value={paymentType} onChange={e => setPaymentType(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Status *</span>
                <select value={projectStatus} onChange={e => setProjectStatus(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required>
                  <option value="" disabled>Select Status</option>
                  <option value="ongoing">ongoing</option>
                  <option value="pending">pending</option>
                  <option value="end">end</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => { setProjectEditModalOpen(false); resetProjectForm() }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
                <button disabled={saving} onClick={updateProject} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Updating...' : 'Update'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {projectDeleteModalOpen && deletingProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000 }} onClick={() => { setProjectDeleteModalOpen(false); setDeletingProject(null) }}>
          <div style={{ width: 'min(400px, 92vw)', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Delete Project</h2>
            <p style={{ color: "#fff", margin: '16px 0' }}>
              Are you sure you want to delete project <strong>{deletingProject.project_name}</strong> (ID: {deletingProject.project_id})?
            </p>
            <p style={{ color: "#fff", margin: '16px 0', fontSize: '14px' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setProjectDeleteModalOpen(false); setDeletingProject(null) }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
              <button disabled={saving} onClick={deleteProjectConfirm} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#f44336', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
      {projectItemsModalOpen && currentProjectForItems && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }} onClick={() => { setProjectItemsModalOpen(false); setCurrentProjectForItems(null); clearItemForm() }}>
          <div style={{ width: 'min(900px, 92vw)', maxHeight: '90vh', padding: 24, borderRadius: 16, background: '#063062', color: '#fff', border: '1px solid var(--primary)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Project Items</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#0a3b74', borderRadius: 12, padding: 12, border: '1px solid var(--primary)' }}>
                <div style={{ display: 'grid', rowGap: 8 }}>
                  <div><strong>Name:</strong> <span onClick={() => setItemsTableModalOpen(true)} style={{ color: '#2196F3', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>{currentProjectForItems.project_name}</span></div>
                  <div><strong>Customer:</strong> {currentProjectForItems.customer_name}</div>
                  <div><strong>Description:</strong> {currentProjectForItems.description ?? '-'}</div>
                  <div><strong>Initial Budget:</strong> {currentProjectForItems.initial_cost_budget}</div>
                  <div><strong>Extra Budget:</strong> {currentProjectForItems.extra_budget_allocation}</div>
                  <div><strong>Payment Type:</strong> {currentProjectForItems.payment_type}</div>
                  <div><strong>Status:</strong> {currentProjectForItems.status}</div>
                </div>
              </div>
              <div style={{ background: '#0a3b74', borderRadius: 12, padding: 12, border: '1px solid var(--primary)' }}>
                <div style={{ display: 'grid', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Requirements *</span>
                    <input value={itemRequirements} onChange={e => setItemRequirements(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Service Category *</span>
                    <select value={itemServiceCategory} onChange={e => setItemServiceCategory(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required>
                      <option value="">Select</option>
                      <option value="Software">Software</option>
                      <option value="Hardware">Hardware</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Unit Cost *</span>
                    <input type="number" value={itemUnitCost} onChange={e => setItemUnitCost(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span>Requirement Type *</span>
                    <select value={itemRequirementType} onChange={e => setItemRequirementType(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required>
                      <option value="">Select</option>
                      <option value="Initial Requirement">Initial Requirement</option>
                      <option value="Additional Requirement">Additional Requirement</option>
                    </select>
                  </label>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setProjectItemsModalOpen(false); setCurrentProjectForItems(null); clearItemForm() }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
                    <button onClick={() => saveProjectItem()} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff' }}>{editingItem ? 'Update Item' : 'Save Item'}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {openAccountModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => { setOpenAccountModalOpen(false); resetOpenAccountForm() }}>
          <div style={{ width: 'min(1000px, 96vw)', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Open Account</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6, position: 'relative' }}>
                  <span>Bank Name *</span>
                  <input
                    value={bankName}
                    readOnly
                    onClick={() => setBankDropdownOpen(o => !o)}
                    placeholder="Select bank"
                    onBlur={() => setBankDropdownOpen(false)}
                    onKeyDown={e => { if (e.key === 'Escape') setBankDropdownOpen(false) }}
                    ref={bankInputRef}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#fff', cursor: 'pointer' }}
                    required
                  />
                  {bankDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', color: '#111', border: '1px solid var(--primary)', borderRadius: 8, marginTop: 6, maxHeight: 240, overflowY: 'auto', zIndex: 2000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                      {bankOptions.map(opt => (
                        <button
                          key={opt.slug}
                          onMouseDown={() => { setBankName(opt.name); setBankDropdownOpen(false); bankInputRef.current?.blur() }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid #eee', cursor: 'pointer', textAlign: 'left' }}
                          title={opt.name}
                        >
                          {bankLogoRemoteFailed[opt.slug] ? (
                            <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#063062', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                              {opt.name.replace(/\(|\)/g, '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 3).join('').toUpperCase()}
                            </span>
                          ) : (
                            <img
                              src={bankLogoLocalFailed[opt.slug] ? opt.logoRemote : opt.logoLocal}
                              alt={opt.name}
                              style={{ width: 36, height: 36, objectFit: 'contain' }}
                              referrerPolicy="no-referrer"
                              onError={() => {
                                if (!bankLogoLocalFailed[opt.slug]) {
                                  setBankLogoLocalFailed(prev => ({ ...prev, [opt.slug]: true }))
                                } else {
                                  setBankLogoRemoteFailed(prev => ({ ...prev, [opt.slug]: true }))
                                }
                              }}
                            />
                          )}
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{opt.name}</span>
                        </button>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 8px' }}>
                        <button onClick={() => setBankDropdownOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--primary)', background: '#f5f5f5', color: '#111', cursor: 'pointer' }}>Close</button>
                      </div>
                    </div>
                  )}
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Branch *</span>
                  <input value={branch} onChange={e => setBranch(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Account Number *</span>
                  <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Account Name *</span>
                  <input value={accountName} onChange={e => setAccountName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Opening Balance *</span>
                  <input type="number" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => { setOpenAccountModalOpen(false); resetOpenAccountForm() }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
                <button disabled={saving} onClick={saveOpenAccount} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {cardModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }} onClick={() => { setCardModalOpen(false); resetCardForm() }}>
          <div style={{ width: 'min(1000px, 96vw)', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Card Management</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6, position: 'relative' }}>
                  <span>Bank Account *</span>
                  <input
                    value={cardSelectedAccountLabel}
                    readOnly
                    onClick={() => setCardAccountDropdownOpen(o => !o)}
                    placeholder="Select bank account"
                    onBlur={() => setCardAccountDropdownOpen(false)}
                    onKeyDown={e => { if (e.key === 'Escape') setCardAccountDropdownOpen(false) }}
                    ref={cardAccountInputRef}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#fff', cursor: 'pointer' }}
                    required
                  />
                  {cardAccountDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', color: '#111', border: '1px solid var(--primary)', borderRadius: 8, marginTop: 6, maxHeight: 240, overflowY: 'auto', zIndex: 2000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                      {accounts.map(acc => (
                        <button
                          key={acc.id}
                          onMouseDown={() => { setCardBankAccountId(String(acc.id)); setCardSelectedAccountLabel(`${acc.bank_name} — ${acc.account_number}`); setCardAccountDropdownOpen(false); cardAccountInputRef.current?.blur() }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'transparent', border: 'none', borderBottom: '1px solid #eee', cursor: 'pointer', textAlign: 'left' }}
                          title={`${acc.bank_name} ${acc.branch ?? ''}`.trim()}
                        >
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{acc.bank_name}</span>
                          <span style={{ fontSize: 13, color: '#555', marginLeft: 'auto' }}>Acc #: {acc.account_number}</span>
                        </button>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 8px' }}>
                        <button onClick={() => setCardAccountDropdownOpen(false)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--primary)', background: '#f5f5f5', color: '#111', cursor: 'pointer' }}>Close</button>
                      </div>
                    </div>
                  )}
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Card Number (last 4) *</span>
                  <input value={cardNumberLast4} onChange={e => setCardNumberLast4(e.target.value)} placeholder="e.g., 1111" maxLength={4} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Card Holder Name *</span>
                  <input value={cardHolderName} onChange={e => setCardHolderName(e.target.value)} placeholder="e.g., Jane Doe" style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
                <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                  <span>Expiry Date *</span>
                  <input type="month" value={cardExpiryDate} onChange={e => setCardExpiryDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
                </label>
              </div>
              <label style={{ color: "#fff", display: 'grid', gap: 6 }}>
                <span>Status *</span>
                <select value={cardStatus} onChange={e => setCardStatus(e.target.value as 'Active' | 'Inactive' | 'Blocked')} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button onClick={() => { setCardModalOpen(false); resetCardForm() }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
                <button disabled={saving} onClick={submitCard} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff' }}>Save Card</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {cardSaveConfirmVisible && (
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 2000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 12, background: '#063062', color: '#fff', border: '1px solid var(--primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', fontSize: 16, fontWeight: 600 }}>
            <span style={{ fontSize: 22 }}>👩‍💼</span>
            <span>Saved</span>
          </div>
        </div>
      )}
      
    </div>
  )
}
