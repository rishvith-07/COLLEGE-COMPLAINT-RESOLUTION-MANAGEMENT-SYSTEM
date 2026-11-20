/**
 * Safe error message extractor.
 * Converts API error responses into clean, user-friendly strings.
 * Guarantees that `[object Object]` is never displayed to the user.
 */
export function extractApiErrorMessage(err: any, defaultMessage: string = 'Operation failed.'): string {
  if (!err) return defaultMessage;

  const status = err.response?.status;
  if (status === 503) {
    return 'Database service is currently unavailable. Please try again in a few moments.';
  }
  if (status === 504 || err.code === 'ECONNABORTED' || (err.message && err.message.includes('timeout'))) {
    return 'Request timed out. Please check your internet connection and try again.';
  }

  const data = err.response?.data;
  if (data) {
    if (typeof data.message === 'string' && data.message.trim() && !data.message.includes('[object')) {
      return data.message;
    }
    if (typeof data.error === 'string' && data.error.trim() && !data.error.includes('[object')) {
      return data.error;
    }
    if (typeof data.message === 'object' && data.message !== null) {
      const nested = data.message.message || data.message.detail || data.message.error;
      if (typeof nested === 'string' && nested.trim() && !nested.includes('[object')) {
        return nested;
      }
    }
    if (typeof data.error === 'object' && data.error !== null) {
      const nested = data.error.message || data.error.detail;
      if (typeof nested === 'string' && nested.trim() && !nested.includes('[object')) {
        return nested;
      }
    }
    if (typeof data === 'string' && data.trim() && !data.includes('<!DOCTYPE') && !data.includes('[object')) {
      return data;
    }
  }

  if (status === 400) {
    return 'Please check all required fields and try again.';
  }
  if (status === 401) {
    return 'Invalid email or password.';
  }
  if (status === 409) {
    return 'An account with this email or Student ID already exists.';
  }
  if (status === 500) {
    return 'Server error processing request. Please try again later.';
  }

  if (typeof err.message === 'string' && err.message.trim() && !err.message.includes('[object')) {
    return err.message;
  }

  return defaultMessage;
}
