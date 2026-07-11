import { CategoryService } from "@/services/category.service";
import { DepartmentService } from "@/services/department.service";
import { GeneralService } from "@/services/general.service";
import { SiteDataService } from "@/services/site-data.service";
import type { AdBanner } from "@/types/db/ad-banner.types";
import type { Announcement } from "@/types/db/announcement.types";
import type { Category } from "@/types/db/category.types";
import type { Department } from "@/types/db/department.types";
import type { GigListItem } from "@/types/db/gig.types";
import type { HeroBanner } from "@/types/db/hero-banner.types";
import type { JobListItem } from "@/types/db/job.types";
import type { SystemConfig } from "@/types/db/system-config.types";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PublicSiteData {
  system_config: SystemConfig | null;
  hero_banners: HeroBanner[];
  ad_banners: AdBanner[];
  announcements: Announcement[];
}

export interface HomepageData {
  gigs: GigListItem[];
  jobs: JobListItem[];
  tuitions: JobListItem[];
}

export interface InitialSiteData {
  siteData: PublicSiteData | null;
  homepageData: HomepageData | null;
  categories: Category[];
  departments: Department[];
}

// ─── Server-side data fetchers ──────────────────────────────────────────────

/**
 * Fetch all public site data using the existing SiteDataService.
 */
async function fetchSiteData(): Promise<PublicSiteData | null> {
  try {
    const result = await SiteDataService.getPublicSiteData();
    return result.success ? result.data : null;
  } catch (err) {
    console.error("fetchSiteData error:", err);
    return null;
  }
}

/**
 * Fetch homepage data using the existing GeneralService.
 */
async function fetchHomepageData(): Promise<HomepageData | null> {
  try {
    const result = await GeneralService.getHomepageData();
    return result.success ? result.data : null;
  } catch (err) {
    console.error("fetchHomepageData error:", err);
    return null;
  }
}

/**
 * Fetch categories (limit=40) using the existing CategoryService.
 */
async function fetchCategories(): Promise<Category[]> {
  try {
    const result = await CategoryService.list({ page: 1, limit: 40 });
    return result.success ? result.data.items : [];
  } catch (err) {
    console.error("fetchCategories error:", err);
    return [];
  }
}

/**
 * Fetch departments (limit=40) using the existing DepartmentService.
 */
async function fetchDepartments(): Promise<Department[]> {
  try {
    const result = await DepartmentService.list({ page: 1, limit: 40 });
    return result.success ? result.data.items : [];
  } catch (err) {
    console.error("fetchDepartments error:", err);
    return [];
  }
}

/**
 * Fetch ALL initial site data in parallel on the server.
 * Call this from the root layout to get everything at once.
 */
export async function fetchAllInitialSiteData(): Promise<InitialSiteData> {
  const [siteData, homepageData, categories, departments] = await Promise.all([
    fetchSiteData(),
    fetchHomepageData(),
    fetchCategories(),
    fetchDepartments(),
  ]);

  return {
    siteData,
    homepageData,
    categories,
    departments,
  };
}
