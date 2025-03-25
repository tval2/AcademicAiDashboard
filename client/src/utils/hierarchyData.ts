// Define the curriculum hierarchy structure

export const AREA_ORDER = [
  "Foundational",
  "Subject Matter",
  "Applications & Upskilling",
];

export const AREA_MAPPING: { [key: string]: string[] } = {
  Foundational: [
    "1. Operations Research & Mathematical Foundations",
    "2. AI & ML Methods",
  ],
  "Subject Matter": [
    "3. Functional AI Applications",
    "4. Domain-based AI Applications",
  ],
  "Applications & Upskilling": [
    "5. Strategic, Managerial, Societal, & Implementation Implications",
    "6. Gen AI Tool Usage",
  ],
};

export const SUBCAT: { [key: string]: string[] } = {
  "1. Operations Research & Mathematical Foundations": [
    "1.1 Linear & Nonlinear Optimization",
    "1.2 Combinatorial & Robust Optimization",
    "1.3 Stochastic Processes & Probability",
    "1.4 Simulation & Queueing",
    "1.5 Game Theory & Dynamic Programming",
  ],
  "2. AI & ML Methods": [
    "2.1 Classical Machine Learning",
    "2.2 Deep Learning",
    "2.3 Reinforcement Learning",
    "2.4 Generative AI & NLP",
    "2.5 Explainable & Ethical AI",
  ],
  "3. Functional AI Applications": [
    "3.1 AI in Finance (the corporate function)",
    "3.2 AI in Marketing & Sales Insights",
    "3.3 AI in Operations & Supply Chain",
    "3.4 AI in HR & Organizational Management",
  ],
  "4. Domain-based AI Applications": [
    "4.1 Healthcare & Life Sciences",
    "4.2 Financial Services & Insurance",
    "4.3 Government, Education, & Public Sector",
    "4.4 Media & Entertainment",
    "4.5 Retail & Consumer Goods",
    "4.6 Manufacturing & Industrial",
    "4.7 Energy & Utilities",
    "4.8 Travel, Transportation & Hospitality",
    "4.9 Technology & Telecom",
    "4.10 Agriculture & Food",
  ],
  "5. Strategic, Managerial, Societal, & Implementation Implications": [
    "5.1 AI Strategy & Business Models",
    "5.2 AI Product Development & Implementation",
    "5.3 Economics & Policy of AI",
    "5.4 Ethics & Responsible AI",
    "5.5 Leadership & Organizational Transformation",
  ],
  "6. Gen AI Tool Usage": [
    "6.1 Prompt Engineering",
    "6.2 Other Modalities - Image, Sound, and Video Generators",
    "6.3 LLM Privacy and Safety",
    "6.4 AI Agents",
    "6.5 Efficiency Tools, Custom GPTs, Prototyping",
  ],
};

export const DEPTHS = [
  "Level 1 (Primary | >40%)",
  "Level 2 (Significant | 10-40%)",
  "Level 3 (Minor | < 10%)",
];
