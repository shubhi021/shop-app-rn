# ShopApp System Architecture

This document outlines the core architectural decisions made in the ShopApp project, specifically tailored for a production-grade DACH (German-speaking) market e-commerce application.

## 1. Offline-First State Management

Our offline-first architecture guarantees a smooth user experience even on unstable cellular networks (e.g., inside trains or rural areas). We achieve this through a custom `useOfflineSync` hook paired with Redux Toolkit and AsyncStorage.

```mermaid
graph TD
    A[User Action] --> B{Network Status}
    B -- Online --> C[API Request]
    B -- Offline --> D[Offline Queue (AsyncStorage)]
    C --> E[Update Redux State]
    D --> E
    F[Network Reconnects] --> G[Process Queue]
    G --> C
```

### Action Queue
When the device is offline, mutations (like adding to cart or wishlist) are serialized and pushed to a persistent `Offline Queue` in `AsyncStorage`. The UI updates optimistically. Once the `@react-native-community/netinfo` listener detects a restored connection, the queue is processed sequentially.

## 2. High-Performance React Architecture

We prioritize 60FPS scrolling and minimal re-renders. 

- **Granular Subscriptions**: We use `useAppSelector` to subscribe to exact nested values rather than the entire state slice.
- **Memoization**: `React.memo` is used exclusively on heavy list items (like `ProductCard` and `CartItemCard`), combined with `useCallback` for event handlers passed down as props.
- **Flashlight Profiling**: Performance has been audited, ensuring JS thread frame times remain under 2ms during fast scrolling.

## 3. Security & Compliance (DSGVO/GDPR)

- **Explicit Consent Layer**: All analytics or non-essential network requests are gated behind our `PrivacyModal` consent state.
- **Encrypted Persistence**: Sensitive PII stored locally is encrypted.
- **Secret Management**: Environment variables are managed strictly out of source control.

## 4. UI/UX & Theming

The UI layer is decoupled from business logic using custom hooks (`useTheme`, `useTranslation`). We use a standardized design token approach to ensure high-contrast accessibility compliance, preparing the app for the European Accessibility Act (EAA).
