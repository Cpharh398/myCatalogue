import React, { useRef } from "react";

type NumberInputProps = {
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  unit?: string;
  hideUpDownArrow?:Boolean
};

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = "",
  unit,
  hideUpDownArrow
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const numericValue = Number(value) || 0;

  const handleIncrement = () => {
    const nextVal = numericValue + step;
    if (max !== undefined && nextVal > max) return;
    onChange(nextVal);
  };

  const handleDecrement = () => {
    const nextVal = numericValue - step;
    if (min !== undefined && nextVal < min) return;
    onChange(nextVal);
  };

  return (
    <div className={`relative flex items-center bg-[#2c2c2c] border border-[#383838] rounded px-1.5 py-1 text-[10px] text-white group ${className}`}>
      {/* Native Input with hidden default arrows */}
      <input
        ref={inputRef}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full bg-transparent outline-none text-right ${!hideUpDownArrow ? "pr-4": "" } appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />

      {unit && <span className="text-[#808080] ml-0.5 text-[9px]">{unit}</span>}


    {
      !hideUpDownArrow &&
          <div className="absolute right-1 flex flex-col justify-center h-full gap-px opacity-70 group-hover:opacity-100 transition-opacity">
        {/* Up Arrow */}
        <button
          type="button"
          tabIndex={-1}
          onClick={handleIncrement}
          className="cursor-pointer text-[#808080] hover:text-white transition-colors p-px leading-none"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Down Arrow */}
        <button
          type="button"
          tabIndex={-1}
          onClick={handleDecrement}
          className="cursor-pointer text-[#808080] hover:text-white transition-colors p-[1px] leading-none"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    }
   

  
    </div>
  );
}