import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultReceiptSettings, receiptSettingsSchema, type ReceiptSettings } from "@shared/schema";
import { ChevronUp, ChevronDown, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

interface ReceiptCustomizerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  toast: any;
  labels?: {
    title?: string;
    description?: string;
    sections?: Record<string, string>;
    save?: string;
    cancel?: string;
  };
}

export function ReceiptCustomizerDialog({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  toast,
  labels = {},
}: ReceiptCustomizerDialogProps) {
  const [settings, setSettings] = useState<ReceiptSettings>(defaultReceiptSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Deep merge helper
  const deepMergeSettings = (defaults: ReceiptSettings, stored: any): ReceiptSettings => {
    return {
      sections: stored?.sections || defaults.sections,
      toggles: { ...defaults.toggles, ...stored?.toggles },
      businessInfo: { ...defaults.businessInfo, ...stored?.businessInfo },
      customMessages: { ...defaults.customMessages, ...stored?.customMessages },
      logoDataUrl: stored?.logoDataUrl,
    };
  };

  // Initialize settings from currentUser
  useEffect(() => {
    if (currentUser?.receiptSettings) {
      try {
        const parsedSettings = typeof currentUser.receiptSettings === 'string' 
          ? JSON.parse(currentUser.receiptSettings) 
          : currentUser.receiptSettings;
        const merged = deepMergeSettings(defaultReceiptSettings(), parsedSettings);
        setSettings(merged);
        // Initialize logo preview from stored settings
        if (merged.logoDataUrl) {
          setLogoPreview(merged.logoDataUrl);
        }
      } catch (error) {
        console.error("Error parsing receipt settings:", error);
        setSettings(defaultReceiptSettings());
      }
    } else {
      setSettings(defaultReceiptSettings());
      setLogoPreview(null);
    }
  }, [currentUser, isOpen]);

  const sectionLabels = labels.sections || {
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
    setSettings({
      ...settings,
      toggles: { ...settings.toggles, [key]: value }
    });
  };

  const updateBusinessInfo = (key: string, value: string) => {
    setSettings({
      ...settings,
      businessInfo: { ...settings.businessInfo, [key]: value }
    });
  };

  const updateCustomMessage = (key: string, value: string) => {
    setSettings({
      ...settings,
      customMessages: { ...settings.customMessages, [key]: value }
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Please upload an image smaller than 2MB",
        variant: "destructive" 
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setLogoPreview(base64);
      
      // Compress and resize the image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set max dimensions
        const maxSize = 200;
        let width = img.width;
        let height = img.height;
        
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
          setLogoPreview(compressedBase64);
        }
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Include logo in settings if it was uploaded
      const settingsToSave = {
        ...settings,
        logoDataUrl: logoPreview || settings.logoDataUrl,
      };
      
      const response = await apiRequest(
        'PUT',
        `/api/pos/user/${currentUser.id}/receipt-settings`,
        { settings: settingsToSave }
      );

      const data = await response.json();
      
      if (data.success) {
        setCurrentUser({ ...currentUser, receiptSettings: settingsToSave });
        toast({ title: labels.saveSuccess || "Receipt settings saved successfully!" });
        onClose();
      }
    } catch (error) {
      console.error("Error saving receipt settings:", error);
      toast({ title: labels.saveError || "Failed to save receipt settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-xl border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-[hsl(217,90%,40%)]" />
            {labels.title || "Customize Your Receipt"}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {labels.description || "Personalize your receipt with your business information and customize the layout."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section Ordering */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{labels.sectionOrderTitle || "Receipt Section Order"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {settings.sections.map((section, index) => (
                  <motion.div
                    key={section}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <span className="text-white font-medium">{sectionLabels[section]}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === settings.sections.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
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
                  <img 
                    src={currentUser.companyLogo} 
                    alt="Current Logo" 
                    className="h-20 w-20 object-contain rounded-lg mx-auto border border-gray-600"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="receiptLogoUpload" className="text-white">{labels.uploadLogoLabel || "Upload Custom Logo (Optional)"}</Label>
                <Input
                  id="receiptLogoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="mt-2 bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {labels.logoHelp || "Upload a custom logo for receipts. Recommended: Square images work best (PNG, JPG, max 2MB)"}
                </p>
              </div>
              
              {logoPreview && (
                <div className="text-center">
                  <p className="text-sm text-gray-300 mb-2">{labels.newLogoPreview || "New Logo Preview:"}</p>
                  <img 
                    src={logoPreview} 
                    alt="New Logo Preview" 
                    className="h-20 w-20 object-contain rounded-lg mx-auto border border-gray-600"
                  />
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => setLogoPreview(null)}
                    className="mt-2 text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    {labels.removeButton || "Remove"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{labels.businessInfoTitle || "Business Information"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.businessName || "Business Name"}</Label>
                    <Switch
                      checked={settings.toggles.showBusinessName}
                      onCheckedChange={(v) => updateToggle('showBusinessName', v)}
                    />
                  </div>
                  <Input
                    value={settings.businessInfo.name || ''}
                    onChange={(e) => updateBusinessInfo('name', e.target.value)}
                    placeholder={currentUser?.companyName || labels.businessNamePlaceholder || "Your Business Name"}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.phoneNumber || "Phone Number"}</Label>
                    <Switch
                      checked={settings.toggles.showBusinessPhone}
                      onCheckedChange={(v) => updateToggle('showBusinessPhone', v)}
                    />
                  </div>
                  <Input
                    value={settings.businessInfo.phone || ''}
                    onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                    placeholder={labels.phonePlaceholder || "+27 123 456 7890"}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">{labels.addressLine1 || "Address Line 1"}</Label>
                  <Switch
                    checked={settings.toggles.showBusinessAddress}
                    onCheckedChange={(v) => updateToggle('showBusinessAddress', v)}
                  />
                </div>
                <Input
                  value={settings.businessInfo.addressLine1 || ''}
                  onChange={(e) => updateBusinessInfo('addressLine1', e.target.value)}
                  placeholder={labels.addressLine1Placeholder || "123 Main Street"}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white">{labels.addressLine2 || "Address Line 2"}</Label>
                <Input
                  value={settings.businessInfo.addressLine2 || ''}
                  onChange={(e) => updateBusinessInfo('addressLine2', e.target.value)}
                  placeholder={labels.addressLine2Placeholder || "City, Postal Code"}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.email || "Email"}</Label>
                    <Switch
                      checked={settings.toggles.showBusinessEmail}
                      onCheckedChange={(v) => updateToggle('showBusinessEmail', v)}
                    />
                  </div>
                  <Input
                    value={settings.businessInfo.email || ''}
                    onChange={(e) => updateBusinessInfo('email', e.target.value)}
                    placeholder={labels.emailPlaceholder || "info@business.com"}
                    type="email"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.website || "Website"}</Label>
                    <Switch
                      checked={settings.toggles.showBusinessWebsite}
                      onCheckedChange={(v) => updateToggle('showBusinessWebsite', v)}
                    />
                  </div>
                  <Input
                    value={settings.businessInfo.website || ''}
                    onChange={(e) => updateBusinessInfo('website', e.target.value)}
                    placeholder={labels.websitePlaceholder || "www.business.com"}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.registrationNumber || "Registration Number"}</Label>
                    <Switch
                      checked={settings.toggles.showRegistrationNumber}
                      onCheckedChange={(v) => updateToggle('showRegistrationNumber', v)}
                    />
                  </div>
                  <Input
                    value={settings.businessInfo.registrationNumber || ''}
                    onChange={(e) => updateBusinessInfo('registrationNumber', e.target.value)}
                    placeholder={labels.regNumberPlaceholder || "REG123456"}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-white">{labels.vatNumber || "VAT Number"}</Label>
                    <Switch
                      checked={settings.toggles.showVATNumber}
                      onCheckedChange={(v) => updateToggle('showVATNumber', v)}
                    />
                  </div>
                  <Input
                    value={settings.businessInfo.vatNumber || ''}
                    onChange={(e) => updateBusinessInfo('vatNumber', e.target.value)}
                    placeholder={labels.vatNumberPlaceholder || "VAT123456"}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">{labels.displayOptionsTitle || "Display Options"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">{labels.showLogo || "Show Logo"}</Label>
                <Switch
                  checked={settings.toggles.showLogo}
                  onCheckedChange={(v) => updateToggle('showLogo', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-white">{labels.showDateTime || "Show Date & Time"}</Label>
                <Switch
                  checked={settings.toggles.showDateTime}
                  onCheckedChange={(v) => updateToggle('showDateTime', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-white">{labels.showStaffInfo || "Show Staff Information"}</Label>
                <Switch
                  checked={settings.toggles.showStaffInfo}
                  onCheckedChange={(v) => updateToggle('showStaffInfo', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-white">{labels.showCustomerInfo || "Show Customer Information"}</Label>
                <Switch
                  checked={settings.toggles.showCustomerInfo}
                  onCheckedChange={(v) => updateToggle('showCustomerInfo', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-white">{labels.showPaymentMethod || "Show Payment Method"}</Label>
                <Switch
                  checked={settings.toggles.showPaymentMethod}
                  onCheckedChange={(v) => updateToggle('showPaymentMethod', v)}
                />
              </div>
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
                  <Switch
                    checked={settings.toggles.showCustomHeader}
                    onCheckedChange={(v) => updateToggle('showCustomHeader', v)}
                  />
                </div>
                <Textarea
                  value={settings.customMessages.header || ''}
                  onChange={(e) => updateCustomMessage('header', e.target.value)}
                  placeholder={labels.headerPlaceholder || "Welcome! Special offers today..."}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={2}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">{labels.thankYouMessage || "Thank You Message"}</Label>
                  <Switch
                    checked={settings.toggles.showThankYouMessage}
                    onCheckedChange={(v) => updateToggle('showThankYouMessage', v)}
                  />
                </div>
                <Input
                  value={settings.customMessages.thankYou || 'Thank you for your business!'}
                  onChange={(e) => updateCustomMessage('thankYou', e.target.value)}
                  placeholder={labels.thankYouPlaceholder || "Thank you for your business!"}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white">{labels.footerMessage || "Footer Message"}</Label>
                  <Switch
                    checked={settings.toggles.showCustomFooter}
                    onCheckedChange={(v) => updateToggle('showCustomFooter', v)}
                  />
                </div>
                <Textarea
                  value={settings.customMessages.footer || ''}
                  onChange={(e) => updateCustomMessage('footer', e.target.value)}
                  placeholder={labels.footerPlaceholder || "Visit us again! Returns accepted within 30 days..."}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-[hsl(217,90%,40%)] text-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,40%)] hover:text-white"
          >
            {labels.cancel || "Cancel"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white"
          >
            {isSaving ? (labels.saving || "Saving...") : (labels.save || "Save Settings")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
