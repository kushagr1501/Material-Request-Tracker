import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  materialRequestSchema,
  type MaterialRequestForm,
} from "../schemas/materialRequest.schema.ts";
import { supabase } from "@/lib/supbase";
import toast from "react-hot-toast";
import { Package, Hash, Ruler, AlertCircle, FileText } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateMaterialRequestDialog({ open, onClose }: Props) {
  const form = useForm<MaterialRequestForm>({
    resolver: zodResolver(materialRequestSchema),
    defaultValues: {
      material_name: "",
      quantity: 1,
      unit: "",
      priority: "medium",
      notes: "",
    },
  });

  const onSubmit = async (values: MaterialRequestForm) => {
    const toastId = toast.loading("Creating request...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("material_requests").insert({
        material_name: values.material_name,
        quantity: values.quantity,
        unit: values.unit,
        priority: values.priority,
        notes: values.notes,
        status: "pending",
        requested_by: user.id,
        company_id: user.user_metadata.company_id,
      });

      if (error) throw error;

      toast.success("Material request created successfully!", { id: toastId });
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Failed to create request", { id: toastId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[95vw] sm:w-full 
          sm:max-w-[500px] 
          max-h-[90vh] overflow-y-auto
        "
      >
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                New Material Request
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1">
                Fill in the details for your material request
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-4 pb-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              Material Name
            </Label>
            <Input className="h-11" {...form.register("material_name")} />
            {form.formState.errors.material_name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.material_name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-500" />
                Quantity
              </Label>
              <Input
                type="number"
                className="h-11"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-slate-500" />
                Unit
              </Label>
              <Input className="h-11" {...form.register("unit")} />
              {form.formState.errors.unit && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {form.formState.errors.unit.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              Priority Level
            </Label>
            <Select
              defaultValue="medium"
              onValueChange={(v) =>
                form.setValue(
                  "priority",
                  v as "low" | "medium" | "high" | "urgent"
                )
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-slate-50">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.priority && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.priority.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Additional Notes
            </Label>
            <Textarea
              className="min-h-[100px] resize-none"
              {...form.register("notes")}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="h-11 w-full bg-blue-600 text-white"
            >
              Create Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
