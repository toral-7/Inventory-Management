import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut, Settings, User } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-clickhouse-surface-card border-b border-clickhouse-hairline sticky top-0 z-40">
      <div className="px-lg py-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Logo */}
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 bg-clickhouse-yellow rounded-md flex items-center justify-center">
              <span className="text-clickhouse-canvas font-bold">I</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-clickhouse-ink">Inventory Management</h2>
              <p className="text-xs text-clickhouse-muted">System</p>
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-md">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-md">
              <div className="w-10 h-10 rounded-md bg-clickhouse-surface-elevated flex items-center justify-center text-clickhouse-yellow font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-clickhouse-ink">{user?.name}</p>
                <p className="text-xs text-clickhouse-muted capitalize">{user?.role}</p>
              </div>
            </div>

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors duration-200"
              >
                <Menu size={20} className="text-clickhouse-body" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg py-2 z-50 animate-slide-up">
                  <div className="px-md py-2 border-b border-clickhouse-hairline">
                    <p className="text-sm font-medium text-clickhouse-ink">{user?.email}</p>
                    <p className="text-xs text-clickhouse-muted capitalize">{user?.role}</p>
                  </div>

                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-md py-2 text-sm text-clickhouse-body hover:bg-clickhouse-surface-elevated hover:text-clickhouse-yellow transition-colors duration-200 flex items-center gap-2 block"
                  >
                    <Settings size={16} /> Settings
                  </Link>

                  <div className="border-t border-clickhouse-hairline my-2"></div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    className="w-full text-left px-md py-2 text-sm text-clickhouse-rose hover:bg-clickhouse-surface-elevated transition-colors duration-200 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}