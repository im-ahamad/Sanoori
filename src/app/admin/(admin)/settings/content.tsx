"use client";

import { useActionState, useState } from "react";
import { User, Building, Globe, Key, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  updatePasswordAction,
  type UpdatePasswordActionResult,
} from "@/lib/actions/settings";
import {
  updateBusinessSettingsAction,
  type UpdateBusinessSettingsResult,
} from "@/lib/actions/business-settings";
import type { BusinessSettings } from "@/lib/admin/settings";

interface BusinessSettingsFormData {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  telegram: string;
}

interface AdminSettingsContentProps {
  initialSettings: BusinessSettings | null;
}

function getDefaultFormData(): BusinessSettingsFormData {
  return {
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    country: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    telegram: "",
  };
}

function settingsToFormData(settings: BusinessSettings | null): BusinessSettingsFormData {
  if (!settings) return getDefaultFormData();
  return {
    name: settings.name,
    phone: settings.phone || "",
    whatsapp: settings.whatsapp || "",
    email: settings.email || "",
    address: settings.address || "",
    city: settings.city || "",
    country: settings.country || "",
    facebook: settings.facebook || "",
    instagram: settings.instagram || "",
    tiktok: settings.tiktok || "",
    youtube: settings.youtube || "",
    telegram: settings.telegram || "",
  };
}

export function AdminSettingsContent({ initialSettings }: AdminSettingsContentProps) {
  const [passwordState, passwordFormAction] = useActionState<
    UpdatePasswordActionResult | undefined,
    FormData
  >(updatePasswordAction, undefined);

  const [businessState, businessFormAction] = useActionState<
    UpdateBusinessSettingsResult | undefined,
    FormData
  >(updateBusinessSettingsAction, undefined);

  const [formData, setFormData] = useState<BusinessSettingsFormData>(() =>
    settingsToFormData(initialSettings)
  );

  const settingsKey = initialSettings?.updatedAt?.toISOString() ?? "default";

  const handleChange = (field: keyof BusinessSettingsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = businessState && !businessState.ok && businessState.message === "Updating…";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure business details and admin preferences.
        </p>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto gap-2 p-1 grid-cols-3 sm:grid sm:overflow-visible sm:p-0">
          <TabsTrigger value="business" className="whitespace-nowrap">
            <Building className="size-4 mr-2" aria-hidden="true" />
            Business
          </TabsTrigger>
          <TabsTrigger value="social" className="whitespace-nowrap">
            <Globe className="size-4 mr-2" aria-hidden="true" />
            Social Links
          </TabsTrigger>
          <TabsTrigger value="admin" className="whitespace-nowrap">
            <User className="size-4 mr-2" aria-hidden="true" />
            Admin Profile
          </TabsTrigger>
        </TabsList>

        {/* ===== Business Information ===== */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5 text-gold" aria-hidden="true" />
                Business Information
              </CardTitle>
              <CardDescription>
                These details are displayed on the public website and used for contact purposes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form key={settingsKey} action={businessFormAction} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="business-phone">Phone</Label>
                    <Input
                      id="business-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+880 XX XXXX XXXX"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="business-whatsapp">WhatsApp</Label>
                    <Input
                      id="business-whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      placeholder="+880 XX XXXX XXXX"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="business-email">Email</Label>
                  <Input
                    id="business-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="info@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="business-address">Address</Label>
                  <Input
                    id="business-address"
                    name="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="business-city">City</Label>
                    <Input
                      id="business-city"
                      name="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Dhaka"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="business-country">Country</Label>
                    <Input
                      id="business-country"
                      name="country"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="Bangladesh"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="size-4" aria-hidden="true" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  {businessState && !isLoading && (
                    <p
                      role="status"
                      className={cn(
                        "text-sm",
                        businessState.ok ? "text-green-600" : "text-destructive"
                      )}
                    >
                      {businessState.message}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Social Links ===== */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-5 text-gold" aria-hidden="true" />
                Social Media Links
              </CardTitle>
              <CardDescription>
                Links to your social media profiles displayed on the website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form key={settingsKey} action={businessFormAction} className="space-y-4">
                {[
                  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourprofile" },
                  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourprofile" },
                  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@yourprofile" },
                  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourprofile" },
                  { key: "telegram", label: "Telegram", placeholder: "https://t.me/yourprofile" },
                ].map((social) => (
                  <div key={social.key} className="space-y-1.5">
                    <Label htmlFor={`social-${social.key}`}>{social.label}</Label>
                    <Input
                      id={`social-${social.key}`}
                      name={social.key}
                      type="url"
                      value={formData[social.key as keyof BusinessSettingsFormData]}
                      onChange={(e) => handleChange(social.key as keyof BusinessSettingsFormData, e.target.value)}
                      placeholder={social.placeholder}
                    />
                  </div>
                ))}

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save className="size-4" aria-hidden="true" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  {businessState && !isLoading && (
                    <p
                      role="status"
                      className={cn(
                        "text-sm",
                        businessState.ok ? "text-green-600" : "text-destructive"
                      )}
                    >
                      {businessState.message}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Admin Profile ===== */}
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-gold" aria-hidden="true" />
                Admin Profile
              </CardTitle>
              <CardDescription>
                Manage your admin account settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="size-10 text-muted-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-foreground">
                    {formData.name || "Sanoori Trading"} Admin
                  </p>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  defaultValue="admin@sanooritrading.com"
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed from here. Contact system administrator if needed.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-role">Role</Label>
                <Input
                  id="admin-role"
                  defaultValue="ADMIN"
                  disabled
                  className="bg-muted/50"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="size-5 text-gold" aria-hidden="true" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your admin panel password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={passwordFormAction} className="space-y-4">
                {passwordState && !passwordState.ok && (
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {passwordState.message}
                  </p>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <Button type="submit" disabled={passwordState && !passwordState.ok}>
                  {passwordState && !passwordState.ok ? "Updating…" : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}