import { Button } from "./ui/button";
import { Bot, Map } from "lucide-react";

interface ViewToggleProps {
  currentView: 'animation' | 'map';
  onViewChange: (view: 'animation' | 'map') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <Button
        variant={currentView === 'animation' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1 flex items-center gap-2"
        onClick={() => onViewChange('animation')}
      >
        <Bot className="h-4 w-4" />
        Robot
      </Button>
      <Button
        variant={currentView === 'map' ? 'default' : 'ghost'}
        size="sm"
        className="flex-1 flex items-center gap-2"
        onClick={() => onViewChange('map')}
      >
        <Map className="h-4 w-4" />
        Map
      </Button>
    </div>
  );
}