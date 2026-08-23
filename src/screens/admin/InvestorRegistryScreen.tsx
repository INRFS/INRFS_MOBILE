import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';

import {styles} from '../../styles/admin/InvestorRegistryScreen.styles';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import AppHeader from '../../components/AppHeader';

/* ============================================================
   API CONFIG
   ============================================================ */

const API_BASE_URL = 'http://187.52.115.32:8000';

/*
 * Change this ONLY if your login code uses another AsyncStorage key.
 *
 * Examples:
 *   'access_token'
 *   'token'
 *   'authToken'
 */
const TOKEN_STORAGE_KEY = 'access_token';

/* ============================================================
   TYPES
   ============================================================ */

type StatusFilter = 'All' | 'Active' | 'Pending' | 'Suspended';

const STATUS_FILTERS: StatusFilter[] = [
  'All',
  'Active',
  'Pending',
  'Suspended',
];

type KycStatus = 'Approved' | 'Pending' | 'Rejected';

interface Investor {
  id: string;
  name: string;
  mobile: string;
  email: string;
  branch: string;

  kycStatus: KycStatus;
  status: StatusFilter;

  totalInvested: number;

  investorRegistrationId: number;
  registrationId?: number;

  userId?: number;
  branchId?: number;

  dob?: string;
  aadhaarNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;

  registeredDate?: string;
  remarks?: string;

  type?: 'individual' | 'institution';
}

/*
 * Exact list response structure from your API.
 */
interface InvestorListItemApi {
  investor_id: string;
  investor_name: string;
  mobile: string;
  email: string;
  branch_name: string;
  registered_date: string;

  kyc_status: string;
  account_status: string;

  investment_amount: string;

  investor_registration_id: number;
  registration_id: number;
  investorRegistrationId: number;

  investorId: string;

  user_id: number;
  userId: number;

  branch_id: number;
  branchId: number;

  _approval_investor_id?: string;
  _registration_user_id?: number;
  _registration_id?: number;
}

interface InvestorListResponse {
  success: boolean;
  data: InvestorListItemApi[];
  total: number;
}

/*
 * Details response shown in your Swagger.
 * Some fields can vary depending on backend data, so optional fields
 * are intentionally used.
 */
interface InvestorDetailsApi {
  investor_id: string;
  investor_name: string;
  mobile: string;
  email: string;

  aadhaar_number?: string;

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  branch_name?: string;

  kyc_status?: string;
  account_status?: string;

  investment_amount?: string;

  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;

  registered_date?: string;
  approved_date?: string;
  remarks?: string;

  investor_registration_id?: number;
  registration_id?: number;

  user_id?: number;
  branch_id?: number;
}

interface InvestorDetailsResponse {
  success: boolean;
  data: InvestorDetailsApi;
}

/*
 * Generic success/error response.
 */
interface ApiResponse {
  success?: boolean;
  message?: string;
  detail?: string;
  data?: any;
}

/* ============================================================
   API HELPERS
   ============================================================ */

const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    return token;
  } catch (error) {
    console.log('Unable to read auth token:', error);
    return null;
  }
};

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  const token = await getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  let responseBody: any = null;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  /*
   * IMPORTANT:
   * Swagger shows reject can return HTTP 400 when already processed.
   * Therefore we throw for ALL non-2xx responses.
   */
  if (!response.ok) {
    const errorMessage =
      responseBody?.detail ||
      responseBody?.message ||
      `Request failed with status ${response.status}`;

    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.response = responseBody;

    throw error;
  }

  return responseBody;
};

/* ============================================================
   API #1 - GET INVESTORS
   ============================================================ */

const getInvestorsApi = async (
  status?: StatusFilter,
  searchText?: string,
): Promise<InvestorListResponse> => {
  const params = new URLSearchParams();

  /*
   * Swagger showed:
   *
   * status_name
   * kyc_status_name
   * search_text
   * limit
   * offset
   *
   * We only send the filters that are actually required.
   */

  if (status && status !== 'All') {
    params.append('status_name', status);
  }

  if (searchText?.trim()) {
    params.append('search_text', searchText.trim());
  }

  params.append('limit', '100');
  params.append('offset', '0');

  const query = params.toString();

  return apiRequest(`/admin/investors?${query}`, {
    method: 'GET',
  });
};

/* ============================================================
   API #2 - GET INVESTOR DETAILS
   ============================================================ */

const getInvestorDetailsApi = async (
  investorRegistrationId: number,
): Promise<InvestorDetailsResponse> => {
  return apiRequest(`/admin/investors/${investorRegistrationId}`, {
    method: 'GET',
  });
};

/* ============================================================
   API #3 - APPROVE INVESTOR
   ============================================================ */

const approveInvestorApi = async (
  investorId: string,
): Promise<ApiResponse> => {
  /*
   * Based on the Swagger naming pattern:
   *
   * PUT /admin/investors/{investor_id}/approve
   *
   * No request body is required.
   */
  return apiRequest(`/admin/investors/${investorId}/approve`, {
    method: 'PUT',
  });
};

/* ============================================================
   API #4 - REJECT INVESTOR
   ============================================================ */

const rejectInvestorApi = async (
  investorId: string,
  remarks: string,
): Promise<ApiResponse> => {
  /*
   * Swagger screenshot clearly shows:
   *
   * PUT /admin/investors/{investor_id}/reject
   *
   * Body:
   * {
   *   "remarks": "Investor rejected by admin"
   * }
   */

  return apiRequest(`/admin/investors/${investorId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({
      remarks,
    }),
  });
};

/* ============================================================
   MAPPING HELPERS
   ============================================================ */

const toNumber = (value: any): number => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return number;
};

const normalizeKycStatus = (value?: string): KycStatus => {
  const status = String(value || '').toLowerCase();

  if (
    status.includes('verified') ||
    status.includes('approved') ||
    status.includes('approve')
  ) {
    return 'Approved';
  }

  if (status.includes('reject')) {
    return 'Rejected';
  }

  return 'Pending';
};

const normalizeAccountStatus = (value?: string): StatusFilter => {
  const status = String(value || '').toLowerCase();

  if (status.includes('suspend')) {
    return 'Suspended';
  }

  if (status.includes('active')) {
    return 'Active';
  }

  return 'Pending';
};

const mapInvestor = (item: InvestorListItemApi): Investor => {
  return {
    id: item.investor_id || item.investorId,
    name: item.investor_name || 'Unknown',
    mobile: item.mobile || '',
    email: item.email || '',
    branch: item.branch_name || '',

    kycStatus: normalizeKycStatus(item.kyc_status),
    status: normalizeAccountStatus(item.account_status),

    totalInvested: toNumber(item.investment_amount),

    investorRegistrationId:
      item.investor_registration_id ||
      item.investorRegistrationId ||
      item.registration_id,

    registrationId: item.registration_id,

    userId: item.user_id || item.userId,
    branchId: item.branch_id || item.branchId,

    registeredDate: item.registered_date,

    type: 'individual',
  };
};

/* ============================================================
   DISPLAY HELPERS
   ============================================================ */

const tierIcon = (inv: Investor) =>
  inv.type === 'institution' ? '🏢' : '👤';

const orNotProvided = (value?: string | number) => {
  if (value === undefined || value === null) {
    return 'Not provided';
  }

  const text = String(value);

  return text.trim() ? text : 'Not provided';
};

const displayInvestorId = (inv: Investor) => {
  if (inv.status === 'Pending') {
    return 'Pending';
  }

  if (inv.status === 'Suspended') {
    return '—';
  }

  return inv.id;
};

const kycPillColor = (status: KycStatus) => {
  if (status === 'Approved') {
    return {backgroundColor: '#DCFCE7'};
  }

  if (status === 'Pending') {
    return {backgroundColor: '#FEF3C7'};
  }

  return {backgroundColor: '#FEE2E2'};
};

const kycPillTextColor = (status: KycStatus) => {
  if (status === 'Approved') {
    return {color: '#16A34A'};
  }

  if (status === 'Pending') {
    return {color: '#B45309'};
  }

  return {color: '#DC2626'};
};

/* ============================================================
   DETAIL FIELD
   ============================================================ */

const DetailField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={local.fieldCol}>
    <Text style={local.docLabel}>{label}</Text>

    <View style={local.pillBox}>
      <Text style={local.pillText}>{value}</Text>
    </View>
  </View>
);

/* ============================================================
   SCREEN
   ============================================================ */

const InvestorRegistryScreen = ({navigation}: any) => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState('');

  /*
   * Keeping Pending as default, as in your current screen.
   */
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('Pending');

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [actionLoadingId, setActionLoadingId] =
    useState<string | null>(null);

  const [viewingInvestor, setViewingInvestor] =
    useState<Investor | null>(null);

  const [viewingDetails, setViewingDetails] =
    useState<InvestorDetailsApi | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [rejectedName, setRejectedName] =
    useState<string | null>(null);

  /* ==========================================================
     LOAD INVESTORS
     ========================================================== */

  const loadInvestors = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await getInvestorsApi(
          statusFilter,
          query,
        );

        const apiData = Array.isArray(response?.data)
          ? response.data
          : [];

        const mapped = apiData.map(mapInvestor);

        setInvestors(mapped);
        setTotal(response?.total ?? mapped.length);
      } catch (error: any) {
        console.log('GET /admin/investors error:', error);

        Alert.alert(
          'Unable to load investors',
          error?.message ||
            'Could not load investor data from the server.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, query],
  );

  /*
   * Load when filter/search changes.
   *
   * Small debounce for search.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadInvestors(true);
    }, query.trim() ? 400 : 0);

    return () => clearTimeout(timer);
  }, [loadInvestors]);

  /* ==========================================================
     FILTERED DATA
     ========================================================== */

  const filtered = useMemo(() => {
    /*
     * API already handles status/search.
     * This local filter is kept as a safety net.
     */
    const lowerQuery = query.toLowerCase().trim();

    return investors.filter(inv => {
      if (!lowerQuery) {
        return true;
      }

      return (
        inv.name.toLowerCase().includes(lowerQuery) ||
        inv.id.toLowerCase().includes(lowerQuery) ||
        inv.email.toLowerCase().includes(lowerQuery) ||
        inv.branch.toLowerCase().includes(lowerQuery)
      );
    });
  }, [investors, query]);

  /* ==========================================================
     VIEW DETAILS
     ========================================================== */

  const handleView = async (inv: Investor) => {
    setViewingInvestor(inv);
    setViewingDetails(null);
    setDetailsLoading(true);

    try {
      /*
       * IMPORTANT:
       * Details API expects registration ID, NOT INV000012.
       *
       * Example from your Swagger:
       *
       * GET /admin/investors/12
       */
      const response = await getInvestorDetailsApi(
        inv.investorRegistrationId,
      );

      setViewingDetails(response?.data || null);
    } catch (error: any) {
      console.log(
        'GET /admin/investors/{registration_id} error:',
        error,
      );

      Alert.alert(
        'Unable to load details',
        error?.message ||
          'Could not retrieve investor details.',
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ==========================================================
     APPROVE
     ========================================================== */

  const handleApprove = (inv: Investor) => {
    Alert.alert(
      'Approve KYC',
      `Approve verification for ${inv.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              setActionLoadingId(inv.id);

              /*
               * API #3
               */
              const response = await approveInvestorApi(
                inv.id,
              );

              console.log('Approve response:', response);

              /*
               * Refresh from backend.
               * This is important because the backend changes:
               *
               * KYC -> Verified / Approved
               * Account -> Active
               */
              await loadInvestors(false);

              Alert.alert(
                'Success',
                response?.message ||
                  response?.detail ||
                  `${inv.name}'s KYC has been approved successfully.`,
              );
            } catch (error: any) {
              console.log(
                'PUT /admin/investors/{id}/approve error:',
                error,
              );

              Alert.alert(
                'Approval failed',
                error?.message ||
                  'Unable to approve this investor.',
              );
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ],
    );
  };

  /* ==========================================================
     REJECT
     ========================================================== */

  const handleReject = (inv: Investor) => {
    Alert.alert(
      'Reject request',
      `Reject verification for ${inv.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',

          onPress: async () => {
            try {
              setActionLoadingId(inv.id);

              /*
               * EXACT body from your Swagger:
               *
               * {
               *   "remarks": "Investor rejected by admin"
               * }
               */
              const response = await rejectInvestorApi(
                inv.id,
                'Investor rejected by admin',
              );

              console.log('Reject response:', response);

              /*
               * Only show success AFTER HTTP 2xx.
               *
               * Your Swagger shows 400 for an already processed KYC,
               * so that case will come into catch() instead.
               */

              await loadInvestors(false);

              setRejectedName(inv.name);
            } catch (error: any) {
              console.log(
                'PUT /admin/investors/{id}/reject error:',
                error,
              );

              /*
               * This handles the exact error you showed:
               *
               * 400
               * {
               *   "detail": "Investor KYC is already processed."
               * }
               */

              Alert.alert(
                error?.status === 400
                  ? 'KYC Already Processed'
                  : 'Rejection failed',
                error?.message ||
                  'Unable to reject this investor.',
              );
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ],
    );
  };

  /* ==========================================================
     EXPORT
     ========================================================== */

  const handleExport = async () => {
    try {
      if (!investors.length) {
        Alert.alert(
          'No data',
          'There are no investors to export.',
        );
        return;
      }

      const rows = investors.map(inv => ({
        'Investor ID': displayInvestorId(inv),
        Name: inv.name,
        Email: inv.email,
        Mobile: inv.mobile,
        Branch: inv.branch,
        'KYC Status': inv.kycStatus,
        Status: inv.status,
        'Total Invested': inv.totalInvested,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        'Investors',
      );

      const base64 = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const fileName =
        `INRFS_Investor_Management_${Date.now()}.xlsx`;

      const filePath =
        `${RNFS.CachesDirectoryPath}/${fileName}`;

      await RNFS.writeFile(
        filePath,
        base64,
        'base64',
      );

      await RNShare.open({
        url:
          Platform.OS === 'android'
            ? `file://${filePath}`
            : filePath,

        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

        filename: fileName,
      });
    } catch (error: any) {
      if (
        error?.message &&
        !/user did not share/i.test(error.message)
      ) {
        Alert.alert(
          'Export failed',
          'Could not generate the Excel file. Please try again.',
        );
      }
    }
  };

  /* ==========================================================
     ACTION BUTTONS
     ========================================================== */

  const renderActions = (inv: Investor) => {
    const isLoading = actionLoadingId === inv.id;

    if (inv.status === 'Pending') {
      return (
        <View style={local.actionsRow}>
          <TouchableOpacity
            disabled={isLoading}
            style={[
              local.approveBtn,
              isLoading && local.disabledBtn,
            ]}
            onPress={() => handleApprove(inv)}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={local.approveBtnText}>
                Approve
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isLoading}
            style={[
              local.rejectBtn,
              isLoading && local.disabledBtn,
            ]}
            onPress={() => handleReject(inv)}>
            <Text style={local.rejectBtnText}>
              Reject
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isLoading}
            style={local.viewBtn}
            onPress={() => handleView(inv)}>
            <Text style={local.viewBtnIcon}>
              👁
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={local.actionsRow}>
        <TouchableOpacity
          style={local.viewBtn}
          onPress={() => handleView(inv)}>
          <Text style={local.viewBtnIcon}>
            👁
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Admin Portal" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          Investor Management
        </Text>

        <Text style={styles.subtitle}>
          Manage and monitor {total.toLocaleString()} registered
          entities.
        </Text>

        {/* SEARCH */}

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ID, name, or tier..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExport}>
            <Text style={styles.exportBtnText}>
              Export
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATUS FILTERS */}

        <View style={styles.statusFilterRow}>
          {STATUS_FILTERS.map(filter => {
            const active =
              filter === statusFilter;

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.statusFilterChip,
                  active &&
                    styles.statusFilterChipActive,
                ]}
                onPress={() =>
                  setStatusFilter(filter)
                }>
                <Text
                  style={[
                    styles.statusFilterChipText,
                    active &&
                      styles.statusFilterChipTextActive,
                  ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LOADING */}

        {loading && (
          <View style={local.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={local.loadingText}>
              Loading investors...
            </Text>
          </View>
        )}

        {/* EMPTY */}

        {!loading && filtered.length === 0 && (
          <View style={local.emptyContainer}>
            <Text style={local.emptyIcon}>
              👤
            </Text>

            <Text style={local.emptyTitle}>
              No investors found
            </Text>

            <Text style={local.emptyText}>
              No investors match the selected filter.
            </Text>
          </View>
        )}

        {/* INVESTORS */}

        {!loading &&
          filtered.map(inv => (
            <View
              key={`${inv.id}-${inv.investorRegistrationId}`}
              style={styles.card}>
              {/* TOP */}

              <View style={styles.cardTopRow}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>
                    {tierIcon(inv)}
                  </Text>
                </View>

                <View style={styles.nameWrap}>
                  <Text style={styles.name}>
                    {inv.name}
                  </Text>

                  <Text style={styles.invId}>
                    {displayInvestorId(inv)}
                  </Text>

                  <Text style={styles.email}>
                    {inv.email}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* MOBILE / BRANCH */}

              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>
                    Mobile
                  </Text>

                  <Text style={styles.infoValue}>
                    {inv.mobile}
                  </Text>
                </View>

                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>
                    Branch
                  </Text>

                  <Text style={styles.infoValue}>
                    {inv.branch}
                  </Text>
                </View>
              </View>

              {/* KYC / STATUS */}

              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>
                    KYC
                  </Text>

                  <View
                    style={[
                      styles.pill,
                      kycPillColor(
                        inv.kycStatus,
                      ),
                    ]}>
                    <Text
                      style={[
                        styles.pillText,
                        kycPillTextColor(
                          inv.kycStatus,
                        ),
                      ]}>
                      {inv.kycStatus}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>
                    Status
                  </Text>

                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            inv.status ===
                            'Active'
                              ? '#16A34A'
                              : inv.status ===
                                'Suspended'
                              ? '#DC2626'
                              : '#F59E0B',
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            inv.status ===
                            'Active'
                              ? '#16A34A'
                              : inv.status ===
                                'Suspended'
                              ? '#DC2626'
                              : '#F59E0B',
                        },
                      ]}>
                      {inv.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* INVESTMENT */}

              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statLabel}>
                    Investment
                  </Text>

                  <Text style={styles.statValue}>
                    ₹
                    {inv.totalInvested.toLocaleString(
                      'en-IN',
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </Text>
                </View>
              </View>

              {/* ACTIONS */}

              {renderActions(inv)}
            </View>
          ))}
      </ScrollView>

      {/* FAB */}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => loadInvestors(false)}>
        <Text style={styles.fabIcon}>
          +
        </Text>
      </TouchableOpacity>

      <AdminBottomTabBar
        active="More"
        navigation={navigation}
      />

      {/* ======================================================
          VIEW DETAILS MODAL
          ====================================================== */}

      <Modal
        transparent
        animationType="fade"
        visible={!!viewingInvestor}
        onRequestClose={() => {
          setViewingInvestor(null);
          setViewingDetails(null);
        }}>
        <View style={local.modalOverlay}>
          {viewingInvestor && (
            <View style={local.modalCard}>
              <View style={local.modalHeaderRow}>
                <Text style={local.modalTitle}>
                  Investor Details —{' '}
                  {viewingInvestor.name}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setViewingInvestor(null);
                    setViewingDetails(null);
                  }}>
                  <Text style={local.modalClose}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {detailsLoading ? (
                <View style={local.detailsLoading}>
                  <ActivityIndicator size="large" />

                  <Text style={local.loadingText}>
                    Loading investor details...
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={local.modalScroll}
                  showsVerticalScrollIndicator={false}>
                  <View style={local.fieldRow}>
                    <DetailField
                      label="FULL NAME"
                      value={
                        orNotProvided(
                          viewingDetails?.investor_name ||
                            viewingInvestor.name,
                        )
                      }
                    />

                    <DetailField
                      label="MOBILE"
                      value={orNotProvided(
                        viewingDetails?.mobile ||
                          viewingInvestor.mobile,
                      )}
                    />
                  </View>

                  <View style={local.fieldRow}>
                    <DetailField
                      label="EMAIL"
                      value={orNotProvided(
                        viewingDetails?.email ||
                          viewingInvestor.email,
                      )}
                    />

                    <DetailField
                      label="DATE OF BIRTH"
                      value={orNotProvided(
                        viewingInvestor.dob,
                      )}
                    />
                  </View>

                  <View style={local.fieldRow}>
                    <DetailField
                      label="AADHAAR NUMBER"
                      value={orNotProvided(
                        viewingDetails?.aadhaar_number,
                      )}
                    />

                    <DetailField
                      label="BRANCH"
                      value={orNotProvided(
                        viewingDetails?.branch_name ||
                          viewingInvestor.branch,
                      )}
                    />
                  </View>

                  <View style={local.fieldRow}>
                    <DetailField
                      label="ADDRESS"
                      value={orNotProvided(
                        viewingDetails?.address ||
                          viewingInvestor.address,
                      )}
                    />

                    <DetailField
                      label="CITY"
                      value={orNotProvided(
                        viewingDetails?.city ||
                          viewingInvestor.city,
                      )}
                    />
                  </View>

                  <View style={local.fieldRow}>
                    <DetailField
                      label="STATE"
                      value={orNotProvided(
                        viewingDetails?.state ||
                          viewingInvestor.state,
                      )}
                    />

                    <DetailField
                      label="PIN CODE"
                      value={orNotProvided(
                        viewingDetails?.pincode ||
                          viewingInvestor.pincode,
                      )}
                    />
                  </View>

                  <View style={local.fieldRow}>
                    <DetailField
                      label="BANK ACCOUNT NUMBER"
                      value={orNotProvided(
                        viewingDetails?.account_number ||
                          viewingInvestor.bankAccountNumber,
                      )}
                    />

                    <DetailField
                      label="IFSC CODE"
                      value={orNotProvided(
                        viewingDetails?.ifsc_code ||
                          viewingInvestor.ifscCode,
                      )}
                    />
                  </View>

                  <View style={local.fieldRow}>
                    <DetailField
                      label="BANK NAME"
                      value={orNotProvided(
                        viewingDetails?.bank_name ||
                          viewingInvestor.bankName,
                      )}
                    />

                    <DetailField
                      label="INVESTMENT AMOUNT"
                      value={`₹${toNumber(
                        viewingDetails?.investment_amount ||
                          viewingInvestor.totalInvested,
                      ).toLocaleString('en-IN')}`}
                    />
                  </View>

                  <View style={local.remarksWrap}>
                    <Text style={local.docLabel}>
                      CURRENT KYC STATUS
                    </Text>

                    <View
                      style={[
                        local.statusPill,
                        kycPillColor(
                          normalizeKycStatus(
                            viewingDetails?.kyc_status ||
                              viewingInvestor.kycStatus,
                          ),
                        ),
                      ]}>
                      <Text
                        style={[
                          local.statusPillText,
                          kycPillTextColor(
                            normalizeKycStatus(
                              viewingDetails?.kyc_status ||
                                viewingInvestor.kycStatus,
                            ),
                          ),
                        ]}>
                        {normalizeKycStatus(
                          viewingDetails?.kyc_status ||
                            viewingInvestor.kycStatus,
                        )}
                      </Text>
                    </View>
                  </View>

                  {viewingDetails?.remarks ? (
                    <View style={local.remarksWrap}>
                      <Text style={local.docLabel}>
                        REMARKS
                      </Text>

                      <View style={local.pillBox}>
                        <Text style={local.pillText}>
                          {viewingDetails.remarks}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </ScrollView>
              )}

              <TouchableOpacity
                style={local.modalCloseBtn}
                onPress={() => {
                  setViewingInvestor(null);
                  setViewingDetails(null);
                }}>
                <Text style={local.modalCloseBtnText}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* ======================================================
          REJECTION SUCCESS MODAL
          ====================================================== */}

      <Modal
        transparent
        animationType="fade"
        visible={!!rejectedName}
        onRequestClose={() =>
          setRejectedName(null)
        }>
        <View style={local.modalOverlay}>
          <View style={local.rejectionCard}>
            <View style={local.rejectionIconWrap}>
              <Text style={local.rejectionIcon}>
                ✓
              </Text>
            </View>

            <Text style={local.rejectionTitle}>
              Investor Rejected
            </Text>

            <Text style={local.rejectionMessage}>
              {rejectedName}'s KYC has been rejected
              successfully. The investor account has
              been suspended.
            </Text>

            <TouchableOpacity
              style={local.rejectionOkBtn}
              onPress={() =>
                setRejectedName(null)
              }>
              <Text
                style={local.rejectionOkBtnText}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/* ============================================================
   LOCAL STYLES
   ============================================================ */

const local = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  approveBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  disabledBtn: {
    opacity: 0.6,
  },

  viewBtn: {
    width: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewBtnIcon: {
    fontSize: 16,
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailsLoading: {
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
  },

  emptyContainer: {
    marginTop: 30,
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },

  modalScroll: {
    marginTop: 4,
  },

  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
    paddingRight: 8,
  },

  modalClose: {
    fontSize: 16,
    color: '#6B7280',
  },

  fieldRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },

  fieldCol: {
    flex: 1,
  },

  docLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.4,
  },

  pillBox: {
    alignSelf: 'stretch',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },

  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 4,
  },

  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  remarksWrap: {
    marginTop: 8,
    marginBottom: 8,
  },

  modalCloseBtn: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  rejectionCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },

  rejectionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  rejectionIcon: {
    fontSize: 25,
    color: '#16A34A',
    fontWeight: '700',
  },

  rejectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },

  rejectionMessage: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },

  rejectionOkBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },

  rejectionOkBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default InvestorRegistryScreen;