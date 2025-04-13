# Accounting SaaS Application

A modern web application for accounting and financial management built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Interactive dashboard with financial KPIs and metrics
- Advanced analytics with data visualization and insights
- Transaction management and tracking
- Invoice creation, management, and status tracking
- Client management with behavior analysis
- Revenue forecasting and subscription metrics
- User authentication and profile management
- Customizable settings and preferences
- Dark/light mode support
- Responsive design for all devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS 4
- **Charts**: Chart.js with react-chartjs-2
- **Authentication**: Context-based auth system
- **Notifications**: React Hot Toast
- **Development**: Turbopack for faster builds

## Getting Started

### Prerequisites

- Node.js 20.0 or newer

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/accounting-saas.git
   ```

2. Navigate to the project directory:
   ```bash
   cd accounting-saas
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
accounting-saas/
├── src/
│   ├── app/
│   │   ├── dashboard/        # Dashboard and feature pages
│   │   │   ├── analytics/    # Business insights and charts
│   │   │   ├── clients/      # Client management
│   │   │   ├── invoices/     # Invoice management 
│   │   │   ├── reports/      # Financial reports
│   │   │   ├── transactions/ # Transaction tracking
│   │   │   ├── settings/     # User preferences
│   │   │   └── notifications/# User notifications
│   │   ├── login/           # Authentication
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable components
│   │   ├── analytics/        # Analytics components
│   │   └── [other component folders]
│   ├── context/              # Application contexts
│   │   ├── AuthContext.tsx   # Authentication
│   │   ├── SettingsContext.tsx # User preferences
│   │   └── NotificationContext.tsx # Notifications
│   ├── hooks/                # Custom hooks
│   │   ├── useInvoiceAnalytics.ts
│   │   ├── useClientAnalytics.ts
│   │   └── useRevenueForecast.ts
│   ├── utils/                # Utility functions
│   │   ├── invoiceStore.ts   # Invoice state management
│   │   ├── transactionStore.ts # Transaction state management
│   │   └── dateUtils.ts      # Date formatting utilities
│   └── styles/               # Global styles
├── public/                   # Static assets
└── package.json              # Dependencies
```

## Key Features In Detail

### Analytics Dashboard
Comprehensive business insights including revenue distribution, invoice status, client behavior analysis, and forecasting.

### Client Management
Track client interactions, identify valuable clients, and monitor churn risk with built-in analytics.

### Invoice System
Create, track, and manage invoices with status monitoring and payment analytics.

### Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
