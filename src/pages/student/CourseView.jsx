import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function CourseView({ courseId, course }) {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [watchedLessons, setWatchedLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollment, setEnrollment] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const videoRef = useRef(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const API_URL = "http://localhost:5000/api";

  // Enrollment holatini tekshirish
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/enrollments/courses/${courseId}/enrollment`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsEnrolled(true);
          setEnrollment(data.data.enrollment);
          
          // Ko'rilgan darslarni yuklash
          if (data.data.enrollment?.progress?.completedLessons) {
            const completedLessons = {};
            data.data.enrollment.progress.completedLessons.forEach(lessonId => {
              completedLessons[lessonId] = true;
            });
            setWatchedLessons(completedLessons);
          }
        }
      } catch (err) {
        console.error('Enrollment check error:', err);
      }
    };

    checkEnrollment();
  }, [courseId, token]);

  // Modullar va darslarni olish
  useEffect(() => {
    const fetchCourseContent = async () => {
      try {
        setLoading(true);

        // 1. Modullarni olish
        const modulesRes = await fetch(`${API_URL}/modules/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const modulesData = await modulesRes.json();

        if (modulesData.success) {
          const modulesWithLessons = modulesData.data.modules;
          setModules(modulesWithLessons);

          // Birinchi modul va darsni tanlash
          if (modulesWithLessons.length > 0) {
            const firstModule = modulesWithLessons[0];
            setSelectedModule(firstModule);
            
            if (firstModule.lessons && firstModule.lessons.length > 0) {
              setSelectedLesson(firstModule.lessons[0]);
            }
          }
        }

      } catch (err) {
        console.error("❌ Xato:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseContent();
  }, [courseId, token]);

  // Kursga yozilish
  const handleEnroll = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/enrollments/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        setIsEnrolled(true);
        setEnrollment(data.data.enrollment);
        alert('✅ Kursga muvaffaqiyatli yozildingiz!');
      } else {
        alert(data.message || 'Kursga yozilishda xatolik');
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      alert('Server xatosi');
    }
  };

  // Darsni tugallangan deb belgilash
  const completeLesson = async (lessonId) => {
    if (!isEnrolled || !token) return;

    setCompletingLesson(true);
    try {
      const res = await fetch(`${API_URL}/enrollments/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        setWatchedLessons(prev => ({
          ...prev,
          [lessonId]: true
        }));
        
        // Enrollment ma'lumotlarini yangilash
        setEnrollment(data.data.enrollment);
        
        console.log('✅ Dars tugallandi!');
      } else {
        console.error('Darsni tugallash xatosi:', data.message);
      }
    } catch (err) {
      console.error('Complete lesson error:', err);
    } finally {
      setCompletingLesson(false);
    }
  };

  // Video play - 30 soniyadan so'ng darsni tugallangan deb belgilash
  const handleVideoPlay = () => {
    if (!isEnrolled || !selectedLesson || watchedLessons[selectedLesson._id]) return;

    setTimeout(() => {
      completeLesson(selectedLesson._id);
    }, 30000); // 30 soniya
  };

  // Keyingi darsga o'tish
  const goToNextLesson = () => {
    if (!selectedModule || !selectedLesson) return;

    const currentModuleIndex = modules.findIndex(m => m._id === selectedModule._id);
    const currentLessonIndex = selectedModule.lessons.findIndex(l => l._id === selectedLesson._id);

    // Avval joriy modul ichida keyingi darsni tekshirish
    if (currentLessonIndex < selectedModule.lessons.length - 1) {
      // Xuddi shu modul ichidagi keyingi dars
      setSelectedLesson(selectedModule.lessons[currentLessonIndex + 1]);
    } else if (currentModuleIndex < modules.length - 1) {
      // Keyingi modulning birinchi darsi
      const nextModule = modules[currentModuleIndex + 1];
      setSelectedModule(nextModule);
      if (nextModule.lessons && nextModule.lessons.length > 0) {
        setSelectedLesson(nextModule.lessons[0]);
      } else {
        setSelectedLesson(null);
      }
    }
  };

  // Oldingi darsga o'tish
  const goToPreviousLesson = () => {
    if (!selectedModule || !selectedLesson) return;

    const currentModuleIndex = modules.findIndex(m => m._id === selectedModule._id);
    const currentLessonIndex = selectedModule.lessons.findIndex(l => l._id === selectedLesson._id);

    // Avval joriy modul ichida oldingi darsni tekshirish
    if (currentLessonIndex > 0) {
      // Xuddi shu modul ichidagi oldingi dars
      setSelectedLesson(selectedModule.lessons[currentLessonIndex - 1]);
    } else if (currentModuleIndex > 0) {
      // Oldingi modulning oxirgi darsi
      const prevModule = modules[currentModuleIndex - 1];
      setSelectedModule(prevModule);
      if (prevModule.lessons && prevModule.lessons.length > 0) {
        setSelectedLesson(prevModule.lessons[prevModule.lessons.length - 1]);
      } else {
        setSelectedLesson(null);
      }
    }
  };

  // Modul tanlanganda
  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    if (module.lessons && module.lessons.length > 0) {
      setSelectedLesson(module.lessons[0]);
    } else {
      setSelectedLesson(null);
    }
  };

  // Dars tanlanganda
  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

  // Ortga qaytish
  const handleBack = () => {
    navigate(`/student/course/${courseId}`);
  };

  // Progressni hisoblash
  const calculateProgress = () => {
    if (!enrollment?.progress) return 0;
    return enrollment.progress.completionPercentage || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">⏳ Kurs tarkibi yuklanmoqda...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
          <strong>❌ Xatolik:</strong> {error}
          <button 
            onClick={handleBack}
            className="px-3 py-1 ml-4 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Ortga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 rounded-lg hover:text-gray-800 hover:bg-gray-100"
            >
              ← Ortga
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{course?.title}</h1>
              {isEnrolled && enrollment && (
                <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                  <span>Progress: {calculateProgress()}%</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 transition-all bg-green-600 rounded-full"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <span>
                    {enrollment.progress?.completedLessonsCount || 0} / {enrollment.progress?.totalLessons || 0} dars
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isEnrolled ? (
              <button
                onClick={handleEnroll}
                className="px-6 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                🎓 Kursga Yozilish
              </button>
            ) : (
              <div className="text-sm text-gray-500">
                ✅ Siz yozilgansiz
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asosiy kontent */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chap panel - Modullar va darslar */}
        <div className="overflow-y-auto border-r border-gray-200 w-80 bg-gray-50">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">📚 Kurs Tarkibi</h2>
            
            {modules.length > 0 ? (
              <div className="space-y-2">
                {modules.map((module, index) => (
                  <div key={module._id} className="bg-white border border-gray-200 rounded-lg">
                    {/* Modul sarlavhasi */}
                    <button
                      onClick={() => handleModuleSelect(module)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedModule?._id === module._id
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-600">{index + 1}.</span>
                          <span className="font-medium text-gray-800">{module.title}</span>
                        </div>
                        <span className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded">
                          {module.lessons?.length || 0}
                        </span>
                      </div>
                      {module.description && (
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {module.description}
                        </p>
                      )}
                    </button>

                    {/* Darslar ro'yxati */}
                    {selectedModule?._id === module._id && module.lessons && module.lessons.length > 0 && (
                      <div className="px-3 pb-2">
                        <div className="mt-2 space-y-1">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <button
                              key={lesson._id}
                              onClick={() => handleLessonSelect(lesson)}
                              className={`w-full text-left p-2 rounded text-sm transition ${
                                selectedLesson?._id === lesson._id
                                  ? "bg-blue-100 text-blue-700 font-medium border border-blue-200"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">{lessonIndex + 1}.</span>
                                  <span className="text-left">{lesson.title}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {lesson.duration && (
                                    <span className="px-1 text-xs text-gray-500 bg-gray-100 rounded">
                                      {lesson.duration}m
                                    </span>
                                  )}
                                  {watchedLessons[lesson._id] && (
                                    <span className="text-xs text-green-500">✅</span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <div className="mb-2 text-4xl">📝</div>
                <p>Hozircha modullar mavjud emas</p>
              </div>
            )}
          </div>
        </div>

        {/* O'ng panel - Video va dars kontenti */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            {!isEnrolled ? (
              // Agar yozilmagan bo'lsa
              <div className="py-16 text-center">
                <div className="mb-4 text-6xl">🔒</div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800">
                  Kursga Yozilmagansiz
                </h3>
                <p className="max-w-md mx-auto mb-8 text-gray-600">
                  Ushbu kursni ko'rish uchun avval kursga yozilishingiz kerak. 
                  Bepul va oson - bir marta bosish kifoya!
                </p>
                <button
                  onClick={handleEnroll}
                  className="px-8 py-3 text-lg font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  🎓 Bepul Kursga Yozilish
                </button>
              </div>
            ) : selectedLesson ? (
              // Agar yozilgan va dars tanlangan bo'lsa
              <>
                {/* Dars sarlavhasi va navigatsiya */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-blue-600">{selectedModule?.title}</span>
                      <span className="mx-2">›</span>
                      <span className="font-medium text-gray-700">{selectedLesson.title}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPreviousLesson}
                        className="px-4 py-2 text-sm transition border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={!selectedModule || !selectedLesson}
                      >
                        ← Oldingi
                      </button>
                      <button
                        onClick={goToNextLesson}
                        className="px-4 py-2 text-sm text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                        disabled={!selectedModule || !selectedLesson}
                      >
                        Keyingi →
                      </button>
                    </div>
                  </div>
                  
                  <h2 className="mb-4 text-2xl font-bold text-gray-800">
                    🎥 {selectedLesson.title}
                  </h2>
                  
                  {watchedLessons[selectedLesson._id] && (
                    <div className="inline-flex items-center px-3 py-1 mb-4 text-sm text-green-800 bg-green-100 rounded-full">
                      ✅ Siz ushbu darsni tugatgansiz
                    </div>
                  )}
                </div>

                {/* Video player */}
                <div className="mb-6">
                  <div className="overflow-hidden bg-black rounded-lg">
                    {selectedLesson.videoUrl ? (
                      <video
                        ref={videoRef}
                        width="100%"
                        height="auto"
                        controls
                        onPlay={handleVideoPlay}
                        className="w-full"
                        poster={selectedLesson.thumbnail}
                      >
                        <source src={selectedLesson.videoUrl} type="video/mp4" />
                        Sizning brauzeringiz video formatini qo'llab-quvvatlamaydi.
                      </video>
                    ) : (
                      <div className="flex items-center justify-center w-full bg-gray-800 h-96">
                        <div className="text-center text-white">
                          <div className="mb-4 text-6xl">📹</div>
                          <p className="text-xl">Video mavjud emas</p>
                          <p className="mt-2 text-gray-400">Ushbu darsda video kontent yo'q</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Video ostidagi tugmalar */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      {!watchedLessons[selectedLesson._id] && (
                        <button
                          onClick={() => completeLesson(selectedLesson._id)}
                          disabled={completingLesson}
                          className="flex items-center px-4 py-2 space-x-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {completingLesson ? (
                            <>
                              <span>⏳</span>
                              <span>Tugallanmoqda...</span>
                            </>
                          ) : (
                            <>
                              <span>✅</span>
                              <span>Darsni Tugatish</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {selectedLesson.duration && (
                      <div className="text-sm text-gray-600">
                        ⏱️ Davomiylik: {selectedLesson.duration} daqiqa
                      </div>
                    )}
                  </div>
                </div>

                {/* Dars tavsifi */}
                <div className="p-6 rounded-lg bg-gray-50">
                  <h3 className="mb-3 text-lg font-semibold text-gray-800">📝 Dars haqida</h3>
                  <div className="prose max-w-none">
                    <p className="leading-relaxed text-gray-700 whitespace-pre-line">
                      {selectedLesson.content || selectedLesson.description || "Ushbu dars haqida ma'lumot mavjud emas."}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Agar yozilgan lekin dars tanlanmagan bo'lsa
              <div className="py-16 text-center">
                <div className="mb-4 text-6xl">🎬</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-700">
                  Darsni Tanlang
                </h3>
                <p className="mb-6 text-gray-500">
                  Chap tomondagi modullardan darsni tanlang va o'qishni boshlang.
                </p>
                {selectedModule?.lessons?.length === 0 && (
                  <p className="inline-block p-3 text-yellow-600 rounded-lg bg-yellow-50">
                    ⚠️ Ushbu modulda hozircha darslar mavjud emas.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}