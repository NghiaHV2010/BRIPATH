import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Job, JobsCountDetails, JobsResponse } from "@/types/job"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axiosConfig from "@/config/axios.config"
import { JobCard } from "@/components/job"
import { CreateJobDialog } from "@/components/job/CreateJobDialog"
import { useAuthStore } from "@/store"

export function CompanyProfile() {
    const authUser = useAuthStore((s) => s.authUser);
    const [jobs, setJobs] = useState<(Job & JobsCountDetails)[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [companyInfo, setCompanyInfo] = useState<{ name: string; avatar: string } | null>(null)
    const [jobCategories, setJobCategories] = useState<{ job_category: string }[]>([])

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true)
                const response = await axiosConfig.get<JobsResponse>(
                    `/my-jobs?page=${currentPage}`
                )

                if (response.data.success && response.data.data) {
                    setJobs(response.data.data)
                    setTotalPages(response.data.totalPages || 1)

                    if (response.data.data.length > 0 && !companyInfo) {
                        const firstJob = response.data?.data[0]
                        setCompanyInfo({
                            name: firstJob?.companies?.users?.username || "",
                            avatar: firstJob?.companies?.users?.avatar_url || "",
                        })
                    }
                }
            } catch (err) {
                setError("An error occurred while fetching jobs")
            } finally {
                setLoading(false)
            }
        }

        fetchJobs()
    }, [currentPage, companyInfo])

    // Fetch job categories
    useEffect(() => {
        const fetchJobCategories = async () => {
            try {
                const response = await axiosConfig.get("/job/categories")
                if (response.data.success) {
                    setJobCategories(response.data.data)
                }
            } catch (err) {
                console.error("Error fetching job categories:", err)
            }
        }
        fetchJobCategories()
    }, [])

    const handleJobCreated = () => {
        // Refresh jobs list
        setCurrentPage(1)
        window.location.reload()
    }

    if (loading && currentPage === 1) {
        return (
            <div className="max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-5xl w-[95%] px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Công việc đã đăng tải</h2>
                {jobs.length > 0 && (
                    <CreateJobDialog
                        jobCategories={jobCategories}
                        onJobCreated={handleJobCreated}
                    />
                )}
            </div>

            {jobs.length === 0 ? (
                <Card className="">
                    <CardContent className="flex h-[80vh] min-w-4xl items-center justify-center ">
                        <div className="text-center">
                            <p className="mb-4 text-gray-500">Chưa có công việc nào</p>
                            <CreateJobDialog
                                jobCategories={jobCategories}
                                onJobCreated={handleJobCreated}
                            />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4">
                    {jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            compact={false}
                            role={authUser?.roles.role_name as "Company" | undefined}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                    >
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    )
}