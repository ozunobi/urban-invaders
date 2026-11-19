import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import SightingMap, { type SightingMapPin } from '../components/SightingMap';

type Report = {
  id: string;
  species: string;
  description: string;
  reportedAt: string;
  photoUrl: string | null;
  latitude: number;
  longitude: number;
};

type ReportLocation = SightingMapPin & {
  name: string;
  reports: Report[];
};

const INITIAL_CENTER = {
  latitude: 14.55,
  longitude: 121.1,
  zoom: 10,
};

interface HeatmapEmbedProps {
  supabaseUrl: string;
  supabaseKey: string;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  maxReports?: number;
}

export default function HeatmapEmbed({
  supabaseUrl,
  supabaseKey,
  centerLat = 14.55,
  centerLng = 121.1,
  zoom = 10,
  maxReports = 1000,
}: HeatmapEmbedProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({
    latitude: centerLat,
    longitude: centerLng,
    zoom,
  });
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${supabaseUrl}/rest/v1/sighting_reports?status=eq.accepted&limit=${maxReports}`, {
          headers: {
            apikey: supabaseKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }

        const data = await response.json();
        setReports(
          data.map((report: any) => ({
            id: report.id,
            species: report.species,
            description: report.description,
            latitude: report.latitude,
            longitude: report.longitude,
            reportedAt: [report.sighting_date || new Date(report.created_at).toLocaleDateString(), report.sighting_time]
              .filter(Boolean)
              .join(' '),
            photoUrl: report.photo_url,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [supabaseUrl, supabaseKey, maxReports]);

  const locations: ReportLocation[] = reports.map((report) => ({
    id: report.id,
    latitude: report.latitude,
    longitude: report.longitude,
    intensity: 0.5,
    name: `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`,
    reports: [report],
  }));

  const selectedLocation = locations.find((location) => location.id === selectedLocationId) ?? null;
  const mapPins = locations.map((location) => ({
    id: location.id,
    latitude: location.latitude,
    longitude: location.longitude,
    intensity: location.intensity,
    selected: location.id === selectedLocationId,
  }));

  const selectLocation = (location: ReportLocation) => {
    setSelectedLocationId(location.id);
    setMapCenter({
      latitude: location.latitude,
      longitude: location.longitude,
      zoom: 12,
    });
    setIsDrawerExpanded(true);
  };

  const styles = createStyles();

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EC6425" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SightingMap
        center={mapCenter}
        selectedLocation={null}
        pins={mapPins}
        onPinSelect={(pinId) => {
          const location = locations.find((item) => item.id === pinId);
          if (location) selectLocation(location);
        }}
        dom={{ scrollEnabled: true, style: { width: '100%', height: '100%', zIndex: 0 } }}
      />

      <View
        style={[
          styles.drawer,
          isDrawerExpanded ? styles.drawerExpanded : styles.drawerCollapsed,
        ]}
      >
        <SafeAreaView edges={['bottom']} style={styles.drawerSafeArea}>
          <View style={styles.drawerHandleArea}>
            <View style={styles.drawerHandle} />
          </View>

          <View style={styles.drawerHeading}>
            <View style={styles.drawerTitleBlock}>
              <Text style={styles.drawerEyebrow}>REPORTS NEAR</Text>
              <Text style={styles.drawerTitle}>
                {selectedLocation?.name ?? 'Select a location'}
              </Text>
            </View>
            {selectedLocation && (
              <View style={styles.reportCount}>
                <Text style={styles.reportCountText}>
                  {selectedLocation.reports.length}
                </Text>
              </View>
            )}
          </View>

          {selectedLocation ? (
            <ScrollView
              contentContainerStyle={styles.reportList}
              style={styles.reportScroll}
              showsVerticalScrollIndicator={false}
            >
              {selectedLocation.reports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportCardTop}>
                    <Text style={styles.reportCategory}>INVASIVE SPECIES</Text>
                    <Text style={styles.reportDate}>{report.reportedAt}</Text>
                  </View>
                  <Text style={styles.speciesName}>{report.species}</Text>
                  <Text style={styles.reportDescription}>{report.description}</Text>
                  {report.photoUrl && (
                    <Image
                      source={{ uri: report.photoUrl }}
                      contentFit="cover"
                      style={{ width: '100%', height: 180, marginTop: 10, borderRadius: 6 }}
                    />
                  )}
                  <View style={styles.reportLocation}>
                    <Text style={styles.reportLocationText}>{selectedLocation.name}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyState}>
              Click on a marker to view reports from that location
            </Text>
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#E8E3DB',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      color: '#746B64',
      fontFamily: 'PPMori',
      fontSize: 14,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      color: '#B94417',
      fontFamily: 'PPMori',
      fontSize: 14,
      textAlign: 'center',
    },
    drawer: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1102,
      overflow: 'hidden',
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      backgroundColor: '#FFF7F0',
      shadowColor: '#201C18',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 12,
    },
    drawerCollapsed: {
      height: '42%',
    },
    drawerExpanded: {
      height: '65%',
    },
    drawerSafeArea: {
      flex: 1,
      backgroundColor: '#FFF7F0',
    },
    drawerHandleArea: {
      height: 25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    drawerHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#C8BDB3',
    },
    drawerHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingBottom: 12,
    },
    drawerTitleBlock: {
      gap: 3,
    },
    drawerEyebrow: {
      color: '#746B64',
      fontFamily: 'PPMoriBold',
      fontSize: 10,
      letterSpacing: 1.1,
    },
    drawerTitle: {
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 20,
    },
    reportCount: {
      minWidth: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
      borderRadius: 15,
      backgroundColor: '#FCE1D2',
    },
    reportCountText: {
      color: '#B94417',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    reportList: {
      gap: 10,
      paddingHorizontal: 16,
      paddingBottom: 10,
    },
    reportScroll: {
      flex: 1,
    },
    reportCard: {
      padding: 14,
      borderRadius: 14,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#EFE6DE',
    },
    reportCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    reportCategory: {
      color: '#B94417',
      fontFamily: 'PPMoriBold',
      fontSize: 9,
      letterSpacing: 0.8,
    },
    reportDate: {
      color: '#82776F',
      fontFamily: 'PPMori',
      fontSize: 10,
    },
    speciesName: {
      marginTop: 7,
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 16,
    },
    reportDescription: {
      marginTop: 5,
      color: '#625A54',
      fontFamily: 'PPMori',
      fontSize: 12,
      lineHeight: 17,
    },
    reportLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 9,
    },
    reportLocationText: {
      color: '#746B64',
      fontFamily: 'PPMori',
      fontSize: 10,
    },
    emptyState: {
      paddingHorizontal: 18,
      color: '#746B64',
      fontFamily: 'PPMori',
      fontSize: 13,
      lineHeight: 19,
    },
  });
}
