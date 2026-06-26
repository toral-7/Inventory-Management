import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, Plus, Eye, Trash2, Check, Edit2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StyledCard from '../components/styled/StyledCard'
import StyledButton from '../components/styled/StyledButton'
import StyledInput from '../components/styled/StyledInput'
import Modal from '../components/Modal'
import client from '../api/client'

export default function Bills() {
  const { user } = useAuth()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [viewingBill, setViewingBill] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    bill_date: new Date().toISOString().split('T')[0],
    bill_items: [{ product_id: '', quantity: 0, item_discount: 0 }],
    bill_discount: 0,
    tax_rate: 5
  })
  const [submitting, setSubmitting] = useState(false)

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
      setError(err.message)
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
      console.error('Failed to fetch products')
    }
  }

  const handleCreate = () => {
    setEditingBill(null)
    setFormData({
      bill_date: new Date().toISOString().split('T')[0],
      bill_items: [{ product_id: '', quantity: 0, item_discount: 0 }],
      bill_discount: 0,
      tax_rate: 18
    })
    setIsModalOpen(true)
  }

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      bill_items: [...formData.bill_items, { product_id: '', quantity: 0, item_discount: 0 }]
    })
  }

  const handleRemoveLineItem = (index) => {
    setFormData({
      ...formData,
      bill_items: formData.bill_items.filter((_, i) => i !== index)
    })
  }

  const handleLineItemChange = (index, field, value) => {
    console.log(`Line item ${index} - ${field}: ${value}`) 
    const newItems = [...formData.bill_items]
    newItems[index][field] = value
    setFormData({ ...formData, bill_items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const validItems = formData.bill_items.filter(
      (item) => item.product_id && item.quantity > 0
    )

    if (validItems.length === 0) {
      alert('Bill must have at least one item with a product selected and quantity > 0')
      setSubmitting(false)
      return
    }

    try {
      const lineItems = validItems.map((item) => ({
        product_id: item.product_id,
        quantity: parseInt(item.quantity),
        item_discount: parseFloat(item.item_discount)
      }))

      const submitData = {
        bill_date: formData.bill_date,
        bill_items: lineItems,
        bill_discount: parseFloat(formData.bill_discount),
        tax_rate: parseFloat(formData.tax_rate)
      }

      if (editingBill) {
        // #region agent log
        fetch('http://127.0.0.1:7656/ingest/c788b1bd-9ee3-405e-babc-431531f512b5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1378b2'},body:JSON.stringify({sessionId:'1378b2',location:'Bills.jsx:handleSubmit',message:'Bill edit payload keys',data:{payloadKeys:['items','tax_rate'],itemsLen:lineItems.length,tax_rate:submitData.tax_rate},timestamp:Date.now(),hypothesisId:'C',runId:'post-fix'})}).catch(()=>{});
        // #endregion
        await client.put(`/bills/${editingBill.id}`, {
          items: lineItems,
          tax_rate: submitData.tax_rate
        })
      } else {
        await client.post('/bills', submitData)
      }

      setIsModalOpen(false)
      fetchBills()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save bill')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinalize = async (billId) => {
    if (!window.confirm('Finalize this bill?')) return

    try {
      await client.put(`/bills/${billId}/finalize`)
      fetchBills()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to finalize bill')
    }
  }

  const handleDelete = async (billId) => {
    if (!window.confirm('Delete this bill?')) return

    try {
      await client.delete(`/bills/${billId}`)
      fetchBills()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete bill')
    }
  }

  const handleEdit = async (bill) => {
    try {
      const response = await client.get(`/bills/${bill.id}`)
      const billData = response.data.bill
      
      setEditingBill(billData)
      setFormData({
        bill_date: billData.created_at.split('T')[0],
        bill_items: billData.bill_items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          item_discount: item.item_discount || 0
        })),
        bill_discount: 0,
        tax_rate: 18
      })
      setIsModalOpen(true)
    } catch (err) {
      alert('Failed to load bill')
    }
  }

  const handleView = (bill) => {
    setViewingBill(bill)
    setIsViewModalOpen(true)
  }

  const filteredBills = bills.filter((b) =>
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
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
              <p className="text-clickhouse-body">Loading bills...</p>
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
                  <h1 className="text-display-sm text-clickhouse-ink mb-md">Bills</h1>
                  <p className="text-body-md text-clickhouse-body">Create and manage bills</p>
                </div>
                {user?.role === 'admin' || user?.branch_id ? (
                  <StyledButton
                    variant="primary"
                    onClick={handleCreate}
                    icon={<Plus size={18} />}
                  >
                    Create Bill
                  </StyledButton>
                ) : null}
              </div>

              {/* Search */}
              <StyledCard className="mb-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-clickhouse-muted" size={18} />
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md text-clickhouse-ink placeholder-clickhouse-muted focus:outline-none focus:border-clickhouse-yellow transition-all duration-200"
                  />
                </div>
              </StyledCard>

              {/* Table */}
              <StyledCard>
                {filteredBills.length === 0 ? (
                  <div className="text-center py-xl">
                    <p className="text-clickhouse-body">No bills found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table>
                      <thead>
                        <tr>
                          <th>Bill ID</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBills.map((bill) => (
                          <tr key={bill.id}>
                            <td className="font-medium text-clickhouse-ink">{bill.id}</td>
                            <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                            <td className="text-clickhouse-yellow font-semibold">₹{bill.total_amount}</td>
                            <td>
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  bill.status === 'finalized'
                                    ? 'bg-clickhouse-emerald bg-opacity-20 text-clickhouse-emerald'
                                    : 'bg-clickhouse-blue bg-opacity-20 text-clickhouse-blue'
                                }`}
                              >
                                {bill.status === 'finalized' ? '✓ Finalized' : '✎ Draft'}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleView(bill)}
                                  className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                >
                                  <Eye size={16} className="text-clickhouse-yellow" />
                                </button>
                                {bill.status !== 'finalized' && (
                                  <>
                                    <button
                                      onClick={() => handleEdit(bill)}
                                      className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                    >
                                      <Edit2 size={16} className="text-clickhouse-yellow" />
                                    </button>
                                    <button
                                      onClick={() => handleFinalize(bill.id)}
                                      className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                    >
                                      <Check size={16} className="text-clickhouse-emerald" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(bill.id)}
                                      className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                    >
                                      <Trash2 size={16} className="text-clickhouse-rose" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingBill ? 'Edit Bill' : 'Create Bill'}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-lg max-h-96 overflow-y-auto">
          <StyledInput
            label="Bill Date"
            type="date"
            value={formData.bill_date}
            onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
            required
          />

          {/* Line Items */}
          <div>
            <label className="block text-sm font-medium text-clickhouse-ink mb-2">Items</label>
            
            {/* Headers */}
            <div className="grid grid-cols-12 gap-2 mb-2 px-2">
              <div className="col-span-6 text-xs font-semibold text-clickhouse-muted uppercase">Product</div>
              <div className="col-span-2 text-xs font-semibold text-clickhouse-muted uppercase">Qty</div>
              <div className="col-span-2 text-xs font-semibold text-clickhouse-muted uppercase">Discount %</div>
              <div className="col-span-2"></div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {formData.bill_items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <select
                    value={item.product_id}
                    onChange={(e) => handleLineItemChange(index, 'product_id', e.target.value)}
                    className="col-span-6 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md px-3 py-2.5 text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow text-sm"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select> 
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    className="col-span-2 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md px-3 py-2.5 text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow text-sm"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Discount %"
                    value={item.item_discount}
                    onChange={(e) => handleLineItemChange(index, 'item_discount', e.target.value)}
                    className="col-span-2 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md px-3 py-2.5 text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(index)}
                    className="col-span-2 text-clickhouse-rose hover:bg-clickhouse-surface-elevated rounded-md transition-colors text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <StyledButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddLineItem}
              className="mt-2 w-full"
            >
              + Add Item
            </StyledButton>
          </div>

          <StyledInput
            label="Bill Discount (%)"
            type="number"
            value={formData.bill_discount}
            onChange={(e) => setFormData({ ...formData, bill_discount: e.target.value })}
          />

          <StyledInput
            label="Tax Rate (%)"
            type="number"
            value={formData.tax_rate}
            onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
          />

          <div className="flex gap-2 pt-lg border-t border-clickhouse-hairline">
            <StyledButton
              type="submit"
              variant="primary"
              loading={submitting}
              className="flex-1"
            >
              {editingBill ? 'Update' : 'Create'}
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

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        title="Bill Details"
        onClose={() => setIsViewModalOpen(false)}
        size="lg"
      >
        {viewingBill && (
          <div className="space-y-lg">
            <div className="grid grid-cols-2 gap-lg">
              <div>
                <p className="text-xs text-clickhouse-muted mb-xs">Bill ID</p>
                <p className="text-clickhouse-yellow font-semibold">{viewingBill.id}</p>
              </div>
              <div>
                <p className="text-xs text-clickhouse-muted mb-xs">Date</p>
                <p className="text-clickhouse-ink">{new Date(viewingBill.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-clickhouse-hairline pt-lg">
              <p className="text-sm font-semibold text-clickhouse-ink mb-2">Items</p>
              <div className="space-y-1">
                {viewingBill.bill_items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-clickhouse-body">
                    <span>{item.product?.name} × {item.quantity}</span>
                    <span className="text-clickhouse-yellow">₹{(item.quantity * item.product?.base_price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-clickhouse-hairline pt-lg space-y-1">
              <div className="flex justify-between text-clickhouse-body">
                <span>Subtotal:</span>
                <span className="text-clickhouse-yellow">₹{viewingBill.subtotal}</span>
              </div>
              <div className="flex justify-between text-clickhouse-body">
                <span>Discount:</span>
                <span className="text-clickhouse-yellow">₹{viewingBill.discount_amount ?? 0}</span>
              </div>
              <div className="flex justify-between text-clickhouse-body">
                <span>Tax:</span>
                <span className="text-clickhouse-yellow">₹{viewingBill.tax_amount ?? 0}</span>
              </div>
              <div className="flex justify-between text-clickhouse-yellow font-bold text-lg pt-2 border-t border-clickhouse-hairline">
                <span>Total:</span>
                <span>₹{viewingBill.total_amount}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}