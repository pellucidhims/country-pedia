import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "../Button/Button";

import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // For this demo not adding BE service like sentry or splunk to log app errors. But this can also be done here.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    const { errorMessage, showImage, imageUrl = `${process.env.PUBLIC_URL}/assets/images/errorPlaceholderImage.webp`, retryButtonText } = this.props;
    if (this.state.hasError) {
      return (
        <div className="errorBoundary">
          {showImage && imageUrl && (
            <img src={imageUrl} alt="Error" className="errorImage" />
          )}
          <h2>Something went wrong. Apologies for the inconvenience</h2>
          <p className="errorMessageInfo">{errorMessage || this.state.error?.toString()}</p>
          <Button onClick={this.handleRetry} variant="tertiary">
            {retryButtonText || "Retry"}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  errorMessage: PropTypes.string,
  showImage: PropTypes.bool,
  imageUrl: PropTypes.string,
  retryButtonText: PropTypes.string,
  onRetry: PropTypes.func,
};

export default ErrorBoundary;
