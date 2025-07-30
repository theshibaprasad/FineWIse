import { currentUser } from "@clerk/nextjs/server";
import { getDb, serializeDocument } from "./db";
import { registerPhoneToSandbox, sendWelcomeMessage } from "./twilio";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const { User } = await getDb();

    let loggedInUser = await User.findOne({
      clerkUserId: user.id,
    });

    if (!loggedInUser) {
      // Create new user in database with default phone number
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      
      loggedInUser = await User.create({
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress || '',
        phoneNumber: '+0000000000', // Default placeholder number
      });
    }

    return serializeDocument(loggedInUser);
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

// Helper function to get or create user for server actions
export const getOrCreateUser = async (userId) => {
  try {
    const { User } = await getDb();
    
    let user = await User.findOne({ clerkUserId: userId });
    
    if (!user) {
      // Get current user from Clerk to create new user record
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        throw new Error("User not found");
      }

      // Create new user in database with default phone number
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
      
      user = await User.create({
        clerkUserId: userId,
        name,
        imageUrl: clerkUser.imageUrl,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        phoneNumber: '+0000000000', // Default placeholder number
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error getting or creating user:", error);
    throw new Error("Failed to get or create user");
  }
};

