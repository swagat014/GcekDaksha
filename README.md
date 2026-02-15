# 🏆 DAKSHA – Inter College Sports Fest (Frontend)

A premium, dark-themed inter-college sports tournament website built with **React**, **Vite**, **Tailwind CSS**, **GSAP**, and **Framer Motion**.

## ✨ Features

### 🎬 Opening Animation
- **Letter-by-letter GSAP animation** with glow and metallic effects
- **Particle background** with animated gradients
- **Smooth cinematic split** revealing website content on scroll/completion
- **One-time display** (cached in localStorage)

### 🌑 Premium Dark Theme
- Black/charcoal/deep purple gradient backgrounds
- **Glassmorphism cards** with blur effects
- Accent colors: Crimson Red, Electric Blue, Gold highlights
- Smooth hover animations and transitions

### 🧩 Website Sections

#### 📍 **Navbar**
- Sticky navigation with blur effect on scroll
- Logo: DAKSHA with glow effect
- Mobile-responsive hamburger menu
- Quick navigation links and Register CTA

#### 🦸 **Hero Section**
- Full viewport height
- Animated headline: "Unleash the Warrior Within"
- Two CTA buttons: "Register Now" & "View Sports"
- Parallax animated gradients
- Decorative animated circles

#### ℹ️ **About Section**
- Tournament information and highlights
- Statistics cards (8 Sports, 50+ Teams, 2K+ Athletes)
- Interactive stat animations
- Key details about DAKSHA 2026

#### ⚽ **Sports Section**
- 8 diverse sports with detailed cards
- **Sports Included:**
  - Football (11 players)
  - Volleyball (6 players)
  - Kho-Kho (Boys/Girls)
  - Kabaddi (Boys/Girls)
  - Badminton (2 players)
  - Chess (1 player)
- Hover effects with glow borders
- Entry fee and team size displayed
- Individual "Register Now" buttons per sport

#### 📅 **Schedule Section**
- Timeline layout for 5-day tournament
- Day-wise match schedule
- Time, sport, stage, and match details
- Smooth scroll animations
- Professional styling

#### 📝 **Registration Form**
- Beautiful form UI with validation
- Fields:
  - Team Name
  - College Name
  - Sport Selection (dropdown)
  - Captain Name
  - Phone Number (10-digit validation)
  - Email (format validation)
  - Team Member Details (dynamic based on sport)
  - Document Uploads (Captain Aadhaar, Captain ID, Player Docs)
- **Form Features:**
  - Real-time error messages
  - Focus animations
  - Success toast notifications
  - Supabase database integration
  - Document storage with Supabase
  - Form reset after successful submission

#### 📞 **Contact Section**
- Coordinator information cards
- General contact details
- Social media links with hover animations
- Professional layout

#### 🔗 **Footer**
- Links and information
- Copyright notice
- Smooth fade-in animations

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS 4** | Styling & responsive design |
| **GSAP** | Advanced animations |
| **Framer Motion** | React animations |
| **Lucide React** | Icon library |

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Setup

1. **Navigate to project**
```bash
cd daksha
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```
Server runs on `http://localhost:5174/`

4. **Build for production**
```bash
npm run build
```

5. **Preview production build**
```bash
npm run preview
```

## 📁 Project Structure

```
daksha/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Sticky navigation
│   │   ├── OpeningAnimation.jsx  # GSAP intro animation
│   │   ├── Contact.jsx          # Contact section
│   │   └── Footer.jsx           # Footer section
│   ├── pages/
│   │   ├── Home.jsx             # Hero + About + Schedule
│   │   ├── Sports.jsx           # Sports cards grid
│   │   └── Register.jsx         # Registration form
│   ├── data/
│   │   ├── sports.js            # Sports data
│   │   ├── schedule.js          # Tournament schedule
│   │   └── contact.js           # Contact information
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles
│   └── App.css                  # App styles
├── public/
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── package.json                 # Dependencies
```

## 🎨 Design Highlights

### Color Palette
- **Primary**: Dark Black (#0a0a0a, #1a1a1a)
- **Accent Red**: #ff1744
- **Accent Blue**: #00b4ff
- **Accent Gold**: #ffd700
- **Accent Crimson**: #dc143c

### Animations & Effects
- **GSAP AnimationTimeline**: Opening text animation
- **Framer Motion**: Page transitions, scroll triggers
- **Glassmorphism**: Semi-transparent cards with blur
- **Glow Effects**: Text and element shadows
- **Parallax**: Hero section background movement
- **Stagger**: Sequential element animations

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly interactions
- Hamburger menu for mobile

## 🚀 Future Enhancements

- [x] Backend integration (Supabase)
- [ ] Payment gateway integration
- [ ] Email notifications
- [x] Team member management (dynamic based on sport selection)
- [ ] Live score updates
- [ ] Admin dashboard
- [x] Document upload and storage (Supabase storage)
- [ ] PDF certificate generation
- [ ] Social sharing
- [ ] Multi-language support

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 📋 Notes

- All sports data is hardcoded JSON
- Supabase backend integration for registrations
- Opening animation shows once per browser (cached)
- Form data submitted to Supabase database with document storage
- Mobile responsive and accessible

## 🤝 Contributing

This is a frontend-only project for showcasing design and animations. Backend integration can be added later.

## 📄 License

© 2026 DAKSHA – Inter College Sports Fest. All rights reserved.

---

**Built with ❤️ using React, Vite, and animations magic** ✨
