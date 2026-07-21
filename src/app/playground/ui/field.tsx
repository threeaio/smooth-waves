import { round } from '../defaults';
import { NumberField } from './number-field';
import { Slider } from './slider';

/** The inspector's two-column rhythm: fixed label rail + flexible control. */
export const fieldGrid = 'grid grid-cols-[5rem_1fr] items-center gap-2';

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className={`${fieldGrid} text-2xs text-ed-text`}>
            <span className="truncate text-ed-text-muted">{label}</span>
            {children}
        </label>
    );
}

export function SliderField({
    label,
    value,
    min,
    max,
    step,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}) {
    return (
        <div className="grid grid-cols-[5rem_1fr_2.5rem] items-center gap-2 text-2xs text-ed-text">
            <span className="truncate text-ed-text-muted">{label}</span>
            <Slider value={value} min={min} max={max} step={step} onChange={onChange} />
            <NumberField value={round(value)} min={min} max={max} step={step} onChange={onChange} />
        </div>
    );
}

/** A labeled segmented/other control that isn't a <label> target (multiple buttons inside). */
export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className={`${fieldGrid} text-2xs text-ed-text`}>
            <span className="truncate text-ed-text-muted">{label}</span>
            {children}
        </div>
    );
}
