import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import client from '../api/client'

export default function Bills() {
  const { user } = useAuth()
  const [bills, setBills] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  
  // Form states
  const [billItems, setBillItems] = useState([{ product_id: '', quantity: 1, item_discount: 0 }])
  const [taxRate, setTaxRate] = useState(18)

  useEffect(() => {
    fetchBills()
    fetchProducts()
  }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await client.get('/bills')
      if (response.data.success) {
        setBills(response.data.bills)
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await client.get('/products')
      if (response.data.success) {
        setProducts(response.data.products)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const handleAddItem = () => {
    setBillItems([...billItems, { product_id: '', quantity: 1, item_discount: 0 }])
  }

  const handleRemoveItem = (index) => {
    if (billItems.length > 1) {
      setBillItems(billItems.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...billItems]
    newItems[index][field] = value
    setBillItems(newItems)
  }

  const handleCreateBill = async (e) => {
    e.preventDefault()
    try {
      const validItems = billItems.filter((item) => item.product_id && item.quantity)
      if (validItems.length === 0) {
        setError('Please add at least one product')
        return
      }

      const response = await client.post('/bills', {
        items: validItems,
        tax_rate: parseInt(taxRate)
      })

      if (response.data.success) {
        setBills([...bills, response.data.bill])
        setShowCreateModal(false)
        setBillItems([{ product_id: '', quantity: 1, item_discount: 0 }])
        setTaxRate(18)
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const handleViewDetails = async (bill) => {
    try {
      const response = await client.get(`/bills/${bill.id}`)
      if (response.data.success) {
        setSelectedBill(response.data.bill)
        setShowDetailsModal(true)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFinalize = async (billId) => {
    if (!window.confirm('Finalize this bill? It cannot be edited after.')) return

    try {
      const response = await client.put(`/bills/${billId}/finalize`)
      if (response.data.success) {
        setBills(bills.map(b => b.id === billId ? response.data.bill : b))
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const handleDelete = async (billId) => {
    if (!window.confirm('Delete this bill? Inventory will be restored.')) return

    try {
      const response = await client.delete(`/bills/${billId}`)
      if (response.data.success) {
        setBills(bills.filter(b => b.id !== billId))
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
            <div className="text-xl text-gray-600">Loading bills...</div>
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
                <h1 className="text-3xl font-bold text-gray-800">Bills</h1>
                <p className="text-gray-600">Create and manage sales bills</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
              >
                + Create Bill
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Bill #</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 font-semibold">{bill.bill_number}</td>
                      <td className="px-6 py-3">{new Date(bill.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-3 text-right">₹{parseFloat(bill.total_amount).toFixed(2)}</td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            bill.status === 'finalized'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {bill.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(bill)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </button>
                        {bill.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleFinalize(bill.id)}
                              className="text-green-500 hover:text-green-700 text-sm font-medium"
                            >
                              Finalize
                            </button>
                            <button
                              onClick={() => handleDelete(bill.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bills.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bills found
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Bill Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Bill" size="lg">
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Line Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                + Add Item
              </button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-gray-600">
              <div className="col-span-6">Product</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-3">Discount %</div>
              <div className="col-span-1"></div>
            </div>

            {billItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-3">
                <select
                  value={item.product_id}
                  onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                  className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.base_price})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="col-span-2 px-2 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                  required
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={item.item_discount}
                  onChange={(e) => handleItemChange(index, 'item_discount', e.target.value)}
                  className="col-span-3 px-2 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                />
                {billItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="col-span-1 text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg"
            >
              Create Bill
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Bill Details Modal */}
      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Bill Details" size="lg">
        {selectedBill && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Bill Number</p>
                <p className="font-semibold">{selectedBill.bill_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Date</p>
                <p className="font-semibold">{new Date(selectedBill.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <p className="font-semibold">{selectedBill.status?.toUpperCase()}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Items</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items?.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.product?.name}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">₹{item.price_at_sale}</td>
                      <td className="text-right py-2">₹{(item.quantity * item.price_at_sale).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{parseFloat(selectedBill.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₹{parseFloat(selectedBill.discount_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({selectedBill.tax_amount ? '18%' : '0%'}):</span>
                <span>₹{parseFloat(selectedBill.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total:</span>
                <span>₹{parseFloat(selectedBill.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}