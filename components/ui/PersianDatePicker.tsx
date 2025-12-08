
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Clock, X } from 'lucide-react';
import { toJalaali, toGregorian, jalaaliMonthLength, PERSIAN_MONTHS } from '../../utils/date';

interface PersianDatePickerProps {
  value?: string; // ISO String
  onChange: (isoDate: string) => void;
  label?: string;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize View State (Jalali)
  const initialDate = value ? new Date(value) : new Date();
  const jInitial = toJalaali(initialDate.getFullYear(), initialDate.getMonth() + 1, initialDate.getDate());

  const [viewYear, setViewYear] = useState(jInitial.jy);
  const [viewMonth, setViewMonth] = useState(jInitial.jm); // 1-12
  const [selectedDay, setSelectedDay] = useState(jInitial.jd);
  
  // Time State
  const [hour, setHour] = useState(initialDate.getHours());
  const [minute, setMinute] = useState(initialDate.getMinutes());

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update internal state if prop changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
      setViewYear(j.jy);
      setViewMonth(j.jm);
      setSelectedDay(j.jd);
      setHour(d.getHours());
      setMinute(d.getMinutes());
    }
  }, [value]);

  const handleMonthChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (viewMonth === 12) {
        setViewYear(viewYear + 1);
        setViewMonth(1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else {
      if (viewMonth === 1) {
        setViewYear(viewYear - 1);
        setViewMonth(12);
      } else {
        setViewMonth(viewMonth - 1);
      }
    }
  };

  const handleDateSelect = (day: number) => {
    setSelectedDay(day);
    updateMainValue(viewYear, viewMonth, day, hour, minute);
  };

  const handleTimeChange = (type: 'hour' | 'minute', val: number) => {
    let newVal = val;
    if (type === 'hour') {
      if (val > 23) newVal = 0;
      if (val < 0) newVal = 23;
      setHour(newVal);
      updateMainValue(viewYear, viewMonth, selectedDay, newVal, minute);
    } else {
      if (val > 59) newVal = 0;
      if (val < 0) newVal = 59;
      setMinute(newVal);
      updateMainValue(viewYear, viewMonth, selectedDay, hour, newVal);
    }
  };

  const updateMainValue = (jy: number, jm: number, jd: number, h: number, m: number) => {
    const g = toGregorian(jy, jm, jd);
    // Create Date object
    const date = new Date(g.gy, g.gm - 1, g.gd, h, m);
    // Format to ISO string for storage, but we need to respect local time offset for simpler handling in this context
    // Or just construct an ISO string manually to avoid timezone shifting issues if not desired.
    // Here we use standard ISO which converts to UTC.
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
    onChange(localISOTime); // Send simplified ISO without Z, treated as local
  };

  // Generate Calendar Grid
  const daysInMonth = jalaaliMonthLength(viewYear, viewMonth);
  // Calculate day of week for the 1st of the month
  // 1. Convert 1st of Jalali month to Gregorian
  const gFirst = toGregorian(viewYear, viewMonth, 1);
  const dateFirst = new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd);
  // JS Day: 0=Sun, 1=Mon, ..., 6=Sat
  // Persian Week: 0=Sat, 1=Sun, ..., 6=Fri
  // Mapping: JS(6)->0, JS(0)->1, JS(1)->2 ...
  let startDayOfWeek = (dateFirst.getDay() + 1) % 7; 

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: startDayOfWeek }, (_, i) => i);

  // Format Display
  const displayDate = `${viewYear}/${viewMonth.toString().padStart(2, '0')}/${selectedDay.toString().padStart(2, '0')} - ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer hover:border-primary-500 transition-colors"
      >
        <span className="text-gray-900 dark:text-white font-mono ltr text-sm">{value ? displayDate : 'انتخاب تاریخ'}</span>
        <Calendar size={18} className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
            <button type="button" onClick={() => handleMonthChange('prev')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronRight size={16} /></button>
            <div className="font-bold text-gray-800 dark:text-white">
              {PERSIAN_MONTHS[viewMonth - 1]} <span className="text-gray-500 text-sm">{viewYear}</span>
            </div>
            <button type="button" onClick={() => handleMonthChange('next')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><ChevronLeft size={16} /></button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4 text-center">
             {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(d => (
               <span key={d} className="text-xs text-gray-400 font-bold">{d}</span>
             ))}
             {blanksArray.map(b => <span key={`b-${b}`}></span>)}
             {daysArray.map(d => (
               <button
                 key={d}
                 type="button"
                 onClick={() => handleDateSelect(d)}
                 className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors ${
                    selectedDay === d && viewMonth === jInitial.jm && viewYear === jInitial.jy
                      ? 'bg-primary-600 text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                 }`}
               >
                 {d}
               </button>
             ))}
          </div>

          {/* Time Picker */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
             <div className="flex items-center justify-center gap-2">
                <Clock size={16} className="text-primary-500" />
                <span className="text-xs text-gray-500">ساعت و دقیقه:</span>
             </div>
             <div className="flex items-center justify-center gap-2 mt-2 ltr">
                <div className="flex flex-col items-center">
                   <button type="button" onClick={() => handleTimeChange('hour', hour + 1)}><ChevronUp size={12} /></button>
                   <input 
                      type="number" 
                      value={hour}
                      onChange={e => handleTimeChange('hour', parseInt(e.target.value))}
                      className="w-10 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded p-1 text-sm"
                   />
                   <button type="button" onClick={() => handleTimeChange('hour', hour - 1)}><ChevronDown size={12} /></button>
                </div>
                <span className="font-bold">:</span>
                <div className="flex flex-col items-center">
                   <button type="button" onClick={() => handleTimeChange('minute', minute + 1)}><ChevronUp size={12} /></button>
                   <input 
                      type="number" 
                      value={minute}
                      onChange={e => handleTimeChange('minute', parseInt(e.target.value))}
                      className="w-10 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded p-1 text-sm"
                   />
                   <button type="button" onClick={() => handleTimeChange('minute', minute - 1)}><ChevronDown size={12} /></button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ChevronUp = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);
const ChevronDown = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);
