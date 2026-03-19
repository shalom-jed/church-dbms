
function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Church Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome! Frontend is running successfully.
          </p>
          <div className="card max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">✅ Setup Complete</h2>
            <ul className="text-left space-y-2">
              <li>✅ React + TypeScript</li>
              <li>✅ Vite</li>
              <li>✅ Tailwind CSS</li>
              <li>✅ Environment variables</li>
            </ul>
            <p className="mt-6 text-sm text-gray-500">
              Backend API: {import.meta.env.VITE_API_URL}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App