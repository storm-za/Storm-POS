import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPosProductSchema, insertPosCustomerSchema, insertPosOpenAccountSchema, defaultReceiptSettings, type InsertPosProduct, type PosProduct, type PosCustomer, type PosOpenAccount, type InsertPosOpenAccount } from "@shared/schema";
import { z } from "zod";
import {
  ShoppingCart, Package, Users, ChartBar as BarChart3, Plus, Minus, Trash as Trash2,
  CreditCard, CurrencyDollar as DollarSign, Receipt, MagnifyingGlass as Search,
  SignOut as LogOut, NotePencil as Edit, PlusCircle,
  Calendar, TrendUp as TrendingUp, FileText, Clock, Eye, EyeSlash as EyeOff,
  DownloadSimple as Download, User, UserPlus, GearSix as Settings, X, Printer,
  CaretDown as ChevronDown, CaretRight as ChevronRight, CaretLeft as ChevronLeft,
  Globe, BookOpen, Question as HelpCircle, ShareNetwork as Share2,
  UploadSimple as Upload, Table as FileSpreadsheet, ArrowClockwise as RefreshCw,
  Link as Link2, Check, List as Menu,
  Warning as AlertTriangle, XCircle, Tag, Hash, Lock,
  GridNine as Grid3X3, ListBullets as LayoutList, Folder, FolderSimplePlus as FolderPlus,
  Palette, ClipboardText as ClipboardList, Sliders as SlidersHorizontal,
  CheckCircle as CheckCircle2, Buildings as Building2, CircleNotch as Loader2,
  Bell, ListChecks, Moon, Sun
} from "@phosphor-icons/react";
import stormLogo from "@assets/STORM__500_x_250_px_-removebg-preview_1762197388108.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { ReceiptCustomizerDialog } from "@/components/ReceiptCustomizerDialog";
import UpsellBanner from "@/components/UpsellBanner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface Product {
  id: number;
  sku: string;
  name: string;
  costPrice: string;
  retailPrice: string;
  tradePrice?: string;
  quantity: number;
}

interface Customer {
  id: number;
  name: string;
  phone?: string;
  customerType: 'retail' | 'trade';
  notes?: string;
}

interface SaleItem {
  productId: number;
  name: string;
  price: string;
  costPrice?: string;
  quantity: number;
}

interface Sale {
  id: number;
  total: string;
  items: SaleItem[];
  customerId?: number;
  customerName?: string;
  notes?: string;
  paymentType: string;
  isVoided: boolean;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: number;
  staffAccountId?: number;
  staffAccount?: { username: string; userType: string };
  createdAt: string;
}

interface StaffAccount {
  id: number;
  posUserId: number;
  username: string;
  userType: 'staff' | 'management';
  isActive: boolean;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}

const getInvoiceVisDefs = (): Record<string, any> => {
  try {
    const u = JSON.parse(localStorage.getItem('posUser') || 'null');
    const saved = localStorage.getItem(`invoiceVisDefs_${u?.id || 'guest'}`);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
};

const saveInvoiceVisDef = (key: string, hidden: boolean) => {
  try {
    const u = JSON.parse(localStorage.getItem('posUser') || 'null');
    const storageKey = `invoiceVisDefs_${u?.id || 'guest'}`;
    const current = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (hidden) current[key] = false; else delete current[key];
    localStorage.setItem(storageKey, JSON.stringify(current));
  } catch {}
};

// Upload PDF bytes to server; returns a full URL for sharing/downloading
async function getTempPdfUrl(doc: any, fileName: string): Promise<string | null> {
  try {
    const base64 = (doc.output('datauristring') as string).split(',')[1];
    const res = await fetch('/api/pos/pdf-temp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: base64, filename: fileName }),
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    return `${window.location.origin}/api/pos/pdf-temp/${token}`;
  } catch {
    return null;
  }
}

// Speur Tauri op Android (nie 'n blaaier of rekenaar nie)
const isTauriAndroid = (): boolean =>
  typeof window !== 'undefined' &&
  '__TAURI_INTERNALS__' in window &&
  navigator.maxTouchPoints > 0;

// Stoor 'n PDF-blob in die toep se kas-vouer en maak dit oop met die inheemse PDF-kyker.
// Tauri Android alleen - een-tik in-toep aflaai, geen blaaier betrokke nie.
async function saveAndOpenPdfAndroid(blob: Blob, fileName: string): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core');
  const { openPath } = await import('@tauri-apps/plugin-opener');
  const arrayBuffer = await blob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 65536;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  const path = await invoke<string>('save_pdf_to_cache', { data: base64, filename: fileName });
  await openPath(path);
}

// Laai PDF af / Maak oop
// Tauri Android: stoor PDF in toepkaskas en maak oop met inheemse PDF-kyker (in-toep, geen blaaier)
// Laai altyd direk af via plaaslike blob URL -- maak nooit die deel-skerm oop nie
async function downloadOpenPDF(doc: any, fileName: string): Promise<void> {
  if (isTauriAndroid()) {
    await saveAndOpenPdfAndroid(doc.output('blob'), fileName);
    return;
  }
  const blob: Blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  a.style.display = 'none'; document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
}

// Deel PDF via deel-skerm -- stuur altyd die werklike PDF-leeer, nooit 'n skakel nie
// Tauri Android: gebruik tauri-plugin-sharekit vir Android Deel-skerm (slegs boodskapsteks)
// Blaaier/mobiel: navigator.share({ files }) heg die PDF direk aan (WhatsApp, Gmail, ens.)
// Rekenaar-terugval: stoor PDF plaaslik, maak WhatsApp Web oop met boodskapsteks slegs
async function sharePDFViaSheet(doc: any, fileName: string, message: string): Promise<'shared' | 'fallback' | 'cancelled'> {
  if (isTauriAndroid()) {
    try {
      const { shareText } = await import('@choochmeque/tauri-plugin-sharekit-api');
      await shareText(message);
      return 'shared';
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? '').toLowerCase();
      if (msg.includes('cancel') || msg.includes('dismiss')) return 'cancelled';
      return 'fallback';
    }
  }
  // Mobiel/blaaier: deel werklike PDF-leeer as aanhegsel
  if (navigator.share) {
    try {
      const blob: Blob = doc.output('blob');
      const file = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName, text: message });
      } else {
        await navigator.share({ title: fileName, text: message });
      }
      return 'shared';
    } catch (e: any) {
      if (e.name === 'AbortError') return 'cancelled';
    }
  }
  // Rekenaar-terugval: stoor PDF + maak WhatsApp Web oop met teks slegs (geen skakel nie)
  doc.save(fileName);
  setTimeout(() => window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank'), 500);
  return 'fallback';
}

export default function PosSystemAfrikaans() {
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [saleNotes, setSaleNotes] = useState("");
  const [paymentType, setPaymentType] = useState("kontant");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<PosProduct | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [showDeleteAllProductsConfirm, setShowDeleteAllProductsConfirm] = useState(false);
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<PosCustomer | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffAccount | null>(null);
  const [isStaffSwitchMode, setIsStaffSwitchMode] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedStaffForAuth, setSelectedStaffForAuth] = useState<StaffAccount | null>(null);
  const [isStaffPasswordDialogOpen, setIsStaffPasswordDialogOpen] = useState(false);
  const [mobileStaffPickerOpen, setMobileStaffPickerOpen] = useState(false);
  const [staffPassword, setStaffPassword] = useState("");
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [highlightStaffButton, setHighlightStaffButton] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<number | "all">("all");
  const [checkoutOption, setCheckoutOption] = useState<'complete' | 'open-account' | 'add-to-account'>('complete');
  const [isOpenAccountDialogOpen, setIsOpenAccountDialogOpen] = useState(false);
  const [selectedOpenAccount, setSelectedOpenAccount] = useState<PosOpenAccount | null>(null);
  const [selectedOpenAccountId, setSelectedOpenAccountId] = useState<number | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isReceiptCustomizerOpen, setIsReceiptCustomizerOpen] = useState(false);
  const [isInvoiceSetupOpen, setIsInvoiceSetupOpen] = useState(false);
  const [bizInfoName, setBizInfoName] = useState("");
  const [bizInfoPhone, setBizInfoPhone] = useState("");
  const [bizInfoEmail, setBizInfoEmail] = useState("");
  const [bizInfoAddress1, setBizInfoAddress1] = useState("");
  const [bizInfoAddress2, setBizInfoAddress2] = useState("");
  const [bizInfoWebsite, setBizInfoWebsite] = useState("");
  const [bizInfoVat, setBizInfoVat] = useState("");
  const [bizInfoReg, setBizInfoReg] = useState("");
  const [isSavingBizInfo, setIsSavingBizInfo] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number; email: string; paid: boolean; companyLogo?: string; companyName?: string; tutorialCompleted?: boolean; trialStartDate?: string; receiptSettings?: any; paymentPlan?: string; planSavingAmount?: number | null; preferredLanguage?: string} | null>(null);

  const refreshUserProfile = useCallback(async (userId: number, userEmail: string) => {
    try {
      const res = await fetch(`/api/pos/user/${userId}?userEmail=${encodeURIComponent(userEmail)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.user) {
        setCurrentUser(prev => prev ? { ...prev, ...data.user } : data.user);
        localStorage.setItem('posUser', JSON.stringify({ ...(JSON.parse(localStorage.getItem('posUser') || '{}')), ...data.user }));
      }
    } catch {}
  }, []);

  const [managementPasswordDialog, setManagementPasswordDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [managementPassword, setManagementPassword] = useState("");
  const [currentTab, setCurrentTab] = useState("verkope");
  const [customerSpendFrom, setCustomerSpendFrom] = useState("");
  const [customerSpendTo, setCustomerSpendTo] = useState("");
  const productListRef = useRef<HTMLDivElement>(null);
  const [productScrollThumb, setProductScrollThumb] = useState({ top: 0, height: 100 });
  const handleProductScroll = useCallback(() => {
    const el = productListRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    const thumbH = Math.max(16, (clientHeight / scrollHeight) * clientHeight);
    const thumbTop = maxScroll > 0 ? (scrollTop / maxScroll) * (clientHeight - thumbH) : 0;
    setProductScrollThumb({ top: thumbTop, height: thumbH });
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(handleProductScroll);
    return () => cancelAnimationFrame(frame);
  }, [handleProductScroll]);
  const [voidSaleDialog, setVoidSaleDialog] = useState<{ open: boolean; sale: Sale | null }>({ open: false, sale: null });
  const [voidReason, setVoidReason] = useState("");
  const [viewVoidDialog, setViewVoidDialog] = useState<{ open: boolean; sale: Sale | null }>({ open: false, sale: null });
  const [selectedItemsForPrint, setSelectedItemsForPrint] = useState<number[]>([]);
  const [tipOptionEnabled, setTipOptionEnabled] = useState(false);
  const [saleCompleteData, setSaleCompleteData] = useState<null | { sale: any; customer: any; tipEnabled: boolean; }>(null);
  const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);
  const [receiptPdfBlob, setReceiptPdfBlob] = useState<Blob | null>(null);
  const [receiptPdfBusy, setReceiptPdfBusy] = useState(false);
  const [invoicePdfBusy, setInvoicePdfBusy] = useState(false);
  const [openAccountTipEnabled, setOpenAccountTipEnabled] = useState(false);
  const [editingOpenAccount, setEditingOpenAccount] = useState<PosOpenAccount | null>(null);
  const [editOpenAccountName, setEditOpenAccountName] = useState("");
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);
  
  // Invoice-related state
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isInvoiceViewOpen, setIsInvoiceViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [isDeleteInvoiceDialogOpen, setIsDeleteInvoiceDialogOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'draft' | 'sent' | 'paid' | 'cancelled'>('draft');
  const [invoiceType, setInvoiceType] = useState<'invoice' | 'quote'>('invoice');
  const [invoiceItems, setInvoiceItems] = useState<Array<{productId?: number; customName?: string; quantity: number; price: number}>>([]);
  const [invoiceClientId, setInvoiceClientId] = useState<number | null>(null);
  const [showQuickAddProduct, setShowQuickAddProduct] = useState(false);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddPrice, setQuickAddPrice] = useState("");
  const [invoicePickerOpen, setInvoicePickerOpen] = useState(false);
  const [invoicePickerSearch, setInvoicePickerSearch] = useState("");
  const [invoiceCategoryFilter, setInvoiceCategoryFilter] = useState<number | null>(null);
  const [invoicePriceMode, setInvoicePriceMode] = useState<'retail' | 'trade'>('retail');
  const [invoiceCustomClient, setInvoiceCustomClient] = useState("");
  const [invoiceClientEmail, setInvoiceClientEmail] = useState("");
  const [invoiceClientPhone, setInvoiceClientPhone] = useState("");
  const [isCustomClient, setIsCustomClient] = useState(true);
  const [posTheme, setPosTheme] = useState<'dark' | 'light'>(() => {
    try { const s = localStorage.getItem('posTheme'); return s === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
  });
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoicePoNumber, setInvoicePoNumber] = useState("");
  const [invoiceDueTerms, setInvoiceDueTerms] = useState("7 dae");
  const [invoiceDiscountPercent, setInvoiceDiscountPercent] = useState("0");
  const [invoiceDiscountAmount, setInvoiceDiscountAmount] = useState("0");
  const [invoiceDiscountType, setInvoiceDiscountType] = useState<'percent' | 'amount'>('percent');
  const [invoiceShippingAmount, setInvoiceShippingAmount] = useState("0");
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState("");
  const [invoicePaymentDetails, setInvoicePaymentDetails] = useState("");
  const [invoiceTerms, setInvoiceTerms] = useState("");
  const [invoiceTaxEnabled, setInvoiceTaxEnabled] = useState(true);
  const [invoiceShowBusinessInfo, setInvoiceShowBusinessInfo] = useState(true);
  const [invoiceCustomFieldValues, setInvoiceCustomFieldValues] = useState<Record<string, any>>({});
  
  // Invoice search and filter state
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'cancelled'>('all');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<'all' | 'invoice' | 'quote'>('all');
  const [invoiceDateFrom, setInvoiceDateFrom] = useState("");
  const [invoiceDateTo, setInvoiceDateTo] = useState("");
  const [invoiceSortOrder, setInvoiceSortOrder] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'amount-desc' | 'amount-asc' | 'number-asc' | 'number-desc'>('date-desc');
  const [isEditDocNumberDialogOpen, setIsEditDocNumberDialogOpen] = useState(false);
  const [editingDocNumberInvoice, setEditingDocNumberInvoice] = useState<any | null>(null);
  const [newDocumentNumber, setNewDocumentNumber] = useState("");
  const [invoiceCardColumns, setInvoiceCardColumns] = useState<Set<string>>(() => {
    try {
      const u = JSON.parse(localStorage.getItem('posUser') || 'null');
      const saved = localStorage.getItem(`invoiceCardCols_${u?.id || 'guest'}`);
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(['dueDate','clientEmail','clientPhone','poNumber','dueTerms','paymentMethod','notes','discount']);
  });
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);
  const [expandedSales, setExpandedSales] = useState<Set<number>>(new Set());
  
  // Saved payment details state
  const [isSavePaymentDialogOpen, setIsSavePaymentDialogOpen] = useState(false);
  const [savePaymentName, setSavePaymentName] = useState("");
  
  // Excel import/export state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<'products' | 'customers'>('products');
  const [importData, setImportData] = useState<any[]>([]);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  
  // XERO integration state
  const [xeroClientId, setXeroClientId] = useState('');
  const [xeroClientSecret, setXeroClientSecret] = useState('');
  const [isConnectingXero, setIsConnectingXero] = useState(false);
  const [isSyncingXero, setIsSyncingXero] = useState(false);
  
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3b82f6");
  const [productCategoryFilter, setProductCategoryFilter] = useState<number | 'all'>('all');
  const [salesDisplayMode, setSalesDisplayMode] = useState<'grid' | 'tabs'>('grid');
  const [selectedSalesCategory, setSelectedSalesCategory] = useState<number | null>(null);
  const [salesCategoryFilter, setSalesCategoryFilter] = useState<number | 'all'>('all');
  const [productSortOrder, setProductSortOrder] = useState<'name-asc' | 'name-desc' | 'sku-asc' | 'sku-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc'>('name-asc');
  const [inventorySortOrder, setInventorySortOrder] = useState<'name-asc' | 'name-desc' | 'sku-asc' | 'sku-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc'>('name-asc');

  // Aankoopbestellings staat
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [isPOViewOpen, setIsPOViewOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [editingPO, setEditingPO] = useState<any>(null);
  const [poSupplierName, setPOSupplierName] = useState("");
  const [poSupplierEmail, setPOSupplierEmail] = useState("");
  const [poSupplierPhone, setPOSupplierPhone] = useState("");
  const [poSupplierAddress, setPOSupplierAddress] = useState("");
  const [poItems, setPOItems] = useState<any[]>([]);
  const [poExpectedDate, setPOExpectedDate] = useState("");
  const [poNotes, setPONotes] = useState("");
  const [poTaxPercent, setPOTaxPercent] = useState(15);
  const [poShippingAmount, setPOShippingAmount] = useState(0);
  const [poSearchTerm, setPOSearchTerm] = useState("");
  const [poStatusFilter, setPOStatusFilter] = useState("all");
  const [isDeletePODialogOpen, setIsDeletePODialogOpen] = useState(false);
  const [deletingPOId, setDeletingPOId] = useState<number | null>(null);

  // Add products to category dialog
  const [isAddProductsToCategoryOpen, setIsAddProductsToCategoryOpen] = useState(false);
  const [selectedProductsForCategory, setSelectedProductsForCategory] = useState<number[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Status translation helper function
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'draft': 'Konsep',
      'sent': 'Gestuur',
      'paid': 'Betaal',
      'cancelled': 'Gekanselleer'
    };
    return statusMap[status] || status;
  };

  // Form schemas - Afrikaans validation messages
  const productFormSchema = insertPosProductSchema.omit({ userId: true }).extend({
    costPrice: z.string().min(1, "Kosprys is vereis"),
    retailPrice: z.string().min(1, "Kleinhandelprys is vereis"),
    tradePrice: z.string().optional(),
    quantity: z.coerce.number().min(0, "Hoeveelheid moet 0 of meer wees"),
  });

  const customerFormSchema = insertPosCustomerSchema.omit({ userId: true });

  const openAccountFormSchema = insertPosOpenAccountSchema.omit({ userId: true }).extend({
    accountName: z.string().min(1, "Rekeningnaam is vereis"),
    accountType: z.enum(["table", "customer"]),
  });

  // Forms
  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: "",
      name: "",
      costPrice: "",
      retailPrice: "",
      tradePrice: "",
      quantity: 0,
    },
  });

  const customerForm = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      customerType: "retail",
      notes: "",
    },
  });

  const openAccountForm = useForm<z.infer<typeof openAccountFormSchema>>({
    resolver: zodResolver(openAccountFormSchema),
    defaultValues: {
      accountName: "",
      accountType: "table",
      items: [],
      total: "0.00",
      notes: "",
    },
  });

  // Handle tab change with role-based access control
  const handleTabChange = (tabValue: string) => {
    if (currentStaff && currentStaff.userType === 'management') {
      setCurrentTab(tabValue);
      return;
    }

    const restrictedTabs = ['produkte', 'verslae', 'gebruik'];
    if (restrictedTabs.includes(tabValue) && (!currentStaff || currentStaff.userType !== 'management')) {
      setPendingTab(tabValue);
      setManagementPasswordDialog(true);
      return;
    }

    setCurrentTab(tabValue);
  };

  // Get current user from localStorage or session
  useEffect(() => {
    const loginTimestamp = localStorage.getItem('posLoginTimestamp');
    if (loginTimestamp) {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(loginTimestamp) > thirtyDaysMs) {
        localStorage.removeItem('posUser');
        localStorage.removeItem('posLoginTimestamp');
        window.location.href = '/pos/login';
        return;
      }
    }

    const userData = localStorage.getItem('posUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        // Refresh profile on boot so planSavingAmount is always current
        if (parsedUser.id && parsedUser.email) {
          fetch(`/api/pos/user/${parsedUser.id}?userEmail=${encodeURIComponent(parsedUser.email)}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data?.user) {
                setCurrentUser((prev: typeof parsedUser | null) => prev ? { ...prev, ...data.user } : data.user);
                localStorage.setItem('posUser', JSON.stringify({ ...parsedUser, ...data.user }));
              }
            })
            .catch(() => {});
        }
        console.log('Huidige gebruiker gelaai:', parsedUser);
      } catch (error) {
        console.error('Fout met ontleding van gebruikerdata:', error);
        setCurrentUser({
          id: 1,
          email: 'demo@storm.co.za',
          paid: true,
          companyLogo: undefined,
          companyName: 'Demo Rekening',
          tutorialCompleted: false
        });
      }
    } else {
      // If no user data in localStorage, set demo user as fallback
      setCurrentUser({
        id: 1,
        email: 'demo@storm.co.za',
        paid: true,
        companyLogo: undefined,
        companyName: 'Demo Rekening',
        tutorialCompleted: false
      });
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.receiptSettings) return;
    try {
      const s = typeof currentUser.receiptSettings === 'string'
        ? JSON.parse(currentUser.receiptSettings)
        : currentUser.receiptSettings;
      const bi = s?.businessInfo || {};
      setBizInfoName(bi.name || currentUser.companyName || '');
      setBizInfoPhone(bi.phone || '');
      setBizInfoEmail(bi.email || '');
      setBizInfoAddress1(bi.addressLine1 || '');
      setBizInfoAddress2(bi.addressLine2 || '');
      setBizInfoWebsite(bi.website || '');
      setBizInfoVat(bi.vatNumber || '');
      setBizInfoReg(bi.registrationNumber || '');
    } catch {}
  }, [currentUser?.receiptSettings]);

  // Check if user has paid subscription
  useEffect(() => {
    if (currentUser && !currentUser.paid) {
      window.location.href = '/pos/inactive';
    }
  }, [currentUser]);

  // Mobile back button handling
  useEffect(() => {
    // Push initial state to history
    window.history.pushState({ pos: true, tab: 'verkope' }, '');
    
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default navigation
      event.preventDefault();
      
      // Check all dialog states and close the first open one
      const dialogStates = [
        { isOpen: isInvoiceViewOpen, close: () => setIsInvoiceViewOpen(false) },
        { isOpen: isInvoiceDialogOpen, close: () => setIsInvoiceDialogOpen(false) },
        { isOpen: isDeleteInvoiceDialogOpen, close: () => setIsDeleteInvoiceDialogOpen(false) },
        { isOpen: isStatusChangeDialogOpen, close: () => setIsStatusChangeDialogOpen(false) },
        { isOpen: isEditDocNumberDialogOpen, close: () => setIsEditDocNumberDialogOpen(false) },
        { isOpen: isProductDialogOpen, close: () => setIsProductDialogOpen(false) },
        { isOpen: isCustomerDialogOpen, close: () => setIsCustomerDialogOpen(false) },
        { isOpen: isStaffDialogOpen, close: () => setIsStaffDialogOpen(false) },
        { isOpen: isStaffPasswordDialogOpen, close: () => setIsStaffPasswordDialogOpen(false) },
        { isOpen: isUserManagementOpen, close: () => setIsUserManagementOpen(false) },
        { isOpen: isOpenAccountDialogOpen, close: () => setIsOpenAccountDialogOpen(false) },
        { isOpen: isBankDetailsOpen, close: () => setIsBankDetailsOpen(false) },
        { isOpen: isLogoDialogOpen, close: () => setIsLogoDialogOpen(false) },
        { isOpen: isReceiptCustomizerOpen, close: () => setIsReceiptCustomizerOpen(false) },
        { isOpen: isInvoiceSetupOpen, close: () => setIsInvoiceSetupOpen(false) },
        { isOpen: managementPasswordDialog, close: () => setManagementPasswordDialog(false) },
        { isOpen: voidSaleDialog.open, close: () => setVoidSaleDialog({ open: false, sale: null }) },
        { isOpen: viewVoidDialog.open, close: () => setViewVoidDialog({ open: false, sale: null }) },
        { isOpen: isLogoutDialogOpen, close: () => setIsLogoutDialogOpen(false) },
      ];
      
      // Find and close the first open dialog
      const openDialog = dialogStates.find(d => d.isOpen);
      if (openDialog) {
        openDialog.close();
        // Push state back to maintain history
        window.history.pushState({ pos: true, tab: currentTab }, '');
        return;
      }
      
      // No dialogs open - handle tab navigation
      if (currentTab !== 'verkope') {
        // Navigate to verkope (sales) tab
        setCurrentTab('verkope');
        window.history.pushState({ pos: true, tab: 'verkope' }, '');
      } else {
        // On verkope tab - show logout confirmation
        setIsLogoutDialogOpen(true);
        window.history.pushState({ pos: true, tab: 'verkope' }, '');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    currentTab, isInvoiceViewOpen, isInvoiceDialogOpen, isDeleteInvoiceDialogOpen,
    isStatusChangeDialogOpen, isEditDocNumberDialogOpen, isProductDialogOpen, 
    isCustomerDialogOpen, isStaffDialogOpen, isStaffPasswordDialogOpen,
    isUserManagementOpen, isOpenAccountDialogOpen, isBankDetailsOpen, 
    isLogoDialogOpen, isReceiptCustomizerOpen, managementPasswordDialog,
    voidSaleDialog.open, viewVoidDialog.open, isLogoutDialogOpen
  ]);

  // Data fetching queries
  const { data: products = [] } = useQuery<(Product & { categoryId?: number })[]>({
    queryKey: ["/api/pos/products", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/products?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie produkte laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });
  
  // Fetch categories
  useQuery<Category[]>({
    queryKey: ["/api/pos/categories", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/categories?userId=${currentUser.id}`);
      if (!response.ok) return [];
      const data = await response.json();
      setCategories(data);
      return data;
    },
    enabled: !!currentUser,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/pos/customers", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/customers?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie kliente laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/pos/sales", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/sales?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie verkope laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });

  const { data: openAccounts = [] } = useQuery<PosOpenAccount[]>({
    queryKey: ["/api/pos/open-accounts", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/open-accounts?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie oop rekeninge laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });

  const { data: staffAccounts = [] } = useQuery<StaffAccount[]>({
    queryKey: ["/api/pos/staff-accounts", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/staff-accounts?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie personeel laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Laai gestoorde personeelkeuse vanaf gebruikersprofiel by begin
  useEffect(() => {
    if (staffAccounts.length > 0 && currentUser?.selectedStaffAccountId && !currentStaff && !isStaffSwitchMode) {
      const savedStaff = staffAccounts.find(s => s.id === currentUser.selectedStaffAccountId);
      if (savedStaff) {
        setCurrentStaff(savedStaff);
      }
    }
  }, [staffAccounts, currentUser?.selectedStaffAccountId, currentStaff, isStaffSwitchMode]);

  // Pas donker/ligte tema klas toe op dokument
  useEffect(() => {
    const root = document.documentElement;
    if (posTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return () => { root.classList.remove('dark'); };
  }, [posTheme]);

  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/pos/invoices", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/invoices?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie fakturen laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Haal aankoopbestellings
  const { data: purchaseOrders = [], isLoading: isPOLoading } = useQuery<any[]>({
    queryKey: ["/api/pos/purchase-orders", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/purchase-orders?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie aankoopbestellings laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/pos/suppliers", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/suppliers?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie verskaffers laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });

  const { data: savedPaymentDetails = [] } = useQuery<any[]>({
    queryKey: ["/api/pos/saved-payment-details", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/saved-payment-details?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie betalingsbesonderhede laai nie');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Filter invoices based on search and filter criteria
  const filteredInvoices = useMemo(() => {
    const filtered = invoices.filter((invoice) => {
      // Search filter (document number or client name)
      if (invoiceSearchQuery) {
        const query = invoiceSearchQuery.toLowerCase();
        const documentNumber = invoice.documentNumber?.toLowerCase() || '';
        const clientName = (customers.find(c => c.id === invoice.clientId)?.name || invoice.clientName || '').toLowerCase();
        if (!documentNumber.includes(query) && !clientName.includes(query)) {
          return false;
        }
      }
      
      // Status filter (simplified: all, paid, not_paid)
      if (invoiceStatusFilter === 'paid' && invoice.status !== 'paid') {
        return false;
      }
      if (invoiceStatusFilter === 'not_paid' && invoice.status === 'paid') {
        return false;
      }
      
      // Document type filter
      if (invoiceTypeFilter !== 'all' && invoice.documentType !== invoiceTypeFilter) {
        return false;
      }
      
      // Date from filter
      if (invoiceDateFrom) {
        const invoiceDate = new Date(invoice.createdDate);
        const fromDate = new Date(invoiceDateFrom);
        if (invoiceDate < fromDate) {
          return false;
        }
      }
      
      // Date to filter
      if (invoiceDateTo) {
        const invoiceDate = new Date(invoice.createdDate);
        const toDate = new Date(invoiceDateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (invoiceDate > toDate) {
          return false;
        }
      }
      
      return true;
    });

    filtered.sort((a, b) => {
      switch (invoiceSortOrder) {
        case 'date-desc': return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case 'date-asc': return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        case 'name-asc': {
          const nameA = (customers.find(c => c.id === a.clientId)?.name || a.clientName || '').toLowerCase();
          const nameB = (customers.find(c => c.id === b.clientId)?.name || b.clientName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        }
        case 'name-desc': {
          const nameA = (customers.find(c => c.id === a.clientId)?.name || a.clientName || '').toLowerCase();
          const nameB = (customers.find(c => c.id === b.clientId)?.name || b.clientName || '').toLowerCase();
          return nameB.localeCompare(nameA);
        }
        case 'amount-desc': return (typeof b.total === 'number' ? b.total : parseFloat(b.total)) - (typeof a.total === 'number' ? a.total : parseFloat(a.total));
        case 'amount-asc': return (typeof a.total === 'number' ? a.total : parseFloat(a.total)) - (typeof b.total === 'number' ? b.total : parseFloat(b.total));
        case 'number-asc': return (a.documentNumber || '').localeCompare(b.documentNumber || '', undefined, { numeric: true });
        case 'number-desc': return (b.documentNumber || '').localeCompare(a.documentNumber || '', undefined, { numeric: true });
        default: return 0;
      }
    });

    return filtered;
  }, [invoices, invoiceSearchQuery, invoiceStatusFilter, invoiceTypeFilter, invoiceDateFrom, invoiceDateTo, customers, invoiceSortOrder]);

  // PDF Export Funksie - Professionele Faktuur/Kwotasie met Besigheidsbesonderhede
  const generateInvoicePDF = async (invoice: any) => {
  setInvoicePdfBusy(true);
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const blueColor: [number, number, number] = [43, 108, 176]; // hsl(217,90%,40%) converted to RGB
    const margin = 20;
    
    // Hulpfunksie om datums veilig te formateer
    const formatDate = (date: any) => {
      if (!date) return 'N/B';
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime()) ? 'N/B' : dateObj.toLocaleDateString('af-ZA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    // Kry besigheidsbesonderhede uit kwitansie-instellings en gebruikersprofiel
    const settings = mergeReceiptSettingsAfrikaans(currentUser?.receiptSettings);
    const companyName = settings.businessInfo?.name || currentUser?.companyName || 'My Besigheid';
    const companyLogo = settings.logoDataUrl || currentUser?.companyLogo;
    const businessAddress1 = settings.businessInfo?.addressLine1 || '';
    const businessAddress2 = settings.businessInfo?.addressLine2 || '';
    const businessPhone = settings.businessInfo?.phone || '';
    const businessEmail = settings.businessInfo?.email || '';
    const businessWebsite = settings.businessInfo?.website || '';
    const vatNumber = settings.businessInfo?.vatNumber || '';
    const regNumber = settings.businessInfo?.registrationNumber || '';
    
    let y = 15;
    
    // ===== KOPTEKST AFDELING =====
    // Voeg maatskappy logo by indien beskikbaar (linker kant)
    if (companyLogo) {
      try {
        doc.addImage(companyLogo, 'JPEG', margin, y, 35, 35);
      } catch (error) {
        console.error('Fout met byvoeging van logo na PDF:', error);
      }
    }
    
    // Dokumentopskrif (links)
    y = companyLogo ? 55 : 25;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(invoice.documentType === 'invoice' ? 'FAKTUUR' : 'KWOTASIE', margin, y);
    y += 8;

    // Dokument nommer (links, onder opskrif)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`#${invoice.documentNumber || 'N/B'}`, margin, y);
    y += 7;

    // Besigheidsbesonderhede - links, onder faktuurnommer
    if (companyName) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text(companyName, margin, y);
      y += 5;
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    if (businessAddress1) { doc.text(businessAddress1, margin, y); y += 4; }
    if (businessAddress2) { doc.text(businessAddress2, margin, y); y += 4; }
    if (businessPhone) { doc.text(`Tel: ${businessPhone}`, margin, y); y += 4; }
    if (businessEmail) { doc.text(businessEmail, margin, y); y += 4; }
    if (businessWebsite) { doc.text(businessWebsite, margin, y); y += 4; }
    if (vatNumber) { doc.text(`BTW: ${vatNumber}`, margin, y); y += 4; }
    if (regNumber) { doc.text(`Reg: ${regNumber}`, margin, y); y += 4; }

    // Blou skeidslyn
    y += 4;
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);

    y += 15;

    // ===== DOKUMENT BESONDERHEDE AFDELING =====
    const leftColX = margin;
    const rightColX = pageWidth / 2 + 10;

    // Linker kolom - Faktuur Aan
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('FAKTUUR AAN', leftColX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const client = customers.find(c => c.id === invoice.clientId);
    const clientName = client?.name || invoice.clientName || 'N/B';
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(clientName, leftColX, y + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let clientY = y + 15;
    const clientPhone = invoice.clientPhone || client?.phone;
    const clientEmail = invoice.clientEmail || client?.email;
    const cfValues: Record<string, any> = (invoice.customFieldValues as any) || {};
    const visOf = (key: string, defaultVal = true) =>
      cfValues[`vis_${key}`] !== undefined ? cfValues[`vis_${key}`] : defaultVal;

    if (clientPhone && visOf('clientPhone')) {
      doc.text(`Tel: ${clientPhone}`, leftColX, clientY);
      clientY += 5;
    }
    if (clientEmail && visOf('clientEmail')) {
      doc.text(`E-pos: ${clientEmail}`, leftColX, clientY);
      clientY += 5;
    }
    if (client?.notes) {
      doc.text(client.notes, leftColX, clientY);
    }
    
    // Regter kolom - Faktuur Besonderhede
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('BESONDERHEDE', rightColX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const detailsData = [
      { label: 'Datum:', value: formatDate(invoice.createdDate) },
      ...(invoice.dueDate && visOf('dueDate') ? [{ label: 'Vervaldatum:', value: formatDate(invoice.dueDate) }] : []),
      ...(invoice.dueTerms && visOf('dueTerms') ? [{ label: 'Terme:', value: invoice.dueTerms }] : []),
      ...(invoice.poNumber && visOf('poNumber') ? [{ label: 'BO #:', value: invoice.poNumber }] : []),
      ...((settings as any).invoiceSettings?.customFields || [])
        .filter((cf: any) => cfValues[`cf_${cf.id}`] && visOf(cf.id))
        .map((cf: any) => ({ label: `${cf.label}:`, value: String(cfValues[`cf_${cf.id}`]) }))
    ];
    
    let detailY = y + 8;
    detailsData.forEach(detail => {
      doc.setFont('helvetica', 'normal');
      doc.text(detail.label, rightColX, detailY);
      doc.setFont('helvetica', 'bold');
      doc.text(detail.value, rightColX + 35, detailY);
      detailY += 6;
    });
    
    y = Math.max(clientY, detailY) + 15;
    
    // ===== LYNITEMS TABEL =====
    // Tabel koptekst
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BESKRYWING', margin + 5, y + 7);
    doc.text('AANTAL', pageWidth - 95, y + 7, { align: 'center' });
    doc.text('EENHEIDSPRYS', pageWidth - 60, y + 7, { align: 'right' });
    doc.text('BEDRAG', pageWidth - margin - 5, y + 7, { align: 'right' });
    
    y += 12;
    
    // Tabel rye
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const needsSecondPage = items.length >= 10;
    
    items.forEach((item: any, index: number) => {
      // Only add page break for 10+ items when running out of space
      if (needsSecondPage && y > pageHeight - 80) {
        doc.addPage();
        y = 20;
      }
      
      // Afwisselende ry agtergrond
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, y - 4, pageWidth - (margin * 2), 8, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(item.name || 'Item', margin + 5, y);
      doc.text(item.quantity?.toString() || '1', pageWidth - 95, y, { align: 'center' });
      doc.text(`R ${parseFloat(item.price || 0).toFixed(2)}`, pageWidth - 60, y, { align: 'right' });
      doc.text(`R ${parseFloat(item.lineTotal || 0).toFixed(2)}`, pageWidth - margin - 5, y, { align: 'right' });
      y += 8;
    });
    
    // Onderste lyn van tabel
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 15;
    
    // ===== FINANSIELE OPSOMMING =====
    const summaryX = pageWidth - 100;
    const valueX = pageWidth - margin - 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    // Subtotaal
    doc.text('Subtotaal:', summaryX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`R ${parseFloat(invoice.subtotal || 0).toFixed(2)}`, valueX, y, { align: 'right' });
    y += 7;
    
    // Afslag
    if (parseFloat(invoice.discountPercent || '0') > 0 || parseFloat(invoice.discountAmount || '0') > 0) {
      doc.setTextColor(220, 53, 69);
      const hasPercent = parseFloat(invoice.discountPercent || '0') > 0;
      doc.text(`Afslag${hasPercent ? ` (${invoice.discountPercent}%)` : ''}:`, summaryX, y);
      doc.text(`-R ${parseFloat(invoice.discountAmount || 0).toFixed(2)}`, valueX, y, { align: 'right' });
      doc.setTextColor(80, 80, 80);
      y += 7;
    }
    
    // BTW (slegs wys as belasting toegepas word)
    if (parseFloat(invoice.taxPercent || '0') > 0) {
      doc.setTextColor(80, 80, 80);
      doc.text('BTW (15%):', summaryX, y);
      doc.setTextColor(0, 0, 0);
      doc.text(`R ${parseFloat(invoice.tax || 0).toFixed(2)}`, valueX, y, { align: 'right' });
      y += 7;
    }
    
    // Versending
    if (parseFloat(invoice.shippingAmount || '0') > 0) {
      doc.setTextColor(80, 80, 80);
      doc.text('Versending:', summaryX, y);
      doc.setTextColor(0, 0, 0);
      doc.text(`R ${parseFloat(invoice.shippingAmount || 0).toFixed(2)}`, valueX, y, { align: 'right' });
      y += 7;
    }
    
    // Totaal boks
    y += 3;
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(summaryX - 5, y - 5, pageWidth - summaryX - margin + 10, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAAL VERSKULDIG:', summaryX, y + 4);
    doc.text(`R ${parseFloat(invoice.total || 0).toFixed(2)}`, valueX, y + 4, { align: 'right' });
    
    y += 25;
    
    // ===== BETAALMETODE =====
    if (invoice.paymentMethod && visOf('paymentMethod')) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Betaalmetode:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.paymentMethod, margin + 40, y);
      y += 12;
    }
    
    // ===== BETALINGSBESONDERHEDE =====
    if (invoice.paymentDetails && visOf('paymentDetails')) {
      if (y > pageHeight - 60) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('BETALINGSBESONDERHEDE', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const paymentDetailsLines = doc.splitTextToSize(invoice.paymentDetails, pageWidth - (margin * 2));
      doc.text(paymentDetailsLines, margin, y + 6);
      y += (paymentDetailsLines.length * 4) + 15;
    }
    
    // ===== NOTAS AFDELING =====
    if (invoice.notes && visOf('notes')) {
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('NOTAS', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
      doc.text(notesLines, margin, y + 6);
      y += (notesLines.length * 4) + 15;
    }
    
    // ===== TERME & VOORWAARDES =====
    if (invoice.terms && visOf('terms')) {
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('TERME & VOORWAARDES', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const termsLines = doc.splitTextToSize(invoice.terms, pageWidth - (margin * 2));
      doc.text(termsLines, margin, y + 6);
    }
    
    // ===== VOETTEKST =====
    const footerY = pageHeight - 20;
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    doc.setFontSize(9);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Dankie vir u besigheid!', pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`${companyName} | Gegenereer op ${new Date().toLocaleDateString('af-ZA')}`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    // Aangedryf deur STORM Sagteware footer with clickable link
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const stormText = 'Aangedryf deur STORM Sagteware';
    const stormTextWidth = doc.getTextWidth(stormText);
    const stormTextX = (pageWidth - stormTextWidth) / 2;
    doc.textWithLink(stormText, stormTextX, footerY + 10, { url: 'https://stormsoftware.co.za/' });
    
    const fileName = `${invoice.documentType === 'invoice' ? 'faktuur' : 'kwotasie'}_${invoice.documentNumber}.pdf`;
    await downloadOpenPDF(doc, fileName);

    toast({
      title: "PDF Gegenereer",
      description: `${invoice.documentNumber} is afgelaai`,
    });
  } catch (err: any) {
    console.error('PDF fout:', err);
    toast({
      title: "PDF Fout",
      description: "Kon nie PDF genereer nie. Probeer asseblief weer.",
      variant: "destructive"
    });
  } finally {
    setInvoicePdfBusy(false);
  }
  };

  // Deel Faktuur via deel-skerm
  const shareInvoice = async (invoice: any) => {
    setInvoicePdfBusy(true);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const blueColor: [number, number, number] = [43, 108, 176];
    const margin = 20;
    
    const formatDate = (date: any) => {
      if (!date) return 'N/B';
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime()) ? 'N/B' : dateObj.toLocaleDateString('af-ZA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    const settings = mergeReceiptSettingsAfrikaans(currentUser?.receiptSettings);
    const companyName = settings.businessInfo?.name || currentUser?.companyName || 'My Besigheid';
    const companyLogo = settings.logoDataUrl || currentUser?.companyLogo;
    const businessAddress1 = settings.businessInfo?.addressLine1 || '';
    const businessAddress2 = settings.businessInfo?.addressLine2 || '';
    const businessPhone = settings.businessInfo?.phone || '';
    const businessEmail = settings.businessInfo?.email || '';
    const businessWebsite = settings.businessInfo?.website || '';
    const vatNumber = settings.businessInfo?.vatNumber || '';
    const regNumber = settings.businessInfo?.registrationNumber || '';
    
    let y = 15;
    
    if (companyLogo) {
      try {
        doc.addImage(companyLogo, 'JPEG', margin, y, 35, 35);
      } catch (error) {
        console.error('Fout met logo in PDF:', error);
      }
    }
    
    // Dokumentopskrif (links)
    y = companyLogo ? 55 : 25;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(invoice.documentType === 'invoice' ? 'FAKTUUR' : 'KWOTASIE', margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`#${invoice.documentNumber || 'N/B'}`, margin, y);
    y += 7;

    // Besigheidsbesonderhede - links, onder faktuurnommer
    if (companyName) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text(companyName, margin, y);
      y += 5;
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    if (businessAddress1) { doc.text(businessAddress1, margin, y); y += 4; }
    if (businessAddress2) { doc.text(businessAddress2, margin, y); y += 4; }
    if (businessPhone) { doc.text(`Tel: ${businessPhone}`, margin, y); y += 4; }
    if (businessEmail) { doc.text(businessEmail, margin, y); y += 4; }
    if (businessWebsite) { doc.text(businessWebsite, margin, y); y += 4; }
    if (vatNumber) { doc.text(`BTW: ${vatNumber}`, margin, y); y += 4; }
    if (regNumber) { doc.text(`Reg: ${regNumber}`, margin, y); y += 4; }

    y += 4;
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);

    y += 15;

    const leftColX = margin;
    const rightColX = pageWidth / 2 + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('FAKTUUR AAN', leftColX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const client = customers.find(c => c.id === invoice.clientId);
    const clientName = client?.name || invoice.clientName || 'N/B';
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(clientName, leftColX, y + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let clientY = y + 15;
    const clientPhone2 = invoice.clientPhone || client?.phone;
    const clientEmail2 = invoice.clientEmail || client?.email;
    const cfValues2: Record<string, any> = (invoice.customFieldValues as any) || {};
    const visOf2 = (key: string, defaultVal = true) =>
      cfValues2[`vis_${key}`] !== undefined ? cfValues2[`vis_${key}`] : defaultVal;
    if (clientPhone2 && visOf2('clientPhone')) { doc.text(`Tel: ${clientPhone2}`, leftColX, clientY); clientY += 5; }
    if (clientEmail2 && visOf2('clientEmail')) { doc.text(`E-pos: ${clientEmail2}`, leftColX, clientY); clientY += 5; }
    if (client?.notes) { doc.text(client.notes, leftColX, clientY); }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('BESONDERHEDE', rightColX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    let detailY = y + 8;
    doc.text(`Datum: ${formatDate(invoice.createdAt)}`, rightColX, detailY);
    detailY += 6;
    if (invoice.dueDate && visOf2('dueDate')) { doc.text(`Verskuldig: ${formatDate(invoice.dueDate)}`, rightColX, detailY); detailY += 6; }
    if (invoice.dueTerms && visOf2('dueTerms')) { doc.text(`Terme: ${invoice.dueTerms}`, rightColX, detailY); detailY += 6; }
    if (invoice.poNumber && visOf2('poNumber')) { doc.text(`PO: ${invoice.poNumber}`, rightColX, detailY); detailY += 6; }
    ((settings as any).invoiceSettings?.customFields || [])
      .filter((cf: any) => cfValues2[`cf_${cf.id}`] && visOf2(cf.id))
      .forEach((cf: any) => { doc.text(`${cf.label}: ${String(cfValues2[`cf_${cf.id}`])}`, rightColX, detailY); detailY += 6; });

    y = Math.max(clientY, detailY) + 15;
    
    const tableHeaderY = y;
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(margin, tableHeaderY - 5, pageWidth - (margin * 2), 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Item', margin + 3, tableHeaderY);
    doc.text('Hoe', pageWidth - margin - 60, tableHeaderY, { align: 'right' });
    doc.text('Prys', pageWidth - margin - 30, tableHeaderY, { align: 'right' });
    doc.text('Totaal', pageWidth - margin - 3, tableHeaderY, { align: 'right' });
    
    y = tableHeaderY + 8;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    items.forEach((item: any, index: number) => {
      const productName = item.name || item.customName || (item.productId ? products.find(p => p.id === item.productId)?.name : null) || 'Item';
      const lineTotal = (parseFloat(item.price) * parseFloat(item.quantity));
      
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 4, pageWidth - (margin * 2), 7, 'F');
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(productName.substring(0, 40), margin + 3, y);
      doc.text(item.quantity.toString(), pageWidth - margin - 60, y, { align: 'right' });
      doc.text(`R${parseFloat(item.price).toFixed(2)}`, pageWidth - margin - 30, y, { align: 'right' });
      doc.text(`R${lineTotal.toFixed(2)}`, pageWidth - margin - 3, y, { align: 'right' });
      
      y += 7;
    });
    
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 + 10, y - 5, pageWidth - margin, y - 5);
    
    const totalsX = pageWidth - margin - 3;
    const labelX = pageWidth / 2 + 20;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text('Subtotaal:', labelX, y);
    doc.text(`R${typeof invoice.subtotal === 'number' ? invoice.subtotal.toFixed(2) : invoice.subtotal}`, totalsX, y, { align: 'right' });
    y += 7;
    
    if (parseFloat(invoice.discountAmount || '0') > 0) {
      doc.setTextColor(200, 80, 80);
      const discountLabel = parseFloat(invoice.discountPercent || '0') > 0 
        ? `Afslag (${invoice.discountPercent}%):` 
        : 'Afslag:';
      doc.text(discountLabel, labelX, y);
      doc.text(`-R${parseFloat(invoice.discountAmount).toFixed(2)}`, totalsX, y, { align: 'right' });
      y += 7;
    }
    
    if (parseFloat(invoice.taxPercent || '0') > 0) {
      doc.setTextColor(80, 80, 80);
      doc.text('BTW (15%):', labelX, y);
      doc.text(`R${typeof invoice.tax === 'number' ? invoice.tax.toFixed(2) : invoice.tax}`, totalsX, y, { align: 'right' });
      y += 7;
    }
    
    if (parseFloat(invoice.shippingAmount || '0') > 0) {
      doc.text('Versending:', labelX, y);
      doc.text(`R${parseFloat(invoice.shippingAmount).toFixed(2)}`, totalsX, y, { align: 'right' });
      y += 7;
    }
    
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 + 10, y, pageWidth - margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('TOTAAL:', labelX, y);
    doc.text(`R${typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}`, totalsX, y, { align: 'right' });
    
    y += 20;
    
    if (invoice.paymentMethod && visOf2('paymentMethod')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('BETAALMETODE', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text(invoice.paymentMethod, margin, y + 6);
      y += 15;
    }
    
    if (invoice.notes && visOf2('notes')) {
      if (y > pageHeight - 60) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('NOTAS', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
      doc.text(notesLines, margin, y + 6);
      y += 6 + (notesLines.length * 5);
    }
    
    if (invoice.terms && visOf2('terms')) {
      if (y > pageHeight - 60) { doc.addPage(); y = 20; }
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('TERME & VOORWAARDES', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const termsLines = doc.splitTextToSize(invoice.terms, pageWidth - (margin * 2));
      doc.text(termsLines, margin, y + 6);
    }
    
    const footerY = pageHeight - 20;
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    doc.setFontSize(9);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Dankie vir u besigheid!', pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`${companyName} | Gegenereer op ${new Date().toLocaleDateString('af-ZA')}`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const stormText = 'Aangedryf deur STORM Sagteware';
    const stormTextWidth = doc.getTextWidth(stormText);
    const stormTextX = (pageWidth - stormTextWidth) / 2;
    doc.textWithLink(stormText, stormTextX, footerY + 10, { url: 'https://stormsoftware.co.za/' });
    
    const docType = invoice.documentType === 'invoice' ? 'Faktuur' : 'Kwotasie';
    const fileName = `${invoice.documentType === 'invoice' ? 'faktuur' : 'kwotasie'}_${invoice.documentNumber}.pdf`;
    const message = `${docType} ${invoice.documentNumber} van ${companyName}. Totaal: R${typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}`;
    const result = await sharePDFViaSheet(doc, fileName, message);
    setInvoicePdfBusy(false);
    if (result === 'shared') {
      toast({ title: "Suksesvol Gedeel", description: `${invoice.documentNumber} is gedeel` });
    } else if (result === 'fallback') {
      toast({ title: "PDF Gestoor", description: `${invoice.documentNumber} is gestoor` });
    }
  };

  // Logout function
  const logout = async () => {
    localStorage.removeItem('posUser');
    localStorage.removeItem('posLoginTimestamp');
    try {
      await fetch('/api/pos/logout', { method: 'POST' });
    } catch {
    }
    window.location.href = '/pos/login';
  };

  const closeManagementDialog = () => {
    setManagementPasswordDialog(false);
    setPendingTab(null);
    setHighlightStaffButton(true);
    setTimeout(() => setHighlightStaffButton(false), 5000);
  };

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const response = await apiRequest("POST", "/api/pos/categories", {
        ...data,
        userId: currentUser?.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/categories", currentUser?.id] });
      toast({ title: "Kategorie geskep", description: "Kategorie is suksesvol geskep." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon nie kategorie skep nie", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; color?: string } }) => {
      const response = await apiRequest("PUT", `/api/pos/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/categories", currentUser?.id] });
      toast({ title: "Kategorie bygewerk", description: "Kategorie is suksesvol bygewerk." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon nie kategorie bywerk nie", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/pos/categories/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/categories", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      toast({ title: "Kategorie verwyder", description: "Kategorie is suksesvol verwyder." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon nie kategorie verwyder nie", variant: "destructive" });
    },
  });

  // Bulk update products to category
  const bulkAddProductsToCategoryMutation = useMutation({
    mutationFn: async ({ productIds, categoryId }: { productIds: number[]; categoryId: number }) => {
      const response = await apiRequest("POST", "/api/pos/products/bulk-category", {
        userId: currentUser?.id,
        productIds,
        categoryId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      setIsAddProductsToCategoryOpen(false);
      setSelectedProductsForCategory([]);
      toast({ title: "Produkte bygevoeg", description: "Produkte is by die kategorie gevoeg." });
    },
    onError: (error: Error) => {
      toast({ title: "Fout", description: error.message || "Kon nie produkte by kategorie voeg nie", variant: "destructive" });
    },
  });

  // Category helper functions
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryColor(category.color || "#3b82f6");
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryColor("#3b82f6");
    }
    setIsCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) return;
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: { name: categoryName, color: categoryColor } });
    } else {
      createCategoryMutation.mutate({ name: categoryName, color: categoryColor });
    }
    setIsCategoryDialogOpen(false);
    setCategoryName("");
    setCategoryColor("#3b82f6");
    setEditingCategory(null);
  };

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/pos/products", {
        ...productData,
        userId: currentUser?.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      productForm.reset();
      setIsProductDialogOpen(false);
      toast({
        title: "Produk geskep",
        description: "Produk is suksesvol geskep.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie produk skep nie",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/pos/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      productForm.reset();
      setEditingProduct(null);
      setIsProductDialogOpen(false);
      toast({
        title: "Produk bygewerk",
        description: "Produk is suksesvol bygewerk.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie produk bywerk nie",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/pos/products/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      toast({
        title: "Produk verwyder",
        description: "Produk is suksesvol verwyder.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie produk verwyder nie",
        variant: "destructive",
      });
    },
  });

  const deleteAllProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/pos/products/all/${currentUser?.id}`, {});
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      setShowDeleteAllProductsConfirm(false);
      toast({
        title: "Alle produkte verwyder",
        description: `${data.deleted || 0} produkte is verwyder.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie alle produkte verwyder nie",
        variant: "destructive",
      });
    },
  });

  // Customer mutations
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("POST", "/api/pos/customers", {
        ...customerData,
        userId: currentUser?.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers", currentUser?.id] });
      setIsCustomerDialogOpen(false);
      customerForm.reset();
      toast({
        title: "Sukses",
        description: "Klient is suksesvol geskep",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: "Kon nie klient skep nie",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/pos/customers/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers", currentUser?.id] });
      setIsCustomerDialogOpen(false);
      setEditingCustomer(null);
      customerForm.reset();
      toast({
        title: "Sukses",
        description: "Klient is suksesvol bygewerk",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: "Kon nie klient bywerk nie",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: number) => {
      const response = await apiRequest("DELETE", `/api/pos/customers/${customerId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers", currentUser?.id] });
      toast({
        title: "Sukses",
        description: "Klient is suksesvol verwyder",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: "Kon nie klient verwyder nie",
        variant: "destructive",
      });
    },
  });

  // Invoice mutations
  // Verskaffer mutasies
  const saveSupplierMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/pos/suppliers", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/suppliers", currentUser?.id] }); toast({ title: "Verskaffer Gestoor", description: "Verskaffer is suksesvol gestoor." }); },
    onError: (error: any) => { toast({ title: "Fout", description: error.message || "Kon nie verskaffer stoor nie", variant: "destructive" }); },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/pos/suppliers/${id}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/suppliers", currentUser?.id] }); toast({ title: "Verskaffer Verwyder", description: "Verskaffer is verwyder." }); },
  });

  const handleSaveSupplier = () => {
    if (!poSupplierName) { toast({ title: "Fout", description: "Verskaffer naam is verpligtend om te stoor", variant: "destructive" }); return; }
    saveSupplierMutation.mutate({ userId: currentUser?.id, name: poSupplierName, email: poSupplierEmail || null, phone: poSupplierPhone || null, address: poSupplierAddress || null });
  };

  const loadSupplier = (supplier: any) => {
    setPOSupplierName(supplier.name);
    setPOSupplierEmail(supplier.email || "");
    setPOSupplierPhone(supplier.phone || "");
    setPOSupplierAddress(supplier.address || "");
  };

  // Aankoopbestelling mutasies
  const createPOMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/pos/purchase-orders", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] }); setIsPODialogOpen(false); resetPOForm(); toast({ title: "Aankoopbestelling Geskep", description: "Aankoopbestelling is suksesvol geskep." }); },
    onError: (error: any) => { toast({ title: "Fout", description: error.message || "Kon nie aankoopbestelling skep nie", variant: "destructive" }); },
  });
  const updatePOMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => { const res = await apiRequest("PUT", `/api/pos/purchase-orders/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] }); setIsPODialogOpen(false); setEditingPO(null); resetPOForm(); toast({ title: "Aankoopbestelling Opgedateer", description: "Aankoopbestelling is suksesvol opgedateer." }); },
    onError: (error: any) => { toast({ title: "Fout", description: error.message || "Kon nie aankoopbestelling opdateer nie", variant: "destructive" }); },
  });
  const updatePOStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => { const res = await apiRequest("PATCH", `/api/pos/purchase-orders/${id}`, { status }); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] }); toast({ title: "Status Opgedateer", description: "Aankoopbestelling status is opgedateer." }); },
  });
  const togglePOPaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: number; isPaid: boolean }) => { const res = await apiRequest("PATCH", `/api/pos/purchase-orders/${id}`, { isPaid }); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] }); toast({ title: "Betaalstatus Opgedateer", description: "Aankoopbestelling betaalstatus is opgedateer." }); },
  });
  const deletePOMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/pos/purchase-orders/${id}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] }); setIsDeletePODialogOpen(false); setDeletingPOId(null); toast({ title: "Verwyder", description: "Aankoopbestelling is verwyder." }); },
  });

  const resetPOForm = () => {
    setPOSupplierName(""); setPOSupplierEmail(""); setPOSupplierPhone(""); setPOSupplierAddress("");
    setPOItems([]); setPOExpectedDate(""); setPONotes(""); setPOTaxPercent(15); setPOShippingAmount(0); setEditingPO(null);
  };

  const handleSubmitPO = () => {
    if (!poSupplierName) { toast({ title: "Fout", description: "Verskaffer naam is verpligtend", variant: "destructive" }); return; }
    if (poItems.length === 0) { toast({ title: "Fout", description: "Voeg ten minste een item by", variant: "destructive" }); return; }
    const subtotal = poItems.reduce((sum: number, item: any) => sum + (item.costPrice * item.quantity), 0);
    const taxAmount = subtotal * (poTaxPercent / 100);
    const total = subtotal + taxAmount + poShippingAmount;
    const poData = {
      userId: currentUser?.id, supplierName: poSupplierName, supplierEmail: poSupplierEmail || null,
      supplierPhone: poSupplierPhone || null, supplierAddress: poSupplierAddress || null,
      items: poItems.map((item: any) => ({ ...item, lineTotal: item.costPrice * item.quantity, receivedQty: item.receivedQty || 0 })),
      subtotal, taxPercent: poTaxPercent, shippingAmount: poShippingAmount, total,
      expectedDate: poExpectedDate || null, notes: poNotes || null, status: 'draft',
    };
    if (editingPO) { updatePOMutation.mutate({ id: editingPO.id, data: poData }); }
    else { createPOMutation.mutate(poData); }
  };

  const addPOItem = (product?: any) => {
    if (product) { setPOItems([...poItems, { productId: product.id, name: product.name, sku: product.sku, quantity: 1, costPrice: parseFloat(product.costPrice || product.retailPrice || "0"), receivedQty: 0 }]); }
    else { setPOItems([...poItems, { productId: null, name: "", sku: "", quantity: 1, costPrice: 0, receivedQty: 0 }]); }
  };

  const loadPOForEdit = (po: any) => {
    setEditingPO(po); setPOSupplierName(po.supplierName); setPOSupplierEmail(po.supplierEmail || "");
    setPOSupplierPhone(po.supplierPhone || ""); setPOSupplierAddress(po.supplierAddress || "");
    setPOItems(po.items || []); setPOExpectedDate(po.expectedDate ? new Date(po.expectedDate).toISOString().split('T')[0] : "");
    setPONotes(po.notes || ""); setPOTaxPercent(parseFloat(po.taxPercent) || 15);
    setPOShippingAmount(parseFloat(po.shippingAmount) || 0); setIsPODialogOpen(true);
  };

  const getPOStatusBadge = (status: string) => {
    const styles: Record<string, string> = { draft: "bg-gray-500/20 text-gray-300 border-gray-500/30", sent: "bg-blue-500/20 text-blue-300 border-blue-500/30", partial: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", received: "bg-green-500/20 text-green-300 border-green-500/30", cancelled: "bg-red-500/20 text-red-300 border-red-500/30" };
    const labels: Record<string, string> = { draft: "Konsep", sent: "Gestuur", partial: "Gedeeltelik Ontvang", received: "Ontvang", cancelled: "Gekanselleer" };
    return <Badge className={`${styles[status] || styles.draft} border`}>{labels[status] || status}</Badge>;
  };

  const generatePOPdf = async (po: any) => {
    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF();
    doc.setFillColor(30, 64, 175); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("AANKOOPBESTELLING", 20, 25);
    doc.setFontSize(12); doc.setTextColor(200, 220, 255); doc.text(po.poNumber, 20, 35);
    doc.setTextColor(220, 230, 255); doc.setFontSize(10);
    doc.text(`Datum: ${new Date(po.createdAt).toLocaleDateString()}`, 150, 25);
    if (po.expectedDate) doc.text(`Verwag: ${new Date(po.expectedDate).toLocaleDateString()}`, 150, 32);
    let infoY = 55;
    if (currentUser?.companyName) {
      doc.setTextColor(30, 64, 175); doc.setFontSize(11); doc.setFont("helvetica", "bold");
      doc.text("VAN:", 20, infoY); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50); doc.text(currentUser.companyName, 20, infoY + 7);
    }
    doc.setTextColor(30, 64, 175); doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("VERSKAFFER:", 120, infoY); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
    let supplierY = infoY + 7; doc.text(po.supplierName, 120, supplierY); supplierY += 6;
    if (po.supplierPhone) { doc.text(`Tel: ${po.supplierPhone}`, 120, supplierY); supplierY += 6; }
    if (po.supplierEmail) { doc.text(`E-pos: ${po.supplierEmail}`, 120, supplierY); supplierY += 6; }
    if (po.supplierAddress) { const addrLines = doc.splitTextToSize(po.supplierAddress, 70); addrLines.forEach((l: string) => { doc.text(l, 120, supplierY); supplierY += 5; }); }
    let tableY = Math.max(supplierY, 85) + 10;
    doc.setFillColor(30, 64, 175); doc.rect(20, tableY, 170, 8, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("Item", 22, tableY + 5.5); doc.text("SKU", 85, tableY + 5.5); doc.text("Hv", 115, tableY + 5.5);
    doc.text("Kosprys", 135, tableY + 5.5); doc.text("Totaal", 165, tableY + 5.5); tableY += 10;
    doc.setFont("helvetica", "normal");
    (po.items || []).forEach((item: any, idx: number) => {
      if (idx % 2 === 0) { doc.setFillColor(240, 245, 255); doc.rect(20, tableY - 4, 170, 7, 'F'); }
      doc.setTextColor(40, 40, 40);
      doc.text(item.name || "Pasgemaakte Item", 22, tableY); doc.text(item.sku || "-", 85, tableY);
      doc.text(String(item.quantity), 115, tableY); doc.text(`R${parseFloat(item.costPrice || 0).toFixed(2)}`, 135, tableY);
      doc.text(`R${(item.costPrice * item.quantity).toFixed(2)}`, 165, tableY); tableY += 7;
    });
    tableY += 5; doc.setDrawColor(200, 200, 200); doc.line(120, tableY, 190, tableY); tableY += 7;
    doc.setTextColor(80, 80, 80); doc.text("Subtotaal:", 130, tableY);
    doc.text(`R${parseFloat(po.subtotal).toFixed(2)}`, 165, tableY); tableY += 6;
    if (parseFloat(po.taxPercent) > 0) {
      doc.text(`BTW (${po.taxPercent}%):`, 130, tableY);
      doc.text(`R${(parseFloat(po.subtotal) * parseFloat(po.taxPercent) / 100).toFixed(2)}`, 165, tableY); tableY += 6;
    }
    if (parseFloat(po.shippingAmount) > 0) {
      doc.text("Versending:", 130, tableY); doc.text(`R${parseFloat(po.shippingAmount).toFixed(2)}`, 165, tableY); tableY += 6;
    }
    doc.setTextColor(30, 64, 175); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("TOTAAL:", 130, tableY + 3); doc.text(`R${parseFloat(po.total).toFixed(2)}`, 165, tableY + 3);
    if (po.notes) {
      tableY += 15; doc.setTextColor(80, 80, 80); doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text("Notas:", 20, tableY); doc.setFont("helvetica", "normal");
      doc.splitTextToSize(po.notes, 170).forEach((l: string) => { tableY += 5; doc.text(l, 20, tableY); });
    }
    doc.save(`${po.poNumber}.pdf`);
  };

  const filteredPurchaseOrders = useMemo(() => {
    return (purchaseOrders || []).filter((po: any) => {
      const matchesSearch = poSearchTerm === "" || po.poNumber?.toLowerCase().includes(poSearchTerm.toLowerCase()) || po.supplierName?.toLowerCase().includes(poSearchTerm.toLowerCase());
      const matchesStatus = poStatusFilter === "all" || po.status === poStatusFilter || (poStatusFilter === "paid" && po.isPaid) || (poStatusFilter === "not_paid" && !po.isPaid);
      return matchesSearch && matchesStatus;
    }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [purchaseOrders, poSearchTerm, poStatusFilter]);

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest("POST", "/api/pos/invoices", {
        ...invoiceData,
        userId: currentUser?.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/invoices", currentUser?.id] });
      setIsInvoiceDialogOpen(false);
      setEditingInvoice(null);
      setInvoiceItems([]);
      setInvoiceClientId(null);
      setInvoiceCustomClient("");
      setInvoiceClientEmail("");
      setInvoiceClientPhone("");
      setIsCustomClient(true);
      setInvoiceDueDate("");
      setInvoiceNotes("");
      setInvoicePoNumber("");
      setInvoiceDueTerms("7 dae");
      setInvoiceDiscountPercent("0");
      setInvoiceShippingAmount("0");
      setInvoicePaymentMethod("");
      setInvoicePaymentDetails("");
      setInvoiceTerms("");
      setInvoiceTaxEnabled(true);
      setInvoiceCustomFieldValues(getInvoiceVisDefs());
      setInvoiceShowBusinessInfo(true);
      setShowQuickAddProduct(false);
      setQuickAddName("");
      setQuickAddPrice("");
      toast({
        title: "Sukses",
        description: `${invoiceType === 'invoice' ? 'Faktuur' : 'Kwotasie'} geskep`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie faktuur skep nie",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, invoiceData }: { invoiceId: number; invoiceData: any }) => {
      const response = await apiRequest("PUT", `/api/pos/invoices/${invoiceId}`, {
        ...invoiceData,
        userId: currentUser?.id
      });
      return response.json();
    },
    onSuccess: (updatedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/invoices", currentUser?.id] });
      setIsInvoiceDialogOpen(false);
      setEditingInvoice(null);
      setIsInvoiceViewOpen(false);
      setSelectedInvoice(updatedInvoice);
      setInvoiceItems([]);
      setInvoiceClientId(null);
      setInvoiceCustomClient("");
      setInvoiceClientEmail("");
      setInvoiceClientPhone("");
      setIsCustomClient(true);
      setInvoiceDueDate("");
      setInvoiceNotes("");
      setInvoicePoNumber("");
      setInvoiceDueTerms("7 dae");
      setInvoiceDiscountPercent("0");
      setInvoiceShippingAmount("0");
      setInvoicePaymentMethod("");
      setInvoicePaymentDetails("");
      setInvoiceTerms("");
      setInvoiceTaxEnabled(true);
      setInvoiceCustomFieldValues(getInvoiceVisDefs());
      setInvoiceShowBusinessInfo(true);
      setShowQuickAddProduct(false);
      setQuickAddName("");
      setQuickAddPrice("");
      toast({
        title: "Sukses",
        description: `${updatedInvoice.documentType === 'invoice' ? 'Faktuur' : 'Kwotasie'} bygewerk`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie faktuur bywerk nie",
        variant: "destructive",
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest("DELETE", `/api/pos/invoices/${invoiceId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/invoices", currentUser?.id] });
      setIsDeleteInvoiceDialogOpen(false);
      setIsInvoiceViewOpen(false);
      setSelectedInvoice(null);
      toast({
        title: "Verwyder",
        description: "Faktuur verwyder",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: "Kon nie faktuur verwyder nie",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceStatusMutation = useMutation({
    mutationFn: async ({ invoiceId, status }: { invoiceId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/pos/invoices/${invoiceId}`, { status });
      return response.json();
    },
    onMutate: async ({ invoiceId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/pos/invoices", currentUser?.id] });
      const previousInvoices = queryClient.getQueryData(["/api/pos/invoices", currentUser?.id]);
      queryClient.setQueryData(["/api/pos/invoices", currentUser?.id], (old: any) => 
        old?.map((inv: any) => inv.id === invoiceId ? { ...inv, status } : inv)
      );
      return { previousInvoices };
    },
    onSuccess: (updatedInvoice) => {
      setSelectedInvoice(updatedInvoice);
      setIsStatusChangeDialogOpen(false);
    },
    onError: (error: Error, variables, context) => {
      queryClient.setQueryData(["/api/pos/invoices", currentUser?.id], context?.previousInvoices);
      toast({
        title: "Fout",
        description: "Kon nie status bywerk nie",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/invoices", currentUser?.id] });
    },
  });

  const updateDocumentNumberMutation = useMutation({
    mutationFn: async ({ invoiceId, documentNumber }: { invoiceId: number; documentNumber: string }) => {
      const response = await apiRequest("PUT", `/api/pos/invoices/${invoiceId}`, { documentNumber });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/invoices", currentUser?.id] });
      setIsEditDocNumberDialogOpen(false);
      setEditingDocNumberInvoice(null);
      setNewDocumentNumber("");
      toast({
        title: "Dokumentnommer Bygewerk",
        description: "Faktuur nommer is bygewerk",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: "Kon nie dokumentnommer bywerk nie",
        variant: "destructive",
      });
    },
  });

  // Saved payment details mutations
  const savePaymentDetailsMutation = useMutation({
    mutationFn: async (data: { name: string; details: string }) => {
      const response = await apiRequest("POST", "/api/pos/saved-payment-details", {
        userId: currentUser?.id,
        name: data.name,
        details: data.details
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/saved-payment-details", currentUser?.id] });
      setIsSavePaymentDialogOpen(false);
      setSavePaymentName("");
      toast({
        title: "Gestoor",
        description: "Betalingsbesonderhede suksesvol gestoor",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: "Kon nie betalingsbesonderhede stoor nie",
        variant: "destructive",
      });
    },
  });

  const deletePaymentDetailsMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/pos/saved-payment-details/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/saved-payment-details", currentUser?.id] });
      toast({
        title: "Verwyder",
        description: "Betalingsbesonderhede verwyder",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: "Kon nie betalingsbesonderhede verwyder nie",
        variant: "destructive",
      });
    },
  });

  // Staff account mutations
  const createStaffAccountMutation = useMutation({
    mutationFn: async (staffData: any) => {
      const response = await apiRequest("POST", "/api/pos/staff-accounts", staffData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/staff-accounts", currentUser?.id] });
      setIsUserManagementOpen(false);
      setIsStaffDialogOpen(false);
      toast({
        title: "Personeelrekening geskep",
        description: "Personeelrekening is suksesvol geskep.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie personeelrekening skep nie",
        variant: "destructive",
      });
    },
  });

  const authenticateStaffMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string; userId?: number }) => {
      const response = await apiRequest("POST", "/api/pos/staff-accounts/authenticate", credentials);
      return response.json();
    },
    onSuccess: async (data) => {
      setCurrentStaff(data.staffAccount);
      setIsStaffSwitchMode(false);
      setIsStaffPasswordDialogOpen(false);
      setStaffPassword("");
      setSelectedStaffForAuth(null);
      // Save staff selection to user profile (persists like language preference)
      if (currentUser?.id && data.staffAccount?.id) {
        try {
          await apiRequest("PUT", `/api/pos/user/${currentUser.id}/staff-selection`, { 
            staffAccountId: data.staffAccount.id 
          });
          // Update localStorage and currentUser with new staff selection
          const updatedUser = { ...currentUser, selectedStaffAccountId: data.staffAccount.id };
          localStorage.setItem('posUser', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        } catch (error) {
          console.error("Failed to save staff selection:", error);
        }
      }
      toast({
        title: "Welkom terug",
        description: `Ingemeld as ${data.staffAccount.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Inmeld gefaal",
        description: error.message || "Ongeldige geloofsbriewe",
        variant: "destructive",
      });
    },
  });

  const deleteStaffAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/pos/staff-accounts/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/staff-accounts", currentUser?.id] });
      toast({
        title: "Personeelrekening verwyder",
        description: "Personeelrekening is suksesvol verwyder.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie personeelrekening verwyder nie",
        variant: "destructive",
      });
    },
  });

  // Logo upload mutation
  const markTutorialMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Geen gebruiker");
      const res = await apiRequest("PUT", `/api/pos/user/${currentUser.id}/tutorial-complete`, { userEmail: currentUser.email });
      return res.json();
    },
    onSuccess: () => {
      setCurrentUser(prev => prev ? { ...prev, tutorialCompleted: true } : null);
      const stored = JSON.parse(localStorage.getItem("posUser") ?? "{}");
      localStorage.setItem("posUser", JSON.stringify({ ...stored, tutorialCompleted: true }));
      toast({ title: "Opstelling voltooi!", description: "Jou rekening is volledig opgestel." });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon nie opstelling as voltooi merk nie.", variant: "destructive" });
    },
  });

  const logoUploadMutation = useMutation({
    mutationFn: async (logo: string) => {
      const userId = currentUser?.id || 1;
      console.log('Uploading logo for user ID:', userId);
      const response = await apiRequest("PUT", `/api/pos/user/${userId}/logo`, { logo });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Logo opgelaai",
        description: "Maatskappy logo is suksesvol bygewerk.",
      });
      setCurrentUser(prev => prev ? { ...prev, companyLogo: data.user.companyLogo } : null);
      localStorage.setItem('posUser', JSON.stringify(data.user));
      setIsLogoDialogOpen(false);
      setLogoFile(null);
    },
    onError: (error: Error) => {
      console.error('Logo upload error:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon nie logo oplaai nie",
        variant: "destructive",
      });
    },
  });

  // Void sale mutation
  const voidSaleMutation = useMutation({
    mutationFn: async ({ saleId, reason }: { saleId: number; reason: string }) => {
      const response = await apiRequest("POST", `/api/pos/sales/${saleId}/void`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/sales", currentUser?.id] });
      setVoidSaleDialog({ open: false, sale: null });
      setVoidReason("");
      toast({
        title: "Verkoop gekanselleer",
        description: "Verkoop is suksesvol gekanselleer.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie verkoop kanselleer nie",
        variant: "destructive",
      });
    },
  });


  // Sale functions
  const addToSale = (product: Product) => {
    const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;
    const customerType = selectedCustomer?.customerType || 'retail';
    const price = getProductPrice(product, customerType);
    
    const existingItem = currentSale.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast({
          title: "Nie genoeg voorraad nie",
          description: `Slegs ${product.quantity} items beskikbaar`,
          variant: "destructive",
        });
        return;
      }
      setCurrentSale(currentSale.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, price: price }
          : item
      ));
    } else {
      if (product.quantity < 1) {
        toast({
          title: "Uit voorraad",
          description: "Hierdie produk is nie beskikbaar nie",
          variant: "destructive",
        });
        return;
      }
      setCurrentSale([...currentSale, {
        productId: product.id,
        name: product.name,
        price: price,
        costPrice: product.costPrice,
        quantity: 1
      }]);
    }
  };

  const getProductPrice = (product: Product, customerType: 'retail' | 'trade' = 'retail'): string => {
    if (customerType === 'trade' && product.tradePrice) {
      return product.tradePrice;
    }
    return product.retailPrice;
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCurrentSale(currentSale.filter(item => item.productId !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (product && newQuantity > product.quantity) {
        toast({
          title: "Nie genoeg voorraad nie",
          description: `Slegs ${product.quantity} items beskikbaar`,
          variant: "destructive",
        });
        return;
      }
      setCurrentSale(currentSale.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const calculateSubtotal = () => {
    return currentSale.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * discountPercentage) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount).toFixed(2);
  };

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;
      
      if (checkoutOption === 'complete') {
        const saleData = {
          total: calculateTotal(),
          items: currentSale,
          customerId: selectedCustomerId || null,
          customerName: selectedCustomer?.name || null,
          notes: saleNotes || null,
          paymentType,
          staffAccountId: currentStaff?.id || null,
          userId: currentUser?.id,
        };

        const response = await apiRequest("POST", "/api/pos/sales", saleData);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Kon nie verkoop verwerk nie");
        }
        return { type: 'sale', data: await response.json() };
      } else if (checkoutOption === 'open-account') {
        setIsOpenAccountDialogOpen(true);
        return { type: 'open-account', data: null };
      } else {
        if (!selectedOpenAccountId) {
          throw new Error("Kies asseblief 'n oop rekening");
        }
        
        const response = await apiRequest("POST", `/api/pos/open-accounts/${selectedOpenAccountId}/items`, { 
          items: currentSale 
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Kon nie items by rekening voeg nie");
        }
        return { type: 'add-to-account', data: await response.json() };
      }
    },
    onSuccess: (result) => {
      if (result.type === 'sale') {
        const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;

        // Capture before clearing state - used by success dialog print/share
        setSaleCompleteData({
          sale: result.data,
          customer: selectedCustomer,
          tipEnabled: tipOptionEnabled,
        });

        // Clear sale
        setCurrentSale([]);
        setSaleNotes("");
        setSelectedCustomerId(null);
        setDiscountPercentage(0);
        setTipOptionEnabled(false);

        queryClient.invalidateQueries({ queryKey: ["/api/pos/sales", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
        // Refresh user profile so planSavingAmount banner updates immediately
        if (currentUser) refreshUserProfile(currentUser.id, currentUser.email);
      } else if (result.type === 'add-to-account') {
        setCurrentSale([]);
        setSaleNotes("");
        setSelectedCustomerId(null);
        setDiscountPercentage(0);
        setSelectedOpenAccountId(null);
        setCheckoutOption('complete');
        
        queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts", currentUser?.id] });
        
        toast({
          title: "Items bygevoeg",
          description: "Items is suksesvol by die rekening gevoeg",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: error.message || "Kon nie verkoop verwerk nie",
        variant: "destructive",
      });
    },
  });

  // Create open account mutation
  const createOpenAccountMutation = useMutation({
    mutationFn: async (accountData: any) => {
      const response = await apiRequest("POST", "/api/pos/open-accounts", {
        ...accountData,
        userId: currentUser?.id
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Kon nie oop rekening skep nie");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Oop rekening geskep",
        description: `Rekening "${data.accountName}" suksesvol geskep`,
      });
      
      // Clear current sale
      setCurrentSale([]);
      setSelectedCustomerId(null);
      setSaleNotes("");
      setPaymentType("kontant");
      setDiscountPercentage(0);
      setTipOptionEnabled(false);
      setIsOpenAccountDialogOpen(false);
      setCheckoutOption('complete');
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Kon nie oop rekening skep nie",
        description: error.message || "'n Fout het voorgekom terwyl die rekening geskep is",
        variant: "destructive",
      });
    },
  });

  const closeOpenAccountMutation = useMutation({
    mutationFn: async ({ accountId, paymentType, tipEnabled }: { accountId: number; paymentType: string; tipEnabled: boolean }) => {
      const account = openAccounts.find((a: any) => a.id === accountId);
      if (!account) throw new Error("Rekening nie gevind nie");
      const saleData = {
        total: account.total,
        items: account.items,
        customerName: account.accountName,
        notes: account.notes,
        paymentType,
        staffAccountId: currentStaff?.id || null,
      };
      const saleResponse = await apiRequest("POST", "/api/pos/sales", saleData);
      if (!saleResponse.ok) {
        const errorData = await saleResponse.json();
        throw new Error(errorData.message || "Kon nie verkoop verwerk nie");
      }
      const deleteResponse = await apiRequest("DELETE", `/api/pos/open-accounts/${accountId}`);
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.message || "Kon nie rekening sluit nie");
      }
      return { ...(await saleResponse.json()), tipEnabled };
    },
    onSuccess: (data) => {
      toast({ title: "Rekening gesluit", description: `Verkoop van R${data.total} suksesvol verwerk.` });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/sales", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
    },
    onError: (error: Error) => {
      toast({ title: "Kon nie rekening sluit nie", description: error.message, variant: "destructive" });
    },
  });

  const removeItemFromOpenAccountMutation = useMutation({
    mutationFn: async ({ accountId, itemIndex }: { accountId: number; itemIndex: number }) => {
      const response = await apiRequest("DELETE", `/api/pos/open-accounts/${accountId}/items/${itemIndex}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Kon nie item verwyder nie");
      }
      return response.json();
    },
    onSuccess: (updatedAccount) => {
      toast({ title: "Item verwyder", description: "Item suksesvol van rekening verwyder" });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts", currentUser?.id] });
      if (selectedOpenAccount && updatedAccount.id === selectedOpenAccount.id) {
        setSelectedOpenAccount(updatedAccount);
      }
    },
    onError: (error: Error) => {
      toast({ title: "Kon nie item verwyder nie", description: error.message, variant: "destructive" });
    },
  });

  const updateOpenAccountNameMutation = useMutation({
    mutationFn: async ({ accountId, accountName }: { accountId: number; accountName: string }) => {
      const response = await apiRequest("PUT", `/api/pos/open-accounts/${accountId}`, { accountName });
      if (!response.ok) throw new Error("Kon nie rekeningnaam opdateer nie");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Rekening hernoem", description: "Rekeningnaam suksesvol opgedateer." });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
      setEditingOpenAccount(null);
      setEditOpenAccountName("");
    },
    onError: () => {
      toast({ title: "Hernoem misluk", description: "Kon nie die rekeningnaam opdateer nie.", variant: "destructive" });
    },
  });

  const handleAfrikaansDeleteItemClick = (accountId: number, itemIndex: number) => {
    if (currentStaff?.userType === 'management') {
      if (window.confirm('Is jy seker jy wil hierdie item van die rekening verwyder?')) {
        removeItemFromOpenAccountMutation.mutate({ accountId, itemIndex });
      }
    } else {
      toast({ title: "Bestuurstoegang Benodig", description: "Slegs bestuurders kan items van oop rekeninge verwyder.", variant: "destructive" });
    }
  };

  const handleAfrikaansItemCheckboxChange = (itemIndex: number, checked: boolean) => {
    if (checked) {
      setSelectedItemsForPrint((prev: number[]) => [...prev, itemIndex]);
    } else {
      setSelectedItemsForPrint((prev: number[]) => prev.filter((i: number) => i !== itemIndex));
    }
  };

  // Merge receipt settings with defaults - Afrikaans
  const mergeReceiptSettingsAfrikaans = (settings: any) => {
    const defaults = defaultReceiptSettings();
    if (!settings) return defaults;
    
    try {
      const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
      return {
        sections: parsed.sections || defaults.sections,
        toggles: { ...defaults.toggles, ...parsed.toggles },
        businessInfo: { ...defaults.businessInfo, ...parsed.businessInfo },
        customMessages: { ...defaults.customMessages, ...parsed.customMessages },
        logoDataUrl: parsed.logoDataUrl,
        lastBusinessInfoUpdate: parsed.lastBusinessInfoUpdate,
        invoiceSettings: {
          customFields: parsed?.invoiceSettings?.customFields || [],
        },
      };
    } catch {
      return defaults;
    }
  };

  const invoiceCustomFieldDefs = useMemo(() => {
    const settings = mergeReceiptSettingsAfrikaans(currentUser?.receiptSettings);
    return ((settings as any).invoiceSettings?.customFields || []) as Array<{id: string; label: string}>;
  }, [currentUser?.receiptSettings]);

  const toggleInvoiceColumn = useCallback((key: string) => {
    setInvoiceCardColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      try {
        const u = JSON.parse(localStorage.getItem('posUser') || 'null');
        localStorage.setItem(`invoiceCardCols_${u?.id || 'guest'}`, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    try {
      const saved = localStorage.getItem(`invoiceCardCols_${currentUser.id}`);
      if (saved) setInvoiceCardColumns(new Set(JSON.parse(saved)));
    } catch {}
  }, [currentUser?.id]);

  // Generate Afrikaans receipt
  const generateAfrikaansReceipt = (sale: any, customer: any, tipEnabled = false, customSettings?: any, returnDoc = false): any => {
    const doc = new jsPDF();
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;
    
    const settings = mergeReceiptSettingsAfrikaans(customSettings || currentUser?.receiptSettings);
    const items = Array.isArray(sale.items) ? sale.items : JSON.parse(sale.items);
    
    const brandBlue = [24, 82, 163] as const;
    const darkBlue = [15, 52, 110] as const;
    const lightBlue = [230, 240, 255] as const;
    const darkGray = [51, 51, 51] as const;
    const medGray = [120, 120, 120] as const;
    const lineGray = [200, 210, 225] as const;

    doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
    doc.rect(0, 46, pageWidth, 4, 'F');

    if (settings.toggles.showLogo) {
      const logoToUse = settings.logoDataUrl || currentUser?.companyLogo;
      if (logoToUse) {
        try {
          doc.addImage(logoToUse, 'JPEG', margin, 8, 34, 34);
        } catch (error) {
          console.error('Error adding logo to PDF:', error);
        }
      }
    }

    doc.setTextColor(255, 255, 255);
    const titleX = (settings.toggles.showLogo && (settings.logoDataUrl || currentUser?.companyLogo)) ? 60 : margin;
    
    if (settings.toggles.showBusinessName && settings.businessInfo.name) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(settings.businessInfo.name, titleX, 22);
    }
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('VERKOOPKWITANSIE', titleX, 32);

    const contactParts: string[] = [];
    if (settings.toggles.showBusinessPhone && settings.businessInfo.phone) contactParts.push(settings.businessInfo.phone);
    if (settings.toggles.showBusinessEmail && settings.businessInfo.email) contactParts.push(settings.businessInfo.email);
    if (settings.toggles.showBusinessWebsite && settings.businessInfo.website) contactParts.push(settings.businessInfo.website);
    if (contactParts.length > 0) {
      doc.setFontSize(8);
      doc.text(contactParts.join('  |  '), titleX, 40);
    }

    y = 58;

    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'F');
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    if (settings.toggles.showDateTime) {
      doc.text('DATUM', margin + 4, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(new Date(sale.createdAt).toLocaleDateString('af-ZA', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 4, y + 14);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TYD', margin + 60, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(new Date(sale.createdAt).toLocaleTimeString('af-ZA', { hour: '2-digit', minute: '2-digit' }), margin + 60, y + 14);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('VERKOOP #', margin + 4, y + 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${sale.id}`, margin + 30, y + 22);
    }
    
    if (settings.toggles.showPaymentMethod && sale.paymentType) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('BETALING', margin + 110, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const paymentText = sale.paymentType === 'cash' ? 'Kontant' : sale.paymentType === 'card' ? 'Kaart' : 'EFT';
      doc.text(paymentText, margin + 110, y + 14);
    }

    if (settings.toggles.showStaffInfo && currentStaff) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('BEDIEN DEUR', margin + 60, y + 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(currentStaff.username, margin + 90, y + 22);
    }
    
    if (settings.toggles.showCustomerInfo && customer) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('KLIENT', margin + 110, y + 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(customer.name, margin + 130, y + 22);
    }

    if (settings.toggles.showBusinessAddress || settings.toggles.showRegistrationNumber || settings.toggles.showVATNumber) {
      const regParts: string[] = [];
      if (settings.toggles.showBusinessAddress && settings.businessInfo.addressLine1) regParts.push(settings.businessInfo.addressLine1);
      if (settings.toggles.showBusinessAddress && settings.businessInfo.addressLine2) regParts.push(settings.businessInfo.addressLine2);
      if (settings.toggles.showRegistrationNumber && settings.businessInfo.registrationNumber) regParts.push(`Reg: ${settings.businessInfo.registrationNumber}`);
      if (settings.toggles.showVATNumber && settings.businessInfo.vatNumber) regParts.push(`BTW: ${settings.businessInfo.vatNumber}`);
      if (regParts.length > 0) {
        doc.setFontSize(7);
        doc.setTextColor(medGray[0], medGray[1], medGray[2]);
        doc.text(regParts.join('  |  '), margin + 4, y + 27);
      }
    }

    y += 36;

    doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.roundedRect(margin, y, contentWidth, 9, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', margin + 4, y + 6);
    doc.text('HV.', margin + 105, y + 6);
    doc.text('PRYS', margin + 125, y + 6);
    doc.text('TOTAAL', margin + 148, y + 6);
    y += 12;
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    items.forEach((item: any, index: number) => {
      const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
      const itemName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
      
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 255);
        doc.rect(margin, y - 4, contentWidth, 7, 'F');
      }
      
      doc.text(itemName, margin + 4, y);
      doc.text(item.quantity.toString(), margin + 108, y);
      doc.text(`R${parseFloat(item.price).toFixed(2)}`, margin + 125, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`R${itemTotal}`, margin + 150, y);
      doc.setFont('helvetica', 'normal');
      y += 7;
    });

    y += 2;
    doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
    doc.line(margin + 100, y, margin + contentWidth, y);
    y += 6;

    const subtotal = parseFloat(sale.total);
    doc.setFontSize(9);
    doc.setTextColor(medGray[0], medGray[1], medGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotaal', margin + 110, y);
    doc.text(`R${subtotal.toFixed(2)}`, margin + 150, y);
    y += 7;

    doc.setDrawColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.setLineWidth(0.8);
    doc.line(margin + 100, y, margin + contentWidth, y);
    doc.setLineWidth(0.2);
    y += 8;

    doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.roundedRect(margin + 95, y - 6, contentWidth - 95, 14, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAAL', margin + 100, y + 3);
    doc.text(`R${subtotal.toFixed(2)}`, margin + 150, y + 3);
    y += 16;

    if (tipEnabled) {
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
      doc.text('Fooi:', margin + 4, y);
      doc.line(margin + 16, y, margin + 70, y);
      y += 8;
      doc.text('Nuwe Totaal:', margin + 4, y);
      doc.line(margin + 32, y, margin + 70, y);
      y += 12;
    }

    y += 5;
    doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;

    doc.setTextColor(medGray[0], medGray[1], medGray[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    if (settings.toggles.showCustomHeader && settings.customMessages.header) {
      doc.text(settings.customMessages.header, pageWidth / 2, y, { align: 'center' });
      y += 5;
    }
    
    if (settings.toggles.showThankYouMessage) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.text(settings.customMessages.thankYou || 'Baie dankie vir u besigheid!', pageWidth / 2, y, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      y += 6;
    }
    
    if (settings.toggles.showCustomFooter && settings.customMessages.footer) {
      doc.setFontSize(8);
      doc.setTextColor(medGray[0], medGray[1], medGray[2]);
      doc.text(settings.customMessages.footer, pageWidth / 2, y, { align: 'center' });
      y += 5;
    }

    y += 4;
    doc.setFillColor(brandBlue[0], brandBlue[1], brandBlue[2]);
    doc.rect(0, 282, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('Aangedryf deur Storm POS  |  stormsoftware.co.za', pageWidth / 2, 289, { align: 'center' });

    if (returnDoc) return doc;
    doc.save(`kwitansie-${sale.id}.pdf`);
  };

  // Helper functions
  const openProductDialog = (product?: PosProduct) => {
    if (product) {
      setEditingProduct(product);
      productForm.setValue("sku", product.sku);
      productForm.setValue("name", product.name);
      productForm.setValue("costPrice", product.costPrice.toString());
      productForm.setValue("retailPrice", product.retailPrice.toString());
      productForm.setValue("tradePrice", product.tradePrice ? product.tradePrice.toString() : "");
      productForm.setValue("quantity", product.quantity);
    } else {
      setEditingProduct(null);
      productForm.reset();
    }
    setIsProductDialogOpen(true);
  };

  const openCustomerDialog = (customer?: PosCustomer) => {
    if (customer) {
      setEditingCustomer(customer);
      customerForm.setValue("name", customer.name);
      customerForm.setValue("phone", customer.phone || "");
      customerForm.setValue("customerType", customer.customerType);
      customerForm.setValue("notes", customer.notes || "");
    } else {
      setEditingCustomer(null);
      customerForm.reset();
    }
    setIsCustomerDialogOpen(true);
  };

  // Print report function
  const handlePrintReport = () => {
    const dateFilteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
      const dateMatch = saleDate === selectedDate;
      
      if (selectedStaffFilter === "all") {
        return dateMatch;
      } else if (selectedStaffFilter === 0) {
        return dateMatch && !sale.staffAccountId;
      } else {
        return dateMatch && sale.staffAccountId === selectedStaffFilter;
      }
    });

    const validSales = dateFilteredSales.filter(sale => !sale.isVoided);
    const totalRevenue = validSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalTransactions = validSales.length;

    const printContent = `
Verkope Verslag - ${new Date(selectedDate).toLocaleDateString('af-ZA')}

Totale Omset: R${totalRevenue.toFixed(2)}
Transaksies: ${totalTransactions}
Gemiddelde Transaksie: R${totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}

${dateFilteredSales.map(sale => 
  `Verkoop #${sale.id} - R${sale.total} - ${new Date(sale.createdAt).toLocaleTimeString('af-ZA')}${sale.isVoided ? ' (GEKANSELLEER)' : ''}`
).join('\n')}
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Verkope Verslag</title></head>
          <body style="font-family: monospace; white-space: pre-line; padding: 20px;">
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "Verslag gedruk",
      description: `Verkope analise verslag vir ${new Date(selectedDate).toLocaleDateString('af-ZA')} is gedruk.`,
    });
  };

  const handleProductSubmit = (data: z.infer<typeof productFormSchema>) => {
    const dataWithUserId = { ...data, userId: currentUser?.id };
    
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: dataWithUserId });
    } else {
      createProductMutation.mutate(dataWithUserId);
    }
  };

  const handleCustomerSubmit = (data: z.infer<typeof customerFormSchema>) => {
    const dataWithUserId = { ...data, userId: currentUser?.id };
    
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: dataWithUserId });
    } else {
      createCustomerMutation.mutate(dataWithUserId);
    }
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Is jy seker jy wil hierdie produk verwyder?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleDeleteCustomer = (id: number) => {
    if (window.confirm("Is jy seker jy wil hierdie klient verwyder?")) {
      deleteCustomerMutation.mutate(id);
    }
  };

  // Excel Export Handlers
  const handleExportProducts = () => {
    if (!currentUser?.id) return;
    window.location.href = `/api/pos/export/products/${currentUser.id}`;
    toast({
      title: "Uitvoer Begin",
      description: "Jou produkte word as 'n Excel-lêer afgelaai.",
    });
  };

  const handleExportCustomers = () => {
    if (!currentUser?.id) return;
    window.location.href = `/api/pos/export/customers/${currentUser.id}`;
    toast({
      title: "Uitvoer Begin",
      description: "Jou kliënte word as 'n Excel-lêer afgelaai.",
    });
  };

  const handleExportInvoices = () => {
    if (!currentUser?.id) return;
    window.location.href = `/api/pos/export/invoices/${currentUser.id}`;
    toast({
      title: "Uitvoer Begin",
      description: "Jou fakture word as 'n Excel-lêer afgelaai.",
    });
  };

  const handleExportSales = () => {
    if (!currentUser?.id) return;
    window.location.href = `/api/pos/export/sales/${currentUser.id}`;
    toast({
      title: "Uitvoer Begin",
      description: "Jou verkoopsdata word as 'n Excel-lêer afgelaai.",
    });
  };

  // Excel Import Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'customers') => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("Geen lêer gekies nie");
      return;
    }

    console.log("Lêer gekies:", file.name, file.type, file.size);
    toast({
      title: "Lees Lêer",
      description: `Verwerk ${file.name}...`,
    });

    try {
      const buffer = await file.arrayBuffer();
      console.log("Buffer grootte:", buffer.byteLength);
      const workbook = XLSX.read(buffer, { type: 'array' });
      console.log("Werkboek blaaie:", workbook.SheetNames);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      console.log("Ontlede data rye:", data.length, "Voorbeeld:", data[0]);
      
      if (data.length === 0) {
        toast({
          title: "Geen Data Gevind",
          description: "Die lêer lyk leeg of het geen leesbare data nie. Maak seker jou lêer het opskrifte in die eerste ry.",
          variant: "destructive",
        });
        return;
      }

      setImportType(type);
      setImportData(data);
      setImportPreview(data.slice(0, 5)); // Preview first 5 rows
      setIsImportDialogOpen(true);
    } catch (error) {
      console.error("Invoer fout:", error);
      toast({
        title: "Invoerfout",
        description: "Kon nie die lêer lees nie. Kontroleer asseblief die lêerformaat en probeer weer.",
        variant: "destructive",
      });
    }
    
    // Reset the input
    e.target.value = '';
  };

  const handleImportConfirm = async () => {
    if (!currentUser?.id || importData.length === 0) return;
    
    setIsImporting(true);
    try {
      const response = await apiRequest("POST", `/api/pos/import/${importType}/${currentUser.id}`, {
        data: importData
      });
      const result = await response.json();
      
      toast({
        title: "Invoer Voltooid",
        description: result.message,
      });
      
      // Refresh the data
      if (importType === 'products') {
        queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser.id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/pos/customers", currentUser.id] });
      }
      
      setIsImportDialogOpen(false);
      setImportData([]);
      setImportPreview([]);
    } catch (error) {
      toast({
        title: "Invoerfout",
        description: "Kon nie data invoer nie. Probeer asseblief weer.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Logo file upload handler
  const handleLogoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Lêer te groot",
          description: "Kies asseblief 'n lêer kleiner as 2MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoFile(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoidSaleSubmit = () => {
    if (voidSaleDialog.sale && voidReason.trim()) {
      voidSaleMutation.mutate({
        saleId: voidSaleDialog.sale.id,
        reason: voidReason.trim()
      });
    }
  };

  // XERO Integration Handlers
  const handleConnectXero = async () => {
    setIsConnectingXero(true);
    try {
      toast({
        title: "XERO OAuth Opstelling Benodig",
        description: "Die XERO-integrasie vereis dat OAuth-eiebewyse opgestel word. Kontak asseblief ondersteuning vir hulp met opstelling.",
      });
    } finally {
      setIsConnectingXero(false);
    }
  };

  const handleDisconnectXero = async () => {
    if (!currentUser?.id) return;
    setIsConnectingXero(true);
    try {
      await apiRequest("POST", `/api/pos/xero/disconnect/${currentUser.id}`, {});
      toast({
        title: "XERO Ontkoppel",
        description: "Jou XERO-integrasie is ontkoppel.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/user", currentUser.id] });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon nie XERO ontkoppel nie. Probeer asseblief weer.",
        variant: "destructive",
      });
    } finally {
      setIsConnectingXero(false);
    }
  };

  const handleSyncXero = async () => {
    if (!currentUser?.id) return;
    setIsSyncingXero(true);
    try {
      const response = await apiRequest("POST", `/api/pos/xero/sync/${currentUser.id}`, {});
      const result = await response.json();
      toast({
        title: "Sinkronisasie Voltooi",
        description: result.message || "Data is met XERO gesinkroniseer.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers", currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/invoices", currentUser.id] });
    } catch (error) {
      toast({
        title: "Sinkronisasie Misluk",
        description: "Kon nie met XERO sinkroniseer nie. Probeer asseblief weer.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingXero(false);
    }
  };

  // Filter functions
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearchTerm.toLowerCase());
      const matchesCategory = productCategoryFilter === 'all' || product.categoryId === productCategoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (inventorySortOrder) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'sku-asc': return a.sku.localeCompare(b.sku);
        case 'sku-desc': return b.sku.localeCompare(a.sku);
        case 'price-asc': return parseFloat(a.retailPrice) - parseFloat(b.retailPrice);
        case 'price-desc': return parseFloat(b.retailPrice) - parseFloat(a.retailPrice);
        case 'stock-asc': return a.quantity - b.quantity;
        case 'stock-desc': return b.quantity - a.quantity;
        default: return 0;
      }
    });

  const filteredSalesProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = salesCategoryFilter === 'all' || product.categoryId === salesCategoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (productSortOrder) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'sku-asc': return a.sku.localeCompare(b.sku);
        case 'sku-desc': return b.sku.localeCompare(a.sku);
        case 'price-asc': return parseFloat(a.retailPrice) - parseFloat(b.retailPrice);
        case 'price-desc': return parseFloat(b.retailPrice) - parseFloat(a.retailPrice);
        case 'stock-asc': return a.quantity - b.quantity;
        case 'stock-desc': return b.quantity - a.quantity;
        default: return 0;
      }
    });

  // Calculate total spend per customer within selected date range
  const customerSpendMap = useMemo(() => {
    const map: Record<number, number> = {};
    const from = customerSpendFrom ? new Date(customerSpendFrom) : null;
    const to = customerSpendTo ? new Date(customerSpendTo + 'T23:59:59') : null;
    for (const sale of sales) {
      if (sale.isVoided || !sale.customerId) continue;
      const saleDate = new Date(sale.createdAt);
      if (from && saleDate < from) continue;
      if (to && saleDate > to) continue;
      map[sale.customerId] = (map[sale.customerId] || 0) + parseFloat(sale.total as string);
    }
    return map;
  }, [sales, customerSpendFrom, customerSpendTo]);

  // Calculate monthly usage
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  const currentMonthSales = sales.filter(sale => {
    if (sale.isVoided) return false;
    const saleDate = new Date(sale.createdAt);
    return saleDate >= firstDayOfMonth && saleDate <= lastDayOfMonth;
  });

  const monthlyRevenue = currentMonthSales.reduce((total, sale) => {
    return total + parseFloat(sale.total);
  }, 0);

  const stormFee = monthlyRevenue * 0.005;

  // Pre-generate kwitansie PDF-blob + aflaai-URL sodra die verkoopsdialoog oopgaan
  useEffect(() => {
    if (!saleCompleteData) { setReceiptPdfUrl(null); setReceiptPdfBlob(null); setReceiptPdfBusy(false); return; }
    setReceiptPdfBusy(true);
    setReceiptPdfUrl(null);
    setReceiptPdfBlob(null);
    const doc = generateAfrikaansReceipt(saleCompleteData.sale, saleCompleteData.customer, saleCompleteData.tipEnabled, undefined, true);
    if (!doc) { setReceiptPdfBusy(false); return; }
    setReceiptPdfBlob(doc.output('blob') as Blob);
    getTempPdfUrl(doc, `kwitansie-${saleCompleteData.sale.id}.pdf`).then(url => {
      setReceiptPdfUrl(url);
      setReceiptPdfBusy(false);
    }).catch(() => setReceiptPdfBusy(false));
  }, [saleCompleteData]);

  const handleDownloadSaleReceiptAfr = async () => {
    if (!saleCompleteData) return;
    const fileName = `kwitansie-${saleCompleteData.sale.id}.pdf`;
    if (isTauriAndroid()) {
      // In-toep aflaai: stoor in toepkas en maak oop met inheemse PDF-kyker (geen blaaier)
      try {
        const blob = receiptPdfBlob || ((): Blob | null => {
          const doc = generateAfrikaansReceipt(saleCompleteData.sale, saleCompleteData.customer, saleCompleteData.tipEnabled, undefined, true);
          return doc ? (doc.output('blob') as Blob) : null;
        })();
        if (blob) await saveAndOpenPdfAndroid(blob, fileName);
      } catch (e) { console.error('save_pdf_to_cache fout:', e); }
      return;
    }
    // Web: oombliklike anker-aflaai met vooraf-gegenereerde blob-URL
    if (receiptPdfUrl) {
      const a = document.createElement('a'); a.href = receiptPdfUrl; a.download = fileName;
      a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(() => document.body.removeChild(a), 200); return;
    }
    const doc = generateAfrikaansReceipt(saleCompleteData.sale, saleCompleteData.customer, saleCompleteData.tipEnabled, undefined, true);
    if (doc) await downloadOpenPDF(doc, fileName);
  };

  const handleShareSaleReceiptAfr = async () => {
    if (!saleCompleteData) return;
    const companyName = currentUser?.companyName || 'Storm POS';
    const message = `Verkoopkwitansie van ${companyName} - R${saleCompleteData.sale.total}`;
    const fileName = `kwitansie-${saleCompleteData.sale.id}.pdf`;
    if (isTauriAndroid()) {
      try { const { shareText } = await import('@choochmeque/tauri-plugin-sharekit-api'); await shareText(message); return; } catch (e) { console.error(e); }
    }
    if (navigator.share && receiptPdfBlob) {
      try {
        const file = new File([receiptPdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: fileName, text: message });
        } else {
          await navigator.share({ title: fileName, text: message });
        }
        return;
      } catch (e: any) { if (e.name === 'AbortError') return; }
    }
    // Rekenaar-terugval: stoor PDF + WhatsApp Web teks slegs
    if (receiptPdfBlob) {
      const url = URL.createObjectURL(receiptPdfBlob);
      const a = document.createElement('a'); a.href = url; a.download = fileName;
      a.style.display = 'none'; document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    }
    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className={`pos-app min-h-screen relative${posTheme === 'dark' ? ' bg-gray-950' : ' bg-slate-50'}`}>

      {/* ── Verkoop Sukses Dialoog ── */}
      {saleCompleteData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(10px)' }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="bg-[#080d1a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div className="h-0.5 bg-gradient-to-r from-[hsl(217,90%,35%)] via-[hsl(217,90%,55%)] to-[hsl(217,90%,35%)]" />
            <div className="relative p-7">
              <button
                onClick={() => setSaleCompleteData(null)}
                className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all"
                aria-label="Sluit"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex justify-center mb-5">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 220, delay: 0.08 }} className="relative">
                  <div className="w-[72px] h-[72px] rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9 text-green-400" />
                  </div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.32, type: 'spring', stiffness: 260, damping: 16 }} className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <h2 className="text-xl font-bold text-white text-center mb-0.5">Verkoop Voltooi</h2>
                <p className="text-gray-500 text-sm text-center mb-5">Transaksie suksesvol verwerk</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="bg-[hsl(217,90%,40%)]/10 border border-[hsl(217,90%,40%)]/20 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">Totale Bedrag</p>
                    <p className="text-3xl font-bold text-white">R{saleCompleteData.sale.total}</p>
                    {saleCompleteData.customer?.name && <p className="text-gray-400 text-xs mt-0.5">{saleCompleteData.customer.name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">Metode</p>
                    <p className="text-white text-sm font-semibold capitalize">{saleCompleteData.sale.paymentType || 'Kontant'}</p>
                    {(() => {
                      try {
                        const items = Array.isArray(saleCompleteData.sale.items) ? saleCompleteData.sale.items : JSON.parse(saleCompleteData.sale.items);
                        return <p className="text-gray-500 text-[11px] mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>;
                      } catch { return null; }
                    })()}
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="grid grid-cols-2 gap-3 mb-2.5">
                <Button onClick={handleDownloadSaleReceiptAfr} disabled={receiptPdfBusy} className="h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all disabled:opacity-60">
                  {receiptPdfBusy ? <Loader2 className="w-4 h-4 mr-2 shrink-0 animate-spin" /> : <Download className="w-4 h-4 mr-2 shrink-0" />}
                  {receiptPdfBusy ? 'Berei voor...' : 'Aflaai'}
                </Button>
                <Button onClick={handleShareSaleReceiptAfr} disabled={receiptPdfBusy} className="h-11 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,45%)] text-white font-semibold border-0 rounded-xl shadow-lg shadow-blue-900/30 transition-all disabled:opacity-60">
                  {receiptPdfBusy ? <Loader2 className="w-4 h-4 mr-2 shrink-0 animate-spin" /> : <Share2 className="w-4 h-4 mr-2 shrink-0" />}
                  {receiptPdfBusy ? 'Berei voor...' : 'Deel'}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Welcome Toast Popup */}
      {showWelcomeToast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-[100]"
        >
          <div className="relative max-w-sm md:max-w-none mx-auto md:mx-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/30 via-[hsl(217,90%,50%)]/20 to-[hsl(217,90%,40%)]/30 rounded-xl md:rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-xl md:rounded-2xl px-4 py-3 md:px-8 md:py-5 shadow-2xl shadow-blue-900/40 border border-gray-600/50 md:min-w-[320px] overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl md:rounded-2xl"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              />
              <button
                onClick={() => setShowWelcomeToast(false)}
                className="absolute top-2 right-2 md:top-3 md:right-3 p-1 md:p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all z-20"
                data-testid="button-close-welcome-toast-af"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
              <div className="flex items-center gap-3 md:gap-4 relative z-10 pr-6">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <User className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm font-medium">Welkom terug,</p>
                  <h3 className="text-white text-sm md:text-lg font-semibold truncate">{currentUser?.companyName || "Demo Rekening"}</h3>
                </div>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,55%)] rounded-b-2xl"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                onAnimationComplete={() => setShowWelcomeToast(false)}
              />
            </div>
          </div>
        </motion.div>
      )}
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <img src={stormLogo} alt="Storm POS" className="h-12 w-auto" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                data-testid="button-close-mobile-menu-af"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {[
                { id: 'verkope', label: 'Verkope', icon: ShoppingCart },
                { id: 'produkte', label: 'Produkte', icon: Package },
                { id: 'kliente', label: 'Kliente', icon: Users },
                { id: 'fakturen', label: 'Fakture & Kwotasies', icon: Receipt },
                { id: 'aankoopbestellings', label: 'Aankoopbestellings', icon: ClipboardList },
                { id: 'oop-rekeninge', label: 'Oop Rekeninge', icon: FileText },
                { id: 'verslae', label: 'Verslae', icon: BarChart3 },
                { id: 'gebruik', label: 'Gebruik & Fakturering', icon: CreditCard },
                { id: 'instellings', label: 'Instellings', icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                    currentTab === item.id
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  data-testid={`menu-item-${item.id}-af`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${currentTab === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
                  <span>{item.label}</span>
                  {currentTab === item.id && <Check className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-gray-100 space-y-1 sidebar-bottom-safe">
              {/* Gebruiker-wisselaar knoppie */}
              <button
                onClick={() => setMobileStaffPickerOpen(prev => !prev)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-inner flex-shrink-0">
                  {currentUser?.companyLogo ? (
                    <img src={currentUser.companyLogo} alt="" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-400 leading-tight block">Aangemeld as</span>
                  <span className="text-sm font-semibold text-gray-900 leading-tight truncate block">{currentStaff ? currentStaff.username : 'Kies Gebruiker'}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${mobileStaffPickerOpen ? 'rotate-180' : ''}`} />
              </button>
              {/* Personeellys */}
              {mobileStaffPickerOpen && (
                <div className="mx-1 mb-1 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  {staffAccounts.length === 0 ? (
                    <p className="text-xs text-gray-400 px-3 py-2.5">Geen personeelrekeninge bygevoeg nie.</p>
                  ) : (
                    staffAccounts.map((staff) => {
                      const isCurrent = currentStaff?.id === staff.id;
                      return (
                        <button
                          key={staff.id}
                          onClick={() => {
                            if (!isCurrent) {
                              setMobileStaffPickerOpen(false);
                              setIsMobileMenuOpen(false);
                              setSelectedStaffForAuth(staff);
                              setIsStaffPasswordDialogOpen(true);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-all ${
                            isCurrent ? 'bg-[hsl(217,90%,40%)]/8 cursor-default' : 'hover:bg-gray-100 cursor-pointer'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isCurrent ? 'bg-[hsl(217,90%,40%)] text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {staff.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`font-medium block truncate ${isCurrent ? 'text-[hsl(217,90%,40%)]' : 'text-gray-700'}`}>{staff.username}</span>
                            <span className="text-[10px] text-gray-400 capitalize">{staff.userType === 'management' ? 'Bestuur' : 'Personeel'}</span>
                          </div>
                          {isCurrent && <Check className="h-3.5 w-3.5 text-[hsl(217,90%,40%)] flex-shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
              {/* Kennisgewings-klokkie */}
              <button
                onClick={() => { setIsMobileMenuOpen(false); setNotifOpen(o => !o); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <div className="relative flex-shrink-0">
                  <Bell className="h-5 w-5" />
                  {!currentUser?.tutorialCompleted && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center leading-none">1</span>
                  )}
                </div>
                <span>Kennisgewings</span>
              </button>
              {/* Teken uit */}
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsLogoutDialogOpen(true); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                data-testid="menu-item-logout-af"
              >
                <LogOut className="h-5 w-5" />
                <span>Teken Uit</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
      {/* Kennisgewings Paneel */}
      {notifOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setNotifOpen(false)}>
          <div
            className="fixed top-16 right-3 md:top-auto md:bottom-32 md:left-72 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                <p className="font-semibold text-gray-900 text-sm">Kennisgewings</p>
              </div>
              <button onClick={() => setNotifOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2">
              {!currentUser?.tutorialCompleted ? (
                <button
                  onClick={() => { setNotifOpen(false); window.location.href = "/pos/onboarding"; }}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-[hsl(217,90%,40%)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ListChecks className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Voltooi jou rekeningopstelling</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">Laai jou logo op, voeg jou eerste produk by, en meer.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 group-hover:text-[hsl(217,90%,40%)] transition-colors" />
                </button>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <p className="text-sm font-medium text-gray-700">Alles op datum!</p>
                  <p className="text-xs text-gray-400">Jou rekening is volledig opgestel.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen relative z-10 pos-mobile-safe">
        <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 flex-col bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out overflow-visible ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className={`border-b border-gray-100 flex items-center ${sidebarCollapsed ? 'p-3 justify-center' : 'p-5'}`}>
            <img src={stormLogo} alt="Storm POS" className={`transition-all duration-300 ${sidebarCollapsed ? 'h-8 w-auto' : 'h-12 w-auto'}`} />
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {[
              { id: 'verkope', label: 'Verkope', icon: ShoppingCart },
              { id: 'produkte', label: 'Produkte', icon: Package },
              { id: 'kliente', label: 'Kliente', icon: Users },
              { id: 'fakturen', label: 'Fakture & Kwotasies', icon: Receipt },
              { id: 'aankoopbestellings', label: 'Aankoopbestellings', icon: ClipboardList },
              { id: 'oop-rekeninge', label: 'Oop Rekeninge', icon: FileText },
              { id: 'verslae', label: 'Verslae', icon: BarChart3 },
              { id: 'gebruik', label: 'Gebruik & Fakturering', icon: CreditCard },
              { id: 'instellings', label: 'Instellings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''} ${
                  currentTab === item.id
                    ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${currentTab === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className="px-3 py-2 space-y-1">
            <button
              onClick={() => setNotifOpen(o => !o)}
              title={sidebarCollapsed ? "Kennisgewings" : undefined}
              className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Bell className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Kennisgewings</span>}
              {!currentUser?.tutorialCompleted && (
                <span className={`${sidebarCollapsed ? 'absolute top-1.5 right-1.5' : 'ml-auto'} w-5 h-5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none flex-shrink-0`}>1</span>
              )}
            </button>
            <button
              onClick={() => window.location.href = '/pos/help/afrikaans'}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <HelpCircle className="h-5 w-5" />
              {!sidebarCollapsed && <span>Hulp</span>}
            </button>
          </div>
          <div className="p-3 border-t border-gray-100 space-y-2">
            <motion.div
              animate={highlightStaffButton ? {
                scale: [1, 1.02, 1, 1.02, 1],
                boxShadow: [
                  "0 0 0 0px rgba(59, 130, 246, 0)",
                  "0 0 0 4px rgba(59, 130, 246, 0.3)",
                  "0 0 0 4px rgba(59, 130, 246, 0)",
                  "0 0 0 4px rgba(59, 130, 246, 0.3)",
                  "0 0 0 0px rgba(59, 130, 246, 0)"
                ]
              } : {}}
              transition={{ duration: 0.8, repeat: highlightStaffButton ? 5 : 0, repeatType: "loop" }}
              className={highlightStaffButton ? "rounded-xl" : ""}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left hover:bg-gray-100 transition-all ${highlightStaffButton ? 'ring-2 ring-[hsl(217,90%,50%)] ring-opacity-70' : ''}`}
                    data-testid="staff-dropdown"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-inner flex-shrink-0">
                      {currentUser?.companyLogo ? (
                        <img src={currentUser.companyLogo} alt="" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-400 leading-tight block">Aangemeld as</span>
                        <span className="text-sm font-semibold text-gray-900 leading-tight truncate block">{currentStaff ? currentStaff.username : 'Kies Gebruiker'}</span>
                      </div>
                    )}
                    {!sidebarCollapsed && currentStaff && (
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 ${currentStaff.userType === 'management' ? 'bg-[hsl(217,90%,40%)] text-white border-0' : 'bg-gray-600 text-white border-0'}`}>
                        {currentStaff.userType === 'management' ? 'Bestuur' : 'Personeel'}
                      </Badge>
                    )}
                    {!sidebarCollapsed && <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-72 p-0 bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700/50 shadow-2xl shadow-black/50 rounded-xl overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-[hsl(217,30%,18%)] to-[hsl(217,30%,15%)] px-4 py-3 border-b border-gray-700/50">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Span Lede</span>
                    </div>
                  </div>
                  <div className="py-2 max-h-[300px] overflow-y-auto">
                    {staffAccounts.map((staff) => {
                      const isCurrentUser = currentStaff?.id === staff.id;
                      return (
                        <button
                          key={staff.id}
                          onClick={() => {
                            if (!isCurrentUser) {
                              setCurrentStaff(null);
                              setSelectedStaffForAuth(staff);
                              setIsStaffPasswordDialogOpen(true);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 ${
                            isCurrentUser 
                              ? 'bg-[hsl(217,90%,40%)]/10 cursor-default' 
                              : 'hover:bg-gray-700/50 cursor-pointer'
                          }`}
                        >
                          <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl ${
                            staff.userType === 'management'
                              ? 'bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)]'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                          } shadow-lg`}>
                            <User className="h-5 w-5 text-white" />
                            {isCurrentUser && (
                              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[hsl(217,90%,50%)] rounded-full border-2 border-gray-900 shadow-lg shadow-blue-500/50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold truncate ${isCurrentUser ? 'text-[hsl(217,90%,60%)]' : 'text-white'}`}>
                                {staff.displayName || staff.username}
                              </span>
                              {isCurrentUser && (
                                <Badge className="text-[10px] px-1.5 py-0 h-4 bg-[hsl(217,90%,40%)] text-white border-0">
                                  Aktief
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {staff.userType === 'management' ? 'Bestuur' : 'Personeel'}
                            </div>
                          </div>
                          {!isCurrentUser && (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      );
                    })}
                    {staffAccounts.length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Geen gebruikers nie</p>
                      </div>
                    )}
                  </div>
                  {(currentStaff?.userType === 'management' || staffAccounts.length === 0) && (
                    <div className="border-t border-gray-700/50 p-2 bg-gray-900/50">
                      <button
                        onClick={() => setIsUserManagementOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-[hsl(217,90%,40%)]/20 transition-colors group"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(217,90%,40%)]/20 group-hover:bg-[hsl(217,90%,40%)]/30">
                          <UserPlus className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                        </div>
                        <span className="text-sm text-[hsl(217,90%,50%)] font-medium">Voeg Nuwe Gebruiker By</span>
                      </button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span>Teken Uit</span>}
            </button>
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 bg-[hsl(217,90%,40%)] border-2 border-[hsl(217,90%,50%)] rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:bg-[hsl(217,90%,35%)] hover:shadow-blue-500/50 hover:scale-110 transition-all duration-200 z-50"
          >
            <ChevronLeft className={`h-4 w-4 text-white transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </aside>

        <main className={`flex-1 min-h-screen min-w-0 overflow-x-hidden w-full transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          <div className="md:hidden flex items-center gap-3 px-3 pb-3 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm mobile-header-safe">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 touch-action-manipulation">
              <Menu className="h-6 w-6" />
            </button>
            <img src={stormLogo} alt="Storm POS" className="h-8 w-auto" />
            <div className="ml-auto flex items-center gap-2">
              <span className="text-gray-900 text-sm font-semibold capitalize">{currentTab === 'verkope' ? 'Verkope' : currentTab === 'produkte' ? 'Produkte' : currentTab === 'kliente' ? 'Kliente' : currentTab === 'fakturen' ? 'Fakture' : currentTab === 'aankoopbestellings' ? 'Bestellings' : currentTab === 'oop-rekeninge' ? 'Rekeninge' : currentTab === 'verslae' ? 'Verslae' : currentTab === 'gebruik' ? 'Gebruik' : 'Instellings'}</span>
            </div>
          </div>

          {currentUser && currentUser.paymentPlan === 'percent' && (currentUser.planSavingAmount ?? 0) > 0 && (
            <UpsellBanner
              userId={currentUser.id}
              userEmail={currentUser.email}
              planSavingAmount={currentUser.planSavingAmount!}
              language="af"
              onSwitched={(u) => setCurrentUser(prev => prev ? { ...prev, ...(u as typeof prev) } : prev)}
            />
          )}

          <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 overflow-x-hidden content-bottom-safe">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">

          {/* Sales Tab */}
          <TabsContent value="verkope">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="w-full">
              <div className="w-full bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                <div className="flex flex-col lg:flex-row w-full">
                  <div className="flex-1 min-w-0 lg:border-r border-gray-700/30">
                    <div className="px-3 py-3 sm:px-5 sm:py-4 border-b border-gray-700/30 bg-gray-800/30">
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(217,90%,40%)]/15 flex-shrink-0">
                            <Package className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white">Produkte</h3>
                            <p className="text-xs text-gray-500">{products.length} beskikbaar</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {categories.length > 0 && (
                            <Select value={salesDisplayMode} onValueChange={(value: 'grid' | 'tabs') => { setSalesDisplayMode(value); if (value === 'grid') setSelectedSalesCategory(null); if (value === 'tabs') setSalesCategoryFilter('all'); }}>
                              <SelectTrigger className="w-[90px] sm:w-[120px] h-8 text-xs bg-gray-900/50 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid"><span className="flex items-center gap-1.5"><Grid3X3 className="w-3 h-3" /> Rooster</span></SelectItem>
                                <SelectItem value="tabs"><span className="flex items-center gap-1.5"><LayoutList className="w-3 h-3" /> Oortjies</span></SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Select value={productSortOrder} onValueChange={(value: typeof productSortOrder) => setProductSortOrder(value)}>
                            <SelectTrigger className="w-[100px] sm:w-[140px] h-8 text-xs bg-gray-900/50 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name-asc">Naam A-Z</SelectItem>
                              <SelectItem value="name-desc">Naam Z-A</SelectItem>
                              <SelectItem value="sku-asc">SKU A-Z</SelectItem>
                              <SelectItem value="sku-desc">SKU Z-A</SelectItem>
                              <SelectItem value="price-asc">Prys Laag-Hoog</SelectItem>
                              <SelectItem value="price-desc">Prys Hoog-Laag</SelectItem>
                              <SelectItem value="stock-asc">Voorraad Laag-Hoog</SelectItem>
                              <SelectItem value="stock-desc">Voorraad Hoog-Laag</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Soek produkte..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-900/40 border-gray-600/50 text-white placeholder:text-gray-500 h-9" />
                      </div>
                      {salesDisplayMode === 'tabs' && categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button onClick={() => setSalesCategoryFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${salesCategoryFilter === 'all' ? 'bg-[hsl(217,90%,40%)] text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>Alles</button>
                          {categories.map((cat) => (
                            <button key={cat.id} onClick={() => setSalesCategoryFilter(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${salesCategoryFilter === cat.id ? 'text-white shadow-lg' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'}`} style={salesCategoryFilter === cat.id ? { backgroundColor: cat.color || '#3b82f6' } : {}}>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-3 sm:px-5 sm:py-4 border-b border-[hsl(217,90%,40%)]/20 bg-gradient-to-r from-[hsl(217,90%,40%)]/5 to-transparent">
                      <h2 className="text-lg sm:text-2xl font-bold tracking-tight md:text-[35px] md:leading-[1.2] text-[#000000]">Kies 'n produk om te begin verkoop</h2>
                      <div className="w-16 h-1 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,60%)] rounded-full mt-2"></div>
                    </div>
                    <div className="relative">
                    <div
                      data-testid="product-selection-card"
                      ref={productListRef}
                      onScroll={handleProductScroll}
                      className="p-2 sm:p-4 max-h-[50vh] lg:max-h-[calc(100vh-320px)] overflow-y-auto pr-4 sm:pr-5"
                    >
                      {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] flex items-center justify-center shadow-xl shadow-blue-500/30 mb-5">
                            <PlusCircle className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">Voeg jou eerste produk by</h3>
                          <p className="text-sm text-gray-400 text-center max-w-xs mb-5">Gaan na die Produkvoorraad-oortjie om produkte by te voeg wat jy wil verkoop</p>
                          <Button
                            onClick={() => setCurrentTab('produkte')}
                            className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                          >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Voeg Produk By
                          </Button>
                        </div>
                      ) : salesDisplayMode === 'grid' && categories.length > 0 && selectedSalesCategory === null ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div onClick={() => { setSalesDisplayMode('tabs'); setSalesCategoryFilter('all'); }} className="p-4 rounded-xl border border-gray-600/50 bg-gradient-to-br from-gray-700/30 to-gray-800/30 hover:border-gray-500 hover:bg-gray-700/40 cursor-pointer transition-all group">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-11 h-11 rounded-xl bg-gray-600/40 flex items-center justify-center group-hover:scale-110 transition-transform"><Package className="w-5 h-5 text-gray-300" /></div>
                              <span className="font-medium text-white text-sm">Alle Produkte</span>
                              <span className="text-xs text-gray-400">{products.length} items</span>
                            </div>
                          </div>
                          {categories.map((cat) => (
                            <div key={cat.id} onClick={() => { setSelectedSalesCategory(cat.id); }} className="p-4 rounded-xl border border-gray-600/50 bg-gradient-to-br from-gray-700/30 to-gray-800/30 hover:border-gray-500 hover:bg-gray-700/40 cursor-pointer transition-all group" style={{ borderColor: `${cat.color}30` }}>
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${cat.color}30` }}><Folder className="w-5 h-5" style={{ color: cat.color || '#3b82f6' }} /></div>
                                <span className="font-medium text-white text-sm">{cat.name}</span>
                                <span className="text-xs text-gray-400">{products.filter(p => p.categoryId === cat.id).length} items</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : salesDisplayMode === 'grid' && selectedSalesCategory !== null ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <button onClick={() => setSelectedSalesCategory(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" />Terug na Kategoriee</button>
                            <Button size="sm" onClick={() => { setSelectedProductsForCategory(products.filter(p => p.categoryId === selectedSalesCategory).map(p => p.id)); setIsAddProductsToCategoryOpen(true); }} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white text-xs"><Plus className="w-3 h-3 mr-1" />Voeg Produkte By</Button>
                          </div>
                          <div className="flex items-center gap-3 py-2 border-b border-gray-700/50">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categories.find(c => c.id === selectedSalesCategory)?.color || '#3b82f6'}30` }}><Folder className="w-4 h-4" style={{ color: categories.find(c => c.id === selectedSalesCategory)?.color || '#3b82f6' }} /></div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{categories.find(c => c.id === selectedSalesCategory)?.name || 'Kategorie'}</h3>
                              <p className="text-xs text-gray-400">{products.filter(p => p.categoryId === selectedSalesCategory).length} produkte</p>
                            </div>
                          </div>
                          <div className="grid gap-1">
                            {products.filter(p => p.categoryId === selectedSalesCategory).map((product) => (
                              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-150 border border-transparent hover:border-gray-700/50" onClick={() => addToSale(product)}>
                                <div>
                                  <p className="font-medium text-white text-sm">{product.name}</p>
                                  <p className="text-xs text-gray-500">SKU: {product.sku} · Voorraad: {product.quantity}</p>
                                </div>
                                <p className="font-semibold text-[hsl(217,90%,60%)] text-sm">R{getProductPrice(product, selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.customerType || 'retail' : 'retail')}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-1">
                          {filteredSalesProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-150 border border-transparent hover:border-gray-700/50" onClick={() => addToSale(product)}>
                              <div>
                                <p className="font-medium text-white text-sm">{product.name}</p>
                                <p className="text-xs text-gray-500">SKU: {product.sku} · Voorraad: {product.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-[hsl(217,90%,60%)] text-sm">R{getProductPrice(product, selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.customerType || 'retail' : 'retail')}</p>
                                {product.tradePrice && (
                                  <p className="text-xs text-gray-500">{selectedCustomerId && customers.find(c => c.id === selectedCustomerId)?.customerType === 'trade' ? `Kleinhandel: R${product.retailPrice}` : `Groothandel: R${product.tradePrice}`}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className="md:hidden absolute right-1 top-1 bottom-1 w-[5px] rounded-full overflow-hidden"
                      style={{ pointerEvents: 'none', background: 'rgba(255,255,255,0.07)' }}
                    >
                      <div
                        className="absolute w-full bg-[hsl(217,90%,40%)] rounded-full"
                        style={{ top: `${productScrollThumb.top}px`, height: `${productScrollThumb.height}px` }}
                      />
                    </div>
                    </div>
                  </div>
                  <div data-testid="current-sale-card" className={`w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto ${posTheme === 'dark' ? 'bg-[hsl(217,20%,11%)]/60' : 'bg-white'}`}>
                    <div className={`px-3 py-3 sm:px-5 sm:py-4 border-b ${posTheme === 'dark' ? 'border-gray-700/30 bg-[hsl(217,25%,13%)]/50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/20"><ShoppingCart className="h-4 w-4 text-white" /></div>
                          <div>
                            <h3 className="text-sm font-semibold text-white">Huidige Verkoop</h3>
                            <p className="text-xs text-gray-500">{currentSale.length === 0 ? 'Geen items nog nie' : `${currentSale.reduce((acc, item) => acc + item.quantity, 0)} items`}</p>
                          </div>
                        </div>
                        {currentSale.length > 0 && <span className="text-lg font-bold text-[hsl(217,90%,60%)]">R{calculateTotal()}</span>}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="space-y-2 max-h-40 sm:max-h-52 overflow-y-auto">
                        {currentSale.length === 0 ? (
                          <div className="text-center py-8 text-gray-500"><ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Tik op 'n produk om te begin</p></div>
                        ) : currentSale.map((item) => (
                          <div key={item.productId} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-800/40 border border-gray-700/30">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">R{item.price} × {item.quantity} = R{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700" onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                              <span className="w-7 text-center text-white text-sm font-medium">{item.quantity}</span>
                              <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700" onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-1" onClick={() => updateQuantity(item.productId, 0)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3 pt-3 border-t border-gray-700/30">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-gray-400 mb-1 block">Klient</Label>
                            <Select value={selectedCustomerId?.toString() || "none"} onValueChange={(value) => setSelectedCustomerId(value === "none" ? null : parseInt(value))}>
                              <SelectTrigger className="h-9 text-xs bg-gray-900/40 border-gray-700/50 text-white"><SelectValue placeholder="Geen klient" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Geen klient</SelectItem>
                                {customers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id.toString()}>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{customer.name}</span>
                                      <span className={`text-xs px-1 rounded ${customer.customerType === 'trade' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>{customer.customerType === 'trade' ? 'Groothandel' : 'Kleinhandel'}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400 mb-1 block">Betaling</Label>
                            <Select value={paymentType} onValueChange={setPaymentType}>
                              <SelectTrigger className="h-9 text-xs bg-gray-900/40 border-gray-700/50 text-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kontant">Kontant</SelectItem>
                                <SelectItem value="kaart">Kaart</SelectItem>
                                <SelectItem value="eft">EFT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400 mb-1 block">Notas</Label>
                          <Textarea value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} placeholder="Verkoop notas..." rows={1} className="bg-gray-900/40 border-gray-700/50 text-white text-xs placeholder:text-gray-600 resize-none" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400 mb-1.5 block">Afslag</Label>
                          <div className="flex flex-wrap gap-1.5 touch-action-manipulation">
                            {[0, 5, 10, 20, 50].map((percentage) => (
                              <Button key={percentage} type="button" size="sm" variant={discountPercentage === percentage ? "default" : "outline"} onClick={() => setDiscountPercentage(percentage)} className={`h-9 sm:h-7 text-xs px-3 sm:px-2.5 ${discountPercentage === percentage ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] border-0" : "border-gray-700/50 text-gray-400 hover:text-white"}`}>{percentage === 0 ? "Geen" : `${percentage}%`}</Button>
                            ))}
                            <div className="flex items-center gap-1 ml-1">
                              <Input type="number" min="0" max="100" step="1" placeholder="0" value={discountPercentage || ""} onChange={(e) => { const inputVal = e.target.value; if (inputVal === "") { setDiscountPercentage(0); } else { setDiscountPercentage(Math.min(100, Math.max(0, parseInt(inputVal) || 0))); } }} className="w-14 h-9 sm:h-7 text-center text-xs bg-gray-900/40 border-gray-700/50 text-white" />
                              <span className="text-xs text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-400">Fooi op kwitansie</Label>
                          <button type="button" onClick={() => setTipOptionEnabled(!tipOptionEnabled)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${tipOptionEnabled ? 'bg-[hsl(217,90%,40%)]' : 'bg-gray-600'}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${tipOptionEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-700/30 space-y-1.5">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotaal</span><span className="text-white">R{calculateSubtotal().toFixed(2)}</span></div>
                        {discountPercentage > 0 && <div className="flex justify-between text-sm text-green-400"><span>Afslag ({discountPercentage}%)</span><span>-R{calculateDiscount().toFixed(2)}</span></div>}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-600/30">
                          <span className="text-base font-bold text-white">Totaal</span>
                          <span className="text-xl font-bold text-[hsl(217,90%,50%)]">R{calculateTotal()}</span>
                        </div>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-gray-700/30">
                        <div className="flex flex-wrap gap-1.5">
                          <Button type="button" size="sm" variant={checkoutOption === 'open-account' ? "default" : "outline"} onClick={() => setCheckoutOption(checkoutOption === 'open-account' ? 'complete' : 'open-account')} className={`flex-1 h-10 sm:h-8 text-xs ${checkoutOption === 'open-account' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] border-0 text-white" : "border-gray-700/50 text-gray-400"}`}><FileText className="h-3.5 w-3.5 mr-1.5" />Oop Rekening</Button>
                          <Button type="button" size="sm" variant={checkoutOption === 'add-to-account' ? "default" : "outline"} onClick={() => setCheckoutOption(checkoutOption === 'add-to-account' ? 'complete' : 'add-to-account')} disabled={openAccounts.length === 0} className={`flex-1 h-10 sm:h-8 text-xs ${checkoutOption === 'add-to-account' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] border-0 text-white" : "border-gray-700/50 text-gray-400"}`}><Plus className="h-3.5 w-3.5 mr-1.5" />Voeg by Rekening</Button>
                        </div>
                        {checkoutOption === 'add-to-account' && (
                          <div>
                            <Label className="text-xs text-gray-400 mb-1 block">Kies Oop Rekening</Label>
                            <Select value={selectedOpenAccountId?.toString() || ""} onValueChange={(value) => setSelectedOpenAccountId(value ? parseInt(value) : null)}>
                              <SelectTrigger className="h-9 text-xs bg-gray-900/40 border-gray-700/50 text-white"><SelectValue placeholder="Kies 'n oop rekening" /></SelectTrigger>
                              <SelectContent>
                                {openAccounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id.toString()}>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2"><span className="font-medium">{account.accountName}</span><Badge variant={account.accountType === 'table' ? 'default' : 'outline'} className="text-xs">{account.accountType === 'table' ? 'Tafel' : 'Klient'}</Badge></div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>Huidig: R{account.total}</span><span>·</span><span>{Array.isArray(account.items) ? account.items.length : 0} items</span></div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <Button className="w-full h-12 sm:h-10 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold shadow-lg shadow-blue-900/30" onClick={() => checkoutMutation.mutate()} disabled={currentSale.length === 0 || checkoutMutation.isPending || (checkoutOption === 'add-to-account' && !selectedOpenAccountId)}>
                          {checkoutOption === 'complete' ? (<><Receipt className="h-4 w-4 mr-2" />{checkoutMutation.isPending ? "Verwerk..." : "Voltooi Verkoop"}</>) : checkoutOption === 'open-account' ? (<><FileText className="h-4 w-4 mr-2" />{checkoutMutation.isPending ? "Verwerk..." : "Skep Oop Rekening"}</>) : (<><Plus className="h-4 w-4 mr-2" />{checkoutMutation.isPending ? "Verwerk..." : "Voeg by Rekening"}</>)}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="produkte">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="relative group"
                >
                  {posTheme === 'dark' && <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>}
                  <div className={`relative rounded-xl p-4 transition-all duration-300 ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-[hsl(217,90%,40%)]/50' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[hsl(217,90%,40%)]/40'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Totaal Produkte</p>
                        <p className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{products.length}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative group"
                >
                  {posTheme === 'dark' && <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>}
                  <div className={`relative rounded-xl p-4 transition-all duration-300 ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-green-500/50' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-green-400/40'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>In Voorraad</p>
                        <p className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{products.filter(p => p.quantity > 5).length}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative group"
                >
                  {posTheme === 'dark' && <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>}
                  <div className={`relative rounded-xl p-4 transition-all duration-300 ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-amber-500/50' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-400/40'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Lae Voorraad</p>
                        <p className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{products.filter(p => p.quantity <= 5 && p.quantity > 0).length}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative group"
                >
                  {posTheme === 'dark' && <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>}
                  <div className={`relative rounded-xl p-4 transition-all duration-300 ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-red-500/50' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-red-400/40'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Uit Voorraad</p>
                        <p className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{products.filter(p => p.quantity === 0).length}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Main Products Card */}
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-blue-900/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/5 via-transparent to-[hsl(217,90%,40%)]/5"></div>
                <CardHeader className={`relative border-b border-white/10 pb-4 ${posTheme === 'dark' ? 'bg-[#000000]' : 'bg-white'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl font-bold">Produkvoorraad</CardTitle>
                        <p className="text-gray-400 text-sm">Bestuur jou produkkatalogus</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200">
                            <SlidersHorizontal className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                            Filters
                            <ChevronDown className="h-3 w-3 ml-2 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-gray-950 border border-[hsl(217,90%,40%)]/30 shadow-xl shadow-black/50 p-1" align="start">
                          <div className="px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(217,90%,50%)]">Sorteer Volgens</p>
                          </div>
                          {[
                            { value: 'name-asc', label: 'Naam A-Z' },
                            { value: 'name-desc', label: 'Naam Z-A' },
                            { value: 'sku-asc', label: 'SKU A-Z' },
                            { value: 'sku-desc', label: 'SKU Z-A' },
                            { value: 'price-asc', label: 'Prys Laag-Hoog' },
                            { value: 'price-desc', label: 'Prys Hoog-Laag' },
                            { value: 'stock-asc', label: 'Voorraad Laag-Hoog' },
                            { value: 'stock-desc', label: 'Voorraad Hoog-Laag' },
                          ].map((item) => (
                            <DropdownMenuItem
                              key={item.value}
                              onClick={() => setInventorySortOrder(item.value as typeof inventorySortOrder)}
                              className={`text-sm rounded-md transition-colors ${inventorySortOrder === item.value ? 'bg-[hsl(217,90%,40%)]/20 text-[hsl(217,90%,60%)]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                            >
                              {inventorySortOrder === item.value && <Check className="h-3 w-3 mr-2 text-[hsl(217,90%,50%)]" />}
                              {inventorySortOrder !== item.value && <span className="w-5" />}
                              {item.label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator className="bg-[hsl(217,90%,40%)]/20 my-1" />
                          <div className="px-3 py-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(217,90%,50%)]">Kategorie</p>
                          </div>
                          <DropdownMenuItem
                            onClick={() => setProductCategoryFilter('all')}
                            className={`text-sm rounded-md transition-colors ${productCategoryFilter === 'all' ? 'bg-[hsl(217,90%,40%)]/20 text-[hsl(217,90%,60%)]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                          >
                            {productCategoryFilter === 'all' && <Check className="h-3 w-3 mr-2 text-[hsl(217,90%,50%)]" />}
                            {productCategoryFilter !== 'all' && <span className="w-5" />}
                            Alle Kategoriee
                          </DropdownMenuItem>
                          {categories.map((cat) => (
                            <DropdownMenuItem
                              key={cat.id}
                              onClick={() => setProductCategoryFilter(cat.id)}
                              className={`text-sm rounded-md transition-colors ${productCategoryFilter === cat.id ? 'bg-[hsl(217,90%,40%)]/20 text-[hsl(217,90%,60%)]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                            >
                              {productCategoryFilter === cat.id && <Check className="h-3 w-3 mr-2 text-[hsl(217,90%,50%)]" />}
                              {productCategoryFilter !== cat.id && <span className="w-5" />}
                              <div className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                              {cat.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                            Invoer / Uitvoer
                            <ChevronDown className="h-3 w-3 ml-2 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-52 bg-gray-950 border border-[hsl(217,90%,40%)]/30 shadow-xl shadow-black/50 p-1" align="start">
                          <DropdownMenuItem onClick={handleExportProducts} className="text-gray-200 hover:bg-[hsl(217,90%,40%)]/10 hover:text-white rounded-md">
                            <Download className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                            Uitvoer na Excel
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[hsl(217,90%,40%)]/20 my-1" />
                          <DropdownMenuItem 
                            className="text-gray-200 hover:bg-[hsl(217,90%,40%)]/10 hover:text-white cursor-pointer rounded-md"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <label className="cursor-pointer flex items-center w-full">
                              <Upload className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                              Invoer met Excel
                              <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'products')}
                              />
                            </label>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[hsl(217,90%,40%)]/20 my-1" />
                          <DropdownMenuItem 
                            onClick={() => setShowDeleteAllProductsConfirm(true)}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer rounded-md"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Verwyder Alle Produkte
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <AlertDialog open={showDeleteAllProductsConfirm} onOpenChange={setShowDeleteAllProductsConfirm}>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Verwyder Alle Produkte?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              Hierdie aksie kan nie ongedaan gemaak word nie. Alle {products?.length || 0} produkte sal permanent van jou voorraad verwyder word.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700">Kanselleer</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteAllProductsMutation.mutate()}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={deleteAllProductsMutation.isPending}
                            >
                              {deleteAllProductsMutation.isPending ? "Besig om te verwyder..." : "Verwyder Alles"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button 
                        onClick={() => openCategoryDialog()} 
                        variant="outline" 
                        size="sm"
                        className="h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200"
                      >
                        <FolderPlus className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                        Kategoriee
                      </Button>
                      <Button onClick={() => openProductDialog()} className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Voeg Produk By
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={`px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-6 relative ${posTheme === 'dark' ? 'bg-[#000000]' : 'bg-white'}`}>
                  <div className="space-y-4">
                    {/* Enhanced Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/10 via-transparent to-[hsl(217,90%,40%)]/10 rounded-xl blur-lg"></div>
                      <div className="relative flex items-center">
                        <Search className="absolute left-4 h-5 w-5 text-[hsl(217,90%,50%)]" />
                        <Input
                          placeholder="Soek produkte op naam of SKU..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="pl-12 h-12 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid gap-3 sm:gap-4 max-h-[500px] overflow-y-auto overflow-x-hidden">
                      {filteredProducts.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400">{productSearchTerm ? 'Geen produkte gevind wat ooreenstem met jou soektog nie.' : 'Geen produkte beskikbaar nie.'}</p>
                            {!productSearchTerm && (
                              <Button
                                onClick={() => openProductDialog()}
                                className="mt-2 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                              >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Voeg Produk By
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        filteredProducts.map((product, index) => (
                          <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group"
                          >
                            <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-xl p-3 sm:p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/0 via-[hsl(217,90%,40%)]/5 to-[hsl(217,90%,40%)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              
                              {/* Mobile Layout - shows on screens below 768px */}
                              <div className="relative block md:hidden space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)]/20 to-[hsl(217,90%,35%)]/20 border border-[hsl(217,90%,40%)]/30 flex-shrink-0">
                                      <Package className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                                    </div>
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-[hsl(217,90%,60%)] transition-colors">{product.name}</h3>
                                      <p className="text-[11px] text-gray-400 truncate">SKU: {product.sku}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openProductDialog(product)}
                                      className="h-7 w-7 p-0 border-gray-600/50 hover:border-[hsl(217,90%,40%)]/50 hover:bg-[hsl(217,90%,40%)]/10 transition-all"
                                    >
                                      <Edit className="h-3 w-3 text-gray-400" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="h-7 w-7 p-0 border-gray-600/50 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                                      disabled={deleteProductMutation.isPending}
                                    >
                                      <Trash2 className="h-3 w-3 text-gray-400" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-700/50">
                                  <div className="text-center">
                                    <p className="text-[9px] text-gray-500 uppercase">Kleinhandel</p>
                                    <p className="text-white font-bold text-xs">R{product.retailPrice}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-gray-500 uppercase">Kosprys</p>
                                    <p className="text-gray-400 font-medium text-xs">R{product.costPrice}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-gray-500 uppercase">Voorraad</p>
                                    <div className="flex items-center justify-center gap-0.5">
                                      <p className={`font-bold text-xs ${
                                        product.quantity === 0 ? 'text-red-400' :
                                        product.quantity <= 5 ? 'text-amber-400' : 'text-green-400'
                                      }`}>
                                        {product.quantity}
                                      </p>
                                      {product.quantity <= 5 && product.quantity > 0 && (
                                        <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 rounded-full">Laag</span>
                                      )}
                                      {product.quantity === 0 && (
                                        <span className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded-full">Uit</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop Layout - shows on screens 768px and above */}
                              <div className="relative hidden md:flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)]/20 to-[hsl(217,90%,35%)]/20 border border-[hsl(217,90%,40%)]/30 flex-shrink-0">
                                    <Package className="w-6 h-6 text-[hsl(217,90%,50%)]" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-white text-lg truncate group-hover:text-[hsl(217,90%,60%)] transition-colors">{product.name}</h3>
                                    <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Kosprys</p>
                                    <p className="text-gray-400 font-medium">R{product.costPrice}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Kleinhandel</p>
                                    <p className="text-white font-bold text-lg">R{product.retailPrice}</p>
                                  </div>
                                  {product.tradePrice && (
                                    <div className="text-right hidden lg:block">
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">Groothandel</p>
                                      <p className="text-[hsl(217,90%,60%)] font-medium">R{product.tradePrice}</p>
                                    </div>
                                  )}
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Voorraad</p>
                                    <div className="flex items-center gap-1">
                                      <p className={`font-bold ${
                                        product.quantity === 0 ? 'text-red-400' :
                                        product.quantity <= 5 ? 'text-amber-400' : 'text-green-400'
                                      }`}>
                                        {product.quantity}
                                      </p>
                                      {product.quantity <= 5 && product.quantity > 0 && (
                                        <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">Laag</span>
                                      )}
                                      {product.quantity === 0 && (
                                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">Uit</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openProductDialog(product)}
                                      className="h-9 w-9 p-0 border-gray-600/50 hover:border-[hsl(217,90%,40%)]/50 hover:bg-[hsl(217,90%,40%)]/10 transition-all"
                                    >
                                      <Edit className="h-4 w-4 text-gray-400 group-hover:text-[hsl(217,90%,50%)]" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="h-9 w-9 p-0 border-gray-600/50 hover:border-red-500/50 hover:bg-red-500/10 transition-all"
                                      disabled={deleteProductMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="kliente">
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Users className="h-5 w-5 text-[hsl(217,90%,40%)]" />
                    <span>Klientelys</span>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200">
                          <FileSpreadsheet className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                          Invoer / Uitvoer
                          <ChevronDown className="h-3 w-3 ml-2 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-52 bg-gray-950 border border-[hsl(217,90%,40%)]/30 shadow-xl shadow-black/50 p-1" align="start">
                        <DropdownMenuItem onClick={handleExportCustomers} className="text-gray-200 hover:bg-[hsl(217,90%,40%)]/10 hover:text-white rounded-md">
                          <Download className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                          Uitvoer na Excel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[hsl(217,90%,40%)]/20 my-1" />
                        <DropdownMenuItem 
                          className="text-gray-200 hover:bg-[hsl(217,90%,40%)]/10 hover:text-white cursor-pointer rounded-md"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <label className="cursor-pointer flex items-center w-full">
                            <Upload className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                            Invoer met Excel
                            <input
                              type="file"
                              accept=".xlsx,.xls,.csv"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, 'customers')}
                            />
                          </label>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={() => openCustomerDialog()} className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Voeg Klient By
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-5 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Filter Besteding op Datumreeks</p>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-gray-400 w-8 shrink-0">Van</label>
                      <input
                        type="date"
                        value={customerSpendFrom}
                        onChange={(e) => setCustomerSpendFrom(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="flex-1 h-8 rounded-md bg-gray-900 border border-white/20 text-white text-xs px-2 focus:outline-none focus:border-[hsl(217,90%,40%)]"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-gray-400 w-8 shrink-0">Tot</label>
                      <input
                        type="date"
                        value={customerSpendTo}
                        onChange={(e) => setCustomerSpendTo(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="flex-1 h-8 rounded-md bg-gray-900 border border-white/20 text-white text-xs px-2 focus:outline-none focus:border-[hsl(217,90%,40%)]"
                      />
                    </div>
                    {(customerSpendFrom || customerSpendTo) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setCustomerSpendFrom(""); setCustomerSpendTo(""); }}
                        className="h-8 px-2 text-gray-400 hover:text-white"
                      >
                        Vee Uit
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {customers.map((customer) => {
                    const spend = customerSpendMap[customer.id];
                    return (
                    <div key={customer.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-gray-700/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white">{customer.name}</h3>
                          <Badge variant={customer.customerType === 'trade' ? 'default' : 'outline'} className="text-xs text-[#ffffff]">
                            {customer.customerType === 'trade' ? 'Groothandel' : 'Kleinhandel'}
                          </Badge>
                          {spend !== undefined && (
                            <Badge className="bg-green-600/20 text-green-300 border border-green-500/30 text-xs">
                              Totale Besteding: R{spend.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        {customer.phone && <p className="text-sm text-gray-400">Telefoon: {customer.phone}</p>}
                        {customer.notes && <p className="text-sm text-gray-400 italic">{customer.notes}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCustomerDialog(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ); })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices & Quotes Tab */}
          <TabsContent value="fakturen">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <CardTitle className="text-white text-lg sm:text-xl font-bold">Fakture & Kwotasies</CardTitle>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Kolomsigbaarheid keusekys */}
                  <DropdownMenu open={isColumnMenuOpen} onOpenChange={setIsColumnMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 px-3 bg-black border-white/20 text-white hover:bg-white/10 transition-all duration-200">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Instellings
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-[#111] border border-white/20 text-white">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Veld Instellings</div>
                      {([
                        { key: 'dueDate', label: 'Vervaldatum' },
                        { key: 'clientEmail', label: 'Kliënt E-pos' },
                        { key: 'clientPhone', label: 'Kliënt Telefoon' },
                        { key: 'poNumber', label: 'PO Nommer' },
                        { key: 'dueTerms', label: 'Betalingsvoorwaardes' },
                        { key: 'paymentMethod', label: 'Betaalmetode' },
                        { key: 'notes', label: 'Notas' },
                        { key: 'discount', label: 'Afslag' },
                      ] as const).map(col => (
                        <DropdownMenuItem
                          key={col.key}
                          onSelect={(e) => { e.preventDefault(); toggleInvoiceColumn(col.key); }}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10"
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${invoiceCardColumns.has(col.key) ? 'bg-[hsl(217,90%,40%)] border-[hsl(217,90%,40%)]' : 'border-white/30'}`}>
                            {invoiceCardColumns.has(col.key) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm">{col.label}</span>
                        </DropdownMenuItem>
                      ))}
                      {invoiceCustomFieldDefs.length > 0 && (
                        <>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pasgemaakte Velde</div>
                          {invoiceCustomFieldDefs.map(field => (
                            <DropdownMenuItem
                              key={field.id}
                              onSelect={(e) => { e.preventDefault(); toggleInvoiceColumn(`cf_${field.id}`); }}
                              className="flex items-center gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${invoiceCardColumns.has(`cf_${field.id}`) ? 'bg-[hsl(217,90%,40%)] border-[hsl(217,90%,40%)]' : 'border-white/30'}`}>
                                {invoiceCardColumns.has(`cf_${field.id}`) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className="text-sm">{field.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        onSelect={(e) => { e.preventDefault(); const next = new Set(['dueDate','clientEmail','clientPhone','poNumber','dueTerms','paymentMethod','notes','discount']); setInvoiceCardColumns(next); try { const u = JSON.parse(localStorage.getItem('posUser') || 'null'); localStorage.setItem(`invoiceCardCols_${u?.id || 'guest'}`, JSON.stringify(Array.from(next))); } catch {} }}
                        className="text-xs text-gray-400 hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                      >Herstel na verstek</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleExportInvoices}
                    className="h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                    Uitvoer na Excel
                  </Button>
                  <Button 
                    onClick={() => setIsInvoiceDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 text-sm"
                    data-testid="button-create-invoice"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Skep Faktuur/Kwotasie
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={`pt-6 px-3 sm:px-6 ${posTheme === 'dark' ? 'bg-[#000000]' : 'bg-white'}`}>
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="w-full">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Soek op dokumentnommer of kliëntnaam..."
                          value={invoiceSearchQuery}
                          onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                          data-testid="input-invoice-search"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={invoiceTypeFilter} onValueChange={(value: any) => setInvoiceTypeFilter(value)}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white" data-testid="select-invoice-type-filter">
                          <SelectValue placeholder="Almal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Tipes</SelectItem>
                          <SelectItem value="invoice">Slegs Fakturen</SelectItem>
                          <SelectItem value="quote">Slegs Kwotasies</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={invoiceStatusFilter} onValueChange={(value: any) => setInvoiceStatusFilter(value)}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white" data-testid="select-invoice-status-filter">
                          <SelectValue placeholder="Alle Statusse" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Statusse</SelectItem>
                          <SelectItem value="paid">Betaal</SelectItem>
                          <SelectItem value="not_paid">Nie Betaal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Select value={invoiceSortOrder} onValueChange={(value: any) => setInvoiceSortOrder(value)}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-white text-sm">
                        <SelectValue placeholder="Sorteer Volgens" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Datum: Nuutste Eerste</SelectItem>
                        <SelectItem value="date-asc">Datum: Oudste Eerste</SelectItem>
                        <SelectItem value="name-asc">Klient: A-Z</SelectItem>
                        <SelectItem value="name-desc">Klient: Z-A</SelectItem>
                        <SelectItem value="amount-desc">Bedrag: Hoog-Laag</SelectItem>
                        <SelectItem value="amount-asc">Bedrag: Laag-Hoog</SelectItem>
                        <SelectItem value="number-asc">Dok Nommer: A-Z</SelectItem>
                        <SelectItem value="number-desc">Dok Nommer: Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-300 text-sm mb-1 block">Van Datum</Label>
                        <Input
                          type="date"
                          value={invoiceDateFrom}
                          onChange={(e) => setInvoiceDateFrom(e.target.value)}
                          className="bg-white/5 border-white/10 text-white w-full"
                          data-testid="input-invoice-date-from"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-sm mb-1 block">Tot Datum</Label>
                        <Input
                          type="date"
                          value={invoiceDateTo}
                          onChange={(e) => setInvoiceDateTo(e.target.value)}
                          className="bg-white/5 border-white/10 text-white w-full"
                          data-testid="input-invoice-date-to"
                        />
                      </div>
                    </div>
                    {(invoiceSearchQuery || invoiceStatusFilter !== 'all' || invoiceTypeFilter !== 'all' || invoiceDateFrom || invoiceDateTo || invoiceSortOrder !== 'date-desc') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInvoiceSearchQuery("");
                          setInvoiceStatusFilter('all');
                          setInvoiceTypeFilter('all');
                          setInvoiceDateFrom("");
                          setInvoiceDateTo("");
                          setInvoiceSortOrder('date-desc');
                        }}
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 w-full"
                        data-testid="button-clear-filters"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Maak Filters Skoon
                      </Button>
                    )}
                  </div>
                </div>

                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    {invoices.length === 0 ? (
                      <>
                        <p className="text-gray-400 text-lg mb-2">Geen fakturen of kwotasies nog nie</p>
                        <p className="text-gray-500 text-sm">Skep jou eerste faktuur of kwotasie om te begin</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-lg mb-2">Geen resultate gevind nie</p>
                        <p className="text-gray-500 text-sm">Probeer jou soek- of filterinstellings aanpas</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInvoices.map((invoice) => (
                      <motion.div
                        key={invoice.id}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsInvoiceViewOpen(true);
                        }}
                        data-testid={`invoice-card-${invoice.id}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <Badge 
                                variant={invoice.documentType === 'invoice' ? 'default' : 'outline'}
                                className={`text-xs sm:text-sm ${invoice.documentType === 'invoice' 
                                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' 
                                  : 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                                }`}
                              >
                                {invoice.documentType === 'invoice' ? 'Faktuur' : 'Kwotasie'}
                              </Badge>
                              <span className="text-white font-semibold text-sm sm:text-base truncate">{invoice.documentNumber}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingDocNumberInvoice(invoice);
                                  setNewDocumentNumber(invoice.documentNumber || '');
                                  setIsEditDocNumberDialogOpen(true);
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                                title="Wysig dokumentnommer"
                              >
                                <Edit className="w-3 h-3 text-gray-400 hover:text-white" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                              <span className="text-gray-300 text-xs sm:text-sm">Betaal</span>
                              <Switch
                                checked={invoice.status === 'paid'}
                                onCheckedChange={(checked) => {
                                  updateInvoiceStatusMutation.mutate({
                                    invoiceId: invoice.id,
                                    status: checked ? 'paid' : 'draft'
                                  });
                                }}
                                className="data-[state=checked]:bg-[hsl(217,90%,40%)] data-[state=unchecked]:bg-gray-600"
                              />
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm truncate">
                              Kliënt: {customers.find(c => c.id === invoice.clientId)?.name || invoice.clientName || 'N/A'}
                            </p>
                            {invoiceCardColumns.has('dueDate') && invoice.dueDate && (
                              <p className="text-gray-400 text-xs sm:text-sm">Vervaldatum: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                            )}
                            {invoiceCardColumns.has('clientEmail') && (invoice.clientEmail || customers.find(c => c.id === invoice.clientId)?.email) && (
                              <p className="text-gray-400 text-xs sm:text-sm truncate">E-pos: {invoice.clientEmail || customers.find(c => c.id === invoice.clientId)?.email}</p>
                            )}
                            {invoiceCardColumns.has('clientPhone') && (invoice.clientPhone || customers.find(c => c.id === invoice.clientId)?.phone) && (
                              <p className="text-gray-400 text-xs sm:text-sm">Telefoon: {invoice.clientPhone || customers.find(c => c.id === invoice.clientId)?.phone}</p>
                            )}
                            {invoiceCardColumns.has('poNumber') && invoice.poNumber && (
                              <p className="text-gray-400 text-xs sm:text-sm">PO: {invoice.poNumber}</p>
                            )}
                            {invoiceCardColumns.has('dueTerms') && invoice.dueTerms && (
                              <p className="text-gray-400 text-xs sm:text-sm">Voorwaardes: {invoice.dueTerms}</p>
                            )}
                            {invoiceCardColumns.has('paymentMethod') && invoice.paymentMethod && (
                              <p className="text-gray-400 text-xs sm:text-sm">Betaling: {invoice.paymentMethod}</p>
                            )}
                            {invoiceCardColumns.has('notes') && invoice.notes && (
                              <p className="text-gray-400 text-xs sm:text-sm truncate">Notas: {invoice.notes}</p>
                            )}
                            {invoiceCardColumns.has('discount') && (parseFloat(invoice.discountAmount || '0') > 0 || parseFloat(invoice.discountPercent || '0') > 0) && (
                              <p className="text-gray-400 text-xs sm:text-sm">
                                Afslag: {invoice.discountType === 'percent' ? `${invoice.discountPercent}%` : `R${parseFloat(invoice.discountAmount || '0').toFixed(2)}`}
                              </p>
                            )}
                            {invoiceCustomFieldDefs.filter(f => invoiceCardColumns.has(`cf_${f.id}`)).map(field => {
                              const val = (invoice.customFieldValues as any)?.[`cf_${field.id}`];
                              return val ? (
                                <p key={field.id} className="text-gray-400 text-xs sm:text-sm truncate">{field.label}: {val}</p>
                              ) : null;
                            })}
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="text-white font-bold text-base sm:text-lg">
                              R{typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          {/* Aankoopbestellings Tab */}
          <TabsContent value="aankoopbestellings">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`border-gray-800 shadow-2xl ${posTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                <CardHeader className={`border-b border-gray-800 ${posTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="text-white text-lg sm:text-xl font-bold flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-blue-400" />
                      Aankoopbestellings
                    </CardTitle>
                    <Button onClick={() => { resetPOForm(); setIsPODialogOpen(true); }} className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/25">
                      <Plus className="h-4 w-4 mr-2" /> Nuwe Bestelling
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input placeholder="Soek bestellings..." value={poSearchTerm} onChange={(e) => setPOSearchTerm(e.target.value)} className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500" />
                    </div>
                    <Select value={poStatusFilter} onValueChange={setPOStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] bg-gray-900/50 border-gray-700 text-white">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="all" className="text-white">Alle Status</SelectItem>
                        <SelectItem value="draft" className="text-white">Konsep</SelectItem>
                        <SelectItem value="sent" className="text-white">Gestuur</SelectItem>
                        <SelectItem value="partial" className="text-white">Gedeeltelik</SelectItem>
                        <SelectItem value="received" className="text-white">Ontvang</SelectItem>
                        <SelectItem value="cancelled" className="text-white">Gekanselleer</SelectItem>
                        <SelectItem value="paid" className="text-green-400">Betaal</SelectItem>
                        <SelectItem value="not_paid" className="text-red-400">Nie Betaal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className={`p-0 ${posTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                  {isPOLoading ? (
                    <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>
                  ) : filteredPurchaseOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-lg mb-2">Nog geen aankoopbestellings nie</p>
                      <p className="text-gray-500 text-sm">Skep jou eerste aankoopbestelling om voorraad van verskaffers te bestel</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-800/50">
                      {filteredPurchaseOrders.map((po: any) => (
                        <div key={po.id} className="p-4 hover:bg-gray-900/30 transition-colors">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-blue-400 font-mono font-bold text-sm">{po.poNumber}</span>
                                {getPOStatusBadge(po.status)}
                                <Badge className={`cursor-pointer text-xs ${po.isPaid ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'} border`} onClick={(e) => { e.stopPropagation(); togglePOPaidMutation.mutate({ id: po.id, isPaid: !po.isPaid }); }}>{po.isPaid ? 'Betaal' : 'Nie Betaal'}</Badge>
                              </div>
                              <p className="text-white font-medium">{po.supplierName}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(po.createdAt).toLocaleDateString()}</span>
                                {po.expectedDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Verwag: {new Date(po.expectedDate).toLocaleDateString()}</span>}
                                <span>{(po.items || []).length} items</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold text-lg">R{parseFloat(po.total || 0).toFixed(2)}</span>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedPO(po); setIsPOViewOpen(true); }} className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => loadPOForEdit(po)} className="text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => generatePOPdf(po)} className="text-gray-400 hover:text-green-400 hover:bg-green-500/10 h-8 w-8 p-0"><Download className="h-4 w-4" /></Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8 p-0"><ChevronDown className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                                    {po.status === 'draft' && <DropdownMenuItem onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'sent' })} className="text-gray-300 hover:text-white">Merk as Gestuur</DropdownMenuItem>}
                                    {(po.status === 'sent' || po.status === 'partial') && <DropdownMenuItem onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'partial' })} className="text-gray-300 hover:text-white">Gedeeltelik Ontvang</DropdownMenuItem>}
                                    {(po.status === 'sent' || po.status === 'partial') && <DropdownMenuItem onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'received' })} className="text-gray-300 hover:text-white">Volledig Ontvang</DropdownMenuItem>}
                                    {po.status !== 'cancelled' && po.status !== 'received' && <DropdownMenuItem onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'cancelled' })} className="text-red-400 hover:text-red-300">Kanselleer</DropdownMenuItem>}
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem onClick={() => { setDeletingPOId(po.id); setIsDeletePODialogOpen(true); }} className="text-red-400 hover:text-red-300">Verwyder</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* PO View Dialog */}
          <Dialog open={isPOViewOpen} onOpenChange={setIsPOViewOpen}>
            <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-2xl bg-black border-gray-700 text-white max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-white text-xl">Aankoopbestelling: {selectedPO?.poNumber}</DialogTitle></DialogHeader>
              {selectedPO && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getPOStatusBadge(selectedPO.status)}
                    <span className="text-gray-400 text-sm">{new Date(selectedPO.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <h4 className="text-sm text-gray-400 mb-2 font-medium">Verskaffer</h4>
                      <p className="text-white font-semibold">{selectedPO.supplierName}</p>
                      {selectedPO.supplierPhone && <p className="text-gray-400 text-sm mt-1">Tel: {selectedPO.supplierPhone}</p>}
                      {selectedPO.supplierEmail && <p className="text-gray-400 text-sm">E-pos: {selectedPO.supplierEmail}</p>}
                      {selectedPO.supplierAddress && <p className="text-gray-400 text-sm mt-1">{selectedPO.supplierAddress}</p>}
                    </div>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <h4 className="text-sm text-gray-400 mb-2 font-medium">Besonderhede</h4>
                      {selectedPO.expectedDate && <p className="text-gray-300 text-sm">Verwag: {new Date(selectedPO.expectedDate).toLocaleDateString()}</p>}
                      <p className="text-gray-300 text-sm">{(selectedPO.items || []).length} items</p>
                    </div>
                  </div>
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-900/80"><th className="text-left p-3 text-gray-400 font-medium">Item</th><th className="text-left p-3 text-gray-400 font-medium">SKU</th><th className="text-center p-3 text-gray-400 font-medium">Hv</th><th className="text-right p-3 text-gray-400 font-medium">Kosprys</th><th className="text-right p-3 text-gray-400 font-medium">Totaal</th></tr></thead>
                      <tbody>
                        {(selectedPO.items || []).map((item: any, i: number) => (
                          <tr key={i} className="border-t border-gray-800/50"><td className="p-3 text-white">{item.name}</td><td className="p-3 text-gray-400">{item.sku || '-'}</td><td className="p-3 text-center text-white">{item.quantity}</td><td className="p-3 text-right text-gray-300">R{parseFloat(item.costPrice || 0).toFixed(2)}</td><td className="p-3 text-right text-white font-medium">R{(item.costPrice * item.quantity).toFixed(2)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col items-end gap-1 pt-2 border-t border-gray-800">
                    <div className="flex justify-between w-48 text-sm"><span className="text-gray-400">Subtotaal:</span><span className="text-white">R{parseFloat(selectedPO.subtotal || 0).toFixed(2)}</span></div>
                    {parseFloat(selectedPO.taxPercent) > 0 && <div className="flex justify-between w-48 text-sm"><span className="text-gray-400">BTW ({selectedPO.taxPercent}%):</span><span className="text-white">R{(parseFloat(selectedPO.subtotal) * parseFloat(selectedPO.taxPercent) / 100).toFixed(2)}</span></div>}
                    {parseFloat(selectedPO.shippingAmount) > 0 && <div className="flex justify-between w-48 text-sm"><span className="text-gray-400">Versending:</span><span className="text-white">R{parseFloat(selectedPO.shippingAmount).toFixed(2)}</span></div>}
                    <div className="flex justify-between w-48 text-sm font-bold border-t border-gray-700 pt-1"><span className="text-blue-400">Totaal:</span><span className="text-blue-400">R{parseFloat(selectedPO.total || 0).toFixed(2)}</span></div>
                  </div>
                  {selectedPO.notes && <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800"><h4 className="text-sm text-gray-400 mb-1">Notas</h4><p className="text-gray-300 text-sm">{selectedPO.notes}</p></div>}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* PO Create/Edit Dialog */}
          <Dialog open={isPODialogOpen} onOpenChange={(open) => { if (!open) { resetPOForm(); } setIsPODialogOpen(open); }}>
            <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-3xl bg-black border-gray-700 text-white max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-white text-xl">{editingPO ? 'Wysig Aankoopbestelling' : 'Nuwe Aankoopbestelling'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h4 className="text-sm text-gray-400 font-medium flex items-center gap-2"><User className="h-4 w-4" /> Verskaffer Besonderhede</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {suppliers.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-[hsl(217,90%,30%)] text-[hsl(217,90%,60%)] hover:text-white hover:bg-[hsl(217,90%,25%)] bg-[hsl(217,90%,15%)] text-xs h-8 gap-1.5">
                              <Users className="h-3 w-3" />
                              Kies Verskaffer
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-900 border-gray-700 min-w-[240px] max-h-60 overflow-y-auto">
                            {suppliers.map((s: any) => (
                              <DropdownMenuItem key={s.id} onClick={() => loadSupplier(s)} className="text-gray-300 hover:text-white flex items-center justify-between group">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{s.name}</p>
                                  {s.phone && <p className="text-xs text-gray-500 truncate">{s.phone}</p>}
                                </div>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteSupplierMutation.mutate(s.id); }} className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10 ml-2">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      <Button variant="outline" size="sm" onClick={handleSaveSupplier} disabled={!poSupplierName || saveSupplierMutation.isPending} className="border-green-600/30 text-green-400 hover:text-green-300 hover:bg-green-500/10 bg-green-500/5 text-xs h-8 gap-1.5">
                        <Check className="h-3 w-3" />
                        {saveSupplierMutation.isPending ? "Stoor..." : "Stoor Verskaffer"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><Label className="text-gray-400 text-xs">Verskaffer Naam *</Label><Input value={poSupplierName} onChange={(e) => setPOSupplierName(e.target.value)} placeholder="Verskaffer naam" className="bg-gray-900 border-gray-700 text-white mt-1" /></div>
                    <div><Label className="text-gray-400 text-xs">E-pos</Label><Input value={poSupplierEmail} onChange={(e) => setPOSupplierEmail(e.target.value)} placeholder="verskaffer@epos.com" className="bg-gray-900 border-gray-700 text-white mt-1" /></div>
                    <div><Label className="text-gray-400 text-xs">Telefoon</Label><Input value={poSupplierPhone} onChange={(e) => setPOSupplierPhone(e.target.value)} placeholder="Telefoonnommer" className="bg-gray-900 border-gray-700 text-white mt-1" /></div>
                    <div><Label className="text-gray-400 text-xs">Adres</Label><Input value={poSupplierAddress} onChange={(e) => setPOSupplierAddress(e.target.value)} placeholder="Verskaffer adres" className="bg-gray-900 border-gray-700 text-white mt-1" /></div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h4 className="text-sm text-gray-400 font-medium flex items-center gap-2"><Package className="h-4 w-4" /> Items</h4>
                    <div className="flex flex-wrap gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"><Plus className="h-3 w-3 mr-1" /> Voeg Produk By</Button></DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-gray-700 max-h-48 overflow-y-auto">
                          {(products || []).map((p: any) => (
                            <DropdownMenuItem key={p.id} onClick={() => addPOItem(p)} className="text-gray-300 hover:text-white">{p.name} {p.sku ? `(${p.sku})` : ''}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="outline" size="sm" onClick={() => addPOItem()} className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"><Plus className="h-3 w-3 mr-1" /> Pasgemaakte Item</Button>
                    </div>
                  </div>
                  {poItems.length === 0 ? (
                    <div className="text-center py-6 text-gray-500"><Package className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Voeg items by om te begin</p></div>
                  ) : (
                    <div className="space-y-2">
                      {poItems.map((item: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Input value={item.name} onChange={(e) => { const updated = [...poItems]; updated[index].name = e.target.value; setPOItems(updated); }} placeholder="Item naam" className="flex-1 bg-gray-900 border-gray-700 text-white text-sm h-8" />
                            <Input value={item.sku || ''} onChange={(e) => { const updated = [...poItems]; updated[index].sku = e.target.value; setPOItems(updated); }} placeholder="SKU" className="w-20 bg-gray-900 border-gray-700 text-white text-sm h-8" />
                            <Button variant="ghost" size="sm" onClick={() => setPOItems(poItems.filter((_: any, i: number) => i !== index))} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0 shrink-0"><Trash2 className="h-3 w-3" /></Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Hv</span>
                            <Input type="number" min="1" value={item.quantity} onChange={(e) => { const updated = [...poItems]; updated[index].quantity = parseInt(e.target.value) || 1; setPOItems(updated); }} className="w-16 bg-gray-900 border-gray-700 text-white text-sm h-8 text-center" />
                            <span className="text-gray-500 text-sm">x R</span>
                            <Input type="number" step="0.01" value={item.costPrice} onChange={(e) => { const updated = [...poItems]; updated[index].costPrice = parseFloat(e.target.value) || 0; setPOItems(updated); }} className="w-20 bg-gray-900 border-gray-700 text-white text-sm h-8" />
                            <span className="ml-auto text-gray-300 text-sm font-medium">= R{(item.costPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><Label className="text-gray-400 text-xs">Verwagte Datum</Label><Input type="date" value={poExpectedDate} onChange={(e) => setPOExpectedDate(e.target.value)} className="bg-gray-900 border-gray-700 text-white mt-1" /></div>
                  <div><Label className="text-gray-400 text-xs">BTW %</Label><Input type="number" step="0.1" value={poTaxPercent} onChange={(e) => setPOTaxPercent(parseFloat(e.target.value) || 0)} className="bg-gray-900 border-gray-700 text-white mt-1" /></div>
                  <div><Label className="text-gray-400 text-xs">Versending (R)</Label><Input type="number" step="0.01" value={poShippingAmount} onChange={(e) => setPOShippingAmount(parseFloat(e.target.value) || 0)} className="bg-gray-900 border-gray-700 text-white mt-1" /></div>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Notas</Label>
                  <textarea value={poNotes} onChange={(e) => setPONotes(e.target.value)} rows={3} placeholder="Bykomende notas..." className="w-full mt-1 bg-gray-900 border border-gray-700 text-white rounded-md p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                {poItems.length > 0 && (() => {
                  const subtotal = poItems.reduce((s: number, i: any) => s + (i.costPrice * i.quantity), 0);
                  const tax = subtotal * (poTaxPercent / 100);
                  return (
                    <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between text-sm text-gray-400"><span>Subtotaal:</span><span className="text-white">R{subtotal.toFixed(2)}</span></div>
                      {poTaxPercent > 0 && <div className="flex justify-between text-sm text-gray-400 mt-1"><span>BTW ({poTaxPercent}%):</span><span className="text-white">R{tax.toFixed(2)}</span></div>}
                      {poShippingAmount > 0 && <div className="flex justify-between text-sm text-gray-400 mt-1"><span>Versending:</span><span className="text-white">R{poShippingAmount.toFixed(2)}</span></div>}
                      <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-700"><span className="text-blue-400">Totaal:</span><span className="text-blue-400">R{(subtotal + tax + poShippingAmount).toFixed(2)}</span></div>
                    </div>
                  );
                })()}
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => { resetPOForm(); setIsPODialogOpen(false); }} className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">Kanselleer</Button>
                  <Button onClick={handleSubmitPO} disabled={createPOMutation.isPending || updatePOMutation.isPending} className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white">
                    {(createPOMutation.isPending || updatePOMutation.isPending) ? 'Stoor...' : editingPO ? 'Dateer Op' : 'Skep Bestelling'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* PO Delete Confirmation */}
          <Dialog open={isDeletePODialogOpen} onOpenChange={setIsDeletePODialogOpen}>
            <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto bg-black border-gray-700 text-white max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-white">Bevestig Verwydering</DialogTitle></DialogHeader>
              <p className="text-gray-400">Is jy seker jy wil hierdie aankoopbestelling verwyder? Hierdie aksie kan nie ongedaan gemaak word nie.</p>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsDeletePODialogOpen(false)} className="border-gray-600 text-gray-300">Kanselleer</Button>
                <Button variant="destructive" onClick={() => deletingPOId && deletePOMutation.mutate(deletingPOId)} disabled={deletePOMutation.isPending}>
                  {deletePOMutation.isPending ? 'Verwyder...' : 'Verwyder'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Open Accounts Tab */}
          <TabsContent value="oop-rekeninge">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Oop Rekeninge Opskrif */}
              <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-xl font-bold">
                    <FileText className="w-5 h-5" />
                    Oop Rekeninge
                  </CardTitle>
                </CardHeader>
                <CardContent className={`pt-6 ${posTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                  <div className="grid gap-4">
                    {openAccounts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        Geen oop rekeninge nie. Skep een vanuit die Verkope-oortjie om te begin.
                      </div>
                    ) : (
                      openAccounts.map((account) => (
                        <motion.div
                          key={account.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group overflow-hidden w-full"
                          whileHover={{ scale: 1.01, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {account.accountType === 'table' ? (
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                ) : (
                                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                )}
                                <h3 className="font-semibold text-lg text-white">{account.accountName}</h3>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingOpenAccount(account); setEditOpenAccountName(account.accountName); }}
                                  className="p-1 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                  title="Hernoem rekening"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <Badge variant={account.accountType === 'table' ? 'default' : 'outline'} className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                                {account.accountType === 'table' ? 'Tafel' : 'Klient'}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-400">R{account.total}</p>
                              <p className="text-sm text-gray-300">
                                {Array.isArray(account.items) ? account.items.length : 0} items
                              </p>
                            </div>
                          </div>

                          {account.notes && (
                            <p className="text-sm text-gray-300 italic">{account.notes}</p>
                          )}

                          <div className="text-xs text-gray-400">
                            <p>Geskep: {new Date(account.createdAt).toLocaleDateString()} om {new Date(account.createdAt).toLocaleTimeString()}</p>
                            {account.lastUpdated && (
                              <p>Opgedateer: {new Date(account.lastUpdated).toLocaleDateString()} om {new Date(account.lastUpdated).toLocaleTimeString()}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOpenAccount(account)}
                              className="flex-1 bg-transparent border-blue-500/30 text-white hover:bg-blue-500/20 hover:text-blue-200"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Bekyk Besonderhede
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                closeOpenAccountMutation.mutate({ accountId: account.id, paymentType: 'cash' });
                              }}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                              disabled={closeOpenAccountMutation.isPending}
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              {closeOpenAccountMutation.isPending ? 'Sluit...' : 'Sluit & Betaal'}
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="verslae">
            <div className="space-y-4">
              {/* Compact Filter Bar */}
              <div className={`rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 ${posTheme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mr-auto">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)]">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <span className={`font-bold text-base ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Verkope Analise</span>
                </div>
                <Input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`h-8 text-sm w-auto ${posTheme === 'dark' ? '' : 'border-gray-200'}`}
                />
                <Select value={selectedStaffFilter.toString()} onValueChange={(value) => setSelectedStaffFilter(value === "all" ? "all" : parseInt(value))}>
                  <SelectTrigger className={`h-8 text-sm w-36 ${posTheme === 'dark' ? '' : 'border-gray-200'}`}>
                    <SelectValue placeholder="Alle Personeel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Verkope</SelectItem>
                    <SelectItem value="0">Bestuur</SelectItem>
                    {staffAccounts.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.username || `Personeel #${staff.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => handlePrintReport()}
                  size="sm"
                  className="h-8 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-md"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Druk
                </Button>
              </div>

              {(() => {
                // Filter sales for selected date and staff
                const dateFilteredSales = sales.filter(sale => {
                  const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
                  const dateMatch = saleDate === selectedDate;
                  
                  if (selectedStaffFilter === "all") {
                    return dateMatch;
                  } else if (selectedStaffFilter === 0) {
                    // Manager sales (no staffAccountId)
                    return dateMatch && !sale.staffAccountId;
                  } else {
                    // Specific staff member
                    return dateMatch && sale.staffAccountId === selectedStaffFilter;
                  }
                });

                // Filter out voided sales for calculations
                const validSales = dateFilteredSales.filter(sale => !sale.isVoided);

                // Calculate totals by payment method (excluding voided sales)
                const paymentMethodTotals = validSales.reduce((acc, sale) => {
                  const method = sale.paymentType;
                  acc[method] = (acc[method] || 0) + parseFloat(sale.total);
                  return acc;
                }, {} as Record<string, number>);

                // Prepare chart data
                const paymentChartData = Object.entries(paymentMethodTotals).map(([method, total]) => ({
                  name: method === 'kontant' ? 'Kontant' : method === 'kaart' ? 'Kaart' : method === 'eft' ? 'EFT' : method.charAt(0).toUpperCase() + method.slice(1),
                  value: total,
                  amount: `R${total.toFixed(2)}`
                }));

                // Daily totals for line chart (last 7 days including selected date) - excluding voided sales
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() - (6 - i));
                  return date.toISOString().split('T')[0];
                });

                const dailyTotals = last7Days.map(date => {
                  const daySales = sales.filter(sale => 
                    new Date(sale.createdAt).toISOString().split('T')[0] === date && !sale.isVoided
                  );
                  const total = daySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
                  return {
                    date: new Date(date).toLocaleDateString('af-ZA', { month: 'short', day: 'numeric' }),
                    total: total,
                    transactions: daySales.length
                  };
                });

                const totalRevenue = validSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
                const totalTransactions = validSales.length;
                const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
                
                // Calculate total profit (revenue - cost) - excluding voided sales
                const totalProfit = validSales.reduce((profit, sale) => {
                  const saleProfit = sale.items.reduce((itemProfit: number, item: any) => {
                    const salePrice = parseFloat(item.price) * item.quantity;
                    const costPrice = item.costPrice ? parseFloat(item.costPrice) * item.quantity : 0;
                    return itemProfit + (salePrice - costPrice);
                  }, 0);
                  return profit + saleProfit;
                }, 0);

                const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

                return (
                  <>
                    {/* Summary Cards — 2×2 on mobile, 4 across on desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { icon: DollarSign, label: 'Totale Omset', value: `R${totalRevenue.toFixed(2)}` },
                        { icon: TrendingUp, label: 'Totale Wins', value: `R${totalProfit.toFixed(2)}` },
                        { icon: Receipt, label: 'Transaksies', value: totalTransactions },
                        { icon: TrendingUp, label: 'Gem. Transaksie', value: `R${avgTransactionValue.toFixed(2)}` },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className={`rounded-xl p-3 flex flex-col gap-1 ${posTheme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-[hsl(217,90%,50%)]" />
                            <span className={`text-xs font-medium truncate ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                          </div>
                          <div className="text-xl font-bold text-[hsl(217,90%,50%)] leading-tight">{value}</div>
                        </div>
                      ))}
                    </div>
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Payment Methods Pie Chart */}
                      <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                        <CardHeader>
                          <CardTitle className="text-white">Betaalmetodes Verdeling</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {paymentChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={paymentChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, value }) => `${name}: R${value.toFixed(2)}`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {paymentChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`R${Number(value).toFixed(2)}`, 'Bedrag']} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                              Geen verkope data vir geselekteerde datum nie
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* 7-Day Trend Line Chart */}
                      <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                        <CardHeader>
                          <CardTitle className="text-white">7-Dag Verkope Tendens</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyTotals}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip 
                                formatter={(value, name) => [
                                  name === 'total' ? `R${Number(value).toFixed(2)}` : value,
                                  name === 'total' ? 'Omset' : 'Transaksies'
                                ]}
                              />
                              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                    {/* Detailed Sales List */}
                    <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                      <CardHeader>
                        <CardTitle className="text-white">Gedetailleerde Verkope Lys</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dateFilteredSales.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              Geen verkope vir geselekteerde datum en filter nie
                            </div>
                          ) : (
                            dateFilteredSales.map((sale) => {
                              const isExpanded = expandedSales.has(sale.id);
                              const saleItems = Array.isArray(sale.items) ? sale.items : [];
                              
                              return (
                                <motion.div 
                                  key={sale.id} 
                                  initial={false}
                                  animate={{ backgroundColor: isExpanded ? 'rgba(30, 58, 138, 0.1)' : 'transparent' }}
                                  className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                                    sale.isVoided 
                                      ? 'bg-red-950/30 border-red-800/50' 
                                      : isExpanded 
                                        ? 'border-[hsl(217,90%,40%)]/50 shadow-lg shadow-blue-900/20' 
                                        : 'border-gray-700/50 hover:border-gray-600/50'
                                  }`}
                                >
                                  <div 
                                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                                      isExpanded ? 'bg-gradient-to-r from-[hsl(217,30%,15%)]/80 to-transparent' : 'hover:bg-gray-800/30'
                                    }`}
                                    onClick={() => {
                                      const newExpanded = new Set(expandedSales);
                                      if (isExpanded) {
                                        newExpanded.delete(sale.id);
                                      } else {
                                        newExpanded.add(sale.id);
                                      }
                                      setExpandedSales(newExpanded);
                                    }}
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <motion.div
                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`p-1.5 rounded-lg ${isExpanded ? 'bg-[hsl(217,90%,40%)]/20' : 'bg-gray-700/50'}`}
                                      >
                                        <ChevronRight className={`w-4 h-4 ${isExpanded ? 'text-[hsl(217,90%,50%)]' : 'text-gray-400'}`} />
                                      </motion.div>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-white">
                                            Verkoop #{sale.id}
                                          </span>
                                          <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-300">
                                            {saleItems.length} {saleItems.length === 1 ? 'item' : 'items'}
                                          </Badge>
                                          {sale.isVoided && (
                                            <Badge variant="destructive" className="text-xs">
                                              Gekanselleer
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-0.5">
                                          {new Date(sale.createdAt).toLocaleString('af-ZA')} • {sale.paymentType === 'kontant' ? 'Kontant' : sale.paymentType === 'kaart' ? 'Kaart' : sale.paymentType === 'eft' ? 'EFT' : sale.paymentType}
                                          {sale.customerName && ` • ${sale.customerName}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {sale.staffAccount ? `Bedien deur: ${sale.staffAccount.username}` : 'Bedien deur: Bestuur'}
                                          {sale.notes && ` • Nota: ${sale.notes}`}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <span className={`text-lg font-bold ${sale.isVoided ? 'line-through text-red-500' : 'text-[hsl(217,90%,50%)]'}`}>
                                          R{sale.total}
                                        </span>
                                      </div>
                                      {sale.isVoided ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => { e.stopPropagation(); setViewVoidDialog({ open: true, sale }); }}
                                          className="bg-gray-800 border-gray-600 hover:bg-gray-700"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      ) : currentStaff?.userType === 'management' && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={(e) => { e.stopPropagation(); setVoidSaleDialog({ open: true, sale }); }}
                                        >
                                          Kanselleer
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Expandable Items Section */}
                                  <motion.div
                                    initial={false}
                                    animate={{ 
                                      height: isExpanded ? 'auto' : 0,
                                      opacity: isExpanded ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-4 pt-2 border-t border-gray-700/50">
                                      <div className="bg-gray-900/50 rounded-lg border border-gray-700/30 overflow-hidden">
                                        <div className="bg-gradient-to-r from-[hsl(217,30%,20%)]/50 to-transparent px-4 py-2 border-b border-gray-700/30">
                                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transaksie Besonderhede</span>
                                        </div>
                                        <div className="divide-y divide-gray-700/30">
                                          {saleItems.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors">
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[hsl(217,90%,40%)]/20 flex items-center justify-center">
                                                  <Package className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                                                </div>
                                                <div>
                                                  <p className="text-white font-medium">{item.name || 'Onbekende Produk'}</p>
                                                  <p className="text-xs text-gray-500">SKU: {item.sku || 'N/A'}</p>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="flex items-center gap-4">
                                                  <div className="text-center">
                                                    <p className="text-xs text-gray-500">Hoev.</p>
                                                    <p className="text-white font-medium">{item.quantity || 1}</p>
                                                  </div>
                                                  <div className="text-center">
                                                    <p className="text-xs text-gray-500">Prys</p>
                                                    <p className="text-white font-medium">R{parseFloat(item.price || 0).toFixed(2)}</p>
                                                  </div>
                                                  <div className="text-center min-w-[80px]">
                                                    <p className="text-xs text-gray-500">Subtotaal</p>
                                                    <p className="text-[hsl(217,90%,50%)] font-semibold">R{((item.quantity || 1) * parseFloat(item.price || 0)).toFixed(2)}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="bg-gradient-to-r from-[hsl(217,30%,20%)]/50 to-transparent px-4 py-3 border-t border-gray-700/30 flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-300">Totaal</span>
                                          <span className="text-lg font-bold text-[hsl(217,90%,50%)]">R{sale.total}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="gebruik">
            {(() => {
              // Calculate current month dates
              const now = new Date();
              const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              
              // Check if user is in trial period
              const userTrialStartDate = currentUser?.trialStartDate ? new Date(currentUser.trialStartDate) : null;
              const isInTrial = userTrialStartDate && 
                (now.getTime() - userTrialStartDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
              
              let daysRemaining = 0;
              if (isInTrial && userTrialStartDate) {
                const trialEndDate = new Date(userTrialStartDate.getTime() + (7 * 24 * 60 * 60 * 1000));
                daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
              }
              
              // Filter sales for current month and current user
              const currentMonthSales = sales.filter(sale => {
                if (sale.isVoided) return false;
                const saleDate = new Date(sale.createdAt);
                return saleDate >= currentMonthStart && saleDate <= currentMonthEnd;
              });

              // Calculate total revenue for current month
              const currentMonthRevenue = currentMonthSales.reduce((total, sale) => {
                return total + parseFloat(sale.total);
              }, 0);

              // Filter invoices for current month
              const currentMonthInvoices = invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.createdAt);
                return invoiceDate >= currentMonthStart && invoiceDate <= currentMonthEnd;
              });

              // Calculate Storm fees - sales fee (0.5%) + invoice fee (R0.50 each)
              const salesFee = isInTrial ? 0 : currentMonthRevenue * 0.005;
              const invoiceFee = isInTrial ? 0 : currentMonthInvoices.length * 0.50;
              const stormFee = salesFee + invoiceFee;

              // Calculate daily breakdown
              const dailyBreakdown: { [key: string]: number } = {};
              currentMonthSales.forEach(sale => {
                const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
                dailyBreakdown[saleDate] = (dailyBreakdown[saleDate] || 0) + parseFloat(sale.total);
              });

              const daysInMonth = currentMonthEnd.getDate();
              const daysCompleted = now.getDate();
              const progressPercentage = (daysCompleted / daysInMonth) * 100;

              const formatMonthYear = (date: Date) => {
                return date.toLocaleDateString('af-ZA', { month: 'long', year: 'numeric' });
              };

              return (
                <div className="space-y-6">
                  {/* 7-Day Trial Banner */}
                  {isInTrial && (
                    <div className="bg-gradient-to-br from-[hsl(217,90%,40%)] via-[hsl(217,90%,45%)] to-[hsl(217,90%,50%)] rounded-xl p-8 text-white shadow-xl border border-blue-400/30 relative overflow-hidden" data-testid="trial-banner">
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                      
                      <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          {/* Header with icon */}
                          <div className="flex items-center gap-4">
                            <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 shadow-lg">
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold">Gratis Proeftydperk Aktief</h3>
                              <p className="text-blue-100 text-sm font-medium">{daysRemaining} {daysRemaining === 1 ? 'dag' : 'dae'} oor</p>
                            </div>
                          </div>
                          
                          {/* Benefits */}
                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 space-y-3 shadow-inner">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-[hsl(217,90%,40%)]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="font-medium">Geen gebruiksfooie tydens proeftydperk</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-[hsl(217,90%,40%)]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="font-medium">Onbeperkte verkope teen R0.00 koste</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-[hsl(217,90%,40%)]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="font-medium">Volle toegang tot alle funksies</span>
                            </div>
                          </div>
                          
                          {/* Footer message */}
                          <p className="text-blue-100 text-sm leading-relaxed">
                            Na jou proeftydperk begin ons eenvoudige 0.5% per verkoop pryse outomaties. Jy sal jou eerste gebruiksgeld op dag 8 sien.
                          </p>
                        </div>
                        
                        {/* Countdown card */}
                        <div className="text-center bg-white/15 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20 min-w-[140px]">
                          <div className="text-5xl font-bold mb-2">{daysRemaining}</div>
                          <div className="text-blue-100 text-sm font-semibold uppercase tracking-wide">
                            {daysRemaining === 1 ? 'Dag Oor' : 'Dae Oor'}
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <div className="text-xs text-blue-200">Proeftydperk eindig</div>
                            <div className="text-sm font-medium mt-1">
                              {new Date(new Date(userTrialStartDate!).getTime() + (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('af-ZA', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl p-5 text-white">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Gebruik & Fakturering</h2>
                        <p className="text-blue-100 mt-1 text-sm">{formatMonthYear(now)} faktuurperiode</p>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold">R{stormFee.toFixed(2)}</div>
                        <div className="text-blue-100 text-sm">Bedrag verskuldig aan Storm</div>
                        <Button
                          onClick={() => setIsBankDetailsOpen(true)}
                          variant="outline"
                          size="sm"
                          className="mt-3 bg-blue-500/20 border-blue-300 text-white hover:bg-blue-600 hover:border-blue-400 shadow-sm backdrop-blur-sm w-full sm:w-auto"
                        >
                          <CreditCard className="w-4 h-4 mr-2 shrink-0" />
                          Bekyk Betalingsbesonderhede
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Key Metrics */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-blue-500 bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                          Huidige Maand Omset
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-400">R{currentMonthRevenue.toFixed(2)}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {currentMonthSales.length} transaksies
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                          Storm Diensfooi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-400">R{stormFee.toFixed(2)}</div>
                        <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                          <div>Verkope: R{salesFee.toFixed(2)} (0.5%)</div>
                          <div>Fakture: R{invoiceFee.toFixed(2)} ({currentMonthInvoices.length} × R0.50)</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                          Faktuurperiode
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-400">{Math.round(progressPercentage)}%</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Dag {daysCompleted} van {daysInMonth}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Billing Breakdown */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Fee Calculation */}
                    <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <DollarSign className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                          Fooi Uiteensetting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Verkoopsfooi (0.5%)</div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Bruto Omset</span>
                            <span className="font-semibold text-white">R{currentMonthRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Verkoopsfooi (0.5%)</span>
                            <span className="font-semibold text-blue-400">R{salesFee.toFixed(2)}</span>
                          </div>
                          
                          <div className="border-t border-white/10 pt-3 mt-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Faktuurfooi (R0.50 elk)</div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Fakture Geskep</span>
                              <span className="font-semibold text-white">{currentMonthInvoices.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Faktuurfooi</span>
                              <span className="font-semibold text-blue-400">R{invoiceFee.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="border-t-2 border-blue-500/30 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">Totaal Verskuldig aan Storm</span>
                              <span className="text-xl font-bold text-blue-400">R{stormFee.toFixed(2)}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => setIsBankDetailsOpen(true)}
                            className="w-full mt-4 h-12 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 rounded-lg"
                          >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Betaal Nou
                          </Button>
                        </div>
                        
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-300">Hoe Pryse Werk</h4>
                              <ul className="text-sm text-gray-300 mt-2 space-y-1">
                                <li>• <strong>Verkope:</strong> 0.5% van jou maandelikse omset</li>
                                <li>• <strong>Fakture:</strong> R0.50 per faktuur geskep</li>
                                <li className="text-gray-400 text-xs mt-2">Voorbeeld: 100 fakture/maand = R50 in faktuurfooie</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Revenue Trend */}
                    <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <BarChart3 className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                          Onlangse Prestasie
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Object.keys(dailyBreakdown).length > 0 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-400">Gem. Daaglikse Omset</div>
                                <div className="font-semibold text-white">
                                  R{(currentMonthRevenue / Math.max(daysCompleted, 1)).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-400">Beste Dag</div>
                                <div className="font-semibold text-white">
                                  R{Math.max(...Object.values(dailyBreakdown)).toFixed(2)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-300">Daaglikse Omset Tendens</div>
                              <div className="space-y-1">
                                {Object.entries(dailyBreakdown)
                                  .sort(([a], [b]) => b.localeCompare(a))
                                  .slice(0, 7)
                                  .map(([date, revenue]) => {
                                    const percentage = (revenue / Math.max(...Object.values(dailyBreakdown))) * 100;
                                    return (
                                      <div key={date} className="flex items-center gap-3">
                                        <div className="w-16 text-xs text-gray-400">
                                          {new Date(date).toLocaleDateString('af-ZA', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                                          <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                        <div className="w-20 text-xs text-right font-medium text-white">
                                          R{revenue.toFixed(2)}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Nog geen verkoopdata vir hierdie maand nie.</p>
                            <p className="text-sm">Begin verkoop om jou omset tendense te sien!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  {/* Payment Information */}
                  <Card className="bg-gray-900/60 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 shadow-2xl shadow-blue-900/10">
                    <CardHeader className="border-b border-white/10 pb-4">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(217,90%,40%)]/15 flex items-center justify-center border border-[hsl(217,90%,40%)]/30">
                          <Receipt className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                        </div>
                        Betaalinligting
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/80 rounded-xl border border-white/5 p-5">
                          <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                            Hoe Fakturering Werk
                          </h4>
                          <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-[hsl(217,90%,40%)]/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(217,90%,40%)]/30">
                                <span className="text-[10px] font-bold text-[hsl(217,90%,50%)]">1</span>
                              </div>
                              Maandelikse faktureringssiklus: 1ste tot laaste dag van maand
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-[hsl(217,90%,40%)]/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(217,90%,40%)]/30">
                                <span className="text-[10px] font-bold text-[hsl(217,90%,50%)]">2</span>
                              </div>
                              Diensfooi: 0.5% van bruto maandelikse omset
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-[hsl(217,90%,40%)]/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(217,90%,40%)]/30">
                                <span className="text-[10px] font-bold text-[hsl(217,90%,50%)]">3</span>
                              </div>
                              Betaling verskuldig: Einde van elke maand
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-[hsl(217,90%,40%)]/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(217,90%,40%)]/30">
                                <span className="text-[10px] font-bold text-[hsl(217,90%,50%)]">4</span>
                              </div>
                              Geen opstellingsfooi of versteekte koste nie
                            </li>
                          </ul>
                        </div>
                        <div className="bg-gray-900/80 rounded-xl border border-white/5 p-5 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                              Kontak & Ondersteuning
                            </h4>
                            <div className="space-y-2 text-sm text-gray-300">
                              <p>Vrae oor jou fakturering?</p>
                              <p className="font-medium text-[hsl(217,90%,50%)]">
                                softwarebystorm@gmail.com
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => setIsBankDetailsOpen(true)}
                            className="mt-5 h-10 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Sien Betalingsbesonderhede
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="instellings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Opstelling Voltooiingskaart */}
              {!currentUser?.tutorialCompleted && (
                <Card className="bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/10 border border-[hsl(217,90%,50%)]/30 shadow-xl shadow-blue-900/20">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(217,90%,40%)]/20 flex items-center justify-center flex-shrink-0">
                        <ListChecks className="w-5 h-5 text-[hsl(217,90%,60%)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">Voltooi jou rekeningopstelling</p>
                        <p className="text-gray-400 text-xs mt-0.5">Laai jou logo hieronder op, voeg jou eerste produk by, doen 'n toetsverkoop en koppel betaalmetodes. Klik op Merk Voltooi as jy klaar is.</p>
                      </div>
                      <Button
                        onClick={() => markTutorialMutation.mutate()}
                        disabled={markTutorialMutation.isPending}
                        size="sm"
                        className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,45%)] text-white flex-shrink-0 whitespace-nowrap"
                      >
                        {markTutorialMutation.isPending ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />Stoor...</> : <><Check className="w-3.5 h-3.5 mr-1.5" />Merk Voltooi</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Voorkoms Kaart */}
              <Card className={posTheme === 'dark' ? "bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20" : "bg-white border-gray-200 shadow-lg"}>
                <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                  <CardTitle className={`flex items-center gap-2 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {posTheme === 'dark' ? <Moon className="w-5 h-5 text-[hsl(217,90%,50%)]" /> : <Sun className="w-5 h-5 text-[hsl(217,90%,40%)]" />}
                    Voorkoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 pb-5">
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-700/50' : 'bg-slate-50 border-gray-200'}`}>
                    <div>
                      <p className={`text-sm font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tema</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sun className={`w-4 h-4 transition-colors ${posTheme === 'light' ? 'text-[hsl(217,90%,40%)]' : 'text-gray-500'}`} />
                      <button
                        onClick={() => {
                          const next = posTheme === 'dark' ? 'light' : 'dark';
                          setPosTheme(next);
                          try { localStorage.setItem('posTheme', next); } catch {}
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${posTheme === 'dark' ? 'bg-[hsl(217,90%,40%)]' : 'bg-gray-300'}`}
                        aria-label="Wissel tema"
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${posTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <Moon className={`w-4 h-4 transition-colors ${posTheme === 'dark' ? 'text-[hsl(217,90%,50%)]' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account & Preferences Section */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                    Rekening & Voorkeure
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Profile Picture Setting */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsLogoDialogOpen(true)}
                      className="cursor-pointer group"
                    >
                      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/0 via-[hsl(217,90%,40%)]/5 to-[hsl(217,90%,40%)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300">
                            <User className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Verander Profielfoto</h3>
                            <p className="text-gray-400 text-sm">Werk jou maatskappy-logo of avatar op</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[hsl(217,90%,50%)] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Receipt Customizer Setting */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsReceiptCustomizerOpen(true)}
                      className="cursor-pointer group"
                    >
                      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/0 via-[hsl(217,90%,40%)]/5 to-[hsl(217,90%,40%)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300">
                            <Receipt className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Personaliseer Jou Kwitansie</h3>
                            <p className="text-gray-400 text-sm">Pas jou kwitansie-uitleg en handelsmerk aan</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[hsl(217,90%,50%)] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Invoice/Quote Setup */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsInvoiceSetupOpen(true)}
                      className="cursor-pointer group"
                    >
                      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/0 via-[hsl(217,90%,40%)]/5 to-[hsl(217,90%,40%)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300">
                            <FileText className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Faktuur &amp; Kwotasie Opstelling</h3>
                            <p className="text-gray-400 text-sm">Voeg pasgemaakte velde en veranderlikes by u fakture en kwotasies</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[hsl(217,90%,50%)] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Change Password Setting */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setIsChangePasswordDialogOpen(true)}
                      className="cursor-pointer group"
                    >
                      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/0 via-[hsl(217,90%,40%)]/5 to-[hsl(217,90%,40%)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300">
                            <Lock className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Verander Wagwoord</h3>
                            <p className="text-gray-400 text-sm">Werk jou aanmeld-wagwoord veilig op</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[hsl(217,90%,50%)] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Language Setting */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      onClick={async () => {
                        if (!currentUser?.id) return;
                        try {
                          const response = await fetch(`/api/pos/user/${currentUser.id}/preferred-language`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ preferredLanguage: 'en' })
                          });
                          if (response.ok) {
                            const data = await response.json();
                            localStorage.setItem('posUser', JSON.stringify(data.user));
                            toast({ title: 'Taal Opgedateer', description: 'Skakel na Engels...' });
                            setTimeout(() => { window.location.href = '/pos/system'; }, 500);
                          } else {
                            toast({ title: 'Fout', description: 'Kon nie taalvoorkeur opdateer nie', variant: 'destructive' });
                          }
                        } catch (error) {
                          console.error('Failed to update language preference:', error);
                          toast({ title: 'Fout', description: 'Kon nie taalvoorkeur opdateer nie', variant: 'destructive' });
                        }
                      }}
                      className="cursor-pointer group"
                    >
                      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/0 via-[hsl(217,90%,40%)]/5 to-[hsl(217,90%,40%)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow duration-300">
                            <Globe className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Skakel na Engels</h3>
                            <p className="text-gray-400 text-sm">Verander jou taalvoorkeur permanent</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[hsl(217,90%,50%)] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Logout Setting */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      transition={{ duration: 0.2 }}
                      onClick={logout}
                      className="cursor-pointer group"
                    >
                      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-600/50 rounded-xl p-5 hover:border-red-500/50 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-shadow duration-300">
                            <LogOut className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg group-hover:text-red-400 transition-colors">Meld Af</h3>
                            <p className="text-gray-400 text-sm">Meld uit jou rekening af</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information Section */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Building2 className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                    Besigheidsinligting
                  </CardTitle>
                  <p className="text-gray-400 text-sm mt-1">Hierdie inligting verskyn op u fakture en kwotasies. Opdaterings is beperk tot een keer per dag.</p>
                </CardHeader>
                <CardContent className="pt-6">
                  {(() => {
                    const rs = mergeReceiptSettingsAfrikaans(currentUser?.receiptSettings);
                    const today = new Date().toISOString().split('T')[0];
                    const lastUpdate = (rs as any).lastBusinessInfoUpdate;
                    const updatedToday = lastUpdate === today;
                    return (
                      <div className="space-y-4">
                        {updatedToday && (
                          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-amber-300 text-sm">Besigheidsinligting is reeds vandag opgedateer. U kan môre weer opdateer.</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Maatskappynaam</Label>
                            <input disabled={updatedToday} value={bizInfoName} onChange={e => setBizInfoName(e.target.value)} placeholder="U maatskappynaam" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Telefoonnommer</Label>
                            <input disabled={updatedToday} value={bizInfoPhone} onChange={e => setBizInfoPhone(e.target.value)} placeholder="+27 12 345 6789" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">E-posadres</Label>
                            <input disabled={updatedToday} value={bizInfoEmail} onChange={e => setBizInfoEmail(e.target.value)} placeholder="info@ubesigheid.co.za" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Webwerf</Label>
                            <input disabled={updatedToday} value={bizInfoWebsite} onChange={e => setBizInfoWebsite(e.target.value)} placeholder="www.ubesigheid.co.za" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Adresreël 1</Label>
                            <input disabled={updatedToday} value={bizInfoAddress1} onChange={e => setBizInfoAddress1(e.target.value)} placeholder="123 Hoofstraat" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Adresreël 2</Label>
                            <input disabled={updatedToday} value={bizInfoAddress2} onChange={e => setBizInfoAddress2(e.target.value)} placeholder="Voorstad, Stad, 0001" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">BTW-nommer</Label>
                            <input disabled={updatedToday} value={bizInfoVat} onChange={e => setBizInfoVat(e.target.value)} placeholder="4123456789" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Registrasienommer</Label>
                            <input disabled={updatedToday} value={bizInfoReg} onChange={e => setBizInfoReg(e.target.value)} placeholder="2023/123456/07" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <Button
                            disabled={updatedToday || isSavingBizInfo}
                            onClick={async () => {
                              if (!currentUser?.id) return;
                              setIsSavingBizInfo(true);
                              try {
                                const existingSettings = mergeReceiptSettingsAfrikaans(currentUser.receiptSettings);
                                const today = new Date().toISOString().split('T')[0];
                                const newSettings = {
                                  ...existingSettings,
                                  businessInfo: {
                                    ...(existingSettings as any).businessInfo,
                                    name: bizInfoName,
                                    phone: bizInfoPhone,
                                    email: bizInfoEmail,
                                    addressLine1: bizInfoAddress1,
                                    addressLine2: bizInfoAddress2,
                                    website: bizInfoWebsite,
                                    vatNumber: bizInfoVat,
                                    registrationNumber: bizInfoReg,
                                  },
                                  lastBusinessInfoUpdate: today,
                                };
                                const res = await fetch(`/api/pos/user/${currentUser.id}/receipt-settings`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ settings: newSettings }),
                                });
                                if (res.ok) {
                                  const updatedUser = { ...currentUser, receiptSettings: newSettings, companyName: bizInfoName };
                                  setCurrentUser(updatedUser);
                                  localStorage.setItem('posUser', JSON.stringify(updatedUser));
                                  toast({ title: 'Besigheidsinligting Gestoor', description: 'U besigheidsinligting is opgedateer en sal op alle toekomstige fakture verskyn.' });
                                } else {
                                  toast({ title: 'Fout', description: 'Kon nie besigheidsinligting stoor nie.', variant: 'destructive' });
                                }
                              } catch {
                                toast({ title: 'Fout', description: 'Kon nie besigheidsinligting stoor nie.', variant: 'destructive' });
                              } finally {
                                setIsSavingBizInfo(false);
                              }
                            }}
                            className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white"
                          >
                            {isSavingBizInfo ? 'Besig om te stoor...' : 'Stoor Besigheidsinligting'}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Integrations Section */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Settings className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                    Integrasies
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {/* XERO Integration Section */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[hsl(217,90%,40%)] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">X</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">XERO Rekeningkunde</h3>
                            <p className="text-sm text-gray-400">Koppel jou XERO-rekening vir naatlose rekeningkunde</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(currentUser as any)?.xeroConnected ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Check className="w-3 h-3 mr-1" />
                              Gekoppel
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              Nie Gekoppel
                            </Badge>
                          )}
                        </div>
                      </div>

                      {(currentUser as any)?.xeroLastSync && (
                        <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-sm text-gray-400">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Laaste gesinkroniseer: {new Date((currentUser as any).xeroLastSync).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Opstel Instruksies</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex items-start gap-2">
                            <span className="text-[hsl(217,90%,40%)] font-medium">Stap 1.</span>
                            Gaan na die XERO Ontwikkelaarsportaal en skep 'n nuwe app
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[hsl(217,90%,40%)] font-medium">Stap 2.</span>
                            Stel die OAuth 2.0 herlei-URL na jou app se terugbel-URL
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[hsl(217,90%,40%)] font-medium">Stap 3.</span>
                            Kopieer jou Kliënt-ID en Kliëntgeheim
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[hsl(217,90%,40%)] font-medium">Stap 4.</span>
                            Klik Koppel aan XERO hieronder om te verifieer
                          </li>
                        </ul>
                        <a 
                          href="https://developer.xero.com/myapps/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[hsl(217,90%,40%)] hover:text-[hsl(217,90%,50%)] text-sm mt-3 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          XERO Ontwikkelaarsportaal →
                        </a>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {(currentUser as any)?.xeroConnected ? (
                          <>
                            <Button
                              onClick={handleSyncXero}
                              disabled={isSyncingXero}
                              className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingXero ? 'animate-spin' : ''}`} />
                              {isSyncingXero ? 'Sinkroniseer...' : 'Sinkroniseer Nou'}
                            </Button>
                            <Button
                              onClick={handleDisconnectXero}
                              disabled={isConnectingXero}
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              {isConnectingXero ? 'Ontkoppel...' : 'Ontkoppel'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={handleConnectXero}
                            disabled={isConnectingXero}
                            className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                          >
                            <Link2 className="w-4 h-4 mr-2" />
                            {isConnectingXero ? 'Koppel...' : 'Koppel aan XERO'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Data Flow Section */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Data Vloei</h4>
                      <p className="text-sm text-gray-400 mb-4">
                        Wanneer aan XERO gekoppel is, word die volgende data gesinkroniseer:
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                            <span className="font-medium text-white">Kliënte</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            <span className="text-[hsl(217,90%,40%)]">↔</span> Kontakte (Twee-rigting sinkronisasie)
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                            <span className="font-medium text-white">Produkte</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            <span className="text-[hsl(217,90%,40%)]">↔</span> Items (Twee-rigting sinkronisasie)
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Receipt className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                            <span className="font-medium text-white">Fakture</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            <span className="text-[hsl(217,90%,40%)]">→</span> XERO (Een-rigting stoot)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gevaarzone */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border-red-900/40 shadow-2xl shadow-red-900/10">
                <CardHeader className="border-b border-red-900/30 pb-4">
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Trash2 className="w-5 h-5" />
                    Gevaarzone
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-950/30 border border-red-900/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Skrap My Rekening &amp; Alle Data</h4>
                      <p className="text-sm text-gray-400">
                        Verwyder permanent jou rekening, alle verkope, produkte, kliënte, fakture en besigheidsdata. Dit kan nie ongedaan gemaak word nie.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 shrink-0"
                      onClick={() => setIsDeleteAccountDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Skrap Rekening
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  </div>
      {/* All dialogs and modals would go here - Product Dialog, Customer Dialog, etc. */}
      {/* For brevity, I'm including the key ones */}
      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-[hsl(217,90%,50%)]" />
              {editingCategory ? 'Wysig Kategorie' : 'Skep Kategorie'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCategory ? 'Werk kategorie besonderhede hieronder by.' : 'Skep \'n nuwe kategorie om jou produkte te organiseer.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Kategorienaam</Label>
              <Input 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="bv. Drankies, Kos, Elektronika"
                className="mt-2 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Kategoriekleur
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCategoryColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${categoryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Existing Categories List */}
            {categories.length > 0 && !editingCategory && (
              <div>
                <Label className="text-gray-300 mb-2 block">Bestaande Kategoriee</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                        <span className="text-white">{cat.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {products.filter(p => p.categoryId === cat.id).length} produkte
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openCategoryDialog(cat)} className="text-gray-400 hover:text-white h-7 w-7 p-0">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteCategoryMutation.mutate(cat.id)} className="text-gray-400 hover:text-red-400 h-7 w-7 p-0">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setIsCategoryDialogOpen(false); setEditingCategory(null); }} className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
              Kanselleer
            </Button>
            <Button 
              onClick={handleSaveCategory} 
              className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)]"
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending || updateCategoryMutation.isPending ? 'Stoor...' : (editingCategory ? 'Werk Kategorie By' : 'Skep Kategorie')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[560px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-700/50 shadow-2xl shadow-blue-900/30 p-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/5 via-transparent to-[hsl(217,90%,40%)]/5 pointer-events-none"></div>
          <div className="relative">
            <div className="px-6 pt-6 pb-4 border-b border-gray-700/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">
                    {editingProduct ? "Redigeer Produk" : "Voeg Nuwe Produk By"}
                  </DialogTitle>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {editingProduct ? 'Werk die produkinligting hieronder by.' : 'Voer die besonderhede in om \'n nuwe produk by te voeg.'}
                  </p>
                </div>
              </div>
            </div>
            
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="px-6 py-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={productForm.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-sm font-medium flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-[hsl(217,90%,50%)]" />
                          SKU / Kode
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="bv. PROD001" 
                            {...field} 
                            className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 text-sm font-medium flex items-center gap-2">
                          <Hash className="w-3.5 h-3.5 text-[hsl(217,90%,50%)]" />
                          Voorraad
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="bv. 50" 
                            {...field} 
                            className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-[hsl(217,90%,50%)]" />
                        Produknaam
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="bv. Koffie - Espresso" 
                          {...field} 
                          className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                    <span className="text-sm font-medium text-gray-300">Pryse</span>
                    <div className="flex-1 h-px bg-gray-700/50"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField
                      control={productForm.control}
                      name="costPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 text-xs font-medium">Kosprys</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
                              <Input 
                                placeholder="0.00" 
                                {...field} 
                                className="pl-7 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="retailPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 text-xs font-medium">Kleinhandelprys</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
                              <Input 
                                placeholder="0.00" 
                                {...field} 
                                className="pl-7 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="tradePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 text-xs font-medium">Groothandelprys</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R</span>
                              <Input 
                                placeholder="0.00" 
                                {...field} 
                                className="pl-7 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Category Selection */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                    <span className="text-sm font-medium text-gray-300">Kategorie</span>
                    <div className="flex-1 h-px bg-gray-700/50"></div>
                  </div>
                  <FormField
                    control={productForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select 
                            value={field.value?.toString() || "none"} 
                            onValueChange={(val) => field.onChange(val === "none" ? null : parseInt(val))}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-white h-11">
                              <SelectValue placeholder="Kies kategorie (opsioneel)" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="none" className="text-gray-400">Geen Kategorie</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()} className="text-gray-200">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                                    {cat.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsProductDialogOpen(false)}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 px-5"
                  >
                    Kanselleer
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] shadow-lg shadow-blue-500/30 px-6"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Stoor...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {editingProduct ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                        {editingProduct ? 'Bywerk Produk' : 'Voeg Produk By'}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Redigeer Klient" : "Voeg Nuwe Klient By"}
            </DialogTitle>
          </DialogHeader>
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(handleCustomerSubmit)} className="space-y-4">
              <FormField
                control={customerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naam</FormLabel>
                    <FormControl>
                      <Input placeholder="Klientnaam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoon (Opsioneel)</FormLabel>
                    <FormControl>
                      <Input placeholder="0123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="customerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Klienttipe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kies klienttipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="retail">Kleinhandel</SelectItem>
                        <SelectItem value="trade">Groothandel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas (Opsioneel)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enige addisionele notas..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                  Kanselleer
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                >
                  {createCustomerMutation.isPending || updateCustomerMutation.isPending ? 'Stoor...' : (editingCustomer ? 'Bywerk' : 'Skep')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Oop Rekening Skep Dialog */}
      <Dialog open={isOpenAccountDialogOpen} onOpenChange={setIsOpenAccountDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[500px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 shadow-2xl shadow-blue-900/30">
          <DialogHeader className="border-b border-gray-700/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-xl font-bold">Skep Oop Rekening</DialogTitle>
                <p className="text-gray-400 text-sm mt-1">Voeg items by 'n nuwe tafel of klient rekening</p>
              </div>
            </div>
          </DialogHeader>
          
          {/* Current Sale Summary */}
          {currentSale.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm font-medium">Huidige Items</span>
                <Badge variant="outline" className="border-[hsl(217,90%,40%)]/50 text-[hsl(217,90%,60%)]">
                  {currentSale.length} {currentSale.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Totaal Bedrag:</span>
                <span className="text-2xl font-bold text-[hsl(217,90%,60%)]">R{calculateTotal()}</span>
              </div>
            </div>
          )}
          
          <Form {...openAccountForm}>
            <form 
              onSubmit={openAccountForm.handleSubmit((data) => {
                const accountData = {
                  ...data,
                  items: currentSale,
                  total: calculateTotal(),
                  notes: saleNotes || null,
                };
                createOpenAccountMutation.mutate(accountData);
              })} 
              className="space-y-5"
            >
              <FormField
                control={openAccountForm.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-medium">Rekeningnaam</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="bv., Tafel 5, Jan Smit" 
                        {...field} 
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-12 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={openAccountForm.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-medium">Rekeningtipe</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => field.onChange('table')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                          field.value === 'table' 
                            ? 'border-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 shadow-lg shadow-blue-500/20' 
                            : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                          field.value === 'table' 
                            ? 'bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)]' 
                            : 'bg-gray-700/50'
                        }`}>
                          <FileText className={`w-5 h-5 ${field.value === 'table' ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <span className={`font-medium ${field.value === 'table' ? 'text-white' : 'text-gray-400'}`}>Tafel</span>
                        <span className="text-xs text-gray-500 mt-1">Restaurant tafel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange('customer')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                          field.value === 'customer' 
                            ? 'border-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 shadow-lg shadow-blue-500/20' 
                            : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                          field.value === 'customer' 
                            ? 'bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)]' 
                            : 'bg-gray-700/50'
                        }`}>
                          <Users className={`w-5 h-5 ${field.value === 'customer' ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <span className={`font-medium ${field.value === 'customer' ? 'text-white' : 'text-gray-400'}`}>Klient</span>
                        <span className="text-xs text-gray-500 mt-1">Klient rekening</span>
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={openAccountForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-medium">Notas (Opsioneel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enige addisionele notas..." 
                        {...field} 
                        className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 rounded-xl resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpenAccountDialogOpen(false)}
                  className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white px-6"
                >
                  Kanselleer
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 px-6"
                  disabled={createOpenAccountMutation.isPending || currentSale.length === 0}
                >
                  {createOpenAccountMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Besig...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Skep Rekening
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Management Password Dialog */}
      <Dialog open={managementPasswordDialog} onOpenChange={setManagementPasswordDialog}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[400px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bestuurstoegang Vereis</DialogTitle>
            <DialogDescription>
              Die Produkte en Verslae afdelings is beperk tot bestuurders. Meld asseblief aan met 'n bestuursrekening om toegang tot hierdie funksies te kry.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button
              onClick={closeManagementDialog}
              className="w-full"
            >
              Verstaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add Products to Category Dialog */}
      <Dialog open={isAddProductsToCategoryOpen} onOpenChange={setIsAddProductsToCategoryOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[600px] bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 shadow-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-gray-700/50 pb-4">
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[hsl(217,90%,50%)]" />
              Voeg Produkte by Kategorie
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Kies produkte om by "{categories.find(c => c.id === selectedSalesCategory)?.name || 'hierdie kategorie'}" te voeg. Produkte kan aan meerdere kategoriee behoort.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-2">
            {products.map((product) => {
              const isSelected = selectedProductsForCategory.includes(product.id);
              const productCategories = categories.filter(c => c.id === product.categoryId);
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedProductsForCategory(prev => prev.filter(id => id !== product.id));
                    } else {
                      setSelectedProductsForCategory(prev => [...prev, product.id]);
                    }
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/20' 
                      : 'border-gray-700/50 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-[hsl(217,90%,50%)] bg-[hsl(217,90%,50%)]' : 'border-gray-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{product.name}</p>
                        <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[hsl(217,90%,60%)]">R{product.retailPrice}</p>
                      <p className="text-xs text-gray-500">
                        {productCategories.length > 0 
                          ? productCategories.map(c => c.name).join(', ')
                          : 'Geen kategorie'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
            <span className="text-sm text-gray-400">
              {selectedProductsForCategory.length} produkte gekies
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddProductsToCategoryOpen(false);
                  setSelectedProductsForCategory([]);
                }}
              >
                Kanselleer
              </Button>
              <Button 
                onClick={() => {
                  if (selectedSalesCategory) {
                    bulkAddProductsToCategoryMutation.mutate({
                      productIds: selectedProductsForCategory,
                      categoryId: selectedSalesCategory
                    });
                  }
                }}
                className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white"
                disabled={bulkAddProductsToCategoryMutation.isPending}
              >
                {bulkAddProductsToCategoryMutation.isPending ? 'Stoor...' : 'Stoor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Logo Upload Dialog */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bywerk Maatskappy Logo</DialogTitle>
            <DialogDescription>
              Laai jou maatskappy logo op om jou POS sisteem te personaliseer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentUser?.companyLogo && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Huidige Logo:</p>
                <img 
                  src={currentUser.companyLogo} 
                  alt="Huidige Logo" 
                  className="h-20 w-20 object-cover rounded-lg mx-auto border"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="logoUpload">Kies Nuwe Logo</Label>
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={handleLogoFileUpload}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Aanbeveling: Vierkantige beelde werk die beste (PNG, JPG, maks 2MB)
              </p>
            </div>
            
            {logoFile && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Nuwe Logo Voorskou:</p>
                <img 
                  src={logoFile} 
                  alt="Nuwe Logo Voorskou" 
                  className="h-20 w-20 object-cover rounded-lg mx-auto border"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsLogoDialogOpen(false);
                  setLogoFile(null);
                }}
              >
                Kanselleer
              </Button>
              <Button 
                onClick={() => logoFile && logoUploadMutation.mutate(logoFile)}
                disabled={!logoFile || logoUploadMutation.isPending}
                className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              >
                {logoUploadMutation.isPending ? "Laai op..." : "Bywerk Logo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Receipt Customizer Dialog */}
      <ReceiptCustomizerDialog 
        isOpen={isReceiptCustomizerOpen}
        onClose={() => setIsReceiptCustomizerOpen(false)}
        currentUser={currentUser}
        setCurrentUser={(u) => { setCurrentUser(u); localStorage.setItem('posUser', JSON.stringify(u)); }}
        toast={toast}
        labels={{
          title: "Personaliseer Jou Kwitansie",
          description: "Personaliseer jou kwitansie met jou besigheidsinligting en pas die uitleg aan.",
          
          // Section labels
          sections: {
            logo: "Logo",
            businessInfo: "Besigheidsinligting",
            dateTime: "Datum & Tyd",
            staffInfo: "Personeellid Inligting",
            customerInfo: "Kliënt Inligting",
            items: "Items Lys",
            totals: "Totale",
            paymentInfo: "Betalingsinligting",
            messages: "Pasgemaakte Boodskappe",
          },
          
          // Card titles
          sectionOrderTitle: "Kwitansie Afdeling Volgorde",
          logoTitle: "Kwitansie Logo",
          businessInfoTitle: "Besigheidsinligting",
          displayOptionsTitle: "Vertoon Opsies",
          customMessagesTitle: "Pasgemaakte Boodskappe",
          
          // Logo section
          currentLogo: "Huidige Logo:",
          uploadLogoLabel: "Laai Pasgemaakte Logo Op (Opsioneel)",
          logoHelp: "Laai 'n pasgemaakte logo op vir kwitansies. Aanbeveel: Vierkant beelde werk beste (PNG, JPG, maks 2MB)",
          newLogoPreview: "Nuwe Logo Voorskou:",
          removeButton: "Verwyder",
          
          // Business info fields
          businessName: "Besigheidsnaam",
          phoneNumber: "Telefoonnommer",
          addressLine1: "Adreslyn 1",
          addressLine2: "Adreslyn 2",
          email: "E-pos",
          website: "Webwerf",
          registrationNumber: "Registrasienommer",
          vatNumber: "BTW Nommer",
          
          // Placeholders
          businessNamePlaceholder: "Jou Besigheidsnaam",
          phonePlaceholder: "+27 123 456 7890",
          addressLine1Placeholder: "123 Hoofstraat",
          addressLine2Placeholder: "Stad, Poskode",
          emailPlaceholder: "info@besigheid.com",
          websitePlaceholder: "www.besigheid.com",
          regNumberPlaceholder: "REG123456",
          vatNumberPlaceholder: "BTW123456",
          
          // Display options
          showLogo: "Wys Logo",
          showDateTime: "Wys Datum & Tyd",
          showStaffInfo: "Wys Personeellid Inligting",
          showCustomerInfo: "Wys Kliënt Inligting",
          showPaymentMethod: "Wys Betaalmetode",
          
          // Custom messages
          headerMessage: "Kopskrif Boodskap",
          headerPlaceholder: "Welkom! Spesiale aanbiedinge vandag...",
          thankYouMessage: "Dankie Boodskap",
          thankYouPlaceholder: "Dankie vir jou besigheid!",
          footerMessage: "Voetskrif Boodskap",
          footerPlaceholder: "Besoek ons weer! Terugsendings aanvaar binne 30 dae...",
          
          // Buttons and messages
          save: "Stoor Instellings",
          cancel: "Kanselleer",
          saving: "Stoor...",
          saveSuccess: "Kwitansie instellings suksesvol gestoor!",
          saveError: "Kon nie kwitansie instellings stoor nie",
          invoiceSetupTitle: "Faktuur & Kwotasie Opstelling",
          invoiceSetupDesc: "Skep pasgemaakte velde wat op u fakture en kwotasies verskyn.",
          addField: "Voeg Veld By",
          fieldLabel: "Veldetikket",
          fieldLabelPlaceholder: "bv. Model, Verwysing, Voertuig Reg",
          fieldPlaceholder: "Plekhouer (Opsioneel)",
          fieldPlaceholderEx: "bv. Toyota Corolla 2020",
          fieldSection: "Afdeling op Faktuur",
          sectionBillTo: "Stuur Aan",
          sectionBillToDesc: "Onder kliënt inligting",
          sectionDetails: "Besonderhede",
          sectionDetailsDesc: "Regterkantse kolom",
          sectionFooter: "Voetskrif",
          sectionFooterDesc: "Onderkant van dokument",
          noCustomFields: "Geen pasgemaakte velde nie. Klik \"Voeg Veld By\" om een te skep.",
          newField: "Nuwe Pasgemaakte Veld",
        }}
      />
      <ReceiptCustomizerDialog
        isOpen={isInvoiceSetupOpen}
        onClose={() => setIsInvoiceSetupOpen(false)}
        currentUser={currentUser}
        setCurrentUser={(u) => { setCurrentUser(u); localStorage.setItem('posUser', JSON.stringify(u)); }}
        toast={toast}
        invoiceSetupOnly={true}
        labels={{
          invoiceSetupTitle: "Faktuur & Kwotasie Opstelling",
          invoiceSetupDesc: "Skep pasgemaakte velde wat op u fakture en kwotasies verskyn.",
          addField: "Voeg Veld By",
          fieldLabel: "Veldetikket",
          fieldLabelPlaceholder: "bv. Model, Verwysing, Voertuig Reg",
          fieldPlaceholder: "Plekhouer (Opsioneel)",
          fieldPlaceholderEx: "bv. Toyota Corolla 2020",
          fieldSection: "Afdeling op Faktuur",
          sectionBillTo: "Stuur Aan",
          sectionBillToDesc: "Onder kliënt inligting",
          sectionDetails: "Besonderhede",
          sectionDetailsDesc: "Regterkantse kolom",
          sectionFooter: "Voetskrif",
          sectionFooterDesc: "Onderkant van dokument",
          cancel: "Kanselleer",
          save: "Stoor Instellings",
          saving: "Stoor...",
          noCustomFields: "Geen pasgemaakte velde nie. Klik \"Voeg Veld By\" om een te skep.",
          newField: "Nuwe Pasgemaakte Veld",
        }}
      />
      {/* Void Sale Dialog */}
      <Dialog open={voidSaleDialog.open} onOpenChange={(open) => {
        if (!open) {
          setVoidSaleDialog({ open: false, sale: null });
          setVoidReason("");
        }
      }}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kanselleer Verkoop</DialogTitle>
            <DialogDescription>
              Voer die rede in vir die kansellasie van hierdie verkoop. Hierdie aksie kan nie ongedaan gemaak word nie.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {voidSaleDialog.sale && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Verkoop #{voidSaleDialog.sale.id}</p>
                <p className="text-sm text-gray-600">Bedrag: R{voidSaleDialog.sale.total}</p>
                <p className="text-xs text-gray-500">
                  {new Date(voidSaleDialog.sale.createdAt).toLocaleString('af-ZA')}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="voidReason">Rede vir kansellasie</Label>
              <Textarea
                id="voidReason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Voer die rede in vir die kansellasie van hierdie verkoop..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setVoidSaleDialog({ open: false, sale: null });
                  setVoidReason("");
                }}
              >
                Kanselleer
              </Button>
              <Button 
                onClick={handleVoidSaleSubmit}
                disabled={!voidReason.trim() || voidSaleMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {voidSaleMutation.isPending ? "Kanselleer..." : "Kanselleer Verkoop"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* View Void Reason Dialog */}
      <Dialog open={viewVoidDialog.open} onOpenChange={(open) => {
        if (!open) {
          setViewVoidDialog({ open: false, sale: null });
        }
      }}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gekanselleerde Verkoop Besonderhede</DialogTitle>
          </DialogHeader>
          {viewVoidDialog.sale && (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-red-800">Verkoop #{viewVoidDialog.sale.id}</p>
                <p className="text-sm text-red-600">Bedrag: R{viewVoidDialog.sale.total}</p>
                <p className="text-xs text-red-500">
                  Oorspronklik: {new Date(viewVoidDialog.sale.createdAt).toLocaleString('af-ZA')}
                </p>
                {viewVoidDialog.sale.voidedAt && (
                  <p className="text-xs text-red-500">
                    Gekanselleer: {new Date(viewVoidDialog.sale.voidedAt).toLocaleString('af-ZA')}
                  </p>
                )}
              </div>
              <div>
                <Label>Rede vir kansellasie:</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded border">
                  <p className="text-sm">{viewVoidDialog.sale.voidReason || 'Geen rede verskaf nie'}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setViewVoidDialog({ open: false, sale: null })}>
                  Sluit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Staff Password Verification Dialog */}
      <Dialog open={isStaffPasswordDialogOpen} onOpenChange={(open) => {
        setIsStaffPasswordDialogOpen(open);
        if (!open) {
          setStaffPassword("");
          setSelectedStaffForAuth(null);
        }
      }}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Voer Wagwoord In</DialogTitle>
            <DialogDescription>
              Voer die wagwoord in vir {selectedStaffForAuth?.username}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (selectedStaffForAuth && staffPassword) {
              authenticateStaffMutation.mutate({ 
                username: selectedStaffForAuth.username, 
                password: staffPassword, 
                userId: currentUser?.id 
              });
            }
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="staff-password-input">Wagwoord</Label>
                <Input
                  id="staff-password-input"
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Voer wagwoord in"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsStaffPasswordDialogOpen(false);
                    setStaffPassword("");
                    setSelectedStaffForAuth(null);
                  }}
                >
                  Kanselleer
                </Button>
                <Button 
                  type="submit"
                  disabled={authenticateStaffMutation.isPending}
                  className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                >
                  {authenticateStaffMutation.isPending ? "Verifieer..." : "Meld aan"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Simplified Staff Creation Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Skep Nuwe Gebruiker</DialogTitle>
            <DialogDescription>
              Voeg 'n nuwe personeel of bestuurder by jou POS-stelsel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const username = formData.get('username') as string;
            const password = formData.get('password') as string;
            const userType = formData.get('user-type') as 'staff' | 'management';
            
            if (username && password && userType) {
              createStaffAccountMutation.mutate({
                username,
                password,
                userType,
                userId: currentUser?.id
              });
            }
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-username">Naam</Label>
                <Input
                  id="create-username"
                  name="username"
                  type="text"
                  required
                  placeholder="Voer gebruikersnaam in"
                />
              </div>
              <div>
                <Label htmlFor="create-user-type">Rol</Label>
                <Select name="user-type" required defaultValue="staff">
                  <SelectTrigger id="create-user-type">
                    <SelectValue placeholder="Kies rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Personeel</SelectItem>
                    <SelectItem value="management">Bestuur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-password">Wagwoord</Label>
                <Input
                  id="create-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Voer wagwoord in"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsStaffDialogOpen(false)}
                >
                  Kanselleer
                </Button>
                <Button 
                  type="submit"
                  disabled={createStaffAccountMutation.isPending}
                  className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                >
                  {createStaffAccountMutation.isPending ? "Skep..." : "Skep Gebruiker"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* User Management Dialog - Enterprise Design */}
      <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-2xl max-h-[85vh] p-0 bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(217,30%,18%)] to-[hsl(217,30%,15%)] px-6 py-5 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {staffAccounts.length === 0 ? "Skep Jou Eerste Gebruiker" : "Gebruikersbestuur"}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-sm mt-0.5">
                  {staffAccounts.length === 0 
                    ? "Stel jou eerste rekening op om te begin."
                    : `${staffAccounts.length} gebruiker${staffAccounts.length === 1 ? '' : 's'} geregistreer`
                  }
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Existing Staff Accounts */}
            {staffAccounts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Span Lede</h3>
                  <div className="flex-1 h-px bg-gray-700/50 ml-2"></div>
                </div>
                <div className="space-y-3">
                  {staffAccounts.map((staff) => {
                    const isCurrentLoggedIn = currentStaff?.id === staff.id;
                    return (
                      <motion.div 
                        key={staff.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                          isCurrentLoggedIn 
                            ? 'bg-[hsl(217,90%,40%)]/10 border-[hsl(217,90%,40%)]/30' 
                            : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50'
                        }`}
                      >
                        {/* User Avatar */}
                        <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl ${
                          staff.userType === 'management'
                            ? 'bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)]'
                            : 'bg-gradient-to-br from-gray-600 to-gray-700'
                        } shadow-lg`}>
                          <User className="h-6 w-6 text-white" />
                          {isCurrentLoggedIn && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg" />
                          )}
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white truncate">
                              {staff.displayName || staff.username}
                            </span>
                            {isCurrentLoggedIn && (
                              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-500/20 text-green-400 border border-green-500/30">
                                Aanlyn
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              className={`text-[10px] px-1.5 py-0 h-4 ${
                                staff.userType === 'management' 
                                  ? 'bg-[hsl(217,90%,40%)]/20 text-[hsl(217,90%,60%)] border border-[hsl(217,90%,40%)]/30' 
                                  : 'bg-gray-700 text-gray-300 border border-gray-600'
                              }`}
                            >
                              {staff.userType === 'management' ? 'Bestuur' : 'Personeel'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {staff.isActive ? 'Aktief' : 'Onaktief'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Is jy seker jy wil ${staff.username} verwyder? Hierdie aksie kan nie ontdoen word nie.`)) {
                                deleteStaffAccountMutation.mutate(staff.id);
                              }
                            }}
                            disabled={deleteStaffAccountMutation.isPending || isCurrentLoggedIn}
                            className={`p-2 h-9 w-9 rounded-lg transition-all ${
                              isCurrentLoggedIn 
                                ? 'opacity-30 cursor-not-allowed' 
                                : 'hover:bg-red-500/20 hover:text-red-400 text-gray-400'
                            }`}
                            title={isCurrentLoggedIn ? "Kan nie jouself verwyder nie" : "Verwyder gebruiker"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Create New Staff Account */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Voeg Nuwe Gebruiker By</h3>
                <div className="flex-1 h-px bg-gray-700/50 ml-2"></div>
              </div>
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-5">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const username = formData.get('new-username') as string;
                  const password = formData.get('new-password') as string;
                  const userType = formData.get('user-type') as 'staff' | 'management';
                  
                  if (username && password && userType) {
                    createStaffAccountMutation.mutate({
                      username,
                      password,
                      userType,
                      userId: currentUser?.id
                    });
                    (e.target as HTMLFormElement).reset();
                  }
                }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block">Gebruikersnaam</Label>
                      <Input
                        id="new-username"
                        name="new-username"
                        type="text"
                        required
                        placeholder="Voer naam in"
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block">Wagwoord</Label>
                      <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                        required
                        placeholder="Voer wagwoord in"
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20"
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <Label className="text-gray-300 text-sm font-medium mb-2 block">Rol</Label>
                    <Select name="user-type" required defaultValue={staffAccounts.length === 0 ? "management" : "staff"}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20">
                        <SelectValue placeholder="Kies rol" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="staff" className="text-white hover:bg-gray-700 focus:bg-gray-700">Personeel</SelectItem>
                        <SelectItem value="management" className="text-white hover:bg-gray-700 focus:bg-gray-700">Bestuur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={createStaffAccountMutation.isPending}
                    className="w-full bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,40%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,45%)] text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {createStaffAccountMutation.isPending ? "Skep tans..." : "Skep Gebruiker"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Empty State */}
            {staffAccounts.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">Nog geen gebruikers geskep nie.</p>
                <p className="text-gray-600 text-xs mt-1">Gebruik die vorm hierbo om jou eerste gebruiker te skep.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-900/50 border-t border-gray-700/50 px-6 py-4 flex justify-end">
            <Button 
              onClick={() => setIsUserManagementOpen(false)}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-gray-700/50"
            >
              Sluit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Bank Details Dialog - Afrikaans */}
      <Dialog open={isBankDetailsOpen} onOpenChange={setIsBankDetailsOpen}>
        <DialogContent className="sm:max-w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-gray-950 border border-[hsl(217,90%,40%)]/30 shadow-2xl shadow-blue-900/30 p-0">
          <div className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(217,90%,50%)] via-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]"></div>
            
            <DialogHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,30%)] flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white">Betalingsbesonderhede</DialogTitle>
                  <DialogDescription className="text-gray-400 mt-0.5">
                    Bankrekeningbesonderhede vir Storm POS diensfooi betalings
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          
            <div className="px-6 pb-6 space-y-5">
              <div className="bg-gray-900/80 rounded-xl border border-[hsl(217,90%,40%)]/20 p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-[hsl(217,90%,40%)]/15 rounded-lg flex items-center justify-center border border-[hsl(217,90%,40%)]/30">
                    <CreditCard className="w-5 h-5 text-[hsl(217,90%,50%)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Nedbank Rekening</h3>
                    <p className="text-xs text-gray-500">Vir Storm POS diensfooi betalings</p>
                  </div>
                </div>
                
                <div className="space-y-0">
                  {[
                    { label: 'Rekeninghouer', value: 'Storm', mono: false },
                    { label: 'Rekeningnommer', value: '1229368612', mono: true },
                    { label: 'Rekeningtipe', value: 'Lopende Rekening', mono: false },
                    { label: 'Banknaam', value: 'Nedbank', mono: false },
                    { label: 'Takkode', value: '198765', mono: true },
                  ].map((item, i) => (
                    <div key={i} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-0 py-3.5 ${i < 4 ? 'border-b border-white/5' : ''}`}>
                      <span className="text-sm text-gray-400">{item.label}</span>
                      <span className={`font-semibold text-white ${item.mono ? 'font-mono bg-[hsl(217,90%,40%)]/10 px-3 py-1 rounded-md border border-[hsl(217,90%,40%)]/20 text-[hsl(217,90%,60%)]' : ''}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-300 text-sm mb-2">Betalingsinstruksies</h4>
                    <ul className="text-sm text-amber-200/70 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                        Gebruik jou geregistreerde besigheidsnaam as betalingsverwysing
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                        Betaal maandelikse diensfooie teen die laaste dag van elke maand
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                        Hou bewys van betaling vir jou rekords
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl border border-white/5 p-4 text-center">
                <p className="text-sm text-gray-400">Vrae oor fakturering of betalings?</p>
                <p className="font-medium text-[hsl(217,90%,50%)] mt-1 text-sm">
                  softwarebystorm@gmail.com
                </p>
              </div>

              <Button onClick={() => setIsBankDetailsOpen(false)} className="w-full h-11 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 rounded-lg">
                Sluit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Invoice Creation/Edit Dialog */}
      <Dialog 
        open={isInvoiceDialogOpen} 
        onOpenChange={(open) => {
          setIsInvoiceDialogOpen(open);
          if (!open) {
            setEditingInvoice(null);
            setInvoiceItems([]);
            setInvoiceClientId(null);
            setInvoiceCustomClient("");
            setInvoiceClientEmail("");
            setInvoiceClientPhone("");
            setIsCustomClient(true);
            setInvoiceDueDate("");
            setInvoiceNotes("");
            setInvoicePoNumber("");
            setInvoiceDueTerms("7 dae");
            setInvoiceDiscountPercent("0");
            setInvoiceShippingAmount("0");
            setInvoicePaymentMethod("");
            setInvoicePaymentDetails("");
            setInvoiceTerms("");
            setInvoiceTaxEnabled(true);
            setInvoiceType('invoice');
            setInvoiceCustomFieldValues(getInvoiceVisDefs());
            setInvoiceShowBusinessInfo(true);
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-0.5rem)] sm:w-auto sm:max-w-3xl max-h-[94vh] overflow-hidden flex flex-col p-0 gap-0">
          {/* Sticky Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {editingInvoice ? 'Wysig' : 'Skep'} {invoiceType === 'invoice' ? 'Faktuur' : 'Kwotasie'}
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">Vul die besonderhede hieronder in</p>
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
              <button
                type="button"
                onClick={() => { if (!editingInvoice) setInvoiceType('invoice'); }}
                disabled={!!editingInvoice}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${invoiceType === 'invoice' ? 'bg-[hsl(217,90%,40%)] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Faktuur
              </button>
              <button
                type="button"
                onClick={() => { if (!editingInvoice) setInvoiceType('quote'); }}
                disabled={!!editingInvoice}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${invoiceType === 'quote' ? 'bg-[hsl(217,90%,40%)] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Kwotasie
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5 space-y-5">

            {/* Section: Client */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Kliëntbesonderhede</h3>
                <button
                  type="button"
                  onClick={() => { setIsCustomClient(!isCustomClient); if (!isCustomClient) { setInvoiceClientId(null); } else { setInvoiceCustomClient(""); } }}
                  className="ml-auto text-xs text-[hsl(217,90%,40%)] hover:underline font-medium"
                  data-testid="button-toggle-custom-client"
                >
                  {isCustomClient ? "Kies uit lys" : "Pasgemaakte kliënt"}
                </button>
              </div>
              <div className="p-4 space-y-4 bg-white">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Kliënt *</Label>
                  {isCustomClient ? (
                    <Input type="text" value={invoiceCustomClient} onChange={(e) => setInvoiceCustomClient(e.target.value)} placeholder="Voer kliëntnaam in" data-testid="input-custom-client" />
                  ) : (
                    <Select value={invoiceClientId?.toString() || ""} onValueChange={(v) => setInvoiceClientId(parseInt(v))} data-testid="select-client">
                      <SelectTrigger><SelectValue placeholder="Kies kliënt..." /></SelectTrigger>
                      <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </div>
                {(invoiceCardColumns.has('clientEmail') || invoiceCardColumns.has('clientPhone')) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {invoiceCardColumns.has('clientEmail') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">E-posadres</Label>
                        <Input type="email" value={invoiceClientEmail} onChange={(e) => setInvoiceClientEmail(e.target.value)} placeholder="klient@voorbeeld.com" />
                      </div>
                    )}
                    {invoiceCardColumns.has('clientPhone') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Telefoonnommer</Label>
                        <Input type="tel" value={invoiceClientPhone} onChange={(e) => setInvoiceClientPhone(e.target.value)} placeholder="+27 12 345 6789" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section: Document Details */}
            {(invoiceCardColumns.has('poNumber') || invoiceCardColumns.has('dueTerms') || invoiceCardColumns.has('dueDate')) && (
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">Dokumentbesonderhede</h3>
                </div>
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {invoiceCardColumns.has('poNumber') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">PO Nommer</Label>
                        <Input type="text" value={invoicePoNumber} onChange={(e) => setInvoicePoNumber(e.target.value)} placeholder="PO-0001" />
                      </div>
                    )}
                    {invoiceCardColumns.has('dueTerms') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Betalingsvoorwaardes</Label>
                        <Select value={invoiceDueTerms} onValueChange={setInvoiceDueTerms}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Geen</SelectItem>
                            <SelectItem value="7 dae">7 Dae</SelectItem>
                            <SelectItem value="14 dae">14 Dae</SelectItem>
                            <SelectItem value="30 dae">30 Dae</SelectItem>
                            <SelectItem value="60 dae">60 Dae</SelectItem>
                            <SelectItem value="90 dae">90 Dae</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {invoiceCardColumns.has('dueDate') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Vervaldatum</Label>
                        <Input type="date" value={invoiceDueDate} onChange={(e) => setInvoiceDueDate(e.target.value)} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section: Line Items */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Lynitemme</h3>
                <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{invoiceItems.length} {invoiceItems.length === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="bg-white p-4 space-y-3">
                {/* Items table */}
                {invoiceItems.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item</th>
                          <th className="text-center px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-14">Hv</th>
                          <th className="text-right px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24">Prys</th>
                          <th className="text-right px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24">Totaal</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {invoiceItems.map((item, index) => {
                          const product = item.productId ? products.find(p => p.id === item.productId) : null;
                          const itemName = item.customName || product?.name || '';
                          return (
                            <tr key={index} className="group hover:bg-[hsl(217,90%,40%)]/5 transition-colors">
                              <td className="px-4 py-2.5">
                                <input
                                  type="text"
                                  value={itemName}
                                  onChange={(e) => { const u=[...invoiceItems]; u[index]={...u[index],customName:e.target.value,productId:undefined}; setInvoiceItems(u); }}
                                  className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none border-b border-transparent focus:border-[hsl(217,90%,40%)] py-0.5 transition-colors placeholder:text-gray-300"
                                />
                              </td>
                              <td className="px-2 py-2.5 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => { const u=[...invoiceItems]; u[index]={...u[index],quantity:Math.max(1,parseInt(e.target.value)||1)}; setInvoiceItems(u); }}
                                  className="w-12 text-center text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[hsl(217,90%,40%)] py-1"
                                />
                              </td>
                              <td className="px-2 py-2.5">
                                <div className="flex items-center justify-end gap-0.5">
                                  <span className="text-gray-400 text-xs">R</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.price}
                                    onChange={(e) => { const u=[...invoiceItems]; u[index]={...u[index],price:parseFloat(e.target.value)||0}; setInvoiceItems(u); }}
                                    className="w-20 text-right text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[hsl(217,90%,40%)] py-1 px-1.5"
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <span className="text-sm font-bold text-gray-900">R{(item.price * item.quantity).toFixed(2)}</span>
                              </td>
                              <td className="pr-2 py-2.5">
                                <button
                                  type="button"
                                  onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}
                                  className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="space-y-2">
                
                {/* Enterprise Product Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setInvoicePickerOpen(!invoicePickerOpen); setInvoicePickerSearch(""); setInvoiceCategoryFilter(null); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[hsl(217,90%,40%)] bg-white"
                  >
                    <span className="flex items-center gap-2 text-gray-500">
                      <Package className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                      Kies produk van voorraad...
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${invoicePickerOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {invoicePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setInvoicePickerOpen(false)} />
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                        {/* Search + Price Toggle */}
                        <div className="p-3 border-b bg-gray-50 space-y-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              autoFocus
                              value={invoicePickerSearch}
                              onChange={(e) => setInvoicePickerSearch(e.target.value)}
                              placeholder="Soek op naam of SKU..."
                              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(217,90%,40%)] bg-white"
                            />
                          </div>
                          {products.some(p => p.tradePrice && parseFloat(p.tradePrice) > 0) && (
                            <div className="flex bg-white border rounded-lg p-0.5 gap-0.5">
                              <button
                                type="button"
                                onClick={() => setInvoicePriceMode('retail')}
                                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${invoicePriceMode === 'retail' ? 'bg-[hsl(217,90%,40%)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                              >
                                Kleinhandelprys
                              </button>
                              <button
                                type="button"
                                onClick={() => setInvoicePriceMode('trade')}
                                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${invoicePriceMode === 'trade' ? 'bg-[hsl(217,90%,40%)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                              >
                                Handelsprys
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Category Pills */}
                        {categories.length > 0 && (
                          <div className="flex gap-1.5 px-3 py-2 border-b overflow-x-auto bg-white" style={{ scrollbarWidth: 'none' }}>
                            <button
                              type="button"
                              onClick={() => setInvoiceCategoryFilter(null)}
                              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${invoiceCategoryFilter === null ? 'bg-[hsl(217,90%,40%)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              Alles
                            </button>
                            {categories.map(cat => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setInvoiceCategoryFilter(cat.id)}
                                className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${invoiceCategoryFilter === cat.id ? 'bg-[hsl(217,90%,40%)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Products */}
                        <div className="max-h-64 overflow-y-auto">
                          {(() => {
                            const filtered = products.filter(p => {
                              const matchesCat = invoiceCategoryFilter === null || p.categoryId === invoiceCategoryFilter;
                              const q = invoicePickerSearch.toLowerCase();
                              const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
                              return matchesCat && matchesSearch;
                            });
                            if (filtered.length === 0) {
                              return (
                                <div className="py-10 text-center text-sm text-gray-400 flex flex-col items-center gap-2">
                                  <Package className="w-8 h-8 text-gray-200" />
                                  Geen produkte gevind nie
                                </div>
                              );
                            }
                            return filtered.map(product => {
                              const price = invoicePriceMode === 'trade' && product.tradePrice && parseFloat(product.tradePrice) > 0
                                ? parseFloat(product.tradePrice)
                                : parseFloat(product.retailPrice);
                              return (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => {
                                    setInvoiceItems([...invoiceItems, { productId: product.id, quantity: 1, price }]);
                                    setInvoicePickerOpen(false);
                                    setInvoicePickerSearch("");
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(217,90%,97%)] border-b last:border-b-0 text-left transition-colors group"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                                    {product.sku && <div className="text-xs text-gray-400 mt-0.5 font-mono">SKU: {product.sku}</div>}
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <div className="text-sm font-semibold text-[hsl(217,90%,40%)]">R{price.toFixed(2)}</div>
                                    <div className="text-xs text-gray-400">{invoicePriceMode === 'retail' ? 'Kleinhandel' : 'Handel'}</div>
                                  </div>
                                  <Plus className="w-4 h-4 text-[hsl(217,90%,40%)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Quick Add Custom Product */}
                <div className="border-t pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-[hsl(217,90%,40%)] border-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,95%)]"
                    onClick={() => setShowQuickAddProduct(!showQuickAddProduct)}
                    data-testid="button-toggle-quick-add-af"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {showQuickAddProduct ? 'Versteek Vinnige Byvoeging' : 'Voeg Produk/Diens Vinnig By'}
                  </Button>
                  
                  {showQuickAddProduct && (
                    <div className="mt-2 p-3 border rounded-lg bg-gray-50 space-y-2">
                      <p className="text-xs text-gray-500">Voeg 'n tydelike item by (word nie gestoor in produklys nie)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Produk/Diens Naam</Label>
                          <input
                            type="text"
                            value={quickAddName}
                            onChange={(e) => setQuickAddName(e.target.value)}
                            placeholder="bv. Aangepaste Diens"
                            className="w-full px-2 py-1.5 text-sm border rounded"
                            data-testid="input-quick-add-name-af"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Prys (R)</Label>
                          <input
                            type="number"
                            value={quickAddPrice}
                            onChange={(e) => setQuickAddPrice(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1.5 text-sm border rounded"
                            data-testid="input-quick-add-price-af"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="w-full bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                        disabled={!quickAddName.trim() || !quickAddPrice || parseFloat(quickAddPrice) <= 0}
                        onClick={() => {
                          if (quickAddName.trim() && quickAddPrice && parseFloat(quickAddPrice) > 0) {
                            setInvoiceItems([...invoiceItems, {
                              customName: quickAddName.trim(),
                              quantity: 1,
                              price: parseFloat(quickAddPrice)
                            }]);
                            setQuickAddName("");
                            setQuickAddPrice("");
                            toast({
                              title: "Item Bygevoeg",
                              description: `"${quickAddName.trim()}" bygevoeg tot ${invoiceType === 'invoice' ? 'faktuur' : 'kwotasie'}`,
                            });
                          }
                        }}
                        data-testid="button-add-quick-product-af"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Voeg by {invoiceType === 'invoice' ? 'Faktuur' : 'Kwotasie'}
                      </Button>
                    </div>
                  )}
                </div>
                  </div>
                  </div>
                </div>
              </div>

            {/* Section: Totals */}
            {invoiceItems.length > 0 && (() => {
              const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const discountAmt = invoiceDiscountType === 'percent'
                ? subtotal * (parseFloat(invoiceDiscountPercent) / 100)
                : parseFloat(invoiceDiscountAmount) || 0;
              const afterDiscount = subtotal - discountAmt;
              const taxAmt = invoiceTaxEnabled ? afterDiscount * 0.15 : 0;
              const shipping = parseFloat(invoiceShippingAmount) || 0;
              const total = afterDiscount + taxAmt + shipping;
              return (
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">Totale</h3>
                  </div>
                  <div className="bg-white px-5 py-4 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotaal</span>
                      <span className="font-medium text-gray-900">R{subtotal.toFixed(2)}</span>
                    </div>
                    {invoiceCardColumns.has('discount') && (
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Afslag</span>
                          <select value={invoiceDiscountType} onChange={(e) => setInvoiceDiscountType(e.target.value as 'percent' | 'amount')} className="px-2 py-0.5 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:outline-none focus:border-[hsl(217,90%,40%)]">
                            <option value="percent">%</option>
                            <option value="amount">R</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1">
                          {invoiceDiscountType === 'amount' && <span className="text-xs text-gray-400">R</span>}
                          <input type="number" value={invoiceDiscountType === 'percent' ? invoiceDiscountPercent : invoiceDiscountAmount} onChange={(e) => { if (invoiceDiscountType === 'percent') { setInvoiceDiscountPercent(e.target.value); } else { setInvoiceDiscountAmount(e.target.value); } }} className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-right text-sm bg-gray-50 focus:outline-none focus:border-[hsl(217,90%,40%)]" min="0" max={invoiceDiscountType === 'percent' ? "100" : undefined} step="0.01" />
                          {invoiceDiscountType === 'percent' && <span className="text-xs text-gray-400">%</span>}
                        </div>
                      </div>
                    )}
                    {discountAmt > 0 && (
                      <div className="flex justify-between text-sm text-red-500">
                        <span>Afslag Bedrag</span>
                        <span>-R{discountAmt.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>BTW (15%)</span>
                      <Switch checked={invoiceTaxEnabled} onCheckedChange={setInvoiceTaxEnabled} />
                    </div>
                    {invoiceTaxEnabled && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>BTW Bedrag</span>
                        <span className="font-medium text-gray-900">R{taxAmt.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Versending</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">R</span>
                        <input type="number" value={invoiceShippingAmount} onChange={(e) => setInvoiceShippingAmount(e.target.value)} className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-right text-sm bg-gray-50 focus:outline-none focus:border-[hsl(217,90%,40%)]" min="0" step="0.01" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="font-bold text-gray-900 text-base">Totaal</span>
                      <span className="font-bold text-xl text-[hsl(217,90%,40%)]">R{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Section: Payment */}
            {invoiceCardColumns.has('paymentMethod') && (
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">Betaling</h3>
                </div>
                <div className="bg-white p-4 space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Betaalmetode</Label>
                    <Select value={invoicePaymentMethod} onValueChange={setInvoicePaymentMethod}>
                      <SelectTrigger><SelectValue placeholder="Kies betaalmetode" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kontant">Kontant</SelectItem>
                        <SelectItem value="Kaart">Kaart</SelectItem>
                        <SelectItem value="EFT">EFT</SelectItem>
                        <SelectItem value="Ander">Ander</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Betalingsbesonderhede</Label>
                      {savedPaymentDetails.length > 0 && (
                        <Select value="" onValueChange={(id) => { const s = savedPaymentDetails.find((x: any) => x.id.toString() === id); if (s) setInvoicePaymentDetails(s.details); }}>
                          <SelectTrigger className="w-40 h-7 text-xs" data-testid="select-saved-payment-af"><SelectValue placeholder="Gestoorde..." /></SelectTrigger>
                          <SelectContent>{savedPaymentDetails.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    </div>
                    <textarea value={invoicePaymentDetails} onChange={(e) => setInvoicePaymentDetails(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] resize-none" rows={2} placeholder="Bankbesonderhede, betalingsinstruksies..." />
                    {invoicePaymentDetails.trim() && (
                      <Button type="button" variant="outline" size="sm" className="mt-2 text-xs h-7" onClick={() => setIsSavePaymentDialogOpen(true)} data-testid="button-save-payment-details-af">
                        <PlusCircle className="w-3 h-3 mr-1" />Stoor Besonderhede
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section: Notes & Terms */}
            {(invoiceCardColumns.has('notes') || true) && (
              <div className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">Notas & Terme</h3>
                </div>
                <div className="bg-white p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {invoiceCardColumns.has('notes') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Notas <span className="normal-case text-gray-400 font-normal">({invoiceNotes.length}/300)</span></Label>
                        <textarea value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value.slice(0, 300))} maxLength={300} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] resize-none" rows={3} placeholder="Addisionele notas..." />
                      </div>
                    )}
                    <div>
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Terme & Voorwaardes <span className="normal-case text-gray-400 font-normal">({invoiceTerms.length}/500)</span></Label>
                      <textarea value={invoiceTerms} onChange={(e) => setInvoiceTerms(e.target.value.slice(0, 500))} maxLength={500} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] resize-none" rows={3} placeholder="Betalingsvoorwaardes en -terme..." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Document Options + Custom Fields */}
            {(() => {
              const invoiceCfSettings = mergeReceiptSettingsAfrikaans(currentUser?.receiptSettings);
              const invoiceCfs = (invoiceCfSettings as any).invoiceSettings?.customFields || [];
              return (
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">Dokumentopsies</h3>
                  </div>
                  <div className="bg-white p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Wys Besigheidsinligting</p>
                        <p className="text-xs text-gray-400 mt-0.5">Vertoon maatskappybesonderhede op die PDF</p>
                      </div>
                      <button type="button" onClick={() => setInvoiceShowBusinessInfo(!invoiceShowBusinessInfo)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${invoiceShowBusinessInfo ? 'bg-[hsl(217,90%,40%)] text-white border-[hsl(217,90%,40%)]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                        {invoiceShowBusinessInfo ? <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                        {invoiceShowBusinessInfo ? 'Sigbaar' : 'Versteek'}
                      </button>
                    </div>
                    {invoiceCfs.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pasgemaakte Velde</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {invoiceCfs.map((field: any) => (
                            <div key={field.id}>
                              <Label className="text-xs font-medium text-gray-600 mb-1 block">{field.label}</Label>
                              <Input type="text" value={invoiceCustomFieldValues[`cf_${field.id}`] || ''} onChange={(e) => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, [`cf_${field.id}`]: e.target.value }))} placeholder={field.placeholder || field.label} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 bg-white shrink-0">
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)} className="px-5">
              Kanselleer
            </Button>
            <Button 
                onClick={() => {
                  const trimmedCustomClient = invoiceCustomClient.trim();
                  
                  if (isCustomClient) {
                    if (!trimmedCustomClient) {
                      toast({
                        title: "Ontbrekende Inligting",
                        description: "Voer asseblief 'n kliëntnaam in",
                        variant: "destructive"
                      });
                      return;
                    }
                  } else {
                    if (!invoiceClientId) {
                      toast({
                        title: "Ontbrekende Inligting",
                        description: "Kies asseblief 'n kliënt",
                        variant: "destructive"
                      });
                      return;
                    }
                  }
                  
                  if (invoiceItems.length === 0) {
                    toast({
                      title: "Geen Lynitemme",
                      description: "Voeg asseblief ten minste een produk by die faktuur",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const discountPercent = invoiceDiscountType === 'percent' ? (parseFloat(invoiceDiscountPercent) || 0) : 0;
                  const discountAmountValue = invoiceDiscountType === 'amount' 
                    ? (parseFloat(invoiceDiscountAmount) || 0)
                    : subtotal * (discountPercent / 100);
                  const afterDiscount = subtotal - discountAmountValue;
                  const taxAmount = invoiceTaxEnabled ? afterDiscount * 0.15 : 0;
                  const shipping = parseFloat(invoiceShippingAmount) || 0;
                  const total = afterDiscount + taxAmount + shipping;
                  
                  let clientName: string;
                  if (isCustomClient) {
                    clientName = trimmedCustomClient;
                  } else {
                    const selectedCustomer = customers.find(c => c.id === invoiceClientId);
                    if (!selectedCustomer) {
                      toast({
                        title: "Fout",
                        description: "Geselekteerde kliënt nie gevind nie. Kies asseblief 'n geldige kliënt.",
                        variant: "destructive"
                      });
                      return;
                    }
                    clientName = selectedCustomer.name;
                  }
                  
                  const invoiceData = {
                    documentType: invoiceType,
                    status: editingInvoice ? editingInvoice.status : 'draft',
                    clientId: isCustomClient ? undefined : invoiceClientId,
                    clientName: isCustomClient ? trimmedCustomClient : undefined,
                    clientEmail: invoiceClientEmail || null,
                    clientPhone: invoiceClientPhone || null,
                    title: `${invoiceType === 'invoice' ? 'Faktuur' : 'Kwotasie'} vir ${clientName}`,
                    poNumber: invoicePoNumber || undefined,
                    dueTerms: invoiceDueTerms === 'none' ? undefined : invoiceDueTerms,
                    dueDate: invoiceDueDate || undefined,
                    items: invoiceItems.map(item => ({
                      productId: item.productId,
                      name: item.customName || products.find(p => p.id === item.productId)?.name || '',
                      quantity: item.quantity,
                      price: parseFloat(item.price.toFixed(2)),
                      lineTotal: parseFloat((item.price * item.quantity).toFixed(2))
                    })),
                    subtotal: subtotal.toFixed(2),
                    discountPercent: discountPercent.toFixed(2),
                    discountAmount: discountAmountValue.toFixed(2),
                    taxPercent: invoiceTaxEnabled ? "15.00" : "0.00",
                    tax: taxAmount.toFixed(2),
                    shippingAmount: shipping.toFixed(2),
                    total: total.toFixed(2),
                    paymentMethod: invoicePaymentMethod || null,
                    paymentDetails: invoicePaymentDetails || null,
                    notes: invoiceNotes || null,
                    terms: invoiceTerms || null,
                    showBusinessInfo: invoiceShowBusinessInfo,
                    customFieldValues: invoiceCustomFieldValues,
                  };
                  
                  if (editingInvoice) {
                    updateInvoiceMutation.mutate({
                      invoiceId: editingInvoice.id,
                      invoiceData
                    });
                  } else {
                    createInvoiceMutation.mutate(invoiceData);
                  }
                }}
                className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
              >
                {createInvoiceMutation.isPending || updateInvoiceMutation.isPending 
                  ? (editingInvoice ? 'Werk By...' : 'Skep...') 
                  : editingInvoice 
                    ? `Werk ${invoiceType === 'invoice' ? 'Faktuur' : 'Kwotasie'} By` 
                    : `Skep ${invoiceType === 'invoice' ? 'Faktuur' : 'Kwotasie'}`
                }
              </Button>
            </div>
        </DialogContent>
      </Dialog>
      {/* Invoice Detail/View Modal */}
      <Dialog open={isInvoiceViewOpen} onOpenChange={setIsInvoiceViewOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          {selectedInvoice && (
            <>
              <DialogHeader className="border-b border-gray-200 pb-3 sm:pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <DialogTitle className="text-lg sm:text-2xl text-[hsl(217,90%,40%)]">
                      {selectedInvoice.documentNumber}
                    </DialogTitle>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{selectedInvoice.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={selectedInvoice.documentType === 'invoice' ? 'default' : 'outline'}
                      className={`text-xs ${selectedInvoice.documentType === 'invoice' 
                        ? 'bg-[hsl(217,90%,40%)] text-white' 
                        : 'text-purple-600 border-purple-300'
                      }`}
                    >
                      {selectedInvoice.documentType === 'invoice' ? 'FAKTUUR' : 'KWOTASIE'}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${
                        selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700 border-green-300' :
                        selectedInvoice.status === 'sent' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                        selectedInvoice.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                        'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      {selectedInvoice.status === 'draft' ? 'KONSEP' : 
                       selectedInvoice.status === 'sent' ? 'GESTUUR' : 
                       selectedInvoice.status === 'paid' ? 'BETAAL' : 
                       selectedInvoice.status === 'cancelled' ? 'GEKANSELLEER' : selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
                {/* Document Info Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Kliënt</Label>
                    <p className="font-medium text-sm truncate">{customers.find(c => c.id === selectedInvoice.clientId)?.name || selectedInvoice.clientName || 'N/A'}</p>
                    {(selectedInvoice.clientEmail || selectedInvoice.clientPhone) && (
                      <div className="mt-0.5 space-y-0.5">
                        {selectedInvoice.clientPhone && <p className="text-xs text-gray-500">Tel: {selectedInvoice.clientPhone}</p>}
                        {selectedInvoice.clientEmail && <p className="text-xs text-gray-500">E-pos: {selectedInvoice.clientEmail}</p>}
                      </div>
                    )}
                  </div>
                  {selectedInvoice.poNumber && (
                    <div>
                      <Label className="text-xs text-gray-500">PO Nommer</Label>
                      <p className="font-medium text-sm">{selectedInvoice.poNumber}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-gray-500">Datum</Label>
                    <p className="font-medium text-sm">{new Date(selectedInvoice.createdDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Vervaldatum</Label>
                    <p className="font-medium text-sm">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  {selectedInvoice.dueTerms && (selectedInvoice.customFieldValues as any)?.vis_dueTerms !== false && (
                    <div>
                      <Label className="text-xs text-gray-500">Terme</Label>
                      <p className="font-medium text-sm">{selectedInvoice.dueTerms}</p>
                    </div>
                  )}
                  {selectedInvoice.paymentMethod && (
                    <div>
                      <Label className="text-xs text-gray-500">Betaalmetode</Label>
                      <p className="font-medium text-sm">{selectedInvoice.paymentMethod}</p>
                    </div>
                  )}
                  {selectedInvoice.paymentDetails && (
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-500">Betalingsbesonderhede</Label>
                      <p className="font-medium text-sm whitespace-pre-wrap">{selectedInvoice.paymentDetails}</p>
                    </div>
                  )}
                  {(() => {
                    const cfSetts = mergeReceiptSettingsAfrikaans(currentUser?.receiptSettings);
                    const cfs = (cfSetts as any).invoiceSettings?.customFields || [];
                    const cfVals: any = (selectedInvoice.customFieldValues as any) || {};
                    return cfs
                      .filter((cf: any) => cfVals[`cf_${cf.id}`] && cfVals[`vis_${cf.id}`] !== false)
                      .map((cf: any) => (
                        <div key={cf.id}>
                          <Label className="text-xs text-gray-500">{cf.label}</Label>
                          <p className="font-medium text-sm">{cfVals[`cf_${cf.id}`]}</p>
                        </div>
                      ));
                  })()}
                </div>

                {/* Line Items - Mobile Cards / Desktop Table */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Lynitemme</Label>
                  {/* Mobile: Card layout */}
                  <div className="sm:hidden space-y-2">
                    {Array.isArray(selectedInvoice.items) && selectedInvoice.items.map((item: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className="font-bold text-sm">R{parseFloat(item.lineTotal).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.quantity} x R{parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop: Table layout */}
                  <div className="hidden sm:block border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-xs font-semibold text-gray-600">Produk</th>
                          <th className="text-center p-3 text-xs font-semibold text-gray-600">Hoev</th>
                          <th className="text-right p-3 text-xs font-semibold text-gray-600">Eenheidsprys</th>
                          <th className="text-right p-3 text-xs font-semibold text-gray-600">Totaal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {Array.isArray(selectedInvoice.items) && selectedInvoice.items.map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3">{item.name}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">R{parseFloat(item.price).toFixed(2)}</td>
                            <td className="p-3 text-right font-medium">R{parseFloat(item.lineTotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="sm:max-w-xs sm:ml-auto space-y-1 sm:space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotaal:</span>
                      <span className="font-medium">R{typeof selectedInvoice.subtotal === 'number' ? selectedInvoice.subtotal.toFixed(2) : selectedInvoice.subtotal}</span>
                    </div>
                    {(parseFloat(selectedInvoice.discountPercent || '0') > 0 || parseFloat(selectedInvoice.discountAmount || '0') > 0) && (
                      <div className="flex justify-between text-red-600">
                        <span>Afslag{parseFloat(selectedInvoice.discountPercent || '0') > 0 ? ` (${selectedInvoice.discountPercent}%)` : ''}:</span>
                        <span>-R{parseFloat(selectedInvoice.discountAmount || '0').toFixed(2)}</span>
                      </div>
                    )}
                    {parseFloat(selectedInvoice.taxPercent || '0') > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">BTW (15%):</span>
                        <span className="font-medium">R{typeof selectedInvoice.tax === 'number' ? selectedInvoice.tax.toFixed(2) : selectedInvoice.tax}</span>
                      </div>
                    )}
                    {parseFloat(selectedInvoice.shippingAmount || '0') > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Versending:</span>
                        <span className="font-medium">R{typeof selectedInvoice.shippingAmount === 'number' ? selectedInvoice.shippingAmount.toFixed(2) : selectedInvoice.shippingAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2 mt-2">
                      <span>Totaal:</span>
                      <span className="text-[hsl(217,90%,40%)]">R{typeof selectedInvoice.total === 'number' ? selectedInvoice.total.toFixed(2) : selectedInvoice.total}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Terms - Side by Side on Desktop */}
                {(selectedInvoice.notes || selectedInvoice.terms) && (
                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {selectedInvoice.notes && (
                        <div className="sm:order-1">
                          <Label className="text-sm font-semibold mb-2 block">Notas</Label>
                          <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded break-words overflow-hidden whitespace-pre-wrap">{selectedInvoice.notes}</p>
                        </div>
                      )}
                      {selectedInvoice.terms && (
                        <div className="sm:order-2">
                          <Label className="text-sm font-semibold mb-2 block">Terme & Voorwaardes</Label>
                          <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded break-words overflow-hidden whitespace-pre-wrap">{selectedInvoice.terms}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Mobile Stacked */}
              <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-0">
                {/* Mobile: Stack all buttons */}
                <div className="grid grid-cols-2 gap-2 sm:hidden">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    data-testid="button-edit-invoice"
                    onClick={() => {
                      if (selectedInvoice) {
                        setEditingInvoice(selectedInvoice);
                        setInvoiceType(selectedInvoice.documentType);
                        
                        if (selectedInvoice.clientId) {
                          setIsCustomClient(false);
                          setInvoiceClientId(selectedInvoice.clientId);
                          setInvoiceCustomClient("");
                        } else if (selectedInvoice.clientName) {
                          setIsCustomClient(true);
                          setInvoiceCustomClient(selectedInvoice.clientName);
                          setInvoiceClientId(null);
                        }
                        
                        setInvoiceClientEmail(selectedInvoice.clientEmail || '');
                        setInvoiceClientPhone(selectedInvoice.clientPhone || '');
                        setInvoiceDueDate(selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toISOString().split('T')[0] : '');
                        setInvoiceNotes(selectedInvoice.notes || '');
                        setInvoicePoNumber(selectedInvoice.poNumber || '');
                        setInvoiceDueTerms(selectedInvoice.dueTerms || 'none');
                        const hasPercentDiscount = parseFloat(selectedInvoice.discountPercent || '0') > 0;
                        setInvoiceDiscountType(hasPercentDiscount ? 'percent' : 'amount');
                        setInvoiceDiscountPercent(parseFloat(selectedInvoice.discountPercent || '0').toString());
                        setInvoiceDiscountAmount(parseFloat(selectedInvoice.discountAmount || '0').toString());
                        setInvoiceShippingAmount(parseFloat(selectedInvoice.shippingAmount || '0').toString());
                        setInvoicePaymentMethod(selectedInvoice.paymentMethod || '');
                        setInvoicePaymentDetails(selectedInvoice.paymentDetails || '');
                        setInvoiceTerms(selectedInvoice.terms || '');
                        setInvoiceTaxEnabled(parseFloat(selectedInvoice.taxPercent || '15') > 0);
                        
                        const items = Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
                        setInvoiceItems(items.map((item: any) => ({
                          productId: item.productId,
                          customName: item.productId ? undefined : (item.name || item.customName),
                          quantity: parseFloat(item.quantity) || item.quantity,
                          price: parseFloat(item.price)
                        })));
                        
                        setInvoiceCustomFieldValues((selectedInvoice.customFieldValues as any) || {});
                        setInvoiceShowBusinessInfo(selectedInvoice.showBusinessInfo !== false);
                        setIsInvoiceViewOpen(false);
                        setIsInvoiceDialogOpen(true);
                      }
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Wysig
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 text-xs" 
                    data-testid="button-delete-invoice"
                    onClick={() => setIsDeleteInvoiceDialogOpen(true)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Verwyder
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    data-testid="button-change-status"
                    onClick={() => {
                      setNewStatus(selectedInvoice?.status || 'draft');
                      setIsStatusChangeDialogOpen(true);
                    }}
                  >
                    Status
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-xs disabled:opacity-60"
                    data-testid="button-export-pdf"
                    disabled={invoicePdfBusy}
                    onClick={() => generateInvoicePDF(selectedInvoice)}
                  >
                    {invoicePdfBusy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
                    {invoicePdfBusy ? '...' : 'PDF'}
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-xs col-span-2 disabled:opacity-60"
                    data-testid="button-share-invoice"
                    disabled={invoicePdfBusy}
                    onClick={() => shareInvoice(selectedInvoice)}
                  >
                    {invoicePdfBusy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Share2 className="w-3 h-3 mr-1" />}
                    {invoicePdfBusy ? 'Besig...' : 'Deel'}
                  </Button>
                </div>
                <div className="sm:hidden">
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setIsInvoiceViewOpen(false)}>
                    Sluit
                  </Button>
                </div>
                
                {/* Desktop: Original layout */}
                <div className="hidden sm:flex sm:justify-between sm:items-center">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      data-testid="button-edit-invoice-desktop"
                      onClick={() => {
                        if (selectedInvoice) {
                          setEditingInvoice(selectedInvoice);
                          setInvoiceType(selectedInvoice.documentType);
                          
                          if (selectedInvoice.clientId) {
                            setIsCustomClient(false);
                            setInvoiceClientId(selectedInvoice.clientId);
                            setInvoiceCustomClient("");
                          } else if (selectedInvoice.clientName) {
                            setIsCustomClient(true);
                            setInvoiceCustomClient(selectedInvoice.clientName);
                            setInvoiceClientId(null);
                          }
                          
                          setInvoiceClientEmail(selectedInvoice.clientEmail || '');
                          setInvoiceClientPhone(selectedInvoice.clientPhone || '');
                          setInvoiceDueDate(selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toISOString().split('T')[0] : '');
                          setInvoiceNotes(selectedInvoice.notes || '');
                          setInvoicePoNumber(selectedInvoice.poNumber || '');
                          setInvoiceDueTerms(selectedInvoice.dueTerms || 'none');
                          const hasPercentDiscount = parseFloat(selectedInvoice.discountPercent || '0') > 0;
                          setInvoiceDiscountType(hasPercentDiscount ? 'percent' : 'amount');
                          setInvoiceDiscountPercent(parseFloat(selectedInvoice.discountPercent || '0').toString());
                          setInvoiceDiscountAmount(parseFloat(selectedInvoice.discountAmount || '0').toString());
                          setInvoiceShippingAmount(parseFloat(selectedInvoice.shippingAmount || '0').toString());
                          setInvoicePaymentMethod(selectedInvoice.paymentMethod || '');
                          setInvoicePaymentDetails(selectedInvoice.paymentDetails || '');
                          setInvoiceTerms(selectedInvoice.terms || '');
                          setInvoiceTaxEnabled(parseFloat(selectedInvoice.taxPercent || '15') > 0);
                          
                          const items = Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
                          setInvoiceItems(items.map((item: any) => ({
                            productId: item.productId,
                            customName: item.productId ? undefined : (item.name || item.customName),
                            quantity: parseFloat(item.quantity) || item.quantity,
                            price: parseFloat(item.price)
                          })));
                          
                          setInvoiceCustomFieldValues((selectedInvoice.customFieldValues as any) || {});
                          setInvoiceShowBusinessInfo(selectedInvoice.showBusinessInfo !== false);
                          setIsInvoiceViewOpen(false);
                          setIsInvoiceDialogOpen(true);
                        }
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Wysig
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700" 
                      data-testid="button-delete-invoice-desktop"
                      onClick={() => setIsDeleteInvoiceDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Verwyder
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      data-testid="button-change-status-desktop"
                      onClick={() => {
                        setNewStatus(selectedInvoice?.status || 'draft');
                        setIsStatusChangeDialogOpen(true);
                      }}
                    >
                      Verander Status
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] disabled:opacity-60"
                      data-testid="button-export-pdf-desktop"
                      disabled={invoicePdfBusy}
                      onClick={() => generateInvoicePDF(selectedInvoice)}
                    >
                      {invoicePdfBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      {invoicePdfBusy ? 'Genereer...' : 'Eksporteer PDF'}
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] disabled:opacity-60"
                      data-testid="button-share-invoice-desktop"
                      disabled={invoicePdfBusy}
                      onClick={() => shareInvoice(selectedInvoice)}
                    >
                      {invoicePdfBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                      {invoicePdfBusy ? 'Besig...' : 'Deel'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsInvoiceViewOpen(false)}>
                      Sluit
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Invoice Confirmation Dialog */}
      <AlertDialog open={isDeleteInvoiceDialogOpen} onOpenChange={setIsDeleteInvoiceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verwyder Faktuur?</AlertDialogTitle>
            <AlertDialogDescription>
              Is jy seker jy wil{' '}
              <span className="font-semibold text-[hsl(217,90%,40%)]">
                {selectedInvoice?.documentNumber}
              </span>
              {' '}verwyder? Hierdie aksie kan nie ongedaan gemaak word nie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kanselleer</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedInvoice) {
                  deleteInvoiceMutation.mutate(selectedInvoice.id);
                }
              }}
              disabled={deleteInvoiceMutation.isPending}
            >
              {deleteInvoiceMutation.isPending ? 'Verwyder...' : 'Verwyder'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Change Status Dialog */}
      <Dialog open={isStatusChangeDialogOpen} onOpenChange={setIsStatusChangeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verander Faktuur Status</DialogTitle>
            <DialogDescription>
              Werk die status van {selectedInvoice?.documentNumber} by
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kies Nuwe Status</Label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Konsep</SelectItem>
                  <SelectItem value="sent">Gestuur</SelectItem>
                  <SelectItem value="paid">Betaal</SelectItem>
                  <SelectItem value="cancelled">Gekanselleer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsStatusChangeDialogOpen(false)}>
              Kanselleer
            </Button>
            <Button
              className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              onClick={() => {
                if (selectedInvoice) {
                  updateInvoiceStatusMutation.mutate({
                    invoiceId: selectedInvoice.id,
                    status: newStatus
                  });
                }
              }}
              disabled={updateInvoiceStatusMutation.isPending}
            >
              {updateInvoiceStatusMutation.isPending ? 'Werk By...' : 'Werk Status By'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Document Number Dialog */}
      <Dialog open={isEditDocNumberDialogOpen} onOpenChange={setIsEditDocNumberDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Wysig Dokumentnommer</DialogTitle>
            <DialogDescription>
              Verander die dokumentnommer vir hierdie {editingDocNumberInvoice?.documentType === 'invoice' ? 'faktuur' : 'kwotasie'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dokumentnommer</Label>
              <Input
                value={newDocumentNumber}
                onChange={(e) => setNewDocumentNumber(e.target.value)}
                placeholder="bv. INV-0001"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditDocNumberDialogOpen(false);
              setEditingDocNumberInvoice(null);
              setNewDocumentNumber("");
            }}>
              Kanselleer
            </Button>
            <Button
              className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              onClick={() => {
                if (editingDocNumberInvoice && newDocumentNumber.trim()) {
                  updateDocumentNumberMutation.mutate({
                    invoiceId: editingDocNumberInvoice.id,
                    documentNumber: newDocumentNumber.trim()
                  });
                }
              }}
              disabled={updateDocumentNumberMutation.isPending || !newDocumentNumber.trim()}
            >
              {updateDocumentNumberMutation.isPending ? 'Stoor...' : 'Stoor'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Save Payment Details Dialog */}
      <Dialog open={isSavePaymentDialogOpen} onOpenChange={setIsSavePaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Stoor Betalingsbesonderhede</DialogTitle>
            <DialogDescription>
              Stoor hierdie betalingsbesonderhede vir vinnige toegang wanneer fakturen geskep word
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Naam</Label>
              <Input
                value={savePaymentName}
                onChange={(e) => setSavePaymentName(e.target.value)}
                placeholder="bv. FNB Besigheidsrekening"
                data-testid="input-payment-template-name-af"
              />
            </div>
            <div className="space-y-2">
              <Label>Besonderhede Voorskou</Label>
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                {invoicePaymentDetails}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsSavePaymentDialogOpen(false);
              setSavePaymentName("");
            }}>
              Kanselleer
            </Button>
            <Button
              className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              onClick={() => {
                if (savePaymentName.trim() && invoicePaymentDetails.trim()) {
                  savePaymentDetailsMutation.mutate({
                    name: savePaymentName.trim(),
                    details: invoicePaymentDetails.trim()
                  });
                }
              }}
              disabled={savePaymentDetailsMutation.isPending || !savePaymentName.trim()}
              data-testid="button-confirm-save-payment-af"
            >
              {savePaymentDetailsMutation.isPending ? 'Stoor...' : 'Stoor Besonderhede'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Teken Uit?</AlertDialogTitle>
            <AlertDialogDescription>
              Is jy seker jy wil uitteken uit Storm POS?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLogoutDialogOpen(false)}>
              Nee, Bly Aangeteken
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              onClick={() => {
                localStorage.removeItem('posUser');
                localStorage.removeItem('posLoginTimestamp');
                window.location.href = '/pos/login';
              }}
            >
              Ja, Teken Uit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Skrap Rekening Bevestigingsdialoog */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border border-red-900/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Skrap Rekening &amp; Alle Data?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Dit sal jou rekening en alle geassosieerde data <strong className="text-red-400">permanent skrap</strong>, insluitende:
              <ul className="mt-3 space-y-1 text-gray-400 text-sm list-disc pl-5">
                <li>Alle verkoopsgeskiedenis en transaksies</li>
                <li>Alle produkte en voorraad</li>
                <li>Alle kliënte</li>
                <li>Alle fakture en kwotasies</li>
                <li>Alle personeelrekeninge</li>
                <li>Alle besigheidsinstellings en data</li>
              </ul>
              <span className="block mt-3 font-semibold text-red-400">Hierdie aksie kan nie ongedaan gemaak word nie.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setIsDeleteAccountDialogOpen(false)}
            >
              Kanselleer
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeletingAccount}
              onClick={async () => {
                if (!currentUser) return;
                setIsDeletingAccount(true);
                try {
                  const res = await fetch(`/api/pos/account/delete/${currentUser.id}`, { method: 'DELETE' });
                  if (res.ok) {
                    localStorage.removeItem('posUser');
                    localStorage.removeItem('posToken');
                    window.location.href = '/pos/login';
                  } else {
                    toast({ title: 'Fout', description: 'Kon nie rekening skrap nie. Probeer asseblief weer.', variant: 'destructive' });
                    setIsDeletingAccount(false);
                    setIsDeleteAccountDialogOpen(false);
                  }
                } catch {
                  toast({ title: 'Fout', description: 'Kon nie rekening skrap nie. Probeer asseblief weer.', variant: 'destructive' });
                  setIsDeletingAccount(false);
                  setIsDeleteAccountDialogOpen(false);
                }
              }}
            >
              {isDeletingAccount ? 'Besig om te skrap...' : 'Ja, Skrap Alles'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Preview Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-xl flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Voer {importType === 'products' ? 'Produkte' : 'Kliënte'} In
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Hersien die data voor invoer. Bestaande rekords sal opgedateer word.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div className="bg-gradient-to-r from-[hsl(217,90%,40%)]/10 to-[hsl(217,90%,50%)]/10 rounded-xl p-4 border border-[hsl(217,90%,40%)]/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[hsl(217,90%,40%)] rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Rekords Gevind</p>
                  <p className="text-2xl font-bold text-[hsl(217,90%,40%)]">{importData.length}</p>
                </div>
              </div>
            </div>
            {importPreview.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Voorskou (Eerste 5 rye)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(importPreview[0]).slice(0, 5).map((key) => (
                          <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importPreview.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          {Object.values(row).slice(0, 5).map((val: any, i) => (
                            <td key={i} className="px-4 py-3 text-gray-700 truncate max-w-[150px]">
                              {String(val || '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importData.length > 5 && (
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-500">...en {importData.length - 5} meer rye</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportData([]);
                setImportPreview([]);
              }}
              className="w-full sm:w-auto"
            >
              Kanselleer
            </Button>
            <Button 
              onClick={handleImportConfirm}
              disabled={isImporting || importData.length === 0}
              className="w-full sm:w-auto bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] shadow-lg"
            >
              {isImporting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Voer in...
                </span>
              ) : (
                `Voer ${importData.length} Rekords In`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={(open) => {
        setIsChangePasswordDialogOpen(open);
        if (!open) {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[hsl(217,90%,40%)]" />
              Verander Wagwoord
            </DialogTitle>
            <DialogDescription>
              Voer jou huidige wagwoord en 'n nuwe wagwoord in om jou aanmeldbesonderhede op te dateer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!currentUser?.id) return;
            
            if (newPassword !== confirmNewPassword) {
              toast({ title: "Fout", description: "Nuwe wagwoorde stem nie ooreen nie", variant: "destructive" });
              return;
            }
            
            if (newPassword.length < 6) {
              toast({ title: "Fout", description: "Nuwe wagwoord moet minstens 6 karakters wees", variant: "destructive" });
              return;
            }
            
            setIsChangingPassword(true);
            try {
              const response = await fetch(`/api/pos/user/${currentUser.id}/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                toast({ title: "Sukses", description: "Wagwoord suksesvol verander" });
                setIsChangePasswordDialogOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
              } else {
                toast({ title: "Fout", description: data.message || "Kon nie wagwoord verander nie", variant: "destructive" });
              }
            } catch (error) {
              toast({ title: "Fout", description: "Kon nie wagwoord verander nie", variant: "destructive" });
            } finally {
              setIsChangingPassword(false);
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Huidige Wagwoord</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Voer jou huidige wagwoord in"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nuwe Wagwoord</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Voer nuwe wagwoord in (min. 6 karakters)"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Bevestig Nuwe Wagwoord</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Bevestig nuwe wagwoord"
                required
              />
              {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-sm text-red-500">Wagwoorde stem nie ooreen nie</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
                Kanselleer
              </Button>
              <Button 
                type="submit" 
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              >
                {isChangingPassword ? "Besig..." : "Verander Wagwoord"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rekening Besonderhede Dialog */}
      <Dialog open={!!selectedOpenAccount} onOpenChange={() => {
        setSelectedOpenAccount(null);
        setSelectedItemsForPrint([]);
        setOpenAccountTipEnabled(false);
      }}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[680px] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border border-gray-700/60 shadow-2xl shadow-black/60 p-0 overflow-hidden rounded-2xl">
          <div className="relative bg-gradient-to-r from-[hsl(217,90%,30%)]/40 via-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,30%)]/40 border-b border-gray-700/50 px-5 py-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/10 via-transparent to-[hsl(217,90%,40%)]/10"></div>
            <div className="relative flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,30%)] shadow-lg shadow-blue-500/30 flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-white font-bold text-base sm:text-lg leading-tight truncate">
                  {selectedOpenAccount?.accountName}
                </DialogTitle>
                <DialogDescription className="text-[hsl(217,90%,70%)] text-xs mt-0.5">
                  Rekening Besonderhede & Vereffening
                </DialogDescription>
              </div>
            </div>
          </div>

          {selectedOpenAccount && (
            <div className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Rekening Tipe</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedOpenAccount.accountType === 'table' ? 'bg-[hsl(217,90%,50%)]' : 'bg-emerald-400'}`}></div>
                    <span className="text-white font-semibold text-sm capitalize">{selectedOpenAccount.accountType === 'table' ? 'Tafel' : 'Klient'}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,30%)]/10 border border-[hsl(217,90%,40%)]/30 rounded-xl p-3">
                  <p className="text-[10px] text-[hsl(217,90%,60%)] uppercase tracking-wider font-semibold mb-1">Totale Bedrag</p>
                  <p className="text-2xl font-bold text-white tracking-tight">R{selectedOpenAccount.total}</p>
                </div>
              </div>

              {selectedOpenAccount.notes && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-300 text-sm">{selectedOpenAccount.notes}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                    <p className="text-white font-semibold text-sm">Items ({Array.isArray(selectedOpenAccount.items) ? selectedOpenAccount.items.length : 0})</p>
                  </div>
                  {Array.isArray(selectedOpenAccount.items) && selectedOpenAccount.items.length > 0 && (
                    <button
                      onClick={() => {
                        const allIndices = selectedOpenAccount.items.map((_: any, index: number) => index);
                        const allSelected = allIndices.every((index: number) => selectedItemsForPrint.includes(index));
                        setSelectedItemsForPrint(allSelected ? [] : allIndices);
                      }}
                      className="text-[11px] font-medium text-[hsl(217,90%,60%)] hover:text-[hsl(217,90%,70%)] transition-colors px-2 py-1 rounded-lg hover:bg-[hsl(217,90%,40%)]/10"
                    >
                      {selectedItemsForPrint.length === selectedOpenAccount.items.length ? 'Deselecteer Alles' : 'Kies Alles'}
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {Array.isArray(selectedOpenAccount.items) && selectedOpenAccount.items.map((item: any, index: number) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${selectedItemsForPrint.includes(index) ? 'bg-[hsl(217,90%,40%)]/15 border-[hsl(217,90%,40%)]/40' : 'bg-gray-800/40 border-gray-700/30 hover:border-gray-600/50'}`}>
                      <input
                        type="checkbox"
                        checked={selectedItemsForPrint.includes(index)}
                        onChange={(e) => handleAfrikaansItemCheckboxChange(index, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,40%)] focus:ring-offset-0 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{item.name}</p>
                        <p className="text-gray-400 text-xs">R{item.price} elk</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-300 bg-gray-700/60 px-2 py-0.5 rounded-lg">×{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAfrikaansDeleteItemClick(selectedOpenAccount.id, index)}
                          className="h-7 w-7 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                          disabled={removeItemFromOpenAccountMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-white text-sm font-medium">Fooie Opsie</p>
                  <p className="text-gray-400 text-xs mt-0.5">{openAccountTipEnabled ? 'Fooie lyne sal op kwitansie verskyn' : 'Voeg fooie opsie by kwitansie'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenAccountTipEnabled(!openAccountTipEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${openAccountTipEnabled ? 'bg-[hsl(217,90%,40%)]' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${openAccountTipEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  variant="outline"
                  disabled={selectedItemsForPrint.length === 0}
                  className="flex-1 border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/60 bg-orange-500/5 h-10 disabled:opacity-40"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Vinnig Druk ({selectedItemsForPrint.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedOpenAccount(null);
                    setSelectedItemsForPrint([]);
                    setOpenAccountTipEnabled(false);
                  }}
                  className="flex-1 border-gray-600/60 text-gray-300 hover:bg-gray-700/50 bg-transparent h-10"
                >
                  Kanselleer
                </Button>
                <Button
                  onClick={() => {
                    closeOpenAccountMutation.mutate({
                      accountId: selectedOpenAccount.id,
                      paymentType: 'cash',
                      tipEnabled: openAccountTipEnabled
                    });
                    setSelectedOpenAccount(null);
                    setSelectedItemsForPrint([]);
                    setOpenAccountTipEnabled(false);
                  }}
                  disabled={closeOpenAccountMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-900/30 h-10 font-semibold"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  {closeOpenAccountMutation.isPending ? 'Sluit...' : 'Sluit & Betaal'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hernoem Oop Rekening Dialog */}
      <Dialog open={!!editingOpenAccount} onOpenChange={(open) => { if (!open) { setEditingOpenAccount(null); setEditOpenAccountName(""); } }}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-sm bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-700/60 shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="relative bg-gradient-to-r from-[hsl(217,90%,30%)]/40 via-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,30%)]/40 border-b border-gray-700/50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,30%)] shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Edit className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white font-bold text-base">Hernoem Rekening</DialogTitle>
                <DialogDescription className="text-[hsl(217,90%,70%)] text-xs">Opdateer die rekening se vertoonnaam</DialogDescription>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Rekeningnaam</label>
              <Input
                value={editOpenAccountName}
                onChange={(e) => setEditOpenAccountName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && editOpenAccountName.trim() && editingOpenAccount) updateOpenAccountNameMutation.mutate({ accountId: editingOpenAccount.id, accountName: editOpenAccountName.trim() }); }}
                className="bg-gray-800 border-gray-700/50 text-white focus:border-[hsl(217,90%,40%)]/60 h-10"
                placeholder="Voer rekeningnaam in"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-gray-600/60 text-gray-300 hover:bg-gray-800 bg-transparent h-9" onClick={() => { setEditingOpenAccount(null); setEditOpenAccountName(""); }}>Kanselleer</Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white h-9 font-semibold"
                disabled={!editOpenAccountName.trim() || updateOpenAccountNameMutation.isPending}
                onClick={() => { if (editingOpenAccount) updateOpenAccountNameMutation.mutate({ accountId: editingOpenAccount.id, accountName: editOpenAccountName.trim() }); }}
              >
                {updateOpenAccountNameMutation.isPending ? "Stoor..." : "Stoor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}