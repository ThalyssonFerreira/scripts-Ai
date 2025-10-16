"use client";

import { PRESETS } from "@/lib/schema";

type Props = {
  onPick: (label: string) => void;
};

export default function PresetGrid({ onPick }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 grid-presets mb-4">
      {PRESETS.map((p) => (
        <button key={p.label} onClick={() => onPick(p.label)}>
          {p.label}
        </button>
      ))}
    </div>
  );
}
