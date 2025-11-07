import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import type { Job, JobsCountDetails, JobsResponse } from "@/types/job"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axiosConfig from "@/config/axios.config"
import { JobCard } from "@/components/job"
import { CreateJobDialog } from "@/components/job/CreateJobDialog"
import { JobHeroCard } from "@/components/job/jobDetails/JobHeroCard"
import { JobDescriptionCard } from "@/components/job/jobDetails/JobDescriptionCard"
import { DeleteJobDialog } from "@/components/job/DeleteJobDialog"
import { useAuthStore } from "@/store"
import { toast } from "sonner"
import { useJobStore } from "@/store/job.store"
import { JobDetailSkeleton } from "@/components/job"
import { deleteJob } from "@/api/job_api"

export function CompanyProfile() {
    const authUser = useAuthStore((s) => s.authUser);
    const { selectedJob, isLoading: jobLoading, getJobById } = useJobStore();
    const [jobs, setJobs] = useState<(Job & JobsCountDetails)[]>([])
    const [viewingJobId, setViewingJobId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [companyInfo, setCompanyInfo] = useState<{ name: string; avatar: string } | null>(null)
    const [jobCategories, setJobCategories] = useState<{ job_category: string }[]>([])

    // Delete confirmation dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

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
        setCurrentPage(1)
        window.location.reload()
    }

    const handleJobClick = async (job: Job & JobsCountDetails) => {
        setViewingJobId(job.id)
        await getJobById({ jobId: job.id })
        window.scrollTo(0, 0)
    }

    const handleBackToList = () => {
        setViewingJobId(null)
    }

    const handleDeleteClick = (jobId: string, jobTitle: string) => {
        setJobToDelete({ id: jobId, title: jobTitle })
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!jobToDelete) return

        setIsDeleting(true)
        try {
            const response = await deleteJob(jobToDelete.id)
            if (response) {
                toast.success("Xóa tin tuyển dụng thành công")

                // Remove from jobs list
                setJobs(jobs.filter(job => job.id !== jobToDelete.id))

                // If viewing the deleted job, go back to list
                if (viewingJobId === jobToDelete.id) {
                    setViewingJobId(null)
                }

                // Close dialog
                setDeleteDialogOpen(false)
                setJobToDelete(null)
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Xóa tin tuyển dụng thất bại")
        } finally {
            setIsDeleting(false)
        }
    }

    if (loading && currentPage === 1) {
        return (
            <div className="max-w-5xl min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
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
            <div className="max-w-5xl min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        )
    }

    // Job Details View
    if (viewingJobId && selectedJob) {
        // Show loading skeleton while fetching job details
        if (jobLoading) {
            return (
                <div className="max-w-5xl min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
                    <JobDetailSkeleton />
                </div>
            )
        }

        const {
            job_title = "Chưa có tiêu đề",
            salary: salaryArray,
            currency,
            location = "Không xác định",
            experience = "Không yêu cầu",
            description = "",
            benefit = "Không xác định",
            working_time = "Không xác định",
            job_type = "Không xác định",
            job_level = "",
            quantity = 1,
            skill_tags = [],
            education = "",
            start_date,
            end_date,
            created_at,
            updated_at,
            jobCategories,
            jobLabels,
        } = selectedJob;

        const salary =
            Array.isArray(salaryArray) && salaryArray.length > 0
                ? `${salaryArray[0]} ${currency || "VND"}`
                : `Thỏa thuận ${currency || "VND"}`;

        return (
            <div className="max-w-5xl min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBackToList}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                    </Button>
                </div>

                {/* Job Details */}
                <div className="space-y-6">
                    <JobHeroCard
                        job_title={job_title}
                        salary={salary}
                        location={location}
                        experience={experience}
                        quantity={quantity}
                        end_date={end_date || undefined}
                        jobCategories={jobCategories || undefined}
                        jobLabels={jobLabels || undefined}
                        isApplied={false}
                        isSaved={false}
                        applicants={[]}
                        onApply={() => { }}
                        onSave={() => { }}
                    />

                    <JobDescriptionCard
                        description={description}
                        education={education}
                        experience={experience}
                        job_level={job_level}
                        skill_tags={skill_tags}
                        benefit={benefit || undefined}
                        working_time={working_time || undefined}
                        job_type={job_type}
                        start_date={start_date}
                        end_date={end_date || undefined}
                        created_at={created_at}
                        updated_at={updated_at}
                    />
                </div>
            </div>
        )
    }

    // Jobs List View
    return (
        <>
            <div className="max-w-5xl min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6">
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
                                onClick={() => handleJobClick(job)}
                                onDelete={() => handleDeleteClick(job.id, job.job_title)}
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

            {/* Delete Confirmation Dialog */}
            <DeleteJobDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                jobTitle={jobToDelete?.title || ""}
                isDeleting={isDeleting}
            />
        </>
    )
}