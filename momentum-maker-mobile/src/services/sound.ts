import { Audio } from 'expo-av';

class SoundService {
  private static instance: SoundService;
  private sound: Audio.Sound | null = null;
  private playCount: number = 0;
  private readonly maxPlays: number = 3;
  private isPlaySequenceActive: boolean = false;
  private playbackTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    // Konfiguriere Audio für Hintergrund-Wiedergabe
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      playsInSilentModeIOS: true, // Wichtig für iOS
    });
  }

  public static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  private async loadSound() {
    try {
      if (this.sound) {
        await this.unloadSound();
      }
      
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm.mp3'),
        {
          shouldPlay: false,
          isLooping: false,
          volume: 1.0,
        }
      );
      
      await sound.setVolumeAsync(1.0);
      
      this.sound = sound;
      this.playCount = 0;
    } catch (error) {
      throw error;
    }
  }

  private async playNextSound() {
    if (!this.sound || this.playCount >= this.maxPlays) {
      await this.unloadSound();
      return;
    }

    try {
      this.playCount++;
      await this.sound.setPositionAsync(0);
      await this.sound.playAsync();
      
      this.playbackTimeout = setTimeout(async () => {
        await this.playNextSound();
      }, 3000);
      
    } catch (error) {
      await this.unloadSound();
    }
  }

  public async playAlarm() {
    if (this.isPlaySequenceActive) {
      return;
    }

    try {
      this.isPlaySequenceActive = true;
      await this.loadSound();
      await this.playNextSound();
    } catch (error) {
      // Fehler werden bereits in den einzelnen Funktionen behandelt
    }
  }

  public async stopAlarm() {
    await this.unloadSound();
  }

  private async unloadSound() {
    try {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout);
        this.playbackTimeout = null;
      }
      
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      this.playCount = 0;
      this.isPlaySequenceActive = false;
    } catch (error) {
      // Fehler ignorieren beim Aufräumen
    }
  }
}

export const soundService = SoundService.getInstance(); 