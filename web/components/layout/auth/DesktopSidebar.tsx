import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/services/hooks/localStorage";
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useOrg } from "../organizationContext";
import OrgDropdown from "../orgDropdown";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current: boolean;
  featured?: boolean;
  subItems?: NavigationItem[];
}

interface SidebarProps {
  NAVIGATION: NavigationItem[];
  setReferOpen: (open: boolean) => void;
  setOpen: (open: boolean) => void;
}

const DesktopSidebar = ({
  NAVIGATION,
  setReferOpen,
  setOpen,
}: SidebarProps) => {
  const org = useOrg();
  const tier = org?.currentOrg?.tier;
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    "isSideBarCollapsed",
    false
  );

  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>(
    "expandedItems",
    []
  );

  const toggleExpand = (name: string) => {
    const prev = expandedItems || [];
    setExpandedItems(
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const renderNavItem = (link: NavigationItem, isSubItem = false) => {
    const hasSubItems = link.subItems && link.subItems.length > 0;

    return (
      <div key={link.name}>
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href={hasSubItems ? "#" : link.href}
                onClick={
                  hasSubItems ? () => toggleExpand(link.name) : undefined
                }
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  }),
                  "h-9 w-9",
                  link.current && "bg-accent hover:bg-accent"
                )}
              >
                <link.icon
                  className={cn(
                    "h-4 w-4",
                    link.current && "text-accent-foreground"
                  )}
                />
                <span className="sr-only">{link.name}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="flex items-center gap-4 dark:bg-gray-800 dark:text-gray-200"
            >
              {link.name}
              {link.featured && (
                <span className="ml-auto text-muted-foreground">New</span>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className={cn(isSubItem && "ml-4")}>
            <Link
              href={hasSubItems ? "#" : link.href}
              onClick={hasSubItems ? () => toggleExpand(link.name) : undefined}
              className={cn(
                buttonVariants({
                  variant: link.current ? "secondary" : "ghost",
                  size: "sm",
                }),
                "justify-start w-full",
                hasSubItems && "flex items-center justify-between"
              )}
            >
              <div className="flex items-center">
                <link.icon
                  className={cn(
                    "mr-2 h-4 w-4",
                    link.current && "text-accent-foreground"
                  )}
                />
                {link.name}
              </div>
              {hasSubItems && (
                <ChevronRightIcon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expandedItems.includes(link.name) && "rotate-90"
                  )}
                />
              )}
            </Link>
          </div>
        )}
        {hasSubItems && expandedItems.includes(link.name) && !isCollapsed && (
          <div className="ml-4 mt-1">
            {link.subItems!.map((subItem) => renderNavItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "hidden md:block",
          isCollapsed ? "w-16" : "w-56",
          "transition-all duration-300"
        )}
      />
      <div
        className={cn(
          "hidden md:flex md:flex-col z-30 bg-background dark:bg-gray-900 transition-all duration-300 h-screen bg-white pb-4",
          isCollapsed ? "md:w-16" : "md:w-56",
          "fixed top-0 left-0" // Changed from "sticky top-0" to "fixed top-0 left-0"
        )}
      >
        <div className="w-full flex flex-grow flex-col overflow-y-auto border-r dark:border-gray-700 justify-between">
          <div className="flex items-center gap-2 h-14 border-b dark:border-gray-700">
            {!isCollapsed && <OrgDropdown setReferOpen={setReferOpen} />}
            <div className={cn("mx-auto", !isCollapsed && "mr-2")}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex justify-center dark:hover:bg-gray-800 px-2"
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="h-4 w-4" />
                ) : (
                  <ChevronLeftIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-grow flex-col">
            {((!isCollapsed &&
              org?.currentOrg?.organization_type === "reseller") ||
              org?.isResellerOfCurrentCustomerOrg) && (
              <div className="flex w-full justify-center px-5 py-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    router.push("/enterprise/portal");
                    if (
                      org.currentOrg?.organization_type === "customer" &&
                      org.currentOrg?.reseller_id
                    ) {
                      org.setCurrentOrg(org.currentOrg.reseller_id);
                    }
                  }}
                >
                  {org.currentOrg?.organization_type === "customer"
                    ? "Back to Portal"
                    : "Customer Portal"}
                </Button>
              </div>
            )}

            <div
              data-collapsed={isCollapsed}
              className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2 "
            >
              <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                {NAVIGATION.map((link) => renderNavItem(link))}
              </nav>
            </div>
          </div>

          <div className="mt-auto">
            {isCollapsed ? (
              <>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full dark:hover:bg-gray-800"
                      asChild
                    >
                      <Link
                        href="https://docs.helicone.ai/introduction"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <BookOpenIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="dark:bg-gray-800 dark:text-gray-200"
                  >
                    View Documentation
                  </TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full dark:hover:bg-gray-800"
                      asChild
                    >
                      <Link
                        href="https://discord.gg/zsSTcH2qhG"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <QuestionMarkCircleIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="dark:bg-gray-800 dark:text-gray-200"
                  >
                    Help And Support
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start dark:hover:bg-gray-800"
                  asChild
                >
                  <Link
                    href="https://docs.helicone.ai/introduction"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2"
                  >
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    View Documentation
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start dark:hover:bg-gray-800"
                  asChild
                >
                  <Link
                    href="https://discord.gg/zsSTcH2qhG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2"
                  >
                    <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
                    Help And Support
                  </Link>
                </Button>
              </>
            )}
          </div>

          {tier === "free" &&
            org?.currentOrg?.organization_type !== "customer" && (
              <div className={cn("p-4", isCollapsed && "hidden")}>
                <Button
                  variant="outline"
                  className="w-full justify-between dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setOpen(true)}
                >
                  <div className="flex items-center">
                    <CloudArrowUpIcon className="h-5 w-5 mr-1.5" />
                    <span>Free Plan</span>
                  </div>
                  <span className="text-xs font-normal text-primary dark:text-gray-300">
                    Learn More
                  </span>
                </Button>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default DesktopSidebar;
