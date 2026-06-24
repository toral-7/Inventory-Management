import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import client from '../api/client'

export default function Inventory() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newQuantity, setNewQuantity] = useState('')
  const [selectedBranch, setSelectedBranch] = useState(null)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchBranches()
    } else {
      setSelectedBranch(user?.branch_id)
    }
  }, [user])

  // NEW (works for both)
  useEffect(() => {
      if ((user?.role === 'staff' && selectedBranch) || user?.role === 'admin') {
        fetchInventory()
      }
  }, [selectedBranch, user?.role])
  
  const fetchBranches = async () => {
    try {
      const response = await client.get('/branches')
      if (response.data.success) {
        setBranches(response.data.branches || [])
      }
    } catch (err) {
      console.error('Error fetching branches:', err)
    }
  }

  const fetchInventory = async () => {
    try {
      setLoading(true)
      setError(null)
      let url = '/inventory'
      if (user?.role === 'admin' && selectedBranch) {
        url += `?branch_id=${selectedBranch}`
      }
      const response = await client.get(url)
      if (response.data.success) {
        setInventory(response.data.inventory || [])
      } else {
        setError('Failed to load inventory')
      }
    } catch (err) {
      console.error('Inventory error:', err)
      setError(err.response?.data?.error || 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (item) => {
    setEditingItem(item)
    setNewQuantity(item.quantity_in_stock)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const handleUpdateStock = async (e) => {
    e.preventDefault()
    try {
      const response = await client.put(`/inventory/${editingItem.id}`, {
        quantity_in_stock: parseInt(newQuantity)
      })
      if (response.data.success) {
        setInventory(inventory.map(item => item.id === editingItem.id ? response.data.inventory : item))
        handleCloseModal()
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading inventory...</div>
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
          <div className="max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
                <p className="text-gray-600">Track and manage stock levels</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {user?.role === 'admin' && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Branch</label>
                <select
                  value={selectedBranch || ''}
                  onChange={(e) => setSelectedBranch(e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                    {user?.role === 'admin' && <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Branch</th>}
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Stock</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Reorder Level</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const isLowStock = item.quantity_in_stock < item.product?.reorder_level
                    return (
                      <tr key={item.id} className={`border-b hover:bg-gray-50 ${isLowStock ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-3">{item.product?.name}</td>
                        {user?.role === 'admin' && <td className="px-6 py-3">{item.branch?.name}</td>}
                        <td className="px-6 py-3 text-center font-semibold">{item.quantity_in_stock}</td>
                        <td className="px-6 py-3 text-center">{item.product?.reorder_level}</td>
                        <td className="px-6 py-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isLowStock
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {isLowStock ? 'Low Stock' : 'OK'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="text-blue-500 hover:text-blue-700 font-medium"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {inventory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No inventory items found
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title="Update Stock" size="sm">
        <form onSubmit={handleUpdateStock} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">{editingItem?.product?.name}</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Quantity</label>
            <input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
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