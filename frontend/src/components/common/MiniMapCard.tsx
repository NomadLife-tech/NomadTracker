import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Visit } from '../../types';
import { getCountryByCode, COUNTRIES } from '../../constants/countries';
import { getVisaStatus } from '../../utils/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';

interface MiniMapCardProps {
  activeVisit: Visit | null;
  onPress: () => void;
  onAddVisit: () => void;
  onLocationDetected?: (countryCode: string, countryName: string) => void;
  t: (key: string) => string;
}

// Country coordinates for map centering
const COUNTRY_COORDS: { [key: string]: [number, number] } = {
  US: [37.0902, -95.7129], GB: [51.5074, -0.1278], DE: [52.5200, 13.4050],
  FR: [48.8566, 2.3522], ES: [40.4168, -3.7038], IT: [41.9028, 12.4964],
  PT: [38.7223, -9.1393], NL: [52.3676, 4.9041], BE: [50.8503, 4.3517],
  AT: [48.2082, 16.3738], CH: [46.9480, 7.4474], GR: [37.9838, 23.7275],
  SE: [59.3293, 18.0686], NO: [59.9139, 10.7522], DK: [55.6761, 12.5683],
  FI: [60.1699, 24.9384], PL: [52.2297, 21.0122], CZ: [50.0755, 14.4378],
  HU: [47.4979, 19.0402], IE: [53.3498, -6.2603], JP: [35.6762, 139.6503],
  KR: [37.5665, 126.9780], CN: [39.9042, 116.4074], TW: [25.0330, 121.5654],
  SG: [1.3521, 103.8198], MY: [3.1390, 101.6869], TH: [13.7563, 100.5018],
  ID: [-6.2088, 106.8456], VN: [21.0278, 105.8342], PH: [14.5995, 120.9842],
  IN: [28.6139, 77.2090], AU: [-33.8688, 151.2093], NZ: [-36.8485, 174.7633],
  CA: [43.6532, -79.3832], MX: [19.4326, -99.1332], BR: [-23.5505, -46.6333],
  AR: [-34.6037, -58.3816], CL: [-33.4489, -70.6693], CO: [4.7110, -74.0721],
  PE: [-12.0464, -77.0428], AE: [25.2048, 55.2708], SA: [24.7136, 46.6753],
  QA: [25.2854, 51.5310], EG: [30.0444, 31.2357], ZA: [-33.9249, 18.4241],
  KE: [-1.2921, 36.8219], MA: [33.9716, -6.8498], TR: [41.0082, 28.9784],
  IL: [32.0853, 34.7818], RU: [55.7558, 37.6173], UA: [50.4501, 30.5234],
  HR: [45.8150, 15.9819], RO: [44.4268, 26.1025], BG: [42.6977, 23.3219],
  RS: [44.7866, 20.4489], GE: [41.7151, 44.8271], AM: [40.1792, 44.4991],
  AZ: [40.4093, 49.8671], KZ: [51.1605, 71.4704], UZ: [41.2995, 69.2401],
  LK: [6.9271, 79.8612], NP: [27.7172, 85.3240], BD: [23.8103, 90.4125],
  MM: [16.8661, 96.1951], KH: [11.5564, 104.9282], LA: [17.9757, 102.6331],
  MV: [4.1755, 73.5093], BT: [27.4728, 89.6390], MN: [47.8864, 106.9057],
  PA: [8.9824, -79.5199], CR: [9.9281, -84.0907], EC: [-0.1807, -78.4678],
  UY: [-34.9011, -56.1645], PY: [-25.2637, -57.5759], BO: [-16.4897, -68.1193],
  IS: [64.1466, -21.9426], LU: [49.6116, 6.1319], MT: [35.8989, 14.5146],
  CY: [35.1856, 33.3823], EE: [59.4370, 24.7536], LV: [56.9496, 24.1052],
  LT: [54.6872, 25.2797], SK: [48.1486, 17.1077], SI: [46.0569, 14.5058],
  ME: [42.4304, 19.2594], AL: [41.3275, 19.8187], MK: [41.9981, 21.4254],
  BA: [43.8563, 18.4131], MD: [47.0105, 28.8638], BY: [53.9006, 27.5590],
  AF: [34.5553, 69.2075], PK: [33.6844, 73.0479], NG: [9.0765, 7.3986],
  GH: [5.6037, -0.1870], ET: [8.9806, 38.7578], TZ: [-6.7924, 39.2083],
  UG: [0.3476, 32.5825], RW: [-1.9403, 30.0587], MZ: [-25.9692, 32.5732],
  ZW: [-17.8252, 31.0335], ZM: [-15.3875, 28.3228], NA: [-22.5609, 17.0658],
  BW: [-24.6282, 25.9231], MW: [-13.9626, 33.7741], AO: [-8.8390, 13.2894],
  CD: [-4.4419, 15.2663], CG: [-4.2634, 15.2429], CM: [3.8480, 11.5021],
  CI: [5.3600, -4.0083], SN: [14.7167, -17.4677], ML: [12.6392, -8.0029],
  NE: [13.5137, 2.1098], TD: [12.1348, 15.0557], SD: [15.5007, 32.5599],
  LY: [32.8872, 13.1913], TN: [36.8065, 10.1815], DZ: [36.7538, 3.0588],
};

export function MiniMapCard({ activeVisit, onPress, onAddVisit, onLocationDetected, t }: MiniMapCardProps) {
  const { colors, isDark } = useTheme();
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<{ code: string; name: string; flag: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const activeVisitStatus = useMemo(() => {
    if (!activeVisit) return null;
    return getVisaStatus(activeVisit);
  }, [activeVisit]);

  const country = activeVisit ? getCountryByCode(activeVisit.countryCode) : null;
  const coords = activeVisit ? COUNTRY_COORDS[activeVisit.countryCode] || [20, 0] : 
                 detectedCountry ? COUNTRY_COORDS[detectedCountry.code] || [20, 0] : [20, 0];

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return colors.success;
    if (percentage < 90) return colors.warning;
    return colors.danger;
  };

  // Reverse geocode to find country from coordinates
  const detectCurrentLocation = async () => {
    if (Platform.OS === 'web') {
      setLocationError(t('locationDetectionWebError'));
      return;
    }
    
    setIsDetectingLocation(true);
    setLocationError(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError(t('permissionDenied'));
        setIsDetectingLocation(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const [reverseGeocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (reverseGeocode?.isoCountryCode) {
        const foundCountry = COUNTRIES.find(
          c => c.code === reverseGeocode.isoCountryCode
        );
        
        if (foundCountry) {
          setDetectedCountry({
            code: foundCountry.code,
            name: foundCountry.name,
            flag: foundCountry.flag,
          });
          
          if (onLocationDetected) {
            onLocationDetected(foundCountry.code, foundCountry.name);
          }
        } else {
          setLocationError(t('countryNotFound'));
        }
      } else {
        setLocationError(t('couldNotDetermineCountry'));
      }
    } catch (error) {
      console.error('Location detection error:', error);
      setLocationError(t('failedToDetectLocation'));
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Generate Leaflet map HTML with 3D-style modern tiles - ALWAYS light mode
  const mapHtml = useMemo(() => {
    const lat = coords[0];
    const lng = coords[1];
    const zoom = activeVisit ? 15 : 2;
    
    // Modern 3D-style map tiles - using Esri World Imagery with labels overlay for satellite look
    // or CartoDB Voyager for clean modern style
    const baseTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    const labelsTileUrl = 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png';
    
    const markerHtml = activeVisit && country ? `
      // Add subtle 2km radius area
      L.circle([${lat}, ${lng}], {
        color: 'rgba(255,255,255,0.8)',
        fillColor: 'rgba(0,122,255,0.15)',
        fillOpacity: 1,
        weight: 2,
        radius: 2000,
      }).addTo(map);
      
      // Add glowing center marker
      L.marker([${lat}, ${lng}], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: \`
            <div class="marker-outer">
              <div class="marker-glow"></div>
              <div class="marker-ring"></div>
              <div class="marker-inner">
                <span class="flag">${country.flag}</span>
              </div>
            </div>
          \`,
          iconSize: [90, 90],
          iconAnchor: [45, 45],
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
          .marker-outer {
            position: relative;
            width: 90px;
            height: 90px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .marker-glow {
            position: absolute;
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0,122,255,0.5) 0%, rgba(0,122,255,0) 70%);
            animation: glow 3s ease-in-out infinite;
          }
          .marker-ring {
            position: absolute;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,0.9);
            box-shadow: 0 0 20px rgba(0,122,255,0.6), inset 0 0 10px rgba(0,122,255,0.3);
            animation: ring 3s ease-in-out infinite;
          }
          .marker-inner {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%);
            box-shadow: 
              0 8px 32px rgba(0,0,0,0.3),
              0 2px 8px rgba(0,0,0,0.2),
              inset 0 2px 4px rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
          }
          .flag { font-size: 30px; }
          @keyframes glow {
            0%, 100% { transform: scale(0.9); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes ring {
            0%, 100% { transform: scale(0.95); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          /* Custom zoom controls styling */
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
            border-radius: 12px !important;
            overflow: hidden;
            margin: 10px !important;
          }
          .leaflet-control-zoom a {
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            font-size: 18px !important;
            color: #333 !important;
            background: rgba(255,255,255,0.95) !important;
            border: none !important;
          }
          .leaflet-control-zoom a:hover {
            background: rgba(255,255,255,1) !important;
            color: #007AFF !important;
          }
          .leaflet-control-zoom-in {
            border-radius: 12px 12px 0 0 !important;
            border-bottom: 1px solid rgba(0,0,0,0.1) !important;
          }
          .leaflet-control-zoom-out {
            border-radius: 0 0 12px 12px !important;
          }
          .leaflet-control-attribution { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { 
            zoomControl: true,
            attributionControl: false,
            dragging: true,
            touchZoom: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            minZoom: 2,
            maxZoom: 18
          }).setView([${lat}, ${lng}], ${zoom});
          
          // Position zoom controls
          map.zoomControl.setPosition('bottomright');
          
          // Base satellite imagery layer
          L.tileLayer('${baseTileUrl}', {
            maxZoom: 19,
          }).addTo(map);
          
          // Labels overlay for better readability
          L.tileLayer('${labelsTileUrl}', {
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
        borderRadius: 24,
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

  // Dark mode compliant overlay colors
  const cardBgColor = isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const badgeBgColor = isDark ? 'rgba(28, 28, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)';

  if (activeVisit && activeVisitStatus) {
    return (
      <View style={styles.container}>
        {/* Map Background - Interactive (zoom, pan enabled) */}
        <View style={styles.mapContainer}>
          {renderMap()}
        </View>

        {/* Top Badges */}
        <View style={styles.topRow} pointerEvents="box-none">
          <View style={[styles.locationBadge, { backgroundColor: badgeBgColor }]}>
            <View style={styles.locationPulse} />
            <Text style={[styles.locationText, { color: colors.text }]}>{t('currentlyIn')}</Text>
          </View>
          
          <View style={[styles.liveBadge, { backgroundColor: badgeBgColor }]}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Collapsible Info Card */}
        {isOverlayVisible ? (
          <View style={[styles.infoCard, { backgroundColor: cardBgColor }]}>
            {/* Close Button */}
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: colors.border }]}
              onPress={() => setIsOverlayVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Country Header */}
            <View style={styles.countryHeader}>
              <View style={[styles.flagBubble, { backgroundColor: colors.background }]}>
                <Text style={styles.flagEmoji}>{country?.flag}</Text>
              </View>
              <View style={styles.countryDetails}>
                <Text style={[styles.countryName, { color: colors.text }]} numberOfLines={1}>
                  {activeVisit.countryName}
                </Text>
                <Text style={[styles.visaType, { color: colors.textSecondary }]} numberOfLines={1}>
                  {activeVisit.visaType}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={[styles.statsContainer, { borderTopColor: colors.border }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.text }]}>
                  {activeVisitStatus.daysUsed}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('daysUsed')}
                </Text>
              </View>
              
              <View style={[styles.statSeparator, { backgroundColor: colors.border }]} />
              
              <View style={styles.statBox}>
                <Text style={[
                  styles.statNum, 
                  styles.highlightStat,
                  { color: getProgressColor(activeVisitStatus.percentageUsed) }
                ]}>
                  {activeVisitStatus.daysRemaining}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('daysRemaining')}
                </Text>
              </View>
              
              <View style={[styles.statSeparator, { backgroundColor: colors.border }]} />
              
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.text }]}>
                  {activeVisit.allowedDays || 90}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  {t('allowedDays')}
                </Text>
              </View>
            </View>

            {/* Progress */}
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
              <View style={[styles.alertBar, { backgroundColor: colors.danger + '20' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={[styles.alertText, { color: colors.danger }]}>
                  Visa Overstay Warning
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Minimized State - Show button to expand */
          <TouchableOpacity 
            style={[styles.expandButton, { backgroundColor: cardBgColor }]}
            onPress={() => setIsOverlayVisible(true)}
          >
            <View style={[styles.miniFlagBubble, { backgroundColor: colors.background }]}>
              <Text style={styles.miniFlagEmoji}>{country?.flag}</Text>
            </View>
            <View style={styles.miniInfo}>
              <Text style={[styles.miniCountry, { color: colors.text }]} numberOfLines={1}>
                {activeVisit.countryName}
              </Text>
              <Text style={[styles.miniDays, { color: getProgressColor(activeVisitStatus.percentageUsed) }]}>
                {activeVisitStatus.daysRemaining} days left
              </Text>
            </View>
            <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Empty State
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {renderMap()}
      </View>

      {/* Detected Location Badge */}
      {detectedCountry && (
        <View style={styles.topRow} pointerEvents="box-none">
          <View style={[styles.locationBadge, { backgroundColor: cardBgColor }]}>
            <Text style={styles.detectedFlag}>{detectedCountry.flag}</Text>
            <View>
              <Text style={[styles.detectedLabel, { color: colors.textSecondary }]}>
                {t('locationDetected')}
              </Text>
              <Text style={[styles.detectedCountry, { color: colors.text }]}>
                {detectedCountry.name}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.emptyCard, { backgroundColor: cardBgColor }]}>
        {detectedCountry ? (
          <>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.success + '15' }]}>
              <Text style={styles.detectedFlagLarge}>{detectedCountry.flag}</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {detectedCountry.name}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t('locationDetected')}
            </Text>
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: colors.primary }]} 
              onPress={onAddVisit}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addBtnText}>{t('addNewVisit')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="airplane" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('noActiveVisit')}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {t('startTrackingTravels')}
            </Text>
            
            {/* GPS Detection Button - Only on native */}
            {Platform.OS !== 'web' && (
              <TouchableOpacity 
                style={[styles.detectBtn, { backgroundColor: colors.success + '15', borderColor: colors.success }]}
                onPress={detectCurrentLocation}
                disabled={isDetectingLocation}
              >
                {isDetectingLocation ? (
                  <ActivityIndicator size="small" color={colors.success} />
                ) : (
                  <Ionicons name="navigate" size={18} color={colors.success} />
                )}
                <Text style={[styles.detectBtnText, { color: colors.success }]}>
                  {isDetectingLocation ? t('detectingLocation') : t('detectLocation')}
                </Text>
              </TouchableOpacity>
            )}
            
            {locationError && (
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {locationError}
              </Text>
            )}
            
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: colors.primary }]} 
              onPress={onAddVisit}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addBtnText}>{t('addNewVisit')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
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
  topRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.5,
  },
  infoCard: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingRight: 30,
  },
  flagBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 28,
  },
  countryDetails: {
    flex: 1,
  },
  countryName: {
    fontSize: 19,
    fontWeight: '700',
  },
  visaType: {
    fontSize: 13,
    marginTop: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statSeparator: {
    width: 1,
    height: 40,
  },
  statNum: {
    fontSize: 24,
    fontWeight: '700',
  },
  highlightStat: {
    fontSize: 28,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  alertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
    gap: 8,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
  },
  expandButton: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  miniFlagBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniFlagEmoji: {
    fontSize: 22,
  },
  miniInfo: {
    flex: 1,
  },
  miniCountry: {
    fontSize: 15,
    fontWeight: '600',
  },
  miniDays: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyCard: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -140 }, { translateY: -100 }],
    width: 280,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  detectBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  detectedFlag: {
    fontSize: 24,
    marginRight: 8,
  },
  detectedFlagLarge: {
    fontSize: 36,
  },
  detectedLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detectedCountry: {
    fontSize: 14,
    fontWeight: '600',
  },
});
