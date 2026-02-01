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
- [ ] Implement user watchlist functionality (add/remove content)
- [ ] Create watchlist page showing saved content
- [ ] Add watchlist indicators on search results and detail pages
- [ ] Implement user subscription management (track which services user has)

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
- [ ] Add affiliate parameters to rent/buy links
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
- [ ] Add content filtering to show only content available on user's subscriptions
- [ ] Add "Similar Movies/Shows" recommendations on detail pages (backend ready, UI pending)
- [x] Fix deep linking to redirect directly to streaming apps instead of JustWatch
