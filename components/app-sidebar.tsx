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
import Link from "next/link"
import Image from "next/image"
import { Button } from "./ui/button"


import { HelpCircle, Home, Inbox, Newspaper, NewspaperIcon, Paperclip, Settings, Sheet, SquareActivity, SquareCheck, User, User2, Users } from "lucide-react"
import { check } from "zod"
import { userAgent } from "next/server"
import { getServerSession } from "@/lib/auth"



const MenuItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home
    },
    {
        title: "Inbox",
        url: "/",
        icon: Inbox
    },
    {
        title: "Workspace",
        url: "/workspaces",
        icon: User
    }
]
const TeamSpaces = [
    {
        title: "Tasks",
        url: '/',
        icon: SquareCheck

    },
    {
        title: "Docs",
        url: '/',
        icon: Newspaper

    },
    {
        title: "Meetings",
        url: '/',
        icon: Users

    }
]

const Other = [
    {
        title: "Settings",
        url: "/",
        icon: Settings

    },
    {
        title: "Support",
        url: "/",
        icon: HelpCircle

    },

]

const SidebarSection = [
    {
        label: "Menu",
        items: MenuItems
    },
    {
        label: "Team Spaces",
        items: TeamSpaces

    },
    {
        label: "Settings ",
        items: Other
    }
]

export async function AppSidebar() {
    const user = await getServerSession()

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/" className="flex items-center gap-2 h-auto py-2" >
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold shrink-0">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div className="flex flex-col items-start text-sm overflow-hidden">
                                    <span className="font-semibold truncate">{user?.name || 'Guest'}</span>
                                    <span className="text-xs text-gray-500 truncate">{user?.email || 'Not logged in'}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-0" />
            <SidebarContent>
                {/* section of sidebar */}
                {SidebarSection.map((section) => (
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