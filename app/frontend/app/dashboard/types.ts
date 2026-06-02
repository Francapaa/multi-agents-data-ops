export interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
  post: ProjectPost | null;
  total_input_tokens?: number;
  total_output_tokens?: number;
  execution_time_seconds?: number;
  retry_count?: number;
}

export interface ProjectPost {
  id: string;
  final_post: string | null;
  failed_facts: string[] | null;
}

export interface ProjectListResponse {
  projects: Project[];
}

export interface MetricsOverview {
  total: number;
  completed: number;
  failed: number;
  success_rate: number;
}

export interface MetricsCosts {
  input_tokens: number;
  output_tokens: number;
  avg_time_seconds: number;
  cost_usd: number;
}

export interface MetricsHealth {
  success_rate: number;
  avg_retries: number;
}

export interface RecentPostRow {
  post_id: string;
  final_post: string | null;
  failed_facts: unknown;
  project_id: string;
  project_title: string;
  project_status: string;
}

export interface RecentPostsResponse {
  posts: RecentPostRow[];
}



export interface StreamState  {
  status: string | null;
  progress: number | null;
  complete: {
    total_input_tokens: number;
    total_output_tokens: number;
    execution_time: number;
  } | null;
  error: string | null;
};

export interface Event {
  event: string,
  data: string
}

export interface Payload {
  status: string,
  progress: number
}

export interface CompletePayload{
  total_input_tokens: number;
  total_output_tokens: number;
  execution_time: number;
}

export interface ErrorPayload{
  error: string
}