"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Ban, Loader2 } from "lucide-react"

interface BanConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  userName: string
  action: "ban" | "unban"
}

export function BanConfirmationDialog({ isOpen, onClose, onConfirm, userName, action }: BanConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isBan = action === "ban"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-full ${isBan ? "bg-red-100 dark:bg-red-900/20" : "bg-green-100 dark:bg-green-900/20"}`}
            >
              {isBan ? (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <Ban className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            <DialogTitle className="text-lg font-semibold">{isBan ? "Ban User" : "Unban User"}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Are you sure you want to {action} <span className="font-semibold">{userName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isBan && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-medium mb-1">This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Immediately sign them out of all sessions</li>
                  <li>Prevent them from accessing the platform</li>
                  <li>Hide their content from other users</li>
                  <li>Block them from creating new content</li>
                </ul>
              </div>
            </div>
          )}

          {!isBan && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-medium mb-1">This action will:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Restore their access to the platform</li>
                  <li>Allow them to sign in again</li>
                  <li>Make their content visible to other users</li>
                  <li>Enable them to create new content</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto bg-transparent"
          >
            Cancel
          </Button>
          <Button
            variant={isBan ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isBan ? "Banning..." : "Unbanning..."}
              </>
            ) : (
              <>{isBan ? "Ban User" : "Unban User"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
