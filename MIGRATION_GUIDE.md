# MongoDB Migration Guide

This document outlines the changes made to migrate the AI Finance Platform from Prisma/PostgreSQL to MongoDB/Mongoose.

## 🚀 What Changed

### Database
- **From**: PostgreSQL with Prisma ORM
- **To**: MongoDB with Mongoose ODM

### Email Service
- **From**: Resend API
- **To**: Gmail SMTP with Nodemailer

### Key Changes

1. **Database Connection**
   - Removed: `lib/prisma.js`
   - Added: `lib/mongodb.js` - MongoDB connection with caching
   - Added: `lib/db.js` - Database utilities and serialization helpers

2. **Email Configuration**
   - Removed: Resend API integration
   - Added: `lib/nodemailer.js` - Gmail SMTP configuration
   - Updated: `actions/send-email.js` - Uses Nodemailer instead of Resend

3. **Models**
   - Removed: `prisma/schema.prisma`
   - Added: `lib/models/` directory with Mongoose schemas:
     - `User.js` - User model
     - `Account.js` - Account model
     - `Transaction.js` - Transaction model
     - `Budget.js` - Budget model

4. **Actions Updated**
   - `actions/transaction.js` - Updated to use MongoDB
   - `actions/account.js` - Updated to use MongoDB
   - `actions/dashboard.js` - Updated to use MongoDB
   - `actions/budget.js` - Updated to use MongoDB
   - `actions/seed.js` - Updated to use MongoDB
   - `actions/send-email.js` - Updated to use Nodemailer

5. **Background Jobs**
   - `lib/inngest/function.js` - Updated to use MongoDB

6. **Utilities**
   - `lib/checkUser.js` - Updated to use MongoDB

## 📦 Dependencies

### Removed
- `@prisma/client`
- `prisma`
- `resend`

### Added
- `mongoose`
- `nodemailer`
- `@react-email/render`

## 🔧 Environment Variables

### Removed
- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`

### Added
- `MONGODB_URI` - MongoDB connection string
- `EMAIL_USER` - Gmail address
- `EMAIL_PASS` - Gmail app password

## 🗄️ Database Schema Changes

### Users Collection
```javascript
{
  clerkUserId: String (unique),
  email: String (unique),
  name: String,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Accounts Collection
```javascript
{
  name: String,
  type: String (enum: 'CURRENT', 'SAVINGS'),
  balance: Number,
  isDefault: Boolean,
  userId: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions Collection
```javascript
{
  type: String (enum: 'INCOME', 'EXPENSE'),
  amount: Number,
  description: String,
  date: Date,
  category: String,
  receiptUrl: String,
  isRecurring: Boolean,
  recurringInterval: String (enum: 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'),
  nextRecurringDate: Date,
  lastProcessed: Date,
  status: String (enum: 'PENDING', 'COMPLETED', 'FAILED'),
  userId: ObjectId (ref: 'User'),
  accountId: ObjectId (ref: 'Account'),
  createdAt: Date,
  updatedAt: Date
}
```

### Budgets Collection
```javascript
{
  amount: Number,
  lastAlertSent: Date,
  userId: ObjectId (ref: 'User') (unique),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Migration Process

If you have existing data in PostgreSQL, you can migrate it using the provided migration script:

1. **Set up environment variables**
   ```bash
   # Old PostgreSQL connection (for migration)
   DATABASE_URL=your_postgresql_connection_string
   
   # New MongoDB connection
   MONGODB_URI=your_mongodb_connection_string
   
   # Email configuration
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

2. **Run the migration script**
   ```bash
   npm run migrate
   ```

3. **Verify the migration**
   - Check that all data has been migrated correctly
   - Test the application functionality
   - Test email sending functionality

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up MongoDB**
   - Create a MongoDB database (local or cloud)
   - Update the `MONGODB_URI` in your environment variables

3. **Set up Gmail SMTP**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for this application
   - Use the App Password as `EMAIL_PASS` in your environment variables

4. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your actual values
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔍 Key Differences

### Data Types
- **Prisma**: Used `Decimal` for monetary values
- **MongoDB**: Uses `Number` for all numeric values

### Relationships
- **Prisma**: Foreign key relationships with `@relation`
- **MongoDB**: ObjectId references with `populate()`

### Queries
- **Prisma**: `findUnique`, `findMany`, `create`, `update`
- **MongoDB**: `findOne`, `find`, `create`, `updateOne`

### Transactions
- **Prisma**: `$transaction` with callback
- **MongoDB**: Sessions with `startSession()` and `withTransaction()`

### Email
- **Resend**: API-based email service
- **Gmail SMTP**: Direct SMTP connection with Nodemailer

## 🐛 Troubleshooting

### Common Issues

1. **Connection Issues**
   - Ensure `MONGODB_URI` is correctly set
   - Check MongoDB server is running
   - Verify network connectivity

2. **Email Issues**
   - Ensure `EMAIL_USER` and `EMAIL_PASS` are correctly set
   - Verify Gmail app password is generated correctly
   - Check Gmail SMTP settings

3. **Data Serialization**
   - MongoDB ObjectIds are converted to strings for client-side use
   - Use `serializeDocument()` and `serializeDocuments()` helpers

4. **Indexes**
   - MongoDB indexes are automatically created based on schema definitions
   - Check MongoDB logs for any index creation issues

### Performance Considerations

1. **Indexes**: The schemas include indexes for common query patterns
2. **Connection Pooling**: MongoDB connection is cached for better performance
3. **Aggregation**: Use MongoDB aggregation pipeline for complex queries
4. **Email**: Gmail SMTP provides reliable delivery with rate limiting

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Next.js MongoDB Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Setup](https://support.google.com/accounts/answer/185833)

## 🤝 Support

If you encounter any issues during the migration, please:
1. Check the troubleshooting section above
2. Review the MongoDB and Mongoose documentation
3. Open an issue on GitHub with detailed error information 