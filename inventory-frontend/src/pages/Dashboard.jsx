import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle, TrendingUp, Package, Receipt } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StyledCard from '../components/styled/StyledCard'
import client from '../api/client'

export default function Dashboard() {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await client.get('/analytics/dashboard')
      if (response.data.success) {
        setDashboard(response.data.dashboard)
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
              <p className="text-clickhouse-body font-medium">Loading dashboard...</p>
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
            <StyledCard className="max-w-md">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-clickhouse-rose mx-auto mb-lg" />
                <p className="text-clickhouse-body mb-lg">{error}</p>
                <button
                  onClick={fetchDashboard}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            </StyledCard>
          </main>
        </div>
      </div>
    )
  }

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: `₹${dashboard?.summary?.total_revenue || 0}`,
      subtext: 'Last 30 days',
      icon: TrendingUp,
    },
    {
      title: 'Total Bills',
      value: dashboard?.summary?.total_bills || 0,
      subtext: 'Last 30 days',
      icon: Receipt,
    },
    {
      title: 'Low Stock Items',
      value: dashboard?.summary?.low_stock_items || 0,
      subtext: 'Requires attention',
      icon: AlertCircle,
    },
    {
      title: 'Total Products',
      value: dashboard?.summary?.total_products || 0,
      subtext: 'In catalog',
      icon: Package,
    }
  ]

  return (
    <div className="flex h-screen bg-clickhouse-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="p-xl">
            <div className="max-w-7xl">
              {/* Header */}
              <div className="mb-xxl">
                <h1 className="text-display-sm text-clickhouse-ink mb-md">Welcome back, {user?.name}!</h1>
                <p className="text-body-md text-clickhouse-body">Here's what's happening in your inventory today.</p>
              </div>

              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xxl">
                {summaryCards.map((card, index) => {
                  const Icon = card.icon
                  return (
                    <StyledCard
                      key={index}
                      className="animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-lg">
                        <Icon size={24} className="text-clickhouse-body" />
                        <span className="text-sm text-clickhouse-muted mb-xs">{card.subtext}</span>
                      </div>
                      <p className="text-sm text-clickhouse-body mb-2">{card.title}</p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-clickhouse-yellow truncate">
                        {card.value}
                      </p>
                    </StyledCard>
                  )
                })}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xxl">
                {/* Top Products Chart */}
                <StyledCard className="lg:col-span-2">
                  <h2 className="text-title-md text-clickhouse-ink mb-lg flex items-center gap-2">
                    <TrendingUp size={20} className="text-clickhouse-yellow" />
                    Top 5 Products by Revenue
                  </h2>
                  {dashboard?.top_products && dashboard.top_products.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dashboard.top_products}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                        <XAxis
                          dataKey="product_name"
                          stroke="#888888"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis stroke="#888888" tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #2a2a2a',
                            borderRadius: '8px'
                          }}
                          formatter={(value) => `₹${value.toFixed(2)}`}
                          labelStyle={{ color: '#ffffff' }}
                        />
                        <Bar dataKey="total_revenue" fill="#faff69" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-clickhouse-muted">
                      No sales data available
                    </div>
                  )}
                </StyledCard>

                {/* Inventory Health Pie Chart */}
                <StyledCard>
                  <h2 className="text-title-md text-clickhouse-ink mb-lg flex items-center gap-2">
                    <Package size={20} className="text-clickhouse-yellow" />
                    Inventory Health
                  </h2>
                  {dashboard?.inventory?.health ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'OK', value: dashboard.inventory.health.ok, fill: '#4ee887' },
                            { name: 'Low Stock', value: dashboard.inventory.health.low_stock, fill: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          dataKey="value"
                        >
                          <Cell fill="#66e394" />
                          <Cell fill="#da6161" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #2a2a2a',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                          formatter={(value) => `${value} items`}
                          labelStyle={{ color: '#ffffff' }}
                          itemStyle={{ color: '#ffffff'}}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-300 flex items-center justify-center text-clickhouse-muted">
                      No inventory data
                    </div>
                  )}
                </StyledCard>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                <StyledCard>
                  <div className="text-center">
                    <p className="text-3xl mb-md">✓</p>
                    <p className="text-sm text-clickhouse-body mb-md">Items OK</p>
                    <p className="text-stat-display text-clickhouse-emerald">
                      {dashboard?.inventory?.health?.ok || 0}
                    </p>
                  </div>
                </StyledCard>

                <StyledCard>
                  <div className="text-center">
                    <p className="text-3xl mb-md">⚠️</p>
                    <p className="text-sm text-clickhouse-body mb-md">Low Stock</p>
                    <p className="text-stat-display text-clickhouse-warning">
                      {dashboard?.inventory?.health?.low_stock || 0}
                    </p>
                  </div>
                </StyledCard>

                <StyledCard>
                  <div className="text-center">
                    <p className="text-3xl mb-md">📦</p>
                    <p className="text-sm text-clickhouse-body mb-md">Total Items</p>
                    <p className="text-stat-display text-clickhouse-yellow">
                      {dashboard?.inventory?.health?.total_items || 0}
                    </p>
                  </div>
                </StyledCard>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}