import { GoogleGenerativeAI } from "@google/generative-ai";
import { defaultCategories } from "@/data/categories";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get available categories for mapping
const incomeCategories = defaultCategories.filter(cat => cat.type === 'INCOME');
const expenseCategories = defaultCategories.filter(cat => cat.type === 'EXPENSE');

// Function to find best matching category
function findBestCategory(description, type) {
  const categories = type === 'INCOME' ? incomeCategories : expenseCategories;
  const lowerDescription = description.toLowerCase();
  
  // Direct matches
  for (const category of categories) {
    if (lowerDescription.includes(category.name.toLowerCase()) || 
        lowerDescription.includes(category.id.toLowerCase())) {
      return category.id;
    }
  }
  
  // Keyword matches
  const keywordMap = {
    'food': 'food',
    'meal': 'food',
    'lunch': 'food',
    'dinner': 'food',
    'breakfast': 'food',
    'restaurant': 'food',
    'salary': 'salary',
    'freelance': 'freelance',
    'health': 'healthcare',
    'medical': 'healthcare',
    'doctor': 'healthcare',
    'medicine': 'healthcare',
    'shopping': 'shopping',
    'clothes': 'shopping',
    'clothing': 'shopping',
    'transport': 'transportation',
    'fuel': 'transportation',
    'gas': 'transportation',
    'rent': 'housing',
    'house': 'housing',
    'home': 'housing',
    'utility': 'utilities',
    'electricity': 'utilities',
    'water': 'utilities',
    'internet': 'utilities',
    'phone': 'utilities',
    'entertainment': 'entertainment',
    'movie': 'entertainment',
    'game': 'entertainment',
    'education': 'education',
    'school': 'education',
    'tuition': 'education',
    'travel': 'travel',
    'trip': 'travel',
    'vacation': 'travel',
    'insurance': 'insurance',
    'gift': 'gifts',
    'donation': 'gifts',
    'bill': 'bills',
    'fee': 'bills',
    'personal': 'personal',
    'gym': 'personal',
    'beauty': 'personal',
    'haircut': 'personal'
  };
  
  for (const [keyword, categoryId] of Object.entries(keywordMap)) {
    if (lowerDescription.includes(keyword)) {
      return categoryId;
    }
  }
  
  // Default categories
  return type === 'INCOME' ? 'other-income' : 'other-expense';
}

// Fallback parsing function for when Gemini fails
function fallbackParseTransaction(message) {
  const lowerMessage = message.toLowerCase();
  
  // Extract amount (look for numbers)
  const amountMatch = message.match(/(\d+(?:\.\d{2})?)/);
  if (!amountMatch) {
    return { success: false, error: "No amount found" };
  }
  
  const amount = parseFloat(amountMatch[1]);
  
  // Determine type based on keywords
  const expenseKeywords = ['spend', 'paid', 'bought', 'purchase', 'expense', 'cost', 'paid for', 'spent'];
  const incomeKeywords = ['earned', 'received', 'income', 'salary', 'payment', 'credit', 'got'];
  
  let type = 'EXPENSE'; // default
  let description = '';
  
  // Check for income keywords
  if (incomeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    type = 'INCOME';
  }
  
  // Extract description (remove amount and common words)
  let cleanMessage = message.replace(/\d+(?:\.\d{2})?/g, '').trim();
  cleanMessage = cleanMessage.replace(/\b(spend|paid|bought|purchase|expense|cost|earned|received|income|salary|payment|credit|got|in|for|on|with)\b/gi, '').trim();
  
  if (cleanMessage) {
    description = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
  } else {
    description = type === 'EXPENSE' ? 'Expense' : 'Income';
  }
  
  // Find category
  const category = findBestCategory(description, type);
  
  return {
    success: true,
    data: {
      type: type,
      amount: amount,
      description: description,
      category: category,
      confidence: 'medium'
    }
  };
}

export async function parseTransactionMessage(message) {
  // First try Gemini AI
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("No Gemini API key found, using fallback parsing");
      return fallbackParseTransaction(message);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Parse this WhatsApp message into a structured transaction. Extract the amount, description, type (EXPENSE/INCOME), and category.

    Message: "${message}"

    Available categories:
    Income: salary, freelance, investments, business, rental, other-income
    Expense: housing, transportation, groceries, utilities, entertainment, food, shopping, healthcare, education, personal, travel, insurance, gifts, bills, other-expense

    Rules:
    - If the message contains words like "spend", "paid", "bought", "purchase", "expense", "cost", "paid for" → type is EXPENSE
    - If the message contains words like "earned", "received", "income", "salary", "payment", "credit" → type is INCOME
    - Extract the amount (look for numbers, currency symbols like ₹, $, etc.)
    - Extract a clear description of what the transaction is for
    - Map to the most appropriate category from the list above
    - If no clear type is mentioned, default to EXPENSE

    Return ONLY a JSON object with this exact structure:
    {
      "type": "EXPENSE" or "INCOME",
      "amount": number,
      "description": "string",
      "category": "category-id-from-list",
      "confidence": "high" or "medium" or "low"
    }

    Examples:
    - "spend 2000 in food" → {"type": "EXPENSE", "amount": 2000, "description": "Food", "category": "food", "confidence": "high"}
    - "paid 500 for groceries" → {"type": "EXPENSE", "amount": 500, "description": "Groceries", "category": "groceries", "confidence": "high"}
    - "earned 10000 salary" → {"type": "INCOME", "amount": 10000, "description": "Salary", "category": "salary", "confidence": "high"}
    - "2000 food" → {"type": "EXPENSE", "amount": 2000, "description": "Food", "category": "food", "confidence": "medium"}
    - "earned 5000 freelance" → {"type": "INCOME", "amount": 5000, "description": "Freelance", "category": "freelance", "confidence": "high"}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini response:", text);
    
    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(text);
      console.log("Parsed transaction data:", parsed);
      return {
        success: true,
        data: parsed
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      console.log("Falling back to basic parsing");
      return fallbackParseTransaction(message);
    }
  } catch (error) {
    console.error("Gemini AI error:", error);
    console.log("Falling back to basic parsing");
    return fallbackParseTransaction(message);
  }
}