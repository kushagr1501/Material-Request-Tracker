import { useMaterialRequests } from "@/hooks/useMaterialRequests";
import type { MaterialRequest } from "@/types/material-request";
import { useState } from "react";
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
  const [SearchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return <div className="p-6">Loading material requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Failed to load requests.</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-6">No material requests yet.</div>;
  }

 const filteredData=(data as MaterialRequest[]).filter((req)=>
  req.material_name.toLowerCase().includes(SearchQuery.toLowerCase())
)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 ">Material Requests</h1>

      <input
        type="text"
        placeholder="Search material requests..."
        className="mb-4 p-2 border rounded w-full"
        value={SearchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Table className="border rounded-lg overflow-hidden">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="font-semibold">Material</TableHead>
            <TableHead className="font-semibold text-right">Quantity</TableHead>
            <TableHead className="font-semibold">Unit</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(filteredData as MaterialRequest[]).map((req, index) => (
            <TableRow
              key={req.id}
              className={`
          ${index % 2 === 0 ? "bg-background" : "bg-muted/40"}
          hover:bg-muted transition-colors
        `}
            >
              <TableCell className="font-medium">{req.material_name}</TableCell>

              <TableCell className="text-right">{req.quantity}</TableCell>

              <TableCell>{req.unit}</TableCell>

              <TableCell>
                <StatusBadge status={req.status} />
              </TableCell>

              <TableCell>
                <PriorityBadge priority={req.priority} />
              </TableCell>

              <TableCell className="text-muted-foreground">
                {new Date(req.requested_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
