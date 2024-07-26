import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dimensions } from 'react-native';

// Get the window width and height
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Calculate padding and margin values based on window dimensions
const basePadding = 5; // Base padding value
const horizontalMargin = windowWidth > 360 ? basePadding * 2 : basePadding; // Adjust margin for larger screens
const verticalMargin = windowHeight > 700 ? basePadding * 8 : basePadding; // Adjust margin for taller screens

export default function App() {
  // State variables
  const [musicFiles, setMusicFiles] = useState([]);
  const [playing, setPlaying] = useState(-1);
  const [sound, setSound] = useState(null);
  const [progressDuration, setProgressDuration] = useState(0);

  // Function to fetch music files from the device's media library
  const fetchMusicFiles = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.granted) {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
      });
      setMusicFiles(media.assets);
    }
  };

  // Function to play a selected music file
  const playMusic = async (fileUri) => {
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    setSound(sound);
    await sound.playAsync();
  };

  // Function to pause the currently playing music
  const pauseMusic = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  // Effect hook to fetch music files when the component mounts
  useEffect(() => {
    fetchMusicFiles();
  }, []);

  // Effect hook to set up playback status updates for the current sound object
  useEffect(() => {
    if (!sound) {
      return;
    }
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        setPlaying(-1);
        await sound.unloadAsync();
        console.log("finished");
        setSound(null);
      } else {
        setProgressDuration(status.positionMillis / 1000);
      }
    });
  }, [sound]);

  // Render the UI
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.heading}>Welcome to ExpoPlayer</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.list}>
          {musicFiles.map((file, index) => (
            <View key={index}>
              <TouchableOpacity onPress={() => {
                if (playing !== index) {
                  playMusic(file.uri);
                  setPlaying(index);
                } else {
                  pauseMusic();
                  setPlaying(-1);
                }
              }} style={styles.playButton}>
                <View style={styles.playButtonContent}>
                  <Ionicons name={playing !== index ? "play" : "pause"} size={30} color="white" />
                  <Text style={styles.fileName}>{file.filename}</Text>
                </View>
                {playing === index && (
                  <View style={styles.row}>
                    <Text style={styles.fileName}>{progressDuration.toFixed(2)} / {file.duration}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1, // Allow container to take up full available space
    backgroundColor: "#fff",
    paddingTop: verticalMargin, // Adjust top padding for status bar
  },
  heading: {
    color: "blue",
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold",
    paddingHorizontal: horizontalMargin, // Apply horizontal padding
    marginBottom: verticalMargin, // Add margin below heading
  },
  scrollContainer: {
    flexGrow: 1, // Ensure the ScrollView can grow to fit content
  },
  list: {
    flexDirection: "column",
    paddingHorizontal: horizontalMargin, // Add horizontal padding to list
  },
  fileName: {
    fontSize: 18,
    color: "white",
    fontWeight: 'bold',
    paddingHorizontal: horizontalMargin, // Apply horizontal padding
  },
  playButton: {
    backgroundColor: 'gray',
    borderRadius: 50,
    padding: basePadding,
    marginVertical: basePadding, // Add vertical margin for spacing between items
    marginHorizontal: horizontalMargin, // Apply horizontal margin
  },
  playButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
