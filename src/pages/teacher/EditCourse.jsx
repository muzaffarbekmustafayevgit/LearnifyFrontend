import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

// 🎯 Konstantalar
const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published"
};

const LEVELS = {
  BEGINNER: { value: "beginner", label: "👶 Boshlang'ich" },
  INTERMEDIATE: { value: "intermediate", label: "🚶 O'rta" },
  ADVANCED: { value: "advanced", label: "🚀 Ilg'or" }
};

// 🛠️ Yordamchi funksiyalar
const validateCourse = (course, modules, lessons) => {
  const errors = [];

  if (!course.title?.trim()) errors.push("Kurs nomi");
  if (!course.description?.trim()) errors.push("Kurs tavsifi");
  if (!course.category?.trim()) errors.push("Kategoriya");
  if (modules.length === 0) errors.push("Kamida bitta modul");
  if (lessons.length === 0) errors.push("Kamida bitta video dars");

  const modulesWithoutLessons = modules.filter(module => 
    !lessons.some(lesson => lesson.moduleId === module._id || lesson.module === module._id)
  );
  
  if (modulesWithoutLessons.length > 0) {
    errors.push(`Video darssiz modullar: ${modulesWithoutLessons.map(m => m.title).join(', ')}`);
  }

  const lessonsWithoutVideo = lessons.filter(lesson => !lesson.videoUrl?.trim());
  if (lessonsWithoutVideo.length > 0) {
    errors.push(`Video manbasi bo'lmagan darslar: ${lessonsWithoutVideo.map(l => l.title).join(', ')}`);
  }

  return errors;
};

// 🎨 UI Komponentlari
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      <p className="text-gray-600">Kurs ma'lumotlari yuklanmoqda...</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
    status === COURSE_STATUS.PUBLISHED 
      ? "bg-green-100 text-green-800 border border-green-200" 
      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
  }`}>
    {status === COURSE_STATUS.PUBLISHED ? "📢 Nashr qilingan" : "📝 Qoralama"}
  </span>
);

const ActionButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  disabled = false, 
  loading = false,
  icon = null,
  type = "button"
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400",
    success: "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400",
    warning: "bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-400",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-400"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${
        disabled || loading ? "cursor-not-allowed opacity-60" : "hover:shadow-lg"
      }`}
    >
      {loading && <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </button>
  );
};

const VideoPreview = ({ videoUrl }) => {
  if (!videoUrl) return null;

  // YouTube video
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
    const videoId = videoUrl.includes('youtube.com') 
      ? videoUrl.split('v=')[1]?.split('&')[0]
      : videoUrl.split('youtu.be/')[1];
    
    return (
      <div className="mt-2">
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      </div>
    );
  }

  // Vimeo video
  if (videoUrl.includes('vimeo.com')) {
    const videoId = videoUrl.split('vimeo.com/')[1];
    return (
      <div className="mt-2">
        <iframe
          width="100%"
          height="200"
          src={`https://player.vimeo.com/video/${videoId}`}
          title="Vimeo video player"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      </div>
    );
  }

  // Google Drive video
  if (videoUrl.includes('drive.google.com')) {
    const fileId = videoUrl.match(/\/d\/([^\/]+)/)?.[1] || videoUrl.match(/id=([^&]+)/)?.[1];
    if (fileId) {
      return (
        <div className="mt-2">
          <iframe
            width="100%"
            height="200"
            src={`https://drive.google.com/file/d/${fileId}/preview`}
            title="Google Drive video player"
            frameBorder="0"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      );
    }
  }

  // Local video fayl
  if (videoUrl.startsWith('/uploads/') || videoUrl.startsWith('http://localhost')) {
    return (
      <div className="mt-2">
        <video
          controls
          width="100%"
          height="200"
          className="rounded-lg"
        >
          <source src={videoUrl} type="video/mp4" />
          Sizning brauzeringiz video elementni qo'llab-quvvatlamaydi.
        </video>
      </div>
    );
  }

  // Oddiy video URL
  return (
    <div className="mt-2">
      <video
        controls
        width="100%"
        height="200"
        className="rounded-lg"
      >
        <source src={videoUrl} type="video/mp4" />
        Sizning brauzeringiz video elementni qo'llab-quvvatlamaydi.
      </video>
    </div>
  );
};


// Video yuklash komponenti - TUZATILGAN VERSIYA
const VideoUploader = ({ onVideoUpload, currentVideoUrl }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Iltimos, faqat video fayl yuklang!');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      alert('Video hajmi 500MB dan kichik boʻlishi kerak!');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('video', file);

    try {
      const token = localStorage.getItem("accessToken");
      
      // ✅ ENDPOINTNI TO'G'RILAYMIZ
      const response = await fetch('http://localhost:5000/api/lessons/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // ❌ Content-Type ni O'CHIRAMIZ - FormData uchun kerak emas
        },
        body: formData,
      });

      console.log('📨 Server javobi:', response.status);

      if (!response.ok) {
        let errorMessage = `Server xatosi: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // JSON parse xatosi
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Yuklash natijasi:', result);
      
      if (result.data && result.data.videoUrl) {
        onVideoUpload(result.data.videoUrl);
        alert('✅ Video muvaffaqiyatli yuklandi!');
      } else {
        throw new Error('Serverdan noto‘g‘ri javob');
      }
    } catch (error) {
      console.error('❌ Video yuklash xatosi:', error);
      alert('Video yuklashda xatolik: ' + error.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block mb-2 font-medium text-gray-700">
          Video Manbasi *
        </label>
        <input
          type="text"
          placeholder="Video URL (YouTube, Vimeo yoki boshqa link)"
          value={currentVideoUrl || ''}
          onChange={(e) => onVideoUpload(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
      </div>

      <div className="p-4 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
        <div className="text-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              uploading 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                Yuklanmoqda...
              </>
            ) : (
              <>
                <span>📤</span>
                Video Yuklash
              </>
            )}
          </label>
          <p className="mt-2 text-sm text-gray-500">
            MP4, MOV yoki boshqa video formatlari (maks. 500MB)
          </p>
        </div>
      </div>

      {currentVideoUrl && (
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="mb-2 text-sm font-medium text-gray-700">Video ko'rib chiqish:</p>
          <VideoPreview videoUrl={currentVideoUrl} />
        </div>
      )}
    </div>
  );
};

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 🎯 State Management
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    level: LEVELS.BEGINNER.value,
    category: "",
    status: COURSE_STATUS.DRAFT,
  });
  
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // 📝 Form State
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    order: 0,
  });
  
  const [newLesson, setNewLesson] = useState({
    title: "",
    videoUrl: "", // ✅ content o'rniga videoUrl
    duration: 0,
    order: 0,
    moduleId: "",
  });

  // 🔧 Konfiguratsiya
  const token = localStorage.getItem("accessToken");
  const API_URL = "http://localhost:5000/api";

  // 📡 API Service Functions - YAXSHILANGAN VERSIYA
  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    // Agar body bo'lsa, stringify qilish
    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    console.log(`📤 API So'rov: ${endpoint}`, config);

    const response = await fetch(`${API_URL}${endpoint}`, config);

    console.log(`📨 API Javob: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('❌ API Xato tafsilotlari:', errorData);
      } catch (e) {
        console.error('❌ API Xato parse qilishda:', e);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }, [token, API_URL]);

  // 📥 Ma'lumotlarni yuklash
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [courseData, modulesData, lessonsData] = await Promise.all([
        apiRequest(`/courses/${id}`),
        apiRequest(`/modules/course/${id}`),
        apiRequest(`/lessons/course/${id}`)
      ]);

      console.log('📥 Kurs maʼlumotlari:', courseData);
      console.log('📥 Modullar:', modulesData);
      console.log('📥 Darslar:', lessonsData);

      // Kurs ma'lumotlari
      if (courseData.data?.course || courseData.data) {
        const c = courseData.data.course || courseData.data;
        setCourse({
          title: c.title || "",
          description: c.description || "",
          price: c.price?.amount || c.price || 0,
          level: c.level || LEVELS.BEGINNER.value,
          category: c.category || "",
          status: c.status || COURSE_STATUS.DRAFT,
        });
      }

      // Modullar va video darslar
      setModules(modulesData.data?.modules || modulesData.modules || modulesData.data || []);
      setLessons(lessonsData.data?.lessons || lessonsData.lessons || lessonsData.data || []);

    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
      alert("Kurs ma'lumotlarini yuklashda xatolik yuz berdi");
      navigate("/teacher/courses");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, apiRequest]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // ➕ MODUL QO'SHISH
  const handleAddModule = async (e) => {
    e.preventDefault();
    
    if (!newModule.title.trim()) {
      alert("Iltimos, modul nomini kiriting!");
      return;
    }

    try {
      await apiRequest("/modules", {
        method: "POST",
        body: {
          title: newModule.title,
          description: newModule.description,
          courseId: id,
          order: newModule.order || modules.length + 1,
        },
      });

      alert("✅ Modul muvaffaqiyatli qo'shildi!");
      setNewModule({ title: "", description: "", order: 0 });
      
      // Yangilangan modullarni yuklash
      const modulesData = await apiRequest(`/modules/course/${id}`);
      setModules(modulesData.data?.modules || modulesData.modules || modulesData.data || []);

    } catch (error) {
      console.error("Modul qo'shishda xatolik:", error);
      alert("Modul qo'shishda xatolik yuz berdi: " + error.message);
    }
  };

  // ➕ VIDEO DARS QO'SHISH - TUZATILGAN VERSIYA
  const handleAddLesson = async (e) => {
    e.preventDefault();
    
    if (!newLesson.moduleId) {
      alert("Iltimos, modulni tanlang!");
      return;
    }

    if (!newLesson.title.trim()) {
      alert("Iltimos, dars nomini kiriting!");
      return;
    }

    if (!newLesson.videoUrl?.trim()) {
      alert("Iltimos, video manbasini kiriting!");
      return;
    }

    try {
      const lessonData = {
        title: newLesson.title,
        description: "", // Agar kerak bo'lsa qo'shing
        courseId: id,
        moduleId: newLesson.moduleId,
        videoUrl: newLesson.videoUrl, // ✅ To'g'ri field
        duration: parseInt(newLesson.duration) || 0,
        order: parseInt(newLesson.order) || (lessons.filter(l => 
          l.module === newLesson.moduleId || l.moduleId === newLesson.moduleId
        ).length + 1),
        isFree: false,
        type: "video"
      };

      console.log('📤 Dars maʼlumotlari:', lessonData);

      const result = await apiRequest("/lessons", {
        method: "POST",
        body: lessonData,
      });

      console.log('✅ Dars qoshish natijasi:', result);

      alert("✅ Video dars muvaffaqiyatli qo'shildi!");
      setNewLesson({
        title: "",
        videoUrl: "",
        duration: 0,
        order: 0,
        moduleId: "",
      });

      // Yangilangan video darslarni yuklash
      const lessonsData = await apiRequest(`/lessons/course/${id}`);
      setLessons(lessonsData.data?.lessons || lessonsData.lessons || lessonsData.data || []);

    } catch (error) {
      console.error("Video dars qo'shishda xatolik:", error);
      alert("Video dars qo'shishda xatolik yuz berdi: " + error.message);
    }
  };

  // 💾 KURSNI YANGILASH
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiRequest(`/courses/${id}`, {
        method: "PUT",
        body: {
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          price: {
            amount: Number(course.price),
            currency: "USD",
            isFree: Number(course.price) === 0,
          },
        },
      });

      alert("✅ Kurs muvaffaqiyatli yangilandi!");
    } catch (error) {
      console.error("Kursni yangilashda xatolik:", error);
      alert("Kursni yangilashda xatolik yuz berdi: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ✏️ MODULNI YANGILASH
  const handleUpdateModule = async (moduleId, field, value) => {
    try {
      const moduleToUpdate = modules.find(m => m._id === moduleId);
      if (!moduleToUpdate) return;

      await apiRequest(`/modules/${moduleId}`, {
        method: "PUT",
        body: {
          ...moduleToUpdate,
          [field]: value,
        },
      });

      // Local state yangilash
      setModules(prev => prev.map(module =>
        module._id === moduleId ? { ...module, [field]: value } : module
      ));
    } catch (error) {
      console.error("Modulni yangilashda xatolik:", error);
      alert("Modulni yangilashda xatolik yuz berdi: " + error.message);
    }
  };

  // ✏️ VIDEO DARSNI YANGILASH
  const handleUpdateLesson = async (lessonId, field, value) => {
    try {
      const lessonToUpdate = lessons.find(l => l._id === lessonId);
      if (!lessonToUpdate) return;

      await apiRequest(`/lessons/${lessonId}`, {
        method: "PUT",
        body: {
          ...lessonToUpdate,
          [field]: value,
        },
      });

      // Local state yangilash
      setLessons(prev => prev.map(lesson =>
        lesson._id === lessonId ? { ...lesson, [field]: value } : lesson
      ));
    } catch (error) {
      console.error("Video darsni yangilashda xatolik:", error);
      alert("Video darsni yangilashda xatolik yuz berdi: " + error.message);
    }
  };

  // 🗑️ O'CHIRISH FUNKSIYALARI
  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Bu modulni o'chirmoqchimisiz? Ichidagi barcha video darslar ham o'chadi!")) return;

    try {
      await apiRequest(`/modules/${moduleId}`, { method: "DELETE" });
      alert("✅ Modul muvaffaqiyatli o'chirildi!");
      
      const modulesData = await apiRequest(`/modules/course/${id}`);
      setModules(modulesData.data?.modules || modulesData.modules || modulesData.data || []);
    } catch (error) {
      console.error("Modulni o'chirishda xatolik:", error);
      alert("Modulni o'chirishda xatolik yuz berdi: " + error.message);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Bu video darsni o'chirmoqchimisiz?")) return;

    try {
      await apiRequest(`/lessons/${lessonId}`, { method: "DELETE" });
      alert("✅ Video dars muvaffaqiyatli o'chirildi!");
      
      const lessonsData = await apiRequest(`/lessons/course/${id}`);
      setLessons(lessonsData.data?.lessons || lessonsData.lessons || lessonsData.data || []);
    } catch (error) {
      console.error("Video darsni o'chirishda xatolik:", error);
      alert("Video darsni o'chirishda xatolik yuz berdi: " + error.message);
    }
  };

  // 📢 NASHR QILISH FUNKSIYALARI
  const handlePublishCourse = async () => {
    const validationErrors = validateCourse(course, modules, lessons);
    
    if (validationErrors.length > 0) {
      alert(`❌ Quyidagi kamchiliklar tuzatilishi kerak:\n• ${validationErrors.join('\n• ')}`);
      
      if (validationErrors.some(err => err.includes('modul'))) setActiveTab("modules");
      else if (validationErrors.some(err => err.includes('video'))) setActiveTab("lessons");
      else setActiveTab("basic");
      
      return;
    }

    if (!window.confirm("Kursni nashr qilmoqchimisiz? Nashr qilingandan so'ng, kurs o'quvchilar uchun ko'rinadi.")) return;

    try {
      setPublishing(true);
      await apiRequest(`/courses/${id}/publish`, { method: "PATCH" });
      
      alert("✅ Kurs muvaffaqiyatli nashr qilindi!");
      setCourse(prev => ({ ...prev, status: COURSE_STATUS.PUBLISHED }));
    } catch (error) {
      console.error("Nashr qilishda xatolik:", error);
      alert("Kursni nashr qilishda xatolik yuz berdi: " + error.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublishCourse = async () => {
    if (!window.confirm("Kursni nashrdan olmoqchimisiz? Bu kurs endi o'quvchilar uchun ko'rinmaydi.")) return;

    try {
      setPublishing(true);
      await apiRequest(`/courses/${id}/unpublish`, { method: "PATCH" });
      
      alert("✅ Kurs nashrdan olindi!");
      setCourse(prev => ({ ...prev, status: COURSE_STATUS.DRAFT }));
    } catch (error) {
      console.error("Nashrdan olishda xatolik:", error);
      alert("Kursni nashrdan olishda xatolik yuz berdi: " + error.message);
    } finally {
      setPublishing(false);
    }
  };

  // 🎨 TAB KONTENTLARI
  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab.id)}
      className={`flex-1 min-w-0 py-4 px-4 text-center font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
        isActive
          ? "border-blue-500 text-blue-600 bg-blue-50"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="mr-2">{tab.icon}</span>
      {tab.label}
    </button>
  );

  const tabs = [
    { id: "basic", label: "Asosiy ma'lumotlar", icon: "📝" },
    { id: "modules", label: "Modullar", icon: "📚" },
    { id: "lessons", label: "Video Darslar", icon: "🎬" },
    { id: "preview", label: "Ko'rib chiqish", icon: "👁️" },
  ];

  // 📊 STATISTIKA
  const courseStats = {
    totalModules: modules.length,
    totalLessons: lessons.length,
    totalDuration: lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0),
    isFree: course.price === 0
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* 🎯 HEADER */}
        <div className="mb-6">
          <ActionButton 
            onClick={() => navigate("/teacher/courses")} 
            variant="secondary"
            icon="←"
          >
            Orqaga
          </ActionButton>
          
          <div className="flex items-start justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ✏️ {course.title}
              </h1>
              <p className="text-gray-600">
                Kursni boshqarish va video darslar qo'shish
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <StatusBadge status={course.status} />
              
              {course.status === COURSE_STATUS.PUBLISHED ? (
                <ActionButton
                  onClick={handleUnpublishCourse}
                  variant="warning"
                  loading={publishing}
                  icon="🚫"
                >
                  Nashrdan Olish
                </ActionButton>
              ) : (
                <ActionButton
                  onClick={handlePublishCourse}
                  variant="success"
                  loading={publishing}
                  icon="📢"
                >
                  Nashr Qilish
                </ActionButton>
              )}
            </div>
          </div>
        </div>

        {/* 📑 TAB NAVIGATION */}
        <div className="mb-6 bg-white border rounded-lg shadow-sm">
          <div className="flex overflow-x-auto border-b">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </div>

          <div className="p-6">
            {/* 1. ASOSIY MA'LUMOTLAR */}
            {activeTab === "basic" && (
              <form onSubmit={handleUpdateCourse} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Kurs nomi *
                    </label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => setCourse({ ...course, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Kategoriya *
                    </label>
                    <input
                      type="text"
                      value={course.category}
                      onChange={(e) => setCourse({ ...course, category: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Narx (USD)
                    </label>
                    <input
                      type="number"
                      value={course.price}
                      onChange={(e) => setCourse({ ...course, price: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Daraja
                    </label>
                    <select
                      value={course.level}
                      onChange={(e) => setCourse({ ...course, level: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      {Object.values(LEVELS).map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Tavsif *
                  </label>
                  <textarea
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    rows="6"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <ActionButton
                    type="submit"
                    loading={saving}
                    variant="success"
                    icon="💾"
                  >
                    {saving ? "Saqlanmoqda..." : "Ma'lumotlarni saqlash"}
                  </ActionButton>

                  {course.status === COURSE_STATUS.DRAFT && (
                    <ActionButton
                      onClick={handlePublishCourse}
                      loading={publishing}
                      variant="primary"
                      icon="📢"
                    >
                      Nashr Qilish
                    </ActionButton>
                  )}
                </div>
              </form>
            )}

            {/* 2. MODULLAR */}
            {activeTab === "modules" && (
              <div className="space-y-6">
                {/* ➕ YANGI MODUL FORM */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="mb-3 text-lg font-semibold">
                    ➕ Yangi Modul Qo'shish
                  </h3>
                  <form onSubmit={handleAddModule} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Modul nomi *"
                        value={newModule.title}
                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Tartib raqami"
                        value={newModule.order}
                        onChange={(e) => setNewModule({ ...newModule, order: parseInt(e.target.value) || 0 })}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <textarea
                      placeholder="Modul tavsifi"
                      value={newModule.description}
                      onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      rows="2"
                    />
                    <ActionButton type="submit" variant="primary" icon="➕">
                      Modul Qo'shish
                    </ActionButton>
                  </form>
                </div>

                {/* 📚 MODULLAR RO'YXATI */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    📚 Modullar ({modules.length})
                  </h3>
                  
                  {modules.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 bg-white border rounded-lg">
                      📭 Hozircha modullar mavjud emas
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {modules.map((module) => {
                        const moduleLessons = lessons.filter(lesson => 
                          lesson.module === module._id || lesson.moduleId === module._id
                        );
                        
                        return (
                          <div key={module._id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={module.title}
                                  onChange={(e) => handleUpdateModule(module._id, "title", e.target.value)}
                                  onBlur={(e) => handleUpdateModule(module._id, "title", e.target.value)}
                                  className="w-full p-2 mb-2 text-lg font-semibold border-b border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
                                <textarea
                                  value={module.description || ""}
                                  onChange={(e) => handleUpdateModule(module._id, "description", e.target.value)}
                                  onBlur={(e) => handleUpdateModule(module._id, "description", e.target.value)}
                                  className="w-full p-2 mb-2 text-sm text-gray-600 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                  rows="2"
                                  placeholder="Tavsif qo'shish..."
                                />
                                <div className="flex gap-4 text-xs text-gray-500">
                                  <span>
                                    Tartib:
                                    <input
                                      type="number"
                                      value={module.order || 0}
                                      onChange={(e) => handleUpdateModule(module._id, "order", parseInt(e.target.value) || 0)}
                                      onBlur={(e) => handleUpdateModule(module._id, "order", parseInt(e.target.value) || 0)}
                                      className="w-12 p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                      min="0"
                                    />
                                  </span>
                                  <span>
                                    Video darslar: {moduleLessons.length} ta
                                  </span>
                                  <span>
                                    Jami vaqt: {moduleLessons.reduce((total, lesson) => total + (lesson.duration || 0), 0)} daq
                                  </span>
                                </div>
                              </div>
                              <ActionButton
                                onClick={() => handleDeleteModule(module._id)}
                                variant="danger"
                                icon="🗑️"
                              >
                                O'chirish
                              </ActionButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. VIDEO DARSLAR */}
            {activeTab === "lessons" && (
              <div className="space-y-6">
                {/* ➕ YANGI VIDEO DARS FORM */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="mb-3 text-lg font-semibold">➕ Yangi Video Dars Qo'shish</h3>
                  <form onSubmit={handleAddLesson} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <select
                        value={newLesson.moduleId}
                        onChange={(e) => setNewLesson({ ...newLesson, moduleId: e.target.value })}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      >
                        <option value="">Modulni tanlang *</option>
                        {modules.map((module) => (
                          <option key={module._id} value={module._id}>
                            {module.title}
                          </option>
                        ))}
                      </select>

                      {/* Video dars turi - faqat video */}
                      <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-center gap-2 text-blue-700">
                          <span className="text-lg">🎬</span>
                          <span className="font-medium">Video Dars</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Video dars nomi *"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Video davomiyligi (daqiqa)"
                        value={newLesson.duration}
                        onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) || 0 })}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        type="number"
                        placeholder="Tartib raqami"
                        value={newLesson.order}
                        onChange={(e) => setNewLesson({ ...newLesson, order: parseInt(e.target.value) || 0 })}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    {/* Video yuklash komponenti */}
                    <VideoUploader 
                      onVideoUpload={(url) => setNewLesson({ ...newLesson, videoUrl: url })}
                      currentVideoUrl={newLesson.videoUrl}
                    />

                    <ActionButton type="submit" variant="success" icon="➕">
                      Video Dars Qo'shish
                    </ActionButton>
                  </form>
                </div>

                {/* 🎬 VIDEO DARSLAR RO'YXATI */}
                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    🎬 Video Darslar ({lessons.length})
                  </h3>
                  
                  {lessons.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 bg-white border rounded-lg">
                      📭 Hozircha video darslar mavjud emas
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {lessons.map((lesson) => {
                        const module = modules.find(m => 
                          m._id === (lesson.moduleId || lesson.module?._id)
                        );
                        
                        return (
                          <div key={lesson._id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">🎬</span>
                                  <input
                                    type="text"
                                    value={lesson.title}
                                    onChange={(e) => handleUpdateLesson(lesson._id, "title", e.target.value)}
                                    onBlur={(e) => handleUpdateLesson(lesson._id, "title", e.target.value)}
                                    className="flex-1 p-2 text-lg font-semibold border-b border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                    placeholder="Video dars nomi"
                                  />
                                </div>
                                
                                <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                                  <span>
                                    Modul:
                                    <select
                                      value={lesson.moduleId || lesson.module?._id}
                                      onChange={(e) => handleUpdateLesson(lesson._id, "moduleId", e.target.value)}
                                      onBlur={(e) => handleUpdateLesson(lesson._id, "moduleId", e.target.value)}
                                      className="p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                    >
                                      {modules.map((mod) => (
                                        <option key={mod._id} value={mod._id}>
                                          {mod.title}
                                        </option>
                                      ))}
                                    </select>
                                  </span>
                                  
                                  <span>
                                    Davomiylik:
                                    <input
                                      type="number"
                                      value={lesson.duration || 0}
                                      onChange={(e) => handleUpdateLesson(lesson._id, "duration", parseInt(e.target.value) || 0)}
                                      onBlur={(e) => handleUpdateLesson(lesson._id, "duration", parseInt(e.target.value) || 0)}
                                      className="w-16 p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                      min="0"
                                    /> daq
                                  </span>
                                  
                                  <span>
                                    Tartib:
                                    <input
                                      type="number"
                                      value={lesson.order || 0}
                                      onChange={(e) => handleUpdateLesson(lesson._id, "order", parseInt(e.target.value) || 0)}
                                      onBlur={(e) => handleUpdateLesson(lesson._id, "order", parseInt(e.target.value) || 0)}
                                      className="w-12 p-1 ml-1 border border-transparent rounded hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                      min="0"
                                    />
                                  </span>
                                </div>
                              </div>
                              
                              <ActionButton
                                onClick={() => handleDeleteLesson(lesson._id)}
                                variant="danger"
                                icon="🗑️"
                              >
                                O'chirish
                              </ActionButton>
                            </div>
                            
                            {/* Video yuklash va ko'rish */}
                            <div className="mb-3">
                              <VideoUploader 
                                onVideoUpload={(url) => handleUpdateLesson(lesson._id, "videoUrl", url)}
                                currentVideoUrl={lesson.videoUrl}
                              />
                            </div>
                            
                            {module && (
                              <div className="mt-2 text-xs text-gray-400">
                                📁 Modul: {module.title}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. KO'RIB CHIQISH */}
            {activeTab === "preview" && (
              <div className="space-y-6">
                {/* 📊 STATISTIKA */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="p-4 text-center border border-blue-100 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">{courseStats.totalModules}</div>
                    <div className="text-sm text-gray-600">Modullar</div>
                  </div>
                  <div className="p-4 text-center border border-green-100 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">{courseStats.totalLessons}</div>
                    <div className="text-sm text-gray-600">Video Darslar</div>
                  </div>
                  <div className="p-4 text-center border border-yellow-100 rounded-lg bg-yellow-50">
                    <div className="text-2xl font-bold text-yellow-600">{courseStats.totalDuration}</div>
                    <div className="text-sm text-gray-600">Jami daqiqa</div>
                  </div>
                  <div className="p-4 text-center border border-purple-100 rounded-lg bg-purple-50">
                    <div className="text-2xl font-bold text-purple-600">
                      {courseStats.isFree ? "Bepul" : `$${course.price}`}
                    </div>
                    <div className="text-sm text-gray-600">Narx</div>
                  </div>
                </div>

                {/* 🏗️ KURS TUZILMASI */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-xl font-semibold">🏗️ Kurs Tuzilmasi</h3>
                  
                  {modules.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      📭 Hozircha modullar mavjud emas
                    </div>
                  ) : (
                    modules.map((module) => {
                      const moduleLessons = lessons.filter(lesson => 
                        lesson.module === module._id || lesson.moduleId === module._id
                      );
                      
                      return (
                        <div key={module._id} className="mb-6 last:mb-0">
                          <h4 className="flex items-center mb-3 text-lg font-semibold">
                            <span className="px-3 py-1 mr-2 text-sm text-blue-800 bg-blue-100 border border-blue-200 rounded-full">
                              {module.order || 0}
                            </span>
                            {module.title}
                          </h4>
                          
                          {module.description && (
                            <p className="mb-3 ml-8 text-sm text-gray-600">
                              {module.description}
                            </p>
                          )}
                          
                          {moduleLessons.length === 0 ? (
                            <p className="ml-8 text-sm text-gray-500">
                              📭 Hozircha video darslar mavjud emas
                            </p>
                          ) : (
                            <div className="ml-8 space-y-3">
                              {moduleLessons.map((lesson) => (
                                <div key={lesson._id} className="flex items-start gap-3 p-3 text-sm border border-gray-100 rounded bg-gray-50 hover:bg-gray-100">
                                  <span className="mt-1 text-base">🎬</span>
                                  <div className="flex-1">
                                    <div className="font-medium">{lesson.title}</div>
                                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                      <span>{lesson.duration || 0} daqiqa</span>
                                      <span>#{lesson.order || 0}</span>
                                    </div>
                                    {lesson.videoUrl && (
                                      <div className="mt-2">
                                        <VideoPreview videoUrl={lesson.videoUrl} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 🎯 ACTION BUTTONS */}
                <div className="flex flex-wrap gap-3">
                  <ActionButton 
                    onClick={() => navigate("/teacher/courses")} 
                    variant="secondary"
                    icon="←"
                  >
                    Orqaga
                  </ActionButton>
                  
                  <ActionButton
                    onClick={() => window.open(`/courses/${id}`, "_blank")}
                    variant="primary"
                    icon="👁️"
                  >
                    Kursni Ko'rish
                  </ActionButton>
                  
                  {course.status === COURSE_STATUS.DRAFT && (
                    <ActionButton
                      onClick={handlePublishCourse}
                      loading={publishing}
                      variant="success"
                      icon="📢"
                    >
                      Kursni Nashr Qilish
                    </ActionButton>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}