import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { UserProfile } from '../../types';

interface ProfileHeaderProps {
  profile: UserProfile;
  onAvatarPress: () => void;
  t: (key: string) => string;
}

export function ProfileHeader({ profile, onAvatarPress, t }: ProfileHeaderProps) {
  const { colors } = useTheme();

  const renderAvatar = () => {
    if (profile.avatarType === 'custom' && profile.avatar?.startsWith('data:')) {
      return (
        <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
      );
    }
    return <Text style={styles.avatarEmoji}>{profile.avatar}</Text>;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[styles.avatarContainer, { backgroundColor: colors.primary + '15' }]}
        onPress={onAvatarPress}
      >
        {renderAvatar()}
        <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="camera" size={14} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>
          {profile.firstName || profile.lastName
            ? `${profile.firstName} ${profile.lastName}`.trim()
            : t('traveler')}
        </Text>
        {profile.homeCountry && (
          <Text style={[styles.country, { color: colors.textSecondary }]}>
            {t('homeCountry')}: {profile.homeCountry}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  country: {
    fontSize: 14,
    marginTop: 4,
  },
});
