export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-purple-950 text-white">
      <div className="text-center p-10">
        <h1 className="text-5xl font-extrabold">
          Digital Menu System
        </h1>

        <p className="text-xl mt-4 opacity-80">
          Build your restaurant's online menu & order system.
        </p>

        <a
          href="/admin/login"
          className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg"
        >
          Go to Admin Login
        </a>
      </div>
    </main>
  );
}
