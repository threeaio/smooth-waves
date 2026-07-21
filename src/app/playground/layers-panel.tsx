'use client';

import { cn } from '@/lib/utils';
import type { LayerState, Mode } from './defaults';
import { accentText } from './ui';
import { useState } from 'react';

const rowBtn =
    'flex size-5 items-center justify-center rounded text-[9px] text-zinc-400 transition-colors hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-20';

function LayerRow({
    layer,
    isActive,
    isFront,
    isBack,
    canRemove,
    onActivate,
    onToggleVisible,
    onMoveForward,
    onMoveBackward,
    onRemove,
    onRename,
    onHoverChange,
}: {
    layer: LayerState;
    isActive: boolean;
    isFront: boolean;
    isBack: boolean;
    canRemove: boolean;
    onActivate: () => void;
    onToggleVisible: () => void;
    onMoveForward: () => void;
    onMoveBackward: () => void;
    onRemove: () => void;
    onRename: (name: string) => void;
    onHoverChange: (hovering: boolean) => void;
}) {
    // double-click the name to rename — the name also becomes the Figma layer name on export
    const [draft, setDraft] = useState<string | null>(null);
    const commitDraft = () => {
        const name = draft?.trim();
        if (name) onRename(name);
        setDraft(null);
    };
    return (
        <div
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            className={cn(
                'group flex h-7 items-center gap-0.5 rounded-md px-1.5 text-[11px] transition-colors',
                isActive ? 'bg-[#0d99ff]/10' : 'hover:bg-black/[0.04]',
                !layer.visible && 'opacity-40',
            )}
        >
            <span
                className={cn(
                    'w-4 text-center font-mono text-[9px]',
                    isActive ? accentText : 'text-zinc-400',
                )}
                title={layer.mode}
            >
                {layer.mode === 'wave' ? '◠' : '≈'}
            </span>
            {draft !== null ? (
                <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    onBlur={commitDraft}
                    onKeyDown={(e) => {
                        // keep Enter/Escape local — the page listens for Escape (selection) and F (fullscreen)
                        e.stopPropagation();
                        if (e.key === 'Enter') commitDraft();
                        if (e.key === 'Escape') setDraft(null);
                    }}
                    spellCheck={false}
                    className="min-w-0 flex-1 rounded-md border border-[#0d99ff]/60 bg-white px-1 py-0.5 font-mono text-[11px] text-zinc-900 outline-none"
                />
            ) : (
                <button
                    type="button"
                    onClick={onActivate}
                    onDoubleClick={() => setDraft(layer.name)}
                    title="double-click to rename"
                    className={cn(
                        'min-w-0 flex-1 truncate py-1 text-left font-mono',
                        isActive ? 'font-medium text-zinc-900' : 'text-zinc-600',
                    )}
                >
                    {layer.name}
                </button>
            )}
            {/* quiet rows: reorder + delete appear on hover, visibility stays when off */}
            <div className={cn('flex items-center opacity-0 transition-opacity group-hover:opacity-100')}>
                <button type="button" title="bring forward" disabled={isFront} onClick={onMoveForward} className={rowBtn}>
                    ▲
                </button>
                <button type="button" title="send backward" disabled={isBack} onClick={onMoveBackward} className={rowBtn}>
                    ▼
                </button>
                <button
                    type="button"
                    title="delete layer"
                    disabled={!canRemove}
                    onClick={onRemove}
                    className={cn(rowBtn, 'hover:text-red-500')}
                >
                    ✕
                </button>
            </div>
            <button
                type="button"
                title="toggle visibility"
                onClick={onToggleVisible}
                className={cn(
                    rowBtn,
                    'text-[10px]',
                    layer.visible && 'opacity-0 transition-opacity group-hover:opacity-100',
                )}
            >
                {layer.visible ? '👁' : '—'}
            </button>
        </div>
    );
}

export function LayersPanel({
    layers,
    activeId,
    hoveredLayerId,
    onSelect,
    onToggleVisible,
    onMove,
    onRemove,
    onRename,
    onHover,
    onAdd,
}: {
    layers: LayerState[];
    /** 'page' or a layer id. */
    activeId: string;
    hoveredLayerId: string | null;
    onSelect: (id: string) => void;
    onToggleVisible: (id: string) => void;
    onMove: (id: string, dir: 1 | -1) => void;
    onRemove: (id: string) => void;
    onRename: (id: string, name: string) => void;
    onHover: (id: string | null) => void;
    onAdd: (mode: Mode) => void;
}) {
    // layer list convention (like Figma): top row = frontmost = last in paint order
    const reversed = [...layers].reverse();
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-3 py-2">
                <span className="text-[10px] font-medium text-zinc-400">layers</span>
                <div className="flex gap-1">
                    <button
                        type="button"
                        title="add wave layer"
                        onClick={() => onAdd('wave')}
                        className="rounded-md border border-black/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 transition-colors hover:border-black/25 hover:text-zinc-900"
                    >
                        + wave
                    </button>
                    <button
                        type="button"
                        title="add band layer"
                        onClick={() => onAdd('band')}
                        className="rounded-md border border-black/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 transition-colors hover:border-black/25 hover:text-zinc-900"
                    >
                        + band
                    </button>
                </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto p-1.5">
                {/* the page itself is selectable — background, palette, grain live there */}
                <button
                    type="button"
                    onClick={() => onSelect('page')}
                    className={cn(
                        'flex h-7 items-center gap-0.5 rounded-md px-1.5 text-[11px] transition-colors',
                        activeId === 'page' ? 'bg-[#0d99ff]/10 font-medium text-zinc-900' : 'text-zinc-600 hover:bg-black/[0.04]',
                    )}
                >
                    <span
                        className={cn(
                            'w-4 text-center font-mono text-[9px]',
                            activeId === 'page' ? accentText : 'text-zinc-400',
                        )}
                    >
                        ▣
                    </span>
                    <span className="font-mono">page</span>
                </button>
                <div className="mx-1.5 my-1 border-t border-black/[0.06]" />
                {reversed.map((layer) => {
                    const index = layers.indexOf(layer);
                    return (
                        <LayerRow
                            key={layer.id}
                            layer={layer}
                            isActive={layer.id === activeId}
                            isFront={index === layers.length - 1}
                            isBack={index === 0}
                            canRemove={layers.length > 1}
                            onActivate={() => onSelect(layer.id)}
                            onToggleVisible={() => onToggleVisible(layer.id)}
                            onMoveForward={() => onMove(layer.id, 1)}
                            onMoveBackward={() => onMove(layer.id, -1)}
                            onRemove={() => onRemove(layer.id)}
                            onRename={(name) => onRename(layer.id, name)}
                            onHoverChange={(hovering) =>
                                onHover(hovering ? layer.id : hoveredLayerId === layer.id ? null : hoveredLayerId)
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}
