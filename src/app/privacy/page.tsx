export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-blue-600 mb-8">
            Privacy Policy
          </h1>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-lg backdrop-blur-sm">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Last updated:</strong> August 24, 2025
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Our Commitment to Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              BrainPod is committed to protecting the privacy and security of our users, 
              especially children. This Privacy Policy explains how we collect, use, and 
              protect information when you use our adaptive learning platform.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Information We Collect
            </h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Learning progress and performance data</li>
              <li>Adaptive assessment responses</li>
              <li>Platform usage analytics</li>
              <li>Account information (with parental consent for children under 13)</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              How We Use Information
            </h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Personalizing learning experiences</li>
              <li>Tracking academic progress</li>
              <li>Improving our adaptive algorithms</li>
              <li>Providing support and assistance</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              COPPA Compliance
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We comply with the Children&apos;s Online Privacy Protection Act (COPPA) and obtain 
              verifiable parental consent before collecting personal information from children under 13.
            </p>
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For questions about this Privacy Policy, please contact us at privacy@brainpod.org
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
