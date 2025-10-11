// Navigation utilities for state management

/**
 * Clear all navigation states for external navigation (from navbar, direct URL, etc.)
 * This ensures fresh start when navigating between different sections
 */
export const clearNavigationStates = () => {
  // Clear company states
  sessionStorage.removeItem("companyScrollPosition");
  sessionStorage.removeItem("companyPage");
  sessionStorage.removeItem("companyFilterState");
  
  // Clear job states
  sessionStorage.removeItem("jobScrollPosition");
  sessionStorage.removeItem("jobPage");
  sessionStorage.removeItem("jobFilterState");
};

/**
 * Navigate to jobs page with clean state
 */
export const navigateToJobs = (navigate: (path: string) => void) => {
  clearNavigationStates();
  navigate("/jobs");
};

/**
 * Navigate to companies page with clean state
 */
export const navigateToCompanies = (navigate: (path: string) => void) => {
  clearNavigationStates();
  navigate("/companies");
};