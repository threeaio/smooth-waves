'use client';

import type { WaveConfig } from '@threeaio/smooth-waves';
import { Button } from '@/components/ui/button';
import { Fragment } from 'react';
import { NumberField } from '../../ui';

/** Numeric fine-tune readout for the selected keyframe — the canvas handles are the primary editor. */
export function SelectedKeyframe({
    config,
    count,
    onChange,
    onDuplicate,
    onRemove,
}: {
    config: WaveConfig;
    count: number;
    onChange: (config: WaveConfig) => void;
    onDuplicate: () => void;
    onRemove: () => void;
}) {
    const set = (side: keyof WaveConfig, i: number, v: number) => {
        const next: WaveConfig = { left: [...config.left], right: [...config.right] };
        next[side][i] = v;
        onChange(next);
    };
    const ranges: Array<[number, number]> = [
        [0, 1],
        [0, 1],
        [-1, 1],
    ];
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-ed-accent/25 bg-ed-accent/[0.04] p-2 text-2xs">
            <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] items-center gap-1.5">
                <span />
                <span className="text-center text-ed-text-muted">y</span>
                <span className="text-center text-ed-text-muted">x-off</span>
                <span className="text-center text-ed-text-muted">y-off</span>
                {(['left', 'right'] as const).map((side) => (
                    <Fragment key={side}>
                        <span className="text-ed-text-muted">{side}</span>
                        {config[side].map((v, i) => (
                            <NumberField
                                key={`${side}-${i}`}
                                value={v}
                                min={ranges[i][0]}
                                max={ranges[i][1]}
                                onChange={(next) => set(side, i, next)}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            <div className="flex gap-1.5">
                <Button size="xs" onClick={onDuplicate}>
                    duplicate
                </Button>
                <Button size="xs" variant="danger" disabled={count <= 1} onClick={onRemove}>
                    remove
                </Button>
            </div>
        </div>
    );
}
