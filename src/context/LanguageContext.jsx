import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' }
];

export const TRANSLATIONS = {
  en: {
    // Nav & Common
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    docs: 'Docs',
    faq: 'FAQ',
    support: 'Community & Support',
    dashboard: 'Dashboard',
    wallet: 'Wallet & Top-up',
    api_keys: 'API Keys',
    plans: 'Plans',
    analytics: 'Analytics',
    settings: 'Settings',
    logout: 'Log Out',
    login: 'Sign In',
    register: 'Get API Key',
    
    // Hero & Landing
    hero_badge: 'HIGH SPEED YOUTUBE STREAMING GATEWAY',
    hero_title: 'The Ultimate YouTube API For Telegram Music Bots',
    hero_subtitle: 'Ultra-fast YouTube audio resolver built for YukkiMusic, AnonX, and PyTgCalls bots. High-quality 160kbps Opus stream links, zero IP bans, 99.99% uptime.',
    get_started_free: 'Get Started Free',
    explore_docs: 'Explore Documentation',
    join_telegram: 'Join Telegram Channel',

    // Wallet
    wallet_title: 'Account Wallet & Funds',
    available_balance: 'Available Balance',
    top_up_via_upi: 'Top-Up Wallet via UPI',
    submit_deposit: 'Submit Deposit',
    select_amount: 'Select Top-Up Amount',
    enter_utr: 'Enter 12-Digit UPI Transaction ID / UTR Number',
    transaction_history: 'Wallet & Transaction History',

    // Pricing
    starter_tier: 'Free Tier',
    basic_tier: 'Basic Tier',
    pro_tier: 'Pro Tier',
    unlimited_tier: 'Unlimited Tier',
    monthly: 'Monthly',
    yearly: 'Yearly (Save 20%)',
    popular_badge: 'MOST POPULAR',
    get_key: 'Generate Key'
  },
  hi: {
    // Nav & Common
    home: 'होम',
    features: 'विशेषताएं',
    pricing: 'मूल्य निर्धारण',
    docs: 'डॉक्यूमेंटेशन',
    faq: 'सामान्य प्रश्न',
    support: 'कम्युनिटी व सपोर्ट',
    dashboard: 'डैशबोर्ड',
    wallet: 'वॉलेट और फंड्स',
    api_keys: 'एपीआई कुंजियाँ (API Keys)',
    plans: 'प्लान्स',
    analytics: 'एनालिटिक्स',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    login: 'साइन इन',
    register: 'फ्री की जनरेट करें',

    // Hero & Landing
    hero_badge: 'हाई-स्पीड यूट्यूब स्ट्रीमिंग गेटवे',
    hero_title: 'टेलीग्राम म्यूजिक बॉट्स के लिए सर्वश्रेष्ठ यूट्यूब एपीआई',
    hero_subtitle: 'YukkiMusic, AnonX और PyTgCalls बॉट्स के लिए अल्ट्रा-फास्ट यूट्यूब ऑडियो रिज़ॉल्वर। 160kbps डायरेक्ट ओपस स्ट्रीम, नो आईपी बैन, 99.99% अपटाइम।',
    get_started_free: 'मुफ्त में शुरू करें',
    explore_docs: 'डॉक्यूमेंटेशन देखें',
    join_telegram: 'टेलीग्राम चैनल से जुड़ें',

    // Wallet
    wallet_title: 'खाता वॉलेट और फंड्स',
    available_balance: 'उपलब्ध बैलेंस',
    top_up_via_upi: 'Paytm UPI QR से वॉलेट रिचार्ज करें',
    submit_deposit: 'डिपॉजिट जमा करें',
    select_amount: 'रिचार्ज राशि चुनें',
    enter_utr: '12-अंकीय UPI ट्रांजेक्शन आईडी / UTR नंबर दर्ज करें',
    transaction_history: 'वॉलेट और लेनदेन इतिहास',

    // Pricing
    starter_tier: 'फ्री टियर',
    basic_tier: 'बेसिक टियर',
    pro_tier: 'प्रो टियर',
    unlimited_tier: 'अनलिमिटेड टियर',
    monthly: 'मासिक',
    yearly: 'वार्षिक (20% छूट)',
    popular_badge: 'सबसे लोकप्रिय',
    get_key: 'कुंजी प्राप्त करें'
  },
  es: {
    // Nav & Common
    home: 'Inicio',
    features: 'Características',
    pricing: 'Precios',
    docs: 'Documentación',
    faq: 'Preguntas Frecuentes',
    support: 'Comunidad y Soporte',
    dashboard: 'Panel de Control',
    wallet: 'Billetera y Saldo',
    api_keys: 'Claves API',
    plans: 'Planes',
    analytics: 'Analítica',
    settings: 'Ajustes',
    logout: 'Cerrar Sesión',
    login: 'Iniciar Sesión',
    register: 'Obtener Clave API',

    // Hero & Landing
    hero_badge: 'PASARELA DE TRANSMISIÓN DE YOUTUBE DE ALTA VELOCIDAD',
    hero_title: 'La API Definitiva de YouTube para Bots de Música de Telegram',
    hero_subtitle: 'Extractor de audio ultrarrápido creado para YukkiMusic, AnonX y PyTgCalls. Enlaces de transmisión Opus de 160kbps, sin bloqueos de IP y 99.99% de tiempo de actividad.',
    get_started_free: 'Empezar Gratis',
    explore_docs: 'Ver Documentación',
    join_telegram: 'Unirse al Canal de Telegram',

    // Wallet
    wallet_title: 'Billetera de la Cuenta y Fondos',
    available_balance: 'Saldo Disponible',
    top_up_via_upi: 'Recargar Billetera mediante UPI',
    submit_deposit: 'Enviar Depósito',
    select_amount: 'Seleccionar Monto',
    enter_utr: 'Ingrese el ID de Transacción / UTR de 12 dígitos',
    transaction_history: 'Historial de Transacciones',

    // Pricing
    starter_tier: 'Nivel Gratis',
    basic_tier: 'Nivel Básico',
    pro_tier: 'Nivel Pro',
    unlimited_tier: 'Nivel Ilimitado',
    monthly: 'Mensual',
    yearly: 'Anual (Ahorra 20%)',
    popular_badge: 'MÁS POPULAR',
    get_key: 'Generar Clave'
  },
  ru: {
    // Nav & Common
    home: 'Главная',
    features: 'Возможности',
    pricing: 'Тарифы',
    docs: 'Документация',
    faq: 'Вопросы и ответы',
    support: 'Поддержка и Telegram',
    dashboard: 'Панель управления',
    wallet: 'Кошелек и баланс',
    api_keys: 'API Ключи',
    plans: 'Планы',
    analytics: 'Аналитика',
    settings: 'Настройки',
    logout: 'Выйти',
    login: 'Войти',
    register: 'Получить API Ключ',

    // Hero & Landing
    hero_badge: 'ВЫСОКОСКОРОСТНОЙ ШЛЮЗ YOUTUBE STREAMING',
    hero_title: 'Лучший YouTube API для Музыкальных Telegram-ботов',
    hero_subtitle: 'Сверхбыстрый аудио-резолвер для YukkiMusic, AnonX и PyTgCalls. Прямые Opus потоки 160 кбит/с, без блокировок IP и 99.99% аптайм.',
    get_started_free: 'Начать Бесплатно',
    explore_docs: 'Документация',
    join_telegram: 'Наш Telegram Канал',

    // Wallet
    wallet_title: 'Кошелек и средства аккаунта',
    available_balance: 'Доступный баланс',
    top_up_via_upi: 'Пополнить баланс через UPI',
    submit_deposit: 'Отправить депозит',
    select_amount: 'Выберите сумму',
    enter_utr: 'Введите 12-значный номер UTR / ID транзакции',
    transaction_history: 'История транзакций',

    // Pricing
    starter_tier: 'Бесплатный',
    basic_tier: 'Базовый',
    pro_tier: 'Профессиональный',
    unlimited_tier: 'Безлимитный',
    monthly: 'Ежемесячно',
    yearly: 'Ежегодно (-20%)',
    popular_badge: 'ПОПУЛЯРНЫЙ',
    get_key: 'Создать Ключ'
  },
  ar: {
    // Nav & Common
    home: 'الرئيسية',
    features: 'المميزات',
    pricing: 'الأسعار',
    docs: 'التوثيق',
    faq: 'الأسئلة الشائعة',
    support: 'المجتمع والدعم',
    dashboard: 'لوحة التحكم',
    wallet: 'المحفظة والرصيد',
    api_keys: 'مفاتيح API',
    plans: 'الباقات',
    analytics: 'الإحصائيات',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    register: 'احصل على مفتاح API',

    // Hero & Landing
    hero_badge: 'بوابة بث يوتيوب فائقة السرعة',
    hero_title: 'أفضل واجهة برمجة تطبيقات يوتيوب لبوتات تيليجرام الموسيقية',
    hero_subtitle: 'محلل صوت يوتيوب فائق السرعة لبوتات YukkiMusic و AnonX و PyTgCalls. روابط بث Opus مباشرة بجودة 160kbps وبدون حظر IP.',
    get_started_free: 'ابدأ مجاناً',
    explore_docs: 'استعراض التوثيق',
    join_telegram: 'انضم إلى قناة تيليجرام',

    // Wallet
    wallet_title: 'محفظة الحساب والأرصدة',
    available_balance: 'الرصيد المتاح',
    top_up_via_upi: 'شحن المحفظة عبر UPI',
    submit_deposit: 'تأكيد الإيداع',
    select_amount: 'اختر المبلغ',
    enter_utr: 'أدخل رقم المعاملة المكون من 12 رقماً (UTR)',
    transaction_history: 'سجل المعاملات',

    // Pricing
    starter_tier: 'المستوى المجاني',
    basic_tier: 'المستوى الأساسي',
    pro_tier: 'المستوى الاحترافي',
    unlimited_tier: 'المستوى غير المحدود',
    monthly: 'شهرياً',
    yearly: 'سنوياً (وفر 20%)',
    popular_badge: 'الأكثر شعبية',
    get_key: 'إنشاء مفتاح'
  },
  bn: {
    // Nav & Common
    home: 'হোম',
    features: 'ফিচারসমূহ',
    pricing: 'মূল্যতালিকা',
    docs: 'ডকুমেন্টেশন',
    faq: 'সাধারণ প্রশ্নোত্তর',
    support: 'কমিউনিটি ও সাপোর্ট',
    dashboard: 'ড্যাশবোর্ড',
    wallet: 'ওয়ালেট ও ফান্ড',
    api_keys: 'এপিআই কী (API Keys)',
    plans: 'প্ল্যানসমূহ',
    analytics: 'অ্যানালিটিক্স',
    settings: 'সেটিংস',
    logout: 'লগআউট',
    login: 'সাইন ইন',
    register: 'ফ্রি এপিআই কী নিন',

    // Hero & Landing
    hero_badge: 'হাই-স্পিড ইউটিউব স্ট্রিমিং গেটওয়ে',
    hero_title: 'টেলিগ্রাম মিউজিক বটগুলোর জন্য সেরা ইউটিউব এপিআই',
    hero_subtitle: 'YukkiMusic, AnonX এবং PyTgCalls বটের জন্য আল্ট্রা-ফাস্ট ইউটিউব অডিও সমাধান। ১৬০kbps ডিরেক্ট ওপাস স্ট্রিম, কোনো আইপি ব্যান নেই।',
    get_started_free: 'বিনামূল্যে শুরু করুন',
    explore_docs: 'ডকুমেন্টেশন দেখুন',
    join_telegram: 'টেলিগ্রাম চ্যানেলে যুক্ত হন',

    // Wallet
    wallet_title: 'অ্যাকাউন্ট ওয়ালেট ও ফান্ডস',
    available_balance: 'উপলব্ধ ব্যালেন্স',
    top_up_via_upi: 'Paytm UPI QR দিয়ে ওয়ালেট টপ-আপ করুন',
    submit_deposit: 'ডিপোজিট জমা দিন',
    select_amount: 'টপ-আপ পরিমাণ নির্বাচন করুন',
    enter_utr: '১২-সংখ্যার ইউপিআই ট্রানজ্যাকশন আইডি / UTR লিখুন',
    transaction_history: 'ওয়ালেট ও লেনদেনের ইতিহাস',

    // Pricing
    starter_tier: 'ফ্রি টিয়ার',
    basic_tier: 'বেসিক টিয়ার',
    pro_tier: 'প্রো টিয়ার',
    unlimited_tier: 'আনলিমিটেড টিয়ার',
    monthly: 'মাসিক',
    yearly: 'বার্ষিক (২০% ছাড়)',
    popular_badge: 'সর্বাধিক জনপ্রিয়',
    get_key: 'কী তৈরি করুন'
  }
};

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('tunekey_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('tunekey_lang', currentLang);
    const langObj = LANGUAGES.find(l => l.code === currentLang);
    document.documentElement.lang = currentLang;
    if (langObj?.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [currentLang]);

  const changeLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setCurrentLang(langCode);
    }
  };

  const t = (key, fallback = '') => {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || fallback || key;
  };

  const activeLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ currentLang, activeLanguage, changeLanguage, languages: LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
