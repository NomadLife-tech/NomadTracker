import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { isCurrentVisit, formatDate, calculateDaysInCountry } from '../../src/utils/dateUtils';
import { getCountryByCode } from '../../src/constants/countries';
import { Visit } from '../../src/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Heatmap color scale (blue to red based on days)
const getHeatmapColor = (days: number, maxDays: number): string => {
  const ratio = Math.min(days / Math.max(maxDays, 1), 1);
  // Color gradient: Blue (#3B82F6) -> Cyan (#06B6D4) -> Green (#10B981) -> Yellow (#F59E0B) -> Orange (#F97316) -> Red (#EF4444)
  if (ratio < 0.2) return '#3B82F6'; // Blue - few days
  if (ratio < 0.4) return '#06B6D4'; // Cyan
  if (ratio < 0.6) return '#10B981'; // Green
  if (ratio < 0.8) return '#F59E0B'; // Yellow/Orange
  return '#EF4444'; // Red - most days
};

// Country coordinates for map pins
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
  VE: [10.4806, -66.9036], CU: [23.1136, -82.3666], PR: [18.4655, -66.1057],
  JM: [18.1096, -77.2975], DO: [18.4861, -69.9312], HT: [18.5944, -72.3074],
  TT: [10.6918, -61.2225], BB: [13.1939, -59.5432], BS: [25.0343, -77.3963],
};

export default function MapScreen() {
  const { colors, isDark } = useTheme();
  const { visits, refreshVisits, t } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useFocusEffect(
    useCallback(() => {
      refreshVisits();
    }, [])
  );

  // Group visits by country with latest visit info
  const countryVisits = useMemo(() => {
    const grouped: { [key: string]: { visits: Visit[]; latestVisit: Visit; hasActive: boolean; totalDays: number } } = {};
    visits.forEach(visit => {
      if (!grouped[visit.countryCode]) {
        grouped[visit.countryCode] = {
          visits: [],
          latestVisit: visit,
          hasActive: false,
          totalDays: 0,
        };
      }
      grouped[visit.countryCode].visits.push(visit);
      grouped[visit.countryCode].totalDays += calculateDaysInCountry(visit.entryDate, visit.exitDate);
      if (isCurrentVisit(visit)) {
        grouped[visit.countryCode].hasActive = true;
      }
      // Track latest visit
      if (new Date(visit.entryDate) > new Date(grouped[visit.countryCode].latestVisit.entryDate)) {
        grouped[visit.countryCode].latestVisit = visit;
      }
    });
    return grouped;
  }, [visits]);

  // Compute stats for heatmap header
  const { sortedCountries, totalDays, maxDays } = useMemo(() => {
    const countries = Object.entries(countryVisits)
      .map(([code, data]) => ({
        code,
        ...data,
        country: getCountryByCode(code),
      }))
      .filter(c => c.country)
      .sort((a, b) => b.totalDays - a.totalDays);
    
    const total = countries.reduce((sum, c) => sum + c.totalDays, 0);
    const max = countries.length > 0 ? countries[0].totalDays : 0;
    
    return { sortedCountries: countries, totalDays: total, maxDays: max };
  }, [countryVisits]);

  // Handle message from iframe for navigation
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'visitClick' && data.visitId) {
        router.push(`/visit/${data.visitId}`);
      }
    } catch (e) {
      // Ignore non-JSON messages
    }
  }, [router]);

  // Set up message listener on web
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [handleMessage]);

  // Generate interactive map HTML
  const mapHtml = useMemo(() => {
    // Modern map tiles with excellent dark/light mode support
    const lightTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const tileUrl = isDark ? darkTileUrl : lightTileUrl;

    // Theme colors
    const bgColor = isDark ? '#1C1C1E' : '#F2F2F7';
    const cardBg = isDark ? '#2C2C2E' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
    const textSecondary = isDark ? '#8E8E93' : '#6C6C70';
    const primaryColor = '#007AFF';
    const successColor = '#34C759';
    const borderColor = isDark ? '#3A3A3C' : '#E5E5EA';

    // Translations for popup content
    const i18n = {
      visits: t('visits') || 'visits',
      visit: t('visit') || 'visit',
      days: t('days') || 'days',
      day: t('day') || 'day',
      active: t('active') || 'Active',
      currentlyHere: t('currentlyHere') || 'Currently Here',
      moreVisits: t('moreVisits') || 'more visits',
    };

    // Generate markers for each country with visits
    const markersJs = Object.entries(countryVisits).map(([code, data]) => {
      const country = getCountryByCode(code);
      const coords = COUNTRY_COORDS[code];
      if (!coords || !country) return '';
      
      const { visits: countryVisitsList, latestVisit, hasActive, totalDays } = data;
      const visitCount = countryVisitsList.length;
      const pinColor = hasActive ? successColor : primaryColor;
      const pinGlow = hasActive ? 'rgba(52, 199, 89, 0.4)' : 'rgba(0, 122, 255, 0.3)';
      
      // Build visits list for popup
      const visitsHtml = countryVisitsList
        .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())
        .slice(0, 5)
        .map(v => {
          const days = calculateDaysInCountry(v.entryDate, v.exitDate);
          const isActive = isCurrentVisit(v);
          const daysLabel = days === 1 ? i18n.day : i18n.days;
          return `
            <div class="visit-item" onclick="window.parent.postMessage(JSON.stringify({type:'visitClick',visitId:'${v.id}'}), '*')">
              <div class="visit-dates">
                <span class="visit-date">${formatDate(v.entryDate, 'MMM d, yyyy')}</span>
                ${v.exitDate ? `<span class="visit-arrow">→</span><span class="visit-date">${formatDate(v.exitDate, 'MMM d, yyyy')}</span>` : `<span class="visit-active">${i18n.active}</span>`}
              </div>
              <div class="visit-meta">
                <span class="visit-days">${days} ${daysLabel}</span>
                ${v.visaType ? `<span class="visit-visa">${v.visaType}</span>` : ''}
              </div>
            </div>
          `;
        }).join('');

      const moreCount = visitCount - 5;
      const moreVisitsHtml = visitCount > 5 ? `<div class="more-visits">+ ${moreCount} ${i18n.moreVisits}</div>` : '';

      // Stats text with proper pluralization
      const visitsLabel = visitCount === 1 ? i18n.visit : i18n.visits;
      const daysLabel = totalDays === 1 ? i18n.day : i18n.days;
      const statsText = `${visitCount} ${visitsLabel} • ${totalDays} ${daysLabel}`;

      return `
        (function() {
          var marker = L.marker([${coords[0]}, ${coords[1]}], {
            icon: L.divIcon({
              className: 'custom-pin',
              html: '<div class="pin-container ${hasActive ? 'active' : ''}"><div class="pin-glow"></div><div class="pin-icon">${country.flag}</div><div class="pin-badge">${visitCount}</div></div>',
              iconSize: [50, 50],
              iconAnchor: [25, 50],
              popupAnchor: [0, -50],
            })
          }).addTo(map);
          
          marker.bindPopup(\`
            <div class="popup-content">
              <div class="popup-header">
                <span class="popup-flag">${country.flag}</span>
                <div class="popup-title">
                  <span class="popup-country">${country.name}</span>
                  <span class="popup-stats">${statsText}</span>
                </div>
                ${hasActive ? `<div class="popup-active-badge">${i18n.currentlyHere}</div>` : ''}
              </div>
              <div class="popup-visits">
                ${visitsHtml}
                ${moreVisitsHtml}
              </div>
            </div>
          \`, {
            className: 'modern-popup',
            maxWidth: 320,
            minWidth: 280,
          });
        })();
      `;
    }).join('\n');

    // Calculate bounds to fit all markers
    let boundsJs = 'map.setView([20, 0], 2);';
    const validCoords = Object.keys(countryVisits)
      .map(code => COUNTRY_COORDS[code])
      .filter(c => c);
    
    if (validCoords.length === 1) {
      boundsJs = `map.setView([${validCoords[0][0]}, ${validCoords[0][1]}], 5);`;
    } else if (validCoords.length > 1) {
      const boundsArray = validCoords.map(c => `[${c[0]}, ${c[1]}]`).join(',');
      boundsJs = `map.fitBounds([${boundsArray}], { padding: [50, 50], maxZoom: 6 });`;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            margin: 0; 
            padding: 0; 
            background: ${bgColor};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            height: 100%;
            overflow: hidden;
          }
          #map { 
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%; 
            height: 100%; 
          }
          
          /* Modern Pin Styles */
          .custom-pin { background: none !important; border: none !important; }
          .pin-container {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .pin-glow {
            position: absolute;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(0, 122, 255, 0.3);
            animation: pulse 2s ease-in-out infinite;
            top: -5px;
          }
          .pin-container.active .pin-glow {
            background: rgba(52, 199, 89, 0.4);
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 0.4; }
          }
          .pin-icon {
            font-size: 28px;
            z-index: 2;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }
          .pin-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: ${primaryColor};
            color: white;
            font-size: 11px;
            font-weight: 700;
            min-width: 20px;
            height: 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 3;
          }
          .pin-container.active .pin-badge {
            background: ${successColor};
          }
          
          /* Modern Popup Styles */
          .modern-popup .leaflet-popup-content-wrapper {
            background: ${cardBg};
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,${isDark ? '0.5' : '0.15'});
            border: 1px solid ${borderColor};
            padding: 0;
            overflow: hidden;
          }
          .modern-popup .leaflet-popup-content {
            margin: 0;
            width: 100% !important;
          }
          .modern-popup .leaflet-popup-tip {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            border-top: none;
            border-left: none;
          }
          .leaflet-popup-close-button {
            color: ${textSecondary} !important;
            font-size: 20px !important;
            right: 12px !important;
            top: 12px !important;
          }
          
          .popup-content {
            padding: 0;
          }
          .popup-header {
            display: flex;
            align-items: center;
            padding: 16px;
            gap: 12px;
            border-bottom: 1px solid ${borderColor};
            background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
          }
          .popup-flag {
            font-size: 36px;
          }
          .popup-title {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .popup-country {
            font-size: 18px;
            font-weight: 700;
            color: ${textColor};
          }
          .popup-stats {
            font-size: 13px;
            color: ${textSecondary};
          }
          .popup-active-badge {
            background: ${successColor};
            color: white;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 12px;
            white-space: nowrap;
          }
          
          .popup-visits {
            max-height: 250px;
            overflow-y: auto;
          }
          .visit-item {
            padding: 12px 16px;
            border-bottom: 1px solid ${borderColor};
            cursor: pointer;
            transition: background 0.2s;
          }
          .visit-item:hover {
            background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
          }
          .visit-item:last-child {
            border-bottom: none;
          }
          .visit-dates {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;
          }
          .visit-date {
            font-size: 14px;
            font-weight: 600;
            color: ${textColor};
          }
          .visit-arrow {
            color: ${textSecondary};
            font-size: 12px;
          }
          .visit-active {
            background: ${successColor}20;
            color: ${successColor};
            font-size: 11px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 8px;
          }
          .visit-meta {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          .visit-days {
            font-size: 12px;
            color: ${textSecondary};
          }
          .visit-visa {
            font-size: 11px;
            color: ${primaryColor};
            background: ${primaryColor}15;
            padding: 2px 8px;
            border-radius: 6px;
          }
          .more-visits {
            padding: 12px 16px;
            text-align: center;
            color: ${primaryColor};
            font-size: 13px;
            font-weight: 600;
            background: ${isDark ? 'rgba(0,122,255,0.1)' : 'rgba(0,122,255,0.05)'};
          }
          
          /* Map Controls */
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 2px 8px rgba(0,0,0,${isDark ? '0.4' : '0.15'}) !important;
            border-radius: 12px !important;
            overflow: hidden;
          }
          .leaflet-control-zoom a {
            background: ${cardBg} !important;
            color: ${textColor} !important;
            border: none !important;
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            font-size: 18px !important;
          }
          .leaflet-control-zoom a:hover {
            background: ${isDark ? '#3A3A3C' : '#E5E5EA'} !important;
          }
          .leaflet-control-zoom-in {
            border-bottom: 1px solid ${borderColor} !important;
            border-radius: 12px 12px 0 0 !important;
          }
          .leaflet-control-zoom-out {
            border-radius: 0 0 12px 12px !important;
          }
          
          .leaflet-control-attribution {
            background: ${cardBg}cc !important;
            color: ${textSecondary} !important;
            font-size: 10px !important;
            padding: 4px 8px !important;
            border-radius: 8px !important;
            margin: 8px !important;
          }
          .leaflet-control-attribution a {
            color: ${primaryColor} !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { 
            zoomControl: true,
            attributionControl: true,
          });
          
          L.tileLayer('${tileUrl}', {
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          }).addTo(map);
          
          ${markersJs}
          
          ${boundsJs}
        </script>
      </body>
      </html>
    `;
  }, [countryVisits, isDark, colors]);

  // Empty state with elegant design
  if (Object.keys(countryVisits).length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Subtle background pattern */}
        <View style={[styles.emptyBackgroundPattern, { backgroundColor: isDark ? '#1a1a2e' : '#f0f7ff' }]}>
          <View style={styles.patternGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <View key={i} style={[styles.patternDot, { backgroundColor: isDark ? '#2a2a4e30' : '#007AFF10' }]} />
            ))}
          </View>
        </View>
        
        {/* Overlay content */}
        <View style={styles.emptyOverlay}>
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="airplane" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noVisitsFound')}</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('addFirstVisitMap') || 'Start tracking your travels by adding your first visit'}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/visit/add')}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>{t('addNewVisit')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* FAB still available */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/visit/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // Render Stats Header component - compact Days per Country only
  const renderStatsHeader = () => {
    if (sortedCountries.length === 0) return null;
    
    return (
      <View style={[styles.statsHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.heatmapContainer}>
          <Text style={[styles.heatmapLabel, { color: colors.textSecondary }]}>
            {t('daysPerCountry') || 'Days per country'}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.heatmapScroll}
          >
            {sortedCountries.map((item) => {
              const heatColor = getHeatmapColor(item.totalDays, maxDays);
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.heatmapCard, { backgroundColor: heatColor + '20', borderColor: heatColor }]}
                  onPress={() => {
                    // Could scroll to country on map or show details
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.heatmapFlag}>{item.country?.flag}</Text>
                  <Text style={[styles.heatmapDays, { color: heatColor }]}>{item.totalDays}</Text>
                  {item.hasActive && (
                    <View style={[styles.heatmapActiveDot, { backgroundColor: colors.success }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  // Web: Use iframe
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderStatsHeader()}
        <View style={styles.mapContainer}>
          <iframe
            ref={iframeRef}
            srcDoc={mapHtml}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Travel Map"
          />
        </View>
        {/* Legend Overlay */}
        <View style={[styles.legendContainer, { backgroundColor: colors.card + 'F0', borderColor: colors.border }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('currentlyVisiting') || 'Active'}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('pastVisits') || 'Past'}</Text>
          </View>
        </View>
        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/visit/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }

  // Native: Use WebView
  const WebView = require('react-native-webview').WebView;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderStatsHeader()}
      <View style={styles.mapContainer}>
        <WebView
          style={styles.webview}
          source={{ html: mapHtml }}
          scrollEnabled={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event: { nativeEvent: { data: string } }) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'visitClick' && data.visitId) {
                router.push(`/visit/${data.visitId}`);
              }
            } catch (e) {
              // Ignore
            }
          }}
        />
      </View>
      {/* Legend Overlay */}
      <View style={[styles.legendContainer, styles.legendContainerNative, { backgroundColor: colors.card + 'F0', borderColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('currentlyVisiting') || 'Active'}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('pastVisits') || 'Past'}</Text>
        </View>
      </View>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, styles.fabNative, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/visit/add')}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  // Stats Header Styles - Compact
  statsHeader: {
    paddingTop: 4,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  heatmapContainer: {
    marginTop: 0,
  },
  heatmapLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  heatmapScroll: {
    paddingHorizontal: 8,
    gap: 6,
  },
  heatmapCard: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 44,
    position: 'relative',
  },
  heatmapFlag: {
    fontSize: 14,
  },
  heatmapDays: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  heatmapActiveDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Empty State Styles - Improved
  emptyBackgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignContent: 'space-around',
    padding: 40,
  },
  patternDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  emptyOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    maxWidth: 320,
    width: '100%',
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Legend Overlay
  legendContainer: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendContainerNative: {
    bottom: 120,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  fabNative: {
    bottom: 120,
  },
});
