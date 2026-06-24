import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/inventory', label: 'Inventory', icon: '📋' },
    { path: '/bills', label: 'Bills', icon: '🧾' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/suppliers', label: 'Suppliers', icon: '🚚' }
  ]

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 h-screen overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <p className="text-gray-400 text-sm">Management System</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg transition ${
              isActive(item.path)
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
