export interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
  post: ProjectPost | null;
}

export interface ProjectPost {
  id: string;
  final_post: string | null;
  failed_facts: string[] | null;
}

export interface ProjectListResponse {
  projects: Project[];
}
