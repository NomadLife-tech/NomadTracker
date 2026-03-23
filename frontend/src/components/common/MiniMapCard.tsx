import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Visit } from '../../types';
import { getCountryByCode } from '../../constants/countries';
import { getVisaStatus } from '../../utils/dateUtils';

interface MiniMapCardProps {
  activeVisit: Visit | null;
  onPress: () => void;
  onAddVisit: () => void;
  t: (key: string) => string;
}

// Country coordinates for mini map centering
const COUNTRY_COORDS: { [key: string]: [number, number] } = {
  US: [37.0902, -95.7129], GB: [55.3781, -3.4360], DE: [51.1657, 10.4515],
  FR: [46.2276, 2.2137], ES: [40.4637, -3.7492], IT: [41.8719, 12.5674],
  PT: [39.3999, -8.2245], NL: [52.1326, 5.2913], BE: [50.5039, 4.4699],
  AT: [47.5162, 14.5501], CH: [46.8182, 8.2275], GR: [39.0742, 21.8243],
  SE: [60.1282, 18.6435], NO: [60.4720, 8.4689], DK: [56.2639, 9.5018],
  FI: [61.9241, 25.7482], PL: [51.9194, 19.1451], CZ: [49.8175, 15.4730],
  HU: [47.1625, 19.5033], IE: [53.1424, -7.6921], JP: [36.2048, 138.2529],
  KR: [35.9078, 127.7669], CN: [35.8617, 104.1954], TW: [23.6978, 120.9605],
  SG: [1.3521, 103.8198], MY: [4.2105, 101.9758], TH: [15.8700, 100.9925],
  ID: [-0.7893, 113.9213], VN: [14.0583, 108.2772], PH: [12.8797, 121.7740],
  IN: [20.5937, 78.9629], AU: [-25.2744, 133.7751], NZ: [-40.9006, 174.8860],
  CA: [56.1304, -106.3468], MX: [23.6345, -102.5528], BR: [-14.2350, -51.9253],
  AR: [-38.4161, -63.6167], CL: [-35.6751, -71.5430], CO: [4.5709, -74.2973],
  PE: [-9.1900, -75.0152], AE: [23.4241, 53.8478], SA: [23.8859, 45.0792],
  QA: [25.3548, 51.1839], EG: [26.8206, 30.8025], ZA: [-30.5595, 22.9375],
  KE: [-0.0236, 37.9062], MA: [31.7917, -7.0926], TR: [38.9637, 35.2433],
  IL: [31.0461, 34.8516], RU: [61.5240, 105.3188], UA: [48.3794, 31.1656],
  HR: [45.1000, 15.2000], RO: [45.9432, 24.9668], BG: [42.7339, 25.4858],
  RS: [44.0165, 21.0059], GE: [42.3154, 43.3569], AM: [40.0691, 45.0382],
  AZ: [40.1431, 47.5769], KZ: [48.0196, 66.9237], UZ: [41.3775, 64.5853],
  LK: [7.8731, 80.7718], NP: [28.3949, 84.1240], BD: [23.6850, 90.3563],
  MM: [21.9162, 95.9560], KH: [12.5657, 104.9910], LA: [19.8563, 102.4955],
  MV: [3.2028, 73.2207], BT: [27.5142, 90.4336], MN: [46.8625, 103.8467],
  PA: [8.5380, -80.7821], CR: [9.7489, -83.7534], EC: [-1.8312, -78.1834],
  UY: [-32.5228, -55.7658], PY: [-23.4425, -58.4438], BO: [-16.2902, -63.5887],
  IS: [64.9631, -19.0208], LU: [49.8153, 6.1296], MT: [35.9375, 14.3754],
  CY: [35.1264, 33.4299], EE: [58.5953, 25.0136], LV: [56.8796, 24.6032],
  LT: [55.1694, 23.8813], SK: [48.6690, 19.6990], SI: [46.1512, 14.9955],
  ME: [42.7087, 19.3744], AL: [41.1533, 20.1683], MK: [41.5124, 21.7453],
  BA: [43.9159, 17.6791], MD: [47.4116, 28.3699], BY: [53.7098, 27.9534],
  AF: [33.9391, 67.7100], PK: [30.3753, 69.3451], NG: [9.0820, 8.6753],
  GH: [7.9465, -1.0232], ET: [9.1450, 40.4897], TZ: [-6.3690, 34.8888],
  UG: [1.3733, 32.2903], RW: [-1.9403, 29.8739], MZ: [-18.6657, 35.5296],
  ZW: [-19.0154, 29.1549], ZM: [-13.1339, 27.8493], NA: [-22.9576, 18.4904],
  BW: [-22.3285, 24.6849], MW: [-13.2543, 34.3015], AO: [-11.2027, 17.8739],
  CD: [-4.0383, 21.7587], CG: [-0.2280, 15.8277], CM: [7.3697, 12.3547],
  CI: [7.5400, -5.5471], SN: [14.4974, -14.4524], ML: [17.5707, -3.9962],
  NE: [17.6078, 8.0817], TD: [15.4542, 18.7322], SD: [12.8628, 30.2176],
  LY: [26.3351, 17.2283], TN: [33.8869, 9.5375], DZ: [28.0339, 1.6596],
};

// Light mode colors (always)
const LIGHT_COLORS = {
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  border: '#E5E5EA',
};

export function MiniMapCard({ activeVisit, onPress, onAddVisit, t }: MiniMapCardProps) {
  const activeVisitStatus = useMemo(() => {
    if (!activeVisit) return null;
    return getVisaStatus(activeVisit);
  }, [activeVisit]);

  const country = activeVisit ? getCountryByCode(activeVisit.countryCode) : null;
  const coords = activeVisit ? COUNTRY_COORDS[activeVisit.countryCode] || [20, 0] : [20, 0];

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return LIGHT_COLORS.success;
    if (percentage < 90) return LIGHT_COLORS.warning;
    return LIGHT_COLORS.danger;
  };

  // Generate static map URL (using light mode tile)
  const mapUrl = useMemo(() => {
    const lat = coords[0];
    const lng = coords[1];
    const zoom = activeVisit ? 4 : 1;
    // Using OpenStreetMap static map via StaticMapService (or similar)
    // For simplicity, using a generated map-like gradient background
    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${lng},${lat},${zoom},0/400x200@2x?access_token=pk.placeholder`;
  }, [coords, activeVisit]);

  if (activeVisit && activeVisitStatus) {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Mini Map Background - Always Light Mode */}
        <View style={styles.mapContainer}>
          {/* Gradient map-like background */}
          <View style={styles.mapGradient}>
            <View style={styles.mapOverlay}>
              {/* Grid pattern for map effect */}
              <View style={styles.gridContainer}>
                {[...Array(12)].map((_, i) => (
                  <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 8}%` }]} />
                ))}
                {[...Array(16)].map((_, i) => (
                  <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 6}%` }]} />
                ))}
              </View>
              
              {/* Country marker */}
              <View style={styles.markerContainer}>
                <View style={styles.markerPulse} />
                <View style={styles.marker}>
                  <Text style={styles.markerFlag}>{country?.flag}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Info Overlay - Always Light Mode */}
        <View style={styles.infoOverlay}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.labelText}>{t('currentlyIn')}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>{t('live')}</Text>
              </View>
            </View>
          </View>

          {/* Country Info */}
          <View style={styles.countryRow}>
            <Text style={styles.countryName}>{activeVisit.countryName}</Text>
            <Text style={styles.visaType}>{activeVisit.visaType}</Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeVisitStatus.daysUsed}</Text>
              <Text style={styles.statLabel}>{t('daysUsed')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getProgressColor(activeVisitStatus.percentageUsed) }]}>
                {activeVisitStatus.daysRemaining}
              </Text>
              <Text style={styles.statLabel}>{t('daysRemaining')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeVisit.allowedDays || 90}</Text>
              <Text style={styles.statLabel}>{t('allowedDays')}</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, activeVisitStatus.percentageUsed)}%`,
                  backgroundColor: getProgressColor(activeVisitStatus.percentageUsed),
                },
              ]}
            />
          </View>

          {activeVisitStatus.isOverstay && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={14} color={LIGHT_COLORS.danger} />
              <Text style={styles.warningText}>{t('overstay')}!</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // No active visit state - Always Light Mode
  return (
    <View style={styles.container}>
      {/* Mini Map Background */}
      <View style={styles.mapContainer}>
        <View style={styles.mapGradient}>
          <View style={styles.mapOverlay}>
            {/* Grid pattern for map effect */}
            <View style={styles.gridContainer}>
              {[...Array(12)].map((_, i) => (
                <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 8}%` }]} />
              ))}
              {[...Array(16)].map((_, i) => (
                <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 6}%` }]} />
              ))}
            </View>
            
            {/* Globe icon */}
            <View style={styles.globeContainer}>
              <Ionicons name="globe-outline" size={48} color="#C7C7CC" />
            </View>
          </View>
        </View>
      </View>

      {/* Empty State Overlay */}
      <View style={styles.emptyOverlay}>
        <Text style={styles.emptyLabel}>{t('noActiveVisit')}</Text>
        <Text style={styles.emptyHint}>Track your current location</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddVisit}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t('addNewVisit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: LIGHT_COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  mapContainer: {
    height: 140,
    overflow: 'hidden',
  },
  mapGradient: {
    flex: 1,
    backgroundColor: '#E8F4E8', // Light green tint for land
  },
  mapOverlay: {
    flex: 1,
    backgroundColor: 'rgba(200, 220, 240, 0.4)', // Light blue tint for water
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  marker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LIGHT_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerFlag: {
    fontSize: 28,
  },
  globeContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -24,
    marginLeft: -24,
  },
  infoOverlay: {
    padding: 16,
    backgroundColor: LIGHT_COLORS.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: LIGHT_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: LIGHT_COLORS.success,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: LIGHT_COLORS.success,
  },
  countryRow: {
    marginBottom: 12,
  },
  countryName: {
    fontSize: 22,
    fontWeight: '700',
    color: LIGHT_COLORS.text,
  },
  visaType: {
    fontSize: 13,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: LIGHT_COLORS.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: LIGHT_COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: LIGHT_COLORS.border,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: LIGHT_COLORS.danger,
  },
  emptyOverlay: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.card,
  },
  emptyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: LIGHT_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyHint: {
    fontSize: 13,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
