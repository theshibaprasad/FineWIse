import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  MessageCircle,
  Zap,
} from "lucide-react";

// Stats Data
export const statsData = [
  {
    value: "50K+",
    label: "Active Users",
  },
  {
    value: "₹2B+",
    label: "Transactions Tracked",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "4.9/5",
    label: "User Rating",
  },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Get detailed insights into your spending patterns with AI-powered analytics",
  },
  {
    icon: <Receipt className="h-8 w-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "Extract data automatically from receipts using advanced AI technology",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "Budget Planning",
    description: "Create and manage budgets with intelligent recommendations",
  },
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "Multi-Account Support",
    description: "Manage multiple accounts and credit cards in one place",
  },
  {
    icon: <MessageCircle className="h-8 w-8 text-blue-600" />,
    title: "WhatsApp Bot Assistant",
    description: "Chat with our AI assistant on WhatsApp for real-time financial queries and instant support",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-600" />,
    title: "Automated Insights",
    description: "Get automated financial insights and recommendations",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-8 w-8 text-blue-600" />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    title: "2. Track Your Spending",
    description:
      "Automatically categorize and track your transactions in real-time",
  },
  {
    icon: <PieChart className="h-8 w-8 text-blue-600" />,
    title: "3. Get Insights",
    description:
      "Receive AI-powered insights and recommendations to optimize your finances",
  },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "FinWise has transformed how I manage my business finances. The AI insights have helped me identify cost-saving opportunities I never knew existed.",
  },
  {
    name: "Michael Chen",
    role: "Freelancer",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "The receipt scanning feature saves me hours each month. Now I can focus on my work instead of manual data entry and expense tracking.",
  },
  {
    name: "Emily Rodriguez",
    role: "Financial Advisor",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "I recommend FinWise to all my clients. The multi-currency support and detailed analytics make it perfect for international investors.",
  },
];

// FAQ Data
export const faqData = [
  {
    question: "How secure is my financial data?",
    answer: "Your financial data is protected with bank-level encryption and security measures. We use industry-standard SSL/TLS encryption and never store your banking credentials. All data is encrypted both in transit and at rest."
  },
  {
    question: "Can I connect multiple bank accounts?",
    answer: "Yes! FinWise supports multiple bank accounts, credit cards, and investment accounts. You can connect all your financial accounts in one place for a complete view of your finances."
  },
  {
    question: "How accurate is the AI receipt scanning?",
    answer: "Our AI receipt scanner has over 95% accuracy in extracting transaction details. It automatically categorizes expenses and extracts amounts, dates, and merchant information from photos of your receipts."
  },
  {
    question: "Is there a mobile app available?",
    answer: "Yes! FinWise is fully responsive and works perfectly on all devices. You can access your dashboard, scan receipts, and manage your finances from any smartphone, tablet, or computer."
  },
  {
    question: "What if I need help with my account?",
    answer: "We offer 24/7 customer support through our WhatsApp bot assistant and email support. Our AI assistant can help with most questions instantly, and our human support team is always available for complex issues."
  },
  {
    question: "How much does FinWise cost?",
    answer: "FinWise offers a generous free plan with core features. Premium plans start at just ₹299/month and include advanced analytics, unlimited receipt scanning, and priority support."
  }
];
