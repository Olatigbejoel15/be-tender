import AuditLog from "@/components/admin/AuditLog";
import SuperOnly from "@/components/admin/SuperOnly";

export default function AdminAuditLogPage() {
  return (
    <SuperOnly>
      <AuditLog />
    </SuperOnly>
  );
}