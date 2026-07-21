'use client';

import type { WaveConfig } from '@threeaio/smooth-waves';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';
import { keyframeColor, type Selection } from './curve-overlay';
import { palettePresets, scrollPresets, type EdgeState, type LayerState } from './defaults';
import { BLUR_HIDES_STROKES } from './figma-export';
import { accentText, ColorRow, Group, inputCls, NumberField, Row, Segmented, SliderRow, Toggle, toSwatchHex } from './ui';
import { Fragment } from 'react';

/* ------------------------------------ keyframes ----------------------------------- */

/**
 * Chip strip for one edge's keyframes. Clicking a chip selects (pins) that
 * keyframe for canvas editing; clicking again deselects. `+` duplicates the
 * last keyframe and selects the copy.
 */
function KeyframeChips({
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
        <div className="flex items-center gap-2 text-[11px]">
            {label && <span className="w-12 text-zinc-500">{label}</span>}
            <div className="flex flex-wrap gap-1.5">
                {configs.map((_, i) => {
                    const isSelected = selection?.edge === edge && selection.index === i;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelect(isSelected ? null : { edge, index: i })}
                            className={cn(
                                'size-6 rounded-md border-2 bg-white font-mono text-[11px] font-medium transition-colors',
                                isSelected
                                    ? cn('border-[#0d99ff] bg-[#0d99ff]/10', accentText)
                                    : 'text-zinc-700 hover:bg-zinc-100',
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
                    onClick={() => {
                        const last = configs[configs.length - 1];
                        onChange([...configs, { left: [...last.left], right: [...last.right] }]);
                        onSelect({ edge, index: configs.length });
                    }}
                    className="size-6 rounded-md border border-dashed border-black/25 bg-white text-zinc-500 transition-colors hover:border-black/40 hover:text-zinc-900"
                >
                    +
                </button>
            </div>
        </div>
    );
}

/** Numeric fine-tune readout for the selected keyframe — the canvas handles are the primary editor. */
function SelectedKeyframe({
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
        <div className="flex flex-col gap-2 rounded-lg border border-[#0d99ff]/25 bg-[#0d99ff]/[0.04] p-2 text-[11px]">
            <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] items-center gap-1.5">
                <span />
                <span className="text-center text-zinc-400">y</span>
                <span className="text-center text-zinc-400">x-off</span>
                <span className="text-center text-zinc-400">y-off</span>
                {(['left', 'right'] as const).map((side) => (
                    <Fragment key={side}>
                        <span className="text-zinc-500">{side}</span>
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
                <button
                    type="button"
                    onClick={onDuplicate}
                    className="rounded-md border border-black/10 px-2 py-1 text-[10px] text-zinc-600 transition-colors hover:border-black/25 hover:text-zinc-900"
                >
                    duplicate
                </button>
                <button
                    type="button"
                    disabled={count <= 1}
                    onClick={onRemove}
                    className="rounded-md border border-black/10 px-2 py-1 text-[10px] text-red-500 transition-colors hover:border-red-400/60 disabled:cursor-not-allowed disabled:opacity-20"
                >
                    remove
                </button>
            </div>
        </div>
    );
}

/* --------------------------------- page inspector --------------------------------- */

export function PageInspector({
    palette,
    onApplyPalette,
    pageBg,
    onPageBg,
    sectionPx,
    onSectionPx,
    bleedX,
    onBleedX,
    grainOn,
    onGrainOn,
    spaceBefore,
    onSpaceBefore,
    spaceAfter,
    onSpaceAfter,
    code,
}: {
    palette: string[];
    onApplyPalette: (next: string[]) => void;
    pageBg: string;
    onPageBg: (value: string) => void;
    sectionPx: number;
    onSectionPx: (value: number) => void;
    bleedX: number;
    onBleedX: (value: number) => void;
    grainOn: boolean;
    onGrainOn: (value: boolean) => void;
    spaceBefore: boolean;
    onSpaceBefore: (value: boolean) => void;
    spaceAfter: boolean;
    onSpaceAfter: (value: boolean) => void;
    /** The whole visible stack as a ready-to-paste JSX snippet. */
    code: string;
}) {
    return (
        <>
            <Group title="palette">
                <Row label="preset">
                    <select
                        value={palettePresets.find((p) => p.colors.every((c, i) => c === palette[i]))?.name ?? 'custom'}
                        onChange={(e) => {
                            const preset = palettePresets.find((p) => p.name === e.target.value);
                            if (preset) onApplyPalette([...preset.colors]);
                        }}
                        className={cn(inputCls, 'w-full')}
                    >
                        <option value="custom" disabled>
                            custom
                        </option>
                        {palettePresets.map((p) => (
                            <option key={p.name} value={p.name}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </Row>
                <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                    <span />
                    <div className="flex items-center gap-1.5">
                        {palette.map((color, i) => (
                            <input
                                key={i}
                                type="color"
                                value={toSwatchHex(color)}
                                title={color}
                                onChange={(e) => onApplyPalette(palette.map((c, j) => (j === i ? e.target.value : c)))}
                                suppressHydrationWarning
                                className="size-6 cursor-pointer rounded-md border border-black/10 bg-transparent"
                            />
                        ))}
                        <CopyButton
                            textToCopy={`[${palette.map((c) => `'${c}'`).join(', ')}]`}
                            className="ml-auto rounded-md border border-black/10 p-1.5 text-zinc-500 transition-colors hover:text-zinc-900"
                        />
                    </div>
                </div>
            </Group>
            <Group title="page">
                <ColorRow label="background" value={pageBg} onChange={onPageBg} palette={palette} />
                <Row label="section px">
                    <NumberField value={sectionPx} min={200} max={20000} step={10} onChange={onSectionPx} />
                </Row>
                <SliderRow label="bleed x %" value={bleedX} min={0} max={40} step={1} onChange={onBleedX} />
                <Toggle label="grain overlay" checked={grainOn} onChange={onGrainOn} />
                <Toggle label="space before waves" checked={spaceBefore} onChange={onSpaceBefore} />
                <Toggle label="space after waves" checked={spaceAfter} onChange={onSpaceAfter} />
            </Group>
            <Group title="code">
                <div className="relative">
                    <pre className="max-h-80 overflow-auto rounded-lg border border-black/[0.08] bg-[#17171a] p-2 font-mono text-[10px] leading-relaxed text-zinc-300">
                        {code}
                    </pre>
                    <CopyButton
                        textToCopy={code}
                        className="absolute right-1.5 top-1.5 rounded-md border border-white/10 bg-black/60 p-1.5 text-zinc-400 transition-colors hover:text-white"
                    />
                </div>
            </Group>
        </>
    );
}

/* --------------------------------- layer inspector -------------------------------- */

export function LayerInspector({
    layer,
    palette,
    selection,
    onSelection,
    onion,
    onOnion,
    patch,
    patchEdge,
}: {
    layer: LayerState;
    palette: string[];
    selection: Selection | null;
    onSelection: (selection: Selection | null) => void;
    onion: boolean;
    onOnion: (value: boolean) => void;
    patch: (partial: Partial<LayerState>) => void;
    patchEdge: (edge: 'top' | 'bottom', partial: Partial<EdgeState>) => void;
}) {
    const selectedConfigs =
        selection?.edge === 'wave' ? layer.configs : selection ? layer[selection.edge].configs : null;
    const setSelectedConfigs = (configs: WaveConfig[]) => {
        if (!selection) return;
        if (selection.edge === 'wave') patch({ configs });
        else patchEdge(selection.edge, { configs });
    };
    const blurHint = layer.blur > BLUR_HIDES_STROKES && (
        <p className="text-[10px] leading-relaxed text-zinc-400">
            not rendered — invisible under this layer&apos;s {layer.blur}px blur
        </p>
    );

    return (
        <>
            <Group title={`keyframes · ${layer.mode}`}>
                {/* end editing and show the scroll-driven interpolation; doubles as a mode indicator */}
                <button
                    type="button"
                    onClick={() => onSelection(null)}
                    className={cn(
                        'flex items-center justify-center gap-2 rounded-md border py-1 font-mono text-[11px] transition-colors',
                        selection
                            ? 'border-black/10 text-zinc-600 hover:border-[#0d99ff]/50'
                            : cn('border-[#0d99ff]/50 bg-[#0d99ff]/10', accentText),
                    )}
                >
                    <span>▶</span>
                    <span>{selection ? 'show live result' : 'live result'}</span>
                </button>
                {layer.mode === 'wave' ? (
                    <KeyframeChips
                        edge="wave"
                        configs={layer.configs}
                        selection={selection}
                        onSelect={onSelection}
                        onChange={(configs) => patch({ configs })}
                    />
                ) : (
                    <>
                        <KeyframeChips
                            label="top"
                            edge="top"
                            configs={layer.top.configs}
                            selection={selection}
                            onSelect={onSelection}
                            onChange={(configs) => patchEdge('top', { configs })}
                        />
                        <KeyframeChips
                            label="bottom"
                            edge="bottom"
                            configs={layer.bottom.configs}
                            selection={selection}
                            onSelect={onSelection}
                            onChange={(configs) => patchEdge('bottom', { configs })}
                        />
                    </>
                )}
                {selection && selectedConfigs ? (
                    <SelectedKeyframe
                        config={selectedConfigs[selection.index]}
                        count={selectedConfigs.length}
                        onChange={(config) =>
                            setSelectedConfigs(selectedConfigs.map((c, i) => (i === selection.index ? config : c)))
                        }
                        onDuplicate={() => {
                            const c = selectedConfigs[selection.index];
                            setSelectedConfigs([
                                ...selectedConfigs.slice(0, selection.index + 1),
                                { left: [...c.left], right: [...c.right] },
                                ...selectedConfigs.slice(selection.index + 1),
                            ]);
                            onSelection({ ...selection, index: selection.index + 1 });
                        }}
                        onRemove={() => {
                            setSelectedConfigs(selectedConfigs.filter((_, i) => i !== selection.index));
                            onSelection(null);
                        }}
                    />
                ) : (
                    <p className="text-[10px] leading-relaxed text-zinc-400">
                        pick a keyframe chip to pin and edit it — drag the anchors and handles on the canvas. 1
                        keyframe is static, 2 blend linearly, 3+ flow through a smooth spline.
                    </p>
                )}
                <Toggle label="onion skin (all keyframes)" checked={onion} onChange={onOnion} />
            </Group>

            <Group title="motion">
                <Row label="scroll">
                    <select
                        value={
                            scrollPresets.find((p) => p.start === layer.scrollStart && p.end === layer.scrollEnd)
                                ?.label ?? 'custom'
                        }
                        onChange={(e) => {
                            const preset = scrollPresets.find((p) => p.label === e.target.value);
                            if (preset) patch({ scrollStart: preset.start, scrollEnd: preset.end });
                        }}
                        className={cn(inputCls, 'w-full')}
                    >
                        <option value="custom" disabled>
                            custom
                        </option>
                        {scrollPresets.map((p) => (
                            <option key={p.label} value={p.label}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </Row>
                <div className="grid grid-cols-[4.5rem_1fr_1fr] items-center gap-2 text-[11px]">
                    <span className="text-zinc-500">offsets</span>
                    {(['scrollStart', 'scrollEnd'] as const).map((key) => (
                        <input
                            key={key}
                            type="text"
                            value={layer[key]}
                            title={key === 'scrollStart' ? 'start offset' : 'end offset'}
                            onChange={(e) => patch({ [key]: e.target.value })}
                            spellCheck={false}
                            className={cn(inputCls, 'w-full')}
                        />
                    ))}
                </div>
            </Group>

            <Group title="appearance">
                <ColorRow label="fill" value={layer.fill} onChange={(fill) => patch({ fill })} palette={palette} />
                <SliderRow label="blur" value={layer.blur} min={0} max={120} step={1} onChange={(blur) => patch({ blur })} />
                <SliderRow
                    label="dissolve"
                    value={layer.dissolve}
                    min={0}
                    max={1000}
                    step={10}
                    onChange={(dissolve) => patch({ dissolve })}
                />
                {layer.dissolve > 0 && (
                    <SliderRow
                        label="grain size"
                        value={layer.dissolveSize}
                        min={1}
                        max={8}
                        step={0.5}
                        onChange={(dissolveSize) => patch({ dissolveSize })}
                    />
                )}
                <Segmented
                    label="feather"
                    options={['none', 'top', 'bottom', 'both'] as const}
                    value={layer.featheredOut}
                    onChange={(featheredOut) => patch({ featheredOut })}
                />
                {layer.mode === 'wave' && (
                    <Toggle label="flip (fill from bottom)" checked={layer.flip} onChange={(flip) => patch({ flip })} />
                )}
                <Toggle label="debug" checked={layer.debug} onChange={(debug) => patch({ debug })} />
            </Group>

            {layer.mode === 'wave' ? (
                <Group title="decorative curves">
                    {blurHint}
                    <ColorRow
                        label="stroke"
                        value={layer.strokeStyle}
                        onChange={(strokeStyle) => patch({ strokeStyle })}
                        palette={palette}
                    />
                    <SliderRow
                        label="width"
                        value={layer.strokeWidth}
                        min={0}
                        max={4}
                        step={0.1}
                        onChange={(strokeWidth) => patch({ strokeWidth })}
                    />
                    <SliderRow
                        label="amount"
                        value={layer.curveAmount}
                        min={0}
                        max={24}
                        step={1}
                        onChange={(curveAmount) => patch({ curveAmount })}
                    />
                    <SliderRow
                        label="offset left"
                        value={layer.offsetLeft}
                        min={-150}
                        max={150}
                        step={1}
                        onChange={(offsetLeft) => patch({ offsetLeft })}
                    />
                    <SliderRow
                        label="offset right"
                        value={layer.offsetRight}
                        min={-150}
                        max={150}
                        step={1}
                        onChange={(offsetRight) => patch({ offsetRight })}
                    />
                </Group>
            ) : (
                (['top', 'bottom'] as const).map((key) => (
                    <Group key={key} title={`${key} edge strokes`}>
                        {blurHint}
                        <ColorRow
                            label="stroke"
                            value={layer[key].strokeStyle}
                            onChange={(strokeStyle) => patchEdge(key, { strokeStyle })}
                            palette={palette}
                        />
                        <SliderRow
                            label="width"
                            value={layer[key].strokeWidth}
                            min={0}
                            max={4}
                            step={0.1}
                            onChange={(strokeWidth) => patchEdge(key, { strokeWidth })}
                        />
                        <SliderRow
                            label="fan amount"
                            value={layer[key].curveAmount}
                            min={0}
                            max={24}
                            step={1}
                            onChange={(curveAmount) => patchEdge(key, { curveAmount })}
                        />
                        <SliderRow
                            label="offset left"
                            value={layer[key].offsetLeft}
                            min={-150}
                            max={150}
                            step={1}
                            onChange={(offsetLeft) => patchEdge(key, { offsetLeft })}
                        />
                        <SliderRow
                            label="offset right"
                            value={layer[key].offsetRight}
                            min={-150}
                            max={150}
                            step={1}
                            onChange={(offsetRight) => patchEdge(key, { offsetRight })}
                        />
                    </Group>
                ))
            )}
        </>
    );
}
