# Resource Management 2.0 - Process Mining Platform

A modern, modular Resource Management application with advanced process mining visualizations similar to Celonis.

## 🚀 Features

- **Modern UI**: Built with React 18, TypeScript, and Ant Design
- **Process Mining**: Interactive process flow visualizations using React Flow and BPMN.js
- **Authentication**: Basic auth with protected routes
- **Dashboard**: Beautiful, responsive dashboard with real-time metrics
- **Analytics**: Advanced charts and visualizations using Recharts
- **Modular Architecture**: All files under 500 lines, highly maintainable

## 🛠️ Tech Stack

### Frontend Framework
- React 18
- TypeScript
- Vite (Lightning-fast build tool)

### UI & Styling
- Ant Design (Enterprise UI components)
- Tailwind CSS (Utility-first CSS)
- Custom gradients and modern design

### Visualization Libraries
- **React Flow**: Interactive process flow diagrams
- **BPMN.js**: BPMN 2.0 process modeling
- **Recharts**: Beautiful charts and graphs

### State Management
- Zustand (Lightweight and modular)
- Local storage persistence

### Routing
- React Router v6

## 📦 Installation

```bash
npm install
```

## 🏃 Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Login

Use any username and password to log in (demo mode).

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Sidebar, Header)
│   ├── dashboard/      # Dashboard widgets
│   ├── process-mining/ # Process mining visualizations
│   └── common/         # Reusable components
├── pages/
│   ├── auth/           # Login page
│   ├── dashboard/      # Dashboard pages
│   └── process/        # Process-specific pages
├── services/           # API services
├── store/              # Zustand stores
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global styles
└── types/              # TypeScript types
```

## 🎨 Design Philosophy

- **Modern & Clean**: Gradient backgrounds, rounded corners, smooth animations
- **Responsive**: Mobile-first design, works on all screen sizes
- **Accessible**: ARIA-compliant, keyboard navigation
- **Performance**: Lazy loading, code splitting, optimized builds

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## 📊 Process Mining Features

### Interactive Process Flows
- Drag and drop nodes
- Animated edges showing flow percentages
- Mini-map for large processes
- Zoom and pan controls

### BPMN Diagrams
- Standard BPMN 2.0 notation
- Import/export XML
- Visual process modeling

### Analytics Dashboard
- KPI cards with trends
- Activity frequency charts
- Duration analysis
- Bottleneck detection

## 🚧 Future Enhancements

- [ ] Backend integration (REST API / GraphQL)
- [ ] Real-time process monitoring
- [ ] Advanced filtering and search
- [ ] Export reports (PDF, Excel)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Process simulation
- [ ] Machine learning insights

---

Built with ❤️ using modern web technologies
