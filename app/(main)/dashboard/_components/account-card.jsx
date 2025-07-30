"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard, MoreHorizontal, Trash, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import useFetch from "@/hooks/use-fetch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { updateDefaultAccount, deleteAccount } from "@/actions/account";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error: updateError,
  } = useFetch(updateDefaultAccount);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
    error: deleteError,
  } = useFetch(deleteAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return;
    }

    await updateDefaultFn(id);
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setDropdownOpen(false); // Close dropdown
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    await deleteFn(id);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  // Handle success and error messages
  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError.message || "Failed to update default account");
    }
  }, [updateError]);

  useEffect(() => {
    if (deleted?.success) {
      toast.success("Account deleted successfully");
    } else if (deleted?.success === false) {
      let errorMessage = deleted.error || "Failed to delete account";
      
      if (errorMessage.includes("only default account")) {
        errorMessage = "Cannot delete the only default account. Please create another account first.";
      } else if (errorMessage.includes("only account")) {
        errorMessage = "Cannot delete the only account. Please create another account first.";
      }
      
      toast.error(errorMessage);
    }
  }, [deleted]);

  useEffect(() => {
    if (deleteError) {
      let errorMessage = deleteError.message || "Failed to delete account";
      
      if (errorMessage.includes("only default account")) {
        errorMessage = "Cannot delete the only default account. Please create another account first.";
      } else if (errorMessage.includes("only account")) {
        errorMessage = "Cannot delete the only account. Please create another account first.";
      }
      
      toast.error(errorMessage);
    }
  }, [deleteError]);

  return (
    <>
      <Card className="hover:shadow-md transition-colors duration-300 ease-in-out group relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
            {name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading || deleteLoading}
            />
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out"
                  disabled={deleteLoading}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
                <DropdownMenuItem asChild className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                  <Link href={`/account/${id}`}>
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                <DropdownMenuItem
                  className="text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300 ease-in-out"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <Link href={`/account/${id}`}>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
              ₹{parseFloat(balance).toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300 ease-in-out">
              {type.charAt(0) + type.slice(1).toLowerCase()} Account
            </p>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 ease-in-out">
            <div className="flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              Income
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              Expense
            </div>
          </CardFooter>
        </Link>
      </Card>

      {/* Enhanced Modal for Delete Confirmation */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
            onClick={handleCancelDelete}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
            {/* Close Button */}
            <button
              onClick={handleCancelDelete}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Trash className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{name}"</strong>?
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  <li>• The account itself</li>
                  <li>• All transactions in this account</li>
                  <li>• All associated data</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-6 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <LoadingSpinner size="sm" variant="spinner" color="white" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash className="h-4 w-4" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
