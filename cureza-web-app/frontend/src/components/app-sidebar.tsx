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
  Star
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
import { useAuth } from "@/context/AuthContext"

// Super Admin Navigation Data
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/superadmin/dashboard",
      icon: LayoutDashboard,
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
      items: [
        { title: "All Products", url: "/superadmin/dashboard/products" },
        { title: "Add New Product", url: "/superadmin/dashboard/products/create" },
        { title: "Bulk Upload", url: "/superadmin/dashboard/products/bulk" },
        { title: "Categories", url: "/superadmin/dashboard/categories" },
        { title: "Brands", url: "/superadmin/dashboard/brands" },
        { title: "Attributes", url: "/superadmin/dashboard/attributes" },
        { title: "Product Tags", url: "/superadmin/dashboard/products/tags" },
      ],
    },
    {
      title: "Ratings & Reviews",
      url: "/superadmin/dashboard/ratings",
      icon: Star,
      items: [
        { title: "All Reviews", url: "/superadmin/dashboard/ratings" },
      ],
    },
    {
      title: "Orders & Refunds",
      url: "/superadmin/dashboard/orders",
      icon: ShoppingBag,
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
      items: [
        { title: "Customers", url: "/superadmin/dashboard/users/customers" },
        { title: "Doctors", url: "/superadmin/dashboard/users/doctors" },
        { title: "Sellers", url: "/superadmin/dashboard/users/sellers" },
        { title: "Team & Admins", url: "/superadmin/dashboard/users/team" },
      ],
    },
    {
      title: "Approvals",
      url: "/superadmin/dashboard/approvals",
      icon: Shield,
      items: [
        { title: "Store Change Requests", url: "/superadmin/dashboard/approvals/stores" },
        { title: "Seller Change Requests", url: "/superadmin/dashboard/seller-requests" },
        // { title: "Product Change Requests", url: "/superadmin/dashboard/approvals/products" },
      ]
    },
    {
      title: "Marketing & Promos",
      url: "/superadmin/dashboard/marketing",
      icon: Megaphone,
      items: [
        { title: "Offers & Coupons", url: "/superadmin/dashboard/marketing/offers" },
        { title: "Bundle Offers", url: "/superadmin/dashboard/marketing/bundles" },
        { title: "Email Campaigns", url: "/superadmin/dashboard/marketing/email" },
        { title: "Automation", url: "/superadmin/dashboard/marketing/automation" },
        { title: "Pixel Settings", url: "/superadmin/dashboard/marketing/pixel" },
      ],
    },
    {
      title: "Events",
      url: "/superadmin/dashboard/events",
      icon: Calendar,
      items: [
        { title: "All Events", url: "/superadmin/dashboard/events" },
      ],
    },
    {
      title: "Finance",
      url: "/superadmin/dashboard/finance",
      icon: CreditCard,
      items: [
        { title: "Finance Overview", url: "/superadmin/dashboard/finance" },
        { title: "Transactions", url: "/superadmin/dashboard/finance/transactions" },
        { title: "Seller Payouts", url: "/superadmin/dashboard/finance/payouts" },
        { title: "Tax & Invoices", url: "/superadmin/dashboard/finance/tax" },
      ],
    },
    {
      title: "Support & Tickets",
      url: "/superadmin/dashboard/support",
      icon: HelpCircle,
      items: [
        { title: "All Tickets", url: "/superadmin/dashboard/support" },
      ],
    },
    {
      title: "Cureza Circle",
      url: "/superadmin/dashboard/community",
      icon: Award,
      items: [
        { title: "Circle Home", url: "/superadmin/dashboard/community" },
        { title: "Activity Log", url: "/superadmin/dashboard/community/activity" },
        { title: "Referrals", url: "/superadmin/dashboard/community/referrals" },
        { title: "Leaderboard", url: "/superadmin/dashboard/community/leaderboard" },
        { title: "Challenges", url: "/superadmin/dashboard/community/challenges" },
        { title: "Badges", url: "/superadmin/dashboard/community/badges" },
        { title: "Rewards Shop", url: "/superadmin/dashboard/community/rewards" },
      ],
    },
    {
      title: "Blogs",
      url: "/superadmin/dashboard/cms/blogs",
      icon: BookOpen,
      items: [
        { title: "All Posts", url: "/superadmin/dashboard/cms/blogs" },
        { title: "Categories", url: "/superadmin/dashboard/cms/categories" },
        { title: "Tags", url: "/superadmin/dashboard/cms/tags" },
      ],
    },
    {
      title: "Content & CMS",
      url: "/superadmin/dashboard/cms",
      icon: FileText,
      items: [
        { title: "Banners", url: "/superadmin/dashboard/cms/banners" },
        { title: "FAQ & Help", url: "/superadmin/dashboard/cms/faq" },
        { title: "Menu Builder", url: "/superadmin/dashboard/menu" },
      ],
    },
    {
      title: "Global Settings",
      url: "/superadmin/dashboard/settings",
      icon: Settings,
      items: [
        { title: "General Settings", url: "/superadmin/dashboard/settings/general" },
        { title: "Payment Gateways", url: "/superadmin/dashboard/settings/payments" },
        { title: "Notifications", url: "/superadmin/dashboard/settings/notifications" },
        { title: "Legal Pages", url: "/superadmin/dashboard/settings/legal" },
        { title: "Roles & Access", url: "/superadmin/dashboard/settings/rbac" },
        { title: "Backup & Maintenance", url: "/superadmin/dashboard/settings/system" },
        { title: "Shipping", url: "/superadmin/dashboard/settings/shipping" },
        { title: "Logs & Audit", url: "/superadmin/dashboard/settings/logs" },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
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
            {data.navMain.map((item, index) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={index === 0}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
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
