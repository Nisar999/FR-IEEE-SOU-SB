import { motion } from 'framer-motion'

export default function Sidebar({ activeTab, setActiveTab, role }: { activeTab: string; setActiveTab: (tab: string) => void; role: 'admin' | 'user' }) {
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'user'] },
    { id: 'cameras', label: 'Cameras', icon: '📹', roles: ['admin'] },
    { id: 'logs', label: 'Logs', icon: '📋', roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
  ]
  
  const navItems = allNavItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col sticky top-0">
      {/* Logo Area */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <span className="text-white font-bold text-sm">न</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">NEत्र</h1>
            <p className="text-xs text-muted-foreground">Vision Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 flex items-center gap-3 ${
              activeTab === item.id
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-sidebar-foreground">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>System Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
