import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StyledCard from '../components/styled/StyledCard'
import client from '../api/client'

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await client.get(`/analytics/dashboard`)
      if (response.data.success) {
        setAnalytics(response.data.dashboard)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-clickhouse-canvas">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-clickhouse-hairline border-t-clickhouse-yellow animate-spin mx-auto mb-lg"></div>
              <p className="text-clickhouse-body">Loading analytics...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-clickhouse-canvas">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-lg">
            <StyledCard className="max-w-md text-center">
              <p className="text-clickhouse-body mb-lg">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </StyledCard>
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
              <div className="mb-lg">
                <h1 className="text-display-sm text-clickhouse-ink mb-md">Analytics</h1>
                <p className="text-body-md text-clickhouse-body">Detailed insights into your inventory and sales</p>
              </div>

              {/* Period Selector */}
              <StyledCard className="mb-lg">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-clickhouse-yellow" />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-clickhouse-surface-card border border-clickhouse-hairline rounded-md px-3 py-2 text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </StyledCard>

              {/* Revenue Chart */}
              <StyledCard className="mb-lg">
                <h2 className="text-title-md text-clickhouse-ink mb-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-clickhouse-yellow" />
                  Monthly Revenue
                </h2>
                {analytics?.monthly_report && analytics.monthly_report.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.monthly_report}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="month" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => `₹${value.toFixed(2)}`}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#faff69"
                        strokeWidth={2}
                        dot={{ fill: '#faff69', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center text-clickhouse-muted">
                    No data available
                  </div>
                )}
              </StyledCard>

              {/* Sales Forecast */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-lg">
                <StyledCard>
                  <h2 className="text-title-md text-clickhouse-ink mb-lg">Sales Forecast</h2>
                  {analytics?.forecast && analytics.forecast.length > 0 ? (
                    <div className="space-y-2">
                      {analytics.forecast.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center pb-2 border-b border-clickhouse-hairline last:border-b-0">
                          <span className="text-clickhouse-body">{item.product_name}</span>
                          <span className="text-clickhouse-yellow font-semibold">{item.forecasted_demand}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-clickhouse-muted text-center py-lg">No forecast data</p>
                  )}
                </StyledCard>

                <StyledCard>
                  <h2 className="text-title-md text-clickhouse-ink mb-lg">Inventory Status</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-clickhouse-body text-sm">OK Items</span>
                        <span className="text-clickhouse-emerald font-semibold">
                          {analytics?.inventory?.health?.ok || 0}
                        </span>
                      </div>
                      <div className="w-full bg-clickhouse-hairline rounded-full h-2">
                        <div
                          className="bg-clickhouse-emerald h-2 rounded-full"
                          style={{
                            width: `${
                              ((analytics?.inventory?.health?.ok || 0) /
                                (analytics?.inventory?.health?.total_items || 1)) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-clickhouse-body text-sm">Low Stock</span>
                        <span className="text-clickhouse-rose font-semibold">
                          {analytics?.inventory?.health?.low_stock || 0}
                        </span>
                      </div>
                      <div className="w-full bg-clickhouse-hairline rounded-full h-2">
                        <div
                          className="bg-clickhouse-rose h-2 rounded-full"
                          style={{
                            width: `${
                              ((analytics?.inventory?.health?.low_stock || 0) /
                                (analytics?.inventory?.health?.total_items || 1)) *
                              100
                            }%`
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-clickhouse-body text-sm">Total Items</span>
                        <span className="text-clickhouse-yellow font-semibold">
                          {analytics?.inventory?.health?.total_items || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </StyledCard>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
                <StyledCard>
                  <p className="text-sm text-clickhouse-body mb-2">Total Revenue</p>
                  <p className="text-stat-display text-clickhouse-yellow">
                    ₹{analytics?.summary?.total_revenue || 0}
                  </p>
                </StyledCard>

                <StyledCard>
                  <p className="text-sm text-clickhouse-body mb-2">Total Bills</p>
                  <p className="text-stat-display text-clickhouse-emerald">
                    {analytics?.summary?.total_bills || 0}
                  </p>
                </StyledCard>

                <StyledCard>
                  <p className="text-sm text-clickhouse-body mb-2">Total Products</p>
                  <p className="text-stat-display text-clickhouse-blue">
                    {analytics?.summary?.total_products || 0}
                  </p>
                </StyledCard>

                <StyledCard>
                  <p className="text-sm text-clickhouse-body mb-2">Low Stock Items</p>
                  <p className="text-stat-display text-clickhouse-rose">
                    {analytics?.summary?.low_stock_items || 0}
                  </p>
                </StyledCard>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}