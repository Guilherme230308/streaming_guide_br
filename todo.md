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
- [ ] Test login flow after PWA service worker fix and republish

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
- [ ] Add pagination for community feed (future enhancement)

## Public Shareable Lists (Round 21)
- [ ] Add isPublic field to customLists schema
- [ ] Add coverImage and description fields to customLists
- [ ] Create public list view page with unique URL
- [ ] Add toggle to make lists public/private in list settings
- [ ] Implement Web Share API for social sharing
- [ ] Create shareable preview cards with Open Graph meta tags
- [ ] Add "Copy Link" button for easy sharing

## Web Push Notifications (Round 21)
- [ ] Set up VAPID keys for Web Push
- [ ] Add push subscription storage to database
- [ ] Implement service worker push event handler
- [ ] Create notification permission request UI
- [ ] Add backend procedure to send push notifications when alert content arrives
- [ ] Create notification settings page for users
- [ ] Test push notifications on different browsers


## PWA Installation Visibility Fix (Round 22)
- [x] Investigate why install button/banner not showing on Chrome desktop
- [x] Check PWA manifest configuration and service worker registration
- [x] Fix PWA installability criteria (added scope field, removed non-existent screenshots)
- [ ] Verify beforeinstallprompt event is being captured after fix
- [ ] Test on Chrome desktop after fixes
- [x] Document Chrome iOS limitation (no PWA support)
