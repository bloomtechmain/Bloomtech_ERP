import { useState, useEffect } from 'react'
import { API_URL } from '../config/api'
import { CheckSquare, Plus, X, Edit2, Circle, CheckCircle2, Clock } from 'lucide-react'

type Todo = {
  id: number
  user_id: number
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_at: string
  updated_at: string
  owner_name?: string
  access_level?: 'owner' | 'read' | 'write'
}

export default function TodosWidget({ userId }: { userId: number }) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API_URL}/todos?user_id=${userId}`)
      if (r.ok) {
        const data = await r.json()
        setTodos(data || [])
      }
    } catch (err) {
      console.error('Error fetching todos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [userId])

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    try {
      const payload = {
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate || null
      }

      if (editingTodo) {
        // Update
        const r = await fetch(`${API_URL}/todos/${editingTodo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (r.ok) {
          fetchTodos()
          resetForm()
        }
      } else {
        // Create
        const r = await fetch(`${API_URL}/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (r.ok) {
          fetchTodos()
          resetForm()
        }
      }
    } catch (err) {
      console.error('Error saving todo:', err)
    }
  }

  const handleDelete = async (todoId: number) => {
    if (!confirm('Delete this todo?')) return
    
    try {
      const r = await fetch(`${API_URL}/todos/${todoId}?user_id=${userId}`, {
        method: 'DELETE'
      })
      if (r.ok) {
        fetchTodos()
      }
    } catch (err) {
      console.error('Error deleting todo:', err)
    }
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setTitle(todo.title)
    setDescription(todo.description)
    setStatus(todo.status)
    setPriority(todo.priority)
    setDueDate(todo.due_date ? todo.due_date.split('T')[0] : '')
    setIsAdding(true)
  }

  const toggleStatus = async (todo: Todo) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
    
    try {
      const r = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: todo.title,
          description: todo.description,
          status: newStatus,
          priority: todo.priority,
          due_date: todo.due_date
        })
      })
      if (r.ok) {
        fetchTodos()
      }
    } catch (err) {
      console.error('Error toggling status:', err)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStatus('pending')
    setPriority('medium')
    setDueDate('')
    setIsAdding(false)
    setEditingTodo(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={18} color="#10b981" />
      case 'in_progress':
        return <Clock size={18} color="#f59e0b" />
      default:
        return <Circle size={18} color="#6b7280" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444'
      case 'medium':
        return '#f59e0b'
      case 'low':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="glass-card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckSquare size={24} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>To-Do List</h2>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            padding: '8px 16px', 
            borderRadius: 8, 
            background: 'var(--primary)', 
            color: '#fff', 
            border: 'none', 
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center' }}>Loading todos...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }}>
          {todos.map(todo => (
            <div 
              key={todo.id}
              style={{ 
                background: '#fff', 
                borderRadius: 12, 
                padding: 16, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getPriorityColor(todo.priority)}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}
            >
              <button
                onClick={() => toggleStatus(todo)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: 0,
                  marginTop: 2
                }}
              >
                {getStatusIcon(todo.status)}
              </button>
              
              <div onClick={() => handleEdit(todo)} style={{ cursor: 'pointer', flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 4px 0', 
                  fontSize: 16, 
                  fontWeight: 600, 
                  textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                  color: todo.status === 'completed' ? '#9ca3af' : '#000'
                }}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: 14, 
                    color: '#666',
                    textDecoration: todo.status === 'completed' ? 'line-through' : 'none'
                  }}>
                    {todo.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ 
                    fontSize: 11, 
                    padding: '2px 8px', 
                    borderRadius: 4, 
                    background: todo.status === 'completed' ? '#d1fae5' : todo.status === 'in_progress' ? '#fef3c7' : '#f3f4f6',
                    color: todo.status === 'completed' ? '#065f46' : todo.status === 'in_progress' ? '#92400e' : '#374151',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {todo.status.replace('_', ' ')}
                  </span>
                  <span style={{ 
                    fontSize: 11, 
                    padding: '2px 8px', 
                    borderRadius: 4, 
                    background: getPriorityColor(todo.priority) + '20',
                    color: getPriorityColor(todo.priority),
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {todo.priority}
                  </span>
                  {todo.due_date && (
                    <span style={{ fontSize: 12, color: '#666' }}>
                      Due: {new Date(todo.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {todo.access_level && todo.access_level !== 'owner' && (
                  <div style={{ fontSize: 11, color: '#666', marginTop: 8, fontStyle: 'italic' }}>
                    Shared by {todo.owner_name}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleEdit(todo)}
                  style={{ 
                    padding: 6, 
                    background: '#f3f4f6', 
                    border: 'none', 
                    borderRadius: 6, 
                    cursor: 'pointer' 
                  }}
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(todo.id)}
                  style={{ 
                    padding: 6, 
                    background: '#fee2e2', 
                    border: 'none', 
                    borderRadius: 6, 
                    cursor: 'pointer' 
                  }}
                  title="Delete"
                >
                  <X size={16} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
          {todos.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
              <CheckSquare size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>No tasks yet. Click "Add Task" to create one!</p>
            </div>
          )}
        </div>
      )}

      {isAdding && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)', 
            display: 'grid', 
            placeItems: 'center', 
            zIndex: 2000,
            padding: 20
          }}
          onClick={resetForm}
        >
          <div 
            className="glass-panel"
            style={{ width: 'min(500px, 92vw)', padding: 24, borderRadius: 16 }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>{editingTodo ? 'Edit Task' : 'New Task'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 500 }}>Title *</span>
                <input 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Task title"
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                  autoFocus
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 500 }}>Description</span>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Task description..."
                  rows={4}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }}
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontWeight: 500 }}>Status</span>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as 'pending' | 'in_progress' | 'completed')}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontWeight: 500 }}>Priority</span>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                    style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 500 }}>Due Date</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={resetForm} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                {editingTodo ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
