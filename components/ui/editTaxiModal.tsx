import BASE_URL from '@/utils/config';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

type Taxi = {
  id: number;
  DriversName: string;
  LicenceNo: string;
  PlateNo: string;
  PhoneNo: string;
};

type EditTaxiModalProps = {
  visible: boolean;
  onClose: () => void;
  taxi: Taxi | null;
  onTaxiUpdated: (updatedTaxi: Taxi) => void;
};

const EditTaxiModal: React.FC<EditTaxiModalProps> = ({
  visible,
  onClose,
  taxi,
  onTaxiUpdated,
}) => {
  const [DriversName, setDriversName] = useState('');
  const [PhoneNo, setPhoneNo] = useState('');
  const [LicenceNo, setLicenceNo] = useState('');
  const [PlateNo, setPlateNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [originalTaxi, setOriginalTaxi] = useState<Taxi | null>(null);
  const [existingRecords, setExistingRecords] = useState<{
    licenceNos: string[];
    plateNos: string[];
  }>({
    licenceNos: [],
    plateNos: [],
  });

  const [errors, setErrors] = useState({
    DriversName: '',
    PhoneNo: '',
    LicenceNo: '',
    PlateNo: '',
  });

  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isSmallScreen = width < 768;
  const isMediumScreen = width >= 768 && width < 1024;
  const isLargeScreen = width >= 1024;

  const formatEthiopianPhoneNumber = (text: string) => {
    const digits = text.replace(/\D/g, '');

    if (digits.startsWith('251') && digits.length >= 12) {
      return `+${digits.substring(0, 12)}`;
    }

    if (digits.startsWith('09') && digits.length <= 10) {
      const rest = digits.substring(2);
      return `+2519${rest}`;
    }

    if (
      digits.startsWith('9') &&
      !digits.startsWith('09') &&
      digits.length <= 9
    ) {
      return `+251${digits}`;
    }

    if (digits.startsWith('251')) {
      return `+${digits}`;
    }

    return text;
  };

  const fetchExistingRecords = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${BASE_URL}/taxis/existing-records`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setExistingRecords({
          licenceNos: res.data.licenceNos || [],
          plateNos: res.data.plateNos || [],
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch existing records:', err);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchExistingRecords();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && taxi) {
      setDriversName(taxi.DriversName);
      setPhoneNo(taxi.PhoneNo);
      setLicenceNo(taxi.LicenceNo);
      setPlateNo(taxi.PlateNo);
      setOriginalTaxi(taxi);
      setErrors({
        DriversName: '',
        PhoneNo: '',
        LicenceNo: '',
        PlateNo: '',
      });
    }
  }, [visible, taxi]);

  const hasChanges = () => {
    if (!originalTaxi) return false;
    return (
      DriversName.trim() !== originalTaxi.DriversName ||
      PhoneNo !== originalTaxi.PhoneNo ||
      LicenceNo !== originalTaxi.LicenceNo ||
      PlateNo !== originalTaxi.PlateNo
    );
  };

  const validateInputs = () => {
    const newErrors = {
      DriversName: '',
      PhoneNo: '',
      LicenceNo: '',
      PlateNo: '',
    };
    let isValid = true;

    if (!DriversName.trim()) {
      newErrors.DriversName = "Driver's name is required";
      isValid = false;
    }
    if (!PhoneNo.trim()) {
      newErrors.PhoneNo = 'Phone number is required';
      isValid = false;
    }
    if (!LicenceNo.trim()) {
      newErrors.LicenceNo = 'Licence number is required';
      isValid = false;
    }
    if (!PlateNo.trim()) {
      newErrors.PlateNo = 'Plate number is required';
      isValid = false;
    }

    if (DriversName.trim() && !/^[A-Za-z\s]+$/.test(DriversName.trim())) {
      newErrors.DriversName = "Driver's name must contain only letters";
      isValid = false;
    }

    if (PhoneNo.trim()) {
      const cleanedPhone = PhoneNo.replace(/\s/g, '').replace(/[^\d+]/g, '');
      if (!/^\+2519\d{8}$/.test(cleanedPhone)) {
        newErrors.PhoneNo = 'Phone must be +2519XXXXXXXX format';
        isValid = false;
      }
    }

    if (LicenceNo.trim()) {
      if (!/^\d{6}$/.test(LicenceNo.trim())) {
        newErrors.LicenceNo = 'Licence number must be exactly 6 digits';
        isValid = false;
      }

      if (
        existingRecords.licenceNos.includes(LicenceNo.trim()) &&
        (!originalTaxi || LicenceNo.trim() !== originalTaxi.LicenceNo)
      ) {
        newErrors.LicenceNo = 'Licence number already exists';
        isValid = false;
      }
    }

    if (PlateNo.trim()) {
      if (!/^\d{5}$/.test(PlateNo.trim())) {
        newErrors.PlateNo = 'Plate number must be 5 digits';
        isValid = false;
      }

      if (
        existingRecords.plateNos.includes(PlateNo.trim()) &&
        (!originalTaxi || PlateNo.trim() !== originalTaxi.PlateNo)
      ) {
        newErrors.PlateNo = 'Plate number already exists';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async () => {
    if (!validateInputs()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    if (!hasChanges()) {
      Alert.alert('No Changes', 'No changes were made to update');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'No token found');

      const response = await axios.put(
        `${BASE_URL}/taxis/${taxi?.id}`,
        {
          DriversName: DriversName.trim(),
          PhoneNo: PhoneNo.trim(),
          LicenceNo: LicenceNo.trim(),
          PlateNo: PlateNo.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert(
        'Success',
        response.data.message || 'Taxi information updated successfully!'
      );

      if (taxi) {
        const updatedTaxi = {
          ...taxi,
          DriversName: DriversName.trim(),
          PhoneNo: PhoneNo.trim(),
          LicenceNo: LicenceNo.trim(),
          PlateNo: PlateNo.trim(),
        };
        onTaxiUpdated(updatedTaxi);
      }

      onClose();
    } catch (err: any) {
      console.error('Update error:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to update taxi information';

      if (errorMessage.includes('already exists')) {
        if (errorMessage.includes('Licence')) {
          setErrors((prev) => ({
            ...prev,
            LicenceNo: 'Licence number already exists',
          }));
        } else if (errorMessage.includes('Plate')) {
          setErrors((prev) => ({
            ...prev,
            PlateNo: 'Plate number already exists',
          }));
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePhoneNumberChange = (text: string) => {
    const formatted = formatEthiopianPhoneNumber(text);
    setPhoneNo(formatted);
    clearError('PhoneNo');
  };

  const handleLicenceChange = (text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 6) {
      setLicenceNo(numbersOnly);
      clearError('LicenceNo');
    }
  };

  const handlePlateChange = (text: string) => {
    const numbersOnly = text.replace(/[^0-9]/g, '');
    if (numbersOnly.length <= 5) {
      setPlateNo(numbersOnly);
      clearError('PlateNo');
    }
  };

  if (!taxi) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="edit" size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>Edit Taxi Information</Text>
                <Text style={styles.subtitle}>Taxi ID: #{taxi.id}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={!isSmallScreen}
            contentContainerStyle={styles.scrollContent}
          >
            <View
              style={[
                styles.mainContent,
                {
                  flexDirection: isSmallScreen ? 'column' : 'row',
                  gap: isSmallScreen ? 0 : 32,
                },
              ]}
            >
              <View
                style={[
                  styles.column,
                  {
                    flex: 1,
                    minWidth: isSmallScreen ? '100%' : 300,
                  },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="person" size={20} color="#2196F3" />
                  <Text style={styles.sectionTitle}>Driver Information</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Driver's Name <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="person"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        errors.DriversName ? styles.inputError : null,
                        { paddingLeft: 40 },
                      ]}
                      placeholder="Enter driver's full name"
                      value={DriversName}
                      onChangeText={(text) => {
                        setDriversName(text);
                        clearError('DriversName');
                      }}
                    />
                  </View>
                  {errors.DriversName ? (
                    <View style={styles.errorContainer}>
                      <MaterialIcons
                        name="error-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <Text style={styles.errorText}>{errors.DriversName}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Phone Number <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="phone"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        errors.PhoneNo ? styles.inputError : null,
                        { paddingLeft: 40 },
                      ]}
                      placeholder="+2519XXXXXXXXX"
                      value={PhoneNo}
                      onChangeText={handlePhoneNumberChange}
                      keyboardType="phone-pad"
                      maxLength={13}
                    />
                  </View>
                  {errors.PhoneNo ? (
                    <View style={styles.errorContainer}>
                      <MaterialIcons
                        name="error-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <Text style={styles.errorText}>{errors.PhoneNo}</Text>
                    </View>
                  ) : (
                    <Text style={styles.helperText}>
                      Format: +2519 followed by 9 digits
                    </Text>
                  )}
                </View>
              </View>

              <View
                style={[
                  styles.column,
                  {
                    flex: 1,
                    minWidth: isSmallScreen ? '100%' : 300,
                    marginTop: isSmallScreen ? 24 : 0,
                  },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <MaterialIcons
                    name="directions-car"
                    size={20}
                    color="#2196F3"
                  />
                  <Text style={styles.sectionTitle}>Vehicle Information</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Licence Number <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="badge"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        errors.LicenceNo ? styles.inputError : null,
                        { paddingLeft: 40 },
                      ]}
                      placeholder="6 digits (e.g., 123456)"
                      value={LicenceNo}
                      onChangeText={handleLicenceChange}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                  {errors.LicenceNo ? (
                    <View style={styles.errorContainer}>
                      <MaterialIcons
                        name="error-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <Text style={styles.errorText}>{errors.LicenceNo}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Plate Number <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons
                      name="directions-car"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        errors.PlateNo ? styles.inputError : null,
                        { paddingLeft: 40, letterSpacing: 1 },
                      ]}
                      placeholder="5 digits (e.g., 12345)"
                      value={PlateNo}
                      onChangeText={handlePlateChange}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  {errors.PlateNo ? (
                    <View style={styles.errorContainer}>
                      <MaterialIcons
                        name="error-outline"
                        size={16}
                        color="#EF4444"
                      />
                      <Text style={styles.errorText}>{errors.PlateNo}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <MaterialIcons name="close" size={20} color="#64748B" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.updateButton,
                (!hasChanges() || loading) && styles.buttonDisabled,
              ]}
              onPress={handleUpdate}
              disabled={!hasChanges() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.updateButtonText}>Update Taxi</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  mainContent: {
    flex: 1,
  },
  column: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingRight: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  changeSummarySection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    marginBottom: 24,
  },
  changesScrollView: {
    flex: 1,
  },
  changesGrid: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 100,
  },
  changeItem: {
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
  },
  changeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  changeValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldValue: {
    fontSize: 14,
    color: '#DC2626',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  newValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    flex: 1,
  },
  changeArrow: {
    marginHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
});

export default EditTaxiModal;
