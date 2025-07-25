# FiGenie - AI-Powered Personal Finance Assistant

A modern, visually stunning landing page for an AI-powered personal finance application built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **Modern DeFi-Inspired Design**: Sophisticated dark theme with glassmorphism effects
- **Fully Responsive**: Mobile-first design that looks great on all devices
- **Smooth Animations**: Powered by Framer Motion for engaging user experience
- **TypeScript**: Full type safety throughout the application
- **Component-Based Architecture**: Reusable, modular components
- **Performance Optimized**: Fast loading with Next.js 14 App Router
- **SEO Ready**: Meta tags and structured data included

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Inter & Poppins (Google Fonts)

## 📁 Project Structure

```
figenie-web/
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── layout.tsx      # Root layout with metadata
│   │   ├── page.tsx        # Landing page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── common/         # Reusable components (Button, GlassCard)
│   │   ├── effects/        # Visual effects (ParticleBackground)
│   │   ├── layout/         # Layout components (Header, Footer)
│   │   └── sections/       # Page sections (Hero, Features)
│   ├── data/               # Mock data (easily removable)
│   ├── lib/                # Utilities and animations
│   └── types/              # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd figenie-web
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Design System

### Colors
- **Primary**: Electric Blue (#00D4FF)
- **Secondary**: Purple Gradient (#6B46F2 → #9945FF)
- **Success**: Mint Green (#00FF88)
- **Background**: Deep Navy (#0A0B0F)

### Components
- **Glass Cards**: Semi-transparent with backdrop blur
- **Gradient Buttons**: Primary and secondary variants
- **Floating Particles**: Animated background effects
- **Responsive Navigation**: Desktop and mobile variants

## 📝 Customization

### Changing Brand Name
Update `FiGenie` references in:
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/layout.tsx` (metadata)

### Modifying Colors
Edit the color palette in `tailwind.config.ts`

### Adding New Sections
1. Create a new component in `src/components/sections/`
2. Import and add to `src/app/page.tsx`

### Removing Mock Data
Simply delete the `src/data/` directory and remove any imports

## 🏗️ Building for Production

```bash
npm run build
# or
yarn build
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for the future of AI-powered finance
