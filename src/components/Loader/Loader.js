import React from 'react';
import './Loader.css';

function Loader({ message, size, className = '', loaderClassName = '', ...props }) {
  return (
    <div className={`loaderContainer ${className}`} {...props}>
      <div className={`loader ${loaderClassName}`} style={{ width: size, height: size }} {...props} />
      {message && <p className="loaderMessage">{message}</p>}
    </div>
  );
}

export default Loader;