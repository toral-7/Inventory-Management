import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock } from 'lucide-react'
import StyledInput from '../components/styled/StyledInput'
import StyledButton from '../components/styled/StyledButton'
import StyledCard from '../components/styled/StyledCard'
import client from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@inventory.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await client.post('/auth/login', {
        email,
        password
      })

      if (response.data.success) {
        login(response.data.user, response.data.token)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-clickhouse-canvas flex items-center justify-center p-md">
      {/* Main Container */}
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-clickhouse-yellow mb-lg">
            <span className="text-2xl">📦</span>
          </div>
          <h1 className="text-display-sm text-clickhouse-ink mb-md">Inventory System</h1>
          <p className="text-body-md text-clickhouse-body">Manage your inventory efficiently</p>
        </div>

        {/* Form Card */}
        <StyledCard className="animate-slide-up">
          {/* Error Message */}
          {error && (
            <div className="mb-lg p-md bg-clickhouse-rose bg-opacity-10 border border-clickhouse-rose rounded-md animate-slide-down">
              <p className="text-sm text-clickhouse-rose flex items-center gap-2">
                <span>⚠️</span> {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Email Input */}
            <StyledInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@inventory.com"
              icon={<Mail size={18} />}
              required
            />

            {/* Password Input */}
            <StyledInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              required
            />

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded accent-clickhouse-yellow cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-clickhouse-body cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <StyledButton
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </StyledButton>
          </form>

          {/* Divider */}
          <div className="relative my-lg">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-clickhouse-hairline"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-clickhouse-surface-card text-clickhouse-muted">Test Credentials</span>
            </div>
          </div>

          {/* Test Credentials */}
          <div className="space-y-md bg-clickhouse-surface-soft rounded-md p-lg border border-clickhouse-hairline">
            <div>
              <p className="text-xs text-clickhouse-muted mb-xs">Admin Account</p>
              <p className="text-sm text-clickhouse-ink font-mono break-all">admin@inventory.com</p>
              <p className="text-sm text-clickhouse-ink font-mono">password123</p>
            </div>
            <div className="border-t border-clickhouse-hairline pt-md">
              <p className="text-xs text-clickhouse-muted mb-xs">Staff Account</p>
              <p className="text-sm text-clickhouse-ink font-mono break-all">staff@inventory.com</p>
              <p className="text-sm text-clickhouse-ink font-mono">password123</p>
            </div>
          </div>
        </StyledCard>

        {/* Footer */}
        <p className="text-center text-xs text-clickhouse-muted mt-lg">
          © 2024 Inventory Management System. All rights reserved.
        </p>
      </div>
    </div>
  )
}