/**
 * Status mapping for INRFS Investor Module
 * Aligns backend numeric and string statuses with Web application values.
 */

export const STATUS_NAMES_BY_ID: Record<number, string> = {
  1: 'Pending Approval',
  2: 'Active',
  3: 'Closed',
  4: 'Rejected',
  5: 'Refunded',
};

/**
 * Normalize status strings / IDs into canonical status labels
 */
export const normalizeStatus = (
  rawStatus?: string | null,
  statusId?: number | null,
): string => {
  if (rawStatus && typeof rawStatus === 'string') {
    const s = rawStatus.trim().toLowerCase();

    if (
      s === 'pending' ||
      s === 'pending approval' ||
      s === 'pending_approval' ||
      s === 'pending-approval'
    ) {
      return 'Pending Approval';
    }

    if (s === 'active' || s === 'approved') {
      return 'Active';
    }

    if (s === 'closed' || s === 'settled') {
      return 'Closed';
    }

    if (s === 'rejected' || s === 'reject') {
      return 'Rejected';
    }

    if (s === 'refunded' || s === 'refund') {
      return 'Refunded';
    }

    if (
      s === 'extension requested' ||
      s === 'tenure extension requested' ||
      (s.includes('pending') && s.includes('extension'))
    ) {
      return 'Pending Extension';
    }

    if (
      s === 'pre-close requested' ||
      s === 'preclose requested' ||
      s === 'settlement requested' ||
      (s.includes('pending') && (s.includes('settlement') || s.includes('preclose')))
    ) {
      return 'Pending Settlement';
    }

    if (s.includes('matur')) {
      return 'Matured';
    }

    return rawStatus;
  }

  if (statusId != null && STATUS_NAMES_BY_ID[Number(statusId)]) {
    return STATUS_NAMES_BY_ID[Number(statusId)];
  }

  return 'Pending Approval';
};

/**
 * Returns color tokens for status pills
 */
export const getStatusColors = (status: string) => {
  const s = status.toLowerCase();

  if (s.includes('active') || s.includes('approved')) {
    return {
      bg: '#DCFCE7',
      text: '#15803D',
      border: '#BBF7D0',
    };
  }

  if (s.includes('pending') || s.includes('extension') || s.includes('settlement')) {
    return {
      bg: '#FEF3C7',
      text: '#B45309',
      border: '#FDE68A',
    };
  }

  if (s.includes('matured')) {
    return {
      bg: '#EDE9FE',
      text: '#6D28D9',
      border: '#DDD6FE',
    };
  }

  if (s.includes('reject') || s.includes('close') || s.includes('refund')) {
    return {
      bg: '#FEE2E2',
      text: '#B91C1C',
      border: '#FECACA',
    };
  }

  return {
    bg: '#F3F4F6',
    text: '#4B5563',
    border: '#E5E7EB',
  };
};
