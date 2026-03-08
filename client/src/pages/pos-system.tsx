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
import { insertPosProductSchema, insertPosCustomerSchema, insertPosOpenAccountSchema, defaultReceiptSettings, type InsertPosProduct, type PosProduct, type PosCustomer, type PosOpenAccount, type InsertPosOpenAccount, type PosCategory, type InsertPosCategory } from "@shared/schema";
import { z } from "zod";
import { 
  ShoppingCart, Package, Users, BarChart3, Plus, Minus, Trash2, 
  CreditCard, DollarSign, Receipt, Search, LogOut, Edit, PlusCircle,
  Calendar, TrendingUp, FileText, Clock, Eye, EyeOff, Download, User, UserPlus, Settings, X, Printer,
  ChevronDown, ChevronRight, Globe, BookOpen, HelpCircle, Share2, Upload, FileSpreadsheet, RefreshCw, Link2, Check, Menu,
  AlertTriangle, XCircle, Tag, Hash, Lock, Folder, FolderPlus, Grid3X3, LayoutList, ChevronLeft, Palette, ClipboardList, SlidersHorizontal, CheckCircle2, Building2
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import stormLogo from "@assets/STORM__500_x_250_px_-removebg-preview_1762197388108.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { ReceiptCustomizerDialog } from "@/components/ReceiptCustomizerDialog";
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

export default function PosSystem() {
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [saleNotes, setSaleNotes] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
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
  const [staffPassword, setStaffPassword] = useState("");
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<number | "all">("all");
  const [checkoutOption, setCheckoutOption] = useState<'complete' | 'open-account' | 'add-to-account'>('complete');
  const [isOpenAccountDialogOpen, setIsOpenAccountDialogOpen] = useState(false);
  const [selectedOpenAccount, setSelectedOpenAccount] = useState<PosOpenAccount | null>(null);
  const [isBankDetailsOpen, setIsBankDetailsOpen] = useState(false);

  const [selectedOpenAccountId, setSelectedOpenAccountId] = useState<number | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number; email: string; paid: boolean; companyLogo?: string; companyName?: string; tutorialCompleted?: boolean; receiptSettings?: any} | null>(null);
  const [managementPasswordDialog, setManagementPasswordDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [managementPassword, setManagementPassword] = useState("");
  const [currentTab, setCurrentTab] = useState("sales");
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
  const [saleCompleteData, setSaleCompleteData] = useState<null | { total: string; items: any[]; customerName?: string; notes?: string; paymentType?: string; staffName?: string; tipEnabled: boolean; saleId: number; }>(null);
  const [openAccountTipEnabled, setOpenAccountTipEnabled] = useState(false);
  const [highlightStaffButton, setHighlightStaffButton] = useState(false);
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
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoicePoNumber, setInvoicePoNumber] = useState("");
  const [invoiceDueTerms, setInvoiceDueTerms] = useState("7 days");
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
  const [isSavePaymentDialogOpen, setIsSavePaymentDialogOpen] = useState(false);
  const [savePaymentName, setSavePaymentName] = useState("");
  
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
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);
  const [expandedSales, setExpandedSales] = useState<Set<number>>(new Set());
  
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
  
  // Category system state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PosCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("folder");
  const [categoryColor, setCategoryColor] = useState("#3b82f6");
  const [productCategoryFilter, setProductCategoryFilter] = useState<number | "all">("all");
  const [salesDisplayMode, setSalesDisplayMode] = useState<'grid' | 'tabs'>('tabs');
  const [selectedSalesCategory, setSelectedSalesCategory] = useState<number | null>(null);
  const [salesCategoryFilter, setSalesCategoryFilter] = useState<number | "all">("all");
  const [productSortOrder, setProductSortOrder] = useState<'name-asc' | 'name-desc' | 'sku-asc' | 'sku-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc'>('name-asc');
  const [inventorySortOrder, setInventorySortOrder] = useState<'name-asc' | 'name-desc' | 'sku-asc' | 'sku-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc'>('name-asc');

  // Purchase Order state
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

  // Handle tab change with role-based access control
  const handleTabChange = (tabValue: string) => {
    // If staff is management, allow all tabs
    if (currentStaff && currentStaff.userType === 'management') {
      setCurrentTab(tabValue);
      return;
    }

    // For staff users or no user logged in, only allow sales, customers, invoices, and open-accounts
    const allowedTabs = ['sales', 'customers', 'invoices', 'open-accounts'];
    
    if (allowedTabs.includes(tabValue)) {
      setCurrentTab(tabValue);
    } else {
      // Show management access required notification
      setManagementPasswordDialog(true);
    }
  };

  // Close management dialog
  const closeManagementDialog = () => {
    setManagementPasswordDialog(false);
    setManagementPassword("");
    
    // Highlight the staff button to guide user
    setHighlightStaffButton(true);
    
    // Clear highlight after 5 seconds
    setTimeout(() => {
      setHighlightStaffButton(false);
    }, 5000);
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
        console.log('Current user loaded:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setCurrentUser({
          id: 1,
          email: 'demo@storm.co.za',
          paid: true,
          companyLogo: null,
          tutorialCompleted: false,
          companyName: 'Demo Account'
        });
      }
    } else {
      // If no user data in localStorage, set demo user as fallback
      setCurrentUser({
        id: 1,
        email: 'demo@storm.co.za',
        paid: true,
        companyLogo: null,
        companyName: 'Demo Account',
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

  // Mobile back button handling
  useEffect(() => {
    // Push initial state to history
    window.history.pushState({ pos: true, tab: 'sales' }, '');
    
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
      if (currentTab !== 'sales') {
        // Navigate to sales tab
        setCurrentTab('sales');
        window.history.pushState({ pos: true, tab: 'sales' }, '');
      } else {
        // On sales tab - show logout confirmation
        setIsLogoutDialogOpen(true);
        window.history.pushState({ pos: true, tab: 'sales' }, '');
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

  // Product form schema - exclude userId since we'll add it in the mutation
  const productFormSchema = insertPosProductSchema.omit({ userId: true }).extend({
    costPrice: z.string().min(1, "Cost price is required"),
    retailPrice: z.string().min(1, "Retail price is required"),
    tradePrice: z.string().optional(),
    quantity: z.coerce.number().min(0, "Quantity must be 0 or greater"),
    categoryId: z.coerce.number().nullable().optional(),
  });

  // Customer form schema - exclude userId since we'll add it in the mutation
  const customerFormSchema = insertPosCustomerSchema.omit({ userId: true });

  // Open account form schema
  const openAccountFormSchema = insertPosOpenAccountSchema.omit({ userId: true }).extend({
    accountName: z.string().min(1, "Account name is required"),
    accountType: z.enum(["table", "customer"]),
  });

  // Product form
  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: "",
      name: "",
      costPrice: "",
      retailPrice: "",
      tradePrice: "",
      quantity: 0,
      categoryId: null,
    },
  });

  // Customer form
  const customerForm = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      customerType: "retail",
      notes: "",
    },
  });

  // Open account form
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

  // Fetch products
  const { data: products = [] } = useQuery<(Product & { categoryId?: number | null })[]>({
    queryKey: ["/api/pos/products", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/products?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<PosCategory[]>({
    queryKey: ["/api/pos/categories", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/categories?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/pos/customers", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/customers?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Fetch sales
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/pos/sales", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/sales?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch sales');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Fetch open accounts
  const { data: openAccounts = [] } = useQuery<PosOpenAccount[]>({
    queryKey: ["/api/pos/open-accounts", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/open-accounts?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch open accounts');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Fetch staff accounts
  const { data: staffAccounts = [] } = useQuery<StaffAccount[]>({
    queryKey: ["/api/pos/staff-accounts", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/staff-accounts?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch staff accounts');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Load saved staff account selection from user profile on mount
  useEffect(() => {
    if (staffAccounts.length > 0 && currentUser?.selectedStaffAccountId && !currentStaff && !isStaffSwitchMode) {
      const savedStaff = staffAccounts.find(s => s.id === currentUser.selectedStaffAccountId);
      if (savedStaff) {
        setCurrentStaff(savedStaff);
      }
    }
  }, [staffAccounts, currentUser?.selectedStaffAccountId, currentStaff, isStaffSwitchMode]);

  // Fetch invoices
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/pos/invoices", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/invoices?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Fetch purchase orders
  const { data: purchaseOrders = [], isLoading: isPOLoading } = useQuery<any[]>({
    queryKey: ["/api/pos/purchase-orders", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/purchase-orders?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch purchase orders');
      return response.json();
    },
    enabled: !!currentUser,
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/pos/suppliers", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/suppliers?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();
    },
    enabled: !!currentUser,
  });

  // Fetch saved payment details
  const { data: savedPaymentDetails = [] } = useQuery<any[]>({
    queryKey: ["/api/pos/saved-payment-details", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/saved-payment-details?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch saved payment details');
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
        title: "Product created",
        description: "Product has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      console.log("Update mutation called with:", { id, data });
      const response = await apiRequest("PUT", `/api/pos/products/${id}`, data);
      console.log("Update response:", response);
      return response.json();
    },
    onSuccess: () => {
      console.log("Update successful");
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      productForm.reset();
      setEditingProduct(null);
      setIsProductDialogOpen(false);
      toast({
        title: "Product updated",
        description: "Product has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
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
        title: "Product deleted",
        description: "Product has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
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
        title: "All products deleted",
        description: `${data.deleted || 0} products have been removed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete all products",
        variant: "destructive",
      });
    },
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; icon: string; color: string }) => {
      const response = await apiRequest("POST", "/api/pos/categories", {
        ...categoryData,
        userId: currentUser?.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/categories", currentUser?.id] });
      setIsCategoryDialogOpen(false);
      setCategoryName("");
      setCategoryIcon("folder");
      setCategoryColor("#3b82f6");
      toast({ title: "Category created", description: "Category has been successfully created." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; icon: string; color: string } }) => {
      const response = await apiRequest("PUT", `/api/pos/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/categories", currentUser?.id] });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      setCategoryIcon("folder");
      setCategoryColor("#3b82f6");
      toast({ title: "Category updated", description: "Category has been successfully updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/pos/categories/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/categories", currentUser?.id] });
      toast({ title: "Category deleted", description: "Category has been successfully deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete category", variant: "destructive" });
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
      toast({ title: "Products added", description: "Products have been added to the category." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add products to category", variant: "destructive" });
    },
  });

  // Update display mode preference
  const updateDisplayModeMutation = useMutation({
    mutationFn: async (mode: 'grid' | 'tabs') => {
      const response = await apiRequest("PUT", `/api/pos/users/${currentUser?.id}/display-mode`, { mode });
      return response.json();
    },
    onSuccess: (_, mode) => {
      setSalesDisplayMode(mode);
      toast({ title: "Display mode updated", description: `Switched to ${mode === 'grid' ? 'Grid' : 'Tabs'} view.` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update display mode", variant: "destructive" });
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
        title: "Success",
        description: "Customer created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create customer",
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
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update customer",
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
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  // Invoice mutations
  // Purchase Order mutations
  const saveSupplierMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/pos/suppliers", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/suppliers", currentUser?.id] }); toast({ title: "Supplier Saved", description: "Supplier has been saved to your directory." }); },
    onError: (error: any) => { toast({ title: "Error", description: error.message || "Failed to save supplier", variant: "destructive" }); },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => { const res = await apiRequest("DELETE", `/api/pos/suppliers/${id}`); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pos/suppliers", currentUser?.id] }); toast({ title: "Supplier Removed", description: "Supplier has been removed." }); },
  });

  const handleSaveSupplier = () => {
    if (!poSupplierName) { toast({ title: "Error", description: "Supplier name is required to save", variant: "destructive" }); return; }
    saveSupplierMutation.mutate({ userId: currentUser?.id, name: poSupplierName, email: poSupplierEmail || null, phone: poSupplierPhone || null, address: poSupplierAddress || null });
  };

  const loadSupplier = (supplier: any) => {
    setPOSupplierName(supplier.name);
    setPOSupplierEmail(supplier.email || "");
    setPOSupplierPhone(supplier.phone || "");
    setPOSupplierAddress(supplier.address || "");
  };

  const createPOMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pos/purchase-orders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] });
      setIsPODialogOpen(false);
      resetPOForm();
      toast({ title: "Purchase Order Created", description: "Purchase order has been created successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create purchase order", variant: "destructive" });
    },
  });

  const updatePOMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/pos/purchase-orders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] });
      setIsPODialogOpen(false);
      setEditingPO(null);
      resetPOForm();
      toast({ title: "Purchase Order Updated", description: "Purchase order has been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update purchase order", variant: "destructive" });
    },
  });

  const updatePOStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/pos/purchase-orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] });
      toast({ title: "Status Updated", description: "Purchase order status has been updated." });
    },
  });

  const togglePOPaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: number; isPaid: boolean }) => {
      const res = await apiRequest("PATCH", `/api/pos/purchase-orders/${id}`, { isPaid });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] });
      toast({ title: "Payment Status Updated", description: "Purchase order payment status has been updated." });
    },
  });

  const deletePOMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/pos/purchase-orders/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/purchase-orders"] });
      setIsDeletePODialogOpen(false);
      setDeletingPOId(null);
      toast({ title: "Deleted", description: "Purchase order has been deleted." });
    },
  });

  const resetPOForm = () => {
    setPOSupplierName(""); setPOSupplierEmail(""); setPOSupplierPhone(""); setPOSupplierAddress("");
    setPOItems([]); setPOExpectedDate(""); setPONotes(""); setPOTaxPercent(15); setPOShippingAmount(0);
    setEditingPO(null);
  };

  const handleSubmitPO = () => {
    if (!poSupplierName) { toast({ title: "Error", description: "Supplier name is required", variant: "destructive" }); return; }
    if (poItems.length === 0) { toast({ title: "Error", description: "Add at least one item", variant: "destructive" }); return; }
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
    if (product) {
      setPOItems([...poItems, { productId: product.id, name: product.name, sku: product.sku, quantity: 1, costPrice: parseFloat(product.costPrice || product.retailPrice || "0"), receivedQty: 0 }]);
    } else {
      setPOItems([...poItems, { productId: null, name: "", sku: "", quantity: 1, costPrice: 0, receivedQty: 0 }]);
    }
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
    const labels: Record<string, string> = { draft: "Draft", sent: "Sent", partial: "Partially Received", received: "Received", cancelled: "Cancelled" };
    return <Badge className={`${styles[status] || styles.draft} border`}>{labels[status] || status}</Badge>;
  };

  const generatePOPdf = async (po: any) => {
    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF();
    doc.setFillColor(30, 64, 175); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("PURCHASE ORDER", 20, 25);
    doc.setFontSize(12); doc.setTextColor(200, 220, 255); doc.text(po.poNumber, 20, 35);
    doc.setTextColor(220, 230, 255); doc.setFontSize(10);
    doc.text(`Date: ${new Date(po.createdAt).toLocaleDateString()}`, 150, 25);
    if (po.expectedDate) doc.text(`Expected: ${new Date(po.expectedDate).toLocaleDateString()}`, 150, 32);
    let infoY = 55;
    if (currentUser?.companyName) {
      doc.setTextColor(30, 64, 175); doc.setFontSize(11); doc.setFont("helvetica", "bold");
      doc.text("FROM:", 20, infoY); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50); doc.text(currentUser.companyName, 20, infoY + 7);
    }
    doc.setTextColor(30, 64, 175); doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("SUPPLIER:", 120, infoY); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
    let supplierY = infoY + 7; doc.text(po.supplierName, 120, supplierY); supplierY += 6;
    if (po.supplierPhone) { doc.text(`Tel: ${po.supplierPhone}`, 120, supplierY); supplierY += 6; }
    if (po.supplierEmail) { doc.text(`Email: ${po.supplierEmail}`, 120, supplierY); supplierY += 6; }
    if (po.supplierAddress) { const addrLines = doc.splitTextToSize(po.supplierAddress, 70); addrLines.forEach((l: string) => { doc.text(l, 120, supplierY); supplierY += 5; }); }
    let tableY = Math.max(supplierY, 85) + 10;
    doc.setFillColor(30, 64, 175); doc.rect(20, tableY, 170, 8, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.text("Item", 22, tableY + 5.5); doc.text("SKU", 85, tableY + 5.5); doc.text("Qty", 115, tableY + 5.5);
    doc.text("Cost Price", 135, tableY + 5.5); doc.text("Total", 165, tableY + 5.5); tableY += 10;
    doc.setFont("helvetica", "normal");
    (po.items || []).forEach((item: any, idx: number) => {
      if (idx % 2 === 0) { doc.setFillColor(240, 245, 255); doc.rect(20, tableY - 4, 170, 7, 'F'); }
      doc.setTextColor(40, 40, 40);
      doc.text(item.name || "Custom Item", 22, tableY); doc.text(item.sku || "-", 85, tableY);
      doc.text(String(item.quantity), 115, tableY); doc.text(`R${parseFloat(item.costPrice || 0).toFixed(2)}`, 135, tableY);
      doc.text(`R${(item.costPrice * item.quantity).toFixed(2)}`, 165, tableY); tableY += 7;
    });
    tableY += 5; doc.setDrawColor(200, 200, 200); doc.line(120, tableY, 190, tableY); tableY += 7;
    doc.setTextColor(80, 80, 80); doc.text("Subtotal:", 130, tableY);
    doc.text(`R${parseFloat(po.subtotal).toFixed(2)}`, 165, tableY); tableY += 6;
    if (parseFloat(po.taxPercent) > 0) {
      doc.text(`VAT (${po.taxPercent}%):`, 130, tableY);
      doc.text(`R${(parseFloat(po.subtotal) * parseFloat(po.taxPercent) / 100).toFixed(2)}`, 165, tableY); tableY += 6;
    }
    if (parseFloat(po.shippingAmount) > 0) {
      doc.text("Shipping:", 130, tableY); doc.text(`R${parseFloat(po.shippingAmount).toFixed(2)}`, 165, tableY); tableY += 6;
    }
    doc.setTextColor(30, 64, 175); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 130, tableY + 3); doc.text(`R${parseFloat(po.total).toFixed(2)}`, 165, tableY + 3);
    if (po.notes) {
      tableY += 15; doc.setTextColor(80, 80, 80); doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text("Notes:", 20, tableY); doc.setFont("helvetica", "normal");
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
      setIsCustomClient(false);
      setInvoiceDueDate("");
      setInvoiceNotes("");
      setInvoicePoNumber("");
      setInvoiceDueTerms("7 days");
      setInvoiceDiscountPercent("0");
      setInvoiceShippingAmount("0");
      setInvoicePaymentMethod("");
      setInvoicePaymentDetails("");
      setInvoiceTerms("");
      setInvoiceTaxEnabled(true);
      setShowQuickAddProduct(false);
      setQuickAddName("");
      setQuickAddPrice("");
      setInvoiceShowBusinessInfo(true);
      setInvoiceCustomFieldValues({});
      toast({
        title: "Success",
        description: `${invoiceType === 'invoice' ? 'Invoice' : 'Quote'} created successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
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
      setIsCustomClient(false);
      setInvoiceDueDate("");
      setInvoiceNotes("");
      setInvoicePoNumber("");
      setInvoiceDueTerms("7 days");
      setInvoiceDiscountPercent("0");
      setInvoiceShippingAmount("0");
      setInvoicePaymentMethod("");
      setInvoicePaymentDetails("");
      setInvoiceTerms("");
      setInvoiceTaxEnabled(true);
      setShowQuickAddProduct(false);
      setQuickAddName("");
      setQuickAddPrice("");
      setInvoiceShowBusinessInfo(true);
      setInvoiceCustomFieldValues({});
      toast({
        title: "Success",
        description: `${updatedInvoice.documentType === 'invoice' ? 'Invoice' : 'Quote'} updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
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
        title: "Deleted",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
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
        title: "Error",
        description: "Failed to update status",
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
        title: "Document Number Updated",
        description: "Invoice number has been updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to update document number",
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
        title: "Saved",
        description: "Payment details saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to save payment details",
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
        title: "Deleted",
        description: "Payment details deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to delete payment details",
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
        title: "Staff account created",
        description: "Staff account has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff account",
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
        title: "Welcome back",
        description: `Logged in as ${data.staffAccount.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
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
        title: "Staff account deleted",
        description: "Staff account has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff account",
        variant: "destructive",
      });
    },
  });

  // Helper functions for product management
  const openProductDialog = (product?: PosProduct & { categoryId?: number | null }) => {
    console.log("Opening product dialog with product:", product);
    if (product) {
      setEditingProduct(product);
      console.log("Setting form values for editing product:", product);
      productForm.setValue("sku", product.sku);
      productForm.setValue("name", product.name);
      productForm.setValue("costPrice", product.costPrice.toString());
      productForm.setValue("retailPrice", product.retailPrice.toString());
      productForm.setValue("tradePrice", product.tradePrice ? product.tradePrice.toString() : "");
      productForm.setValue("quantity", product.quantity);
      productForm.setValue("categoryId", product.categoryId || null);
    } else {
      setEditingProduct(null);
      console.log("Resetting form for new product");
      productForm.reset({
        sku: "",
        name: "",
        costPrice: "",
        retailPrice: "",
        tradePrice: "",
        quantity: 0,
        categoryId: null,
      });
    }
    setIsProductDialogOpen(true);
  };

  // Helper functions for customer management
  const openCustomerDialog = (customer?: PosCustomer) => {
    if (customer) {
      setEditingCustomer(customer);
      customerForm.setValue("name", customer.name);
      customerForm.setValue("phone", customer.phone || "");
      customerForm.setValue("customerType", customer.customerType);
      customerForm.setValue("notes", customer.notes || "");
    } else {
      setEditingCustomer(null);
      customerForm.reset({
        name: "",
        phone: "",
        customerType: "retail",
        notes: "",
      });
    }
    setIsCustomerDialogOpen(true);
  };

  const handleProductSubmit = (data: z.infer<typeof productFormSchema>) => {
    console.log("Form submitted:", { data, editingProduct: editingProduct?.id, errors: productForm.formState.errors });
    
    // Add userId to the data - use current user's ID
    const dataWithUserId = { ...data, userId: currentUser?.id || 1 };
    
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: dataWithUserId });
    } else {
      createProductMutation.mutate(dataWithUserId);
    }
  };

  const handleCustomerSubmit = (data: z.infer<typeof customerFormSchema>) => {
    // Add userId to the data - use current user's ID
    const dataWithUserId = { ...data, userId: currentUser?.id || 1 };
    
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: dataWithUserId });
    } else {
      createCustomerMutation.mutate(dataWithUserId);
    }
  };

  // Category helper functions
  const openCategoryDialog = (category?: PosCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryIcon(category.icon || "folder");
      setCategoryColor(category.color || "#3b82f6");
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setCategoryIcon("folder");
      setCategoryColor("#3b82f6");
    }
    setIsCategoryDialogOpen(true);
  };

  const handleCategorySubmit = () => {
    if (!categoryName.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }
    
    if (editingCategory) {
      updateCategoryMutation.mutate({ 
        id: editingCategory.id, 
        data: { name: categoryName, icon: categoryIcon, color: categoryColor } 
      });
    } else {
      createCategoryMutation.mutate({ name: categoryName, icon: categoryIcon, color: categoryColor });
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number | null | undefined): string => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  // Get category color by ID
  const getCategoryColor = (categoryId: number | null | undefined): string => {
    if (!categoryId) return "#6b7280";
    const category = categories.find(c => c.id === categoryId);
    return category?.color || "#6b7280";
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  // Excel Export Handlers
  const handleExportProducts = () => {
    if (!currentUser?.id) return;
    window.location.href = `/api/pos/export/products/${currentUser.id}`;
    toast({
      title: "Export Started",
      description: "Your products are being downloaded as an Excel file.",
    });
  };

  const handleExportCustomers = () => {
    if (!currentUser?.id) return;
    window.location.href = `/api/pos/export/customers/${currentUser.id}`;
    toast({
      title: "Export Started",
      description: "Your customers are being downloaded as an Excel file.",
    });
  };

  const handleExportInvoices = () => {
    if (!currentUser?.id) return;
    window.location.href = `/api/pos/export/invoices/${currentUser.id}`;
    toast({
      title: "Export Started",
      description: "Your invoices are being downloaded as an Excel file.",
    });
  };

  const handleExportSales = () => {
    if (!currentUser?.id) return;
    window.location.href = `/api/pos/export/sales/${currentUser.id}`;
    toast({
      title: "Export Started",
      description: "Your sales data is being downloaded as an Excel file.",
    });
  };

  // Excel Import Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'products' | 'customers') => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type, file.size);
    toast({
      title: "Reading File",
      description: `Processing ${file.name}...`,
    });

    try {
      const buffer = await file.arrayBuffer();
      console.log("Buffer size:", buffer.byteLength);
      const workbook = XLSX.read(buffer, { type: 'array' });
      console.log("Workbook sheets:", workbook.SheetNames);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      console.log("Parsed data rows:", data.length, "Sample:", data[0]);
      
      if (data.length === 0) {
        toast({
          title: "No Data Found",
          description: "The file appears to be empty or has no readable data. Make sure your file has headers in the first row.",
          variant: "destructive",
        });
        return;
      }

      setImportType(type);
      setImportData(data);
      setImportPreview(data.slice(0, 5)); // Preview first 5 rows
      setIsImportDialogOpen(true);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Error",
        description: "Failed to read the file. Please check the file format and try again.",
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
        title: "Import Complete",
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
        title: "Import Error",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // XERO Integration Handlers
  const handleConnectXero = async () => {
    setIsConnectingXero(true);
    try {
      toast({
        title: "XERO OAuth Setup Required",
        description: "The XERO integration requires OAuth credentials to be configured. Please contact support for setup assistance.",
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
        title: "XERO Disconnected",
        description: "Your XERO integration has been disconnected.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/user", currentUser.id] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect XERO. Please try again.",
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
        title: "Sync Complete",
        description: result.message || "Data has been synced with XERO.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers", currentUser.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/invoices", currentUser.id] });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync with XERO. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingXero(false);
    }
  };

  // Filter products based on search term and category for Products tab
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearchTerm.toLowerCase());
      const matchesCategory = productCategoryFilter === "all" || 
        (productCategoryFilter === 0 ? !product.categoryId : product.categoryId === productCategoryFilter);
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

  // Filter and sort products based on search term, category, and sort order for Sales tab
  const filteredSalesProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = salesCategoryFilter === "all" || product.categoryId === salesCategoryFilter;
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

  // Get price for product based on customer type
  const getProductPrice = (product: Product, customerType: 'retail' | 'trade' = 'retail'): string => {
    if (customerType === 'trade' && product.tradePrice) {
      return product.tradePrice;
    }
    return product.retailPrice;
  };

  // Add product to sale
  const addToSale = (product: Product) => {
    const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;
    const customerType = selectedCustomer?.customerType || 'retail';
    const price = getProductPrice(product, customerType);
    
    const existingItem = currentSale.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast({
          title: "Not enough stock",
          description: `Only ${product.quantity} items available`,
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
          title: "Out of stock",
          description: "This product is not available",
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

  // Update item quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCurrentSale(currentSale.filter(item => item.productId !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (product && newQuantity > product.quantity) {
        toast({
          title: "Not enough stock",
          description: `Only ${product.quantity} items available`,
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

  // Calculate subtotal and total with discount
  const calculateSubtotal = () => {
    return currentSale.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
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

  // Process checkout
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;
      
      if (checkoutOption === 'complete') {
        // Complete sale immediately
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
          throw new Error(errorData.message || "Failed to process sale");
        }
        return { type: 'sale', data: await response.json() };
      } else if (checkoutOption === 'open-account') {
        // Create open account
        setIsOpenAccountDialogOpen(true);
        return { type: 'open-account', data: null };
      } else {
        // Add to existing account
        if (!selectedOpenAccountId) {
          throw new Error("Please select an open account");
        }
        
        const response = await apiRequest("POST", `/api/pos/open-accounts/${selectedOpenAccountId}/items`, { 
          items: currentSale 
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add items to account");
        }
        return { type: 'add-to-account', data: await response.json() };
      }
    },
    onSuccess: (result) => {
      if (result.type === 'sale') {
        const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;

        // Capture state before clearing — needed for print/share in success dialog
        setSaleCompleteData({
          total: calculateTotal(),
          items: [...currentSale],
          customerName: selectedCustomer?.name,
          notes: saleNotes,
          paymentType,
          staffName: currentStaff?.username,
          tipEnabled: tipOptionEnabled,
          saleId: result.data.id,
        });

        // Clear current sale
        setCurrentSale([]);
        setSelectedCustomerId(null);
        setSaleNotes("");
        setPaymentType("cash");
        setDiscountPercentage(0);
        setTipOptionEnabled(false);
        setSelectedOpenAccountId(null);

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/pos/sales", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      } else if (result.type === 'add-to-account') {
        toast({
          title: "Items added to account",
          description: `Items successfully added to ${result.data.accountName}`,
        });
        
        // Clear current sale
        setCurrentSale([]);
        setSelectedCustomerId(null);
        setSaleNotes("");
        setPaymentType("cash");
        setDiscountPercentage(0);
        setTipOptionEnabled(false);
        setSelectedOpenAccountId(null);
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
      }
      // For open-account, the dialog will handle the next steps
    },
    onError: (error: Error) => {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: error.message || "An error occurred during checkout",
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
        throw new Error(errorData.message || "Failed to create open account");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Open account created",
        description: `Account "${data.accountName}" created successfully`,
      });
      
      // Clear current sale
      setCurrentSale([]);
      setSelectedCustomerId(null);
      setSaleNotes("");
      setPaymentType("cash");
      setDiscountPercentage(0);
      setTipOptionEnabled(false);
      setIsOpenAccountDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create open account",
        description: error.message || "An error occurred while creating the account",
        variant: "destructive",
      });
    },
  });

  // Close open account mutation (convert to sale)
  const closeOpenAccountMutation = useMutation({
    mutationFn: async ({ accountId, paymentType, tipEnabled }: { accountId: number; paymentType: string; tipEnabled: boolean }) => {
      const account = openAccounts.find(a => a.id === accountId);
      if (!account) throw new Error("Account not found");

      // Create sale from open account
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
        throw new Error(errorData.message || "Failed to process sale");
      }

      // Delete open account
      const deleteResponse = await apiRequest("DELETE", `/api/pos/open-accounts/${accountId}`);
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.message || "Failed to close account");
      }

      return { ...(await saleResponse.json()), tipEnabled };
    },
    onSuccess: (data) => {
      // Generate PDF receipt for closed account
      const account = openAccounts.find(a => a.id === data.accountId) || 
                     { accountName: data.customerName, items: data.items, notes: data.notes };
      
      generateReceipt(
        data.items,
        data.total,
        data.customerName,
        data.notes,
        data.paymentType,
        true,
        account.accountName,
        currentStaff?.username,
        data.tipEnabled
      );
      
      toast({
        title: "Account closed",
        description: `Sale of R${data.total} processed successfully. Receipt downloaded.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/sales", currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to close account",
        description: error.message || "An error occurred while closing the account",
        variant: "destructive",
      });
    },
  });

  // Remove item from open account mutation
  const removeItemFromOpenAccountMutation = useMutation({
    mutationFn: async ({ accountId, itemIndex }: { accountId: number; itemIndex: number }) => {
      const response = await apiRequest("DELETE", `/api/pos/open-accounts/${accountId}/items/${itemIndex}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove item");
      }
      return response.json();
    },
    onSuccess: (updatedAccount) => {
      toast({
        title: "Item removed",
        description: "Item removed from account successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
      
      // Update the selected open account with the fresh data
      if (selectedOpenAccount && updatedAccount.id === selectedOpenAccount.id) {
        setSelectedOpenAccount(updatedAccount);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message || "An error occurred while removing the item",
        variant: "destructive",
      });
    },
  });

  const handleDeleteItemClick = (accountId: number, itemIndex: number) => {
    // Check if current staff has management access
    if (currentStaff?.userType === 'management') {
      // Management users can delete directly after confirmation
      if (window.confirm('Are you sure you want to delete this item from the account?')) {
        removeItemFromOpenAccountMutation.mutate({ accountId, itemIndex });
      }
    } else {
      // Staff users need management access
      toast({
        title: "Management Access Required",
        description: "Only management users can delete items from open accounts. Please login with a management account.",
        variant: "destructive",
      });
    }
  };

  const handleItemCheckboxChange = (itemIndex: number, checked: boolean) => {
    if (checked) {
      setSelectedItemsForPrint(prev => [...prev, itemIndex]);
    } else {
      setSelectedItemsForPrint(prev => prev.filter(index => index !== itemIndex));
    }
  };

  const handleQuickPrint = () => {
    if (!selectedOpenAccount || selectedItemsForPrint.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to print",
        variant: "destructive",
      });
      return;
    }

    const selectedItems = selectedItemsForPrint
      .map(index => selectedOpenAccount.items[index])
      .filter(item => item);

    // Generate receipt for selected items
    const generateSelectedItemsPDF = () => {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Thermal printer size
      });

      let yPosition = 10;
      const lineHeight = 5;
      const margin = 5;

      // Account info
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Account: ${selectedOpenAccount.accountName}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Time: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += lineHeight;
      
      if (currentStaff) {
        const staffName = currentStaff.displayName || currentStaff.username || `Staff #${currentStaff.id}`;
        doc.text(`Served by: ${staffName}`, margin, yPosition);
        yPosition += lineHeight;
      }

      yPosition += lineHeight;

      // Separator line
      doc.setDrawColor(0);
      doc.line(margin, yPosition, 75, yPosition);
      yPosition += lineHeight;

      // Items
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('SELECTED ITEMS:', margin, yPosition);
      yPosition += lineHeight * 1.5;

      let totalAmount = 0;
      doc.setFont(undefined, 'normal');
      selectedItems.forEach(item => {
        // Item name and quantity
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${item.quantity}x ${item.name}`, margin, yPosition);
        
        // Price on the right
        const itemTotal = parseFloat(item.price) * item.quantity;
        totalAmount += itemTotal;
        doc.text(`R${itemTotal.toFixed(2)}`, 70, yPosition, { align: 'right' });
        yPosition += lineHeight;
        
        // Add some space between items
        yPosition += lineHeight * 0.5;
      });

      // Total
      yPosition += lineHeight;
      doc.setDrawColor(0);
      doc.line(margin, yPosition, 75, yPosition);
      yPosition += lineHeight;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL:', margin, yPosition);
      doc.text(`R${totalAmount.toFixed(2)}`, 70, yPosition, { align: 'right' });



      // Download the PDF
      doc.save(`${selectedOpenAccount.accountName}-selected-items-${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    generateSelectedItemsPDF();
    
    // Clear selection after printing
    setSelectedItemsForPrint([]);
    
    toast({
      title: "Kitchen order printed",
      description: `Printed ${selectedItems.length} items for ${selectedOpenAccount.accountName}`,
    });
  };



  // Logo file upload handler with compression
  const handleLogoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please choose an image smaller than 2MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        // Compress the image
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize to max 200x200 while maintaining aspect ratio
          const maxSize = 200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = height * (maxSize / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = width * (maxSize / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            setLogoFile(compressedBase64);
          }
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  // Merge receipt settings with defaults
  const mergeReceiptSettings = (settings: any) => {
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

  // PDF Receipt Generation
  const generateReceipt = (items: SaleItem[], total: string, customerName?: string, notes?: string, paymentType?: string, isOpenAccount = false, accountName?: string, staffName?: string, includeTipLines = false, customSettings?: any, returnDoc = false): any => {
    const doc = new jsPDF();
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;
    
    const settings = mergeReceiptSettings(customSettings || currentUser?.receiptSettings);
    
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
    doc.text(isOpenAccount ? 'ACCOUNT STATEMENT' : 'SALES RECEIPT', titleX, 32);

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
      doc.text('DATE', margin + 4, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 4, y + 14);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TIME', margin + 60, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }), margin + 60, y + 14);
    }
    
    if (settings.toggles.showPaymentMethod && paymentType) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('PAYMENT', margin + 110, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(paymentType.charAt(0).toUpperCase() + paymentType.slice(1), margin + 110, y + 14);
    }

    if (settings.toggles.showStaffInfo && staffName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('SERVED BY', margin + 4, y + 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(staffName, margin + 30, y + 22);
    }
    
    if (settings.toggles.showCustomerInfo && customerName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('CUSTOMER', margin + 80, y + 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(customerName, margin + 106, y + 22);
    }
    
    if (isOpenAccount && accountName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('ACCOUNT', margin + 80, y + 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(accountName, margin + 106, y + 22);
    }

    if (settings.toggles.showBusinessAddress || settings.toggles.showRegistrationNumber || settings.toggles.showVATNumber) {
      const regParts: string[] = [];
      if (settings.toggles.showBusinessAddress && settings.businessInfo.addressLine1) regParts.push(settings.businessInfo.addressLine1);
      if (settings.toggles.showBusinessAddress && settings.businessInfo.addressLine2) regParts.push(settings.businessInfo.addressLine2);
      if (settings.toggles.showRegistrationNumber && settings.businessInfo.registrationNumber) regParts.push(`Reg: ${settings.businessInfo.registrationNumber}`);
      if (settings.toggles.showVATNumber && settings.businessInfo.vatNumber) regParts.push(`VAT: ${settings.businessInfo.vatNumber}`);
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
    doc.text('QTY', margin + 105, y + 6);
    doc.text('PRICE', margin + 125, y + 6);
    doc.text('TOTAL', margin + 150, y + 6);
    y += 12;
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    items.forEach((item, index) => {
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

    const subtotal = parseFloat(total);
    doc.setFontSize(9);
    doc.setTextColor(medGray[0], medGray[1], medGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal', margin + 110, y);
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
    doc.text('TOTAL', margin + 100, y + 3);
    doc.text(`R${subtotal.toFixed(2)}`, margin + 150, y + 3);
    y += 16;

    if (includeTipLines) {
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setDrawColor(lineGray[0], lineGray[1], lineGray[2]);
      doc.text('Tip:', margin + 4, y);
      doc.line(margin + 16, y, margin + 70, y);
      y += 8;
      doc.text('New Total:', margin + 4, y);
      doc.line(margin + 28, y, margin + 70, y);
      y += 12;
    }

    if (notes) {
      doc.setFillColor(255, 253, 240);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
      doc.setDrawColor(230, 220, 180);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.text(notes.substring(0, 80), margin + 20, y + 6);
      if (notes.length > 80) doc.text(notes.substring(80, 160), margin + 4, y + 11);
      y += 18;
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
      doc.text(settings.customMessages.thankYou || 'Thank you for your business!', pageWidth / 2, y, { align: 'center' });
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
    doc.text('Powered by Storm POS  |  stormsoftware.co.za', pageWidth / 2, 289, { align: 'center' });

    const fileName = isOpenAccount 
      ? `account-statement-${accountName?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
      : `receipt-${Date.now()}.pdf`;
    if (returnDoc) return doc;
    doc.save(fileName);
  };

  // Logo upload mutation
  const logoUploadMutation = useMutation({
    mutationFn: async (logo: string) => {
      // Use current user or fallback to demo user ID
      const userId = currentUser?.id || 1;
      console.log('Uploading logo for user ID:', userId);
      const response = await apiRequest("PUT", `/api/pos/user/${userId}/logo`, { logo });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Logo updated",
        description: "Company logo has been updated successfully",
      });
      setCurrentUser(prev => prev ? { ...prev, companyLogo: data.user.companyLogo } : null);
      localStorage.setItem('posUser', JSON.stringify(data.user));
      setIsLogoDialogOpen(false);
      setLogoFile(null);
    },
    onError: (error: any) => {
      console.error('Logo upload error:', error);
      let errorMessage = "Failed to upload logo";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Add items to existing open account mutation
  const addToOpenAccountMutation = useMutation({
    mutationFn: async ({ accountId, items }: { accountId: number; items: any[] }) => {
      const response = await apiRequest("POST", `/api/pos/open-accounts/${accountId}/items`, { items });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add items to account");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Items added to account",
        description: `Items successfully added to ${data.accountName}`,
      });
      
      // Clear current sale
      setCurrentSale([]);
      setSelectedCustomerId(null);
      setSaleNotes("");
      setPaymentType("cash");
      setDiscountPercentage(0);
      setSelectedOpenAccountId(null);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add items",
        description: error.message || "An error occurred while adding items to the account",
        variant: "destructive",
      });
    },
  });

  // Void sale mutation
  const voidSaleMutation = useMutation({
    mutationFn: async ({ saleId, voidReason }: { saleId: number; voidReason: string }) => {
      const response = await apiRequest("PATCH", `/api/pos/sales/${saleId}/void`, {
        voidReason,
        voidedBy: currentStaff?.id || null,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to void sale");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sale voided",
        description: "The sale has been voided successfully",
      });
      
      setVoidSaleDialog({ open: false, sale: null });
      setVoidReason("");
      
      // Refresh sales data
      queryClient.invalidateQueries({ queryKey: ["/api/pos/sales", currentUser?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to void sale",
        description: error.message || "An error occurred while voiding the sale",
        variant: "destructive",
      });
    },
  });


  // Void sale handlers
  const handleVoidSaleClick = (sale: Sale) => {
    if (currentStaff?.userType !== 'management') {
      toast({
        title: "Access denied",
        description: "Only management users can void sales",
        variant: "destructive",
      });
      return;
    }
    setVoidSaleDialog({ open: true, sale });
  };

  const handleViewVoidReason = (sale: Sale) => {
    setViewVoidDialog({ open: true, sale });
  };

  const handleVoidSaleSubmit = () => {
    if (!voidSaleDialog.sale || !voidReason.trim()) {
      toast({
        title: "Invalid void reason",
        description: "Please enter a reason for voiding this sale",
        variant: "destructive",
      });
      return;
    }

    voidSaleMutation.mutate({
      saleId: voidSaleDialog.sale.id,
      voidReason: voidReason.trim(),
    });
  };

  // Print Report Function
  const handlePrintReport = () => {
    // Filter sales data for the report
    const filteredSales = sales.filter(sale => {
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

    const validSales = filteredSales.filter(sale => !sale.isVoided);
    const totalRevenue = validSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const totalTransactions = validSales.length;
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Calculate profit
    const totalProfit = validSales.reduce((profit, sale) => {
      const saleProfit = sale.items.reduce((itemProfit: number, item: any) => {
        const salePrice = parseFloat(item.price) * item.quantity;
        const costPrice = item.costPrice ? parseFloat(item.costPrice) * item.quantity : 0;
        return itemProfit + (salePrice - costPrice);
      }, 0);
      return profit + saleProfit;
    }, 0);

    // Payment method breakdown
    const paymentMethods = validSales.reduce((acc, sale) => {
      const method = sale.paymentType;
      acc[method] = (acc[method] || 0) + parseFloat(sale.total);
      return acc;
    }, {} as Record<string, number>);

    // Staff filter name
    const staffFilterName = selectedStaffFilter === "all" 
      ? "All Staff" 
      : selectedStaffFilter === 0 
        ? "Manager" 
        : staffAccounts.find(s => s.id === selectedStaffFilter)?.displayName || 
          staffAccounts.find(s => s.id === selectedStaffFilter)?.username || 
          `Staff #${selectedStaffFilter}`;

    // Generate PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.text('Storm POS - Sales Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.text(`Date: ${new Date(selectedDate).toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    pdf.text(`Staff Filter: ${staffFilterName}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary Section
    pdf.setFontSize(16);
    pdf.text('Summary', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.text(`Total Revenue: R${totalRevenue.toFixed(2)}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Profit: R${totalProfit.toFixed(2)}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Total Transactions: ${totalTransactions}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Average Transaction: R${avgTransactionValue.toFixed(2)}`, 20, yPosition);
    yPosition += 15;

    // Payment Methods
    pdf.setFontSize(16);
    pdf.text('Payment Methods', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    Object.entries(paymentMethods).forEach(([method, total]) => {
      pdf.text(`${method.charAt(0).toUpperCase() + method.slice(1)}: R${total.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
    });
    yPosition += 10;

    // Sales Details
    pdf.setFontSize(16);
    pdf.text('Sales Details', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(9);
    filteredSales.forEach((sale, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      const staffName = sale.staffAccountId 
        ? staffAccounts.find(staff => staff.id === sale.staffAccountId)?.displayName || 
          staffAccounts.find(staff => staff.id === sale.staffAccountId)?.username || 
          `Staff #${sale.staffAccountId}`
        : 'Manager';

      const saleText = `#${sale.id} - R${sale.total} - ${sale.paymentType.toUpperCase()} - ${new Date(sale.createdAt).toLocaleTimeString()} - ${staffName}`;
      pdf.text(saleText, 20, yPosition);
      yPosition += 6;

      if (sale.isVoided) {
        pdf.text(`   VOIDED: ${sale.voidReason || 'No reason provided'}`, 25, yPosition);
        yPosition += 6;
      }

      if (sale.customerName) {
        pdf.text(`   Customer: ${sale.customerName}`, 25, yPosition);
        yPosition += 6;
      }

      const itemsText = `   Items: ${sale.items.map((item: any) => `${item.name} (${item.quantity})`).join(', ')}`;
      pdf.text(itemsText, 25, yPosition);
      yPosition += 8;
    });

    // Footer
    yPosition += 10;
    pdf.setFontSize(8);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

    // Download PDF
    const fileName = `storm-pos-report-${selectedDate}-${staffFilterName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    pdf.save(fileName);

    toast({
      title: "Report Generated",
      description: `Sales analytics report for ${new Date(selectedDate).toLocaleDateString()} has been downloaded.`,
    });
  };

  // Logout
  const logout = () => {
    // In a real app, you'd clear session/tokens here
    window.location.href = "/pos/login";
  };

  // PDF Export Function - Professional Invoice/Quote with Business Details
  const generateInvoicePDF = (invoice: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const blueColor: [number, number, number] = [43, 108, 176]; // hsl(217,90%,40%) converted to RGB
    const margin = 20;
    
    // Helper to safely format dates
    const formatDate = (date: any) => {
      if (!date) return 'N/A';
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleDateString('en-ZA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    // Get business details from receipt settings and user profile
    const settings = mergeReceiptSettings(currentUser?.receiptSettings);
    const companyName = settings.businessInfo?.name || currentUser?.companyName || 'My Business';
    const companyLogo = settings.logoDataUrl || currentUser?.companyLogo;
    const businessAddress1 = settings.businessInfo?.addressLine1 || '';
    const businessAddress2 = settings.businessInfo?.addressLine2 || '';
    const businessPhone = settings.businessInfo?.phone || '';
    const businessEmail = settings.businessInfo?.email || '';
    const businessWebsite = settings.businessInfo?.website || '';
    const vatNumber = settings.businessInfo?.vatNumber || '';
    const regNumber = settings.businessInfo?.registrationNumber || '';
    
    let y = 15;
    
    // ===== HEADER SECTION =====
    // Add company logo if available (left side)
    if (companyLogo) {
      try {
        doc.addImage(companyLogo, 'JPEG', margin, y, 35, 35);
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }
    
    // Business Details - Right side header
    const headerRightX = pageWidth - margin;
    let headerY = y + 5;
    const showBizInfo = invoice.showBusinessInfo !== false;

    if (showBizInfo) {
      // Company name — bold and prominent
      if (companyName) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
        doc.text(companyName, headerRightX, headerY, { align: 'right' });
        headerY += 5;
      }
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      if (businessAddress1) {
        doc.text(businessAddress1, headerRightX, headerY, { align: 'right' });
        headerY += 4;
      }
      if (businessAddress2) {
        doc.text(businessAddress2, headerRightX, headerY, { align: 'right' });
        headerY += 4;
      }
      if (businessPhone) {
        doc.text(`Tel: ${businessPhone}`, headerRightX, headerY, { align: 'right' });
        headerY += 4;
      }
      if (businessEmail) {
        doc.text(businessEmail, headerRightX, headerY, { align: 'right' });
        headerY += 4;
      }
      if (businessWebsite) {
        doc.text(businessWebsite, headerRightX, headerY, { align: 'right' });
        headerY += 4;
      }
      if (vatNumber) {
        doc.text(`VAT: ${vatNumber}`, headerRightX, headerY, { align: 'right' });
        headerY += 4;
      }
      if (regNumber) {
        doc.text(`Reg: ${regNumber}`, headerRightX, headerY, { align: 'right' });
        headerY += 4;
      }
    }
    
    // Document Type Label (positioned below company details)
    y = Math.max(companyLogo ? 55 : 45, headerY + 5);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(invoice.documentType === 'invoice' ? 'INVOICE' : 'QUOTE', margin, y);
    
    // Document Number
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`#${invoice.documentNumber || 'N/A'}`, margin, y + 7);
    
    // Decorative line under header
    y += 12;
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 15;
    
    // ===== DOCUMENT DETAILS SECTION =====
    const leftColX = margin;
    const rightColX = pageWidth / 2 + 10;
    
    // Left column - Bill To
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('BILL TO', leftColX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const client = customers.find(c => c.id === invoice.clientId);
    const clientName = client?.name || invoice.clientName || 'N/A';
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(clientName, leftColX, y + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let clientY = y + 15;
    const clientPhone = invoice.clientPhone || client?.phone;
    const clientEmail = invoice.clientEmail || client?.email;
    if (clientPhone && visOf('clientPhone')) {
      doc.text(`Tel: ${clientPhone}`, leftColX, clientY);
      clientY += 5;
    }
    if (clientEmail && visOf('clientEmail')) {
      doc.text(`Email: ${clientEmail}`, leftColX, clientY);
      clientY += 5;
    }
    if (client?.notes) {
      doc.text(client.notes, leftColX, clientY);
    }
    
    // Right column - Invoice Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('DETAILS', rightColX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    // Get custom field values and visibility from invoice
    const cfValues: Record<string, any> = (invoice.customFieldValues as any) || {};

    // Get invoice custom fields from user's settings
    const invoiceSettings = mergeReceiptSettings(currentUser?.receiptSettings);
    const customFields: any[] = (invoiceSettings as any).invoiceSettings?.customFields || [];

    const visOf = (key: string, defaultVal = true) =>
      cfValues[`vis_${key}`] !== undefined ? cfValues[`vis_${key}`] : defaultVal;

    // Bill To — custom fields for billTo section
    const billToCustomFields = customFields.filter((f: any) => f.section === 'billTo' && f.visible !== false);
    billToCustomFields.forEach((field: any) => {
      const val = cfValues[`cf_${field.id}`];
      if (val) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`${field.label}: ${val}`, leftColX, clientY);
        clientY += 5;
      }
    });

    const detailsData = [
      { label: 'Date:', value: formatDate(invoice.createdDate) },
      ...(invoice.dueDate && visOf('dueDate') ? [{ label: 'Due Date:', value: formatDate(invoice.dueDate) }] : []),
      ...(invoice.dueTerms && invoice.dueTerms !== 'none' && visOf('dueTerms') ? [{ label: 'Terms:', value: invoice.dueTerms }] : []),
      ...(invoice.poNumber && visOf('poNumber') ? [{ label: 'PO #:', value: invoice.poNumber }] : []),
      // Details section custom fields
      ...customFields
        .filter((f: any) => f.section === 'details' && f.visible !== false && cfValues[`cf_${f.id}`])
        .map((f: any) => ({ label: `${f.label}:`, value: cfValues[`cf_${f.id}`] })),
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
    
    // ===== LINE ITEMS TABLE =====
    // Table header
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', margin + 5, y + 7);
    doc.text('QTY', pageWidth - 95, y + 7, { align: 'center' });
    doc.text('UNIT PRICE', pageWidth - 60, y + 7, { align: 'right' });
    doc.text('AMOUNT', pageWidth - margin - 5, y + 7, { align: 'right' });
    
    y += 12;
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const needsSecondPage = items.length >= 10;
    let rowCount = 0;
    items.forEach((item: any, index: number) => {
      // Only add page break for 10+ items when running out of space
      if (needsSecondPage && y > pageHeight - 80) {
        doc.addPage();
        y = 20;
      }
      
      // Alternating row background
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
      rowCount++;
    });
    
    // Bottom line of table
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 15;
    
    // ===== FINANCIAL SUMMARY =====
    const summaryX = pageWidth - 100;
    const valueX = pageWidth - margin - 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    // Subtotal
    doc.text('Subtotal:', summaryX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`R ${parseFloat(invoice.subtotal || 0).toFixed(2)}`, valueX, y, { align: 'right' });
    y += 7;
    
    // Discount
    if (parseFloat(invoice.discountPercent || '0') > 0 || parseFloat(invoice.discountAmount || '0') > 0) {
      doc.setTextColor(220, 53, 69);
      const hasPercent = parseFloat(invoice.discountPercent || '0') > 0;
      doc.text(`Discount${hasPercent ? ` (${invoice.discountPercent}%)` : ''}:`, summaryX, y);
      doc.text(`-R ${parseFloat(invoice.discountAmount || 0).toFixed(2)}`, valueX, y, { align: 'right' });
      doc.setTextColor(80, 80, 80);
      y += 7;
    }
    
    // Tax/VAT (only show if tax is applied)
    if (parseFloat(invoice.taxPercent || '0') > 0) {
      doc.setTextColor(80, 80, 80);
      doc.text('VAT (15%):', summaryX, y);
      doc.setTextColor(0, 0, 0);
      doc.text(`R ${parseFloat(invoice.tax || 0).toFixed(2)}`, valueX, y, { align: 'right' });
      y += 7;
    }
    
    // Shipping
    if (parseFloat(invoice.shippingAmount || '0') > 0) {
      doc.setTextColor(80, 80, 80);
      doc.text('Shipping:', summaryX, y);
      doc.setTextColor(0, 0, 0);
      doc.text(`R ${parseFloat(invoice.shippingAmount || 0).toFixed(2)}`, valueX, y, { align: 'right' });
      y += 7;
    }
    
    // Total box
    y += 3;
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(summaryX - 5, y - 5, pageWidth - summaryX - margin + 10, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL DUE:', summaryX, y + 4);
    doc.text(`R ${parseFloat(invoice.total || 0).toFixed(2)}`, valueX, y + 4, { align: 'right' });
    
    y += 25;
    
    // ===== PAYMENT METHOD =====
    if (invoice.paymentMethod && visOf('paymentMethod')) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Payment Method:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.paymentMethod, margin + 40, y);
      y += 12;
    }
    
    // ===== PAYMENT DETAILS =====
    if (invoice.paymentDetails && visOf('paymentDetails')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('PAYMENT DETAILS', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const paymentDetailsLines = doc.splitTextToSize(invoice.paymentDetails, pageWidth - (margin * 2));
      doc.text(paymentDetailsLines, margin, y + 6);
      y += (paymentDetailsLines.length * 4) + 15;
    }
    
    // ===== NOTES SECTION =====
    if (invoice.notes && visOf('notes')) {
      // Only add page break for 10+ items when running out of space
      if (needsSecondPage && y > pageHeight - 60) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('NOTES', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
      doc.text(notesLines, margin, y + 6);
      y += (notesLines.length * 4) + 15;
    }
    
    // ===== TERMS & CONDITIONS =====
    if (invoice.terms && visOf('terms')) {
      // Only add page break for 10+ items when running out of space
      if (needsSecondPage && y > pageHeight - 60) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('TERMS & CONDITIONS', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const termsLines = doc.splitTextToSize(invoice.terms, pageWidth - (margin * 2));
      doc.text(termsLines, margin, y + 6);
    }
    
    // ===== FOOTER CUSTOM FIELDS =====
    const footerCustomFields = customFields.filter((f: any) => f.section === 'footer' && f.visible !== false);
    if (footerCustomFields.length > 0) {
      y += 5;
      footerCustomFields.forEach((field: any) => {
        const val = cfValues[`cf_${field.id}`];
        if (val) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          doc.text(`${field.label}: ${val}`, margin, y);
          y += 5;
        }
      });
    }

    // ===== FOOTER =====
    const footerY = pageHeight - 20;
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    doc.setFontSize(9);
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`${companyName} | Generated on ${new Date().toLocaleDateString('en-ZA')}`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    // Powered by STORM Software footer with clickable link
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const stormText = 'Powered by STORM Software';
    const stormTextWidth = doc.getTextWidth(stormText);
    const stormTextX = (pageWidth - stormTextWidth) / 2;
    doc.textWithLink(stormText, stormTextX, footerY + 10, { url: 'https://stormsoftware.co.za/' });
    
    // Download PDF
    const fileName = `${invoice.documentType}_${invoice.documentNumber}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "PDF Generated",
      description: `${invoice.documentNumber} has been downloaded`,
    });
  };

  // Share Invoice via WhatsApp
  const shareInvoiceWhatsApp = async (invoice: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const blueColor: [number, number, number] = [43, 108, 176];
    const margin = 20;
    
    const formatDate = (date: any) => {
      if (!date) return 'N/A';
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleDateString('en-ZA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    const settings = mergeReceiptSettings(currentUser?.receiptSettings);
    const companyName = settings.businessInfo?.name || currentUser?.companyName || 'My Business';
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
        console.error('Error adding logo to PDF:', error);
      }
    }
    
    const headerRightX = pageWidth - margin;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let headerY = y + 5;
    
    if (businessAddress1) { doc.text(businessAddress1, headerRightX, headerY, { align: 'right' }); headerY += 4; }
    if (businessAddress2) { doc.text(businessAddress2, headerRightX, headerY, { align: 'right' }); headerY += 4; }
    if (businessPhone) { doc.text(`Tel: ${businessPhone}`, headerRightX, headerY, { align: 'right' }); headerY += 4; }
    if (businessEmail) { doc.text(businessEmail, headerRightX, headerY, { align: 'right' }); headerY += 4; }
    if (businessWebsite) { doc.text(businessWebsite, headerRightX, headerY, { align: 'right' }); headerY += 4; }
    if (vatNumber) { doc.text(`VAT: ${vatNumber}`, headerRightX, headerY, { align: 'right' }); headerY += 4; }
    if (regNumber) { doc.text(`Reg: ${regNumber}`, headerRightX, headerY, { align: 'right' }); }
    
    y = Math.max(companyLogo ? 55 : 45, headerY + 5);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(invoice.documentType === 'invoice' ? 'INVOICE' : 'QUOTE', margin, y);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`#${invoice.documentNumber || 'N/A'}`, margin, y + 7);
    
    y += 12;
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 15;
    
    const leftColX = margin;
    const rightColX = pageWidth / 2 + 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('BILL TO', leftColX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const client = customers.find(c => c.id === invoice.clientId);
    const clientName = client?.name || invoice.clientName || 'N/A';
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(clientName, leftColX, y + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let clientY = y + 15;
    const clientPhone2 = invoice.clientPhone || client?.phone;
    const clientEmail2 = invoice.clientEmail || client?.email;
    if (clientPhone2 && visOf('clientPhone')) { doc.text(`Tel: ${clientPhone2}`, leftColX, clientY); clientY += 5; }
    if (clientEmail2 && visOf('clientEmail')) { doc.text(`Email: ${clientEmail2}`, leftColX, clientY); clientY += 5; }
    if (client?.notes) { doc.text(client.notes, leftColX, clientY); }
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text('DETAILS', rightColX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    let detailY = y + 8;
    doc.text(`Date: ${formatDate(invoice.createdAt)}`, rightColX, detailY);
    detailY += 6;
    if (invoice.dueDate && visOf('dueDate')) { doc.text(`Due: ${formatDate(invoice.dueDate)}`, rightColX, detailY); detailY += 6; }
    if (invoice.dueTerms && invoice.dueTerms !== 'none' && visOf('dueTerms')) { doc.text(`Terms: ${invoice.dueTerms}`, rightColX, detailY); detailY += 6; }
    if (invoice.poNumber && visOf('poNumber')) { doc.text(`PO: ${invoice.poNumber}`, rightColX, detailY); }
    
    y = Math.max(clientY, detailY) + 15;
    
    const tableHeaderY = y;
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(margin, tableHeaderY - 5, pageWidth - (margin * 2), 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Item', margin + 3, tableHeaderY);
    doc.text('Qty', pageWidth - margin - 60, tableHeaderY, { align: 'right' });
    doc.text('Price', pageWidth - margin - 30, tableHeaderY, { align: 'right' });
    doc.text('Total', pageWidth - margin - 3, tableHeaderY, { align: 'right' });
    
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
    doc.text('Subtotal:', labelX, y);
    doc.text(`R${typeof invoice.subtotal === 'number' ? invoice.subtotal.toFixed(2) : invoice.subtotal}`, totalsX, y, { align: 'right' });
    y += 7;
    
    if (parseFloat(invoice.discountAmount || '0') > 0) {
      doc.setTextColor(200, 80, 80);
      const discountLabel = parseFloat(invoice.discountPercent || '0') > 0 
        ? `Discount (${invoice.discountPercent}%):` 
        : 'Discount:';
      doc.text(discountLabel, labelX, y);
      doc.text(`-R${parseFloat(invoice.discountAmount).toFixed(2)}`, totalsX, y, { align: 'right' });
      y += 7;
    }
    
    if (parseFloat(invoice.taxPercent || '0') > 0) {
      doc.setTextColor(80, 80, 80);
      doc.text('VAT (15%):', labelX, y);
      doc.text(`R${typeof invoice.tax === 'number' ? invoice.tax.toFixed(2) : invoice.tax}`, totalsX, y, { align: 'right' });
      y += 7;
    }
    
    if (parseFloat(invoice.shippingAmount || '0') > 0) {
      doc.text('Shipping:', labelX, y);
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
    doc.text('TOTAL:', labelX, y);
    doc.text(`R${typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}`, totalsX, y, { align: 'right' });
    
    y += 20;
    
    if (invoice.paymentMethod) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('PAYMENT METHOD', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text(invoice.paymentMethod, margin, y + 6);
      y += 15;
    }
    
    if (invoice.notes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('NOTES', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - (margin * 2));
      doc.text(notesLines, margin, y + 6);
      y += 6 + (notesLines.length * 5);
    }
    
    if (invoice.terms) {
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
      doc.text('TERMS & CONDITIONS', margin, y);
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
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`${companyName} | Generated on ${new Date().toLocaleDateString('en-ZA')}`, pageWidth / 2, footerY + 5, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    const stormText = 'Powered by STORM Software';
    const stormTextWidth = doc.getTextWidth(stormText);
    const stormTextX = (pageWidth - stormTextWidth) / 2;
    doc.textWithLink(stormText, stormTextX, footerY + 10, { url: 'https://stormsoftware.co.za/' });
    
    // Generate PDF blob for sharing
    const pdfBlob = doc.output('blob');
    const fileName = `${invoice.documentType}_${invoice.documentNumber}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    // Try Web Share API first (works on mobile)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${invoice.documentType === 'invoice' ? 'Invoice' : 'Quote'} ${invoice.documentNumber}`,
          text: `Please find attached ${invoice.documentType} ${invoice.documentNumber} from ${companyName}.`
        });
        toast({
          title: "Shared Successfully",
          description: `${invoice.documentNumber} has been shared`,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          // Fallback: Download PDF and open WhatsApp with message
          doc.save(fileName);
          const message = encodeURIComponent(`Hi! Please find the ${invoice.documentType} ${invoice.documentNumber} from ${companyName}. Total: R${typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}`);
          window.open(`https://wa.me/?text=${message}`, '_blank');
          toast({
            title: "PDF Downloaded",
            description: "Attach the downloaded PDF to your WhatsApp message",
          });
        }
      }
    } else {
      // Fallback for desktop: Download PDF and open WhatsApp Web
      doc.save(fileName);
      const message = encodeURIComponent(`Hi! Please find the ${invoice.documentType} ${invoice.documentNumber} from ${companyName}. Total: R${typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}`);
      window.open(`https://wa.me/?text=${message}`, '_blank');
      toast({
        title: "PDF Downloaded",
        description: "Attach the downloaded PDF to your WhatsApp message",
      });
    }
  };

  const handlePrintSaleReceipt = () => {
    if (!saleCompleteData) return;
    generateReceipt(saleCompleteData.items, saleCompleteData.total, saleCompleteData.customerName, saleCompleteData.notes, saleCompleteData.paymentType, false, undefined, saleCompleteData.staffName, saleCompleteData.tipEnabled);
  };

  const handleShareSaleReceipt = async () => {
    if (!saleCompleteData) return;
    const doc = generateReceipt(saleCompleteData.items, saleCompleteData.total, saleCompleteData.customerName, saleCompleteData.notes, saleCompleteData.paymentType, false, undefined, saleCompleteData.staffName, saleCompleteData.tipEnabled, undefined, true);
    if (!doc) return;
    const pdfBlob = doc.output('blob');
    const fileName = `receipt-${saleCompleteData.saleId}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
    const companyName = currentUser?.companyName || 'Storm POS';
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: `Receipt – R${saleCompleteData.total}`, text: `Sales receipt from ${companyName}` });
      } catch (e: any) {
        if (e.name !== 'AbortError') doc.save(fileName);
      }
    } else {
      doc.save(fileName);
      toast({ title: "Receipt saved", description: "Attach the PDF to share via email or messaging" });
    }
  };

  return (
    <div className="min-h-screen bg-black relative">

      {/* ── Enterprise Sale Success Dialog ── */}
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
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Animated checkmark */}
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
                <h2 className="text-xl font-bold text-white text-center mb-0.5">Sale Complete</h2>
                <p className="text-gray-500 text-sm text-center mb-5">Transaction processed successfully</p>
              </motion.div>

              {/* Amount summary card */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="bg-[hsl(217,90%,40%)]/10 border border-[hsl(217,90%,40%)]/20 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">Total Charged</p>
                    <p className="text-3xl font-bold text-white">R{saleCompleteData.total}</p>
                    {saleCompleteData.customerName && <p className="text-gray-400 text-xs mt-0.5">{saleCompleteData.customerName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">Method</p>
                    <p className="text-white text-sm font-semibold capitalize">{saleCompleteData.paymentType || 'Cash'}</p>
                    <p className="text-gray-500 text-[11px] mt-1">{saleCompleteData.items.length} item{saleCompleteData.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="grid grid-cols-2 gap-3 mb-2.5">
                <Button onClick={handlePrintSaleReceipt} className="h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all">
                  <Printer className="w-4 h-4 mr-2 shrink-0" />
                  Print
                </Button>
                <Button onClick={handleShareSaleReceipt} className="h-11 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,45%)] text-white font-semibold border-0 rounded-xl shadow-lg shadow-blue-900/30 transition-all">
                  <Share2 className="w-4 h-4 mr-2 shrink-0" />
                  Share
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
                data-testid="button-close-welcome-toast"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
              <div className="flex items-center gap-3 md:gap-4 relative z-10 pr-6">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <User className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm font-medium">Welcome back,</p>
                  <h3 className="text-white text-sm md:text-lg font-semibold truncate">{currentUser?.companyName || "Demo Account"}</h3>
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
                data-testid="button-close-mobile-menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {[
                { id: 'sales', label: 'Sales', icon: ShoppingCart },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'customers', label: 'Customers', icon: Users },
                { id: 'invoices', label: 'Invoices & Quotes', icon: Receipt },
                { id: 'purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
                { id: 'open-accounts', label: 'Open Accounts', icon: FileText },
                { id: 'reports', label: 'Reports', icon: BarChart3 },
                { id: 'usage', label: 'Usage & Billing', icon: CreditCard },
                { id: 'settings', label: 'Settings', icon: Settings },
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
                  data-testid={`menu-item-${item.id}`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${currentTab === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
                  <span>{item.label}</span>
                  {currentTab === item.id && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-inner flex-shrink-0">
                  {currentUser?.companyLogo ? (
                    <img src={currentUser.companyLogo} alt="" className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-400 leading-tight block">Logged in as</span>
                  <span className="text-sm font-semibold text-gray-900 leading-tight truncate block">{currentStaff ? currentStaff.username : 'Select User'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLogoutDialogOpen(true);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                data-testid="menu-item-logout"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
      <div className="flex min-h-screen relative z-10 pos-mobile-safe">
        <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 flex-col bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out overflow-visible ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className={`border-b border-gray-100 flex items-center ${sidebarCollapsed ? 'p-3 justify-center' : 'p-5'}`}>
            <img src={stormLogo} alt="Storm POS" className={`transition-all duration-300 ${sidebarCollapsed ? 'h-8 w-auto' : 'h-12 w-auto'}`} />
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {[
              { id: 'sales', label: 'Sales', icon: ShoppingCart },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'invoices', label: 'Invoices & Quotes', icon: Receipt },
              { id: 'purchase-orders', label: 'Purchase Orders', icon: ClipboardList },
              { id: 'open-accounts', label: 'Open Accounts', icon: FileText },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'usage', label: 'Usage & Billing', icon: CreditCard },
              { id: 'settings', label: 'Settings', icon: Settings },
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
          <div className="px-3 py-2">
            <button
              onClick={() => window.location.href = '/pos/help'}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <HelpCircle className="h-5 w-5" />
              {!sidebarCollapsed && <span>Help</span>}
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
                        <span className="text-xs text-gray-400 leading-tight block">Logged in as</span>
                        <span className="text-sm font-semibold text-gray-900 leading-tight truncate block">{currentStaff ? currentStaff.username : 'Select User'}</span>
                      </div>
                    )}
                    {!sidebarCollapsed && currentStaff && (
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 ${currentStaff.userType === 'management' ? 'bg-[hsl(217,90%,40%)] text-white border-0' : 'bg-gray-600 text-white border-0'}`}>
                        {currentStaff.userType === 'management' ? 'Manager' : 'Staff'}
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
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Team Members</span>
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
                                  Active
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {staff.userType === 'management' ? 'Manager' : 'Staff'}
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
                        <p className="text-sm">No users yet</p>
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
                        <span className="text-sm text-[hsl(217,90%,50%)] font-medium">Add New User</span>
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
              {!sidebarCollapsed && <span>Log Out</span>}
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
          <div className="md:hidden flex items-center gap-3 px-3 py-3 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 touch-action-manipulation">
              <Menu className="h-6 w-6" />
            </button>
            <img src={stormLogo} alt="Storm POS" className="h-8 w-auto" />
            <span className="text-gray-900 text-sm font-semibold ml-auto capitalize">{currentTab === 'sales' ? 'Sales' : currentTab === 'products' ? 'Products' : currentTab === 'customers' ? 'Customers' : currentTab === 'invoices' ? 'Invoices' : currentTab === 'purchase-orders' ? 'Purchase Orders' : currentTab === 'open-accounts' ? 'Open Accounts' : currentTab === 'reports' ? 'Reports' : currentTab === 'usage' ? 'Usage' : 'Settings'}</span>
          </div>

          <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 overflow-x-hidden">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">

          {/* Sales Tab */}
          <TabsContent value="sales">
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
                            <h3 className="text-sm font-semibold text-white">Products</h3>
                            <p className="text-xs text-gray-500">{products.length} available</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {categories.length > 0 && (
                            <Select value={salesDisplayMode} onValueChange={(value: 'grid' | 'tabs') => { setSalesDisplayMode(value); if (value === 'grid') setSelectedSalesCategory(null); if (value === 'tabs') setSalesCategoryFilter('all'); }}>
                              <SelectTrigger className="w-[90px] sm:w-[110px] h-8 text-xs bg-gray-900/50 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid"><span className="flex items-center gap-1.5"><Grid3X3 className="w-3 h-3" /> Grid</span></SelectItem>
                                <SelectItem value="tabs"><span className="flex items-center gap-1.5"><LayoutList className="w-3 h-3" /> Tabs</span></SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Select value={productSortOrder} onValueChange={(value: typeof productSortOrder) => setProductSortOrder(value)}>
                            <SelectTrigger className="w-[100px] sm:w-[130px] h-8 text-xs bg-gray-900/50 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name-asc">Name A-Z</SelectItem>
                              <SelectItem value="name-desc">Name Z-A</SelectItem>
                              <SelectItem value="sku-asc">SKU A-Z</SelectItem>
                              <SelectItem value="sku-desc">SKU Z-A</SelectItem>
                              <SelectItem value="price-asc">Price Low-High</SelectItem>
                              <SelectItem value="price-desc">Price High-Low</SelectItem>
                              <SelectItem value="stock-asc">Stock Low-High</SelectItem>
                              <SelectItem value="stock-desc">Stock High-Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-gray-900/40 border-gray-600/50 text-white placeholder:text-gray-500 h-9" />
                      </div>
                      {salesDisplayMode === 'tabs' && categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button onClick={() => setSalesCategoryFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${salesCategoryFilter === 'all' ? 'bg-[hsl(217,90%,40%)] text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>All</button>
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
                      <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight md:text-[35px] md:leading-[1.2]">Choose a product to start selling</h2>
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
                          <h3 className="text-lg font-semibold text-white mb-2">Add your first product</h3>
                          <p className="text-sm text-gray-400 text-center max-w-xs mb-5">Go to the Product Inventory tab to add products you want to sell</p>
                          <Button
                            onClick={() => setCurrentTab('products')}
                            className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                          >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Product
                          </Button>
                        </div>
                      ) : salesDisplayMode === 'grid' && categories.length > 0 && selectedSalesCategory === null ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div onClick={() => { setSalesDisplayMode('tabs'); setSalesCategoryFilter('all'); }} className="p-4 rounded-xl border border-gray-600/50 bg-gradient-to-br from-gray-700/30 to-gray-800/30 hover:border-gray-500 hover:bg-gray-700/40 cursor-pointer transition-all group">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-11 h-11 rounded-xl bg-gray-600/40 flex items-center justify-center group-hover:scale-110 transition-transform"><Package className="w-5 h-5 text-gray-300" /></div>
                              <span className="font-medium text-white text-sm">All Products</span>
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
                          {products.some(p => !p.categoryId) && (
                            <div onClick={() => { setSalesDisplayMode('tabs'); setSalesCategoryFilter(0 as any); }} className="p-4 rounded-xl border border-gray-600/50 bg-gradient-to-br from-gray-700/30 to-gray-800/30 hover:border-gray-500 hover:bg-gray-700/40 cursor-pointer transition-all group">
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-11 h-11 rounded-xl bg-gray-600/40 flex items-center justify-center group-hover:scale-110 transition-transform"><Folder className="w-5 h-5 text-gray-400" /></div>
                                <span className="font-medium text-white text-sm">Uncategorized</span>
                                <span className="text-xs text-gray-400">{products.filter(p => !p.categoryId).length} items</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : salesDisplayMode === 'grid' && selectedSalesCategory !== null ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <button onClick={() => setSelectedSalesCategory(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" />Back to Categories</button>
                            <Button size="sm" onClick={() => { setSelectedProductsForCategory(products.filter(p => p.categoryId === selectedSalesCategory).map(p => p.id)); setIsAddProductsToCategoryOpen(true); }} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white text-xs"><Plus className="w-3 h-3 mr-1" />Add Products</Button>
                          </div>
                          <div className="flex items-center gap-3 py-2 border-b border-gray-700/50">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categories.find(c => c.id === selectedSalesCategory)?.color || '#3b82f6'}30` }}><Folder className="w-4 h-4" style={{ color: categories.find(c => c.id === selectedSalesCategory)?.color || '#3b82f6' }} /></div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{categories.find(c => c.id === selectedSalesCategory)?.name || 'Category'}</h3>
                              <p className="text-xs text-gray-400">{products.filter(p => p.categoryId === selectedSalesCategory).length} products</p>
                            </div>
                          </div>
                          <div className="grid gap-1">
                            {products.filter(p => p.categoryId === selectedSalesCategory).map((product) => (
                              <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-150 border border-transparent hover:border-gray-700/50" onClick={() => addToSale(product)}>
                                <div>
                                  <p className="font-medium text-white text-sm">{product.name}</p>
                                  <p className="text-xs text-gray-500">SKU: {product.sku} · Stock: {product.quantity}</p>
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
                                <p className="text-xs text-gray-500">SKU: {product.sku} · Stock: {product.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-[hsl(217,90%,60%)] text-sm">R{getProductPrice(product, selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.customerType || 'retail' : 'retail')}</p>
                                {product.tradePrice && (
                                  <p className="text-xs text-gray-500">{selectedCustomerId && customers.find(c => c.id === selectedCustomerId)?.customerType === 'trade' ? `Retail: R${product.retailPrice}` : `Trade: R${product.tradePrice}`}</p>
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
                  <div data-testid="current-sale-card" className="w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 bg-[hsl(217,20%,11%)]/60 lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
                    <div className="px-3 py-3 sm:px-5 sm:py-4 border-b border-gray-700/30 bg-[hsl(217,25%,13%)]/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/20"><ShoppingCart className="h-4 w-4 text-white" /></div>
                          <div>
                            <h3 className="text-sm font-semibold text-white">Current Sale</h3>
                            <p className="text-xs text-gray-500">{currentSale.length === 0 ? 'No items yet' : `${currentSale.reduce((acc, item) => acc + item.quantity, 0)} items`}</p>
                          </div>
                        </div>
                        {currentSale.length > 0 && <span className="text-lg font-bold text-[hsl(217,90%,60%)]">R{calculateTotal()}</span>}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="space-y-2 max-h-40 sm:max-h-52 overflow-y-auto">
                        {currentSale.length === 0 ? (
                          <div className="text-center py-8 text-gray-500"><ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">Tap a product to start</p></div>
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
                            <Label className="text-xs text-gray-400 mb-1 block">Customer</Label>
                            <Select value={selectedCustomerId?.toString() || "none"} onValueChange={(value) => setSelectedCustomerId(value === "none" ? null : parseInt(value))}>
                              <SelectTrigger className="h-9 text-xs bg-gray-900/40 border-gray-700/50 text-white"><SelectValue placeholder="No customer" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No customer</SelectItem>
                                {customers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.id.toString()}>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{customer.name}</span>
                                      <span className={`text-xs px-1 rounded ${customer.customerType === 'trade' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>{customer.customerType === 'trade' ? 'Trade' : 'Retail'}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400 mb-1 block">Payment</Label>
                            <Select value={paymentType} onValueChange={setPaymentType}>
                              <SelectTrigger className="h-9 text-xs bg-gray-900/40 border-gray-700/50 text-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="eft">EFT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {selectedCustomerId && (() => {
                          const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
                          return selectedCustomer ? (
                            <div className={`p-2 border rounded-lg text-xs ${selectedCustomer.customerType === 'trade' ? 'bg-green-950/30 border-green-800/30 text-green-400' : 'bg-blue-950/30 border-blue-800/30 text-blue-400'}`}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{selectedCustomer.name}</span>
                                <Badge variant="outline" className={`text-[10px] h-4 ${selectedCustomer.customerType === 'trade' ? 'border-green-700 text-green-400' : 'border-blue-700 text-blue-400'}`}>{selectedCustomer.customerType === 'trade' ? 'Trade Pricing' : 'Retail Pricing'}</Badge>
                              </div>
                              {selectedCustomer.phone && <p className="mt-0.5 opacity-80">Phone: {selectedCustomer.phone}</p>}
                              {selectedCustomer.notes && <p className="mt-0.5 italic opacity-70">{selectedCustomer.notes}</p>}
                            </div>
                          ) : null;
                        })()}
                        <div>
                          <Label className="text-xs text-gray-400 mb-1 block">Notes</Label>
                          <Textarea value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} placeholder="Sale notes..." rows={1} className="bg-gray-900/40 border-gray-700/50 text-white text-xs placeholder:text-gray-600 resize-none" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400 mb-1.5 block">Discount</Label>
                          <div className="flex flex-wrap gap-1.5 touch-action-manipulation">
                            {[0, 5, 10, 20, 50].map((percentage) => (
                              <Button key={percentage} type="button" size="sm" variant={discountPercentage === percentage ? "default" : "outline"} onClick={() => setDiscountPercentage(percentage)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background hover:bg-accent rounded-md h-9 sm:h-7 text-xs px-3 sm:px-2.5 border-gray-700/50 hover:text-white text-[#000000]">{percentage === 0 ? "None" : `${percentage}%`}</Button>
                            ))}
                            <div className="flex items-center gap-1 ml-1">
                              <Input type="number" min="0" max="100" step="1" placeholder="0" value={discountPercentage || ""} onChange={(e) => { const inputVal = e.target.value; if (inputVal === "") { setDiscountPercentage(0); } else { setDiscountPercentage(Math.min(100, Math.max(0, parseInt(inputVal) || 0))); } }} className="w-14 h-9 sm:h-7 text-center text-xs bg-gray-900/40 border-gray-700/50 text-white" />
                              <span className="text-xs text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-400">Tip on receipt</Label>
                          <button type="button" onClick={() => setTipOptionEnabled(!tipOptionEnabled)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${tipOptionEnabled ? 'bg-[hsl(217,90%,40%)]' : 'bg-gray-600'}`}>
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${tipOptionEnabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-700/30 space-y-1.5">
                        <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">R{calculateSubtotal().toFixed(2)}</span></div>
                        {discountPercentage > 0 && <div className="flex justify-between text-sm text-green-400"><span>Discount ({discountPercentage}%)</span><span>-R{calculateDiscount().toFixed(2)}</span></div>}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-600/30">
                          <span className="text-base font-bold text-white">Total</span>
                          <span className="text-xl font-bold text-[hsl(217,90%,50%)]">R{calculateTotal()}</span>
                        </div>
                      </div>
                      <div className="space-y-3 pt-3 border-t border-gray-700/30">
                        <div className="flex gap-1.5">
                          <Button type="button" size="sm" variant={checkoutOption === 'open-account' ? "default" : "outline"} onClick={() => setCheckoutOption(checkoutOption === 'open-account' ? 'complete' : 'open-account')} className={`flex-1 h-10 sm:h-8 text-xs ${checkoutOption === 'open-account' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] border-0 text-white" : "border-gray-700/50 text-gray-400"}`}><FileText className="h-3.5 w-3.5 mr-1.5" />Open Account</Button>
                          <Button type="button" size="sm" variant={checkoutOption === 'add-to-account' ? "default" : "outline"} onClick={() => setCheckoutOption(checkoutOption === 'add-to-account' ? 'complete' : 'add-to-account')} disabled={openAccounts.length === 0} className={`flex-1 h-10 sm:h-8 text-xs ${checkoutOption === 'add-to-account' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] border-0 text-white" : "border-gray-700/50 text-gray-400"}`}><Plus className="h-3.5 w-3.5 mr-1.5" />Add to Account</Button>
                        </div>
                        {checkoutOption === 'add-to-account' && (
                          <div>
                            <Label className="text-xs text-gray-400 mb-1 block">Select Open Account</Label>
                            <Select value={selectedOpenAccountId?.toString() || ""} onValueChange={(value) => setSelectedOpenAccountId(value ? parseInt(value) : null)}>
                              <SelectTrigger className="h-9 text-xs bg-gray-900/40 border-gray-700/50 text-white"><SelectValue placeholder="Choose an open account" /></SelectTrigger>
                              <SelectContent>
                                {openAccounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id.toString()}>
                                    <div className="flex flex-col">
                                      <div className="flex items-center gap-2"><span className="font-medium">{account.accountName}</span><Badge variant={account.accountType === 'table' ? 'default' : 'outline'} className="text-xs">{account.accountType === 'table' ? 'Table' : 'Customer'}</Badge></div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500"><span>Current: R{account.total}</span><span>·</span><span>{Array.isArray(account.items) ? account.items.length : 0} items</span></div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <Button className="w-full h-12 sm:h-10 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold shadow-lg shadow-blue-900/30" onClick={() => checkoutMutation.mutate()} disabled={currentSale.length === 0 || checkoutMutation.isPending || (checkoutOption === 'add-to-account' && !selectedOpenAccountId)}>
                          {checkoutOption === 'complete' ? (<><Receipt className="h-4 w-4 mr-2" />{checkoutMutation.isPending ? "Processing..." : "Complete Sale"}</>) : checkoutOption === 'open-account' ? (<><FileText className="h-4 w-4 mr-2" />{checkoutMutation.isPending ? "Processing..." : "Create Open Account"}</>) : (<><Plus className="h-4 w-4 mr-2" />{checkoutMutation.isPending ? "Processing..." : "Add to Account"}</>)}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
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
                  <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-medium">Total Products</p>
                        <p className="text-white text-xl font-bold">{products.length}</p>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-green-500/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-medium">In Stock</p>
                        <p className="text-white text-xl font-bold">{products.filter(p => p.quantity > 5).length}</p>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-amber-500/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-medium">Low Stock</p>
                        <p className="text-white text-xl font-bold">{products.filter(p => p.quantity <= 5 && p.quantity > 0).length}</p>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-red-500/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30">
                        <XCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-medium">Out of Stock</p>
                        <p className="text-white text-xl font-bold">{products.filter(p => p.quantity === 0).length}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Main Products Card */}
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-blue-900/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/5 via-transparent to-[hsl(217,90%,40%)]/5"></div>
                <CardHeader className="relative border-b border-white/10 pb-4 bg-[#000000]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-xl font-bold">Product Inventory</CardTitle>
                        <p className="text-gray-400 text-sm">Manage your product catalog</p>
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
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(217,90%,50%)]">Sort By</p>
                          </div>
                          {[
                            { value: 'name-asc', label: 'Name A-Z' },
                            { value: 'name-desc', label: 'Name Z-A' },
                            { value: 'sku-asc', label: 'SKU A-Z' },
                            { value: 'sku-desc', label: 'SKU Z-A' },
                            { value: 'price-asc', label: 'Price Low-High' },
                            { value: 'price-desc', label: 'Price High-Low' },
                            { value: 'stock-asc', label: 'Stock Low-High' },
                            { value: 'stock-desc', label: 'Stock High-Low' },
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
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(217,90%,50%)]">Category</p>
                          </div>
                          <DropdownMenuItem
                            onClick={() => setProductCategoryFilter('all')}
                            className={`text-sm rounded-md transition-colors ${productCategoryFilter === 'all' ? 'bg-[hsl(217,90%,40%)]/20 text-[hsl(217,90%,60%)]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                          >
                            {productCategoryFilter === 'all' && <Check className="h-3 w-3 mr-2 text-[hsl(217,90%,50%)]" />}
                            {productCategoryFilter !== 'all' && <span className="w-5" />}
                            All Categories
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setProductCategoryFilter(0 as any)}
                            className={`text-sm rounded-md transition-colors ${productCategoryFilter === 0 ? 'bg-[hsl(217,90%,40%)]/20 text-[hsl(217,90%,60%)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                          >
                            {productCategoryFilter === 0 && <Check className="h-3 w-3 mr-2 text-[hsl(217,90%,50%)]" />}
                            {productCategoryFilter !== 0 && <span className="w-5" />}
                            Uncategorized
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
                            Import / Export
                            <ChevronDown className="h-3 w-3 ml-2 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-52 bg-gray-950 border border-[hsl(217,90%,40%)]/30 shadow-xl shadow-black/50 p-1" align="start">
                          <DropdownMenuItem onClick={handleExportProducts} className="text-gray-200 hover:bg-[hsl(217,90%,40%)]/10 hover:text-white rounded-md">
                            <Download className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                            Export to Excel
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-[hsl(217,90%,40%)]/20 my-1" />
                          <DropdownMenuItem 
                            className="text-gray-200 hover:bg-[hsl(217,90%,40%)]/10 hover:text-white cursor-pointer rounded-md"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <label className="cursor-pointer flex items-center w-full">
                              <Upload className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                              Import with Excel
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
                            Delete All Products
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openCategoryDialog()}
                        className="h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200"
                      >
                        <FolderPlus className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                        Categories
                      </Button>
                      
                      <AlertDialog open={showDeleteAllProductsConfirm} onOpenChange={setShowDeleteAllProductsConfirm}>
                        <AlertDialogContent className="bg-gray-900 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete All Products?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              This action cannot be undone. All {products?.length || 0} products will be permanently deleted from your inventory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteAllProductsMutation.mutate()}
                              className="bg-red-600 hover:bg-red-700 text-white"
                              disabled={deleteAllProductsMutation.isPending}
                            >
                              {deleteAllProductsMutation.isPending ? "Deleting..." : "Delete All"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => openProductDialog()} className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Product
                          </Button>
                        </DialogTrigger>
                    <DialogContent className="sm:max-w-[560px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-700/50 shadow-2xl shadow-blue-900/30 p-0 overflow-hidden" aria-describedby="product-dialog-description">
                      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/5 via-transparent to-[hsl(217,90%,40%)]/5 pointer-events-none"></div>
                      <div className="relative">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-700/50">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <DialogTitle className="text-xl font-bold text-white">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                              </DialogTitle>
                              <p id="product-dialog-description" className="text-sm text-gray-400 mt-0.5">
                                {editingProduct ? 'Update the product information below.' : 'Enter the details to add a new product to your inventory.'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Form {...productForm}>
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              productForm.handleSubmit(handleProductSubmit)(e);
                            }} 
                            className="px-6 py-5 space-y-5"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField
                                control={productForm.control}
                                name="sku"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                      <Tag className="w-3.5 h-3.5 text-[hsl(217,90%,50%)]" />
                                      SKU / Code
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="e.g., PROD001" 
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
                                      Stock Qty
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="e.g., 50" 
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
                                    Product Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Coffee - Espresso" 
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
                                <span className="text-sm font-medium text-gray-300">Pricing</span>
                                <div className="flex-1 h-px bg-gray-700/50"></div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <FormField
                                  control={productForm.control}
                                  name="costPrice"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-400 text-xs font-medium">Cost Price</FormLabel>
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
                                      <FormLabel className="text-gray-400 text-xs font-medium">Retail Price</FormLabel>
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
                                      <FormLabel className="text-gray-400 text-xs font-medium">Trade Price</FormLabel>
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
                                <Folder className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                                <span className="text-sm font-medium text-gray-300">Category</span>
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
                                          <SelectValue placeholder="Select category (optional)" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-gray-700">
                                          <SelectItem value="none" className="text-gray-400">No Category</SelectItem>
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
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] shadow-lg shadow-blue-500/30 px-6"
                                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                              >
                                {createProductMutation.isPending || updateProductMutation.isPending ? (
                                  <span className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Saving...
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2">
                                    {editingProduct ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                  </span>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 relative pt-6 bg-[#000000]">
                  <div className="space-y-4">
                    {/* Enhanced Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/10 via-transparent to-[hsl(217,90%,40%)]/10 rounded-xl blur-lg"></div>
                      <div className="relative flex items-center">
                        <Search className="absolute left-4 h-5 w-5 text-[hsl(217,90%,50%)]" />
                        <Input
                          placeholder="Search products by name or SKU..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="pl-12 h-12 bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
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
                            <p className="text-gray-400">{productSearchTerm ? 'No products found matching your search.' : 'No products available.'}</p>
                            {!productSearchTerm && (
                              <Button
                                onClick={() => openProductDialog()}
                                className="mt-2 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                              >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Add Product
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
                            whileHover={{ scale: 1.01 }}
                            className="group"
                          >
                            <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-xl p-4 sm:p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden">
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
                                    <p className="text-[9px] text-gray-500 uppercase">Retail</p>
                                    <p className="text-white font-bold text-xs">R{product.retailPrice}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-gray-500 uppercase">Cost</p>
                                    <p className="text-gray-400 font-medium text-xs">R{product.costPrice}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-[9px] text-gray-500 uppercase">Stock</p>
                                    <div className="flex items-center justify-center gap-0.5">
                                      <p className={`font-bold text-xs ${
                                        product.quantity === 0 ? 'text-red-400' :
                                        product.quantity <= 5 ? 'text-amber-400' : 'text-green-400'
                                      }`}>
                                        {product.quantity}
                                      </p>
                                      {product.quantity <= 5 && product.quantity > 0 && (
                                        <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 rounded-full">Low</span>
                                      )}
                                      {product.quantity === 0 && (
                                        <span className="text-[8px] bg-red-500/20 text-red-400 px-1 rounded-full">Out</span>
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
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Cost</p>
                                    <p className="text-gray-400 font-medium">R{product.costPrice}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Retail</p>
                                    <p className="text-white font-bold text-lg">R{product.retailPrice}</p>
                                  </div>
                                  {product.tradePrice && (
                                    <div className="text-right hidden lg:block">
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">Trade</p>
                                      <p className="text-[hsl(217,90%,60%)] font-medium">R{product.tradePrice}</p>
                                    </div>
                                  )}
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                                    <div className="flex items-center gap-1">
                                      <p className={`font-bold ${
                                        product.quantity === 0 ? 'text-red-400' :
                                        product.quantity <= 5 ? 'text-amber-400' : 'text-green-400'
                                      }`}>
                                        {product.quantity}
                                      </p>
                                      {product.quantity <= 5 && product.quantity > 0 && (
                                        <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/30">Low</span>
                                      )}
                                      {product.quantity === 0 && (
                                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/30">Out</span>
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
          <TabsContent value="customers">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                <CardTitle className="text-white text-xl font-bold">Customer Directory</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200">
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                        Import / Export
                        <ChevronDown className="h-3 w-3 ml-2 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-52 bg-gray-950 border border-[hsl(217,90%,40%)]/30 shadow-xl shadow-black/50 p-1" align="start">
                      <DropdownMenuItem onClick={handleExportCustomers} className="text-gray-200 hover:bg-[hsl(217,90%,40%)]/10 hover:text-white rounded-md">
                        <Download className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                        Export to Excel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[hsl(217,90%,40%)]/20 my-1" />
                      <DropdownMenuItem 
                        className="text-gray-200 hover:bg-[hsl(217,90%,40%)]/10 hover:text-white cursor-pointer rounded-md"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <label className="cursor-pointer flex items-center w-full">
                          <Upload className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                          Import with Excel
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
                  <Button 
                    onClick={() => openCustomerDialog()}
                    className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 bg-black">
                <div className="mb-5 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Filter Spend by Date Range</p>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-gray-400 w-8 shrink-0">From</label>
                      <input
                        type="date"
                        value={customerSpendFrom}
                        onChange={(e) => setCustomerSpendFrom(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="flex-1 h-8 rounded-md bg-gray-900 border border-white/20 text-white text-xs px-2 focus:outline-none focus:border-[hsl(217,90%,40%)]"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-xs text-gray-400 w-8 shrink-0">To</label>
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
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {customers.map((customer) => {
                    const spend = customerSpendMap[customer.id];
                    return (
                    <motion.div 
                      key={customer.id} 
                      className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                      whileHover={{ scale: 1.01, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-white">{customer.name}</h3>
                          <Badge variant={customer.customerType === 'trade' ? 'default' : 'outline'} className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                            {customer.customerType === 'trade' ? 'Trade' : 'Retail'}
                          </Badge>
                          {spend !== undefined && (
                            <Badge className="bg-green-600/20 text-green-300 border border-green-500/30 text-xs">
                              Total Spend: R{spend.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        {customer.phone && <p className="text-sm text-gray-300">Phone: {customer.phone}</p>}
                        {customer.notes && <p className="text-sm text-gray-300">Notes: {customer.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCustomerDialog(customer)}
                          className="bg-transparent border-blue-500/30 text-white hover:bg-blue-500/20 hover:text-blue-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCustomerMutation.mutate(customer.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ); })}
                  {customers.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No customers found. Add your first customer to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </TabsContent>

          {/* Invoices & Quotes Tab */}
          <TabsContent value="invoices">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <CardTitle className="text-white text-lg sm:text-xl font-bold">Invoices & Quotes</CardTitle>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleExportInvoices}
                    className="h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                    Export to Excel
                  </Button>
                  <Button 
                    onClick={() => setIsInvoiceDialogOpen(true)}
                    className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 text-sm"
                    data-testid="button-create-invoice"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Invoice/Quote
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 bg-black">
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="space-y-3">
                    <div className="w-full">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search by document number or client..."
                          value={invoiceSearchQuery}
                          onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm"
                          data-testid="input-invoice-search"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Select value={invoiceTypeFilter} onValueChange={(value: any) => setInvoiceTypeFilter(value)}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white text-sm" data-testid="select-invoice-type-filter">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="invoice">Invoices</SelectItem>
                          <SelectItem value="quote">Quotes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={invoiceStatusFilter} onValueChange={(value: any) => setInvoiceStatusFilter(value)}>
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white text-sm" data-testid="select-invoice-status-filter">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="not_paid">Not Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Select value={invoiceSortOrder} onValueChange={(value: any) => setInvoiceSortOrder(value)}>
                      <SelectTrigger className="w-full bg-white/5 border-white/10 text-white text-sm">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Date: Newest First</SelectItem>
                        <SelectItem value="date-asc">Date: Oldest First</SelectItem>
                        <SelectItem value="name-asc">Client: A-Z</SelectItem>
                        <SelectItem value="name-desc">Client: Z-A</SelectItem>
                        <SelectItem value="amount-desc">Amount: High-Low</SelectItem>
                        <SelectItem value="amount-asc">Amount: Low-High</SelectItem>
                        <SelectItem value="number-asc">Doc Number: A-Z</SelectItem>
                        <SelectItem value="number-desc">Doc Number: Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-300 text-xs sm:text-sm mb-1 block">From Date</Label>
                        <Input
                          type="date"
                          value={invoiceDateFrom}
                          onChange={(e) => setInvoiceDateFrom(e.target.value)}
                          className="bg-white/5 border-white/10 text-white w-full text-sm"
                          data-testid="input-invoice-date-from"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-xs sm:text-sm mb-1 block">To Date</Label>
                        <Input
                          type="date"
                          value={invoiceDateTo}
                          onChange={(e) => setInvoiceDateTo(e.target.value)}
                          className="bg-white/5 border-white/10 text-white w-full text-sm"
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
                        className="border-blue-500/30 hover:bg-blue-500/20 hover:text-blue-200 w-full bg-[#00000033] text-[#ffffff]"
                        data-testid="button-clear-filters"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>

                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    {invoices.length === 0 ? (
                      <>
                        <p className="text-gray-400 text-lg mb-2">No invoices or quotes yet</p>
                        <p className="text-gray-500 text-sm">Create your first invoice or quote to get started</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-lg mb-2">No results found</p>
                        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
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
                                {invoice.documentType === 'invoice' ? 'Invoice' : 'Quote'}
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
                                title="Edit document number"
                              >
                                <Edit className="w-3 h-3 text-gray-400 hover:text-white" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                              <span className="text-gray-300 text-xs sm:text-sm">Paid</span>
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
                              Client: {customers.find(c => c.id === invoice.clientId)?.name || invoice.clientName || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-xs sm:text-sm">
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
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

          {/* Open Accounts Tab */}
          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Purchase Orders</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage supplier orders and track deliveries</p>
                </div>
                <Button onClick={() => { resetPOForm(); setIsPODialogOpen(true); }} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white shadow-lg shadow-blue-900/30">
                  <Plus className="h-4 w-4 mr-2" />New Purchase Order
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input placeholder="Search by PO number or supplier..." value={poSearchTerm} onChange={(e) => setPOSearchTerm(e.target.value)} className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500" />
                </div>
                <Select value={poStatusFilter} onValueChange={setPOStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    <SelectItem value="all" className="text-white">All Statuses</SelectItem>
                    <SelectItem value="draft" className="text-white">Draft</SelectItem>
                    <SelectItem value="sent" className="text-white">Sent</SelectItem>
                    <SelectItem value="partial" className="text-white">Partially Received</SelectItem>
                    <SelectItem value="received" className="text-white">Received</SelectItem>
                    <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                    <SelectItem value="paid" className="text-green-400">Paid</SelectItem>
                    <SelectItem value="not_paid" className="text-red-400">Not Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Total", count: purchaseOrders.length, color: "from-gray-700 to-gray-800" },
                  { label: "Draft", count: purchaseOrders.filter((p: any) => p.status === 'draft').length, color: "from-gray-600 to-gray-700" },
                  { label: "Sent", count: purchaseOrders.filter((p: any) => p.status === 'sent').length, color: "from-blue-900 to-blue-800" },
                  { label: "Partial", count: purchaseOrders.filter((p: any) => p.status === 'partial').length, color: "from-yellow-900 to-yellow-800" },
                  { label: "Received", count: purchaseOrders.filter((p: any) => p.status === 'received').length, color: "from-green-900 to-green-800" },
                ].map((stat) => (
                  <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 border border-gray-700/50`}>
                    <p className="text-gray-400 text-xs">{stat.label}</p>
                    <p className="text-white text-xl font-bold">{stat.count}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {isPOLoading ? (
                  <div className="text-center py-12 text-gray-400">Loading purchase orders...</div>
                ) : filteredPurchaseOrders.length === 0 ? (
                  <div className="text-center py-16">
                    <ClipboardList className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400">No purchase orders found</h3>
                    <p className="text-gray-500 mt-2">Create your first purchase order to get started</p>
                  </div>
                ) : (
                  filteredPurchaseOrders.map((po: any) => (
                    <motion.div key={po.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all group">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[hsl(217,90%,60%)] font-mono font-bold text-sm">{po.poNumber}</span>
                            {getPOStatusBadge(po.status)}
                            <Badge className={`cursor-pointer text-xs ${po.isPaid ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'} border`} onClick={(e) => { e.stopPropagation(); togglePOPaidMutation.mutate({ id: po.id, isPaid: !po.isPaid }); }}>{po.isPaid ? 'Paid' : 'Not Paid'}</Badge>
                          </div>
                          <h3 className="text-white font-semibold truncate">{po.supplierName}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{(po.items || []).length} item{(po.items || []).length !== 1 ? 's' : ''}</span>
                            <span>R{parseFloat(po.total).toFixed(2)}</span>
                            <span>{new Date(po.createdAt).toLocaleDateString()}</span>
                            {po.expectedDate && <span className="text-yellow-400/70">Due: {new Date(po.expectedDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedPO(po); setIsPOViewOpen(true); }} className="text-gray-400 hover:text-white hover:bg-gray-800"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => loadPOForEdit(po)} className="text-gray-400 hover:text-white hover:bg-gray-800" disabled={po.status === 'received' || po.status === 'cancelled'}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => generatePOPdf(po)} className="text-gray-400 hover:text-white hover:bg-gray-800"><Download className="h-4 w-4" /></Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800"><ChevronDown className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-900 border-gray-700">
                              {po.status === 'draft' && <DropdownMenuItem onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'sent' })} className="text-blue-400 hover:text-blue-300">Mark as Sent</DropdownMenuItem>}
                              {(po.status === 'sent' || po.status === 'partial') && (
                                <>
                                  <DropdownMenuItem onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'partial' })} className="text-yellow-400 hover:text-yellow-300">Partially Received</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'received' })} className="text-green-400 hover:text-green-300">Mark as Received</DropdownMenuItem>
                                </>
                              )}
                              {po.status !== 'cancelled' && po.status !== 'received' && (
                                <><DropdownMenuSeparator className="bg-gray-700" /><DropdownMenuItem onClick={() => updatePOStatusMutation.mutate({ id: po.id, status: 'cancelled' })} className="text-red-400 hover:text-red-300">Cancel Order</DropdownMenuItem></>
                              )}
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem onClick={() => { setDeletingPOId(po.id); setIsDeletePODialogOpen(true); }} className="text-red-400 hover:text-red-300">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="open-accounts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Open Accounts Header */}
              <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-xl font-bold">
                    <FileText className="w-5 h-5" />
                    Open Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-black">
                  <div className="grid gap-4">
                    {openAccounts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No open accounts. Create one from the Sales tab to get started.
                      </div>
                    ) : (
                      openAccounts.map((account) => (
                        <motion.div 
                          key={account.id} 
                          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
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
                              </div>
                              <Badge variant={account.accountType === 'table' ? 'default' : 'outline'} className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                                {account.accountType === 'table' ? 'Table' : 'Customer'}
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
                            <p>Created: {new Date(account.createdAt).toLocaleDateString()} at {new Date(account.createdAt).toLocaleTimeString()}</p>
                            {account.lastUpdated && (
                              <p>Updated: {new Date(account.lastUpdated).toLocaleDateString()} at {new Date(account.lastUpdated).toLocaleTimeString()}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOpenAccount(account)}
                              className="flex-1 bg-transparent border-blue-500/30 text-white hover:bg-blue-500/20 hover:text-blue-200"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                const paymentType = 'cash'; // Default to cash, could be made configurable
                                closeOpenAccountMutation.mutate({ accountId: account.id, paymentType });
                              }}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                              disabled={closeOpenAccountMutation.isPending}
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              {closeOpenAccountMutation.isPending ? 'Closing...' : 'Close & Pay'}
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
          <TabsContent value="reports">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Date Filter */}
              <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-xl font-bold">
                    <Calendar className="w-5 h-5" />
                    Sales Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-4">
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="date-filter" className="text-gray-300 text-xs sm:text-sm">Select Date:</Label>
                        <Input
                          id="date-filter"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full sm:w-auto bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor="staff-filter" className="text-gray-300 text-xs sm:text-sm">Filter by Staff:</Label>
                        <Select value={selectedStaffFilter.toString()} onValueChange={(value) => setSelectedStaffFilter(value === "all" ? "all" : parseInt(value))}>
                          <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                            <SelectValue placeholder="All Staff" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sales</SelectItem>
                            <SelectItem value="0">Manager</SelectItem>
                            {staffAccounts.map((staff) => (
                              <SelectItem key={staff.id} value={staff.id.toString()}>
                                {staff.displayName || staff.username || `Staff #${staff.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={() => handlePrintReport()}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                  name: method.charAt(0).toUpperCase() + method.slice(1),
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
                    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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

                const COLORS = ['hsl(217,90%,50%)', 'hsl(217,90%,60%)', 'hsl(217,90%,70%)', 'hsl(217,90%,40%)'];

                return (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                        <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium text-gray-300">Total Revenue</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-400">R{totalRevenue.toFixed(2)}</div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                        <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-300">Total Profit</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-500">R{totalProfit.toFixed(2)}</div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                        <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-blue-300" />
                              <span className="text-sm font-medium text-gray-300">Transactions</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-300">{totalTransactions}</div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                        <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium text-gray-300">Avg Transaction</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-400">R{avgTransactionValue.toFixed(2)}</div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Payment Methods Pie Chart */}
                      <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                        <CardHeader className="border-b border-white/10 pb-4">
                          <CardTitle className="text-white">Payment Methods Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
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
                                  fill="hsl(217,90%,50%)"
                                  dataKey="value"
                                >
                                  {paymentChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`R${Number(value).toFixed(2)}`, 'Amount']} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-400">
                              No sales data for selected date
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* 7-Day Trend Line Chart */}
                      <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                        <CardHeader className="border-b border-white/10 pb-4">
                          <CardTitle className="text-white">7-Day Sales Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyTotals}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="date" stroke="#9ca3af" />
                              <YAxis stroke="#9ca3af" />
                              <Tooltip 
                                formatter={(value, name) => [
                                  name === 'total' ? `R${Number(value).toFixed(2)}` : value,
                                  name === 'total' ? 'Revenue' : 'Transactions'
                                ]}
                                contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                              />
                              <Line type="monotone" dataKey="total" stroke="hsl(217,90%,50%)" strokeWidth={3} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Sales List */}
                    <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                      <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="text-white">Sales Details for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          {dateFilteredSales.length > 0 ? (
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
                                            Sale #{sale.id}
                                          </span>
                                          <Badge variant="outline" className="text-xs bg-gray-800/50 border-gray-600 text-gray-300">
                                            {saleItems.length} {saleItems.length === 1 ? 'item' : 'items'}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs bg-blue-600/20 text-blue-300 border-blue-500/30">
                                            {sale.paymentType.toUpperCase()}
                                          </Badge>
                                          {sale.isVoided && (
                                            <Badge variant="destructive" className="text-xs">
                                              VOIDED
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-0.5">
                                          {new Date(sale.createdAt).toLocaleString()} 
                                          {sale.customerName && ` • ${sale.customerName}`}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Served by: {
                                            sale.staffAccountId 
                                              ? (() => {
                                                  const staff = staffAccounts.find(s => s.id === sale.staffAccountId);
                                                  return staff ? (staff.displayName || staff.username || `Staff #${staff.id}`) : 'Staff Member';
                                                })()
                                              : currentUser?.email?.split('@')[0] || 'Manager'
                                          }
                                          {sale.isVoided && sale.voidReason && ` • Void: ${sale.voidReason}`}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <span className={`text-lg font-bold ${sale.isVoided ? 'line-through text-red-500' : 'text-[hsl(217,90%,50%)]'}`}>
                                          R{sale.total}
                                        </span>
                                      </div>
                                      {!sale.isVoided && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => { e.stopPropagation(); handleVoidSaleClick(sale); }}
                                          className="h-7 px-2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                        >
                                          <X className="h-3 w-3 mr-1" />
                                          Void
                                        </Button>
                                      )}
                                      {sale.isVoided && sale.voidReason && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => { e.stopPropagation(); handleViewVoidReason(sale); }}
                                          className="h-7 px-2 text-xs border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          View
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
                                          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transaction Details</span>
                                        </div>
                                        <div className="divide-y divide-gray-700/30">
                                          {saleItems.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors">
                                              <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[hsl(217,90%,40%)]/20 flex items-center justify-center">
                                                  <Package className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                                                </div>
                                                <div>
                                                  <p className="text-white font-medium">{item.name || 'Unknown Product'}</p>
                                                  <p className="text-xs text-gray-500">SKU: {item.sku || 'N/A'}</p>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="flex items-center gap-4">
                                                  <div className="text-center">
                                                    <p className="text-xs text-gray-500">Qty</p>
                                                    <p className="text-white font-medium">{item.quantity || 1}</p>
                                                  </div>
                                                  <div className="text-center">
                                                    <p className="text-xs text-gray-500">Price</p>
                                                    <p className="text-white font-medium">R{parseFloat(item.price || 0).toFixed(2)}</p>
                                                  </div>
                                                  <div className="text-center min-w-[80px]">
                                                    <p className="text-xs text-gray-500">Subtotal</p>
                                                    <p className="text-[hsl(217,90%,50%)] font-semibold">R{((item.quantity || 1) * parseFloat(item.price || 0)).toFixed(2)}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="bg-gradient-to-r from-[hsl(217,30%,20%)]/50 to-transparent px-4 py-3 border-t border-gray-700/30 flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-300">Total</span>
                                          <span className="text-lg font-bold text-[hsl(217,90%,50%)]">R{sale.total}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                </motion.div>
                              );
                            })
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              No sales recorded for {new Date(selectedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </motion.div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
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
              const currentMonthInvoices = invoices.filter((invoice: any) => {
                const invoiceDate = new Date(invoice.createdDate);
                return invoiceDate >= currentMonthStart && invoiceDate <= currentMonthEnd;
              });
              
              // Calculate fees
              const salesFee = isInTrial ? 0 : currentMonthRevenue * 0.005; // 0.5% of sales
              const invoiceFee = isInTrial ? 0 : currentMonthInvoices.length * 0.50; // R0.50 per invoice
              const stormFee = salesFee + invoiceFee; // Total Storm fee

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
                return date.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
              };

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
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
                              <h3 className="text-2xl font-bold">Free Trial Active</h3>
                              <p className="text-blue-100 text-sm font-medium">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</p>
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
                              <span className="font-medium">No usage fees during trial period</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-[hsl(217,90%,40%)]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="font-medium">Unlimited sales at R0.00 cost</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-[hsl(217,90%,40%)]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="font-medium">Full access to all features</span>
                            </div>
                          </div>
                          
                          {/* Footer message */}
                          <p className="text-blue-100 text-sm leading-relaxed">
                            After your trial, our simple 0.5% per sale pricing starts automatically. You'll see your first usage charge on day 8.
                          </p>
                        </div>
                        
                        {/* Countdown card */}
                        <div className="text-center bg-white/15 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/20 min-w-[140px]">
                          <div className="text-5xl font-bold mb-2">{daysRemaining}</div>
                          <div className="text-blue-100 text-sm font-semibold uppercase tracking-wide">
                            {daysRemaining === 1 ? 'Day Left' : 'Days Left'}
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <div className="text-xs text-blue-200">Trial ends</div>
                            <div className="text-sm font-medium mt-1">
                              {new Date(new Date(userTrialStartDate!).getTime() + (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
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
                        <h2 className="text-xl sm:text-2xl font-bold">Usage & Billing</h2>
                        <p className="text-blue-100 mt-1 text-sm">{formatMonthYear(now)} billing period</p>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold">R{stormFee.toFixed(2)}</div>
                        <div className="text-blue-100 text-sm">Amount due to Storm</div>
                        <Button
                          onClick={() => setIsBankDetailsOpen(true)}
                          variant="outline"
                          size="sm"
                          className="mt-3 bg-blue-500/20 border-blue-300 text-white hover:bg-blue-600 hover:border-blue-400 shadow-sm backdrop-blur-sm w-full sm:w-auto"
                        >
                          <CreditCard className="w-4 h-4 mr-2 shrink-0" />
                          View Payment Details
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Key Metrics */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                      <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Current Month Revenue
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-400">R{currentMonthRevenue.toFixed(2)}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            {currentMonthSales.length} transactions
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                      <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl border-l-4 border-l-blue-600">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Storm Service Fee
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-300">R{stormFee.toFixed(2)}</div>
                          <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                            <div>Sales: R{salesFee.toFixed(2)} (0.5%)</div>
                            <div>Invoices: R{invoiceFee.toFixed(2)} ({currentMonthInvoices.length} × R0.50)</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                      <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-xl border-l-4 border-l-blue-400">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Billing Period
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-300">{Math.round(progressPercentage)}%</div>
                          <div className="text-sm text-gray-400 mt-1">
                            Day {daysCompleted} of {daysInMonth}
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  {/* Billing Breakdown */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Fee Calculation */}
                    <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                      <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <DollarSign className="w-5 h-5" />
                          Fee Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-6">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Sales Fee (0.5%)</div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Gross Revenue</span>
                            <span className="font-semibold text-white">R{currentMonthRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Sales Fee (0.5%)</span>
                            <span className="font-semibold text-blue-400">R{salesFee.toFixed(2)}</span>
                          </div>
                          
                          <div className="border-t border-white/10 pt-3 mt-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Invoice Fee (R0.50 each)</div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Invoices Generated</span>
                              <span className="font-semibold text-white">{currentMonthInvoices.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Invoice Fee</span>
                              <span className="font-semibold text-blue-400">R{invoiceFee.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="border-t-2 border-blue-500/30 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white">Total Due to Storm</span>
                              <span className="text-xl font-bold text-blue-400">R{stormFee.toFixed(2)}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => setIsBankDetailsOpen(true)}
                            className="w-full mt-4 h-12 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 rounded-lg"
                          >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Pay Now
                          </Button>
                        </div>
                        
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-300">How Pricing Works</h4>
                              <ul className="text-sm text-gray-300 mt-2 space-y-1">
                                <li>• <strong>Sales:</strong> 0.5% of your monthly revenue</li>
                                <li>• <strong>Invoices:</strong> R0.50 per invoice generated</li>
                                <li className="text-gray-400 text-xs mt-2">Example: 100 invoices/month = R50 in invoice fees</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Revenue Trend */}
                    <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                      <CardHeader className="border-b border-white/10 pb-4">
                        <CardTitle className="flex items-center gap-2 text-white">
                          <BarChart3 className="w-5 h-5" />
                          Recent Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {Object.keys(dailyBreakdown).length > 0 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-300">Avg. Daily Revenue</div>
                                <div className="font-semibold text-white">
                                  R{(currentMonthRevenue / Math.max(daysCompleted, 1)).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-300">Best Day</div>
                                <div className="font-semibold text-white">
                                  R{Math.max(...Object.values(dailyBreakdown)).toFixed(2)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-300">Daily Revenue Trend</div>
                              <div className="space-y-1">
                                {Object.entries(dailyBreakdown)
                                  .sort(([a], [b]) => b.localeCompare(a))
                                  .slice(0, 7)
                                  .map(([date, revenue]) => {
                                    const percentage = (revenue / Math.max(...Object.values(dailyBreakdown))) * 100;
                                    return (
                                      <div key={date} className="flex items-center gap-3">
                                        <div className="w-16 text-xs text-gray-400">
                                          {new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="flex-1 bg-white/10 rounded-full h-2">
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
                            <p>No sales data for this month yet.</p>
                            <p className="text-sm">Start making sales to see your revenue trends!</p>
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
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/80 rounded-xl border border-white/5 p-5">
                          <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                            How Billing Works
                          </h4>
                          <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-[hsl(217,90%,40%)]/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(217,90%,40%)]/30">
                                <span className="text-[10px] font-bold text-[hsl(217,90%,50%)]">1</span>
                              </div>
                              Monthly billing cycle: 1st to last day of month
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-[hsl(217,90%,40%)]/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(217,90%,40%)]/30">
                                <span className="text-[10px] font-bold text-[hsl(217,90%,50%)]">2</span>
                              </div>
                              Service fee: 0.5% of gross monthly revenue
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-[hsl(217,90%,40%)]/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(217,90%,40%)]/30">
                                <span className="text-[10px] font-bold text-[hsl(217,90%,50%)]">3</span>
                              </div>
                              Payment due: End of each month
                            </li>
                            <li className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-[hsl(217,90%,40%)]/15 flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(217,90%,40%)]/30">
                                <span className="text-[10px] font-bold text-[hsl(217,90%,50%)]">4</span>
                              </div>
                              No setup fees or hidden charges
                            </li>
                          </ul>
                        </div>
                        <div className="bg-gray-900/80 rounded-xl border border-white/5 p-5 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                              <HelpCircle className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                              Contact & Support
                            </h4>
                            <div className="space-y-2 text-sm text-gray-300">
                              <p>Questions about your billing?</p>
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
                            View Payment Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })()}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Account & Preferences Section */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                    Account & Preferences
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
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Change Profile Picture</h3>
                            <p className="text-gray-400 text-sm">Update your company logo or avatar</p>
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
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Customize Your Receipt</h3>
                            <p className="text-gray-400 text-sm">Personalize your receipt layout and branding</p>
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
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Invoice &amp; Quote Setup</h3>
                            <p className="text-gray-400 text-sm">Add custom fields and variables to your invoices and quotes</p>
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
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Change Password</h3>
                            <p className="text-gray-400 text-sm">Update your login password securely</p>
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
                            body: JSON.stringify({ preferredLanguage: 'af' })
                          });
                          if (response.ok) {
                            const data = await response.json();
                            localStorage.setItem('posUser', JSON.stringify(data.user));
                            toast({ title: 'Language Updated', description: 'Switching to Afrikaans...' });
                            setTimeout(() => { window.location.href = '/pos/system/afrikaans'; }, 500);
                          } else {
                            toast({ title: 'Error', description: 'Failed to update language preference', variant: 'destructive' });
                          }
                        } catch (error) {
                          console.error('Failed to update language preference:', error);
                          toast({ title: 'Error', description: 'Failed to update language preference', variant: 'destructive' });
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
                            <h3 className="text-white font-semibold text-lg group-hover:text-[hsl(217,90%,60%)] transition-colors">Switch to Afrikaans</h3>
                            <p className="text-gray-400 text-sm">Change your language preference permanently</p>
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
                            <h3 className="text-white font-semibold text-lg group-hover:text-red-400 transition-colors">Logout</h3>
                            <p className="text-gray-400 text-sm">Sign out of your account</p>
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
                    Business Information
                  </CardTitle>
                  <p className="text-gray-400 text-sm mt-1">This information appears on your invoices and quotes. Updates are limited to once per day.</p>
                </CardHeader>
                <CardContent className="pt-6">
                  {(() => {
                    const rs = mergeReceiptSettings(currentUser?.receiptSettings);
                    const today = new Date().toISOString().split('T')[0];
                    const lastUpdate = (rs as any).lastBusinessInfoUpdate;
                    const updatedToday = lastUpdate === today;
                    return (
                      <div className="space-y-4">
                        {updatedToday && (
                          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <p className="text-amber-300 text-sm">Business info was already updated today. You can update again tomorrow.</p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300 text-sm">Company Name</Label>
                            <input disabled={updatedToday} value={bizInfoName} onChange={e => setBizInfoName(e.target.value)} placeholder="Your company name" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Phone Number</Label>
                            <input disabled={updatedToday} value={bizInfoPhone} onChange={e => setBizInfoPhone(e.target.value)} placeholder="+27 12 345 6789" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Email Address</Label>
                            <input disabled={updatedToday} value={bizInfoEmail} onChange={e => setBizInfoEmail(e.target.value)} placeholder="info@yourbusiness.co.za" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Website</Label>
                            <input disabled={updatedToday} value={bizInfoWebsite} onChange={e => setBizInfoWebsite(e.target.value)} placeholder="www.yourbusiness.co.za" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Address Line 1</Label>
                            <input disabled={updatedToday} value={bizInfoAddress1} onChange={e => setBizInfoAddress1(e.target.value)} placeholder="123 Main Street" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Address Line 2</Label>
                            <input disabled={updatedToday} value={bizInfoAddress2} onChange={e => setBizInfoAddress2(e.target.value)} placeholder="Suburb, City, 0001" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">VAT Number</Label>
                            <input disabled={updatedToday} value={bizInfoVat} onChange={e => setBizInfoVat(e.target.value)} placeholder="4123456789" className="mt-1 w-full px-3 py-2 bg-gray-900/60 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] disabled:opacity-50 disabled:cursor-not-allowed" />
                          </div>
                          <div>
                            <Label className="text-gray-300 text-sm">Registration Number</Label>
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
                                const existingSettings = mergeReceiptSettings(currentUser.receiptSettings);
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
                                  const data = await res.json();
                                  const updatedUser = { ...currentUser, receiptSettings: newSettings, companyName: bizInfoName };
                                  setCurrentUser(updatedUser);
                                  localStorage.setItem('posUser', JSON.stringify(updatedUser));
                                  toast({ title: 'Business Info Saved', description: 'Your business information has been updated and will appear on all future invoices.' });
                                } else {
                                  toast({ title: 'Error', description: 'Failed to save business information.', variant: 'destructive' });
                                }
                              } catch {
                                toast({ title: 'Error', description: 'Failed to save business information.', variant: 'destructive' });
                              } finally {
                                setIsSavingBizInfo(false);
                              }
                            }}
                            className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white"
                          >
                            {isSavingBizInfo ? 'Saving...' : 'Save Business Info'}
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
                    Integrations
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
                            <h3 className="text-lg font-semibold text-white">XERO Accounting</h3>
                            <p className="text-sm text-gray-400">Connect your XERO account for seamless accounting</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(currentUser as any)?.xeroConnected ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Check className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                      </div>

                      {(currentUser as any)?.xeroLastSync && (
                        <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                          <p className="text-sm text-gray-400">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Last synced: {new Date((currentUser as any).xeroLastSync).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Setup Instructions</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex items-start gap-2">
                            <span className="text-[hsl(217,90%,40%)] font-medium">1.</span>
                            Go to the XERO Developer Portal and create a new app
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[hsl(217,90%,40%)] font-medium">2.</span>
                            Set the OAuth 2.0 redirect URI to your app's callback URL
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[hsl(217,90%,40%)] font-medium">3.</span>
                            Copy your Client ID and Client Secret
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[hsl(217,90%,40%)] font-medium">4.</span>
                            Click Connect to XERO below to authenticate
                          </li>
                        </ul>
                        <a 
                          href="https://developer.xero.com/myapps/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[hsl(217,90%,40%)] hover:text-[hsl(217,90%,50%)] text-sm mt-3 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          XERO Developer Portal →
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
                              {isSyncingXero ? 'Syncing...' : 'Sync Now'}
                            </Button>
                            <Button
                              onClick={handleDisconnectXero}
                              disabled={isConnectingXero}
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              {isConnectingXero ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={handleConnectXero}
                            disabled={isConnectingXero}
                            className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                          >
                            <Link2 className="w-4 h-4 mr-2" />
                            {isConnectingXero ? 'Connecting...' : 'Connect to XERO'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Data Flow Section */}
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Data Flow</h4>
                      <p className="text-sm text-gray-400 mb-4">
                        When connected to XERO, the following data is synchronized:
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                            <span className="font-medium text-white">Customers</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            <span className="text-[hsl(217,90%,40%)]">↔</span> Contacts (two-way sync)
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                            <span className="font-medium text-white">Products</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            <span className="text-[hsl(217,90%,40%)]">↔</span> Items (two-way sync)
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Receipt className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                            <span className="font-medium text-white">Invoices</span>
                          </div>
                          <p className="text-sm text-gray-400">
                            <span className="text-[hsl(217,90%,40%)]">→</span> XERO (one-way push)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border-red-900/40 shadow-2xl shadow-red-900/10">
                <CardHeader className="border-b border-red-900/30 pb-4">
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <Trash2 className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-950/30 border border-red-900/30 rounded-lg">
                    <div>
                      <h4 className="text-white font-semibold mb-1">Delete My Account & All Data</h4>
                      <p className="text-sm text-gray-400">
                        Permanently deletes your account, all sales, products, customers, invoices, and business data. This cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 shrink-0"
                      onClick={() => setIsDeleteAccountDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
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
      {/* Purchase Order Create/Edit Dialog */}
      <Dialog open={isPODialogOpen} onOpenChange={(open) => { if (!open) { resetPOForm(); } setIsPODialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-950 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">{editingPO ? `Edit ${editingPO.poNumber}` : "New Purchase Order"}</DialogTitle>
            <DialogDescription className="text-gray-400">{editingPO ? "Update purchase order details" : "Create a new purchase order for a supplier"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[hsl(217,90%,60%)] uppercase tracking-wider">Supplier Details</h3>
                <div className="flex items-center gap-2">
                  {suppliers.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-[hsl(217,90%,30%)] text-[hsl(217,90%,60%)] hover:text-white hover:bg-[hsl(217,90%,25%)] bg-[hsl(217,90%,15%)] text-xs h-8 gap-1.5">
                          <Users className="h-3 w-3" />
                          Select Supplier
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
                    {saveSupplierMutation.isPending ? "Saving..." : "Save Supplier"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label className="text-gray-300 text-xs">Supplier Name *</Label><Input value={poSupplierName} onChange={(e) => setPOSupplierName(e.target.value)} className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="Supplier company name" /></div>
                <div><Label className="text-gray-300 text-xs">Email</Label><Input type="email" value={poSupplierEmail} onChange={(e) => setPOSupplierEmail(e.target.value)} className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="supplier@example.com" /></div>
                <div><Label className="text-gray-300 text-xs">Phone</Label><Input type="tel" value={poSupplierPhone} onChange={(e) => setPOSupplierPhone(e.target.value)} className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="+27 12 345 6789" /></div>
                <div><Label className="text-gray-300 text-xs">Expected Delivery</Label><Input type="date" value={poExpectedDate} onChange={(e) => setPOExpectedDate(e.target.value)} className="bg-gray-800 border-gray-700 text-white mt-1" /></div>
              </div>
              <div><Label className="text-gray-300 text-xs">Address</Label><Textarea value={poSupplierAddress} onChange={(e) => setPOSupplierAddress(e.target.value)} className="bg-gray-800 border-gray-700 text-white mt-1" placeholder="Supplier address" rows={2} /></div>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[hsl(217,90%,60%)] uppercase tracking-wider">Order Items</h3>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white bg-gray-800"><Package className="h-3 w-3 mr-1" />Add Product</Button></DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-700 max-h-60 overflow-y-auto">
                      {(products || []).map((product: any) => (
                        <DropdownMenuItem key={product.id} onClick={() => addPOItem(product)} className="text-gray-300 hover:text-white">
                          <div className="flex justify-between w-full"><span>{product.name}</span><span className="text-gray-500 ml-4">R{parseFloat(product.costPrice || product.retailPrice).toFixed(2)}</span></div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" onClick={() => addPOItem()} className="border-gray-700 text-gray-300 hover:text-white bg-gray-800"><Plus className="h-3 w-3 mr-1" />Custom Item</Button>
                </div>
              </div>
              {poItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500"><Package className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No items added yet</p></div>
              ) : (
                <div className="space-y-2">
                  {poItems.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <div className="flex-1 min-w-0">
                        <input type="text" value={item.name} onChange={(e) => { const u = [...poItems]; u[index] = { ...u[index], name: e.target.value, productId: null }; setPOItems(u); }} className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none text-sm font-medium text-white px-0 py-0.5" placeholder="Item name" />
                        {item.sku && <span className="text-xs text-gray-500">{item.sku}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="number" min="1" value={item.quantity} onChange={(e) => { const u = [...poItems]; u[index] = { ...u[index], quantity: Math.max(1, parseInt(e.target.value) || 1) }; setPOItems(u); }} className="w-14 bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none text-sm text-center text-white px-0 py-0.5" />
                        <span className="text-xs text-gray-500">x</span>
                        <div className="flex items-center"><span className="text-xs text-gray-500 mr-0.5">R</span><input type="number" step="0.01" min="0" value={item.costPrice} onChange={(e) => { const u = [...poItems]; u[index] = { ...u[index], costPrice: parseFloat(e.target.value) || 0 }; setPOItems(u); }} className="w-20 bg-transparent border-b border-gray-600 focus:border-blue-500 outline-none text-sm text-white px-0 py-0.5" /></div>
                      </div>
                      <div className="text-right font-medium text-sm min-w-[70px] text-white">R{(item.costPrice * item.quantity).toFixed(2)}</div>
                      <Button variant="ghost" size="sm" onClick={() => setPOItems(poItems.filter((_: any, i: number) => i !== index))} className="text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-gray-300 text-xs">VAT %</Label><Input type="number" value={poTaxPercent} onChange={(e) => setPOTaxPercent(parseFloat(e.target.value) || 0)} className="bg-gray-800 border-gray-700 text-white mt-1" /></div>
                <div><Label className="text-gray-300 text-xs">Shipping (R)</Label><Input type="number" step="0.01" value={poShippingAmount} onChange={(e) => setPOShippingAmount(parseFloat(e.target.value) || 0)} className="bg-gray-800 border-gray-700 text-white mt-1" /></div>
              </div>
              {(() => {
                const subtotal = poItems.reduce((sum: number, item: any) => sum + (item.costPrice * item.quantity), 0);
                const taxAmount = subtotal * (poTaxPercent / 100);
                const total = subtotal + taxAmount + poShippingAmount;
                return (
                  <div className="space-y-1 pt-2 border-t border-gray-800">
                    <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
                    {poTaxPercent > 0 && <div className="flex justify-between text-sm text-gray-400"><span>VAT ({poTaxPercent}%)</span><span>R{taxAmount.toFixed(2)}</span></div>}
                    {poShippingAmount > 0 && <div className="flex justify-between text-sm text-gray-400"><span>Shipping</span><span>R{poShippingAmount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-lg font-bold text-white pt-1"><span>Total</span><span className="text-[hsl(217,90%,60%)]">R{total.toFixed(2)}</span></div>
                  </div>
                );
              })()}
            </div>

            <div><Label className="text-gray-300 text-xs">Notes</Label><Textarea value={poNotes} onChange={(e) => setPONotes(e.target.value)} className="bg-gray-900 border-gray-700 text-white mt-1" placeholder="Additional notes..." rows={2} /></div>

            <Button onClick={handleSubmitPO} disabled={createPOMutation.isPending || updatePOMutation.isPending} className="w-full bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white py-3 text-base font-semibold shadow-lg shadow-blue-900/30">
              {(createPOMutation.isPending || updatePOMutation.isPending) ? "Saving..." : editingPO ? "Update Purchase Order" : "Create Purchase Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Purchase Order View Panel */}
      <Dialog open={isPOViewOpen} onOpenChange={setIsPOViewOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gray-950 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
              <span className="text-[hsl(217,90%,60%)] font-mono">{selectedPO?.poNumber}</span>
              {selectedPO && getPOStatusBadge(selectedPO.status)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">Purchase order details</DialogDescription>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <h4 className="text-xs font-semibold text-[hsl(217,90%,60%)] uppercase tracking-wider mb-2">Supplier</h4>
                <p className="text-white font-semibold">{selectedPO.supplierName}</p>
                {selectedPO.supplierPhone && <p className="text-gray-400 text-sm">Tel: {selectedPO.supplierPhone}</p>}
                {selectedPO.supplierEmail && <p className="text-gray-400 text-sm">Email: {selectedPO.supplierEmail}</p>}
                {selectedPO.supplierAddress && <p className="text-gray-400 text-sm mt-1">{selectedPO.supplierAddress}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-xl p-3 border border-gray-800"><p className="text-xs text-gray-500">Created</p><p className="text-white text-sm font-medium">{new Date(selectedPO.createdAt).toLocaleDateString()}</p></div>
                {selectedPO.expectedDate && <div className="bg-gray-900 rounded-xl p-3 border border-gray-800"><p className="text-xs text-gray-500">Expected</p><p className="text-white text-sm font-medium">{new Date(selectedPO.expectedDate).toLocaleDateString()}</p></div>}
                {selectedPO.receivedDate && <div className="bg-gray-900 rounded-xl p-3 border border-gray-800"><p className="text-xs text-gray-500">Received</p><p className="text-green-400 text-sm font-medium">{new Date(selectedPO.receivedDate).toLocaleDateString()}</p></div>}
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <h4 className="text-xs font-semibold text-[hsl(217,90%,60%)] uppercase tracking-wider mb-3">Items</h4>
                <div className="space-y-2">
                  {(selectedPO.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div><p className="text-white text-sm font-medium">{item.name || "Custom Item"}</p>{item.sku && <p className="text-gray-500 text-xs">{item.sku}</p>}</div>
                      <div className="text-right"><p className="text-white text-sm">{item.quantity} x R{parseFloat(item.costPrice).toFixed(2)}</p><p className="text-gray-400 text-xs">R{(item.costPrice * item.quantity).toFixed(2)}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>R{parseFloat(selectedPO.subtotal).toFixed(2)}</span></div>
                  {parseFloat(selectedPO.taxPercent) > 0 && <div className="flex justify-between text-sm text-gray-400"><span>VAT ({selectedPO.taxPercent}%)</span><span>R{(parseFloat(selectedPO.subtotal) * parseFloat(selectedPO.taxPercent) / 100).toFixed(2)}</span></div>}
                  {parseFloat(selectedPO.shippingAmount) > 0 && <div className="flex justify-between text-sm text-gray-400"><span>Shipping</span><span>R{parseFloat(selectedPO.shippingAmount).toFixed(2)}</span></div>}
                  <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-800"><span>Total</span><span className="text-[hsl(217,90%,60%)]">R{parseFloat(selectedPO.total).toFixed(2)}</span></div>
                </div>
              </div>
              {selectedPO.notes && <div className="bg-gray-900 rounded-xl p-4 border border-gray-800"><h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4><p className="text-gray-300 text-sm">{selectedPO.notes}</p></div>}
              <div className="flex gap-2">
                <Button onClick={() => generatePOPdf(selectedPO)} className="flex-1 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
                {selectedPO.status !== 'received' && selectedPO.status !== 'cancelled' && (
                  <Button onClick={() => { loadPOForEdit(selectedPO); setIsPOViewOpen(false); }} variant="outline" className="border-gray-700 text-gray-300 hover:text-white bg-gray-800"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete PO Confirmation */}
      <AlertDialog open={isDeletePODialogOpen} onOpenChange={setIsDeletePODialogOpen}>
        <AlertDialogContent className="bg-gray-950 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">Are you sure you want to delete this purchase order? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingPOId && deletePOMutation.mutate(deletingPOId)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" aria-describedby="customer-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <div id="customer-dialog-description" className="text-sm text-gray-600">
              {editingCustomer ? 'Update the customer information below.' : 'Enter the details for the new customer.'}
            </div>
          </DialogHeader>
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(handleCustomerSubmit)} className="space-y-4">
              <FormField
                control={customerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., +27 12 345 6789" {...field} />
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
                    <FormLabel>Customer Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="retail">Retail Customer</SelectItem>
                        <SelectItem value="trade">Trade Customer</SelectItem>
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
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes about the customer..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Open Account Creation Dialog */}
      <Dialog open={isOpenAccountDialogOpen} onOpenChange={setIsOpenAccountDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Open Account</DialogTitle>
          </DialogHeader>
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
              className="space-y-4"
            >
              <FormField
                control={openAccountForm.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Table 5, John Doe" {...field} />
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
                    <FormLabel>Account Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={openAccountForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsOpenAccountDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                  disabled={createOpenAccountMutation.isPending}
                >
                  {createOpenAccountMutation.isPending ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Account Details Dialog */}
      <Dialog open={!!selectedOpenAccount} onOpenChange={() => {
        setSelectedOpenAccount(null);
        setSelectedItemsForPrint([]);
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedOpenAccount?.accountName} - Account Details
            </DialogTitle>
            <DialogDescription>
              View account details, select items for kitchen orders, or close the account.
            </DialogDescription>
          </DialogHeader>
          {selectedOpenAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <Badge variant={selectedOpenAccount.accountType === 'table' ? 'default' : 'outline'}>
                    {selectedOpenAccount.accountType === 'table' ? 'Table' : 'Customer'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-[hsl(217,90%,40%)]">R{selectedOpenAccount.total}</p>
                </div>
              </div>
              
              {selectedOpenAccount.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-gray-600">{selectedOpenAccount.notes}</p>
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Items ({Array.isArray(selectedOpenAccount.items) ? selectedOpenAccount.items.length : 0})</p>
                  {Array.isArray(selectedOpenAccount.items) && selectedOpenAccount.items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const allIndices = selectedOpenAccount.items.map((_, index) => index);
                        const allSelected = allIndices.every(index => selectedItemsForPrint.includes(index));
                        setSelectedItemsForPrint(allSelected ? [] : allIndices);
                      }}
                      className="text-xs h-auto py-1 px-2"
                    >
                      {selectedItemsForPrint.length === selectedOpenAccount.items.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.isArray(selectedOpenAccount.items) && selectedOpenAccount.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedItemsForPrint.includes(index)}
                          onChange={(e) => handleItemCheckboxChange(index, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">R{item.price} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItemClick(selectedOpenAccount.id, index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={removeItemFromOpenAccountMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tip Option for Close & Pay */}
              <div>
                <Label>Tip Option</Label>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setOpenAccountTipEnabled(!openAccountTipEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      openAccountTipEnabled 
                        ? 'bg-[hsl(217,90%,40%)]' 
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        openAccountTipEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-600">
                    {openAccountTipEnabled ? 'Tip lines enabled on receipt' : 'Add tip option to receipt'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={handleQuickPrint}
                  disabled={selectedItemsForPrint.length === 0}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Quick Print ({selectedItemsForPrint.length})
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => {
                    setSelectedOpenAccount(null);
                    setSelectedItemsForPrint([]);
                    setOpenAccountTipEnabled(false);
                  }}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      const paymentType = 'cash'; // Default to cash
                      closeOpenAccountMutation.mutate({ 
                        accountId: selectedOpenAccount.id, 
                        paymentType,
                        tipEnabled: openAccountTipEnabled 
                      });
                      setSelectedOpenAccount(null);
                      setSelectedItemsForPrint([]);
                      setOpenAccountTipEnabled(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={closeOpenAccountMutation.isPending}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    {closeOpenAccountMutation.isPending ? 'Closing...' : 'Close & Pay'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Add Products to Category Dialog */}
      <Dialog open={isAddProductsToCategoryOpen} onOpenChange={setIsAddProductsToCategoryOpen}>
        <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-gray-700/50 pb-4">
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[hsl(217,90%,50%)]" />
              Add Products to Category
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Select products to add to "{categories.find(c => c.id === selectedSalesCategory)?.name || 'this category'}". Products can belong to multiple categories.
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
                          : 'No category'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
            <span className="text-sm text-gray-400">
              {selectedProductsForCategory.length} products selected
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddProductsToCategoryOpen(false);
                  setSelectedProductsForCategory([]);
                }}
              >
                Cancel
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
                {bulkAddProductsToCategoryMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Logo Upload Dialog */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Company Logo</DialogTitle>
            <DialogDescription>
              Upload your company logo to personalize your POS system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Logo Preview */}
            {currentUser?.companyLogo && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                <img 
                  src={currentUser.companyLogo} 
                  alt="Current Logo" 
                  className="h-20 w-20 object-cover rounded-lg mx-auto border"
                />
              </div>
            )}
            
            {/* File Upload */}
            <div>
              <Label htmlFor="logoUpload">Choose New Logo</Label>
              <Input
                id="logoUpload"
                type="file"
                accept="image/*"
                onChange={handleLogoFileUpload}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: Square images work best (PNG, JPG, max 2MB)
              </p>
            </div>
            
            {/* New Logo Preview */}
            {logoFile && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">New Logo Preview:</p>
                <img 
                  src={logoFile} 
                  alt="New Logo Preview" 
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
                Cancel
              </Button>
              <Button 
                onClick={() => logoFile && logoUploadMutation.mutate(logoFile)}
                disabled={!logoFile || logoUploadMutation.isPending}
                className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              >
                {logoUploadMutation.isPending ? "Uploading..." : "Update Logo"}
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
      />
      <ReceiptCustomizerDialog
        isOpen={isInvoiceSetupOpen}
        onClose={() => setIsInvoiceSetupOpen(false)}
        currentUser={currentUser}
        setCurrentUser={(u) => { setCurrentUser(u); localStorage.setItem('posUser', JSON.stringify(u)); }}
        toast={toast}
        invoiceSetupOnly={true}
      />
      {/* Staff Password Verification Dialog */}
      <Dialog open={isStaffPasswordDialogOpen} onOpenChange={(open) => {
        setIsStaffPasswordDialogOpen(open);
        if (!open) {
          setStaffPassword("");
          setSelectedStaffForAuth(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>
              Enter the password for {selectedStaffForAuth?.username}
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
                <Label htmlFor="staff-password-input">Password</Label>
                <Input
                  id="staff-password-input"
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Enter password"
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
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={authenticateStaffMutation.isPending}
                  className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                >
                  {authenticateStaffMutation.isPending ? "Verifying..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Simplified Staff Creation Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new staff or management user to your POS system.
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
                <Label htmlFor="create-username">Name</Label>
                <Input
                  id="create-username"
                  name="username"
                  type="text"
                  required
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="create-user-type">Role</Label>
                <Select name="user-type" required defaultValue="staff">
                  <SelectTrigger id="create-user-type">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter password"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsStaffDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createStaffAccountMutation.isPending}
                  className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                >
                  {createStaffAccountMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* User Management Dialog - Enterprise Design */}
      <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
        <DialogContent className="sm:max-w-2xl p-0 bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(217,30%,18%)] to-[hsl(217,30%,15%)] px-6 py-5 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  {staffAccounts.length === 0 ? "Create Your First User" : "User Management"}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-sm mt-0.5">
                  {staffAccounts.length === 0 
                    ? "Set up your first account to get started."
                    : `${staffAccounts.length} user${staffAccounts.length === 1 ? '' : 's'} registered`
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
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Team Members</h3>
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
                                Online
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
                              {staff.userType === 'management' ? 'Manager' : 'Staff'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {staff.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete ${staff.username}? This action cannot be undone.`)) {
                                deleteStaffAccountMutation.mutate(staff.id);
                              }
                            }}
                            disabled={deleteStaffAccountMutation.isPending || isCurrentLoggedIn}
                            className={`p-2 h-9 w-9 rounded-lg transition-all ${
                              isCurrentLoggedIn 
                                ? 'opacity-30 cursor-not-allowed' 
                                : 'hover:bg-red-500/20 hover:text-red-400 text-gray-400'
                            }`}
                            title={isCurrentLoggedIn ? "Cannot delete yourself" : "Delete user"}
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
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Add New User</h3>
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
                      <Label className="text-gray-300 text-sm font-medium mb-2 block">Username</Label>
                      <Input
                        id="new-username"
                        name="new-username"
                        type="text"
                        required
                        placeholder="Enter name"
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block">Password</Label>
                      <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                        required
                        placeholder="Enter password"
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20"
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <Label className="text-gray-300 text-sm font-medium mb-2 block">Role</Label>
                    <Select name="user-type" required defaultValue={staffAccounts.length === 0 ? "management" : "staff"}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="staff" className="text-white hover:bg-gray-700 focus:bg-gray-700">Staff</SelectItem>
                        <SelectItem value="management" className="text-white hover:bg-gray-700 focus:bg-gray-700">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={createStaffAccountMutation.isPending}
                    className="w-full bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,40%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,45%)] text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {createStaffAccountMutation.isPending ? "Creating..." : "Create User"}
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
                <p className="text-gray-500 text-sm">No users created yet.</p>
                <p className="text-gray-600 text-xs mt-1">Use the form above to create your first user.</p>
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
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Management Access Notification Dialog */}
      <Dialog open={managementPasswordDialog} onOpenChange={setManagementPasswordDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Management Access Required</DialogTitle>
            <DialogDescription>
              The Products and Reports sections are restricted to management users only. Please login with a management account to access these features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button
              onClick={closeManagementDialog}
              className="w-full"
            >
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Void Sale Dialog */}
      <Dialog open={voidSaleDialog.open} onOpenChange={(open) => {
        if (!open) {
          setVoidSaleDialog({ open: false, sale: null });
          setVoidReason("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Void Sale</DialogTitle>
            <DialogDescription>
              Enter the reason for voiding this sale. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {voidSaleDialog.sale && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">Sale #{voidSaleDialog.sale.id}</p>
                <p className="text-sm text-gray-600">Amount: R{voidSaleDialog.sale.total}</p>
                <p className="text-xs text-gray-500">
                  {new Date(voidSaleDialog.sale.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="voidReason">Reason for voiding</Label>
              <Textarea
                id="voidReason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Enter the reason for voiding this sale..."
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
                Cancel
              </Button>
              <Button 
                onClick={handleVoidSaleSubmit}
                disabled={!voidReason.trim() || voidSaleMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {voidSaleMutation.isPending ? "Voiding..." : "Void Sale"}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Void Sale Details</DialogTitle>
            <DialogDescription>
              Information about this voided sale.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewVoidDialog.sale && (
              <>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800">Sale #{viewVoidDialog.sale.id} - VOIDED</p>
                  <p className="text-sm text-red-700">Original Amount: R{viewVoidDialog.sale.total}</p>
                  <p className="text-xs text-red-600">
                    Voided: {viewVoidDialog.sale.voidedAt ? new Date(viewVoidDialog.sale.voidedAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
                {viewVoidDialog.sale.voidReason && (
                  <div>
                    <Label>Void Reason</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded border text-sm">
                      {viewVoidDialog.sale.voidReason}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setViewVoidDialog({ open: false, sale: null })}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Bank Details Dialog */}
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
                  <DialogTitle className="text-xl font-bold text-white">Payment Details</DialogTitle>
                  <DialogDescription className="text-gray-400 mt-0.5">
                    Bank account details for Storm POS service fee payments
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
                    <h3 className="font-semibold text-white">Nedbank Account</h3>
                    <p className="text-xs text-gray-500">For Storm POS service fee payments</p>
                  </div>
                </div>
                
                <div className="space-y-0">
                  {[
                    { label: 'Account Holder', value: 'Storm', mono: false },
                    { label: 'Account Number', value: '1229368612', mono: true },
                    { label: 'Account Type', value: 'Current Account', mono: false },
                    { label: 'Bank Name', value: 'Nedbank', mono: false },
                    { label: 'Branch Code', value: '198765', mono: true },
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
                    <h4 className="font-semibold text-amber-300 text-sm mb-2">Payment Instructions</h4>
                    <ul className="text-sm text-amber-200/70 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                        Use your registered business name as payment reference
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                        Pay monthly service fees by the last day of each month
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 flex-shrink-0"></div>
                        Keep proof of payment for your records
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl border border-white/5 p-4 text-center">
                <p className="text-sm text-gray-400">Questions about billing or payments?</p>
                <p className="font-medium text-[hsl(217,90%,50%)] mt-1 text-sm">
                  softwarebystorm@gmail.com
                </p>
              </div>

              <Button onClick={() => setIsBankDetailsOpen(false)} className="w-full h-11 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 rounded-lg">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-gray-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-[hsl(217,90%,50%)]" />
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCategory ? 'Update category details below.' : 'Create a new category to organize your products.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Category Name</Label>
              <Input 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Beverages, Food, Electronics"
                className="mt-2 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500"
              />
            </div>
            
            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Category Color
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
                <Label className="text-gray-300 mb-2 block">Existing Categories</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                        <span className="text-white">{cat.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {products.filter(p => p.categoryId === cat.id).length} products
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
              Cancel
            </Button>
            <Button 
              onClick={handleCategorySubmit} 
              className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)]"
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending || updateCategoryMutation.isPending ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Invoice Creation Dialog */}
      <Dialog 
        open={isInvoiceDialogOpen} 
        onOpenChange={(open) => {
          setIsInvoiceDialogOpen(open);
          if (!open) {
            // Reset all form state when dialog closes
            setEditingInvoice(null);
            setInvoiceItems([]);
            setInvoiceClientId(null);
            setInvoiceCustomClient("");
            setInvoiceClientEmail("");
            setInvoiceClientPhone("");
            setIsCustomClient(false);
            setInvoiceDueDate("");
            setInvoiceNotes("");
            setInvoicePoNumber("");
            setInvoiceDueTerms("7 days");
            setInvoiceDiscountPercent("0");
            setInvoiceShippingAmount("0");
            setInvoicePaymentMethod("");
            setInvoicePaymentDetails("");
            setInvoiceTerms("");
            setInvoiceTaxEnabled(true);
            setInvoiceType('invoice');
            setInvoiceShowBusinessInfo(true);
            setInvoiceCustomFieldValues({});
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? 'Edit' : 'Create'} {invoiceType === 'invoice' ? 'Invoice' : 'Quote'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Document Type Selection */}
            <div>
              <Label>Document Type</Label>
              <Select 
                value={invoiceType} 
                onValueChange={(value: 'invoice' | 'quote') => setInvoiceType(value)}
                disabled={!!editingInvoice}
              >
                <SelectTrigger disabled={!!editingInvoice}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                </SelectContent>
              </Select>
              {editingInvoice && (
                <p className="text-xs text-gray-500 mt-1">Document type cannot be changed when editing</p>
              )}
            </div>

            {/* Client Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Client</Label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomClient(!isCustomClient);
                    if (!isCustomClient) {
                      setInvoiceClientId(null);
                    } else {
                      setInvoiceCustomClient("");
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                  data-testid="button-toggle-custom-client"
                >
                  {isCustomClient ? "Select from list" : "Enter custom client"}
                </button>
              </div>
              {isCustomClient ? (
                <Input
                  type="text"
                  value={invoiceCustomClient}
                  onChange={(e) => setInvoiceCustomClient(e.target.value)}
                  placeholder="Enter client name"
                  className="w-full"
                  data-testid="input-custom-client"
                />
              ) : (
                <Select 
                  value={invoiceClientId?.toString() || ""} 
                  onValueChange={(value) => setInvoiceClientId(parseInt(value))}
                  data-testid="select-client"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Client Email */}
            <div>
              <Label>Client Email (Optional)</Label>
              <input
                type="email"
                value={invoiceClientEmail}
                onChange={(e) => setInvoiceClientEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="client@example.com"
              />
            </div>

            {/* Client Phone */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Client Phone (Optional)</Label>
                <button type="button" onClick={() => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, vis_clientPhone: prev.vis_clientPhone === false ? true : false }))} className="p-1 text-gray-400 hover:text-gray-600 rounded" title={invoiceCustomFieldValues.vis_clientPhone === false ? 'Show on PDF' : 'Hide from PDF'}>
                  {invoiceCustomFieldValues.vis_clientPhone === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="tel"
                value={invoiceClientPhone}
                onChange={(e) => setInvoiceClientPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="+27 12 345 6789"
              />
            </div>

            {/* PO Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>PO Number (Optional)</Label>
                <button type="button" onClick={() => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, vis_poNumber: prev.vis_poNumber === false ? true : false }))} className="p-1 text-gray-400 hover:text-gray-600 rounded" title={invoiceCustomFieldValues.vis_poNumber === false ? 'Show on PDF' : 'Hide from PDF'}>
                  {invoiceCustomFieldValues.vis_poNumber === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="text"
                value={invoicePoNumber}
                onChange={(e) => setInvoicePoNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Purchase order number"
              />
            </div>

            {/* Payment Terms */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Payment Terms</Label>
                <button type="button" onClick={() => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, vis_dueTerms: prev.vis_dueTerms === false ? true : false }))} className="p-1 text-gray-400 hover:text-gray-600 rounded" title={invoiceCustomFieldValues.vis_dueTerms === false ? 'Show on PDF' : 'Hide from PDF'}>
                  {invoiceCustomFieldValues.vis_dueTerms === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <Select value={invoiceDueTerms} onValueChange={setInvoiceDueTerms}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="7 days">7 Days</SelectItem>
                  <SelectItem value="14 days">14 Days</SelectItem>
                  <SelectItem value="30 days">30 Days</SelectItem>
                  <SelectItem value="60 days">60 Days</SelectItem>
                  <SelectItem value="90 days">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Due Date (Optional)</Label>
                <button type="button" onClick={() => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, vis_dueDate: prev.vis_dueDate === false ? true : false }))} className="p-1 text-gray-400 hover:text-gray-600 rounded" title={invoiceCustomFieldValues.vis_dueDate === false ? 'Show on PDF' : 'Hide from PDF'}>
                  {invoiceCustomFieldValues.vis_dueDate === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <input
                type="date"
                value={invoiceDueDate}
                onChange={(e) => setInvoiceDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Add Products */}
            <div>
              <Label>Add Products</Label>
              <div className="space-y-2 mt-2">
                {invoiceItems.map((item, index) => {
                  const product = item.productId ? products.find(p => p.id === item.productId) : null;
                  const itemName = item.customName || product?.name || 'Unknown Product';
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={itemName}
                          onChange={(e) => {
                            const updated = [...invoiceItems];
                            updated[index] = { ...updated[index], customName: e.target.value, productId: undefined };
                            setInvoiceItems(updated);
                          }}
                          className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm font-medium px-0 py-0.5"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...invoiceItems];
                            updated[index] = { ...updated[index], quantity: Math.max(1, parseInt(e.target.value) || 1) };
                            setInvoiceItems(updated);
                          }}
                          className="w-14 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm text-center px-0 py-0.5"
                        />
                        <span className="text-xs text-gray-400">x</span>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-400 mr-0.5">R</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) => {
                              const updated = [...invoiceItems];
                              updated[index] = { ...updated[index], price: parseFloat(e.target.value) || 0 };
                              setInvoiceItems(updated);
                            }}
                            className="w-20 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm px-0 py-0.5"
                          />
                        </div>
                      </div>
                      <div className="text-right font-medium text-sm min-w-[70px]">
                        R{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
                
                {/* Enterprise Product Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setInvoicePickerOpen(!invoicePickerOpen); setInvoicePickerSearch(""); setInvoiceCategoryFilter(null); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[hsl(217,90%,40%)] bg-white"
                  >
                    <span className="flex items-center gap-2 text-gray-500">
                      <Package className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                      Select product from inventory...
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
                              placeholder="Search by name or SKU..."
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
                                Retail Price
                              </button>
                              <button
                                type="button"
                                onClick={() => setInvoicePriceMode('trade')}
                                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-colors ${invoicePriceMode === 'trade' ? 'bg-[hsl(217,90%,40%)] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                              >
                                Trade Price
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
                              All
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
                                  No products found
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
                                    <div className="text-xs text-gray-400 capitalize">{invoicePriceMode}</div>
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
                    data-testid="button-toggle-quick-add"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {showQuickAddProduct ? 'Hide Quick Add' : 'Quick Add Product/Service'}
                  </Button>
                  
                  {showQuickAddProduct && (
                    <div className="mt-2 p-3 border rounded-lg bg-gray-50 space-y-2">
                      <p className="text-xs text-gray-500">Add a temporary item (not saved to product list)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Product/Service Name</Label>
                          <input
                            type="text"
                            value={quickAddName}
                            onChange={(e) => setQuickAddName(e.target.value)}
                            placeholder="e.g. Custom Service"
                            className="w-full px-2 py-1.5 text-sm border rounded"
                            data-testid="input-quick-add-name"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Price (R)</Label>
                          <input
                            type="number"
                            value={quickAddPrice}
                            onChange={(e) => setQuickAddPrice(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1.5 text-sm border rounded"
                            data-testid="input-quick-add-price"
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
                              title: "Item Added",
                              description: `"${quickAddName.trim()}" added to ${invoiceType}`,
                            });
                          }
                        }}
                        data-testid="button-add-quick-product"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add to {invoiceType === 'invoice' ? 'Invoice' : 'Quote'}
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Totals */}
                {invoiceItems.length > 0 && (
                  <div className="border-t pt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R{invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    
                    {/* Discount Input */}
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span>Discount:</span>
                        <select
                          value={invoiceDiscountType}
                          onChange={(e) => setInvoiceDiscountType(e.target.value as 'percent' | 'amount')}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          <option value="percent">%</option>
                          <option value="amount">R</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        {invoiceDiscountType === 'amount' && <span>R</span>}
                        <input
                          type="number"
                          value={invoiceDiscountType === 'percent' ? invoiceDiscountPercent : invoiceDiscountAmount}
                          onChange={(e) => {
                            if (invoiceDiscountType === 'percent') {
                              setInvoiceDiscountPercent(e.target.value);
                            } else {
                              setInvoiceDiscountAmount(e.target.value);
                            }
                          }}
                          className="w-20 px-2 py-1 border rounded text-right"
                          min="0"
                          max={invoiceDiscountType === 'percent' ? "100" : undefined}
                          step="0.01"
                        />
                        {invoiceDiscountType === 'percent' && <span>%</span>}
                      </div>
                    </div>
                    {((invoiceDiscountType === 'percent' && parseFloat(invoiceDiscountPercent) > 0) || 
                      (invoiceDiscountType === 'amount' && parseFloat(invoiceDiscountAmount) > 0)) && (
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Discount Amount:</span>
                        <span>-R{invoiceDiscountType === 'percent' 
                          ? (invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (parseFloat(invoiceDiscountPercent) / 100)).toFixed(2)
                          : parseFloat(invoiceDiscountAmount).toFixed(2)
                        }</span>
                      </div>
                    )}
                    
                    {/* Tax Toggle */}
                    <div className="flex justify-between items-center text-sm">
                      <span>Add VAT (15%):</span>
                      <Switch
                        checked={invoiceTaxEnabled}
                        onCheckedChange={setInvoiceTaxEnabled}
                      />
                    </div>
                    
                    {invoiceTaxEnabled && (
                      <div className="flex justify-between text-sm">
                        <span>VAT (15%):</span>
                        <span>R{(() => {
                          const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                          const discount = invoiceDiscountType === 'percent' 
                            ? subtotal * (parseFloat(invoiceDiscountPercent) / 100)
                            : parseFloat(invoiceDiscountAmount) || 0;
                          return ((subtotal - discount) * 0.15).toFixed(2);
                        })()}</span>
                      </div>
                    )}
                    
                    {/* Shipping Input */}
                    <div className="flex justify-between items-center text-sm">
                      <span>Shipping:</span>
                      <div className="flex items-center gap-1">
                        <span>R</span>
                        <input
                          type="number"
                          value={invoiceShippingAmount}
                          onChange={(e) => setInvoiceShippingAmount(e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-right"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between font-bold text-base border-t pt-2">
                      <span>Total:</span>
                      <span>R{(() => {
                        const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                        const discount = invoiceDiscountType === 'percent' 
                          ? subtotal * (parseFloat(invoiceDiscountPercent) / 100)
                          : parseFloat(invoiceDiscountAmount) || 0;
                        const afterDiscount = subtotal - discount;
                        const tax = invoiceTaxEnabled ? afterDiscount * 0.15 : 0;
                        const shipping = parseFloat(invoiceShippingAmount) || 0;
                        return (afterDiscount + tax + shipping).toFixed(2);
                      })()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Payment Method (Optional)</Label>
                <button type="button" onClick={() => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, vis_paymentMethod: prev.vis_paymentMethod === false ? true : false }))} className="p-1 text-gray-400 hover:text-gray-600 rounded" title={invoiceCustomFieldValues.vis_paymentMethod === false ? 'Show on PDF' : 'Hide from PDF'}>
                  {invoiceCustomFieldValues.vis_paymentMethod === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <Select value={invoicePaymentMethod} onValueChange={setInvoicePaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="EFT">EFT</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Details */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Label>Payment Details (Optional)</Label>
                  <button type="button" onClick={() => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, vis_paymentDetails: prev.vis_paymentDetails === false ? true : false }))} className="p-1 text-gray-400 hover:text-gray-600 rounded" title={invoiceCustomFieldValues.vis_paymentDetails === false ? 'Show on PDF' : 'Hide from PDF'}>
                    {invoiceCustomFieldValues.vis_paymentDetails === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {savedPaymentDetails.length > 0 && (
                  <Select 
                    value="" 
                    onValueChange={(id) => {
                      const saved = savedPaymentDetails.find((s: any) => s.id.toString() === id);
                      if (saved) {
                        setInvoicePaymentDetails(saved.details);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs" data-testid="select-saved-payment">
                      <SelectValue placeholder="Saved Details" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedPaymentDetails.map((saved: any) => (
                        <SelectItem key={saved.id} value={saved.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{saved.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <textarea
                value={invoicePaymentDetails}
                onChange={(e) => setInvoicePaymentDetails(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Bank details, payment instructions, etc..."
              />
              {invoicePaymentDetails.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => setIsSavePaymentDialogOpen(true)}
                  data-testid="button-save-payment-details"
                >
                  <PlusCircle className="w-3 h-3 mr-1" />
                  Save as Template
                </Button>
              )}
            </div>

            {/* Notes & Terms - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Notes (Optional) <span className="text-xs text-gray-500">({invoiceNotes.length}/300)</span></Label>
                  <button type="button" onClick={() => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, vis_notes: prev.vis_notes === false ? true : false }))} className="p-1 text-gray-400 hover:text-gray-600 rounded" title={invoiceCustomFieldValues.vis_notes === false ? 'Show on PDF' : 'Hide from PDF'}>
                    {invoiceCustomFieldValues.vis_notes === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value.slice(0, 300))}
                  maxLength={300}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Terms & Conditions (Optional) <span className="text-xs text-gray-500">({invoiceTerms.length}/500)</span></Label>
                  <button type="button" onClick={() => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, vis_terms: prev.vis_terms === false ? true : false }))} className="p-1 text-gray-400 hover:text-gray-600 rounded" title={invoiceCustomFieldValues.vis_terms === false ? 'Show on PDF' : 'Hide from PDF'}>
                    {invoiceCustomFieldValues.vis_terms === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <textarea
                  value={invoiceTerms}
                  onChange={(e) => setInvoiceTerms(e.target.value.slice(0, 500))}
                  maxLength={500}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Enter payment terms and conditions..."
                />
              </div>
            </div>

            {/* Document Options */}
            {(() => {
              const invoiceCfSettings = mergeReceiptSettings(currentUser?.receiptSettings);
              const invoiceCfs = (invoiceCfSettings as any).invoiceSettings?.customFields || [];
              return (
                <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Show Business Information</p>
                      <p className="text-xs text-gray-500">Display your company details in the top-right of the PDF</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInvoiceShowBusinessInfo(!invoiceShowBusinessInfo)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        invoiceShowBusinessInfo
                          ? 'bg-[hsl(217,90%,40%)] text-white border-[hsl(217,90%,40%)]'
                          : 'bg-white text-gray-500 border-gray-300'
                      }`}
                    >
                      {invoiceShowBusinessInfo ? (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      )}
                      {invoiceShowBusinessInfo ? 'Visible' : 'Hidden'}
                    </button>
                  </div>

                  {invoiceCfs.length > 0 && (
                    <div className="space-y-3 pt-2 border-t">
                      <p className="text-xs font-medium text-gray-600">Custom Fields</p>
                      {invoiceCfs.map((field: any) => (
                        <div key={field.id} className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label className="text-xs text-gray-600">{field.label}</Label>
                            <input
                              type="text"
                              value={invoiceCustomFieldValues[`cf_${field.id}`] || ''}
                              onChange={(e) => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, [`cf_${field.id}`]: e.target.value }))}
                              placeholder={field.placeholder || field.label}
                              className="w-full mt-1 px-2 py-1.5 border rounded text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setInvoiceCustomFieldValues((prev: any) => ({
                              ...prev,
                              [`vis_${field.id}`]: prev[`vis_${field.id}`] === false ? true : false
                            }))}
                            className="mt-5 p-1.5 rounded border text-gray-400 hover:text-gray-600"
                            title={invoiceCustomFieldValues[`vis_${field.id}`] === false ? 'Show on PDF' : 'Hide from PDF'}
                          >
                            {invoiceCustomFieldValues[`vis_${field.id}`] === false ? (
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Trim custom client name
                  const trimmedCustomClient = invoiceCustomClient.trim();
                  
                  // Mode-specific validation to prevent stale state leaks
                  if (isCustomClient) {
                    // In custom mode: require custom client name
                    if (!trimmedCustomClient) {
                      toast({
                        title: "Missing Information",
                        description: "Please enter a client name",
                        variant: "destructive"
                      });
                      return;
                    }
                  } else {
                    // In list mode: require client selection from dropdown
                    if (!invoiceClientId) {
                      toast({
                        title: "Missing Information",
                        description: "Please select a client",
                        variant: "destructive"
                      });
                      return;
                    }
                  }
                  
                  if (invoiceItems.length === 0) {
                    toast({
                      title: "No Line Items",
                      description: "Please add at least one product to the invoice",
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
                  
                  // Determine client name based ONLY on current mode (prevents stale state leaks)
                  let clientName: string;
                  if (isCustomClient) {
                    // Custom mode: use trimmed custom name
                    clientName = trimmedCustomClient;
                  } else {
                    // List mode: resolve customer name from dropdown selection
                    const selectedCustomer = customers.find(c => c.id === invoiceClientId);
                    if (!selectedCustomer) {
                      toast({
                        title: "Error",
                        description: "Selected customer not found. Please select a valid customer.",
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
                    title: `${invoiceType === 'invoice' ? 'Invoice' : 'Quote'} for ${clientName}`,
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
                  ? (editingInvoice ? 'Updating...' : 'Creating...') 
                  : editingInvoice 
                    ? `Update ${invoiceType === 'invoice' ? 'Invoice' : 'Quote'}` 
                    : `Create ${invoiceType === 'invoice' ? 'Invoice' : 'Quote'}`
                }
              </Button>
            </div>
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
                      {selectedInvoice.documentType === 'invoice' ? 'INVOICE' : 'QUOTE'}
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
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
                {/* Document Info Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <Label className="text-xs text-gray-500">Client</Label>
                    <p className="font-medium text-sm truncate">{customers.find(c => c.id === selectedInvoice.clientId)?.name || selectedInvoice.clientName || 'N/A'}</p>
                    {(selectedInvoice.clientEmail || selectedInvoice.clientPhone) && (
                      <div className="mt-0.5 space-y-0.5">
                        {selectedInvoice.clientPhone && <p className="text-xs text-gray-500">Tel: {selectedInvoice.clientPhone}</p>}
                        {selectedInvoice.clientEmail && <p className="text-xs text-gray-500">Email: {selectedInvoice.clientEmail}</p>}
                      </div>
                    )}
                  </div>
                  {selectedInvoice.poNumber && (
                    <div>
                      <Label className="text-xs text-gray-500">PO Number</Label>
                      <p className="font-medium text-sm">{selectedInvoice.poNumber}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-gray-500">Date</Label>
                    <p className="font-medium text-sm">{new Date(selectedInvoice.createdDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Due Date</Label>
                    <p className="font-medium text-sm">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  {selectedInvoice.dueTerms && (selectedInvoice.customFieldValues as any)?.vis_dueTerms !== false && (
                    <div>
                      <Label className="text-xs text-gray-500">Terms</Label>
                      <p className="font-medium text-sm">{selectedInvoice.dueTerms}</p>
                    </div>
                  )}
                  {selectedInvoice.paymentMethod && (
                    <div>
                      <Label className="text-xs text-gray-500">Payment</Label>
                      <p className="font-medium text-sm">{selectedInvoice.paymentMethod}</p>
                    </div>
                  )}
                  {selectedInvoice.paymentDetails && (
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-500">Payment Details</Label>
                      <p className="font-medium text-sm whitespace-pre-wrap">{selectedInvoice.paymentDetails}</p>
                    </div>
                  )}
                </div>

                {/* Line Items - Mobile Cards / Desktop Table */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Line Items</Label>
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
                          <th className="text-left p-3 text-xs font-semibold text-gray-600">Product</th>
                          <th className="text-center p-3 text-xs font-semibold text-gray-600">Qty</th>
                          <th className="text-right p-3 text-xs font-semibold text-gray-600">Unit Price</th>
                          <th className="text-right p-3 text-xs font-semibold text-gray-600">Total</th>
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
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">R{typeof selectedInvoice.subtotal === 'number' ? selectedInvoice.subtotal.toFixed(2) : selectedInvoice.subtotal}</span>
                    </div>
                    {(parseFloat(selectedInvoice.discountPercent || '0') > 0 || parseFloat(selectedInvoice.discountAmount || '0') > 0) && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount{parseFloat(selectedInvoice.discountPercent || '0') > 0 ? ` (${selectedInvoice.discountPercent}%)` : ''}:</span>
                        <span>-R{parseFloat(selectedInvoice.discountAmount || '0').toFixed(2)}</span>
                      </div>
                    )}
                    {parseFloat(selectedInvoice.taxPercent || '0') > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">VAT (15%):</span>
                        <span className="font-medium">R{typeof selectedInvoice.tax === 'number' ? selectedInvoice.tax.toFixed(2) : selectedInvoice.tax}</span>
                      </div>
                    )}
                    {parseFloat(selectedInvoice.shippingAmount || '0') > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">R{typeof selectedInvoice.shippingAmount === 'number' ? selectedInvoice.shippingAmount.toFixed(2) : selectedInvoice.shippingAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base sm:text-lg font-bold border-t pt-2 mt-2">
                      <span>Total:</span>
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
                          <Label className="text-sm font-semibold mb-2 block">Notes</Label>
                          <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded break-words overflow-hidden whitespace-pre-wrap">{selectedInvoice.notes}</p>
                        </div>
                      )}
                      {selectedInvoice.terms && (
                        <div className="sm:order-2">
                          <Label className="text-sm font-semibold mb-2 block">Terms & Conditions</Label>
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
                        setInvoiceShowBusinessInfo(selectedInvoice.showBusinessInfo !== false);
                        setInvoiceCustomFieldValues((selectedInvoice.customFieldValues as any) || {});
                        
                        const items = Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
                        setInvoiceItems(items.map((item: any) => ({
                          productId: item.productId,
                          customName: item.productId ? undefined : (item.name || item.customName),
                          quantity: parseFloat(item.quantity) || item.quantity,
                          price: parseFloat(item.price)
                        })));
                        
                        setIsInvoiceViewOpen(false);
                        setIsInvoiceDialogOpen(true);
                      }
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 text-xs" 
                    data-testid="button-delete-invoice"
                    onClick={() => setIsDeleteInvoiceDialogOpen(true)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
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
                    className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-xs"
                    data-testid="button-export-pdf"
                    onClick={() => generateInvoicePDF(selectedInvoice)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-xs col-span-2"
                    data-testid="button-share-whatsapp"
                    onClick={() => shareInvoiceWhatsApp(selectedInvoice)}
                  >
                    <SiWhatsapp className="w-3 h-3 mr-1" />
                    Share via WhatsApp
                  </Button>
                </div>
                <div className="sm:hidden">
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setIsInvoiceViewOpen(false)}>
                    Close
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
                          setInvoiceTerms(selectedInvoice.terms || '');
                          setInvoiceTaxEnabled(parseFloat(selectedInvoice.taxPercent || '15') > 0);
                          setInvoiceShowBusinessInfo(selectedInvoice.showBusinessInfo !== false);
                          setInvoiceCustomFieldValues((selectedInvoice.customFieldValues as any) || {});
                          
                          const items = Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
                          setInvoiceItems(items.map((item: any) => ({
                            productId: item.productId,
                            customName: item.productId ? undefined : (item.name || item.customName),
                            quantity: parseFloat(item.quantity) || item.quantity,
                            price: parseFloat(item.price)
                          })));
                          
                          setIsInvoiceViewOpen(false);
                          setIsInvoiceDialogOpen(true);
                        }
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700" 
                      data-testid="button-delete-invoice-desktop"
                      onClick={() => setIsDeleteInvoiceDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
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
                      Change Status
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                      data-testid="button-export-pdf-desktop"
                      onClick={() => generateInvoicePDF(selectedInvoice)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-share-whatsapp-desktop"
                      onClick={() => shareInvoiceWhatsApp(selectedInvoice)}
                    >
                      <SiWhatsapp className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsInvoiceViewOpen(false)}>
                      Close
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
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-[hsl(217,90%,40%)]">
                {selectedInvoice?.documentNumber}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedInvoice) {
                  deleteInvoiceMutation.mutate(selectedInvoice.id);
                }
              }}
              disabled={deleteInvoiceMutation.isPending}
            >
              {deleteInvoiceMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Change Status Dialog */}
      <Dialog open={isStatusChangeDialogOpen} onOpenChange={setIsStatusChangeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Invoice Status</DialogTitle>
            <DialogDescription>
              Update the status of {selectedInvoice?.documentNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select New Status</Label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsStatusChangeDialogOpen(false)}>
              Cancel
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
              {updateInvoiceStatusMutation.isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Edit Document Number Dialog */}
      <Dialog open={isEditDocNumberDialogOpen} onOpenChange={setIsEditDocNumberDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Document Number</DialogTitle>
            <DialogDescription>
              Change the document number for this {editingDocNumberInvoice?.documentType === 'invoice' ? 'invoice' : 'quote'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Document Number</Label>
              <Input
                value={newDocumentNumber}
                onChange={(e) => setNewDocumentNumber(e.target.value)}
                placeholder="e.g. INV-0001"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsEditDocNumberDialogOpen(false);
              setEditingDocNumberInvoice(null);
              setNewDocumentNumber("");
            }}>
              Cancel
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
              {updateDocumentNumberMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Save Payment Details Dialog */}
      <Dialog open={isSavePaymentDialogOpen} onOpenChange={setIsSavePaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Payment Details</DialogTitle>
            <DialogDescription>
              Save these payment details for quick access when creating invoices
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={savePaymentName}
                onChange={(e) => setSavePaymentName(e.target.value)}
                placeholder="e.g. FNB Business Account"
                data-testid="input-payment-template-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Details Preview</Label>
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
              Cancel
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
              data-testid="button-confirm-save-payment"
            >
              {savePaymentDetailsMutation.isPending ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of Storm POS?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLogoutDialogOpen(false)}>
              No, Stay Logged In
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              onClick={() => {
                localStorage.removeItem('posUser');
                localStorage.removeItem('posLoginTimestamp');
                window.location.href = '/pos/login';
              }}
            >
              Yes, Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border border-red-900/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Account & All Data?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              This will <strong className="text-red-400">permanently delete</strong> your account and all associated data including:
              <ul className="mt-3 space-y-1 text-gray-400 text-sm list-disc pl-5">
                <li>All sales history and transactions</li>
                <li>All products and inventory</li>
                <li>All customers</li>
                <li>All invoices and quotes</li>
                <li>All staff accounts</li>
                <li>All business settings and data</li>
              </ul>
              <span className="block mt-3 font-semibold text-red-400">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setIsDeleteAccountDialogOpen(false)}
            >
              Cancel
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
                    toast({ title: 'Error', description: 'Failed to delete account. Please try again.', variant: 'destructive' });
                    setIsDeletingAccount(false);
                    setIsDeleteAccountDialogOpen(false);
                  }
                } catch {
                  toast({ title: 'Error', description: 'Failed to delete account. Please try again.', variant: 'destructive' });
                  setIsDeletingAccount(false);
                  setIsDeleteAccountDialogOpen(false);
                }
              }}
            >
              {isDeletingAccount ? 'Deleting...' : 'Yes, Delete Everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Excel Import Preview Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-xl flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Import {importType === 'products' ? 'Products' : 'Customers'}
                </DialogTitle>
                <DialogDescription className="text-gray-500">
                  Review the data before importing. Existing records will be updated.
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
                  <p className="text-sm font-medium text-gray-700">Records Found</p>
                  <p className="text-2xl font-bold text-[hsl(217,90%,40%)]">{importData.length}</p>
                </div>
              </div>
            </div>
            {importPreview.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Preview (First 5 rows)</p>
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
                    <p className="text-sm text-gray-500">...and {importData.length - 5} more rows</p>
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
              Cancel
            </Button>
            <Button 
              onClick={handleImportConfirm}
              disabled={isImporting || importData.length === 0}
              className="w-full sm:w-auto bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] shadow-lg"
            >
              {isImporting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing...
                </span>
              ) : (
                `Import ${importData.length} Records`
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
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your login credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!currentUser?.id) return;
            
            if (newPassword !== confirmNewPassword) {
              toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
              return;
            }
            
            if (newPassword.length < 6) {
              toast({ title: "Error", description: "New password must be at least 6 characters", variant: "destructive" });
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
                toast({ title: "Success", description: "Password changed successfully" });
                setIsChangePasswordDialogOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
              } else {
                toast({ title: "Error", description: data.message || "Failed to change password", variant: "destructive" });
              }
            } catch (error) {
              toast({ title: "Error", description: "Failed to change password", variant: "destructive" });
            } finally {
              setIsChangingPassword(false);
            }
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
              >
                {isChangingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}