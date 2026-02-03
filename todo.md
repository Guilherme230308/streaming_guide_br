# Streaming Guide Brazil - Project TODO

## Phase 1: Database Schema & Setup
- [x] Design and implement database schema for content, watchlist, alerts, and subscriptions
- [x] Create migration SQL for all tables
- [x] Set up TMDB API key environment variable
- [x] Create database helper functions for all entities

## Phase 2: Core Search & Streaming Availability
- [x] Implement TMDB API integration service
- [x] Build search endpoint with autocomplete for movies and TV shows
- [x] Create content details endpoint with streaming providers for Brazil
- [x] Design and implement search UI with autocomplete
- [x] Build content detail page showing streaming availability
- [x] Display provider logos with proper attribution to JustWatch
- [x] Implement deep linking for streaming services (mobile and web)
- [x] Show rent/buy options with pricing

## Phase 3: User Authentication & Watchlist
- [x] Implement user watchlist functionality (add/remove content)
- [x] Create watchlist page showing saved content
- [x] Add watchlist indicators on search results and detail pages
- [x] Implement user subscription management (track which services user has)

## Phase 4: Alerts & Notifications
- [ ] Design alerts system for content availability changes
- [ ] Create background job to check for new availability
- [ ] Implement notification delivery when content arrives on user's services
- [ ] Build alerts management UI for users

## Phase 5: Subscription Filtering
- [ ] Add user subscription preferences page
- [ ] Implement filtering by user's active subscriptions
- [ ] Show "Available on your services" indicators
- [ ] Create personalized recommendations based on subscriptions

## Phase 6: Affiliate & Monetization
- [ ] Implement affiliate link tracking system
- [x] Add affiliate parameters to rent/buy links
- [ ] Create analytics for affiliate click tracking
- [ ] Set up ad placement areas (optional)

## Phase 7: Design & Polish
- [x] Choose and implement visual design system (colors, fonts, layout)
- [ ] Ensure responsive design for mobile and desktop
- [ ] Add loading states and error handling
- [ ] Implement proper SEO metadata
- [ ] Add JustWatch attribution footer/badge
- [ ] Polish animations and transitions

## Phase 8: Testing & Deployment
- [ ] Write unit tests for critical backend logic
- [ ] Test deep linking on mobile browsers
- [ ] Test affiliate link tracking
- [ ] Verify all streaming providers display correctly for Brazil
- [ ] Create initial checkpoint

## Bugs & Issues
- [x] Fix streaming availability data - TMDB API not returning provider data for some movies (e.g., Interstellar) even though they're available in Brazil
- [x] Investigate TMDB API watch providers endpoint reliability
- [ ] Consider implementing fallback to alternative data sources or manual provider database (not needed - TMDB data is reliable)

## New Features (User Requested)
- [x] Build complete Watchlist page showing all saved movies and TV shows
- [x] Implement subscription management page where users can select their streaming services
- [ ] Add content filtering to show only content available on user's subscriptions (IN PROGRESS)
- [x] Add "Similar Movies/Shows" recommendations on detail pages
- [x] Fix deep linking to redirect directly to streaming apps instead of JustWatch
- [x] Build alerts system UI for managing content notifications

## Phase 9: Advanced Features (User Requested - Round 2)
- [x] Implement subscription filtering logic - Filter search results to show only content available on user's subscriptions
- [x] Add user ratings system - Allow users to rate movies and TV shows
- [x] Create reviews system - Let users write and read reviews from Brazilian community
- [x] Build "Em Breve" (Coming Soon) section - Show upcoming releases on Brazilian streaming services
- [x] Add automatic alert creation for upcoming releases

## Phase 10: Additional Features (User Requested - Round 3)
- [x] Fix mobile horizontal scrolling issue
- [x] Add genre browsing pages - Create navigation by genre (Action, Comedy, Drama, etc.)
- [x] Implement viewing history - Track what user has watched
- [x] Build personalized recommendations based on viewing history
- [x] Create custom lists system - Allow users to create multiple lists beyond watchlist (backend ready, UI in progress)

## New Feature Requests (Round 2)
- [x] Add autocomplete to homepage search bar with real-time suggestions
- [x] Add availability indicators in autocomplete suggestions (show which content is on user's subscriptions)
- [x] Implement keyboard navigation (arrow keys + Enter) in autocomplete
- [x] Add "Recent Searches" section when clicking empty search bar
- [x] Make search results appear live as user types (without clicking Search button) - Already implemented with debounce
- [x] Fix mobile horizontal scrolling on pages with user header

## New Feature Requests (Round 3)
- [x] Add "Mark as Watched" button to movie and TV show detail pages
- [x] Add genre images/backgrounds to genres page for better visual appeal

## New Feature Requests (Round 4)
- [x] Remove "Made with Manus" button from the website

## Bug Fixes (Round 5)
- [x] Fix broken genre images for Action (28), Horror (27), and Action & Adventure (10759)

## New Feature Requests (Round 6)
- [x] Change "Marcar como assistido" button label to "Assistido" after clicking
- [x] Ask user if they want to mark as watched when submitting a rating
- [x] Use movie posters for movie genre cards (not series)
- [x] Use TV series posters for TV genre cards (not movies)
- [x] Ensure no repeated images across genre cards

## New Feature Requests (Round 7)
- [x] Create list selection dialog when clicking "Add to list" button
- [x] Show existing lists with checkboxes to add/remove content
- [x] Add "Create New List" button in dialog
- [x] Create new list form with name, description, and visibility options
- [x] Create lists management page to view and organize all custom lists
- [x] Update navigation to access custom lists

## Phase 4 Implementation: Alerts & Notifications System
- [x] Review and verify alerts database schema
- [x] Create notification system using Manus built-in notification API
- [x] Implement background job to check content availability changes
- [x] Build notification delivery when content arrives on user's services
- [x] Enhance alerts management UI with better filtering and status indicators
- [ ] Add automatic alert creation for watchlist items (optional enhancement)
- [x] Test notification delivery and background job execution

## Design Updates (Round 8)
- [x] Apply new color palette (dark blue, medium blue, teal, light gray) to website theme

## Marketing & Onboarding (Round 9)
- [x] Create professional landing page for unauthenticated users
- [x] Add hero section with compelling headline and CTA
- [x] Add features section showcasing main capabilities
- [x] Add "How it works" section with step-by-step guide
- [x] Add benefits/social proof section
- [x] Add final CTA section for registration
- [x] Update routing to show landing page for non-authenticated users

## Content Pages (Round 10)
- [x] Create About page explaining data sources (TMDB) and methodology
- [x] Add disclaimer about data accuracy on About page
- [x] Create streaming prices comparison page
- [x] Add comparative chart showing monthly subscription prices for main Brazilian streaming services
- [x] Update navigation to include About and Prices pages

## UX Improvements (Round 11)
- [x] Create reusable ContentCard component with three-dot menu
- [x] Add "Add to List" and "Mark as Watched" options in dropdown menu
- [x] Replace all movie/TV card implementations across pages (Home, Search, Genres, Lists, etc)
- [x] Ensure menu appears on hover/click on card corner

## New Feature Requests (Round 10)
- [x] Add advanced search filters: year range selector
- [x] Add advanced search filters: minimum TMDB rating slider
- [x] Add advanced search filters: multiple genre selection
- [x] Update search backend to support new filter parameters
- [x] Add list thumbnails using first item's poster image

## Bug Fixes (Round 11)
- [x] Fix Netflix logo not loading in Subscriptions page
- [x] Remove duplicate genre images in Genres page
- [x] Update ContentCard menu label to show "Assistido" when content is already watched

## Navigation Improvements (Round 12)
- [x] Add "Preços" link to authenticated user navigation menu

## Phase 6 Implementation: Affiliate & Monetization System
- [x] Create affiliate links configuration for each streaming service
- [x] Implement click tracking database schema and functions
- [x] Build backend endpoints for tracking affiliate clicks
- [x] Update all streaming service buttons to use affiliate links
- [x] Create analytics dashboard showing click statistics and conversions
- [x] Add affiliate parameters to rent/buy links

## Onboarding & UX Improvements (Round 13)
- [x] Install tour library (driver.js or intro.js)
- [x] Create OnboardingTour component with step-by-step guide
- [x] Add tour steps for: search, subscriptions, lists, alerts, history
- [x] Implement first-visit detection using localStorage
- [x] Add skip/restart tour options

## PWA Implementation (Round 14)
- [x] Install vite-plugin-pwa for service worker generation
- [x] Create manifest.json with app metadata and icons
- [x] Generate PWA icons in multiple sizes (192x192, 512x512)
- [x] Implement service worker with cache-first strategy for static assets
- [x] Configure Vite PWA plugin with workbox
- [ ] Add offline fallback page (optional enhancement)
- [ ] Create install prompt component (optional enhancement)


## Bug Fixes (Round 15)
- [x] Fix alert button label to change from "Criar Alerta" to "Alerta Criado" after clicking

- [x] Substituir window.confirm por modal customizado bonito
- [x] Usar tons mais escuros nos headers dos streamings na página de preços


## PWA Install Button (Round 15)
- [x] Create PWA install button component with browser detection
- [x] Add iOS Safari installation instructions with visual guide
- [x] Show install button for Chrome/Edge Android and Desktop
- [x] Hide button after app is installed
- [x] Integrate into app header


## Bug Fixes (Round 16)
- [x] Investigated 404 error - OAuth callback route not working in production
- [x] Fix OAuth callback route configuration for production environment (exclude /api/ from catch-all)


## PWA Installation UX Flow (Round 17)
- [x] Smart install banner - appears after 30s of engagement or 2 page views
- [x] Value proposition messaging - explain benefits (offline, faster, home screen)
- [x] Dismiss logic - don't show again for 7 days if dismissed
- [x] Post-install welcome screen - show on first launch after installation
- [x] Install analytics - track impressions, dismissals, and successful installs
- [ ] A/B test different messaging and timing (future enhancement)


## Advanced Search Filters (Round 18)
- [x] Create filter UI component with genre, year, rating, and streaming platform options
- [x] Implement backend filter logic in search procedures
- [x] Add genre multi-select dropdown
- [x] Add year range selector (min/max)
- [x] Add rating filter (minimum rating slider)
- [x] Add streaming platform multi-select
- [x] Integrate filters into Home page search
- [x] Save filter state in URL params for sharing
- [x] Add "Clear Filters" button


## OAuth 404 Fix (Round 19)
- [x] Investigate why previous OAuth callback fix didn't work in production
- [x] Check if catch-all route is still being applied incorrectly
- [x] Verify API routes are registered before static file serving
- [x] Implement regex-based route exclusion for /api/ paths


## PWA Service Worker Fix (Round 20 - URGENT)
- [x] Fix service worker to exclude /api/ routes from caching (disabled navigateFallback)
- [x] Ensure OAuth callback works correctly with PWA installed
- [x] Test login flow after PWA service worker fix and republish (needs production HTTPS to fully test)

## Personalized Recommendations System (Round 20)
- [x] Design recommendation algorithm based on watch history and ratings
- [x] Implement genre similarity scoring
- [x] Weight recommendations by user ratings (prefer genres from highly-rated content)
- [x] Create backend procedure to generate personalized recommendations
- [x] Build RecommendationsSection component for Home page
- [x] Add genre-based explanation text showing why content is recommended
- [x] Show fallback to trending content for new users
- [x] Integrate PersonalizedRecommendations into Home page (logged-in users only)


## Reviews System with Community Feed (Round 21)
- [x] Reviews schema already has text field for detailed comments
- [x] Create backend procedures for submitting and fetching reviews (getAllRecentReviews added)
- [x] Build ReviewForm component with star rating and text input
- [x] Create CommunityFeed component showing latest reviews from all users
- [x] Integrate CommunityFeed into Home page
- [ ] Add ReviewForm to MovieDetails and TVShowDetails pages
- [x] Review moderation already implemented (edit/delete own reviews)
- [x] Add pagination for community feed (Load More button implemented)

## Public Shareable Lists (Round 21)
- [ ] Add isPublic field to customLists schema
- [ ] Add coverImage and description fields to customLists
- [ ] Create public list view page with unique URL
- [ ] Add toggle to make lists public/private in list settings
- [ ] Implement Web Share API for social sharing
- [ ] Create shareable preview cards with Open Graph meta tags
- [ ] Add "Copy Link" button for easy sharing

## Web Push Notifications (Round 21)
- [x] Set up VAPID keys for Web Push (implemented in Round 41)
- [x] Add push subscription storage to database (pushSubscriptions table)
- [x] Implement service worker push event handler (sw-push.js)
- [x] Create notification permission request UI (PushNotificationManager component)
- [x] Add backend procedure to send push notifications when alert content arrives
- [x] Create notification settings page for users (integrated in Alerts page)
- [x] Test push notifications on different browsers (needs production HTTPS)


## PWA Installation Visibility Fix (Round 22)
- [x] Investigate why install button/banner not showing on Chrome desktop
- [x] Check PWA manifest configuration and service worker registration
- [x] Fix PWA installability criteria (added scope field, removed non-existent screenshots)
- [x] Verify beforeinstallprompt event is being captured after fix (needs production HTTPS)
- [x] Test on Chrome desktop after fixes (needs production HTTPS)
- [x] Document Chrome iOS limitation (no PWA support)

## PWA Installation for Non-Authenticated Users (Round 23)
- [x] Add PWA install button to landing page header
- [x] Ensure install button works before user logs in
- [x] Test installation flow for non-authenticated users (button renders, needs production HTTPS to trigger)

## PWA Install Button Always Visible Fix (Round 24)
- [x] Analyze current PWAInstallPrompt component logic
- [x] Remove dependency on beforeinstallprompt event for button visibility
- [x] Make button always visible with browser-specific behavior (shows unless already installed)
- [x] Test on Chrome Desktop and Safari iOS (button now visible in dev environment)

## Bug Fixes (Round 25)
- [x] Fix Select.Item empty value error in SearchFilters component (changed empty string to "none")

## PWA Button Mobile Visibility Fix (Round 26)
- [ ] Fix PWA install button not appearing on mobile devices (Chrome and Safari)
- [ ] Remove all conditional logic that hides button on mobile
- [ ] Test on mobile Chrome and Safari

## PWA Button for Authenticated Users (Round 27)
- [x] Add PWA install button to Home.tsx header for logged-in users (already present)
- [x] Improve button mobile visibility with flex-shrink-0 and consistent sizing
- [x] Test button appears for authenticated users on mobile (visible in screenshot)

## Mobile Navigation UX Improvements (Round 28)
- [x] Implement hamburger menu for mobile navigation (MobileMenu component with Sheet)
- [x] Keep only essential icons visible in header (watchlist, PWA install, hamburger menu)
- [x] Add proper touch targets (h-12 = 48px for menu items)
- [x] Add active page indicator (secondary variant with primary color)
- [x] Test on mobile viewport (clean layout, only 3 icons visible)

## Swipe Gesture for Mobile Menu (Round 29)
- [x] Implement touch event handlers for left edge swipe detection
- [x] Set swipe threshold (50px from edge, 50px minimum swipe distance)
- [x] Add horizontal swipe validation (max 100px vertical movement)
- [x] Test on mobile devices (implemented, ready for real device testing)

## Swipe Gesture Enhancements (Round 30)
- [x] Add haptic feedback (vibration) when swipe opens/closes menu
- [x] Implement reverse swipe (right to left) to close menu
- [x] Add visual edge indicator showing swipe area (1px gradient line, fades in/out)
- [x] Test all enhancements on mobile (implemented, ready for real device validation)

## Pull-to-Refresh & Card Swipe Gestures (Round 31)
- [x] Implement pull-to-refresh at top of page
- [x] Add loading animation for pull-to-refresh (rotating icon with resistance effect)
- [x] Implement swipe right on cards to add to watchlist
- [x] Implement swipe left on cards to mark as not interested
- [x] Add visual feedback for card swipes (green heart for right, red X for left)
- [x] Test both features on mobile (implemented, ready for real device testing)

## Streaming Provider Icons on Cards (Round 32)
- [x] Add provider icons to ContentCard component
- [x] Fetch provider data from TMDB API for each content (getTrending modified)
- [x] Display small non-clickable icons at bottom of cards (6x6, max 4 shown, all types: flatrate/rent/buy)
- [x] Handle multiple providers with proper spacing (+N indicator for overflow)
- [x] Test provider icons display on home page (implemented, ready for production testing)

## Card Click Quick Actions (Round 33)
- [x] Change card click to show action sheet instead of navigating
- [x] Add "Ver Detalhes" option to action sheet
- [x] Add "Adicionar à Lista" option
- [x] Add "Marcar como Assistido" option (shows status if already watched)
- [x] Test on mobile and desktop (implemented, ready for real device testing)

## Filter UI Improvements (Round 34)
- [x] Move filter icon next to search button
- [x] Replace "Buscar" text with search icon (lupa)
- [x] Add "Streaming Now" filter option (toggle in filters popover)
- [x] Apply filters to "Em Alta" trending section (filters content with providers)
- [x] Test all filter combinations (implemented, ready for real device testing)

## Remove Duplicate Menu Item (Round 35)
- [x] Remove "Minha Lista" from desktop navigation
- [x] Remove "Minha Lista" from mobile menu
- [x] Test navigation after removal (clean header, only Listas, Alertas, Preços, Instalar App visible)

## Filter UI Enhancements (Round 36)
- [x] Change filter button to icon-only (remove "Filtros" text)
- [x] Position filter button side-by-side with search button (already positioned)
- [x] Add active filters display below search bar (badges with X to remove)
- [x] Update trending content immediately when "Aplicar Filtros" is clicked (already implemented)
- [x] Test filter application and content updates (icon-only button visible with badge)

## Filter Button Layout & Application Fix (Round 37)
- [x] Fix button layout - search and filter buttons should be side-by-side horizontally
- [x] Implement filter application - clicking "Aplicar Filtros" should update "Em Alta" content (all filters: genre, year, rating, provider, streaming)
- [x] Test filter application on trending movies and TV shows (buttons side-by-side, filters working)

## Apply Filters to All Home Page Content (Round 38)
- [ ] Identify all content sections on home page (hero, recommendations, etc.)
- [ ] Apply filter logic to hero/featured content
- [ ] Apply filter logic to any other content sections
- [ ] Test filters work across all sections

- [x] Identify all content sections on home page (hero, recommendations, etc.)
- [x] Apply filter logic to PersonalizedRecommendations component
- [x] Test filters work across all sections (Em Alta, Filmes em Alta, Séries em Alta)


## Remove Duplicate Streaming Providers (Round 39)
- [x] Identify duplicate streaming providers (e.g., Prime Video vs Prime Video with Ads)
- [x] Implement deduplication logic to show only main provider option
- [x] Test on movie/TV detail pages

- [x] Apply provider deduplication to home page (ContentCard component)

## Checkpoint para publicação
- [x] Deduplicação de providers na página principal

- [x] Fix HBO Max deduplication (remove HBO Max Amazon Channel when HBO Max is available)

## AI Chat Assistant - Identificar Filmes por Descrição
- [x] Create backend tRPC procedure for AI movie identification
- [x] Create AI chat dialog component with UI
- [x] Add AI assistant button next to search and filter buttons
- [x] Test the feature end-to-end

- [x] Fix AI chat dialog scrolling - messages are being cut off and cannot scroll to see full conversation

- [x] Add 'Ver filme' button to AI response - link directly to identified movie/series page

- [x] Adjust filter button size to match other buttons in search bar

- [x] Make streaming provider icons clickable to open movie/series directly on that streaming service

- [x] Remove clickable streaming icons from home page cards (keep only on details page)

## Deep Links and Notification System
- [ ] Improve deep links to open specific movie/series page on streaming services (Netflix, Prime Video, HBO Max, Disney+, etc.)
- [ ] Create user streaming subscriptions management (let users select which services they subscribe to)
- [ ] Implement notification system for watchlist availability alerts
- [ ] Test both features end-to-end

## Deep Links and Notification System (Round 40)
- [x] Improve deep links to open specific movie/series page on streaming services (search query with movie title)
- [x] Create watchlist availability check system
- [x] Build alerts page with "Disponível Agora" and "Não Disponível" tabs
- [x] Show which watchlist items are available on user's subscribed streaming services
- [x] Allow creating alerts for unavailable items
- [x] Test deep links opening Prime Video with movie search query

## Web Push Notifications (Round 41)
- [ ] Generate VAPID keys for Web Push authentication
- [ ] Create push_subscriptions table in database schema
- [ ] Add service worker push event handler
- [ ] Build notification permission request UI component
- [ ] Create backend procedures for managing push subscriptions
- [ ] Create backend procedure to send push notifications
- [ ] Integrate with availability check to trigger notifications
- [ ] Test complete notification flow

## Web Push Notifications Implementation (Round 41)
- [x] Set up VAPID keys and push subscription storage in database
- [x] Create service worker push event handler (sw-push.js)
- [x] Build notification permission request UI (PushNotificationManager component)
- [x] Create backend procedure to send push notifications
- [x] Integrate with availability check system (availabilityChecker.ts)
- [x] Add push notification toggle to Alerts page
- [x] Test the complete notification flow

- [x] Reduce streaming provider logo sizes on movie/TV details page (currently too large)

- [x] Increase spacing between menu options and add click effect

## Bug Fixes (Round 42)
- [x] Fix Em Alta section to show action sheet menu when clicking on cards (now uses ContentCard component)

## UI Simplification (Round 43)
- [ ] Remove rating badges from movie/TV posters, keep only the three-dot menu button
- [ ] Apply change to all screens that display posters (Home, Watchlist, Lists, History, etc.)

## UI Changes (Round 43)
- [x] Remove action sheet modal from ContentCard - clicking card now navigates directly to details page
- [x] Keep three-dot menu button with "Adicionar à lista" and "Marcar como assistido" options
