import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { act } from "react-dom/test-utils";
import App from "../App";
import { GET_ALL_COUNTRIES_URL } from "../utils/constants";
import { getSearchesFromWeb } from "../utils/helper";
import {
  useFetch,
  useCountryDetailsCache,
  useVisibility,
  useDebounce,
  useIsMounted,
  useCache,
} from "../hooks/customHooks";
import { mockCountries } from "../mocks/mockData";

jest.mock("react-virtualized", () => {
  const originalModule = jest.requireActual("react-virtualized");
  return {
    ...originalModule,
    AutoSizer: ({ children }) => children({ height: 600, width: 800 }),
  };
});

jest.mock("../utils/helper", () => ({
  ...jest.requireActual("../utils/helper"),
  getSearchesFromWeb: jest.fn(),
}));

jest.mock("../hooks/customHooks", () => ({
  useFetch: jest.fn(),
  useCountryDetailsCache: jest.fn(),
  useVisibility: jest.fn(),
  useDebounce: jest.fn(),
  useIsMounted: jest.fn(),
  useCache: jest.fn(),
}));

beforeEach(() => {
  useFetch.mockReturnValue({
    isFetching: false,
    error: null,
    data: mockCountries,
    fetchData: jest.fn(),
  });
  useCountryDetailsCache.mockReturnValue({
    fetchCountryDetails: jest.fn(),
    isFetching: {},
    error: {},
  });
  useVisibility.mockReturnValue([React.createRef(), true]);
  useDebounce.mockReturnValue("");
  useIsMounted.mockReturnValue(true);
  useCache.mockReturnValue({
    getFromCache: jest.fn(),
    storeToCache: jest.fn(),
  });
  getSearchesFromWeb.mockResolvedValue([]);
  jest.clearAllMocks();
});

test("displays loader initially and fetches countries", async () => {
  useFetch
    .mockReturnValueOnce({
      isFetching: true,
      error: null,
      data: null,
      fetchData: jest.fn(),
    })
    .mockReturnValueOnce({
      isFetching: false,
      error: null,
      data: mockCountries,
      fetchData: jest.fn(),
    });

  await act(async () => {
    render(<App />);
  });

  await waitFor(() =>
    expect(useFetch).toHaveBeenCalledWith(GET_ALL_COUNTRIES_URL)
  );

  expect(screen.getByText(/India/i)).toBeInTheDocument();
  expect(screen.getByText(/United States of America/i)).toBeInTheDocument();
});

test("handles search input and displays filtered results", async () => {
  await act(async () => {
    render(<App />);
  });

  await waitFor(() =>
    expect(useFetch).toHaveBeenCalledWith(GET_ALL_COUNTRIES_URL)
  );

  await act(async () => {
    fireEvent.change(screen.getByTestId("search"), {
      target: { value: "India" },
    });
  });

  await waitFor(() => {
    expect(screen.getByText(/India/i)).toBeInTheDocument();
  });
});

test("displays error message on search failure", async () => {
  getSearchesFromWeb.mockRejectedValueOnce(new Error("Search failed"));

  await act(async () => {
    render(<App />);
  });

  await waitFor(() =>
    expect(useFetch).toHaveBeenCalledWith(GET_ALL_COUNTRIES_URL)
  );

  await act(async () => {
    fireEvent.change(screen.getByTestId("search"), {
      target: { value: "InvalidSearch" },
    });
  });
  await waitFor(() => {
    screen.debug(Infinity);
  });
  await waitFor(() =>
    expect(
      screen.getByText(
        /Some error happened while performing search. Please retry./i
      )
    ).toBeInTheDocument()
  );
});

test("handles sorting of countries", async () => {
  await act(async () => {
    render(<App />);
  });

  await waitFor(() =>
    expect(useFetch).toHaveBeenCalledWith(GET_ALL_COUNTRIES_URL)
  );

  await act(async () => {
    fireEvent.click(screen.getByText(/Sort/i));
  });

  const countries = screen.getAllByText(/Population:/i);
  expect(countries[0]).toHaveTextContent("331.00M");
  expect(countries[1]).toHaveTextContent("1.39B");
});

test("fetchCountryDetails hook fetches and caches data", async () => {
  const { fetchCountryDetails } = require("../hooks/customHooks");

  const mockCountryDetails = {
    name: { official: "Canada", common: "Canada" },
    population: 37742154,
    region: "Americas",
    capital: ["Ottawa"],
    flags: { png: "flag-url" },
  };

  fetch.mockResponseOnce(JSON.stringify([mockCountryDetails]));

  let result;
  await act(async () => {
    result = await fetchCountryDetails("Canada");
  });

  expect(result).toEqual(mockCountryDetails);
  expect(fetch).toHaveBeenCalledWith(
    `https://restcountries.com/v3.1/name/Canada?fullText=true&fields=name,population,region,capital,flags`
  );
});

test("useFetch hook fetches data", async () => {
  const { useFetch } = require("../hooks/customHooks");
  const TestComponent = () => {
    const { isFetching, error, data } = useFetch(GET_ALL_COUNTRIES_URL);
    if (isFetching) return <div>Loading...</div>;
    if (error) return <div>Error</div>;
    return <div>{data ? data[0].name.common : "No data"}</div>;
  };

  fetch.mockResponseOnce(JSON.stringify(mockCountries));

  await act(async () => {
    render(<TestComponent />);
  });

  await waitFor(() => {
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  await waitFor(() => {
    expect(screen.getByText(/India/i)).toBeInTheDocument();
  });
});
