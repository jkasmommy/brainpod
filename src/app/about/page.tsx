export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8 text-center">
            About BrainPod
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                BrainPod believes that every learner deserves education that adapts to their unique pace, 
                style, and needs. We combine rigorous standards-aligned curriculum with mindful breaks 
                to create learning experiences that nurture both academic growth and emotional well-being.
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Adaptive Learning
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our platform uses intelligent algorithms to assess each learner&apos;s current level and 
                continuously adapts the difficulty, pacing, and content presentation to optimize 
                learning outcomes. Whether you&apos;re in kindergarten or 11th grade, BrainPod meets you 
                where you are.
              </p>
            </div>
            
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-lg backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Key Features
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  NGSS Standards Alignment
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Adaptive Difficulty Adjustment
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Mindful Learning Breaks
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Real-time Progress Tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  Multi-subject Support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  K-12 Coverage
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
