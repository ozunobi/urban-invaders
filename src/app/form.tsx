import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput,
    useColorScheme, View, } from 'react-native';
import { Image } from 'expo-image';
import type { DOMProps } from 'expo/dom';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import SightingMap, {
  type SightingCoordinates,
  type SightingMapCenter,
} from '../components/SightingMap';
import { useAppData } from '../components/AppDataContext';

type SpeciesOption = {
  value: string;
  name: string;
  scientificName?: string;
};

const SPECIES_OPTIONS: SpeciesOption[] = [
  { value: 'finlaysons-squirrels', name: 'Finlayson\'\s Squirrel', scientificName: 'Callosciurus finlaysonii' },
  { value: 'golden-apple-snail', name: 'Golden apple snail', scientificName: 'Pomacea canaliculata' },
  { value: 'water-hyacinth', name: 'Water hyacinth', scientificName: 'Pontederia crassipes' },
  { value: 'giant-african-land-snail', name: 'Giant African land snail', scientificName: 'Lissachatina fulica' },
  { value: 'cane-toad', name: 'Cane toad', scientificName: 'Rhinella marina' },
  { value: 'nile-tilapia', name: 'Nile tilapia', scientificName: 'Oreochromis niloticus' },
  { value: 'hagonoy', name: 'Hagonoy', scientificName: 'Chromolaena odorata' },
  { value: 'other', name: 'Other / not listed' },
];

const PHILIPPINES_CENTER: SightingMapCenter = {
  latitude: 12.8797,
  longitude: 121.774,
  zoom: 5,
};

const SIGHTING_MAP_DOM_PROPS: DOMProps = {
  scrollEnabled: false,
  style: { width: '100%', height: 280 },
};

const MemoizedSightingMap = React.memo(SightingMap);

export default function SightingForm() {
  const { submitReport: saveReport, dataReady, dataError } = useAppData();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const styles = createStyles(theme, isDark);
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [otherSpecies, setOtherSpecies] = useState('');
  const [isSpeciesPickerOpen, setIsSpeciesPickerOpen] = useState(false);
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [speciesError, setSpeciesError] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [description, setDescription] = useState('');
  const [mapCenter, setMapCenter] = useState(PHILIPPINES_CENTER);
  const [selectedLocation, setSelectedLocation] =
    useState<SightingCoordinates | null>(null);
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSpeciesOption = SPECIES_OPTIONS.find(
    (option) => option.value === selectedSpecies,
  );
  const filteredSpecies = useMemo(() => {
    const search = speciesSearch.trim().toLowerCase();
    if (!search) return SPECIES_OPTIONS;
    return SPECIES_OPTIONS.filter((option) =>
      `${option.name} ${option.scientificName ?? ''}`.toLowerCase().includes(search),
    );
  }, [speciesSearch]);

  const choosePhoto = async () => {
    setPhotoError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : 'Unable to open the photo library.',
      );
    }
  };

  const useCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationError(
          'Location permission was not granted. You can still tap the map to place a pin.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync();
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setMapCenter({ ...coordinates, zoom: 15 });
      setSelectedLocation(coordinates);
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : 'Unable to get your current location.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  const selectMapLocation = useCallback((coordinates: SightingCoordinates) => {
    setSelectedLocation(coordinates);
    setLocationError('');
  }, []);

  const submitReport = async () => {
    if (isSubmitting || !dataReady) return;
    const speciesIsValid =
      selectedSpecies.length > 0 &&
      (selectedSpecies !== 'other' || otherSpecies.trim().length > 0);

    if (!speciesIsValid) {
      setSpeciesError(
        selectedSpecies === 'other'
          ? 'Enter the species name.'
          : 'Please select a species.',
      );
      setSubmitMessage('');
      return;
    }

    setSpeciesError('');
    if (!selectedLocation) {
      setLocationError('Please select a location on the map.');
      return;
    }
    setLocationError('');
    setSubmitMessage('');
    setIsSubmitting(true);
    try {
      await saveReport({
        species: selectedSpecies === 'other' ? otherSpecies.trim() : selectedSpeciesOption?.name ?? selectedSpecies,
        description: description.trim(),
        sighting_date: date.trim(),
        sighting_time: time.trim(),
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      }, photoUri);
      setSelectedSpecies('');
      setOtherSpecies('');
      setDate('');
      setTime('');
      setPhotoUri(null);
      setDescription('');
      setSelectedLocation(null);
      setSubmitMessage('Report submitted for review.');
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : 'Unable to submit your report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit a Sighting</Text>
          <Text style={{ color: 'white' }}>What did you see?</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Species <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.helperText}>
              Select or enter the species you observed.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose a species"
              accessibilityState={{ expanded: isSpeciesPickerOpen }}
              onPress={() => setIsSpeciesPickerOpen(true)}
              style={styles.selectField}
            >
              <Text
                style={[
                  styles.fieldText,
                  !selectedSpeciesOption && styles.placeholderText,
                ]}
              >
                {selectedSpeciesOption?.name ?? 'Select a species'}
              </Text>
              <Text style={styles.dropdownArrow}>⌄</Text>
            </Pressable>
            {selectedSpeciesOption?.scientificName && (
              <Text style={styles.scientificName}>
                {selectedSpeciesOption.scientificName}
              </Text>
            )}
            {speciesError.length > 0 && (
              <Text style={styles.errorText}>{speciesError}</Text>
            )}
            {selectedSpecies === 'other' && (
              <TextInput
                accessibilityLabel="Other species name"
                onChangeText={setOtherSpecies}
                placeholder="Enter the species name"
                placeholderTextColor={styles.placeholderText.color}
                style={styles.input}
                value={otherSpecies}
              />
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Date &amp; Time</Text>
            <Text style={styles.helperText}>When did you see it?</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                accessibilityLabel="Sighting date"
                onChangeText={setDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={styles.placeholderText.color}
                style={[styles.input, styles.dateTimeInput]}
                value={date}
              />
              <TextInput
                accessibilityLabel="Sighting time"
                onChangeText={setTime}
                placeholder="Time"
                placeholderTextColor={styles.placeholderText.color}
                style={[styles.input, styles.dateTimeInput]}
                value={time}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Add a Photo</Text>
            <Text style={styles.helperText}>
              Upload a clear photo of the animal or species you observed
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={choosePhoto}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                {photoUri ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
              </Text>
            </Pressable>
            {photoUri && (
              <View style={styles.photoPreviewContainer}>
                <Image
                  source={{ uri: photoUri }}
                  contentFit="cover"
                  style={styles.photoPreview}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPhotoUri(null)}
                  style={styles.removePhotoButton}
                >
                  <Text style={styles.removePhotoText}>REMOVE PHOTO</Text>
                </Pressable>
              </View>
            )}
            {photoError.length > 0 && (
              <Text style={styles.errorText}>{photoError}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell Us About The Sighting</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              accessibilityLabel="Sighting description"
              multiline
              onChangeText={setDescription}
              placeholder="Describe what you observed..."
              placeholderTextColor={styles.placeholderText.color}
              style={styles.descriptionInput}
              textAlignVertical="top"
              value={description}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Pin the Location</Text>
            <Text style={styles.helperText}>
              Use your current location or tap the map to place or move the pin.
            </Text>
            <Pressable
              accessibilityRole="button"
              disabled={isLocating}
              onPress={useCurrentLocation}
              style={({ pressed }) => [
                styles.secondaryButton,
                isLocating && styles.disabledButton,
                pressed && !isLocating && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                {isLocating ? 'GETTING LOCATION...' : 'USE MY LOCATION'}
              </Text>
            </Pressable>
            {locationError.length > 0 && (
              <Text style={styles.errorText}>{locationError}</Text>
            )}
            <View style={styles.mapFrame}>
              <MemoizedSightingMap
                center={mapCenter}
                selectedLocation={selectedLocation}
                onLocationSelect={selectMapLocation}
                dom={SIGHTING_MAP_DOM_PROPS}
              />
            </View>
            <Text style={styles.locationText}>
              {selectedLocation
                ? `Pinned: ${selectedLocation.latitude.toFixed(5)}, ${selectedLocation.longitude.toFixed(5)}`
                : 'No location pin selected yet.'}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting || !dataReady}
          onPress={submitReport}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.submitButtonText}>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}</Text>
        </Pressable>
        {submitMessage.length > 0 && (
          <Text accessibilityRole="alert" style={styles.submitMessage}>
            {submitMessage}
          </Text>
        )}
        {!!dataError && <Text accessibilityRole="alert" style={styles.submitMessage}>{dataError}</Text>}
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsSpeciesPickerOpen(false)}
        transparent
        visible={isSpeciesPickerOpen}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close species list"
            onPress={() => setIsSpeciesPickerOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select a Species</Text>
            <TextInput
              accessibilityLabel="Search species"
              onChangeText={setSpeciesSearch}
              placeholder="Search species"
              placeholderTextColor={styles.placeholderText.color}
              style={styles.input}
              value={speciesSearch}
            />
            <FlatList
              data={filteredSpecies}
              keyExtractor={(option) => option.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.emptySearchText}>No species found.</Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedSpecies(item.value);
                    setOtherSpecies('');
                    setSpeciesError('');
                    setSpeciesSearch('');
                    setIsSpeciesPickerOpen(false);
                  }}
                  style={styles.speciesOption}
                >
                  <Text style={styles.speciesOptionName}>{item.name}</Text>
                  {item.scientificName && (
                    <Text style={styles.scientificName}>
                      {item.scientificName}
                    </Text>
                  )}
                </Pressable>
              )}
              style={styles.speciesList}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSpeciesSearch('');
                setIsSpeciesPickerOpen(false);
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: typeof Colors.light, isDark: boolean) {
  const cardBackground = isDark ? '#242424' : '#201C18';
  const secondaryText = isDark ? '#bbb' : '#666';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 760,
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 28,
      gap: 16,
    },
    section: {
      gap: 18,
      padding: 16,
      borderRadius: 14,
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: isDark ? '#414141' : '#e8e1dc',
    },
    sectionTitle: {
      color: 'white',
      fontFamily: 'PPMoriBold',
      fontSize: 18,
    },
    fieldGroup: {
      gap: 8,
    },
    label: {
      color: 'white',
      fontFamily: 'PPMoriBold',
      fontSize: 15,
    },
    required: {
      color: '#c83e25',
    },
    helperText: {
      color: secondaryText,
      fontSize: 13,
      lineHeight: 18,
    },
    selectField: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#cfc8c2',
      borderRadius: 8,
      backgroundColor: theme.background,
    },
    fieldText: {
      flex: 1,
      color: theme.text,
      fontSize: 15,
    },
    placeholderText: {
      color: secondaryText,
    },
    dropdownArrow: {
      color: '#006A63',
      fontSize: 22,
      paddingLeft: 8,
    },
    scientificName: {
      color: secondaryText,
      fontSize: 12,
      fontStyle: 'italic',
    },
    input: {
      minHeight: 48,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#cfc8c2',
      borderRadius: 8,
      color: theme.text,
      backgroundColor: theme.background,
      fontSize: 15,
    },
    dateTimeRow: {
      flexDirection: 'row',
      gap: 10,
    },
    dateTimeInput: {
      flex: 1,
      minWidth: 0,
    },
    secondaryButton: {
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: '#006A63',
    },
    secondaryButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
    photoPreviewContainer: {
      gap: 8,
    },
    photoPreview: {
      width: '100%',
      height: 210,
      borderRadius: 8,
    },
    removePhotoButton: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
    },
    removePhotoText: {
      color: '#c83e25',
      fontFamily: 'PPMoriBold',
      fontSize: 12,
    },
    descriptionInput: {
      minHeight: 150,
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#cfc8c2',
      borderRadius: 8,
      color: theme.text,
      backgroundColor: theme.background,
      fontSize: 15,
      lineHeight: 21,
    },
    mapFrame: {
      height: 280,
      overflow: 'hidden',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#cfc8c2',
      backgroundColor: isDark ? '#303030' : '#e8e5e1',
    },
    locationText: {
      color: secondaryText,
      fontSize: 12,
    },
    errorText: {
      color: '#c83e25',
      fontSize: 13,
    },
    submitButton: {
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#EC6425',
    },
    submitButtonText: {
      color: '#fff',
      fontFamily: 'PPMoriBold',
      fontSize: 15,
    },
    submitMessage: {
      color: '#006A63',
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    buttonPressed: {
      opacity: 0.8,
    },
    disabledButton: {
      opacity: 0.55,
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    modalCard: {
      width: '100%',
      maxWidth: 480,
      maxHeight: '80%',
      padding: 18,
      gap: 12,
      borderRadius: 14,
      backgroundColor: cardBackground,
    },
    modalTitle: {
      color: 'white',
      fontFamily: 'PPMoriBold',
      fontSize: 19,
    },
    speciesList: {
      flexGrow: 0,
      maxHeight: 380,
    },
    speciesOption: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? '#555' : '#ddd',
    },
    speciesOptionName: {
      color: 'white',
      fontSize: 15,
    },
    emptySearchText: {
      paddingVertical: 18,
      color: secondaryText,
      textAlign: 'center',
    },
    cancelButton: {
      alignSelf: 'flex-end',
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    cancelButtonText: {
      color: '#006A63',
      fontFamily: 'PPMoriBold',
      fontSize: 13,
    },
  });
}