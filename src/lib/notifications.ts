import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

const MSGS = [
  'Sua lamparina está esperando o óleo de hoje 🪔',
  '"Lâmpada para os meus pés é a tua palavra" — Sl 119:105',
  'Um momento com Deus pode mudar o seu dia.',
  'Não deixe a chama apagar: faça seu devocional.',
];

export async function scheduleReminders(times: string[], name: string) {
  try {
    return await schedule(times, name);
  } catch (e) {
    console.log('Lembretes indisponíveis neste ambiente (Expo Go).', e);
    return false;
  }
}

async function schedule(times: string[], name: string) {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('devocional', {
      name: 'Lembretes do devocional', importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {});
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const [i, t] of times.entries()) {
    const [hour, minute] = t.split(':').map(Number);
    await Notifications.scheduleNotificationAsync({
      content: { title: `${name}, hora do devocional`, body: MSGS[i % MSGS.length] },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, ...(Platform.OS === 'android' ? { channelId: 'devocional' } : {}) },
    });
  }
  return true;
}
