import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import twilio from "twilio";
import { parseTransactionMessage } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const client = twilio(accountSid, authToken);

// Helper to parse Twilio form data
async function parseFormData(req) {
  const text = await req.text();
  return Object.fromEntries(new URLSearchParams(text));
}

export async function POST(req) {
  try {
    const body = await parseFormData(req);
    const from = body.From; // e.g., 'whatsapp:+919999999999'
    const message = body.Body?.trim();

    if (!from) return NextResponse.json({ error: "No sender" }, { status: 400 });

    // Lookup user by phone number (strip 'whatsapp:')
    const phone = from.replace("whatsapp:", "");
    const { User, Account, Transaction } = await getDb();
    const user = await User.findOne({ phoneNumber: phone });
    
    if (!user) {
      // Send welcome message for unregistered users
      const welcomeMessage = `Welcome to FinWise! 🤖\n\n` +
        `To get started, please register your phone number in the FinWise app.\n\n` +
        `Available commands:\n` +
        `• "balance" - Check your total balance\n` +
        `• "expenses" - View your expenses\n` +
        `• "accounts" - List all your accounts\n` +
        `• "help" - Show this help message\n` +
        `• "spend 2000 in food" - Add expense\n` +
        `• "earned 10000 salary" - Add income`;
      
      await client.messages.create({
        from: whatsappNumber,
        to: from,
        body: welcomeMessage
      });
      return NextResponse.json({ message: "User not found" });
    }

    const messageLower = message.toLowerCase();
    let reply = "";
    
    if (!message || messageLower === "help" || messageLower === "hi" || messageLower === "hello") {
      reply = `Hi ${user.name || "there"}! 👋\n\n` +
        `Welcome to FinWise WhatsApp Bot!\n\n` +
        `*Available Commands:*\n` +
        `• "balance" - Check your total balance\n` +
        `• "expenses" - View your expenses\n` +
        `• "accounts" - List all your accounts\n` +
        `• "recent" - Show recent transactions\n` +
        `• "help" - Show this help message\n\n` +
        `*Add Transactions:*\n` +
        `• "spend 2000 in food" - Add expense\n` +
        `• "paid 500 for groceries" - Add expense\n` +
        `• "earned 10000 salary" - Add income\n` +
        `• "received 5000 payment" - Add income`;
    } else if (messageLower === "balance" || messageLower === "bal") {
      const accounts = await Account.find({ userId: user._id });
      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
      
      reply = `💰 *Your Balance Summary*\n\n` +
        `Total Balance: ₹${totalBalance.toFixed(2)}\n\n` +
        `*Account Details:*\n` +
        accounts.map(acc => `• ${acc.name}: ₹${parseFloat(acc.balance || 0).toFixed(2)}`).join('\n');
    } else if (messageLower === "expenses" || messageLower === "expense") {
      const transactions = await Transaction.find({ 
        userId: user._id, 
        type: "EXPENSE" 
      }).sort({ createdAt: -1 }).limit(10);
      
      const totalExpenses = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      
      reply = `💸 *Your Expenses*\n\n` +
        `Total Expenses: ₹${totalExpenses.toFixed(2)}\n\n` +
        `*Recent Expenses:*\n` +
        transactions.map(t => 
          `• ${t.description}: ₹${parseFloat(t.amount).toFixed(2)} (${t.account?.name || 'Unknown'})`
        ).join('\n');
    } else if (messageLower === "accounts" || messageLower === "account") {
      const accounts = await Account.find({ userId: user._id });
      
      reply = `🏦 *Your Accounts*\n\n` +
        accounts.map(acc => 
          `• ${acc.name}: ₹${parseFloat(acc.balance || 0).toFixed(2)}`
        ).join('\n');
    } else if (messageLower === "recent" || messageLower === "transactions") {
      const transactions = await Transaction.find({ 
        userId: user._id 
      }).sort({ createdAt: -1 }).limit(5);
      
      reply = `📊 *Recent Transactions*\n\n` +
        transactions.map(t => 
          `• ${t.type === 'EXPENSE' ? '💸' : '💰'} ${t.description}: ₹${parseFloat(t.amount).toFixed(2)} (${t.account?.name || 'Unknown'})`
        ).join('\n');
    } else {
      // Try to parse as a transaction command
      console.log("Attempting to parse transaction:", message);
      const parseResult = await parseTransactionMessage(message);
      console.log("Parse result:", parseResult);
      
      if (parseResult.success) {
        try {
          // Get user's default account or first account
          const accounts = await Account.find({ userId: user._id });
          if (accounts.length === 0) {
            reply = `❌ No accounts found. Please create an account first in the FinWise app.`;
          } else {
            // Use default account or first account
            const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
            
            console.log("Creating transaction with data:", parseResult.data);
            console.log("User ID:", user._id);
            console.log("Account ID:", defaultAccount._id);
            console.log("Account name:", defaultAccount.name);
            
            // Create the transaction
            const transactionData = {
              userId: user._id,
              accountId: defaultAccount._id,
              type: parseResult.data.type,
              amount: parseResult.data.amount,
              description: parseResult.data.description,
              category: parseResult.data.category,
              date: new Date()
            };
            
            console.log("Transaction data to create:", transactionData);
            
            const transaction = await Transaction.create(transactionData);

            // Update account balance
            const balanceChange = parseResult.data.type === "EXPENSE" ? -parseResult.data.amount : parseResult.data.amount;
            defaultAccount.balance = parseFloat(defaultAccount.balance || 0) + balanceChange;
            await defaultAccount.save();

            const emoji = parseResult.data.type === "EXPENSE" ? "💸" : "💰";
            const action = parseResult.data.type === "EXPENSE" ? "spent" : "earned";
            
            reply = `${emoji} *Transaction Added Successfully!*\n\n` +
              `*${parseResult.data.description}*\n` +
              `Amount: ₹${parseResult.data.amount.toFixed(2)}\n` +
              `Type: ${parseResult.data.type}\n` +
              `Account: ${defaultAccount.name}\n` +
              `Balance: ₹${defaultAccount.balance.toFixed(2)}\n\n` +
              `You ${action} ₹${parseResult.data.amount.toFixed(2)} for ${parseResult.data.description.toLowerCase()}`;
          }
        } catch (error) {
          console.error("Error creating transaction:", error);
          reply = `❌ Failed to add transaction: ${error.message}. Please try again or check your account setup.`;
        }
      } else {
        console.log("Parse failed:", parseResult.error);
        reply = `❓ I didn't understand that command.\n\n` +
          `*Try these examples:*\n` +
          `• "spend 2000 in food"\n` +
          `• "paid 500 for groceries"\n` +
          `• "earned 10000 salary"\n` +
          `• "received 5000 payment"\n\n` +
          `Type "help" to see all available commands.`;
      }
    }

    await client.messages.create({
      from: whatsappNumber,
      to: from,
      body: reply
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Twilio WhatsApp webhook error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
} 