import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAppData} from '../../navigation/AppNavigator';
import {
  styles,
  local,
} from '../../styles/admin/SettlementCalculatorScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import AppHeader from '../../components/AppHeader';

// ---------------------------------------------------------------------------
// Settlement Management
//
// Existing flow remains unchanged:
//
// 1. Tenure Timeout
//    -> Shows matured Active bonds.
//    -> Admin can send settlement to Super Admin.
//
// 2. Pre-Close Requests
//    -> Shows investor submitted pre-close requests.
//    -> Admin can approve/reject as before.
//
// 3. Closed Settlements
//    -> READ ONLY.
//    -> Shows already closed/settled settlements.
//
// Backend integration:
//
// GET /admin/settlements/tenure-timeout
// GET /admin/settlements/preclose
// GET /admin/settlements/closed
//
// limit=100
// offset=0
// ---------------------------------------------------------------------------

type Tab = 'timeout' | 'preclose' | 'closed';

const API_BASE_URL = 'http://187.52.115.32:8000';

const API_LIMIT = 100;
const API_OFFSET = 0;

const formatINR = (n: number) =>
  '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

// ---------------------------------------------------------------------------
// API TYPES
// ---------------------------------------------------------------------------

type ApiResponse<T = any> = {
  success?: boolean;
  items?: T[];
  data?: T[];
  total?: number;
  limit?: number;
  offset?: number;
  message?: string;
};

type SettlementApiItem = Record<string, any>;

// ---------------------------------------------------------------------------
// API TOKEN
//
// Swagger shows Bearer Authorization.
//
// These are common AsyncStorage keys. If your project uses a different key,
// add it here. No UI flow is changed by this helper.
// ---------------------------------------------------------------------------

const AUTH_TOKEN_KEYS = [
  'accessToken',
  'access_token',
  'token',
  'authToken',
  'auth_token',
  'jwt',
];

const getAuthToken = async (): Promise<string | null> => {
  for (const key of AUTH_TOKEN_KEYS) {
    const value = await AsyncStorage.getItem(key);

    if (value) {
      return value.replace(/^Bearer\s+/i, '').trim();
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// GENERIC API GET
// ---------------------------------------------------------------------------

const getSettlementApi = async <T = SettlementApiItem>(
  endpoint: string,
): Promise<ApiResponse<T>> => {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url =
    `${API_BASE_URL}${endpoint}` +
    `?limit=${API_LIMIT}&offset=${API_OFFSET}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  const responseText = await response.text();

  let json: ApiResponse<T> = {};

  try {
    json = responseText
      ? JSON.parse(responseText)
      : {};
  } catch {
    throw new Error(
      `Invalid server response (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      json?.message ||
        `Request failed with status ${response.status}.`,
    );
  }

  return json;
};

// ---------------------------------------------------------------------------
// RESPONSE ITEMS
//
// Swagger response examples show:
//
// {
//   "success": true,
//   "items": [],
//   "data": [],
//   "total": 0,
//   "limit": 100,
//   "offset": 0
// }
//
// Pre-close response contains the actual request objects inside items.
// ---------------------------------------------------------------------------

const getApiItems = <T = SettlementApiItem>(
  response: ApiResponse<T>,
): T[] => {
  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

// ---------------------------------------------------------------------------
// SAFE FIELD HELPERS
//
// The backend screenshot shows snake_case fields for pre-close.
//
// These helpers also accept camelCase so the UI remains compatible if the
// backend serializer changes naming.
// ---------------------------------------------------------------------------

const firstValue = (
  item: SettlementApiItem,
  keys: string[],
  fallback: any = undefined,
) => {
  for (const key of keys) {
    const value = item?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value;
    }
  }

  return fallback;
};

const toNumber = (
  value: any,
  fallback = 0,
): number => {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : fallback;
};

// ---------------------------------------------------------------------------
// DATE HANDLING
//
// AppNavigator stores maturityDate as dd-mm-yyyy.
// ---------------------------------------------------------------------------

const parseAppDate = (
  dateStr?: string,
): Date | null => {
  if (!dateStr) {
    return null;
  }

  const parts = dateStr
    .split('-')
    .map(Number);

  if (
    parts.length !== 3 ||
    parts.some(n => Number.isNaN(n))
  ) {
    return null;
  }

  const [d, m, y] = parts;

  const dt = new Date(
    y,
    m - 1,
    d,
  );

  return isNaN(dt.getTime())
    ? null
    : dt;
};

const isMaturityCrossed = (
  maturityDate?: string,
): boolean => {
  const dt = parseAppDate(
    maturityDate,
  );

  if (!dt) {
    return false;
  }

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  dt.setHours(
    0,
    0,
    0,
    0,
  );

  return (
    dt.getTime() <=
    today.getTime()
  );
};

// ---------------------------------------------------------------------------
// DATE NORMALIZATION
//
// API can return ISO dates while the existing UI can display the original
// date. This function does not alter the visual flow.
// ---------------------------------------------------------------------------

const formatApiDate = (
  value: any,
): string => {
  if (!value) {
    return '—';
  }

  const stringValue = String(value);

  // Already dd-mm-yyyy
  if (
    /^\d{2}-\d{2}-\d{4}$/.test(
      stringValue,
    )
  ) {
    return stringValue;
  }

  const date = new Date(
    stringValue,
  );

  if (
    !Number.isNaN(
      date.getTime(),
    )
  ) {
    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');

    const year =
      date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  return stringValue;
};

// ---------------------------------------------------------------------------
// CALCULATE TENURE
// ---------------------------------------------------------------------------

const calculateTenureMonths = (
  item: SettlementApiItem,
): number => {
  const explicitTenure = firstValue(
    item,
    [
      'tenure_months',
      'tenureMonths',
      'tenure',
    ],
    undefined,
  );

  if (
    explicitTenure !==
    undefined
  ) {
    return Math.max(
      toNumber(
        explicitTenure,
        1,
      ),
      1,
    );
  }

  const maturityDate = firstValue(
    item,
    [
      'maturity_date',
      'maturityDate',
    ],
    '',
  );

  const investedDate = firstValue(
    item,
    [
      'investment_date',
      'invested_date',
      'investedDate',
      'investmentDate',
    ],
    '',
  );

  if (
    !maturityDate ||
    !investedDate
  ) {
    return 1;
  }

  const maturity = new Date(
    maturityDate,
  );

  const invested = new Date(
    investedDate,
  );

  if (
    Number.isNaN(
      maturity.getTime(),
    ) ||
    Number.isNaN(
      invested.getTime(),
    )
  ) {
    return 1;
  }

  return Math.max(
    (maturity.getFullYear() -
      invested.getFullYear()) *
      12 +
      (maturity.getMonth() -
        invested.getMonth()),
    1,
  );
};

// ---------------------------------------------------------------------------
// NORMALIZE API INVESTMENT
// ---------------------------------------------------------------------------
//
// Converts backend data into the same shape that the existing screen expects.
// ---------------------------------------------------------------------------

const normalizeInvestment = (
  item: SettlementApiItem,
) => {
  const seriesId =
    firstValue(
      item,
      [
        'series_id',
        'seriesId',
        'bond_series_id',
        'bondSeriesId',
        'bond_number',
        'bondNumber',
        'investment_code',
        'investmentCode',
      ],
      '—',
    );

  const investorId =
    firstValue(
      item,
      [
        'investor_id',
        'investorId',
        'investor_registration_id',
        'investorRegistrationId',
      ],
      '',
    );

  const investorName =
    firstValue(
      item,
      [
        'investor_name',
        'investorName',
        'name',
      ],
      '—',
    );

  const branch =
    firstValue(
      item,
      [
        'branch_name',
        'branchName',
        'branch',
      ],
      '—',
    );

  const amount = toNumber(
    firstValue(
      item,
      [
        'amount',
        'investment_amount',
        'investmentAmount',
        'principal',
      ],
      0,
    ),
  );

  const interestRate =
    toNumber(
      firstValue(
        item,
        [
          'interest_rate',
          'interestRate',
          'interest_percentage',
          'interestPercentage',
          'rate',
        ],
        0,
      ),
    );

  const maturityDate =
    formatApiDate(
      firstValue(
        item,
        [
          'maturity_date',
          'maturityDate',
        ],
        '',
      ),
    );

  const investedDate =
    formatApiDate(
      firstValue(
        item,
        [
          'investment_date',
          'invested_date',
          'investedDate',
          'investmentDate',
        ],
        '',
      ),
    );

  const tenureMonths =
    calculateTenureMonths(
      item,
    );

  const apiInterest =
    firstValue(
      item,
      [
        'total_interest',
        'totalInterest',
        'total_interest_earned',
        'totalInterestEarned',
        'expected_interest_amount',
        'expectedInterestAmount',
        'interest_earned',
        'interestEarned',
      ],
      undefined,
    );

  const totalInterest =
    apiInterest !== undefined
      ? toNumber(
          apiInterest,
          0,
        )
      : amount *
        (interestRate / 100) *
        (tenureMonths / 12);

  const apiNetSettlement =
    firstValue(
      item,
      [
        'net_settlement',
        'netSettlement',
        'net_settlement_amount',
        'netSettlementAmount',
        'net_amount',
        'netAmount',
      ],
      undefined,
    );

  const netSettlement =
    apiNetSettlement !==
    undefined
      ? toNumber(
          apiNetSettlement,
          amount +
            totalInterest,
        )
      : amount +
        totalInterest;

  return {
    original: item,

    bond: {
      ...item,

      seriesId,
      investorId,
      investorName,
      amount,
      interestRate,
      maturityDate,
      investedDate,
      tenureMonths,
      status: firstValue(
        item,
        [
          'status',
          'bond_status',
          'bondStatus',
        ],
        'Active',
      ),
    },

    investorName,
    investorRefId:
      investorId || '—',
    branch:
      branch || '—',
    principal: amount,
    totalInterest,
    netSettlement,
  };
};

// ---------------------------------------------------------------------------
// NORMALIZE PRE-CLOSE REQUEST
//
// Screenshot shows fields such as:
//
// request_id
// investment_id
// request_status
// preclose_reason
// requested_date
// investment_amount
// expected_interest_amount
// investment_date
// maturity_date
// bond_number
// investor_registration_id
// investor_id
// investor_name
// branch_name
// city_name
// ---------------------------------------------------------------------------

const normalizePreCloseRequest = (
  item: SettlementApiItem,
) => {
  const id = String(
    firstValue(
      item,
      [
        'request_id',
        'requestId',
        'id',
      ],
      '',
    ),
  );

  const bondSeriesId =
    firstValue(
      item,
      [
        'bond_series_id',
        'bondSeriesId',
        'bond_number',
        'bondNumber',
        'series_id',
        'seriesId',
        'investment_code',
        'investmentCode',
      ],
      '—',
    );

  const investorId =
    firstValue(
      item,
      [
        'investor_id',
        'investorId',
        'investor_registration_id',
        'investorRegistrationId',
      ],
      '',
    );

  const investorName =
    firstValue(
      item,
      [
        'investor_name',
        'investorName',
      ],
      '—',
    );

  const branch =
    firstValue(
      item,
      [
        'branch_name',
        'branchName',
        'branch',
      ],
      '—',
    );

  const requestedOn =
    formatApiDateTime(
      firstValue(
        item,
        [
          'requested_date',
          'requestedDate',
          'created_date',
          'createdDate',
        ],
        '',
      ),
    );

  const reason =
    firstValue(
      item,
      [
        'preclose_reason',
        'preCloseReason',
        'reason',
      ],
      '',
    );

  const principal =
    toNumber(
      firstValue(
        item,
        [
          'principal',
          'investment_amount',
          'investmentAmount',
          'amount',
        ],
        0,
      ),
    );

  const earned =
    toNumber(
      firstValue(
        item,
        [
          'earned',
          'interest_earned',
          'interestEarned',
          'expected_interest_amount',
          'expectedInterestAmount',
        ],
        0,
      ),
    );

  const penalty =
    toNumber(
      firstValue(
        item,
        [
          'penalty',
          'early_penalty',
          'earlyPenalty',
          'preclose_penalty',
          'preclosePenalty',
        ],
        0,
      ),
    );

  const apiNetAmount =
    firstValue(
      item,
      [
        'net_amount',
        'netAmount',
        'net_preclose_amount',
        'netPreCloseAmount',
        'net_settlement',
        'netSettlement',
      ],
      undefined,
    );

  const netAmount =
    apiNetAmount !== undefined
      ? toNumber(
          apiNetAmount,
          principal +
            earned -
            penalty,
        )
      : principal +
        earned -
        penalty;

  const status =
    firstValue(
      item,
      [
        'request_status',
        'requestStatus',
        'status',
      ],
      'Pending',
    );

  return {
    ...item,

    id,

    bondSeriesId,

    investorId,

    investorName,

    branch,

    requestedOn,

    reason,

    principal,

    earned,

    penalty,

    netAmount,

    status,
  };
};

const formatApiDateTime = (
  value: any,
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(
    String(value),
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const year =
    date.getFullYear();

  return `${day}-${month}-${year}`;
};

// ---------------------------------------------------------------------------
// SCREEN
// ---------------------------------------------------------------------------

const SettlementCalculatorScreen = ({
  navigation,
}: any) => {
  const {
    bonds,
    investors,
    approvePreSettlement,
    rejectPreSettlement,
    requestMaturitySettlement,
  } = useAppData();

  const [tab, setTab] =
    useState<Tab>('timeout');

  // -------------------------------------------------------------------------
  // BACKEND DATA
  // -------------------------------------------------------------------------

  const [
    timeoutApiItems,
    setTimeoutApiItems,
  ] = useState<
    SettlementApiItem[]
  >([]);

  const [
    preCloseApiItems,
    setPreCloseApiItems,
  ] = useState<
    SettlementApiItem[]
  >([]);

  const [
    closedApiItems,
    setClosedApiItems,
  ] = useState<
    SettlementApiItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  // -------------------------------------------------------------------------
  // LOAD ALL 3 SETTLEMENT APIs
  // -------------------------------------------------------------------------

  const loadSettlementData =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError('');

          const [
            timeoutResponse,
            preCloseResponse,
            closedResponse,
          ] = await Promise.all([
            getSettlementApi(
              '/admin/settlements/tenure-timeout',
            ),

            getSettlementApi(
              '/admin/settlements/preclose',
            ),

            getSettlementApi(
              '/admin/settlements/closed',
            ),
          ]);

          setTimeoutApiItems(
            getApiItems(
              timeoutResponse,
            ),
          );

          setPreCloseApiItems(
            getApiItems(
              preCloseResponse,
            ),
          );

          setClosedApiItems(
            getApiItems(
              closedResponse,
            ),
          );
        } catch (err: any) {
          console.error(
            'Settlement API error:',
            err,
          );

          setError(
            err?.message ||
              'Unable to load settlement data.',
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadSettlementData();
  }, [loadSettlementData]);

  // -------------------------------------------------------------------------
  // INVESTOR LOOKUP
  //
  // Kept exactly as the existing flow used it.
  // -------------------------------------------------------------------------

  const norm = (s?: string) =>
    (s || '')
      .trim()
      .toLowerCase();

  const getInvestor = (
    id?: string,
    name?: string,
  ) =>
    investors.find(
      i =>
        (id &&
          i.id === id) ||
        (name &&
          norm(i.name) ===
            norm(name)),
    );

  // -------------------------------------------------------------------------
  // TENURE TIMEOUT
  //
  // NOW COMES FROM:
  // GET /admin/settlements/tenure-timeout
  // -------------------------------------------------------------------------

  const timeoutRows =
    timeoutApiItems
      .map(item =>
        normalizeInvestment(
          item,
        ),
      )
      .filter(row => {
        const status =
          String(
            firstValue(
              row.original,
              [
                'status',
                'bond_status',
                'bondStatus',
              ],
              'Active',
            ),
          ).toLowerCase();

        const maturityDate =
          row.bond.maturityDate;

        return (
          (status ===
            'active' ||
            status ===
              'matured' ||
            status ===
              'pending') &&
          (
            isMaturityCrossed(
              maturityDate,
            ) ||
            !maturityDate ||
            maturityDate ===
              '—'
          )
        );
      });

  // -------------------------------------------------------------------------
  // PRE-CLOSE REQUESTS
  //
  // NOW COMES FROM:
  // GET /admin/settlements/preclose
  // -------------------------------------------------------------------------

  const pendingPreClose =
    preCloseApiItems
      .map(item =>
        normalizePreCloseRequest(
          item,
        ),
      )
      .filter(r => {
        const status =
          String(
            r.status ||
              '',
          ).toLowerCase();

        return (
          status ===
            'pending' ||
          status ===
            'pendingadmin' ||
          status ===
            'pending_admin'
        );
      });

  // -------------------------------------------------------------------------
  // CLOSED SETTLEMENTS
  //
  // NOW COMES FROM:
  // GET /admin/settlements/closed
  //
  // READ ONLY.
  // -------------------------------------------------------------------------

  const closedSettlementRows =
    closedApiItems.map(item =>
      normalizeInvestment(
        item,
      ),
    );

  // -------------------------------------------------------------------------
  // TENURE TIMEOUT APPROVAL
  //
  // EXISTING FLOW UNCHANGED.
  // -------------------------------------------------------------------------

  const handleApproveTimeout = (
    row: (typeof timeoutRows)[number],
  ) => {
    Alert.alert(
      'Approve settlement',

      `Send ${formatINR(
        row.netSettlement,
      )} settlement for ${
        row.investorName
      } (${row.bond.seriesId}) to Super Admin for final approval?`,

      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Send to Super Admin',

          onPress: () =>
            requestMaturitySettlement({
              bondSeriesId:
                row.bond.seriesId,

              investorId:
                row.bond.investorId,

              investorName:
                row.investorName,

              principal:
                row.principal,

              totalInterest:
                row.totalInterest,

              netSettlement:
                row.netSettlement,
            }),
        },
      ],
    );
  };

  // -------------------------------------------------------------------------
  // PRE-CLOSE APPROVAL
  //
  // EXISTING FLOW UNCHANGED.
  // -------------------------------------------------------------------------

  const handleApprovePreClose = (
    id: string,
    bondSeriesId: string,
    netAmount: number,
    investorName: string,
  ) => {
    Alert.alert(
      'Approve pre-close',

      `Send ${bondSeriesId} (${formatINR(
        netAmount,
      )} to ${investorName}) to Super Admin for final settlement?`,

      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Send to Super Admin',

          onPress: () =>
            approvePreSettlement(id),
        },
      ],
    );
  };

  // -------------------------------------------------------------------------
  // PRE-CLOSE REJECTION
  //
  // EXISTING FLOW UNCHANGED.
  // -------------------------------------------------------------------------

  const handleRejectPreClose = (
    id: string,
    bondSeriesId: string,
  ) => {
    Alert.alert(
      'Reject pre-close',

      `Reject the pre-close request for ${bondSeriesId}?`,

      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Reject',

          style: 'destructive',

          onPress: () =>
            rejectPreSettlement(id),
        },
      ],
    );
  };

  // -------------------------------------------------------------------------
  // LOADING
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}>

        <AppHeader
          subtitle="Settlement Management"
        />

        <View
          style={local.loadingWrap}>

          <ActivityIndicator
            size="large"
          />

          <Text
            style={local.loadingText}>
            Loading settlement data...
          </Text>

        </View>

        <AdminBottomTabBar
          active="More"
          navigation={navigation}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}>

      <AppHeader
        subtitle="Settlement Management"
      />

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }>

        {/* ================================================================
            PAGE TITLE
        ================================================================ */}

        <Text style={styles.title}>
          Settlement Management
        </Text>

        <Text style={styles.subtitle}>
          Review and approve settlement requests
        </Text>

        {/* ================================================================
            API ERROR
        ================================================================ */}

        {error ? (
          <View
            style={
              local.errorBox
            }>

            <Text
              style={
                local.errorTitle
              }>
              Unable to load settlements
            </Text>

            <Text
              style={
                local.errorText
              }>
              {error}
            </Text>

            <TouchableOpacity
              style={
                local.retryButton
              }
              onPress={
                loadSettlementData
              }>

              <Text
                style={
                  local.retryButtonText
                }>
                Retry
              </Text>

            </TouchableOpacity>

          </View>
        ) : null}

        {/* ================================================================
            TABS
        ================================================================ */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={
            local.tabScroll
          }
          contentContainerStyle={
            local.tabScrollContent
          }>

          <View
            style={
              local.tabRow
            }>

            {/* ------------------------------------------------------------
                TENURE TIMEOUT
            ------------------------------------------------------------ */}

            <TouchableOpacity
              style={[
                local.tabPill,
                tab === 'timeout' &&
                  local.tabPillActive,
              ]}
              onPress={() =>
                setTab('timeout')
              }>

              <Text
                style={[
                  local.tabText,
                  tab === 'timeout' &&
                    local.tabTextActive,
                ]}>

                Tenure Timeout

              </Text>

              {timeoutRows.length >
                0 && (
                <View
                  style={
                    local.tabBadge
                  }>

                  <Text
                    style={
                      local.tabBadgeText
                    }>

                    {
                      timeoutRows.length
                    }

                  </Text>

                </View>
              )}

            </TouchableOpacity>

            {/* ------------------------------------------------------------
                PRE-CLOSE REQUESTS
            ------------------------------------------------------------ */}

            <TouchableOpacity
              style={[
                local.tabPill,
                tab === 'preclose' &&
                  local.tabPillActive,
              ]}
              onPress={() =>
                setTab('preclose')
              }>

              <Text
                style={[
                  local.tabText,
                  tab === 'preclose' &&
                    local.tabTextActive,
                ]}>

                Pre-Close Requests

              </Text>

              {pendingPreClose.length >
                0 && (
                <View
                  style={
                    local.tabBadge
                  }>

                  <Text
                    style={
                      local.tabBadgeText
                    }>

                    {
                      pendingPreClose.length
                    }

                  </Text>

                </View>
              )}

            </TouchableOpacity>

            {/* ------------------------------------------------------------
                CLOSED SETTLEMENTS
            ------------------------------------------------------------ */}

            <TouchableOpacity
              style={[
                local.tabPill,
                tab === 'closed' &&
                  local.tabPillActive,
              ]}
              onPress={() =>
                setTab('closed')
              }>

              <Text
                style={[
                  local.tabText,
                  tab === 'closed' &&
                    local.tabTextActive,
                ]}>

                Closed Settlements

              </Text>

              {closedSettlementRows.length >
                0 && (
                <View
                  style={
                    local.tabBadge
                  }>

                  <Text
                    style={
                      local.tabBadgeText
                    }>

                    {
                      closedSettlementRows.length
                    }

                  </Text>

                </View>
              )}

            </TouchableOpacity>

          </View>

        </ScrollView>

        {/* ================================================================
            TENURE TIMEOUT
        ================================================================ */}

        {tab === 'timeout' && (
          <>
            {timeoutRows.length ===
              0 && (
              <View
                style={
                  local.emptyWrap
                }>

                <Text
                  style={
                    local.emptyText
                  }>
                  No matured bonds awaiting settlement.
                </Text>

              </View>
            )}

            {timeoutRows.map(
              row => (
                <View
                  key={
                    row.bond
                      .seriesId
                  }
                  style={
                    local.card
                  }>

                  <View
                    style={
                      local.cardTopRow
                    }>

                    <View
                      style={
                        local.cardTopLeft
                      }>

                      <Text
                        style={
                          local.bondId
                        }>
                        {
                          row.bond
                            .seriesId
                        }
                      </Text>

                      <View
                        style={
                          local.pendingBadge
                        }>

                        <Text
                          style={
                            local.pendingBadgeText
                          }>
                          Pending
                        </Text>

                      </View>

                    </View>

                    <TouchableOpacity
                      style={
                        local.approveBtn
                      }
                      onPress={() =>
                        handleApproveTimeout(
                          row,
                        )
                      }>

                      <Text
                        style={
                          local.approveBtnText
                        }>
                        → Send to Super Admin
                      </Text>

                    </TouchableOpacity>

                  </View>

                  <View
                    style={
                      local.metaGrid
                    }>

                    <View
                      style={
                        local.metaCol
                      }>

                      <Text
                        style={
                          local.metaLabel
                        }>
                        Investor
                      </Text>

                      <Text
                        style={
                          local.metaValue
                        }>
                        {
                          row.investorName
                        }
                      </Text>

                    </View>

                    <View
                      style={
                        local.metaCol
                      }>

                      <Text
                        style={
                          local.metaLabel
                        }>
                        Investor ID
                      </Text>

                      <Text
                        style={
                          local.metaValue
                        }>
                        {
                          row.investorRefId
                        }
                      </Text>

                    </View>

                  </View>

                  <View
                    style={
                      local.metaGrid
                    }>

                    <View
                      style={
                        local.metaCol
                      }>

                      <Text
                        style={
                          local.metaLabel
                        }>
                        Branch
                      </Text>

                      <Text
                        style={
                          local.metaValue
                        }>
                        {
                          row.branch
                        }
                      </Text>

                    </View>

                    <View
                      style={
                        local.metaCol
                      }>

                      <Text
                        style={
                          local.metaLabel
                        }>
                        Matured On
                      </Text>

                      <Text
                        style={
                          local.metaValue
                        }>
                        {
                          row.bond
                            .maturityDate
                        }
                      </Text>

                    </View>

                  </View>

                  <View
                    style={
                      local.breakdown
                    }>

                    <View
                      style={
                        local.breakdownRow
                      }>

                      <Text
                        style={
                          local.breakdownLabel
                        }>
                        Principal
                      </Text>

                      <Text
                        style={
                          local.breakdownValue
                        }>
                        {formatINR(
                          row.principal,
                        )}
                      </Text>

                    </View>

                    <View
                      style={
                        local.breakdownRow
                      }>

                      <Text
                        style={
                          local.breakdownLabel
                        }>
                        Total Interest Earned
                      </Text>

                      <Text
                        style={
                          local.breakdownValue
                        }>
                        {formatINR(
                          row.totalInterest,
                        )}
                      </Text>

                    </View>

                    <View
                      style={
                        local.breakdownRowLast
                      }>

                      <Text
                        style={
                          local.netLabel
                        }>
                        Net Settlement Amount
                      </Text>

                      <Text
                        style={
                          local.netValue
                        }>
                        {formatINR(
                          row.netSettlement,
                        )}
                      </Text>

                    </View>

                  </View>

                </View>
              ),
            )}
          </>
        )}

        {/* ================================================================
            PRE-CLOSE REQUESTS
        ================================================================ */}

        {tab === 'preclose' && (
          <>
            {pendingPreClose.length ===
              0 && (
              <View
                style={
                  local.emptyWrap
                }>

                <Text
                  style={
                    local.emptyText
                  }>
                  No pre-close requests pending.
                </Text>

              </View>
            )}

            {pendingPreClose.map(
              r => {

                const inv =
                  getInvestor(
                    r.investorId,
                    r.investorName,
                  );

                const branch =
                  r.branch &&
                  r.branch !==
                    '—'
                    ? r.branch
                    : inv?.branch &&
                      inv.branch !==
                        '—'
                    ? inv.branch
                    : '—';

                const reason =
                  r.reason;

                return (
                  <View
                    key={
                      r.id
                    }
                    style={
                      local.card
                    }>

                    <View
                      style={
                        local.cardTopRow
                      }>

                      <View
                        style={
                          local.cardTopLeft
                        }>

                        <Text
                          style={
                            local.bondId
                          }>
                          {
                            r.bondSeriesId
                          }
                        </Text>

                        <View
                          style={
                            local.pendingBadge
                          }>

                          <Text
                            style={
                              local.pendingBadgeText
                            }>
                            Pending
                          </Text>

                        </View>

                        <View
                          style={
                            local.precloseBadge
                          }>

                          <Text
                            style={
                              local.precloseBadgeText
                            }>
                            Pre-Close
                          </Text>

                        </View>

                      </View>

                    </View>

                    <View
                      style={
                        local.metaGrid
                      }>

                      <View
                        style={
                          local.metaCol
                        }>

                        <Text
                          style={
                            local.metaLabel
                          }>
                          Investor
                        </Text>

                        <Text
                          style={
                            local.metaValue
                          }>
                          {
                            r.investorName
                          }
                        </Text>

                      </View>

                      <View
                        style={
                          local.metaCol
                        }>

                        <Text
                          style={
                            local.metaLabel
                          }>
                          Branch
                        </Text>

                        <Text
                          style={
                            local.metaValue
                          }>
                          {
                            branch
                          }
                        </Text>

                      </View>

                    </View>

                    <View
                      style={
                        local.metaGrid
                      }>

                      <View
                        style={
                          local.metaCol
                        }>

                        <Text
                          style={
                            local.metaLabel
                          }>
                          Requested On
                        </Text>

                        <Text
                          style={
                            local.metaValue
                          }>
                          {
                            r.requestedOn
                          }
                        </Text>

                      </View>

                    </View>

                    {reason ? (
                      <View
                        style={
                          local.reasonBox
                        }>

                        <Text
                          style={
                            local.reasonLabel
                          }>
                          Reason:{' '}
                        </Text>

                        <Text
                          style={
                            local.reasonText
                          }>
                          {
                            reason
                          }
                        </Text>

                      </View>
                    ) : null}

                    <View
                      style={
                        local.breakdown
                      }>

                      <View
                        style={
                          local.breakdownRow
                        }>

                        <Text
                          style={
                            local.breakdownLabel
                          }>
                          Principal
                        </Text>

                        <Text
                          style={
                            local.breakdownValue
                          }>
                          {formatINR(
                            r.principal,
                          )}
                        </Text>

                      </View>

                      <View
                        style={
                          local.breakdownRow
                        }>

                        <Text
                          style={
                            local.breakdownLabel
                          }>
                          Interest Earned
                        </Text>

                        <Text
                          style={
                            local.breakdownValue
                          }>
                          {formatINR(
                            r.earned,
                          )}
                        </Text>

                      </View>

                      <View
                        style={
                          local.breakdownRow
                        }>

                        <Text
                          style={
                            local.breakdownLabel
                          }>
                          Early Penalty
                        </Text>

                        <Text
                          style={
                            local.breakdownValueNegative
                          }>
                          -{formatINR(
                            r.penalty,
                          )}
                        </Text>

                      </View>

                      <View
                        style={
                          local.breakdownRowLast
                        }>

                        <Text
                          style={
                            local.netLabel
                          }>
                          Net Pre-Close Amount
                        </Text>

                        <Text
                          style={
                            local.netValue
                          }>
                          {formatINR(
                            r.netAmount,
                          )}
                        </Text>

                      </View>

                    </View>

                    <View
                      style={
                        local.actionsRow
                      }>

                      <TouchableOpacity
                        style={
                          local.rejectBtn
                        }
                        onPress={() =>
                          handleRejectPreClose(
                            r.id,
                            r.bondSeriesId,
                          )
                        }>

                        <Text
                          style={
                            local.rejectBtnText
                          }>
                          Reject
                        </Text>

                      </TouchableOpacity>

                      <TouchableOpacity
                        style={
                          local.approveBtn
                        }
                        onPress={() =>
                          handleApprovePreClose(
                            r.id,
                            r.bondSeriesId,
                            r.netAmount,
                            r.investorName,
                          )
                        }>

                        <Text
                          style={
                            local.approveBtnText
                          }>
                          → Send to Super Admin
                        </Text>

                      </TouchableOpacity>

                    </View>

                  </View>
                );
              },
            )}
          </>
        )}

        {/* ================================================================
            CLOSED SETTLEMENTS
        ================================================================ */}

        {tab === 'closed' && (
          <>
            {closedSettlementRows.length ===
              0 && (
              <View
                style={
                  local.emptyWrap
                }>

                <Text
                  style={
                    local.emptyText
                  }>
                  No closed settlements yet.
                </Text>

              </View>
            )}

            {closedSettlementRows.map(
              row => (
                <View
                  key={
                    row.bond
                      .seriesId
                  }
                  style={
                    local.card
                  }>

                  {/* ------------------------------------------------------
                      SETTLED HEADER
                  ------------------------------------------------------ */}

                  <View
                    style={
                      local.cardTopRow
                    }>

                    <View
                      style={
                        local.cardTopLeft
                      }>

                      <Text
                        style={
                          local.bondId
                        }>
                        {
                          row.bond
                            .seriesId
                        }
                      </Text>

                      <View
                        style={
                          local.closedBadge
                        }>

                        <Text
                          style={
                            local.closedBadgeText
                          }>
                          Settled
                        </Text>

                      </View>

                    </View>

                  </View>

                  {/* ------------------------------------------------------
                      INVESTOR DETAILS
                  ------------------------------------------------------ */}

                  <View
                    style={
                      local.metaGrid
                    }>

                    <View
                      style={
                        local.metaCol
                      }>

                      <Text
                        style={
                          local.metaLabel
                        }>
                        Investor
                      </Text>

                      <Text
                        style={
                          local.metaValue
                        }>
                        {
                          row.investorName
                        }
                      </Text>

                    </View>

                    <View
                      style={
                        local.metaCol
                      }>

                      <Text
                        style={
                          local.metaLabel
                        }>
                        Investor ID
                      </Text>

                      <Text
                        style={
                          local.metaValue
                        }>
                        {
                          row.investorRefId
                        }
                      </Text>

                    </View>

                  </View>

                  {/* ------------------------------------------------------
                      BRANCH / MATURITY DATE
                  ------------------------------------------------------ */}

                  <View
                    style={
                      local.metaGrid
                    }>

                    <View
                      style={
                        local.metaCol
                      }>

                      <Text
                        style={
                          local.metaLabel
                        }>
                        Branch
                      </Text>

                      <Text
                        style={
                          local.metaValue
                        }>
                        {
                          row.branch
                        }
                      </Text>

                    </View>

                    <View
                      style={
                        local.metaCol
                      }>

                      <Text
                        style={
                          local.metaLabel
                        }>
                        Maturity Date
                      </Text>

                      <Text
                        style={
                          local.metaValue
                        }>
                        {
                          row.bond
                            .maturityDate
                        }
                      </Text>

                    </View>

                  </View>

                  {/* ------------------------------------------------------
                      SETTLEMENT BREAKDOWN
                  ------------------------------------------------------ */}

                  <View
                    style={
                      local.breakdown
                    }>

                    <View
                      style={
                        local.breakdownRow
                      }>

                      <Text
                        style={
                          local.breakdownLabel
                        }>
                        Principal
                      </Text>

                      <Text
                        style={
                          local.breakdownValue
                        }>
                        {formatINR(
                          row.principal,
                        )}
                      </Text>

                    </View>

                    <View
                      style={
                        local.breakdownRow
                      }>

                      <Text
                        style={
                          local.breakdownLabel
                        }>
                        Total Interest Earned
                      </Text>

                      <Text
                        style={
                          local.breakdownValue
                        }>
                        {formatINR(
                          row.totalInterest,
                        )}
                      </Text>

                    </View>

                    <View
                      style={
                        local.breakdownRowLast
                      }>

                      <Text
                        style={
                          local.netLabel
                        }>
                        Net Settlement Amount
                      </Text>

                      <Text
                        style={
                          local.netValue
                        }>
                        {formatINR(
                          row.netSettlement,
                        )}
                      </Text>

                    </View>

                  </View>

                </View>
              ),
            )}
          </>
        )}

      </ScrollView>

      <AdminBottomTabBar
        active="More"
        navigation={navigation}
      />

    </SafeAreaView>
  );
};

export default SettlementCalculatorScreen;