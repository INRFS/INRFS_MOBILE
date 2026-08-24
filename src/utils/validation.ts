/**
 * Input validation helpers for INRFS Mobile Application
 */

export const validation = {
  isValidInvestorId: (id?: string | null): boolean => {
    return Boolean(id && id.trim().length >= 3);
  },

  isValidPassword: (password?: string | null): boolean => {
    return Boolean(password && password.length >= 1);
  },

  isValidAmount: (
    amount: number,
    min: number = 10000,
    max: number = 2500000,
  ): {isValid: boolean; error?: string} => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return {isValid: false, error: 'Please enter a valid investment amount.'};
    }
    if (amount < min) {
      return {
        isValid: false,
        error: `Investment amount must be at least ₹${min.toLocaleString('en-IN')}.`,
      };
    }
    if (amount > max) {
      return {
        isValid: false,
        error: `Investment amount cannot exceed ₹${max.toLocaleString('en-IN')}.`,
      };
    }
    return {isValid: true};
  },

  isValidMobile: (mobile?: string | null): {isValid: boolean; error?: string} => {
    if (!mobile || !mobile.trim()) {
      return {isValid: false, error: 'Mobile number cannot be empty.'};
    }
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 20) {
      return {isValid: false, error: 'Please enter a valid mobile number (10-20 digits).'};
    }
    return {isValid: true};
  },

  isValidEmail: (email?: string | null): {isValid: boolean; error?: string} => {
    if (!email || !email.trim()) return {isValid: true}; // Optional
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return valid
      ? {isValid: true}
      : {isValid: false, error: 'Please enter a valid email address.'};
  },

  isValidIfsc: (ifsc?: string | null): {isValid: boolean; error?: string} => {
    if (!ifsc || !ifsc.trim()) {
      return {isValid: false, error: 'IFSC code cannot be empty.'};
    }
    const valid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase());
    return valid
      ? {isValid: true}
      : {isValid: false, error: 'IFSC code must be 11 characters (e.g. SBIN0001234).'};
  },

  isValidIFSC: (ifsc?: string | null): {isValid: boolean; error?: string} => {
    return validation.isValidIfsc(ifsc);
  },

  isValidAccountNumber: (acc?: string | null): {isValid: boolean; error?: string} => {
    if (!acc || !acc.trim()) {
      return {isValid: false, error: 'Bank account number cannot be empty.'};
    }
    const clean = acc.trim();
    if (clean.length < 6 || clean.length > 30) {
      return {isValid: false, error: 'Bank account number must be between 6 and 30 characters.'};
    }
    return {isValid: true};
  },

  isValidTransactionRef: (ref?: string | null): boolean => {
    return Boolean(ref && ref.trim().length >= 3);
  },

  isValidExtensionMonths: (months: number): boolean => {
    return Number.isFinite(months) && months > 0;
  },

  isValidPrecloseReason: (reason?: string | null): {isValid: boolean; error?: string} => {
    if (!reason || !reason.trim()) {
      return {isValid: false, error: 'Please provide a reason for pre-close.'};
    }
    if (reason.trim().length > 500) {
      return {isValid: false, error: 'Reason cannot exceed 500 characters.'};
    }
    return {isValid: true};
  },
};

export default validation;
