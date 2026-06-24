import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import client from '../api/client'

export default function Suppliers() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    lead_time_days: 3
  })

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

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingId(supplier.id)
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        lead_time_days: supplier.lead_time_days || 3
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        lead_time_days: 3
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Convert lead_time_days to number
      const submitData = {
        name: formData.name,
        contact_person: formData.contact_person || null,
        email: formData.email || null,
        phone: formData.phone || null,
        lead_time_days: parseInt(formData.lead_time_days)
      }

      if (editingId) {
        await client.put(`/suppliers/${editingId}`, submitData)
      } else {
        await client.post('/suppliers', submitData)
      }
      setShowModal(false)
      setError(null)
      fetchSuppliers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save supplier')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return
    try {
      await client.delete(`/suppliers/${id}`)
      setError(null)
      fetchSuppliers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete supplier')
    }
  }

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading suppliers...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
                <p className="text-gray-600 mt-2">Manage supplier information</p>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  + Add Supplier
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <input
                type="text"
                placeholder="Search by name, contact person, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left py-4 px-6">Name</th>
                    <th className="text-left py-4 px-6">Contact Person</th>
                    <th className="text-left py-4 px-6">Email</th>
                    <th className="text-left py-4 px-6">Phone</th>
                    <th className="text-center py-4 px-6">Lead Time (Days)</th>
                    <th className="text-center py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium">{supplier.name}</td>
                      <td className="py-4 px-6">{supplier.contact_person || '-'}</td>
                      <td className="py-4 px-6">{supplier.email || '-'}</td>
                      <td className="py-4 px-6">{supplier.phone || '-'}</td>
                      <td className="py-4 px-6 text-center">{supplier.lead_time_days}</td>
                      <td className="py-4 px-6 text-center space-x-2">
                        {user?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleOpenModal(supplier)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(supplier.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {user?.role === 'staff' && <span className="text-gray-500 text-sm">View only</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSuppliers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No suppliers found
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Supplier' : 'Add Supplier'}
        onClose={() => setShowModal(false)}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Time (Days)
            </label>
            <input
              type="number"
              min="0"
              value={formData.lead_time_days}
              onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}