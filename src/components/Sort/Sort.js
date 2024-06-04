import { useEffect, useState } from "react";
import Button from "../Button/Button";

function Sort({
    onSort
}) {
  const [sortOrder, setSortOrder] = useState(1);

  useEffect(() => {
    onSort(sortOrder);
  }, [sortOrder, onSort])

  const handleClick = () => {
    setSortOrder((prevOrder) => (prevOrder === 1 ? -1 : 1));
  };

  return (
    <Button variant="tertiary" onClick={handleClick}>
      {`Sort by name (${sortOrder === 1? '⇧' : '⇩'})`}
    </Button>
  );
}

export default Sort;
