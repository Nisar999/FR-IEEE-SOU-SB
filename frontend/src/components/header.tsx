import { Button } from '@/components/ui/button'

export default function Header({ isDark, setIsDark, role, onLogout }: { isDark: boolean; setIsDark: (val: boolean) => void; role: 'admin' | 'user'; onLogout: () => void }) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-40 transition-colors duration-300">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NEत्र Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time person tracking & recognition system</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-muted"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? '☀️' : '🌙'}
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${role === 'admin' ? 'bg-gradient-to-br from-primary to-primary/70' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
              <span>{role === 'admin' ? 'A' : 'U'}</span>
            </div>
            <div className="text-sm mr-2">
              <p className="font-medium text-foreground capitalize">{role}</p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} className="text-xs hover:bg-destructive hover:text-destructive-foreground transition-colors">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
