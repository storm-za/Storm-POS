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