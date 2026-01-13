import { useState, useEffect, useMemo } from "react";
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
  ShoppingCart, Package, Users, BarChart3, Plus, Minus, Trash2, 
  CreditCard, DollarSign, Receipt, Search, LogOut, Edit, PlusCircle,
  Calendar, TrendingUp, FileText, Clock, Eye, Download, User, UserPlus, Settings, X, Printer,
  ChevronDown, ChevronRight, Globe, BookOpen, HelpCircle, Share2, Upload, FileSpreadsheet, RefreshCw, Link2, Check, Menu,
  AlertTriangle, XCircle, Tag, Hash
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
  const [editingCustomer, setEditingCustomer] = useState<PosCustomer | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffAccount | null>(null);
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
  const [currentUser, setCurrentUser] = useState<{id: number; email: string; paid: boolean; companyLogo?: string; companyName?: string; tutorialCompleted?: boolean} | null>(null);
  const [managementPasswordDialog, setManagementPasswordDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [managementPassword, setManagementPassword] = useState("");
  const [currentTab, setCurrentTab] = useState("sales");
  const [voidSaleDialog, setVoidSaleDialog] = useState<{ open: boolean; sale: Sale | null }>({ open: false, sale: null });
  const [voidReason, setVoidReason] = useState("");
  const [viewVoidDialog, setViewVoidDialog] = useState<{ open: boolean; sale: Sale | null }>({ open: false, sale: null });
  const [selectedItemsForPrint, setSelectedItemsForPrint] = useState<number[]>([]);
  const [tipOptionEnabled, setTipOptionEnabled] = useState(false);
  const [openAccountTipEnabled, setOpenAccountTipEnabled] = useState(false);
  const [highlightStaffButton, setHighlightStaffButton] = useState(false);
  const [isReceiptCustomizerOpen, setIsReceiptCustomizerOpen] = useState(false);
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
  const [invoiceCustomClient, setInvoiceCustomClient] = useState("");
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
  const [isSavePaymentDialogOpen, setIsSavePaymentDialogOpen] = useState(false);
  const [savePaymentName, setSavePaymentName] = useState("");
  
  // Invoice search and filter state
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'cancelled'>('all');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<'all' | 'invoice' | 'quote'>('all');
  const [invoiceDateFrom, setInvoiceDateFrom] = useState("");
  const [invoiceDateTo, setInvoiceDateTo] = useState("");
  const [isEditDocNumberDialogOpen, setIsEditDocNumberDialogOpen] = useState(false);
  const [editingDocNumberInvoice, setEditingDocNumberInvoice] = useState<any | null>(null);
  const [newDocumentNumber, setNewDocumentNumber] = useState("");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);
  
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
    const userData = localStorage.getItem('posUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        console.log('Current user loaded:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Fallback for demo account
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
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/pos/products", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/products?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch products');
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
    if (staffAccounts.length > 0 && currentUser?.selectedStaffAccountId && !currentStaff) {
      const savedStaff = staffAccounts.find(s => s.id === currentUser.selectedStaffAccountId);
      if (savedStaff) {
        setCurrentStaff(savedStaff);
      }
    }
  }, [staffAccounts, currentUser?.selectedStaffAccountId, currentStaff]);

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
    return invoices.filter((invoice) => {
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
  }, [invoices, invoiceSearchQuery, invoiceStatusFilter, invoiceTypeFilter, invoiceDateFrom, invoiceDateTo, customers]);

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
      setIsStaffPasswordDialogOpen(false);
      setStaffPassword("");
      setSelectedStaffForAuth(null);
      // Save staff selection to user profile (persists like language preference)
      if (currentUser?.id && data.staffAccount?.id) {
        try {
          await apiRequest("PUT", `/api/pos/user/${currentUser.id}/staff-selection`, { 
            staffAccountId: data.staffAccount.id 
          });
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
  const openProductDialog = (product?: PosProduct) => {
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

  // Filter products based on search term for Products tab
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  // Filter products based on search term for Sales tab
  const filteredSalesProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        console.log("Sale completed successfully:", result.data);
        
        // Generate PDF receipt
        const selectedCustomer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;
        generateReceipt(
          currentSale,
          calculateTotal(),
          selectedCustomer?.name,
          saleNotes,
          paymentType,
          false,
          undefined,
          currentStaff?.username,
          tipOptionEnabled
        );
        
        toast({
          title: "Sale completed",
          description: `Sale of R${calculateTotal()} processed successfully. Receipt downloaded.`,
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
      };
    } catch {
      return defaults;
    }
  };

  // PDF Receipt Generation
  const generateReceipt = (items: SaleItem[], total: string, customerName?: string, notes?: string, paymentType?: string, isOpenAccount = false, accountName?: string, staffName?: string, includeTipLines = false, customSettings?: any) => {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Merge settings with defaults
    const settings = mergeReceiptSettings(customSettings || currentUser?.receiptSettings);
    
    // Section renderers
    const renderLogo = () => {
      if (settings.toggles.showLogo) {
        // Use custom logo from settings if available, otherwise use company logo
        const logoToUse = settings.logoDataUrl || currentUser?.companyLogo;
        if (logoToUse) {
          try {
            // Logo is 2x bigger (60x60) and centered on the page
            const logoWidth = 60;
            const pageWidth = 210; // A4 width in mm
            const xPosition = (pageWidth - logoWidth) / 2;
            doc.addImage(logoToUse, 'JPEG', xPosition, yPosition, 60, 60);
            yPosition += 65;
          } catch (error) {
            console.error('Error adding logo to PDF:', error);
          }
        }
      }
    };
    
    const renderBusinessInfo = () => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(isOpenAccount ? 'ACCOUNT STATEMENT' : 'SALES RECEIPT', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (settings.toggles.showBusinessName && settings.businessInfo.name) {
        doc.setFont('helvetica', 'bold');
        doc.text(settings.businessInfo.name, 20, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 6;
      }
      
      if (settings.toggles.showBusinessAddress) {
        if (settings.businessInfo.addressLine1) {
          doc.text(settings.businessInfo.addressLine1, 20, yPosition);
          yPosition += 5;
        }
        if (settings.businessInfo.addressLine2) {
          doc.text(settings.businessInfo.addressLine2, 20, yPosition);
          yPosition += 5;
        }
      }
      
      if (settings.toggles.showBusinessPhone && settings.businessInfo.phone) {
        doc.text(`Tel: ${settings.businessInfo.phone}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (settings.toggles.showBusinessEmail && settings.businessInfo.email) {
        doc.text(`Email: ${settings.businessInfo.email}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (settings.toggles.showBusinessWebsite && settings.businessInfo.website) {
        doc.text(`Web: ${settings.businessInfo.website}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (settings.toggles.showRegistrationNumber && settings.businessInfo.registrationNumber) {
        doc.text(`Reg: ${settings.businessInfo.registrationNumber}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (settings.toggles.showVATNumber && settings.businessInfo.vatNumber) {
        doc.text(`VAT: ${settings.businessInfo.vatNumber}`, 20, yPosition);
        yPosition += 5;
      }
      
      yPosition += 5;
    };
    
    const renderDateTime = () => {
      if (settings.toggles.showDateTime) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
        doc.text(`Time: ${new Date().toLocaleTimeString()}`, 120, yPosition);
        yPosition += 10;
      }
    };
    
    const renderStaffInfo = () => {
      if (settings.toggles.showStaffInfo && staffName) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Served by: ${staffName}`, 20, yPosition);
        yPosition += 8;
      }
    };
    
    const renderCustomerInfo = () => {
      if (settings.toggles.showCustomerInfo) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (customerName) {
          doc.text(`Customer: ${customerName}`, 20, yPosition);
          yPosition += 8;
        }
        if (accountName) {
          doc.text(`Account: ${accountName}`, 20, yPosition);
          yPosition += 8;
        }
      }
    };
    
    const renderItems = () => {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Item', 20, yPosition);
      doc.text('Qty', 120, yPosition);
      doc.text('Price', 150, yPosition);
      doc.text('Total', 175, yPosition);
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      items.forEach(item => {
        const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
        let itemName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;
        doc.text(itemName, 20, yPosition);
        doc.text(item.quantity.toString(), 120, yPosition);
        doc.text(`R${item.price}`, 150, yPosition);
        doc.text(`R${itemTotal}`, 175, yPosition);
        yPosition += 6;
      });
    };
    
    const renderTotals = () => {
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`TOTAL: R${total}`, 150, yPosition);
      yPosition += 15;
      
      if (includeTipLines) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        yPosition += 5;
        doc.text('Tip: ', 20, yPosition);
        doc.line(35, yPosition, 100, yPosition);
        yPosition += 10;
        doc.text('New Total: ', 20, yPosition);
        doc.line(50, yPosition, 100, yPosition);
        yPosition += 15;
      }
    };
    
    const renderPaymentInfo = () => {
      if (settings.toggles.showPaymentMethod && paymentType) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Payment: ${paymentType.toUpperCase()}`, 20, yPosition);
        yPosition += 8;
      }
      if (notes) {
        doc.setFontSize(10);
        doc.text(`Notes: ${notes}`, 20, yPosition);
        yPosition += 8;
      }
    };
    
    const renderMessages = () => {
      yPosition += 10;
      doc.setFontSize(8);
      
      if (settings.toggles.showCustomHeader && settings.customMessages.header) {
        doc.text(settings.customMessages.header, 20, yPosition);
        yPosition += 5;
      }
      
      if (settings.toggles.showThankYouMessage) {
        doc.text(settings.customMessages.thankYou || 'Thank you for your business!', 20, yPosition);
        yPosition += 5;
      }
      
      if (settings.toggles.showCustomFooter && settings.customMessages.footer) {
        doc.text(settings.customMessages.footer, 20, yPosition);
        yPosition += 5;
      }
      
      doc.text('Powered by Storm POS - stormsoftware.co.za', 20, yPosition);
    };
    
    // Render sections in order
    const sectionRenderers: Record<string, () => void> = {
      logo: renderLogo,
      businessInfo: renderBusinessInfo,
      dateTime: renderDateTime,
      staffInfo: renderStaffInfo,
      customerInfo: renderCustomerInfo,
      items: renderItems,
      totals: renderTotals,
      paymentInfo: renderPaymentInfo,
      messages: renderMessages,
    };
    
    settings.sections.forEach((section: string) => {
      const renderer = sectionRenderers[section];
      if (renderer) renderer();
    });

    // Download the PDF
    const fileName = isOpenAccount 
      ? `account-statement-${accountName?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
      : `receipt-${Date.now()}.pdf`;
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
    
    // Business Details - Right side header (no company name)
    const headerRightX = pageWidth - margin;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let headerY = y + 5;
    
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
    if (client?.phone) {
      doc.text(`Tel: ${client.phone}`, leftColX, clientY);
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
    const detailsData = [
      { label: 'Date:', value: formatDate(invoice.createdDate) },
      { label: 'Due Date:', value: formatDate(invoice.dueDate) },
      ...(invoice.dueTerms ? [{ label: 'Terms:', value: invoice.dueTerms }] : []),
      ...(invoice.poNumber ? [{ label: 'PO #:', value: invoice.poNumber }] : [])
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
    if (invoice.paymentMethod) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Payment Method:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.paymentMethod, margin + 40, y);
      y += 12;
    }
    
    // ===== PAYMENT DETAILS =====
    if (invoice.paymentDetails) {
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
    if (invoice.notes) {
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
    if (invoice.terms) {
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
    if (client?.phone) { doc.text(`Tel: ${client.phone}`, leftColX, clientY); clientY += 5; }
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
    if (invoice.dueDate) { doc.text(`Due: ${formatDate(invoice.dueDate)}`, rightColX, detailY); detailY += 6; }
    if (invoice.poNumber) { doc.text(`PO: ${invoice.poNumber}`, rightColX, detailY); }
    
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

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* High-Tech Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(217,90%,40%)]/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(hsl(217,90%,40%) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(217,90%,40%) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Scanning Lines */}
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      {/* Header */}
      <header className="bg-white backdrop-blur-xl border-b border-gray-200 shadow-lg shadow-blue-900/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src={stormLogo} 
                alt="Storm POS" 
                className="h-16 sm:h-40 md:h-48 w-auto mix-blend-multiply"
                style={{ filter: 'drop-shadow(0 0 0 transparent)' }}
              />
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Help Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/pos/help'}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-[hsl(217,90%,40%)] hover:text-[hsl(217,90%,35%)] hover:bg-blue-50"
                data-testid="help-button"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </Button>

              {/* Staff Account Dropdown */}
              <motion.div
                animate={highlightStaffButton ? {
                  scale: [1, 1.1, 1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 0px rgba(59, 130, 246, 0)",
                    "0 0 0 8px rgba(59, 130, 246, 0.4)",
                    "0 0 0 8px rgba(59, 130, 246, 0)",
                    "0 0 0 8px rgba(59, 130, 246, 0.4)",
                    "0 0 0 0px rgba(59, 130, 246, 0)"
                  ]
                } : {}}
                transition={{ duration: 0.8, repeat: highlightStaffButton ? 5 : 0, repeatType: "loop" }}
                className={highlightStaffButton ? "rounded-md" : ""}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm transition-all ${
                        highlightStaffButton ? 'ring-4 ring-blue-400 ring-opacity-50 bg-blue-50 border-blue-400' : ''
                      }`}
                      data-testid="staff-dropdown"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{currentStaff ? currentStaff.username : 'Select Staff'}</span>
                      <span className="sm:hidden">{currentStaff ? currentStaff.username.substring(0, 8) + '...' : 'Staff'}</span>
                      {currentStaff && (
                        <Badge variant={currentStaff.userType === 'management' ? 'default' : 'secondary'} className="text-xs hidden sm:inline">
                          {currentStaff.userType}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {!currentStaff ? (
                    <>
                      {staffAccounts.map((staff) => (
                        <DropdownMenuItem 
                          key={staff.id} 
                          onClick={() => {
                            setSelectedStaffForAuth(staff);
                            setIsStaffPasswordDialogOpen(true);
                          }}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <div className="flex-1">
                            <div className="font-medium">{staff.username}</div>
                            <div className="text-xs text-muted-foreground capitalize">{staff.userType}</div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {staffAccounts.length > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem onClick={() => setIsStaffDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create New User
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <div className="px-2 py-2 text-sm">
                        <div className="font-medium">{currentStaff.username}</div>
                        <div className="text-muted-foreground capitalize">{currentStaff.userType}</div>
                      </div>
                      <DropdownMenuSeparator />
                      {currentStaff.userType === 'management' && (
                        <DropdownMenuItem onClick={() => setIsUserManagementOpen(true)}>
                          <Settings className="mr-2 h-4 w-4" />
                          User Management
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setCurrentStaff(null)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Switch User
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              </motion.div>

              {/* Profile Avatar */}
              <div className="flex flex-col items-center" data-testid="profile-avatar">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-[hsl(217,90%,40%)]/30 shadow-lg shadow-blue-500/20">
                  {currentUser?.companyLogo ? (
                    <img 
                      src={currentUser.companyLogo} 
                      alt="Company Logo" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[hsl(217,90%,40%)] text-white text-sm font-medium">
                      {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
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
            <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl rounded-xl md:rounded-2xl px-4 py-3 md:px-8 md:py-5 shadow-2xl shadow-blue-900/40 border border-gray-600/50 md:min-w-[320px]">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-xl md:rounded-2xl"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              />
              <button
                onClick={() => setShowWelcomeToast(false)}
                className="absolute top-2 right-2 md:top-3 md:right-3 p-1 md:p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="mb-8">
            {/* Mobile Side Menu Navigation */}
            <div className="block md:hidden">
              {/* Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex items-center gap-3 w-full p-3 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl shadow-lg shadow-blue-900/30"
                data-testid="button-mobile-menu-toggle"
              >
                <Menu className="h-5 w-5 text-[hsl(217,90%,40%)]" />
                <div className="flex items-center gap-2 text-white">
                  {currentTab === "sales" && <><ShoppingCart className="h-4 w-4" /><span>Sales</span></>}
                  {currentTab === "products" && <><Package className="h-4 w-4" /><span>Products</span></>}
                  {currentTab === "customers" && <><Users className="h-4 w-4" /><span>Customers</span></>}
                  {currentTab === "invoices" && <><Receipt className="h-4 w-4" /><span>Invoices & Quotes</span></>}
                  {currentTab === "open-accounts" && <><FileText className="h-4 w-4" /><span>Open Accounts</span></>}
                  {currentTab === "reports" && <><BarChart3 className="h-4 w-4" /><span>Reports</span></>}
                  {currentTab === "usage" && <><CreditCard className="h-4 w-4" /><span>Usage</span></>}
                  {currentTab === "settings" && <><Settings className="h-4 w-4" /><span>Settings</span></>}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
              </button>

              {/* Slide-out Side Menu */}
              {isMobileMenuOpen && (
                <>
                  {/* Backdrop overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  {/* Side menu panel */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed left-0 top-0 bottom-0 w-72 bg-gray-900 border-r border-gray-700 z-50 shadow-2xl"
                  >
                    {/* Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                      <span className="text-white font-semibold text-lg">Menu</span>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                        data-testid="button-close-mobile-menu"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="p-3 space-y-1">
                      {[
                        { id: 'sales', label: 'Sales', icon: ShoppingCart },
                        { id: 'products', label: 'Products', icon: Package },
                        { id: 'customers', label: 'Customers', icon: Users },
                        { id: 'invoices', label: 'Invoices & Quotes', icon: Receipt },
                        { id: 'open-accounts', label: 'Open Accounts', icon: FileText },
                        { id: 'reports', label: 'Reports', icon: BarChart3 },
                        { id: 'usage', label: 'Usage', icon: CreditCard },
                        { id: 'settings', label: 'Settings', icon: Settings },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleTabChange(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all ${
                            currentTab === item.id
                              ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                          }`}
                          data-testid={`menu-item-${item.id}`}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                          {currentTab === item.id && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </button>
                      ))}
                    </nav>

                    {/* Logout at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsLogoutDialogOpen(true);
                        }}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                        data-testid="menu-item-logout"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            {/* Desktop Tab Navigation - Enterprise Modern Design */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/10 via-transparent to-[hsl(217,90%,40%)]/10 rounded-2xl blur-xl"></div>
                <TabsList className="relative w-full h-16 bg-gradient-to-b from-gray-800/80 to-gray-900/90 backdrop-blur-2xl border border-gray-600/50 rounded-2xl p-2 tabs-navigation shadow-2xl shadow-black/40 flex justify-between">
                  <TabsTrigger 
                    value="sales" 
                    className="group relative flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[hsl(217,90%,45%)] data-[state=active]:to-[hsl(217,90%,35%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 hover:text-white hover:bg-white/5"
                    data-testid="tab-sales"
                  >
                    <ShoppingCart className="h-4 w-4 group-data-[state=active]:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="hidden lg:inline">Sales</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="products" 
                    className="group relative flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[hsl(217,90%,45%)] data-[state=active]:to-[hsl(217,90%,35%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 hover:text-white hover:bg-white/5"
                    data-testid="tab-products"
                  >
                    <Package className="h-4 w-4 group-data-[state=active]:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="hidden lg:inline">Products</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="customers" 
                    className="group relative flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[hsl(217,90%,45%)] data-[state=active]:to-[hsl(217,90%,35%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 hover:text-white hover:bg-white/5"
                    data-testid="tab-customers"
                  >
                    <Users className="h-4 w-4 group-data-[state=active]:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="hidden lg:inline">Customers</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="invoices" 
                    className="group relative flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[hsl(217,90%,45%)] data-[state=active]:to-[hsl(217,90%,35%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 hover:text-white hover:bg-white/5"
                    data-testid="tab-invoices"
                  >
                    <Receipt className="h-4 w-4 flex-shrink-0 group-data-[state=active]:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="hidden lg:inline whitespace-nowrap">Invoices</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="open-accounts" 
                    className="group relative flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[hsl(217,90%,45%)] data-[state=active]:to-[hsl(217,90%,35%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 hover:text-white hover:bg-white/5"
                    data-testid="tab-open-accounts"
                  >
                    <FileText className="h-4 w-4 group-data-[state=active]:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="hidden lg:inline whitespace-nowrap">Accounts</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reports" 
                    className="group relative flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[hsl(217,90%,45%)] data-[state=active]:to-[hsl(217,90%,35%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 hover:text-white hover:bg-white/5"
                    data-testid="tab-reports"
                  >
                    <BarChart3 className="h-4 w-4 group-data-[state=active]:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="hidden lg:inline">Reports</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="usage" 
                    className="group relative flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[hsl(217,90%,45%)] data-[state=active]:to-[hsl(217,90%,35%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 hover:text-white hover:bg-white/5"
                    data-testid="tab-usage"
                  >
                    <CreditCard className="h-4 w-4 group-data-[state=active]:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="hidden lg:inline">Usage</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="group relative flex items-center justify-center gap-2 h-12 px-4 rounded-xl font-medium text-sm transition-all duration-300 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[hsl(217,90%,45%)] data-[state=active]:to-[hsl(217,90%,35%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 hover:text-white hover:bg-white/5"
                    data-testid="tab-settings"
                  >
                    <Settings className="h-4 w-4 group-data-[state=active]:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="hidden lg:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <motion.div 
              className="grid lg:grid-cols-2 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Product Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card data-testid="product-selection-card" className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Package className="h-5 w-5 text-[hsl(217,90%,40%)]" />
                      <span>Products</span>
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    <div className="grid gap-2">
                      {filteredSalesProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200"
                          onClick={() => addToSale(product)}
                        >
                          <div>
                            <p className="font-medium text-white">{product.name}</p>
                            <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                            <p className="text-sm text-gray-400">Stock: {product.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-400">
                              R{getProductPrice(product, selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.customerType || 'retail' : 'retail')}
                            </p>
                            {product.tradePrice && (
                              <p className="text-xs text-gray-400">
                                {selectedCustomerId && customers.find(c => c.id === selectedCustomerId)?.customerType === 'trade' 
                                  ? `Retail: R${product.retailPrice}` 
                                  : `Trade: R${product.tradePrice}`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Current Sale */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card data-testid="current-sale-card" className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <ShoppingCart className="h-5 w-5 text-[hsl(217,90%,40%)]" />
                      <span>Current Sale</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sale Items */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {currentSale.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium text-[#ffffff]">{item.name}</p>
                              <p className="text-sm text-gray-500">R{item.price} each</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-[#ffffff]">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateQuantity(item.productId, 0)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Sale Details */}
                      <div className="space-y-3 pt-4 border-t">
                        <div>
                          <Label htmlFor="customer" className="text-white">Customer (Optional)</Label>
                          <Select 
                            value={selectedCustomerId?.toString() || "none"} 
                            onValueChange={(value) => setSelectedCustomerId(value === "none" ? null : parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No customer</SelectItem>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{customer.name}</span>
                                      <span className={`text-xs px-1 rounded ${customer.customerType === 'trade' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {customer.customerType === 'trade' ? 'Trade' : 'Retail'}
                                      </span>
                                    </div>
                                    {customer.phone && (
                                      <span className="text-xs text-gray-500">{customer.phone}</span>
                                    )}
                                    {customer.notes && (
                                      <span className="text-xs text-gray-400 italic">{customer.notes}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedCustomerId && (() => {
                            const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
                            return selectedCustomer ? (
                              <div className={`mt-2 p-2 border rounded text-sm ${selectedCustomer.customerType === 'trade' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium ${selectedCustomer.customerType === 'trade' ? 'text-green-900' : 'text-blue-900'}`}>
                                    {selectedCustomer.name}
                                  </p>
                                  <Badge variant={selectedCustomer.customerType === 'trade' ? 'default' : 'outline'} className="text-xs">
                                    {selectedCustomer.customerType === 'trade' ? 'Trade Pricing' : 'Retail Pricing'}
                                  </Badge>
                                </div>
                                {selectedCustomer.phone && (
                                  <p className={selectedCustomer.customerType === 'trade' ? 'text-green-700' : 'text-blue-700'}>
                                    Phone: {selectedCustomer.phone}
                                  </p>
                                )}
                                {selectedCustomer.notes && (
                                  <p className={`italic ${selectedCustomer.customerType === 'trade' ? 'text-green-600' : 'text-blue-600'}`}>
                                    Notes: {selectedCustomer.notes}
                                  </p>
                                )}
                              </div>
                            ) : null;
                          })()}
                        </div>

                        <div>
                          <Label htmlFor="payment" className="text-white">Payment Method</Label>
                          <Select value={paymentType} onValueChange={setPaymentType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="eft">EFT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            value={saleNotes}
                            onChange={(e) => setSaleNotes(e.target.value)}
                            placeholder="Sale notes"
                            rows={2}
                          />
                        </div>

                        {/* Discount Section */}
                        <div>
                          <Label className="text-white">Discount</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {[0, 5, 10, 20, 50].map((percentage) => (
                              <Button
                                key={percentage}
                                type="button"
                                size="sm"
                                variant={discountPercentage === percentage ? "default" : "outline"}
                                onClick={() => setDiscountPercentage(percentage)}
                                className={discountPercentage === percentage ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]" : ""}
                              >
                                {percentage === 0 ? "No Discount" : `${percentage}%`}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Tip Option Section */}
                        <div>
                          <Label className="text-white">Tip Option</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setTipOptionEnabled(!tipOptionEnabled)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                tipOptionEnabled 
                                  ? 'bg-[hsl(217,90%,40%)]' 
                                  : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  tipOptionEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-gray-300">
                              {tipOptionEnabled ? 'Tip lines enabled on receipt' : 'Add tip option to receipt'}
                            </span>
                          </div>
                        </div>

                        {/* Total Section */}
                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-[#ffffff]">Subtotal:</span>
                            <span className="text-[#ffffff]">R{calculateSubtotal().toFixed(2)}</span>
                          </div>
                          {discountPercentage > 0 && (
                            <div className="flex justify-between items-center text-lg text-green-600">
                              <span>Discount ({discountPercentage}%):</span>
                              <span>-R{calculateDiscount().toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
                            <span className="text-[#ffffff]">Total:</span>
                            <span className="text-[hsl(217,90%,40%)]">R{calculateTotal()}</span>
                          </div>
                        </div>

                        {/* Checkout Options */}
                        <div className="space-y-3">
                          <div>
                            <Label className="text-white">Checkout Option</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={checkoutOption === 'complete' ? "default" : "outline"}
                                onClick={() => setCheckoutOption('complete')}
                                className={checkoutOption === 'complete' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]" : ""}
                              >
                                <Receipt className="h-4 w-4 mr-2" />
                                Complete Sale
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant={checkoutOption === 'open-account' ? "default" : "outline"}
                                onClick={() => setCheckoutOption('open-account')}
                                className={checkoutOption === 'open-account' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]" : ""}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Open Account
                              </Button>
                              {openAccounts.length > 0 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={checkoutOption === 'add-to-account' ? "default" : "outline"}
                                  onClick={() => setCheckoutOption('add-to-account')}
                                  className={checkoutOption === 'add-to-account' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]" : ""}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add to Account
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Open Account Selection */}
                          {checkoutOption === 'add-to-account' && (
                            <div>
                              <Label className="text-white">Select Open Account</Label>
                              <Select 
                                value={selectedOpenAccountId?.toString() || ""} 
                                onValueChange={(value) => setSelectedOpenAccountId(value ? parseInt(value) : null)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose an open account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {openAccounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id.toString()}>
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{account.accountName}</span>
                                          <Badge variant={account.accountType === 'table' ? 'default' : 'outline'} className="text-xs">
                                            {account.accountType === 'table' ? 'Table' : 'Customer'}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span>Current: R{account.total}</span>
                                          <span>•</span>
                                          <span>{Array.isArray(account.items) ? account.items.length : 0} items</span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {/* Checkout Button */}
                          <Button
                            className="w-full h-12 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                            onClick={() => checkoutMutation.mutate()}
                            disabled={currentSale.length === 0 || checkoutMutation.isPending || (checkoutOption === 'add-to-account' && !selectedOpenAccountId)}
                          >
                            {checkoutOption === 'complete' ? (
                              <>
                                <Receipt className="h-4 w-4 mr-2" />
                                {checkoutMutation.isPending ? "Processing..." : "Complete Sale"}
                              </>
                            ) : checkoutOption === 'open-account' ? (
                              <>
                                <FileText className="h-4 w-4 mr-2" />
                                {checkoutMutation.isPending ? "Processing..." : "Create Open Account"}
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                {checkoutMutation.isPending ? "Processing..." : "Add to Account"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <CardHeader className="relative border-b border-white/10 pb-4">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="border-[hsl(217,90%,40%)]/30 text-[hsl(217,90%,60%)] hover:bg-[hsl(217,90%,40%)]/20 hover:border-[hsl(217,90%,40%)]/50 transition-all">
                            <FileSpreadsheet className="h-4 w-4 mr-1" />
                            Excel
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem onClick={handleExportProducts} className="text-gray-200 hover:bg-gray-800">
                            <Download className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                            Export Products
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem 
                            className="text-gray-200 hover:bg-gray-800 cursor-pointer"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <label className="cursor-pointer flex items-center w-full">
                              <Upload className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                              Import Products
                              <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'products')}
                              />
                            </label>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem 
                            onClick={() => setShowDeleteAllProductsConfirm(true)}
                            className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete All Products
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
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
                            <div className="grid grid-cols-2 gap-4">
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
                              <div className="grid grid-cols-3 gap-3">
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
              <CardContent className="relative pt-6">
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
                      <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20">
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Excel
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleExportCustomers}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Customers
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <label className="cursor-pointer flex items-center w-full">
                          <Upload className="h-4 w-4 mr-2" />
                          Import Customers
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
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <motion.div 
                      key={customer.id} 
                      className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                      whileHover={{ scale: 1.01, y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{customer.name}</h3>
                          <Badge variant={customer.customerType === 'trade' ? 'default' : 'outline'} className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                            {customer.customerType === 'trade' ? 'Trade' : 'Retail'}
                          </Badge>
                        </div>
                        {customer.phone && <p className="text-sm text-gray-300">Phone: {customer.phone}</p>}
                        {customer.notes && <p className="text-sm text-gray-300">Notes: {customer.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCustomerDialog(customer)}
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
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
                  ))}
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
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    Export Excel
                  </Button>
                  <Button 
                    onClick={() => setIsInvoiceDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 text-sm"
                    data-testid="button-create-invoice"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Invoice/Quote
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
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
                    {(invoiceSearchQuery || invoiceStatusFilter !== 'all' || invoiceTypeFilter !== 'all' || invoiceDateFrom || invoiceDateTo) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInvoiceSearchQuery("");
                          setInvoiceStatusFilter('all');
                          setInvoiceTypeFilter('all');
                          setInvoiceDateFrom("");
                          setInvoiceDateTo("");
                        }}
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 w-full"
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
                <CardContent className="pt-6">
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
                              className="flex-1 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
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
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <Label htmlFor="date-filter" className="text-gray-300">Select Date:</Label>
                      <Input
                        id="date-filter"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-auto bg-white/10 border-white/20 text-white"
                      />
                      <Label htmlFor="staff-filter" className="text-gray-300">Filter by Staff:</Label>
                      <Select value={selectedStaffFilter.toString()} onValueChange={(value) => setSelectedStaffFilter(value === "all" ? "all" : parseInt(value))}>
                        <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
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
                    <Button
                      onClick={() => handlePrintReport()}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
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
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {dateFilteredSales.length > 0 ? (
                            dateFilteredSales.map((sale) => (
                              <div key={sale.id} className={`flex justify-between items-center p-3 border rounded-lg ${sale.isVoided ? 'bg-red-900/20 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex-1">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className={`font-medium ${sale.isVoided ? 'line-through text-red-400' : 'text-white'}`}>
                                          R{sale.total}
                                        </p>
                                        {sale.isVoided && (
                                          <Badge variant="destructive" className="text-xs">
                                            VOIDED
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-400">
                                        {new Date(sale.createdAt).toLocaleTimeString()}
                                      </p>
                                    </div>
                                    {sale.customerName && (
                                      <div>
                                        <p className="text-sm font-medium text-white">{sale.customerName}</p>
                                        <p className="text-xs text-gray-400">Customer</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        Served by: {
                                          sale.staffAccountId 
                                            ? (() => {
                                                const staff = staffAccounts.find(staff => staff.id === sale.staffAccountId);
                                                return staff ? (staff.displayName || staff.username || `Staff #${staff.id}`) : 'Staff Member';
                                              })()
                                            : currentUser?.email?.split('@')[0] || 'Manager'
                                        }
                                      </p>
                                      <p className="text-xs text-gray-400">Staff</p>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-300">
                                      Items: {sale.items.map((item: any) => `${item.name} (${item.quantity})`).join(', ')}
                                    </p>
                                    {sale.isVoided && sale.voidReason && (
                                      <p className="text-xs text-red-400 mt-1">
                                        Void Reason: {sale.voidReason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                  <Badge variant="outline" className="mb-1 bg-blue-600/20 text-blue-300 border-blue-500/30">
                                    {sale.paymentType.toUpperCase()}
                                  </Badge>
                                  <p className="text-xs text-gray-400">#{sale.id}</p>
                                  {!sale.isVoided && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleVoidSaleClick(sale)}
                                      className="h-6 px-2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                    >
                                      <X className="h-3 w-3 mr-1" />
                                      Void
                                    </Button>
                                  )}
                                  {sale.isVoided && sale.voidReason && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewVoidReason(sale)}
                                      className="h-6 px-2 text-xs border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
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
                  <div className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Usage & Billing</h2>
                        <p className="text-blue-100 mt-1">{formatMonthYear(now)} billing period</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">R{stormFee.toFixed(2)}</div>
                        <div className="text-blue-100 text-sm">Amount due to Storm</div>
                        <Button
                          onClick={() => setIsBankDetailsOpen(true)}
                          variant="outline"
                          size="sm"
                          className="mt-3 bg-blue-500/20 border-blue-300 text-white hover:bg-blue-600 hover:border-blue-400 shadow-sm backdrop-blur-sm"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
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
                  <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <CardHeader className="border-b border-white/10 pb-4">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Receipt className="w-5 h-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 text-white">How Billing Works</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                                Monthly billing cycle: 1st to last day of month
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                                Service fee: 0.5% of gross monthly revenue
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                                Payment due: End of each month
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                                No setup fees or hidden charges
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3 text-white">Contact & Support</h4>
                            <div className="space-y-2 text-sm text-gray-300">
                              <p>Questions about your billing?</p>
                              <p className="font-medium text-blue-400">
                                Email: softwarebystorm@gmail.com
                              </p>
                            </div>
                          </div>
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
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
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
        setCurrentUser={setCurrentUser}
        toast={toast}
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
            const managementPassword = formData.get('management-password') as string;
            
            if (username && password && userType) {
              createStaffAccountMutation.mutate({
                username,
                password,
                userType,
                managementPassword: userType === 'management' ? managementPassword : undefined,
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
              <div>
                <Label htmlFor="create-management-password">Management Password</Label>
                <Input
                  id="create-management-password"
                  name="management-password"
                  type="password"
                  placeholder="Required for management role"
                />
                <p className="text-xs text-muted-foreground mt-1">Only required if creating a management user</p>
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
      {/* User Management Dialog */}
      <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {staffAccounts.length === 0 ? "Create Your First Staff Account" : "User Management"}
            </DialogTitle>
            <DialogDescription>
              {staffAccounts.length === 0 
                ? "Set up your first staff account to start using the staff management system."
                : "Manage staff accounts and permissions."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Create New Staff Account */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Add New Staff Account</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const username = formData.get('new-username') as string;
                const password = formData.get('new-password') as string;
                const userType = formData.get('user-type') as 'staff' | 'management';
                const managementPassword = formData.get('management-password') as string;
                
                if (username && password && userType) {
                  createStaffAccountMutation.mutate({
                    username,
                    password,
                    userType,
                    managementPassword: userType === 'management' ? managementPassword : undefined,
                    userId: currentUser?.id
                  });
                  (e.target as HTMLFormElement).reset();
                }
              }}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="new-username">Username</Label>
                    <Input
                      id="new-username"
                      name="new-username"
                      type="text"
                      required
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">Password</Label>
                    <Input
                      id="new-password"
                      name="new-password"
                      type="password"
                      required
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="user-type">User Type</Label>
                    <Select name="user-type" required defaultValue={staffAccounts.length === 0 ? "management" : undefined}>
                      <SelectTrigger>
                        <SelectValue placeholder={staffAccounts.length === 0 ? "Management (Default)" : "Select user type"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="management-password">Management Password (if required)</Label>
                    <Input
                      id="management-password"
                      name="management-password"
                      type="password"
                      placeholder="Required for management accounts"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={createStaffAccountMutation.isPending}
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {createStaffAccountMutation.isPending ? "Creating..." : "Create Staff Account"}
                </Button>
              </form>
            </div>

            {/* Existing Staff Accounts */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Existing Staff Accounts</h3>
              <div className="space-y-2">
                {staffAccounts.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No staff accounts created yet.</p>
                ) : (
                  staffAccounts.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{staff.username}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {staff.userType} • {staff.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={staff.userType === 'management' ? 'default' : 'secondary'}>
                          {staff.userType}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${staff.username}?`)) {
                              deleteStaffAccountMutation.mutate(staff.id);
                            }
                          }}
                          disabled={deleteStaffAccountMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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
        <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[hsl(217,90%,40%)]" />
              Payment Details
            </DialogTitle>
            <DialogDescription>
              Bank account details for Storm POS service fee payments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Bank Details Card */}
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[hsl(217,90%,40%)] rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Nedbank Account</h3>
                  <p className="text-sm text-gray-600">For Storm POS service fee payments</p>
                </div>
              </div>
              
              <div className="grid gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-200 last:border-0">
                  <span className="text-sm font-medium text-gray-600">Account Holder</span>
                  <span className="font-semibold text-gray-900">Storm</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-200 last:border-0">
                  <span className="text-sm font-medium text-gray-600">Account Number</span>
                  <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded">1229368612</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-200 last:border-0">
                  <span className="text-sm font-medium text-gray-600">Account Type</span>
                  <span className="font-semibold text-gray-900">Current Account</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-200 last:border-0">
                  <span className="text-sm font-medium text-gray-600">Bank Name</span>
                  <span className="font-semibold text-gray-900">Nedbank</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3">
                  <span className="text-sm font-medium text-gray-600">Branch Code</span>
                  <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded">198765</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-amber-600 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 mb-2">Payment Instructions</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Use your registered business name as payment reference</li>
                    <li>• Pay monthly service fees by the last day of each month</li>
                    <li>• Keep proof of payment for your records</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="text-center text-sm text-gray-600">
              <p>Questions about billing or payments?</p>
              <p className="font-medium text-[hsl(217,90%,40%)] mt-1">
                Email: softwarebystorm@gmail.com
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsBankDetailsOpen(false)} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]">
              Close
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

            {/* PO Number */}
            <div>
              <Label>PO Number (Optional)</Label>
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
              <Label>Payment Terms</Label>
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
              <Label>Due Date (Optional)</Label>
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
                      <div className="flex-1">
                        <span className="font-medium">{itemName}</span>
                        {item.customName && <span className="text-xs text-purple-600 ml-1">(Custom)</span>}
                        <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="text-right font-medium">
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
                
                {/* Add Line Item from Product List */}
                <Select
                  value=""
                  onValueChange={(value) => {
                    const product = products.find(p => p.id === parseInt(value));
                    if (product) {
                      setInvoiceItems([...invoiceItems, {
                        productId: product.id,
                        quantity: 1,
                        price: parseFloat(product.retailPrice)
                      }]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product from list" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} - R{product.retailPrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
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
              <Label>Payment Method (Optional)</Label>
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
                <Label>Payment Details (Optional)</Label>
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
                <Label>Notes (Optional) <span className="text-xs text-gray-500">({invoiceNotes.length}/300)</span></Label>
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
                <Label>Terms & Conditions (Optional) <span className="text-xs text-gray-500">({invoiceTerms.length}/500)</span></Label>
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
                    terms: invoiceTerms || null
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
                  {selectedInvoice.dueTerms && (
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
                          
                          const items = Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
                          setInvoiceItems(items.map((item: any) => ({
                            productId: item.productId,
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
                window.location.href = '/pos/login';
              }}
            >
              Yes, Log Out
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
    </div>
  );
}