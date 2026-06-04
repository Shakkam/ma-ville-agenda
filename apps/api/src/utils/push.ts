import { prisma } from '../db/prisma.js';

// Expo Push API — sends to ExponentPushToken[...] tokens registered by the
// native app. https://docs.expo.dev/push-notifications/sending-notifications/
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const isExpoToken = (t: string) =>
  t.startsWith('ExponentPushToken') || t.startsWith('ExpoPushToken');

// Fire-and-forget broadcast to every registered push token. Never throws —
// notification failures must not break the event-publishing flow.
export const broadcastPush = async (message: PushMessage): Promise<void> => {
  try {
    const tokens = await prisma.pushToken.findMany();
    const valid = tokens.map((t) => t.token).filter(isExpoToken);
    if (valid.length === 0) return;

    for (const batch of chunk(valid, 100)) {
      const messages = batch.map((to) => ({
        to,
        title: message.title,
        body: message.body,
        data: message.data,
        sound: 'default',
      }));

      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages),
      });

      if (!res.ok) {
        console.error('Expo push error', res.status, await res.text().catch(() => ''));
      }
    }
  } catch (e) {
    console.error('broadcastPush failed', e);
  }
};
