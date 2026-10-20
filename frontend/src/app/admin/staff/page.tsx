import StaffManager from "@/components/admin/StaffManager";
import SuperOnly from "@/components/admin/SuperOnly";

export default function AdminStaffPage() {
  return (
    <SuperOnly>
      <StaffManager />
    </SuperOnly>
  );
}