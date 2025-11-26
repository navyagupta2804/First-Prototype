import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import notificationService from '../../../services/notificationService';
import webNotificationService from '../../../services/webNotificationService';

export default function SettingsScreen({ onClose }) {
  const [settings, setSettings] = useState({
    dailyReminders: true,
    reminderTime: '09:00',
    friendActivity: true,
    webNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] = useState('unknown');
  const auth = getAuth();
  const user = auth.currentUser;

  const isWeb = Platform.OS === 'web';

  // Load settings
  useEffect(() => {
    loadSettings();
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = () => {
    if (isWeb && webNotificationService.isSupported()) {
      const status = webNotificationService.getPermissionStatus();
      setNotificationStatus(status);
    }
  };

  const loadSettings = async () => {
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData?.notificationSettings) {
        setSettings(userData.notificationSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      if (isWeb) {
        await webNotificationService.updateSettings(user.uid, newSettings);
      } else {
        await notificationService.updateSettings(user.uid, newSettings);

        // Reschedule notifications if daily reminder settings changed (mobile only)
        if (key === 'dailyReminders' || key === 'reminderTime') {
          if (newSettings.dailyReminders) {
            const [hour, minute] = newSettings.reminderTime.split(':').map(Number);
            await notificationService.scheduleDailyReminder(hour, minute);
          } else {
            await notificationService.cancelAllScheduledNotifications();
          }
        }
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      if (isWeb) {
        // Web notification flow
        if (!webNotificationService.isSupported()) {
          alert('Web notifications are not supported in this browser');
          return;
        }

        const { status, token } = await webNotificationService.requestPermission();
        
        if (status === 'granted' && token) {
          await webNotificationService.registerToken(user.uid, token);
          setNotificationStatus('granted');
          alert('Web notifications enabled! You will now receive push notifications.');
        } else if (status === 'denied') {
          setNotificationStatus('denied');
          alert('Notification permission denied. Please enable notifications in your browser settings.');
        } else {
          alert('Please allow notifications when prompted by your browser.');
        }
      } else {
        // Mobile notification flow (Android)
        const { status, token } = await notificationService.requestPermissions();
        
        if (status === 'granted' && token) {
          await notificationService.registerToken(user.uid, token);
          alert('Notifications enabled!');
        } else {
          alert('Please enable notifications in your device settings');
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>← Back to Profile</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        {/* Web-specific notification toggle */}
        {isWeb && (
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Web Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications in your browser
              </Text>
              {notificationStatus === 'granted' && (
                <Text style={styles.statusGranted}>✓ Enabled</Text>
              )}
              {notificationStatus === 'denied' && (
                <Text style={styles.statusDenied}>✗ Denied - Check browser settings</Text>
              )}
            </View>
            <Switch
              value={settings.webNotifications}
              onValueChange={(value) => updateSetting('webNotifications', value)}
              disabled={notificationStatus === 'denied'}
            />
          </View>
        )}

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Reminders</Text>
            <Text style={styles.settingDescription}>
              Get reminded about your cooking goals
            </Text>
          </View>
          <Switch
            value={settings.dailyReminders}
            onValueChange={(value) => updateSetting('dailyReminders', value)}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Friend Activity</Text>
            <Text style={styles.settingDescription}>
              Get notified when friends post or complete goals
            </Text>
          </View>
          <Switch
            value={settings.friendActivity}
            onValueChange={(value) => updateSetting('friendActivity', value)}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={requestNotificationPermissions}
        >
          <Text style={styles.buttonText}>
            {isWeb ? 'Enable Web Notifications' : 'Enable Push Notifications'}
          </Text>
        </TouchableOpacity>

        {isWeb && notificationStatus === 'denied' && (
          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>How to enable notifications:</Text>
            <Text style={styles.helpText}>
              1. Click the lock icon in your browser's address bar{'\n'}
              2. Find "Notifications" in the permissions list{'\n'}
              3. Change it to "Allow"{'\n'}
              4. Refresh the page and try again
            </Text>
          </View>
        )}
      </View>

      {!isWeb && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={async () => {
              const scheduled = await notificationService.getAllScheduledNotifications();
              console.log('Scheduled notifications:', scheduled);
              alert(`${scheduled.length} scheduled notifications`);
            }}
          >
            <Text style={styles.buttonText}>Show Scheduled Notifications</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Platform: {Platform.OS}</Text>
        <Text style={styles.infoText}>
          {isWeb 
            ? 'Using web push notifications via Firebase Cloud Messaging' 
            : 'Using native mobile notifications'
          }
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111216',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusGranted: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '600',
  },
  statusDenied: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  debugButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#f9fafb',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
