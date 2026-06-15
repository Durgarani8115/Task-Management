import {
  Sidebar,
  SidebarMenu,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Link } from "lucide-react"
import { Button } from "./ui/button"
import { title } from "process"



const Menu = [
    {
        title : "Dashboard",
        url : "/",
        icon : "dashboard"
    }
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <Link href="/" className="flex items-center gap-2" >
                        
                        <span >Lisa modi</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator className="mx-0" />
        <SidebarContent>
            {/* section of sidebar */}
            
        </SidebarContent>
    </Sidebar>
  )
}