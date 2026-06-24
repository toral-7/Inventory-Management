import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import client from '../api/client'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await client.get('/analytics/dashboard')
        if (response.data.success) {
          setAnalytics(response.data.dashboard)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading analytics...</div>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600 mb-8">
              Inventory & Billing Management System
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Total Revenue</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  ₹{analytics?.summary.total_revenue}
                </div>
                <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Total Bills</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {analytics?.summary.total_bills}
                </div>
                <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Low Stock Items</div>
                <div className="text-3xl font-bold text-red-600 mt-2">
                  {analytics.inventory.health.low_stock}
                </div>
                <p className="text-xs text-gray-500 mt-2">Need attention</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-gray-600 text-sm font-medium">Total Products</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                  {analytics?.summary.total_products}
                </div>
                <p className="text-xs text-gray-500 mt-2">In catalog</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Products Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Top 5 Products by Revenue
                </h2>
                {analytics?.top_products && analytics.top_products.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.top_products}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="product_name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                      <Bar dataKey="total_revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center text-gray-500">
                    No sales data available
                  </div>
                )}
              </div>

              {/* Inventory Health Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Inventory Health
                </h2>
                {analytics?.inventory?.health ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'OK', value: analytics.inventory.health.ok },
                          { name: 'Low Stock', value: analytics.inventory.health.low_stock }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center text-gray-500">
                    No inventory data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}