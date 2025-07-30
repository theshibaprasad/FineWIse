import dbConnect from './mongodb';
import User from './models/User';
import Account from './models/Account';
import Transaction from './models/Transaction';
import Budget from './models/Budget';

export { User, Account, Transaction, Budget };

// Helper function to ensure database connection
export async function getDb() {
  await dbConnect();
  return { User, Account, Transaction, Budget };
}

// Nuclear option: Force JSON serialization to eliminate all Mongoose objects
export function serializeDocument(doc) {
  if (!doc) return null;
  
  try {
    // Convert to plain object first
    let plain = doc.toObject ? doc.toObject() : doc;
    
    // Nuclear option: Force JSON serialization to eliminate any Mongoose objects
    const jsonString = JSON.stringify(plain);
    const finalResult = JSON.parse(jsonString);
    
    // Convert _id to id for consistency
    if (finalResult._id && !finalResult.id) {
      finalResult.id = finalResult._id;
      delete finalResult._id;
    }
    
    // Remove __v field
    if (finalResult.__v !== undefined) {
      delete finalResult.__v;
    }
    
    return finalResult;
  } catch (error) {
    console.error('Serialization error:', error);
    return null;
  }
}

// Helper function to serialize arrays of documents
export function serializeDocuments(docs) {
  if (!Array.isArray(docs)) return [];
  return docs.map(doc => serializeDocument(doc));
} 