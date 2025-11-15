import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Timetable Generator
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create optimized academic schedules with TQI scoring
          </p>
          
          <div className="space-y-4 mb-12">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Intelligent Scheduling</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">TQI Quality Metrics</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">Conflict-Free Schedules</span>
            </div>
          </div>

          <Link 
            href="/generate-timetable"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started →
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Fast</div>
            <p className="text-gray-600">Generate schedules in seconds</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Smart</div>
            <p className="text-gray-600">AI-powered optimization</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Flexible</div>
            <p className="text-gray-600">Customizable constraints</p>
          </div>
        </div>
      </div>
    </main>
  );
}