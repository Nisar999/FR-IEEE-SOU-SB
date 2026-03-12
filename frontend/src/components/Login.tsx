import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface LoginProps {
  onLogin: (role: 'admin' | 'user') => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Hardcoded credentials as per user request
    if (username === 'SOU' && password === 'SAHANA@SOU') {
      onLogin('admin')
    } else if (username === 'USER' && password === 'SOU') {
      onLogin('user')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.05)_25%,rgba(68,68,68,.05)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.05)_75%,rgba(68,68,68,.05))] bg-[length:40px_40px]">
      <div className="absolute top-0 right-0 w-[800px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[300px] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl p-6">
          <CardHeader className="text-center pb-8 border-b border-border/50 mb-6">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
               <span className="text-white font-bold text-2xl">न</span>
             </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">NEत्र Security</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">Enter your credentials to access the vision engine</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 backdrop-blur px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 backdrop-blur px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
