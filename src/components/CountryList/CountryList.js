import React, { useCallback, useEffect, useRef, useState } from "react";
// import VirtualizedList from "../VirtualizedList";
import {
  List,
  CellMeasurer,
  CellMeasurerCache,
  AutoSizer,
} from "react-virtualized";
import { useCountryDetailsCache, useIsMounted } from "../../hooks/customHooks";
import { checkForAvailableValues, formatPopulation } from "../../utils/helper";
import Loader from "../Loader/Loader";
import Button from "../Button/Button";

import "./CountryList.css";
import NoDataSection from "../NoDataSection/NoDataSection";
import Error from "../Error/Error";

function CountryList({ countries = [] }) {
  const [expandedItems, setExpandedItems] = useState({});
  const cache = useRef(
    new CellMeasurerCache({
      defaultHeight: 100,
      fixedWidth: true,
    })
  );
  const handleToggle = useCallback(
    (countryName) => () => {
      setExpandedItems((prevExpandedItems) => ({
        ...prevExpandedItems,
        [countryName]: !prevExpandedItems[countryName],
      }));
    },
    []
  );

  const rowRenderer = ({ index, key, parent, style }) => {
    const country = countries[index];
    const isExpanded = !!expandedItems[country?.name?.official];

    return (
      <CellMeasurer
        key={key}
        cache={cache.current}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        {({ measure, registerChild }) => {
          return (
            <div style={style} ref={registerChild}>
              <CountryListItem
                country={country}
                isExpanded={isExpanded}
                onToggle={handleToggle(country?.name?.official)}
                measure={measure}
              />
            </div>
          );
        }}
      </CellMeasurer>
    );
  };

  if (!countries.length) {
    return <NoDataSection />;
  }

  return (
    <AutoSizer>
      {({ height, width }) => {
        return (
          <List
            width={width}
            height={height}
            deferredMeasurementCache={cache.current}
            rowHeight={cache.current.rowHeight}
            rowRenderer={rowRenderer}
            rowCount={countries.length}
            overscanRowCount={3}
          />
        );
      }}
    </AutoSizer>
  );
}

function CountryListItem({ country, measure, isExpanded, onToggle }) {
  const { isFetching, fetchCountryDetails, error } = useCountryDetailsCache();
  const [additionalDetails, setAdditionalDetails] = useState(null);
  const itemRef = useRef(null);
  const isMounted = useIsMounted();

  const fetchCountryData = useCallback(() => {
    if (isExpanded) {
      fetchCountryDetails(country?.name?.official).then((data) => {
        if (itemRef.current) {
          setAdditionalDetails(data);
        }
      });
    }
  }, [isExpanded, country?.name?.official, fetchCountryDetails]);

  useEffect(() => {
    fetchCountryData();
  }, [fetchCountryData]);

  useEffect(() => {
    let animationFrameId;

    const measureDuringAnimationOrTransition = () => {
      if (itemRef.current) {
        measure();
        animationFrameId = requestAnimationFrame(
          measureDuringAnimationOrTransition
        );
      }
    };

    const handleAnimationOrTransitionStart = () => {
      if (itemRef.current) {
        measureDuringAnimationOrTransition();
      }
    };

    const handleAnimationOrTransitionEnd = () => {
      if (itemRef.current) {
        cancelAnimationFrame(animationFrameId);
        measure();
      }
    };

    if (isMounted.current) {
      if (itemRef.current) {
        itemRef.current.addEventListener(
          "animationstart",
          handleAnimationOrTransitionStart
        );
        itemRef.current.addEventListener(
          "animationend",
          handleAnimationOrTransitionEnd
        );
        itemRef.current.addEventListener(
          "transitionstart",
          handleAnimationOrTransitionStart
        );
        itemRef.current.addEventListener(
          "transitionend",
          handleAnimationOrTransitionEnd
        );
        measure();
      }
    }

    const currentRef = itemRef.current;

    return () => {
      currentRef.removeEventListener(
        "animationstart",
        handleAnimationOrTransitionStart
      );
      currentRef.removeEventListener(
        "animationend",
        handleAnimationOrTransitionEnd
      );
      currentRef.removeEventListener(
        "transitionstart",
        handleAnimationOrTransitionStart
      );
      currentRef.removeEventListener(
        "transitionend",
        handleAnimationOrTransitionEnd
      );
    };
  }, [isMounted, measure]);

  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const isError = error?.[country?.name?.official];
  return (
    <div
      ref={itemRef}
      className={`countryItemRoot displayContinerWithAnimation ${
        isExpanded ? "expanded" : ""
      }`}
    >
      <img
        src={country?.flags?.png}
        className="countryItemImage"
        width={isExpanded ? "360px" : "60px"}
        height={isExpanded ? "240px" : "40px"}
        alt={country?.flags?.alt || `Flag of ${country?.name?.official}`}
      />
      <div className="countryItemDetails">
        <h3 className="countryItemName">
          {checkForAvailableValues(country?.name?.official)}
        </h3>
        <p>{`Population: ${checkForAvailableValues(
          formatPopulation(country?.population)
        )}`}</p>
        <p>{`Region: ${checkForAvailableValues(country?.region)}`}</p>
        <p>{`Capital: ${checkForAvailableValues(
          country?.capital?.join(", ")
        )}`}</p>
        {isExpanded ? (
          isFetching?.[country?.name?.official] ? (
            <Loader
              message={`Getting more details for ${country?.name?.official}...`}
              size="20px"
              className="displayContinerWithAnimation"
            />
          ) : isError ? (
            <Error
              errorMessage={isError}
              onRetry={fetchCountryData}
              className="displayContinerWithAnimation"
            />
          ) : (
            additionalDetails && (
              <AdditionalCountryDetails countryDetails={additionalDetails} />
            )
          )
        ) : null}
        {(!isError || !isExpanded) && (
          <Button onClick={handleToggle} variant="primary">
            {isExpanded ? `Hide Details` : `Know More`}
          </Button>
        )}
      </div>
    </div>
  );
}

function AdditionalCountryDetails({ countryDetails }) {
  return (
    <div className="additionalDetailsRoot displayContinerWithAnimation">
      <p>{`Native: ${checkForAvailableValues(
        Object.values(countryDetails?.name?.nativeName)
          .map((native) => native.official)
          .join(", ")
      )}`}</p>
      <p>{`Currencies: ${checkForAvailableValues(
        Object.entries(countryDetails?.currencies)
          .map(([code, label]) => `${code}(${label.name})`)
          .join(", ")
      )}`}</p>
      <p>{`Languages: ${checkForAvailableValues(
        Object.values(countryDetails?.languages)
          .map((lang) => lang)
          .join(", ")
      )}`}</p>
      <p>{`Border countries: ${checkForAvailableValues(
        countryDetails?.borders?.join(", ")
      )}`}</p>
    </div>
  );
}

export default CountryList;
