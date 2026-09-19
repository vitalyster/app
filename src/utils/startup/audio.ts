import { setAudioModeAsync } from 'expo-audio'
import log from './log'

const audio = () => {
  log('log', 'audio', 'setting audio playback default options')
  setAudioModeAsync({
    interruptionMode: 'doNotMix',
    playsInSilentMode: true,
    shouldPlayInBackground: false
  })
}

export default audio
