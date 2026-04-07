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
import { apiRequest, apiFetch } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPosProductSchema, insertPosCustomerSchema, insertPosOpenAccountSchema, defaultReceiptSettings, type InsertPosProduct, type PosProduct, type PosCustomer, type PosOpenAccount, type InsertPosOpenAccount, type PosCategory, type InsertPosCategory } from "@shared/schema";
import { z } from "zod";
import {
  ShoppingCart, Package, Users, ChartBar as BarChart3, Plus, Minus, Trash as Trash2,
  CreditCard, CurrencyDollar as DollarSign, Receipt, MagnifyingGlass as Search,
  SignOut as LogOut, NotePencil as Edit, PlusCircle,
  Calendar, TrendUp as TrendingUp, FileText, Clock, Eye, EyeSlash as EyeOff,
  DownloadSimple as Download, User, UserPlus, GearSix as Settings, X, Printer,
  CaretDown as ChevronDown, CaretRight as ChevronRight, Globe, BookOpen,
  Question as HelpCircle, ShareNetwork as Share2, UploadSimple as Upload,
  Table as FileSpreadsheet, ArrowClockwise as RefreshCw, Link as Link2, Check, List as Menu,
  Warning as AlertTriangle, XCircle, Tag, Hash, Lock, Folder, FolderSimplePlus as FolderPlus,
  GridNine as Grid3X3, ListBullets as LayoutList, CaretLeft as ChevronLeft,
  Palette, ClipboardText as ClipboardList, Sliders as SlidersHorizontal,
  CheckCircle as CheckCircle2, Buildings as Building2, CircleNotch as Loader2,
  Bell, ListChecks, Moon, Sun, Copy, Envelope as Mail
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
    const res = await apiFetch('/api/pos/pdf-temp', {
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

// Detect Tauri Android via both the internals flag AND the user-agent string.
// maxTouchPoints can be 0 on some Android devices (e.g. foldables / tablets with mouse),
// so userAgent is a more reliable second signal.
const isTauriAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hasTauri = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
  const isAndroid = /android/i.test(navigator.userAgent);
  return hasTauri && isAndroid;
};

const isAnyMobile = (): boolean =>
  /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

// ─── Android: open the native Share Sheet with the PDF ────────────────────
// tauri-plugin-fs cannot write to the public Downloads directory on Android.
// The Android Share Sheet lets the user tap "Save to Files" to move the PDF
// to Downloads, or send it directly to WhatsApp / Gmail / etc.
// ─── downloadPdfAndroid ─────────────────────────────────────────────────────
// Saves the PDF directly to the device's public Downloads folder so it appears
// in the Files app under Downloads/StormPOS/.  Uses the same arraybuffer→base64
// IPC chunked path to write the PDF to app cache, then calls pdf_save_to_downloads
// which uses Android MediaStore (tauri-plugin-android-fs) to move it to public
// Downloads.  MediaStore requires no special permission on Android 10+.
async function downloadPdfAndroid(doc: any, fileName: string): Promise<'saved' | 'failed'> {
  const { invoke } = await import('@tauri-apps/api/core');

  const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
  const u8 = new Uint8Array(arrayBuffer);
  if (u8.length === 0) {
    console.error('[PDF] 0 bytes — jsPDF generation failed');
    return 'failed';
  }
  console.log(`[PDF] download: ${u8.length} bytes`);

  // Convert Uint8Array → base64 in 8 KB slices (stack-safe on Android WebView).
  let binary = '';
  const BIN_CHUNK = 8192;
  for (let i = 0; i < u8.length; i += BIN_CHUNK) {
    binary += String.fromCharCode.apply(null, Array.from(u8.slice(i, i + BIN_CHUNK)));
  }
  const base64 = btoa(binary);

  try {
    // Send in 30 KB IPC chunks (conservative — safe for any Android postMessage limit).
    const CHUNK = 30000;
    for (let i = 0; i < base64.length; i += CHUNK) {
      await invoke<void>('pdf_write_chunk', {
        filename: fileName,
        chunk: base64.slice(i, i + CHUNK),
        append: i > 0,
      });
    }
    await invoke<string>('pdf_finalize', { filename: fileName });

    // Copy from cache → public Downloads via Android MediaStore.
    const savedPath = await invoke<string>('pdf_save_to_downloads', { filename: fileName });
    console.log(`[PDF] saved to: ${savedPath}`);
    return 'saved';
  } catch (e: any) {
    console.error('[PDF] download to Downloads failed:', e);
    return 'failed';
  }
}

// ─── Android: PDF → base64 → Rust (chunked) → FileProvider → Share Sheet ─
//
// LAYER 1 — Binary Integrity
//   Use doc.output('arraybuffer') — confirmed most reliable on Android WebView.
//   doc.output('blob') is inconsistent across WebView builds; Blob constructor
//   behaviour varies by Android version. ArrayBuffer is always binary-safe.
//   Convert Uint8Array → base64 in 8 KB passes (String.fromCharCode.apply has a
//   stack limit — chunking it avoids "Maximum call stack size exceeded").
//   Verify the byte count before sending; throw early if jsPDF silently failed.
//
// LAYER 2 — Storage Location
//   Rust writes to app_cache_dir() which maps to getCacheDir()/{bundleId}/.
//   This is exactly the path exposed by our FileProvider, giving WhatsApp
//   temporary read access via a content:// URI without any extra permissions.
//
// LAYER 3 — URI Bridge
//   pdf_finalize returns an absolute path. We prepend file:// so tauri-plugin-
//   sharekit can strip it, instantiate a java.io.File, and call
//   FileProvider.getUriForFile(ctx, "${packageName}.fileprovider", file).
//   The resulting content:// URI is placed in the Intent with
//   FLAG_GRANT_READ_URI_PERMISSION so WhatsApp can read it immediately.
//   MIME type is explicitly set to "application/pdf" — not guessed from extension.
async function sharePdfAndroid(doc: any, fileName: string): Promise<void> {
  // Get PDF bytes — arraybuffer is the most reliable jsPDF output on Android WebView.
  const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
  const u8 = new Uint8Array(arrayBuffer);

  if (u8.length === 0) {
    throw new Error('PDF is 0 bytes — jsPDF generation failed silently on this device');
  }
  console.log(`[PDF] ${u8.length} bytes ready`);

  // ── PRIMARY PATH: navigator.share with Blob ─────────────────────────────────
  // Tauri's Android WebView is Chromium-based. Chrome handles navigator.share
  // with File objects natively — it writes the blob to a temp file and wraps it
  // in its OWN internal FileProvider, so no custom FileProvider config is needed.
  // This is the simplest, most reliable approach for Android PDF sharing.
  try {
    const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [pdfFile] })) {
      console.log('[PDF] using navigator.share (primary path)');
      await navigator.share({ files: [pdfFile], title: fileName });
      return;
    }
    console.log('[PDF] navigator.canShare returned false — falling back to IPC path');
  } catch (navErr: any) {
    // User may have cancelled the share sheet — propagate AbortError so the
    // caller can detect a cancellation vs a real error.
    if (navErr?.name === 'AbortError') throw navErr;
    console.warn('[PDF] navigator.share failed, trying IPC fallback:', navErr);
  }

  // ── FALLBACK: Rust IPC → cache file → sharekit FileProvider ────────────────
  // Used when navigator.share is unavailable or fails for a non-cancellation
  // reason (e.g. older WebView builds without File sharing support).
  // Chunks are kept at 30 KB (base64) — well inside any Android WebView
  // postMessage size limit and safe for all documented Tauri IPC paths.
  const { invoke } = await import('@tauri-apps/api/core');

  let binary = '';
  const BIN_CHUNK = 8192;
  for (let i = 0; i < u8.length; i += BIN_CHUNK) {
    binary += String.fromCharCode.apply(null, Array.from(u8.slice(i, i + BIN_CHUNK)));
  }
  const base64 = btoa(binary);
  console.log(`[PDF] IPC fallback: ${base64.length} base64 chars`);

  const CHUNK = 30000;
  for (let i = 0; i < base64.length; i += CHUNK) {
    await invoke<void>('pdf_write_chunk', {
      filename: fileName,
      chunk: base64.slice(i, i + CHUNK),
      append: i > 0,
    });
  }

  const path = await invoke<string>('pdf_finalize', { filename: fileName });
  console.log(`[PDF] IPC: written to ${path}`);

  const fileUrl = path.startsWith('file://') ? path : `file://${path}`;
  const { shareFile } = await import('@choochmeque/tauri-plugin-sharekit-api');
  await shareFile(fileUrl, { mimeType: 'application/pdf', title: fileName });
}

// ─── downloadOpenPDF ────────────────────────────────────────────────────────
// Android Tauri : saves to cache → Share Sheet (arraybuffer path, see above).
// Web / Desktop : standard blob <a download> click.
async function downloadOpenPDF(doc: any, fileName: string): Promise<'saved' | 'sheet' | 'blob' | 'failed'> {
  if (isTauriAndroid()) {
    return downloadPdfAndroid(doc, fileName);
  }
  const blob: Blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  a.style.display = 'none'; document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
  return 'blob';
}

// ─── sharePDFViaSheet ───────────────────────────────────────────────────────
// Android Tauri : save to cache → open Android Share Sheet with real PDF file.
// Mobile browser : navigator.share({ files }) — attaches the PDF.
// Desktop        : save PDF locally + open WhatsApp Web (text only).
// NEVER opens WhatsApp Web on a mobile device.
async function sharePDFViaSheet(doc: any, fileName: string, message: string): Promise<'shared' | 'fallback' | 'cancelled'> {
  if (isTauriAndroid()) {
    try {
      await sharePdfAndroid(doc, fileName);
      return 'shared';
    } catch (e: any) {
      const msg = String(e?.message ?? e ?? '').toLowerCase();
      if (msg.includes('cancel') || msg.includes('dismiss') || (e?.name === 'AbortError')) return 'cancelled';
      console.error('[PDF] Android shareFile failed:', e);
      return 'fallback';
    }
  }
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
  // Desktop-only fallback — NEVER run on mobile
  if (!isAnyMobile()) {
    doc.save(fileName);
    setTimeout(() => window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank'), 500);
  } else {
    doc.save(fileName);
  }
  return 'fallback';
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
  const [currentUser, setCurrentUser] = useState<{id: number; email: string; paid: boolean; companyLogo?: string; companyName?: string; tutorialCompleted?: boolean; trialStartDate?: string; receiptSettings?: any; paymentPlan?: string; planSavingAmount?: number | null; preferredLanguage?: string} | null>(null);

  const refreshUserProfile = useCallback(async (userId: number, userEmail: string) => {
    try {
      const res = await apiFetch(`/api/pos/user/${userId}?userEmail=${encodeURIComponent(userEmail)}`);
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
  const [receiptPdfUrl, setReceiptPdfUrl] = useState<string | null>(null);
  const [receiptPdfBlob, setReceiptPdfBlob] = useState<Blob | null>(null);
  const [receiptPdfBusy, setReceiptPdfBusy] = useState(false);
  const [invoicePdfBusy, setInvoicePdfBusy] = useState(false);
  const [openAccountTipEnabled, setOpenAccountTipEnabled] = useState(false);
  const [editingOpenAccount, setEditingOpenAccount] = useState<PosOpenAccount | null>(null);
  const [editOpenAccountName, setEditOpenAccountName] = useState("");
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
  const [isCustomClient, setIsCustomClient] = useState(true);
  const [posTheme, setPosTheme] = useState<'dark' | 'light'>(() => {
    try { const s = localStorage.getItem('posTheme'); return s === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
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
  const [showInvoiceFilters, setShowInvoiceFilters] = useState(false);
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
  const [mobileStaffPickerOpen, setMobileStaffPickerOpen] = useState(false);
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
      const response = await apiFetch(`/api/pos/products?userId=${currentUser.id}`);
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
      const response = await apiFetch(`/api/pos/categories?userId=${currentUser.id}`);
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
      const response = await apiFetch(`/api/pos/customers?userId=${currentUser.id}`);
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
      const response = await apiFetch(`/api/pos/sales?userId=${currentUser.id}`);
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
      const response = await apiFetch(`/api/pos/open-accounts?userId=${currentUser.id}`);
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
      const response = await apiFetch(`/api/pos/staff-accounts?userId=${currentUser.id}`);
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

  // Apply dark/light theme class to document (affects shadcn CSS vars + portaled popups/dialogs)
  useEffect(() => {
    const root = document.documentElement;
    if (posTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    return () => { root.classList.remove('dark'); };
  }, [posTheme]);

  // Fetch invoices
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/pos/invoices", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await apiFetch(`/api/pos/invoices?userId=${currentUser.id}`);
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
      const response = await apiFetch(`/api/pos/purchase-orders?userId=${currentUser.id}`);
      if (!response.ok) throw new Error('Failed to fetch purchase orders');
      return response.json();
    },
    enabled: !!currentUser,
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ["/api/pos/suppliers", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const response = await apiFetch(`/api/pos/suppliers?userId=${currentUser.id}`);
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
      const response = await apiFetch(`/api/pos/saved-payment-details?userId=${currentUser.id}`);
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
      setIsCustomClient(true);
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
      setInvoiceCustomFieldValues(getInvoiceVisDefs());
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
      setIsCustomClient(true);
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
      setInvoiceCustomFieldValues(getInvoiceVisDefs());
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

        // Capture state before clearing - needed for print/share in success dialog
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
        // Refresh user profile so planSavingAmount banner updates immediately
        if (currentUser) refreshUserProfile(currentUser.id, currentUser.email);
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

  const updateOpenAccountNameMutation = useMutation({
    mutationFn: async ({ accountId, accountName }: { accountId: number; accountName: string }) => {
      const response = await apiRequest("PUT", `/api/pos/open-accounts/${accountId}`, { accountName });
      if (!response.ok) throw new Error("Failed to update account name");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Account renamed", description: "Account name updated successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
      setEditingOpenAccount(null);
      setEditOpenAccountName("");
    },
    onError: () => {
      toast({ title: "Failed to rename", description: "Could not update the account name.", variant: "destructive" });
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

  const invoiceCustomFieldDefs = useMemo(() => {
    const settings = mergeReceiptSettings(currentUser?.receiptSettings);
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

  // Reload column prefs when user changes (e.g. after login)
  useEffect(() => {
    if (!currentUser?.id) return;
    try {
      const saved = localStorage.getItem(`invoiceCardCols_${currentUser.id}`);
      if (saved) setInvoiceCardColumns(new Set(JSON.parse(saved)));
    } catch {}
  }, [currentUser?.id]);

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
  const markTutorialMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("No user");
      const res = await apiRequest("PUT", `/api/pos/user/${currentUser.id}/tutorial-complete`, { userEmail: currentUser.email });
      return res.json();
    },
    onSuccess: () => {
      setCurrentUser(prev => prev ? { ...prev, tutorialCompleted: true } : null);
      const stored = JSON.parse(localStorage.getItem("posUser") ?? "{}");
      localStorage.setItem("posUser", JSON.stringify({ ...stored, tutorialCompleted: true }));
      toast({ title: "Setup complete!", description: "Your account is fully configured." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not mark setup as complete.", variant: "destructive" });
    },
  });

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
    localStorage.removeItem('posUser');
    localStorage.removeItem('posLoginTimestamp');
    window.location.href = "/pos/login";
  };

  // PDF Export Function - Professional Invoice/Quote with Business Details
  const generateInvoicePDF = async (invoice: any) => {
  setInvoicePdfBusy(true);
  try {
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
    
    // Document Type heading (left)
    y = companyLogo ? 55 : 25;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(invoice.documentType === 'invoice' ? 'INVOICE' : 'QUOTE', margin, y);
    y += 8;

    // Document Number (left, below heading)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`#${invoice.documentNumber || 'N/A'}`, margin, y);
    y += 7;

    // Business Details - left side, below invoice number
    const showBizInfo = invoice.showBusinessInfo !== false;
    if (showBizInfo) {
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
      if (vatNumber) { doc.text(`VAT: ${vatNumber}`, margin, y); y += 4; }
      if (regNumber) { doc.text(`Reg: ${regNumber}`, margin, y); y += 4; }
    }

    // Blue separator line
    y += 4;
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
    const cfValues: Record<string, any> = (invoice.customFieldValues as any) || {};
    const visOf = (key: string, defaultVal = true) =>
      cfValues[`vis_${key}`] !== undefined ? cfValues[`vis_${key}`] : defaultVal;
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
    // Get invoice custom fields from user's settings
    const invoiceSettings = mergeReceiptSettings(currentUser?.receiptSettings);
    const customFields: any[] = (invoiceSettings as any).invoiceSettings?.customFields || [];

    // Bill To - custom fields for billTo section
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
      if (y > pageHeight - 60) { doc.addPage(); y = 20; }
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
      if (y > pageHeight - 60) {
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
      if (y > pageHeight - 60) {
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
    
    const fileName = `${invoice.documentType}_${invoice.documentNumber}.pdf`;
    const dlResult = await downloadOpenPDF(doc, fileName);

    toast({
      title: dlResult === 'saved' ? "PDF Saved" : dlResult === 'sheet' ? "PDF Ready" : "PDF Generated",
      description: dlResult === 'saved'
        ? `${invoice.documentNumber} saved to Downloads/StormPOS/ — open the Files app to view it`
        : dlResult === 'sheet'
        ? `${invoice.documentNumber} - tap "Save to Files" in the share sheet to keep it`
        : `${invoice.documentNumber} has been downloaded`,
    });
  } catch (err: any) {
    console.error('PDF error:', err);
    toast({
      title: "PDF Error",
      description: "Could not generate PDF. Please try again.",
      variant: "destructive"
    });
  } finally {
    setInvoicePdfBusy(false);
  }
  };

  const shareInvoice = async (invoice: any) => {
    setInvoicePdfBusy(true);
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

    // Document heading (left)
    y = companyLogo ? 55 : 25;
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(invoice.documentType === 'invoice' ? 'INVOICE' : 'QUOTE', margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`#${invoice.documentNumber || 'N/A'}`, margin, y);
    y += 7;

    // Business Details - left side, below invoice number
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
    if (vatNumber) { doc.text(`VAT: ${vatNumber}`, margin, y); y += 4; }
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
    const cfValues: Record<string, any> = (invoice.customFieldValues as any) || {};
    const visOf = (key: string, defaultVal = true) =>
      cfValues[`vis_${key}`] !== undefined ? cfValues[`vis_${key}`] : defaultVal;
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
      if (y > pageHeight - 60) { doc.addPage(); y = 20; }
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
      if (y > pageHeight - 60) { doc.addPage(); y = 20; }
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

    const docType = invoice.documentType === 'invoice' ? 'Invoice' : 'Quote';
    const fileName = `${invoice.documentType}_${invoice.documentNumber}.pdf`;
    const message = `${docType} ${invoice.documentNumber} from ${companyName}. Total: R${typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}`;
    const result = await sharePDFViaSheet(doc, fileName, message);
    setInvoicePdfBusy(false);
    if (result === 'shared') {
      toast({ title: "Shared Successfully", description: `${invoice.documentNumber} has been shared` });
    } else if (result === 'fallback') {
      toast({ title: "PDF Downloaded", description: `${invoice.documentNumber} has been saved` });
    }
  };

  // Pre-generate receipt PDF blob + download URL when sale dialog opens
  useEffect(() => {
    if (!saleCompleteData) { setReceiptPdfUrl(null); setReceiptPdfBlob(null); setReceiptPdfBusy(false); return; }
    setReceiptPdfBusy(true);
    setReceiptPdfUrl(null);
    setReceiptPdfBlob(null);
    const doc = generateReceipt(saleCompleteData.items, saleCompleteData.total, saleCompleteData.customerName, saleCompleteData.notes, saleCompleteData.paymentType, false, undefined, saleCompleteData.staffName, saleCompleteData.tipEnabled, undefined, true);
    if (!doc) { setReceiptPdfBusy(false); return; }
    setReceiptPdfBlob(doc.output('blob') as Blob);
    getTempPdfUrl(doc, `receipt-${saleCompleteData.saleId}.pdf`).then(url => {
      setReceiptPdfUrl(url);
      setReceiptPdfBusy(false);
    }).catch(() => setReceiptPdfBusy(false));
  }, [saleCompleteData]);

  // Single unified Download & Share handler for the sale receipt dialog.
  // Android: opens the native Android Share Sheet so the user can send the PDF
  //          via WhatsApp/email OR tap "Save to Files" to put it in Downloads.
  // Web    : downloads the PDF directly (works perfectly in the browser).
  // Desktop: downloads the PDF AND opens WhatsApp Web for text-sharing.
  const handleDownloadShare = async () => {
    if (!saleCompleteData) return;
    const fileName = `receipt-${saleCompleteData.saleId}.pdf`;
    const companyName = currentUser?.companyName || 'Storm POS';
    const message = `Sales receipt from ${companyName} - R${saleCompleteData.total}`;
    setReceiptPdfBusy(true);
    try {
      if (isTauriAndroid()) {
        // Android: generate doc fresh (arraybuffer path — do NOT use cached blob;
        // doc.output('blob') is unreliable on Android WebView across versions).
        try {
          const doc = generateReceipt(saleCompleteData.items, saleCompleteData.total, saleCompleteData.customerName, saleCompleteData.notes, saleCompleteData.paymentType, false, undefined, saleCompleteData.staffName, saleCompleteData.tipEnabled, undefined, true);
          if (!doc) throw new Error('generateReceipt returned null');
          await sharePdfAndroid(doc, fileName);
        } catch (e) {
          console.error('[PDF] Android share error:', e);
          toast({ title: "Could not open share sheet", description: "Please try again.", variant: "destructive" });
        }
        return;
      }

      // Web / Desktop: use pre-generated blob or regenerate
      const blob: Blob | null = receiptPdfBlob || (() => {
        const doc = generateReceipt(saleCompleteData.items, saleCompleteData.total, saleCompleteData.customerName, saleCompleteData.notes, saleCompleteData.paymentType, false, undefined, saleCompleteData.staffName, saleCompleteData.tipEnabled, undefined, true);
        return doc ? (doc.output('blob') as Blob) : null;
      })();
      if (!blob) return;

      // Web: instant download via pre-generated URL or blob
      const url = receiptPdfUrl || URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = fileName;
      a.style.display = 'none'; document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); if (!receiptPdfUrl) URL.revokeObjectURL(url); }, 200);
      // Desktop web: also open WhatsApp Web for sharing
      if (!isAnyMobile()) {
        setTimeout(() => window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank'), 600);
      }
    } finally {
      setReceiptPdfBusy(false);
    }
  };

  return (
    <div className={`pos-app min-h-screen relative${posTheme === 'dark' ? ' bg-gray-950' : ' bg-slate-50'}`}>

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
            className={`rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden ${posTheme === 'dark' ? 'bg-[#080d1a] border border-white/10' : 'bg-white border border-gray-200'}`}
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
                <h2 className={`text-xl font-bold text-center mb-0.5 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sale Complete</h2>
                <p className="text-gray-500 text-sm text-center mb-5">Transaction processed successfully</p>
              </motion.div>

              {/* Amount summary card */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="bg-[hsl(217,90%,40%)]/10 border border-[hsl(217,90%,40%)]/20 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">Total Charged</p>
                    <p className={`text-3xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>R{saleCompleteData.total}</p>
                    {saleCompleteData.customerName && <p className="text-gray-400 text-xs mt-0.5">{saleCompleteData.customerName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">Method</p>
                    <p className={`text-sm font-semibold capitalize ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{saleCompleteData.paymentType || 'Cash'}</p>
                    <p className="text-gray-500 text-[11px] mt-1">{saleCompleteData.items.length} item{saleCompleteData.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </motion.div>

              {/* Single Download & Share button */}
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-2.5">
                <Button onClick={handleDownloadShare} disabled={receiptPdfBusy} className="w-full h-11 bg-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,45%)] text-white font-semibold rounded-xl transition-all disabled:opacity-60">
                  {receiptPdfBusy ? <Loader2 className="w-4 h-4 mr-2 shrink-0 animate-spin" /> : <Share2 className="w-4 h-4 mr-2 shrink-0" />}
                  {receiptPdfBusy ? 'Preparing...' : 'Download & Share'}
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
            <div className={`relative rounded-xl md:rounded-2xl px-4 py-3 md:px-8 md:py-5 shadow-2xl shadow-blue-900/40 md:min-w-[320px] overflow-hidden ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl border border-gray-600/50' : 'bg-white border border-gray-200'}`}>
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
                { id: 'usage', label: 'Billing', icon: CreditCard },
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
            <div className="p-3 border-t border-gray-100 space-y-1 sidebar-bottom-safe">
              {/* User switcher button */}
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
                  <span className="text-xs text-gray-400 leading-tight block">Logged in as</span>
                  <span className="text-sm font-semibold text-gray-900 leading-tight truncate block">{currentStaff ? currentStaff.username : 'Select User'}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${mobileStaffPickerOpen ? 'rotate-180' : ''}`} />
              </button>
              {/* Staff list */}
              {mobileStaffPickerOpen && (
                <div className="mx-1 mb-1 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  {staffAccounts.length === 0 ? (
                    <p className="text-xs text-gray-400 px-3 py-2.5">No staff accounts added yet.</p>
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
                            <span className="text-[10px] text-gray-400 capitalize">{staff.userType}</span>
                          </div>
                          {isCurrent && <Check className="h-3.5 w-3.5 text-[hsl(217,90%,40%)] flex-shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
              {/* Add New User - mobile (only management or no staff yet) */}
              {(currentStaff?.userType === 'management' || staffAccounts.length === 0) && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setMobileStaffPickerOpen(false); setIsUserManagementOpen(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[hsl(217,90%,40%)]/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(217,90%,40%)]/15 flex-shrink-0">
                    <UserPlus className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(217,90%,50%)]">Add New User</span>
                </button>
              )}
              {/* Notification bell */}
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
                <span>Notifications</span>
              </button>
              {/* Logout */}
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsLogoutDialogOpen(true); }}
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
      {/* Notification Panel Overlay */}
      {notifOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setNotifOpen(false)}>
          <div
            className="fixed top-4 left-4 right-4 md:top-auto md:bottom-32 md:left-72 md:right-auto md:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                <p className="font-semibold text-gray-900 text-sm">Notifications</p>
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
                    <p className="text-sm font-semibold text-gray-900">Complete your account setup</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">Upload your logo, add your first product, and more.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1 group-hover:text-[hsl(217,90%,40%)] transition-colors" />
                </button>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <p className="text-sm font-medium text-gray-700">All caught up!</p>
                  <p className="text-xs text-gray-400">Your account is fully configured.</p>
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
          <div className="px-3 py-2 space-y-1">
            <button
              onClick={() => setNotifOpen(o => !o)}
              title={sidebarCollapsed ? "Notifications" : undefined}
              className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Bell className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Notifications</span>}
              {!currentUser?.tutorialCompleted && (
                <span className={`${sidebarCollapsed ? 'absolute top-1.5 right-1.5' : 'ml-auto'} w-5 h-5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none flex-shrink-0`}>1</span>
              )}
            </button>
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
                  <div className={`px-4 py-3 border-b ${posTheme === 'dark' ? 'bg-gradient-to-r from-[hsl(217,30%,18%)] to-[hsl(217,30%,15%)] border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}>
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
                    <div className={`p-2 border-t ${posTheme === 'dark' ? 'border-gray-700/50 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
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
          <div className="md:hidden flex items-center gap-3 px-3 pb-3 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm mobile-header-safe">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 touch-action-manipulation">
              <Menu className="h-6 w-6" />
            </button>
            <img src={stormLogo} alt="Storm POS" className="h-8 w-auto" />
            <div className="ml-auto flex items-center gap-2">
              <span className="text-gray-900 text-sm font-semibold capitalize">{currentTab === 'sales' ? 'Sales' : currentTab === 'products' ? 'Products' : currentTab === 'customers' ? 'Customers' : currentTab === 'invoices' ? 'Invoices' : currentTab === 'purchase-orders' ? 'Purchase Orders' : currentTab === 'open-accounts' ? 'Open Accounts' : currentTab === 'reports' ? 'Reports' : currentTab === 'usage' ? 'Usage' : 'Settings'}</span>
            </div>
          </div>

          {currentUser && currentUser.paymentPlan === 'percent' && (currentUser.planSavingAmount ?? 0) > 0 && (
            <UpsellBanner
              userId={currentUser.id}
              userEmail={currentUser.email}
              planSavingAmount={currentUser.planSavingAmount!}
              language={currentUser.preferredLanguage || 'en'}
              onSwitched={(u) => setCurrentUser(prev => prev ? { ...prev, ...(u as typeof prev) } : prev)}
            />
          )}

          <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 overflow-x-hidden content-bottom-safe">
            <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">

          {/* Sales Tab */}
          <TabsContent value="sales">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="w-full">
              <div className="px-1 pb-4">
                <h2 style={{ color: posTheme === 'dark' ? '#ffffff' : '#111827' }} className="text-lg sm:text-2xl font-bold tracking-tight md:text-[35px] md:leading-[1.2]">Choose a product to start selling</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,60%)] rounded-full mt-2"></div>
              </div>
              <div className={`w-full rounded-2xl shadow-2xl overflow-hidden ${posTheme === 'dark' ? 'bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 shadow-black/20' : 'bg-white border border-gray-200 shadow-gray-200/80'}`}>
                <div className="flex flex-col lg:flex-row w-full">
                  <div className={`flex-1 min-w-0 ${posTheme === 'dark' ? 'lg:border-r border-gray-700/30' : 'lg:border-r border-gray-200'}`}>
                    <div className={`px-3 py-3 sm:px-5 sm:py-4 border-b ${posTheme === 'dark' ? 'border-gray-700/30 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(217,90%,40%)]/15 flex-shrink-0">
                            <Package className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                          </div>
                          <div className="min-w-0">
                            <h3 className={`text-sm font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Products</h3>
                            <p className="text-xs text-gray-500">{products.length} available</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {categories.length > 0 && (
                            <Select value={salesDisplayMode} onValueChange={(value: 'grid' | 'tabs') => { setSalesDisplayMode(value); if (value === 'grid') setSelectedSalesCategory(null); if (value === 'tabs') setSalesCategoryFilter('all'); }}>
                              <SelectTrigger className={`w-[90px] sm:w-[110px] h-8 text-[10px] sm:text-xs ${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="grid"><span className="flex items-center gap-1.5"><Grid3X3 className="w-3 h-3" /> Grid</span></SelectItem>
                                <SelectItem value="tabs"><span className="flex items-center gap-1.5"><LayoutList className="w-3 h-3" /> Tabs</span></SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          <Select value={productSortOrder} onValueChange={(value: typeof productSortOrder) => setProductSortOrder(value)}>
                            <SelectTrigger className={`w-[100px] sm:w-[130px] h-8 text-[10px] sm:text-xs ${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-700'}`}><SelectValue /></SelectTrigger>
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
                        <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`pl-10 h-9 ${posTheme === 'dark' ? 'bg-gray-900/40 border-gray-600/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`} />
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
                          <h3 className={`text-lg font-semibold mb-2 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Add your first product</h3>
                          <p className="text-sm text-gray-400 text-center max-w-xs mb-5">Go to the Product Inventory tab to add products you want to sell</p>
                          <Button
                            onClick={() => setCurrentTab('products')}
                            className="bg-transparent border border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 transition-all duration-300"
                          >
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Add Product
                          </Button>
                        </div>
                      ) : salesDisplayMode === 'grid' && categories.length > 0 && selectedSalesCategory === null ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {/* All Products card */}
                          <div
                            onClick={() => { setSalesDisplayMode('tabs'); setSalesCategoryFilter('all'); }}
                            className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                              posTheme === 'dark'
                                ? 'border-gray-600/50 bg-gradient-to-br from-gray-700/30 to-gray-800/30 hover:border-gray-500 hover:bg-gray-700/40'
                                : 'border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-[hsl(217,90%,40%)]/40 hover:bg-blue-50/30'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                                posTheme === 'dark' ? 'bg-gray-600/40' : 'bg-[hsl(217,90%,50%)]/10'
                              }`}>
                                <Package className={`w-5 h-5 ${posTheme === 'dark' ? 'text-gray-300' : 'text-[hsl(217,90%,45%)]'}`} />
                              </div>
                              <span className={`font-semibold text-sm ${posTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>All Products</span>
                              <span className={`text-xs ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{products.length} items</span>
                            </div>
                          </div>
                          {/* Category cards */}
                          {categories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => { setSelectedSalesCategory(cat.id); }}
                              className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                                posTheme === 'dark'
                                  ? 'border-gray-600/50 bg-gradient-to-br from-gray-700/30 to-gray-800/30 hover:border-gray-500 hover:bg-gray-700/40'
                                  : 'border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50'
                              }`}
                              style={posTheme === 'dark' ? { borderColor: `${cat.color}30` } : { borderColor: `${cat.color}50` }}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                                  style={{ backgroundColor: posTheme === 'dark' ? `${cat.color}30` : `${cat.color}18` }}>
                                  <Folder className="w-5 h-5" style={{ color: cat.color || '#3b82f6' }} />
                                </div>
                                <span className={`font-semibold text-sm text-center leading-tight ${posTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{cat.name}</span>
                                <span className={`text-xs ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{products.filter(p => p.categoryId === cat.id).length} items</span>
                              </div>
                            </div>
                          ))}
                          {/* Uncategorized card */}
                          {products.some(p => !p.categoryId) && (
                            <div
                              onClick={() => { setSalesDisplayMode('tabs'); setSalesCategoryFilter(0 as any); }}
                              className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                                posTheme === 'dark'
                                  ? 'border-gray-600/50 bg-gradient-to-br from-gray-700/30 to-gray-800/30 hover:border-gray-500 hover:bg-gray-700/40'
                                  : 'border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                                  posTheme === 'dark' ? 'bg-gray-600/40' : 'bg-gray-100'
                                }`}>
                                  <Folder className={`w-5 h-5 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                                <span className={`font-semibold text-sm ${posTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Uncategorized</span>
                                <span className={`text-xs ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{products.filter(p => !p.categoryId).length} items</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : salesDisplayMode === 'grid' && selectedSalesCategory !== null ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <button onClick={() => setSelectedSalesCategory(null)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" />Back to Categories</button>
                            <Button size="sm" onClick={() => { setSelectedProductsForCategory(products.filter(p => p.categoryId === selectedSalesCategory).map(p => p.id)); setIsAddProductsToCategoryOpen(true); }} className="bg-transparent border border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 text-xs transition-all duration-300"><Plus className="w-3 h-3 mr-1" />Add Products</Button>
                          </div>
                          <div className={`flex items-center gap-3 py-2 border-b ${posTheme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'}`}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categories.find(c => c.id === selectedSalesCategory)?.color || '#3b82f6'}30` }}><Folder className="w-4 h-4" style={{ color: categories.find(c => c.id === selectedSalesCategory)?.color || '#3b82f6' }} /></div>
                            <div>
                              <h3 className={`text-lg font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{categories.find(c => c.id === selectedSalesCategory)?.name || 'Category'}</h3>
                              <p className="text-xs text-gray-400">{products.filter(p => p.categoryId === selectedSalesCategory).length} products</p>
                            </div>
                          </div>
                          <div className="grid gap-1">
                            {products.filter(p => p.categoryId === selectedSalesCategory).map((product) => (
                              <div key={product.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150 border ${posTheme === 'dark' ? 'hover:bg-white/5 border-transparent hover:border-gray-700/50' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'}`} onClick={() => addToSale(product)}>
                                <div>
                                  <p className={`font-medium text-sm ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{product.name}</p>
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
                            <div key={product.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150 border ${posTheme === 'dark' ? 'hover:bg-white/5 border-transparent hover:border-gray-700/50' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'}`} onClick={() => addToSale(product)}>
                              <div>
                                <p className={`font-medium text-sm ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{product.name}</p>
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
                  <div data-testid="current-sale-card" className={`w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto ${posTheme === 'dark' ? 'bg-[hsl(217,20%,11%)]/60' : 'bg-white'}`}>
                    <div className={`px-3 py-3 sm:px-5 sm:py-4 border-b ${posTheme === 'dark' ? 'border-gray-700/30 bg-[hsl(217,25%,13%)]/50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/20"><ShoppingCart className="h-4 w-4 text-white" /></div>
                          <div>
                            <h3 className={`text-sm font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Current Sale</h3>
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
                          <div key={item.productId} className={`flex items-center gap-3 p-2.5 rounded-lg ${posTheme === 'dark' ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-gray-50 border border-gray-200'}`}>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                              <p className="text-xs text-gray-500">R{item.price} × {item.quantity} = R{(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className={`h-8 w-8 sm:h-7 sm:w-7 p-0 ${posTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`} onClick={() => updateQuantity(item.productId, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                              <span className={`w-7 text-center text-sm font-medium ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.quantity}</span>
                              <Button size="sm" variant="ghost" className={`h-8 w-8 sm:h-7 sm:w-7 p-0 ${posTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`} onClick={() => updateQuantity(item.productId, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-1" onClick={() => updateQuantity(item.productId, 0)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`space-y-3 pt-3 border-t ${posTheme === 'dark' ? 'border-gray-700/30' : 'border-gray-200'}`}>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className={`text-xs mb-1 block ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Customer</Label>
                            <Select value={selectedCustomerId?.toString() || "none"} onValueChange={(value) => setSelectedCustomerId(value === "none" ? null : parseInt(value))}>
                              <SelectTrigger className={`h-9 text-xs ${posTheme === 'dark' ? 'bg-gray-900/40 border-gray-700/50 text-white' : 'bg-white border-gray-200 text-gray-700'}`}><SelectValue placeholder="No customer" /></SelectTrigger>
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
                            <Label className={`text-xs mb-1 block ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Payment</Label>
                            <Select value={paymentType} onValueChange={setPaymentType}>
                              <SelectTrigger className={`h-9 text-xs ${posTheme === 'dark' ? 'bg-gray-900/40 border-gray-700/50 text-white' : 'bg-white border-gray-200 text-gray-700'}`}><SelectValue /></SelectTrigger>
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
                          <Label className={`text-xs mb-1 block ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Notes</Label>
                          <Textarea value={saleNotes} onChange={(e) => setSaleNotes(e.target.value)} placeholder="Sale notes..." rows={1} className={`text-xs resize-none ${posTheme === 'dark' ? 'bg-gray-900/40 border-gray-700/50 text-white placeholder:text-gray-600' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`} />
                        </div>
                        <div>
                          <Label className={`text-xs mb-1.5 block ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Discount</Label>
                          <div className="flex flex-wrap gap-1.5 touch-action-manipulation">
                            {[0, 5, 10, 20, 50].map((percentage) => (
                              <Button key={percentage} type="button" size="sm" variant={discountPercentage === percentage ? "default" : "outline"} onClick={() => setDiscountPercentage(percentage)} className={`h-9 sm:h-7 text-xs px-3 sm:px-2.5 ${discountPercentage === percentage ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] border-0" : posTheme === 'dark' ? 'border-gray-700/50 text-gray-400 hover:text-white' : 'border-gray-200 text-gray-600 hover:text-gray-900'}`}>{percentage === 0 ? "None" : `${percentage}%`}</Button>
                            ))}
                            <div className="flex items-center gap-1 ml-1">
                              <Input type="number" min="0" max="100" step="1" placeholder="0" value={discountPercentage || ""} onChange={(e) => { const inputVal = e.target.value; if (inputVal === "") { setDiscountPercentage(0); } else { setDiscountPercentage(Math.min(100, Math.max(0, parseInt(inputVal) || 0))); } }} className={`w-14 h-9 sm:h-7 text-center text-xs ${posTheme === 'dark' ? 'bg-gray-900/40 border-gray-700/50 text-white' : 'bg-white border-gray-200 text-gray-900'}`} />
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
                      <div className={`pt-3 border-t space-y-1.5 ${posTheme === 'dark' ? 'border-gray-700/30' : 'border-gray-200'}`}>
                        <div className="flex justify-between text-sm"><span className={posTheme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Subtotal</span><span className={`${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>R{calculateSubtotal().toFixed(2)}</span></div>
                        {discountPercentage > 0 && <div className="flex justify-between text-sm text-green-400"><span>Discount ({discountPercentage}%)</span><span>-R{calculateDiscount().toFixed(2)}</span></div>}
                        <div className={`flex justify-between items-center pt-2 border-t ${posTheme === 'dark' ? 'border-gray-600/30' : 'border-gray-200'}`}>
                          <span className={`text-base font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</span>
                          <span className="text-xl font-bold text-[hsl(217,90%,50%)]">R{calculateTotal()}</span>
                        </div>
                      </div>
                      <div className={`space-y-3 pt-3 border-t ${posTheme === 'dark' ? 'border-gray-700/30' : 'border-gray-200'}`}>
                        <div className="flex flex-wrap gap-1.5">
                          <Button type="button" size="sm" variant={checkoutOption === 'open-account' ? "default" : "outline"} onClick={() => setCheckoutOption(checkoutOption === 'open-account' ? 'complete' : 'open-account')} className={`flex-1 h-10 sm:h-8 text-xs ${checkoutOption === 'open-account' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] border-0 text-white" : posTheme === 'dark' ? 'border-gray-700/50 text-gray-400' : 'border-gray-200 text-gray-600'}`}><FileText className="h-3.5 w-3.5 mr-1.5" />Open Account</Button>
                          <Button type="button" size="sm" variant={checkoutOption === 'add-to-account' ? "default" : "outline"} onClick={() => setCheckoutOption(checkoutOption === 'add-to-account' ? 'complete' : 'add-to-account')} disabled={openAccounts.length === 0} className={`flex-1 h-10 sm:h-8 text-xs ${checkoutOption === 'add-to-account' ? "bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] border-0 text-white" : posTheme === 'dark' ? 'border-gray-700/50 text-gray-400' : 'border-gray-200 text-gray-600'}`}><Plus className="h-3.5 w-3.5 mr-1.5" />Add to Account</Button>
                        </div>
                        {checkoutOption === 'add-to-account' && (
                          <div>
                            <Label className={`text-xs mb-1 block ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Select Open Account</Label>
                            <Select value={selectedOpenAccountId?.toString() || ""} onValueChange={(value) => setSelectedOpenAccountId(value ? parseInt(value) : null)}>
                              <SelectTrigger className={`h-9 text-xs ${posTheme === 'dark' ? 'bg-gray-900/40 border-gray-700/50 text-white' : 'bg-white border-gray-200 text-gray-700'}`}><SelectValue placeholder="Choose an open account" /></SelectTrigger>
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
                  {posTheme === 'dark' && <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>}
                  <div className={`relative rounded-xl p-4 transition-all duration-300 ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 hover:border-[hsl(217,90%,40%)]/50' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[hsl(217,90%,40%)]/40'}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Products</p>
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
                        <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>In Stock</p>
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
                        <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Low Stock</p>
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
                        <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Out of Stock</p>
                        <p className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{products.filter(p => p.quantity === 0).length}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Main Products Card */}
              <Card className={`${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-gray-700/50' : 'bg-white border-gray-200'} shadow-2xl shadow-blue-900/10 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/5 via-transparent to-[hsl(217,90%,40%)]/5"></div>
                <CardHeader className={`relative border-b border-white/10 pb-4 ${posTheme === 'dark' ? 'bg-[#000000]' : 'bg-white'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Product Inventory</CardTitle>
                        <p className="text-gray-400 text-sm">Manage your product catalog</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className={posTheme === 'dark' ? 'h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200' : 'h-9 px-3 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200'}>
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
                          <Button variant="outline" size="sm" className={posTheme === 'dark' ? 'h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200' : 'h-9 px-3 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200'}>
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
                        className={posTheme === 'dark' ? 'h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200' : 'h-9 px-3 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200'}
                      >
                        <FolderPlus className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                        Categories
                      </Button>
                      
                      <AlertDialog open={showDeleteAllProductsConfirm} onOpenChange={setShowDeleteAllProductsConfirm}>
                        <AlertDialogContent className={`${posTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className={posTheme === 'dark' ? 'text-white' : 'text-gray-900'}>Delete All Products?</AlertDialogTitle>
                            <AlertDialogDescription className={posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                              This action cannot be undone. All {products?.length || 0} products will be permanently deleted from your inventory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className={posTheme === 'dark' ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}>Cancel</AlertDialogCancel>
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
                          <Button onClick={() => openProductDialog()} className="bg-transparent border border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 transition-all duration-300">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Product
                          </Button>
                        </DialogTrigger>
                    <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[560px] max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} shadow-2xl shadow-blue-900/30 p-0`} aria-describedby="product-dialog-description">
                      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/5 via-transparent to-[hsl(217,90%,40%)]/5 pointer-events-none"></div>
                      <div className="relative flex flex-col">
                        <div className={posTheme === 'dark' ? 'px-6 pt-6 pb-4 border-b border-gray-700/50 flex-shrink-0' : 'px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0'}>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                              <Package className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <DialogTitle className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                                    <FormLabel className={`${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium flex items-center gap-2`}>
                                      <Tag className="w-3.5 h-3.5 text-[hsl(217,90%,50%)]" />
                                      SKU / Code
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="e.g., PROD001" 
                                        {...field} 
                                        className={`${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11`}
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
                                    <FormLabel className={`${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium flex items-center gap-2`}>
                                      <Hash className="w-3.5 h-3.5 text-[hsl(217,90%,50%)]" />
                                      Stock Qty
                                    </FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="e.g., 50" 
                                        {...field} 
                                        className={`${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11`}
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
                                  <FormLabel className={`${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm font-medium flex items-center gap-2`}>
                                    <Package className="w-3.5 h-3.5 text-[hsl(217,90%,50%)]" />
                                    Product Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="e.g., Coffee - Espresso" 
                                      {...field} 
                                      className={`${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11`}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="pt-2">
                              <div className="flex items-center gap-2 mb-3">
                                <DollarSign className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                                <span className={posTheme === 'dark' ? 'text-sm font-medium text-gray-300' : 'text-sm font-medium text-gray-700'}>Pricing</span>
                                <div className={posTheme === 'dark' ? 'flex-1 h-px bg-gray-700/50' : 'flex-1 h-px bg-gray-200'}></div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <FormField
                                  control={productForm.control}
                                  name="costPrice"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={posTheme === 'dark' ? 'text-gray-400 text-xs font-medium' : 'text-gray-600 text-xs font-medium'}>Cost Price</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <span className={posTheme === 'dark' ? 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm' : 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'}>R</span>
                                          <Input 
                                            placeholder="0.00" 
                                            {...field} 
                                            className={`pl-7 ${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11`}
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
                                      <FormLabel className={posTheme === 'dark' ? 'text-gray-400 text-xs font-medium' : 'text-gray-600 text-xs font-medium'}>Retail Price</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <span className={posTheme === 'dark' ? 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm' : 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'}>R</span>
                                          <Input 
                                            placeholder="0.00" 
                                            {...field} 
                                            className={`pl-7 ${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11`}
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
                                      <FormLabel className={posTheme === 'dark' ? 'text-gray-400 text-xs font-medium' : 'text-gray-600 text-xs font-medium'}>Trade Price</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <span className={posTheme === 'dark' ? 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm' : 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'}>R</span>
                                          <Input 
                                            placeholder="0.00" 
                                            {...field} 
                                            className={`pl-7 ${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 h-11`}
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
                                <span className={posTheme === 'dark' ? 'text-sm font-medium text-gray-300' : 'text-sm font-medium text-gray-700'}>Category</span>
                                <div className={posTheme === 'dark' ? 'flex-1 h-px bg-gray-700/50' : 'flex-1 h-px bg-gray-200'}></div>
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
                                        <SelectTrigger className={posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 text-white h-11' : 'bg-white border-gray-300 text-gray-900 h-11'}>
                                          <SelectValue placeholder="Select category (optional)" />
                                        </SelectTrigger>
                                        <SelectContent className={`${posTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
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
                            
                            <div className={posTheme === 'dark' ? 'flex justify-end gap-3 pt-4 border-t border-gray-700/50' : 'flex justify-end gap-3 pt-4 border-t border-gray-200'}>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsProductDialogOpen(false)}
                                className={posTheme === 'dark' ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 px-5' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-5'}
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
              <CardContent className={`px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-6 relative ${posTheme === 'dark' ? 'bg-[#000000]' : 'bg-white'}`}>
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
                          className={`pl-12 h-12 ${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-700/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,40%)]/50 focus:ring-[hsl(217,90%,40%)]/20 rounded-xl`}
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
                            <p className="text-gray-400">{productSearchTerm ? 'No products found matching your search.' : 'No products available.'}</p>
                            {!productSearchTerm && (
                              <Button
                                onClick={() => openProductDialog()}
                                className="mt-2 bg-transparent border border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 transition-all duration-300"
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
                <CardTitle className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Customer Directory</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={posTheme === 'dark' ? 'h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200' : 'h-9 px-3 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200'}>
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
                    className="bg-transparent border border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 transition-all duration-300"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={`pt-6 ${posTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
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
                <div className="space-y-2">
                  {customers.map((customer) => {
                    const spend = customerSpendMap[customer.id];
                    return (
                      <div
                        key={customer.id}
                        className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border transition-colors ${posTheme === 'dark' ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className={`font-semibold text-sm ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{customer.name}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${customer.customerType === 'trade' ? (posTheme === 'dark' ? 'bg-amber-900/50 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-800 border-amber-200') : (posTheme === 'dark' ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-100 text-slate-700 border-slate-200')}`}>
                              {customer.customerType === 'trade' ? 'Trade' : 'Retail'}
                            </span>
                            {spend !== undefined && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${posTheme === 'dark' ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                R{spend.toFixed(2)} spent
                              </span>
                            )}
                          </div>
                          <div className={`space-y-0.5 text-xs ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {customer.phone && <p>📞 {customer.phone}</p>}
                            {customer.notes && <p className="italic truncate max-w-xs">{customer.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                          <button
                            onClick={() => openCustomerDialog(customer)}
                            className={`p-1.5 rounded-lg transition-colors ${posTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                            title="Edit customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCustomerMutation.mutate(customer.id)}
                            className={`p-1.5 rounded-lg transition-colors ${posTheme === 'dark' ? 'text-red-500 hover:text-red-400 hover:bg-red-900/20' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                            title="Delete customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {customers.length === 0 && (
                    <div className={`text-center py-8 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
              <CardHeader className={`border-b pb-4 space-y-3 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                {/* Row 1: Title + primary CTA */}
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className={posTheme === 'dark' ? 'text-white text-lg sm:text-xl font-bold' : 'text-gray-900 text-lg sm:text-xl font-bold'}>Invoices & Quotes</CardTitle>
                  <Button
                    onClick={() => setIsInvoiceDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 bg-transparent border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 font-semibold transition-all duration-200 gap-2 shrink-0"
                    data-testid="button-create-invoice"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create
                  </Button>
                </div>
                {/* Row 2: Utility buttons */}
                <div className="flex items-center gap-2">
                  {/* Column visibility dropdown */}
                  <DropdownMenu open={isColumnMenuOpen} onOpenChange={setIsColumnMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={posTheme === 'dark' ? 'h-9 w-9 p-0 bg-black border-white/20 text-white hover:bg-white/10 transition-all duration-200' : 'h-9 w-9 p-0 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200'}>
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={posTheme === 'dark' ? 'w-64 bg-[#111] border border-white/20 text-white' : 'w-64 bg-white border border-gray-200 text-gray-900 shadow-lg'}>
                      <div className={posTheme === 'dark' ? 'px-3 py-2 text-xs font-semibold text-gray-400' : 'px-3 py-2 text-xs font-semibold text-gray-500'}>What should display on your documents?</div>
                      {([
                        { key: 'dueDate', label: 'Due Date' },
                        { key: 'clientEmail', label: 'Client Email' },
                        { key: 'clientPhone', label: 'Client Phone' },
                        { key: 'poNumber', label: 'PO Number' },
                        { key: 'dueTerms', label: 'Payment Terms' },
                        { key: 'paymentMethod', label: 'Payment Method' },
                        { key: 'notes', label: 'Notes' },
                        { key: 'discount', label: 'Discount' },
                      ] as const).map(col => (
                        <DropdownMenuItem
                          key={col.key}
                          onSelect={(e) => { e.preventDefault(); toggleInvoiceColumn(col.key); }}
                          className={posTheme === 'dark' ? 'flex items-center gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10' : 'flex items-center gap-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100'}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${invoiceCardColumns.has(col.key) ? 'bg-[hsl(217,90%,40%)] border-[hsl(217,90%,40%)]' : posTheme === 'dark' ? 'border-white/30' : 'border-gray-300'}`}>
                            {invoiceCardColumns.has(col.key) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm">{col.label}</span>
                        </DropdownMenuItem>
                      ))}
                      {invoiceCustomFieldDefs.length > 0 && (
                        <>
                          <DropdownMenuSeparator className={posTheme === 'dark' ? 'bg-white/10' : 'bg-gray-100'} />
                          <div className={posTheme === 'dark' ? 'px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider' : 'px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'}>Custom Fields</div>
                          {invoiceCustomFieldDefs.map(field => (
                            <DropdownMenuItem
                              key={field.id}
                              onSelect={(e) => { e.preventDefault(); toggleInvoiceColumn(`cf_${field.id}`); }}
                              className={posTheme === 'dark' ? 'flex items-center gap-2 cursor-pointer hover:bg-white/10 focus:bg-white/10' : 'flex items-center gap-2 cursor-pointer hover:bg-gray-100 focus:bg-gray-100'}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${invoiceCardColumns.has(`cf_${field.id}`) ? 'bg-[hsl(217,90%,40%)] border-[hsl(217,90%,40%)]' : posTheme === 'dark' ? 'border-white/30' : 'border-gray-300'}`}>
                                {invoiceCardColumns.has(`cf_${field.id}`) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                              <span className="text-sm">{field.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      <DropdownMenuSeparator className={posTheme === 'dark' ? 'bg-white/10' : 'bg-gray-100'} />
                      <DropdownMenuItem
                        onSelect={(e) => { e.preventDefault(); const next = new Set(['dueDate','clientEmail','clientPhone','poNumber','dueTerms','paymentMethod','notes','discount']); setInvoiceCardColumns(next); try { const u = JSON.parse(localStorage.getItem('posUser') || 'null'); localStorage.setItem(`invoiceCardCols_${u?.id || 'guest'}`, JSON.stringify(Array.from(next))); } catch {} }}
                        className="text-xs text-gray-400 hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                      >Reset to default</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleExportInvoices}
                    className={posTheme === 'dark' ? 'h-9 px-3 bg-black border-[hsl(217,90%,40%)]/40 text-white hover:bg-[hsl(217,90%,40%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-200' : 'h-9 px-3 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200'}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-[hsl(217,90%,50%)]" />
                    Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={`pt-4 sm:pt-6 px-3 sm:px-6 ${posTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                {/* Filter Bar */}
                {(() => {
                  const activeFilterCount = [invoiceTypeFilter !== 'all', invoiceStatusFilter !== 'all', invoiceSortOrder !== 'date-desc', !!invoiceDateFrom, !!invoiceDateTo].filter(Boolean).length;
                  const clearFilters = () => { setInvoiceTypeFilter('all'); setInvoiceStatusFilter('all'); setInvoiceSortOrder('date-desc'); setInvoiceDateFrom(""); setInvoiceDateTo(""); };
                  return (
                    <div className="space-y-2 mb-4">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                          <Input
                            placeholder="Search by document number or client..."
                            value={invoiceSearchQuery}
                            onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                            className={`pl-8 h-9 w-full text-sm ${posTheme === 'dark' ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                            data-testid="input-invoice-search"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInvoiceFilters(v => !v)}
                          className={`h-9 px-3 gap-1.5 shrink-0 text-sm transition-all duration-200 ${(showInvoiceFilters || activeFilterCount > 0) ? (posTheme === 'dark' ? 'border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] bg-[hsl(217,90%,50%)]/10' : 'border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] bg-[hsl(217,90%,50%)]/5') : (posTheme === 'dark' ? 'border-white/10 text-gray-400 bg-white/5 hover:bg-white/10' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50')}`}
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                          Filters
                          {activeFilterCount > 0 && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(217,90%,50%)] text-[10px] font-bold text-white">{activeFilterCount}</span>
                          )}
                        </Button>
                      </div>
                      {showInvoiceFilters && (
                        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border ${posTheme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                          <Select value={invoiceTypeFilter} onValueChange={(value: any) => setInvoiceTypeFilter(value)}>
                            <SelectTrigger className={`h-8 text-xs ${posTheme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-700'}`} data-testid="select-invoice-type-filter">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="invoice">Invoices</SelectItem>
                              <SelectItem value="quote">Quotes</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={invoiceStatusFilter} onValueChange={(value: any) => setInvoiceStatusFilter(value)}>
                            <SelectTrigger className={`h-8 text-xs ${posTheme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-700'}`} data-testid="select-invoice-status-filter">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="not_paid">Not Paid</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select value={invoiceSortOrder} onValueChange={(value: any) => setInvoiceSortOrder(value)}>
                            <SelectTrigger className={`h-8 text-xs ${posTheme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
                              <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date-desc">Newest First</SelectItem>
                              <SelectItem value="date-asc">Oldest First</SelectItem>
                              <SelectItem value="name-asc">Client: A-Z</SelectItem>
                              <SelectItem value="name-desc">Client: Z-A</SelectItem>
                              <SelectItem value="amount-desc">Amount: High-Low</SelectItem>
                              <SelectItem value="amount-asc">Amount: Low-High</SelectItem>
                              <SelectItem value="number-asc">Doc Nr: A-Z</SelectItem>
                              <SelectItem value="number-desc">Doc Nr: Z-A</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={invoiceDateFrom}
                            onChange={(e) => setInvoiceDateFrom(e.target.value)}
                            className={`h-8 text-xs ${posTheme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                            data-testid="input-invoice-date-from"
                          />
                          <Input
                            type="date"
                            value={invoiceDateTo}
                            onChange={(e) => setInvoiceDateTo(e.target.value)}
                            className={`h-8 text-xs ${posTheme === 'dark' ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-700'}`}
                            data-testid="input-invoice-date-to"
                          />
                          {activeFilterCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearFilters}
                              className="h-8 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 gap-1"
                              data-testid="button-clear-filters"
                            >
                              <X className="w-3 h-3" /> Clear
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                  <div className="space-y-2">
                    {filteredInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className={`px-4 py-3 rounded-xl border cursor-pointer transition-colors ${posTheme === 'dark' ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'}`}
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setIsInvoiceViewOpen(true);
                        }}
                        data-testid={`invoice-card-${invoice.id}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${invoice.documentType === 'invoice' ? (posTheme === 'dark' ? 'bg-indigo-900/60 text-indigo-300 border-indigo-700' : 'bg-indigo-100 text-indigo-700 border-indigo-200') : (posTheme === 'dark' ? 'bg-violet-900/60 text-violet-300 border-violet-700' : 'bg-violet-100 text-violet-700 border-violet-200')}`}>
                                {invoice.documentType === 'invoice' ? 'Invoice' : 'Quote'}
                              </span>
                              <span className={`font-semibold text-sm sm:text-base truncate ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{invoice.documentNumber}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingDocNumberInvoice(invoice);
                                  setNewDocumentNumber(invoice.documentNumber || '');
                                  setIsEditDocNumberDialogOpen(true);
                                }}
                                className={`p-1 rounded transition-colors flex-shrink-0 ${posTheme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                title="Edit document number"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-2" onClick={(e) => e.stopPropagation()}>
                              <span className={`text-xs sm:text-sm font-medium ${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Paid</span>
                              <Switch
                                checked={invoice.status === 'paid'}
                                onCheckedChange={(checked) => {
                                  updateInvoiceStatusMutation.mutate({
                                    invoiceId: invoice.id,
                                    status: checked ? 'paid' : 'draft'
                                  });
                                }}
                                className="data-[state=checked]:bg-[hsl(217,90%,40%)] data-[state=unchecked]:bg-gray-400"
                              />
                            </div>
                            <div className={`space-y-0.5 text-xs sm:text-sm ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <p>Client: <span className={`font-medium ${posTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>{customers.find(c => c.id === invoice.clientId)?.name || invoice.clientName || 'N/A'}</span></p>
                              {invoiceCardColumns.has('dueDate') && invoice.dueDate && (
                                <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                              )}
                              {invoiceCardColumns.has('clientEmail') && (invoice.clientEmail || customers.find(c => c.id === invoice.clientId)?.email) && (
                                <p className="truncate">Email: {invoice.clientEmail || customers.find(c => c.id === invoice.clientId)?.email}</p>
                              )}
                              {invoiceCardColumns.has('clientPhone') && (invoice.clientPhone || customers.find(c => c.id === invoice.clientId)?.phone) && (
                                <p>Phone: {invoice.clientPhone || customers.find(c => c.id === invoice.clientId)?.phone}</p>
                              )}
                              {invoiceCardColumns.has('poNumber') && invoice.poNumber && (
                                <p>PO: {invoice.poNumber}</p>
                              )}
                              {invoiceCardColumns.has('dueTerms') && invoice.dueTerms && (
                                <p>Terms: {invoice.dueTerms}</p>
                              )}
                              {invoiceCardColumns.has('paymentMethod') && invoice.paymentMethod && (
                                <p>Payment: {invoice.paymentMethod}</p>
                              )}
                              {invoiceCardColumns.has('notes') && invoice.notes && (
                                <p className="truncate">Notes: {invoice.notes}</p>
                              )}
                              {invoiceCardColumns.has('discount') && (parseFloat(invoice.discountAmount || '0') > 0 || parseFloat(invoice.discountPercent || '0') > 0) && (
                                <p>Discount: {invoice.discountType === 'percent' ? `${invoice.discountPercent}%` : `R${parseFloat(invoice.discountAmount || '0').toFixed(2)}`}</p>
                              )}
                              {invoiceCustomFieldDefs.filter(f => invoiceCardColumns.has(`cf_${f.id}`)).map(field => {
                                const val = (invoice.customFieldValues as any)?.[`cf_${field.id}`];
                                return val ? (
                                  <p key={field.id} className="truncate">{field.label}: {val}</p>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className={`font-bold text-base sm:text-lg ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              R{typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}
                            </p>
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

          {/* Open Accounts Tab */}
          {/* Purchase Orders Tab */}
          <TabsContent value="purchase-orders">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Purchase Orders</h2>
                  <p className="text-gray-400 text-sm mt-1">Manage supplier orders and track deliveries</p>
                </div>
                <Button onClick={() => { resetPOForm(); setIsPODialogOpen(true); }} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white shadow-lg shadow-blue-900/30">
                  <Plus className="h-4 w-4 mr-2" />New Purchase Order
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input placeholder="Search by PO number or supplier..." value={poSearchTerm} onChange={(e) => setPOSearchTerm(e.target.value)} className={posTheme === 'dark' ? 'pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'} />
                </div>
                <Select value={poStatusFilter} onValueChange={setPOStatusFilter}>
                  <SelectTrigger className={posTheme === 'dark' ? 'w-full sm:w-48 bg-gray-900 border-gray-700 text-white' : 'w-full sm:w-48 bg-white border-gray-200 text-gray-700'}>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className={posTheme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="partial">Partially Received</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="paid" className="text-green-400">Paid</SelectItem>
                    <SelectItem value="not_paid" className="text-red-400">Not Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Total", count: purchaseOrders.length, accent: 'border-l-gray-400' },
                  { label: "Draft", count: purchaseOrders.filter((p: any) => p.status === 'draft').length, accent: 'border-l-gray-400' },
                  { label: "Sent", count: purchaseOrders.filter((p: any) => p.status === 'sent').length, accent: 'border-l-blue-500' },
                  { label: "Partial", count: purchaseOrders.filter((p: any) => p.status === 'partial').length, accent: 'border-l-amber-500' },
                  { label: "Received", count: purchaseOrders.filter((p: any) => p.status === 'received').length, accent: 'border-l-green-500' },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-lg p-3 border-l-4 ${stat.accent} ${posTheme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <p className={`text-2xl font-bold leading-none ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.count}</p>
                    <p className={`text-xs font-medium mt-1.5 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
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
                    <motion.div key={po.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${posTheme === 'dark' ? 'bg-gray-900/80 backdrop-blur-sm border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'} border rounded-xl p-4 transition-all group`}>
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
                            <DropdownMenuContent className={`${posTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
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
              <Card className={posTheme === 'dark' ? 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl' : 'bg-white border border-gray-200 shadow-sm'}>
                <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <CardTitle className={`flex items-center gap-2 text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <FileText className="w-5 h-5" />
                    Open Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className={`pt-6 ${posTheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                  <div className="grid gap-4">
                    {openAccounts.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No open accounts. Create one from the Sales tab to get started.
                      </div>
                    ) : (
                      openAccounts.map((account) => (
                        <div
                          key={account.id}
                          className={`rounded-xl border p-4 space-y-3 transition-colors ${posTheme === 'dark' ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-200 shadow-sm hover:border-gray-300'}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${account.accountType === 'table' ? 'bg-indigo-500' : 'bg-teal-500'}`} />
                              <h3 className={`font-semibold text-base ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{account.accountName}</h3>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingOpenAccount(account); setEditOpenAccountName(account.accountName); }}
                                className={`p-1 rounded-md transition-colors flex-shrink-0 ${posTheme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                                title="Rename account"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${account.accountType === 'table' ? (posTheme === 'dark' ? 'bg-indigo-900/60 text-indigo-300 border-indigo-700' : 'bg-indigo-100 text-indigo-700 border-indigo-200') : (posTheme === 'dark' ? 'bg-teal-900/60 text-teal-300 border-teal-700' : 'bg-teal-100 text-teal-700 border-teal-200')}`}>
                                {account.accountType === 'table' ? 'Table' : 'Customer'}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xl font-bold text-[hsl(217,90%,50%)]">R{account.total}</p>
                              <p className={`text-xs ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{Array.isArray(account.items) ? account.items.length : 0} items</p>
                            </div>
                          </div>

                          {account.notes && (
                            <p className={`text-sm italic ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{account.notes}</p>
                          )}

                          <div className={`text-xs space-y-0.5 ${posTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            <p>Created: {new Date(account.createdAt).toLocaleDateString()} at {new Date(account.createdAt).toLocaleTimeString()}</p>
                            {account.lastUpdated && (
                              <p>Updated: {new Date(account.lastUpdated).toLocaleDateString()} at {new Date(account.lastUpdated).toLocaleTimeString()}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOpenAccount(account)}
                              className={`flex-1 min-w-[120px] font-medium ${posTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                const paymentType = 'cash';
                                closeOpenAccountMutation.mutate({ accountId: account.id, paymentType });
                              }}
                              className="flex-1 min-w-[120px] bg-transparent border border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 font-semibold transition-all duration-300"
                              disabled={closeOpenAccountMutation.isPending}
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              {closeOpenAccountMutation.isPending ? 'Closing...' : 'Close & Pay'}
                            </Button>
                          </div>
                        </div>
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
              className="space-y-4"
            >
              {/* Compact Filter Bar */}
              <div className={`rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 ${posTheme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-center gap-2 mr-auto">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)]">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <span className={`font-bold text-base ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sales Analytics</span>
                </div>
                <Input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`h-8 text-sm w-auto ${posTheme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'border-gray-200'}`}
                />
                <Select value={selectedStaffFilter.toString()} onValueChange={(value) => setSelectedStaffFilter(value === "all" ? "all" : parseInt(value))}>
                  <SelectTrigger className={`h-8 text-sm w-36 ${posTheme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'border-gray-200'}`}>
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
                <Button
                  onClick={() => handlePrintReport()}
                  size="sm"
                  className="h-8 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white shadow-md"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Print
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
                    {/* Summary Cards — 2×2 on mobile, 4 across on desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { icon: DollarSign, label: 'Total Revenue', value: `R${totalRevenue.toFixed(2)}` },
                        { icon: TrendingUp, label: 'Total Profit', value: `R${totalProfit.toFixed(2)}` },
                        { icon: Receipt, label: 'Transactions', value: totalTransactions },
                        { icon: TrendingUp, label: 'Avg Transaction', value: `R${avgTransactionValue.toFixed(2)}` },
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
                      <Card className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                        <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                          <CardTitle className={posTheme === 'dark' ? 'text-white' : 'text-gray-900'}>Payment Methods Breakdown</CardTitle>
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
                        <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                          <CardTitle className={posTheme === 'dark' ? 'text-white' : 'text-gray-900'}>7-Day Sales Trend</CardTitle>
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
                      <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                        <CardTitle className={posTheme === 'dark' ? 'text-white' : 'text-gray-900'}>Sales Details for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
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
                                        <p className={`text-sm mt-0.5 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
                                      <div className={`${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-700/30' : 'bg-gray-50 border-gray-200'} rounded-lg border overflow-hidden`}>
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
                <div className="space-y-4">
                  {/* Trial notice — compact amber bar */}
                  {isInTrial && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${posTheme === 'dark' ? 'border-amber-700/40 bg-amber-900/20' : 'border-amber-200 bg-amber-50'}`} data-testid="trial-banner">
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${posTheme === 'dark' ? 'bg-amber-900/40' : 'bg-amber-100'}`}>
                        <svg className={`w-4 h-4 ${posTheme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-semibold ${posTheme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`}>Free Trial Active</span>
                        <span className={`mx-2 ${posTheme === 'dark' ? 'text-amber-600' : 'text-amber-400'}`}>·</span>
                        <span className={`text-sm ${posTheme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining — ends {new Date(new Date(userTrialStartDate!).getTime() + (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}. After trial: 0.5% per sale + R0.50 per invoice.
                        </span>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-2xl font-bold ${posTheme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>{daysRemaining}</div>
                        <div className={`text-xs uppercase tracking-wide ${posTheme === 'dark' ? 'text-amber-500' : 'text-amber-600'}`}>{daysRemaining === 1 ? 'day left' : 'days left'}</div>
                      </div>
                    </div>
                  )}

                  {/* Page header */}
                  <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b ${posTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div>
                      <h2 className={`text-xl font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Billing</h2>
                      <p className={`text-sm mt-0.5 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{formatMonthYear(now)} billing period</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-xs uppercase tracking-wide font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Amount due</div>
                        <div className={`text-2xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>R{stormFee.toFixed(2)}</div>
                      </div>
                      <Button
                        onClick={() => setIsBankDetailsOpen(true)}
                        size="sm"
                        className={`h-9 font-medium ${posTheme === 'dark' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                        Pay Now
                      </Button>
                    </div>
                  </div>

                  {/* Summary stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Monthly Revenue', value: `R${currentMonthRevenue.toFixed(2)}`, sub: `${currentMonthSales.length} transactions` },
                      { label: 'Service Fee', value: `R${stormFee.toFixed(2)}`, sub: isInTrial ? 'Trial — R0.00' : '0.5% of revenue' },
                      { label: 'Invoices', value: String(currentMonthInvoices.length), sub: `R${invoiceFee.toFixed(2)} in fees` },
                      { label: 'Period', value: `${Math.round(progressPercentage)}%`, sub: `Day ${daysCompleted} of ${daysInMonth}` },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className={`rounded-lg border p-3 ${posTheme === 'dark' ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'}`}>
                        <div className={`text-xs font-medium uppercase tracking-wide ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
                        <div className={`mt-1 text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</div>
                        <div className={`text-xs mt-0.5 ${posTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Fee statement + billing info */}
                  <div className="grid lg:grid-cols-2 gap-4">
                    {/* Fee statement */}
                    <div className={`rounded-lg border ${posTheme === 'dark' ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'}`}>
                      <div className={`px-4 py-3 border-b text-sm font-semibold flex items-center gap-2 ${posTheme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
                        <DollarSign className="w-4 h-4" />
                        Fee Statement — {formatMonthYear(now)}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="space-y-1.5">
                          <div className={`text-xs font-semibold uppercase tracking-wider ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Sales (0.5%)</div>
                          <div className={`flex justify-between text-sm ${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span>Gross Revenue</span><span className="font-medium">R{currentMonthRevenue.toFixed(2)}</span>
                          </div>
                          <div className={`flex justify-between text-sm ${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span>Sales Fee</span><span className="font-medium">R{salesFee.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className={`border-t ${posTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`} />
                        <div className="space-y-1.5">
                          <div className={`text-xs font-semibold uppercase tracking-wider ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Invoices (R0.50 each)</div>
                          <div className={`flex justify-between text-sm ${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span>Generated</span><span className="font-medium">{currentMonthInvoices.length}</span>
                          </div>
                          <div className={`flex justify-between text-sm ${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span>Invoice Fee</span><span className="font-medium">R{invoiceFee.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className={`border-t ${posTheme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total Due</span>
                          <span className={`text-lg font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>R{stormFee.toFixed(2)}</span>
                        </div>
                        <Button
                          onClick={() => setIsBankDetailsOpen(true)}
                          className={`w-full h-9 font-medium text-sm ${posTheme === 'dark' ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-700'}`}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          View Payment Details
                        </Button>
                      </div>
                    </div>

                    {/* Billing info + contact */}
                    <div className={`rounded-lg border ${posTheme === 'dark' ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'}`}>
                      <div className={`px-4 py-3 border-b text-sm font-semibold flex items-center gap-2 ${posTheme === 'dark' ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
                        <FileText className="w-4 h-4" />
                        Billing Information
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          {[
                            { label: 'Billing cycle', value: 'Monthly — 1st to last day' },
                            { label: 'Sales rate', value: '0.5% of gross monthly revenue' },
                            { label: 'Invoice rate', value: 'R0.50 per invoice generated' },
                            { label: 'Payment due', value: 'End of each billing month' },
                            { label: 'Setup fees', value: 'None' },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between items-start gap-4 text-sm">
                              <span className={posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{label}</span>
                              <span className={`font-medium text-right ${posTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{value}</span>
                            </div>
                          ))}
                        </div>
                        <div className={`border-t pt-4 ${posTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
                          <div className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Billing support</div>
                          <div className={`text-sm ${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>softwarebystorm@gmail.com</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
              {/* Setup Completion Card */}
              {!currentUser?.tutorialCompleted && (
                <Card className="bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/10 border border-[hsl(217,90%,50%)]/30 shadow-xl shadow-blue-900/20">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(217,90%,40%)]/20 flex items-center justify-center flex-shrink-0">
                        <ListChecks className="w-5 h-5 text-[hsl(217,90%,60%)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">Complete your account setup</p>
                        <p className="text-gray-400 text-xs mt-0.5">Upload your logo in the section below, add your first product, run a test sale, and connect payment methods. Once you are done, click Mark Complete.</p>
                      </div>
                      <Button
                        onClick={() => markTutorialMutation.mutate()}
                        disabled={markTutorialMutation.isPending}
                        size="sm"
                        className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,45%)] text-white flex-shrink-0 whitespace-nowrap"
                      >
                        {markTutorialMutation.isPending ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" />Saving...</> : <><Check className="w-3.5 h-3.5 mr-1.5" />Mark Complete</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Appearance Card */}
              <Card className={posTheme === 'dark' ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/10' : 'bg-white border-gray-200 shadow-lg'}>
                <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                  <CardTitle className={`flex items-center gap-2 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {posTheme === 'dark' ? <Moon className="w-5 h-5 text-[hsl(217,90%,50%)]" /> : <Sun className="w-5 h-5 text-[hsl(217,90%,40%)]" />}
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 pb-5">
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-700/50' : 'bg-slate-50 border-gray-200'}`}>
                    <div>
                      <p className={`text-sm font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Interface Theme</p>
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
                        aria-label="Toggle theme"
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${posTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <Moon className={`w-4 h-4 transition-colors ${posTheme === 'dark' ? 'text-[hsl(217,90%,50%)]' : 'text-gray-400'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account & Preferences Section */}
              <Card className={`${posTheme === 'dark' ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white border-gray-200'} shadow-2xl shadow-blue-900/10`}>
                <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                  <CardTitle className={`flex items-center gap-2 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                      <div className={`relative ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-600/50' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden`}>
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
                      <div className={`relative ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-600/50' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden`}>
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
                      <div className={`relative ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-600/50' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden`}>
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
                      <div className={`relative ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-600/50' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden`}>
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
                          const response = await apiFetch(`/api/pos/user/${currentUser.id}/preferred-language`, {
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
                      <div className={`relative ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-600/50' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5 hover:border-[hsl(217,90%,40%)]/50 transition-all duration-300 overflow-hidden`}>
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
                      <div className={`relative ${posTheme === 'dark' ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-600/50' : 'bg-gray-50 border-gray-200'} border rounded-xl p-5 hover:border-red-500/50 transition-all duration-300 overflow-hidden`}>
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
              <Card className={`${posTheme === 'dark' ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white border-gray-200'} shadow-2xl shadow-blue-900/10`}>
                <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                  <CardTitle className={`flex items-center gap-2 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                                const res = await apiFetch(`/api/pos/user/${currentUser.id}/receipt-settings`, {
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
              <Card className={`${posTheme === 'dark' ? 'bg-gray-800/50 backdrop-blur-xl border-gray-700' : 'bg-white border-gray-200'} shadow-2xl shadow-blue-900/10`}>
                <CardHeader className={`border-b pb-4 ${posTheme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                  <CardTitle className={`flex items-center gap-2 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Settings className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                    Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    {/* XERO Integration Section — redesigned */}
                    <div className={`rounded-xl border overflow-hidden ${posTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>

                      {/* Hero SVG illustration */}
                      <div className={`w-full px-4 pt-5 pb-3 ${posTheme === 'dark' ? 'bg-gray-900/60' : 'bg-slate-50'}`}>
                        <svg viewBox="0 0 360 110" className="w-full max-h-28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <defs>
                            <linearGradient id="en-xero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#13B5EA"/>
                              <stop offset="100%" stopColor="#0a8ab5"/>
                            </linearGradient>
                            <linearGradient id="en-pos-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#6366f1"/>
                              <stop offset="100%" stopColor="#4f46e5"/>
                            </linearGradient>
                            <filter id="en-glow">
                              <feGaussianBlur stdDeviation="2" result="blur"/>
                              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                            </filter>
                          </defs>
                          <rect width="360" height="110" fill={posTheme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}/>
                          {[0,40,80,120,160,200,240,280,320,360].map(x => (
                            <line key={x} x1={x} y1="0" x2={x} y2="110" stroke={posTheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} strokeWidth="1"/>
                          ))}
                          {[0,28,56,84].map(y => (
                            <line key={y} x1="0" y1={y} x2="360" y2={y} stroke={posTheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} strokeWidth="1"/>
                          ))}

                          {/* === POS Terminal (left) === */}
                          <g transform="translate(28,14)">
                            <rect x="0" y="0" width="58" height="42" rx="5" fill="url(#en-pos-grad)" opacity="0.9"/>
                            <rect x="3" y="3" width="52" height="30" rx="3" fill="rgba(255,255,255,0.15)"/>
                            <rect x="7" y="8" width="30" height="3" rx="1.5" fill="rgba(255,255,255,0.6)"/>
                            <rect x="7" y="15" width="44" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
                            <rect x="7" y="20" width="38" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
                            <rect x="7" y="25" width="20" height="2" rx="1" fill="rgba(255,255,255,0.3)"/>
                            <rect x="14" y="42" width="30" height="6" rx="2" fill="rgba(99,102,241,0.5)"/>
                            <rect x="22" y="48" width="14" height="5" rx="1" fill="rgba(99,102,241,0.4)"/>
                            <rect x="12" y="53" width="34" height="4" rx="2" fill="rgba(99,102,241,0.35)"/>
                            <text x="29" y="74" textAnchor="middle" fill={posTheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'} fontSize="8.5" fontFamily="system-ui, sans-serif" fontWeight="500">Storm POS</text>
                          </g>

                          {/* === Data flow arrows (middle) === */}
                          <g transform="translate(105,28)">
                            {[0,14,28].map((y, i) => (
                              <g key={y}>
                                <line x1="0" y1={y} x2="145" y2={y} stroke="#13B5EA" strokeWidth={i === 0 ? 2 : 1.2} strokeDasharray="6,4" opacity={i === 0 ? 0.8 : i === 1 ? 0.5 : 0.3}/>
                                <polygon points={`140,${y-4} 145,${y} 140,${y+4}`} fill="#13B5EA" opacity={i === 0 ? 0.9 : i === 1 ? 0.55 : 0.35}/>
                              </g>
                            ))}
                            <circle cx="36" cy="0" r="3.5" fill="#13B5EA" opacity="0.7" filter="url(#en-glow)"/>
                            <circle cx="72" cy="14" r="2.5" fill="#13B5EA" opacity="0.5"/>
                            <circle cx="108" cy="0" r="3" fill="#13B5EA" opacity="0.6" filter="url(#en-glow)"/>
                            <text x="72" y="52" textAnchor="middle" fill="#13B5EA" fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="600" opacity="0.7" letterSpacing="1">SYNCHRONISE</text>
                          </g>

                          {/* === Xero circle (right) === */}
                          <g transform="translate(264,14)">
                            <circle cx="36" cy="36" r="36" fill="url(#en-xero-grad)" opacity="0.95"/>
                            <circle cx="36" cy="36" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
                            <text x="36" y="41" textAnchor="middle" fill="white" fontSize="17" fontFamily="system-ui, sans-serif" fontWeight="300" letterSpacing="1.5">xero</text>
                            <text x="36" y="88" textAnchor="middle" fill={posTheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)'} fontSize="8.5" fontFamily="system-ui, sans-serif" fontWeight="500">Accounting</text>
                          </g>
                        </svg>
                      </div>

                      {/* Card header */}
                      <div className={`px-4 py-4 border-b ${posTheme === 'dark' ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" style={{ background: 'linear-gradient(135deg,#13B5EA,#0a8ab5)' }}>
                              <svg viewBox="0 0 40 20" className="w-8 h-4" xmlns="http://www.w3.org/2000/svg">
                                <text x="20" y="15" textAnchor="middle" fill="white" fontSize="14" fontFamily="system-ui, sans-serif" fontWeight="300" letterSpacing="1">xero</text>
                              </svg>
                            </div>
                            <div>
                              <h3 className={`text-base font-semibold leading-tight ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>XERO Accounting</h3>
                              <p className={`text-xs mt-0.5 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Connect your XERO account for seamless accounting</p>
                            </div>
                          </div>
                          {(currentUser as any)?.xeroConnected ? (
                            <Badge className="self-start sm:self-auto bg-green-500/15 text-green-500 border-green-500/30 flex items-center gap-1 px-2.5 py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"/>
                              Connected
                            </Badge>
                          ) : (
                            <Badge className="self-start sm:self-auto bg-gray-500/15 text-gray-400 border-gray-500/25 px-2.5 py-1">
                              Not Connected
                            </Badge>
                          )}
                        </div>

                        {(currentUser as any)?.xeroLastSync && (
                          <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${posTheme === 'dark' ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                            <Clock className="w-3.5 h-3.5 flex-shrink-0"/>
                            Last synced: {new Date((currentUser as any).xeroLastSync).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Setup steps */}
                      <div className={`px-4 py-4 ${posTheme === 'dark' ? 'bg-gray-800/40' : 'bg-gray-50/80'}`}>
                        <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Setup instructions</p>
                        <div className="space-y-2">
                          {[
                            "Go to the XERO Developer Portal and create a new app",
                            "Set the OAuth 2.0 redirect URI to your app's callback URL",
                            "Copy your Client ID and Client Secret",
                            "Click Connect to XERO below to authenticate",
                          ].map((step, i) => (
                            <div key={i} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${posTheme === 'dark' ? 'bg-gray-900/40' : 'bg-white border border-gray-100'}`}>
                              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: 'linear-gradient(135deg,#13B5EA,#0a8ab5)' }}>
                                {i + 1}
                              </div>
                              <span className={`text-sm leading-snug ${posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{step}</span>
                            </div>
                          ))}
                        </div>
                        <a
                          href="https://developer.xero.com/myapps/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#13B5EA] hover:text-[#0a8ab5] text-sm mt-3 transition-colors font-medium"
                        >
                          <Globe className="w-3.5 h-3.5"/>
                          XERO Developer Portal →
                        </a>
                      </div>

                      {/* Action buttons */}
                      <div className={`px-4 py-4 border-t ${posTheme === 'dark' ? 'border-gray-700 bg-gray-800/60' : 'border-gray-200 bg-white'}`}>
                        {(currentUser as any)?.xeroConnected ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={handleSyncXero}
                              disabled={isSyncingXero}
                              className="flex-1 sm:flex-none h-10 font-medium text-white"
                              style={{ background: 'linear-gradient(135deg,#13B5EA,#0a8ab5)' }}
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingXero ? 'animate-spin' : ''}`}/>
                              {isSyncingXero ? 'Syncing...' : 'Sync Now'}
                            </Button>
                            <Button
                              onClick={handleDisconnectXero}
                              disabled={isConnectingXero}
                              variant="outline"
                              className="flex-1 sm:flex-none h-10 border-red-500/40 text-red-400 hover:bg-red-500/10"
                            >
                              {isConnectingXero ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={handleConnectXero}
                            disabled={isConnectingXero}
                            className="w-full h-10 font-semibold text-white shadow-md"
                            style={{ background: 'linear-gradient(135deg,#13B5EA,#0a8ab5)' }}
                          >
                            <Link2 className="w-4 h-4 mr-2"/>
                            {isConnectingXero ? 'Connecting...' : 'Connect to XERO'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Data Sync Section — redesigned */}
                    <div className={`rounded-xl border ${posTheme === 'dark' ? 'border-gray-700 bg-gray-800/40' : 'border-gray-200 bg-white'}`}>
                      <div className={`px-4 py-3 border-b flex items-center gap-2 ${posTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" style={{ color: '#13B5EA' }} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd"/>
                        </svg>
                        <span className={`text-sm font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Data Synchronisation</span>
                        <span className={`text-xs ml-1 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>— when connected</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { icon: Users, label: 'Customers', xeroLabel: 'Contacts', dir: '↔', dirLabel: 'Two-way sync' },
                          { icon: Package, label: 'Products', xeroLabel: 'Items', dir: '↔', dirLabel: 'Two-way sync' },
                          { icon: Receipt, label: 'Invoices', xeroLabel: 'XERO', dir: '→', dirLabel: 'One-way push' },
                        ].map(({ icon: Icon, label, xeroLabel, dir, dirLabel }) => (
                          <div key={label} className={`rounded-lg p-3 border ${posTheme === 'dark' ? 'border-gray-700 bg-gray-900/40' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#13B5EA' }}/>
                              <span className={`text-sm font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${posTheme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white border border-gray-200 text-gray-600'}`}>{label}</span>
                              <span className="text-xs font-bold" style={{ color: '#13B5EA' }}>{dir}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${posTheme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white border border-gray-200 text-gray-600'}`}>{xeroLabel}</span>
                            </div>
                            <p className={`text-xs mt-1.5 ${posTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{dirLabel}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className={`${posTheme === 'dark' ? 'bg-gray-800/50 backdrop-blur-xl border-red-900/40' : 'bg-white border-red-200'} shadow-2xl`}>
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
        <DialogContent className={`w-[calc(100vw-2rem)] sm:w-auto sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{editingPO ? `Edit ${editingPO.poNumber}` : "New Purchase Order"}</DialogTitle>
            <DialogDescription className={posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{editingPO ? "Update purchase order details" : "Create a new purchase order for a supplier"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className={`rounded-xl p-4 border space-y-3 ${posTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-[hsl(217,90%,50%)] uppercase tracking-wider">Supplier Details</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {suppliers.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-[hsl(217,90%,30%)] text-[hsl(217,90%,50%)] hover:text-white hover:bg-[hsl(217,90%,25%)] bg-[hsl(217,90%,15%)] text-xs h-8 gap-1.5">
                          <Users className="h-3 w-3" />
                          Select Supplier
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-700 min-w-[220px] max-h-60 overflow-y-auto">
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
                  <Button variant="outline" size="sm" onClick={handleSaveSupplier} disabled={!poSupplierName || saveSupplierMutation.isPending} className="border-green-600/40 text-green-600 hover:text-green-700 hover:bg-green-50 bg-green-50/50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-500/10 dark:bg-green-500/5 text-xs h-8 gap-1.5">
                    <Check className="h-3 w-3" />
                    {saveSupplierMutation.isPending ? "Saving..." : "Save Supplier"}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Supplier Name *</Label><Input value={poSupplierName} onChange={(e) => setPOSupplierName(e.target.value)} className={`mt-1 ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Supplier company name" /></div>
                <div><Label className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Email</Label><Input type="email" value={poSupplierEmail} onChange={(e) => setPOSupplierEmail(e.target.value)} className={`mt-1 ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="supplier@example.com" /></div>
                <div><Label className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Phone</Label><Input type="tel" value={poSupplierPhone} onChange={(e) => setPOSupplierPhone(e.target.value)} className={`mt-1 ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="+27 12 345 6789" /></div>
                <div><Label className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Expected Delivery</Label><Input type="date" value={poExpectedDate} onChange={(e) => setPOExpectedDate(e.target.value)} className={`mt-1 ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} /></div>
              </div>
              <div><Label className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Address</Label><Textarea value={poSupplierAddress} onChange={(e) => setPOSupplierAddress(e.target.value)} className={`mt-1 ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Supplier address" rows={2} /></div>
            </div>

            <div className={`rounded-xl p-4 border space-y-3 ${posTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-[hsl(217,90%,50%)] uppercase tracking-wider">Order Items</h3>
                <div className="flex flex-wrap gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className={`text-xs h-8 ${posTheme === 'dark' ? 'border-gray-700 text-gray-300 hover:text-white bg-gray-800' : 'border-gray-300 text-gray-700 hover:text-gray-900 bg-white'}`}>
                        <Package className="h-3 w-3 mr-1" />Add Product
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-700 max-h-60 overflow-y-auto">
                      {(products || []).map((product: any) => (
                        <DropdownMenuItem key={product.id} onClick={() => addPOItem(product)} className="text-gray-300 hover:text-white">
                          <div className="flex justify-between w-full"><span>{product.name}</span><span className="text-gray-500 ml-4">R{parseFloat(product.costPrice || product.retailPrice).toFixed(2)}</span></div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" onClick={() => addPOItem()} className={`text-xs h-8 ${posTheme === 'dark' ? 'border-gray-700 text-gray-300 hover:text-white bg-gray-800' : 'border-gray-300 text-gray-700 hover:text-gray-900 bg-white'}`}>
                    <Plus className="h-3 w-3 mr-1" />Custom Item
                  </Button>
                </div>
              </div>
              {poItems.length === 0 ? (
                <div className={`text-center py-8 ${posTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}><Package className="h-8 w-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No items added yet</p></div>
              ) : (
                <div className="space-y-2">
                  {poItems.map((item: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg border space-y-2 ${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <input type="text" value={item.name} onChange={(e) => { const u = [...poItems]; u[index] = { ...u[index], name: e.target.value, productId: null }; setPOItems(u); }} className={`flex-1 min-w-0 bg-transparent border-b focus:outline-none text-sm font-medium px-0 py-0.5 ${posTheme === 'dark' ? 'border-gray-600 focus:border-blue-400 text-white' : 'border-gray-300 focus:border-blue-500 text-gray-900'}`} placeholder="Item name" />
                        {item.sku && <span className={`text-xs ${posTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{item.sku}</span>}
                        <Button variant="ghost" size="sm" onClick={() => setPOItems(poItems.filter((_: any, i: number) => i !== index))} className="shrink-0 h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className={`text-xs ${posTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Qty</span>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => { const u = [...poItems]; u[index] = { ...u[index], quantity: Math.max(1, parseInt(e.target.value) || 1) }; setPOItems(u); }} className={`w-12 bg-transparent border-b focus:outline-none text-sm text-center px-0 py-0.5 ${posTheme === 'dark' ? 'border-gray-600 focus:border-blue-400 text-white' : 'border-gray-300 focus:border-blue-500 text-gray-900'}`} />
                        <span className={posTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>× R</span>
                        <input type="number" step="0.01" min="0" value={item.costPrice} onChange={(e) => { const u = [...poItems]; u[index] = { ...u[index], costPrice: parseFloat(e.target.value) || 0 }; setPOItems(u); }} className={`w-20 bg-transparent border-b focus:outline-none text-sm px-0 py-0.5 ${posTheme === 'dark' ? 'border-gray-600 focus:border-blue-400 text-white' : 'border-gray-300 focus:border-blue-500 text-gray-900'}`} />
                        <span className={`ml-auto font-semibold text-sm ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>= R{(item.costPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`rounded-xl p-4 border space-y-3 ${posTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>VAT %</Label><Input type="number" value={poTaxPercent} onChange={(e) => setPOTaxPercent(parseFloat(e.target.value) || 0)} className={`mt-1 ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} /></div>
                <div><Label className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Shipping (R)</Label><Input type="number" step="0.01" value={poShippingAmount} onChange={(e) => setPOShippingAmount(parseFloat(e.target.value) || 0)} className={`mt-1 ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} /></div>
              </div>
              {(() => {
                const subtotal = poItems.reduce((sum: number, item: any) => sum + (item.costPrice * item.quantity), 0);
                const taxAmount = subtotal * (poTaxPercent / 100);
                const total = subtotal + taxAmount + poShippingAmount;
                return (
                  <div className={`space-y-1 pt-2 border-t ${posTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                    <div className={`flex justify-between text-sm ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
                    {poTaxPercent > 0 && <div className={`flex justify-between text-sm ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><span>VAT ({poTaxPercent}%)</span><span>R{taxAmount.toFixed(2)}</span></div>}
                    {poShippingAmount > 0 && <div className={`flex justify-between text-sm ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}><span>Shipping</span><span>R{poShippingAmount.toFixed(2)}</span></div>}
                    <div className={`flex justify-between text-lg font-bold pt-1 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}><span>Total</span><span className="text-[hsl(217,90%,50%)]">R{total.toFixed(2)}</span></div>
                  </div>
                );
              })()}
            </div>

            <div><Label className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Notes</Label><Textarea value={poNotes} onChange={(e) => setPONotes(e.target.value)} className={`mt-1 ${posTheme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Additional notes..." rows={2} /></div>

            <Button onClick={handleSubmitPO} disabled={createPOMutation.isPending || updatePOMutation.isPending} className="w-full bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white py-3 text-base font-semibold shadow-lg shadow-blue-900/30">
              {(createPOMutation.isPending || updatePOMutation.isPending) ? "Saving..." : editingPO ? "Update Purchase Order" : "Create Purchase Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Purchase Order View Panel */}
      <Dialog open={isPOViewOpen} onOpenChange={setIsPOViewOpen}>
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-lg max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold flex items-center gap-3 ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-[hsl(217,90%,60%)] font-mono">{selectedPO?.poNumber}</span>
              {selectedPO && getPOStatusBadge(selectedPO.status)}
            </DialogTitle>
            <DialogDescription className={posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Purchase order details</DialogDescription>
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
        <AlertDialogContent className={`${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={posTheme === 'dark' ? 'text-white' : 'text-gray-900'}>Delete Purchase Order</AlertDialogTitle>
            <AlertDialogDescription className={posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Are you sure you want to delete this purchase order? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingPOId && deletePOMutation.mutate(deletingPOId)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[500px] max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`} aria-describedby="customer-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <div id="customer-dialog-description" className={`text-sm ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
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
                    <FormLabel className={posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Customer Name *</FormLabel>
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
                  className="bg-transparent border border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 transition-all duration-300"
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
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
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
        <DialogContent className={`w-[calc(100vw-2rem)] sm:w-auto sm:max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 rounded-2xl border ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} shadow-2xl`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(217,90%,35%)] to-[hsl(217,90%,25%)] px-5 py-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className={posTheme === 'dark' ? 'text-white font-bold text-base sm:text-lg leading-tight truncate' : 'text-gray-900 font-bold text-base sm:text-lg leading-tight truncate'}>
                {selectedOpenAccount?.accountName}
              </DialogTitle>
              <DialogDescription className="text-blue-200 text-xs mt-0.5">
                Account Details & Settlement
              </DialogDescription>
            </div>
          </div>

          {selectedOpenAccount && (
            <div className="px-5 py-4 space-y-4">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-3.5 border ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Account Type</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${selectedOpenAccount.accountType === 'table' ? 'bg-indigo-500' : 'bg-teal-500'}`} />
                    <span className={`font-semibold text-sm capitalize ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedOpenAccount.accountType === 'table' ? 'Table' : 'Customer'}</span>
                  </div>
                </div>
                <div className={`rounded-xl p-3.5 border ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-[10px] uppercase tracking-wider font-bold mb-2 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Amount</p>
                  <p className="text-2xl font-bold text-[hsl(217,90%,50%)] tracking-tight">R{selectedOpenAccount.total}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedOpenAccount.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2 dark:bg-amber-500/10 dark:border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className={`text-sm ${posTheme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>{selectedOpenAccount.notes}</p>
                </div>
              )}

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                    <p className={`font-semibold text-sm ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Items ({Array.isArray(selectedOpenAccount.items) ? selectedOpenAccount.items.length : 0})
                    </p>
                  </div>
                  {Array.isArray(selectedOpenAccount.items) && selectedOpenAccount.items.length > 0 && (
                    <button
                      onClick={() => {
                        const allIndices = selectedOpenAccount.items.map((_, index) => index);
                        const allSelected = allIndices.every(index => selectedItemsForPrint.includes(index));
                        setSelectedItemsForPrint(allSelected ? [] : allIndices);
                      }}
                      className="text-xs font-semibold text-[hsl(217,90%,50%)] hover:text-[hsl(217,90%,40%)] transition-colors px-2 py-1 rounded-lg"
                    >
                      {selectedItemsForPrint.length === selectedOpenAccount.items.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {Array.isArray(selectedOpenAccount.items) && selectedOpenAccount.items.map((item: any, index: number) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${selectedItemsForPrint.includes(index) ? (posTheme === 'dark' ? 'bg-[hsl(217,90%,40%)]/15 border-[hsl(217,90%,40%)]/40' : 'bg-blue-50 border-blue-200') : (posTheme === 'dark' ? 'bg-gray-800/60 border-gray-700 hover:border-gray-600' : 'bg-gray-50 border-gray-200 hover:border-gray-300')}`}>
                      <input
                        type="checkbox"
                        checked={selectedItemsForPrint.includes(index)}
                        onChange={(e) => handleItemCheckboxChange(index, e.target.checked)}
                        className="h-4 w-4 rounded accent-[hsl(217,90%,50%)] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                        <p className={`text-xs ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>R{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${posTheme === 'dark' ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-200'}`}>×{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItemClick(selectedOpenAccount.id, index)}
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                          disabled={removeItemFromOpenAccountMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip Toggle */}
              <div className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-3 ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div>
                  <p className={`text-sm font-semibold ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tip Option</p>
                  <p className={`text-xs mt-0.5 ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{openAccountTipEnabled ? 'Tip lines will appear on receipt' : 'Add tip option to receipt'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenAccountTipEnabled(!openAccountTipEnabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${openAccountTipEnabled ? 'bg-[hsl(217,90%,45%)]' : (posTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-300')}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${openAccountTipEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleQuickPrint}
                    disabled={selectedItemsForPrint.length === 0}
                    className={`flex-1 h-10 font-medium ${posTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} disabled:opacity-40`}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Quick Print ({selectedItemsForPrint.length})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOpenAccount(null);
                      setSelectedItemsForPrint([]);
                      setOpenAccountTipEnabled(false);
                    }}
                    className={`flex-1 h-10 font-medium ${posTheme === 'dark' ? 'border-gray-600 text-gray-200 hover:text-white hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    const paymentType = 'cash';
                    closeOpenAccountMutation.mutate({
                      accountId: selectedOpenAccount.id,
                      paymentType,
                      tipEnabled: openAccountTipEnabled
                    });
                    setSelectedOpenAccount(null);
                    setSelectedItemsForPrint([]);
                    setOpenAccountTipEnabled(false);
                  }}
                  disabled={closeOpenAccountMutation.isPending}
                  className="w-full h-11 bg-transparent border border-[hsl(217,90%,50%)] text-[hsl(217,90%,50%)] hover:bg-[hsl(217,90%,50%)]/10 font-bold text-base transition-all duration-300"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  {closeOpenAccountMutation.isPending ? 'Closing...' : 'Close & Pay'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Rename Open Account Dialog */}
      <Dialog open={!!editingOpenAccount} onOpenChange={(open) => { if (!open) { setEditingOpenAccount(null); setEditOpenAccountName(""); } }}>
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-sm ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} shadow-2xl rounded-2xl p-0 overflow-hidden`}>
          <div className="relative bg-gradient-to-r from-[hsl(217,90%,30%)]/40 via-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,30%)]/40 border-b border-gray-700/50 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,30%)] shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Edit className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className={posTheme === 'dark' ? 'text-white font-bold text-base' : 'text-gray-900 font-bold text-base'}>Rename Account</DialogTitle>
                <DialogDescription className="text-[hsl(217,90%,70%)] text-xs">Update the account display name</DialogDescription>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium uppercase tracking-wider block mb-1.5">Account Name</label>
              <Input
                value={editOpenAccountName}
                onChange={(e) => setEditOpenAccountName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && editOpenAccountName.trim() && editingOpenAccount) updateOpenAccountNameMutation.mutate({ accountId: editingOpenAccount.id, accountName: editOpenAccountName.trim() }); }}
                className={`${posTheme === 'dark' ? 'bg-gray-800 border-gray-700/50 text-white' : 'bg-white border-gray-200 text-gray-900'} focus:border-[hsl(217,90%,40%)]/60 h-10`}
                placeholder="Enter account name"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-gray-600/60 text-gray-300 hover:bg-gray-800 bg-transparent h-9" onClick={() => { setEditingOpenAccount(null); setEditOpenAccountName(""); }}>Cancel</Button>
              <Button
                className="flex-1 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,40%)] text-white h-9 font-semibold"
                disabled={!editOpenAccountName.trim() || updateOpenAccountNameMutation.isPending}
                onClick={() => { if (editingOpenAccount) updateOpenAccountNameMutation.mutate({ accountId: editingOpenAccount.id, accountName: editOpenAccountName.trim() }); }}
              >
                {updateOpenAccountNameMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add Products to Category Dialog */}
      <Dialog open={isAddProductsToCategoryOpen} onOpenChange={setIsAddProductsToCategoryOpen}>
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[600px] ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} shadow-2xl max-h-[85vh] overflow-y-auto`}>
          <DialogHeader className={posTheme === 'dark' ? 'border-b border-gray-700/50 pb-4' : 'border-b border-gray-200 pb-4'}>
            <DialogTitle className={`${posTheme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Plus className="w-5 h-5 text-[hsl(217,90%,50%)]" />
              Add Products to Category
            </DialogTitle>
            <DialogDescription className={posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
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
                        <p className={posTheme === 'dark' ? 'font-medium text-white' : 'font-medium text-gray-900'}>{product.name}</p>
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
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
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
        posTheme={posTheme}
      />
      <ReceiptCustomizerDialog
        isOpen={isInvoiceSetupOpen}
        onClose={() => setIsInvoiceSetupOpen(false)}
        currentUser={currentUser}
        setCurrentUser={(u) => { setCurrentUser(u); localStorage.setItem('posUser', JSON.stringify(u)); }}
        toast={toast}
        invoiceSetupOnly={true}
        posTheme={posTheme}
      />
      {/* Staff Password Verification Dialog */}
      <Dialog open={isStaffPasswordDialogOpen} onOpenChange={(open) => {
        setIsStaffPasswordDialogOpen(open);
        if (!open) {
          setStaffPassword("");
          setSelectedStaffForAuth(null);
        }
      }}>
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
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
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
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
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-2xl max-h-[85vh] p-0 ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} shadow-2xl overflow-hidden`}>
          {/* Header */}
          <div className={posTheme === 'dark' ? 'bg-gradient-to-r from-[hsl(217,30%,18%)] to-[hsl(217,30%,15%)] px-6 py-5 border-b border-gray-700/50' : 'bg-gray-50 px-6 py-5 border-b border-gray-200'}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] shadow-lg shadow-blue-500/30">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className={posTheme === 'dark' ? 'text-xl font-bold text-white' : 'text-xl font-bold text-gray-900'}>
                  {staffAccounts.length === 0 ? "Create Your First User" : "User Management"}
                </DialogTitle>
                <DialogDescription className={posTheme === 'dark' ? 'text-gray-400 text-sm mt-0.5' : 'text-gray-500 text-sm mt-0.5'}>
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
                  <h3 className={posTheme === 'dark' ? 'text-sm font-semibold uppercase tracking-wider text-gray-400' : 'text-sm font-semibold uppercase tracking-wider text-gray-500'}>Team Members</h3>
                  <div className={posTheme === 'dark' ? 'flex-1 h-px bg-gray-700/50 ml-2' : 'flex-1 h-px bg-gray-200 ml-2'}></div>
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
                            : posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
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
                            <span className={posTheme === 'dark' ? 'font-semibold text-white truncate' : 'font-semibold text-gray-900 truncate'}>
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
                <h3 className={posTheme === 'dark' ? 'text-sm font-semibold uppercase tracking-wider text-gray-400' : 'text-sm font-semibold uppercase tracking-wider text-gray-500'}>Add New User</h3>
                <div className={posTheme === 'dark' ? 'flex-1 h-px bg-gray-700/50 ml-2' : 'flex-1 h-px bg-gray-200 ml-2'}></div>
              </div>
              <div className={posTheme === 'dark' ? 'bg-gray-800/30 rounded-xl border border-gray-700/50 p-5' : 'bg-gray-50 rounded-xl border border-gray-200 p-5'}>
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
                      <Label className={posTheme === 'dark' ? 'text-gray-300 text-sm font-medium mb-2 block' : 'text-gray-700 text-sm font-medium mb-2 block'}>Username</Label>
                      <Input
                        id="new-username"
                        name="new-username"
                        type="text"
                        required
                        placeholder="Enter name"
                        className={`${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20`}
                      />
                    </div>
                    <div>
                      <Label className={posTheme === 'dark' ? 'text-gray-300 text-sm font-medium mb-2 block' : 'text-gray-700 text-sm font-medium mb-2 block'}>Password</Label>
                      <Input
                        id="new-password"
                        name="new-password"
                        type="password"
                        required
                        placeholder="Enter password"
                        className={`${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'} focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20`}
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <Label className={posTheme === 'dark' ? 'text-gray-300 text-sm font-medium mb-2 block' : 'text-gray-700 text-sm font-medium mb-2 block'}>Role</Label>
                    <Select name="user-type" required defaultValue={staffAccounts.length === 0 ? "management" : "staff"}>
                      <SelectTrigger className={posTheme === 'dark' ? 'bg-gray-900/50 border-gray-700 text-white focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20' : 'bg-white border-gray-300 text-gray-900 focus:border-[hsl(217,90%,50%)] focus:ring-[hsl(217,90%,50%)]/20'}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className={posTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                        <SelectItem value="staff" className={posTheme === 'dark' ? 'text-white hover:bg-gray-700 focus:bg-gray-700' : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100'}>Staff</SelectItem>
                        <SelectItem value="management" className={posTheme === 'dark' ? 'text-white hover:bg-gray-700 focus:bg-gray-700' : 'text-gray-900 hover:bg-gray-100 focus:bg-gray-100'}>Manager</SelectItem>
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
          <div className={`${posTheme === 'dark' ? 'bg-gray-900/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'} border-t px-6 py-4 flex justify-end`}>
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
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[400px] max-h-[85vh] overflow-y-auto">
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
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
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
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-md max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
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
        <DialogContent className={`w-[calc(100vw-2rem)] sm:w-auto sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 rounded-2xl border shadow-2xl ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(217,90%,35%)] to-[hsl(217,90%,22%)] px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <DialogTitle className={posTheme === 'dark' ? 'text-white font-bold text-lg leading-tight' : 'text-gray-900 font-bold text-lg leading-tight'}>Payment Details</DialogTitle>
              <DialogDescription className="text-blue-200 text-xs mt-0.5">Bank account for Storm POS service fee payments</DialogDescription>
            </div>
          </div>

          <div className="px-5 py-5 space-y-4">
            {/* Bank card */}
            <div className={`rounded-xl border overflow-hidden ${posTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
              {/* Card header */}
              <div className={`px-4 py-3 flex items-center gap-3 border-b ${posTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="w-9 h-9 rounded-lg bg-[hsl(217,90%,50%)] flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                </div>
                <div>
                  <p className={`font-bold text-sm ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Nedbank Account</p>
                  <p className={`text-xs ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>For Storm POS service fee payments</p>
                </div>
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">VERIFIED</span>
              </div>

              {/* Fields */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  { label: 'Account Holder', value: 'Storm', copy: false },
                  { label: 'Account Number', value: '1229368612', copy: true },
                  { label: 'Account Type', value: 'Current Account', copy: false },
                  { label: 'Bank Name', value: 'Nedbank', copy: false },
                  { label: 'Branch Code', value: '198765', copy: true },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 gap-3 ${posTheme === 'dark' ? 'divide-gray-800' : ''}`}>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${posTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</p>
                      <p className={`font-bold text-sm ${item.copy ? 'font-mono' : ''} ${posTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                    </div>
                    {item.copy && (
                      <button
                        onClick={() => navigator.clipboard.writeText(item.value)}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors ${posTheme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                        title={`Copy ${item.label}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className={`rounded-xl border p-4 ${posTheme === 'dark' ? 'bg-amber-950/30 border-amber-800/40' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <h4 className={`font-bold text-sm ${posTheme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`}>Payment Instructions</h4>
              </div>
              <ul className="space-y-2">
                {[
                  'Use your registered business name as the payment reference',
                  'Pay monthly service fees by the last day of each month',
                  'Keep proof of payment for your records',
                ].map((instruction, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${posTheme === 'dark' ? 'bg-amber-800/60 text-amber-300' : 'bg-amber-200 text-amber-700'}`}>{i + 1}</span>
                    <span className={`text-sm leading-snug ${posTheme === 'dark' ? 'text-amber-200/80' : 'text-amber-800'}`}>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support contact */}
            <div className={`rounded-xl border px-4 py-3.5 flex items-center gap-3 ${posTheme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className="w-8 h-8 rounded-lg bg-[hsl(217,90%,50%)] flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-medium ${posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Billing or payment questions?</p>
                <a href="mailto:softwarebystorm@gmail.com" className="text-[hsl(217,90%,50%)] font-semibold text-sm hover:underline">softwarebystorm@gmail.com</a>
              </div>
            </div>

            <Button
              onClick={() => setIsBankDetailsOpen(false)}
              className="w-full h-11 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-bold text-base rounded-xl shadow-lg shadow-blue-900/20"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Category Management Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className={`w-[calc(100vw-1rem)] sm:w-auto sm:max-w-[500px] max-h-[85vh] overflow-y-auto ${posTheme === 'dark' ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} shadow-2xl`}>
          <DialogHeader>
            <DialogTitle className={`${posTheme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Folder className="w-5 h-5 text-[hsl(217,90%,50%)]" />
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
            <DialogDescription className={posTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {editingCategory ? 'Update category details below.' : 'Create a new category to organize your products.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className={posTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Category Name</Label>
              <Input 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Beverages, Food, Electronics"
                className={`mt-2 ${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'}`}
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
                    className={`w-8 h-8 rounded-full transition-all ${categoryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-100' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Existing Categories List */}
            {categories.length > 0 && !editingCategory && (
              <div>
                <Label className={posTheme === 'dark' ? 'text-gray-300 mb-2 block' : 'text-gray-700 mb-2 block'}>Existing Categories</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {categories.map((cat) => (
                    <div key={cat.id} className={`flex items-center justify-between ${posTheme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50 border-gray-200'} border rounded-lg px-3 py-2`}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color || '#3b82f6' }} />
                        <span className={posTheme === 'dark' ? 'text-white' : 'text-gray-900'}>{cat.name}</span>
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
            <Button variant="outline" onClick={() => { setIsCategoryDialogOpen(false); setEditingCategory(null); }} className={posTheme === 'dark' ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}>
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
            setIsCustomClient(true);
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
            setInvoiceCustomFieldValues(getInvoiceVisDefs());
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-0.5rem)] sm:w-[92vw] sm:max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0">
          {/* Sticky Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-white shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900 leading-tight">
                {editingInvoice ? 'Edit' : 'New'} {invoiceType === 'invoice' ? 'Invoice' : 'Quote'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
            </div>
            {/* Doc type tab switcher */}
            {!editingInvoice && (
              <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => setInvoiceType('invoice')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${invoiceType === 'invoice' ? 'bg-white text-[hsl(217,90%,40%)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceType('quote')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${invoiceType === 'quote' ? 'bg-white text-[hsl(217,90%,40%)] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Quote
                </button>
              </div>
            )}
            {editingInvoice && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                {invoiceType === 'invoice' ? 'Invoice' : 'Quote'}
              </span>
            )}
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto flex-1 bg-gray-50 px-3 sm:px-5 py-4 space-y-3">{/* section gap */}

            {/* Section: Client */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Client</h3>
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
                  className="ml-auto text-xs text-[hsl(217,90%,40%)] hover:underline font-medium"
                >
                  {isCustomClient ? "Select from list" : "Enter custom client"}
                </button>
              </div>
              <div className="p-4 space-y-4 bg-white">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Client *</Label>
                  {isCustomClient ? (
                    <input
                      type="text"
                      value={invoiceCustomClient}
                      onChange={(e) => setInvoiceCustomClient(e.target.value)}
                      placeholder="Enter client name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] bg-gray-50"
                    />
                  ) : (
                    <Select
                      value={invoiceClientId?.toString() || ""}
                      onValueChange={(value) => setInvoiceClientId(parseInt(value))}
                    >
                      <SelectTrigger className="text-sm">
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
                {(invoiceCardColumns.has('clientEmail') || invoiceCardColumns.has('clientPhone')) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {invoiceCardColumns.has('clientEmail') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</Label>
                        <input
                          type="email"
                          value={invoiceClientEmail}
                          onChange={(e) => setInvoiceClientEmail(e.target.value)}
                          placeholder="client@example.com"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] bg-gray-50"
                        />
                      </div>
                    )}
                    {invoiceCardColumns.has('clientPhone') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone</Label>
                        <input
                          type="tel"
                          value={invoiceClientPhone}
                          onChange={(e) => setInvoiceClientPhone(e.target.value)}
                          placeholder="+27 12 345 6789"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] bg-gray-50"
                        />
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
                  <h3 className="font-semibold text-gray-800 text-sm">Document Details</h3>
                </div>
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {invoiceCardColumns.has('poNumber') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">PO Number</Label>
                        <input
                          type="text"
                          value={invoicePoNumber}
                          onChange={(e) => setInvoicePoNumber(e.target.value)}
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] bg-gray-50"
                        />
                      </div>
                    )}
                    {invoiceCardColumns.has('dueTerms') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Payment Terms</Label>
                        <Select value={invoiceDueTerms} onValueChange={setInvoiceDueTerms}>
                          <SelectTrigger className="text-sm">
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
                    )}
                    {invoiceCardColumns.has('dueDate') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Due Date</Label>
                        <input
                          type="date"
                          value={invoiceDueDate}
                          onChange={(e) => setInvoiceDueDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] bg-gray-50"
                        />
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
                <h3 className="font-semibold text-gray-800 text-sm">Line Items</h3>
                <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{invoiceItems.length} {invoiceItems.length === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="bg-white p-4 space-y-3">
                <div className="space-y-2">
                {invoiceItems.map((item, index) => {
                  const product = item.productId ? products.find(p => p.id === item.productId) : null;
                  const itemName = item.customName || product?.name || 'Unknown Product';
                  return (
                    <div key={index} className="p-2 border rounded space-y-1.5">
                      {/* Row 1: Product name + delete */}
                      <div className="flex items-center gap-2">
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== index))}
                          className="shrink-0 h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* Row 2: Qty x Price = Total */}
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-xs text-gray-400">Qty</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...invoiceItems];
                            updated[index] = { ...updated[index], quantity: Math.max(1, parseInt(e.target.value) || 1) };
                            setInvoiceItems(updated);
                          }}
                          className="w-12 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm text-center px-0 py-0.5"
                        />
                        <span className="text-gray-400">x</span>
                        <span className="text-xs text-gray-400">R</span>
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
                        <span className="ml-auto font-medium text-sm">= R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
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
                
              </div>
              </div>
            </div>

            {/* Section: Totals */}
            {(() => {
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
                    <h3 className="font-semibold text-gray-800 text-sm">Totals</h3>
                  </div>
                  <div className="bg-white px-5 py-4 space-y-3">
                    <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span className="font-medium text-gray-900">R{subtotal.toFixed(2)}</span></div>

                    {invoiceCardColumns.has('discount') && (
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Discount</span>
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

                    {discountAmt > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Discount Applied</span><span className="text-red-500">-R{discountAmt.toFixed(2)}</span></div>}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>VAT (15%)</span>
                        <Switch checked={invoiceTaxEnabled} onCheckedChange={setInvoiceTaxEnabled} />
                      </div>
                      {invoiceTaxEnabled && <span className="font-medium text-gray-900">R{taxAmt.toFixed(2)}</span>}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">R</span>
                        <input type="number" value={invoiceShippingAmount} onChange={(e) => setInvoiceShippingAmount(e.target.value)} className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-right text-sm bg-gray-50 focus:outline-none focus:border-[hsl(217,90%,40%)]" min="0" step="0.01" />
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-200">
                      <span className="text-gray-900">Total Due</span>
                      <span className="text-[hsl(217,90%,40%)]">R{total.toFixed(2)}</span>
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
                  <h3 className="font-semibold text-gray-800 text-sm">Payment</h3>
                </div>
                <div className="bg-white p-4 space-y-3">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Payment Method</Label>
                    <Select value={invoicePaymentMethod} onValueChange={setInvoicePaymentMethod}>
                      <SelectTrigger className="text-sm">
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

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Details</Label>
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
                          <SelectTrigger className="w-40 h-7 text-xs">
                            <SelectValue placeholder="Saved Details" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedPaymentDetails.map((saved: any) => (
                              <SelectItem key={saved.id} value={saved.id.toString()}>
                                {saved.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <textarea
                      value={invoicePaymentDetails}
                      onChange={(e) => setInvoicePaymentDetails(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] resize-none"
                      rows={2}
                      placeholder="Bank details, payment instructions, etc..."
                    />
                    {invoicePaymentDetails.trim() && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs h-7"
                        onClick={() => setIsSavePaymentDialogOpen(true)}
                      >
                        <PlusCircle className="w-3 h-3 mr-1" />
                        Save as Template
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
                  <h3 className="font-semibold text-gray-800 text-sm">Notes & Terms</h3>
                </div>
                <div className="bg-white p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {invoiceCardColumns.has('notes') && (
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Notes <span className="normal-case text-gray-400 font-normal">({invoiceNotes.length}/300)</span></Label>
                        <textarea
                          value={invoiceNotes}
                          onChange={(e) => setInvoiceNotes(e.target.value.slice(0, 300))}
                          maxLength={300}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] resize-none"
                          rows={3}
                          placeholder="Additional notes..."
                        />
                      </div>
                    )}
                    <div>
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Terms & Conditions <span className="normal-case text-gray-400 font-normal">({invoiceTerms.length}/500)</span></Label>
                      <textarea
                        value={invoiceTerms}
                        onChange={(e) => setInvoiceTerms(e.target.value.slice(0, 500))}
                        maxLength={500}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[hsl(217,90%,40%)] resize-none"
                        rows={3}
                        placeholder="Enter payment terms and conditions..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section: Options */}
            {(() => {
              const invoiceCfSettings = mergeReceiptSettings(currentUser?.receiptSettings);
              const invoiceCfs = (invoiceCfSettings as any).invoiceSettings?.customFields || [];
              return (
                <div className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-[hsl(217,90%,40%)]/10 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm">Options</h3>
                  </div>
                  <div className="bg-white p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Show Business Information</p>
                        <p className="text-xs text-gray-400 mt-0.5">Display your company details in the PDF</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInvoiceShowBusinessInfo(!invoiceShowBusinessInfo)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          invoiceShowBusinessInfo
                            ? 'bg-[hsl(217,90%,40%)] text-white border-[hsl(217,90%,40%)]'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {invoiceShowBusinessInfo ? <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                        {invoiceShowBusinessInfo ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                    {invoiceCfs.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom Fields</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {invoiceCfs.map((field: any) => (
                            <div key={field.id}>
                              <Label className="text-xs font-medium text-gray-600 mb-1 block">{field.label}</Label>
                              <input
                                type="text"
                                value={invoiceCustomFieldValues[`cf_${field.id}`] || ''}
                                onChange={(e) => setInvoiceCustomFieldValues((prev: any) => ({ ...prev, [`cf_${field.id}`]: e.target.value }))}
                                placeholder={field.placeholder || field.label}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-[hsl(217,90%,40%)]"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>{/* end scrollable body */}

          {/* Sticky Footer */}
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 bg-white shrink-0">
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)} className="px-5">
              Cancel
            </Button>
            <Button
                onClick={() => {
                  const trimmedCustomClient = invoiceCustomClient.trim();
                  if (isCustomClient) {
                    if (!trimmedCustomClient) {
                      toast({
                        title: "Missing Information",
                        description: "Please enter a client name",
                        variant: "destructive"
                      });
                      return;
                    }
                  } else {
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
                  let clientName: string;
                  if (isCustomClient) {
                    clientName = trimmedCustomClient;
                  } else {
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
                    className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-xs col-span-3 disabled:opacity-60"
                    data-testid="button-download-share-invoice"
                    disabled={invoicePdfBusy}
                    onClick={() => isTauriAndroid() ? generateInvoicePDF(selectedInvoice) : shareInvoice(selectedInvoice)}
                  >
                    {invoicePdfBusy ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Share2 className="w-3 h-3 mr-1" />}
                    {invoicePdfBusy ? 'Working...' : 'Download & Share'}
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
                      className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] disabled:opacity-60"
                      data-testid="button-download-share-invoice-desktop"
                      disabled={invoicePdfBusy}
                      onClick={() => isTauriAndroid() ? generateInvoicePDF(selectedInvoice) : shareInvoice(selectedInvoice)}
                    >
                      {invoicePdfBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                      {invoicePdfBusy ? 'Working...' : 'Download & Share'}
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
        <AlertDialogContent className={posTheme === 'dark' ? 'bg-gray-900 border border-red-900/40' : 'bg-white border border-red-200'}>
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
              className={posTheme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
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
                  const res = await apiFetch(`/api/pos/account/delete/${currentUser.id}`, { method: 'DELETE' });
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
              const response = await apiFetch(`/api/pos/user/${currentUser.id}/change-password`, {
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