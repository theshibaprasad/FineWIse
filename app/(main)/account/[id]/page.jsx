import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";

function AccountContent({ account, transactions }) {
  return (
    <div className="space-y-8 px-5 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300 ease-in-out">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
            {account.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300 ease-in-out">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
            ₹{parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 ease-in-out">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <AccountChart transactions={transactions} />

      {/* Transactions Table */}
      <TransactionTable transactions={transactions} />
    </div>
  );
}

export default async function AccountPage({ params }) {
  const id = await params.id;
  
  if (!id) {
    notFound();
  }
  
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-950">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="dashboard-loader"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Loading account...</p>
          </div>
        </div>
      }
    >
      <AccountContent account={account} transactions={transactions} />
    </Suspense>
  );
}
