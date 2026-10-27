import React from 'react';
import { AlertTriangle, RotateCcw, Home, ClipboardCopy } from 'lucide-react';

type Props = { children: React.ReactNode };
type State = { error: Error | null; copied: boolean };

/**
 * Last line of defence: if any screen throws while rendering, the visitor sees a
 * readable, recoverable message instead of a blank white page. The error text is
 * copyable so a field report can include the exact message.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, copied: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Kept in the console so a support call can ask for a screenshot of it.
    console.error('[Shram Setu] Screen failed to render:', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null, copied: false });
  };

  private copy = async () => {
    const message = this.state.error?.message ?? 'Unknown error';
    try {
      await navigator.clipboard.writeText(message);
      this.setState({ copied: true });
      window.setTimeout(() => this.setState({ copied: false }), 2200);
    } catch {
      try {
        window.prompt('Copy this message to report the problem:', message);
      } catch {
        /* no-op */
      }
    }
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-sand-50 px-5 py-16">
        <div className="w-full max-w-xl">
          <div className="card overflow-hidden">
            <div className="flex items-start gap-4 border-b border-sand-200 bg-sand-100/70 p-6">
              <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brass-100 text-brass-800">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">Something interrupted the page</p>
                <h1 className="mt-1.5 font-display text-2xl leading-tight text-ink-950">
                  This screen could not be displayed
                </h1>
              </div>
            </div>

            <div className="p-6">
              <p className="text-[0.95rem] leading-relaxed text-ink-600">
                Your records are safe — nothing has been lost. Reloading usually fixes this, and
                you can always get back to the home page.
              </p>

              <pre className="mt-4 max-h-32 overflow-auto rounded-xl border border-sand-200 bg-sand-50 p-3 font-mono text-[0.72rem] leading-relaxed text-ink-500">
                {error.message || String(error)}
              </pre>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <button type="button" onClick={() => window.location.reload()} className="btn btn-primary">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reload the page
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#/home';
                    this.reset();
                  }}
                  className="btn btn-outline"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Go to home
                </button>
                <button type="button" onClick={this.copy} className="btn btn-ghost">
                  <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                  {this.state.copied ? 'Copied' : 'Copy error'}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-ink-400">
            If this keeps happening, call the labour helpline and quote the message above.
          </p>
        </div>
      </div>
    );
  }
}
