## Project Overview
Build a comprehensive personal finance management Progressive Web App (PWA) specifically designed for Indian users to track their complete financial picture including income, expenses, investments, loans, and insurance across all Indian financial instruments.

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui components
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **State Management**: React Context API or Zustand
- **Routing**: React Router v6

### Backend & Database
- **Authentication**: Firebase Authentication (email/password, Google Sign-In)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (for document uploads like insurance policies, receipts)
- **Hosting**: Firebase Hosting

### Security
- **Encryption**: Client-side encryption using Web Crypto API
- **Algorithm**: AES-256-GCM for data encryption
- **Key Derivation**: PBKDF2 with 100,000+ iterations
- **Architecture**: Zero-knowledge - all sensitive data encrypted before sending to Firestore

## Core Features & Requirements

### 1. Authentication & User Management
- **Registration**: Email/password signup with email verification
- **Login**: Email/password and Google Sign-In options
- **Password Recovery**: Reset password via email
- **Profile Management**: 
  - Edit profile information
  - Change password
  - Set locale preferences (English, Hindi, regional languages)
  - Set currency preferences (INR default, support for USD, EUR for foreign investments)
  - Profile photo upload
  - Timezone settings
- **Session Management**: Auto-lock after configurable inactivity (default: 15 minutes)
- **Logout**: Clear all sensitive data from memory

### 2. Account Types (Indian Financial System)
Support for multiple account types with ability to add unlimited accounts:

**Banking Accounts:**
- Savings Account
- Current Account
- Fixed Deposit (FD)
- Recurring Deposit (RD)
- Salary Account
- NRI Accounts (NRE, NRO)

**Investment Accounts:**
- Demat Account (for stocks)
- Trading Account
- Mutual Fund Folio
- SIP (Systematic Investment Plan)
- PPF (Public Provident Fund) Account
- EPF (Employee Provident Fund) Account
- NPS (National Pension System) Account
- Sukanya Samriddhi Account
- Gold Investment Account (physical/digital)
- Sovereign Gold Bonds
- Real Estate investments

**Loan Accounts:**
- Home Loan
- Personal Loan
- Car Loan
- Education Loan
- Credit Card
- Gold Loan
- Loan Against Property
- Business Loan

**Insurance:**
- Life Insurance (Term, Endowment, ULIP, Money-back)
- Health Insurance (Individual, Family Floater, Critical Illness)
- Vehicle Insurance (Two-wheeler, Four-wheeler)
- Home Insurance
- Travel Insurance

**Other Financial Instruments:**
- Chit Funds
- Post Office Savings Schemes (NSC, KVP, SCSS, MIS)
- Corporate Bonds
- Government Bonds
- Cryptocurrency (optional)

### 3. Transaction Management

**Transaction Types:**
- Income
- Expense
- Investment
- Transfer (between accounts)
- Loan EMI
- Insurance Premium
- Returns/Refunds

**Transaction Fields:**
- Date & Time
- Amount (with multi-currency support)
- Account/Source
- Category (with icon)
- Subcategory
- Payment Method (Cash, UPI, Card, Net Banking, Cheque)
- Merchant/Payee name
- Description/Notes
- Tags (multiple tags per transaction)
- Attachments (receipts, bills, invoices - encrypted in Firebase Storage)
- Recurring transaction option (daily, weekly, monthly, yearly)
- Location (optional GPS-based)

**Transaction Features:**
- Quick add transaction with minimal fields
- Bulk import from CSV/Excel
- Duplicate detection and merge
- Split transactions (one transaction, multiple categories)
- Search and filter (by date range, category, amount range, tags, accounts)
- Edit and delete transactions
- Transaction history with infinite scroll or pagination

### 4. Category System

**Default Categories:**

**Income Categories:**
- 💼 Salary (with icon)
- 💰 Business Income
- 📈 Investment Returns (Dividends, Capital Gains)
- 🎁 Bonus
- 💵 Freelance Income
- 🏠 Rental Income
- 🎯 Interest Income
- 🎉 Gifts Received
- 💸 Refunds
- 📊 Other Income

**Expense Categories:**
- 🍕 Food & Dining (Restaurants, Groceries, Food Delivery)
- 🏠 Housing (Rent, Maintenance, Property Tax)
- 🚗 Transportation (Fuel, Parking, Tolls, Public Transport)
- 🛒 Shopping (Clothing, Electronics, Personal Care)
- 💊 Healthcare (Doctor, Medicines, Lab Tests)
- 📚 Education (Fees, Books, Courses)
- 🎬 Entertainment (Movies, Subscriptions, Hobbies)
- 📱 Bills & Utilities (Electricity, Water, Internet, Mobile)
- 👨‍👩‍👧‍👦 Family & Personal (Gifts, Celebrations)
- ✈️ Travel (Flights, Hotels, Vacation)
- 💳 EMI Payments
- 🏥 Insurance Premiums
- 🙏 Donations & Charity
- 🎓 Children's Expenses
- 👔 Professional Expenses
- 🔧 Maintenance & Repairs
- 💰 Taxes (Income Tax, GST)
- 💸 Other Expenses

**Investment Categories:**
- 📊 Mutual Funds (Equity, Debt, Hybrid)
- 📈 Stocks (Direct Equity)
- 🏦 Fixed Deposits
- 💎 Gold (Physical, Digital, SGBs)
- 🏢 Real Estate
- 💰 PPF/EPF/NPS
- 📜 Bonds (Government, Corporate)
- 🌾 Chit Funds
- 🏛️ Post Office Schemes
- 🌐 Cryptocurrency (optional)
- 💼 Other Investments

**Category Features:**
- Each category has an emoji/icon
- Users can add custom categories with custom icons
- Subcategories support (e.g., Food → Groceries, Restaurants)
- Color coding for categories
- Category budgets (monthly/yearly limits)
- Category-wise spending analysis

### 5. Dashboard & Visualizations

**Main Dashboard:**
- **Summary Cards:**
  - Total Net Worth (Assets - Liabilities)
  - Monthly Income vs Expenses
  - Investment Portfolio Value
  - Outstanding Loans
  - Upcoming EMIs/Bills (next 7 days)
  - Savings Rate percentage
  
- **Charts & Graphs:**
  - Income vs Expense trend (line chart, last 6-12 months)
  - Category-wise expense breakdown (pie chart)
  - Investment allocation (donut chart)
  - Net worth over time (area chart)
  - Cash flow analysis (waterfall chart)
  - Budget vs Actual spending (bar chart)
  
- **Quick Actions:**
  - Add Transaction (floating action button)
  - Add Account
  - View All Transactions
  - Create Budget
  - Generate Report

### 6. Budgeting System
- **Budget Types:**
  - Monthly budgets by category
  - Annual budgets
  - Project-based budgets (e.g., vacation, wedding)
  
- **Budget Features:**
  - Set budget limits per category
  - Rollover unused budget or reset monthly
  - Budget alerts (80%, 90%, 100% thresholds)
  - Budget vs Actual comparison
  - Visual progress bars
  - Budget recommendations based on past spending
  
### 7. Investment Portfolio Tracking

**For each investment type:**
- Current value
- Purchase/Investment amount
- Returns (absolute & percentage)
- XIRR calculation for SIPs
- Maturity date (for FDs, insurance policies)
- Asset allocation (Equity, Debt, Gold, Real Estate percentages)
- Portfolio rebalancing suggestions
- Goal-based investment tracking

**Mutual Funds & SIP Tracking:**
- Scheme name & code
- Folio number
- NAV tracking
- Units held
- Current value
- Returns (CAGR, XIRR)
- SIP date and amount
- Next SIP due date

**Stock Portfolio:**
- Stock symbol & name
- Quantity
- Average buy price
- Current market price (manual update or API integration)
- Profit/Loss (absolute & percentage)
- Dividend tracking

**EPF/PPF/NPS:**
- Account number
- Employee contribution
- Employer contribution (for EPF)
- Interest earned
- Current balance
- Projected maturity value

### 8. Loan & EMI Management
- **Loan Details:**
  - Loan amount
  - Interest rate
  - Tenure
  - EMI amount
  - Outstanding principal
  - Total interest paid
  - Next EMI due date
  - Prepayment tracking
  
- **EMI Calendar:**
  - Upcoming EMIs across all loans
  - EMI payment reminders
  - Auto-categorize EMI transactions
  
- **Loan Calculator:**
  - EMI calculator
  - Loan amortization schedule
  - Prepayment impact calculator

### 9. Insurance Management
- **Insurance Policy Tracking:**
  - Policy number
  - Insurance company
  - Policy type
  - Sum assured/Coverage amount
  - Premium amount & frequency
  - Premium due dates
  - Maturity date
  - Nominee details
  - Policy document upload (encrypted)
  
- **Reminders:**
  - Premium payment reminders
  - Policy renewal reminders
  
### 10. Reports & Analytics

**Report Types:**
- Income Statement (monthly/quarterly/yearly)
- Expense Report (detailed category breakdown)
- Net Worth Statement (assets vs liabilities)
- Investment Performance Report
- Tax Planning Report (deductions, tax-saving investments)
- Cash Flow Statement
- Custom date range reports

**Export Options:**
- PDF export with charts
- Excel/CSV export
- Email reports
- Scheduled reports (monthly summary)

### 11. Financial Planning Tools

**Goal Setting:**
- Create financial goals (Home purchase, Car, Child education, Retirement)
- Set target amount and timeline
- Track progress towards goals
- Investment recommendations for goals

**Calculators:**
- SIP Calculator
- Lumpsum Investment Calculator
- Retirement Planning Calculator
- Home Loan Calculator
- Education Cost Calculator
- Emergency Fund Calculator
- Tax Calculator (Income Tax)

**Reminders & Alerts:**
- Bill payment reminders
- EMI due reminders
- Insurance premium reminders
- Investment maturity alerts
- Budget overspend alerts
- Goal milestone alerts

### 12. Data Security Features

**Client-Side Encryption:**
- All sensitive data (transaction details, account numbers, amounts) encrypted using AES-256-GCM before storing in Firestore
- Encryption key derived from user password using PBKDF2
- Salt stored in Firestore, key NEVER leaves the device
- Decryption happens only on the client side

**Security Measures:**
- Auto-lock after inactivity
- Biometric authentication (Web Authentication API)
- Secure session management
- HTTPS only
- Content Security Policy (CSP)
- Input sanitization to prevent XSS
- Rate limiting on login attempts

**Backup & Recovery:**
- Encrypted cloud backup (automatic)
- Export encrypted backup file
- Import from backup
- Data recovery options

### 13. UI/UX Requirements

**Design Principles:**
- Clean, minimalist interface
- Intuitive navigation
- Mobile-first responsive design
- Fast loading times
- Smooth animations and transitions
- Accessibility compliant (WCAG 2.1)

**Theme:**
- Light mode (default)
- Dark mode toggle
- System theme detection
- Accent color customization

**Layout Structure:**
- Top navigation bar with logo, search, profile menu
- Side navigation drawer (collapsible on mobile)
- Main content area
- Footer with links

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Components Needed:**
- Login/Register forms with validation
- Transaction list with filters
- Account cards with balance display
- Category selector with icons
- Date picker (calendar view)
- Amount input with currency selector
- Charts and graphs (responsive)
- Modal dialogs for add/edit operations
- Confirmation dialogs for delete actions
- Toast notifications for success/error messages
- Loading skeletons
- Empty states with helpful messages
- Search bar with autocomplete
- Dropdown menus
- Tabs for switching views
- Pagination or infinite scroll
- File upload component (drag & drop)

### 14. Additional Features

**Multi-Currency Support:**
- Set primary currency (INR default)
- Add transactions in different currencies
- Automatic conversion display
- Exchange rate tracking (manual or API)

**Localization:**
- English (default)
- Hindi
- Support for regional languages (future)
- Date format preferences (DD/MM/YYYY for India)
- Number format (Indian numbering system: lakhs, crores)

**Collaboration (Optional Future Feature):**
- Share read-only access with family members
- Joint account management
- Financial advisor access

**Smart Features:**
- Recurring transaction detection
- Category suggestions based on merchant name
- Duplicate transaction warnings
- Spending insights and trends
- Personalized financial tips
- Anomaly detection (unusual spending)

### 15. Firebase Configuration

**Firestore Database Structure:**
```
users/
  {userId}/
    profile/
      - email, displayName, photoURL
      - encryptionSalt
      - locale, currency, timezone
      - createdAt, updatedAt
      
    accounts/
      {accountId}/
        - data (encrypted: accountName, accountType, bank, accountNumber, balance)
        - accountType (unencrypted for filtering)
        - updatedAt
      
    transactions/
      {transactionId}/
        - data (encrypted: description, merchant, notes, tags, attachments)
        - date (unencrypted for sorting)
        - amount (encrypted)
        - accountId (unencrypted for filtering)
        - category (unencrypted for filtering)
        - type (income/expense/investment)
        - updatedAt
      
    categories/
      {categoryId}/
        - name, icon, color, type (income/expense/investment)
        - isDefault (true for system categories)
        - userId (for custom categories)
      
    budgets/
      {budgetId}/
        - data (encrypted: budgetName, limit, categories)
        - month (YYYY-MM, unencrypted)
        - updatedAt
      
    investments/
      {investmentId}/
        - data (encrypted: all investment details)
        - investmentType (unencrypted for filtering)
        - updatedAt
      
    loans/
      {loanId}/
        - data (encrypted: loan details)
        - nextEmiDate (unencrypted for reminders)
        - updatedAt
      
    insurance/
      {insuranceId}/
        - data (encrypted: policy details)
        - renewalDate (unencrypted for reminders)
        - updatedAt
      
    goals/
      {goalId}/
        - data (encrypted: goal details)
        - targetDate (unencrypted)
        - updatedAt
```

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
  }
}
```

**Firebase Storage Structure:**
```
users/
  {userId}/
    receipts/
      {transactionId}/
        - encrypted_receipt_image.enc
    documents/
      insurance/
        - encrypted_policy_document.enc
      investments/
        - encrypted_investment_proof.enc
```

### 16. Performance Optimization
- Code splitting and lazy loading
- Image optimization and lazy loading
- Caching strategy with Service Workers
- Debounced search and filters
- Virtual scrolling for long lists
- Minimize re-renders with React.memo
- Optimize Firestore queries (indexing, pagination)

### 17. Testing Requirements
- Unit tests for encryption/decryption functions
- Integration tests for Firebase operations
- E2E tests for critical user flows (login, add transaction, create budget)
- Security testing for encryption implementation
- Performance testing with large datasets

### 18. Progressive Web App Features
- Service Worker for offline functionality
- Installable on mobile home screen
- App manifest with icons
- Offline data caching
- Background sync when online
- Push notifications for reminders (optional)

## Development Phases

**Phase 1: Foundation (Week 1-2)**
- Project setup (React + TypeScript + Vite + Tailwind)
- Firebase configuration
- Authentication system (login, register, logout)
- Encryption utility functions
- Basic routing and navigation
- Responsive layout shell
- Dark mode implementation

**Phase 2: Core Features (Week 3-4)**
- Account management (add, edit, delete, list)
- Transaction management (add, edit, delete, list with filters)
- Category system (default categories + custom)
- Dashboard with summary cards
- Profile page with preferences

**Phase 3: Advanced Features (Week 5-6)**
- Budget system
- Investment portfolio tracking
- Loan and EMI management
- Insurance tracking
- Charts and visualizations
- Reports generation

**Phase 4: Polish & Enhancement (Week 7-8)**
- Financial calculators
- Goal setting and tracking
- Reminders and notifications
- Data import/export
- Comprehensive testing
- Performance optimization
- Documentation

## Deliverables
1. Complete source code with clear folder structure
2. README with setup instructions
3. Firebase configuration guide
4. Deployment instructions
5. User documentation
6. API documentation for encryption functions
7. Testing suite

## Technical Constraints
- Must work on modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Mobile responsive (iOS Safari, Chrome Android)
- PWA installable
- Must pass Lighthouse audit (90+ scores)
- Follow React and TypeScript best practices
- Follow Material Design or similar design system principles
- Implement proper error handling
- Use environment variables for Firebase config

## Success Criteria
- User can register, login, and manage profile
- User can add/edit/delete accounts of all Indian financial types
- User can add/edit/delete transactions with proper categorization
- Data is encrypted before storing in Firestore
- Dashboard displays accurate financial summary
- Budgets can be created and tracked
- Investment portfolio is trackable
- Reports can be generated and exported
- App works offline (with cached data)
- App is installable as PWA
- Dark mode works correctly
- App is fully responsive across devices
- All sensitive operations require authentication
- Performance is smooth with 1000+ transactions

---

**Additional Notes:**
- Prioritize security over features
- Ensure encryption is implemented correctly before building other features
- Use Firebase free tier limits as guideline (optimize reads/writes)
- Follow Indian financial terminology and conventions
- Consider UPI, IMPS, NEFT, RTGS as payment methods
- Support Indian date formats and numbering systems
- Include GST tracking for businesses (future enhancement)
- Plan for scalability (handle 10,000+ transactions per user)

## What's Included in the Theme/Template:

### 🎨 **Design Features:**
- **Modern gradient aesthetics** - Subtle blue-to-indigo gradients throughout
- **Glass morphism effects** - Frosted glass navbar with backdrop blur
- **Smooth animations** - Hover effects and transitions everywhere
- **Dark mode toggle** - Fully functional light/dark theme switching
- **Responsive design** - Works beautifully on mobile, tablet, and desktop
- **Indian context** - Currency symbols (₹), Hindi tagline, Indian financial instruments

### 📄 **Landing Page Includes:**
- Hero section with compelling copy and call-to-action
- Live financial overview card preview
- Features section highlighting key capabilities
- Clean navigation with smooth scrolling
- Mobile-responsive menu

### 📊 **Dashboard Includes:**
- **Summary cards** - Net Worth, Income, Expenses, Investments
- **Sidebar navigation** - All major app sections
- **Recent transactions** - With icons and categorization
- **Investment portfolio** - Quick overview of different instruments
- **Charts placeholder** - Ready for actual data visualization
- **Top navigation** - Profile, notifications, settings

### 🎯 **Key Design Decisions:**
1. **Color Palette**: Blue/Indigo gradient (trust & professionalism) with green accents (growth/money)
2. **Typography**: Clean, readable fonts with proper hierarchy
3. **Spacing**: Generous white space for elegance
4. **Icons**: Lucide React icons throughout for consistency
5. **Cards**: Rounded corners (2xl) with subtle shadows for depth
6. **Interactive elements**: Hover states on all clickable items

### 🔄 **Navigation:**
- Click "View Dashboard" or "Get Started Free" to see the dashboard
- Click "Back to Landing" in the sidebar to return
- Toggle dark mode with the sun/moon icon

This template gives you a solid foundation to build upon. The design is production-ready and follows modern UI/UX best practices while maintaining an elegant, trustworthy aesthetic perfect for a financial application.

# 🚀 Arthsathi - Modular Build Plan

## 📋 **Build Sequence**

### **Module 1: Project Foundation & Setup** ⬅️ *We'll start here*
- Project structure guide
- Environment configuration
- Firebase setup instructions
- Encryption utilities
- Core type definitions
- Utility functions (date, currency, formatters)

### **Module 2: Authentication System**
- Login page (expand from template)
- Register page
- Password reset
- Firebase Auth integration
- Protected routes
- Session management

### **Module 3: Core Layout & Navigation**
- Expand the dashboard shell from template
- Sidebar navigation (functional)
- Top navbar with profile menu
- Dark mode persistence
- Responsive mobile menu

### **Module 4: Account Management**
- Add/Edit account forms
- Account list view
- All Indian account types
- Account balance tracking
- Account cards UI

### **Module 5: Transaction System**
- Add transaction form (quick & detailed)
- Transaction list with filters
- Edit/Delete transactions
- Category selector
- Search functionality
- Bulk import (CSV)

### **Module 6: Category Management**
- Default categories (with icons)
- Custom category creation
- Category organization
- Budget assignment to categories

### **Module 7: Budget System**
- Create/Edit budgets
- Budget tracking UI
- Progress visualization
- Budget alerts
- Category-wise limits

### **Module 8: Investment Portfolio**
- Investment tracking
- Mutual funds, SIPs, stocks
- PPF, EPF, NPS tracking
- Returns calculation (XIRR)
- Portfolio allocation charts

### **Module 9: Loans & Insurance**
- Loan management
- EMI tracking & calculator
- Insurance policy tracking
- Premium reminders

### **Module 10: Reports & Analytics**
- Dashboard charts (expand template)
- Spending analytics
- Income vs Expense reports
- Net worth tracking
- Export functionality (PDF, CSV)

### **Module 11: Financial Tools**
- Goal setting & tracking
- Financial calculators (SIP, EMI, etc.)
- Reminders system
- Alerts

### **Module 12: Profile & Settings**
- User profile page
- Locale & currency preferences
- Security settings
- Data backup & export

## 📁 **Project Structure Overview**

```
arthsathi/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── auth/            # Auth components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── transactions/    # Transaction components
│   │   ├── accounts/        # Account components
│   │   └── shared/          # Shared components
│   ├── lib/
│   │   ├── firebase.ts      # Firebase config
│   │   ├── encryption.ts    # Encryption utilities
│   │   └── utils.ts         # Helper functions
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   ├── constants/
│   │   └── index.ts         # Constants (categories, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   ├── pages/               # Page components
│   └── App.tsx
├── .env.local
├── package.json
└── tsconfig.json
```
