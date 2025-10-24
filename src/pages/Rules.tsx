import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Users, Scale, AlertTriangle, UserX, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const positions = [
  {
    title: "President",
    icon: Users,
    description: "Leads the association, represents students, chairs meetings, and oversees all activities."
  },
  {
    title: "Vice President", 
    icon: Users,
    description: "Assists the President, and acts in President's absence."
  },
  {
    title: "General Secretary",
    icon: BookOpen,
    description: "Records meeting minutes, maintains correspondence, and handles documentation."
  },
  {
    title: "Financial Secretary",
    icon: Scale,
    description: "Manages financial records, assists treasurer, and maintains financial documentation."
  },
  {
    title: "Treasurer",
    icon: Scale,
    description: "Manages association funds, budgets, and financial transactions."
  },
  {
    title: "Sports Director",
    icon: Users,
    description: "Organizes sports activities and represents the association in inter-faculty competitions."
  },
  {
    title: "Social Director",
    icon: Users,
    description: "Plans social events, entertainment programs, and cultural activities."
  },
  {
    title: "Welfare Director", 
    icon: Users,
    description: "Addresses student welfare issues and coordinates support programs."
  },
  {
    title: "Public Relations Officer",
    icon: Users,
    description: "Manages public relations, communications, and media relations."
  },
  {
    title: "Auditor General",
    icon: Scale,
    description: "Reviews financial records and ensures transparency in financial management."
  },
  {
    title: "Academic Director",
    icon: BookOpen,
    description: "Coordinates academic activities and represents students in academic matters."
  }
];

export default function Rules() {
  
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Electoral Rules & Constitution</h1>
          <p className="text-muted-foreground mt-2">
            NUNSA Electoral Constitution 2025/2026 - Sections VIII-XV
          </p>
          <Badge variant="outline" className="mt-2">College of Health Sciences</Badge>
        </div>

        {/* Leadership Roles Section */}
        <Card className="election-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Leadership Positions & Roles
            </CardTitle>
            <CardDescription>
              Understanding the responsibilities of each position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positions.map((position, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <position.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{position.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{position.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Constitutional Sections */}
        <div className="space-y-6">
          {/* Section VIII - Qualifications */}
          <Card className="election-card">
            <Collapsible open={openSections.includes('qualifications')} onOpenChange={() => toggleSection('qualifications')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Section VIII - Qualifications for Office
                    </div>
                    <Button variant="ghost" size="sm">
                      {openSections.includes('qualifications') ? 'Collapse' : 'Expand'}
                    </Button>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-semibold">General Requirements:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Must be a bona-fide student of the College of Health Sciences</li>
                      <li>• Must have completed at least one academic session in the college</li>
                      <li>• Must not have any record of academic malpractice or misconduct</li>
                      <li>• Must be financially up-to-date (current session fees paid)</li>
                      <li>• Must meet minimum CGPA requirements for specific positions</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Position-Specific Requirements:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Executive Positions:</strong>
                        <ul className="space-y-1 ml-4">
                          <li>• President: CGPA ≥ 4.00</li>
                          <li>• Vice President: CGPA ≥ 3.50</li>
                          <li>• General Secretary: CGPA ≥ 3.50</li>
                          <li>• Treasurer: CGPA ≥ 3.50</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Other Positions:</strong>
                        <ul className="space-y-1 ml-4">
                          <li>• Directors: CGPA ≥ 3.50</li>
                          <li>• Assistant Positions: CGPA ≥ 3.00</li>
                          <li>• Academic Directors: CGPA ≥ 4.00</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Section IX - Voting */}
          <Card className="election-card">
            <Collapsible open={openSections.includes('voting')} onOpenChange={() => toggleSection('voting')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Scale className="w-5 h-5 mr-2" />
                      Section IX - Voting Procedures
                    </div>
                    <Button variant="ghost" size="sm">
                      {openSections.includes('voting') ? 'Collapse' : 'Expand'}
                    </Button>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-semibold">Voting Rights:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• All registered students of the Faculty are eligible to vote</li>
                      <li>• Voters must be registered on the electoral database</li>
                      <li>• Each student gets one vote per position</li>
                      <li>• Voting is by secret ballot (electronic)</li>
                      <li>• No proxy voting allowed</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Voting Process:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Voting shall be conducted electronically via the NUNSA Electoral System</li>
                      <li>• Voters must authenticate using matriculation number and biometric verification</li>
                      <li>• Voting period: 12 hours (9:00 AM - 9:00 PM)</li>
                      <li>• Real-time results monitoring available to all</li>
                      <li>• Final results declared immediately after voting closes</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Vote Counting:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Simple majority system applies</li>
                      <li>• In case of tie, re-election between tied candidates</li>
                      <li>• Results are automatically verified and cannot be manually altered</li>
                    </ul>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Section X - Campaigns */}
          <Card className="election-card">
            <Collapsible open={openSections.includes('campaigns')} onOpenChange={() => toggleSection('campaigns')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Section X - Campaign Guidelines
                    </div>
                    <Button variant="ghost" size="sm">
                      {openSections.includes('campaigns') ? 'Collapse' : 'Expand'}
                    </Button>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-semibold">Campaign Period:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Campaign period Ends: A day before election</li>
                      <li>• Manifesto Day: Designated day for public presentation</li>
                      <li>• No campaigning on election day</li>
                      <li>• Silent period: 24 hours before voting begins</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Permitted Activities:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Public speeches and presentations</li>
                      <li>• Distribution of manifestos and flyers</li>
                      <li>• Social media campaigns (within guidelines)</li>
                      <li>• Peaceful rallies and meetings</li>
                      <li>• Debates and candidate forums</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Prohibited Activities:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Vote buying or financial inducements</li>
                      <li>• Defamatory statements against opponents</li>
                      <li>• Use of violence or intimidation</li>
                      <li>• Campaigning in exam halls or during lectures</li>
                      <li>• Destruction of opponents' campaign materials</li>
                    </ul>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Section XI - Disqualification */}
          <Card className="election-card">
            <Collapsible open={openSections.includes('disqualification')} onOpenChange={() => toggleSection('disqualification')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Section XI - Disqualification
                    </div>
                    <Button variant="ghost" size="sm">
                      {openSections.includes('disqualification') ? 'Collapse' : 'Expand'}
                    </Button>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-semibold">Grounds for Disqualification:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Failure to meet eligibility requirements</li>
                      <li>• Academic malpractice or misconduct</li>
                      <li>• Non-payment of Application fees</li>
                      <li>• Submission of false information</li>
                      <li>• Violation of campaign guidelines</li>
                      <li>• Criminal conviction during candidacy</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Disqualification Process:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Written complaint must be filed with evidence</li>
                      <li>• Candidate given 48 hours to respond</li>
                      <li>• Decision made by Electoral Committee</li>
                      <li>• Appeal can be made to Electoral Committee</li>
                      <li>• Final decision within 24 hours of appeal</li>
                    </ul>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Section XII - Withdrawal */}
          <Card className="election-card">
            <Collapsible open={openSections.includes('withdrawal')} onOpenChange={() => toggleSection('withdrawal')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <LogOut className="w-5 h-5 mr-2" />
                      Section XII - Withdrawal Process
                    </div>
                    <Button variant="ghost" size="sm">
                      {openSections.includes('withdrawal') ? 'Collapse' : 'Expand'}
                    </Button>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <h4 className="font-semibold">Voluntary Withdrawal:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Candidate may withdraw at any time before voting begins</li>
                      <li>• Must submit written notice to Electoral Committee</li>
                      <li>• Withdrawal is final and irrevocable</li>
                      <li>• Nomination fees are non-refundable</li>
                      <li>• Public announcement of withdrawal</li>
                    </ul>

                    <h4 className="font-semibold mt-6">Effects of Withdrawal:</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Name removed from ballot immediately</li>
                      <li>• Campaign materials must be removed</li>
                      <li>• Cannot re-enter the same election cycle</li>
                      <li>• Eligible for future elections if qualified</li>
                    </ul>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="election-card mt-8">
          <CardHeader>
            <CardTitle>Need Clarification?</CardTitle>
            <CardDescription>
              Contact the Electoral Committee for any questions about the rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {"ielcomnunsahui@gmail.com"}</p>
              <p><strong>Phone:</strong> {"+234 704 064 0646"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}