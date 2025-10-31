export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  quantity: number;
  working_time?: string;
  banner_url?: string;
}
