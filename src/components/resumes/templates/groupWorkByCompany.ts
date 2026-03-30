interface WorkExperience {
  company: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  points: string[];
}

export interface GroupedCompany {
  company: string;
  roles: {
    title: string;
    start_date: string | null;
    end_date: string | null;
    points: string[];
  }[];
}

export function groupWorkByCompany(workExperiences: WorkExperience[]): GroupedCompany[] {
  const map = new Map<string, GroupedCompany>();
  const order: string[] = [];

  for (const w of workExperiences) {
    const key = w.company.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, { company: w.company, roles: [] });
      order.push(key);
    }
    map.get(key)!.roles.push({
      title: w.title,
      start_date: w.start_date,
      end_date: w.end_date,
      points: w.points,
    });
  }

  return order.map((k) => map.get(k)!);
}
