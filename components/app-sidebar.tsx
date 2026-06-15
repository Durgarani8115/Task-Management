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
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link  from "next/link"
import { Button } from "./ui/button"


import { HelpCircle, Home, Inbox , Newspaper, NewspaperIcon, Paperclip, Settings, Sheet, SquareActivity, SquareCheck, User, User2, Users} from "lucide-react"
import { check } from "zod"



const MenuItems = [
    {
        title : "Dashboard",
        url : "/",
        icon : Home
    },
    {
        title : "Inbox",
        url : "/",
        icon: Inbox
    }
]
const TeamSpaces = [
    {
        title : "Tasks",
        url : '/',
        icon : SquareCheck

    },
    {
        title : "Docs",
        url : '/',
        icon : Newspaper

    },
    {
        title : "Meetings",
        url : '/',
        icon : Users

    }
]

const Other = [
    {
        title : "Settings",
        url : "/",
        icon : Settings

    },
    {
        title : "Support",
        url : "/",
        icon : HelpCircle

    },

]

const SidebarSection =[
    {
        label : "Menu",
        items : MenuItems
    },
    {
        label : "Team Spaces",
        items: TeamSpaces

    },
    {
        label : "Settings ",
        items : Other
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
            {SidebarSection.map((section)  => (
                <SidebarGroup key={section.label}>
                    <SidebarGroupLabel>
                        {section.label}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {section.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton>
                                        <Link
                                            href={item.url}
                                            className="flex items-center gap-2"
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
            
        </SidebarContent>

        <SidebarFooter>
            {/* WORK IN FOOTER CONTENT */}
            <SidebarMenu>
                <SidebarMenuItem>

                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}