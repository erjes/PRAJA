import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { Clock } from 'lucide-react';

interface TimePickerProps {
    id?: string;
    value?: string; // in 'HH:mm' 24-hour format, e.g. "08:00" or "17:30"
    onChange?: (time24: string) => void;
    label?: string;
    className?: string;
}

export function TimePicker({
    id,
    value = '08:00',
    onChange,
    label,
    className = '',
}: TimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Parse incoming HH:mm 24h into 12h parts
    const parse24To12 = (val: string) => {
        if (!val || !val.includes(':')) {
            return { hour: '08', minute: '00', period: 'AM' as 'AM' | 'PM' };
        }
        const [hStr, mStr] = val.split(':');
        let h24 = parseInt(hStr, 10);
        if (isNaN(h24)) h24 = 8;
        const m = mStr ? mStr.slice(0, 2) : '00';

        const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;

        return {
            hour: String(h12).padStart(2, '0'),
            minute: String(m).padStart(2, '0'),
            period,
        };
    };

    const initial = parse24To12(value);
    const [hour, setHour] = useState<string>(initial.hour);
    const [minute, setMinute] = useState<string>(initial.minute);
    const [period, setPeriod] = useState<'AM' | 'PM'>(initial.period);
    const [activeField, setActiveField] = useState<'hour' | 'minute'>('hour');

    const hourInputRef = useRef<HTMLInputElement>(null);
    const minuteInputRef = useRef<HTMLInputElement>(null);

    // Sync with external value changes when dialog opens
    useEffect(() => {
        if (isOpen) {
            const parsed = parse24To12(value);
            setHour(parsed.hour);
            setMinute(parsed.minute);
            setPeriod(parsed.period);
            setActiveField('hour');
            setTimeout(() => {
                hourInputRef.current?.select();
            }, 50);
        }
    }, [isOpen, value]);

    const format12To24 = (h12Str: string, mStr: string, p: 'AM' | 'PM') => {
        let h = parseInt(h12Str, 10);
        if (isNaN(h) || h < 1) h = 12;
        if (h > 12) h = 12;

        let m = parseInt(mStr, 10);
        if (isNaN(m) || m < 0) m = 0;
        if (m > 59) m = 59;

        if (p === 'PM' && h < 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;

        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw.length === 0) {
            setHour('');
            return;
        }

        const num = parseInt(raw, 10);
        if (num > 12) {
            // If user typed e.g. 15, clamp to 12
            setHour('12');
            setActiveField('minute');
            minuteInputRef.current?.select();
            return;
        }

        const formatted = String(num);
        setHour(formatted);

        // If two digits entered or first digit >= 2 (since max hour is 12)
        if (raw.length === 2 || num > 1) {
            setHour(String(num).padStart(2, '0'));
            setActiveField('minute');
            setTimeout(() => {
                minuteInputRef.current?.select();
            }, 10);
        }
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw.length === 0) {
            setMinute('');
            return;
        }

        const num = parseInt(raw, 10);
        if (num > 59) {
            setMinute('59');
            return;
        }

        setMinute(String(num));

        if (raw.length === 2 || num > 5) {
            setMinute(String(num).padStart(2, '0'));
        }
    };

    const handleHourBlur = () => {
        let num = parseInt(hour, 10);
        if (isNaN(num) || num < 1) num = 12;
        if (num > 12) num = 12;
        setHour(String(num).padStart(2, '0'));
    };

    const handleMinuteBlur = () => {
        let num = parseInt(minute, 10);
        if (isNaN(num) || num < 0) num = 0;
        if (num > 59) num = 59;
        setMinute(String(num).padStart(2, '0'));
    };

    const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let num = parseInt(hour, 10) || 12;
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            num = num >= 12 ? 1 : num + 1;
            setHour(String(num).padStart(2, '0'));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            num = num <= 1 ? 12 : num - 1;
            setHour(String(num).padStart(2, '0'));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleOk();
        }
    };

    const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        let num = parseInt(minute, 10) || 0;
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            num = num >= 59 ? 0 : num + 1;
            setMinute(String(num).padStart(2, '0'));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            num = num <= 0 ? 59 : num - 1;
            setMinute(String(num).padStart(2, '0'));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleOk();
        }
    };

    const handleOk = () => {
        let finalH = parseInt(hour, 10);
        if (isNaN(finalH) || finalH < 1) finalH = 12;
        if (finalH > 12) finalH = 12;

        let finalM = parseInt(minute, 10);
        if (isNaN(finalM) || finalM < 0) finalM = 0;
        if (finalM > 59) finalM = 59;

        const time24 = format12To24(
            String(finalH).padStart(2, '0'),
            String(finalM).padStart(2, '0'),
            period
        );

        if (onChange) {
            onChange(time24);
        }
        setIsOpen(false);
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    // Format for display button
    const current12 = parse24To12(value);
    const displayFormatted = `${current12.hour}:${current12.minute} ${current12.period} (${value})`;

    return (
        <div className="w-full">
            {/* Trigger Button */}
            <button
                type="button"
                id={id}
                onClick={() => setIsOpen(true)}
                className={`w-full h-11 flex items-center justify-between px-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50/80 focus:border-[#890A00] focus:ring-1 focus:ring-[#890A00] transition-all text-xs font-normal text-gray-800 shadow-2xs ${className}`}
            >
                <div className="flex items-center gap-2.5">
                    <Clock className="size-4 text-[#890A00] shrink-0" />
                    <span className="font-bold text-gray-900 text-sm">
                        {current12.hour}:{current12.minute}
                    </span>
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {current12.period}
                    </span>
                </div>

                <span className="text-[11px] font-bold text-[#890A00] bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors">
                    Pilih Jam
                </span>
            </button>

            {/* Time Picker Dialog UI matching the Material 3 reference with #890A00 */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[340px] p-0 border-0 bg-transparent shadow-none overflow-visible [&>button]:hidden">
                    <div className="bg-[#f7f6f8] border border-gray-200/90 rounded-[28px] p-6 shadow-2xl w-full max-w-[340px] mx-auto select-none animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Title */}
                        <div className="text-xs font-bold text-gray-700 tracking-wide mb-5">
                            {label || 'Enter time'}
                        </div>

                        {/* Digits & AM/PM Container */}
                        <div className="flex items-start justify-center gap-2 mb-2">
                            {/* Hour Box */}
                            <div className="flex flex-col items-center">
                                <div
                                    onClick={() => {
                                        setActiveField('hour');
                                        hourInputRef.current?.select();
                                    }}
                                    className={`w-24 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
                                        activeField === 'hour'
                                            ? 'bg-[#890A00]/15 border-2 border-[#890A00] text-[#890A00]'
                                            : 'bg-gray-200/70 hover:bg-gray-200 border-2 border-transparent text-gray-900'
                                    }`}
                                >
                                    <input
                                        ref={hourInputRef}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={hour}
                                        onChange={handleHourChange}
                                        onBlur={handleHourBlur}
                                        onFocus={() => setActiveField('hour')}
                                        onKeyDown={handleHourKeyDown}
                                        className="w-full text-center bg-transparent text-5xl font-normal outline-none focus:outline-none cursor-pointer select-all caret-[#890A00]"
                                    />
                                </div>
                                <span className="text-xs font-normal text-gray-500 mt-2">Hour</span>
                            </div>

                            {/* Separator Colon */}
                            <div className="text-4xl font-bold text-gray-900 h-20 flex items-center px-0.5 select-none">
                                :
                            </div>

                            {/* Minute Box */}
                            <div className="flex flex-col items-center">
                                <div
                                    onClick={() => {
                                        setActiveField('minute');
                                        minuteInputRef.current?.select();
                                    }}
                                    className={`w-24 h-20 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
                                        activeField === 'minute'
                                            ? 'bg-[#890A00]/15 border-2 border-[#890A00] text-[#890A00]'
                                            : 'bg-gray-200/70 hover:bg-gray-200 border-2 border-transparent text-gray-900'
                                    }`}
                                >
                                    <input
                                        ref={minuteInputRef}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={minute}
                                        onChange={handleMinuteChange}
                                        onBlur={handleMinuteBlur}
                                        onFocus={() => setActiveField('minute')}
                                        onKeyDown={handleMinuteKeyDown}
                                        className="w-full text-center bg-transparent text-5xl font-normal outline-none focus:outline-none cursor-pointer select-all caret-[#890A00]"
                                    />
                                </div>
                                <span className="text-xs font-normal text-gray-500 mt-2">Minute</span>
                            </div>

                            {/* AM / PM Toggle */}
                            <div className="flex flex-col w-14 h-20 rounded-2xl border border-gray-300 overflow-hidden shrink-0 ml-1">
                                <button
                                    type="button"
                                    onClick={() => setPeriod('AM')}
                                    className={`flex-1 text-xs transition-colors flex items-center justify-center ${
                                        period === 'AM'
                                            ? 'bg-[#890A00]/20 text-[#890A00] font-bold border-b border-gray-300'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 font-normal border-b border-gray-300'
                                    }`}
                                >
                                    AM
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPeriod('PM')}
                                    className={`flex-1 text-xs transition-colors flex items-center justify-center ${
                                        period === 'PM'
                                            ? 'bg-[#890A00]/20 text-[#890A00] font-bold'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 font-normal'
                                    }`}
                                >
                                    PM
                                </button>
                            </div>
                        </div>

                        {/* Bottom Actions Bar */}
                        <div className="flex items-center justify-between pt-4 mt-2">
                            <div className="text-[#890A00] p-1">
                                <Clock className="size-5 text-[#890A00]" />
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="text-xs font-bold text-[#890A00] hover:bg-[#890A00]/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleOk}
                                    className="text-xs font-bold text-[#890A00] hover:bg-[#890A00]/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default TimePicker;
