export const profile = {
  eyebrow: "Seoul, South Korea",
  name: "Minho Lee",
  title: "Senior Professional · Samsung Electronics",
  summary: [
    "Global HR professional with 9+ years of experience at Samsung Research, specializing in global HR strategy, talent intelligence, HR digital transformation, and organizational integration. Proven track record of leading complex, cross-border initiatives across 15+ global locations, including HR policy standardization, Workday HRIS migration for approximately 20,000 employees, M&A due diligence and post-merger integration, and global workforce management.",
    "Combines deep HR domain expertise with a strong technology and data-driven mindset, having led the development of customized Talent Acquisition platforms, AI Agent-based HR and GRC solutions, and LLM-enabled workforce transformation initiatives. Experienced in building strategic talent pipelines for world-class AI and engineering talent, establishing global research organizations, and supporting executive decision-making through quantitative talent intelligence and HR analytics.",
    "Recognized for operating effectively at the intersection of People, Technology, and Business Strategy, with hands-on experience spanning global HR operations, AI transformation, organizational change, M&A integration, and talent strategy.",
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
    label: "HR & Strategy",
    items: [
      "Global HR Strategy",
      "Talent Management",
      "HR Policy",
      "M&A / PMI",
      "Organizational Development",
    ],
  },
  {
    label: "AI & Digital Transformation",
    items: ["AI Agents", "LLMs", "RAG", "HR Automation", "AX Strategy"],
  },
  {
    label: "Data & Analytics",
    items: ["HR Analytics", "KPI Management", "VBA", "Tableau", "Power BI"],
  },
  {
    label: "HR Systems",
    items: ["Workday", "EIB", "HRIS Integration", "Data Migration"],
  },
  {
    label: "Programming & Engineering",
    items: [
      "C",
      "C++",
      "Python",
      "JavaScript",
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "API Integration",
    ],
  },
  {
    label: "Office Tools",
    items: ["Excel", "PowerPoint", "Word", "Google Workspace"],
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
          "Formulated and executed comprehensive global HR strategic plans to align organizational goals with international subsidiary operations across 15+ locations.",
      },
      {
        heading: "AX (AI Transformation) T/F",
        description:
          "Spearheaded the AI Transformation Task Force to re-establish global workforce management systems by integrating LLMs to drive organizational productivity and data-driven operational efficiency.",
      },
      {
        heading: "M&A-related HR Activities",
        description:
          "Orchestrated HR due diligence and post-merger integration (PMI) strategies to ensure seamless cultural transitions and organizational stability during M&A activities.",
      },
      {
        heading: "Talent Development Program to Jakarta",
        description:
          "Designed and facilitated localized talent development initiatives in Jakarta to enhance regional leadership capabilities and optimize workforce performance.",
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
          "Standardized and implemented global HR policies across international subsidiaries to ensure organizational consistency and compliance with local labor regulations.",
      },
      {
        heading: "Evaluation & Promotion",
        description:
          "Designed and managed comprehensive performance evaluation frameworks and promotion processes to foster a merit-based culture and ensure talent retention.",
      },
      {
        heading: "HRIS Integration",
        description:
          "Executed HRIS integration projects to streamline personnel data management and enhance the efficiency of global HR operations through digital transformation.",
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
          "Managed end-to-end full-cycle recruiting for SOTA (State-of-the-Art) domain tech positions, implementing high-touch engagement strategies to secure a consistent pipeline of top-tier engineering talent in competitive markets. (US Top 10, Global Top 100, IITs, Exceptional Talents, etc.)",
      },
      {
        heading: "Executive & Strategic Hiring",
        description:
          "Executed sophisticated headhunting initiatives to identify and secure executive-level leadership and niche industry experts, ensuring human capital alignment with long-term corporate vision and strategic objectives.",
      },
      {
        heading: "Academic Collaboration (Sabbatical & Visiting Scholars)",
        description:
          "Directed specialized recruitment programs for Sabbatical & Visiting Scholars and advisory professors, fostering global academic partnerships to bolster the organization's R&D capabilities and innovation pipeline.",
      },
      {
        heading: "Employer Branding & Candidate Experience (CX)",
        description:
          "Spearheaded comprehensive Employer Branding initiatives and optimized Candidate Experience (CX) processes to build a premium talent brand, significantly enhancing the ability to attract and retain elite industry professionals.",
      },
    ],
  },
  {
    period: "05.2018 – 11.2018",
    title: "Professional (Global HR)",
    company: "Samsung Research, Samsung Electronics",
    bullets: [
      {
        heading: "Managed KPI systems and HR analytics",
        description:
          "Established and managed sophisticated KPI frameworks and HR analytics systems, utilizing Tableau and data-driven methodologies to monitor global organizational health and provide actionable insights for executive decision-making.",
      },
      {
        heading: "Supported Global AI Center operations",
        description:
          "Provided strategic operational support for the Global AI Center, streamlining HR processes and organizational structures to facilitate a high-performance environment for world-class AI research and development.",
      },
    ],
  },
  {
    period: "07.2017 – 04.2018",
    title: "Trainee & Recruiting T/F",
    company: "Samsung Research, Samsung Electronics",
    bullets: [
      {
        heading: "Managed recruiting KPIs and interview operations",
        description:
          "Optimized recruitment performance by managing key hiring metrics (KPIs) and overseeing complex interview operations to ensure an efficient and data-driven selection process.",
      },
      {
        heading: "Improved candidate experience processes",
        description:
          "Spearheaded the enhancement of candidate journey touchpoints, implementing feedback-driven improvements to elevate the organization's employer brand and candidate engagement.",
      },
      {
        heading: "Completed Samsung Shared Value Program",
        description:
          "Successfully completed the Samsung Shared Value Program, gaining a deep understanding of corporate core values and integrating these principles into global HR operational strategies.",
      },
      {
        heading: "Participated in onboarding and job training programs",
        description:
          "Engaged in intensive professional onboarding and specialized job training programs to build a robust foundation in Samsung's HR systems and organizational culture.",
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
    period: "2018.05 – 2018.07",
    title: "HRIS Integration",
    paragraphs: [
      "Led the HRIS data migration from HR Hub, Samsung Electronics' legacy HR system, to Workday.",
      "Managed the migration of employee data for approximately 20,000 employees across Samsung Research's global subsidiaries, leveraging Workday's Enterprise Interface Builder (EIB) functionality.",
      "In parallel, supported the transition to a Position-Based Manpower Management Model under Mercer's consulting framework. Key responsibilities included conducting Job Matching and Job Evaluation to align Career Levels and Title Bands across global entities.",
      "Following the Workday implementation, developed and distributed comprehensive HR policy and process guidelines to global subsidiaries to support change management, operational consistency, and system adoption.",
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
    period: "2019.07 – 2020.10",
    title: "10x10 Candidate Matrix",
    paragraphs: [
      "Led the development of the 10x10 Candidate Matrix, a strategic talent intelligence initiative designed to identify and build relationships with top Korean talent across ten State-of-the-Art (SOTA) AI domains.",
      "As AI applications became increasingly specialized across areas such as Computer Vision, Natural Language Processing, Speech, Robotics, and Next-Generation Communications, selected ten strategically important technology domains and identified the top ten Korean talents within each area.",
      "Recognizing the increasing market demand for candidates with strong industry application and commercialization experience, expanded the initiative beyond academia to develop an additional Industry 10x10 Candidate Matrix.",
      "The project strengthened relationships with key researchers, engineers, and industry experts and established a long-term strategic talent pipeline and external talent network across critical AI domains.",
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
    period: "2022.03 – 2022.12",
    title: "Change Agent",
    paragraphs: [
      "Selected as a Change Agent, a representative appointed by the People Team to drive organizational culture improvement and employee engagement initiatives.",
      "Led regular monthly engagement meetings and organized four major Great Work Place (GWP) events, along with multiple smaller employee engagement activities.",
      "Collaborated with employees and organizational stakeholders to promote positive cultural change and improve the organization's Culture Index and employee engagement outcomes.",
    ],
  },
  {
    period: "2023.12 – 2024.09",
    title: "M&A – Oxford Semantic Technologies",
    paragraphs: [
      "Joined the cross-functional M&A project team for the acquisition of Oxford Semantic Technologies, a UK-based Knowledge Graph technology company.",
      "As interest in Knowledge Graph technology increased across the organization, participated in the transaction from the Due Diligence phase through Day 1 and Post-Merger Integration (PMI).",
      "Obtained access to the company's Data Room and conducted comprehensive analysis across key HR areas, including workforce structure, compensation, employment policies, organizational design, and people-related risks. Also participated in employee and stakeholder interviews as part of the HR Due Diligence process.",
      "Following the completion of the acquisition in July 2024, supported the Day 1 integration ceremony and led key HR integration activities to establish Samsung's HR policies, processes, and operating framework within the acquired organization.",
      "Currently continue to participate in quarterly Board Meetings as an HR Consultant, providing ongoing HR and organizational support following the acquisition.",
    ],
  },
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
    title: "GRC Audit Management Agent",
    paragraphs: [
      "Leading the development of an AI Agent-based GRC Audit Management solution designed to transform the annual audit process conducted across Samsung Research's Global Research Centers.",
      "The existing audit process required Global HR professionals to manually review extensive supporting evidence against audit checklists, resulting in significant time and operational effort.",
      "Designed and developed an AI Agent to automate and support key audit activities, including automatic evidence-to-checklist matching, supporting evidence validation, automated audit assessment, and report generation.",
      "The core functionality has already been implemented, and the project is currently progressing into Phase 2, which focuses on building an integrated Database and Retrieval-Augmented Generation (RAG) architecture.",
      "The next phase aims to connect audit data, evidence, and organizational knowledge into a conversational AI interface, enabling users to access audit insights and information through an intelligent GRC knowledge chatbot.",
    ],
  },
];

export type Education = {
  year: string;
  degree: string;
  school: string;
};

export const education: readonly Education[] = [
  {
    year: "08.2017",
    degree: "Bachelor of Science, Electronic Engineering",
    school: "Hanyang University · Seoul",
  },
];
