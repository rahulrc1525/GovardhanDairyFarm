import axios from 'axios';

const verifyEmailWithMailboxLayer = async (email) => {
  try {
    const response = await axios.get(`http://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_API_KEY}&email=${email}`);
    
    if (response.data.success === false) {
      console.error('MailboxLayer API error:', response.data.error.info);
      return false;
    }

    return response.data.format_valid && 
           response.data.mx_found && 
           response.data.smtp_check;
  } catch (error) {
    console.error('Error verifying email with MailboxLayer:', error);
    return false;
  }
};

export { verifyEmailWithMailboxLayer };