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

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    base_price: '',
    category: '',
    reorder_level: '',
    supplier_id: ''
  })
  const [suppliers, setSuppliers] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await client.get('/products')
      if (response.data.success) {
        setProducts(response.data.products)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await client.get('/suppliers')
      if (response.data.success) {
        setSuppliers(response.data.suppliers)
      }
    } catch (err) {
      console.error('Failed to fetch suppliers')
    }
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      base_price: '',
      category: '',
      reorder_level: '',
      supplier_id: ''
    })
    setIsModalOpen(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      base_price: product.base_price,
      category: product.category,
      reorder_level: product.reorder_level,
      supplier_id: product.supplier_id || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        base_price: parseFloat(formData.base_price),
        category: formData.category,
        reorder_level: parseInt(formData.reorder_level),
        supplier_id: formData.supplier_id || null
      }

      if (editingProduct) {
        await client.put(`/products/${editingProduct.id}`, submitData)
      } else {
        await client.post('/products', submitData)
      }

      setIsModalOpen(false)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return

    try {
      await client.delete(`/products/${id}`)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product')
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
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
              <p className="text-clickhouse-body">Loading products...</p>
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
                  <h1 className="text-display-sm text-clickhouse-ink mb-md">Products</h1>
                  <p className="text-body-md text-clickhouse-body">Manage your product catalog</p>
                </div>
                {user?.role === 'admin' && (
                  <StyledButton
                    variant="primary"
                    onClick={handleCreate}
                    icon={<Plus size={18} />}
                  >
                    Add Product
                  </StyledButton>
                )}
              </div>

              {/* Search */}
              <StyledCard className="mb-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clickhouse-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md text-clickhouse-ink placeholder-clickhouse-muted focus:outline-none focus:border-clickhouse-yellow transition-all duration-200"
                  />
                </div>
              </StyledCard>

              {/* Table */}
              <StyledCard>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-xl">
                    <p className="text-clickhouse-body">No products found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Reorder Level</th>
                          <th>Supplier</th>
                          {user?.role === 'admin' && <th>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id}>
                            <td className="font-medium text-clickhouse-ink">{product.name}</td>
                            <td>{product.category}</td>
                            <td className="text-clickhouse-yellow font-semibold">₹{product.base_price}</td>
                            <td>{product.reorder_level}</td>
                            <td className="text-clickhouse-muted">{product.supplier_name || '-'}</td>
                            {user?.role === 'admin' && (
                              <td>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                  >
                                    <Edit2 size={16} className="text-clickhouse-yellow" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
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
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-lg">
          <StyledInput
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <StyledInput
            label="Base Price"
            type="number"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
            required
          />

          <StyledInput
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />

          <StyledInput
            label="Reorder Level"
            type="number"
            value={formData.reorder_level}
            onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-clickhouse-ink mb-2">Supplier</label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md px-3 py-2.5 text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow transition-all duration-200"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-lg border-t border-clickhouse-hairline">
            <StyledButton
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              {editingProduct ? 'Update' : 'Create'}
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