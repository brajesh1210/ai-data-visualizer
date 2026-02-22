import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary]', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                    <div className="w-full max-w-lg text-center space-y-6">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl
                            bg-golden-500/10 border border-golden-500/20
                            shadow-lg shadow-golden-500/10">
                            <AlertTriangle size={40} className="text-golden-400" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-golden-400 to-golden-600
                           bg-clip-text text-transparent">
                            Something went wrong
                        </h2>

                        {/* Message */}
                        <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
                            An unexpected error occurred while rendering this page.
                            Don&apos;t worry — your data is safe. Click below to try again.
                        </p>

                        {/* Error details (collapsed) */}
                        {this.state.error && (
                            <details className="text-left bg-zinc-900/80 border border-golden-500/10
                                  rounded-xl p-4 text-xs text-gray-500">
                                <summary className="cursor-pointer text-gray-400 hover:text-golden-400
                                    transition-colors select-none font-medium mb-2">
                                    Error details
                                </summary>
                                <pre className="whitespace-pre-wrap break-words font-mono leading-relaxed">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        {/* Retry button */}
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
                         bg-golden-500 text-dark-bg hover:bg-golden-400
                         transition-all duration-200
                         shadow-md shadow-golden-500/25 hover:shadow-golden-400/35
                         active:scale-[0.97]"
                        >
                            <RotateCcw size={16} />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}