import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { getOrCreateUser } from "@/lib/checkUser";
import { registerPhoneToSandbox, sendWelcomeMessage } from "@/lib/twilio";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getOrCreateUser(userId);
    
    return NextResponse.json({ phoneNumber: user.phoneNumber || "" });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await getOrCreateUser(userId);
    
    const { phoneNumber } = await req.json();
    console.log('Saving phone number:', phoneNumber, 'for user:', user.email);
    
    // Validate the phone number format
    if (!phoneNumber || !phoneNumber.startsWith('+91')) {
      return NextResponse.json({ error: "Invalid phone number format. Must start with +91" }, { status: 400 });
    }
    
    // Check if the number after +91 is exactly 10 digits
    const numberWithoutPrefix = phoneNumber.replace('+91', '');
    if (numberWithoutPrefix.length !== 10) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits after country code" }, { status: 400 });
    }
    
    // Check if it starts with valid Indian mobile prefixes
    const validPrefixes = ['6', '7', '8', '9'];
    if (!validPrefixes.includes(numberWithoutPrefix[0])) {
      return NextResponse.json({ error: "Please enter a valid Indian mobile number" }, { status: 400 });
    }
    
    // Check if this is a real phone number (not the default placeholder)
    const isRealPhoneNumber = phoneNumber && 
                             phoneNumber !== '+0000000000' && 
                             phoneNumber !== '0000000000' &&
                             phoneNumber.length === 13; // +91 + 10 digits
    
    // Check if phone number is changing from default to real number
    const isUpdatingFromDefault = user.phoneNumber === '+0000000000' && isRealPhoneNumber;
    
    user.phoneNumber = phoneNumber;
    await user.save();
    
    // Only register to Twilio sandbox if updating from default to real number
    if (isUpdatingFromDefault) {
      console.log('Registering real phone number to Twilio sandbox:', phoneNumber);
      
      // Register to sandbox
      const registered = await registerPhoneToSandbox(phoneNumber);
      
      if (registered) {
        // Send welcome message after a short delay
        setTimeout(async () => {
          await sendWelcomeMessage(phoneNumber, user.name);
        }, 3000);
      }
    }
    
    // Double check after save
    const { User } = await getDb();
    const updatedUser = await User.findOne({ clerkUserId: userId });
    console.log('Updated user phone number:', updatedUser.phoneNumber);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error saving phone number:', err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 