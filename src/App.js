import React, { useCallback, useEffect, useRef, useState } from "react";
import CountryList from "./components/CountryList/CountryList";
import Search from "./components/Search/Search";

import { useCache, useFetch } from "./hooks/customHooks";
import { GET_ALL_COUNTRIES_URL } from "./utils/constants";
import Loader from "./components/Loader/Loader";
import "react-virtualized/styles.css";
import ErrorBoundary from "./components/Error/ErrorBoundary";
import "./App.css";
import Error from "./components/Error/Error";
import { getSearchesFromWeb } from "./utils/helper";
import NoDataSection from "./components/NoDataSection/NoDataSection";
import Sort from "./components/Sort/Sort";

function App() {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const {
    isFetching,
    error,
    data: allData,
    fetchData,
  } = useFetch(GET_ALL_COUNTRIES_URL);
  const [currentSearchString, setCurrentSearchString] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const controllerRef = useRef(null);

  const { getFromCache, storeToCache } = useCache(100);

  const checkAndCancelOnlineSearch = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    setIsSearching(false);
  }, []);

  const performOnlineSearch = useCallback(
    async (searchTerm, signal) => {
      try {
        const onlineSearchResult = await getSearchesFromWeb(searchTerm, signal);
        if (onlineSearchResult?.length) {
          storeToCache(searchTerm.toLowerCase(), onlineSearchResult);
          setFilteredCountries([...onlineSearchResult]);
        } else {
          setFilteredCountries([]);
        }
        setIsSearching(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSearchError(
            error?.message ||
              `Something went wrong while getting search results. Please try again`
          );
          setIsSearching(false);
        }
      }
    },
    [storeToCache]
  );

  useEffect(() => {
    if (!countries.length) {
      setCountries(allData);
      setFilteredCountries(allData);
    }
  }, [allData, countries.length]);

  const searchOnline = useCallback(
    (searchTerm) => {
      checkAndCancelOnlineSearch();

      controllerRef.current = new AbortController();
      const signal = controllerRef.current.signal;

      setIsSearching(true);
      performOnlineSearch(searchTerm, signal);
    },
    [checkAndCancelOnlineSearch, performOnlineSearch]
  );

  useEffect(() => {
    checkAndCancelOnlineSearch();
    if (!currentSearchString) {
      setFilteredCountries(countries);
      return;
    }

    const searchTerm = currentSearchString;

    const filtered = countries.filter(
      (country) =>
        country?.name?.official
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        country?.name?.common.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!filtered.length && !!searchTerm) {
      const cachedValueForSearch = getFromCache(searchTerm.toLowerCase());
      if (!cachedValueForSearch) {
        searchOnline(searchTerm);
      } else {
        setFilteredCountries(cachedValueForSearch);
      }
    } else {
      setFilteredCountries(filtered);
    }
  }, [
    checkAndCancelOnlineSearch,
    countries,
    currentSearchString,
    getFromCache,
    searchOnline,
  ]);

  const handleSearch = useCallback(
    (searchTerm) => {
      searchTerm = searchTerm?.trim();
      if (currentSearchString === searchTerm) return;
      setSearchError("");
      setCurrentSearchString(searchTerm);
    },
    [currentSearchString]
  );

  const handleSort = useCallback((order) => {
    setFilteredCountries((prevFilteredCountries) =>
      [...prevFilteredCountries].sort((a, b) =>
        a?.name?.official > b?.name?.official ? order : -order
      )
    );
  }, []);

  return (
    <ErrorBoundary
      errorMessage="This should not have happened. Please retry or contact support cca@countrypedia.com"
      showImage
    >
      <div className="root">
        <div className="filtersRoot">
          <Search
            onSearch={handleSearch}
            className="searchRoot"
            inputProps={{ disabled: false }}
          />
          <Sort onSort={handleSort} />
        </div>
        <div className="contentRoot">
          {isFetching || isSearching ? (
            <div className="loaderRoot">
              <Loader
                message={`${isFetching ? 'Fetching countries' : 'Searching for results'}, please wait...`}
                size="40px"
              />
            </div>
          ) : !!error || !!searchError ? (
            <Error
              errorMessage={error || searchError}
              onRetry={
                !!currentSearchString
                  ? () => searchOnline(currentSearchString)
                  : fetchData
              }
            />
          ) : countries.length ? (
            <CountryList countries={filteredCountries} />
          ) : (
            <NoDataSection />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
