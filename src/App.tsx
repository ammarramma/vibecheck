import { useCallback, useEffect } from "react";
import { Background } from "@/components/Background";
import { ErrorPanel } from "@/components/ErrorPanel";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { IdleState } from "@/components/IdleState";
import { ResultView } from "@/components/ResultView";
import { ScanForm } from "@/components/ScanForm";
import { ScanningPanel } from "@/components/ScanningPanel";
import { useApiHealth } from "@/hooks/useApiHealth";
import { useScan } from "@/hooks/useScan";
import { useTheme } from "@/hooks/useTheme";

export default function App() {
  const { theme, toggle } = useTheme();
  const { status: apiHealth, info: apiHealthInfo } = useApiHealth();
  const {
    status,
    result,
    meta,
    error,
    activeUrl,
    elapsedSeconds,
    scan,
    reset,
  } = useScan();

  const focusInput = useCallback(() => {
    window.requestAnimationFrame(() => {
      document.getElementById("target-url")?.focus();
    });
  }, []);

  useEffect(() => {
    if (status === "idle") return;

    const targetId =
      status === "success"
        ? "results"
        : status === "error"
          ? "scan-error"
          : "scan-progress";

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [status]);

  const handleReset = useCallback(() => {
    reset();
    focusInput();
  }, [focusInput, reset]);

  return (
    <div id="top" className="relative flex min-h-dvh flex-col overflow-x-clip">
      <Background />
      <Header
        theme={theme}
        onToggleTheme={toggle}
        health={apiHealth}
        healthInfo={apiHealthInfo}
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-20 sm:px-6">
        <Hero />
        <ScanForm onScan={scan} isScanning={status === "loading"} />

        <div className="mt-8 sm:mt-10" aria-live="polite">
          {status === "idle" ? <IdleState /> : null}

          {status === "loading" ? (
            <ScanningPanel
              targetUrl={activeUrl}
              elapsedSeconds={elapsedSeconds}
              onCancel={handleReset}
            />
          ) : null}

          {status === "error" && error ? (
            <ErrorPanel
              error={error}
              targetUrl={activeUrl}
              onRetry={() => void scan(activeUrl)}
              onReset={handleReset}
            />
          ) : null}

          {status === "success" && result ? (
            <ResultView result={result} meta={meta} onReset={handleReset} />
          ) : null}
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
