// ============================================================
// Types for the admin dashboard data returned by
// get_admin_dashboard_data RPC function.
// ============================================================

export interface DashboardStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  verified_users: number;
  total_gigs: number;
  active_gigs: number;
  total_jobs: number;
  active_jobs: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  in_progress_orders: number;
  total_revenue: number;
  total_platform_fee: number;
  total_escrow: number;
  total_categories: number;
  total_departments: number;
  total_proposals: number;
  total_reviews: number;
  avg_rating: number;
}

export interface MonthlyDataPoint {
  year: number;
  month: number;
  count: number;
  revenue?: number;
}

export interface RecentGig {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

export interface RecentJob {
  id: string;
  title: string;
  created_at: string;
  status: string;
}

export interface RecentSignup {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  verified: boolean;
  created_at: string;
}

export interface RecentOrder {
  id: string;
  code: string;
  title: string;
  total_price: number;
  status: string;
  source: string;
  created_at: string;
  buyer: { id: string; name: string } | null;
  seller: { id: string; name: string } | null;
}

export interface DistributionItem {
  [key: string]: string | number;
  count: number;
}

export interface CategoryDistribution {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface DepartmentDistribution {
  id: string;
  name: string;
  acronym: string | null;
  count: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  monthly_signups: MonthlyDataPoint[];
  monthly_orders: MonthlyDataPoint[];
  monthly_gigs: MonthlyDataPoint[];
  monthly_jobs: MonthlyDataPoint[];
  recent_gigs: RecentGig[];
  recent_jobs: RecentJob[];
  recent_signups: RecentSignup[];
  recent_orders: RecentOrder[];
  orders_by_status: DistributionItem[];
  orders_by_source: DistributionItem[];
  users_by_role: DistributionItem[];
  gigs_by_status: DistributionItem[];
  jobs_by_status: DistributionItem[];
  jobs_by_type: DistributionItem[];
  top_gig_categories: CategoryDistribution[];
  top_job_categories: CategoryDistribution[];
  users_by_department: DepartmentDistribution[];
  rating_distribution: RatingDistribution[];
  proposals_by_status: DistributionItem[];
}
