# 🇩🇪 ShopApp DE — Production-Grade React Native E-Commerce (DACH Showcase)

[![React Native](https://img.shields.io/badge/React_Native-0.73.6-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/State-Redux_Toolkit-764ABC?logo=redux)](https://redux-toolkit.js.org/)
[![DSGVO / GDPR](https://img.shields.io/badge/DSGVO_Compliance-100%25-green?logo=shield)](https://gdpr.eu/)
[![Sustainability](https://img.shields.io/badge/Eco--Impact-Grünes_Einkaufen-059669)](https://dhl.de)

A feature-rich, highly scalable **React Native** e-commerce application engineered specifically for the **German (DACH) and EU market**. Built to showcase senior-level mobile architecture, regulatory compliance (DSGVO/GDPR), green-tech sustainability metrics, and native localization to tech engineering leads in Germany (e.g. Zalando, N26, Delivery Hero, Trade Republic, Personio).

---

## 🌟 Key Standout (Netoff) Features

### 1. 🌱 Grünes Einkaufen (Green Tech & Carbon Footprint Engine)
- **Live CO₂ Footprint Calculation**: Automatically calculates estimated carbon emissions (`g CO₂e` / `kg CO₂e`) for items in the shopping cart.
- **German Pfand Deposit System**: Automatic itemized calculation of mandatory bottle deposits (§ 6 VerpackG: `€0.25` per bottle/can).
- **Eco-Score Badges (A to E)**: Visual sustainability index badges integrated across product feeds and detail pages.
- **DHL GoGreen Delivery Offset**: Toggleable 100% climate-neutral transport option during checkout.

### 2. 🔒 DSGVO / GDPR Compliance Suite
- **Granular Cookie & Tracking Consent**: Modal manager allowing users to explicitly toggle Essential, Analytics, and Marketing tracking.
- **Article 15 GDPR Data Export**: On-demand JSON snapshot export of all stored user telemetry and consent data.
- **Article 17 GDPR Account Deletion**: "Right to be Forgotten" simulation with instant state purge.
- **German Legal Statutory Notices**: Built-in Impressum (§ 5 DDG), commercial register info (HRB/USt-IdNr), and statutory 14-day cancellation policy (*Widerrufsbelehrung*).

### 3. 💳 DACH Region Payment Methods
- **Klarna Pay Later ("Rechnung 30 Tage")**: Interactive Klarna invoice flow preview displaying 30-day payment due dates and buyer protection.
- **Sofortüberweisung (Direct E-Banking)**: Instant bank transfer integration flow.
- **SEPA Direct Debit (*SEPA-Lastschrift*)**: Localized IBAN payment option.
- **Apple Pay & Credit Card**: Native digital wallet checkout options.

### 4. 🇩🇪 Zero-Flicker i18n Localization Engine
- **Instant DE / EN Switcher**: Reactive language hook allowing live switching between German and English.
- **German Currency & Date Formatting**: Proper German locale formatting (`1.299,00 €`, `DD.MM.YYYY`).
- **German Postal Code Validation**: 5-digit PLZ regex validator (e.g. `10115` Berlin).
- **MwSt (VAT) Itemized Tax Breakdown**: Displays 19% standard and 7% reduced *Mehrwertsteuer* alongside net totals.

### 5. ⚡ Offline-First Resilience & Architecture
- **Offline Action Queue**: Custom network state listener (`useOfflineSync`) with offline task queueing and automatic sync upon reconnection.
- **Optimistic UI Updates**: Instant response for Cart and Wishlist operations.

---

## 🏗️ Architecture & Project Structure

```
src/
├── components/
│   ├── CO2FootprintCard.tsx       # Live carbon emission & GoGreen offset card
│   ├── EcoScoreBadge.tsx          # Sustainability A-E rating badge
│   ├── KlarnaPaymentModal.tsx     # Authentic Klarna 30-day invoice modal
│   ├── OfflineBanner.tsx          # Reanimated connectivity status indicator
│   ├── PrivacyModal.tsx           # DSGVO granular consent manager & data export
│   └── TaxBreakdownCard.tsx       # 19% & 7% German MwSt tax breakdown
├── hooks/
│   ├── useOfflineSync.ts          # Network state & offline task queue
│   ├── useTheme.ts                # Light / Dark mode theme hook
│   └── useTranslation.ts          # Reactive DE/EN i18n translation hook
├── navigation/
│   ├── AppNavigator.tsx           # Stack navigator & auth hydration
│   └── MainTabNavigator.tsx       # Bottom tab navigation
├── screens/
│   ├── Cart/CartScreen.tsx        # Cart with Eco metrics & MwSt cards
│   ├── Checkout/CheckoutScreen.tsx# DACH checkout & Klarna payment flow
│   ├── Profile/
│   │   ├── ProfileScreen.tsx      # Language switcher, DSGVO trigger, orders
│   │   └── ImpressumScreen.tsx    # § 5 DDG German legal notice
│   └── Product/                   # Product feed and detail screens
├── store/
│   └── slices/                    # Redux Toolkit (auth, cart with Eco state, wishlist)
└── utils/
    └── i18n.ts                    # Type-safe DE/EN dictionaries & DACH formatters
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- CocoaPods (for iOS)
- Android Studio / Xcode

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ShopApp.git
   cd ShopApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS Pods (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the Metro Bundler**
   ```bash
   npm start
   ```

5. **Launch App**
   ```bash
   # For iOS
   npm run ios

   # For Android
   npm run android
   ```

---

## 📄 License & Compliance

Designed & Developed as a showcase project for React Native engineering roles in Germany & EU.
Complies with EU General Data Protection Regulation (GDPR) and German Telecommunications-Telemedia Data Protection Act (TDDDG).
