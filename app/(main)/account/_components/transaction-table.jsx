"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Eye,
  Edit,
  Calendar,
  Tag,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/data/categories";
import { bulkDeleteTransactions } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";
import { useRouter } from "next/navigation";
import { LoadingSpinner, LoadingOverlay } from "@/components/ui/loading-spinner";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function TransactionTable({ transactions }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [recurringFilter, setRecurringFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  // Memoized filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (typeFilter && typeFilter !== "all") {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Apply recurring filter
    if (recurringFilter && recurringFilter !== "all") {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = useCallback((field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  }, [paginatedTransactions]);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const confirmBulkDelete = useCallback(async () => {
    setShowDeleteDialog(false);
    deleteFn(selectedIds);
  }, [deleteFn, selectedIds]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  useEffect(() => {
    if (deleted && !deleteLoading) {
      if (deleted.success) {
        toast.success("Transactions deleted successfully");
        setSelectedIds([]); // Clear selections after successful deletion
        router.refresh();
      } else {
        toast.error(deleted.error || "Failed to delete transactions");
      }
    }
  }, [deleted, deleteLoading, router]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFilter("all");
    setRecurringFilter("all");
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleViewDetails = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  }, []);

  const handleEditTransaction = useCallback((transactionId) => {
    router.push(`/transaction/create?edit=${transactionId}`);
  }, [router]);

  const handleDeleteTransaction = useCallback((transactionId) => {
    deleteFn([transactionId]);
  }, [deleteFn]);

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner variant="dots" text="Deleting transactions..." />
        </div>
      )}
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 ease-in-out"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 transition-colors duration-300 ease-in-out">
              <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out">All</SelectItem>
              <SelectItem value="income" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out">Income</SelectItem>
              <SelectItem value="expense" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={recurringFilter} onValueChange={setRecurringFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
              <SelectValue placeholder="Recurring" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 transition-colors duration-300 ease-in-out">
              <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out">All</SelectItem>
              <SelectItem value="recurring" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out">Recurring</SelectItem>
              <SelectItem value="non-recurring" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out">Non-Recurring</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="transition-colors duration-300 ease-in-out"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("all");
              setRecurringFilter("all");
              setSortConfig({ field: "date", direction: "desc" });
            }}
            className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-700 transition-colors duration-300 ease-in-out">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="transition-colors duration-300 ease-in-out"
                />
              </TableHead>
              <TableHead className="text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
                <button
                  onClick={() => handleSort("description")}
                  className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 ease-in-out"
                >
                  Description
                  {sortConfig.field === "description" && (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>
              </TableHead>
              <TableHead className="text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 ease-in-out"
                >
                  Amount
                  {sortConfig.field === "amount" && (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>
              </TableHead>
              <TableHead className="text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 ease-in-out"
                >
                  Date
                  {sortConfig.field === "date" && (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>
              </TableHead>
              <TableHead className="text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">Category</TableHead>
              <TableHead className="text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">Type</TableHead>
              <TableHead className="text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(transaction.id)}
                    onCheckedChange={(checked) => handleSelect(transaction.id, checked)}
                    className="transition-colors duration-300 ease-in-out"
                  />
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
                  {transaction.description || "Untitled Transaction"}
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      "flex items-center font-medium",
                      transaction.type === "EXPENSE"
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? (
                      <ArrowDownRight className="mr-1 h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                    )}
                    ₹{transaction.amount.toFixed(2)}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300 transition-colors duration-300 ease-in-out">
                  {format(new Date(transaction.date), "PP")}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className="text-xs transition-colors duration-300 ease-in-out"
                    style={{
                      backgroundColor: categoryColors[transaction.category] || "#6b7280",
                      color: "white"
                    }}
                  >
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={transaction.type === "EXPENSE" ? "destructive" : "default"}
                    className="text-xs transition-colors duration-300 ease-in-out"
                  >
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
                      <DropdownMenuItem 
                        onClick={() => handleViewDetails(transaction)}
                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleEditTransaction(transaction.id)}
                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300 ease-in-out"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTransactions.length)} of{" "}
            {filteredAndSortedTransactions.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Modal for Bulk Delete Confirmation */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelDelete}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200 dark:border-gray-700">
            {/* Close Button */}
            <button
              onClick={handleCancelDelete}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Trash className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Delete Transactions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{selectedIds.length} transaction{selectedIds.length !== 1 ? 's' : ''}</strong>?
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  <li>• All selected transactions</li>
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
                onClick={confirmBulkDelete}
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
                    Delete {selectedIds.length} Transaction{selectedIds.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 border border-gray-200 dark:border-gray-700">
            {/* Close Button */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-full",
                  selectedTransaction.type === "EXPENSE" 
                    ? "bg-red-100 dark:bg-red-900/20" 
                    : "bg-green-100 dark:bg-green-900/20"
                )}>
                  {selectedTransaction.type === "EXPENSE" ? (
                    <ArrowDownRight className="h-6 w-6 text-red-500" />
                  ) : (
                    <ArrowUpRight className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Transaction Details
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedTransaction.description || "No description"}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Amount */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</span>
                  <span className={cn(
                    "text-lg font-bold",
                    selectedTransaction.type === "EXPENSE" 
                      ? "text-red-600 dark:text-red-400" 
                      : "text-green-600 dark:text-green-400"
                  )}>
                    ₹{parseFloat(selectedTransaction.amount).toFixed(2)}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(selectedTransaction.date), "EEEE, MMMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(selectedTransaction.date), "HH:mm")}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Category</p>
                    <Badge
                      variant="secondary"
                      className="text-xs mt-1"
                      style={{
                        backgroundColor: categoryColors[selectedTransaction.category] || "#e5e7eb",
                      }}
                    >
                      {selectedTransaction.category}
                    </Badge>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="h-4 w-4 rounded-full bg-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Status</p>
                    <Badge
                      variant={
                        selectedTransaction.status === "COMPLETED"
                          ? "default"
                          : selectedTransaction.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs mt-1"
                    >
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>

                {/* Recurring Info */}
                {selectedTransaction.isRecurring && (
                  <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Recurring</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {RECURRING_INTERVALS[selectedTransaction.recurringInterval]} • Next: {format(new Date(selectedTransaction.nextRecurringDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Receipt */}
                {selectedTransaction.receiptUrl && (
                  <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Receipt className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Receipt</p>
                      <a 
                        href={selectedTransaction.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 block"
                      >
                        View Receipt
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button
                  variant="outline"
                  onClick={() => handleEditTransaction(selectedTransaction.id)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteTransaction(selectedTransaction.id);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
