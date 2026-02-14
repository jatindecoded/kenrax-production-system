/**
 * Form validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate product form data
 */
export function validateProduct(data: {
  part_number?: string;
  product_type?: string;
  description?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.part_number || data.part_number.trim().length === 0) {
    errors.push({ field: 'part_number', message: 'Part number is required' });
  } else if (data.part_number.trim().length < 2) {
    errors.push({ field: 'part_number', message: 'Part number must be at least 2 characters' });
  }

  if (!data.product_type) {
    errors.push({ field: 'product_type', message: 'Product type is required' });
  } else if (!['AIR_FILTER', 'OIL_FILTER', 'AIR_OIL_SEPARATOR'].includes(data.product_type)) {
    errors.push({ field: 'product_type', message: 'Product type must be AIR_FILTER, OIL_FILTER, or AIR_OIL_SEPARATOR' });
  }

  if (data.description && data.description.trim().length > 500) {
    errors.push({ field: 'description', message: 'Description must be 500 characters or less' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate batch form data
 */
export function validateBatch(data: {
  product_id?: string | number;
  quantity?: string | number;
  produced_by?: string;
  production_line?: string;
  remarks?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.product_id) {
    errors.push({ field: 'product_id', message: 'Please select a product' });
  }

  if (!data.quantity) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else {
    const qty = typeof data.quantity === 'string' ? parseInt(data.quantity, 10) : data.quantity;
    if (isNaN(qty) || qty <= 0) {
      errors.push({ field: 'quantity', message: 'Quantity must be a positive number' });
    }
  }

  if (data.remarks && data.remarks.trim().length > 500) {
    errors.push({ field: 'remarks', message: 'Remarks must be 500 characters or less' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationError[], field: string): string | null {
  const error = errors.find((e) => e.field === field);
  return error ? error.message : null;
}
