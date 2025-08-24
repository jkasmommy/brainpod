export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-16 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              BrainPod
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          {/* Main Tagline */}
          <h2 className="text-2xl md:text-3xl font-light text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Adaptive learning for every mind
          </h2>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Blending standards-aligned curriculum with mindful breaks to create 
            personalized learning experiences that adapt to how your brain works best.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Start Learning
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-full hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">
              Learn More
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Adaptive</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learns your pace and style</p>
            </div>
            
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Aligned</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Standards-based curriculum</p>
            </div>
            
            <div className="p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🧘</span>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Mindful</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Built-in wellness breaks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
