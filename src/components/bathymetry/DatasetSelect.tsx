
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { BathymetryDataset } from "@/types/bathymetry"

type DatasetSelectProps = {
  datasets: BathymetryDataset[]
  value: string
  onChange: (slug: string) => void
}

export function DatasetSelect({
  datasets,
  value,
  onChange,
}: DatasetSelectProps) {
  const items = datasets.map((dataset) => ({
    label: dataset.name,
    value: dataset.slug,
  }))

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(slug) => {
        if (slug !== null) {
          onChange(slug)
        }
      }}
      disabled={items.length === 0}
    >
      <SelectTrigger
        aria-label="Dataset"
        className="h-13 w-full min-w-56 rounded-xl border-slate-700/80
          bg-[#0a1017] px-5 py-3 text-lg text-slate-100
          hover:border-slate-600 focus-visible:border-cyan-500
          focus-visible:ring-cyan-500/20 sm:w-72"
      >
        <SelectValue placeholder="Select dataset" />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
