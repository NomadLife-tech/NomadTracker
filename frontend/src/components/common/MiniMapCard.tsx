import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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

// Light mode colors (always used regardless of device theme)
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

  // Generate Leaflet map HTML - always in light mode
  // Zoom level 15 shows approximately 2km radius area
  const mapHtml = useMemo(() => {
    const lat = coords[0];
    const lng = coords[1];
    // Zoom level 15 = ~2km radius view, Zoom level 2 = world view for empty state
    const zoom = activeVisit ? 15 : 2;
    
    // Always use light tile style
    const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
    // Add marker and 2km radius circle for active visit
    const markerHtml = activeVisit && country ? `
      // Add 2km radius circle
      L.circle([${lat}, ${lng}], {
        color: '#007AFF',
        fillColor: '#007AFF',
        fillOpacity: 0.1,
        weight: 2,
        radius: 2000 // 2km in meters
      }).addTo(map);
      
      // Add center marker with flag
      L.marker([${lat}, ${lng}], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-container"><div class="marker-pulse"></div><div class="marker-dot"><span class="marker-flag">${country.flag}</span></div></div>',
          iconSize: [60, 60],
          iconAnchor: [30, 30],
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
          #map { 
            width: 100%; 
            height: 100%; 
          }
          .custom-marker { background: none !important; border: none !important; }
          .marker-container {
            position: relative;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .marker-pulse {
            position: absolute;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(0, 122, 255, 0.3);
            animation: pulse 2s ease-out infinite;
          }
          .marker-dot {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
          }
          .marker-flag {
            font-size: 26px;
          }
          @keyframes pulse {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
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

  // Render the map using iframe for web or WebView for native
  const renderMap = () => {
    if (Platform.OS === 'web') {
      // For web, use an iframe with proper sandbox attributes
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
      // For native, use WebView
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

  if (activeVisit && activeVisitStatus) {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={onPress}
        activeOpacity={0.95}
      >
        {/* Real Map Background */}
        <View style={styles.mapContainer}>
          {renderMap()}
        </View>

        {/* Floating Info Card Overlay - Google Maps style */}
        <View style={styles.infoCard}>
          {/* Header Row */}
          <View style={styles.infoHeader}>
            <View style={styles.flagContainer}>
              <Text style={styles.flagText}>{country?.flag}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.countryName}>{activeVisit.countryName}</Text>
              <Text style={styles.visaType}>{activeVisit.visaType}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeVisitStatus.daysUsed}</Text>
              <Text style={styles.statLabel}>{t('daysUsed')}</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.remainingValue, { color: getProgressColor(activeVisitStatus.percentageUsed) }]}>
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

          {/* Progress Bar */}
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

        {/* Top-left badge */}
        <View style={styles.topBadge}>
          <Ionicons name="location" size={14} color={LIGHT_COLORS.primary} />
          <Text style={styles.topBadgeText}>{t('currentlyIn')}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // No active visit state
  return (
    <View style={styles.container}>
      {/* Real Map Background - World view */}
      <View style={styles.mapContainer}>
        {renderMap()}
      </View>

      {/* Floating Empty State Card */}
      <View style={styles.emptyCard}>
        <Ionicons name="airplane-outline" size={32} color={LIGHT_COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>{t('noActiveVisit')}</Text>
        <Text style={styles.emptyHint}>Track your current location</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddVisit}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{t('addNewVisit')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: LIGHT_COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    position: 'relative',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
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
  topBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: LIGHT_COLORS.text,
    textTransform: 'uppercase',
  },
  infoCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagText: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 17,
    fontWeight: '700',
    color: LIGHT_COLORS.text,
  },
  visaType: {
    fontSize: 12,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  divider: {
    height: 1,
    backgroundColor: LIGHT_COLORS.border,
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: LIGHT_COLORS.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: LIGHT_COLORS.text,
  },
  remainingValue: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 9,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    backgroundColor: LIGHT_COLORS.border,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: LIGHT_COLORS.danger,
  },
  emptyCard: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -70 }],
    width: 240,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: LIGHT_COLORS.text,
    marginTop: 10,
  },
  emptyHint: {
    fontSize: 12,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
