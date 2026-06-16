import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { DemographicFilterPanel } from './DemographicFilterPanel';

export function Sidebar() {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-start p-4">
      <Card
        className={`pointer-events-auto overflow-hidden border-zinc-800 bg-zinc-900/90 text-zinc-100 backdrop-blur-md transition-all duration-200 ${
          sidebarCollapsed ? 'w-12' : 'w-72'
        }`}
      >
        <div className="flex items-center justify-between px-2 pt-2">
          {!sidebarCollapsed && <span className="px-2 text-sm font-semibold">Filters</span>}
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
        {!sidebarCollapsed && <DemographicFilterPanel />}
      </Card>
    </div>
  );
}
