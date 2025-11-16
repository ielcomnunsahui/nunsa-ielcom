import { AlertCircle, Mail, Phone, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Contact = () => {
  return (
    <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl p-8">
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

          <div className="flex items-start ">
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mx-2">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                     IELCOM Chairman
                    </h3>
              <a
                href="https://wa.me/2347040640646"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary hover:underline"
              >
                +234 704 064 0646
              </a>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mx-2">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                     IELCOM Electoral Organizer
                    </h3>
              <a
                href="https://wa.me/2349123502971"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary hover:underline"
              >
                +234 70 912 350 2971
              </a>
              </div>
            </div>
            
         
          </div>
        </div>
        <section>
          <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
            <h4 className="font-semibold mb-2">Support Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Email is the primary contact method for official inquiries</li>
              <li>• Go straight to the point when contacting support</li>
              <li>• WhatsApp café is available for urgent document-related assistance</li>
              <li>• Response time: 24-48 hours for email, immediate for critical issues</li>
            </ul>
          </div>
        </section>

    </section>
  );
};
