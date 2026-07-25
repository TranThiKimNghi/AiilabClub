import React, { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import confetti from "canvas-confetti"
import logoImg from "./assets/logo.png"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  Brain, 
  Sparkles, 
  Code2, 
  CheckCircle2, 
  Heart,
  ChevronRight,
  Target,
  Users,
  Star,
  MessageSquare,
  ArrowLeft,
  Trash2,
  Download,
  Shield,
  ThumbsUp,
  Smile,
  Meh,
  Frown,
  Lock,
  Tag,
  Gift,
  BadgePercent
} from "lucide-react"

// Import UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group"
import { Checkbox } from "./components/ui/checkbox"
import { Dialog } from "./components/ui/dialog"

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const formSchema = z.object({
  studentName: z.string().min(1, "Họ và tên học sinh là bắt buộc"),
  studentAge: z.string()
    .min(1, "Tuổi học sinh là bắt buộc")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Tuổi phải là số lớn hơn 0"),
  studentClass: z.string().optional(),
  parentName: z.string().min(1, "Họ và tên phụ huynh là bắt buộc"),
  parentPhone: z.string()
    .min(1, "Số điện thoại là bắt buộc")
    .regex(/(0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ (ví dụ: 0987654321)"),
  parentEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  usedAi: z.string().optional(),
  studiedCoding: z.string().optional(),
  favoriteActivities: z.array(z.string()).default([]),
  desiredSkills: z.array(z.string()).default([]),
})

const feedbackSchema = z.object({
  childName: z.string().min(1, "Tên học sinh là bắt buộc"),
  parentName: z.string().min(1, "Tên phụ huynh là bắt buộc"),
  overallRating: z.string().min(1, "Vui lòng đánh giá buổi học"),
  contentRating: z.string().min(1, "Vui lòng đánh giá nội dung"),
  organizationRating: z.string().min(1, "Vui lòng đánh giá tổ chức"),
  childInterest: z.string().optional(),
  wouldRecommend: z.string().optional(),
  suggestions: z.string().optional(),
  wouldJoinAgain: z.string().optional(),
  wantCourse: z.string().optional(),
  contactPhone: z.string().optional(),
})

import { supabase } from "./lib/supabase"

// ─── Helper ───────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "aiilab2026"

// --- Event Management ---
const DEFAULT_EVENT = {
  id: "default",
  name: "Buổi trải nghiệm AI",
  date: "01/08/2026",
  time: "08:30 - 10:00",
  location: "AiiCafe - 76 Cách mạng, Phú Thọ Hòa, TP. Hồ Chí Minh",
  maxSlots: 10,
  createdAt: new Date().toISOString()
}


// ─── Star Rating Component ────────────────────────────────────────────────────

function StarRating({ value, onChange, name }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(String(star))}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hover || Number(value))
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-200"
            }`}
          />
        </button>
      ))}
      {value && (
        <span className="ml-2 text-sm font-bold text-slate-600">
          {["", "Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"][Number(value)]}
        </span>
      )}
    </div>
  )
}

// ─── Registration Form Page ───────────────────────────────────────────────────

function RegistrationForm({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState(null)
  const [activeEvent, setActiveEvent] = useState(null)
  const [remainingSlots, setRemainingSlots] = useState(0)

  useEffect(() => {
    let regsChannel = null

    const loadData = async () => {
      // 1. Lấy active event ID từ bảng settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('activeEventId')
        .eq('id', 'global')
        .maybeSingle()

      let activeEventId = settingsData?.activeEventId || null
      let eventData = DEFAULT_EVENT

      // 2. Lấy thông tin event
      if (activeEventId) {
        const { data: evSnap } = await supabase
          .from('events')
          .select('*')
          .eq('id', activeEventId)
          .maybeSingle()
        if (evSnap) eventData = evSnap
      } else {
        // Không có settings → lấy event đầu tiên
        const { data: firstEv } = await supabase
          .from('events')
          .select('*')
          .limit(1)
          .maybeSingle()
        if (firstEv) {
          eventData = firstEv
          activeEventId = firstEv.id
        }
      }
      setActiveEvent(eventData)

      // 3. Đếm số đăng ký
      const evId = activeEventId || eventData.id
      let countQuery = supabase.from('registrations').select('*', { count: 'exact', head: true })
      if (evId === 'default') {
        countQuery = countQuery.or('eventId.eq.default,eventId.is.null')
      } else {
        countQuery = countQuery.eq('eventId', evId)
      }
      const { count } = await countQuery
      setRemainingSlots(Math.max(0, (eventData.maxSlots || 10) - (count || 0)))

      // 4. Realtime: cập nhật số suất khi có đăng ký mới
      if (regsChannel) supabase.removeChannel(regsChannel)
      const channelName = 'reg-count-' + (evId || 'default') + '-' + Math.random()
      regsChannel = supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' },
          async () => {
            let q = supabase.from('registrations').select('*', { count: 'exact', head: true })
            if (evId === 'default') {
              q = q.or('eventId.eq.default,eventId.is.null')
            } else {
              q = q.eq('eventId', evId)
            }
            const { count: newCount } = await q
            setRemainingSlots(Math.max(0, (eventData.maxSlots || 10) - (newCount || 0)))
          }
        )
        .subscribe()
    }

    loadData()
    return () => { if (regsChannel) supabase.removeChannel(regsChannel) }
  }, [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      studentAge: "",
      studentClass: "",
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      usedAi: "",
      studiedCoding: "",
      favoriteActivities: [],
      desiredSkills: [],
    }
  })

  const favoriteActivitiesWatch = watch("favoriteActivities")
  const desiredSkillsWatch = watch("desiredSkills")

  const handleCheckboxChange = (fieldName, option, checked) => {
    const currentValues = watch(fieldName) || []
    if (checked) {
      setValue(fieldName, [...currentValues, option])
    } else {
      setValue(fieldName, currentValues.filter((val) => val !== option))
    }
  }

  const onSubmit = async (data) => {
    const { error } = await supabase.from('registrations').insert({
      eventId: activeEvent.id,
      studentName: data.studentName,
      studentAge: data.studentAge,
      studentClass: data.studentClass || null,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail || null,
      usedAi: data.usedAi || null,
      studiedCoding: data.studiedCoding || null,
      favoriteActivities: data.favoriteActivities || [],
      desiredSkills: data.desiredSkills || [],
      registeredAt: new Date().toISOString()
    })
    if (error) { console.error('Lỗi đăng ký:', error); return }
    setFormData(data)
    setIsOpen(true)
    triggerConfetti()
  }

  const triggerConfetti = () => {
    const duration = 3 * 1000
    const end = Date.now() + duration
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#0044B0", "#F4B400", "#34A853", "#4285F4"] })
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#0044B0", "#F4B400", "#34A853", "#4285F4"] })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }

  const handleCloseDialog = () => {
    setIsOpen(false)
    reset()
  }

  if (!activeEvent) return <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center"><p className="text-slate-500 font-medium animate-pulse">Đang tải thông tin sự kiện...</p></div>

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* Banner */}
        <div className="relative rounded-custom overflow-hidden bg-white shadow-soft border border-slate-100/50">
          <div className="h-4 bg-primary w-full" />
          <div className="p-6 md:p-8 space-y-6">
            {/* Brand Row */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <img src={logoImg} className="w-14 h-20 md:w-16 md:h-24 object-contain shrink-0" alt="AiiLab Logo" />
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-primary leading-tight">
                    AiiLab <span className="text-secondary">Club</span>
                  </h1>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                    Innovation &amp; Technology
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-2">
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold bg-[#FEF7E0] text-primary border border-secondary animate-pulse whitespace-nowrap">
                  🔥 Còn lại {remainingSlots} suất
                </span>
                {/* Hidden admin & feedback nav buttons */}
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate("feedback")}
                    className="text-[10px] text-slate-300 hover:text-secondary transition-colors font-medium flex items-center gap-1"
                    title="Form Feedback"
                  >
                    <MessageSquare className="w-3 h-3" /> Feedback
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate("admin")}
                    className="text-[10px] text-slate-300 hover:text-primary transition-colors font-medium flex items-center gap-1"
                    title="Admin"
                  >
                    <Shield className="w-3 h-3" /> Admin
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-2.5 py-1 rounded-md">
                  Hoạt động trải nghiệm
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary leading-snug">
                  {activeEvent.name}
                </h2>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                Cơ hội tuyệt vời giúp các con tiếp cận với công nghệ trí tuệ nhân tạo (AI), khơi dậy đam mê sáng tạo công nghệ và rèn luyện tư duy logic thông qua các hoạt động thực hành thú vị cùng các chuyên gia từ AiiLab.
              </p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-3 text-slate-600 bg-slate-50 p-3 rounded-xl hover:bg-slate-100/50 transition-colors">
                <div className="bg-primary/5 p-2 rounded-lg text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Ngày diễn ra</p>
                  <p className="text-sm font-bold text-slate-700">{activeEvent.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 bg-slate-50 p-3 rounded-xl hover:bg-slate-100/50 transition-colors">
                <div className="bg-primary/5 p-2 rounded-lg text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Thời gian</p>
                  <p className="text-sm font-bold text-slate-700">{activeEvent.time}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 bg-slate-50 p-3 rounded-xl hover:bg-slate-100/50 transition-colors">
                <div className="bg-primary/5 p-2 rounded-lg text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Địa điểm</p>
                  <p className="text-sm font-bold text-slate-700 leading-snug">{activeEvent.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* CARD 1: Thông tin học sinh */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/5 p-2 rounded-xl text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Thông tin học sinh</CardTitle>
                  <CardDescription>Cung cấp thông tin của bé tham gia buổi trải nghiệm</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-6 space-y-2">
                  <Label htmlFor="studentName" required>Họ và tên học sinh</Label>
                  <Input id="studentName" placeholder="Nhập tên đầy đủ của học sinh..." error={errors.studentName} {...register("studentName")} />
                  {errors.studentName && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.studentName.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="studentAge" required>Tuổi</Label>
                  <Input id="studentAge" type="number" placeholder="Ví dụ: 8" error={errors.studentAge} {...register("studentAge")} />
                  {errors.studentAge && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.studentAge.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="studentClass">Lớp</Label>
                  <Input id="studentClass" placeholder="Ví dụ: 3A" {...register("studentClass")} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: Thông tin phụ huynh */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/5 p-2 rounded-xl text-primary">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Thông tin phụ huynh</CardTitle>
                  <CardDescription>AiiLab liên hệ xác nhận và gửi thông tin lớp học</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="parentName" required>Họ và tên phụ huynh</Label>
                <Input id="parentName" placeholder="Nhập tên đầy đủ của phụ huynh..." error={errors.parentName} {...register("parentName")} />
                {errors.parentName && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                    {errors.parentName.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="parentPhone" required>Số điện thoại liên hệ</Label>
                  <Input id="parentPhone" placeholder="Nhập số điện thoại liên hệ..." error={errors.parentPhone} {...register("parentPhone")} />
                  {errors.parentPhone && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.parentPhone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Địa chỉ Email</Label>
                  <Input id="parentEmail" placeholder="Nhập email (tùy chọn)..." error={errors.parentEmail} {...register("parentEmail")} />
                  {errors.parentEmail && (
                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                      {errors.parentEmail.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: Khảo sát ý kiến */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/5 p-2 rounded-xl text-primary">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>Khảo sát nhỏ</CardTitle>
                  <CardDescription>Giúp AiiLab chuẩn bị nội dung học phù hợp nhất với con</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 divide-y divide-slate-100">

              {/* Q1 */}
              <div className="space-y-4">
                <Label className="text-base text-primary font-bold">Con đã từng sử dụng AI chưa?</Label>
                <Controller
                  name="usedAi"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup className="grid grid-cols-1 md:grid-cols-3 gap-3" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                      <RadioGroupItem id="usedAi-chua" name="usedAi" value="Chưa" label="Chưa" checked={field.value === "Chưa"} onChange={() => setValue("usedAi", "Chưa")} />
                      <RadioGroupItem id="usedAi-co" name="usedAi" value="Có" label="Có" checked={field.value === "Có"} onChange={() => setValue("usedAi", "Có")} />
                      <RadioGroupItem id="usedAi-khongro" name="usedAi" value="Không rõ" label="Không rõ" checked={field.value === "Không rõ"} onChange={() => setValue("usedAi", "Không rõ")} />
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Q2 */}
              <div className="space-y-4 pt-6">
                <Label className="text-base text-primary font-bold">Con đã từng học lập trình chưa?</Label>
                <Controller
                  name="studiedCoding"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup className="grid grid-cols-1 sm:grid-cols-3 gap-3" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                      <RadioGroupItem id="coding-chua" name="studiedCoding" value="Chưa" label="Chưa" checked={field.value === "Chưa"} onChange={() => setValue("studiedCoding", "Chưa")} />
                      <RadioGroupItem id="coding-co-mot-chut" name="studiedCoding" value="Có một chút" label="Có một chút" checked={field.value === "Có một chút"} onChange={() => setValue("studiedCoding", "Có một chút")} />
                      <RadioGroupItem id="coding-da-hoc-kha-nhieu" name="studiedCoding" value="Đã học khá nhiều" label="Đã học khá nhiều" checked={field.value === "Đã học khá nhiều"} onChange={() => setValue("studiedCoding", "Đã học khá nhiều")} />
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Q3 */}
              <div className="space-y-4 pt-6">
                <div className="space-y-1">
                  <Label className="text-base text-primary font-bold">Con thích làm gì nhất trên máy tính?</Label>
                  <p className="text-xs text-slate-400 font-medium">Ba mẹ có thể chọn các sở thích của con</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {["Chơi Game", "Xem YouTube / Phim", "Vẽ tranh / Thiết kế", "Lập trình / Lắp ráp Robot", "Học tập / Đọc báo", "Khác"].map((act) => (
                    <Checkbox
                      key={act}
                      id={`act-${act}`}
                      label={act}
                      checked={favoriteActivitiesWatch?.includes(act)}
                      onChange={(e) => handleCheckboxChange("favoriteActivities", act, e.target.checked)}
                    />
                  ))}
                </div>
              </div>

              {/* Q4 */}
              <div className="space-y-4 pt-6">
                <div className="space-y-1">
                  <Label className="text-base text-primary font-bold">Ba/Mẹ mong muốn con phát triển kỹ năng gì?</Label>
                  <p className="text-xs text-slate-400 font-medium">Ba mẹ có thể lựa chọn nhiều kỹ năng mong muốn</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {["AI", "Lập trình", "Robot", "Tư duy Logic", "Làm việc nhóm", "Thuyết trình", "Khác"].map((skill) => (
                    <Checkbox
                      key={skill}
                      id={`skill-${skill}`}
                      label={skill}
                      checked={desiredSkillsWatch?.includes(skill)}
                      onChange={(e) => handleCheckboxChange("desiredSkills", skill, e.target.checked)}
                    />
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-2 flex justify-center">
            <Button
              type="submit"
              size="xl"
              className="w-full sm:w-2/3 md:w-1/2 bg-primary hover:bg-[#0038A0] text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ĐANG ĐĂNG KÝ...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  ĐĂNG KÝ NGAY <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </div>

        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pb-8 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <span>© 2026 CLB AiiLab. All rights reserved.</span>
          <span className="hidden sm:inline h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span>Địa điểm: AiiCafe - 76 Cách mạng, Phú Thọ Hòa, TP. Hồ Chí Minh</span>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog isOpen={isOpen} onClose={handleCloseDialog}>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-green-50 p-4 rounded-full text-green-500 animate-bounce">
            <Sparkles className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-primary">🎉 Đăng ký thành công</h3>
            <p className="text-sm font-bold text-slate-600">AiiLab đã nhận được thông tin đăng ký của bé!</p>
          </div>
          {formData && (
            <div className="w-full bg-[#F6F8FC] rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-100">
              <p className="font-bold text-primary border-b border-slate-200/60 pb-1.5 text-[11px] uppercase tracking-wider">Thông tin đơn đăng ký:</p>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400 font-medium">Học sinh:</span>
                <span className="col-span-2 text-slate-700 font-bold">{formData.studentName}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400 font-medium">Tuổi:</span>
                <span className="col-span-2 text-slate-700 font-bold">{formData.studentAge} tuổi {formData.studentClass ? `(Lớp ${formData.studentClass})` : ""}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400 font-medium">Phụ huynh:</span>
                <span className="col-span-2 text-slate-700 font-bold">{formData.parentName}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400 font-medium">SĐT:</span>
                <span className="col-span-2 text-slate-700 font-bold">{formData.parentPhone}</span>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 leading-relaxed">
            Chúng tôi sẽ nhanh chóng liên hệ với Ba/Mẹ qua số điện thoại để xác nhận thông tin chi tiết và sắp xếp chỗ ngồi. Hẹn gặp lại bé tại buổi trải nghiệm!
          </p>
          <Button variant="default" className="w-full mt-4 bg-primary hover:bg-[#0038A0]" onClick={handleCloseDialog}>
            Đồng ý
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

// ─── Admin Login Gate ─────────────────────────────────────────────────────────

function AdminLoginGate({ onSuccess, onBack }) {
  const [pw, setPw] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      onSuccess()
    } else {
      setError("Mật khẩu không đúng. Vui lòng thử lại.")
      setPw("")
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-custom shadow-soft border border-slate-100/50 overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-primary/10 p-4 rounded-full">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-extrabold text-primary">Khu vực Admin</h2>
                <p className="text-sm text-slate-400 mt-1">Nhập mật khẩu để xem danh sách đăng ký</p>
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPw">Mật khẩu</Label>
                <input
                  id="adminPw"
                  type="password"
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); setError("") }}
                  placeholder="Nhập mật khẩu admin..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-[#0038A0] text-white">
                Đăng nhập
              </Button>
            </form>
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại trang đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Admin View Page ──────────────────────────────────────────────────────────

function AdminView({ onBack }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [registrations, setRegistrations] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [activeTab, setActiveTab] = useState("events")
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [newEvent, setNewEvent] = useState({ name: "", date: "", time: "", location: "", maxSlots: 10 })
  const [activeEvtId, setActiveEvtId] = useState("default")

  useEffect(() => {
    if (!authenticated) return

    const loadAll = async () => {
      const [settingsRes, eventsRes, regsRes, fbRes] = await Promise.all([
        supabase.from('settings').select('activeEventId').eq('id', 'global').maybeSingle(),
        supabase.from('events').select('*'),
        supabase.from('registrations').select('*').order('registeredAt', { ascending: false }),
        supabase.from('feedbacks').select('*').order('submittedAt', { ascending: false }),
      ])
      if (settingsRes.data) setActiveEvtId(settingsRes.data.activeEventId)
      if (eventsRes.data) {
        const loadedEvents = eventsRes.data.length > 0 ? eventsRes.data : [DEFAULT_EVENT]
        setEvents(loadedEvents)
        setSelectedEventId(prev => prev || loadedEvents[0].id)
      } else {
        setEvents([DEFAULT_EVENT])
        setSelectedEventId(prev => prev || 'default')
      }
      if (regsRes.data) setRegistrations(regsRes.data)
      if (fbRes.data) setFeedbacks(fbRes.data)
    }

    loadAll()

    const channel = supabase
      .channel('admin-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedbacks' }, loadAll)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [authenticated])

  const filteredRegistrations = registrations.filter(r => r.eventId === selectedEventId || (!r.eventId && selectedEventId === "default"))
  const filteredFeedbacks = feedbacks.filter(f => f.eventId === selectedEventId || (!f.eventId && selectedEventId === "default"))

  const handleDelete = async (index, type) => {
    if (type === "reg") {
      const target = filteredRegistrations[index]
      if (target?.id) await supabase.from('registrations').delete().eq('id', target.id)
    } else if (type === "fb") {
      const target = filteredFeedbacks[index]
      if (target?.id) await supabase.from('feedbacks').delete().eq('id', target.id)
    } else if (type === "event") {
      const target = events[index]
      if (target?.id) {
        await supabase.from('events').delete().eq('id', target.id)
        if (selectedEventId === target.id && events.length > 1) {
          setSelectedEventId(events.find(e => e.id !== target.id).id)
        }
      }
    }
    setDeleteConfirm(null)
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!newEvent.name || !newEvent.date) return
    await supabase.from('events').insert({
      id: crypto.randomUUID(),
      name: newEvent.name,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      maxSlots: Number(newEvent.maxSlots) || 10
    })
    setNewEvent({ name: "", date: "", time: "", location: "", maxSlots: 10 })
  }

  const handleSetActiveEvent = async (id) => {
    await supabase.from('settings').upsert({ id: 'global', activeEventId: id })
  }

  const exportCSV = (data, filename) => {
    if (!data.length) return
    const keys = Object.keys(data[0])
    const csv = [
      keys.join(","),
      ...data.map(row =>
        keys.map(k => `"${String(row[k] ?? "").replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authenticated) {
    return <AdminLoginGate onSuccess={() => setAuthenticated(true)} onBack={onBack} />
  }

  const ratingLabel = (v) => ["", "Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"][Number(v)] || v

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-custom shadow-soft border border-slate-100/50 overflow-hidden">
          <div className="h-2 bg-primary" />
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logoImg} className="w-10 h-14 object-contain shrink-0" alt="AiiLab Logo" />
              <div>
                <h1 className="text-xl font-extrabold text-primary">Bảng quản trị AiiLab</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Sự kiện:{" "}
                  <select
                    value={selectedEventId || ""}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="bg-transparent font-bold text-slate-700 outline-none border-b border-dashed border-slate-300 pb-0.5 ml-1"
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.name} ({ev.date})</option>
                    ))}
                  </select>
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại form đăng ký
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Tổng đăng ký", value: filteredRegistrations.length, color: "text-primary", bg: "bg-primary/5" },
            { label: "Còn lại", value: Math.max(0, (events.find(e => e.id === selectedEventId)?.maxSlots || 10) - filteredRegistrations.length), color: "text-secondary", bg: "bg-secondary/10" },
            { label: "Phản hồi nhận được", value: filteredFeedbacks.length, color: "text-green-600", bg: "bg-green-50" },
            {
              label: "Muốn đăng ký KH",
              value: filteredFeedbacks.filter(f => f.wantCourse === "Có").length,
              color: "text-orange-600",
              bg: "bg-orange-50"
            },
            {
              label: "Điểm TB",
              value: filteredFeedbacks.length
                ? (filteredFeedbacks.reduce((s, f) => s + Number(f.overallRating || 0), 0) / filteredFeedbacks.length).toFixed(1) + " ⭐"
                : "—",
              color: "text-purple-600",
              bg: "bg-purple-50"
            },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className={`text-3xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-custom shadow-soft border border-slate-100/50 overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab("events")}
              className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === "events" ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Calendar className="w-4 h-4" /> Quản lý sự kiện
            </button>
            <button
              onClick={() => setActiveTab("registrations")}
              className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === "registrations" ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Users className="w-4 h-4" /> Danh sách đăng ký ({filteredRegistrations.length})
            </button>
            <button
              onClick={() => setActiveTab("feedbacks")}
              className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === "feedbacks" ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600"}`}
            >
              <MessageSquare className="w-4 h-4" /> Phản hồi ({filteredFeedbacks.length})
            </button>
          </div>

          <div className="p-6">
            {/* ── Events Tab ── */}
            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-4">
                  <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Tạo sự kiện mới
                  </h3>
                  <form onSubmit={handleCreateEvent} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                    <Input placeholder="Tên sự kiện" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} className="md:col-span-2" required />
                    <Input placeholder="Ngày (VD: 01/08/2026)" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
                    <Input placeholder="Giờ (VD: 08:30 - 10:00)" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} required />
                    <Input placeholder="Số suất" type="number" value={newEvent.maxSlots} onChange={e => setNewEvent({...newEvent, maxSlots: e.target.value})} required />
                    <Input placeholder="Địa điểm" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="sm:col-span-2 md:col-span-4" required />
                    <Button type="submit" className="w-full">Tạo mới</Button>
                  </form>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-slate-700 text-sm">Danh sách sự kiện ({events.length})</h3>
                  {events.map((ev, i) => (
                    <div key={ev.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${activeEvtId === ev.id ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white'}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">{ev.name}</p>
                          {activeEvtId === ev.id && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">ĐANG ACTIVE</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{ev.date} • {ev.time} • {ev.location} • {ev.maxSlots} suất</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {activeEvtId !== ev.id && (
                          <button onClick={() => handleSetActiveEvent(ev.id)} className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">
                            Sử dụng cho Form
                          </button>
                        )}
                        {ev.id !== "default" && (
                          <button onClick={() => setDeleteConfirm({ index: i, type: "event" })} className="text-red-400 hover:text-red-600 transition-colors p-1.5 bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Registrations Tab ── */}
            {activeTab === "registrations" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-500">Hiển thị {filteredRegistrations.length} / {events.find(e => e.id === selectedEventId)?.maxSlots || 10} suất đã đăng ký</p>
                  <button
                    onClick={() => exportCSV(filteredRegistrations, "danhsach_dangky.csv")}
                    className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Xuất CSV
                  </button>
                </div>

                {filteredRegistrations.length === 0 ? (
                  <div className="text-center py-16 text-slate-300">
                    <Users className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Chưa có ai đăng ký</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRegistrations.map((reg, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Left: student info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-extrabold shrink-0">{i + 1}</span>
                              <span className="font-bold text-slate-800 text-sm">{reg.studentName}</span>
                            </div>
                            <p className="text-xs text-slate-500 pl-9">{reg.studentAge} tuổi {reg.studentClass ? `• Lớp ${reg.studentClass}` : ""}</p>
                          </div>
                          {/* Middle: parent */}
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-medium">Phụ huynh</p>
                            <p className="text-sm font-semibold text-slate-700">{reg.parentName}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" />{reg.parentPhone}</p>
                            {reg.parentEmail && <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{reg.parentEmail}</p>}
                          </div>
                          {/* Right: survey & actions */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                              {reg.usedAi && <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">AI: {reg.usedAi}</span>}
                              {reg.studiedCoding && <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded-full">Code: {reg.studiedCoding}</span>}
                            </div>
                            {reg.desiredSkills?.length > 0 && (
                              <p className="text-xs text-slate-400">Kỹ năng: {reg.desiredSkills.join(", ")}</p>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] text-slate-300">{reg.registeredAt ? new Date(reg.registeredAt).toLocaleString("vi-VN") : ""}</p>
                              <button
                                onClick={() => setDeleteConfirm({ index: i, type: "reg" })}
                                className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Feedbacks Tab ── */}
            {activeTab === "feedbacks" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-500">{filteredFeedbacks.length} phản hồi đã nhận</p>
                  <button
                    onClick={() => exportCSV(filteredFeedbacks, "phan_hoi.csv")}
                    className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Xuất CSV
                  </button>
                </div>

                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-16 text-slate-300">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-semibold">Chưa có phản hồi nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredFeedbacks.map((fb, i) => (
                      <div
                        key={i}
                        className={`rounded-2xl border p-4 hover:shadow-sm transition-shadow space-y-3 ${
                          fb.wantCourse === "Có"
                            ? "bg-orange-50/40 border-orange-200/60"
                            : "bg-slate-50 border-slate-100"
                        }`}
                      >
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-800 text-sm">{fb.childName}</p>
                              {fb.wantCourse === "Có" && (
                                <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                  <BadgePercent className="w-3 h-3" /> Đăng ký KH • 10% OFF
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Phụ huynh: {fb.parentName}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-4 h-4 ${s <= Number(fb.overallRating) ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
                              ))}
                              <span className="text-xs font-bold text-slate-600 ml-1">{ratingLabel(fb.overallRating)}</span>
                            </div>
                            <button onClick={() => setDeleteConfirm({ index: i, type: "fb" })} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Course enrollment highlight */}
                        {fb.wantCourse === "Có" && (
                          <div className="bg-white border border-orange-200 rounded-xl p-3 flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-lg shrink-0">
                              <Phone className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-orange-700">🎁 Muốn đăng ký khóa học — cần liên hệ!</p>
                              <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                                {fb.contactPhone
                                  ? fb.contactPhone
                                  : <span className="text-slate-400 font-normal text-xs">Chưa để lại SĐT</span>
                                }
                              </p>
                            </div>
                            {fb.contactPhone && (
                              <a
                                href={`tel:${fb.contactPhone}`}
                                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Gọi ngay
                              </a>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="bg-white rounded-lg p-2 border border-slate-100">
                            <p className="text-slate-400">Nội dung</p>
                            <p className="font-bold text-slate-700">{ratingLabel(fb.contentRating)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-slate-100">
                            <p className="text-slate-400">Tổ chức</p>
                            <p className="font-bold text-slate-700">{ratingLabel(fb.organizationRating)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-slate-100">
                            <p className="text-slate-400">Hứng thú của con</p>
                            <p className="font-bold text-slate-700">{fb.childInterest || "—"}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-slate-100">
                            <p className="text-slate-400">Tham gia lại</p>
                            <p className="font-bold text-slate-700">{fb.wouldJoinAgain || "—"}</p>
                          </div>
                        </div>
                        {fb.suggestions && (
                          <div className="bg-yellow-50/70 rounded-lg p-3 text-xs text-slate-600 border border-yellow-100/60">
                            <p className="font-bold text-yellow-700 mb-1">💬 Góp ý:</p>
                            <p>{fb.suggestions}</p>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-300">{fb.submittedAt ? new Date(fb.submittedAt).toLocaleString("vi-VN") : ""}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-extrabold text-slate-800">Xác nhận xóa</h3>
            <p className="text-sm text-slate-500">Bạn có chắc muốn xóa mục này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm.index, deleteConfirm.type)} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Feedback Form Page ───────────────────────────────────────────────────────

function FeedbackForm({ onBack }) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)
  const [activeEvent, setActiveEvent] = useState(null)

  useEffect(() => {
    const loadActiveEvent = async () => {
      const { data: settingsData } = await supabase
        .from('settings')
        .select('activeEventId')
        .eq('id', 'global')
        .maybeSingle()

      const activeEventId = settingsData?.activeEventId || null

      if (activeEventId) {
        const { data: evData } = await supabase
          .from('events')
          .select('*')
          .eq('id', activeEventId)
          .maybeSingle()
        setActiveEvent(evData || DEFAULT_EVENT)
      } else {
        const { data: firstEv } = await supabase
          .from('events')
          .select('*')
          .limit(1)
          .maybeSingle()
        setActiveEvent(firstEv || DEFAULT_EVENT)
      }
    }
    loadActiveEvent()
  }, [])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      childName: "",
      parentName: "",
      overallRating: "",
      contentRating: "",
      organizationRating: "",
      childInterest: "",
      wouldRecommend: "",
      suggestions: "",
      wouldJoinAgain: "",
    }
  })

  const overallRating = watch("overallRating")
  const contentRating = watch("contentRating")
  const organizationRating = watch("organizationRating")

  const onSubmit = async (data) => {
    const { error } = await supabase.from('feedbacks').insert({
      eventId: activeEvent?.id || null,
      childName: data.childName,
      parentName: data.parentName,
      overallRating: data.overallRating,
      contentRating: data.contentRating,
      organizationRating: data.organizationRating,
      childInterest: data.childInterest || null,
      wouldRecommend: data.wouldRecommend || null,
      suggestions: data.suggestions || null,
      wouldJoinAgain: data.wouldJoinAgain || null,
      wantCourse: data.wantCourse || null,
      contactPhone: data.contactPhone || null,
      submittedAt: new Date().toISOString()
    })
    if (error) { console.error('Lỗi gửi feedback:', error); return }
    setSubmittedData(data)
    setIsSubmitted(true)
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#0044B0", "#F4B400", "#34A853"] })
  }

  if (!activeEvent) return null;

  if (isSubmitted) {
    const wantsCourse = submittedData?.wantCourse === "Có"
    return (
      <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-custom shadow-soft border border-slate-100/50 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
          <div className="p-8 flex flex-col items-center text-center space-y-5">
            <div className="bg-green-50 p-5 rounded-full">
              <ThumbsUp className="w-14 h-14 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-primary">Cảm ơn bạn! 🎉</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Phản hồi của <strong>{submittedData?.parentName}</strong> đã được gửi thành công. AiiLab rất trân trọng ý kiến của bạn!
              </p>
            </div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-7 h-7 ${s <= Number(submittedData?.overallRating) ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
              ))}
            </div>

            {/* Discount coupon block */}
            {wantsCourse && (
              <div className="w-full">
                <div className="relative bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-5 text-white overflow-hidden">
                  {/* decorative circles */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-secondary" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/80">Ưu đãi dành riêng cho bạn</span>
                    </div>
                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-extrabold text-secondary leading-none">10%</span>
                      <span className="text-sm font-semibold text-white/90 leading-snug pb-1">giảm học phí<br />khóa học AiiLab</span>
                    </div>
                    {/* Coupon code */}
                    <div className="mt-1 flex items-center gap-3 bg-white/15 rounded-xl px-4 py-2.5">
                      <Tag className="w-4 h-4 text-secondary shrink-0" />
                      <span className="font-extrabold tracking-widest text-white text-base">AIIFB10</span>
                      <span className="ml-auto text-[10px] font-semibold text-white/60 uppercase">Mã ưu đãi</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Báo mã này khi liên hệ với AiiLab để nhận ưu đãi. Áp dụng 1 lần · Có hiệu lực đến 31/08/2026
                    </p>
                  </div>
                </div>
                {submittedData?.contactPhone && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    AiiLab sẽ liên hệ lại qua <strong className="text-primary">{submittedData.contactPhone}</strong> để tư vấn chi tiết.
                  </p>
                )}
              </div>
            )}

            <button onClick={onBack} className="mt-2 flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
              <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div className="relative rounded-custom overflow-hidden bg-white shadow-soft border border-slate-100/50">
          <div className="h-4 bg-gradient-to-r from-primary via-blue-400 to-secondary w-full" />
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={logoImg} className="w-12 h-16 object-contain shrink-0" alt="AiiLab Logo" />
                <div>
                  <h1 className="text-xl font-extrabold text-primary">AiiLab <span className="text-secondary">Club</span></h1>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Phản hồi sau buổi trải nghiệm</p>
                </div>
              </div>
              <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" /> Trang đăng ký
              </button>
            </div>
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-2.5 py-1 rounded-md">
                Sau buổi trải nghiệm
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary mt-3 leading-snug">
                Chia sẻ cảm nhận của bạn 💬
              </h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-2xl">
                Phản hồi của Ba/Mẹ là nguồn động lực quý giá giúp AiiLab ngày càng hoàn thiện. Chỉ mất 2 phút để chia sẻ!
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 bg-blue-50 rounded-xl p-3">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>{activeEvent.name} — <strong className="text-primary">{activeEvent.date}</strong> · {activeEvent.time} · {activeEvent.location}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* CARD 1: Thông tin */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/5 p-2 rounded-xl text-primary"><User className="w-5 h-5" /></div>
                <div>
                  <CardTitle>Thông tin xác nhận</CardTitle>
                  <CardDescription>Giúp AiiLab xác định phản hồi của gia đình bạn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fb-childName" required>Tên học sinh đã tham gia</Label>
                  <Input id="fb-childName" placeholder="Tên bé..." error={errors.childName} {...register("childName")} />
                  {errors.childName && <p className="text-xs font-semibold text-red-500">{errors.childName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-parentName" required>Tên phụ huynh</Label>
                  <Input id="fb-parentName" placeholder="Tên Ba/Mẹ..." error={errors.parentName} {...register("parentName")} />
                  {errors.parentName && <p className="text-xs font-semibold text-red-500">{errors.parentName.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: Đánh giá */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="bg-secondary/10 p-2 rounded-xl text-secondary"><Star className="w-5 h-5" /></div>
                <div>
                  <CardTitle>Đánh giá buổi học</CardTitle>
                  <CardDescription>Chọn số sao tương ứng với trải nghiệm của bạn</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 divide-y divide-slate-100">
              <div className="space-y-3">
                <Label className="text-base text-primary font-bold" required>Đánh giá chung về buổi trải nghiệm</Label>
                <Controller
                  name="overallRating"
                  control={control}
                  render={({ field }) => (
                    <StarRating value={field.value} onChange={(v) => { field.onChange(v); setValue("overallRating", v) }} />
                  )}
                />
                {errors.overallRating && <p className="text-xs font-semibold text-red-500">{errors.overallRating.message}</p>}
              </div>

              <div className="space-y-3 pt-5">
                <Label className="text-base text-primary font-bold" required>Chất lượng nội dung & hoạt động</Label>
                <Controller
                  name="contentRating"
                  control={control}
                  render={({ field }) => (
                    <StarRating value={field.value} onChange={(v) => { field.onChange(v); setValue("contentRating", v) }} />
                  )}
                />
                {errors.contentRating && <p className="text-xs font-semibold text-red-500">{errors.contentRating.message}</p>}
              </div>

              <div className="space-y-3 pt-5">
                <Label className="text-base text-primary font-bold" required>Công tác tổ chức & đón tiếp</Label>
                <Controller
                  name="organizationRating"
                  control={control}
                  render={({ field }) => (
                    <StarRating value={field.value} onChange={(v) => { field.onChange(v); setValue("organizationRating", v) }} />
                  )}
                />
                {errors.organizationRating && <p className="text-xs font-semibold text-red-500">{errors.organizationRating.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: Cảm nhận */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="bg-green-50 p-2 rounded-xl text-green-600"><Heart className="w-5 h-5" /></div>
                <div>
                  <CardTitle>Cảm nhận của con</CardTitle>
                  <CardDescription>Chia sẻ phản ứng của bé sau buổi học</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 divide-y divide-slate-100">
              <div className="space-y-4">
                <Label className="text-base text-primary font-bold">Con có hứng thú với nội dung không?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "Rất thích", icon: <Smile className="w-5 h-5 text-green-500" />, color: "border-green-200 bg-green-50/50 hover:bg-green-50" },
                    { value: "Bình thường", icon: <Meh className="w-5 h-5 text-yellow-500" />, color: "border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50" },
                    { value: "Chưa hứng thú", icon: <Frown className="w-5 h-5 text-red-400" />, color: "border-red-200 bg-red-50/50 hover:bg-red-50" },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        watch("childInterest") === opt.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : `${opt.color} border-transparent`
                      }`}
                    >
                      <input type="radio" className="sr-only" value={opt.value} {...register("childInterest")} />
                      {opt.icon}
                      <span className="text-sm font-semibold text-slate-700">{opt.value}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-5">
                <Label className="text-base text-primary font-bold">Con có muốn tham gia các buổi tiếp theo không?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Rất muốn", "Có thể", "Chưa chắc"].map(opt => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        watch("wouldJoinAgain") === opt
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                      }`}
                    >
                      <input type="radio" className="sr-only" value={opt} {...register("wouldJoinAgain")} />
                      <span className="text-sm font-semibold text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-5">
                <Label className="text-base text-primary font-bold">Ba/Mẹ có giới thiệu cho bạn bè không?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Chắc chắn có", "Có thể", "Chưa chắc"].map(opt => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        watch("wouldRecommend") === opt
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                      }`}
                    >
                      <input type="radio" className="sr-only" value={opt} {...register("wouldRecommend")} />
                      <span className="text-sm font-semibold text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 4: Đăng ký khóa học – ưu đãi 10% */}
          <Card className="overflow-hidden">
            {/* gradient top stripe */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-blue-400 to-secondary" />
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="bg-secondary/10 p-2 rounded-xl text-secondary"><BadgePercent className="w-5 h-5" /></div>
                <div>
                  <CardTitle>Ưu đãi đăng ký khóa học 🎁</CardTitle>
                  <CardDescription>Đăng ký khóa học AiiLab ngay hôm nay — nhận ngay <strong className="text-primary">giảm 10%</strong> học phí!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Promo banner */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/10 border border-primary/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="shrink-0 bg-primary text-white rounded-xl w-14 h-14 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold leading-none">10%</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5">OFF</span>
                </div>
                <div>
                  <p className="font-bold text-primary text-sm">Ưu đãi học phí đặc biệt</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Dành cho các gia đình đăng ký khóa học <strong>AI, Lập trình hoặc Robot</strong> trong vòng 7 ngày sau buổi trải nghiệm. Mã ưu đãi sẽ được gửi ngay khi bạn xác nhận bên dưới.
                  </p>
                </div>
              </div>

              {/* Yes/No choice */}
              <div className="space-y-3">
                <Label className="text-base text-primary font-bold">Ba/Mẹ có muốn đăng ký khóa học không?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: "Có", desc: "Tôi muốn đăng ký & nhận ưu đãi 10%", emoji: "🎉", highlight: true },
                    { value: "Không", desc: "Có thể tham khảo sau", emoji: "🤔", highlight: false },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        watch("wantCourse") === opt.value
                          ? opt.highlight
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-slate-300 bg-slate-50 ring-2 ring-slate-200"
                          : "border-slate-100 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input type="radio" className="sr-only" value={opt.value} {...register("wantCourse")} />
                      <span className="text-2xl leading-none mt-0.5">{opt.emoji}</span>
                      <div>
                        <p className={`text-sm font-bold ${opt.highlight ? "text-primary" : "text-slate-600"}`}>{opt.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                      {watch("wantCourse") === opt.value && opt.highlight && (
                        <span className="ml-auto shrink-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ĐÃ CHỌN</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditional phone field */}
              {watch("wantCourse") === "Có" && (
                <div className="space-y-2 animate-fadeIn">
                  <Label htmlFor="fb-contactPhone">Số điện thoại để AiiLab liên hệ tư vấn</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="fb-contactPhone"
                      type="tel"
                      {...register("contactPhone")}
                      placeholder="Ví dụ: 0987 654 321"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-400">AiiLab sẽ liên hệ trong vòng 24h để tư vấn và gửi mã giảm giá cho bạn.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 5: Góp ý */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/5 p-2 rounded-xl text-primary"><MessageSquare className="w-5 h-5" /></div>
                <div>
                  <CardTitle>Góp ý thêm</CardTitle>
                  <CardDescription>Những ý kiến quý báu giúp AiiLab cải thiện</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="fb-suggestions">Bạn muốn góp ý gì cho AiiLab? (tùy chọn)</Label>
                <textarea
                  id="fb-suggestions"
                  {...register("suggestions")}
                  placeholder="Chia sẻ điều bạn thích, chưa thích, hoặc mong muốn cải thiện trong buổi học tiếp theo..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="pt-2 flex justify-center">
            <Button
              type="submit"
              size="xl"
              className="w-full sm:w-2/3 md:w-1/2 bg-gradient-to-r from-primary to-blue-500 hover:from-[#0038A0] hover:to-blue-600 text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ĐANG GỬI...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  GỬI PHẢN HỒI <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-400 pb-8">
          © 2026 CLB AiiLab. All rights reserved.
        </div>
      </div>
    </div>
  )
}

// ─── Root App Router ──────────────────────────────────────────────────────────

function App() {
  const [page, setPage] = useState(() => {
    const hash = window.location.hash;
    if (hash === "#/feedback") return "feedback";
    if (hash === "#/admin") return "admin";
    return "register";
  })

  const handleNavigate = (newPage) => {
    setPage(newPage);
    let hash = "";
    if (newPage === "feedback") hash = "#/feedback";
    if (newPage === "admin") hash = "#/admin";
    window.location.hash = hash;
  }

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#/feedback") setPage("feedback");
      else if (hash === "#/admin") setPage("admin");
      else setPage("register");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <>
      {page === "register" && <RegistrationForm onNavigate={handleNavigate} />}
      {page === "admin" && <AdminView onBack={() => handleNavigate("register")} />}
      {page === "feedback" && <FeedbackForm onBack={() => handleNavigate("register")} />}
    </>
  )
}

export default App
