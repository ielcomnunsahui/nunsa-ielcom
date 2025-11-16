import { 
  Mail, 
  MessageCircle, 
  Clock, 
  MapPin, 
  Phone, 
  HelpCircle, 
  Book, 
  Users,
  FileText, 
  AlertCircle 
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/footerr";

import { Contact } from "@/components/Contact";

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
      icon: FileText,
      title: 'Elecoral Rules',
      description: 'Check the Electoral Guidelines',
      contact: 'View NUNSA Constitution',
      href: '/rules',
      color: 'bg-indigo-500'
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
      answer: 'Click on "Register to Vote" on the homepage during the registration period. Complete the form with your genuine information, verify your email, and set up biometric authentication.'
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
      answer: 'During the aspirant application period, visit the "Aspirants" section, create an account, and complete the application process including document uploads and payment.'
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
      description: 'View the Electoral Rules and Constitution',
      href: '/rules'
    },
    {
      icon: Users,
      title: 'Voter Registration',
      description: 'Register to vote in the 2025 election',
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
       <Navbar />

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

        

        {/* Emergency Contact */}
        <div>
              <Contact />
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
      </main>

      {/* Footer */}
      < Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .font-inter { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>
    </div>
  );
}

export default SupportPage;


