import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";
import { Suspense } from "react";

function TransactionFormWrapper({ accounts, categories, editMode, initialData }) {
  return (
    <div className="max-w-3xl mx-auto px-5 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300 ease-in-out">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">Add Transaction</h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={categories}
        editMode={editMode}
        initialData={initialData}
      />
    </div>
  );
}

export default async function AddTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const editId = await searchParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="dashboard-loader"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Loading transaction form...</p>
          </div>
        </div>
      }
    >
      <TransactionFormWrapper
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </Suspense>
  );
}
