import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Register phone number to Twilio WhatsApp sandbox
export async function registerPhoneToSandbox(phoneNumber) {
  try {
    // Ensure the phone number has the correct format
    let cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '');
    
    // If it doesn't start with +, add +91 for Indian numbers
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('91')) {
        cleanPhone = '+' + cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        cleanPhone = '+91' + cleanPhone.substring(1);
      } else {
        // Assume it's a 10-digit Indian number
        cleanPhone = '+91' + cleanPhone;
      }
    }

    // Send a test message to register the number
    // This will trigger the sandbox registration process
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${cleanPhone}`,
      body: `Welcome to FinWise! 🎉\n\nYour phone number has been registered for WhatsApp notifications.\n\nYou can now send messages like:\n• "balance" - Check your balance\n• "help" - See all commands\n\nReply with "help" to get started!`
    });

    return true;
  } catch (error) {
    console.error('Error registering phone number to sandbox:', error);
    // Don't throw error - we don't want to break user registration
    // Just log it and continue
    return false;
  }
}

// Send welcome message to new user
export async function sendWelcomeMessage(phoneNumber, userName) {
  try {
    let cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[()-]/g, '');
    
    // Ensure the phone number has the correct format
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('91')) {
        cleanPhone = '+' + cleanPhone;
      } else if (cleanPhone.startsWith('0')) {
        cleanPhone = '+91' + cleanPhone.substring(1);
      } else {
        // Assume it's a 10-digit Indian number
        cleanPhone = '+91' + cleanPhone;
      }
    }

    const welcomeMessage = `Welcome to FinWise, ${userName}! 👋\n\n` +
      `Your account has been created successfully.\n\n` +
      `You can now use WhatsApp to:\n` +
      `• Check your balance\n` +
      `• View transactions\n` +
      `• Get financial insights\n\n` +
      `Send "help" to see all available commands!`;

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${cleanPhone}`,
      body: welcomeMessage
    });

    return true;
  } catch (error) {
    console.error('Error sending welcome message:', error);
    return false;
  }
}