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
