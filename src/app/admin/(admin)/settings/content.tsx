"use client";

import { useActionState } from "react";
import { User, Building, Mail, Phone, MapPin, Globe, Settings, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { businessConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  updatePasswordAction,
  type UpdatePasswordActionResult,
} from "@/lib/actions/settings";

export function AdminSettingsContent() {
  const [passwordState, passwordFormAction] = useActionState<
    UpdatePasswordActionResult | undefined,
    FormData
  >(updatePasswordAction, undefined);

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">
            <Building className="size-4 mr-2" aria-hidden="true" />
            Business
          </TabsTrigger>
          <TabsTrigger value="social">
            <Globe className="size-4 mr-2" aria-hidden="true" />
            Social Links
          </TabsTrigger>
          <TabsTrigger value="admin">
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
              <div className="space-y-1.5">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  defaultValue={businessConfig.name}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Business name is configured in code. Update <code>src/config/site.ts</code> to change.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="business-phone">Phone</Label>
                  <Input
                    id="business-phone"
                    type="tel"
                    defaultValue={businessConfig.phone}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Configured in <span className="font-mono text-xs bg-muted px-1 rounded">src/config/site.ts</span>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="business-whatsapp">WhatsApp</Label>
                  <Input
                    id="business-whatsapp"
                    type="tel"
                    defaultValue={businessConfig.whatsapp}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Configured in <span className="font-mono text-xs bg-muted px-1 rounded">src/config/site.ts</span>.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="business-email">Email</Label>
                <Input
                  id="business-email"
                  type="email"
                  defaultValue={businessConfig.email}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Configured in <span className="font-mono text-xs bg-muted px-1 rounded">src/config/site.ts</span>.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="business-address">Address</Label>
                <Input
                  id="business-address"
                  defaultValue={businessConfig.address}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Configured in <span className="font-mono text-xs bg-muted px-1 rounded">src/config/site.ts</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="business-city">City</Label>
                  <Input
                    id="business-city"
                    defaultValue={businessConfig.city}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Configured in <span className="font-mono text-xs bg-muted px-1 rounded">src/config/site.ts</span>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="business-country">Country</Label>
                  <Input
                    id="business-country"
                    defaultValue={businessConfig.country}
                    disabled
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Configured in <span className="font-mono text-xs bg-muted px-1 rounded">src/config/site.ts</span>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Business information is currently managed in the configuration file (
            <code>src/config/site.ts</code>). To edit these values, update the file and redeploy.
            A database-backed settings system can be added in a future iteration if needed.
          </p>
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
              {[
                { key: "facebook", label: "Facebook", icon: "📘" },
                { key: "instagram", label: "Instagram", icon: "📷" },
                { key: "tiktok", label: "TikTok", icon: "🎵" },
                { key: "youtube", label: "YouTube", icon: "▶️" },
              ].map((social) => (
                <div key={social.key} className="space-y-1.5">
                  <Label htmlFor={`social-${social.key}`}>
                    <span role="img" aria-label={social.label}>
                      {social.icon}
                    </span>{" "}
                    {social.label}
                  </Label>
                  <Input
                    id={`social-${social.key}`}
                    type="url"
                    defaultValue={businessConfig.social[social.key as keyof typeof businessConfig.social]}
                    disabled
                    className="bg-muted/50"
                    placeholder={`https://${social.key.toLowerCase()}.com/yourprofile`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Configured in <span className="font-mono text-xs bg-muted px-1 rounded">src/config/site.ts</span>.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Social links are managed in the configuration file (
            <code>src/config/site.ts</code>). Update the file and redeploy to change these values.
          </p>
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
                    {businessConfig.name} Admin
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