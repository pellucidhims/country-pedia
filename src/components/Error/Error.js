import React from "react";
import "./Error.css";
import Button from "../Button/Button";

function Error({
  errorMessage,
  imageUrl,
  onRetry,
  btnLabel = "Retry",
  className = "",
}) {
  return (
    <div className={`errorContainer ${className}`}>
      {imageUrl && (
        <img src={imageUrl} alt="Something broke" className="errorImage" />
      )}
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      {onRetry && (
        <Button variant="tertiary" onClick={onRetry}>
          {btnLabel}
        </Button>
      )}
    </div>
  );
}

export default Error;
