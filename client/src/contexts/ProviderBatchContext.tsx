import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { trpc } from "@/lib/trpc";

/**
 * Provider data for a single content item
 */
type ProviderInfo = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

/**
 * Key format: "movie:12345" or "tv:67890"
 */
function makeKey(tmdbId: number, mediaType: "movie" | "tv"): string {
  return `${mediaType}:${tmdbId}`;
}

interface ProviderBatchContextValue {
  /**
   * Register interest in a content item's providers.
   * Returns the providers if already available, or undefined if still loading.
   */
  getProviders: (
    tmdbId: number,
    mediaType: "movie" | "tv"
  ) => ProviderInfo[] | undefined;

  /**
   * Register a content item to be fetched in the next batch.
   */
  requestProviders: (tmdbId: number, mediaType: "movie" | "tv") => void;
}

const ProviderBatchContext = createContext<ProviderBatchContextValue | null>(
  null
);

/**
 * Batch interval in ms — how long to wait before sending a batch request.
 * Short enough to feel instant, long enough to collect all cards on screen.
 */
const BATCH_DELAY_MS = 100;

/**
 * Cache duration in ms (30 minutes) — matches the individual query staleTime.
 */
const CACHE_DURATION_MS = 30 * 60 * 1000;

interface CacheEntry {
  providers: ProviderInfo[];
  timestamp: number;
}

export function ProviderBatchProvider({ children }: { children: ReactNode }) {
  // Persistent cache of providers keyed by "mediaType:tmdbId"
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  // Pending requests that haven't been batched yet
  const pendingRef = useRef<Set<string>>(new Set());

  // Items currently being fetched
  const [batchItems, setBatchItems] = useState<
    Array<{ tmdbId: number; mediaType: "movie" | "tv" }> | null
  >(null);

  // Timer for batching
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Force re-render counter to notify consumers when cache updates
  const [, setUpdateCounter] = useState(0);

  // The batch query — only runs when batchItems is set
  const { data: batchData } = trpc.content.getBatchProviders.useQuery(
    { items: batchItems || [] },
    {
      enabled: !!batchItems && batchItems.length > 0,
      staleTime: CACHE_DURATION_MS,
      refetchOnWindowFocus: false,
      // Don't retry too aggressively
      retry: 1,
    }
  );

  // When batch data arrives, update the cache
  useEffect(() => {
    if (batchData) {
      const now = Date.now();
      for (const [key, providers] of Object.entries(batchData)) {
        cacheRef.current.set(key, { providers, timestamp: now });
      }
      // Clear the batch items so the query doesn't re-run
      setBatchItems(null);
      // Notify consumers
      setUpdateCounter((c) => c + 1);
    }
  }, [batchData]);

  const flushBatch = useCallback(() => {
    const pending = Array.from(pendingRef.current);
    if (pending.length === 0) return;

    // Parse keys back into items
    const items = pending.map((key) => {
      const [mediaType, tmdbIdStr] = key.split(":");
      return {
        tmdbId: parseInt(tmdbIdStr, 10),
        mediaType: mediaType as "movie" | "tv",
      };
    });

    // Clear pending
    pendingRef.current.clear();

    // Set batch items to trigger the query
    setBatchItems(items);
  }, []);

  const requestProviders = useCallback(
    (tmdbId: number, mediaType: "movie" | "tv") => {
      const key = makeKey(tmdbId, mediaType);

      // Skip if already cached and not expired
      const cached = cacheRef.current.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return;
      }

      // Add to pending
      pendingRef.current.add(key);

      // Reset the timer (debounce)
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(flushBatch, BATCH_DELAY_MS);
    },
    [flushBatch]
  );

  const getProviders = useCallback(
    (tmdbId: number, mediaType: "movie" | "tv"): ProviderInfo[] | undefined => {
      const key = makeKey(tmdbId, mediaType);
      const cached = cacheRef.current.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return cached.providers;
      }
      return undefined;
    },
    []
  );

  return (
    <ProviderBatchContext.Provider value={{ getProviders, requestProviders }}>
      {children}
    </ProviderBatchContext.Provider>
  );
}

/**
 * Hook for components to request and receive batch-loaded providers.
 * 
 * Usage:
 *   const providers = useBatchProviders(tmdbId, mediaType);
 *   // providers is ProviderInfo[] | undefined
 */
export function useBatchProviders(
  tmdbId: number,
  mediaType: "movie" | "tv",
  /** If providers are already passed as props, skip the batch request */
  propProviders?: ProviderInfo[]
): ProviderInfo[] | undefined {
  const ctx = useContext(ProviderBatchContext);

  // If providers are passed as props, return them directly
  if (propProviders && propProviders.length > 0) {
    return propProviders;
  }

  // If no context (not wrapped in provider), fall back to undefined
  if (!ctx) {
    return undefined;
  }

  const { getProviders, requestProviders } = ctx;

  // Register this item for batch fetching on mount
  useEffect(() => {
    requestProviders(tmdbId, mediaType);
  }, [tmdbId, mediaType, requestProviders]);

  return getProviders(tmdbId, mediaType);
}
