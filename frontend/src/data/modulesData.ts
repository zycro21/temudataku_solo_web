// Tambahkan export ini ke dalam file @/data/elearningData.ts
// Key = courseId (bukan streamId!)

export const modulesByCourse: Record<number, any[]> = {

  // ─── Stream 1: Data Science Bootcamp ────────────────────────────────────────

  // courseId 1 — Python for Data Science
  1: [
    { id: 1,  name: "Introduction to Python",           description: "Variables, data types, and basic syntax.",         materials: 3, duration: 60,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 2,  name: "Data Structures in Python",        description: "Lists, dicts, sets, and tuples.",                  materials: 4, duration: 75,  status: "Published", created: "02/13/2025\n10:00:00" },
    { id: 3,  name: "NumPy Essentials",                 description: "Array operations and numerical computing.",         materials: 2, duration: 55,  status: "Published", created: "02/14/2025\n08:30:00" },
    { id: 4,  name: "Pandas for Data Analysis",         description: "DataFrames, merging, and groupby.",                materials: 4, duration: 80,  status: "Published", created: "02/14/2025\n11:00:00" },
    { id: 5,  name: "Data Visualization with Matplotlib", description: "Charts, plots, and visual storytelling.",        materials: 3, duration: 65,  status: "Published", created: "02/15/2025\n09:00:00" },
    { id: 6,  name: "Seaborn & Statistical Plots",      description: "Advanced visualizations for analysis.",            materials: 2, duration: 65,  status: "Archived", created: "02/15/2025\n13:00:00" },
  ],

  // courseId 2 — Machine Learning Fundamentals
  2: [
    { id: 7,  name: "Intro to Machine Learning",        description: "ML overview and problem framing.",                 materials: 2, duration: 50,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 8,  name: "Linear Regression",                description: "Predicting continuous values.",                    materials: 3, duration: 70,  status: "Published", created: "02/13/2025\n10:00:00" },
    { id: 9,  name: "Logistic Regression",              description: "Binary and multiclass classification.",            materials: 2, duration: 65,  status: "Published", created: "02/14/2025\n08:00:00" },
    { id: 10, name: "Decision Trees & Random Forest",   description: "Tree-based models and ensembles.",                 materials: 3, duration: 80,  status: "Published", created: "02/14/2025\n10:30:00" },
    { id: 11, name: "Model Evaluation & Tuning",        description: "Cross-validation, metrics, and hyperparameters.",  materials: 3, duration: 75,  status: "Published", created: "02/15/2025\n09:00:00" },
    { id: 12, name: "Feature Engineering",              description: "Scaling, encoding, and feature selection.",        materials: 2, duration: 60,  status: "Published", created: "02/15/2025\n11:00:00" },
    { id: 13, name: "Intro to Scikit-learn",            description: "Hands-on with sklearn pipelines.",                 materials: 3, duration: 70,  status: "Archived", created: "02/16/2025\n08:00:00" },
    { id: 14, name: "Capstone Project",                 description: "End-to-end ML project from scratch.",              materials: 2, duration: 120, status: "Published", created: "02/16/2025\n13:00:00" },
  ],

  // courseId 3 — Deep Learning Basics
  3: [
    { id: 15, name: "Neural Network Fundamentals",      description: "Perceptrons, layers, and activations.",            materials: 2, duration: 70,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 16, name: "Backpropagation",                  description: "How networks learn via gradients.",                materials: 2, duration: 65,  status: "Published", created: "02/13/2025\n10:30:00" },
    { id: 17, name: "TensorFlow & Keras Basics",        description: "Building models with TF2 and Keras.",              materials: 2, duration: 60,  status: "Published", created: "02/14/2025\n08:00:00" },
    { id: 18, name: "Convolutional Neural Networks",    description: "Image classification with CNNs.",                  materials: 2, duration: 60,  status: "Published", created: "02/14/2025\n11:00:00" },
    { id: 19, name: "Recurrent Neural Networks",        description: "Sequence modeling with RNNs and LSTMs.",           materials: 2, duration: 55,  status: "Archived", created: "02/15/2025\n09:00:00" },
    { id: 20, name: "Transfer Learning",                description: "Leveraging pre-trained models.",                   materials: 1, duration: 60,  status: "Archived", created: "02/15/2025\n11:00:00" },
  ],

  // ─── Stream 2: UI/UX Design Fundamentals ────────────────────────────────────

  // courseId 4 — UI Fundamentals
  4: [
    { id: 21, name: "Design Principles",                description: "Balance, contrast, alignment, and proximity.",     materials: 2, duration: 45,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 22, name: "Color Theory",                     description: "Palettes, psychology, and accessibility.",         materials: 2, duration: 50,  status: "Published", created: "02/13/2025\n10:00:00" },
    { id: 23, name: "Typography Basics",                description: "Font pairing and hierarchy.",                      materials: 2, duration: 45,  status: "Published", created: "02/14/2025\n08:00:00" },
    { id: 24, name: "Figma Introduction",               description: "Frames, components, and auto layout.",             materials: 3, duration: 60,  status: "Published", created: "02/14/2025\n11:00:00" },
    { id: 25, name: "Grids & Spacing",                  description: "8-point grid and layout systems.",                 materials: 2, duration: 40,  status: "Published", created: "02/15/2025\n08:00:00" },
    { id: 26, name: "Iconography & Imagery",            description: "Choosing and using visual assets.",                materials: 2, duration: 40,  status: "Published", created: "02/15/2025\n10:00:00" },
    { id: 27, name: "UI Patterns & Components",         description: "Buttons, forms, cards, and navbars.",              materials: 3, duration: 60,  status: "Published", created: "02/15/2025\n13:00:00" },
    { id: 28, name: "Responsive Design",                description: "Adapting UIs for mobile and desktop.",             materials: 2, duration: 60,  status: "Published", created: "02/16/2025\n08:00:00" },
    { id: 29, name: "Accessibility (a11y)",             description: "WCAG guidelines and inclusive design.",            materials: 2, duration: 50,  status: "Archived", created: "02/16/2025\n11:00:00" },
    { id: 30, name: "UI Design Critique",               description: "Reviewing and iterating on designs.",              materials: 2, duration: 50,  status: "Published", created: "02/16/2025\n13:00:00" },
  ],

  // courseId 5 — Advanced UX Research
  5: [
    { id: 31, name: "UX Research Overview",             description: "Qualitative vs quantitative methods.",             materials: 2, duration: 45,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 32, name: "User Interviews",                  description: "Planning and conducting interviews.",              materials: 2, duration: 55,  status: "Published", created: "02/13/2025\n10:00:00" },
    { id: 33, name: "Usability Testing",                description: "Moderated and unmoderated sessions.",              materials: 2, duration: 60,  status: "Published", created: "02/14/2025\n08:00:00" },
    { id: 34, name: "Affinity Mapping",                 description: "Synthesizing insights from research.",             materials: 2, duration: 50,  status: "Archived", created: "02/14/2025\n11:00:00" },
    { id: 35, name: "Journey Mapping",                  description: "Visualizing user experiences end-to-end.",         materials: 2, duration: 55,  status: "Published", created: "02/15/2025\n09:00:00" },
    { id: 36, name: "Competitive Analysis",             description: "Benchmarking against industry leaders.",           materials: 2, duration: 65,  status: "Published", created: "02/15/2025\n11:30:00" },
    { id: 37, name: "Survey Design",                    description: "Writing effective research surveys.",              materials: 1, duration: 50,  status: "Archived", created: "02/16/2025\n09:00:00" },
  ],

  // courseId 6 — Design System Mastery
  6: [
    { id: 38, name: "What is a Design System",          description: "Foundations, tokens, and documentation.",          materials: 2, duration: 60,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 39, name: "Building a Component Library",     description: "Atomic design in Figma.",                         materials: 2, duration: 90,  status: "Published", created: "02/13/2025\n11:00:00" },
    { id: 40, name: "Design Tokens",                    description: "Colors, typography, and spacing tokens.",          materials: 2, duration: 70,  status: "Published", created: "02/14/2025\n08:00:00" },
    { id: 41, name: "Documentation Best Practices",     description: "Storybook and usage guidelines.",                  materials: 2, duration: 80,  status: "Published", created: "02/14/2025\n10:00:00" },
    { id: 42, name: "Versioning & Handoff",             description: "Managing releases and dev handoff.",               materials: 2, duration: 70,  status: "Published", created: "02/15/2025\n08:00:00" },
    { id: 43, name: "Multi-brand Theming",              description: "Supporting multiple brands from one system.",      materials: 2, duration: 80,  status: "Archived", created: "02/15/2025\n11:00:00" },
    { id: 44, name: "Governance & Contribution",        description: "How teams contribute to shared systems.",          materials: 2, duration: 70,  status: "Published", created: "02/16/2025\n09:00:00" },
    { id: 45, name: "Real-world Design System Audit",   description: "Evaluating an existing system.",                   materials: 2, duration: 100, status: "Published", created: "02/16/2025\n13:00:00" },
  ],

  // ─── Stream 3: Digital Marketing Pro ────────────────────────────────────────

  // courseId 7 — SEO Mastery
  7: [
    { id: 46, name: "SEO Fundamentals",                 description: "How search engines work.",                         materials: 2, duration: 45,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 47, name: "On-Page SEO",                      description: "Title tags, meta descriptions, and content.",      materials: 2, duration: 50,  status: "Published", created: "02/13/2025\n10:00:00" },
    { id: 48, name: "Keyword Research",                 description: "Tools and strategy for finding keywords.",          materials: 1, duration: 55,  status: "Published", created: "02/14/2025\n08:00:00" },
    { id: 49, name: "Link Building",                    description: "Building domain authority with backlinks.",         materials: 1, duration: 50,  status: "Published", created: "02/14/2025\n11:00:00" },
    { id: 50, name: "Technical SEO",                    description: "Site speed, crawlability, and structured data.",   materials: 1, duration: 50,  status: "Archived", created: "02/15/2025\n09:00:00" },
  ],

  // courseId 8 — Performance Marketing
  8: [
    { id: 51, name: "Google Ads Basics",                description: "Campaigns, ad groups, and bidding.",               materials: 2, duration: 60,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 52, name: "Meta Ads Strategy",                description: "Facebook and Instagram paid ads.",                  materials: 2, duration: 65,  status: "Published", created: "02/13/2025\n10:30:00" },
    { id: 53, name: "Analytics & Attribution",          description: "GA4 and conversion tracking.",                     materials: 2, duration: 60,  status: "Published", created: "02/14/2025\n09:00:00" },
    { id: 54, name: "A/B Testing Campaigns",            description: "Testing creatives and landing pages.",              materials: 2, duration: 55,  status: "Published", created: "02/14/2025\n11:00:00" },
    { id: 55, name: "Retargeting & Remarketing",        description: "Re-engaging lost visitors.",                        materials: 1, duration: 70,  status: "Published", created: "02/15/2025\n08:30:00" },
    { id: 56, name: "Campaign Reporting",               description: "Building dashboards and presenting results.",       materials: 2, duration: 70,  status: "Archived", created: "02/15/2025\n11:00:00" },
  ],

  // ─── Stream 4: Python for Beginners ─────────────────────────────────────────

  // courseId 9 — Python Basics
  9: [
    { id: 57, name: "Setting Up Python",                description: "Installation, virtual environments, and IDEs.",    materials: 1, duration: 30,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 58, name: "Variables & Data Types",           description: "Strings, numbers, booleans, and None.",            materials: 1, duration: 40,  status: "Published", created: "02/13/2025\n10:00:00" },
    { id: 59, name: "Control Flow",                     description: "if/else, loops, and conditionals.",                materials: 2, duration: 50,  status: "Published", created: "02/14/2025\n08:00:00" },
    { id: 60, name: "Functions",                        description: "Defining and calling functions.",                   materials: 2, duration: 50,  status: "Published", created: "02/14/2025\n10:30:00" },
    { id: 61, name: "Lists & Dictionaries",             description: "Working with Python collections.",                  materials: 2, duration: 45,  status: "Published", created: "02/15/2025\n09:00:00" },
    { id: 62, name: "File I/O",                         description: "Reading and writing files in Python.",              materials: 2, duration: 45,  status: "Archived", created: "02/15/2025\n11:00:00" },
  ],

  // courseId 10 — Building CLI Tools
  10: [
    { id: 63, name: "Understanding CLI",                description: "How command-line interfaces work.",                 materials: 1, duration: 35,  status: "Published", created: "02/13/2025\n08:00:00" },
    { id: 64, name: "argparse Module",                  description: "Parsing command-line arguments.",                   materials: 1, duration: 45,  status: "Published", created: "02/13/2025\n10:00:00" },
    { id: 65, name: "Click Framework",                  description: "Building elegant CLIs with Click.",                 materials: 2, duration: 55,  status: "Published", created: "02/14/2025\n08:00:00" },
    { id: 66, name: "File Manipulation CLI",            description: "Build a file manager from scratch.",                materials: 1, duration: 40,  status: "Published", created: "02/14/2025\n11:00:00" },
    { id: 67, name: "Packaging & Distribution",         description: "Publish your CLI tool to PyPI.",                   materials: 1, duration: 35,  status: "Archived", created: "02/15/2025\n09:00:00" },
  ],

  // ─── Stream 5: Full Stack Web Development ───────────────────────────────────

  // courseId 11 — HTML & CSS Mastery
  11: [
    { id: 68, name: "HTML Foundations",                 description: "Semantic HTML and document structure.",             materials: 2, duration: 45,  status: "Published", created: "03/02/2025\n08:00:00" },
    { id: 69, name: "CSS Basics",                       description: "Box model, selectors, and specificity.",            materials: 2, duration: 50,  status: "Published", created: "03/02/2025\n10:00:00" },
    { id: 70, name: "Flexbox & Grid",                   description: "Modern layout techniques.",                         materials: 2, duration: 55,  status: "Published", created: "03/03/2025\n08:00:00" },
    { id: 71, name: "CSS Animations",                   description: "Transitions and keyframe animations.",              materials: 2, duration: 50,  status: "Published", created: "03/03/2025\n11:00:00" },
    { id: 72, name: "Responsive Design",                description: "Media queries and mobile-first design.",            materials: 2, duration: 70,  status: "Archived", created: "03/04/2025\n09:00:00" },
  ],

  // courseId 12 — React Fundamentals
  12: [
    { id: 73, name: "JSX & Components",                 description: "Creating React components with JSX.",               materials: 2, duration: 55,  status: "Published", created: "03/02/2025\n08:00:00" },
    { id: 74, name: "Props & State",                    description: "Managing component data.",                          materials: 2, duration: 60,  status: "Published", created: "03/02/2025\n10:30:00" },
    { id: 75, name: "useEffect Hook",                   description: "Side effects and lifecycle in functional components.", materials: 2, duration: 55, status: "Published", created: "03/03/2025\n08:00:00" },
    { id: 76, name: "React Router",                     description: "Client-side routing with React Router.",            materials: 2, duration: 60,  status: "Published", created: "03/03/2025\n11:00:00" },
    { id: 77, name: "State Management with Context",    description: "Global state using Context API.",                   materials: 2, duration: 55,  status: "Published", created: "03/04/2025\n09:00:00" },
    { id: 78, name: "Custom Hooks",                     description: "Extracting reusable logic into custom hooks.",       materials: 2, duration: 55,  status: "Published", created: "03/04/2025\n11:30:00" },
    { id: 79, name: "Performance Optimization",         description: "useMemo, useCallback, and lazy loading.",           materials: 2, duration: 60,  status: "Published", created: "03/05/2025\n09:00:00" },
    { id: 80, name: "Testing React Components",         description: "Unit and integration tests with Jest.",             materials: 2, duration: 50,  status: "Archived", created: "03/05/2025\n11:00:00" },
  ],

  // courseId 13 — Node.js & Express
  13: [
    { id: 81, name: "Node.js Fundamentals",             description: "Event loop, modules, and npm ecosystem.",           materials: 2, duration: 55,  status: "Published", created: "03/03/2025\n08:00:00" },
    { id: 82, name: "Building REST APIs",               description: "Express routing, middleware, and controllers.",      materials: 2, duration: 65,  status: "Published", created: "03/03/2025\n10:00:00" },
    { id: 83, name: "Authentication & JWT",             description: "Secure routes with JSON Web Tokens.",               materials: 2, duration: 60,  status: "Published", created: "03/04/2025\n08:00:00" },
    { id: 84, name: "Error Handling & Validation",      description: "Robust APIs with proper error responses.",          materials: 2, duration: 50,  status: "Published", created: "03/04/2025\n11:00:00" },
    { id: 85, name: "File Uploads & Storage",           description: "Handling multipart forms and cloud storage.",       materials: 1, duration: 55,  status: "Published", created: "03/05/2025\n09:00:00" },
    { id: 86, name: "WebSockets & Real-time",           description: "Live features with Socket.io.",                     materials: 2, duration: 60,  status: "Published", created: "03/05/2025\n11:30:00" },
    { id: 87, name: "API Testing with Postman",         description: "Test and document your APIs.",                      materials: 2, duration: 65,  status: "Archived", created: "03/06/2025\n09:00:00" },
  ],

  // courseId 14 — Database Design with PostgreSQL
  14: [
    { id: 88, name: "Relational Database Concepts",     description: "Tables, keys, and relationships.",                  materials: 2, duration: 50,  status: "Published", created: "03/04/2025\n08:00:00" },
    { id: 89, name: "SQL Basics",                       description: "SELECT, INSERT, UPDATE, DELETE.",                   materials: 2, duration: 55,  status: "Published", created: "03/04/2025\n10:00:00" },
    { id: 90, name: "Joins & Aggregations",             description: "Complex queries and data analysis.",                 materials: 2, duration: 60,  status: "Published", created: "03/05/2025\n08:00:00" },
    { id: 91, name: "Indexing & Query Optimization",    description: "Speed up queries with proper indexing.",             materials: 2, duration: 55,  status: "Published", created: "03/05/2025\n10:30:00" },
    { id: 92, name: "Transactions & ACID",              description: "Data integrity and transaction management.",         materials: 1, duration: 50,  status: "Published", created: "03/06/2025\n08:00:00" },
    { id: 93, name: "Database Migrations",              description: "Schema versioning with migration tools.",            materials: 2, duration: 50,  status: "Archived", created: "03/06/2025\n11:00:00" },
  ],

  // courseId 15 — Deployment & DevOps Basics
  15: [
    { id: 94, name: "Linux CLI for Developers",         description: "Essential shell commands for deployment.",           materials: 1, duration: 40,  status: "Published", created: "03/05/2025\n08:00:00" },
    { id: 95, name: "Deploying to Vercel & Netlify",    description: "Frontend deployment with CI/CD hooks.",             materials: 2, duration: 45,  status: "Published", created: "03/05/2025\n10:00:00" },
    { id: 96, name: "Deploying Node.js to Render",      description: "Backend deployment and environment variables.",     materials: 1, duration: 50,  status: "Published", created: "03/06/2025\n08:00:00" },
    { id: 97, name: "Docker Basics",                    description: "Containerize your full stack app.",                  materials: 2, duration: 55,  status: "Archived", created: "03/06/2025\n11:00:00" },
  ],

  // ─── Stream 6: Cloud Computing Essentials ───────────────────────────────────

  // courseId 16 — AWS Core Services
  16: [
    { id: 98,  name: "AWS Global Infrastructure",       description: "Regions, AZs, and edge locations.",                 materials: 1, duration: 40,  status: "Published", created: "03/06/2025\n08:00:00" },
    { id: 99,  name: "EC2 & Compute Services",          description: "Launch and manage virtual machines.",               materials: 2, duration: 60,  status: "Published", created: "03/06/2025\n10:00:00" },
    { id: 100, name: "S3 & Object Storage",             description: "Store, manage, and serve files with S3.",           materials: 2, duration: 55,  status: "Published", created: "03/07/2025\n08:00:00" },
    { id: 101, name: "RDS & Managed Databases",         description: "MySQL and PostgreSQL on AWS RDS.",                  materials: 2, duration: 55,  status: "Published", created: "03/07/2025\n10:30:00" },
    { id: 102, name: "IAM & Security",                  description: "Users, roles, policies, and permissions.",          materials: 2, duration: 60,  status: "Published", created: "03/08/2025\n08:00:00" },
    { id: 103, name: "AWS Lambda & Serverless",         description: "Build event-driven serverless functions.",          materials: 1, duration: 60,  status: "Archived", created: "03/08/2025\n11:00:00" },
  ],

  // courseId 17 — Azure Fundamentals
  17: [
    { id: 104, name: "Azure Portal & Resource Groups",  description: "Navigating Azure and organizing resources.",        materials: 1, duration: 40,  status: "Published", created: "03/07/2025\n08:00:00" },
    { id: 105, name: "Azure Virtual Machines",          description: "Provisioning and scaling VMs in Azure.",            materials: 2, duration: 55,  status: "Published", created: "03/07/2025\n10:00:00" },
    { id: 106, name: "Azure Blob Storage",              description: "Storing unstructured data in the cloud.",           materials: 2, duration: 50,  status: "Published", created: "03/08/2025\n08:00:00" },
    { id: 107, name: "Azure Active Directory",          description: "Identity and access management on Azure.",          materials: 2, duration: 55,  status: "Published", created: "03/08/2025\n11:00:00" },
    { id: 108, name: "Azure App Service",               description: "Deploy web apps and APIs to Azure.",                materials: 2, duration: 60,  status: "Archived", created: "03/09/2025\n09:00:00" },
  ],

  // courseId 18 — Google Cloud Platform
  18: [
    { id: 109, name: "GCP Console & Projects",          description: "Navigating GCP and managing projects.",             materials: 1, duration: 35,  status: "Published", created: "03/08/2025\n08:00:00" },
    { id: 110, name: "Compute Engine",                  description: "Virtual machines on Google Cloud.",                 materials: 2, duration: 55,  status: "Published", created: "03/08/2025\n10:00:00" },
    { id: 111, name: "BigQuery",                        description: "Serverless data warehouse and analytics.",          materials: 2, duration: 65,  status: "Published", created: "03/09/2025\n08:00:00" },
    { id: 112, name: "Cloud Functions",                 description: "Event-driven serverless on GCP.",                   materials: 2, duration: 55,  status: "Published", created: "03/09/2025\n10:30:00" },
    { id: 113, name: "Cloud Storage & CDN",             description: "File storage and content delivery.",                 materials: 2, duration: 60,  status: "Archived", created: "03/10/2025\n09:00:00" },
  ],

  // courseId 19 — Cloud Security & Compliance
  19: [
    { id: 114, name: "Cloud Security Fundamentals",     description: "Shared responsibility model and threat landscape.",  materials: 2, duration: 50,  status: "Published", created: "03/09/2025\n08:00:00" },
    { id: 115, name: "Identity & Access Management",    description: "Least privilege and zero-trust principles.",         materials: 2, duration: 50,  status: "Published", created: "03/09/2025\n10:00:00" },
    { id: 116, name: "Network Security in Cloud",       description: "VPCs, firewalls, and security groups.",              materials: 1, duration: 45,  status: "Published", created: "03/10/2025\n08:00:00" },
    { id: 117, name: "Compliance & Governance",         description: "GDPR, SOC 2, and cloud audit trails.",               materials: 1, duration: 45,  status: "Archived", created: "03/10/2025\n11:00:00" },
  ],

  // ─── Stream 7: AI & Machine Learning ────────────────────────────────────────

  // courseId 20 — Intro to AI & ML
  20: [
    { id: 118, name: "What is Artificial Intelligence", description: "History, types, and current applications of AI.",   materials: 2, duration: 45,  status: "Published", created: "03/11/2025\n08:00:00" },
    { id: 119, name: "ML Pipeline Overview",            description: "Data, model, training, evaluation cycle.",          materials: 2, duration: 50,  status: "Published", created: "03/11/2025\n10:00:00" },
    { id: 120, name: "Python for ML",                   description: "NumPy, Pandas, and Matplotlib for ML.",             materials: 2, duration: 55,  status: "Published", created: "03/12/2025\n08:00:00" },
    { id: 121, name: "Data Preprocessing",              description: "Cleaning, encoding, and normalizing data.",         materials: 2, duration: 50,  status: "Published", created: "03/12/2025\n10:30:00" },
    { id: 122, name: "Ethics in AI",                    description: "Bias, fairness, and responsible AI development.",   materials: 1, duration: 40,  status: "Archived", created: "03/13/2025\n09:00:00" },
  ],

  // courseId 21 — Supervised Learning
  21: [
    { id: 123, name: "Regression Algorithms",           description: "Linear and polynomial regression models.",          materials: 2, duration: 60,  status: "Published", created: "03/11/2025\n08:00:00" },
    { id: 124, name: "Classification Algorithms",       description: "KNN, SVM, and Naive Bayes.",                       materials: 2, duration: 65,  status: "Published", created: "03/11/2025\n10:30:00" },
    { id: 125, name: "Decision Trees",                  description: "Tree-based learning and pruning strategies.",       materials: 2, duration: 60,  status: "Published", created: "03/12/2025\n08:00:00" },
    { id: 126, name: "Ensemble Methods",                description: "Bagging, boosting, and Random Forest.",            materials: 2, duration: 65,  status: "Published", created: "03/12/2025\n10:30:00" },
    { id: 127, name: "Model Evaluation Metrics",        description: "Accuracy, precision, recall, F1, and ROC.",        materials: 2, duration: 55,  status: "Published", created: "03/13/2025\n09:00:00" },
    { id: 128, name: "Hyperparameter Tuning",           description: "GridSearch and cross-validation strategies.",      materials: 2, duration: 55,  status: "Archived", created: "03/13/2025\n11:00:00" },
  ],

  // courseId 22 — Unsupervised Learning
  22: [
    { id: 129, name: "Clustering Algorithms",           description: "K-Means, DBSCAN, and hierarchical clustering.",    materials: 2, duration: 60,  status: "Published", created: "03/12/2025\n08:00:00" },
    { id: 130, name: "Dimensionality Reduction",        description: "PCA, t-SNE, and UMAP.",                            materials: 2, duration: 65,  status: "Published", created: "03/12/2025\n10:00:00" },
    { id: 131, name: "Anomaly Detection",               description: "Identifying outliers and unusual patterns.",       materials: 2, duration: 55,  status: "Published", created: "03/13/2025\n08:00:00" },
    { id: 132, name: "Association Rules",               description: "Market basket analysis with Apriori.",             materials: 1, duration: 50,  status: "Published", created: "03/13/2025\n10:30:00" },
    { id: 133, name: "Generative Models Overview",      description: "Introduction to autoencoders and GANs.",           materials: 2, duration: 60,  status: "Archived", created: "03/14/2025\n09:00:00" },
  ],

  // courseId 23 — Neural Networks & Deep Learning
  23: [
    { id: 134, name: "Perceptrons & Activation",        description: "The building blocks of neural networks.",          materials: 2, duration: 55,  status: "Published", created: "03/13/2025\n08:00:00" },
    { id: 135, name: "Feedforward Networks",            description: "Layers, weights, and forward pass.",               materials: 2, duration: 60,  status: "Published", created: "03/13/2025\n10:00:00" },
    { id: 136, name: "Backpropagation & Optimizers",    description: "Gradient descent, Adam, and learning rates.",      materials: 2, duration: 65,  status: "Published", created: "03/14/2025\n08:00:00" },
    { id: 137, name: "Convolutional Networks (CNN)",    description: "Image recognition and feature maps.",              materials: 2, duration: 70,  status: "Published", created: "03/14/2025\n10:30:00" },
    { id: 138, name: "Recurrent Networks (RNN/LSTM)",   description: "Sequential data and time series modeling.",        materials: 2, duration: 65,  status: "Published", created: "03/15/2025\n09:00:00" },
    { id: 139, name: "Batch Normalization & Dropout",   description: "Regularization techniques for deep networks.",     materials: 1, duration: 55,  status: "Published", created: "03/15/2025\n11:00:00" },
    { id: 140, name: "TensorFlow & Keras Hands-on",     description: "Build and train models end-to-end.",               materials: 2, duration: 70,  status: "Archived", created: "03/16/2025\n09:00:00" },
  ],

  // courseId 24 — Natural Language Processing
  24: [
    { id: 141, name: "Text Preprocessing",              description: "Tokenization, stemming, and stopwords.",           materials: 2, duration: 55,  status: "Published", created: "03/14/2025\n08:00:00" },
    { id: 142, name: "Text Representation",             description: "Bag of Words, TF-IDF, and word embeddings.",       materials: 2, duration: 60,  status: "Published", created: "03/14/2025\n10:00:00" },
    { id: 143, name: "Sentiment Analysis",              description: "Classify text as positive, negative, neutral.",    materials: 2, duration: 60,  status: "Published", created: "03/15/2025\n08:00:00" },
    { id: 144, name: "Named Entity Recognition",        description: "Extracting people, places, and things from text.", materials: 2, duration: 55,  status: "Archived", created: "03/15/2025\n10:30:00" },
    { id: 145, name: "Transformers & BERT",             description: "Attention mechanisms and pretrained models.",       materials: 2, duration: 70,  status: "Published", created: "03/16/2025\n09:00:00" },
    { id: 146, name: "Building an NLP Pipeline",        description: "End-to-end NLP project with spaCy.",              materials: 2, duration: 70,  status: "Archived", created: "03/16/2025\n11:30:00" },
  ],

  // courseId 25 — ML Model Deployment
  25: [
    { id: 147, name: "Saving & Loading Models",         description: "Pickle, joblib, and ONNX formats.",                materials: 1, duration: 40,  status: "Published", created: "03/15/2025\n08:00:00" },
    { id: 148, name: "Building APIs with FastAPI",       description: "Serve predictions via REST endpoints.",            materials: 2, duration: 60,  status: "Published", created: "03/15/2025\n10:00:00" },
    { id: 149, name: "Dockerizing ML Models",           description: "Containerize your model for reproducibility.",     materials: 2, duration: 55,  status: "Published", created: "03/16/2025\n08:00:00" },
    { id: 150, name: "Model Monitoring",                description: "Track drift, accuracy, and latency in production.", materials: 1, duration: 50,  status: "Archived", created: "03/16/2025\n11:00:00" },
  ],

  // ─── Stream 8: Cybersecurity Fundamentals ───────────────────────────────────

  // courseId 26 — Cybersecurity Fundamentals
  26: [
    { id: 151, name: "Cybersecurity Overview",          description: "CIA triad, threat actors, and attack vectors.",    materials: 2, duration: 50,  status: "Published", created: "03/16/2025\n08:00:00" },
    { id: 152, name: "Cryptography Basics",             description: "Symmetric, asymmetric encryption, and hashing.",   materials: 2, duration: 55,  status: "Published", created: "03/16/2025\n10:00:00" },
    { id: 153, name: "Common Vulnerabilities",          description: "OWASP Top 10 and CVE database.",                   materials: 2, duration: 55,  status: "Published", created: "03/17/2025\n08:00:00" },
    { id: 154, name: "Incident Response",               description: "Detect, contain, and recover from breaches.",      materials: 2, duration: 60,  status: "Published", created: "03/17/2025\n10:30:00" },
    { id: 155, name: "Security Policies & Compliance",  description: "ISO 27001, NIST, and security frameworks.",        materials: 2, duration: 50,  status: "Archived", created: "03/18/2025\n09:00:00" },
  ],

  // courseId 27 — Network Security
  27: [
    { id: 156, name: "TCP/IP & OSI Model",              description: "Understanding network protocols and layers.",       materials: 2, duration: 55,  status: "Published", created: "03/17/2025\n08:00:00" },
    { id: 157, name: "Firewalls & Packet Filtering",    description: "Configuring rules and stateful inspection.",       materials: 2, duration: 60,  status: "Published", created: "03/17/2025\n10:00:00" },
    { id: 158, name: "VPNs & Tunneling",                description: "Secure remote access with VPN technologies.",      materials: 2, duration: 55,  status: "Published", created: "03/18/2025\n08:00:00" },
    { id: 159, name: "Intrusion Detection Systems",     description: "Snort, Suricata, and anomaly-based IDS.",          materials: 2, duration: 60,  status: "Published", created: "03/18/2025\n10:30:00" },
    { id: 160, name: "Wireless Security",               description: "WPA3, rogue APs, and Wi-Fi attack mitigation.",    materials: 1, duration: 50,  status: "Archived", created: "03/19/2025\n09:00:00" },
  ],

  // courseId 28 — Ethical Hacking Basics
  28: [
    { id: 161, name: "Penetration Testing Methodology", description: "Recon, scanning, exploitation, and reporting.",    materials: 2, duration: 60,  status: "Published", created: "03/18/2025\n08:00:00" },
    { id: 162, name: "Kali Linux & Toolset",            description: "Essential tools: nmap, Metasploit, Burp Suite.",   materials: 2, duration: 70,  status: "Published", created: "03/18/2025\n10:30:00" },
    { id: 163, name: "Web App Exploitation",            description: "SQL injection, XSS, and CSRF attacks.",            materials: 2, duration: 65,  status: "Published", created: "03/19/2025\n08:00:00" },
    { id: 164, name: "Password Cracking",               description: "Hashcat, John the Ripper, and rainbow tables.",    materials: 2, duration: 55,  status: "Published", created: "03/19/2025\n10:30:00" },
    { id: 165, name: "Writing Pentest Reports",         description: "Documenting findings for stakeholders.",            materials: 1, duration: 55,  status: "Archived", created: "03/20/2025\n09:00:00" },
    { id: 166, name: "Capture the Flag (CTF) Practice", description: "Hands-on challenges to sharpen hacking skills.",  materials: 2, duration: 75,  status: "Published", created: "03/20/2025\n11:00:00" },
  ],

  // ─── Stream 9: DevOps Engineering ───────────────────────────────────────────

  // courseId 29 — CI/CD Pipelines
  29: [
    { id: 167, name: "What is CI/CD",                   description: "Continuous integration and delivery principles.",  materials: 1, duration: 35,  status: "Published", created: "03/21/2025\n08:00:00" },
    { id: 168, name: "GitHub Actions",                  description: "Build automated workflows with YAML.",             materials: 2, duration: 60,  status: "Published", created: "03/21/2025\n10:00:00" },
    { id: 169, name: "Testing in Pipelines",            description: "Unit tests, lint checks, and coverage reports.",   materials: 2, duration: 55,  status: "Published", created: "03/22/2025\n08:00:00" },
    { id: 170, name: "Deployment Strategies",           description: "Blue-green, canary, and rolling deployments.",     materials: 2, duration: 60,  status: "Published", created: "03/22/2025\n10:30:00" },
    { id: 171, name: "Secrets & Environment Mgmt",      description: "Managing credentials and config securely.",        materials: 1, duration: 50,  status: "Archived", created: "03/23/2025\n09:00:00" },
  ],

  // courseId 30 — Docker & Containerization
  30: [
    { id: 172, name: "Container Concepts",              description: "VMs vs containers and the Docker architecture.",    materials: 1, duration: 40,  status: "Published", created: "03/21/2025\n08:00:00" },
    { id: 173, name: "Writing Dockerfiles",             description: "Building efficient and layered Docker images.",     materials: 2, duration: 55,  status: "Published", created: "03/21/2025\n10:00:00" },
    { id: 174, name: "Docker Compose",                  description: "Multi-container apps with docker-compose.yml.",    materials: 2, duration: 60,  status: "Published", created: "03/22/2025\n08:00:00" },
    { id: 175, name: "Docker Networking",               description: "Bridge, host, and overlay networks.",               materials: 2, duration: 55,  status: "Published", created: "03/22/2025\n10:30:00" },
    { id: 176, name: "Docker Registry & Hub",           description: "Pushing and pulling images from registries.",       materials: 1, duration: 40,  status: "Archived", created: "03/23/2025\n09:00:00" },
  ],

  // courseId 31 — Kubernetes Orchestration
  31: [
    { id: 177, name: "Kubernetes Architecture",         description: "Nodes, pods, and the control plane.",               materials: 2, duration: 55,  status: "Published", created: "03/22/2025\n08:00:00" },
    { id: 178, name: "Deployments & Services",          description: "Manage workloads and expose them to traffic.",      materials: 2, duration: 65,  status: "Published", created: "03/22/2025\n10:30:00" },
    { id: 179, name: "ConfigMaps & Secrets",            description: "Injecting configuration into containers.",          materials: 2, duration: 55,  status: "Published", created: "03/23/2025\n08:00:00" },
    { id: 180, name: "Auto-scaling & Load Balancing",   description: "HPA, VPA, and ingress controllers.",                materials: 2, duration: 65,  status: "Published", created: "03/23/2025\n10:30:00" },
    { id: 181, name: "Helm Charts",                     description: "Package and deploy apps with Helm.",                materials: 2, duration: 60,  status: "Published", created: "03/24/2025\n09:00:00" },
    { id: 182, name: "Monitoring with Prometheus",      description: "Metrics collection and Grafana dashboards.",        materials: 2, duration: 60,  status: "Archived", created: "03/24/2025\n11:00:00" },
  ],

  // courseId 32 — Infrastructure as Code
  32: [
    { id: 183, name: "IaC Concepts",                    description: "Declarative vs imperative infrastructure.",         materials: 1, duration: 35,  status: "Published", created: "03/23/2025\n08:00:00" },
    { id: 184, name: "Terraform Basics",                description: "Providers, resources, and state files.",            materials: 2, duration: 60,  status: "Published", created: "03/23/2025\n10:00:00" },
    { id: 185, name: "Terraform Modules",               description: "Reusable and composable infrastructure code.",      materials: 2, duration: 55,  status: "Published", created: "03/24/2025\n08:00:00" },
    { id: 186, name: "Ansible Playbooks",               description: "Automate server configuration with Ansible.",       materials: 1, duration: 55,  status: "Archived", created: "03/24/2025\n11:00:00" },
  ],

  // ─── Stream 10: Product Management Basics ───────────────────────────────────

  // courseId 33 — Product Thinking
  33: [
    { id: 187, name: "What is Product Management",      description: "Roles, responsibilities, and PM mindset.",          materials: 2, duration: 45,  status: "Published", created: "03/23/2025\n08:00:00" },
    { id: 188, name: "User Research & Personas",        description: "Understanding your users and their needs.",         materials: 2, duration: 55,  status: "Published", created: "03/23/2025\n10:00:00" },
    { id: 189, name: "Problem Framing",                 description: "Defining the right problem before building.",       materials: 1, duration: 50,  status: "Published", created: "03/24/2025\n08:00:00" },
    { id: 190, name: "Product Vision & Strategy",       description: "Setting direction and aligning stakeholders.",      materials: 1, duration: 50,  status: "Archived", created: "03/24/2025\n11:00:00" },
  ],

  // courseId 34 — Roadmap & Agile Planning
  34: [
    { id: 191, name: "Agile & Scrum Fundamentals",      description: "Sprints, ceremonies, and team roles.",              materials: 2, duration: 55,  status: "Published", created: "03/23/2025\n08:00:00" },
    { id: 192, name: "Writing User Stories",            description: "Structuring stories with acceptance criteria.",     materials: 2, duration: 50,  status: "Published", created: "03/23/2025\n10:30:00" },
    { id: 193, name: "Prioritization Frameworks",       description: "RICE, MoSCoW, and Kano model.",                    materials: 1, duration: 55,  status: "Published", created: "03/24/2025\n09:00:00" },
    { id: 194, name: "Building a Product Roadmap",      description: "Now-Next-Later and OKR-driven roadmaps.",           materials: 1, duration: 55,  status: "Archived", created: "03/24/2025\n11:00:00" },
  ],

  // ─── Stream 11: JavaScript Advanced Concepts ────────────────────────────────

  // courseId 35 — Closures & Scope
  35: [
    { id: 195, name: "Execution Context",               description: "How JS executes code: global and function scope.",  materials: 2, duration: 45,  status: "Published", created: "03/26/2025\n08:00:00" },
    { id: 196, name: "Lexical Scope & Closures",        description: "Functions that remember their outer environment.",  materials: 2, duration: 55,  status: "Published", created: "03/26/2025\n10:00:00" },
    { id: 197, name: "The Module Pattern",              description: "Encapsulation using closures.",                     materials: 1, duration: 45,  status: "Published", created: "03/27/2025\n08:00:00" },
    { id: 198, name: "Hoisting & Temporal Dead Zone",   description: "var, let, const, and how they behave.",             materials: 2, duration: 50,  status: "Published", created: "03/27/2025\n10:30:00" },
    { id: 199, name: "this Keyword Deep Dive",          description: "Binding rules and common pitfalls.",                materials: 1, duration: 45,  status: "Archived", created: "03/28/2025\n09:00:00" },
  ],

  // courseId 36 — Async JavaScript
  36: [
    { id: 200, name: "Callbacks & Callback Hell",       description: "The original async pattern and its problems.",     materials: 2, duration: 50,  status: "Published", created: "03/26/2025\n08:00:00" },
    { id: 201, name: "Promises",                        description: "Chaining, error handling, and Promise.all.",        materials: 2, duration: 65,  status: "Published", created: "03/26/2025\n10:30:00" },
    { id: 202, name: "async / await",                   description: "Writing async code that reads like sync.",          materials: 2, duration: 60,  status: "Published", created: "03/27/2025\n08:00:00" },
    { id: 203, name: "The Event Loop",                  description: "Call stack, task queue, and microtasks explained.", materials: 2, duration: 65,  status: "Published", created: "03/27/2025\n10:30:00" },
    { id: 204, name: "Fetch API & Axios",               description: "Making HTTP requests from the browser.",            materials: 2, duration: 55,  status: "Archived", created: "03/28/2025\n09:00:00" },
  ],

  // courseId 37 — JS Performance Optimization
  37: [
    { id: 205, name: "Chrome DevTools Profiling",       description: "Identify bottlenecks with the Performance tab.",   materials: 2, duration: 55,  status: "Published", created: "03/27/2025\n08:00:00" },
    { id: 206, name: "Memory Management",               description: "Garbage collection and memory leak detection.",     materials: 2, duration: 60,  status: "Published", created: "03/27/2025\n10:00:00" },
    { id: 207, name: "Debouncing & Throttling",         description: "Control execution frequency for perf gains.",       materials: 2, duration: 50,  status: "Published", created: "03/28/2025\n08:00:00" },
    { id: 208, name: "Rendering Performance",           description: "Reflows, repaints, and the RAIL model.",            materials: 1, duration: 55,  status: "Published", created: "03/28/2025\n10:30:00" },
    { id: 209, name: "Code Splitting & Lazy Loading",   description: "Load only what you need, when you need it.",        materials: 1, duration: 55,  status: "Archived", created: "03/29/2025\n09:00:00" },
  ],

  // ─── Stream 12: Mobile App Development ──────────────────────────────────────

  // courseId 38 — React Native Basics
  38: [
    { id: 210, name: "React Native Setup",              description: "Expo CLI, Metro bundler, and project structure.",   materials: 1, duration: 40,  status: "Published", created: "03/29/2025\n08:00:00" },
    { id: 211, name: "Core Components",                 description: "View, Text, Image, ScrollView, and FlatList.",      materials: 2, duration: 55,  status: "Published", created: "03/29/2025\n10:00:00" },
    { id: 212, name: "Styling in React Native",         description: "StyleSheet API and responsive design.",             materials: 2, duration: 55,  status: "Published", created: "03/30/2025\n08:00:00" },
    { id: 213, name: "Touchables & Gestures",           description: "Handling user interactions on mobile.",             materials: 2, duration: 50,  status: "Published", created: "03/30/2025\n10:30:00" },
    { id: 214, name: "Accessing Device APIs",           description: "Camera, location, and push notifications.",         materials: 1, duration: 50,  status: "Archived", created: "03/31/2025\n09:00:00" },
  ],

  // courseId 39 — Navigation & State Management
  39: [
    { id: 215, name: "React Navigation Setup",          description: "Stack, tab, and drawer navigators.",                materials: 2, duration: 60,  status: "Published", created: "03/29/2025\n08:00:00" },
    { id: 216, name: "Passing Params Between Screens",  description: "Navigation props and route parameters.",            materials: 2, duration: 55,  status: "Published", created: "03/29/2025\n10:30:00" },
    { id: 217, name: "Redux Toolkit",                   description: "Modern Redux with slices and thunks.",              materials: 2, duration: 65,  status: "Published", created: "03/30/2025\n08:00:00" },
    { id: 218, name: "Zustand for Mobile",              description: "Lightweight state management alternative.",         materials: 1, duration: 55,  status: "Archived", created: "03/30/2025\n11:00:00" },
    { id: 219, name: "Persisting State with MMKV",      description: "Fast local storage for React Native.",              materials: 2, duration: 55,  status: "Published", created: "03/31/2025\n09:00:00" },
  ],

  // courseId 40 — API Integration & Publishing
  40: [
    { id: 220, name: "REST API Integration",            description: "Fetch and Axios with React Native.",                materials: 2, duration: 55,  status: "Published", created: "03/30/2025\n08:00:00" },
    { id: 221, name: "Authentication Flows",            description: "Login, tokens, and secure storage.",                materials: 2, duration: 65,  status: "Published", created: "03/30/2025\n10:00:00" },
    { id: 222, name: "Publishing to App Store",         description: "Certificates, provisioning, and App Store Connect.", materials: 1, duration: 70, status: "Published", created: "03/31/2025\n08:00:00" },
    { id: 223, name: "Publishing to Google Play",       description: "APK/AAB signing and Play Console submission.",      materials: 1, duration: 70,  status: "Archived", created: "03/31/2025\n11:00:00" },
  ],

  // ─── Stream 13: Blockchain Development ──────────────────────────────────────

  // courseId 41 — Blockchain Basics
  41: [
    { id: 224, name: "How Blockchain Works",            description: "Blocks, hashes, and immutable ledgers.",            materials: 2, duration: 50,  status: "Published", created: "03/31/2025\n08:00:00" },
    { id: 225, name: "Consensus Mechanisms",            description: "Proof of Work, Proof of Stake, and more.",          materials: 2, duration: 55,  status: "Published", created: "03/31/2025\n10:00:00" },
    { id: 226, name: "Wallets & Keys",                  description: "Public/private keys and wallet management.",        materials: 1, duration: 45,  status: "Published", created: "04/01/2025\n08:00:00" },
    { id: 227, name: "Bitcoin vs Ethereum",             description: "Comparing the two largest blockchain networks.",    materials: 1, duration: 50,  status: "Archived", created: "04/01/2025\n11:00:00" },
  ],

  // courseId 42 — Smart Contracts with Solidity
  42: [
    { id: 228, name: "Solidity Basics",                 description: "Data types, functions, and contract structure.",    materials: 2, duration: 60,  status: "Published", created: "03/31/2025\n08:00:00" },
    { id: 229, name: "Storage & Memory",                description: "Understanding storage layout in Solidity.",         materials: 2, duration: 65,  status: "Published", created: "03/31/2025\n10:30:00" },
    { id: 230, name: "Events & Modifiers",              description: "Emitting events and access control modifiers.",     materials: 2, duration: 55,  status: "Published", created: "04/01/2025\n08:00:00" },
    { id: 231, name: "Contract Testing with Hardhat",   description: "Write and run tests for your smart contracts.",     materials: 2, duration: 65,  status: "Published", created: "04/01/2025\n10:30:00" },
    { id: 232, name: "Deploying to Testnet",            description: "Deploy contracts to Sepolia and Goerli.",           materials: 2, duration: 55,  status: "Archived", created: "04/02/2025\n09:00:00" },
  ],

  // courseId 43 — DeFi & Web3 Concepts
  43: [
    { id: 233, name: "What is DeFi",                    description: "Protocols, DEXs, and yield farming basics.",        materials: 2, duration: 55,  status: "Published", created: "04/01/2025\n08:00:00" },
    { id: 234, name: "Stablecoins & Liquidity Pools",   description: "USDC, DAI, and AMM mechanisms.",                   materials: 2, duration: 60,  status: "Published", created: "04/01/2025\n10:00:00" },
    { id: 235, name: "NFTs & Token Standards",          description: "ERC-20, ERC-721, and ERC-1155 explained.",         materials: 1, duration: 55,  status: "Archived", created: "04/02/2025\n08:00:00" },
    { id: 236, name: "Web3 Architecture",               description: "Frontend, wallet, and contract interaction layer.", materials: 1, duration: 50,  status: "Published", created: "04/02/2025\n11:00:00" },
  ],

  // courseId 44 — Building dApps
  44: [
    { id: 237, name: "Setting Up a Web3 Project",       description: "Vite, React, and ethers.js scaffold.",              materials: 2, duration: 50,  status: "Published", created: "04/01/2025\n08:00:00" },
    { id: 238, name: "Connecting Wallets",              description: "MetaMask integration and account management.",      materials: 2, duration: 60,  status: "Published", created: "04/01/2025\n10:00:00" },
    { id: 239, name: "Reading from Contracts",          description: "Calling view functions with ethers.js.",            materials: 2, duration: 55,  status: "Published", created: "04/02/2025\n08:00:00" },
    { id: 240, name: "Writing to Contracts",            description: "Sending transactions and handling gas.",            materials: 2, duration: 65,  status: "Published", created: "04/02/2025\n10:30:00" },
    { id: 241, name: "dApp Capstone Project",           description: "Build a complete decentralized application.",       materials: 2, duration: 90,  status: "Archived", created: "04/03/2025\n09:00:00" },
  ],
};