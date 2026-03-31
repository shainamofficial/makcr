export interface ResumeData {
  user: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone_number: string | null;
  };
  summary: string;
  workExperiences: {
    company: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
    points: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    discipline: string;
    start_date: string | null;
    end_date: string | null;
  }[];
  skills: {
    name: string;
    category: string;
    proficiency: string;
  }[];
  projects: {
    title: string;
    description: string;
    urls: string[];
  }[];
  profilePictureUrl: string | null;
  includePhoto: boolean;
  sectionOrder?: string[];
}
