import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  disabled = false,
  options = [], // For select input
  rows = 3 // For textarea
}) => {
  const inputClass = `w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50/20'
      : 'border-slate-300 focus:border-primary-500 focus:ring-primary-100 bg-white'
  } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'text-slate-900'}`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClass}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={inputClass}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClass}
        />
      )}

      {helperText && !error && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormInput;
