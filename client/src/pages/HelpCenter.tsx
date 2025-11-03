import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Package, Users, FileText, BarChart3, CreditCard, Settings, Receipt, HelpCircle, User, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function HelpCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4 text-white hover:text-[hsl(217,90%,40%)] hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to POS
          </Button>
          
          <div className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl px-8 py-6 shadow-2xl shadow-blue-900/50 border border-blue-400/20">
            <div className="flex items-center space-x-4">
              <HelpCircle className="h-12 w-12 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">How to Use Storm POS</h1>
                <p className="text-blue-100 mt-1">Complete guide to all features and functionality</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-6">
          {/* Sales Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <ShoppingCart className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Sales Tab
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Processing a Sale</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Browse or search for products in the left panel using the search bar</li>
                    <li>Click on a product to add it to the current sale</li>
                    <li>Adjust quantities using the + and - buttons, or click the trash icon to remove an item</li>
                    <li>Select a customer (optional) from the dropdown to apply customer-specific pricing</li>
                    <li>Choose a payment method: Cash, Card, or EFT</li>
                    <li>Add sale notes if needed for internal reference</li>
                    <li>Apply a discount by entering the amount or percentage</li>
                    <li>Enable "Tip Option" if you want the receipt to include tip lines for waiters</li>
                    <li>Click "Complete Sale" to finalize and print the receipt</li>
                  </ol>
                </div>
                
                <Separator className="bg-gray-700" />
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Customer Selection</h3>
                  <p>When you select a customer, their information appears below the dropdown including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Customer name and type (Retail or Trade)</li>
                    <li>Phone number (if available)</li>
                    <li>Customer notes (if available)</li>
                    <li>Trade customers automatically receive trade pricing if configured</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Discount Options</h3>
                  <p>Apply discounts in two ways:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Fixed Amount:</strong> Enter a rand value (e.g., 50 for R50 off)</li>
                    <li><strong>Percentage:</strong> Enter a percentage followed by % (e.g., 10% for 10% off)</li>
                  </ul>
                  <p className="mt-2">The discount is applied to the total before completing the sale.</p>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Tip Option</h3>
                  <p>Enable the "Tip Option" checkbox when processing sales for table service:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Receipt will include blank lines for "Tip: _______" and "New Total: _______"</li>
                    <li>Customers can write in tip amounts by hand</li>
                    <li>Perfect for waiters and table service scenarios</li>
                    <li>The option resets after each sale to prevent accidental usage</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Quick Print</h3>
                  <p>Use "Quick Print" for kitchen orders or internal records:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Prints a simplified receipt without completing the sale</li>
                    <li>Does not deduct from inventory or record the transaction</li>
                    <li>Useful for sending orders to the kitchen before payment</li>
                    <li>Does not include tip lines (internal use only)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Products Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <Package className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Products Tab
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Adding a New Product</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Click the "Add Product" button</li>
                    <li>Fill in the required fields:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>SKU:</strong> Unique product code for identification</li>
                        <li><strong>Name:</strong> Product name as it appears on receipts</li>
                        <li><strong>Cost Price:</strong> What you paid for the product</li>
                        <li><strong>Retail Price:</strong> Standard selling price</li>
                        <li><strong>Trade Price (Optional):</strong> Discounted price for trade customers</li>
                        <li><strong>Quantity:</strong> Current stock level</li>
                      </ul>
                    </li>
                    <li>Click "Add Product" to save</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Managing Products</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Search:</strong> Use the search bar to filter products by name or SKU</li>
                    <li><strong>Edit:</strong> Click the edit button to modify product details or adjust stock levels</li>
                    <li><strong>Delete:</strong> Remove products that are no longer sold (requires confirmation)</li>
                    <li><strong>Low Stock Warning:</strong> Products with quantity ≤ 5 display a yellow warning badge</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Pricing Types</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Retail Price:</strong> Charged to regular customers</li>
                    <li><strong>Trade Price:</strong> Automatically applied when a trade customer is selected in sales</li>
                    <li>If no trade price is set, retail price is used for all customers</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Inventory Management</h3>
                  <p>Stock levels automatically update when sales are completed:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Quantities are deducted when a sale is finalized</li>
                    <li>Quick prints do not affect inventory</li>
                    <li>Monitor stock levels to reorder products before they run out</li>
                    <li>Edit product quantities manually when receiving new stock</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customers Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <Users className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Customers Tab
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Adding a Customer</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Click "Add Customer" button</li>
                    <li>Enter customer details:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>Name:</strong> Customer's full name or business name</li>
                        <li><strong>Phone:</strong> Contact number for communication</li>
                        <li><strong>Customer Type:</strong> Select Retail or Trade
                          <ul className="list-circle list-inside ml-6 mt-1">
                            <li>Retail: Standard pricing applies</li>
                            <li>Trade: Gets trade pricing when set on products</li>
                          </ul>
                        </li>
                        <li><strong>Notes (Optional):</strong> Store preferences, account details, or special instructions</li>
                      </ul>
                    </li>
                    <li>Click "Add Customer" to save</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Managing Customers</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>View:</strong> See all customer details including type badge (Retail/Trade)</li>
                    <li><strong>Edit:</strong> Update customer information or change their type</li>
                    <li><strong>Delete:</strong> Remove customers from the system (requires confirmation)</li>
                    <li><strong>Notes:</strong> Add reminders like "Prefers morning delivery" or "Account #12345"</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Customer Types Explained</h3>
                  <div className="space-y-3 ml-4">
                    <div>
                      <p className="font-semibold text-blue-400">Retail Customers</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Individual shoppers or walk-in customers</li>
                        <li>Pay retail price for all products</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">Trade Customers</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Wholesale buyers, resellers, or bulk purchasers</li>
                        <li>Automatically receive trade pricing when products have it configured</li>
                        <li>Ideal for businesses buying for resale</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Open Accounts Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <FileText className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Open Accounts Tab
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">What are Open Accounts?</h3>
                  <p>Open accounts allow you to track unpaid tabs for customers who will pay later (e.g., table service, corporate accounts).</p>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Creating an Open Account</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Click "Open New Account"</li>
                    <li>Enter account details:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>Customer Name:</strong> Who owns this tab</li>
                        <li><strong>Table/Reference:</strong> Table number, room number, or account reference</li>
                        <li><strong>Notes:</strong> Special instructions or reminders</li>
                      </ul>
                    </li>
                    <li>Click "Create Account"</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Adding Items to an Account</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Find the open account in the list</li>
                    <li>Click "Add Items"</li>
                    <li>Select products just like in the Sales tab</li>
                    <li>Items are added to the running tab</li>
                    <li>Total updates automatically</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Closing an Account</h3>
                  <p>When the customer is ready to pay:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4 mt-2">
                    <li>Click "Close & Pay" on the account</li>
                    <li>Review all items on the account</li>
                    <li>Select payment method (Cash, Card, or EFT)</li>
                    <li>Enable "Tip Option" if needed for waiter tips</li>
                    <li>Apply discount if applicable</li>
                    <li>Click "Complete Payment"</li>
                    <li>Receipt is generated and inventory is updated</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Managing Open Accounts</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>View Details:</strong> See all items on an account and running total</li>
                    <li><strong>Add More Items:</strong> Continue adding to the tab</li>
                    <li><strong>Delete Account:</strong> Cancel an account (does not affect inventory)</li>
                    <li>Accounts remain open until manually closed or deleted</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reports Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <BarChart3 className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Reports Tab
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sales Analytics Dashboard</h3>
                  <p>Get comprehensive insights into your sales performance:</p>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Date Filtering</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Select any date to view sales for that specific day</li>
                    <li>Defaults to today's sales</li>
                    <li>All charts and metrics update based on selected date</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Summary Cards</h3>
                  <p>Four key metrics displayed at the top:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Total Revenue:</strong> Sum of all sales (excluding voided sales)</li>
                    <li><strong>Transactions:</strong> Number of completed sales</li>
                    <li><strong>Avg Transaction:</strong> Average sale value</li>
                    <li><strong>Payment Breakdown:</strong> Distribution across Cash/Card/EFT</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Charts</h3>
                  <div className="space-y-3 ml-4">
                    <div>
                      <p className="font-semibold text-blue-400">Payment Methods (Pie Chart)</p>
                      <p className="ml-4">Visual breakdown showing percentage of each payment type</p>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-400">7-Day Trend (Line Chart)</p>
                      <p className="ml-4">Shows daily revenue over the past 7 days to spot trends</p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sales List</h3>
                  <p>Detailed table of all transactions showing:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Sale ID and timestamp</li>
                    <li>Total amount and payment method</li>
                    <li>Customer name (if recorded)</li>
                    <li>Staff member who processed the sale</li>
                    <li>Items sold with quantities and prices</li>
                    <li>View, Print, or Void buttons for each sale</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Voiding Sales (Management Only)</h3>
                  <p>Management users can void sales with proper documentation:</p>
                  <ol className="list-decimal list-inside space-y-2 ml-4 mt-2">
                    <li>Click the "Void" button on any sale</li>
                    <li>Enter a detailed reason for voiding</li>
                    <li>Confirm the action</li>
                    <li>Sale is marked as voided (displayed with red strikethrough)</li>
                    <li>Voided sales are excluded from revenue calculations</li>
                    <li>Inventory is restored when a sale is voided</li>
                    <li>Void reason is stored and viewable</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Usage Tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <CreditCard className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Usage Tab
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Understanding Usage Billing</h3>
                  <p>Storm POS charges a small 0.5% fee on your sales revenue:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Only pay for what you sell</li>
                    <li>No hidden fees or surprise charges</li>
                    <li>Transparent billing based on actual sales volume</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Current Period</h3>
                  <p>View your billing information for the current month:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Total Sales:</strong> Revenue from all completed sales this month</li>
                    <li><strong>Usage Fee (0.5%):</strong> Calculated fee based on sales</li>
                    <li><strong>Billing Period:</strong> First to last day of current month</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">What's Included</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Full access to Storm POS system</li>
                    <li>Unlimited users and products</li>
                    <li>Cloud-based data storage and backup</li>
                    <li>Receipt customization</li>
                    <li>Sales analytics and reporting</li>
                    <li>Customer and inventory management</li>
                    <li>Regular updates and improvements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Staff Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <User className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Staff Account System
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Creating Staff Accounts</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Click the Staff dropdown in the header</li>
                    <li>Select "Create New User"</li>
                    <li>Enter staff details:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>Display Name:</strong> Appears on receipts and reports</li>
                        <li><strong>Username:</strong> For logging in</li>
                        <li><strong>Password:</strong> Secure password for the staff member</li>
                        <li><strong>User Type:</strong> Staff or Management</li>
                      </ul>
                    </li>
                    <li>Click "Create Staff Account"</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">User Types</h3>
                  <div className="space-y-3 ml-4">
                    <div>
                      <p className="font-semibold text-blue-400">Staff Users</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Can access: Sales, Customers, and Open Accounts tabs</li>
                        <li>Cannot access Products or Reports without management password</li>
                        <li>Ideal for cashiers, waiters, and front-of-house staff</li>
                        <li>Their name appears on all sales they process</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-green-400">Management Users</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Full access to all tabs and features</li>
                        <li>Can void sales and view detailed reports</li>
                        <li>Can manage other staff accounts</li>
                        <li>Suitable for owners, managers, and supervisors</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Staff Workflow</h3>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li>Staff member selects their name from the dropdown</li>
                    <li>Enters their password to log in</li>
                    <li>Processes sales under their name</li>
                    <li>All their sales are tracked with "Served by: [Name]" on receipts</li>
                    <li>Management can see who processed each sale in Reports</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Management Password</h3>
                  <p>Staff users attempting to access Products or Reports tabs will be prompted for the management password (default: manager123):</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>One-time entry grants temporary access</li>
                    <li>Access expires when switching tabs or users</li>
                    <li>Prevents unauthorized product or pricing changes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Receipt Customization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <Receipt className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Receipt Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Accessing Receipt Settings</h3>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Click your profile picture in the top right</li>
                    <li>Select "Customize Your Receipt"</li>
                    <li>The receipt customizer dialog opens</li>
                  </ol>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Section Ordering</h3>
                  <p>Customize the order of receipt sections:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Use up/down arrow buttons to reposition sections</li>
                    <li>Sections: Logo, Business Info, Date & Time, Staff Info, Customer Info, Items, Totals, Payment Info, Messages</li>
                    <li>Toggle sections on/off to show or hide them</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Logo Upload</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Upload a custom receipt logo (PNG, JPG, max 2MB)</li>
                    <li>Logo displays at 60x60mm, centered on receipts</li>
                    <li>Square images work best</li>
                    <li>Different from profile picture - specifically for receipts</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Business Information</h3>
                  <p>Configure what appears on your receipts:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Business Name:</strong> Your company name</li>
                    <li><strong>Phone Number:</strong> Customer service contact</li>
                    <li><strong>Address:</strong> Two lines for full address</li>
                    <li><strong>Email & Website:</strong> Online contact information</li>
                    <li><strong>Registration Number:</strong> Business registration</li>
                    <li><strong>VAT Number:</strong> Tax identification</li>
                    <li>Each field has an on/off toggle to control visibility</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Display Options</h3>
                  <p>Show or hide receipt elements:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Logo display</li>
                    <li>Date and time stamp</li>
                    <li>Staff member information</li>
                    <li>Customer details</li>
                    <li>Payment method</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Custom Messages</h3>
                  <p>Add personalized messages to receipts:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li><strong>Header Message:</strong> Appears at top (e.g., "Welcome! Special offers today...")</li>
                    <li><strong>Thank You Message:</strong> After sale details (e.g., "Thank you for your business!")</li>
                    <li><strong>Footer Message:</strong> At bottom (e.g., "Visit us again! Returns accepted within 30 days...")</li>
                    <li>Each message has an on/off toggle</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Saving Changes</h3>
                  <p>Click "Save Settings" to apply all customizations. Your settings are saved to the database and apply to all future receipts.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-2xl">
                  <Settings className="mr-3 h-6 w-6 text-[hsl(217,90%,40%)]" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Profile Picture</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Click your profile icon in the top right</li>
                    <li>Select "Change Profile Picture"</li>
                    <li>Upload an image (PNG, JPG, max 2MB)</li>
                    <li>This is your company logo shown throughout the system</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Language Settings</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Click profile menu → "Switch to Afrikaans"</li>
                    <li>Entire system translates to Afrikaans</li>
                    <li>All features remain identical</li>
                    <li>Switch back anytime from profile menu</li>
                  </ul>
                </div>

                <Separator className="bg-gray-700" />

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Logging Out</h3>
                  <p>To sign out of your account:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4 mt-2">
                    <li>Click your profile icon</li>
                    <li>Select "Logout"</li>
                    <li>You'll be returned to the login screen</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Need More Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="bg-white border-[hsl(217,90%,40%)]">
              <CardContent className="p-6">
                <div className="text-center">
                  <HelpCircle className="h-12 w-12 text-[hsl(217,90%,40%)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Need More Help?</h3>
                  <p className="text-gray-700 mb-4">
                    If you have questions not covered in this guide, please contact Storm support for assistance.
                  </p>
                  <p className="text-gray-600 text-sm">
                    This help center covers all features available in Storm POS. Explore each section to become a POS expert!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Back to Top Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <Button
            variant="outline"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="border-[hsl(217,90%,40%)] text-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,40%)] hover:text-white"
          >
            Back to Top
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
