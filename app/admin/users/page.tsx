"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAdmin } from "@/hooks/use-admin"
import AdminLayout from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getAllUsers, updateUserRole, updateUserBanStatus, UserRole } from "@/lib/roles-service"
import { formatDistanceToNow } from "date-fns"
import { Search, MoreHorizontal, User, ShieldCheck, ShieldX, Ban } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import UserAvatar from "@/components/user-avatar"

interface AppUser {
  id: string
  displayName: string
  email: string
  photoURL?: string
  role?: string
  isBanned?: boolean
  createdAt: any
}

export default function AdminUsers() {
  const router = useRouter()
  const { isSuperAdmin, loading: roleLoading } = useAdmin()
  const [users, setUsers] = useState<AppUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [actionType, setActionType] = useState<"promote" | "demote" | "ban" | "unban" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers()
        setUsers(allUsers)
        setFilteredUsers(allUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    if (!roleLoading && isSuperAdmin) {
      fetchUsers()
    }
  }, [isSuperAdmin, roleLoading])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) => user.displayName?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleUserAction = async () => {
    if (!selectedUser || !actionType) return

    setIsProcessing(true)
    try {
      if (actionType === "promote") {
        await updateUserRole(selectedUser.id, UserRole.ADMIN)

        // Update user in the lists
        const updatedUsers = users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: UserRole.ADMIN } : user,
        )
        setUsers(updatedUsers)
        setFilteredUsers(
          updatedUsers.filter(
            (user) =>
              user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        )

        toast({
          title: "User promoted",
          description: `${selectedUser.displayName} has been promoted to Admin`,
        })
      } else if (actionType === "demote") {
        await updateUserRole(selectedUser.id, UserRole.USER)

        // Update user in the lists
        const updatedUsers = users.map((user) =>
          user.id === selectedUser.id ? { ...user, role: UserRole.USER } : user,
        )
        setUsers(updatedUsers)
        setFilteredUsers(
          updatedUsers.filter(
            (user) =>
              user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        )

        toast({
          title: "User demoted",
          description: `${selectedUser.displayName} has been demoted to regular user`,
        })
      } else if (actionType === "ban") {
        await updateUserBanStatus(selectedUser.id, true)

        // Update user in the lists
        const updatedUsers = users.map((user) => (user.id === selectedUser.id ? { ...user, isBanned: true } : user))
        setUsers(updatedUsers)
        setFilteredUsers(
          updatedUsers.filter(
            (user) =>
              user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        )

        toast({
          title: "User banned",
          description: `${selectedUser.displayName} has been banned`,
        })
      } else if (actionType === "unban") {
        await updateUserBanStatus(selectedUser.id, false)

        // Update user in the lists
        const updatedUsers = users.map((user) => (user.id === selectedUser.id ? { ...user, isBanned: false } : user))
        setUsers(updatedUsers)
        setFilteredUsers(
          updatedUsers.filter(
            (user) =>
              user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        )

        toast({
          title: "User unbanned",
          description: `${selectedUser.displayName} has been unbanned`,
        })
      }
    } catch (error) {
      console.error("Error processing user action:", error)
      toast({
        title: "Error",
        description: "Failed to process the action. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setActionDialogOpen(false)
      setSelectedUser(null)
      setActionType(null)
    }
  }

  const getActionDialogContent = () => {
    if (!selectedUser || !actionType) return null

    let title = ""
    let description = ""

    switch (actionType) {
      case "promote":
        title = "Promote User to Admin"
        description = `Are you sure you want to promote ${selectedUser.displayName} to Admin? They will have access to the admin dashboard and management features.`
        break
      case "demote":
        title = "Demote Admin to Regular User"
        description = `Are you sure you want to demote ${selectedUser.displayName} to a regular user? They will lose access to all admin features.`
        break
      case "ban":
        title = "Ban User"
        description = `Are you sure you want to ban ${selectedUser.displayName}? They will no longer be able to log in or use the platform.`
        break
      case "unban":
        title = "Unban User"
        description = `Are you sure you want to unban ${selectedUser.displayName}? They will regain access to the platform.`
        break
    }

    return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUserAction}
            disabled={isProcessing}
            className={actionType === "ban" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isProcessing ? "Processing..." : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    )
  }

  if (roleLoading) {
    return null // AdminLayout will show loading state
  }

  if (!isSuperAdmin) {
    router.push("/admin")
    return null
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
        <p className="text-muted-foreground">View and manage all users.</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-2">
                      <UserAvatar src={user.photoURL} name={user.displayName} size="sm" />
                      <span className="font-medium">{user.displayName || "User"}</span>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === UserRole.SUPER_ADMIN
                            ? "default"
                            : user.role === UserRole.ADMIN
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {user.role === UserRole.SUPER_ADMIN
                          ? "Super Admin"
                          : user.role === UserRole.ADMIN
                            ? "Admin"
                            : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.createdAt &&
                        formatDistanceToNow(
                          typeof user.createdAt.toDate === "function"
                            ? user.createdAt.toDate()
                            : new Date(user.createdAt),
                          { addSuffix: true },
                        )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/profile/${user.id}`}>
                              <User className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>

                          {/* Don't allow actions on super admins */}
                          {user.role !== UserRole.SUPER_ADMIN && (
                            <>
                              {user.role !== UserRole.ADMIN ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setActionType("promote")
                                    setActionDialogOpen(true)
                                  }}
                                >
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Promote to Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setActionType("demote")
                                    setActionDialogOpen(true)
                                  }}
                                >
                                  <ShieldX className="mr-2 h-4 w-4" />
                                  Remove Admin
                                </DropdownMenuItem>
                              )}

                              {!user.isBanned ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setActionType("ban")
                                    setActionDialogOpen(true)
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Ban User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setActionType("unban")
                                    setActionDialogOpen(true)
                                  }}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Unban User
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        {getActionDialogContent()}
      </AlertDialog>
    </AdminLayout>
  )
}
