import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

type Report = {
  id: string;
  species: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  created_at: string;
  photo_url: string | null;
};

interface ReportsTableEmbedProps {
  supabaseUrl: string;
  supabaseKey: string;
  status?: 'accepted' | 'pending' | 'rejected' | 'all';
  limit?: number;
  columns?: Array<'species' | 'location' | 'date' | 'status' | 'description'>;
  enableDetails?: boolean;
}

export default function ReportsTableEmbed({
  supabaseUrl,
  supabaseKey,
  status = 'accepted',
  limit = 100,
  columns = ['species', 'location', 'date', 'status'],
  enableDetails = true,
}: ReportsTableEmbedProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const statusFilter = status === 'all' ? '' : `&status=eq.${status}`;
        const url = `${supabaseUrl}/rest/v1/sighting_reports?limit=${limit}${statusFilter}&order=created_at.desc`;
        
        console.log('Fetching from:', url);
        console.log('With key:', supabaseKey?.substring(0, 20) + '...');
        
        const response = await fetch(url, {
          headers: {
            apikey: supabaseKey,
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Array.from(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response body:', errorText);
          throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Successfully fetched data:', data);
        setReports(data || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load reports';
        setError(errorMsg);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [supabaseUrl, supabaseKey, status, limit]);

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

  if (selectedReport && enableDetails) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.detailContainer}>
          <Pressable
            style={styles.backButton}
            onPress={() => setSelectedReport(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>

          <ScrollView style={styles.detailScroll}>
            <View style={styles.detailContent}>
              <Text style={styles.detailSpecies}>{selectedReport.species}</Text>
              <Text style={styles.detailDate}>
                {new Date(selectedReport.created_at).toLocaleDateString()}
              </Text>

              {selectedReport.photo_url && (
                <Image
                  source={{ uri: selectedReport.photo_url }}
                  contentFit="cover"
                  style={styles.detailImage}
                />
              )}

              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailText}>{selectedReport.description}</Text>

              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailText}>
                {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
              </Text>

              <Pressable
                style={styles.mapsButton}
                onPress={() => {
                  const url = `https://maps.google.com/?q=${selectedReport.latitude},${selectedReport.longitude}`;
                  Linking.openURL(url);
                }}
              >
                <Text style={styles.mapsButtonText}>View on Maps</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.tableContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Invasive Species Reports</Text>
          <Text style={styles.headerSubtitle}>
            {reports.length} reports found
          </Text>
        </View>

        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.reportRow}
              onPress={() => enableDetails && setSelectedReport(item)}
            >
              <View style={styles.rowContent}>
                {columns.includes('species') && (
                  <View style={styles.column}>
                    <Text style={styles.rowLabel}>Species</Text>
                    <Text style={styles.rowValue}>{item.species}</Text>
                  </View>
                )}
                {columns.includes('location') && (
                  <View style={styles.column}>
                    <Text style={styles.rowLabel}>Location</Text>
                    <Text style={styles.rowValue} numberOfLines={1}>
                      {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                    </Text>
                  </View>
                )}
                {columns.includes('date') && (
                  <View style={styles.column}>
                    <Text style={styles.rowLabel}>Date</Text>
                    <Text style={styles.rowValue}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {columns.includes('status') && (
                  <View style={styles.column}>
                    <Text style={styles.rowLabel}>Status</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'accepted'
                          ? styles.statusAccepted
                          : item.status === 'pending'
                            ? styles.statusPending
                            : styles.statusRejected,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </Pressable>
          )}
          scrollEnabled={false}
        />
      </SafeAreaView>
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
    tableContainer: {
      flex: 1,
      backgroundColor: '#FFF7F0',
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#EFE6DE',
    },
    headerTitle: {
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 18,
    },
    headerSubtitle: {
      marginTop: 4,
      color: '#746B64',
      fontFamily: 'PPMori',
      fontSize: 12,
    },
    reportRow: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F0E8',
    },
    rowContent: {
      flexDirection: 'row',
      gap: 12,
    },
    column: {
      flex: 1,
    },
    rowLabel: {
      color: '#746B64',
      fontFamily: 'PPMoriBold',
      fontSize: 10,
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    rowValue: {
      color: '#201C18',
      fontFamily: 'PPMori',
      fontSize: 13,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    statusAccepted: {
      backgroundColor: '#D4EDDA',
    },
    statusPending: {
      backgroundColor: '#FFF3CD',
    },
    statusRejected: {
      backgroundColor: '#F8D7DA',
    },
    statusText: {
      fontFamily: 'PPMoriBold',
      fontSize: 11,
      color: '#201C18',
    },
    detailContainer: {
      flex: 1,
      backgroundColor: '#FFF7F0',
    },
    backButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    backButtonText: {
      color: '#EC6425',
      fontFamily: 'PPMoriBold',
      fontSize: 14,
    },
    detailScroll: {
      flex: 1,
    },
    detailContent: {
      padding: 16,
    },
    detailSpecies: {
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 24,
      marginBottom: 8,
    },
    detailDate: {
      color: '#746B64',
      fontFamily: 'PPMori',
      fontSize: 12,
      marginBottom: 16,
    },
    detailImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 16,
    },
    detailLabel: {
      color: '#746B64',
      fontFamily: 'PPMoriBold',
      fontSize: 11,
      letterSpacing: 0.6,
      marginTop: 12,
      marginBottom: 6,
    },
    detailText: {
      color: '#201C18',
      fontFamily: 'PPMori',
      fontSize: 14,
      lineHeight: 20,
    },
    mapsButton: {
      marginTop: 20,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: '#EC6425',
      borderRadius: 10,
      alignItems: 'center',
    },
    mapsButtonText: {
      color: '#FFF7F0',
      fontFamily: 'PPMoriBold',
      fontSize: 14,
    },
  });
}
