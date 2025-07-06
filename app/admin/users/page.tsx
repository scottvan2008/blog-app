"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import AdminLayout from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Search, Users, Shield, Ban, UserCheck } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { BanConfirmationDialog } from "@/components/admin/ban-confirmation-dialog"
import { collection, getDocs, doc, updateDoc, query } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  role: string
  banned: boolean
  createdAt: any
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const { isAdmin } = useAdmin()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banAction, setBanAction] = useState<"ban" | "unban">("ban")
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersQuery = query(collection(db, "users"))
      const querySnapshot = await getDocs(usersQuery)

      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]

      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (targetUser: User) => {
    setSelectedUser(targetUser)
    setBanAction(targetUser.banned ? "unban" : "ban")
    setBanDialogOpen(true)
  }

  const confirmBanAction = async () => {
    if (!selectedUser) return

    setProcessing(selectedUser.id)
    try {
      const userRef = doc(db, "users", selectedUser.id)
      await updateDoc(userRef, {
        banned: banAction === "ban",
      })

      // Update local state
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, banned: banAction === "ban" } : u)))

      toast({
        title: "Success",
        description: `User ${banAction === "ban" ? "banned" : "unbanned"} successfully`,
      })
    } catch (error) {
      console.error(`Error ${banAction}ning user:`, error)
      toast({
        title: "Error",
        description: `Failed to ${banAction} user`,
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handlePromoteUser = async (targetUser: User) => {
    if (!confirm(`Are you sure you want to promote ${targetUser.displayName} to admin?`)) return

    setProcessing(targetUser.id)
    try {
      const userRef = doc(db, "users", targetUser.id)
      await updateDoc(userRef, {
        role: "admin",
      })

      // Update local state
      setUsers(users.map((u) => (u.id === targetUser.id ? { ...u, role: "admin" } : u)))

      toast({
        title: "Success",
        description: "User promoted to admin successfully",
      })
    } catch (error) {
      console.error("Error promoting user:", error)
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const handleDemoteUser = async (targetUser: User) => {
    if (!confirm(`Are you sure you want to demote ${targetUser.displayName} from admin?`)) return

    setProcessing(targetUser.id)
    try {
      const userRef = doc(db, "users", targetUser.id)
      await updateDoc(userRef, {
        role: "user",
      })

      // Update local state
      setUsers(users.map((u) => (u.id === targetUser.id ? { ...u, role: "user" } : u)))

      toast({
        title: "Success",
        description: "User demoted from admin successfully",
      })
    } catch (error) {
      console.error("Error demoting user:", error)
      toast({
        title: "Error",
        description: "Failed to demote user",
        variant: "destructive",
      })
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Unknown"
    }
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{users.length} total users</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "No users found matching your search." : "No users found."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((targetUser) => (
                  <TableRow key={targetUser.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={targetUser.photoURL || "/placeholder.svg"} alt={targetUser.displayName} />
                          <AvatarFallback>
                            {(targetUser.displayName || targetUser.email || "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{targetUser.displayName || "No name"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{targetUser.email}</TableCell>
                    <TableCell>
                      <Badge variant={targetUser.role === "admin" ? "default" : "secondary"}>
                        {targetUser.role || "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={targetUser.banned ? "destructive" : "outline"}>
                        {targetUser.banned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(targetUser.createdAt)}</TableCell>
                    <TableCell>
                      {targetUser.id !== user?.uid && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={processing === targetUser.id}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {targetUser.role === "admin" ? (
                              <DropdownMenuItem
                                onClick={() => handleDemoteUser(targetUser)}
                                className="text-orange-600"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Demote from Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handlePromoteUser(targetUser)} className="text-blue-600">
                                <Shield className="h-4 w-4 mr-2" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleBanUser(targetUser)}
                              className={targetUser.banned ? "text-green-600" : "text-red-600"}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {targetUser.banned ? "Unban User" : "Ban User"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Ban Confirmation Dialog */}
        <BanConfirmationDialog
          isOpen={banDialogOpen}
          onClose={() => setBanDialogOpen(false)}
          onConfirm={confirmBanAction}
          userName={selectedUser?.displayName || selectedUser?.email || "Unknown User"}
          action={banAction}
        />
      </div>
    </AdminLayout>
  )
}
