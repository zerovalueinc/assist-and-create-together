export interface GTMICPSchema {
  schemaVersion: string;
  personas: { title: string; role: string; painPoints: string[]; responsibilities?: string[] }[];
  firmographics: { industry: string; companySize: string; revenueRange: string; region: string };
  messagingAngles: string[];
  gtmRecommendations: string;
  competitivePositioning: string;
  objectionHandling: string[];
  campaignIdeas: string[];
  metricsToTrack: string[];
  filmReviews: string;
  crossFunctionalAlignment: string;
  demandGenFramework: string;
  iterativeMeasurement: string;
  trainingEnablement: string;
  apolloSearchParams?: {
    employeeCount: string;
    titles: string[];
    industries: string[];
    technologies: string[];
    locations: string[];
  };
} 