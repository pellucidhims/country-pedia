import {
  NOT_AVAILABLE,
  RESPONSE_ALL_COUNTRIES_FIELDS,
  responseFields,
  getQueryFields,
} from "./constants";

export const formatPopulation = (count) => {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(2)}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(2)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(2)}K`;
  }
  return count?.toString();
};

export const checkForAvailableValues = (data) => {
  if (!data || !Object.keys(data).length) return NOT_AVAILABLE;
  return data;
};

export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.call(this, ...args);
    }, delay);
  };
};

export const getSearchApiUrls = (
  searchTerm,
  searchKeys,
  includeFieldsInResponse
) =>
  searchKeys.map(
    (key) =>
      `https://restcountries.com/v3.1/${key}/${searchTerm}${
        includeFieldsInResponse?.length
          ? `?fields=${getQueryFields(includeFieldsInResponse)}`
          : ""
      }`
  );

export const getSearchesFromWeb = (
  searchTerm,
  signal,
  searchKeys = ["region", "lang", "currency", "capital"],
  includeFieldsInResponse = responseFields[RESPONSE_ALL_COUNTRIES_FIELDS]
) =>
  new Promise((resolve, reject) => {
    if (!searchTerm) {
      return reject("No Search query provided!");
    }

    const searchUrls = getSearchApiUrls(
      searchTerm,
      searchKeys,
      includeFieldsInResponse
    );

    Promise.allSettled(searchUrls.map((url) => fetch(url, { signal })))
      .then((responses) => {

        // In case the user searches for different string then existing requests are aborted.
        if (responses.some((resp) => resp?.reason?.name === "AbortError")) {
          reject({ name: "AbortError", message: "Search cancelled by user" });
          return;
        }

        // In case requests are fulfilled then check for response having status === 200 and add to the final result 
        const fulfilledResponse = responses.reduce((allResults, result) => {
          if (result?.status === "fulfilled" && result?.value?.status === 200) {
            allResults.push(result.value.json());
          }
          return allResults;
        }, []);

        // Since we are using fetch, await for results to be available in json format and return the response array
        Promise.all(fulfilledResponse).then((finalData) => {
          resolve(finalData.reduce((consolidate, currentResult) => {
            return [...consolidate, ...currentResult]
          }, []));
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
