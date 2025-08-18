// components/Inputs/SearchInput.tsx
import React from 'react';

interface SearchInputProps {
  value: string; // Axtarış sahəsinin cari dəyəri
  onChange: (value: string) => void; // Dəyər dəyişdikdə çağrılacaq funksiya
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Axtarış edin..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 outline-none rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      autoFocus
    />
  );
};

export default SearchInput;