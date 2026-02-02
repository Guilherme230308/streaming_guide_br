import { checkAvailabilityChanges } from "./availabilityChecker";

/**
 * Background jobs that should run periodically
 * This can be triggered via cron jobs, scheduled tasks, or manual API calls
 */

export interface JobResult {
  success: boolean;
  jobName: string;
  timestamp: Date;
  details?: any;
  error?: string;
}

/**
 * Run the availability checker job
 * Recommended frequency: every 6-12 hours
 */
export async function runAvailabilityCheckJob(): Promise<JobResult> {
  const jobName = "availability_check";
  const timestamp = new Date();
  
  try {
    console.log(`[BackgroundJobs] Starting ${jobName} at ${timestamp.toISOString()}`);
    
    const result = await checkAvailabilityChanges();
    
    console.log(`[BackgroundJobs] Completed ${jobName}:`, result);
    
    return {
      success: true,
      jobName,
      timestamp,
      details: result
    };
  } catch (error) {
    console.error(`[BackgroundJobs] Error in ${jobName}:`, error);
    
    return {
      success: false,
      jobName,
      timestamp,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Run all scheduled background jobs
 */
export async function runAllJobs(): Promise<JobResult[]> {
  const results: JobResult[] = [];
  
  // Run availability check
  results.push(await runAvailabilityCheckJob());
  
  // Add more jobs here as needed
  
  return results;
}
