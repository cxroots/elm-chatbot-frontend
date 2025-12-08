import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi, Document } from '../api/chat'
import {
  PlusCircle,
  Settings,
  Search,
  Trash2,
  Pencil,
  Save,
  Loader2,
  FileText,
  Tag,
  X,
  ChevronDown,
  User,
  ListChecks,
} from 'lucide-react'
import faqIcon from '../assets/faq-icon.png'

type Tab = 'list' | 'add' | 'settings'

interface FAQForm {
  title: string
  text: string
  category: string
  language: string
}

const LANGUAGES = ['English', 'Arabic']

const DEFAULT_CATEGORIES: Record<string, string[]> = {
  'English': ['General', 'Billing', 'Technical Support', 'Account', 'Product Features'],
  'Arabic': ['عام', 'الفواتير', 'الدعم الفني', 'الحساب', 'ميزات المنتج']
}

// Translations for UI text
const TRANSLATIONS: Record<string, Record<string, string>> = {
  'English': {
    faqManager: 'FAQ Manager',
    manageKnowledgeBase: 'Manage your knowledge base',
    systemLanguage: 'System Language:',
    allFaqs: 'All FAQs',
    addNew: 'Add New',
    settings: 'Settings',
    searchFaqs: 'Search FAQs...',
    category: 'Category',
    language: 'Language',
    showing: 'Showing',
    of: 'of',
    documents: 'documents',
    title: 'Title',
    actions: 'Actions',
    addFaq: 'Add FAQ',
    noFaqsFound: 'No FAQs found',
    getStarted: 'Get started by adding your first FAQ document.',
    createNewFaq: 'Create New FAQ',
    titleLabel: 'Title',
    titlePlaceholder: 'e.g., How do I reset my password?',
    languageLabel: 'Language',
    categoryLabel: 'Category',
    selectCategory: 'Select a category...',
    noCategoriesFound: 'No categories found for this language. Please add some in Settings.',
    answerContent: 'Answer Content',
    answerPlaceholder: 'Enter the detailed answer here...',
    cancel: 'Cancel',
    saveFaq: 'Save FAQ',
    configuration: 'Configuration',
    manageCategories: 'Manage Categories',
    selectLanguageToEdit: 'Select Language to Edit',
    newCategoryPlaceholder: 'New category...',
    add: 'Add',
    noCategoriesYet: 'No categories for this language yet.',
    confirmDelete: 'Are you sure you want to delete this FAQ?',
    deleteSuccess: 'FAQ deleted successfully',
    deleteFailed: 'Failed to delete FAQ',
    addSuccess: 'FAQ successfully added!',
    fillAllFields: 'Please fill in all fields',
    loadFailed: 'Failed to load documents',
  },
  'Arabic': {
    faqManager: 'مدير الأسئلة الشائعة',
    manageKnowledgeBase: 'إدارة قاعدة المعرفة الخاصة بك',
    systemLanguage: 'لغة النظام:',
    allFaqs: 'جميع الأسئلة',
    addNew: 'إضافة جديد',
    settings: 'الإعدادات',
    searchFaqs: 'البحث في الأسئلة...',
    category: 'الفئة',
    language: 'اللغة',
    showing: 'عرض',
    of: 'من',
    documents: 'مستندات',
    title: 'العنوان',
    actions: 'الإجراءات',
    addFaq: 'إضافة سؤال',
    noFaqsFound: 'لم يتم العثور على أسئلة',
    getStarted: 'ابدأ بإضافة أول سؤال شائع.',
    createNewFaq: 'إنشاء سؤال جديد',
    titleLabel: 'العنوان',
    titlePlaceholder: 'مثال: كيف أقوم بإعادة تعيين كلمة المرور؟',
    languageLabel: 'اللغة',
    categoryLabel: 'الفئة',
    selectCategory: 'اختر فئة...',
    noCategoriesFound: 'لم يتم العثور على فئات لهذه اللغة. يرجى إضافة بعضها في الإعدادات.',
    answerContent: 'محتوى الإجابة',
    answerPlaceholder: 'أدخل الإجابة التفصيلية هنا...',
    cancel: 'إلغاء',
    saveFaq: 'حفظ السؤال',
    configuration: 'التكوين',
    manageCategories: 'إدارة الفئات',
    selectLanguageToEdit: 'اختر اللغة للتعديل',
    newCategoryPlaceholder: 'فئة جديدة...',
    add: 'إضافة',
    noCategoriesYet: 'لا توجد فئات لهذه اللغة بعد.',
    confirmDelete: 'هل أنت متأكد من حذف هذا السؤال؟',
    deleteSuccess: 'تم حذف السؤال بنجاح',
    deleteFailed: 'فشل في حذف السؤال',
    addSuccess: 'تمت إضافة السؤال بنجاح!',
    fillAllFields: 'يرجى ملء جميع الحقول',
    loadFailed: 'فشل في تحميل المستندات',
  }
}

export default function DataManagement() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('list')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Settings State
  const [categories, setCategories] = useState<Record<string, string[]>>(DEFAULT_CATEGORIES)
  const [selectedSettingsLanguage, setSelectedSettingsLanguage] = useState<string>('English')
  const [newCategory, setNewCategory] = useState('')

  // Form State
  const [formData, setFormData] = useState<FAQForm>({
    title: '',
    text: '',
    category: '',
    language: 'English'
  })

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterLanguage, setFilterLanguage] = useState<string>('')
  const [systemLanguage, setSystemLanguage] = useState<string>('English')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  // Load initial data
  useEffect(() => {
    loadDocuments()
    loadSettings()
  }, [])

  // Persist settings whenever they change
  useEffect(() => {
    localStorage.setItem('faq_categories_map', JSON.stringify(categories))
  }, [categories])

  const loadSettings = () => {
    const savedCategories = localStorage.getItem('faq_categories_map')
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }
  }

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await chatApi.getAllDocuments()
      setDocuments(response.documents)
    } catch (error) {
      console.error('Error loading documents:', error)
      setMessage({ type: 'error', text: TRANSLATIONS[systemLanguage]?.loadFailed || 'Failed to load documents' })
    } finally {
      setLoading(false)
    }
  }

  const handleIngest = async () => {
    try {
      setLoading(true)
      setMessage(null)

      if (!formData.title || !formData.text || !formData.category || !formData.language) {
        throw new Error(TRANSLATIONS[systemLanguage]?.fillAllFields || 'Please fill in all fields')
      }

      const newDoc = {
        id: crypto.randomUUID(),
        title: formData.title,
        text: formData.text,
        category: formData.category,
        metadata: {
          language: formData.language,
          created_at: new Date().toISOString()
        }
      }

      await chatApi.ingestDocuments([newDoc])

      setMessage({
        type: 'success',
        text: TRANSLATIONS[systemLanguage]?.addSuccess || 'FAQ successfully added!'
      })

      // Reset form and go to list
      setFormData({
        title: '',
        text: '',
        category: '',
        language: formData.language // Keep language selected
      })
      await loadDocuments()
      setActiveTab('list')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to add FAQ'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm(TRANSLATIONS[systemLanguage]?.confirmDelete || 'Are you sure you want to delete this FAQ?')) return

    try {
      setLoading(true)
      await chatApi.deleteDocument(docId)
      setMessage({ type: 'success', text: TRANSLATIONS[systemLanguage]?.deleteSuccess || 'FAQ deleted successfully' })
      await loadDocuments()
    } catch (error) {
      setMessage({ type: 'error', text: TRANSLATIONS[systemLanguage]?.deleteFailed || 'Failed to delete FAQ' })
    } finally {
      setLoading(false)
    }
  }

  const addCategory = () => {
    if (!newCategory.trim()) return

    const currentCats = categories[selectedSettingsLanguage] || []
    if (!currentCats.includes(newCategory.trim())) {
      setCategories({
        ...categories,
        [selectedSettingsLanguage]: [...currentCats, newCategory.trim()]
      })
      setNewCategory('')
    }
  }

  const removeCategory = (catToRemove: string) => {
    const currentCats = categories[selectedSettingsLanguage] || []
    setCategories({
      ...categories,
      [selectedSettingsLanguage]: currentCats.filter(c => c !== catToRemove)
    })
  }

  // Get unique categories from documents for filter dropdown
  const uniqueCategories = [...new Set(documents.map(doc => doc.category))]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = filterCategory === '' || doc.category === filterCategory
    const matchesLanguage = filterLanguage === '' || doc.metadata?.language === filterLanguage

    return matchesSearch && matchesCategory && matchesLanguage
  })

  // Get categories for the currently selected language in the form
  const formCategories = categories[formData.language] || []

  // Translation helper function
  const t = (key: string): string => {
    return TRANSLATIONS[systemLanguage]?.[key] || TRANSLATIONS['English'][key] || key
  }

  // Check if RTL (Arabic)
  const isRTL = systemLanguage === 'Arabic'

  return (
    <div className={`min-h-screen bg-gray-100 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={faqIcon} alt="FAQ Manager" className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-bold text-white">{t('faqManager')}</h1>
            <p className="text-sm text-slate-400">{t('manageKnowledgeBase')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm border border-slate-600"
            >
              {systemLanguage}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSystemLanguage(lang)
                      setShowLanguageDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      systemLanguage === lang ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* User Avatar */}
          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        {/* Main container */}
        <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-2 p-4 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'list'
                ? 'bg-slate-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <ListChecks className="w-4 h-4" />
              {t('allFaqs')}
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'add'
                ? 'bg-slate-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <PlusCircle className="w-4 h-4" />
              {t('addNew')}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings'
                ? 'bg-slate-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Settings className="w-4 h-4" />
              {t('settings')}
            </button>
          </div>

          {/* Notifications */}
          {message && (
            <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="hover:opacity-75"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Content Area */}
          <div className="min-h-[500px]">

          {/* LIST VIEW */}
          {activeTab === 'list' && (
            <div className="p-6">
              {/* Search and Filters Row */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-xs">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                  <input
                    type="text"
                    placeholder={t('searchFaqs')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white`}
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`appearance-none ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white text-gray-700 text-sm min-w-[140px]`}
                  >
                    <option value="">{t('category')}</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none`} />
                </div>

                {/* Language Filter */}
                <div className="relative">
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className={`appearance-none ${isRTL ? 'pr-4 pl-10' : 'pl-4 pr-10'} py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white text-gray-700 text-sm min-w-[140px]`}
                  >
                    <option value="">{t('language')}</option>
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none`} />
                </div>

                <div className="flex-1" />

                <span className="text-sm text-gray-500">
                  {t('showing')} {filteredDocuments.length} {t('of')} {documents.length} {t('documents')}
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noFaqsFound')}</h3>
                  <p className="text-gray-500 mb-6">{t('getStarted')}</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {t('addFaq')}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>{t('title')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>{t('category')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>{t('language')}</th>
                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{doc.title}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {doc.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {doc.metadata?.language || '—'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 text-gray-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                title="Edit FAQ"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete FAQ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add FAQ Button */}
                  <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mt-6`}>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                    >
                      {t('addFaq')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADD VIEW */}
          {activeTab === 'add' && (
            <div className="p-8 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('createNewFaq')}</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('titleLabel')}</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={t('titlePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('languageLabel')}</label>
                    <select
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value, category: '' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('categoryLabel')}</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                    >
                      <option value="">{t('selectCategory')}</option>
                      {formCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {formCategories.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">{t('noCategoriesFound')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('answerContent')}</label>
                  <textarea
                    value={formData.text}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={t('answerPlaceholder')}
                  />
                </div>

                <div className={`pt-4 flex ${isRTL ? 'justify-start flex-row-reverse' : 'justify-end'} gap-3`}>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleIngest}
                    disabled={loading}
                    className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('saveFaq')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('configuration')}</h2>

              <div className="max-w-2xl">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('manageCategories')}</h3>
                  </div>

                  {/* Language Selector for Settings */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectLanguageToEdit')}</label>
                    <div className="flex gap-2">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang}
                          onClick={() => setSelectedSettingsLanguage(lang)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSettingsLanguage === lang
                            ? 'bg-slate-700 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder={t('newCategoryPlaceholder')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      onKeyDown={e => e.key === 'Enter' && addCategory()}
                    />
                    <button
                      onClick={addCategory}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm"
                    >
                      {t('add')}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {(categories[selectedSettingsLanguage] || []).map(cat => (
                      <div key={cat} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">{cat}</span>
                        <button
                          onClick={() => removeCategory(cat)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(categories[selectedSettingsLanguage] || []).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">{t('noCategoriesYet')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  )
}
