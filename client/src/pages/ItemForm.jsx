import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

// Report Item page — routed at /items/new (report) and /items/:id (edit),
// both wrapped in <ProtectedRoute>.

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the item and fill the form with only the editable fields.
  useEffect(() => {
    if (!id) return
    api.get(`/items/${id}`)
      .then(res => {
        const item = res.data.item
        setForm({
          title: item.title,
          status: item.status,
          category: item.category,
          location: item.location ?? '',
          description: item.description ?? '',
        })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load item'))
  }, [id])

  // One handler for every input: the input's `name` picks which field to update.
  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // POST a new item, or PATCH the existing one when editing, then go back to /items.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    // Send only these fields — never reportedBy (the server takes it from the token).
    const payload = {
      title: form.title,
      status: form.status,
      category: form.category,
      location: form.location,
      description: form.description,
    }
    try {
      if (id) await api.patch(`/items/${id}`, payload)
      else await api.post('/items', payload)
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" name="title" placeholder="Title (e.g. Black backpack)"
               value={form.title} onChange={onChange} />

        <select className="input" name="status" value={form.status} onChange={onChange}>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
          <option value="claimed">Claimed</option>
        </select>

        <select className="input" name="category" value={form.category} onChange={onChange}>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="documents">Documents</option>
          <option value="accessories">Accessories</option>
          <option value="other">Other</option>
        </select>

        <input className="input" name="location" placeholder="Location (optional, e.g. Library 2nd floor)"
               value={form.location} onChange={onChange} />

        <textarea className="input" name="description" rows={3} placeholder="Description (optional)"
                  value={form.description} onChange={onChange} />

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
