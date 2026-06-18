import MemberGroup from "@/components/header/action-bars";
import PageTitle from "@/components/page-title";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageTitle />
        <MemberGroup />
      </div>
    </div>
  );
}
