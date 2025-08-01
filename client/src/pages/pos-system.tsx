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
  Calendar, TrendingUp, FileText, Clock, Eye, Download, User, UserPlus, Settings
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
  const [isStaffAuthOpen, setIsStaffAuthOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format
  const [checkoutOption, setCheckoutOption] = useState<'complete' | 'open-account' | 'add-to-account'>('complete');
  const [isOpenAccountDialogOpen, setIsOpenAccountDialogOpen] = useState(false);
  const [selectedOpenAccount, setSelectedOpenAccount] = useState<PosOpenAccount | null>(null);
  const [deletePasswordDialog, setDeletePasswordDialog] = useState<{ open: boolean; accountId: number; itemIndex: number }>({
    open: false,
    accountId: 0,
    itemIndex: 0
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [selectedOpenAccountId, setSelectedOpenAccountId] = useState<number | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{id: number; email: string; paid: boolean; companyLogo?: string} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
          companyLogo: null
        });
      }
    } else {
      // If no user data in localStorage, set demo user as fallback
      setCurrentUser({
        id: 1,
        email: 'demo@storm.co.za',
        paid: true,
        companyLogo: null
      });
    }
  }, []);

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
    queryKey: ["/api/pos/products"],
  });

  // Fetch customers
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/pos/customers"],
  });

  // Fetch sales
  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/pos/sales"],
  });

  // Fetch open accounts
  const { data: openAccounts = [] } = useQuery<PosOpenAccount[]>({
    queryKey: ["/api/pos/open-accounts"],
  });

  // Fetch staff accounts
  const { data: staffAccounts = [] } = useQuery<StaffAccount[]>({
    queryKey: ["/api/pos/staff-accounts"],
  });

  // Product mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await apiRequest("POST", "/api/pos/products", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products"] });
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
      const response = await apiRequest("POST", "/api/pos/customers", customerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/pos/customers"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/pos/staff-accounts"] });
      setIsUserManagementOpen(false);
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
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/pos/staff-accounts/authenticate", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentStaff(data.staffAccount);
      setIsStaffAuthOpen(false);
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
      queryClient.invalidateQueries({ queryKey: ["/api/pos/staff-accounts"] });
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
      productForm.setValue("price", product.price);
      productForm.setValue("quantity", product.quantity);
    } else {
      setEditingProduct(null);
      console.log("Resetting form for new product");
      productForm.reset({
        sku: "",
        name: "",
        price: "",
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
          currentStaff?.username
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
        setSelectedOpenAccountId(null);
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/pos/sales"] });
        queryClient.invalidateQueries({ queryKey: ["/api/pos/products"] });
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
        setSelectedOpenAccountId(null);
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/pos/products"] });
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
      const response = await apiRequest("POST", "/api/pos/open-accounts", accountData);
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
      setIsOpenAccountDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products"] });
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
    mutationFn: async ({ accountId, paymentType }: { accountId: number; paymentType: string }) => {
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

      return await saleResponse.json();
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
        currentStaff?.username
      );
      
      toast({
        title: "Account closed",
        description: `Sale of R${data.total} processed successfully. Receipt downloaded.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products"] });
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
    onSuccess: () => {
      toast({
        title: "Item removed",
        description: "Item removed from account successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pos/open-accounts"] });
      setDeletePasswordDialog({ open: false, accountId: 0, itemIndex: 0 });
      setDeletePassword("");
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
    setDeletePasswordDialog({ open: true, accountId, itemIndex });
  };

  const handlePasswordConfirm = () => {
    if (deletePassword === "2003") {
      removeItemFromOpenAccountMutation.mutate({ 
        accountId: deletePasswordDialog.accountId, 
        itemIndex: deletePasswordDialog.itemIndex 
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      setDeletePassword("");
    }
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
  const generateReceipt = (items: SaleItem[], total: string, customerName?: string, notes?: string, paymentType?: string, isOpenAccount = false, accountName?: string, staffName?: string) => {
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

    // Company name and title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('STORM POS', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(16);
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
      queryClient.invalidateQueries({ queryKey: ["/api/pos/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add items",
        description: error.message || "An error occurred while adding items to the account",
        variant: "destructive",
      });
    },
  });



  // Logout
  const logout = () => {
    // In a real app, you'd clear session/tokens here
    window.location.href = "/pos/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[hsl(217,90%,40%)]">Storm POS</h1>
              <Badge variant="outline" className="ml-3">Demo Account</Badge>
            </div>
            <div className="flex items-center space-x-3">
              {/* Staff Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{currentStaff ? currentStaff.username : 'Select Staff'}</span>
                    {currentStaff && (
                      <Badge variant={currentStaff.userType === 'management' ? 'default' : 'secondary'} className="text-xs">
                        {currentStaff.userType}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {!currentStaff ? (
                    <>
                      {staffAccounts.length === 0 ? (
                        <DropdownMenuItem onClick={() => setIsUserManagementOpen(true)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Create First Staff Account
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => setIsStaffAuthOpen(true)}>
                          <User className="mr-2 h-4 w-4" />
                          Login as Staff
                        </DropdownMenuItem>
                      )}
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

              {/* Profile Image */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLogoDialogOpen(true)}
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
              
              <Button 
                variant="outline" 
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="sales" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Sales</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </TabsTrigger>
            <TabsTrigger value="open-accounts" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Open Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product Selection */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
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
              </div>

              {/* Current Sale */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
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
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Inventory</CardTitle>
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
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Directory</CardTitle>
                <Button 
                  onClick={() => openCustomerDialog()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{customer.name}</h3>
                          <Badge variant={customer.customerType === 'trade' ? 'default' : 'outline'}>
                            {customer.customerType === 'trade' ? 'Trade' : 'Retail'}
                          </Badge>
                        </div>
                        {customer.phone && <p className="text-sm text-gray-500">Phone: {customer.phone}</p>}
                        {customer.notes && <p className="text-sm text-gray-500">Notes: {customer.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCustomerDialog(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCustomerMutation.mutate(customer.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No customers found. Add your first customer to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Open Accounts Tab */}
          <TabsContent value="open-accounts">
            <div className="space-y-6">
              {/* Open Accounts Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Open Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {openAccounts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No open accounts. Create one from the Sales tab to get started.
                      </div>
                    ) : (
                      openAccounts.map((account) => (
                        <div key={account.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {account.accountType === 'table' ? (
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                ) : (
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                )}
                                <h3 className="font-semibold text-lg">{account.accountName}</h3>
                              </div>
                              <Badge variant={account.accountType === 'table' ? 'default' : 'outline'}>
                                {account.accountType === 'table' ? 'Table' : 'Customer'}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[hsl(217,90%,40%)]">R{account.total}</p>
                              <p className="text-sm text-gray-500">
                                {Array.isArray(account.items) ? account.items.length : 0} items
                              </p>
                            </div>
                          </div>
                          
                          {account.notes && (
                            <p className="text-sm text-gray-600 italic">{account.notes}</p>
                          )}
                          
                          <div className="text-xs text-gray-500">
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
                              className="flex-1"
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
                              className="flex-1 bg-green-600 hover:bg-green-700"
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
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Date Filter */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Sales Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="date-filter">Select Date:</Label>
                    <Input
                      id="date-filter"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                </CardContent>
              </Card>

              {(() => {
                // Filter sales for selected date
                const dateFilteredSales = sales.filter(sale => {
                  const saleDate = new Date(sale.createdAt).toISOString().split('T')[0];
                  return saleDate === selectedDate;
                });

                // Calculate totals by payment method
                const paymentMethodTotals = dateFilteredSales.reduce((acc, sale) => {
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

                // Daily totals for line chart (last 7 days including selected date)
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(selectedDate);
                  date.setDate(date.getDate() - (6 - i));
                  return date.toISOString().split('T')[0];
                });

                const dailyTotals = last7Days.map(date => {
                  const daySales = sales.filter(sale => 
                    new Date(sale.createdAt).toISOString().split('T')[0] === date
                  );
                  const total = daySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
                  return {
                    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    total: total,
                    transactions: daySales.length
                  };
                });

                const totalRevenue = dateFilteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
                const totalTransactions = dateFilteredSales.length;
                const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
                
                // Calculate total profit (revenue - cost)
                const totalProfit = dateFilteredSales.reduce((profit, sale) => {
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
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">R{totalRevenue.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-gray-600">Total Profit</span>
                          </div>
                          <div className="text-2xl font-bold text-emerald-600">R{totalProfit.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">Transactions</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">{totalTransactions}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-600">Avg Transaction</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-600">R{avgTransactionValue.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Payment Methods Pie Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Payment Methods Breakdown</CardTitle>
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
                                <Tooltip formatter={(value) => [`R${Number(value).toFixed(2)}`, 'Amount']} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                              No sales data for selected date
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* 7-Day Trend Line Chart */}
                      <Card>
                        <CardHeader>
                          <CardTitle>7-Day Sales Trend</CardTitle>
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
                                  name === 'total' ? 'Revenue' : 'Transactions'
                                ]}
                              />
                              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Detailed Sales List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Sales Details for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {dateFilteredSales.length > 0 ? (
                            dateFilteredSales.map((sale) => (
                              <div key={sale.id} className="flex justify-between items-center p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <p className="font-medium">R{sale.total}</p>
                                      <p className="text-sm text-gray-500">
                                        {new Date(sale.createdAt).toLocaleTimeString()}
                                      </p>
                                    </div>
                                    {sale.customerName && (
                                      <div>
                                        <p className="text-sm font-medium">{sale.customerName}</p>
                                        <p className="text-xs text-gray-500">Customer</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-600">
                                      Items: {sale.items.map((item: any) => `${item.name} (${item.quantity})`).join(', ')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline" className="mb-1">
                                    {sale.paymentType.toUpperCase()}
                                  </Badge>
                                  <p className="text-xs text-gray-500">#{sale.id}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No sales recorded for {new Date(selectedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>
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
      <Dialog open={!!selectedOpenAccount} onOpenChange={() => setSelectedOpenAccount(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedOpenAccount?.accountName} - Account Details
            </DialogTitle>
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
                <p className="text-sm font-medium mb-2">Items ({Array.isArray(selectedOpenAccount.items) ? selectedOpenAccount.items.length : 0})</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.isArray(selectedOpenAccount.items) && selectedOpenAccount.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">R{item.price} each</p>
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
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedOpenAccount(null)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    const paymentType = 'cash'; // Default to cash
                    closeOpenAccountMutation.mutate({ accountId: selectedOpenAccount.id, paymentType });
                    setSelectedOpenAccount(null);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={closeOpenAccountMutation.isPending}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  {closeOpenAccountMutation.isPending ? 'Closing...' : 'Close & Pay'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Confirmation Dialog for Item Deletion */}
      <Dialog open={deletePasswordDialog.open} onOpenChange={(open) => {
        if (!open) {
          setDeletePasswordDialog({ open: false, accountId: 0, itemIndex: 0 });
          setDeletePassword("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Item Deletion</DialogTitle>
            <DialogDescription>
              Enter the password to delete this item from the account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deletePassword">Password</Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter password"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordConfirm();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeletePasswordDialog({ open: false, accountId: 0, itemIndex: 0 });
                  setDeletePassword("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordConfirm}
                disabled={!deletePassword || removeItemFromOpenAccountMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {removeItemFromOpenAccountMutation.isPending ? "Deleting..." : "Delete Item"}
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

      {/* Staff Authentication Dialog */}
      <Dialog open={isStaffAuthOpen} onOpenChange={setIsStaffAuthOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Login</DialogTitle>
            <DialogDescription>
              Enter your username and password to log in as a staff member.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const username = formData.get('username') as string;
            const password = formData.get('password') as string;
            if (username && password) {
              authenticateStaffMutation.mutate({ username, password });
            }
          }}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="staff-username">Username</Label>
                <Input
                  id="staff-username"
                  name="username"
                  type="text"
                  required
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="staff-password">Password</Label>
                <Input
                  id="staff-password"
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
                  onClick={() => setIsStaffAuthOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={authenticateStaffMutation.isPending}
                  className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)]"
                >
                  {authenticateStaffMutation.isPending ? "Logging in..." : "Login"}
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
                    managementPassword: userType === 'management' ? managementPassword : undefined
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
                    <Select name="user-type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
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
    </div>
  );
}