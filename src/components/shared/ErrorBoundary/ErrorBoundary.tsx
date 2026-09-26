"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/* eslint-disable functional/no-classes, functional/no-this-expressions -- getDerivedStateFromError has no hook equivalent; a class is the only way to catch a render error in React */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    const { onError } = this.props;
    onError?.(error, info);
  }

  readonly reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;
    return error === null ? children : fallback(error, this.reset);
  }
}
/* eslint-enable functional/no-classes, functional/no-this-expressions */
