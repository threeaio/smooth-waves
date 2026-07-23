'use client';

import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { useComposer, useComposerDispatch } from '../../composer-context';
import { palettePresets } from '../../defaults';
import { toStackSnippet } from '../../snippets';
import { ColorField, Field, fieldGrid, inputCls, NumberField, Section, SliderField, Toggle, toSwatchHex } from '../../ui';
import type { PagePatch } from '../../composer-reducer';

export function PageInspector() {
    const { layers, palette, pageBg, sectionPx, bleedX, grainOn, spaceBefore, spaceAfter } = useComposer();
    const dispatch = useComposerDispatch();
    const patchPage = (partial: PagePatch) => dispatch({ type: 'page/patch', partial });
    const applyPalette = (next: string[]) => dispatch({ type: 'palette/apply', palette: next });

    // the whole visible stack as a ready-to-paste JSX snippet
    const code = useMemo(() => toStackSnippet(layers, sectionPx, bleedX), [layers, sectionPx, bleedX]);

    return (
        <>
            <Section title="palette">
                <Field label="preset">
                    <select
                        value={palettePresets.find((p) => p.colors.every((c, i) => c === palette[i]))?.name ?? 'custom'}
                        onChange={(e) => {
                            const preset = palettePresets.find((p) => p.name === e.target.value);
                            if (preset) applyPalette([...preset.colors]);
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
                </Field>
                <div className={fieldGrid}>
                    <span />
                    <div className="flex min-w-0 items-center gap-1.5">
                        {/* swatches shrink below 24px when the palette is long — the copy button keeps its size */}
                        {palette.map((color, i) => (
                            <input
                                key={i}
                                type="color"
                                value={toSwatchHex(color)}
                                title={color}
                                aria-label={`palette color ${i + 1}`}
                                onChange={(e) => applyPalette(palette.map((c, j) => (j === i ? e.target.value : c)))}
                                suppressHydrationWarning
                                className="h-6 w-6 min-w-0 flex-1 cursor-pointer rounded-md border border-ed-border bg-transparent"
                                style={{ maxWidth: 24 }}
                            />
                        ))}
                        <CopyButton
                            textToCopy={`[${palette.map((c) => `'${c}'`).join(', ')}]`}
                            variant="framed"
                            aria-label="copy palette as array"
                            className="ml-auto shrink-0"
                        />
                    </div>
                </div>
            </Section>
            <Section title="page">
                <ColorField
                    label="background"
                    value={pageBg}
                    onChange={(pageBg) => patchPage({ pageBg })}
                    palette={palette}
                />
                <Field label="section px">
                    <NumberField
                        value={sectionPx}
                        min={200}
                        max={20000}
                        step={10}
                        onChange={(sectionPx) => patchPage({ sectionPx })}
                    />
                </Field>
                <SliderField
                    label="bleed x %"
                    value={bleedX}
                    min={0}
                    max={40}
                    step={1}
                    onChange={(bleedX) => patchPage({ bleedX })}
                />
                <Toggle label="grain overlay" checked={grainOn} onChange={(grainOn) => patchPage({ grainOn })} />
                <Toggle
                    label="space before waves"
                    checked={spaceBefore}
                    onChange={(spaceBefore) => patchPage({ spaceBefore })}
                />
                <Toggle
                    label="space after waves"
                    checked={spaceAfter}
                    onChange={(spaceAfter) => patchPage({ spaceAfter })}
                />
            </Section>
            <Section title="code">
                <div className="relative">
                    <pre className="max-h-80 overflow-auto rounded-lg border border-ed-hairline bg-ed-code p-2 text-3xs leading-relaxed text-zinc-300">
                        {code}
                    </pre>
                    <CopyButton
                        textToCopy={code}
                        variant="overlay"
                        aria-label="copy jsx snippet"
                        className="absolute right-1.5 top-1.5"
                    />
                </div>
                {/* the snippet imports Wave/WaveBand — tell people where those come from.
                    Inverted like the code block so it reads as part of the handoff, not as a footnote. */}
                <div className="flex items-center justify-between gap-2 rounded-lg bg-ed-code px-3 py-2">
                    <code className="truncate text-2xs text-zinc-100">npm i @threeaio/smooth-waves</code>
                    <CopyButton
                        textToCopy="npm i @threeaio/smooth-waves"
                        variant="overlay"
                        aria-label="copy install command"
                        className="shrink-0"
                    />
                </div>
            </Section>
        </>
    );
}
