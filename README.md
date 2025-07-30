# Full Stack AI Finance Platform with Next JS, MongoDB, Tailwind, Mongoose, Inngest, ArcJet, Shadcn UI Tutorial 🔥🔥

A comprehensive AI-powered finance platform built with modern web technologies. This application helps users manage their finances with intelligent features like receipt scanning, budget tracking, and automated financial insights.

## 🚀 Features

- **AI-Powered Receipt Scanning**: Automatically extract transaction details from receipt images using Google's Gemini AI
- **Multi-Account Management**: Support for multiple bank accounts with balance tracking
- **Smart Budget Tracking**: Set budgets and get alerts when approaching limits
- **Recurring Transactions**: Automate recurring payments and income
- **Financial Analytics**: Detailed insights and spending patterns
- **Email Notifications**: Monthly reports and budget alerts via Gmail SMTP
- **Modern UI**: Beautiful, responsive design with Shadcn UI components

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **AI**: Google Gemini AI for receipt scanning and insights
- **Background Jobs**: Inngest for recurring transactions and reports
- **Security**: ArcJet for rate limiting and bot protection
- **UI Components**: Shadcn UI, Radix UI
- **Email**: Nodemailer with Gmail SMTP and React Email templates

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-finance-platform
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # AI
   GEMINI_API_KEY=your_gemini_api_key
   
   # Email (Gmail SMTP)
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # Security
   ARCJET_KEY=your_arcjet_key
   
   # Background Jobs
   INNGEST_EVENT_KEY=your_inngest_event_key
   INNGEST_SIGNING_KEY=your_inngest_signing_key
   ```

4. **Set up MongoDB**
   - Create a MongoDB database (local or cloud)
   - Update the `MONGODB_URI` in your environment variables
   - The application will automatically create the necessary collections

5. **Set up Gmail SMTP**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password for this application
   - Use the App Password as `EMAIL_PASS` in your environment variables

6. **Run the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses MongoDB with the following collections:

### Users
- `clerkUserId`: Clerk user ID
- `email`: User email
- `name`: User name
- `imageUrl`: Profile image URL

### Accounts
- `name`: Account name
- `type`: Account type (CURRENT/SAVINGS)
- `balance`: Current balance
- `isDefault`: Whether this is the default account
- `userId`: Reference to user

### Transactions
- `type`: Transaction type (INCOME/EXPENSE)
- `amount`: Transaction amount
- `description`: Transaction description
- `date`: Transaction date
- `category`: Transaction category
- `receiptUrl`: Optional receipt image URL
- `isRecurring`: Whether this is a recurring transaction
- `recurringInterval`: Recurring interval (DAILY/WEEKLY/MONTHLY/YEARLY)
- `nextRecurringDate`: Next recurring date
- `lastProcessed`: Last processed date for recurring transactions
- `status`: Transaction status (PENDING/COMPLETED/FAILED)
- `userId`: Reference to user
- `accountId`: Reference to account

### Budgets
- `amount`: Budget amount
- `lastAlertSent`: Last alert sent date
- `userId`: Reference to user

## 🔄 Background Jobs

The application uses Inngest for background job processing:

1. **Recurring Transactions**: Automatically processes recurring transactions daily
2. **Monthly Reports**: Generates and sends monthly financial reports via email
3. **Budget Alerts**: Checks budget limits and sends alerts when needed

## 🎨 UI Components

Built with Shadcn UI and Radix UI primitives:
- Responsive design with Tailwind CSS
- Dark/light mode support
- Accessible components
- Modern animations and transitions

## 🔒 Security Features

- **Rate Limiting**: ArcJet integration for API protection
- **Bot Detection**: Automatic bot detection and blocking
- **Authentication**: Secure user authentication with Clerk
- **Data Validation**: Comprehensive input validation

## 📧 Email Features

- **Monthly Reports**: Automated financial summaries sent via Gmail SMTP
- **Budget Alerts**: Notifications when approaching budget limits
- **Custom Templates**: Beautiful React Email templates
- **Gmail Integration**: Uses Gmail SMTP for reliable email delivery

## 🤖 AI Features

- **Receipt Scanning**: Extract transaction details from images
- **Financial Insights**: AI-generated spending advice
- **Smart Categorization**: Automatic transaction categorization

## 🚀 Deployment

The application can be deployed to various platforms:

1. **Vercel** (Recommended)
   ```bash
   npm run build
   vercel --prod
   ```

2. **Railway**
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

3. **Other Platforms**
   - Ensure MongoDB connection is configured
   - Set all required environment variables
   - Configure Inngest for background jobs

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub.
