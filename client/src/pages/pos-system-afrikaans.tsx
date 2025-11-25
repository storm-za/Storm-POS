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
  ChevronDown, Globe, BookOpen, HelpCircle
} from "lucide-react";
import stormLogo from "@assets/STORM__500_x_250_px_-removebg-preview_1762197388108.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ReceiptCustomizerDialog } from "@/components/ReceiptCustomizerDialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import jsPDF from 'jspdf';

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
  const [editingCustomer, setEditingCustomer] = useState<PosCustomer | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffAccount | null>(null);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedStaffForAuth, setSelectedStaffForAuth] = useState<StaffAccount | null>(null);
  const [isStaffPasswordDialogOpen, setIsStaffPasswordDialogOpen] = useState(false);
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
  const [isReceiptCustomizerOpen, setIsReceiptCustomizerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number; email: string; paid: boolean; companyLogo?: string; companyName?: string; tutorialCompleted?: boolean; trialStartDate?: string} | null>(null);
  const [managementPasswordDialog, setManagementPasswordDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [managementPassword, setManagementPassword] = useState("");
  const [currentTab, setCurrentTab] = useState("verkope");
  const [voidSaleDialog, setVoidSaleDialog] = useState<{ open: boolean; sale: Sale | null }>({ open: false, sale: null });
  const [voidReason, setVoidReason] = useState("");
  const [viewVoidDialog, setViewVoidDialog] = useState<{ open: boolean; sale: Sale | null }>({ open: false, sale: null });
  const [selectedItemsForPrint, setSelectedItemsForPrint] = useState<number[]>([]);
  const [tipOptionEnabled, setTipOptionEnabled] = useState(false);
  const [openAccountTipEnabled, setOpenAccountTipEnabled] = useState(false);
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
  const [invoiceItems, setInvoiceItems] = useState<Array<{productId: number; quantity: number; price: number}>>([]);
  const [invoiceClientId, setInvoiceClientId] = useState<number | null>(null);
  const [invoiceCustomClient, setInvoiceCustomClient] = useState("");
  const [isCustomClient, setIsCustomClient] = useState(false);
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoicePoNumber, setInvoicePoNumber] = useState("");
  const [invoiceDueTerms, setInvoiceDueTerms] = useState("7 dae");
  const [invoiceDiscountPercent, setInvoiceDiscountPercent] = useState("0");
  const [invoiceShippingAmount, setInvoiceShippingAmount] = useState("0");
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState("");
  const [invoiceTerms, setInvoiceTerms] = useState("");
  
  // Invoice search and filter state
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'cancelled'>('all');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<'all' | 'invoice' | 'quote'>('all');
  const [invoiceDateFrom, setInvoiceDateFrom] = useState("");
  const [invoiceDateTo, setInvoiceDateTo] = useState("");
  
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
    const userData = localStorage.getItem('posUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
        console.log('Huidige gebruiker gelaai:', parsedUser);
      } catch (error) {
        console.error('Fout met ontleding van gebruikerdata:', error);
        // Fallback for demo account
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

  // Check if user has paid subscription
  useEffect(() => {
    if (currentUser && !currentUser.paid) {
      window.location.href = '/pos/inactive';
    }
  }, [currentUser]);

  // Data fetching queries
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/pos/products", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await fetch(`/api/pos/products?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Kon nie produkte laai nie');
      return response.json();
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
      
      // Status filter
      if (invoiceStatusFilter !== 'all' && invoice.status !== invoiceStatusFilter) {
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

  // PDF Export Funksie - Professionele Faktuur/Kwotasie met Besigheidsbesonderhede
  const generateInvoicePDF = (invoice: any) => {
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
    
    // Maatskappy Naam en Besigheidsbesonderhede - Regter kant
    const headerRightX = pageWidth - margin;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(companyName.toUpperCase(), headerRightX, y + 5, { align: 'right' });
    
    // Besigheid kontakinligting onder maatskappy naam
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let headerY = y + 10;
    
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
      doc.text(`BTW: ${vatNumber}`, headerRightX, headerY, { align: 'right' });
      headerY += 4;
    }
    if (regNumber) {
      doc.text(`Reg: ${regNumber}`, headerRightX, headerY, { align: 'right' });
    }
    
    // Dokument Tipe Etiket (geposisioneer onder maatskappy besonderhede)
    y = Math.max(companyLogo ? 55 : 45, headerY + 5);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(invoice.documentType === 'invoice' ? 'FAKTUUR' : 'KWOTASIE', margin, y);
    
    // Dokument Nommer
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`#${invoice.documentNumber || 'N/B'}`, margin, y + 7);
    
    // Dekoratiewe lyn onder koptekst
    y += 12;
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
    if (client?.phone) {
      doc.text(`Tel: ${client.phone}`, leftColX, clientY);
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
      { label: 'Vervaldatum:', value: formatDate(invoice.dueDate) },
      { label: 'Terme:', value: invoice.dueTerms || '7 dae' },
      ...(invoice.poNumber ? [{ label: 'BO #:', value: invoice.poNumber }] : []),
      { label: 'Status:', value: (invoice.status || 'konsep').toUpperCase() }
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
    items.forEach((item: any, index: number) => {
      if (y > pageHeight - 80) {
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
    if (parseFloat(invoice.discountPercent || '0') > 0) {
      doc.setTextColor(220, 53, 69);
      doc.text(`Afslag (${invoice.discountPercent}%):`, summaryX, y);
      const discountAmount = parseFloat(invoice.subtotal || 0) * (parseFloat(invoice.discountPercent) / 100);
      doc.text(`-R ${discountAmount.toFixed(2)}`, valueX, y, { align: 'right' });
      doc.setTextColor(80, 80, 80);
      y += 7;
    }
    
    // BTW
    doc.setTextColor(80, 80, 80);
    doc.text('BTW (15%):', summaryX, y);
    doc.setTextColor(0, 0, 0);
    doc.text(`R ${parseFloat(invoice.tax || 0).toFixed(2)}`, valueX, y, { align: 'right' });
    y += 7;
    
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
    if (invoice.paymentMethod) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Betaalmetode:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.paymentMethod, margin + 40, y);
      y += 12;
    }
    
    // ===== NOTAS AFDELING =====
    if (invoice.notes) {
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
    if (invoice.terms) {
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
    
    // Powered by STORM Software footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Powered by STORM Software', pageWidth / 2, footerY + 10, { align: 'center' });
    
    // Laai PDF af
    const fileName = `${invoice.documentType === 'invoice' ? 'faktuur' : 'kwotasie'}_${invoice.documentNumber}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "PDF Gegenereer",
      description: `${invoice.documentNumber} is afgelaai`,
    });
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/pos/logout', { method: 'POST' });
      window.location.href = '/pos/login';
    } catch (error) {
      console.error('Fout met uitlog:', error);
      window.location.href = '/pos/login';
    }
  };

  const closeManagementDialog = () => {
    setManagementPasswordDialog(false);
    setPendingTab(null);
    setHighlightStaffButton(true);
    setTimeout(() => setHighlightStaffButton(false), 5000);
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
      setInvoiceDueTerms("7 dae");
      setInvoiceDiscountPercent("0");
      setInvoiceShippingAmount("0");
      setInvoicePaymentMethod("");
      setInvoiceTerms("");
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
      setIsCustomClient(false);
      setInvoiceDueDate("");
      setInvoiceNotes("");
      setInvoicePoNumber("");
      setInvoiceDueTerms("7 dae");
      setInvoiceDiscountPercent("0");
      setInvoiceShippingAmount("0");
      setInvoicePaymentMethod("");
      setInvoiceTerms("");
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
    onSuccess: (updatedInvoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/invoices", currentUser?.id] });
      setSelectedInvoice(updatedInvoice);
      setIsStatusChangeDialogOpen(false);
      toast({
        title: "Status Bygewerk",
        description: `Faktuur status verander na ${translateStatus(updatedInvoice.status)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fout",
        description: "Kon nie status bywerk nie",
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
    onSuccess: (data) => {
      setCurrentStaff(data.staffAccount);
      setIsStaffPasswordDialogOpen(false);
      setStaffPassword("");
      setSelectedStaffForAuth(null);
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
  const logoUploadMutation = useMutation({
    mutationFn: async (logoData: string) => {
      const response = await apiRequest("POST", "/api/pos/upload-logo", { logo: logoData });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentUser(prev => prev ? { ...prev, companyLogo: data.logoUrl } : null);
      setIsLogoDialogOpen(false);
      setLogoFile(null);
      toast({
        title: "Logo opgelaai",
        description: "Maatskappy logo is suksesvol bygewerk.",
      });
    },
    onError: (error: Error) => {
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
        generateAfrikaansReceipt(result.data, selectedCustomer, tipOptionEnabled);
        
        // Clear sale
        setCurrentSale([]);
        setSaleNotes("");
        setSelectedCustomerId(null);
        setDiscountPercentage(0);
        setTipOptionEnabled(false);
        
        queryClient.invalidateQueries({ queryKey: ["/api/pos/sales", currentUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/pos/products", currentUser?.id] });
        
        toast({
          title: "Verkoop voltooi",
          description: `Verkoop van R${result.data.total} suksesvol verwerk`,
        });
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
      };
    } catch {
      return defaults;
    }
  };

  // Generate Afrikaans receipt
  const generateAfrikaansReceipt = (sale: any, customer: any, tipEnabled = false, customSettings?: any) => {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Merge settings with defaults
    const settings = mergeReceiptSettingsAfrikaans(customSettings || currentUser?.receiptSettings);
    const items = Array.isArray(sale.items) ? sale.items : JSON.parse(sale.items);
    
    // Section renderers - Afrikaans
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
      doc.text('KWITANSIE', 20, yPosition);
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
        doc.text(`E-pos: ${settings.businessInfo.email}`, 20, yPosition);
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
        doc.text(`BTW: ${settings.businessInfo.vatNumber}`, 20, yPosition);
        yPosition += 5;
      }
      
      yPosition += 5;
    };
    
    const renderDateTime = () => {
      if (settings.toggles.showDateTime) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Verkoop #: ${sale.id}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Datum: ${new Date(sale.createdAt).toLocaleDateString('af-ZA')}`, 20, yPosition);
        doc.text(`Tyd: ${new Date(sale.createdAt).toLocaleTimeString('af-ZA')}`, 120, yPosition);
        yPosition += 10;
      }
    };
    
    const renderStaffInfo = () => {
      if (settings.toggles.showStaffInfo && currentStaff) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Bedien deur: ${currentStaff.username}`, 20, yPosition);
        yPosition += 8;
      }
    };
    
    const renderCustomerInfo = () => {
      if (settings.toggles.showCustomerInfo && customer) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Klient: ${customer.name}`, 20, yPosition);
        if (customer.phone) {
          doc.text(`Telefoon: ${customer.phone}`, 120, yPosition);
        }
        yPosition += 8;
      }
    };
    
    const renderItems = () => {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Item', 20, yPosition);
      doc.text('Hv.', 120, yPosition);
      doc.text('Prys', 150, yPosition);
      doc.text('Totaal', 175, yPosition);
      yPosition += 5;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      items.forEach((item: any) => {
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
      doc.text(`TOTAAL: R${sale.total}`, 150, yPosition);
      yPosition += 15;
      
      if (tipEnabled) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        yPosition += 5;
        doc.text('Fooi: ', 20, yPosition);
        doc.line(35, yPosition, 100, yPosition);
        yPosition += 10;
        doc.text('Nuwe Totaal: ', 20, yPosition);
        doc.line(50, yPosition, 100, yPosition);
        yPosition += 15;
      }
    };
    
    const renderPaymentInfo = () => {
      if (settings.toggles.showPaymentMethod && sale.paymentType) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const paymentText = sale.paymentType === 'cash' ? 'Kontant' : sale.paymentType === 'card' ? 'Kaart' : 'EFT';
        doc.text(`Betaling: ${paymentText}`, 20, yPosition);
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
        doc.text(settings.customMessages.thankYou || 'Baie dankie vir u besigheid!', 20, yPosition);
        yPosition += 5;
      }
      
      if (settings.toggles.showCustomFooter && settings.customMessages.footer) {
        doc.text(settings.customMessages.footer, 20, yPosition);
        yPosition += 5;
      }
      
      doc.text('Aangedryf deur Storm POS - stormsoftware.co.za', 20, yPosition);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // Filter functions
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const filteredSalesProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(hsl(217,90%,40%) 1px, transparent 1px), linear-gradient(90deg, hsl(217,90%,40%) 1px, transparent 1px)`,
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
                onClick={() => window.location.href = '/pos/help/afrikaans'}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-[hsl(217,90%,40%)] hover:text-[hsl(217,90%,35%)] hover:bg-blue-50"
                data-testid="help-button"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Hulp</span>
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
                      <span className="hidden sm:inline">{currentStaff ? currentStaff.username : 'Kies Personeel'}</span>
                      <span className="sm:hidden">{currentStaff ? currentStaff.username.substring(0, 8) + '...' : 'Personeel'}</span>
                      {currentStaff && (
                        <Badge variant={currentStaff.userType === 'management' ? 'default' : 'secondary'} className="text-xs hidden sm:inline">
                          {currentStaff.userType === 'management' ? 'bestuur' : 'personeel'}
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
                              <div className="text-xs text-muted-foreground capitalize">{staff.userType === 'management' ? 'bestuur' : 'personeel'}</div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                        {staffAccounts.length > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem onClick={() => setIsStaffDialogOpen(true)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Skep Nuwe Gebruiker
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <div className="px-2 py-2 text-sm">
                          <div className="font-medium">{currentStaff.username}</div>
                          <div className="text-muted-foreground capitalize">{currentStaff.userType === 'management' ? 'bestuur' : 'personeel'}</div>
                        </div>
                        <DropdownMenuSeparator />
                        {currentStaff.userType === 'management' && (
                          <DropdownMenuItem onClick={() => setIsUserManagementOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Gebruikersbestuur
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setCurrentStaff(null)}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Wissel Gebruiker
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex flex-col items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100 hover:bg-gray-200"
                      data-testid="profile-dropdown"
                    >
                      {currentUser?.companyLogo ? (
                        <img 
                          src={currentUser.companyLogo} 
                          alt="Maatskappy Logo" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[hsl(217,90%,40%)] text-white text-sm font-medium">
                          {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'G'}
                        </div>
                      )}
                    </Button>
                    <ChevronDown className="h-3 w-3 text-gray-400 mt-1" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setIsLogoDialogOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    Verander Profielfoto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsReceiptCustomizerOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Personaliseer Jou Kwitansie
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/pos/system'}>
                    <Globe className="mr-2 h-4 w-4" />
                    Skakel na Engels
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Meld af
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Company Banner */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl px-6 py-4 shadow-2xl shadow-blue-900/50 border border-blue-400/20 backdrop-blur-sm relative overflow-hidden">
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
            <div className="flex items-center justify-center relative z-10">
              <div className="text-center">
                <h2 className="text-white text-lg font-semibold">
                  {currentUser?.companyName || "Demo Rekening"}
                </h2>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="mb-8">
            {/* Mobile Tab Navigation - Horizontal Scroll */}
            <div className="block md:hidden">
              <div className="flex space-x-1 p-1 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-x-auto scrollbar-hide shadow-lg shadow-blue-900/30">
                <button
                  onClick={() => handleTabChange("verkope")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "verkope"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mb-1" />
                  <span>Verkope</span>
                </button>
                <button
                  onClick={() => handleTabChange("produkte")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "produkte"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Package className="h-4 w-4 mb-1" />
                  <span>Produkte</span>
                </button>
                <button
                  onClick={() => handleTabChange("kliente")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "kliente"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Users className="h-4 w-4 mb-1" />
                  <span>Kliente</span>
                </button>
                <button
                  onClick={() => handleTabChange("oop-rekeninge")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "oop-rekeninge"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <FileText className="h-4 w-4 mb-1" />
                  <span>Rekeninge</span>
                </button>
                <button
                  onClick={() => handleTabChange("verslae")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "verslae"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mb-1" />
                  <span>Verslae</span>
                </button>
                <button
                  onClick={() => handleTabChange("gebruik")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "gebruik"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1" />
                  <span>Gebruik</span>
                </button>
              </div>
            </div>

            {/* Desktop Tab Navigation */}
            <TabsList className="hidden md:grid w-full grid-cols-7 h-14 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-1.5 tabs-navigation shadow-lg shadow-blue-900/30">
              <TabsTrigger 
                value="verkope" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-sales"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Verkope</span>
              </TabsTrigger>
              <TabsTrigger 
                value="produkte" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-products"
              >
                <Package className="h-4 w-4" />
                <span>Produkte</span>
              </TabsTrigger>
              <TabsTrigger 
                value="kliente" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-customers"
              >
                <Users className="h-4 w-4" />
                <span>Kliente</span>
              </TabsTrigger>
              <TabsTrigger 
                value="fakturen" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-invoices"
              >
                <Receipt className="h-4 w-4" />
                <span>Fakturen</span>
              </TabsTrigger>
              <TabsTrigger 
                value="oop-rekeninge" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-open-accounts"
              >
                <FileText className="h-4 w-4" />
                <span>Oop Rekeninge</span>
              </TabsTrigger>
              <TabsTrigger 
                value="verslae" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-reports"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Verslae</span>
              </TabsTrigger>
              <TabsTrigger 
                value="gebruik" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-usage"
              >
                <CreditCard className="h-4 w-4" />
                <span>Gebruik</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Sales Tab */}
          <TabsContent value="verkope">
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
                      <span>Produkte</span>
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Soek produkte..."
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
                            <p className="text-sm text-gray-400">Voorraad: {product.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-400">
                              R{getProductPrice(product, selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.customerType || 'retail' : 'retail')}
                            </p>
                            {product.tradePrice && (
                              <p className="text-xs text-gray-400">
                                {selectedCustomerId && customers.find(c => c.id === selectedCustomerId)?.customerType === 'trade' 
                                  ? `Kleinhandel: R${product.retailPrice}` 
                                  : `Groothandel: R${product.tradePrice}`}
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
                      <span>Huidige Verkoop</span>
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
                              <p className="text-sm text-gray-500">R{item.price} elk</p>
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
                          <Label htmlFor="customer" className="text-white">Klient (Opsioneel)</Label>
                          <Select 
                            value={selectedCustomerId?.toString() || "none"} 
                            onValueChange={(value) => setSelectedCustomerId(value === "none" ? null : parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kies 'n klient" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Geen klient</SelectItem>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium">{customer.name}</span>
                                      <span className={`text-xs px-1 rounded ${customer.customerType === 'trade' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {customer.customerType === 'trade' ? 'Groothandel' : 'Kleinhandel'}
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
                        </div>

                        <div>
                          <Label htmlFor="payment" className="text-white">Betaalmetode</Label>
                          <Select value={paymentType} onValueChange={setPaymentType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kontant">Kontant</SelectItem>
                              <SelectItem value="kaart">Kaart</SelectItem>
                              <SelectItem value="eft">EFT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-white">Notas (Opsioneel)</Label>
                          <Textarea
                            id="notes"
                            value={saleNotes}
                            onChange={(e) => setSaleNotes(e.target.value)}
                            placeholder="Verkoop notas"
                            rows={2}
                          />
                        </div>

                        {/* Discount Section */}
                        <div>
                          <Label className="text-white">Afslag</Label>
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
                                {percentage === 0 ? "Geen Afslag" : `${percentage}%`}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Tip Option Section */}
                        <div>
                          <Label className="text-white">Fooiopsie</Label>
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
                            <span className="text-sm text-[#ffffff]">
                              {tipOptionEnabled ? 'Fooilyne geaktiveer op kwitansie' : 'Voeg fooiopsie by kwitansie'}
                            </span>
                          </div>
                        </div>

                        {/* Total Section */}
                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between items-center text-lg text-white">
                            <span>Subtotaal:</span>
                            <span>R{calculateSubtotal().toFixed(2)}</span>
                          </div>
                          {discountPercentage > 0 && (
                            <div className="flex justify-between items-center text-lg text-green-400">
                              <span>Afslag ({discountPercentage}%):</span>
                              <span>-R{calculateDiscount().toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xl font-bold border-t pt-2 text-white">
                            <span>Totaal:</span>
                            <span className="text-blue-400">R{calculateTotal()}</span>
                          </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                          onClick={() => checkoutMutation.mutate()}
                          disabled={currentSale.length === 0 || checkoutMutation.isPending}
                          className="w-full h-12 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold"
                        >
                          {checkoutMutation.isPending ? "Verwerk..." : (
                            <>
                              <Receipt className="w-4 h-4 mr-2" />
                              Voltooi Verkoop
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="produkte">
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Produkvoorraad</CardTitle>
                  <Button onClick={() => openProductDialog()} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Voeg Produk By
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Soek produkte op naam of SKU..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Product List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {productSearchTerm ? 'Geen produkte gevind wat ooreenstem met jou soektog nie.' : 'Geen produkte beskikbaar nie.'}
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-all">
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{product.name}</h3>
                            <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                          </div>
                          <div className="text-right mr-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">Kosprys: R{product.costPrice}</p>
                              <p className="font-bold text-white">Kleinhandel: R{product.retailPrice}</p>
                              {product.tradePrice && (
                                <p className="text-sm text-blue-400">Groothandel: R{product.tradePrice}</p>
                              )}
                            </div>
                            <p className={`text-sm ${
                              product.quantity <= 5 ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              Voorraad: {product.quantity}
                              {product.quantity <= 5 && (
                                <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">Laag</span>
                              )}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openProductDialog(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="kliente">
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Users className="h-5 w-5 text-[hsl(217,90%,40%)]" />
                    <span>Klientelys</span>
                  </CardTitle>
                  <Button onClick={() => openCustomerDialog()} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Voeg Klient By
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-gray-700/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{customer.name}</h3>
                          <Badge variant={customer.customerType === 'trade' ? 'default' : 'outline'} className="text-xs">
                            {customer.customerType === 'trade' ? 'Groothandel' : 'Kleinhandel'}
                          </Badge>
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
                  ))}
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
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                <CardTitle className="text-white text-xl font-bold">Fakturen & Kwotasies</CardTitle>
                <Button 
                  onClick={() => setIsInvoiceDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                  data-testid="button-create-invoice"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Skep Faktuur/Kwotasie
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Search and Filter Controls */}
                <div className="mb-6 space-y-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
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
                    <Select value={invoiceTypeFilter} onValueChange={(value: any) => setInvoiceTypeFilter(value)}>
                      <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white" data-testid="select-invoice-type-filter">
                        <SelectValue placeholder="Almal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Tipes</SelectItem>
                        <SelectItem value="invoice">Slegs Fakturen</SelectItem>
                        <SelectItem value="quote">Slegs Kwotasies</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={invoiceStatusFilter} onValueChange={(value: any) => setInvoiceStatusFilter(value)}>
                      <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-white/10 text-white" data-testid="select-invoice-status-filter">
                        <SelectValue placeholder="Alle Statusse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Statusse</SelectItem>
                        <SelectItem value="draft">Konsep</SelectItem>
                        <SelectItem value="sent">Gestuur</SelectItem>
                        <SelectItem value="paid">Betaal</SelectItem>
                        <SelectItem value="cancelled">Gekanselleer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 items-end">
                    <div className="flex-1 flex gap-3">
                      <div className="flex-1">
                        <Label className="text-gray-300 text-sm mb-1 block">Van Datum</Label>
                        <Input
                          type="date"
                          value={invoiceDateFrom}
                          onChange={(e) => setInvoiceDateFrom(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
                          data-testid="input-invoice-date-from"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-gray-300 text-sm mb-1 block">Tot Datum</Label>
                        <Input
                          type="date"
                          value={invoiceDateTo}
                          onChange={(e) => setInvoiceDateTo(e.target.value)}
                          className="bg-white/5 border-white/10 text-white"
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
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 whitespace-nowrap"
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
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsInvoiceViewOpen(true);
                        }}
                        data-testid={`invoice-card-${invoice.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge 
                                variant={invoice.documentType === 'invoice' ? 'default' : 'outline'}
                                className={invoice.documentType === 'invoice' 
                                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/30' 
                                  : 'bg-purple-600/20 text-purple-300 border-purple-500/30'
                                }
                              >
                                {invoice.documentType === 'invoice' ? 'Faktuur' : 'Kwotasie'}
                              </Badge>
                              <span className="text-white font-semibold">{invoice.documentNumber}</span>
                              <Badge 
                                variant="outline"
                                className={
                                  invoice.status === 'paid' ? 'bg-green-600/20 text-green-300 border-green-500/30' :
                                  invoice.status === 'sent' ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-gray-600/20 text-gray-300 border-gray-500/30'
                                }
                              >
                                {invoice.status === 'draft' ? 'Konsep' : 
                                 invoice.status === 'sent' ? 'Gestuur' : 
                                 invoice.status === 'paid' ? 'Betaal' : 
                                 invoice.status === 'cancelled' ? 'Gekanselleer' : invoice.status}
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm">
                              Kliënt: {customers.find(c => c.id === invoice.clientId)?.name || invoice.clientName || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Vervaldatum: {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold text-lg">
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
          <TabsContent value="oop-rekeninge">
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <FileText className="h-5 w-5 text-[hsl(217,90%,40%)]" />
                  <span>Oop Rekeninge</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {openAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-gray-700/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{account.accountName}</h3>
                          <Badge variant={account.accountType === 'table' ? 'default' : 'outline'} className="text-xs">
                            {account.accountType === 'table' ? 'Tafel' : 'Klient'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          Totaal: R{account.total} • Items: {Array.isArray(account.items) ? account.items.length : 0}
                        </p>
                        {account.notes && <p className="text-sm text-gray-400 italic">{account.notes}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOpenAccount(account)}
                        >
                          <Eye className="h-4 w-4" />
                          Bekyk
                        </Button>
                      </div>
                    </div>
                  ))}
                  {openAccounts.length === 0 && (
                    <p className="text-center text-gray-400 py-8">Geen oop rekeninge nie</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="verslae">
            <div className="space-y-6">
              {/* Date Filter */}
              <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                    Verkope Analise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="date-filter" className="text-white">Kies Datum:</Label>
                      <Input
                        id="date-filter"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-auto"
                      />
                      <Label htmlFor="staff-filter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#ffffff]">Filter volgens Personeel:</Label>
                      <Select value={selectedStaffFilter.toString()} onValueChange={(value) => setSelectedStaffFilter(value === "all" ? "all" : parseInt(value))}>
                        <SelectTrigger className="w-48">
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
                    </div>
                    <Button
                      onClick={() => handlePrintReport()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Druk
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
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                            <span className="text-sm font-medium text-gray-300">Totale Omset</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-400">R{totalRevenue.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                            <span className="text-sm font-medium text-gray-300">Totale Wins</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-400">R{totalProfit.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                            <span className="text-sm font-medium text-gray-300">Transaksies</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-400">{totalTransactions}</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                            <span className="text-sm font-medium text-gray-300">Gem. Transaksie</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-400">R{avgTransactionValue.toFixed(2)}</div>
                        </CardContent>
                      </Card>
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
                            dateFilteredSales.map((sale) => (
                              <div key={sale.id} className={`flex items-center justify-between p-3 border rounded-lg ${sale.isVoided ? 'bg-red-50 border-red-200' : ''}`}>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${sale.isVoided ? 'line-through text-red-600' : ''}`}>
                                      Verkoop #{sale.id}
                                    </span>
                                    {sale.isVoided && (
                                      <Badge variant="destructive" className="text-xs">
                                        Gekanselleer
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {new Date(sale.createdAt).toLocaleString('af-ZA')} • {sale.paymentType === 'kontant' ? 'Kontant' : sale.paymentType === 'kaart' ? 'Kaart' : sale.paymentType === 'eft' ? 'EFT' : sale.paymentType}
                                    {sale.customerName && ` • ${sale.customerName}`}
                                    {sale.staffAccount ? ` • Bedien deur: ${sale.staffAccount.username}` : ' • Bedien deur: Bestuur'}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Items: {Array.isArray(sale.items) ? sale.items.length : 0}
                                    {sale.notes && ` • Nota: ${sale.notes}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${sale.isVoided ? 'line-through text-red-600' : 'text-[hsl(217,90%,40%)]'}`}>
                                    R{sale.total}
                                  </span>
                                  {sale.isVoided ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setViewVoidDialog({ open: true, sale })}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  ) : currentStaff?.userType === 'management' && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => setVoidSaleDialog({ open: true, sale })}
                                    >
                                      Kanselleer
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
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

              // Calculate Storm fee (0.5% of revenue) - but show R0.00 during trial
              const stormFee = isInTrial ? 0 : currentMonthRevenue * 0.005;

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
                  <div className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Gebruik & Fakturering</h2>
                        <p className="text-blue-100 mt-1">{formatMonthYear(now)} faktuurperiode</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">R{stormFee.toFixed(2)}</div>
                        <div className="text-blue-100 text-sm">Bedrag verskuldig aan Storm</div>
                        <Button
                          onClick={() => setIsBankDetailsOpen(true)}
                          variant="outline"
                          size="sm"
                          className="mt-3 bg-blue-500/20 border-blue-300 text-white hover:bg-blue-600 hover:border-blue-400 shadow-sm backdrop-blur-sm"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
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
                        <div className="text-sm text-gray-400 mt-1">
                          0.5% van maandelikse omset
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
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Bruto Omset</span>
                            <span className="font-semibold">R{currentMonthRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Storm Dienskoers</span>
                            <span className="font-semibold">0.5%</span>
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Bedrag Verskuldig aan Storm</span>
                              <span className="text-xl font-bold text-[hsl(217,90%,40%)]">R{stormFee.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Maandelikse Fakturering</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                Storm POS hef 0.5% van jou maandelikse omset vir die gebruik van ons platform. 
                                Betaling word outomaties bereken en is verskuldig aan die einde van elke maand.
                              </p>
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
                  <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Receipt className="w-5 h-5" />
                        Betaalinligting
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Hoe Fakturering Werk</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rounded-full mt-2"></div>
                                Maandelikse faktureringssiklus: 1ste tot laaste dag van maand
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rounded-full mt-2"></div>
                                Diensfooi: 0.5% van bruto maandelikse omset
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rounded-full mt-2"></div>
                                Betaling verskuldig: Einde van elke maand
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rounded-full mt-2"></div>
                                Geen opstellingsfooi of versteekte koste nie
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Kontak & Ondersteuning</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>Vrae oor jou fakturering?</p>
                              <p className="font-medium text-[hsl(217,90%,40%)]">
                                E-pos: softwarebystorm@gmail.com
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>

        {/* All dialogs and modals would go here - Product Dialog, Customer Dialog, etc. */}
        {/* For brevity, I'm including the key ones */}

        {/* Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Redigeer Produk" : "Voeg Nuwe Produk By"}
              </DialogTitle>
            </DialogHeader>
            <Form {...productForm}>
              <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                <FormField
                  control={productForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="bv. KOFFIE001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produknaam</FormLabel>
                      <FormControl>
                        <Input placeholder="bv. Espresso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={productForm.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kosprys</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
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
                        <FormLabel>Kleinhandelprys</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={productForm.control}
                    name="tradePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groothandelprys (Opsioneel)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
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
                        <FormLabel>Hoeveelheid</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                    Kanselleer
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending ? 'Stoor...' : (editingProduct ? 'Bywerk' : 'Skep')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Customer Dialog */}
        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
          <DialogContent className="sm:max-w-md">
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

        {/* Management Password Dialog */}
        <Dialog open={managementPasswordDialog} onOpenChange={setManagementPasswordDialog}>
          <DialogContent className="sm:max-w-[400px]">
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

        {/* Logo Upload Dialog */}
        <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
          <DialogContent className="sm:max-w-md">
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
                  onChange={handleFileUpload}
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
          setCurrentUser={setCurrentUser}
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
          }}
        />

        {/* Void Sale Dialog */}
        <Dialog open={voidSaleDialog.open} onOpenChange={(open) => {
          if (!open) {
            setVoidSaleDialog({ open: false, sale: null });
            setVoidReason("");
          }
        }}>
          <DialogContent className="sm:max-w-md">
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
          <DialogContent className="sm:max-w-md">
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
          <DialogContent className="sm:max-w-md">
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
          <DialogContent className="sm:max-w-md">
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
                <div>
                  <Label htmlFor="create-management-password">Bestuurswagwoord</Label>
                  <Input
                    id="create-management-password"
                    name="management-password"
                    type="password"
                    placeholder="Vereis vir bestuurrol"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Slegs nodig indien 'n bestuurder geskep word</p>
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

        {/* User Management Dialog */}
        <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {staffAccounts.length === 0 ? "Skep Jou Eerste Personeelrekening" : "Gebruikersbestuur"}
              </DialogTitle>
              <DialogDescription>
                {staffAccounts.length === 0 
                  ? "Stel jou eerste personeelrekening op om die personeelbestuurstelsel te begin gebruik."
                  : "Bestuur personeelrekeninge en toestemmings."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Create New Staff Account */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Voeg Nuwe Personeelrekening By</h3>
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
                      <Label htmlFor="new-username">Gebruikersnaam</Label>
                      <Input
                        id="new-username"
                        name="new-username"
                        type="text"
                        required
                        placeholder="Voer gebruikersnaam in"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Wagwoord</Label>
                      <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                        required
                        placeholder="Voer wagwoord in"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="user-type">Gebruikertipe</Label>
                      <Select name="user-type" required defaultValue={staffAccounts.length === 0 ? "management" : undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder={staffAccounts.length === 0 ? "Bestuur (Verstekk)" : "Kies gebruikertipe"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Personeel</SelectItem>
                          <SelectItem value="management">Bestuur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="management-password">Bestuurswagwoord (indien nodig)</Label>
                      <Input
                        id="management-password"
                        name="management-password"
                        type="password"
                        placeholder="Vereis vir bestuursrekeninge"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={createStaffAccountMutation.isPending}
                    className="w-full"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {createStaffAccountMutation.isPending ? "Skep..." : "Skep Personeelrekening"}
                  </Button>
                </form>
              </div>

              {/* Existing Staff Accounts */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Bestaande Personeelrekeninge</h3>
                <div className="space-y-2">
                  {staffAccounts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nog geen personeelrekeninge geskep nie.</p>
                  ) : (
                    staffAccounts.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{staff.username}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {staff.userType === 'management' ? 'Bestuur' : 'Personeel'} • {staff.isActive ? 'Aktief' : 'Onaktief'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={staff.userType === 'management' ? 'default' : 'secondary'}>
                            {staff.userType === 'management' ? 'Bestuur' : 'Personeel'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Is jy seker jy wil ${staff.username} verwyder?`)) {
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

        {/* Bank Details Dialog - Afrikaans */}
        <Dialog open={isBankDetailsOpen} onOpenChange={setIsBankDetailsOpen}>
          <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                Betalingsbesonderhede
              </DialogTitle>
              <DialogDescription>
                Bankrekeningbesonderhede vir Storm POS diensfooi betalings
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
                    <h3 className="font-semibold text-gray-900">Nedbank Rekening</h3>
                    <p className="text-sm text-gray-600">Vir Storm POS diensfooi betalings</p>
                  </div>
                </div>
                
                <div className="grid gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-200 last:border-0">
                    <span className="text-sm font-medium text-gray-600">Rekeninghouer</span>
                    <span className="font-semibold text-gray-900">Storm</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-200 last:border-0">
                    <span className="text-sm font-medium text-gray-600">Rekeningnommer</span>
                    <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded">1229368612</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-200 last:border-0">
                    <span className="text-sm font-medium text-gray-600">Rekeningtipe</span>
                    <span className="font-semibold text-gray-900">Lopende Rekening</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-200 last:border-0">
                    <span className="text-sm font-medium text-gray-600">Banknaam</span>
                    <span className="font-semibold text-gray-900">Nedbank</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 py-3">
                    <span className="text-sm font-medium text-gray-600">Takkode</span>
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
                    <h4 className="font-medium text-amber-900 mb-2">Betalingsinstruksies</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Gebruik jou geregistreerde besigheidsnaam as betalingsverwysing</li>
                      <li>• Betaal maandelikse diensfooie teen die laaste dag van elke maand</li>
                      <li>• Hou bewys van betaling vir jou rekords</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="text-center text-sm text-gray-600">
                <p>Vrae oor fakturering of betalings?</p>
                <p className="font-medium text-[hsl(217,90%,40%)] mt-1">
                  E-pos: softwarebystorm@gmail.com
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setIsBankDetailsOpen(false)} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]">
                Sluit
              </Button>
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
              setIsCustomClient(false);
              setInvoiceDueDate("");
              setInvoiceNotes("");
              setInvoicePoNumber("");
              setInvoiceDueTerms("7 dae");
              setInvoiceDiscountPercent("0");
              setInvoiceShippingAmount("0");
              setInvoicePaymentMethod("");
              setInvoiceTerms("");
              setInvoiceType('invoice');
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? 'Wysig' : 'Skep'} {invoiceType === 'invoice' ? 'Faktuur' : 'Kwotasie'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Document Type Selection */}
              <div>
                <Label>Dokumenttipe</Label>
                <Select 
                  value={invoiceType} 
                  onValueChange={(value: 'invoice' | 'quote') => setInvoiceType(value)}
                  disabled={!!editingInvoice}
                >
                  <SelectTrigger disabled={!!editingInvoice}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Faktuur</SelectItem>
                    <SelectItem value="quote">Kwotasie</SelectItem>
                  </SelectContent>
                </Select>
                {editingInvoice && (
                  <p className="text-xs text-gray-500 mt-1">Dokumenttipe kan nie verander word wanneer jy wysig nie</p>
                )}
              </div>

              {/* Client Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Kliënt</Label>
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
                    {isCustomClient ? "Kies uit lys" : "Voer pasgemaakte kliënt in"}
                  </button>
                </div>
                {isCustomClient ? (
                  <Input
                    type="text"
                    value={invoiceCustomClient}
                    onChange={(e) => setInvoiceCustomClient(e.target.value)}
                    placeholder="Voer kliëntnaam in"
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
                      <SelectValue placeholder="Kies kliënt" />
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
                <Label>PO Nommer (Opsioneel)</Label>
                <input
                  type="text"
                  value={invoicePoNumber}
                  onChange={(e) => setInvoicePoNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Aankooporder nommer"
                />
              </div>

              {/* Payment Terms */}
              <div>
                <Label>Betalingsvoorwaardes</Label>
                <Select value={invoiceDueTerms} onValueChange={setInvoiceDueTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7 dae">7 Dae</SelectItem>
                    <SelectItem value="14 dae">14 Dae</SelectItem>
                    <SelectItem value="30 dae">30 Dae</SelectItem>
                    <SelectItem value="60 dae">60 Dae</SelectItem>
                    <SelectItem value="90 dae">90 Dae</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div>
                <Label>Vervaldatum</Label>
                <input
                  type="date"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Line Items */}
              <div>
                <Label>Lynitemme</Label>
                <div className="space-y-2 mt-2">
                  {invoiceItems.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1">
                          <span className="font-medium">{product?.name}</span>
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
                  
                  {/* Add Line Item */}
                  <div className="grid grid-cols-3 gap-2">
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
                        <SelectValue placeholder="Kies produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - R{product.retailPrice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="col-span-2">
                      + Voeg Produk By
                    </Button>
                  </div>
                  
                  {/* Totals */}
                  {invoiceItems.length > 0 && (
                    <div className="border-t pt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotaal:</span>
                        <span>R{invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                      </div>
                      
                      {/* Discount Input */}
                      <div className="flex justify-between items-center text-sm">
                        <span>Afslag (%):</span>
                        <input
                          type="number"
                          value={invoiceDiscountPercent}
                          onChange={(e) => setInvoiceDiscountPercent(e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-right"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                      {parseFloat(invoiceDiscountPercent) > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Afslag Bedrag:</span>
                          <span>-R{(invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (parseFloat(invoiceDiscountPercent) / 100)).toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span>BTW (15%):</span>
                        <span>R{((invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 - parseFloat(invoiceDiscountPercent) / 100)) * 0.15).toFixed(2)}</span>
                      </div>
                      
                      {/* Shipping Input */}
                      <div className="flex justify-between items-center text-sm">
                        <span>Versending:</span>
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
                        <span>Totaal:</span>
                        <span>R{(() => {
                          const subtotal = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                          const discount = subtotal * (parseFloat(invoiceDiscountPercent) / 100);
                          const afterDiscount = subtotal - discount;
                          const tax = afterDiscount * 0.15;
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
                <Label>Betaalmetode (Opsioneel)</Label>
                <Select value={invoicePaymentMethod} onValueChange={setInvoicePaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies betaalmetode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kontant">Kontant</SelectItem>
                    <SelectItem value="Kaart">Kaart</SelectItem>
                    <SelectItem value="EFT">EFT</SelectItem>
                    <SelectItem value="Ander">Ander</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label>Notas (Opsioneel)</Label>
                <textarea
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Addisionele notas..."
                />
              </div>

              {/* Terms & Conditions */}
              <div>
                <Label>Terme & Voorwaardes (Opsioneel)</Label>
                <textarea
                  value={invoiceTerms}
                  onChange={(e) => setInvoiceTerms(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Voer betalingsvoorwaardes en -terme in..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                  Kanselleer
                </Button>
                <Button 
                  onClick={() => {
                    const trimmedCustomClient = invoiceCustomClient.trim();
                    
                    if (isCustomClient) {
                      if (!trimmedCustomClient || !invoiceDueDate) {
                        toast({
                          title: "Ontbrekende Inligting",
                          description: "Voer asseblief 'n kliëntnaam en vervaldatum in",
                          variant: "destructive"
                        });
                        return;
                      }
                    } else {
                      if (!invoiceClientId || !invoiceDueDate) {
                        toast({
                          title: "Ontbrekende Inligting",
                          description: "Kies asseblief 'n kliënt en vervaldatum",
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
                    const discountPercent = parseFloat(invoiceDiscountPercent) || 0;
                    const discountAmount = subtotal * (discountPercent / 100);
                    const afterDiscount = subtotal - discountAmount;
                    const taxAmount = afterDiscount * 0.15;
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
                      title: `${invoiceType === 'invoice' ? 'Faktuur' : 'Kwotasie'} vir ${clientName}`,
                      poNumber: invoicePoNumber || undefined,
                      dueTerms: invoiceDueTerms,
                      dueDate: invoiceDueDate,
                      items: invoiceItems.map(item => ({
                        productId: item.productId,
                        name: products.find(p => p.id === item.productId)?.name || '',
                        quantity: item.quantity,
                        price: parseFloat(item.price.toFixed(2)),
                        lineTotal: parseFloat((item.price * item.quantity).toFixed(2))
                      })),
                      subtotal: parseFloat(subtotal.toFixed(2)),
                      discountPercent: parseFloat(discountPercent.toFixed(2)),
                      taxPercent: 15.00,
                      tax: parseFloat(taxAmount.toFixed(2)),
                      shippingAmount: parseFloat(shipping.toFixed(2)),
                      total: parseFloat(total.toFixed(2)),
                      paymentMethod: invoicePaymentMethod || undefined,
                      notes: invoiceNotes || undefined,
                      terms: invoiceTerms || undefined
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice Detail/View Modal */}
        <Dialog open={isInvoiceViewOpen} onOpenChange={setIsInvoiceViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedInvoice && (
              <>
                <DialogHeader className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-2xl text-[hsl(217,90%,40%)]">
                        {selectedInvoice.documentNumber}
                      </DialogTitle>
                      <p className="text-sm text-gray-500 mt-1">{selectedInvoice.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={selectedInvoice.documentType === 'invoice' ? 'default' : 'outline'}
                        className={selectedInvoice.documentType === 'invoice' 
                          ? 'bg-[hsl(217,90%,40%)] text-white' 
                          : 'text-purple-600 border-purple-300'
                        }
                      >
                        {selectedInvoice.documentType === 'invoice' ? 'FAKTUUR' : 'KWOTASIE'}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={
                          selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700 border-green-300' :
                          selectedInvoice.status === 'sent' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                          selectedInvoice.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                          'bg-gray-100 text-gray-700 border-gray-300'
                        }
                      >
                        {selectedInvoice.status === 'draft' ? 'KONSEP' : 
                         selectedInvoice.status === 'sent' ? 'GESTUUR' : 
                         selectedInvoice.status === 'paid' ? 'BETAAL' : 
                         selectedInvoice.status === 'cancelled' ? 'GEKANSELLEER' : selectedInvoice.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Document Info Grid */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-xs text-gray-500">Kliënt</Label>
                      <p className="font-medium">{customers.find(c => c.id === selectedInvoice.clientId)?.name || selectedInvoice.clientName || 'N/A'}</p>
                    </div>
                    {selectedInvoice.poNumber && (
                      <div>
                        <Label className="text-xs text-gray-500">PO Nommer</Label>
                        <p className="font-medium">{selectedInvoice.poNumber}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-gray-500">Datum Geskep</Label>
                      <p className="font-medium">{new Date(selectedInvoice.createdDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Vervaldatum</Label>
                      <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Betalingsvoorwaardes</Label>
                      <p className="font-medium">{selectedInvoice.dueTerms || '7 dae'}</p>
                    </div>
                    {selectedInvoice.paymentMethod && (
                      <div>
                        <Label className="text-xs text-gray-500">Betaalmetode</Label>
                        <p className="font-medium">{selectedInvoice.paymentMethod}</p>
                      </div>
                    )}
                  </div>

                  {/* Line Items Table */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Lynitemme</Label>
                    <div className="border rounded-lg overflow-hidden">
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
                  <div className="border-t border-gray-200 pt-4">
                    <div className="max-w-xs ml-auto space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotaal:</span>
                        <span className="font-medium">R{typeof selectedInvoice.subtotal === 'number' ? selectedInvoice.subtotal.toFixed(2) : selectedInvoice.subtotal}</span>
                      </div>
                      {parseFloat(selectedInvoice.discountPercent || '0') > 0 && (
                        <div className="flex justify-between text-sm text-red-600">
                          <span>Afslag ({selectedInvoice.discountPercent}%):</span>
                          <span>-R{(parseFloat(selectedInvoice.subtotal) * (parseFloat(selectedInvoice.discountPercent) / 100)).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">BTW (15%):</span>
                        <span className="font-medium">R{typeof selectedInvoice.tax === 'number' ? selectedInvoice.tax.toFixed(2) : selectedInvoice.tax}</span>
                      </div>
                      {parseFloat(selectedInvoice.shippingAmount || '0') > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Versending:</span>
                          <span className="font-medium">R{typeof selectedInvoice.shippingAmount === 'number' ? selectedInvoice.shippingAmount.toFixed(2) : selectedInvoice.shippingAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span>Totaal:</span>
                        <span className="text-[hsl(217,90%,40%)]">R{typeof selectedInvoice.total === 'number' ? selectedInvoice.total.toFixed(2) : selectedInvoice.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Terms */}
                  {(selectedInvoice.notes || selectedInvoice.terms) && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                      {selectedInvoice.notes && (
                        <div>
                          <Label className="text-sm font-semibold mb-2 block">Notas</Label>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedInvoice.notes}</p>
                        </div>
                      )}
                      {selectedInvoice.terms && (
                        <div>
                          <Label className="text-sm font-semibold mb-2 block">Terme & Voorwaardes</Label>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">{selectedInvoice.terms}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
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
                          setInvoiceDueTerms(selectedInvoice.dueTerms || '7 dae');
                          setInvoiceDiscountPercent(parseFloat(selectedInvoice.discountPercent || '0').toString());
                          setInvoiceShippingAmount(parseFloat(selectedInvoice.shippingAmount || '0').toString());
                          setInvoicePaymentMethod(selectedInvoice.paymentMethod || '');
                          setInvoiceTerms(selectedInvoice.terms || '');
                          
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
                      Wysig
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700" 
                      data-testid="button-delete-invoice"
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
                      data-testid="button-change-status"
                      onClick={() => {
                        setNewStatus(selectedInvoice?.status || 'draft');
                        setIsStatusChangeDialogOpen(true);
                      }}
                    >
                      Verander Status
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                      data-testid="button-export-pdf"
                      onClick={() => generateInvoicePDF(selectedInvoice)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Eksporteer PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsInvoiceViewOpen(false)}>
                      Sluit
                    </Button>
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
      </div>
    </div>
  );
}