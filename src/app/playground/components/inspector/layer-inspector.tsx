'use client';

import type { WaveConfig } from '@threeaio/smooth-waves';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';
import { useComposer, useComposerDispatch } from '../../composer-context';
import { scrollPresets, type EdgeState, type LayerState } from '../../defaults';
import { BLUR_HIDES_STROKES } from '../../figma-export';
import { ColorField, Field, FieldRow, inputCls, Section, Segmented, SliderField, Toggle } from '../../ui';
import { useView } from '../../view-context';
import type { Selection } from '../curve-overlay';
import { KeyframeChips } from './keyframe-chips';
import { SelectedKeyframe } from './selected-keyframe';

export function LayerInspector({ layer }: { layer: LayerState }) {
    const { selection, palette } = useComposer();
    const dispatch = useComposerDispatch();
    const { onion, setOnion } = useView();

    const patch = (partial: Partial<LayerState>) => dispatch({ type: 'layer/patch', partial });
    const patchEdge = (edge: 'top' | 'bottom', partial: Partial<EdgeState>) =>
        dispatch({ type: 'layer/patch-edge', edge, partial });
    const onSelection = (selection: Selection | null) => dispatch({ type: 'selection/set', selection });

    const selectedConfigs =
        selection?.edge === 'wave' ? layer.configs : selection ? layer[selection.edge].configs : null;
    const setSelectedConfigs = (configs: WaveConfig[]) => {
        if (!selection) return;
        if (selection.edge === 'wave') patch({ configs });
        else patchEdge(selection.edge, { configs });
    };
    const blurHint = layer.blur > BLUR_HIDES_STROKES && (
        <p className="font-sans text-3xs leading-relaxed text-ed-text-muted">
            not rendered — invisible under this layer&apos;s {layer.blur}px blur
        </p>
    );

    return (
        <>
            <Section title={`keyframes · ${layer.mode}`}>
                {/* end editing and show the scroll-driven interpolation; doubles as a mode indicator */}
                <Button icon={Play} selected={!selection} onClick={() => onSelection(null)} className="w-full">
                    {selection ? 'show live result' : 'live result'}
                </Button>
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
                    <p className="font-sans text-3xs leading-relaxed text-ed-text-muted">
                        pick a keyframe chip to pin and edit it — drag the anchors and handles on the canvas. 1
                        keyframe is static, 2 blend linearly, 3+ flow through a smooth spline.
                    </p>
                )}
                <Toggle label="onion skin (all keyframes)" checked={onion} onChange={setOnion} />
            </Section>

            <Section title="motion">
                <Field label="scroll">
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
                </Field>
                <div className="grid grid-cols-[5rem_1fr_1fr] items-center gap-2 text-2xs">
                    <span className="text-ed-text-muted">offsets</span>
                    {(['scrollStart', 'scrollEnd'] as const).map((key) => (
                        <input
                            key={key}
                            type="text"
                            value={layer[key]}
                            title={key === 'scrollStart' ? 'start offset' : 'end offset'}
                            aria-label={key === 'scrollStart' ? 'start offset' : 'end offset'}
                            onChange={(e) => patch({ [key]: e.target.value })}
                            spellCheck={false}
                            className={cn(inputCls, 'w-full')}
                        />
                    ))}
                </div>
            </Section>

            <Section title="appearance">
                <ColorField label="fill" value={layer.fill} onChange={(fill) => patch({ fill })} palette={palette} />
                <SliderField
                    label="blur"
                    value={layer.blur}
                    min={0}
                    max={120}
                    step={1}
                    onChange={(blur) => patch({ blur })}
                />
                <SliderField
                    label="dissolve"
                    value={layer.dissolve}
                    min={0}
                    max={1000}
                    step={10}
                    onChange={(dissolve) => patch({ dissolve })}
                />
                {layer.dissolve > 0 && (
                    <SliderField
                        label="grain size"
                        value={layer.dissolveSize}
                        min={1}
                        max={8}
                        step={0.5}
                        onChange={(dissolveSize) => patch({ dissolveSize })}
                    />
                )}
                <FieldRow label="feather">
                    <Segmented
                        options={['none', 'top', 'bottom', 'both'] as const}
                        value={layer.featheredOut}
                        onChange={(featheredOut) => patch({ featheredOut })}
                        aria-label="feather"
                    />
                </FieldRow>
                {layer.featheredOut !== 'none' && (
                    <SliderField
                        label="feather px"
                        value={layer.featherDepth}
                        min={0}
                        max={2000}
                        step={10}
                        onChange={(featherDepth) => patch({ featherDepth })}
                    />
                )}
                {layer.mode === 'wave' && (
                    <Toggle label="flip (fill from bottom)" checked={layer.flip} onChange={(flip) => patch({ flip })} />
                )}
                <Toggle label="debug" checked={layer.debug} onChange={(debug) => patch({ debug })} />
            </Section>

            {layer.mode === 'wave' ? (
                <Section title="decorative curves">
                    {blurHint}
                    <ColorField
                        label="stroke"
                        value={layer.strokeStyle}
                        onChange={(strokeStyle) => patch({ strokeStyle })}
                        palette={palette}
                    />
                    <SliderField
                        label="width"
                        value={layer.strokeWidth}
                        min={0}
                        max={4}
                        step={0.1}
                        onChange={(strokeWidth) => patch({ strokeWidth })}
                    />
                    <SliderField
                        label="amount"
                        value={layer.curveAmount}
                        min={0}
                        max={24}
                        step={1}
                        onChange={(curveAmount) => patch({ curveAmount })}
                    />
                    <SliderField
                        label="offset left"
                        value={layer.offsetLeft}
                        min={-150}
                        max={150}
                        step={1}
                        onChange={(offsetLeft) => patch({ offsetLeft })}
                    />
                    <SliderField
                        label="offset right"
                        value={layer.offsetRight}
                        min={-150}
                        max={150}
                        step={1}
                        onChange={(offsetRight) => patch({ offsetRight })}
                    />
                </Section>
            ) : (
                (['top', 'bottom'] as const).map((key) => (
                    <Section key={key} title={`${key} edge strokes`}>
                        {blurHint}
                        <ColorField
                            label="stroke"
                            value={layer[key].strokeStyle}
                            onChange={(strokeStyle) => patchEdge(key, { strokeStyle })}
                            palette={palette}
                        />
                        <SliderField
                            label="width"
                            value={layer[key].strokeWidth}
                            min={0}
                            max={4}
                            step={0.1}
                            onChange={(strokeWidth) => patchEdge(key, { strokeWidth })}
                        />
                        <SliderField
                            label="fan amount"
                            value={layer[key].curveAmount}
                            min={0}
                            max={24}
                            step={1}
                            onChange={(curveAmount) => patchEdge(key, { curveAmount })}
                        />
                        <SliderField
                            label="offset left"
                            value={layer[key].offsetLeft}
                            min={-150}
                            max={150}
                            step={1}
                            onChange={(offsetLeft) => patchEdge(key, { offsetLeft })}
                        />
                        <SliderField
                            label="offset right"
                            value={layer[key].offsetRight}
                            min={-150}
                            max={150}
                            step={1}
                            onChange={(offsetRight) => patchEdge(key, { offsetRight })}
                        />
                    </Section>
                ))
            )}
        </>
    );
}
