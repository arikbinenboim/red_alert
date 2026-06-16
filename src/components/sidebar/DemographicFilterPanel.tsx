import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/useAppStore';

export function DemographicFilterPanel() {
  const filters = useAppStore((s) => s.filters);
  const setFilter = useAppStore((s) => s.setFilter);

  return (
    <div className="flex flex-col gap-6 p-4 text-sm text-zinc-200">
      <div className="flex flex-col gap-2">
        <label className="flex justify-between">
          <span>Population range</span>
          <span className="text-zinc-400">
            {filters.populationRange[0]} – {filters.populationRange[1]}
          </span>
        </label>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={filters.populationRange}
          onValueChange={(value) =>
            Array.isArray(value) && value.length === 2 &&
            setFilter('populationRange', value as [number, number])
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between">
          <span>Max % under 18</span>
          <span className="text-zinc-400">{filters.under18PctMax}%</span>
        </label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[filters.under18PctMax]}
          onValueChange={(value) => setFilter('under18PctMax', (Array.isArray(value) ? value[0] : value) ?? 0)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between">
          <span>Max % over 65</span>
          <span className="text-zinc-400">{filters.over65PctMax}%</span>
        </label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[filters.over65PctMax]}
          onValueChange={(value) => setFilter('over65PctMax', (Array.isArray(value) ? value[0] : value) ?? 0)}
        />
      </div>

      <div className="flex items-center justify-between">
        <span>Has school</span>
        <Switch
          checked={filters.showOnlyWithSchool}
          onCheckedChange={(checked) => setFilter('showOnlyWithSchool', checked)}
        />
      </div>
    </div>
  );
}
