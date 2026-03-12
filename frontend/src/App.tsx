'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Dashboard from '@/components/dashboard'
import CamerasConfig from '@/components/cameras-config'
import RegistryLogs from '@/components/registry-logs'
import SettingsPanel from '@/components/settings-panel'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import Login from '@/components/Login'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isDark, setIsDark] = useState(true)
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: 'admin' | 'user' | null }>({
    isAuthenticated: false,
    role: null
  })

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  if (!auth.isAuthenticated) {
    return <Login onLogin={(role) => setAuth({ isAuthenticated: true, role })} />
  }

  const isAdmin = auth.role === 'admin'

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, role: null })
  }

  return (
    <div className="dark flex min-h-screen bg-background text-foreground transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={auth.role as 'admin' | 'user'} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header isDark={isDark} setIsDark={setIsDark} role={auth.role as 'admin' | 'user'} onLogout={handleLogout} />
        <main className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-8 pt-6">
              <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 mb-6">
                <TabsTrigger value="dashboard" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 transition-all">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </span>
                </TabsTrigger>
                
                {isAdmin && (
                  <>
                    <TabsTrigger value="cameras" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 transition-all">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Cameras & Config
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 transition-all">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Registry Logs
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 transition-all">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="px-8 pb-8">
              <Dashboard />
            </TabsContent>
            {isAdmin && (
              <>
                <TabsContent value="cameras" className="px-8 pb-8">
                  <CamerasConfig />
                </TabsContent>
                <TabsContent value="logs" className="px-8 pb-8">
                  <RegistryLogs />
                </TabsContent>
                <TabsContent value="settings" className="px-8 pb-8">
                  <SettingsPanel />
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  )
}
