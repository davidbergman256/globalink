import { Mail } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-8">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-purple-600" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              Contact Us
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Get in touch with the globalink team
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Support & Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Have questions about globalink or need help with your account? We&apos;re here to help!
              </p>
              <a
                href="mailto:globalink.supp@gmail.com"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Mail className="w-5 h-5 mr-2" />
                globalink.supp@gmail.com
              </a>
            </div>

            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Join Our Community
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Connect with other globalink users and stay updated with the latest news.
              </p>
              <a
                href="https://discord.gg/mX57EEm3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Join Discord Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 