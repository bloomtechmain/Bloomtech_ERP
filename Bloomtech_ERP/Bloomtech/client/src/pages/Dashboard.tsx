import { useState, useEffect, useCallback } from 'react'

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

export default function Dashboard({ user, onLogout }: { user: User; onLogout?: () => void }) {
  const [tab, setTab] = useState<'home' | 'employees' | 'projects' | 'accounting'>('home')
  const [navOpen, setNavOpen] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)
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
  const [currentProjectForItems, setCurrentProjectForItems] = useState<Project | null>(null)
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([])
  const [itemRequirements, setItemRequirements] = useState('')
  const [itemServiceCategory, setItemServiceCategory] = useState('')
  const [itemUnitCost, setItemUnitCost] = useState('')
  const [itemRequirementType, setItemRequirementType] = useState('')
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null)

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
    if (tab === 'projects') {
      fetchProjects()
    }
  }, [tab, fetchProjects])

  const fetchProjectItems = async (projectId: number) => {
    try {
      const r = await fetch(`http://localhost:3000/projects/${projectId}/items`)
      if (!r.ok) {
        console.error('Failed to fetch project items')
        return
      }
      const data = await r.json()
      setProjectItems(data.items || [])
    } catch (err) {
      console.error('Error fetching items', err)
    }
  }

  const openProjectItemsModal = async (project: Project) => {
    setCurrentProjectForItems(project)
    setProjectItemsModalOpen(true)
    setItemRequirements('')
    setItemServiceCategory('')
    setItemUnitCost('')
    setItemRequirementType('')
    setEditingItem(null)
    await fetchProjectItems(project.project_id)
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
      await fetchProjectItems(currentProjectForItems.project_id)
      await fetchProjects()
    } catch (err) {
      console.error(err)
      alert('Server error')
    }
  }

  const startEditItem = (it: ProjectItem) => {
    setEditingItem(it)
    setItemRequirements(it.requirements)
    setItemServiceCategory(it.service_category)
    setItemUnitCost(String(it.unit_cost))
    setItemRequirementType(it.requirement_type)
  }

  const removeItem = async (it: ProjectItem) => {
    if (!currentProjectForItems) return
    if (!confirm('Delete this item?')) return
    try {
      const r = await fetch(`http://localhost:3000/projects/${currentProjectForItems.project_id}/items/${encodeURIComponent(it.requirements)}`, { method: 'DELETE' })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        alert(d.error || 'Failed to delete item')
        return
      }
      alert('Item deleted')
      await fetchProjectItems(currentProjectForItems.project_id)
      await fetchProjects()
    } catch (err) {
      console.error(err)
      alert('Server error')
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
      const r = await fetch('http://localhost:3000/projects', {
        method: 'POST',
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
          <button onClick={() => setTab('projects')} title="Projects" style={{ textAlign: navOpen ? 'left' : 'center', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: tab === 'projects' ? 'var(--accent)' : 'transparent', color: '#fff', cursor: 'pointer' }}>{navOpen ? 'Projects' : '📁'}</button>
          <button onClick={() => setTab('accounting')} title="Accounting" style={{ textAlign: navOpen ? 'left' : 'center', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: tab === 'accounting' ? 'var(--accent)' : 'transparent', color: '#fff', cursor: 'pointer' }}>{navOpen ? 'Accounting' : '💼'}</button>
        </aside>
        <section style={{ flex: 1, height: '100%', background: 'transparent', borderRadius: 0, border: 'none', padding: 24, display: 'grid', placeItems: 'start', alignContent: 'start', gap: 16 }}>
          {tab === 'home' && (
            <h1 style={{ marginTop: 0, fontSize: 28 }}>Welcome back</h1>
          )}
          {tab === 'employees' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ marginTop: 0, fontSize: 28 }}>Employee Management</h1>
                <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }} onClick={() => setAddOpen(true)}>+ Add Employee</button>
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
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>DOB</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>NIC</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Address</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Role</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Designation</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Tax</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Created At</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, idx) => (
                        <tr key={emp.employee_id} style={{ borderBottom: idx < employees.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                          <td style={{ padding: '12px 16px' }}>{emp.employee_id}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.employee_number}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.first_name}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.last_name}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.email}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.phone}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.dob ? new Date(emp.dob).toLocaleDateString() : '-'}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.nic || '-'}</td>
                          <td style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={emp.address || ''}>{emp.address || '-'}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.role}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.designation || '-'}</td>
                          <td style={{ padding: '12px 16px' }}>{emp.tax || '-'}</td>
                          <td style={{ padding: '12px 16px' }}>{new Date(emp.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => openEditModal(emp)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #4CAF50', background: '#4CAF50', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                              <button onClick={() => openDeleteModal(emp)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #f44336', background: '#f44336', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {tab === 'projects' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 style={{ marginTop: 0, fontSize: 28 }}>Projects</h1>
                <button style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }} onClick={() => setProjectModalOpen(true)}>+ Add Project</button>
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
                        <tr key={proj.project_id} style={{ borderBottom: idx < projects.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                          <td style={{ padding: '12px 16px' }}>{proj.project_id}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.project_name}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.customer_name}</td>
                          <td style={{ padding: '12px 16px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={proj.description ?? ''}>{proj.description ?? '-'}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.initial_cost_budget}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.extra_budget_allocation}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.payment_type}</td>
                          <td style={{ padding: '12px 16px' }}>{proj.status}</td>
                          <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                            <button onClick={() => openEditProjectModal(proj)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #4CAF50', background: '#4CAF50', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                            <button onClick={() => { setDeletingProject(proj); setProjectDeleteModalOpen(true) }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #f44336', background: '#f44336', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                            <button onClick={() => openProjectItemsModal(proj)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #2196F3', background: '#2196F3', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Items</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {tab === 'accounting' && (
            <div style={{ width: '100%', display: 'grid', gap: 16 }}>
              <h1 style={{ marginTop: 0, fontSize: 28 }}>Accounting</h1>
              <p style={{ margin: 0 }}>Accounting workspace. Add ledgers, track expenses, and view reports.</p>
            </div>
          )}
        </section>
      </main>
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }} onClick={() => { setAddOpen(false); resetForm() }}>
          <div style={{ width: 'min(600px, 92vw)', maxHeight: '90vh', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Add Employee</h2>
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
                <button onClick={() => { setAddOpen(false); resetForm() }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Cancel</button>
                <button disabled={saving} onClick={addEmployee} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Adding...' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {projectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }} onClick={() => { setProjectModalOpen(false); resetProjectForm() }}>
          <div style={{ width: 'min(600px, 92vw)', maxHeight: '90vh', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Add Project</h2>
             <div style={{ display: 'grid', gap: 12 }}>
              <label style={{color: "#fff", display: 'grid', gap: 6 }}>
                <span>Project Name *</span>
                <input value={projectName} onChange={e => setProjectName(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
              <label style={{color: "#fff", display: 'grid', gap: 6 }}>
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
                <input value={projectStatus} onChange={e => setProjectStatus(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
              </label>
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
                <input value={projectStatus} onChange={e => setProjectStatus(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} required />
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }} onClick={() => { setProjectItemsModalOpen(false); setCurrentProjectForItems(null); setProjectItems([]) }}>
          <div style={{ width: 'min(800px, 96vw)', maxHeight: '90vh', padding: 24, borderRadius: 16, background: '#063062', color: '#111', border: '1px solid var(--primary)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: "#e41212ff", marginTop: 0 }}>Project Items — {currentProjectForItems.project_name}</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ color: '#fff', display: 'grid', gap: 6, flex: 1 }}>
                  <span>Requirements *</span>
                  <input value={itemRequirements} onChange={e => setItemRequirements(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                </label>
                <label style={{ color: '#fff', display: 'grid', gap: 6, width: 200 }}>
                  <span>Service Category *</span>
                  <input value={itemServiceCategory} onChange={e => setItemServiceCategory(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                </label>
                <label style={{ color: '#fff', display: 'grid', gap: 6, width: 160 }}>
                  <span>Unit Cost *</span>
                  <input type="number" value={itemUnitCost} onChange={e => setItemUnitCost(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                </label>
                <label style={{ color: '#fff', display: 'grid', gap: 6, width: 200 }}>
                  <span>Requirement Type *</span>
                  <input value={itemRequirementType} onChange={e => setItemRequirementType(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)' }} />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => { setProjectItemsModalOpen(false); setCurrentProjectForItems(null); setProjectItems([]) }} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: '#b1b1b1', color: '#111' }}>Close</button>
                <button onClick={() => saveProjectItem()} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--accent)', color: '#fff' }}>Save Item</button>
              </div>

              <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, padding: 12 }}>
                <h3 style={{ margin: 0 }}>Existing Items</h3>
                {projectItems.length === 0 ? (
                  <div style={{ padding: 12 }}>No items yet.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: 8 }}>Requirements</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Service Category</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Unit Cost</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Type</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectItems.map(it => (
                        <tr key={it.requirements}>
                          <td style={{ padding: 8 }}>{it.requirements}</td>
                          <td style={{ padding: 8 }}>{it.service_category}</td>
                          <td style={{ padding: 8 }}>{it.unit_cost}</td>
                          <td style={{ padding: 8 }}>{it.requirement_type}</td>
                          <td style={{ padding: 8 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => startEditItem(it)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #4CAF50', background: '#4CAF50', color: '#fff' }}>Edit</button>
                              <button onClick={() => removeItem(it)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #f44336', background: '#f44336', color: '#fff' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
