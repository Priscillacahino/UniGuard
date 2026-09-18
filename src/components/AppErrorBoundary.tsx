import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { safeLog } from '../services/safeLogger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    safeLog('error', 'unhandled_render_error', {
      message: error.message,
      componentStack: info.componentStack?.slice(0, 800) || 'unavailable',
    });
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main
        className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6"
        role="alert"
        aria-live="assertive"
      >
        <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">UniGuard</p>
          <h1 className="mt-2 text-2xl font-black">Não foi possível carregar esta tela</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Ocorreu um erro inesperado na interface. Nenhum detalhe sensível foi exibido.
            Recarregue a aplicação para tentar novamente.
          </p>
          <button
            type="button"
            onClick={this.reload}
            className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Recarregar aplicação
          </button>
        </section>
      </main>
    );
  }
}
