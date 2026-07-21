'use client';

import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { Check, Dices, Download, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useComposer, useRandomize } from '../composer-context';
import { MOCK_WIDTH } from '../defaults';
import { buildFigmaSvg, layerProgress } from '../figma-export';
import { toStackSnippet } from '../snippets';
import { FlashButton, Segmented, panelCls } from '../ui';
import { useView } from '../view-context';

export function Toolbar() {
    const { layers, pageBg, sectionPx, bleedX } = useComposer();
    const { mockWide, setMockWide, enterFullscreen, fit, scrubT, virtualProgress, sectionRef } = useView();
    const randomize = useRandomize();

    const code = useMemo(() => toStackSnippet(layers, sectionPx, bleedX), [layers, sectionPx, bleedX]);

    /* ---- figma export ---- */
    const buildExport = (): { svg: string; t: number } | null => {
        const el = sectionRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const visible = layers.filter((l) => l.visible);
        if (visible.length === 0) return null;
        // fitted overview: the on-screen rect is scaled down — export the mocked
        // screen at its true size, at the scrubber's virtual progress
        if (mockWide) {
            return {
                svg: buildFigmaSvg(visible, MOCK_WIDTH, sectionPx, virtualProgress, pageBg, bleedX / 100),
                t: scrubT,
            };
        }
        const svg = buildFigmaSvg(
            visible,
            rect.width,
            rect.height,
            (layer) =>
                layerProgress(
                    layer.scrollStart,
                    layer.scrollEnd,
                    sectionTop,
                    rect.height,
                    window.innerHeight,
                    window.scrollY,
                ),
            pageBg,
            bleedX / 100,
        );
        // headline progress for the feedback label: the section's full pass
        const t = layerProgress('start end', 'end start', sectionTop, rect.height, window.innerHeight, window.scrollY);
        return { svg, t };
    };

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 flex h-ed-toolbar items-center justify-between border-b px-3',
                panelCls,
            )}
        >
            <div className="flex items-center gap-3">
                <span className="text-2xs font-medium text-ed-text-strong">wave composer</span>
                <Link
                    href="/"
                    title="exit composer"
                    className="text-3xs text-ed-text-muted transition-colors hover:text-ed-text-strong"
                >
                    exit
                </Link>
            </div>
            {/* view switch lives centered over the canvas, like a zoom control */}
            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
                <Segmented
                    options={['fit', '100%'] as const}
                    value={mockWide ? 'fit' : '100%'}
                    onChange={(v) => setMockWide(v === 'fit')}
                    size="sm"
                    title="fit the whole section vs real scroll view (Z)"
                    aria-label="zoom mode"
                />
                <IconButton
                    icon={Maximize2}
                    aria-label="fullscreen preview"
                    title="fullscreen preview — real 100% view, no chrome (F)"
                    onClick={enterFullscreen}
                />
                {mockWide && (
                    <span className="text-3xs tabular-nums text-ed-text-muted">
                        {MOCK_WIDTH} × {sectionPx} · {Math.round(fit.mockScale * 100)}%
                    </span>
                )}
            </div>
            <div className="flex items-center gap-1.5">
                <FlashButton
                    variant="primary"
                    icon={Dices}
                    title="generate a random composition — layers, palette, effects (seed shown after)"
                    onAction={() => `#${randomize().toString(16)}`}
                >
                    randomize
                </FlashButton>
                <FlashButton
                    title="copy the whole visible stack as a ready-to-paste JSX section"
                    onAction={async () => {
                        await navigator.clipboard.writeText(code);
                        return (
                            <>
                                jsx <Check size={12} aria-hidden />
                            </>
                        );
                    }}
                >
                    copy jsx
                </FlashButton>
                <FlashButton
                    title="copies an SVG snapshot at the current progress — paste directly into Figma (⌘V)"
                    onAction={async () => {
                        const result = buildExport();
                        if (!result) return null;
                        await navigator.clipboard.writeText(result.svg);
                        return (
                            <>
                                svg @ {result.t.toFixed(2)} <Check size={12} aria-hidden />
                            </>
                        );
                    }}
                >
                    copy figma svg
                </FlashButton>
                <FlashButton
                    icon={Download}
                    aria-label="download svg snapshot"
                    title="download the same snapshot as .svg"
                    onAction={() => {
                        const result = buildExport();
                        if (!result) return null;
                        const url = URL.createObjectURL(new Blob([result.svg], { type: 'image/svg+xml' }));
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'wave-composition.svg';
                        a.click();
                        URL.revokeObjectURL(url);
                        return <Check size={12} aria-hidden />;
                    }}
                />
            </div>
        </header>
    );
}
