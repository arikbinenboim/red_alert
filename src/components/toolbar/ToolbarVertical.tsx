import { Hand, Eye, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppStore } from '@/store/useAppStore';
import type { ToolMode } from '@/store/toolModeSlice';

const TOOLS: { mode: ToolMode; icon: typeof Hand; label: string }[] = [
  { mode: 'pan', icon: Hand, label: 'Pan' },
  { mode: 'viewshed', icon: Eye, label: 'Viewshed' },
  { mode: 'distance', icon: Ruler, label: 'Distance' },
];

export function ToolbarVertical() {
  const toolMode = useAppStore((s) => s.toolMode);
  const setToolMode = useAppStore((s) => s.setToolMode);

  return (
    <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
      {TOOLS.map(({ mode, icon: Icon, label }) => (
        <Tooltip key={mode}>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                variant={toolMode === mode ? 'default' : 'secondary'}
                onClick={() => setToolMode(mode)}
              >
                <Icon size={18} />
              </Button>
            }
          />
          <TooltipContent side="left">{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
