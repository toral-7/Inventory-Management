import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Layers, FileText, TrendingUp, Truck, BarChart3 } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/inventory', label: 'Inventory', icon: Layers },
    { path: '/bills', label: 'Bills', icon: FileText },
    { path: '/suppliers', label: 'Suppliers', icon: Truck },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  ]

  return (
    <aside className="w-64 bg-clickhouse-canvas border-r border-clickhouse-hairline h-screen overflow-y-auto sticky top-0 p-lg flex flex-col">
      {/* Logo Section */}
      <div className="mb-xxl">
        <div className="flex items-center gap-md mb-2">
          <div className="w-12 h-12 bg-clickhouse-yellow rounded-lg flex items-center justify-center">
            <span className="text-clickhouse-canvas font-bold text-lg">📦</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-clickhouse-yellow">Inventory Management</h1>
            <p className="text-xs text-clickhouse-muted">System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-xs">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-md px-md py-2 rounded-md
                transition-all duration-200
                ${
                  isActive(item.path)
                    ? 'bg-clickhouse-yellow bg-opacity-10 border-l-2 border-clickhouse-yellow text-clickhouse-yellow'
                    : 'text-clickhouse-body hover:bg-clickhouse-surface-soft hover:text-clickhouse-ink'
                }
              `}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-clickhouse-hairline pt-lg mt-lg">
        <p className="text-xs text-clickhouse-muted text-center">
          Inventory Management System
        </p>
      </div>
    </aside>
  )
}