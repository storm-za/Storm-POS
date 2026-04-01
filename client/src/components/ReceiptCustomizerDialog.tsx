import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultReceiptSettings, type ReceiptSettings, type InvoiceCustomField } from "@shared/schema";
import { CaretUp as ChevronUp, CaretDown as ChevronDown, FileText, Plus, Trash as Trash2, Eye, EyeSlash as EyeOff, WarningCircle as AlertCircle } from "@phosphor-icons/react";
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
  posTheme?: 'dark' | 'light';
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
  posTheme = 'dark',
}: ReceiptCustomizerDialogProps) {
  const [settings, setSettings] = useState<ReceiptSettings>(defaultReceiptSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [customFields, setCustomFields] = useState<InvoiceCustomField[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldSection, setNewFieldSection] = useState<'billTo' | 'details' | 'footer'>('billTo');

  const [originalBusinessInfo, setOriginalBusinessInfo] = useState<any>({});
  const [lastBusinessInfoUpdate, setLastBusinessInfoUpdate] = useState<string | undefined>(undefined);

  const dk = posTheme === 'dark';

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

  const sectionBadgeColor: Record<string, string> = dk ? {
    billTo: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    details: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    footer: 'bg-green-500/20 text-green-300 border-green-500/40',
  } : {
    billTo: 'bg-blue-50 text-blue-700 border-blue-200',
    details: 'bg-purple-50 text-purple-700 border-purple-200',
    footer: 'bg-green-50 text-green-700 border-green-200',
  };

  const sectionName: Record<string, string> = {
    billTo: labels.sectionBillTo || 'Bill To',
    details: labels.sectionDetails || 'Details',
    footer: labels.sectionFooter || 'Footer',
  };

  const updatedToday = lastBusinessInfoUpdate === TODAY();

  /* ── Derived theme tokens ── */
  const dialogBg   = dk ? '#0a0f1e'  : '#ffffff';
  const cardBg     = dk ? '#1e2535'  : '#f8fafc';
  const cardBorder = dk ? '#2d3748'  : '#e2e8f0';
  const rowBg      = dk ? '#252d3d'  : '#ffffff';
  const rowBorder  = dk ? '#374151'  : '#e5e7eb';
  const headBg     = dk ? '#1a2233'  : '#f1f5f9';
  const textMain   = dk ? '#f3f4f6'  : '#111827';
  const textSub    = dk ? '#9ca3af'  : '#6b7280';
  const inputStyle = dk
    ? { background: '#2d3748', borderColor: '#4b5563', color: '#f3f4f6' }
    : { background: '#ffffff', borderColor: '#d1d5db', color: '#111827' };
  const addFieldBg     = dk ? '#1e2a3d' : '#eff6ff';
  const addFieldBorder = dk ? 'rgba(59,130,246,.3)' : '#bfdbfe';
  const footerBorder   = dk ? '#2d3748' : '#e5e7eb';

  const inputClassName = dk
    ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400';
  const btnOutline = dk
    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
    : 'border-gray-300 text-gray-700 hover:bg-gray-100';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        style={{ background: dialogBg, maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${cardBorder}` }}
        className="sm:max-w-4xl p-6 rounded-xl"
      >
        <DialogHeader>
          <DialogTitle style={{ color: textMain }} className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-5 w-5 text-[hsl(217,90%,40%)]" />
            {invoiceSetupOnly ? (labels.invoiceSetupTitle || "Invoice & Quote Setup") : (labels.title || "Customize Your Receipt")}
          </DialogTitle>
          <DialogDescription style={{ color: textSub }} className="text-sm">
            {invoiceSetupOnly
              ? (labels.invoiceSetupDesc || "Create custom fields that appear on your invoices and quotes.")
              : (labels.description || "Personalize your receipt with your business information and customize the layout.")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {!invoiceSetupOnly && (<>

          {/* ── Section Ordering ── */}
          <div style={{ background: cardBg, borderColor: cardBorder }} className="rounded-xl border overflow-hidden">
            <div style={{ background: headBg, borderColor: cardBorder }} className="px-5 py-3 border-b">
              <p style={{ color: textMain }} className="text-sm font-semibold">{labels.sectionOrderTitle || "Receipt Section Order"}</p>
            </div>
            <div className="p-4 space-y-2">
              {settings.sections.map((section, index) => (
                <motion.div key={section} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: rowBg, borderColor: rowBorder }}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg border">
                  <span style={{ color: textMain }} className="font-medium text-sm">{sectionLabels[section]}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => moveSection(index, 'up')} disabled={index === 0}
                      className={`h-8 w-8 p-0 ${btnOutline}`}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => moveSection(index, 'down')} disabled={index === settings.sections.length - 1}
                      className={`h-8 w-8 p-0 ${btnOutline}`}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Logo Upload ── */}
          <div style={{ background: cardBg, borderColor: cardBorder }} className="rounded-xl border overflow-hidden">
            <div style={{ background: headBg, borderColor: cardBorder }} className="px-5 py-3 border-b">
              <p style={{ color: textMain }} className="text-sm font-semibold">{labels.logoTitle || "Receipt Logo"}</p>
            </div>
            <div className="p-4 space-y-4">
              {currentUser?.companyLogo && (
                <div className="text-center">
                  <p style={{ color: textSub }} className="text-sm mb-2">{labels.currentLogo || "Current Logo:"}</p>
                  <img src={currentUser.companyLogo} alt="Current Logo" className="h-20 w-20 object-contain rounded-lg mx-auto" style={{ border: `1px solid ${cardBorder}` }} />
                </div>
              )}
              <div>
                <Label style={{ color: textMain }} htmlFor="receiptLogoUpload" className="text-sm font-medium">{labels.uploadLogoLabel || "Upload Custom Logo (Optional)"}</Label>
                <Input id="receiptLogoUpload" type="file" accept="image/*" onChange={handleLogoUpload}
                  className={`mt-2 ${inputClassName} file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded`}
                  style={dk ? { '--file-bg': '#4b5563' } as any : {}} />
                <p style={{ color: textSub }} className="text-xs mt-2">{labels.logoHelp || "Upload a custom logo for receipts. Recommended: Square images work best (PNG, JPG, max 2MB)"}</p>
              </div>
              {logoPreview && (
                <div className="text-center">
                  <p style={{ color: textSub }} className="text-sm mb-2">{labels.newLogoPreview || "New Logo Preview:"}</p>
                  <img src={logoPreview} alt="New Logo Preview" className="h-20 w-20 object-contain rounded-lg mx-auto" style={{ border: `1px solid ${cardBorder}` }} />
                  <Button size="sm" variant="outline" onClick={() => setLogoPreview(null)} className={`mt-2 ${btnOutline}`}>
                    {labels.removeButton || "Remove"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── Business Information ── */}
          <div style={{ background: cardBg, borderColor: cardBorder }} className="rounded-xl border overflow-hidden">
            <div style={{ background: headBg, borderColor: cardBorder }} className="px-5 py-3 border-b flex items-center justify-between">
              <p style={{ color: textMain }} className="text-sm font-semibold">{labels.businessInfoTitle || "Business Information"}</p>
              {updatedToday && (
                <div className="flex items-center gap-1.5 text-amber-500 text-xs">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{labels.updatedToday || "Updated today – next update available tomorrow"}</span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label style={{ color: textMain }} className="text-sm">{labels.businessName || "Business Name"}</Label>
                    <Switch checked={settings.toggles.showBusinessName} onCheckedChange={(v) => updateToggle('showBusinessName', v)} />
                  </div>
                  <Input value={settings.businessInfo.name || ''} onChange={(e) => updateBusinessInfo('name', e.target.value)}
                    placeholder={currentUser?.companyName || labels.businessNamePlaceholder || "Your Business Name"}
                    className={inputClassName} style={inputStyle} disabled={updatedToday} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label style={{ color: textMain }} className="text-sm">{labels.phoneNumber || "Phone Number"}</Label>
                    <Switch checked={settings.toggles.showBusinessPhone} onCheckedChange={(v) => updateToggle('showBusinessPhone', v)} />
                  </div>
                  <Input value={settings.businessInfo.phone || ''} onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                    placeholder={labels.phonePlaceholder || "+27 123 456 7890"}
                    className={inputClassName} style={inputStyle} disabled={updatedToday} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label style={{ color: textMain }} className="text-sm">{labels.addressLine1 || "Address Line 1"}</Label>
                  <Switch checked={settings.toggles.showBusinessAddress} onCheckedChange={(v) => updateToggle('showBusinessAddress', v)} />
                </div>
                <Input value={settings.businessInfo.addressLine1 || ''} onChange={(e) => updateBusinessInfo('addressLine1', e.target.value)}
                  placeholder={labels.addressLine1Placeholder || "123 Main Street"}
                  className={inputClassName} style={inputStyle} disabled={updatedToday} />
              </div>
              <div>
                <Label style={{ color: textMain }} className="text-sm">{labels.addressLine2 || "Address Line 2"}</Label>
                <Input value={settings.businessInfo.addressLine2 || ''} onChange={(e) => updateBusinessInfo('addressLine2', e.target.value)}
                  placeholder={labels.addressLine2Placeholder || "City, Postal Code"}
                  className={`mt-2 ${inputClassName}`} style={inputStyle} disabled={updatedToday} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label style={{ color: textMain }} className="text-sm">{labels.email || "Email"}</Label>
                    <Switch checked={settings.toggles.showBusinessEmail} onCheckedChange={(v) => updateToggle('showBusinessEmail', v)} />
                  </div>
                  <Input value={settings.businessInfo.email || ''} onChange={(e) => updateBusinessInfo('email', e.target.value)}
                    placeholder={labels.emailPlaceholder || "info@business.com"} type="email"
                    className={inputClassName} style={inputStyle} disabled={updatedToday} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label style={{ color: textMain }} className="text-sm">{labels.website || "Website"}</Label>
                    <Switch checked={settings.toggles.showBusinessWebsite} onCheckedChange={(v) => updateToggle('showBusinessWebsite', v)} />
                  </div>
                  <Input value={settings.businessInfo.website || ''} onChange={(e) => updateBusinessInfo('website', e.target.value)}
                    placeholder={labels.websitePlaceholder || "www.business.com"}
                    className={inputClassName} style={inputStyle} disabled={updatedToday} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label style={{ color: textMain }} className="text-sm">{labels.registrationNumber || "Registration Number"}</Label>
                    <Switch checked={settings.toggles.showRegistrationNumber} onCheckedChange={(v) => updateToggle('showRegistrationNumber', v)} />
                  </div>
                  <Input value={settings.businessInfo.registrationNumber || ''} onChange={(e) => updateBusinessInfo('registrationNumber', e.target.value)}
                    placeholder={labels.regNumberPlaceholder || "REG123456"}
                    className={inputClassName} style={inputStyle} disabled={updatedToday} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label style={{ color: textMain }} className="text-sm">{labels.vatNumber || "VAT Number"}</Label>
                    <Switch checked={settings.toggles.showVATNumber} onCheckedChange={(v) => updateToggle('showVATNumber', v)} />
                  </div>
                  <Input value={settings.businessInfo.vatNumber || ''} onChange={(e) => updateBusinessInfo('vatNumber', e.target.value)}
                    placeholder={labels.vatNumberPlaceholder || "VAT123456"}
                    className={inputClassName} style={inputStyle} disabled={updatedToday} />
                </div>
              </div>
              {updatedToday && (
                <p className="text-xs flex items-center gap-1.5 text-amber-500">
                  <AlertCircle className="h-3 w-3" />
                  {labels.businessInfoLocked || "Business information is locked for today. Toggle switches still work."}
                </p>
              )}
            </div>
          </div>
          </>)}

          {/* ── Invoice / Quote Custom Fields ── */}
          <div style={{ background: cardBg, borderColor: cardBorder }} className="rounded-xl border overflow-hidden">
            <div style={{ background: headBg, borderColor: cardBorder }} className="px-5 py-3 border-b flex items-center justify-between">
              <p style={{ color: textMain }} className="text-sm font-semibold">{labels.invoiceSetupTitle || "Invoice / Quote Setup"}</p>
              <Button size="sm" onClick={() => setIsAddingField(true)}
                className="h-8 text-xs bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white">
                <Plus className="h-3.5 w-3.5 mr-1" />
                {labels.addField || "Add Field"}
              </Button>
            </div>
            <div className="p-4 space-y-3">
              <p style={{ color: textSub }} className="text-xs">
                {labels.invoiceSetupDesc2 || labels.invoiceSetupDesc || "Create custom fields that appear on invoices and quotes. For example, add a 'Model' field under the client section for a vehicle service business."}
              </p>

              <AnimatePresence>
                {isAddingField && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ background: addFieldBg, borderColor: addFieldBorder }}
                    className="rounded-lg border p-4 space-y-3">
                    <p style={{ color: textMain }} className="text-sm font-medium">{labels.newField || "New Custom Field"}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label style={{ color: textSub }} className="text-xs">{labels.fieldLabel || "Field Label"} *</Label>
                        <Input value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}
                          placeholder={labels.fieldLabelPlaceholder || "e.g. Model, Reference No, Vehicle Reg"}
                          className={`mt-1 text-sm ${inputClassName}`} style={inputStyle} />
                      </div>
                      <div>
                        <Label style={{ color: textSub }} className="text-xs">{labels.fieldPlaceholder || "Placeholder (optional)"}</Label>
                        <Input value={newFieldPlaceholder} onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                          placeholder={labels.fieldPlaceholderEx || "e.g. Toyota Corolla 2020"}
                          className={`mt-1 text-sm ${inputClassName}`} style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <Label style={{ color: textSub }} className="text-xs">{labels.fieldSection || "Section on Invoice"}</Label>
                      <Select value={newFieldSection} onValueChange={(v: any) => setNewFieldSection(v)}>
                        <SelectTrigger className={`mt-1 text-sm ${inputClassName}`} style={inputStyle}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="billTo">{labels.sectionBillTo || "Bill To"} – {labels.sectionBillToDesc || "Under client info"}</SelectItem>
                          <SelectItem value="details">{labels.sectionDetails || "Details"} – {labels.sectionDetailsDesc || "Right column (date, PO, terms)"}</SelectItem>
                          <SelectItem value="footer">{labels.sectionFooter || "Footer"} – {labels.sectionFooterDesc || "Bottom of document"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => { setIsAddingField(false); setNewFieldLabel(""); setNewFieldPlaceholder(""); }}
                        className={`text-xs ${btnOutline}`}>
                        {labels.cancel || "Cancel"}
                      </Button>
                      <Button size="sm" onClick={addField} disabled={!newFieldLabel.trim()}
                        className="text-xs bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white">
                        {labels.addField || "Add Field"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {customFields.length === 0 && !isAddingField && (
                <div style={{ color: textSub }} className="text-center py-6 text-sm">
                  {labels.noCustomFields || "No custom fields yet. Click \"Add Field\" to create one."}
                </div>
              )}

              <div className="space-y-2">
                {customFields.map((field) => (
                  <motion.div key={field.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ background: rowBg, borderColor: rowBorder }}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span style={{ color: textMain }} className="text-sm font-medium truncate">{field.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sectionBadgeColor[field.section]}`}>
                            {sectionName[field.section]}
                          </span>
                          {!field.visible && (
                            <span style={{ color: textSub }} className="text-[10px]">{labels.hidden || "(hidden)"}</span>
                          )}
                        </div>
                        {field.placeholder && (
                          <p style={{ color: textSub }} className="text-xs mt-0.5 truncate">{labels.fieldPlaceholderLabel || "Placeholder:"} {field.placeholder}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <button onClick={() => toggleFieldVisibility(field.id)}
                        style={{ color: textSub }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100/10 transition-colors">
                        {field.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => deleteField(field.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-500 hover:bg-red-50/10 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {!invoiceSetupOnly && (<>
          {/* ── Display Options ── */}
          <div style={{ background: cardBg, borderColor: cardBorder }} className="rounded-xl border overflow-hidden">
            <div style={{ background: headBg, borderColor: cardBorder }} className="px-5 py-3 border-b">
              <p style={{ color: textMain }} className="text-sm font-semibold">{labels.displayOptionsTitle || "Display Options"}</p>
            </div>
            <div className="p-4 space-y-3">
              {[
                { key: 'showLogo', label: labels.showLogo || "Show Logo" },
                { key: 'showDateTime', label: labels.showDateTime || "Show Date & Time" },
                { key: 'showStaffInfo', label: labels.showStaffInfo || "Show Staff Information" },
                { key: 'showCustomerInfo', label: labels.showCustomerInfo || "Show Customer Information" },
                { key: 'showPaymentMethod', label: labels.showPaymentMethod || "Show Payment Method" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label style={{ color: textMain }} className="text-sm">{label}</Label>
                  <Switch checked={(settings.toggles as any)[key]} onCheckedChange={(v) => updateToggle(key, v)} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Custom Messages ── */}
          <div style={{ background: cardBg, borderColor: cardBorder }} className="rounded-xl border overflow-hidden">
            <div style={{ background: headBg, borderColor: cardBorder }} className="px-5 py-3 border-b">
              <p style={{ color: textMain }} className="text-sm font-semibold">{labels.customMessagesTitle || "Custom Messages"}</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label style={{ color: textMain }} className="text-sm">{labels.headerMessage || "Header Message"}</Label>
                  <Switch checked={settings.toggles.showCustomHeader} onCheckedChange={(v) => updateToggle('showCustomHeader', v)} />
                </div>
                <Textarea value={settings.customMessages.header || ''} onChange={(e) => updateCustomMessage('header', e.target.value)}
                  placeholder={labels.headerPlaceholder || "Welcome! Special offers today..."} className={inputClassName} style={inputStyle} rows={2} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label style={{ color: textMain }} className="text-sm">{labels.thankYouMessage || "Thank You Message"}</Label>
                  <Switch checked={settings.toggles.showThankYouMessage} onCheckedChange={(v) => updateToggle('showThankYouMessage', v)} />
                </div>
                <Input value={settings.customMessages.thankYou || 'Thank you for your business!'}
                  onChange={(e) => updateCustomMessage('thankYou', e.target.value)}
                  placeholder={labels.thankYouPlaceholder || "Thank you for your business!"} className={inputClassName} style={inputStyle} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label style={{ color: textMain }} className="text-sm">{labels.footerMessage || "Footer Message"}</Label>
                  <Switch checked={settings.toggles.showCustomFooter} onCheckedChange={(v) => updateToggle('showCustomFooter', v)} />
                </div>
                <Textarea value={settings.customMessages.footer || ''} onChange={(e) => updateCustomMessage('footer', e.target.value)}
                  placeholder={labels.footerPlaceholder || "Visit us again! Returns accepted within 30 days..."} className={inputClassName} style={inputStyle} rows={2} />
              </div>
            </div>
          </div>
          </>)}
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-2" style={{ borderTop: `1px solid ${footerBorder}` }}>
          <Button variant="outline" onClick={onClose} className={btnOutline}>
            {labels.cancel || "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}
            className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white">
            {isSaving ? (labels.saving || "Saving...") : (labels.save || "Save Settings")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
