import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import client from '../api/client'

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    base_price: '',
    category: '',
    supplier_id: '',
    reorder_level: ''
  })

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
        setSuppliers(response.data.suppliers || [])
      }
    } catch (err) {
      console.error('Failed to fetch suppliers')
    }
  }

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name,
        base_price: product.base_price,
        category: product.category || '',
        supplier_id: product.supplier?.id || '',
        reorder_level: product.reorder_level
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        base_price: '',
        category: '',
        supplier_id: '',
        reorder_level: ''
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Convert string inputs to proper types
      const submitData = {
        name: formData.name,
        base_price: parseFloat(formData.base_price),
        category: formData.category,
        reorder_level: parseInt(formData.reorder_level),
        supplier_id: formData.supplier_id || null
      }

      if (editingId) {
        await client.put(`/products/${editingId}`, submitData)
      } else {
        await client.post('/products', submitData)
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await client.delete(`/products/${id}`)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete product')
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading products...</div>
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
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <p className="text-gray-600 mt-2">Manage product catalog</p>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  + Add Product
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
                placeholder="Search by name or category..."
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
                    <th className="text-left py-4 px-6">Price</th>
                    <th className="text-left py-4 px-6">Category</th>
                    <th className="text-left py-4 px-6">Supplier</th>
                    <th className="text-left py-4 px-6">Reorder Level</th>
                    <th className="text-center py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">{product.name}</td>
                      <td className="py-4 px-6">₹{parseFloat(product.base_price).toFixed(2)}</td>
                      <td className="py-4 px-6">{product.category || '-'}</td>
                      <td className="py-4 px-6">{product.supplier?.name || '-'}</td>
                      <td className="py-4 px-6">{product.reorder_level}</td>
                      <td className="py-4 px-6 text-center space-x-2">
                        {user?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleOpenModal(product)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
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
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal
        isOpen={showModal}
        title={editingId ? 'Edit Product' : 'Add Product'}
        onClose={() => setShowModal(false)}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
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
              Base Price *
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reorder Level *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.reorder_level}
              onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
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