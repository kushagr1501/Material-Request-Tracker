import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import type { MaterialRequest } from "@/types/material-request";
import { useState } from "react";
import { supabase } from "@/lib/supbase";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import { LogOut } from "lucide-react";
import AIChatAssistant from "@/components/AIChatAssistant .tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateMaterialRequestDialog } from "@/components/CreateMaterialRequestDialog";
import { Search, Package, Download, RefreshCw } from "lucide-react";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-300 shadow-sm",
    approved: "bg-sky-100 text-sky-800 border-sky-300 shadow-sm",
    rejected: "bg-rose-100 text-rose-800 border-rose-300 shadow-sm",
    fulfilled: "bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm",
  };

  return (
    <Badge
      className={`${styles[status]} font-semibold text-xs px-3 py-1 flex items-center gap-1.5 w-fit`}
      variant="outline"
    >
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "bg-slate-100 text-slate-700 border-slate-300",
    medium: "bg-blue-100 text-blue-700 border-blue-300",
    high: "bg-orange-100 text-orange-700 border-orange-300",
    urgent: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <Badge
      className={`${styles[priority]} font-semibold text-xs px-3 py-1`}
      variant="outline"
    >
      {priority}
    </Badge>
  );
}

function getActions(status: string) {
  switch (status) {
    case "pending":
      return ["approved", "rejected"];
    case "approved":
      return ["fulfilled"];
    default:
      return [];
  }
}

export default function MaterialRequests() {
  const navigate = useNavigate();
  const { data, isLoading, error, mutate } = useMaterialRequests();
  const [open, setOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reqId: string;
    action: string;
    materialName: string;
  }>({
    open: false,
    reqId: "",
    action: "",
    materialName: "",
  });

  const handleStatusChange = async (reqId: string, action: string) => {
    const toastId = toast.loading("Updating status...");

    try {
      const { error } = await supabase
        .from("material_requests")
        .update({ status: action })
        .eq("id", reqId);

      if (error) {
        throw error;
      }

      mutate();

      toast.success(`Status updated to "${action}"`, {
        id: toastId,
      });
    } catch (err) {
      console.error("Error updating status:", err);

      toast.error("Failed to update status", {
        id: toastId,
      });
    }

    setConfirmDialog({ open: false, reqId: "", action: "", materialName: "" });
  };

  const openConfirmDialog = (
    reqId: string,
    action: string,
    materialName: string
  ) => {
    setConfirmDialog({
      open: true,
      reqId,
      action,
      materialName,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-slate-600 font-medium">Loading requests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <Package className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Failed to load requests</h3>
          </div>
          <p className="text-slate-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    const toastId = toast.loading("Logging out...");

    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully", { id: toastId });
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout", { id: toastId });
    }
  };
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-slate-100 rounded-full p-6">
                <Package className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No material requests yet
            </h3>
            <p className="text-slate-500 mb-6">
              New requests will appear here once created
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors duration-200 shadow-sm"
              >
                Create New Request
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold rounded-lg shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
          {open && (
            <CreateMaterialRequestDialog
              open={open}
              onClose={() => {
                setOpen(false);
                mutate();
              }}
            />
          )}
        </div>
      </div>
    );
  }

  const filteredData = (data as MaterialRequest[]).filter((req) =>
    req.material_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //Here i implemeneted CSV export functionality using react-csv
  const csvHeaders = [
    { label: "#", key: "index" },
    { label: "Material Name", key: "material_name" },
    { label: "Quantity", key: "quantity" },
    { label: "Unit", key: "unit" },
    { label: "Status", key: "status" },
    { label: "Priority", key: "priority" },
    { label: "Date", key: "requested_at" },
  ];
  // Format data for CSV
  const csvData = (searchQuery ? filteredData : data).map((req, index) => ({
    index: index + 1,
    material_name: req.material_name,
    quantity: req.quantity,
    unit: req.unit,
    status: req.status,
    priority: req.priority,
    requested_at: new Date(req.requested_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  const filename = `material-requests-${
    new Date().toISOString().split("T")[0]
  }.csv`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                Material Requests
              </h1>
            </div>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <button
                onClick={() => setOpen(true)}
                className="flex-1 sm:flex-none bg-green-400 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
              >
                Create New Request
              </button>
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename={filename}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </CSVLink>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 transition-colors text-white font-medium rounded-lg shadow-sm"
              >
                Logout
              </button>

              {<AIChatAssistant/>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="text-slate-600 text-sm font-medium mb-1">
                Total Requests
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {data.length}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <div className="text-amber-700 text-sm font-medium mb-1">
                Pending
              </div>
              <div className="text-3xl font-bold text-amber-800">
                {
                  data.filter((r: MaterialRequest) => r.status === "pending")
                    .length
                }
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <div className="text-red-700 text-sm font-medium mb-1">
                Rejected
              </div>
              <div className="text-3xl font-bold text-red-800">
                {
                  data.filter((r: MaterialRequest) => r.status === "rejected")
                    .length
                }
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-sky-200 shadow-sm">
              <div className="text-sky-700 text-sm font-medium mb-1">
                Approved
              </div>
              <div className="text-3xl font-bold text-sky-800">
                {
                  data.filter((r: MaterialRequest) => r.status === "approved")
                    .length
                }
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-sm">
              <div className="text-emerald-700 text-sm font-medium mb-1">
                Fulfilled
              </div>
              <div className="text-3xl font-bold text-emerald-800">
                {
                  data.filter((r: MaterialRequest) => r.status === "fulfilled")
                    .length
                }
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by material name..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-slate-900 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50">
                <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider py-4">
                  #
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Material
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider text-right">
                  Quantity
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Unit
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Priority
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="font-bold text-slate-800 text-xs uppercase tracking-wider text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(filteredData as MaterialRequest[]).map((req, index) => (
                <TableRow
                  key={req.id}
                  className="border-b border-slate-100 hover:bg-blue-50/30 transition-all duration-150"
                >
                  <TableCell className="text-slate-500 font-semibold py-5">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 text-base">
                    {req.material_name}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900 text-lg">
                    {req.quantity}
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {req.unit}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={req.priority} />
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">
                    {new Date(req.requested_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="text-right">
                    {getActions(req.status).length === 0 ? (
                      <Badge
                        variant="outline"
                        className="text-slate-500 border-slate-300 bg-slate-50 cursor-not-allowed font-semibold"
                      >
                        Finalized
                      </Badge>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        {getActions(req.status).map((action) => {
                          const buttonStyles: Record<string, string> = {
                            approved:
                              "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg",
                            rejected:
                              "bg-rose-500 text-white hover:bg-rose-600 shadow-md hover:shadow-lg",
                            fulfilled:
                              "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg",
                          };

                          return (
                            <button
                              key={action}
                              className={`${buttonStyles[action]} capitalize px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105`}
                              onClick={() =>
                                openConfirmDialog(
                                  req.id,
                                  action,
                                  req.material_name
                                )
                              }
                            >
                              {action}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Showing {filteredData.length} of {data.length} requests
        </div>
      </div>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open &&
          setConfirmDialog({
            open: false,
            reqId: "",
            action: "",
            materialName: "",
          })
        }
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to mark{" "}
              <span className="font-bold text-slate-900">
                {confirmDialog.materialName}
              </span>{" "}
              as{" "}
              <span className="font-bold capitalize text-slate-900">
                {confirmDialog.action}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700 rounded-lg"
              onClick={() =>
                handleStatusChange(confirmDialog.reqId, confirmDialog.action)
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {open && (
        <CreateMaterialRequestDialog
          open={open}
          onClose={() => {
            setOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}
