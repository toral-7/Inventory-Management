import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, Plus, Edit2, AlertTriangle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StyledCard from '../components/styled/StyledCard'
import StyledButton from '../components/styled/StyledButton'
import StyledInput from '../components/styled/StyledInput'
import Modal from '../components/Modal'
import client from '../api/client'

export default function Inventory() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    product_id: '',
    branch_id: '',
    quantity_in_stock: '',
    reorder_level: ''
  })
  const [products, setProducts] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBranches()
    fetchProducts()
    if (user?.role === 'admin' && branches.length === 0) {
      setSelectedBranch('all')
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [selectedBranch])

  const fetchBranches = async () => {
    try {
      const response = await client.get('/branches')
      if (response.data.success) {
        setBranches(response.data.branches)
      }
    } catch (err) {
      console.error('Failed to fetch branches')
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await client.get('/products')
      if (response.data.success) {
        setProducts(response.data.products)
      }
    } catch (err) {
      console.error('Failed to fetch products')
    }
  }

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await client.get('/inventory', {
        params: { branch_id: selectedBranch && selectedBranch !== 'all' ? selectedBranch : null }
      })
      if (response.data.success) {
        let filtered = (response.data.inventory || [])
        if (user?.role === 'staff' && selectedBranch) {
          filtered = filtered.filter((inv) => inv.branch_id === selectedBranch)
        } else if (selectedBranch && selectedBranch !== 'all') {
          filtered = filtered.filter((inv) => inv.branch_id === selectedBranch)
        }
        setInventory(filtered)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setFormData({
      product_id: '',
      branch_id: user?.role === 'staff' ? (user?.branch_id || '') : '',
      quantity_in_stock: '',
      reorder_level: ''
    })
    setIsModalOpen(true)
  }

  const getReorderLevel = (item) => item.product?.reorder_level ?? 0

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      product_id: item.product_id,
      branch_id: item.branch_id,
      quantity_in_stock: item.quantity_in_stock,
      reorder_level: getReorderLevel(item)
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingItem) {
        const submitData = { quantity_in_stock: parseInt(formData.quantity_in_stock, 10) }
        await client.put(`/inventory/${editingItem.id}`, submitData)
      } else {
        const submitData = {
          product_id: formData.product_id,
          branch_id: formData.branch_id,
          quantity_in_stock: parseInt(formData.quantity_in_stock, 10),
          reorder_level: parseInt(formData.reorder_level, 10)
        }
        await client.post('/inventory', submitData)
      }

      setIsModalOpen(false)
      fetchInventory()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save inventory')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredInventory = (inventory || []).filter((inv) =>
    inv.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockCount = filteredInventory.filter(
    (inv) => inv.quantity_in_stock < getReorderLevel(inv)
  ).length

  if (loading) {
    return (
      <div className="flex h-screen bg-clickhouse-canvas">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-clickhouse-hairline border-t-clickhouse-yellow animate-spin mx-auto mb-lg"></div>
              <p className="text-clickhouse-body">Loading inventory...</p>
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
                  <h1 className="text-display-sm text-clickhouse-ink mb-md">Inventory</h1>
                  <p className="text-body-md text-clickhouse-body">Track stock levels across branches</p>
                </div>
                {user?.role === 'admin' && (
                  <StyledButton
                    variant="primary"
                    onClick={handleCreate}
                    icon={<Plus size={18} />}
                  >
                    Add Item
                  </StyledButton>
                )}
              </div>

              {/* Low Stock Alert */}
              {lowStockCount > 0 && (
                <StyledCard className="mb-lg bg-clickhouse-rose bg-opacity-5 border-clickhouse-rose">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={20} className="text-clickhouse-rose" />
                    <p className="text-clickhouse-body">
                      <span className="text-clickhouse-yellow font-semibold">{lowStockCount}</span> items below reorder level
                    </p>
                  </div>
                </StyledCard>
              )}

              {/* Branch & Search */}
              <StyledCard className="mb-lg">
                <div className="flex flex-col sm:flex-row gap-md">
                  {user?.role === 'admin' && (
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="flex-1 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md px-3 py-2.5 text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                    >
                      <option value="all">All Branches</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clickhouse-muted" size={18} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md text-clickhouse-ink placeholder-clickhouse-muted focus:outline-none focus:border-clickhouse-yellow transition-all duration-200"
                    />
                  </div>
                </div>
              </StyledCard>

              {/* Table */}
              <StyledCard>
                {filteredInventory.length === 0 ? (
                  <div className="text-center py-xl">
                    <p className="text-clickhouse-body">No inventory items found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Branch</th>
                          <th>Quantity</th>
                          <th>Reorder Level</th>
                          <th>Status</th>
                          {user?.role === 'admin' && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventory.map((item) => {
                          const reorderLevel = getReorderLevel(item)
                          const isLowStock = item.quantity_in_stock < reorderLevel
                          return (
                            <tr key={item.id}>
                              <td className="font-medium text-clickhouse-ink">{item.product?.name}</td>
                              <td>{item.branch?.name}</td>
                              <td className="text-clickhouse-yellow font-semibold">{item.quantity_in_stock}</td>
                              <td>{reorderLevel}</td>
                              <td>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${
                                    isLowStock
                                      ? 'bg-clickhouse-rose bg-opacity-20 text-clickhouse-rose'
                                      : 'bg-clickhouse-emerald bg-opacity-20 text-clickhouse-emerald'
                                  }`}
                                >
                                  {isLowStock ? '⚠️ Low Stock' : '✓ OK'}
                                </span>
                              </td>
                              {user?.role === 'admin' && (
                                <td>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                    >
                                      <Edit2 size={16} className="text-clickhouse-yellow" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          )
                        })}
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
        title={editingItem ? 'Edit Inventory' : 'Add Inventory'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <label className="block text-sm font-medium text-clickhouse-ink mb-2">Product</label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md px-3 py-2.5 text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
              required
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-clickhouse-ink mb-2">Branch</label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md px-3 py-2.5 text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
              required
              disabled={user?.role === 'staff'}
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <StyledInput
            label="Quantity"
            type="number"
            value={formData.quantity_in_stock}
            onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
            required
          />

          <StyledInput
            label="Reorder Level"
            type="number"
            value={formData.reorder_level}
            onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
            required
          />

          <div className="flex gap-2 pt-lg border-t border-clickhouse-hairline">
            <StyledButton
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              {editingItem ? 'Update' : 'Create'}
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