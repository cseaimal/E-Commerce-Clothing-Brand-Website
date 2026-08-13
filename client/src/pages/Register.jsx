import React, {useState, useContext} from 'react'
import { AuthContext } from '../context/AuthContext'

export default function Register({navigate}){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  const [loading,setLoading]=useState(false)
  const { login } = useContext(AuthContext)

  const handle=async(e)=>{
    e.preventDefault(); setMsg(''); setLoading(true)
    try{
      const res=await fetch('http://localhost:5000/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})})
      const data=await res.json()
      if(!res.ok) throw new Error(data.message||'Failed')
      const tok = data.token || data.accessToken
      login(data.user || null, tok)
      navigate('/')
    }catch(err){ setMsg(err.message) }
    setLoading(false)
  }

  return (
    <div style={{maxWidth:520,margin:20}}>
      <h2>Register (dev)</h2>
      <form onSubmit={handle}>
        <div><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} required/></div>
        <div><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div><label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/></div>
        {msg && <div style={{color:'red'}}>{msg}</div>}
        <div><button type="submit" disabled={loading}>{loading? 'Please wait':'Register'}</button></div>
      </form>
    </div>
  )
}
