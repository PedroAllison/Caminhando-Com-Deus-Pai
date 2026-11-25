import { Alert, Platform } from 'react-native';
// Alert.alert não funciona na web; usa window.alert lá.
export function notify(title: string, msg = '') {
  if (Platform.OS === 'web') window.alert(msg ? `${title}\n\n${msg}` : title);
  else notify(title, msg);
}
