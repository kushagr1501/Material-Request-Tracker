import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import type { MaterialRequest } from "@/types/material-request";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
    fulfilled: "bg-green-100 text-green-800",
  };

  return (
    <Badge className={colors[status]} variant="outline">
      {status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  return (
    <Badge className={colors[priority]} variant="outline">
      {priority}
    </Badge>
  );
}

export default function MaterialRequests() {
  const { data, isLoading, error } = useMaterialRequests();

  if (isLoading) {
    return <div className="p-6">Loading material requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to load requests.</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-6">No material requests yet.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Material Requests</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(data as MaterialRequest[]).map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">
                {req.material_name}
              </TableCell>

              <TableCell>{req.quantity}</TableCell>

              <TableCell>{req.unit}</TableCell>

              <TableCell>
                <StatusBadge status={req.status} />
              </TableCell>

              <TableCell>
                <PriorityBadge priority={req.priority} />
              </TableCell>

              <TableCell>
                {new Date(req.requested_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
