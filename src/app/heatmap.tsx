import React, { useState } from 'react';
import { SymbolView } from 'expo-symbols';
import type { DOMProps } from 'expo/dom';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import HeaderMenu from '../components/HeaderMenu';
import SightingMap, { type SightingMapCenter, type SightingMapPin, } from '../components/SightingMap';
import { useAppData } from '../components/AppDataContext';

type Report = {
  id: string;
  species: string;
  description: string;
  reportedAt: string;
  photoUrl: string | null;
};

type ReportLocation = SightingMapPin & {
  name: string;
  reports: Report[];
};

const INITIAL_CENTER: SightingMapCenter = {
  latitude: 14.55,
  longitude: 121.1,
  zoom: 10,
};

const MAP_DOM_PROPS: DOMProps = {
  scrollEnabled: true,
  style: { width: '100%', height: '100%', zIndex: 0 },
};

export default function HeatmapScreen() {
  const { reports, dataError } = useAppData();
  const locations: ReportLocation[] = reports.filter((report) => report.status === 'accepted').map((report) => ({
    id: report.id,
    latitude: report.latitude,
    longitude: report.longitude,
    intensity: 0.5,
    name: `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`,
    reports: [{
      id: report.id,
      species: report.species,
      description: report.description,
      reportedAt: [report.sighting_date || new Date(report.created_at).toLocaleDateString(), report.sighting_time].filter(Boolean).join(' '),
      photoUrl: report.photo_url,
    }],
  }));
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ?? null;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingLocations = normalizedQuery
    ? locations.filter((location) =>
        `${location.name} ${location.reports
          .map((report) => report.species)
          .join(' ')}`
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : [];
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
    setSearchQuery(location.name);
    setShowSuggestions(false);
    setIsDrawerExpanded(true);
  };

  const submitSearch = () => {
    const match = matchingLocations[0];
    if (match) {
      selectLocation(match);
    } else {
      setShowSuggestions(false);
    }
  };

  const styles = createStyles();

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
        dom={MAP_DOM_PROPS}
      />

      <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.topOverlay}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <SymbolView
              name={{ android: 'search', web: 'search' }}
              size={20}
              tintColor="#746B64"
            />
            <TextInput
              accessibilityLabel="Search locations"
              onChangeText={(text) => {
                setSearchQuery(text);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onSubmitEditing={submitSearch}
              placeholder="Search locations"
              placeholderTextColor="#8B8178"
              returnKeyType="search"
              style={styles.searchInput}
              value={searchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable
                accessibilityLabel="Clear location search"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
              >
                <SymbolView
                  name={{ android: 'close', web: 'close' }}
                  size={18}
                  tintColor="#746B64"
                />
              </Pressable>
            )}
          </View>
          <HeaderMenu />
        </View>
        {showSuggestions && normalizedQuery.length > 0 && (
          <View style={styles.suggestions}>
            {matchingLocations.length > 0 ? (
              matchingLocations.map((location) => (
                <Pressable
                  accessibilityRole="button"
                  key={location.id}
                  onPress={() => selectLocation(location)}
                  style={styles.suggestion}
                >
                  <SymbolView
                    name={{ android: 'location_on', web: 'location_on' }}
                    size={18}
                    tintColor="#EC6425"
                  />
                  <View>
                    <Text style={styles.suggestionName}>{location.name}</Text>
                    <Text style={styles.suggestionMeta}>
                      {location.reports.length} community reports
                    </Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={styles.noResults}>No matching locations</Text>
            )}
          </View>
        )}
      </SafeAreaView>

      <View
        style={[
          styles.drawer,
          isDrawerExpanded ? styles.drawerExpanded : styles.drawerCollapsed,
        ]}
      >
        <SafeAreaView edges={['bottom']} style={styles.drawerSafeArea}>
          <Pressable
            accessibilityLabel={isDrawerExpanded ? 'Collapse reports' : 'Expand reports'}
            accessibilityRole="button"
            onPress={() => setIsDrawerExpanded((expanded) => !expanded)}
            style={styles.drawerHandleArea}
          >
            <View style={styles.drawerHandle} />
          </Pressable>

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
                  {report.photoUrl && <Image source={{ uri: report.photoUrl }} contentFit="cover" style={{ width: '100%', height: 180, marginTop: 10, borderRadius: 6 }} />}
                  <View style={styles.reportLocation}>
                    <SymbolView
                      name={{ android: 'location_on', web: 'location_on' }}
                      size={14}
                      tintColor="#746B64"
                    />
                    <Text style={styles.reportLocationText}>
                      {selectedLocation.name}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyState}>
              {dataError || 'Select a location on the map to view an accepted report.'}
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
    topOverlay: {
      position: 'absolute',
      top: 0,
      left: 12,
      right: 12,
      zIndex: 1101,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    searchBox: {
      height: 50,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: '#FFF7F0',
      borderWidth: 1,
      borderColor: 'rgba(32, 28, 24, 0.12)',
      shadowColor: '#201C18',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 6,
      elevation: 4,
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 0,
      color: '#201C18',
      fontFamily: 'PPMori',
      fontSize: 14,
    },
    suggestions: {
      marginTop: 7,
      marginRight: 52,
      paddingVertical: 5,
      borderRadius: 14,
      backgroundColor: '#FFF7F0',
      borderWidth: 1,
      borderColor: 'rgba(32, 28, 24, 0.1)',
      shadowColor: '#201C18',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 5,
    },
    suggestion: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    suggestionName: {
      color: '#201C18',
      fontFamily: 'PPMoriBold',
      fontSize: 14,
    },
    suggestionMeta: {
      marginTop: 2,
      color: '#746B64',
      fontFamily: 'PPMori',
      fontSize: 11,
    },
    noResults: {
      paddingHorizontal: 14,
      paddingVertical: 16,
      color: '#746B64',
      fontFamily: 'PPMori',
      fontSize: 13,
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
