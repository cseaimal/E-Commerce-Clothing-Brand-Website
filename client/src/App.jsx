import React, { useState, useContext } from 'react'
import Register from './pages/Register'
import Login from './pages/Login'
import AdminInquiries from './pages/AdminInquiries'
import AdminRoute from './components/AdminRoute'
import { AuthContext } from './context/AuthContext'

export default function App(){
  const [route, setRoute] = useState('/')
  const navigate = (p)=> setRoute(p)
  const { user, logout } = useContext(AuthContext)

  return (
    <div>
      <nav style={{padding:12,display:'flex',gap:8,alignItems:'center'}}>
        <div style={{flex:1}}>
          <strong>Aljannat (dev)</strong>
        </div>
        <button onClick={()=>navigate('/admin')}>Admin</button>
        {user ? (
          <>
            <span style={{marginRight:8}}>Hello, {user.name || user.email}</span>
            <button onClick={()=>{ logout(); navigate('/') }}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={()=>navigate('/register')}>Register</button>
            <button onClick={()=>navigate('/login')}>Login</button>
          </>
        )}
      </nav>
      <main>
        {route === '/register' && <Register navigate={navigate} />}
        {route === '/login' && <Login navigate={navigate} />}
        {route === '/' && (
          <div style={{padding:20}}>
            <h2>Welcome{user ? `, ${user.name || user.email}` : ''}</h2>
            <p>Use the navigation to register or login.</p>
          </div>
        )}
        {route === '/admin' && (
          <AdminRoute navigate={navigate}>
            <AdminInquiries />
          </AdminRoute>
        )}
      </main>
    </div>
  )
}
