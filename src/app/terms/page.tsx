export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
            Terms of Service
          </h1>
          
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 shadow-lg backdrop-blur-sm">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Last updated:</strong> August 24, 2025
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              By accessing and using BrainPod, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Use License
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Permission is granted to temporarily access BrainPod for personal, 
              non-commercial educational use only. This is the grant of a license, 
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the platform</li>
              <li>remove any copyright or other proprietary notations</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Educational Purpose
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              BrainPod is designed for educational purposes. While we strive for accuracy 
              and effectiveness in our adaptive learning algorithms, we cannot guarantee 
              specific learning outcomes. Progress depends on individual effort, engagement, 
              and learning style.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Account Responsibility
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You are responsible for safeguarding your account and for any activities 
              that occur under your account. For children under 13, parents or guardians 
              are responsible for account oversight and compliance with these terms.
            </p>
            
            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                For questions about these Terms of Service, please contact us at legal@brainpod.org
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
