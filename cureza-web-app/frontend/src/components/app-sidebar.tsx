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
  ChevronRight,
  Cpu,
  Bell,
  Award,
  Megaphone,
  HelpCircle,
  Star,
  Truck,
  Image as ImageIcon,
  Mail
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
        { title: "Notifications", url: "/superadmin/dashboard/notifications" },
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
        { title: "Refund Requests", url: "/superadmin/dashboard/refunds?tab=refunds" },
        { title: "Cancelled Products", url: "/superadmin/dashboard/refunds?tab=cancelled" },
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
        { title: "Automation", url: "/superadmin/dashboard/marketing/automation" },
        { title: "Pixel Settings", url: "/superadmin/dashboard/marketing/pixel" },
      ],
    },
    {
      title: "Broadcast Center",
      url: "/superadmin/dashboard/marketing/broadcast",
      icon: Mail,
      permission: "marketing",
      items: [
        { title: "Campaigns & Broadcasts", url: "/superadmin/dashboard/marketing/broadcast?tab=campaigns" },
        { title: "Email Templates", url: "/superadmin/dashboard/marketing/broadcast?tab=templates" },
        { title: "Audience Lists", url: "/superadmin/dashboard/marketing/broadcast?tab=audience" },
        { title: "SMTP Providers", url: "/superadmin/dashboard/marketing/broadcast?tab=smtp" },
        { title: "Outbound Logs", url: "/superadmin/dashboard/marketing/broadcast?tab=logs" },
        { title: "Queue Manager", url: "/superadmin/dashboard/marketing/broadcast?tab=queue" },
        { title: "System Setup", url: "/superadmin/dashboard/marketing/broadcast?tab=settings" },
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
        { title: "Influencer Reviews Hub", url: "/superadmin/dashboard/community/social" },
        { title: "Influencer Messages", url: "/superadmin/dashboard/community/messages" },
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
        { title: "Public Pages", url: "/superadmin/dashboard/cms/public-pages" },
        { title: "Menu Builder", url: "/superadmin/dashboard/menu" },
      ],
    },
    {
      title: "Media Library",
      url: "/superadmin/dashboard/media",
      icon: ImageIcon,
      permission: "cms",
      items: [
        { title: "All Media", url: "/superadmin/dashboard/media" },
        { title: "Folders", url: "/superadmin/dashboard/media/folders" },
        { title: "Trash", url: "/superadmin/dashboard/media/trash" },
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
        { title: "Automated Flow Rules", url: "/superadmin/dashboard/settings/notifications?tab=flows" },
        { title: "Product Waitlist", url: "/superadmin/dashboard/settings/notifications?tab=waitlist" },
        { title: "AISensy API Configuration", url: "/superadmin/dashboard/settings/notifications?tab=whatsapp" },
        { title: "Delivery Audit Logs", url: "/superadmin/dashboard/settings/notifications?tab=logs" },
        { title: "System Integration Guide", url: "/superadmin/dashboard/settings/notifications?tab=guide" },
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
  const { user } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" className="border-r-[0.5px] border-neutral-950/10 bg-white" {...props}>
      {/* Sidebar Logo Header */}
      <SidebarHeader className="border-b-[0.5px] border-neutral-950/10 py-4 px-5">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white font-bold shrink-0 border border-neutral-950 select-none">
            C
          </div>
          <div className="grid flex-1 text-left text-xs leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold text-neutral-900 text-sm">Cureza Admin</span>
            <span className="truncate text-[10px] text-neutral-400 font-bold tracking-wider mt-0.5 uppercase">SYSTEM CENTRAL</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="py-2 no-scrollbar">
        <SidebarGroup>
          <SidebarMenu className="gap-1">
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
                          className={`w-full transition-all duration-150 rounded-lg hover:bg-neutral-50 px-3 py-2 ${
                            isParentActive 
                              ? "text-neutral-900 bg-neutral-100 border-[0.5px] border-neutral-950/10 font-bold" 
                              : "text-neutral-500 font-medium"
                          }`}
                        >
                          {item.icon && <item.icon size={16} className={isParentActive ? "text-neutral-900" : "text-neutral-400"} />}
                          <span className="text-xs group-data-[collapsible=icon]:hidden">{item.title}</span>
                          <ChevronRight size={14} className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden text-neutral-400" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                        <SidebarMenuSub className="border-l-[0.5px] border-neutral-950/10 ml-5 pl-2 my-1 flex flex-col gap-0.5">
                          {item.items?.map((subItem) => {
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
                                    className={`flex items-center w-full px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                                      isSubActive 
                                        ? "text-neutral-900 bg-neutral-100/60 font-bold border-[0.5px] border-neutral-950/5" 
                                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/50"
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

      {/* Styled Footer: B&W Square Profile Badge */}
      <SidebarFooter className="border-t-[0.5px] border-neutral-950/10 p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <div className="h-8 w-8 bg-neutral-950 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none border border-neutral-950 uppercase">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="grid flex-1 text-left text-[11px] leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="truncate font-bold text-neutral-900">{user?.name || 'Admin User'}</span>
            <span className="truncate text-[9px] text-neutral-400 font-bold tracking-wider mt-0.5 uppercase">
              {user?.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
            </span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
