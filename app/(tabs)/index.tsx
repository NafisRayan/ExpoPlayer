import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions, TouchableHighlight } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';

// Get the window width and height
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// Calculate padding and margin values based on window dimensions
const basePadding = 10;
const horizontalMargin = windowWidth > 360 ? basePadding * 3 : basePadding;
const verticalMargin = windowHeight > 700 ? basePadding * 4 : basePadding;

export default function App() {
  const [musicFiles, setMusicFiles] = useState([]);
  const [playing, setPlaying] = useState(-1);
  const [sound, setSound] = useState(null);
  const [progressDuration, setProgressDuration] = useState(0);

  const fetchMusicFiles = async () => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (permission.granted) {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
      });
      setMusicFiles(media.assets);
    }
  };

  const playMusic = async (fileUri) => {
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    setSound(sound);
    await sound.playAsync();
  };

  const pauseMusic = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  useEffect(() => {
    fetchMusicFiles();
  }, []);

  useEffect(() => {
    if (!sound) {
      return;
    }
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        setPlaying(-1);
        await sound.unloadAsync();
        setSound(null);
      } else {
        setProgressDuration(status.positionMillis / 1000);
      }
    });
  }, [sound]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.heading}>ExpoPlayer</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.list}>
          {musicFiles.map((file, index) => (
            <View key={index} style={styles.card}>
              <TouchableOpacity onPress={() => {
                if (playing !== index) {
                  playMusic(file.uri);
                  setPlaying(index);
                } else {
                  pauseMusic();
                  setPlaying(-1);
                }
              }} style={styles.playButton}>
                <Ionicons name={playing !== index ? "play-circle" : "pause-circle"} size={30} color="#fff" />
                <View style={styles.textContainer}>
                  <Text style={styles.fileName}>{file.filename}</Text>
                  {playing === index && (
                    <Text style={styles.progress}>{progressDuration.toFixed(2)} / {Math.floor(file.duration / 1000)}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
    paddingTop: verticalMargin,
  },
  heading: {
    color: "#fff",
    fontSize: 32,
    textAlign: "center",
    fontWeight: "bold",
    paddingHorizontal: horizontalMargin,
    marginBottom: verticalMargin,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  list: {
    flexDirection: "column",
    paddingHorizontal: horizontalMargin,
  },
  card: {
    backgroundColor: '#1e1e1e', // Card background
    borderRadius: 15,
    marginVertical: basePadding,
    padding: basePadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: basePadding,
    flex: 1,
  },
  fileName: {
    fontSize: 18,
    color: "#fff",
    fontWeight: 'bold',
  },
  progress: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
});
