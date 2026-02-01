import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MovieDetails from "./pages/MovieDetails";
import TVShowDetails from "./pages/TVShowDetails";
import Watchlist from "./pages/Watchlist";
import MySubscriptions from "./pages/MySubscriptions";
import Alerts from "./pages/Alerts";
import Upcoming from "./pages/Upcoming";

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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
