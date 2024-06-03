import React, { useCallback, useState } from "react";
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
  const { isFetching, error, data, fetchData } = useFetch(
    GET_ALL_COUNTRIES_URL
  );
  const [currentSearchString, setCurrentSearchString] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { getFromCache, storeToCache } = useCache(100);

  const searchOnline = useCallback(
    (searchTerm) => {
      setIsSearching(true);
      getSearchesFromWeb(searchTerm)
        .then((data) => {
          if (data.length) {
            storeToCache(searchTerm.toLowerCase(), data[0]);
            setFilteredCountries([...data[0]]);
          } else {
            setFilteredCountries([]);
          }
        })
        .catch((error) => {
          setSearchError(error);
        })
        .finally(() => {
          setIsSearching(false);
        });
    },
    [storeToCache]
  );

  // const wrapSearchOnline = useCallback((searchTerm) => searchOnline(searchTerm), [searchOnline]);

  const handleSearch = useCallback(
    (searchTerm) => {
      setCurrentSearchString(searchTerm);
      setSearchError("");
      searchTerm = searchTerm?.trim();
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
    },
    [countries, getFromCache, searchOnline]
  );

  const handleSort = useCallback((order) => {
    setFilteredCountries((prevFilteredCountries) =>
      [...prevFilteredCountries].sort((a, b) =>
        a?.name?.official > b?.name?.official ? order : -order
      )
    );
  }, []);

  if (data && !countries.length) {
    setCountries(data);
    setFilteredCountries(data);
  }
  return (
    <ErrorBoundary
      errorMessage="This should not have happened. Please retry or contact support cca@knowyourcountry.com"
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
                message="Fetching countries, please wait..."
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
