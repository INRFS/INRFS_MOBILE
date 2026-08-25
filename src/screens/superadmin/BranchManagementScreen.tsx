import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';
import {styles} from '../../styles/superadmin/BranchManagementScreen.styles';
import {
  getBranches,
  createBranch,
  updateBranch,
  getBranchDetails,
  getBranchStates,
  getErrorMessage,
  BranchRecord,
  StateOption,
} from '../../services/superadmin/superAdminBranchService';

type StatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED';

const PAGE_SIZE = 10;

const BranchManagementScreen = ({navigation}: any) => {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Pagination & Search & Filters
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<number | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilter>('ALL');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // ---- Add Branch modal state ----
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addBranchName, setAddBranchName] = useState('');
  const [addCityName, setAddCityName] = useState('');
  const [addStateId, setAddStateId] = useState<number | null>(null);
  const [addIsActive, setAddIsActive] = useState(true);
  const [addErrors, setAddErrors] = useState<{branchName?: string; cityName?: string; stateId?: string}>({});
  const [isCreating, setIsCreating] = useState(false);

  // ---- View Details modal state ----
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingBranch, setViewingBranch] = useState<BranchRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // ---- Edit Branch modal state ----
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);
  const [editBranchName, setEditBranchName] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [editStateId, setEditStateId] = useState<number | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editErrors, setEditErrors] = useState<{branchName?: string; cityName?: string; stateId?: string}>({});
  const [isUpdating, setIsUpdating] = useState(false);

  /* ==========================================================
     LOAD DATA
     ========================================================== */

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError('');

      const offset = (page - 1) * PAGE_SIZE;
      const isActiveParam =
        selectedStatusFilter === 'ACTIVE'
          ? true
          : selectedStatusFilter === 'SUSPENDED'
          ? false
          : undefined;

      const [branchRes, statesRes] = await Promise.all([
        getBranches({
          limit: PAGE_SIZE,
          offset,
          search: search.trim() || undefined,
          state_id: selectedStateFilter || undefined,
          is_active: isActiveParam,
        }),
        getBranchStates(),
      ]);

      setBranches(branchRes.records || []);
      setTotalCount(branchRes.total || (branchRes.records || []).length);
      if (statesRes && statesRes.length > 0) {
        setStates(statesRes);
      }
    } catch (err: any) {
      console.log('Error loading branch data:', err);
      setError(getErrorMessage(err) || 'Failed to load branches. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, selectedStateFilter, selectedStatusFilter]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const activeFilterCount =
    (selectedStateFilter ? 1 : 0) + (selectedStatusFilter !== 'ALL' ? 1 : 0);

  const resetFilters = () => {
    setSelectedStateFilter(null);
    setSelectedStatusFilter('ALL');
    setPage(1);
    setShowFilterModal(false);
  };

  /* ==========================================================
     CREATE BRANCH
     ========================================================== */

  const handleOpenAdd = () => {
    setAddBranchName('');
    setAddCityName('');
    setAddStateId(states[0]?.id || null);
    setAddIsActive(true);
    setAddErrors({});
    setAddModalVisible(true);
  };

  const handleCreateBranch = async () => {
    const errs: {branchName?: string; cityName?: string; stateId?: string} = {};
    if (!addBranchName.trim()) {
      errs.branchName = 'Branch name is required';
    } else if (addBranchName.trim().length < 2) {
      errs.branchName = 'Branch name must be at least 2 characters';
    }

    if (!addCityName.trim()) {
      errs.cityName = 'City name is required';
    } else if (addCityName.trim().length < 2) {
      errs.cityName = 'City name must be at least 2 characters';
    }

    if (!addStateId) {
      errs.stateId = 'Please select a state';
    }

    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setIsCreating(true);
      await createBranch({
        branch_name: addBranchName.trim(),
        city_name: addCityName.trim(),
        state_id: addStateId!,
        is_active: addIsActive,
      });

      setAddModalVisible(false);
      await loadData(false);
      Alert.alert('Success', 'Branch created successfully.');
    } catch (err: any) {
      Alert.alert('Creation Failed', getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  /* ==========================================================
     EDIT BRANCH
     ========================================================== */

  const handleOpenEdit = (branch: BranchRecord) => {
    setEditingBranch(branch);
    setEditBranchName(branch.name !== '—' ? branch.name : '');
    setEditCityName(branch.cityName !== '—' ? branch.cityName : '');
    setEditStateId(branch.stateId || states[0]?.id || null);
    setEditIsActive(branch.isActive);
    setEditErrors({});
    setEditModalVisible(true);
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch) return;

    const errs: {branchName?: string; cityName?: string; stateId?: string} = {};
    if (!editBranchName.trim()) {
      errs.branchName = 'Branch name is required';
    } else if (editBranchName.trim().length < 2) {
      errs.branchName = 'Branch name must be at least 2 characters';
    }

    if (!editCityName.trim()) {
      errs.cityName = 'City name is required';
    } else if (editCityName.trim().length < 2) {
      errs.cityName = 'City name must be at least 2 characters';
    }

    if (!editStateId) {
      errs.stateId = 'Please select a state';
    }

    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      setIsUpdating(true);
      await updateBranch(editingBranch.id, {
        branch_name: editBranchName.trim(),
        city_name: editCityName.trim(),
        state_id: editStateId!,
        is_active: editIsActive,
      });

      setEditModalVisible(false);
      setEditingBranch(null);
      await loadData(false);
      Alert.alert('Success', 'Branch updated successfully.');
    } catch (err: any) {
      Alert.alert('Update Failed', getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  /* ==========================================================
     VIEW DETAILS
     ========================================================== */

  const handleOpenView = async (branch: BranchRecord) => {
    setViewingBranch(branch);
    setViewModalVisible(true);
    setDetailsLoading(true);

    try {
      const detailed = await getBranchDetails(branch.id);
      if (detailed) {
        setViewingBranch(detailed);
      }
    } catch (err) {
      console.log('Error fetching detailed branch:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Branch Management" />

      {/* HEADER TITLE & SUMMARY */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Branch Management</Text>
        <Text style={styles.headerSubtitle}>
          Branches across all states — {totalCount} {totalCount === 1 ? 'branch' : 'branches'}
        </Text>
      </View>

      {/* TOP SEARCH & ACTION TOOLBAR */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, city, admin..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => handleSearchChange('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          activeOpacity={0.8}
          onPress={() => setShowFilterModal(true)}>
          <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
            ⚡ {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={handleOpenAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVE FILTER CHIPS */}
      {activeFilterCount > 0 && (
        <View style={styles.activeChipsRow}>
          {selectedStateFilter ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>
                State: {states.find(s => s.id === selectedStateFilter)?.stateName || selectedStateFilter}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedStateFilter(null);
                  setPage(1);
                }}>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {selectedStatusFilter !== 'ALL' ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>Status: {selectedStatusFilter}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedStatusFilter('ALL');
                  setPage(1);
                }}>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity onPress={resetFilters} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ERROR BANNER */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadData(true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(false)}
            colors={['#0B1E45', '#2563EB']}
          />
        }>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0B1E45" />
            <Text style={styles.loadingText}>Loading branches...</Text>
          </View>
        ) : branches.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>🏢</Text>
            </View>
            <Text style={styles.emptyTitle}>No branches found</Text>
            <Text style={styles.emptyText}>
              {search || activeFilterCount > 0
                ? 'Try adjusting your search query or filters.'
                : 'No branches registered in the system.'}
            </Text>
            {activeFilterCount > 0 || search ? (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => {
                  setSearch('');
                  resetFilters();
                }}>
                <Text style={styles.clearFilterBtnText}>Reset Filters & Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          branches.map(branch => {
            const isActive = branch.isActive;
            const initial =
              branch.name && branch.name !== '—'
                ? branch.name.trim().charAt(0).toUpperCase()
                : 'B';

            return (
              <View
                key={String(branch.id)}
                style={[
                  styles.card,
                  {borderLeftColor: isActive ? '#059669' : '#DC2626'},
                ]}>
                {/* CARD HEADER: AVATAR INITIAL + BRANCH NAME & CITY/STATE + STATUS BADGE */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.branchName} numberOfLines={1}>
                      {branch.name}
                    </Text>
                    <Text style={styles.branchLocation} numberOfLines={1}>
                      {branch.cityName}
                      {branch.stateName !== '—' ? `, ${branch.stateName}` : ''}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
                    ]}>
                    <View
                      style={[
                        styles.statusDot,
                        {backgroundColor: isActive ? '#059669' : '#DC2626'},
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isActive ? styles.statusTextActive : styles.statusTextInactive,
                      ]}>
                      {branch.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* INFO GRID ROW 1: ADMIN & INVESTORS */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>ADMIN / MANAGER</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {branch.adminName}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>TOTAL INVESTORS</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {branch.investorCount}
                    </Text>
                  </View>
                </View>

                {/* INFO GRID ROW 2: LOCATION & AUM */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>LOCATION</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {branch.cityName}{branch.stateName !== '—' ? `, ${branch.stateName}` : ''}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>BRANCH AUM</Text>
                    <Text style={styles.aumValue} numberOfLines={1}>
                      {branch.aum}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* ACTIONS ROW (View & Edit only, NO delete) */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtnView}
                    activeOpacity={0.7}
                    onPress={() => handleOpenView(branch)}>
                    <Text style={styles.actionBtnViewText}>👁️ View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    activeOpacity={0.7}
                    onPress={() => handleOpenEdit(branch)}>
                    <Text style={styles.actionBtnEditText}>✏️ Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && totalCount > 0 && (
          <View style={styles.paginationBar}>
            <Text style={styles.pageInfoText}>
              Showing {(page - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </Text>

            <View style={styles.paginationBtnGroup}>
              <TouchableOpacity
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                disabled={page <= 1}
                onPress={handlePrevPage}>
                <Text style={[styles.pageBtnText, page <= 1 && styles.pageBtnTextDisabled]}>
                  ◀ Prev
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                disabled={page >= totalPages}
                onPress={handleNextPage}>
                <Text style={[styles.pageBtnText, page >= totalPages && styles.pageBtnTextDisabled]}>
                  Next ▶
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ======================================================
          FILTER MODAL
          ====================================================== */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filter Branches</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
              {/* STATUS FILTER */}
              <Text style={styles.filterSectionLabel}>STATUS</Text>
              <View style={styles.segmentedRow}>
                {(['ALL', 'ACTIVE', 'SUSPENDED'] as StatusFilter[]).map(statusKey => (
                  <TouchableOpacity
                    key={statusKey}
                    style={[
                      styles.segmentedBtn,
                      selectedStatusFilter === statusKey && styles.segmentedBtnActive,
                    ]}
                    onPress={() => setSelectedStatusFilter(statusKey)}>
                    <Text
                      style={[
                        styles.segmentedText,
                        selectedStatusFilter === statusKey && styles.segmentedTextActive,
                      ]}>
                      {statusKey === 'ALL' ? 'All' : statusKey === 'ACTIVE' ? 'Active' : 'Suspended'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* STATE FILTER */}
              <Text style={[styles.filterSectionLabel, {marginTop: 16}]}>STATE</Text>
              <View style={styles.pillRow}>
                <TouchableOpacity
                  style={[
                    styles.selectPill,
                    selectedStateFilter === null && styles.selectPillActive,
                  ]}
                  onPress={() => setSelectedStateFilter(null)}>
                  <Text
                    style={[
                      styles.selectPillText,
                      selectedStateFilter === null && styles.selectPillTextActive,
                    ]}>
                    All States
                  </Text>
                </TouchableOpacity>

                {states.map(s => (
                  <TouchableOpacity
                    key={String(s.id)}
                    style={[
                      styles.selectPill,
                      selectedStateFilter === s.id && styles.selectPillActive,
                    ]}
                    onPress={() => setSelectedStateFilter(s.id)}>
                    <Text
                      style={[
                        styles.selectPillText,
                        selectedStateFilter === s.id && styles.selectPillTextActive,
                      ]}>
                      {s.stateName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetFilters}>
                <Text style={styles.cancelBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setPage(1);
                  setShowFilterModal(false);
                }}>
                <Text style={styles.submitBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          VIEW BRANCH DETAILS MODAL
          ====================================================== */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {viewingBranch && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Branch Details</Text>
                  <TouchableOpacity
                    onPress={() => setViewModalVisible(false)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {detailsLoading ? (
                  <View style={{paddingVertical: 30, alignItems: 'center'}}>
                    <ActivityIndicator size="small" color="#0B1E45" />
                    <Text style={{marginTop: 8, color: '#64748B', fontSize: 13}}>
                      Loading details...
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>BRANCH NAME</Text>
                      <Text style={styles.detailVal}>{viewingBranch.name}</Text>
                    </View>
                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>CITY</Text>
                      <Text style={styles.detailVal}>{viewingBranch.cityName}</Text>
                    </View>
                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>STATE</Text>
                      <Text style={styles.detailVal}>{viewingBranch.stateName}</Text>
                    </View>
                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>STATUS</Text>
                      <Text
                        style={[
                          styles.detailVal,
                          {
                            color: viewingBranch.isActive ? '#059669' : '#DC2626',
                            fontWeight: '700',
                          },
                        ]}>
                        {viewingBranch.status}
                      </Text>
                    </View>
                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>ASSIGNED ADMIN / MANAGER</Text>
                      <Text style={styles.detailVal}>{viewingBranch.adminName}</Text>
                    </View>
                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>TOTAL INVESTORS</Text>
                      <Text style={styles.detailVal}>{viewingBranch.investorCount}</Text>
                    </View>
                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>BRANCH AUM</Text>
                      <Text style={[styles.detailVal, {color: '#059669', fontWeight: '800'}]}>
                        {viewingBranch.aum}
                      </Text>
                    </View>
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.doneBtn}
                  activeOpacity={0.8}
                  onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.doneBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================================================
          ADD BRANCH MODAL
          ====================================================== */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Create New Branch</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Branch Name *</Text>
              <TextInput
                style={[styles.textInput, addErrors.branchName && styles.inputError]}
                placeholder="e.g. Madhapur Branch"
                placeholderTextColor="#94A3B8"
                value={addBranchName}
                onChangeText={val => {
                  setAddBranchName(val);
                  if (addErrors.branchName) setAddErrors(e => ({...e, branchName: undefined}));
                }}
              />
              {addErrors.branchName ? (
                <Text style={styles.errorTextSmall}>{addErrors.branchName}</Text>
              ) : null}

              <Text style={styles.inputLabel}>City Name *</Text>
              <TextInput
                style={[styles.textInput, addErrors.cityName && styles.inputError]}
                placeholder="e.g. Hyderabad"
                placeholderTextColor="#94A3B8"
                value={addCityName}
                onChangeText={val => {
                  setAddCityName(val);
                  if (addErrors.cityName) setAddErrors(e => ({...e, cityName: undefined}));
                }}
              />
              {addErrors.cityName ? (
                <Text style={styles.errorTextSmall}>{addErrors.cityName}</Text>
              ) : null}

              <Text style={styles.inputLabel}>Select State *</Text>
              <View style={styles.pillRow}>
                {states.map(s => (
                  <TouchableOpacity
                    key={String(s.id)}
                    style={[
                      styles.selectPill,
                      addStateId === s.id && styles.selectPillActive,
                    ]}
                    onPress={() => {
                      setAddStateId(s.id);
                      if (addErrors.stateId) setAddErrors(e => ({...e, stateId: undefined}));
                    }}>
                    <Text
                      style={[
                        styles.selectPillText,
                        addStateId === s.id && styles.selectPillTextActive,
                      ]}>
                      {s.stateName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {addErrors.stateId ? (
                <Text style={styles.errorTextSmall}>{addErrors.stateId}</Text>
              ) : null}

              <Text style={styles.inputLabel}>Initial Status</Text>
              <View style={styles.statusToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    addIsActive && styles.statusToggleBtnActiveGreen,
                  ]}
                  onPress={() => setAddIsActive(true)}>
                  <Text
                    style={[
                      styles.statusToggleText,
                      addIsActive && styles.statusToggleTextActiveGreen,
                    ]}>
                    ✓ Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    !addIsActive && styles.statusToggleBtnActiveRed,
                  ]}
                  onPress={() => setAddIsActive(false)}>
                  <Text
                    style={[
                      styles.statusToggleText,
                      !addIsActive && styles.statusToggleTextActiveRed,
                    ]}>
                    ✕ Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, isCreating && {opacity: 0.6}]}
                disabled={isCreating}
                activeOpacity={0.8}
                onPress={handleCreateBranch}>
                {isCreating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Branch</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          EDIT BRANCH MODAL
          ====================================================== */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Branch</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Branch Name *</Text>
              <TextInput
                style={[styles.textInput, editErrors.branchName && styles.inputError]}
                value={editBranchName}
                onChangeText={val => {
                  setEditBranchName(val);
                  if (editErrors.branchName) setEditErrors(e => ({...e, branchName: undefined}));
                }}
              />
              {editErrors.branchName ? (
                <Text style={styles.errorTextSmall}>{editErrors.branchName}</Text>
              ) : null}

              <Text style={styles.inputLabel}>City Name *</Text>
              <TextInput
                style={[styles.textInput, editErrors.cityName && styles.inputError]}
                value={editCityName}
                onChangeText={val => {
                  setEditCityName(val);
                  if (editErrors.cityName) setEditErrors(e => ({...e, cityName: undefined}));
                }}
              />
              {editErrors.cityName ? (
                <Text style={styles.errorTextSmall}>{editErrors.cityName}</Text>
              ) : null}

              <Text style={styles.inputLabel}>State *</Text>
              <View style={styles.pillRow}>
                {states.map(s => (
                  <TouchableOpacity
                    key={String(s.id)}
                    style={[
                      styles.selectPill,
                      editStateId === s.id && styles.selectPillActive,
                    ]}
                    onPress={() => {
                      setEditStateId(s.id);
                      if (editErrors.stateId) setEditErrors(e => ({...e, stateId: undefined}));
                    }}>
                    <Text
                      style={[
                        styles.selectPillText,
                        editStateId === s.id && styles.selectPillTextActive,
                      ]}>
                      {s.stateName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {editErrors.stateId ? (
                <Text style={styles.errorTextSmall}>{editErrors.stateId}</Text>
              ) : null}

              <Text style={styles.inputLabel}>Branch Status</Text>
              <View style={styles.statusToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    editIsActive && styles.statusToggleBtnActiveGreen,
                  ]}
                  onPress={() => setEditIsActive(true)}>
                  <Text
                    style={[
                      styles.statusToggleText,
                      editIsActive && styles.statusToggleTextActiveGreen,
                    ]}>
                    ✓ Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    !editIsActive && styles.statusToggleBtnActiveRed,
                  ]}
                  onPress={() => setEditIsActive(false)}>
                  <Text
                    style={[
                      styles.statusToggleText,
                      !editIsActive && styles.statusToggleTextActiveRed,
                    ]}>
                    ✕ Inactive / Suspended
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, isUpdating && {opacity: 0.6}]}
                disabled={isUpdating}
                activeOpacity={0.8}
                onPress={handleUpdateBranch}>
                {isUpdating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BranchManagementScreen;