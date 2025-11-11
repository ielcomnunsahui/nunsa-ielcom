import { 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Phone, 
  HelpCircle, 
  Book, 
  Users, 
  AlertCircle 
} from 'lucide-react';
import NUNSALogo from "@/assets/Ielcom-logo.png";

function SupportPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'ielcomnunsahui@gmail.com',
      href: 'mailto:ielcomnunsahui@gmail.com',
      color: 'bg-blue-500'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      description: 'Chat with us for quick assistance',
      contact: '+234 704 064 0646',
      href: 'https://wa.me/2347040640646',
      color: 'bg-green-500'
    },
    {
      icon: MapPin,
      title: 'For Printing',
      description: 'Visit NUNSA Cafe during office hours',
      contact: 'Sen Kasim Shettima, NUNSA Complex Building',
      href: '#',
      color: 'bg-purple-500'
    }
  ];

  const faqs = [
    {
      question: 'How do I register to vote?',
      answer: 'Click on "Register to Vote" on the homepage during the registration period. Complete the multi-step form with your personal information, verify your email, and set up biometric authentication.'
    },
    {
      question: 'What if I forgot my login credentials?',
      answer: 'You can use the "Forgot Password" option on the login page, or contact support for assistance in recovering your account.'
    },
    {
      question: 'Can I change my vote after submitting?',
      answer: 'No, votes are final once submitted for security and integrity reasons. Please review your choices carefully before confirming.'
    },
    {
      question: 'How do I apply to be an aspirant?',
      answer: 'During the aspirant application period, visit the "Aspirants" section, create an account, and complete the 8-step application process including document uploads and payment.'
    },
    {
      question: 'When will the results be announced?',
      answer: 'Results are available in real-time on the "Live Results" page during voting. Final results will be declared by authorized officials after the voting period ends.'
    },
    {
      question: 'Is my vote secure and private?',
      answer: 'Yes, we use advanced security measures including encryption, audit trails, and biometric authentication to ensure vote security and privacy.'
    }
  ];

  const QuickNavigation = [
    {
      icon: Book,
      title: 'Electoral Rules',
      description: 'Read the complete NUNSA constitution and voting guidelines',
      href: '/rules'
    },
    {
      icon: Users,
      title: 'Voter Registration',
      description: 'Register ahead of the 2025 election',
      href: '/register'
    },
    {
      icon: HelpCircle,
      title: 'Aspirant Application',
      description: 'Apply for a leadership position in NUNSA',
      href: '/aspirants'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-inter">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                 <img 
                    src={NUNSALogo}
                    alt="NUNSA Logo Placeholder" 
                    className="w-auto h-16 sm:h-20 lg:h-30 object-contain rounded-full" 
                    />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    NUNSA IELCOM
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Al-Hikmah University, Ilorin.
                  </p>
                </div>
              </a>
            </div>

            <nav className="flex items-center space-x-6">
              <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-[#0f7cff] transition-colors">
                Home
              </a>
              <a href="/results" className="text-gray-600 dark:text-gray-300 hover:text-[#0f7cff] transition-colors">
                Results
              </a>
              <a href="/rules" className="text-gray-600 dark:text-gray-300 hover:text-[#0f7cff] transition-colors">
                Rules
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#0f7cff] rounded-3xl flex items-center justify-center">
              <HelpCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Need help with the IELCOM Electoral System? We're here to assist you with 
            any questions or issues you may have.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Get In Touch
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <a
                  key={index}
                  href={method.href}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transform transition-all duration-200 block"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 ${method.color} rounded-2xl flex items-center justify-center`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {method.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {method.description}
                  </p>
                  <p className="text-[#0f7cff] font-semibold">
                    {method.contact}
                  </p>
                </a>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <summary className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl transition-colors">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Help Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Quick Navigation
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {QuickNavigation.map((resource, index) => {
              const IconComponent = resource.icon;
              return (
                <a
                  key={index}
                  href={resource.href}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transform transition-all duration-200 block group"
                >
                  <div className="w-12 h-12 bg-[#0f7cff] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#0d6edb] transition-colors">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {resource.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Contact us for Support
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                For urgent technical issues during voting periods or critical system problems, 
                contact our emergency support line:
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="tel:+2347040640646"
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
                >
                  <Phone className="h-5 w-5" />
                  <span>+234 704 064 0646</span>
                </a>
                <a
                  href="https://wa.me/2347040640646"
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                    src={NUNSALogo}
                    alt="NUNSA Logo Placeholder" 
                    className="w-auto h-16 sm:h-20 lg:h-30 object-contain rounded-full" 
                    />
              </div>
              <span className="text-xl font-bold">IELCOM Electoral System</span>
            </div>
            
            <p className="text-gray-400 mb-6">
              Faculty of Nursing Sciences, Al-Hikmah University, Ilorin
            </p>
            
            <div className="flex justify-center space-x-8">
              <a href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </a>
              <a href="/rules" className="text-gray-400 hover:text-white transition-colors">
                Rules
              </a>
              <a href="/results" className="text-gray-400 hover:text-white transition-colors">
                Results
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>
    </div>
  );
}

export default SupportPage;


