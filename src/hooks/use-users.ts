"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UserProfile } from "@/app/data/profile";
import { searchUsers, getBuildersData } from "@/app/data/profile";

interface UseUsersState {
  users: UserProfile[];
  isLoading: boolean;
  error: string | null;
}

interface UseUsersReturn extends UseUsersState {
  refreshUsers: () => Promise<void>;
  filteredUsers: (query: string) => UserProfile[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Global cache to share data between components
let globalUsersCache: {
  users: UserProfile[];
  timestamp: number;
  lastQuery: string;
} = {
  users: [],
  timestamp: 0,
  lastQuery: "",
};

// Separate cache for default users (builders)
let globalDefaultUsersCache: {
  users: UserProfile[];
  timestamp: number;
} = {
  users: [],
  timestamp: 0,
};

// Cache expiry time (2 minutes for user search)
const CACHE_EXPIRY_MS = 2 * 60 * 1000;

// Set of refresh listeners for real-time updates
const refreshListeners = new Set<() => void>();

export function useUsers(): UseUsersReturn {
  const [state, setState] = useState<UseUsersState>({
    users:
      globalDefaultUsersCache.users.length > 0
        ? globalDefaultUsersCache.users
        : [],
    isLoading: false,
    error: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const refreshTimeoutRef = useRef<NodeJS.Timeout>(null);

  const loadDefaultUsers = useCallback(async (force = false) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const currentTime = Date.now();
      const isCacheValid =
        currentTime - globalDefaultUsersCache.timestamp < CACHE_EXPIRY_MS;

      // Use cache if valid and not forced refresh
      if (isCacheValid && !force && globalDefaultUsersCache.users.length > 0) {
        setState({
          users: globalDefaultUsersCache.users,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Fetch builders/featured users as default
      const usersResponse = await getBuildersData(15);

      if (!usersResponse.success) {
        throw new Error(usersResponse.error || "Failed to load users");
      }

      const usersData = usersResponse.data || [];

      // Update global default cache
      globalDefaultUsersCache = {
        users: usersData,
        timestamp: currentTime,
      };

      setState({
        users: usersData,
        isLoading: false,
        error: null,
      });

      // Notify all listeners about the update
      refreshListeners.forEach((listener) => listener());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error loading default users:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const refreshUsers = useCallback(
    async (query: string = "", force = false) => {
      if (!query.trim()) {
        // Load default users when no search query
        return loadDefaultUsers(force);
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const currentTime = Date.now();
        const isCacheValid =
          globalUsersCache.lastQuery === query &&
          currentTime - globalUsersCache.timestamp < CACHE_EXPIRY_MS;

        // Use cache if valid and not forced refresh
        if (isCacheValid && !force) {
          setState({
            users: globalUsersCache.users,
            isLoading: false,
            error: null,
          });
          return;
        }

        // Fetch fresh data
        const usersResponse = await searchUsers(query, 20, 0);

        if (!usersResponse.success) {
          throw new Error(usersResponse.error || "Failed to search users");
        }

        const usersData = usersResponse.data || [];

        // Update global cache
        globalUsersCache = {
          users: usersData,
          timestamp: currentTime,
          lastQuery: query,
        };

        setState({
          users: usersData,
          isLoading: false,
          error: null,
        });

        // Notify all listeners about the update
        refreshListeners.forEach((listener) => listener());
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error("Error searching users:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [loadDefaultUsers]
  );

  const filteredUsers = useCallback(
    (query: string): UserProfile[] => {
      // Always return the current users (either default users or search results)
      return state.users;
    },
    [state.users]
  );

  // Listen for global refresh events
  useEffect(() => {
    const listener = () => {
      setState((prev) => ({
        ...prev,
        users: globalUsersCache.users,
      }));
    };

    refreshListeners.add(listener);
    return () => {
      refreshListeners.delete(listener);
    };
  }, []);

  // Load default users on mount if cache is empty
  useEffect(() => {
    if (globalDefaultUsersCache.users.length === 0) {
      loadDefaultUsers();
    }
  }, [loadDefaultUsers]);

  // Auto-search when searchQuery changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refreshUsers(searchQuery);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, refreshUsers]);

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeoutRef = refreshTimeoutRef;
    return () => {
      const timeoutId = timeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return {
    ...state,
    refreshUsers: () => refreshUsers(searchQuery, true),
    filteredUsers,
    searchQuery,
    setSearchQuery,
  };
}

// Utility function to manually invalidate cache (useful for refreshing user data)
export function invalidateUsersCache(): void {
  globalUsersCache.timestamp = 0;
  globalUsersCache.lastQuery = "";
  refreshListeners.forEach((listener) => listener());
}

// Utility function to trigger refresh across all components
export function refreshAllUsers(): void {
  refreshListeners.forEach((listener) => listener());
}
