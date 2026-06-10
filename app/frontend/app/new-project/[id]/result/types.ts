export interface ProjectResult {
  id: string;
  title: string;
  status: string;
  created_at: string;
  final_post: string | null;
  total_input_tokens: number;
  total_output_tokens: number;
  execution_time_seconds: number;
}
