interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
}

export function CardHeader({ children }: CardHeaderProps) {
  return <div className="px-6 py-4 border-b border-gray-200">{children}</div>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
}

export function CardFooter({ children }: CardFooterProps) {
  return <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">{children}</div>;
}

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
}

export function Alert({ type, children }: AlertProps) {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div className={`border rounded-md p-4 ${typeStyles[type]}`} role="alert">
      {children}
    </div>
  );
}

interface TableProps {
  children: React.ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">{children}</table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50 border-b border-gray-200">
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

interface TableRowProps {
  children: React.ReactNode;
  isHeader?: boolean;
}

export function TableRow({ children, isHeader = false }: TableRowProps) {
  const baseStyles = isHeader ? 'bg-gray-50' : 'border-b border-gray-100 hover:bg-gray-50';
  return <tr className={baseStyles}>{children}</tr>;
}

interface TableCellProps {
  children: React.ReactNode;
  isHeader?: boolean;
  className?: string;
}

export function TableCell({ children, isHeader = false, className = '' }: TableCellProps) {
  const baseStyles = isHeader
    ? 'px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'
    : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';
  return <td className={`${baseStyles} ${className}`}>{children}</td>;
}
