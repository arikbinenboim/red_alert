import { TooltipProvider } from '@/components/ui/tooltip';
import { MapView } from '@/components/map/MapView';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ToolbarVertical } from '@/components/toolbar/ToolbarVertical';
import { BottomHud } from '@/components/hud/BottomHud';

function App() {
  return (
    <TooltipProvider>
      <div className="dark relative h-full w-full">
        <MapView />
        <Sidebar />
        <ToolbarVertical />
        <BottomHud />
      </div>
    </TooltipProvider>
  );
}

export default App;
