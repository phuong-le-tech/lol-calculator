export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gold-400">
          LoL Damage Simulator
        </h1>
        <p className="mt-2 text-lg text-dark-100">
          Calculate champion damage output in real time
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-dark-200 bg-dark-500 p-6 text-center">
          <div className="text-2xl font-bold text-gold-300">All</div>
          <div className="mt-1 text-sm text-dark-100">Champions</div>
        </div>
        <div className="rounded-lg border border-dark-200 bg-dark-500 p-6 text-center">
          <div className="text-2xl font-bold text-blue-200">Real-time</div>
          <div className="mt-1 text-sm text-dark-100">Calculations</div>
        </div>
        <div className="rounded-lg border border-dark-200 bg-dark-500 p-6 text-center">
          <div className="text-2xl font-bold text-red-400">DPS</div>
          <div className="mt-1 text-sm text-dark-100">Breakdowns</div>
        </div>
      </div>
      <p className="text-sm text-dark-100">
        Simulator coming soon — engine is ready!
      </p>
    </main>
  );
}
