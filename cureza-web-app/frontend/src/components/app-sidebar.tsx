'use client';

import * as React from "react"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Settings,
  FileText,
  Shield,
  CreditCard,
  Store,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Globe,
  Award,
  Trophy,
  Gift,
  Share2,
  Activity,
  HelpCircle,
  Database,
  Lock,
  Tag,
  Layers,
  Megaphone,
  Calendar,
  Menu as MenuIcon,
  RefreshCw,
  BookOpen,
  Star,
  Truck
} from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

// Super Admin Navigation Data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/superadmin/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard",
      items: [
        { title: "Overview", url: "/superadmin/dashboard" },
        { title: "Analytics", url: "/superadmin/dashboard/analytics" },
        { title: "Reports", url: "/superadmin/dashboard/reports" },
      ],
    },
    {
      title: "Products & Catalog",
      url: "/superadmin/dashboard/products",
      icon: Package,
      permission: "products",
      items: [
        { title: "All Products", url: "/superadmin/dashboard/products" },
        { title: "Add New Product", url: "/superadmin/dashboard/products/create" },
        { title: "Bulk Upload", url: "/superadmin/dashboard/products/bulk" },
        { title: "Web Catalog Scraper", url: "/superadmin/dashboard/scraper" },
        { title: "Categories", url: "/superadmin/dashboard/categories" },
        { title: "Brands", url: "/superadmin/dashboard/brands" },
        { title: "Attributes", url: "/superadmin/dashboard/attributes" },
        { title: "Product Tags", url: "/superadmin/dashboard/products/tags" },
      ],
    },
    {
      title: "Ratings & Reviews",
      url: "/superadmin/dashboard/ratings?tab=overview",
      icon: Star,
      permission: "reviews",
      items: [
        { title: "Overview", url: "/superadmin/dashboard/ratings?tab=overview" },
        { title: "Product Reviews", url: "/superadmin/dashboard/ratings?tab=products" },
        { title: "Store Reviews", url: "/superadmin/dashboard/ratings?tab=sellers" },
        { title: "Doctor Reviews", url: "/superadmin/dashboard/ratings?tab=doctors" },
        { title: "Seller Replies", url: "/superadmin/dashboard/ratings?tab=replies" },
      ],
    },
    {
      title: "Orders & Refunds",
      url: "/superadmin/dashboard/orders",
      icon: ShoppingBag,
      permission: "orders",
      items: [
        { title: "All Orders", url: "/superadmin/dashboard/orders" },
        { title: "Refund Requests", url: "/superadmin/dashboard/refunds" },
        { title: "Shipments", url: "/superadmin/dashboard/shipments" },
      ],
    },
    {
      title: "User Management",
      url: "/superadmin/dashboard/users",
      icon: Users,
      permission: "users",
      items: [
        { title: "Overview", url: "/superadmin/dashboard/users" },
        { title: "Customers", url: "/superadmin/dashboard/users/customers" },
        { title: "Doctors", url: "/superadmin/dashboard/users/doctors" },
        { title: "Sellers", url: "/superadmin/dashboard/users/sellers" },
        { title: "Team & Admins", url: "/superadmin/dashboard/users/team" },
      ],
    },
    {
      title: "Marketing & Promos",
      url: "/superadmin/dashboard/marketing",
      icon: Megaphone,
      permission: "marketing",
      items: [
        { title: "Offers & Coupons", url: "/superadmin/dashboard/marketing/offers" },
        { title: "Bundle Offers", url: "/superadmin/dashboard/marketing/bundles" },
        { title: "Email Campaigns", url: "/superadmin/dashboard/marketing/email" },
        { title: "Automation", url: "/superadmin/dashboard/marketing/automation" },
        { title: "Pixel Settings", url: "/superadmin/dashboard/marketing/pixel" },
      ],
    },

    {
      title: "Finance",
      url: "/superadmin/dashboard/finance",
      icon: CreditCard,
      permission: "finance",
      items: [
        { title: "Finance Overview", url: "/superadmin/dashboard/finance" },
        { title: "Business Ledgers", url: "/superadmin/dashboard/finance/sellers" },
        { title: "Payout Releases", url: "/superadmin/dashboard/finance/payouts" },
        { title: "Transactions Log", url: "/superadmin/dashboard/finance/transactions" },
        { title: "Invoices & Taxes", url: "/superadmin/dashboard/finance/tax" },
        { title: "Audit Desk Simulator", url: "/superadmin/dashboard/finance/simulators" },
        { title: "Commission Policy", url: "/superadmin/dashboard/finance/commission" },
      ],
    },
    {
      title: "Support & Tickets",
      url: "/superadmin/dashboard/support",
      icon: HelpCircle,
      permission: "support",
      items: [
        { title: "All Tickets", url: "/superadmin/dashboard/support" },
      ],
    },
    {
      title: "Cureza Circle",
      url: "/superadmin/dashboard/community",
      icon: Award,
      permission: "community",
      items: [
        { title: "Circle Home", url: "/superadmin/dashboard/community" },
        { title: "Activity Log", url: "/superadmin/dashboard/community/activity" },
        { title: "Referrals", url: "/superadmin/dashboard/community/referrals" },
        { title: "Leaderboard", url: "/superadmin/dashboard/community/leaderboard" },
        { title: "Challenges", url: "/superadmin/dashboard/community/challenges" },
        { title: "Badges", url: "/superadmin/dashboard/community/badges" },
        { title: "Rewards Shop", url: "/superadmin/dashboard/community/rewards" },
        { title: "Circle Guidelines", url: "/superadmin/dashboard/community/guidelines" },
      ],
    },
    {
      title: "Content & CMS",
      url: "/superadmin/dashboard/cms",
      icon: FileText,
      permission: "cms",
      items: [
        { title: "All Posts", url: "/superadmin/dashboard/cms/blogs" },
        { title: "Blog Categories", url: "/superadmin/dashboard/cms/categories" },
        { title: "Blog Tags", url: "/superadmin/dashboard/cms/tags" },
        { title: "Blog Authors", url: "/superadmin/dashboard/cms/blogs/authors" },
        { title: "FAQ & Help", url: "/superadmin/dashboard/cms/faq" },
        { title: "Menu Builder", url: "/superadmin/dashboard/menu" },
      ],
    },
    {
      title: "Shipping & Checkout",
      url: "/superadmin/dashboard/settings/checkout-cart",
      icon: Truck,
      permission: "settings",
      items: [
        { title: "Unified Settings", url: "/superadmin/dashboard/settings/checkout-cart" },
      ],
    },
    {
      title: "Notifications & Flows",
      url: "/superadmin/dashboard/settings/notifications",
      icon: Bell,
      permission: "settings",
      items: [
        { title: "Campaign Templates", url: "/superadmin/dashboard/settings/notifications?tab=templates" },
        { title: "Automated Flows", url: "/superadmin/dashboard/settings/notifications?tab=flows" },
        { title: "Product Waitlists", url: "/superadmin/dashboard/settings/notifications?tab=waitlist" },
        { title: "AISensy WhatsApp", url: "/superadmin/dashboard/settings/notifications?tab=whatsapp" },
        { title: "Delivery Logs", url: "/superadmin/dashboard/settings/notifications?tab=logs" },
      ],
    },
    {
      title: "Global Settings",
      url: "/superadmin/dashboard/settings",
      icon: Settings,
      permission: "settings",
      items: [
        { title: "General Settings", url: "/superadmin/dashboard/settings/general" },
        { title: "Payment Gateways", url: "/superadmin/dashboard/settings/payments" },
        { title: "Legal Pages", url: "/superadmin/dashboard/settings/legal" },
        { title: "Roles & Access", url: "/superadmin/dashboard/settings/rbac" },
        { title: "Backup & Maintenance", url: "/superadmin/dashboard/settings/system" },
        { title: "Logs & Audit", url: "/superadmin/dashboard/settings/logs" },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cureza-green text-white font-bold">
            C
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">Cureza Admin</span>
            <span className="truncate text-xs">Super Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain
              .filter((item) => {
                if (!user) return false;
                if (user.role === 'super_admin') return true;
                if (user.role === 'admin') {
                  return user.permissions?.includes(item.permission) ?? false;
                }
                return false;
              })
              .map((item) => {
              // Determine if any sub-item is active or if the main URL is active
              const isSubItemActive = item.items?.some((subItem) => {
                const targetPath = subItem.url.split('?')[0];
                return pathname === targetPath;
              });
              const isParentActive = pathname === item.url || isSubItemActive;

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isParentActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={item.title}
                        className={isParentActive ? "text-cureza-green bg-cureza-green/5 font-medium" : ""}
                      >
                        {item.icon && <item.icon className={isParentActive ? "text-cureza-green" : ""} />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          // Match path and query params for active sub-item
                          let isSubActive = false;
                          const [targetPath, targetQuery] = subItem.url.split('?');
                          
                          if (pathname === targetPath) {
                            if (!targetQuery) {
                              isSubActive = true;
                            } else if (typeof window !== 'undefined') {
                              const currentParams = new URLSearchParams(window.location.search);
                              const targetParams = new URLSearchParams(targetQuery);
                              isSubActive = true;
                              targetParams.forEach((val, key) => {
                                if (currentParams.get(key) !== val) {
                                  isSubActive = false;
                                }
                              });
                            }
                          }

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link 
                                  href={subItem.url} 
                                  className={`flex items-center w-full px-2 py-1.5 rounded-md transition-colors ${
                                    isSubActive 
                                      ? "text-cureza-green bg-cureza-green/10 font-semibold" 
                                      : "text-gray-600 hover:text-cureza-green hover:bg-gray-50"
                                  }`}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => logout()} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
