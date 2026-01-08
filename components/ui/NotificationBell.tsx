import BASE_URL from '@/utils/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface TaxiAssignment {
  id: number;
  plateNo: string;
  fromRoute: string;
  toRoute: string;
  status: string;
  time: string;
}

interface NotificationBellProps {
  stationId?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ stationId }) => {
  const [notifications, setNotifications] = useState<TaxiAssignment[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [route, setRoute] = useState<string | null>(null);

  const iconSize = {
    small: isMobile ? 16 : isTablet ? 18 : 20,
    medium: isMobile ? 20 : isTablet ? 22 : 24,
    large: isMobile ? 24 : isTablet ? 28 : 32,
    xlarge: isMobile ? 28 : isTablet ? 32 : 40,
  };

  const fetchRoute = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Error', 'No token found');

      const res = await axios.get(`${BASE_URL}/dispacher-route`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRoute(res.data.route);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch assigned route');
    }
  };

  useEffect(() => {
    fetchRoute();

    return () => {};
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchRoute();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      if (!route) return;

      const token = await AsyncStorage.getItem('token');
      if (!token && !route) return;

      const response = await axios.get(
        `${BASE_URL}/assignTaxis/fetch-notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { route },
        }
      );

      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    if (!route) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);

    return () => clearInterval(interval);
  }, [route]);

  const toggleDropdown = () => {
    if (dropdownVisible) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const openDropdown = () => {
    setDropdownVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(slideAnim, {
      toValue: -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDropdownVisible(false));
  };

  const markAsRead = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${BASE_URL}/assignTaxis/notifications/read`, {
        notificationIds: [id],

        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;

    const ids = notifications.map((n) => n.id);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${BASE_URL}/assignTaxis/notifications/read`, {
        notificationIds: ids,
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      closeDropdown();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderNotification = ({ item }: { item: TaxiAssignment }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.plateText}>{item.plateNo}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.routeText}>From: {item.fromRoute}</Text>
        <Text style={styles.routeText}>To: {item.toRoute}</Text>
        <View style={styles.statusRow}>
          <Text
            style={[
              styles.statusText,
              item.status === 'available' ? styles.available : styles.busy,
            ]}
          >
            {item.status}
          </Text>
          <Text style={styles.tapHint}>Tap to dismiss</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.bellContainer} onPress={toggleDropdown}>
        <View style={styles.bellIcon}>
          <Text style={styles.bellText}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={isMobile ? 24 : 28}
              color="#FFFFFF"
            />
          </Text>
          {notifications.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notifications.length > 9 ? '9+' : notifications.length}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={dropdownVisible}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeDropdown}
        >
          <Animated.View
            style={[
              styles.dropdown,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Dropdown Header */}
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>
                New Assignments ({notifications.length})
              </Text>
              {notifications.length > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id.toString()}
                style={styles.notificationsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No new assignments</Text>
                <Text style={styles.emptySubText}>
                  When new taxis are assigned, they'll appear here
                </Text>
              </View>
            )}

            {/* Dropdown Footer */}
            <View style={styles.dropdownFooter}>
              <Text style={styles.footerText}>Auto-refresh every 15s</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  bellContainer: {
    padding: 10,
  },
  bellIcon: {
    position: 'relative',
  },
  bellText: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 10,
    width: width * 0.9,
    maxWidth: 350,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: height * 0.7,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    maxHeight: height * 0.5,
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  notificationContent: {
    padding: 15,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  plateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  routeText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  available: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  busy: {
    backgroundColor: '#FFEBEE',
    color: '#C62828',
  },
  tapHint: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 12,
    color: '#CCC',
    textAlign: 'center',
  },
  dropdownFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
});

export default NotificationBell;
