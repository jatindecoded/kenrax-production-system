'use client';

import { ValidationError } from '@/lib/validation';

interface FormErrorProps {
  errors: ValidationError[];
  field: string;
}

export function FormError({ errors, field }: FormErrorProps) {
  const error = errors.find((e) => e.field === field);
  if (!error) return null;

  return <p className="mt-1 text-sm text-red-600">{error.message}</p>;
}

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormLabel({ htmlFor, children, required = false }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function FormInput({ hasError = false, className = '', ...props }: FormInputProps) {
  return (
    <input
      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...props}
    />
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function FormTextarea({ hasError = false, className = '', ...props }: FormTextareaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...props}
    />
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: Array<{ value: string | number; label: string }>;
}

export function FormSelect({ hasError = false, className = '', options, ...props }: FormSelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } ${className}`}
      {...props}
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface FormRadioGroupProps {
  name: string;
  options: Array<{ value: string; label: string }>;
  selectedValue?: string;
  onChange?: (value: string) => void;
  hasError?: boolean;
}

export function FormRadioGroup({ name, options, selectedValue = '', onChange, hasError }: FormRadioGroupProps) {
  return (
    <div className={`space-y-2 ${hasError ? 'text-red-600' : ''}`}>
      {options.map((opt) => (
        <div key={opt.value} className="flex items-center">
          <input
            id={`${name}-${opt.value}`}
            type="radio"
            name={name}
            value={opt.value}
            checked={selectedValue === opt.value}
            onChange={(e) => onChange?.(e.target.value)}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`${name}-${opt.value}`} className="ml-2 block text-sm text-gray-700">
            {opt.label}
          </label>
        </div>
      ))}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
