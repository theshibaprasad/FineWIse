# 🚀 FinWise - AI Finance Management Platform

AI-powered financial management platform helping users track expenses, manage budgets, and optimize their finances with intelligent insights and real-time analytics.

![FinWise Banner](public/banner.jpeg)

## ✨ Features

- **🤖 AI Receipt Scanner** - Automatically extract transaction details from receipt photos
- **📊 Smart Analytics Dashboard** - Real-time spending insights and financial trends
- **💰 Budget Management** - Set spending limits with AI-powered recommendations
- **📱 WhatsApp Integration** - Manage finances on-the-go via WhatsApp bot
- **💳 Multi-Account Support** - Track multiple bank accounts and credit cards
- **📈 Progress Tracking** - Monitor your financial goals and spending patterns

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with optimized collections
- **Authentication**: Clerk (secure user management)
- **AI Integration**: Google Gemini AI
- **UI Components**: Shadcn UI
- **Animations**: Framer Motion
- **Background Jobs**: Inngest
- **Styling**: Custom dark theme with blue accents
- **WhatsApp Integration**: Twilio API

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB instance
- Clerk account for authentication
- Google Gemini AI API key
- Twilio account (for WhatsApp integration)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/theshibaprasad/FineWIse.git
   cd finwise
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Add your environment variables:

   ```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Twilio WhatsApp
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number

   # Email (Optional)
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   ```

4. **Set up the database**

   ```bash
   node scripts/migrate-to-mongodb.js
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```text
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   │   ├── dashboard/     # Dashboard components
│   │   ├── transaction/   # Transaction management
│   │   └── profile/       # User profile
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/             # Reusable UI components
│   └── ui/                # Shadcn UI components
├── lib/                    # Database and utility functions
│   ├── db.js              # MongoDB operations
│   ├── mongodb.js         # MongoDB connection
│   ├── gemini.js          # AI integration
│   └── twilio.js          # WhatsApp integration
├── actions/                # Server actions
├── data/                   # Static data files
└── scripts/                # Database migration scripts
```

## 🎯 Key Features Explained

### AI Receipt Scanner

- Intelligent text extraction from photos
- Automatic categorization of expenses
- Real-time transaction processing
- High accuracy data parsing

### Smart Analytics Dashboard

- Visual spending patterns
- Category-wise expense breakdown
- Monthly/yearly comparisons
- AI-powered insights

### Budget Management

- Custom spending limits
- Real-time budget tracking
- Smart notifications
- AI recommendations

### WhatsApp Integration

- Send transaction updates via WhatsApp
- Check account balances
- View recent transactions
- Get financial insights

### Multi-Account Support

- Multiple bank accounts
- Credit card management
- Investment tracking
- Unified financial view

## 🔧 Database Schema

### Collections

- **Users**: Profile management and preferences
- **Accounts**: Bank accounts and credit cards
- **Transactions**: Expense and income records
- **Budgets**: Spending limits and tracking
- **Categories**: Transaction categorization

## 🎨 UI/UX Features

- **Dark Theme**: Professional dark interface with blue accents
- **Responsive Design**: Optimized for all devices
- **Smooth Animations**: Engaging user interactions
- **Intuitive Navigation**: Easy-to-use interface
- **Real-time Updates**: Live data and insights

## 🔒 Security & Performance

- **Secure Authentication**: Clerk-powered user management
- **Data Privacy**: MongoDB with proper indexing
- **Performance Optimized**: Next.js with efficient rendering
- **Scalable Architecture**: Modern microservices approach
- **WhatsApp Security**: End-to-end encrypted messaging

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Clerk](https://clerk.com/) for authentication
- [Google Gemini AI](https://ai.google.dev/) for AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn UI](https://ui.shadcn.com/) for components
- [Twilio](https://www.twilio.com/) for WhatsApp integration

## 📞 Contact

**Shiba Prasad Swain** - [LinkedIn](https://www.linkedin.com/in/theshibaprasad/) - theshibaprasad@gmail.com

---

⭐ If you found this project helpful, please give it a star!
