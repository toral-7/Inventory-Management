import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { AlertCircle, Eye, EyeOff, Trash2, Edit2, Plus } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Modal from '../components/Modal'
import StyledCard from '../components/styled/StyledCard'
import StyledInput from '../components/styled/StyledInput'
import client from '../api/client'

export default function Settings() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Account tab
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })

  // Staff tab
  const [staffList, setStaffList] = useState([])
  const [branches, setBranches] = useState([])
  const [editingStaff, setEditingStaff] = useState(null)
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [staffFormData, setStaffFormData] = useState({ branch_id: '', status: 'active' })

  // System tab
  const [systemSettings, setSystemSettings] = useState({
    default_tax_rate: 18,
    low_stock_threshold: 10,
    reorder_level_default: 5,
    currency: '₹'
  })

  // Preferences tab
  const [preferences, setPreferences] = useState({
    timezone: 'Asia/Kolkata',
    date_format: 'DD-MM-YYYY',
    time_format: '24-hour'
  })

  const isAdmin = user?.role === 'admin'

  // Fetch data on mount
  useEffect(() => {
    if (isAdmin && activeTab === 'staff') {
      fetchStaffList()
      fetchBranches()
    }
  }, [activeTab, isAdmin])

  const fetchStaffList = async () => {
    try {
      setLoading(true)
      const response = await client.get('/staff')
      if (response.data.success) {
        setStaffList(response.data.staff || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await client.get('/branches')
      if (response.data.success) {
        setBranches(response.data.branches || [])
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.new !== passwordForm.confirm) {
      setError('Passwords do not match')
      return
    }
    if (passwordForm.new.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await client.put('/auth/password', {
        current_password: passwordForm.current,
        new_password: passwordForm.new
      })
      if (response.data.success) {
        setSuccess('Password changed successfully')
        setPasswordForm({ current: '', new: '', confirm: '' })
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleEditStaff = (staff) => {
    setEditingStaff(staff)
    setStaffFormData({
      branch_id: staff.branch_id || '',
      status: staff.status || 'active'
    })
    setIsStaffModalOpen(true)
  }

  const handleSaveStaff = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await client.put(`/staff/${editingStaff.id}`, staffFormData)
      if (response.data.success) {
        setSuccess('Staff updated successfully')
        fetchStaffList()
        setIsStaffModalOpen(false)
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update staff')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return

    try {
      setLoading(true)
      setError(null)
      const response = await client.delete(`/staff/${staffId}`)
      if (response.data.success) {
        setSuccess('Staff removed successfully')
        fetchStaffList()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove staff')
    } finally {
      setLoading(false)
    }
  }

  const handleSystemSettingsSave = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await client.put('/settings', systemSettings)
      if (response.data.success) {
        setSuccess('System settings saved')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSave = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await client.put('/preferences', preferences)
      if (response.data.success) {
        setSuccess('Preferences saved')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-clickhouse-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-lg sm:p-xl">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-xl">
              <h1 className="text-3xl font-bold text-clickhouse-ink mb-xs">Settings</h1>
              <p className="text-clickhouse-body">Manage your account and system preferences</p>
            </div>

            {/* Alert Messages */}
            {error && (
              <StyledCard className="mb-lg border-l-4 border-clickhouse-rose">
                <div className="flex items-start gap-md">
                  <AlertCircle size={20} className="text-clickhouse-rose flex-shrink-0 mt-xs" />
                  <p className="text-clickhouse-body">{error}</p>
                </div>
              </StyledCard>
            )}

            {success && (
              <StyledCard className="mb-lg border-l-4 border-clickhouse-emerald">
                <p className="text-clickhouse-emerald">{success}</p>
              </StyledCard>
            )}

            {/* Tabs */}
            <StyledCard className="mb-lg">
              <div className="flex flex-wrap gap-xs border-b border-clickhouse-hairline -mx-lg -mt-lg px-lg pt-lg">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`px-lg py-md font-medium border-b-2 transition-colors ${
                    activeTab === 'account'
                      ? 'text-clickhouse-yellow border-clickhouse-yellow'
                      : 'text-clickhouse-body border-transparent hover:text-clickhouse-ink'
                  }`}
                >
                  Account
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setActiveTab('staff')}
                      className={`px-lg py-md font-medium border-b-2 transition-colors ${
                        activeTab === 'staff'
                          ? 'text-clickhouse-yellow border-clickhouse-yellow'
                          : 'text-clickhouse-body border-transparent hover:text-clickhouse-ink'
                      }`}
                    >
                      Staff Management
                    </button>
                    <button
                      onClick={() => setActiveTab('system')}
                      className={`px-lg py-md font-medium border-b-2 transition-colors ${
                        activeTab === 'system'
                          ? 'text-clickhouse-yellow border-clickhouse-yellow'
                          : 'text-clickhouse-body border-transparent hover:text-clickhouse-ink'
                      }`}
                    >
                      System
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`px-lg py-md font-medium border-b-2 transition-colors ${
                    activeTab === 'preferences'
                      ? 'text-clickhouse-yellow border-clickhouse-yellow'
                      : 'text-clickhouse-body border-transparent hover:text-clickhouse-ink'
                  }`}
                >
                  Preferences
                </button>
              </div>
            </StyledCard>

            {/* ACCOUNT TAB */}
            {activeTab === 'account' && (
              <div className="space-y-lg">
                {/* Profile Info */}
                <StyledCard>
                  <h2 className="text-lg font-bold text-clickhouse-ink mb-lg">Profile Information</h2>
                  <div className="space-y-md">
                    <div>
                      <label className="block text-sm text-clickhouse-muted mb-xs">Name</label>
                      <p className="text-clickhouse-body font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-clickhouse-muted mb-xs">Email</label>
                      <p className="text-clickhouse-body font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-clickhouse-muted mb-xs">Role</label>
                      <p className="text-clickhouse-body font-medium capitalize">
                        {user?.role === 'admin' ? 'Administrator' : 'Staff Member'}
                      </p>
                    </div>
                  </div>
                </StyledCard>

                {/* Change Password */}
                <StyledCard>
                  <h2 className="text-lg font-bold text-clickhouse-ink mb-lg">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-md">
                    <div className="relative">
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-lg top-1/2 -translate-y-1/2 text-clickhouse-muted hover:text-clickhouse-body"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        New Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                        required
                      />
                    </div>

                    <div className="flex gap-md">
                      <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Saving...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </StyledCard>

                {/* Logout */}
                <StyledCard>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to logout?')) logout()
                    }}
                    className="w-full btn bg-clickhouse-rose hover:bg-opacity-90 text-clickhouse-canvas font-bold"
                  >
                    Logout
                  </button>
                </StyledCard>
              </div>
            )}

            {/* STAFF TAB */}
            {activeTab === 'staff' && isAdmin && (
              <div className="space-y-lg">
                <StyledCard>
                  <div className="flex items-center justify-between mb-lg">
                    <h2 className="text-lg font-bold text-clickhouse-ink">Staff Members</h2>
                    <button className="btn btn-primary inline-flex items-center gap-xs">
                      <Plus size={18} />
                      Add Staff
                    </button>
                  </div>

                  {loading ? (
                    <p className="text-clickhouse-body text-center py-lg">Loading staff...</p>
                  ) : staffList.length === 0 ? (
                    <p className="text-clickhouse-muted text-center py-lg">No staff members found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left">Name</th>
                            <th className="text-left">Email</th>
                            <th className="text-left">Branch</th>
                            <th className="text-left">Status</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {staffList.map((staff) => (
                            <tr key={staff.id}>
                              <td>{staff.name}</td>
                              <td className="text-clickhouse-muted">{staff.email}</td>
                              <td>
                                {staff.branch_id ? (
                                  <span className="badge badge-info text-xs">
                                    Branch {staff.branch_id.slice(0, 8)}
                                  </span>
                                ) : (
                                  <span className="text-clickhouse-muted text-xs">Unassigned</span>
                                )}
                              </td>
                              <td>
                                <span
                                  className={`badge text-xs ${
                                    staff.status === 'active' ? 'badge-success' : 'badge-error'
                                  }`}
                                >
                                  {staff.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="text-center">
                                <div className="flex items-center justify-center gap-xs">
                                  <button
                                    onClick={() => handleEditStaff(staff)}
                                    className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                    aria-label="Edit staff"
                                  >
                                    <Edit2 size={16} className="text-clickhouse-yellow" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStaff(staff.id)}
                                    className="p-2 hover:bg-clickhouse-surface-elevated rounded-md transition-colors"
                                    aria-label="Delete staff"
                                  >
                                    <Trash2 size={16} className="text-clickhouse-rose" />
                                  </button>
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
            )}

            {/* SYSTEM TAB */}
            {activeTab === 'system' && isAdmin && (
              <div className="space-y-lg">
                <StyledCard>
                  <h2 className="text-lg font-bold text-clickhouse-ink mb-lg">System Settings</h2>
                  <div className="space-y-md">
                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Default Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={systemSettings.default_tax_rate}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            default_tax_rate: parseFloat(e.target.value)
                          })
                        }
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Low Stock Threshold
                      </label>
                      <input
                        type="number"
                        value={systemSettings.low_stock_threshold}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            low_stock_threshold: parseInt(e.target.value)
                          })
                        }
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Default Reorder Level
                      </label>
                      <input
                        type="number"
                        value={systemSettings.reorder_level_default}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            reorder_level_default: parseInt(e.target.value)
                          })
                        }
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Currency
                      </label>
                      <select
                        value={systemSettings.currency}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            currency: e.target.value
                          })
                        }
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                      >
                        <option value="₹">Indian Rupee (₹)</option>
                        <option value="$">US Dollar ($)</option>
                        <option value="€">Euro (€)</option>
                        <option value="£">British Pound (£)</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSystemSettingsSave}
                      disabled={loading}
                      className="btn btn-primary mt-md"
                    >
                      {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </StyledCard>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <div className="space-y-lg">
                <StyledCard>
                  <h2 className="text-lg font-bold text-clickhouse-ink mb-lg">Preferences</h2>
                  <div className="space-y-md">
                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Timezone
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            timezone: e.target.value
                          })
                        }
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Date Format
                      </label>
                      <select
                        value={preferences.date_format}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            date_format: e.target.value
                          })
                        }
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                      >
                        <option value="DD-MM-YYYY">DD-MM-YYYY (25-06-2026)</option>
                        <option value="MM-DD-YYYY">MM-DD-YYYY (06-25-2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-06-25)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                        Time Format
                      </label>
                      <select
                        value={preferences.time_format}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            time_format: e.target.value
                          })
                        }
                        className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
                      >
                        <option value="24-hour">24-hour (14:30)</option>
                        <option value="12-hour">12-hour (2:30 PM)</option>
                      </select>
                    </div>

                    <button
                      onClick={handlePreferencesSave}
                      disabled={loading}
                      className="btn btn-primary mt-md"
                    >
                      {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </StyledCard>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Edit Staff Member"
        size="md"
      >
        {editingStaff && (
          <div className="space-y-md">
            <div>
              <label className="block text-sm font-medium text-clickhouse-ink mb-xs">Name</label>
              <p className="text-clickhouse-body">{editingStaff.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-clickhouse-ink mb-xs">Email</label>
              <p className="text-clickhouse-body">{editingStaff.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-clickhouse-ink mb-xs">
                Assign Branch
              </label>
              <select
                value={staffFormData.branch_id}
                onChange={(e) => setStaffFormData({ ...staffFormData, branch_id: e.target.value })}
                className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
              >
                <option value="">Unassigned</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-clickhouse-ink mb-xs">Status</label>
              <select
                value={staffFormData.status}
                onChange={(e) => setStaffFormData({ ...staffFormData, status: e.target.value })}
                className="w-full bg-clickhouse-surface-card border border-clickhouse-hairline rounded-lg px-lg py-md text-clickhouse-ink focus:outline-none focus:border-clickhouse-yellow"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-md pt-md">
              <button
                onClick={handleSaveStaff}
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}