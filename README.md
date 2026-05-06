# Thrive Restaurant Management System - Frontend

A modern, responsive dashboard application built with Next.js 16 and TypeScript for managing restaurant operations. This application provides a comprehensive interface for managing customers, menu items, orders, locations, users, and more.

## 🌟 Features

- **Dashboard Overview**: Real-time KPIs and analytics
- **Customer Management**: Track customer information and preferences
- **Menu Management**: Organize menu items, categories, and pricing
- **Order Processing**: Handle orders with real-time status updates
- **Location Management**: Multi-location support
- **User Management**: Role-based access control
- **Ingredient Tracking**: Monitor inventory and ingredient usage
- **Settings Configuration**: Customize application settings
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme Support**: User preference-based theming

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Linting**: ESLint with Next.js configuration
- **Development**: Hot reload and fast refresh

## 📋 Prerequisites

Before running this application, ensure you have:

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun
- Access to the Thrive Backend API

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd thrive-next-frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_ENV=development
```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── customers/     # Customer management pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── ingredients/   # Ingredient management
│   │   ├── locations/     # Location management
│   │   ├── menu/          # Menu management
│   │   ├── orders/        # Order management
│   │   ├── settings/      # Settings pages
│   │   └── users/         # User management
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── DataTable.tsx
│   ├── EmptyState.tsx
│   ├── Header.tsx
│   ├── KPICard.tsx
│   ├── Modal.tsx
│   ├── Sidebar.tsx
│   └── Tabs.tsx
├── lib/                   # Utility functions and configurations
├── services/              # API service functions
└── types/                 # TypeScript type definitions
```

## 🎨 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## 🔧 Configuration

### Tailwind CSS

The project uses Tailwind CSS v4. Configuration is handled through `postcss.config.mjs` and `tailwindcss` configuration.

### ESLint

ESLint is configured with Next.js recommended settings. Configuration can be found in `eslint.config.mjs`.

### TypeScript

TypeScript configuration is available in `tsconfig.json` with strict mode enabled.

## 🌐 API Integration

The frontend communicates with the Thrive Backend API. Ensure the backend server is running on the configured URL (default: `http://localhost:3001`).

### Key API Endpoints

- `/api/customers` - Customer management
- `/api/menu` - Menu item operations
- `/api/orders` - Order processing
- `/api/users` - User management
- `/api/locations` - Location management
- `/api/ingredients` - Ingredient tracking

## 🎯 Key Features Guide

### Dashboard
Access real-time metrics, sales data, and quick actions from the main dashboard.

### Customer Management
- View customer list with search and filtering
- Add new customers
- Track customer preferences and order history

### Menu Management
- Organize menu items by categories
- Manage pricing and availability
- Upload menu item photos
- Track ingredients per menu item

### Order Management
- Process incoming orders
- Update order status
- Track order history
- Generate order reports

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

For production deployment, ensure the following environment variables are set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_APP_ENV=production
```

### Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to a Git repository
2. Import your project to Vercel
3. Configure environment variables
4. Deploy



## 📄 License

This project is part of the Thrive Restaurant Management System.


