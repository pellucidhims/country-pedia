import "./NoDataSection.css";

function NoDataSection() {
  return (
    <div className="noMatchFoundRoot">
      <p className="messageText">
        No matching country found for the search string.
      </p>
      <p className="messageText">Try instead searching for India, America...</p>
    </div>
  );
}

export default NoDataSection;
