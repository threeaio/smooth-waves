'use client';

import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { Pause, Play } from 'lucide-react';
import { useActiveLayer, useComposer, useComposerDispatch } from '../composer-context';
import { useScrollScrubber } from '../hooks/use-scroll-scrubber';
import { panelCls, sliderCls, sliderFill } from '../ui';
import { useView } from '../view-context';

export function Timeline() {
    const { selection } = useComposer();
    const active = useActiveLayer();
    const dispatch = useComposerDispatch();
    const { mockWide, playing, setPlaying, scrubT, scrubTo } = useView();
    const { scrubberRef, tLabelRef } = useScrollScrubber({ mockWide, scrubT });

    return (
        <footer
            // docked between the two panels — the canvas above stays completely clear
            className={cn(
                'fixed bottom-0 left-0 right-0 z-40 flex h-ed-timeline items-center gap-3 border-t px-4 lg:left-ed-left lg:right-ed-right',
                panelCls,
            )}
        >
            {mockWide && (
                <IconButton
                    icon={playing ? Pause : Play}
                    aria-label={playing ? 'pause' : 'play'}
                    title={playing ? 'pause (space)' : 'play the scroll pass (space)'}
                    selected={playing}
                    onClick={() => {
                        dispatch({ type: 'selection/set', selection: null });
                        setPlaying((v) => !v);
                    }}
                />
            )}
            <span className="text-3xs text-ed-text-muted">t</span>
            <span ref={tLabelRef} className="w-8 text-2xs tabular-nums text-ed-text-strong">
                {scrubT.toFixed(2)}
            </span>
            <input
                ref={scrubberRef}
                type="range"
                min={0}
                max={100}
                step={0.5}
                defaultValue={0}
                aria-label="timeline progress"
                onChange={(e) => scrubTo(Number(e.target.value))}
                className={cn(sliderCls, 'flex-1')}
                style={{ background: sliderFill(0) }}
            />
            {/* keyframe edit status lives in the docked bar — never on the canvas */}
            {selection && active && (
                <div className="flex min-w-0 items-center gap-2 text-3xs">
                    <span className="truncate text-ed-text-muted">
                        editing keyframe {selection.index + 1}
                        {active.mode === 'band' ? ` · ${selection.edge}` : ''} · {active.name}
                    </span>
                    <button
                        type="button"
                        onClick={() => dispatch({ type: 'selection/set', selection: null })}
                        className="shrink-0 text-ed-accent transition-opacity hover:opacity-80"
                    >
                        done
                    </button>
                </div>
            )}
        </footer>
    );
}
