import React from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Platform, View, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Logo Header Component
function LogoHeader() {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require('../../assets/images/logo-header.png')}
        style={styles.headerLogo}
        resizeMode="cover"
      />
    </View>
  );
}

// Floating Action Button Component
function FloatingAddButton() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Only show on specific pages (not on tax or profile)
  const showFAB = ['/', '/index', '/list', '/calendar', '/map'].some(
    path => pathname === path || pathname.startsWith(path + '/')
  );

  if (!showFAB) return null;

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          backgroundColor: colors.primary,
          bottom: Platform.OS === 'ios' ? 100 + insets.bottom : 80,
          shadowColor: colors.primary,
        },
      ]}
      onPress={() => router.push('/visit/add')}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useApp();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            height: Platform.OS === 'ios' ? 88 : 64,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '700',
            fontSize: 18,
          },
          headerTintColor: colors.text,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: () => <LogoHeader />,
            tabBarLabel: t('dashboard'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="list"
          options={{
            title: t('visits'),
            tabBarLabel: t('visits'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: t('calendar'),
            tabBarLabel: t('calendar'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: t('map'),
            tabBarLabel: t('map'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tax"
          options={{
            title: t('tax'),
            tabBarLabel: t('tax'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calculator" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('profile'),
            tabBarLabel: t('profile'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <FloatingAddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  headerLogo: {
    width: SCREEN_WIDTH,
    height: 56,
  },
  headerContainer: {
    width: SCREEN_WIDTH,
    height: 56,
    overflow: 'hidden',
  },
});
