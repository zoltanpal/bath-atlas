import { Component, type ErrorInfo, type ReactNode } from "react"
import { TriangleAlert } from "lucide-react"

type CanvasErrorBoundaryProps = {
  children: ReactNode
  resetKey: string
}

type CanvasErrorBoundaryState = {
  hasError: boolean
}

export class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { hasError: true }
  }

  componentDidUpdate(previousProps: CanvasErrorBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Could not create the bathymetry canvas.", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <TriangleAlert className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-slate-200">3D view is unavailable</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              WebGL could not start in this browser. Try enabling hardware
              acceleration or opening BathAtlas in another browser.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
