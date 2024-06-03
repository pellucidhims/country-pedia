import React, { useEffect, useState } from "react";
import { useDebounce } from "../../hooks/customHooks";
import "./Search.css";

function Search({ onSearch, className, inputProps = {} }) {
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleSearchChange = (e) => {
    if(inputProps?.disabled) return;
    const { value } = e?.target;
    setSearchTerm(value);
  };

  return (
    <div className={`searchBar ${className}`}>
      <input
        data-testid="search"
        type="search"
        placeholder="Search for a country..."
        value={searchTerm}
        onChange={handleSearchChange}
        {...inputProps}
      />
    </div>
  );
}

export default Search;
