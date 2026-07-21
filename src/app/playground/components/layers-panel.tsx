'use client';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Eye, EyeOff, Frame, Plus, Spline, Waves, X } from 'lucide-react';
import { useComposer, useComposerDispatch } from '../composer-context';
import type { LayerState } from '../defaults';
import { PanelHeader } from '../ui';
import { useView } from '../view-context';
import { useState } from 'react';

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
    const TypeIcon = layer.mode === 'wave' ? Spline : Waves;
    return (
        <div
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            className={cn(
                'group flex h-7 items-center gap-0.5 rounded-md px-1.5 text-2xs transition-colors',
                isActive ? 'bg-ed-accent/10' : 'hover:bg-ed-fill',
                !layer.visible && 'opacity-40',
            )}
        >
            <span
                className={cn('flex w-4 justify-center', isActive ? 'text-ed-accent' : 'text-ed-text-muted')}
                title={layer.mode}
            >
                <TypeIcon size={11} aria-hidden />
            </span>
            {draft !== null ? (
                <input
                    autoFocus
                    value={draft}
                    aria-label="layer name"
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
                    className="min-w-0 flex-1 rounded-md border border-ed-accent/60 bg-white px-1 py-0.5 text-2xs text-ed-text-strong outline-none"
                />
            ) : (
                <button
                    type="button"
                    onClick={onActivate}
                    onDoubleClick={() => setDraft(layer.name)}
                    title="double-click to rename"
                    className={cn(
                        'min-w-0 flex-1 truncate py-1 text-left',
                        isActive ? 'font-medium text-ed-text-strong' : 'text-ed-text',
                    )}
                >
                    {layer.name}
                </button>
            )}
            {/* quiet rows: reorder + delete appear on hover, visibility stays when off */}
            <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                <IconButton
                    icon={ChevronUp}
                    size="xs"
                    variant="plain"
                    aria-label="bring forward"
                    title="bring forward"
                    disabled={isFront}
                    onClick={onMoveForward}
                />
                <IconButton
                    icon={ChevronDown}
                    size="xs"
                    variant="plain"
                    aria-label="send backward"
                    title="send backward"
                    disabled={isBack}
                    onClick={onMoveBackward}
                />
                <IconButton
                    icon={X}
                    size="xs"
                    variant="plain"
                    danger
                    aria-label="delete layer"
                    title="delete layer"
                    disabled={!canRemove}
                    onClick={onRemove}
                />
            </div>
            <IconButton
                icon={layer.visible ? Eye : EyeOff}
                size="xs"
                variant="plain"
                aria-label={layer.visible ? 'hide layer' : 'show layer'}
                title="toggle visibility"
                onClick={onToggleVisible}
                className={cn(layer.visible && 'opacity-0 transition-opacity group-hover:opacity-100')}
            />
        </div>
    );
}

export function LayersPanel() {
    const { layers, activeId } = useComposer();
    const dispatch = useComposerDispatch();
    const { hoveredLayerId, setHoveredLayerId } = useView();
    // layer list convention (like Figma): top row = frontmost = last in paint order
    const reversed = [...layers].reverse();
    return (
        <div className="flex h-full flex-col">
            <PanelHeader
                title="layers"
                actions={
                    <div className="flex gap-1">
                        <Button
                            size="xs"
                            icon={Plus}
                            title="add wave layer"
                            onClick={() => dispatch({ type: 'layer/add', mode: 'wave' })}
                        >
                            wave
                        </Button>
                        <Button
                            size="xs"
                            icon={Plus}
                            title="add band layer"
                            onClick={() => dispatch({ type: 'layer/add', mode: 'band' })}
                        >
                            band
                        </Button>
                    </div>
                }
            />
            <div className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto p-1.5">
                {/* the page itself is selectable — background, palette, grain live there */}
                <button
                    type="button"
                    onClick={() => dispatch({ type: 'select', id: 'page' })}
                    className={cn(
                        'flex h-7 items-center gap-0.5 rounded-md px-1.5 text-2xs transition-colors',
                        activeId === 'page'
                            ? 'bg-ed-accent/10 font-medium text-ed-text-strong'
                            : 'text-ed-text hover:bg-ed-fill',
                    )}
                >
                    <span
                        className={cn(
                            'flex w-4 justify-center',
                            activeId === 'page' ? 'text-ed-accent' : 'text-ed-text-muted',
                        )}
                    >
                        <Frame size={11} aria-hidden />
                    </span>
                    <span>page</span>
                </button>
                <div className="mx-1.5 my-1 border-t border-ed-hairline" />
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
                            onActivate={() => dispatch({ type: 'select', id: layer.id })}
                            onToggleVisible={() => dispatch({ type: 'layer/toggle-visible', id: layer.id })}
                            onMoveForward={() => dispatch({ type: 'layer/move', id: layer.id, dir: 1 })}
                            onMoveBackward={() => dispatch({ type: 'layer/move', id: layer.id, dir: -1 })}
                            onRemove={() => dispatch({ type: 'layer/remove', id: layer.id })}
                            onRename={(name) => dispatch({ type: 'layer/rename', id: layer.id, name })}
                            onHoverChange={(hovering) =>
                                setHoveredLayerId(
                                    hovering ? layer.id : hoveredLayerId === layer.id ? null : hoveredLayerId,
                                )
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}
