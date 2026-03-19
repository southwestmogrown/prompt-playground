import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Prompt Playground
        </h1>
        <p className="text-lg text-gray-600">
          Run any prompt against multiple AI models simultaneously. Compare
          responses side by side, score them, and save runs for later review.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/playground?demo=true"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Demo
          </Link>
          <Link
            href="/signup"
            className="border border-gray-300 text-gray-700 bg-white px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
