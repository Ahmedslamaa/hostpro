"use client";
import { Component, ErrorInfo, ReactNode } from "react";
import { LogoMark } from "@/components/ui/LogoMark";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center px-4">
          <LogoMark variant="light" size="md" className="justify-center mb-8" />
          <div className="text-8xl font-black text-[#DDDDDD] mb-4 tracking-tighter">500</div>
          <h1 className="text-2xl font-bold text-[#222222] mb-2">Une erreur est survenue</h1>
          <p className="text-[#717171] mb-8 text-center max-w-sm">
            Un problème inattendu s'est produit. Notre équipe a été notifiée.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = "/dashboard"; }}
            className="bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            Retour au tableau de bord
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 max-w-lg overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
