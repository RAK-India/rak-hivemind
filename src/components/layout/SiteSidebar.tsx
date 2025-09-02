import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Tag, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Group } from "@/lib/types/content";

interface SidebarProps {
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  title: string;
  href: string;
  group: Group;
  count?: number;
}

const navSections: NavSection[] = [
  {
    title: "Browse",
    items: [
      { title: "Customer Support", href: "/category/departments/customer-support", group: "departments", count: 12 },
      { title: "Sales & Management", href: "/category/departments/sales-management", group: "departments", count: 8 },
      { title: "Research & Development", href: "/category/departments/research-development", group: "departments", count: 15 },
      { title: "IT & DevOps", href: "/category/departments/it-devops", group: "departments", count: 22 },
      { title: "New Hire", href: "/category/resource-centre/new-hire", group: "resource-centre", count: 18 },
      { title: "Technical Support", href: "/category/resource-centre/technical-support", group: "resource-centre", count: 35 },
      { title: "Case Studies", href: "/category/resource-centre/case-studies", group: "resource-centre", count: 9 },
      { title: "User Manual", href: "/category/resource-centre/user-manual", group: "resource-centre", count: 28 },
      { title: "Web Development", href: "/category/tools/web-development", group: "tools", count: 16 },
      { title: "Management", href: "/category/tools/management", group: "tools", count: 11 },
      { title: "Analytics", href: "/category/tools/analytics", group: "tools", count: 14 }
    ]
  }
];

const quickLinks = [
  { icon: TrendingUp, label: "Popular Articles", href: "/search?sort=views" },
  { icon: Clock, label: "Recently Updated", href: "/search?sort=date" }
];

const topTags = [
  "Getting Started", "Configuration", "Best Practices", "API", "Security"
];

export function SiteSidebar({ isCollapsed, onCollapseChange }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Browse: true
  });
  const location = useLocation();

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      onCollapseChange(JSON.parse(saved));
    }
  }, [onCollapseChange]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
    <aside className={cn(
      "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <h2 className="font-semibold text-sidebar-foreground">Navigation</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapseChange(!isCollapsed)}
          className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Navigation Sections */}
          {navSections.map((section) => (
            <div key={section.title}>
              <Button
                variant="ghost"
                onClick={() => !isCollapsed && toggleSection(section.title)}
                className={cn(
                  "w-full justify-start text-sidebar-foreground font-medium mb-2",
                  isCollapsed && "justify-center px-0"
                )}
              >
                {!isCollapsed && (
                  <>
                    <span>{section.title}</span>
                    <ChevronDown className={cn(
                      "ml-auto h-4 w-4 transition-transform",
                      !expandedSections[section.title] && "-rotate-90"
                    )} />
                  </>
                )}
                {isCollapsed && (
                  <div className="h-2 w-2 rounded-full bg-sidebar-primary" />
                )}
              </Button>

              {(!isCollapsed && expandedSections[section.title]) && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isActiveRoute(item.href) && "bg-sidebar-primary text-sidebar-primary-foreground"
                      )}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.count && (
                        <Badge variant="secondary" className="ml-2 h-5 text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Quick Links */}
          {!isCollapsed && (
            <div>
              <h3 className="font-medium text-sidebar-foreground mb-2">Quick Links</h3>
              <div className="space-y-1">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {!isCollapsed && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-sidebar-foreground" />
                <h3 className="font-medium text-sidebar-foreground">Popular Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?tags=${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                  >
                    <Badge 
                      variant="outline" 
                      className="text-xs cursor-pointer hover:bg-sidebar-accent transition-colors"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}