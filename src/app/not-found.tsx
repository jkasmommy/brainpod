import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-orange-900">
      <div className="container mx-auto px-6 py-16 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="text-8xl mb-4">🤔</div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-4">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Looks like this page took a mindful break and wandered off. 
              Let&apos;s get you back to learning!
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Return Home
            </Link>
            <div className="text-center">
              <Link 
                href="/kinder-demo"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 rounded-sm"
              >
                Try the Kinder Demo instead
              </Link>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 Take a deep breath and remember: every mistake is a learning opportunity!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
