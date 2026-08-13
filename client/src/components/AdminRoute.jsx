import React, { useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function AdminRoute({ children, navigate }) {
  const { user, token } = React.useContext(AuthContext)

  useEffect(() => {
    // If there's no token and no user, immediately redirect
    if (!token && !user) {
      try { navigate('/') } catch (e) {}
      return
    }
    // If user exists but is not admin, redirect
    if (user && user.role !== 'admin') {
      try { navigate('/') } catch (e) {}
    }
    // If token exists but user not yet restored, wait (do not redirect)
  }, [user, token, navigate])

  if (!token && !user) return null
  if (user && user.role !== 'admin') return null
  // render children only when user is admin
  if (user && user.role === 'admin') return <>{children}</>
  // otherwise show nothing while restoring
  return null
}
