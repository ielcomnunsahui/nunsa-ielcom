import { Mail, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Contact = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Need Help?</span>
            </h2>
            <p className="text-muted-foreground">
              Contact the Independent Electoral Committee
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-elevated text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <a
                href="mailto:ielcomnunsahui@gmail.com"
                className="text-sm text-primary hover:underline"
              >
                ielcomnunsahui@gmail.com
              </a>
            </div>

            <div className="card-elevated text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">WhatsApp Café</h3>
              <a
                href="https://wa.me/2347025021022"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary hover:underline"
              >
                +234 702 502 1022
              </a>
            </div>

            <div className="card-elevated text-center">
              <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-info" />
              </div>
              <h3 className="font-semibold mb-2">Electoral Rules</h3>
              <Link to="/Rules" className="w-full">
              <Button variant="link" className="text-sm p-0 h-auto">
                View Constitution
              </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border">
            <h4 className="font-semibold mb-2">Support Instructions</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Email is the primary contact method for official inquiries</li>
              <li>• Go straight to the point when contacting support</li>
              <li>• WhatsApp café is available for urgent document-related assistance</li>
              <li>• Response time: 24-48 hours for email, immediate for critical issues</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
