import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white">
          <div className="max-w-md w-full bg-slate-800 p-6 rounded-2xl border border-rose-500/30 shadow-2xl">
            <h2 className="text-lg font-bold text-rose-400 mb-2">Application Error Detected</h2>
            <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto mb-4">
              {this.state.error?.message || "Unknown rendering exception"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

