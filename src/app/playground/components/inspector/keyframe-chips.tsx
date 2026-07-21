'use client';

import type { WaveConfig } from '@threeaio/smooth-waves';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { keyframeColor, type Selection } from '../curve-overlay';

/**
 * Chip strip for one edge's keyframes. Clicking a chip selects (pins) that
 * keyframe for canvas editing; clicking again deselects. `+` duplicates the
 * last keyframe and selects the copy.
 */
export function KeyframeChips({
    label,
    edge,
    configs,
    selection,
    onSelect,
    onChange,
}: {
    label?: string;
    edge: Selection['edge'];
    configs: WaveConfig[];
    selection: Selection | null;
    onSelect: (selection: Selection | null) => void;
    onChange: (configs: WaveConfig[]) => void;
}) {
    return (
        <div className="flex items-center gap-2 text-2xs">
            {label && <span className="w-12 text-ed-text-muted">{label}</span>}
            <div className="flex flex-wrap gap-1.5">
                {configs.map((_, i) => {
                    const isSelected = selection?.edge === edge && selection.index === i;
                    return (
                        <button
                            key={i}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onSelect(isSelected ? null : { edge, index: i })}
                            className={cn(
                                'size-6 rounded-md border-2 bg-white text-2xs font-medium transition-colors',
                                isSelected
                                    ? 'border-ed-accent bg-ed-accent/10 text-ed-accent'
                                    : 'text-ed-text hover:bg-ed-fill',
                            )}
                            // unselected chips keep their keyframe's system color as a border ring —
                            // same hue as the ghost curve, but with dark text that stays readable
                            style={isSelected ? undefined : { borderColor: keyframeColor(i) }}
                        >
                            {i + 1}
                        </button>
                    );
                })}
                <button
                    type="button"
                    title="add keyframe (duplicates the last one)"
                    aria-label="add keyframe"
                    onClick={() => {
                        const last = configs[configs.length - 1];
                        onChange([...configs, { left: [...last.left], right: [...last.right] }]);
                        onSelect({ edge, index: configs.length });
                    }}
                    className="flex size-6 items-center justify-center rounded-md border border-dashed border-ed-border-strong bg-white text-ed-text-muted transition-colors hover:border-black/40 hover:text-ed-text-strong"
                >
                    <Plus size={12} aria-hidden />
                </button>
            </div>
        </div>
    );
}
