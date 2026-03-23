import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Platform, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { isCurrentVisit, formatDate, calculateDaysInCountry } from '../../src/utils/dateUtils';
import { getCountryByCode } from '../../src/constants/countries';

export default function MapScreen() {
  const { colors, isDark } = useTheme();
  const { visits, refreshVisits, t } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshVisits();
    }, [])
  );

  // Group visits by country
  const countryVisits = useMemo(() => {
    const grouped: { [key: string]: typeof visits } = {};
    visits.forEach(visit => {
      if (!grouped[visit.countryCode]) {
        grouped[visit.countryCode] = [];
      }
      grouped[visit.countryCode].push(visit);
    });
    return grouped;
  }, [visits]);

  const mapHtml = useMemo(() => {
    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png';

    // Country coordinates (approximate centers)
    const countryCoords: { [key: string]: [number, number] } = {
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
    };

    const markers = Object.entries(countryVisits).map(([code, cvs]) => {
      const country = getCountryByCode(code);
      const coords = countryCoords[code] || [0, 0];
      const hasActive = cvs.some(v => isCurrentVisit(v));
      const latestVisit = cvs.sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      )[0];
      
      return `
        L.marker([${coords[0]}, ${coords[1]}], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="font-size: 24px;">${country?.flag || '🏳️'}</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          })
        }).addTo(map).bindPopup(
          '<div style="font-size: 14px; min-width: 150px;">' +
          '<strong>${country?.flag} ${country?.name}</strong><br/>' +
          '<span style="color: #666;">${cvs.length} visit${cvs.length > 1 ? 's' : ''}</span><br/>' +
          '<span style="font-size: 12px;">Last: ${formatDate(latestVisit.entryDate, 'MMM d, yyyy')}</span>' +
          '</div>'
        );
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .custom-marker { background: none; border: none; }
          .leaflet-popup-content-wrapper { border-radius: 12px; }
          .leaflet-control-zoom a { 
            background: ${isDark ? '#2C2C2E' : '#FFFFFF'} !important;
            color: ${isDark ? '#FFFFFF' : '#1C1C1E'} !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: true }).setView([30, 0], 2);
          L.tileLayer('${tileUrl}', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          }).addTo(map);
          ${markers}
        </script>
      </body>
      </html>
    `;
  }, [countryVisits, isDark]);

  // On web, show a list-based view instead since WebView doesn't work
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.webHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Ionicons name="map" size={28} color={colors.primary} />
          <Text style={[styles.webTitle, { color: colors.text }]}>{t('visitedCountries')}</Text>
        </View>

        {Object.keys(countryVisits).length > 0 ? (
          <ScrollView contentContainerStyle={styles.webContent}>
            {Object.entries(countryVisits).map(([code, cvs]) => {
              const country = getCountryByCode(code);
              const hasActive = cvs.some(v => isCurrentVisit(v));
              const totalDays = cvs.reduce((sum, v) => sum + calculateDaysInCountry(v.entryDate, v.exitDate), 0);
              const latestVisit = cvs.sort((a, b) => 
                new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
              )[0];

              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.countryCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push('/list')}
                >
                  <Text style={styles.cardFlag}>{country?.flag}</Text>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardCountry, { color: colors.text }]}>{country?.name}</Text>
                      {hasActive && (
                        <View style={[styles.activeBadge, { backgroundColor: colors.success + '20' }]}>
                          <Text style={[styles.activeText, { color: colors.success }]}>{t('active')}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.cardVisits, { color: colors.textSecondary }]}>
                      {cvs.length} visit{cvs.length > 1 ? 's' : ''} • {totalDays} {t('days')}
                    </Text>
                    <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                      Last: {formatDate(latestVisit.entryDate, 'MMM d, yyyy')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 100 }} />
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="airplane" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('noVisitsFound')}</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t('tapCountryForDetails')}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/visit/add')}
            >
              <Text style={styles.addButtonText}>{t('addNewVisit')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Native: Use WebView
  const WebView = require('react-native-webview').WebView;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebView
        style={[styles.webview, { marginTop: insets.top }]}
        source={{ html: mapHtml }}
        scrollEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  webTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  webContent: {
    padding: 16,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardFlag: {
    fontSize: 40,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCountry: {
    fontSize: 18,
    fontWeight: '600',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardVisits: {
    fontSize: 14,
    marginTop: 4,
  },
  cardDate: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
