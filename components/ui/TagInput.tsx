import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ value = [], onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const addTags = (rawInput: string) => {
    if (!rawInput) return;
    // Split by comma, trim whitespace, remove empty strings
    const newTags = rawInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Merge with existing tags and remove duplicates
    const uniqueTags = Array.from(new Set([...value, ...newTags]));
    onChange(uniqueTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTags(input);
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      // Remove last tag on backspace if input is empty
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    addTags(pastedData);
    setInput('');
  };

  const removeTag = (index: number) => {
    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  return (
    <div className="w-full flex flex-wrap gap-2 px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:border-primary-500/30 focus-within:ring-4 focus-within:ring-primary-500/10 transition-all duration-300 min-h-[56px] items-center">
      {value.map((tag, index) => (
        <span 
          key={index} 
          className="flex items-center gap-1.5 bg-white dark:bg-gray-800 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm border border-gray-100 dark:border-gray-700 animate-fadeIn"
        >
          {tag}
          <button 
            type="button" 
            onClick={() => removeTag(index)}
            className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none bg-gray-100 dark:bg-gray-700 rounded-full p-0.5"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input 
        type="text" 
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 bg-transparent min-w-[120px] outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 h-8 text-sm font-medium"
      />
    </div>
  );
};