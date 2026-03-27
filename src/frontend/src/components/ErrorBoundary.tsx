import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "oklch(0.12 0.04 155)" }}
        >
          <div className="text-center max-w-sm">
            <p
              className="text-lg font-bold mb-2"
              style={{ color: "oklch(0.95 0.02 145)" }}
            >
              कुछ गलत हो गया
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: "oklch(0.6 0.05 145)" }}
            >
              {this.state.error?.message || "अज्ञात त्रुटि"}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-lg text-white text-sm"
              style={{ background: "oklch(0.52 0.18 145)" }}
            >
              दोबारा कोशिश करें
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
