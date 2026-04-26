"use client";

import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center bg-background">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Algo salió mal</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            No se pudo cargar el asistente. Intenta de nuevo.
          </p>
          <Button onClick={this.handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
