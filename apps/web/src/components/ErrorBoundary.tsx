'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/50 rounded-2xl max-w-xl mx-auto my-12 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Something went wrong</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="destructive"
            className="px-6"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
