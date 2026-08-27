export const profile = {
  eyebrow: "Seoul, South Korea",
  name: "Minho Lee",
  title: "Senior Professional · Samsung Electronics",
  summary: [
    "HR professional with 9+ years of experience at Samsung Research, with a background spanning Talent Acquisition and Global HR.",
    "In Talent Acquisition, I have supported the hiring and development of highly specialized engineering talent, including software developers and AI researchers. I have also led initiatives to improve talent sourcing and recruitment processes by combining HR expertise with technology and data.",
    "In Global HR, I have supported overseas research organizations across multiple countries, covering a broad range of HR topics including workforce management, HR policy, organizational operations, and cross-border integration. My experience also includes large-scale HR transformation projects such as Workday migration, M&A due diligence, and agent design.",
  ],
  email: "minonminho@gmail.com",
  location: "Seongchon-gil 56, Seocho-gu, Seoul 06765",
};

export const nav = {
  about: "About",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  getInTouch: "Get in touch",
};

export const sectionTitles = {
  about: "Professional Summary",
  skills: "Core Skills",
  workHistory: "Work History",
  projectExperience: "Project Experience",
  education: "Education",
};

export type SkillGroup = {
  label: string;
  items: readonly string[];
};

export const skillGroups: readonly SkillGroup[] = [
  {
    label: "HR Expertise",
    items: [
      "Global HR",
      "Talent Acquisition",
      "Talent Intelligence",
      "HR Operations",
      "Workforce Management",
      "HR Policy",
      "Employee Relations",
      "M&A Integration",
    ],
  },
  {
    label: "AI Transformation (AX)",
    items: [
      "AI Agents",
      "LLM Applications",
      "HR Automation",
      "HR Digital Transformation",
      "HR Analytics",
      "Vibe Coding",
    ],
  },
  {
    label: "Tools & Technology",
    items: [
      "Python",
      "SQL",
      "JavaScript",
      "TypeScript",
      "Next.js",
      "PostgreSQL",
      "VBA",
      "Tableau",
      "Power BI",
      "Workday",
    ],
  },
];

export type JobBullet = {
  heading: string;
  description: string;
};

export type Job = {
  period: string;
  title: string;
  company: string;
  badge?: string;
  bullets: readonly JobBullet[];
};

export const jobs: readonly Job[] = [
  {
    period: "03.2025 – Present",
    title: "Senior Professional (Global HR)",
    company: "Samsung Research, Samsung Electronics",
    badge: "Fast-Track Promotion (March 2025)",
    bullets: [
      {
        heading: "Global HR Planning & Strategy",
        description:
          "Lead global HR planning and strategy across 15+ overseas research subsidiaries, aligning local HR operations with company goals.",
      },
      {
        heading: "AX (AI Transformation) T/F",
        description:
          "Lead the AX (AI Transformation) Task Force to rebuild global workforce management systems with LLMs, improving productivity and data-driven operations.",
      },
      {
        heading: "M&A-related HR Activities",
        description:
          "Handle HR due diligence and post-merger integration (PMI) for M&A deals, and join quarterly board meetings to work directly with global executives.",
      },
      {
        heading: "Talent Development Program to Jakarta",
        description:
          "Run a talent development program for the Jakarta site to build local leadership capability.",
      },
      {
        heading: "HR Process Audit & Agentization",
        description:
          "Built an automated HR audit checklist (agent-based) covering all HR areas to standardize and monitor HR operations.",
      },
    ],
  },
  {
    period: "12.2022 – 02.2025",
    title: "Professional (Global HR)",
    company: "Samsung Research, Samsung Electronics",
    bullets: [
      {
        heading: "Global HR Policy",
        description:
          "Set up and run global HR policies across overseas subsidiaries, keeping them compliant with local labor laws.",
      },
      {
        heading: "Evaluation & Promotion",
        description:
          "Operate the company's Mercer-based job evaluation, performance review, and promotion processes.",
      },
      {
        heading: "HRIS Integration",
        description:
          "Lead HRIS integration projects to consolidate people data and support HR digital transformation.",
      },
      {
        heading: "Employee Relations & Workplace Harassment",
        description:
          "Manage employee relations cases including workplace harassment investigations, and partner with Legal on high-risk issues.",
      },
    ],
  },
  {
    period: "12.2018 – 11.2022",
    title: "Professional (Talent Acquisition)",
    company: "Samsung Research, Samsung Electronics",
    bullets: [
      {
        heading: "SOTA Domain Tech Recruiting",
        description:
          "Manage end-to-end recruiting for state-of-the-art tech roles, using targeted outreach to build a steady pipeline of top engineering talent (US Top 10, Global Top 100, IITs, etc.).",
      },
      {
        heading: "Executive & Strategic Hiring",
        description:
          "Run executive and strategic hiring, including headhunting for leadership and niche experts.",
      },
      {
        heading: "Academic Collaboration (Sabbatical & Visiting Scholars)",
        description:
          "Lead campus and academic recruiting for Sabbatical/Visiting Scholars and advisory professors, and run the Samsung SW Membership program targeting IOI/ACM-ICPC talent.",
      },
      {
        heading: "Employer Branding & Candidate Experience (CX)",
        description:
          "Build employer branding and improve candidate experience (CX) to strengthen the talent brand.",
      },
    ],
  },
  {
    period: "05.2018 – 11.2018",
    title: "Professional (Global HR)",
    company: "Samsung Research, Samsung Electronics",
    bullets: [
      {
        heading: "KPI Systems & HR Analytics",
        description:
          "Set up KPI frameworks and HR analytics with VBA-based Excel automation to track organization health and support executive decisions.",
      },
      {
        heading: "Global AI Center Operations",
        description:
          "Support Global AI Center operations, streamlining HR processes for the research organization; early adopter of the company's on-premise LLMs for HR work.",
      },
    ],
  },
  {
    period: "07.2017 – 04.2018",
    title: "Trainee & Recruiting T/F",
    company: "Samsung Research, Samsung Electronics",
    bullets: [
      {
        heading: "Recruiting KPIs & Interview Operations",
        description:
          "Manage recruiting KPIs and interview operations for an efficient, data-driven selection process.",
      },
      {
        heading: "Candidate Experience",
        description:
          "Improve candidate journey touchpoints based on feedback.",
      },
      {
        heading: "Samsung Shared Value Program",
        description:
          "Complete the Samsung Shared Value Program and build a foundation in the company's HR systems and culture.",
      },
      {
        heading: "Onboarding & Job Training",
        description:
          "Support new-hire onboarding and training, building rapport with incoming employees.",
      },
    ],
  },
];

export type Project = {
  period: string;
  title: string;
  paragraphs: readonly string[];
};

export const projects: readonly Project[] = [
  {
    period: "2026.03 – Present",
    title: "AX Task Force (AI Transformation)",
    paragraphs: [
      "Joined the company-wide AI Transformation (AX) Task Force as the representative of the People Team following the enterprise-wide adoption of LLM platforms, including ChatGPT, Gemini, and Claude.",
      "Review and provide HR perspectives on key policies and governance frameworks related to AI and LLM adoption.",
      "Contribute to discussions on developing quantitative measurement frameworks for AX impact, including productivity improvement, workforce effectiveness, adoption metrics, and business value creation.",
      "Actively promote the development and adoption of AI Agents within HR and business functions, while continuously exploring approaches for efficient token utilization, scalable AI implementation, and measurable performance outcomes.",
    ],
  },
  {
    period: "2026.03 – Present",
    title: "Global Audit Management Agent",
    paragraphs: [
      "Leading the development of an AI Agent-based overseas research subsidiaries audit management solution designed to transform the annual audit process conducted across Samsung Research's overseas research subsidiaries.",
      "The existing audit process required global HR professionals to manually review extensive supporting evidence against audit checklists, resulting in significant time and operational effort.",
      "Designed and developed an AI Agent to automate and support key audit activities, including automatic evidence-to-checklist matching, supporting evidence validation, automated audit assessment, and report generation.",
      "The core functionality has already been implemented, and the project is currently progressing into Phase 2, which focuses on building an integrated database and Retrieval-Augmented Generation (RAG) architecture.",
      "The next phase aims to connect audit data, evidence, and organizational knowledge into a conversational AI interface, enabling users to access audit insights and information through an intelligent overseas research subsidiaries knowledge chatbot.",
    ],
  },
  {
    period: "2023.12 – 2024.09",
    title: "M&A – Oxford Semantic Technologies",
    paragraphs: [
      "Joined the cross-functional M&A project team for the acquisition of Oxford Semantic Technologies, a UK-based knowledge graph technology company.",
      "As interest in knowledge graph technology increased across the organization, participated in the transaction from the Due Diligence phase through Day 1 and Post-Merger Integration (PMI).",
      "Obtained access to the company's Data Room and conducted comprehensive analysis across key HR areas, including workforce structure, compensation, employment policies, organizational design, and people-related risks. Also participated in employee and stakeholder interviews as part of the HR Due Diligence process.",
      "Following the completion of the acquisition in July 2024, supported the Day 1 integration ceremony and led key HR integration activities to establish Samsung's HR policies, processes, and operating framework within the acquired organization.",
      "Currently continue to participate in quarterly Board Meetings as an HR Consultant, providing ongoing HR and organizational support following the acquisition.",
    ],
  },
  {
    period: "2022.03 – 2022.12",
    title: "Change Agent",
    paragraphs: [
      "Selected as a Change Agent, a representative appointed by the People Team to drive organizational culture improvement and employee engagement initiatives.",
      "Led regular monthly engagement meetings and organized four major Great Work Place (GWP) events, along with multiple smaller employee engagement activities.",
      "Collaborated with employees and organizational stakeholders to promote positive cultural change and improve the organization's Culture Index and employee engagement outcomes.",
    ],
  },
  {
    period: "2021.12 – 2022.03",
    title: "Recruiting Experience Enhancement",
    paragraphs: [
      "As a member of the New-Hire Recruiting team, led the production of a Samsung Research employer branding and recruiting video.",
      "Secured production funding for YouTube content and served as the overall Producer and Project Lead, taking responsibility for scenario development, production planning, filming coordination, audio recording, and post-production.",
      "Worked closely with a professional production agency throughout the entire creative process to deliver content that effectively communicated Samsung Research's technology, culture, and talent value proposition.",
      "The video achieved the highest number of views among recruiting and organizational introduction videos produced across Samsung Electronics' business divisions, contributing to enhanced employer branding and candidate engagement.",
    ],
  },
  {
    period: "2021.03 – 2021.10",
    title: "Exceptional Talent Recruitment",
    paragraphs: [
      "As algorithmic and system engineering capabilities became increasingly critical, led initiatives to identify, engage, and convert exceptional engineering talent with world-class problem-solving capabilities.",
      "Strengthened the operating model of the internal SW Membership Program, which managed high-potential talent pools from prestigious competitions such as the International Olympiad in Informatics (IOI) and ACM International Collegiate Programming Contest (ICPC).",
      "Designed and implemented targeted competitions, events, and engagement programs to bring together Expert-of-Experts level talent, create meaningful interactions, and build long-term rapport with high-potential candidates.",
      "These initiatives contributed to achieving record-level outcomes in the identification and successful recruitment of exceptional engineering talent during 2021 and 2022.",
    ],
  },
  {
    period: "2020.07 – 2020.12",
    title: "Talent Acquisition Management System",
    paragraphs: [
      "Initiated and led the development of an internal Talent Acquisition Management System to move beyond Excel-based candidate tracking and establish a more sophisticated candidate relationship management and talent pipeline infrastructure.",
      "While Workday provided a cloud-based enterprise HR platform, its customization capabilities were limited for specialized recruiting workflows and operational innovation. Working directly with junior developers, designed and developed a customized system using Next.js, TypeScript, and PostgreSQL.",
      "The platform enabled end-to-end management of the talent acquisition lifecycle, from talent sourcing and candidate identification to pipeline management, interviews, offer negotiation, and onboarding completion.",
      "The system was subsequently enhanced through the integration of AI Agent APIs, supporting further automation and intelligence across sourcing, interview processes, and compensation negotiation workflows. It continues to be recognized internally as a best-practice case in HR digital transformation and recruiting operations.",
    ],
  },
  {
    period: "2019.07 – 2020.10",
    title: "10x10 Candidate Matrix",
    paragraphs: [
      "Led the development of the 10x10 Candidate Matrix, a strategic talent intelligence initiative designed to identify and build relationships with top Korean talent across ten state-of-the-art (SOTA) AI domains.",
      "As AI applications became increasingly specialized across areas such as Computer Vision, Natural Language Processing, Speech, Robotics, and next-generation communications, selected ten strategically important technology domains and identified the top ten Korean talents within each area.",
      "Recognizing the increasing market demand for candidates with strong industry application and commercialization experience, expanded the initiative beyond academia to develop an additional Industry 10x10 Candidate Matrix.",
      "The project strengthened relationships with key researchers, engineers, and industry experts and established a long-term strategic talent pipeline and external talent network across critical AI domains.",
    ],
  },
  {
    period: "2018.05 – 2018.11",
    title: "Samsung AI Center Setup",
    paragraphs: [
      "Contributed to the establishment and operational stabilization of Samsung AI Centers in Mountain View, New York, Toronto, Montreal, Cambridge, and Moscow.",
      "Developed a global AI talent mapping and leadership intelligence framework based on the genealogy of first-generation deep learning pioneers. Identified and analyzed potential Center Head candidates using multiple quantitative indicators, including Google Scholar citations, h-index, research impact, and Scimago-based metrics.",
      "Conducted in-depth assessments of globally recognized AI researchers and technology leaders and prepared executive-level reports to support strategic leadership decisions.",
      "Also served as a key cross-functional liaison and coordination point between senior leadership in Korea and local HR, Strategy, and Administration teams across multiple countries.",
    ],
  },
  {
    period: "2018.05 – 2018.07",
    title: "HRIS Integration",
    paragraphs: [
      "Led the HRIS data migration from HR Hub, Samsung Electronics' legacy HR system, to Workday.",
      "Managed the migration of employee data for approximately 20,000 employees across Samsung Research's global subsidiaries, leveraging Workday's Enterprise Interface Builder (EIB) functionality.",
      "In parallel, supported the transition to a Position-Based Manpower Management Model under Mercer's consulting framework. Key responsibilities included conducting Job Matching and Job Evaluation to align Career Levels and Title Bands across global entities.",
      "Following the Workday implementation, developed and distributed comprehensive HR policy and process guidelines to global subsidiaries to support change management, operational consistency, and system adoption.",
    ],
  },
];

export type Education = {
  year: string;
  degree: string;
  school: string;
  content?: readonly string[];
};

export const education: readonly Education[] = [
  {
    year: "03.2011 – 08.2017",
    degree: "Bachelor of Science, Electronic Engineering",
    school: "Hanyang University · Seoul",
    content: [
      "Music Mood Analysis Project: Analyzed the acoustic features of music (pitch, tempo, rhythm, and timbre) to assess each track's overall mood, with the goal of recommending music based on the user's current mood. Awarded 3rd place in the graduation project.",
      "Military Service (01.2013 – 10.2014): Assigned to the 1st Infantry Division and served at a Guard Post in the DMZ.",
    ],
  },
];
