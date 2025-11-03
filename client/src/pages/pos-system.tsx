import { useState, useEffect } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPosProductSchema, insertPosCustomerSchema, insertPosOpenAccountSchema, type InsertPosProduct, type PosProduct, type PosCustomer, type PosOpenAccount, type InsertPosOpenAccount } from "@shared/schema";
import { z } from "zod";
import { 
  ShoppingCart, Package, Users, BarChart3, Plus, Minus, Trash2, 
  CreditCard, DollarSign, Receipt, Search, LogOut, Edit, PlusCircle,
  Calendar, TrendingUp, FileText, Clock, Eye, Download, User, UserPlus, Settings, X, Printer,
  ChevronDown, Globe, BookOpen, HelpCircle
} from "lucide-react";
import stormLogo from "@assets/STORM (1)_1757446684640.png";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { TutorialGuide } from "@/components/TutorialGuide";
import { englishTutorialSteps } from "@/data/tutorialSteps";
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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false);
  const [highlightStaffButton, setHighlightStaffButton] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Handle tab change with role-based access control
  const handleTabChange = (tabValue: string) => {
    // If staff is management, allow all tabs
    if (currentStaff && currentStaff.userType === 'management') {
      setCurrentTab(tabValue);
      return;
    }

    // For staff users or no user logged in, only allow sales, customers, and open-accounts
    const allowedTabs = ['sales', 'customers', 'open-accounts'];
    
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

  // Check if user should see tutorial on first load
  useEffect(() => {
    if (currentUser && !currentUser.tutorialCompleted) {
      setShouldShowTutorial(true);
      setIsTutorialOpen(true);
    }
  }, [currentUser]);

  const handleTutorialComplete = () => {
    completeTutorialMutation.mutate();
  };

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
    onSuccess: (data) => {
      setCurrentStaff(data.staffAccount);
      setIsStaffPasswordDialogOpen(false);
      setStaffPassword("");
      setSelectedStaffForAuth(null);
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
    
    // Add userId to the data
    const dataWithUserId = { ...data, userId: 1 }; // Demo user ID
    
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: dataWithUserId });
    } else {
      createProductMutation.mutate(dataWithUserId);
    }
  };

  const handleCustomerSubmit = (data: z.infer<typeof customerFormSchema>) => {
    // Add userId to the data
    const dataWithUserId = { ...data, userId: 1 }; // Demo user ID
    
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



  // File upload handler with compression
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // PDF Receipt Generation
  const generateReceipt = (items: SaleItem[], total: string, customerName?: string, notes?: string, paymentType?: string, isOpenAccount = false, accountName?: string, staffName?: string, includeTipLines = false) => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Add company logo if available
    if (currentUser?.companyLogo) {
      try {
        doc.addImage(currentUser.companyLogo, 'JPEG', 20, yPosition, 30, 30);
        yPosition += 35;
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
      }
    }

    // Receipt title only
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(isOpenAccount ? 'ACCOUNT STATEMENT' : 'SALES RECEIPT', 20, yPosition);
    yPosition += 15;

    // Date and time
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 120, yPosition);
    yPosition += 10;

    // Staff member info
    if (staffName) {
      doc.text(`Served by: ${staffName}`, 20, yPosition);
      yPosition += 8;
    }

    // Customer or account info
    if (customerName) {
      doc.text(`Customer: ${customerName}`, 20, yPosition);
      yPosition += 8;
    }
    if (accountName) {
      doc.text(`Account: ${accountName}`, 20, yPosition);
      yPosition += 8;
    }

    yPosition += 5;

    // Items header
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 20, yPosition);
    doc.text('Qty', 120, yPosition);
    doc.text('Price', 150, yPosition);
    doc.text('Total', 175, yPosition);
    yPosition += 5;

    // Draw line
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;

    // Items
    doc.setFont('helvetica', 'normal');
    items.forEach(item => {
      const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
      
      // Item name (truncate if too long)
      let itemName = item.name;
      if (itemName.length > 25) {
        itemName = itemName.substring(0, 22) + '...';
      }
      
      doc.text(itemName, 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`R${item.price}`, 150, yPosition);
      doc.text(`R${itemTotal}`, 175, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    // Draw line
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 8;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL: R${total}`, 150, yPosition);
    yPosition += 15;

    // Tip lines if enabled
    if (includeTipLines) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      yPosition += 5;
      
      // Draw tip line
      doc.text('Tip: ', 20, yPosition);
      doc.line(35, yPosition, 100, yPosition);
      yPosition += 10;
      
      // Draw new total line
      doc.text('New Total: ', 20, yPosition);
      doc.line(50, yPosition, 100, yPosition);
      yPosition += 15;
    }

    // Payment method and notes
    if (paymentType) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Payment: ${paymentType.toUpperCase()}`, 20, yPosition);
      yPosition += 8;
    }

    if (notes) {
      doc.text(`Notes: ${notes}`, 20, yPosition);
      yPosition += 8;
    }

    yPosition += 10;
    doc.setFontSize(8);
    doc.text('Thank you for your business!', 20, yPosition);
    doc.text('Powered by Storm POS - stormsoftware.co.za', 20, yPosition + 5);

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

  // Tutorial completion mutation
  const completeTutorialMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("No user found");
      const response = await apiRequest("PUT", `/api/pos/user/${currentUser.id}/tutorial`, {
        completed: true,
        userEmail: currentUser.email,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete tutorial");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Update current user state with tutorial completion
      if (currentUser && data.user) {
        setCurrentUser({ ...currentUser, tutorialCompleted: true });
        // Also update localStorage if it exists
        const userData = localStorage.getItem('posUser');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            parsedUser.tutorialCompleted = true;
            localStorage.setItem('posUser', JSON.stringify(parsedUser));
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
        }
      }
      
      setShouldShowTutorial(false);
      setIsTutorialOpen(false);
      toast({ 
        title: "Tutorial Completed!", 
        description: "You can replay this tutorial anytime from the Tutorial button." 
      });
    },
    onError: (error: Error) => {
      console.error("Error completing tutorial:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save tutorial completion. Please try again.", 
        variant: "destructive" 
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
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 shadow-lg shadow-blue-900/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0 company-banner">
              <img 
                src={stormLogo} 
                alt="Storm POS" 
                className="h-40 sm:h-60 w-auto mix-blend-multiply"
                style={{ filter: 'drop-shadow(0 0 0 transparent)' }}
              />
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Tutorial Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTutorialOpen(true)}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-[hsl(217,90%,40%)] hover:text-[hsl(217,90%,35%)] hover:bg-blue-50"
                data-testid="tutorial-button"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Tutorial</span>
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

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex flex-col items-center" data-testid="profile-dropdown">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-10 w-10 rounded-full overflow-hidden bg-gray-100 hover:bg-gray-200"
                    >
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
                    </Button>
                    <ChevronDown className="h-3 w-3 text-gray-400 mt-1" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setIsLogoDialogOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    Change Profile Picture
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/pos/system/afrikaans'}>
                    <Globe className="mr-2 h-4 w-4" />
                    Switch to Afrikaans
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
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
                  {currentUser?.companyName || "Demo Account"}
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
                  onClick={() => handleTabChange("sales")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "sales"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mb-1" />
                  <span>Sales</span>
                </button>
                <button
                  onClick={() => handleTabChange("products")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "products"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Package className="h-4 w-4 mb-1" />
                  <span>Products</span>
                </button>
                <button
                  onClick={() => handleTabChange("customers")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "customers"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Users className="h-4 w-4 mb-1" />
                  <span>Customers</span>
                </button>
                <button
                  onClick={() => handleTabChange("open-accounts")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "open-accounts"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <FileText className="h-4 w-4 mb-1" />
                  <span>Accounts</span>
                </button>
                <button
                  onClick={() => handleTabChange("reports")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "reports"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mb-1" />
                  <span>Reports</span>
                </button>
                <button
                  onClick={() => handleTabChange("usage")}
                  className={`flex flex-col items-center justify-center min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    currentTab === "usage"
                      ? "bg-[hsl(217,90%,40%)] text-white shadow-lg shadow-blue-900/50"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1" />
                  <span>Usage</span>
                </button>
              </div>
            </div>

            {/* Desktop Tab Navigation */}
            <TabsList className="hidden md:grid w-full grid-cols-6 h-14 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-1.5 tabs-navigation shadow-lg shadow-blue-900/30">
              <TabsTrigger 
                value="sales" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-sales"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Sales</span>
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-products"
              >
                <Package className="h-4 w-4" />
                <span>Products</span>
              </TabsTrigger>
              <TabsTrigger 
                value="customers" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-customers"
              >
                <Users className="h-4 w-4" />
                <span>Customers</span>
              </TabsTrigger>
              <TabsTrigger 
                value="open-accounts" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-open-accounts"
              >
                <FileText className="h-4 w-4" />
                <span>Open Accounts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-reports"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
              <TabsTrigger 
                value="usage" 
                className="flex items-center space-x-2 h-10 rounded-lg data-[state=active]:bg-[hsl(217,90%,40%)] data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/50 text-gray-400 hover:text-white transition-all"
                data-testid="tab-usage"
              >
                <CreditCard className="h-4 w-4" />
                <span>Usage</span>
              </TabsTrigger>
            </TabsList>
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
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => addToSale(product)}
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                            <p className="text-sm text-gray-500">Stock: {product.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[hsl(217,90%,40%)]">
                              R{getProductPrice(product, selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.customerType || 'retail' : 'retail')}
                            </p>
                            {product.tradePrice && (
                              <p className="text-xs text-gray-500">
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
                              <p className="font-medium">{item.name}</p>
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
                              <span className="w-8 text-center">{item.quantity}</span>
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
                          <Label htmlFor="customer">Customer (Optional)</Label>
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
                          <Label htmlFor="payment">Payment Method</Label>
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
                          <Label htmlFor="notes">Notes (Optional)</Label>
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
                          <Label>Discount</Label>
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
                          <Label>Tip Option</Label>
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
                            <span className="text-sm text-gray-600">
                              {tipOptionEnabled ? 'Tip lines enabled on receipt' : 'Add tip option to receipt'}
                            </span>
                          </div>
                        </div>

                        {/* Total Section */}
                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between items-center text-lg">
                            <span>Subtotal:</span>
                            <span>R{calculateSubtotal().toFixed(2)}</span>
                          </div>
                          {discountPercentage > 0 && (
                            <div className="flex justify-between items-center text-lg text-green-600">
                              <span>Discount ({discountPercentage}%):</span>
                              <span>-R{calculateDiscount().toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
                            <span>Total:</span>
                            <span className="text-[hsl(217,90%,40%)]">R{calculateTotal()}</span>
                          </div>
                        </div>

                        {/* Checkout Options */}
                        <div className="space-y-3">
                          <div>
                            <Label>Checkout Option</Label>
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
                              <Label>Select Open Account</Label>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl shadow-blue-900/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Product Inventory</CardTitle>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openProductDialog()} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" aria-describedby="product-dialog-description">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                        <div id="product-dialog-description" className="text-sm text-gray-600">
                          {editingProduct ? 'Update the product information below.' : 'Enter the details for the new product.'}
                        </div>
                      </DialogHeader>
                      <Form {...productForm}>
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            console.log("Form submit event triggered");
                            productForm.handleSubmit(handleProductSubmit)(e);
                          }} 
                          className="space-y-4"
                        >
                          <FormField
                            control={productForm.control}
                            name="sku"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., PROD001" {...field} />
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
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Coffee - Espresso" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={productForm.control}
                            name="costPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cost Price (R)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 12.00" {...field} />
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
                                <FormLabel>Retail Price (R)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 25.00" {...field} />
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
                                <FormLabel>Trade Price (R) - Optional</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 20.00" {...field} />
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
                                <FormLabel>Stock Quantity</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="e.g., 50" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                              disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            >
                              {editingProduct ? 'Update Product' : 'Add Product'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products by name or SKU..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Product List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {productSearchTerm ? 'No products found matching your search.' : 'No products available.'}
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          </div>
                          <div className="text-right mr-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">Cost: R{product.costPrice}</p>
                              <p className="font-bold text-gray-900">Retail: R{product.retailPrice}</p>
                              {product.tradePrice && (
                                <p className="text-sm text-blue-600">Trade: R{product.tradePrice}</p>
                              )}
                            </div>
                            <p className={`text-sm ${product.quantity <= 5 ? 'text-red-500' : 'text-gray-500'}`}>
                              Stock: {product.quantity}
                              {product.quantity <= 5 && (
                                <span className="ml-1 text-xs bg-red-100 text-red-600 px-1 rounded">Low</span>
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
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                <CardTitle className="text-white text-xl font-bold">Customer Directory</CardTitle>
                <Button 
                  onClick={() => openCustomerDialog()}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
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
                return date.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
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
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Current Month Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">R{currentMonthRevenue.toFixed(2)}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {currentMonthSales.length} transactions
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Storm Service Fee
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">R{stormFee.toFixed(2)}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          0.5% of monthly revenue
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Billing Period
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{Math.round(progressPercentage)}%</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Day {daysCompleted} of {daysInMonth}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  {/* Billing Breakdown */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Fee Calculation */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Fee Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Gross Revenue</span>
                            <span className="font-semibold">R{currentMonthRevenue.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Storm Service Rate</span>
                            <span className="font-semibold">0.5%</span>
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Amount Due to Storm</span>
                              <span className="text-xl font-bold text-[hsl(217,90%,40%)]">R{stormFee.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-blue-900">Monthly Billing</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                Storm POS charges 0.5% of your monthly revenue for using our platform. 
                                Payment is automatically calculated and due at the end of each month.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Revenue Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Recent Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {Object.keys(dailyBreakdown).length > 0 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600">Avg. Daily Revenue</div>
                                <div className="font-semibold">
                                  R{(currentMonthRevenue / Math.max(daysCompleted, 1)).toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600">Best Day</div>
                                <div className="font-semibold">
                                  R{Math.max(...Object.values(dailyBreakdown)).toFixed(2)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-700">Daily Revenue Trend</div>
                              <div className="space-y-1">
                                {Object.entries(dailyBreakdown)
                                  .sort(([a], [b]) => b.localeCompare(a))
                                  .slice(0, 7)
                                  .map(([date, revenue]) => {
                                    const percentage = (revenue / Math.max(...Object.values(dailyBreakdown))) * 100;
                                    return (
                                      <div key={date} className="flex items-center gap-3">
                                        <div className="w-16 text-xs text-gray-500">
                                          {new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-[hsl(217,90%,40%)] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                        <div className="w-20 text-xs text-right font-medium">
                                          R{revenue.toFixed(2)}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No sales data for this month yet.</p>
                            <p className="text-sm">Start making sales to see your revenue trends!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  {/* Payment Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">How Billing Works</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rounded-full mt-2"></div>
                                Monthly billing cycle: 1st to last day of month
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rounded-full mt-2"></div>
                                Service fee: 0.5% of gross monthly revenue
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rounded-full mt-2"></div>
                                Payment due: End of each month
                              </li>
                              <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rounded-full mt-2"></div>
                                No setup fees or hidden charges
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Contact & Support</h4>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p>Questions about your billing?</p>
                              <p className="font-medium text-[hsl(217,90%,40%)]">
                                Email: softwarebystorm@gmail.com
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
                onChange={handleFileUpload}
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

      {/* Tutorial Guide */}
      <TutorialGuide
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        steps={englishTutorialSteps}
        onComplete={handleTutorialComplete}
        language="en"
      />
    </div>
  );
}