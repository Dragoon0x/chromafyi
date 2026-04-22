import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  moduleName: string;
  onReset?: () => void;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error(`[${this.props.moduleName}]`, error, info);
    }
  }

  override componentDidUpdate(prev: Props): void {
    // Reset when the module (identified by key in parent) changes
    if (prev.moduleName !== this.props.moduleName && this.state.error) {
      this.setState({ error: null });
    }
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="h-full grid place-items-center px-6">
        <div className="max-w-md text-center space-y-3">
          <div className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-text-dim)]">
            {this.props.moduleName}
          </div>
          <h2 className="text-lg font-medium text-[color:var(--color-danger)]">
            Something broke in this module.
          </h2>
          <p className="mono text-[12px] text-[color:var(--color-text-muted)] break-words">
            {error.message || String(error)}
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={this.reset}
              className="h-8 px-3 text-sm rounded-[var(--radius-sm)] border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-2)] transition-colors"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('chromaFyi:v1');
                } catch {
                  // noop
                }
                window.location.hash = '';
                window.location.reload();
              }}
              className="h-8 px-3 text-sm rounded-[var(--radius-sm)] border border-[color:var(--color-danger)] text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)] hover:text-[color:var(--color-bg)] transition-colors"
            >
              Reset state
            </button>
          </div>
        </div>
      </div>
    );
  }
}
