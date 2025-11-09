import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Home, Package, Bot, Building, MoreHorizontal } from "lucide-react";

interface MobileBottomNavProps {
  currentPage: 'tracking' | 'details' | 'robot' | 'building' | 'more';
  onPageChange: (page: 'tracking' | 'details' | 'robot' | 'building' | 'more') => void;
  notifications?: {
    details?: number;
    robot?: number;
    building?: number;
  };
}

export function MobileBottomNav({ currentPage, onPageChange, notifications = {} }: MobileBottomNavProps) {
  const navItems = [
    {
      id: 'tracking' as const,
      icon: Home,
      label: 'Tracking',
      badge: notifications.details
    },
    {
      id: 'details' as const,
      icon: Package,
      label: 'Details',
      badge: notifications.details
    },
    {
      id: 'robot' as const,
      icon: Bot,
      label: 'Robot',
      badge: notifications.robot
    },
    {
      id: 'building' as const,
      icon: Building,
      label: 'Building',
      badge: notifications.building
    },
    {
      id: 'more' as const,
      icon: MoreHorizontal,
      label: 'More',
      badge: undefined
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`relative h-full rounded-none flex flex-col items-center justify-center gap-1 ${
                isActive ? 'text-blue-600 bg-blue-50' : 'text-muted-foreground'
              }`}
              onClick={() => onPageChange(item.id)}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}