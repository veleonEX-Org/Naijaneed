import axios from 'axios';

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const SENDER_ID = process.env.TERMII_SENDER_ID || 'NaijaNeed';

export const sendSMS = async (to: string, message: string) => {
  if (!TERMII_API_KEY) {
     console.warn('TERMII_API_KEY missing. SMS skipped.');
     return;
  }

  try {
    const res = await axios.post('https://api.ng.termii.com/api/sms/send', {
        to: to.startsWith('0') ? '234' + to.slice(1) : to,
        from: SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: TERMII_API_KEY
    });
    return res.data;
  } catch (error) {
    console.error('Failed to send SMS via Termii:', error);
  }
};
