import { useState } from "react"
import { Loader2 as Loader, Plus, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import axiosConfig from "@/config/axios.config"
import toast from "react-hot-toast"
import { format } from "date-fns"

interface CreateJobDialogProps {
    trigger?: React.ReactNode
    onJobCreated?: () => void
    jobCategories: { job_category: string }[]
}

interface JobForm {
    job_title: string
    description: string
    location: string
    benefit: string
    working_time: string
    salary: string[]
    currency: string
    job_type: "remote" | "part_time" | "full_time" | "others"
    status: "on_going"
    job_level: string
    quantity: number
    skill_tags: string[]
    education: "highschool_graduate" | "phd" | "mastter" | "bachelor" | "others"
    experience: string
    start_date: Date | undefined
    end_date: Date | undefined
    category: string
    label_type: "none" | "Việc gấp" | "Việc chất"
}

export function CreateJobDialog({ trigger, onJobCreated, jobCategories }: CreateJobDialogProps) {
    const [showDialog, setShowDialog] = useState(false)
    const [creatingJob, setCreatingJob] = useState(false)
    const [skillInput, setSkillInput] = useState("")

    // Date picker component
    const DatePicker = ({
        date,
        onDateChange,
        placeholder = "Chọn ngày",
        disabled = false,
        minDate,
        maxDate
    }: {
        date: Date | undefined
        onDateChange: (date: Date | undefined) => void
        placeholder?: string
        disabled?: boolean
        minDate?: Date
        maxDate?: Date
    }) => {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                        disabled={disabled}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "yyyy-MM-dd") : placeholder}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={onDateChange}
                        disabled={(date) => {
                            if (minDate && date < minDate) return true
                            if (maxDate && date > maxDate) return true
                            return date < new Date("1900-01-01")
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        )
    }

    const [jobForm, setJobForm] = useState<JobForm>({
        job_title: "",
        description: "",
        location: "",
        benefit: "",
        working_time: "",
        salary: ["", ""],
        currency: "VND",
        job_type: "full_time",
        status: "on_going",
        job_level: "",
        quantity: 1,
        skill_tags: [],
        education: "bachelor",
        experience: "",
        start_date: undefined,
        end_date: undefined,
        category: "",
        label_type: "none"
    })

    const handleFormChange = (field: string, value: any) => {
        setJobForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const addSkillTag = () => {
        if (skillInput.trim() && !jobForm.skill_tags.includes(skillInput.trim())) {
            setJobForm(prev => ({
                ...prev,
                skill_tags: [...prev.skill_tags, skillInput.trim()]
            }))
            setSkillInput("")
        }
    }

    const removeSkillTag = (index: number) => {
        setJobForm(prev => ({
            ...prev,
            skill_tags: prev.skill_tags.filter((_, i) => i !== index)
        }))
    }

    const resetForm = () => {
        setJobForm({
            job_title: "",
            description: "",
            location: "",
            benefit: "",
            working_time: "",
            salary: ["", ""],
            currency: "VND",
            job_type: "full_time",
            status: "on_going",
            job_level: "",
            quantity: 1,
            skill_tags: [],
            education: "bachelor",
            experience: "",
            start_date: undefined,
            end_date: undefined,
            category: "",
            label_type: "none"
        })
        setSkillInput("")
    }

    const handleCreateJob = async () => {
        try {
            setCreatingJob(true)

            // Validate required fields
            if (!jobForm.job_title.trim()) {
                toast.error("Vui lòng nhập tiêu đề công việc")
                return
            }
            if (!jobForm.description.trim()) {
                toast.error("Vui lòng nhập mô tả công việc")
                return
            }
            if (!jobForm.job_level.trim()) {
                toast.error("Vui lòng nhập cấp độ công việc")
                return
            }
            if (!jobForm.start_date) {
                toast.error("Vui lòng chọn ngày bắt đầu")
                return
            }

            const jobData = {
                ...jobForm,
                salary: jobForm.salary.filter(s => s.trim()),
                label_type: jobForm.label_type === "none" ? null : jobForm.label_type,
                start_date: jobForm.start_date ? format(jobForm.start_date, 'yyyy-MM-dd') : undefined,
                end_date: jobForm.end_date ? format(jobForm.end_date, 'yyyy-MM-dd') : undefined,
            }

            console.log(jobData);


            const response = await axiosConfig.post("/job", jobData)

            if (response.data.success) {
                toast.success("Tạo công việc thành công!")
                setShowDialog(false)
                resetForm()
                onJobCreated?.()
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Có lỗi xảy ra khi tạo công việc")
        } finally {
            setCreatingJob(false)
        }
    }

    const defaultTrigger = (
        <Button size="default" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Tạo công việc mới
        </Button>
    )

    return (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="min-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo công việc mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin chi tiết để tạo một công việc mới
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Job Title */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="job_title" className="text-right">
                            Tiêu đề công việc *
                        </Label>
                        <Input
                            required={true}
                            id="job_title"
                            value={jobForm.job_title}
                            onChange={(e) => handleFormChange("job_title", e.target.value)}
                            className="col-span-3"
                            placeholder="Nhập tiêu đề công việc"
                        />
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                            Mô tả công việc *
                        </Label>
                        <Textarea
                            required={true}
                            id="description"
                            value={jobForm.description}
                            onChange={(e) => handleFormChange("description", e.target.value)}
                            className="col-span-3"
                            placeholder="Nhập mô tả chi tiết về công việc"
                            rows={4}
                        />
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                            Địa điểm
                        </Label>
                        <Input
                            id="location"
                            value={jobForm.location}
                            onChange={(e) => handleFormChange("location", e.target.value)}
                            className="col-span-3"
                            placeholder="Nhập địa điểm làm việc"
                        />
                    </div>

                    {/* Job Level */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="job_level" className="text-right">
                            Cấp độ *
                        </Label>
                        <Input
                            id="job_level"
                            value={jobForm.job_level}
                            onChange={(e) => handleFormChange("job_level", e.target.value)}
                            className="col-span-3"
                            placeholder="Ví dụ: Junior, Senior, Manager"
                        />
                    </div>

                    {/* Category */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Ngành nghề
                        </Label>
                        <Select
                            value={jobForm.category}
                            onValueChange={(value) => handleFormChange("category", value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn ngành nghề" />
                            </SelectTrigger>
                            <SelectContent>
                                {jobCategories.map((category) => (
                                    <SelectItem key={category.job_category} value={category.job_category}>
                                        {category.job_category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Salary Range */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Mức lương</Label>
                        <div className="col-span-3 flex gap-2 items-center">
                            <Input
                                value={jobForm.salary[0]}
                                onChange={(e) => {
                                    const newSalary = [...jobForm.salary]
                                    newSalary[0] = e.target.value
                                    handleFormChange("salary", newSalary)
                                }}
                                placeholder="Từ"
                            />
                            <span>-</span>
                            <Input
                                value={jobForm.salary[1]}
                                onChange={(e) => {
                                    const newSalary = [...jobForm.salary]
                                    newSalary[1] = e.target.value
                                    handleFormChange("salary", newSalary)
                                }}
                                placeholder="Đến"
                            />
                            <Select
                                value={jobForm.currency}
                                onValueChange={(value) => handleFormChange("currency", value)}
                            >
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="VND">VND</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Job Type */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Hình thức làm việc</Label>
                        <Select
                            value={jobForm.job_type}
                            onValueChange={(value) => handleFormChange("job_type", value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full_time">Toàn thời gian</SelectItem>
                                <SelectItem value="part_time">Bán thời gian</SelectItem>
                                <SelectItem value="remote">Làm việc từ xa</SelectItem>
                                <SelectItem value="others">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Education */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Học vấn</Label>
                        <Select
                            value={jobForm.education}
                            onValueChange={(value) => handleFormChange("education", value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="highschool_graduate">Tốt nghiệp THPT</SelectItem>
                                <SelectItem value="bachelor">Cử nhân</SelectItem>
                                <SelectItem value="mastter">Thạc sĩ</SelectItem>
                                <SelectItem value="phd">Tiến sĩ</SelectItem>
                                <SelectItem value="others">Khác</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Experience */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="experience" className="text-right">
                            Kinh nghiệm
                        </Label>
                        <Input
                            id="experience"
                            value={jobForm.experience}
                            onChange={(e) => handleFormChange("experience", e.target.value)}
                            className="col-span-3"
                            placeholder="Ví dụ: 2-3 năm kinh nghiệm"
                        />
                    </div>

                    {/* Working Time */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="working_time" className="text-right">
                            Giờ làm việc
                        </Label>
                        <Input
                            id="working_time"
                            value={jobForm.working_time}
                            onChange={(e) => handleFormChange("working_time", e.target.value)}
                            className="col-span-3"
                            placeholder="Ví dụ: 8h-17h30"
                        />
                    </div>

                    {/* Quantity */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                            Số lượng tuyển
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={jobForm.quantity}
                            onChange={(e) => handleFormChange("quantity", parseInt(e.target.value) || 1)}
                            className="col-span-3"
                            min="1"
                        />
                    </div>

                    {/* Benefit */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="benefit" className="text-right pt-2">
                            Quyền lợi
                        </Label>
                        <Textarea
                            id="benefit"
                            value={jobForm.benefit}
                            onChange={(e) => handleFormChange("benefit", e.target.value)}
                            className="col-span-3"
                            placeholder="Mô tả các quyền lợi của công việc"
                            rows={3}
                        />
                    </div>

                    {/* Skill Tags */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                            Kỹ năng yêu cầu
                        </Label>
                        <div className="col-span-3">
                            <div className="flex gap-2 mb-2">
                                <Input
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    placeholder="Nhập kỹ năng (ví dụ: Java, React)"
                                    onKeyPress={(e) => e.key === "Enter" && addSkillTag()}
                                />
                                <Button type="button" onClick={addSkillTag} variant="outline">
                                    Thêm
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {jobForm.skill_tags.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkillTag(index)}>
                                        {skill} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Ngày bắt đầu *
                        </Label>
                        <div className="col-span-3">
                            <DatePicker
                                date={jobForm.start_date}
                                onDateChange={(date) => handleFormChange("start_date", date)}
                                placeholder="Chọn ngày bắt đầu"
                                minDate={new Date()}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Ngày kết thúc
                        </Label>
                        <div className="col-span-3">
                            <DatePicker
                                date={jobForm.end_date}
                                onDateChange={(date) => handleFormChange("end_date", date)}
                                placeholder="Chọn ngày kết thúc"
                                disabled={!jobForm.start_date}
                                minDate={jobForm.start_date || new Date()}
                            />
                        </div>
                    </div>

                    {/* Label Type */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Nhãn công việc</Label>
                        <Select
                            value={jobForm.label_type}
                            onValueChange={(value) => handleFormChange("label_type", value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Chọn nhãn (tùy chọn)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Không có nhãn</SelectItem>
                                <SelectItem value="Việc gấp">Việc gấp</SelectItem>
                                <SelectItem value="Việc chất">Việc chất</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowDialog(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleCreateJob} disabled={creatingJob}>
                        {creatingJob ? (
                            <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Đang tạo...
                            </>
                        ) : (
                            "Tạo công việc"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}