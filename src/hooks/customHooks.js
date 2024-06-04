import { useCallback, useState, useEffect, useRef } from "react";
import { debounce } from "../utils/helper";
import {
  RESPONSE_ONE_COUNTRY_FIELDS,
  getQueryFields,
  responseFields,
} from "../utils/constants";

export const useCountryDetailsCache = () => {
  const [cache, setCache] = useState({});
  const [isFetching, setIsFetching] = useState({});
  const [error, setError] = useState({});
  const pendingRequests = useRef({});

  const fetchCountryDetails = useCallback(
    async (countryName) => {
      if (cache[countryName]) {
        return cache[countryName];
      }
      if (pendingRequests.current[countryName]) {
        return pendingRequests.current[countryName];
      }

      setError((prev) => ({ ...prev, [countryName]: "" }));
      setIsFetching((prev) => ({ ...prev, [countryName]: true }));

      const fetchPromise = fetch(
        `https://restcountries.com/v3.1/name/${countryName}?fullText=true&fields=${getQueryFields(
          responseFields[RESPONSE_ONE_COUNTRY_FIELDS]
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          const countryDetails = data[0];
          setCache((prevCache) => ({
            ...prevCache,
            [countryName]: countryDetails,
          }));
          setIsFetching((prev) => ({ ...prev, [countryName]: false }));
          delete pendingRequests.current[countryName];
          return countryDetails;
        })
        .catch((error) => {
          setIsFetching((prev) => ({ ...prev, [countryName]: false }));
          delete pendingRequests.current[countryName];
          setError((prev) => ({
            ...prev,
            [countryName]: `Something went wrong while fetching additional details. Please try again`,
          }));
        });

      pendingRequests.current[countryName] = fetchPromise;
      return fetchPromise;
    },
    [cache]
  );

  return { fetchCountryDetails, isFetching, error };
};

export const useFetch = (url, options = {}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const fetchData = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(`Something went wrong while getting details. Please try again.`);
    } finally {
      setIsFetching(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  return { isFetching, error, data, fetchData };
};

export const useVisibility = (options) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleIntersect = debounce(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, 100);

    const observer = new IntersectionObserver(handleIntersect, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [options]);

  return [ref, isVisible];
};

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
};

export const useCache = (cacheSize = 400) => {
  const cacheRef = useRef(new Map());

  const getFromCache = useCallback((key) => {
    const cache = cacheRef.current;

    if (!cache.has(key)) return null;

    const value = cache.get(key);
    cache.delete(key);
    cache.set(key, value);

    return value;
  }, []);

  const storeToCache = useCallback(
    (key, value) => {
      const cache = cacheRef.current;

      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= cacheSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    [cacheSize]
  );

  return { getFromCache, storeToCache };
};
