import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle, TrendingUp, Package, Receipt } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import StyledCard from '../components/styled/StyledCard'
import client from '../api/client'

export default function Profile() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

    useEffect(() => { 
        const fetchProfileData = async () => {
            try {
                setLoading(true)
                const response = await client.get('/profile')
                if (response.data.success) {
                    setProfileData(response.data.profile)
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            fetchProfileData()
        }
    }, [user])
}

