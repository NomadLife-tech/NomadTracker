import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Visit } from '../../types';
import { getCountryByCode } from '../../constants/countries';
import { getVisaStatus } from '../../utils/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';

interface MiniMapCardProps {
  activeVisit: Visit | null;
  onPress: () => void;
  onAddVisit: () => void;
  t: (key: string) => string;
}

// Country coordinates for map centering
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

export function MiniMapCard({ activeVisit, onPress, onAddVisit, t }: MiniMapCardProps) {
  // Get theme colors for dark mode support on overlays
  const { colors, isDarkMode } = useTheme();
  
  const activeVisitStatus = useMemo(() => {
    if (!activeVisit) return null;
    return getVisaStatus(activeVisit);
  }, [activeVisit]);

  const country = activeVisit ? getCountryByCode(activeVisit.countryCode) : null;
  const coords = activeVisit ? COUNTRY_COORDS[activeVisit.countryCode] || [20, 0] : [20, 0];

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return colors.success;
    if (percentage < 90) return colors.warning;
    return colors.danger;
  };

  // Generate Leaflet map HTML - ALWAYS in light mode regardless of theme
  const mapHtml = useMemo(() => {
    const lat = coords[0];
    const lng = coords[1];
    const zoom = activeVisit ? 15 : 2;
    
    // Always use light tile style for the map
    const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
    const markerHtml = activeVisit && country ? `
      // Add 2km radius circle with gradient effect
      L.circle([${lat}, ${lng}], {
        color: '#007AFF',
        fillColor: '#007AFF',
        fillOpacity: 0.08,
        weight: 2,
        radius: 2000,
        dashArray: '5, 5'
      }).addTo(map);
      
      // Add inner glow circle
      L.circle([${lat}, ${lng}], {
        color: 'transparent',
        fillColor: '#007AFF',
        fillOpacity: 0.15,
        weight: 0,
        radius: 800
      }).addTo(map);
      
      // Add center marker with flag
      L.marker([${lat}, ${lng}], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-wrapper"><div class="marker-glow"></div><div class="marker-ring"></div><div class="marker-center"><span class="flag">${country.flag}</span></div></div>',
          iconSize: [80, 80],
          iconAnchor: [40, 40],
        })
      }).addTo(map);
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; overflow: hidden; }
          #map { width: 100%; height: 100%; }
          .custom-marker { background: none !important; border: none !important; }
          .marker-wrapper {
            position: relative;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .marker-glow {
            position: absolute;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0,122,255,0.4) 0%, rgba(0,122,255,0) 70%);
            animation: glow-pulse 2.5s ease-out infinite;
          }
          .marker-ring {
            position: absolute;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: 3px solid rgba(0,122,255,0.6);
            animation: ring-pulse 2.5s ease-out infinite;
          }
          .marker-center {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%);
            box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 2px 8px rgba(0,122,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
          }
          .flag { font-size: 28px; }
          @keyframes glow-pulse {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes ring-pulse {
            0% { transform: scale(0.9); opacity: 1; }
            50% { opacity: 0.6; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          .leaflet-control-container { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { 
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false
          }).setView([${lat}, ${lng}], ${zoom});
          
          L.tileLayer('${tileUrl}', {
            subdomains: 'abcd',
            maxZoom: 19,
          }).addTo(map);
          
          ${markerHtml}
        </script>
      </body>
      </html>
    `;
  }, [coords, activeVisit, country]);

  const renderMap = () => {
    if (Platform.OS === 'web') {
      const iframeStyle = {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: 20,
        display: 'block',
      } as React.CSSProperties;
      
      return (
        <View style={styles.iframeContainer}>
          <iframe
            srcDoc={mapHtml}
            style={iframeStyle}
            title="Mini Map"
            sandbox="allow-scripts"
          />
        </View>
      );
    } else {
      const WebView = require('react-native-webview').WebView;
      return (
        <WebView
          source={{ html: mapHtml }}
          style={styles.webview}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      );
    }
  };

  // Overlay card background with blur effect simulation
  const cardBgColor = isDarkMode ? 'rgba(28, 28, 30, 0.92)' : 'rgba(255, 255, 255, 0.92)';
  const badgeBgColor = isDarkMode ? 'rgba(28, 28, 30, 0.88)' : 'rgba(255, 255, 255, 0.88)';

  if (activeVisit && activeVisitStatus) {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={onPress}
        activeOpacity={0.95}
      >
        {/* Map Background - Always Light Mode */}
        <View style={styles.mapContainer}>
          {renderMap()}
        </View>

        {/* Top Badges Row */}
        <View style={styles.topBadgesRow}>
          {/* Location Badge */}
          <View style={[styles.topBadge, { backgroundColor: badgeBgColor }]}>
            <View style={styles.locationDot} />
            <Text style={[styles.topBadgeText, { color: colors.text }]}>{t('currentlyIn')}</Text>
          </View>
          
          {/* Live Indicator */}
          <View style={[styles.liveBadge, { backgroundColor: badgeBgColor }]}>
            <View style={styles.liveDotAnimated} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Info Card - Dark Mode Compliant */}
        <View style={[styles.infoCard, { backgroundColor: cardBgColor }]}>
          {/* Country Header */}
          <View style={styles.countryHeader}>
            <View style={[styles.flagCircle, { backgroundColor: colors.background }]}>
              <Text style={styles.flagEmoji}>{country?.flag}</Text>
            </View>
            <View style={styles.countryInfo}>
              <Text style={[styles.countryName, { color: colors.text }]} numberOfLines={1}>
                {activeVisit.countryName}
              </Text>
              <Text style={[styles.visaType, { color: colors.textSecondary }]} numberOfLines={1}>
                {activeVisit.visaType}
              </Text>
            </View>
            <TouchableOpacity style={styles.expandButton}>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={[styles.statsGrid, { borderTopColor: colors.border }]}>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {activeVisitStatus.daysUsed}
              </Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                {t('daysUsed')}
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statBlock}>
              <Text style={[
                styles.statNumber, 
                styles.highlightNumber,
                { color: getProgressColor(activeVisitStatus.percentageUsed) }
              ]}>
                {activeVisitStatus.daysRemaining}
              </Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                {t('daysRemaining')}
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {activeVisit.allowedDays || 90}
              </Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                {t('allowedDays')}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, activeVisitStatus.percentageUsed)}%`,
                  backgroundColor: getProgressColor(activeVisitStatus.percentageUsed),
                },
              ]}
            />
          </View>

          {activeVisitStatus.isOverstay && (
            <View style={[styles.warningBar, { backgroundColor: colors.danger + '15' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.danger} />
              <Text style={[styles.warningText, { color: colors.danger }]}>
                {t('overstay')} - Visa Exceeded
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Empty State - No active visit
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {renderMap()}
      </View>

      {/* Empty State Card - Dark Mode Compliant */}
      <View style={[styles.emptyCard, { backgroundColor: cardBgColor }]}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="airplane" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          {t('noActiveVisit')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Start tracking your journey
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]} 
          onPress={onAddVisit}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t('addNewVisit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
  },
  iframeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  topBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 5,
  },
  liveDotAnimated: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
    letterSpacing: 0.5,
  },
  infoCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 26,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '700',
  },
  visaType: {
    fontSize: 13,
    marginTop: 2,
  },
  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  highlightNumber: {
    fontSize: 26,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  warningBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -130 }, { translateY: -90 }],
    width: 260,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
