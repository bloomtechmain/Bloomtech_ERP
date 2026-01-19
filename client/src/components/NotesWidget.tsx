import { useState, useEffect } from 'react'
import { API_URL } from '../config/api'
import { StickyNote, Plus, Pin, X, Edit2 } from 'lucide-react'

type Note = {
  id: number
  user_id: number
  title: string
  content: string
  color: string
  is_pinned: boolean
  created_at: string
  updated_at: string
  owner_name?: string
  access_level?: 'owner' | 'read' | 'write'
}

export default function NotesWidget({ userId }: { userId: number }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState('#fff475')
  const [isPinned, setIsPinned] = useState(false)

  const noteColors = [
    '#fff475', // Yellow
    '#ff8a80', // Red
    '#80d8ff', // Blue
    '#b9f6ca', // Green
    '#ea80fc', // Purple
    '#ffab91', // Orange
  ]

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API_URL}/notes?user_id=${userId}`)
      if (r.ok) {
        const data = await r.json()
        setNotes(data || [])
      }
    } catch (err) {
      console.error('Error fetching notes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
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
        content: content.trim(),
        color,
        is_pinned: isPinned
      }

      if (editingNote) {
        // Update
        const r = await fetch(`${API_URL}/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (r.ok) {
          fetchNotes()
          resetForm()
        }
      } else {
        // Create
        const r = await fetch(`${API_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (r.ok) {
          fetchNotes()
          resetForm()
        }
      }
    } catch (err) {
      console.error('Error saving note:', err)
    }
  }

  const handleDelete = async (noteId: number) => {
    if (!confirm('Delete this note?')) return
    
    try {
      const r = await fetch(`${API_URL}/notes/${noteId}?user_id=${userId}`, {
        method: 'DELETE'
      })
      if (r.ok) {
        fetchNotes()
      }
    } catch (err) {
      console.error('Error deleting note:', err)
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setTitle(note.title)
    setContent(note.content)
    setColor(note.color)
    setIsPinned(note.is_pinned)
    setIsAdding(true)
  }

  const togglePin = async (note: Note) => {
    try {
      const r = await fetch(`${API_URL}/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: note.title,
          content: note.content,
          color: note.color,
          is_pinned: !note.is_pinned
        })
      })
      if (r.ok) {
        fetchNotes()
      }
    } catch (err) {
      console.error('Error toggling pin:', err)
    }
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setColor('#fff475')
    setIsPinned(false)
    setIsAdding(false)
    setEditingNote(null)
  }

  return (
    <div className="glass-card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StickyNote size={24} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Notes</h2>
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
          <Plus size={16} /> Add Note
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center' }}>Loading notes...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, overflowY: 'auto', flex: 1 }}>
          {notes.map(note => (
            <div 
              key={note.id}
              style={{ 
                background: note.color, 
                borderRadius: 12, 
                padding: 16, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                minHeight: 150,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
              }}
              onClick={() => handleEdit(note)}
            >
              {note.is_pinned && (
                <Pin size={16} style={{ position: 'absolute', top: 8, right: 8, fill: '#000', opacity: 0.4 }} />
              )}
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: '#000' }}>{note.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {note.content || 'No content'}
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePin(note) }}
                  style={{ padding: 4, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  title={note.is_pinned ? 'Unpin' : 'Pin'}
                >
                  <Pin size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(note) }}
                  style={{ padding: 4, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(note.id) }}
                  style={{ padding: 4, background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                  title="Delete"
                >
                  <X size={14} />
                </button>
              </div>
              {note.access_level && note.access_level !== 'owner' && (
                <div style={{ fontSize: 11, color: '#666', marginTop: 8, fontStyle: 'italic' }}>
                  Shared by {note.owner_name}
                </div>
              )}
            </div>
          ))}
          {notes.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', gridColumn: '1 / -1', color: '#999' }}>
              <StickyNote size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>No notes yet. Click "Add Note" to create one!</p>
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
            <h3 style={{ marginTop: 0 }}>{editingNote ? 'Edit Note' : 'New Note'}</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 500 }}>Title *</span>
                <input 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Note title"
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc' }}
                  autoFocus
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 500 }}>Content</span>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Note content..."
                  rows={6}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', resize: 'vertical' }}
                />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 500 }}>Color</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {noteColors.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 8, 
                        background: c, 
                        border: color === c ? '3px solid #000' : '1px solid #ccc',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontWeight: 500 }}>Pin this note</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={resetForm} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                {editingNote ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
