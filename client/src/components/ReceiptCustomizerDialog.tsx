import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { defaultReceiptSettings, type ReceiptSettings, type InvoiceCustomField } from "@shared/schema";
import { ChevronUp, ChevronDown, FileText, Plus, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

interface ReceiptCustomizerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  toast: any;
  labels?: Record<string, any>;
  invoiceSetupOnly?: boolean;
}

const TODAY = () => new Date().toISOString().slice(0, 10);

export function ReceiptCustomizerDialog({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  toast,
  labels = {},
  invoiceSetupOnly = false,
}: ReceiptCustomizerDialogProps) {
  const [settings, setSettings] = useState<ReceiptSettings>(defaultReceiptSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [customFields, setCustomFields] = useState<InvoiceCustomField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldSection, setNewFieldSection] = useState<'billTo' | 'details' | 'footer'>('billTo');
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const [originalBusinessInfo, setOriginalBusinessInfo] = useState<any>({});
  const [lastBusinessInfoUpdate, setLastBusinessInfoUpdate] = useState<string | undefined>(undefined);

  const deepMergeSettings = (defaults: ReceiptSettings, stored: any): ReceiptSettings => {
    return {
      sections: stored?.sections || defaults.sections,
      toggles: { ...defaults.toggles, ...stored?.toggles },
      businessInfo: { ...defaults.businessInfo, ...stored?.businessInfo },
      customMessages: { ...defaults.customMessages, ...stored?.customMessages },
      logoDataUrl: stored?.logoDataUrl,
      lastBusinessInfoUpdate: stored?.lastBusinessInfoUpdate,
      invoiceSettings: {
        customFields: stored?.invoiceSettings?.customFields || [],
      },
    };
  };

  useEffect(() => {
    if (currentUser?.receiptSettings) {
      try {
        const parsedSettings = typeof currentUser.receiptSettings === 'string'
          ? JSON.parse(currentUser.receiptSettings)
          : currentUser.receiptSettings;
        const merged = deepMergeSettings(defaultReceiptSettings(), parsedSettings);
        setSettings(merged);
        if (merged.logoDataUrl) setLogoPreview(merged.logoDataUrl);
        const fields = parsedSettings?.invoiceSettings?.customFields || [];
        setCustomFields(fields);
        setOriginalBusinessInfo({ ...merged.businessInfo });
        setLastBusinessInfoUpdate(parsedSettings?.lastBusinessInfoUpdate);
      } catch {
        setSettings(defaultReceiptSettings());
        setLogoPreview(null);
        setCustomFields([]);
      }
    } else {
      setSettings(defaultReceiptSettings());
      setLogoPreview(null);
      setCustomFields([]);
      setOriginalBusinessInfo({});
      setLastBusinessInfoUpdate(undefined);
    }
  }, [currentUser, isOpen]);

  const sectionLabels: Record<string, string> = labels.sections || {
    logo: "Logo",
    businessInfo: "Business Information",
    dateTime: "Date & Time",
    staffInfo: "Staff Information",
    customerInfo: "Customer Information",
    items: "Items List",
    totals: "Totals",
    paymentInfo: "Payment Information",
    messages: "Custom Messages",
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...settings.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newSections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      setSettings({ ...settings, sections: newSections });
    }
  };

  const updateToggle = (key: string, value: boolean) => {
    setSettings({ ...settings, toggles: { ...settings.toggles, [key]: value } });
  };

  const updateBusinessInfo = (key: string, value: string) => {
    setSettings({ ...settings, businessInfo: { ...settings.businessInfo, [key]: value } });
  };

  const updateCustomMessage = (key: string, value: string) => {
    setSettings({ ...settings, customMessages: { ...settings.customMessages, [key]: value } });
  };

  const businessInfoChanged = () => {
    const bi = settings.businessInfo as Record<string, any>;
    const ob = originalBusinessInfo as Record<string, any>;
    const keys = Array.from(new Set([...Object.keys(bi), ...Object.keys(ob)]));
    return keys.some(k => (bi[k] ?? '') !== (ob[k] ?? ''));
  };

  const addField = () => {
    if (!newFieldLabel.trim()) return;
    const id = `cf_${Date.now()}`;
    const field: InvoiceCustomField = {
      id,
      label: newFieldLabel.trim(),
      placeholder: newFieldPlaceholder.trim(),
      section: newFieldSection,
      visible: true,
    };
    setCustomFields([...customFields, field]);
    setNewFieldLabel("");
    setNewFieldPlaceholder("");
    setNewFieldSection('billTo');
    setIsAddingField(false);
  };

  const deleteField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const toggleFieldVisibility = (id: string) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image smaller than 2MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) { if (width > maxSize) { height = height * (maxSize / width); width = maxSize; } }
        else { if (height > maxSize) { width = width * (maxSize / height); height = maxSize; } }
        canvas.width = width; canvas.height = height;
        if (ctx) { ctx.drawImage(img, 0, 0, width, height); setLogoPreview(canvas.toDataURL('image/jpeg', 0.8)); }
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const biChanged = businessInfoChanged();
    if (biChanged && lastBusinessInfoUpdate === TODAY()) {
      toast({
        title: labels.dailyLimitTitle || "Daily Limit Reached",
        description: labels.dailyLimitDesc || "Business information can only be updated once per day. Please try again tomorrow.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const newLastUpdate = biChanged ? TODAY() : lastBusinessInfoUpdate;
      const settingsToSave: any = {
        ...settings,
        logoDataUrl: logoPreview || settings.logoDataUrl,
        lastBusinessInfoUpdate: newLastUpdate,
        invoiceSettings: { customFields },
      };

      const response = await apiRequest('PUT', `/api/pos/user/${currentUser.id}/receipt-settings`, { settings: settingsToSave });
      const data = await response.json();
      if (data.success) {
        setCurrentUser({ ...currentUser, receiptSettings: settingsToSave });
        if (biChanged) setLastBusinessInfoUpdate(newLastUpdate);
        toast({ title: labels.saveSuccess || "Settings saved successfully!" });
        onClose();
      }
    } catch {
      toast({ title: labels.saveError || "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const sectionBadgeColor: Record<string, string> = {
    billTo: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    details: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    footer: 'bg-green-500/20 text-green-300 border-green-500/40',
  };
  const sectionName: Record<string, string> = {
    billTo: labels.sectionBillTo || 'Bill To',
    details: labels.sectionDetails || 'Details',
    footer: labels.sectionFooter || 'Footer',
  };

  const updatedToday = lastBusinessInfoUpdate === TODAY();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-[hsl(217,90%,40%)]" />
            {invoiceSetupOnly ? (labels.invoiceSetupTitle || "Invoice & Quote Setup") : (labels.title || "Customize Your Receipt")}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {invoiceSetupOnly
              ? (labels.invoiceSetupDesc || "Create custom fields that appear on your invoices and quotes.")
              : (labels.description || "Personalize your receipt with your business information and customize the layout.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!invoiceSetupOnly && (<>
          {/* Section Ordering */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{labels.sectionOrderTitle || "Receipt Section Order"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {settings.sections.map((section, index) => (
                  <motion.div key={section} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <span className="text-white font-medium">{sectionLabels[section]}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => moveSection(index, 'up')} disabled={index === 0} className="h-8 w-8 p-0"><ChevronUp className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => moveSection(index, 'down')} disabled={index === settings.sections.length - 1} className="h-8 w-8 p-0"><ChevronDown className="h-4 w-4" /></Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{labels.logoTitle || "Receipt Logo"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser?.companyLogo && (
                <div className="text-center">
                  <p className="text-sm text-gray-300 mb-2">{labels.currentLogo || "Current Logo:"}</p>
                  <img src={currentUser.companyLogo} alt="Current Logo" className="h-20 w-20 object-contain rounded-lg mx-auto border border-gray-600" />
                </div>
              )}
              <div>
                <Label htmlFor="receiptLogoUpload" className="text-white">{labels.uploadLogoLabel || "Upload Custom Logo (Optional)"}</Label>
                <Input id="receiptLogoUpload" type="file" accept="image/*" onChange={handleLogoUpload}
                  className="mt-2 bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded" />
                <p className="text-xs text-gray-400 mt-2">{labels.logoHelp || "Upload a custom logo for receipts. Recommended: Square images work best (PNG, JPG, max 2MB)"}</p>
              </div>
              {logoPreview && (
                <div className="text-center">
                  <p className="text-sm text-gray-300 mb-2">{labels.newLogoPreview || "New Logo Preview:"}</p>
                  <img src={logoPreview} alt="New Logo Preview" className="h-20 w-20 object-contain rounded-lg mx-auto border border-gray-600" />
                  <Button size="sm" variant="outline" onClick={() => setLogoPreview(null)} className="mt-2 text-gray-300 border-gray-600 hover:bg-gray-700">
                    {labels.removeButton || "Remove"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">{labels.businessInfoTitle || "Business Information"}</CardTitle>
                {updatedToday && (
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{labels.updatedToday || "Updated today — next update available tomorrow"}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.businessName || "Business Name"}</Label>
                    <Switch checked={settings.toggles.showBusinessName} onCheckedChange={(v) => updateToggle('showBusinessName', v)} />
                  </div>
                  <Input value={settings.businessInfo.name || ''} onChange={(e) => updateBusinessInfo('name', e.target.value)}
                    placeholder={currentUser?.companyName || labels.businessNamePlaceholder || "Your Business Name"}
                    className="bg-gray-700 border-gray-600 text-white" disabled={updatedToday} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.phoneNumber || "Phone Number"}</Label>
                    <Switch checked={settings.toggles.showBusinessPhone} onCheckedChange={(v) => updateToggle('showBusinessPhone', v)} />
                  </div>
                  <Input value={settings.businessInfo.phone || ''} onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                    placeholder={labels.phonePlaceholder || "+27 123 456 7890"}
                    className="bg-gray-700 border-gray-600 text-white" disabled={updatedToday} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">{labels.addressLine1 || "Address Line 1"}</Label>
                  <Switch checked={settings.toggles.showBusinessAddress} onCheckedChange={(v) => updateToggle('showBusinessAddress', v)} />
                </div>
                <Input value={settings.businessInfo.addressLine1 || ''} onChange={(e) => updateBusinessInfo('addressLine1', e.target.value)}
                  placeholder={labels.addressLine1Placeholder || "123 Main Street"}
                  className="bg-gray-700 border-gray-600 text-white" disabled={updatedToday} />
              </div>
              <div>
                <Label className="text-white">{labels.addressLine2 || "Address Line 2"}</Label>
                <Input value={settings.businessInfo.addressLine2 || ''} onChange={(e) => updateBusinessInfo('addressLine2', e.target.value)}
                  placeholder={labels.addressLine2Placeholder || "City, Postal Code"}
                  className="bg-gray-700 border-gray-600 text-white" disabled={updatedToday} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.email || "Email"}</Label>
                    <Switch checked={settings.toggles.showBusinessEmail} onCheckedChange={(v) => updateToggle('showBusinessEmail', v)} />
                  </div>
                  <Input value={settings.businessInfo.email || ''} onChange={(e) => updateBusinessInfo('email', e.target.value)}
                    placeholder={labels.emailPlaceholder || "info@business.com"} type="email"
                    className="bg-gray-700 border-gray-600 text-white" disabled={updatedToday} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.website || "Website"}</Label>
                    <Switch checked={settings.toggles.showBusinessWebsite} onCheckedChange={(v) => updateToggle('showBusinessWebsite', v)} />
                  </div>
                  <Input value={settings.businessInfo.website || ''} onChange={(e) => updateBusinessInfo('website', e.target.value)}
                    placeholder={labels.websitePlaceholder || "www.business.com"}
                    className="bg-gray-700 border-gray-600 text-white" disabled={updatedToday} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.registrationNumber || "Registration Number"}</Label>
                    <Switch checked={settings.toggles.showRegistrationNumber} onCheckedChange={(v) => updateToggle('showRegistrationNumber', v)} />
                  </div>
                  <Input value={settings.businessInfo.registrationNumber || ''} onChange={(e) => updateBusinessInfo('registrationNumber', e.target.value)}
                    placeholder={labels.regNumberPlaceholder || "REG123456"}
                    className="bg-gray-700 border-gray-600 text-white" disabled={updatedToday} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.vatNumber || "VAT Number"}</Label>
                    <Switch checked={settings.toggles.showVATNumber} onCheckedChange={(v) => updateToggle('showVATNumber', v)} />
                  </div>
                  <Input value={settings.businessInfo.vatNumber || ''} onChange={(e) => updateBusinessInfo('vatNumber', e.target.value)}
                    placeholder={labels.vatNumberPlaceholder || "VAT123456"}
                    className="bg-gray-700 border-gray-600 text-white" disabled={updatedToday} />
                </div>
              </div>
              {updatedToday && (
                <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  {labels.businessInfoLocked || "Business information is locked for today. Toggle switches still work."}
                </p>
              )}
            </CardContent>
          </Card>
          </>)}

          {/* Invoice / Quote Custom Fields */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-sm">{labels.invoiceSetupTitle || "Invoice / Quote Setup"}</CardTitle>
                <Button size="sm" onClick={() => { setIsAddingField(true); setEditingFieldId(null); }}
                  className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] h-8 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {labels.addField || "Add Field"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-400">
                {labels.invoiceSetupDesc || "Create custom fields that appear on invoices and quotes. For example, add a 'Model' field under the client section for a vehicle service business."}
              </p>

              <AnimatePresence>
                {isAddingField && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-700/50 rounded-lg border border-[hsl(217,90%,40%)]/40 p-4 space-y-3">
                    <p className="text-sm text-white font-medium">{labels.newField || "New Custom Field"}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-gray-300 text-xs">{labels.fieldLabel || "Field Label"} *</Label>
                        <Input value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}
                          placeholder={labels.fieldLabelPlaceholder || "e.g. Model, Reference No, Vehicle Reg"}
                          className="bg-gray-600 border-gray-500 text-white mt-1 text-sm" />
                      </div>
                      <div>
                        <Label className="text-gray-300 text-xs">{labels.fieldPlaceholder || "Placeholder (optional)"}</Label>
                        <Input value={newFieldPlaceholder} onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                          placeholder={labels.fieldPlaceholderEx || "e.g. Toyota Corolla 2020"}
                          className="bg-gray-600 border-gray-500 text-white mt-1 text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300 text-xs">{labels.fieldSection || "Section on Invoice"}</Label>
                      <Select value={newFieldSection} onValueChange={(v: any) => setNewFieldSection(v)}>
                        <SelectTrigger className="bg-gray-600 border-gray-500 text-white mt-1 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="billTo">{labels.sectionBillTo || "Bill To"} — {labels.sectionBillToDesc || "Under client info"}</SelectItem>
                          <SelectItem value="details">{labels.sectionDetails || "Details"} — {labels.sectionDetailsDesc || "Right column (date, PO, terms)"}</SelectItem>
                          <SelectItem value="footer">{labels.sectionFooter || "Footer"} — {labels.sectionFooterDesc || "Bottom of document"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => { setIsAddingField(false); setNewFieldLabel(""); setNewFieldPlaceholder(""); }}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs">
                        {labels.cancel || "Cancel"}
                      </Button>
                      <Button size="sm" onClick={addField} disabled={!newFieldLabel.trim()}
                        className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-xs">
                        {labels.addField || "Add Field"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {customFields.length === 0 && !isAddingField && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  {labels.noCustomFields || "No custom fields yet. Click \"Add Field\" to create one."}
                </div>
              )}

              <div className="space-y-2">
                {customFields.map((field) => (
                  <motion.div key={field.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-700/40 rounded-lg border border-gray-600">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium truncate">{field.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sectionBadgeColor[field.section]}`}>
                            {sectionName[field.section]}
                          </span>
                          {!field.visible && (
                            <span className="text-[10px] text-gray-500">{labels.hidden || "(hidden)"}</span>
                          )}
                        </div>
                        {field.placeholder && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{labels.fieldPlaceholderLabel || "Placeholder:"} {field.placeholder}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => toggleFieldVisibility(field.id)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white">
                        {field.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteField(field.id)}
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {!invoiceSetupOnly && (<>
          {/* Display Options */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{labels.displayOptionsTitle || "Display Options"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'showLogo', label: labels.showLogo || "Show Logo" },
                { key: 'showDateTime', label: labels.showDateTime || "Show Date & Time" },
                { key: 'showStaffInfo', label: labels.showStaffInfo || "Show Staff Information" },
                { key: 'showCustomerInfo', label: labels.showCustomerInfo || "Show Customer Information" },
                { key: 'showPaymentMethod', label: labels.showPaymentMethod || "Show Payment Method" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-white">{label}</Label>
                  <Switch checked={(settings.toggles as any)[key]} onCheckedChange={(v) => updateToggle(key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Messages */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{labels.customMessagesTitle || "Custom Messages"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">{labels.headerMessage || "Header Message"}</Label>
                  <Switch checked={settings.toggles.showCustomHeader} onCheckedChange={(v) => updateToggle('showCustomHeader', v)} />
                </div>
                <Textarea value={settings.customMessages.header || ''} onChange={(e) => updateCustomMessage('header', e.target.value)}
                  placeholder={labels.headerPlaceholder || "Welcome! Special offers today..."} className="bg-gray-700 border-gray-600 text-white" rows={2} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">{labels.thankYouMessage || "Thank You Message"}</Label>
                  <Switch checked={settings.toggles.showThankYouMessage} onCheckedChange={(v) => updateToggle('showThankYouMessage', v)} />
                </div>
                <Input value={settings.customMessages.thankYou || 'Thank you for your business!'}
                  onChange={(e) => updateCustomMessage('thankYou', e.target.value)}
                  placeholder={labels.thankYouPlaceholder || "Thank you for your business!"} className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">{labels.footerMessage || "Footer Message"}</Label>
                  <Switch checked={settings.toggles.showCustomFooter} onCheckedChange={(v) => updateToggle('showCustomFooter', v)} />
                </div>
                <Textarea value={settings.customMessages.footer || ''} onChange={(e) => updateCustomMessage('footer', e.target.value)}
                  placeholder={labels.footerPlaceholder || "Visit us again! Returns accepted within 30 days..."} className="bg-gray-700 border-gray-600 text-white" rows={2} />
              </div>
            </CardContent>
          </Card>
          </>)}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose} className="border-[hsl(217,90%,40%)] text-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,40%)] hover:text-white">
            {labels.cancel || "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white">
            {isSaving ? (labels.saving || "Saving...") : (labels.save || "Save Settings")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
