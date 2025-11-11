import { useState } from "react";
import { Link } from "react-router-dom";
import NUNSALogo from "@/assets/Ielcom-logo.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Book,
  Scale,
  Users,
  FileText,
  Download,
  Printer,
  Shield,
} from "lucide-react";
import {
  ArrowLeft,
  BookOpen,
  Dumbbell,
  PartyPopper,
  HeartHandshake,
  Megaphone,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

const positions = [
  {
    title: "President",
    icon: Users,
    description:
      "Leads the association, represents students, chairs meetings, and oversees all activities.",
  },
  {
    title: "Vice President",
    icon: Users,
    description: "Assists the President, and acts in President's absence.",
  },
  {
    title: "General Secretary",
    icon: BookOpen,
    description:
      "Records meeting minutes, maintains correspondence, and handles documentation.",
  },
  {
    title: "Financial Secretary",
    icon: Scale,
    description:
      "Manages financial records, assists treasurer, and maintains financial documentation.",
  },
  {
    title: "Treasurer",
    icon: Scale,
    description:
      "Manages association funds, budgets, and financial transactions.",
  },
  {
    title: "Sports Director",
    icon: Dumbbell, // Changed for clarity
    description:
      "Organizes sports activities and represents the association in inter-faculty competitions.",
  },
  {
    title: "Social Director",
    icon: PartyPopper, // Changed for clarity
    description:
      "Plans social events, entertainment programs, and cultural activities.",
  },
  {
    title: "Welfare Director",
    icon: HeartHandshake, // Changed for clarity
    description:
      "Addresses student welfare issues and coordinates support programs.",
  },
  {
    title: "Public Relations Officer",
    icon: Megaphone, // Changed for clarity
    description:
      "Manages public relations, communications, and media relations.",
  },
  {
    title: "Auditor General",
    icon: CheckCircle, // Changed for clarity
    description:
      "Reviews financial records and ensures transparency in financial management.",
  },
  {
    title: "Academic Director",
    icon: GraduationCap, // Changed for clarity
    description:
      "Coordinates academic activities and represents students in academic matters.",
  },
];

function RulesPage() {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // NEW CONTENT: Structured based on NUNSA HUI CONSTITUTION (AS AMENDED, SEPTEMBER 2025)
  const constitutionSections = [
    {
      id: "article-one-general",
      title: "ARTICLE ONE: GENERAL PROVISIONS",
      icon: Book,
      content: `
### MOTTO: SERVICE WITH KNOWLEDGE AND SKILL

### SECTION 1: SUPREMACY
This constitution is supreme and its provision shall have binding force on all members of the Nigerian Universities Nursing Students' Association, Al-Hikmah University, Ilorin, Nigeria. Sovereignty belongs to the members of the Nigerian Universities Nursing Students' Association, Al-Hikmah University, Ilorin, Nigeria, through this constitution derives all its powers and authority.

### SECTION 2: NAME OF THE ASSOCIATION
The association shall be known as the "Nigerian Universities Nursing Students' Association" Al-Hikmah University, Ilorin, Nigeria Chapter, herein referred to as "NUNSA HUI CHAPTER".

### SECTION 3: MOTTO, LOGO AND ADDRESS
* The motto of the association shall be "Service with Knowledge and Skill".
* The logo of the association shall be "THE CIRCLE WITH THE STETHOSCOPE STANDING ON A BOOK".
* Address: Faculty of Nursing Sciences, Al-Hikmah University, Ilorin, Kwara State, Nigeria P.M.B. 1601, Ilorin.

### SECTION 4: AIMS AND OBJECTIVES
The aims and objectives of the association shall be:
1. To foster unity among members of the association.
2. To promote nursing knowledge and training among members.
3. To co-ordinate all activities of the nursing students on campus.
4. To promote interest in the study and application of nursing through symposia, lectures, film-shows, nursing exhibition etc.
5. To maintain high standard of nursing ethics.
6. To establish links with sister nursing associations in other institution in Nigeria and abroad.
7. To establish links with professional nursing organisation and allied professional bodies in Kwara state in particular and Nigeria at large with the view to formulate and cross-fertilize ideas and policies which shall affect welfare of nursing officers and their profession positively.
8. To promote and cater for the welfare of members of NUNSA, Al-Hikmah University, Ilorin.
9. To promote and foster healthy staff/student(s) relationships.
10. To do such other things that are complimentary and / or incidental to the above.

### SECTION 5: MEMBERSHIPS AND DUES.
* Members: Every matriculated student of the Department of Nursing science, Al-Hikmah University, Ilorin, Nigeria.
* There will be an annual due payable to the Association, the amount set by the governing council.

### SECTION 6: INALIENABLE RIGHTS OF MEMBERS
Every member has the right to:
* Freedom from discrimination on grounds of social class, gender, religion, tribe, race, religion, disability, health status, or age.
* Associate with other students or belong to other lawful organizations on campus, subject to university approval.
* Freedom of expression, including freedom to hold opinions and to receive and impart ideas and information concerning the association without hindrance.
* Fair hearing in the determination of civil rights and obligations.
* The association's constitution on demand.
* Vote, provided they are a financial member.
* Be voted for, provided they satisfy specific eligibility criteria (see Article Four, Section 20).
* Freedom from insults and/or abuses during meetings.
* Freedom from forced or compulsory labour (excluding normal civil obligation for the well-being of the association).

### SECTION 7: PATRONS AND STAFF ADVISERS
* There shall be five patrons and one Grand patron appointed by the governing council.
* There shall be a staff adviser appointed by the governing council.
* Functions include: Supervising activities, giving advice, intervening in disputes, and doing other things beneficial to the association.
`,
    },
    {
      id: "article-two-council",
      title: "ARTICLE TWO: GOVERNING COUNCIL OF THE ASSOCIATION",
      icon: Scale,
      content: `
The Governing Council consists of the Executive Council and the Legislative Council.

### SECTION 1: COMPOSITION OF THE EXECUTIVE COUNCIL
The Executive Council is composed of: The President, Vice President, General Secretary, Assistant General Secretary, Financial Secretary, Treasurer, Auditor General, Academic Director I & II, Welfare Director I & II, Sport Director I & II, Social Director I & II, and Public Relation Officer I & II.

### SECTION 2: THE DUTIES OF THE EXECUTIVE COUNCIL
**President:** Chief Executive officer, spokesman, presides over all meetings, coordinates activities, is a signatory to all documents, and appoints committee members (subject to SRC ratification).
**Vice-president:** Assists the president, is in charge of business centres, acts in the President's capacity during a vacancy (for up to four weeks).
**General- Secretary:** Summons meetings (on president's directive), handles correspondence, keeps minutes of meetings, and is the Master of Ceremony.
**Financial Secretary:** Keeps up-to-date financial records, collects money and remits to the Treasurer, renders accounts, is the second signatory (with President and Treasurer), and ensures a mandatory external audit at the end of every session.
**Treasurer:** Keeps records of all funds, receives and keeps all money, assets, and property, pays into the bank within three days, has custody of bank documents, and makes payments only on authorized vouchers.
**Social Director:** Chairman of the social committee, responsible for all social activities and the welfare of members during social gatherings.
**Public Relation Officer:** Publishes activities, liaises with sister bodies, promotes the good image of the association, and liaises with external professional bodies (with president's approval).
**Welfare director:** In charge of the welfare of Executive, SRC, and other students; heads the academic and tutorial committee; and is in charge of visitation (condolence, sickness, etc.).
**Tenure and Removal:** Tenure is one academic session. Vacation of office occurs by resignation, disciplinary committee ruling, or a two-thirds majority vote of no confidence by congressmen.

### SECTION 3: COMPOSITION OF THE LEGISLATIVE COUNCIL (SRC)
The legislative council (SRC) is composed of three members from each level of the departments. Principal officers include the Senate President, Deputy Senate President, Senate Clerk, Chief Whip, Maze Bearer, and Senate Members.

### SECTION 4: THE DUTIES OF THE LEGISLATIVE COUNCIL
* Legislative Power: All legislative power rests in the Senate Council (SC).
* Oversight: Approves the sessional budget, has the power to summon executives to audit financial statements, and can suspend and recommend the removal of a CEC member (by 2/3 majority vote).
* Constitution: Has the power to amend and pass into law the review of any part of this constitution.
`,
    },
    {
      id: "standing-rules",
      title: "STANDING RULES OF THE HOUSE",
      icon: FileText,
      content: `
The Standing Rules of the House regulate the proceedings of the Legislative Council (SRC).

### RULE 1: OFFICIAL LANGUAGE
The official language of the association shall be English.

### RULE 2: MODE OF DRESSING
All members must adhere to the official dress code of the university and association.

### RULE 3: MODE OF ADDRESS
All members of the House shall be addressed by their full names or designated titles.

### RULE 4: COMMITTEE OF THE WHOLE HOUSE
The Committee of the Whole House shall consist of all members of the Legislative Council to consider matters referred to it.

### RULE 5: STANDING COMMITTEES OF THE HOUSE
The House shall have standing committees as deemed necessary to carry out its functions (e.g., Judiciary, Budget and Appropriation).

### RULE 6: QUORUM
Quorum shall be constituted by a simple majority of members present at a meeting.

### RULE 7: POWER OF SUMMONS
The House has the power to summon any member of the Executive Council or the association for questioning or investigation.

### RULE 8: PETITIONS
Any member of the association may present a petition to the House, which shall be addressed and resolved promptly.

### RULE 9: RULES OF DEBATE
Debates shall be guided by rules of decorum, focusing on motions and resolutions rather than personal attacks.

### RULE 10: RAISING POINT OF ORDER
Any member may raise a point of order to draw attention to a breach of the Constitution or Standing Rules.`,
 },
    {
      id: "oath-of-office",
      title: "OATHS AND ADMONITIONS",
      icon: Shield,
      content: `
### OATH OF OFFICE AS PRESIDENT OF NUNSA HUI
I, _______________________________ do solemnly swear/affirm that I will be faithful and bear true allegiance to the Nigerian Universities Nursing Students' Association, AL-Hikmah University Ilorin, that as President of NUNSA HUI, I will discharge my duties in accordance with the constitution of the Nigerian Universities Nursing Students' Association, Al-hikmah University and the law, and always in the interest of sovereignty, integrity, solidarity, well-being and prosperity of NUNSA HUI, and I will not allow personal interest to influence my official decisions, that I will do the best of my ability to preserve, protect and defend the constitution of NUNSA HUI, that I will do to all members without fear or favour, affection or ill will, that I will not directly or indirectly communicate or reveal to any person any matter brought under my consideration or shall become known to me as president of NUNSA HUI, except as may be required for the due discharge of my duties as president, and that I will devote myself to the service and well-being of the member of NUNSA HUI. So, help me God.

### OATH OF OFFICE AS OFFICER OF NUNSA OR COMMITTEE MEMBER
I, _______________________________ do solemnly swear/affirm that I will be faithful and bear true allegiance to the Nigerian Universities Nursing Students' Association, AL-Hikmah University Ilorin, that as _________________________________of NUNSA HUI, I will discharge my duties in accordance with the constitution of the Nigerian Universities Nursing Students' Association, Al-hikmah University and the law, and always in the interest of sovereignty, integrity, solidarity, well-being and prosperity of NUNSA HUI, and I will not allow personal interest to influence my official decisions, that I will do the best of my ability to preserve, protect and defend the constitution of NUNSA HUI, that I will do to all members without fear or favour, affection or ill will, that I will not directly or indirectly communicate or reveal to any person any matter brought under my consideration or shall become known to me as member except as may be required for the due discharge of my duties as member and that of NUNSA HUI. So, help me God.
`,
    },
  ];
  // END OF NEW CONTENT

  const handlePrint = () => {
    // The media query in the <style> block handles the print formatting.
    window.print();
  };

  const handleDownload = () => {
    // Open the PDF in a new tab for download
    window.open('/NUNSA HUI CONSTITUTION (AS AMENDED, SEPTEMBER 2025).docx', '_blank');
  };

  return (
    <>
     
      {/* FIX 3: Added missing closing tag for div on L214 */}
      {/* Second Content Block: Full Constitution, Header, Footer */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-inter">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 print:hidden">
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
                      Al-Hikmah University Chapter
                    </p>
                  </div>
                </a>
              </div>

              <nav className="flex items-center space-x-6">
                <a
                  href="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0f7cff] transition-colors"
                >
                  Home
                </a>
                <a
                  href="/results"
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0f7cff] transition-colors"
                >
                  Results
                </a>
                <a
                  href="/support"
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0f7cff] transition-colors"
                >
                  Support
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16 print:mb-8">
            <div className="flex justify-center mb-6 print:hidden">
              <div className="w-20 h-20 bg-[#0f7cff] rounded-3xl flex items-center justify-center">
                <Scale className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
              NUNSA HUI Constitution (AS AMENDED, SEPTEMBER 2025)
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed print:text-base print:text-black">
              The complete Constitution governing all affairs of the Independent
              Electoral Committee, Nigerian Universities Nursing Students’
              Association (NUNSA)
            </p>
            
            <Badge variant="outline" className="mt-2">
              Faculty of Nursing Sciences, Al-Hikmah University Chapter.
            </Badge>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-[#0f7cff] hover:bg-[#0d6edb] text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
              >
                <Printer className="h-5 w-5" />
                <span>Print Constitution</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 border-2 border-[#0f7cff] text-[#0f7cff] hover:bg-[#0f7cff] hover:text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Download Full Document</span>
              </button>
            </div>
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
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <position.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {position.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {position.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Constitution Sections */}
          <div className="max-w-5xl mx-auto">
            <div className="space-y-4">
              {constitutionSections.map((section) => {
                const IconComponent = section.icon;
                const isOpen = openSections[section.id];

                return (
                  <div
                    key={section.id}
                    className="constitution-section bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-8 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors print:hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#0f7cff] rounded-2xl flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            {section.title}
                          </h2>
                        </div>
                        <div className="flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="h-6 w-6 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Render content when open on screen or always in print view */}
                    {(isOpen || window.matchMedia("print").matches) && (
                      <div className="px-8 pb-8 pt-0 print:p-0 print:py-4">
                        <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 print:prose-sm print:max-w-none print:text-black">
                          <div className="whitespace-pre-line leading-relaxed">
                            {/* Ensure the title is always visible at the start of the content in print view */}
                            <h2 className="hidden print:block print:text-2xl print:font-bold print:text-gray-900 print:mt-4 print:mb-2">
                              {section.title}
                            </h2>
                            {section.content}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Important Notice (Hidden in print) */}
          <div className="max-w-5xl mx-auto mt-16 print:hidden">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-3xl p-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Important Notice
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p>
                      This constitution is the supreme governing document for
                      all members and activities within the Nigerian
                      Universities Nursing Students’ Association (NUNSA),
                      Al-Hikmah University Chapter. All members are bound by its
                      provisions.
                    </p>
                    <p>
                      <strong>Last Amended:</strong> September 2025
                      <br />
                      <strong>Effective Date:</strong> Academic Year 2025/2026
                      <br />
                      <strong>Next Review:</strong> Academic Year 2026/2027
                    </p>
                    <p>
                      For questions about constitutional interpretation or
                      amendments, please refer to the Legislative Council (SRC).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation (Hidden in print) */}
          <div className="max-w-5xl mx-auto mt-16 print:hidden">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Quick Navigation
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <a
                  href="/"
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-[#0f7cff] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">H</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Homepage
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Return to main page
                    </p>
                  </div>
                </a>

                <a
                  href="/results"
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Live Results
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View election results
                    </p>
                  </div>
                </a>

                <a
                  href="/support"
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">?</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Support
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get help and support
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Footer (Hidden in print) */}
        <footer className="bg-gray-900 text-white py-12 mt-16 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex justify-center items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#0f7cff] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <span className="text-xl font-bold">NUNSA HUI</span>
              </div>

              <p className="text-gray-400 mb-6">
                Nigerian Universities Nursing Students’ Association, Al-Hikmah
                University
              </p>

              <div className="flex justify-center space-x-8">
                <a
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </a>
                <a
                  href="/support"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Support
                </a>
                <a
                  href="/live"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Results
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Global Print Styles (FIXED: Changed from <style jsx global> to standard <style>) */}
        <style>{`
        @media print {
          /* Hide all navigational elements */
          header, footer, .print\\:hidden, button {
            display: none !important;
          }
          
          /* Ensure sections don't break across pages where possible */
          .constitution-section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-top: 1.5rem;
            border: 1px solid #ccc;
            padding: 1rem;
          }
          
          /* Reset page background and text color for printing */
          body {
            background: white !important;
            color: black !important;
            padding: 0;
            margin: 0;
          }
          
          /* Force content to display for printing */
          .px-8.pb-8 {
            display: block !important;
            padding: 0 0.5rem 0.5rem 0.5rem; /* Adjust padding for better print margin */
          }
          
          /* General print styles for text */
          .prose.prose-lg {
            font-size: 10pt;
            line-height: 1.5;
          }

          h1.text-4xl.md\\:text-6xl {
            font-size: 18pt !important;
          }
          
          h2.text-xl.md\\:text-2xl {
            font-size: 14pt !important;
          }
        }
      `}</style>
      </div>
    </> // Final Fragment closing tag
  ); // FIX: Added missing closing parenthesis for the return statement
}

export default RulesPage;
