import Link from "next/link";

export function EmptyState({
  message = "No concerts logged yet. Add your first concert to start seeing your dashboard.",
}: {
  message?: string;
}) {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body items-center text-center gap-4 py-12">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
          <span className="text-primary font-bold text-xl">CC</span>
        </div>
        <h2 className="card-title text-xl">Ready when you are</h2>
        <p className="max-w-md opacity-80">{message}</p>
        <Link href="/add" className="btn btn-primary">
          Add your first concert
        </Link>
      </div>
    </div>
  );
}
