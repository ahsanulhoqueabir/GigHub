import { useState, useCallback } from "react";
import { ListPageState } from "./types";

export const useListPageState = (initialPageSize: number = 10) => {
  const [state, setState] = useState<ListPageState>({
    activeFilters: {},
    searchQuery: "",
    currentPage: 1,
    pageSize: initialPageSize,
    selectedItems: [],
    sortBy: null,
    sortDirection: "asc",
    isRefreshing: false,
  });

  const setFilter = useCallback((key: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      activeFilters: {
        ...prev.activeFilters,
        [key]:
          value === undefined || value === null || value === ""
            ? undefined
            : value,
      },
      currentPage: 1, // Reset to first page when filtering
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeFilters: {},
      currentPage: 1,
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
      currentPage: 1, // Reset to first page when searching
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setState((prev) => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
    }));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter((item) => item !== id)
        : [...prev.selectedItems, id],
    }));
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, selectedItems: ids }));
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedItems: [] }));
  }, []);

  const setSorting = useCallback((field: string, direction: "asc" | "desc") => {
    setState((prev) => ({
      ...prev,
      sortBy: field,
      sortDirection: direction,
    }));
  }, []);

  const setRefreshing = useCallback((refreshing: boolean) => {
    setState((prev) => ({ ...prev, isRefreshing: refreshing }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      activeFilters: {},
      searchQuery: "",
      currentPage: 1,
      pageSize: initialPageSize,
      selectedItems: [],
      sortBy: null,
      sortDirection: "asc",
      isRefreshing: false,
    });
  }, [initialPageSize]);

  return {
    state,
    setFilter,
    clearFilters,
    setSearchQuery,
    setPage,
    setPageSize,
    toggleSelection,
    selectAll,
    clearSelection,
    setSorting,
    setRefreshing,
    resetState,
  };
};
