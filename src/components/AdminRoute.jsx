import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children, navigate }) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      // redirect to home if not admin
      try {
        navigate('/')
      } catch (e) {
        // noop
      }
    }
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null
  return <>{children}</>
}
