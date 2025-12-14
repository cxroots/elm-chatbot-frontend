import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi, Document } from '../api/chat'
import { useAuth } from '../context/AuthContext'
import {
  PlusCircle,
  Search,
  Trash2,
  Pencil,
  Save,
  Loader2,
  FileText,
  X,
  ChevronDown,
  User,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  LogOut,
} from 'lucide-react'
import faqIcon from '../assets/faq-icon.png'
import ChatWidget from './ChatWidget'

type Tab = 'list' | 'add' | 'settings'

interface FAQForm {
  title: string
  text: string
  category: string
  language: string
}

const LANGUAGES = ['English', 'العربية']

// Language code mapping
const LANGUAGE_CODE_MAP: Record<string, string> = {
  'English': 'en',
  'العربية': 'ar',
  'en': 'English',
  'ar': 'العربية'
}

const getLanguageDisplay = (code: string | undefined): string => {
  if (!code) return '—'
  return LANGUAGE_CODE_MAP[code] || code
}

const getLanguageCode = (display: string): string => {
  return LANGUAGE_CODE_MAP[display] || display
}

// Translations for UI text
const TRANSLATIONS: Record<string, Record<string, string>> = {
  'English': {
    faqManager: 'FAQ Manager',
    manageKnowledgeBase: 'Manage your knowledge base',
    systemLanguage: 'System Language:',
    allFaqs: 'All FAQs',
    addNew: 'Add New',
    settings: 'Manage Categories',
    searchFaqs: 'Search FAQs...',
    category: 'Category',
    language: 'Language',
    showing: 'Showing',
    of: 'of',
    documents: 'documents',
    question: 'Question',
    answer: 'Answer',
    actions: 'Actions',
    addFaq: 'Add FAQ',
    noFaqsFound: 'No FAQs found',
    getStarted: 'Get started by adding your first question & answer.',
    createNewFaq: 'Add New Q&A',
    questionLabel: 'Question',
    questionPlaceholder: 'e.g., How do I reset my password?',
    languageLabel: 'Language',
    categoryLabel: 'Category',
    selectCategory: 'Select a category...',
    categoryPlaceholder: 'Type or select a category...',
    otherCategory: 'Other (type new)',
    newCategoryInputPlaceholder: 'Enter new category name...',
    noCategoriesFound: 'No categories found for this language. Please add some in Settings.',
    answerLabel: 'Answer',
    answerPlaceholder: 'Enter the answer to this question...',
    cancel: 'Cancel',
    saveFaq: 'Save Q&A',
    configuration: 'Configuration',
    manageCategories: 'Manage Categories',
    selectLanguageToEdit: 'Select Language to Edit',
    newCategoryPlaceholder: 'New category...',
    add: 'Add',
    noCategoriesYet: 'No categories for this language yet.',
    confirmDelete: 'Are you sure you want to delete this FAQ?',
    deleteSuccess: 'FAQ deleted successfully',
    deleteFailed: 'Failed to delete FAQ',
    addSuccess: 'Q&A successfully added!',
    fillAllFields: 'Please fill in all fields',
    loadFailed: 'Failed to load documents',
    editFaq: 'Edit Q&A',
    updateFaq: 'Update Q&A',
    updateSuccess: 'Q&A updated successfully!',
    updateFailed: 'Failed to update Q&A',
    deleteConfirmTitle: 'Delete Q&A',
    deleteConfirmMessage: 'Are you sure you want to delete this Q&A? This action cannot be undone.',
    delete: 'Delete',
    page: 'Page',
    previous: 'Previous',
    next: 'Next',
    itemsPerPage: 'Items per page',
    testYourFaqs: 'Test Your FAQs',
    tryAskingQuestion: 'Try asking a question to see how the AI responds with your FAQs',
    typeMessage: 'Type a message...',
    send: 'Send',
    selectAll: 'Select all',
    selected: 'selected',
    deleteSelected: 'Delete Selected',
    bulkDeleteConfirmTitle: 'Delete Multiple Q&As',
    bulkDeleteConfirmMessage: 'Are you sure you want to delete the selected Q&As? This action cannot be undone.',
    bulkDeleteSuccess: 'Selected FAQs deleted successfully',
    bulkDeleteFailed: 'Failed to delete some FAQs',
    editCategory: 'Edit',
    saveCategory: 'Save',
    categoryRenameSuccess: 'Category renamed successfully',
    categoryRenameFailed: 'Failed to rename category',
    categoryAlreadyExists: 'A category with this name already exists',
    logout: 'Logout',
  },
  'العربية': {
    faqManager: 'مدير الأسئلة الشائعة',
    manageKnowledgeBase: 'إدارة قاعدة المعرفة الخاصة بك',
    systemLanguage: 'لغة النظام:',
    allFaqs: 'جميع الأسئلة',
    addNew: 'إضافة جديد',
    settings: 'إدارة الفئات',
    searchFaqs: 'البحث في الأسئلة...',
    category: 'الفئة',
    language: 'اللغة',
    showing: 'عرض',
    of: 'من',
    documents: 'مستندات',
    question: 'السؤال',
    answer: 'الإجابة',
    actions: 'الإجراءات',
    addFaq: 'إضافة سؤال',
    noFaqsFound: 'لم يتم العثور على أسئلة',
    getStarted: 'ابدأ بإضافة أول سؤال وجواب.',
    createNewFaq: 'إضافة سؤال وجواب',
    questionLabel: 'السؤال',
    questionPlaceholder: 'مثال: كيف أقوم بإعادة تعيين كلمة المرور؟',
    languageLabel: 'اللغة',
    categoryLabel: 'الفئة',
    selectCategory: 'اختر فئة...',
    categoryPlaceholder: 'اكتب أو اختر فئة...',
    otherCategory: 'أخرى (اكتب جديد)',
    newCategoryInputPlaceholder: 'أدخل اسم الفئة الجديدة...',
    noCategoriesFound: 'لم يتم العثور على فئات لهذه اللغة. يرجى إضافة بعضها في الإعدادات.',
    answerLabel: 'الإجابة',
    answerPlaceholder: 'أدخل الإجابة على هذا السؤال...',
    cancel: 'إلغاء',
    saveFaq: 'حفظ السؤال والجواب',
    configuration: 'التكوين',
    manageCategories: 'إدارة الفئات',
    selectLanguageToEdit: 'اختر اللغة للتعديل',
    newCategoryPlaceholder: 'فئة جديدة...',
    add: 'إضافة',
    noCategoriesYet: 'لا توجد فئات لهذه اللغة بعد.',
    confirmDelete: 'هل أنت متأكد من حذف هذا السؤال؟',
    deleteSuccess: 'تم حذف السؤال بنجاح',
    deleteFailed: 'فشل في حذف السؤال',
    addSuccess: 'تمت إضافة السؤال والجواب بنجاح!',
    fillAllFields: 'يرجى ملء جميع الحقول',
    loadFailed: 'فشل في تحميل المستندات',
    editFaq: 'تعديل السؤال والجواب',
    updateFaq: 'تحديث السؤال والجواب',
    updateSuccess: 'تم تحديث السؤال والجواب بنجاح!',
    updateFailed: 'فشل في تحديث السؤال والجواب',
    deleteConfirmTitle: 'حذف السؤال والجواب',
    deleteConfirmMessage: 'هل أنت متأكد من حذف هذا السؤال والجواب؟ لا يمكن التراجع عن هذا الإجراء.',
    delete: 'حذف',
    page: 'صفحة',
    previous: 'السابق',
    next: 'التالي',
    itemsPerPage: 'عناصر لكل صفحة',
    testYourFaqs: 'اختبر أسئلتك الشائعة',
    tryAskingQuestion: 'جرب طرح سؤال لترى كيف يستجيب الذكاء الاصطناعي مع أسئلتك الشائعة',
    typeMessage: 'اكتب رسالة...',
    send: 'إرسال',
    selectAll: 'تحديد الكل',
    selected: 'محدد',
    deleteSelected: 'حذف المحدد',
    bulkDeleteConfirmTitle: 'حذف عدة أسئلة وأجوبة',
    bulkDeleteConfirmMessage: 'هل أنت متأكد من حذف الأسئلة والأجوبة المحددة؟ لا يمكن التراجع عن هذا الإجراء.',
    bulkDeleteSuccess: 'تم حذف الأسئلة المحددة بنجاح',
    bulkDeleteFailed: 'فشل في حذف بعض الأسئلة',
    editCategory: 'تعديل',
    saveCategory: 'حفظ',
    categoryRenameSuccess: 'تم تغيير اسم الفئة بنجاح',
    categoryRenameFailed: 'فشل في تغيير اسم الفئة',
    categoryAlreadyExists: 'يوجد فئة بهذا الاسم بالفعل',
    logout: 'تسجيل الخروج',
  }
}

export default function DataManagement() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('list')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Settings State (categories derived from documents)
  const [categories, setCategories] = useState<Record<string, string[]>>({})
  // Settings tab hidden - these states preserved for potential future use
  // const [selectedSettingsLanguage, setSelectedSettingsLanguage] = useState<string>('العربية')
  // const [newCategory, setNewCategory] = useState('')
  // const [editingCategory, setEditingCategory] = useState<string | null>(null)
  // const [editedCategoryName, setEditedCategoryName] = useState('')

  // Form State
  const [formData, setFormData] = useState<FAQForm>({
    title: '',
    text: '',
    category: '',
    language: 'العربية'
  })
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [showEditCustomCategory, setShowEditCustomCategory] = useState(false)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterLanguage, setFilterLanguage] = useState<string>('')
  const [systemLanguage, setSystemLanguage] = useState<string>(() => {
    const saved = localStorage.getItem('system_language')
    return saved && ['English', 'العربية'].includes(saved) ? saved : 'English'
  })
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; docId: string; docTitle: string }>({
    show: false,
    docId: '',
    docTitle: ''
  })

  // Edit Modal State
  const [editModal, setEditModal] = useState<{ show: boolean; doc: Document | null }>({
    show: false,
    doc: null
  })

  // Multi-selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Bulk Delete Modal State
  const [bulkDeleteModal, setBulkDeleteModal] = useState<{ show: boolean }>({
    show: false
  })
  const [editFormData, setEditFormData] = useState<FAQForm>({
    title: '',
    text: '',
    category: '',
    language: 'العربية'
  })

  // Load initial data
  useEffect(() => {
    loadDocuments()
  }, [])

  // Persist language preference
  useEffect(() => {
    localStorage.setItem('system_language', systemLanguage)
  }, [systemLanguage])

  // Auto-dismiss toast notifications after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await chatApi.getAllDocuments()
      setDocuments(response.documents)

      // Extract categories from documents grouped by language
      const extractedCategories: Record<string, string[]> = {}
      response.documents.forEach(doc => {
        const langDisplay = getLanguageDisplay(doc.language) || 'English'
        if (!extractedCategories[langDisplay]) {
          extractedCategories[langDisplay] = []
        }
        if (doc.category && !extractedCategories[langDisplay].includes(doc.category)) {
          extractedCategories[langDisplay].push(doc.category)
        }
      })
      setCategories(extractedCategories)
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

      const langCode = getLanguageCode(formData.language)
      const newDoc = {
        title: formData.title,
        text: formData.text,
        category: formData.category,
        language: langCode,
        doc_type: 'faq',
        metadata: {}
      }

      await chatApi.ingestDocuments([newDoc], langCode)

      setMessage({
        type: 'success',
        text: TRANSLATIONS[systemLanguage]?.addSuccess || 'FAQ successfully added!'
      })

      // Reset only title and text, keep language and category for quick re-entry
      setFormData({
        title: '',
        text: '',
        category: formData.category, // Keep category selected
        language: formData.language  // Keep language selected
      })
      setShowCustomCategory(false)
      await loadDocuments()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to add FAQ'
      })
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (doc: Document) => {
    setDeleteModal({ show: true, docId: doc.id, docTitle: doc.title })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, docId: '', docTitle: '' })
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      await chatApi.deleteDocument(deleteModal.docId)
      setMessage({ type: 'success', text: TRANSLATIONS[systemLanguage]?.deleteSuccess || 'FAQ deleted successfully' })
      closeDeleteModal()
      await loadDocuments()
    } catch (error) {
      setMessage({ type: 'error', text: TRANSLATIONS[systemLanguage]?.deleteFailed || 'Failed to delete FAQ' })
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (doc: Document) => {
    setEditFormData({
      title: doc.title,
      text: doc.text,
      category: doc.category,
      language: getLanguageDisplay(doc.language) || 'العربية'
    })
    setEditModal({ show: true, doc })
  }

  const closeEditModal = () => {
    setEditModal({ show: false, doc: null })
    setEditFormData({ title: '', text: '', category: '', language: 'العربية' })
  }

  const handleUpdate = async () => {
    if (!editModal.doc) return

    try {
      setLoading(true)
      setMessage(null)

      if (!editFormData.title || !editFormData.text || !editFormData.category || !editFormData.language) {
        throw new Error(TRANSLATIONS[systemLanguage]?.fillAllFields || 'Please fill in all fields')
      }

      await chatApi.updateDocument(editModal.doc.id, {
        title: editFormData.title,
        text: editFormData.text,
        category: editFormData.category,
        language: getLanguageCode(editFormData.language),
        doc_type: 'faq',
        metadata: {}
      })

      setMessage({
        type: 'success',
        text: TRANSLATIONS[systemLanguage]?.updateSuccess || 'FAQ updated successfully!'
      })

      closeEditModal()
      await loadDocuments()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || TRANSLATIONS[systemLanguage]?.updateFailed || 'Failed to update FAQ'
      })
    } finally {
      setLoading(false)
    }
  }

  // Selection handlers
  const toggleSelectItem = (docId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docId)) {
        newSet.delete(docId)
      } else {
        newSet.add(docId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    const currentPageIds = paginatedDocuments.map(doc => doc.id)
    const allSelected = currentPageIds.every(id => selectedIds.has(id))

    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (allSelected) {
        // Deselect all on current page
        currentPageIds.forEach(id => newSet.delete(id))
      } else {
        // Select all on current page
        currentPageIds.forEach(id => newSet.add(id))
      }
      return newSet
    })
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const openBulkDeleteModal = () => {
    setBulkDeleteModal({ show: true })
  }

  const closeBulkDeleteModal = () => {
    setBulkDeleteModal({ show: false })
  }

  const handleBulkDelete = async () => {
    try {
      setLoading(true)
      const deletePromises = Array.from(selectedIds).map(id =>
        chatApi.deleteDocument(id)
      )
      await Promise.all(deletePromises)
      setMessage({ type: 'success', text: t('bulkDeleteSuccess') })
      closeBulkDeleteModal()
      clearSelection()
      await loadDocuments()
    } catch (error) {
      setMessage({ type: 'error', text: t('bulkDeleteFailed') })
    } finally {
      setLoading(false)
    }
  }

  // Settings tab functions - hidden, preserved for potential future use
  /*
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

  const renameCategory = async (oldName: string, newName: string) => {
    const trimmedName = newName.trim()
    if (!trimmedName || trimmedName === oldName) {
      setEditingCategory(null)
      return
    }
    const currentCats = categories[selectedSettingsLanguage] || []
    if (currentCats.includes(trimmedName)) {
      setMessage({
        type: 'error',
        text: TRANSLATIONS[systemLanguage]?.categoryAlreadyExists || 'A category with this name already exists'
      })
      return
    }
    try {
      setLoading(true)
      const langCode = getLanguageCode(selectedSettingsLanguage)
      const docsToUpdate = documents.filter(
        doc => doc.category === oldName && doc.language === langCode
      )
      for (const doc of docsToUpdate) {
        await chatApi.updateDocument(doc.id, { category: trimmedName })
      }
      setCategories({
        ...categories,
        [selectedSettingsLanguage]: currentCats.map(c => c === oldName ? trimmedName : c)
      })
      await loadDocuments()
      setMessage({
        type: 'success',
        text: TRANSLATIONS[systemLanguage]?.categoryRenameSuccess || 'Category renamed successfully'
      })
    } catch (error) {
      console.error('Error renaming category:', error)
      setMessage({
        type: 'error',
        text: TRANSLATIONS[systemLanguage]?.categoryRenameFailed || 'Failed to rename category'
      })
    } finally {
      setLoading(false)
      setEditingCategory(null)
      setEditedCategoryName('')
    }
  }
  */

  // Get unique categories from documents for filter dropdown
  const uniqueCategories = [...new Set(documents.map(doc => doc.category))]

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = filterCategory === '' || doc.category === filterCategory
    const matchesLanguage = filterLanguage === '' || getLanguageDisplay(doc.language) === filterLanguage

    return matchesSearch && matchesCategory && matchesLanguage
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterCategory, filterLanguage, itemsPerPage])

  // Get categories for the currently selected language in the form
  const formCategories = categories[formData.language] || []

  // Get categories for the edit form language
  const editFormCategories = categories[editFormData.language] || []

  // Translation helper function
  const t = (key: string): string => {
    return TRANSLATIONS[systemLanguage]?.[key] || TRANSLATIONS['English'][key] || key
  }

  // Check if RTL (Arabic)
  const isRTL = systemLanguage === 'العربية'

  // Handle logout
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

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
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {user && (
                <span className="text-sm text-slate-300 hidden sm:block">{user.username}</span>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">Logged in</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>
              </div>
            )}
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
            {/* Settings tab hidden - categories now derived from FAQs
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
            */}
          </div>

          {/* Toast Notification */}
          {message && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
              <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}>
                <span>{message.text}</span>
                <button onClick={() => setMessage(null)} className="hover:opacity-75 ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
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

              {/* Selection Action Bar */}
              {selectedIds.size > 0 && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-800">
                      {selectedIds.size} {t('selected')}
                    </span>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                  <button
                    onClick={openBulkDeleteModal}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('deleteSelected')}
                  </button>
                </div>
              )}

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
                        <th className="px-4 py-3 w-12">
                          <input
                            type="checkbox"
                            checked={paginatedDocuments.length > 0 && paginatedDocuments.every(doc => selectedIds.has(doc.id))}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500 cursor-pointer"
                            title={t('selectAll')}
                          />
                        </th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>{t('question')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>{t('category')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-medium text-gray-600`}>{t('language')}</th>
                        <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedDocuments.map((doc) => (
                        <tr key={doc.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(doc.id) ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-4 w-12">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(doc.id)}
                              onChange={() => toggleSelectItem(doc.id)}
                              className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-slate-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{doc.title}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {doc.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {getLanguageDisplay(doc.language)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(doc)}
                                className="p-2 text-gray-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                title={t('editFaq')}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(doc)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={t('delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{t('itemsPerPage')}:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => setItemsPerPage(Number(e.target.value))}
                          className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 text-gray-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-gray-600">
                          {t('page')} {currentPage} {t('of')} {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 text-gray-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      <button
                        onClick={() => setActiveTab('add')}
                        className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                      >
                        {t('addFaq')}
                      </button>
                    </div>
                  )}

                  {/* Add FAQ Button (when no pagination needed) */}
                  {totalPages <= 1 && (
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mt-6`}>
                      <button
                        onClick={() => setActiveTab('add')}
                        className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                      >
                        {t('addFaq')}
                      </button>
                    </div>
                  )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('questionLabel')}</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={t('questionPlaceholder')}
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
                    {!showCustomCategory ? (
                      <select
                        value={formData.category}
                        onChange={e => {
                          if (e.target.value === '__other__') {
                            setShowCustomCategory(true)
                            setFormData({ ...formData, category: '' })
                          } else {
                            setFormData({ ...formData, category: e.target.value })
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                      >
                        <option value="">{t('selectCategory')}</option>
                        {formCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__other__">{t('otherCategory')}</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder={t('newCategoryInputPlaceholder')}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomCategory(false)
                            setFormData({ ...formData, category: '' })
                          }}
                          className="px-3 py-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('answerLabel')}</label>
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

          {/* SETTINGS VIEW - Hidden: categories now derived from FAQs
          {activeTab === 'settings' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('configuration')}</h2>

              <div className="max-w-2xl">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-6">
                    <Tag className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{t('manageCategories')}</h3>
                  </div>

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
                        {editingCategory === cat ? (
                          <input
                            type="text"
                            value={editedCategoryName}
                            onChange={e => setEditedCategoryName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') renameCategory(cat, editedCategoryName)
                              if (e.key === 'Escape') {
                                setEditingCategory(null)
                                setEditedCategoryName('')
                              }
                            }}
                            autoFocus
                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-700">{cat}</span>
                        )}
                        <div className="flex items-center gap-2">
                          {editingCategory === cat ? (
                            <button
                              onClick={() => renameCategory(cat, editedCategoryName)}
                              disabled={loading}
                              className="text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
                              title={t('saveCategory')}
                            >
                              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCategory(cat)
                                setEditedCategoryName(cat)
                              }}
                              className="text-gray-400 hover:text-slate-600 transition-colors"
                              title={t('editCategory')}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removeCategory(cat)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
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
          */}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('deleteConfirmTitle')}</h3>
                  <p className="text-sm text-gray-500">{deleteModal.docTitle}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{t('deleteConfirmMessage')}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('bulkDeleteConfirmTitle')}</h3>
                  <p className="text-sm text-gray-500">{selectedIds.size} {t('selected')}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{t('bulkDeleteConfirmMessage')}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeBulkDeleteModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {t('deleteSelected')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{t('editFaq')}</h3>
                <button
                  onClick={closeEditModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('questionLabel')}</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={t('questionPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('languageLabel')}</label>
                    <select
                      value={editFormData.language}
                      onChange={e => setEditFormData({ ...editFormData, language: e.target.value, category: '' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('categoryLabel')}</label>
                    {!showEditCustomCategory ? (
                      <select
                        value={editFormCategories.includes(editFormData.category) ? editFormData.category : '__other__'}
                        onChange={e => {
                          if (e.target.value === '__other__') {
                            setShowEditCustomCategory(true)
                          } else {
                            setEditFormData({ ...editFormData, category: e.target.value })
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                      >
                        <option value="">{t('selectCategory')}</option>
                        {editFormCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__other__">{t('otherCategory')}</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editFormData.category}
                          onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
                          placeholder={t('newCategoryInputPlaceholder')}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditCustomCategory(false)
                            setEditFormData({ ...editFormData, category: '' })
                          }}
                          className="px-3 py-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('answerLabel')}</label>
                  <textarea
                    value={editFormData.text}
                    onChange={e => setEditFormData({ ...editFormData, text: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder={t('answerPlaceholder')}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('updateFaq')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Widget for Testing FAQs */}
      <ChatWidget
        isRTL={isRTL}
        translations={{
          testYourFaqs: t('testYourFaqs'),
          tryAskingQuestion: t('tryAskingQuestion'),
          typeMessage: t('typeMessage'),
          send: t('send'),
        }}
      />
    </div>
  )
}
