import { Button } from './ui/button'
import { LogOut, ChevronDown } from 'lucide-react'
import type { AuthUser } from '../lib/types'

interface AppHeaderProps {
  user: AuthUser
  buildingName?: string | null
  onLogout: () => void
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-violet-100 text-violet-700',
  user:  'bg-sky-100 text-sky-700',
  guest: 'bg-slate-100 text-slate-600',
}

export function AppHeader({ user, buildingName, onLogout }: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <rect x="3" y="7" width="14" height="9" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="7" y="4" width="6" height="4" rx="1" fill="white" fillOpacity="0.6" />
              <circle cx="7" cy="16" r="1.5" fill="#1d4ed8" />
              <circle cx="13" cy="16" r="1.5" fill="#1d4ed8" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-sm leading-none">
                Ausomo Robotics
              </span>
              {buildingName && (
                <>
                  <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-500 truncate max-w-[200px]">
                    {buildingName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* User pill */}
          <div className="hidden sm:flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-700 font-medium max-w-[120px] truncate">
              {user.full_name}
            </span>
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${ROLE_STYLES[user.role] ?? ROLE_STYLES.guest}`}>
              {user.role}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
