import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import client from '../api/client'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function Analytics() {
  const { user } = useAuth()
  const [monthlyReport, setMonthlyReport] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllAnalytics = async () => {
      try {
        setLoading(true)
        
        // Fetch all three endpoints in parallel
        const [dashRes, forecastRes, reportRes] = await Promise.all([
          client.get('/analytics/dashboard'),
          client.get('/analytics/forecast'),
          client.get('/analytics/monthly-report')
        ])

        if (dashRes.data.success) {
          setDashboard(dashRes.data.dashboard)
        }
        if (forecastRes.data.success) {
          setForecast(forecastRes.data.forecast)
        }
        if (reportRes.data.success) {
          setMonthlyReport(reportRes.data.monthly_report)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAllAnalytics()
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
            <p className="text-gray-600 mb-8">Detailed reports and insights</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Monthly Revenue Trend */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Monthly Revenue Trend ({monthlyReport?.year})
              </h2>
              {monthlyReport?.monthly_data ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyReport.monthly_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-400 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{monthlyReport?.total_revenue}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Bills</p>
                  <p className="text-2xl font-bold text-green-600">
                    {monthlyReport?.total_bills}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Avg Monthly</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{monthlyReport?.average_monthly_revenue}
                  </p>
                </div>
              </div>
            </div>

            {/* Top 10 Products */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Top 10 Products by Revenue
              </h2>
              {dashboard?.top_products && dashboard.top_products.slice(0, 10).length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dashboard.top_products.slice(0, 10)}>
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
                    <Bar dataKey="total_revenue" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-400 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Stock Forecast */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                30-Day Stock Forecast
              </h2>
              {forecast?.products && forecast.products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Product</th>
                        <th className="text-center py-3 px-4">Current Stock</th>
                        <th className="text-center py-3 px-4">Reorder Level</th>
                        <th className="text-center py-3 px-4">Avg Daily Sales</th>
                        <th className="text-center py-3 px-4">Days Until Stockout</th>
                        <th className="text-center py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecast.products.map((product, index) => (
                        <tr key={`forecast-${index}`} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{product.product_name}</td>
                          <td className="text-center py-3 px-4">{product.current_stock}</td>
                          <td className="text-center py-3 px-4">{product.reorder_level}</td>
                          <td className="text-center py-3 px-4">{product.avg_daily_sales}</td>
                          <td className="text-center py-3 px-4">
                            {product.days_until_stockout === 999 ? '∞' : product.days_until_stockout}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                product.status === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : product.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {product.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No forecast data available
                </div>
              )}

              {/* Forecast Summary */}
              {forecast && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  <div className="bg-green-50 p-4 rounded text-center">
                    <p className="text-sm text-gray-600">Products OK</p>
                    <p className="text-2xl font-bold text-green-600">
                      {forecast.total_products - forecast.critical_products - forecast.warning_products}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded text-center">
                    <p className="text-sm text-gray-600">Warning</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {forecast.warning_products}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded text-center">
                    <p className="text-sm text-gray-600">Critical</p>
                    <p className="text-2xl font-bold text-red-600">
                      {forecast.critical_products}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}