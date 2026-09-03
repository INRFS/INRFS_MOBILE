/**
 * Input validation helpers for INRFS Mobile Application
 */

export const validation = {
  isValidInvestorId: (id?: string | null): boolean => {
    return Boolean(id && id.trim().startsWith('INV'));
  },

  isValidPassword: (password?: string | null): boolean => {
    return Boolean(password && password.length >= 1);
  },

  isValidName: (name?: string | null): {isValid: boolean; error?: string} => {
    if (!name || !name.trim()) {
      return {isValid: false, error: 'Name cannot be empty.'};
    }
    const clean = name.trim();
    if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(clean)) {
      return {
        isValid: false,
        error: 'Name should contain only letters and spaces.',
      };
    }
    return {isValid: true};
  },

  isValidCity: (city?: string | null): {isValid: boolean; error?: string} => {
    if (!city || !city.trim()) {
      return {isValid: false, error: 'City cannot be empty.'};
    }
    const clean = city.trim();
    if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(clean)) {
      return {
        isValid: false,
        error: 'City should contain only letters and spaces.',
      };
    }
    return {isValid: true};
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

  isValidIndianMobile: (mobile?: string | null): {isValid: boolean; error?: string} => {
    if (!mobile || !mobile.trim()) {
      return {isValid: false, error: 'Mobile number cannot be empty.'};
    }
    const clean = mobile.trim();
    if (/\D/.test(clean) || clean.length !== 10) {
      return {
        isValid: false,
        error: 'Please enter a valid 10-digit mobile number.',
      };
    }
    return {isValid: true};
  },

  isValidMobile: (mobile?: string | null): {isValid: boolean; error?: string} => {
    if (!mobile || !mobile.trim()) {
      return {isValid: false, error: 'Mobile number cannot be empty.'};
    }
    const clean = mobile.trim();
    if (/\D/.test(clean) || clean.length !== 10) {
      return {isValid: false, error: 'Please enter a valid 10-digit mobile number.'};
    }
    return {isValid: true};
  },

  isValidEmail: (email?: string | null): {isValid: boolean; error?: string} => {
    if (!email || !email.trim()) {
      return {isValid: false, error: 'Email address cannot be empty.'};
    }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return valid
      ? {isValid: true}
      : {isValid: false, error: 'Please enter a valid email address.'};
  },

  isValidAadhaar: (aadhaar?: string | null): {isValid: boolean; error?: string} => {
    if (!aadhaar || !aadhaar.trim()) {
      return {isValid: false, error: 'Aadhaar number cannot be empty.'};
    }
    const clean = aadhaar.trim();
    if (/\D/.test(clean) || clean.length !== 12) {
      return {
        isValid: false,
        error: 'Please enter a valid 12-digit Aadhaar number.',
      };
    }
    return {isValid: true};
  },

  isValidPincode: (pin?: string | null): {isValid: boolean; error?: string} => {
    if (!pin || !pin.trim()) {
      return {isValid: false, error: 'PIN code cannot be empty.'};
    }
    const clean = pin.trim();
    if (/\D/.test(clean) || clean.length !== 6) {
      return {
        isValid: false,
        error: 'Please enter a valid 6-digit PIN code.',
      };
    }
    return {isValid: true};
  },

  isValidDateString: (
    dateStr?: string | null,
    format: 'DD-MM-YYYY' | 'YYYY-MM-DD' = 'DD-MM-YYYY',
  ): {isValid: boolean; error?: string} => {
    if (!dateStr || !dateStr.trim()) {
      return {isValid: false, error: 'Date cannot be empty.'};
    }
    const clean = dateStr.trim();
    let day = 0;
    let month = 0;
    let year = 0;

    if (format === 'DD-MM-YYYY') {
      if (!/^\d{2}-\d{2}-\d{4}$/.test(clean)) {
        return {isValid: false, error: 'Please enter a valid date in DD-MM-YYYY format.'};
      }
      const parts = clean.split('-');
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        return {isValid: false, error: 'Please enter a valid date in YYYY-MM-DD format.'};
      }
      const parts = clean.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }

    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
      return {isValid: false, error: 'Please enter a valid calendar date.'};
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      return {isValid: false, error: 'Please enter a valid calendar date.'};
    }

    return {isValid: true};
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
    if (/\D/.test(clean) || clean.length < 6 || clean.length > 30) {
      return {isValid: false, error: 'Bank account number must be between 6 and 30 digits.'};
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
