import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, Plus, Edit2, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StyledCard from '../components/styled/StyledCard'
import StyledButton from '../components/styled/StyledButton'
import StyledInput from '../components/styled/StyledInput'
import Modal from '../components/Modal'
import client from '../api/client'

export default function Suppliers() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    lead_time_days: '3'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await client.get('/suppliers')
      if (response.data.success) {
        setSuppliers(response.data.suppliers)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingSupplier(null)
    setFormData({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      lead_time_days: '3'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      lead_time_days: supplier.lead_time_days || '3'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        lead_time_days: parseInt(formData.lead_time_days)
      }

      if (editingSupplier) {
        await client.put(`/suppliers/${editingSupplier.id}`, submitData)
      } else {
        await client.post('/suppliers', submitData)
      }

      setIsModalOpen(false)
      fetchSuppliers()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save supplier')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return

    try {
      await client.delete(`/suppliers/${id}`)
      fetchSuppliers()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete supplier')
    }
  }

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-clickhouse-canvas">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-clickhouse-hairline border-t-clickhouse-yellow animate-spin mx-auto mb-lg"></div>
              <p className="text-clickhouse-body">Loading suppliers...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-clickhouse-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="p-xl">
            <div className="max-w-7xl">
              {/* Header */}
              <div className="mb-lg flex items-center justify-between">
                <div>
                  <h1 className="text-display-sm text-clickhouse-ink mb-md">Suppliers</h1>
                  <p className="text-body-md text-clickhouse-body">Manage your supplier network</p>
                </div>
                {user?.role === 'admin' && (
                  <StyledButton
                    variant="primary"
                    onClick={handleCreate}
                    icon={<Plus size={18} />}
                  >
                    Add Supplier
                  </StyledButton>
                )}
              </div>

              {/* Search */}
              <StyledCard className="mb-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clickhouse-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md text-clickhouse-ink placeholder-clickhouse-muted focus:outline-none focus:border-clickhouse-yellow transition-all duration-200"
                  />
                </div>
              </StyledCard>

              {/* Table */}
              <StyledCard>
                {filteredSuppliers.length === 0 ? (
                  <div className="text-center py-xl">
                    <p className="text-clickhouse-body">No suppliers found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Contact Person</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Lead Time</th>
                          {user?.role === 'admin' && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSuppliers.map((supplier) => (
                          <tr key={supplier.id}>
                            <td className="font-medium text-clickhouse-ink">{supplier.name}</td>
                            <td>{supplier.contact_person || '-'}</td>
                            <td className="text-clickhouse-yellow">{supplier.email || '-'}</td>
                            <td>{supplier.phone || '-'}</td>
                            <td>
                              <span className="bg-clickhouse-blue bg-opacity-20 text-clickhouse-blue px-2 py-1 rounded text-xs font-semibold">
                                {supplier.lead_time_days} days
                              </span>
                            </td>
                            {user?.role === 'admin' && (
                              <td>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(supplier)}
                                    className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                  >
                                    <Edit2 size={16} className="text-clickhouse-yellow" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(supplier.id)}
                                    className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                  >
                                    <Trash2 size={16} className="text-clickhouse-rose" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </StyledCard>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-lg">
          <StyledInput
            label="Supplier Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <StyledInput
            label="Contact Person"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
          />

          <StyledInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <StyledInput
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <StyledInput
            label="Lead Time (days)"
            type="number"
            value={formData.lead_time_days}
            onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
            required
          />

          <div className="flex gap-2 pt-lg border-t border-clickhouse-hairline">
            <StyledButton
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              {editingSupplier ? 'Update' : 'Create'}
            </StyledButton>
            <StyledButton
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </StyledButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}