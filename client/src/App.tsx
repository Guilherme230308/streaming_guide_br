import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProviderBatchProvider } from "./contexts/ProviderBatchContext";
import { AppHeader } from "./components/AppHeader";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MovieDetails from "./pages/MovieDetails";
import TVShowDetails from "./pages/TVShowDetails";
import Watchlist from "./pages/Watchlist";
import MySubscriptions from "./pages/MySubscriptions";
import Alerts from "./pages/Alerts";
import Upcoming from "./pages/Upcoming";
import Genres from "./pages/Genres";
import History from "./pages/History";
import MyLists from "./pages/MyLists";
import ListDetails from "./pages/ListDetails";
import About from "./pages/About";
import StreamingPrices from "./pages/StreamingPrices";
import AffiliateAnalytics from "./pages/AffiliateAnalytics";
import StreamingAnalysis from "./pages/StreamingAnalysis";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/search"} component={Search} />
      <Route path={"/movie/:id"} component={MovieDetails} />
      <Route path={"/tv/:id"} component={TVShowDetails} />
      <Route path={"/watchlist"} component={Watchlist} />
      <Route path={"/subscriptions"} component={MySubscriptions} />
      <Route path={"/alerts"} component={Alerts} />
      <Route path={"/upcoming"} component={Upcoming} />
      <Route path={"/genres"} component={Genres} />
      <Route path={"/history"} component={History} />
      <Route path={"/lists"} component={MyLists} />
      <Route path={"/list/:id"} component={ListDetails} />
      <Route path={"/about"} component={About} />
      <Route path={"/streaming-prices"} component={StreamingPrices} />
      <Route path={"/affiliate-analytics"} component={AffiliateAnalytics} />
      <Route path={"/streaming-analysis"} component={StreamingAnalysis} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppHeader />
          <ProviderBatchProvider>
            <Router />
          </ProviderBatchProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
