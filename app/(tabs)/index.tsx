// Import necessary modules
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function App() {
  // State variables
  const [musicFiles, setMusicFiles] = useState([]);
  const [playing, setPlaying] = useState(-1);
  const [sound, setSound] = useState(null);
  const [progressDuration, setProgressDuration] = useState(0);

  // Function to fetch music files from the device's media library
  const fetchMusicFiles = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
    });
    setMusicFiles(media.assets);
  };

  // Function to play a selected music file
  const playMusic = async (fileUri) => {
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    setSound(sound);
    await sound.playAsync();
  };

  // Function to pause the currently playing music
  const pauseMusic = async () => {
    await sound.pauseAsync();
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
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
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
    </View>
  );
}

// Define styles
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  container: {
    backgroundColor: "#fff",
    height: "100%",
    marginTop: 50,
  },
  heading: {
    color: "blue",
    fontSize: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  list: {
    marginTop: 20,
    flex: 1,
    flexDirection: "column",
  },
  fileName: {
    fontSize: 18,
    color: "white",
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: 'gray',
    borderRadius: 50,
    padding: 10,
    margin: 10,
  },
});
