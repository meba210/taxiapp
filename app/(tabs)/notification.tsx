import { TaxiAssignment } from '@/type/index';
import BASE_URL from '@/utils/config';
import axios, { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface NotificationsScreenProps {
  stationId: number;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  stationId,
}) => {
  const [notifications, setNotifications] = useState<TaxiAssignment[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotifications = async (): Promise<void> => {
    try {
      const response: AxiosResponse<TaxiAssignment[]> = await axios.get(
        `${BASE_URL}/assignTaxis/notifications/${stationId}`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number): Promise<void> => {
    try {
      const ids: number = id;
      await axios.post(`${BASE_URL}/assignTaxis/notifications/read`, {
        notificationIds: [ids],
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {}
  };

  const markAllAsRead = async (): Promise<void> => {
    if (notifications.length === 0) return;

    const ids: number[] = notifications.map((n) => n.id);
    try {
      await axios.post(`${BASE_URL}/assignTaxis/notifications/read`, {
        notificationIds: ids,
      });
      setNotifications([]);
    } catch (error) {}
  };

  const renderNotification = ({ item }: { item: TaxiAssignment }) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.plateText}>{item.plateNo}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>

      <View style={styles.routeContainer}>
        <Text style={styles.routeText}> From: {item.fromRoute}</Text>
        <Text style={styles.routeText}> To: {item.toRoute}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusText,
            item.status === 'available' ? styles.available : styles.busy,
          ]}
        >
          {item.status.toUpperCase()}
        </Text>
        <Text style={styles.tapText}>Tap to dismiss →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Assignments</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.clearAll}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item: TaxiAssignment) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No new assignments</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchNotifications}
          />
        }
      />

      <View style={styles.footer}>
        <Text style={styles.countText}>
          {notifications.length} new assignment(s)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearAll: {
    color: '#007AFF',
    fontSize: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  plateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  routeContainer: {
    marginVertical: 5,
  },
  routeText: {
    fontSize: 15,
    color: '#444',
    marginVertical: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  busy: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  tapText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  footer: {
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  countText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationsScreen;
