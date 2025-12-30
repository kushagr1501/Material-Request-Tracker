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
// import { useQueryClient } from "@tanstack/react-query";
import { Package, Hash, Ruler, AlertCircle, FileText } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateMaterialRequestDialog({ open, onClose }: Props) {
//   const queryClient = useQueryClient();

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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

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
      
    //   // Invalidate and refetch
    //   await queryClient.invalidateQueries({ queryKey: ["material_requests"] });
    //   await queryClient.refetchQueries({ queryKey: ["material_requests"] });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error("Failed to create request. Please try again.", {
        id: toastId,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
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
            <Label
              htmlFor="material_name"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-slate-500" />
              Material Name
            </Label>
            <Input
              id="material_name"
              placeholder="e.g., Cement, Steel Bars, Water"
              className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              {...form.register("material_name")}
            />
            {form.formState.errors.material_name && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.material_name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="quantity"
                className="text-sm font-semibold text-slate-700 flex items-center gap-2"
              >
                <Hash className="w-4 h-4 text-slate-500" />
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="100"
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="unit"
                className="text-sm font-semibold text-slate-700 flex items-center gap-2"
              >
                <Ruler className="w-4 h-4 text-slate-500" />
                Unit
              </Label>
              <Input
                id="unit"
                placeholder="kg, bags, liters"
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                {...form.register("unit")}
              />
              {form.formState.errors.unit && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {form.formState.errors.unit.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="priority"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-slate-500" />
              Priority Level
            </Label>
            <Select
             onValueChange={(v) => form.setValue("priority", v as "low" | "medium" | "high" | "urgent")}
              defaultValue="medium"
            >
              <SelectTrigger className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent 
                position="popper"
                sideOffset={5}
                className="z-[100]"
              >
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                    <span>Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span>High</span>
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span>Urgent</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              Additional Notes{" "}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any special requirements or instructions..."
              className="min-h-[100px] border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              {...form.register("notes")}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Request"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}