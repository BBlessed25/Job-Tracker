# React Job Tracker

A modern, full-stack job application tracking system built with React, Vite, and Tailwind CSS. Track your job applications through different stages from wishlist to offer.

## Features

- 🔐 **User Authentication** - Secure login/signup with password reset
- 📊 **Job Board** - Kanban-style board to track job applications
- 📈 **Dashboard** - Overview of your job search progress
- ⚙️ **Settings** - Manage your profile and preferences
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Backend API**: RESTful API integration

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** (version 7.0 or higher) or **yarn**
- **Git**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Job-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

## Development

### Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

2. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The application will automatically reload when you make changes

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── JobCard.jsx
│   └── ...
├── context/            # React Context for state management
│   └── AppContext.jsx
├── pages/              # Application pages
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── JobBoardPage.jsx
│   └── ...
├── utils/              # Utility functions
│   ├── api.js
│   └── date.js
└── assets/             # Static assets
```

## API Configuration

The application connects to a backend API. The API configuration is located in `src/utils/api.js`:

- **Base URL**: `https://seamfix-jobtracker-apis.onrender.com/api`
- **Timeout**: 30 seconds
- **Authentication**: Bearer token-based

## Environment Setup

The application uses a single API endpoint configuration. No environment variables are required for basic setup.

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill the process using port 5173
   npx kill-port 5173
   # Or use a different port
   npm run dev -- --port 3000
   ```

2. **Dependencies issues**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build errors**
   ```bash
   # Ensure all dependencies are installed
   npm install
   # Clear build cache
   rm -rf dist
   npm run build
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@example.com or create an issue in the repository.
