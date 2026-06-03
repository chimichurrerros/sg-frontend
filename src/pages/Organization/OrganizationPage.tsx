import { useEffect } from "react";
import { Tabs } from "@chakra-ui/react";
import { LuBuilding2, LuClock3, LuUsers } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmployeesPage from "@/pages/RRHH/Employees/EmployeesPage";
import { DepartmentsTab } from "./DepartmentsTab";
import { SchedulesTab } from "./SchedulesTab";

export default function OrganizationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "employees";

  useEffect(() => {
    if (!["employees", "schedules", "areas"].includes(tab)) {
      navigate("/gestiones/organizacion?tab=employees", { replace: true });
    }
  }, [navigate, tab]);

  return (
    <Tabs.Root value={tab} onValueChange={(event) => navigate(`/gestiones/organizacion?tab=${event.value}`)} lazyMount>
      <Tabs.List>
        <Tabs.Trigger value="employees">
          <LuUsers />
          Empleados
        </Tabs.Trigger>
        <Tabs.Trigger value="areas">
          <LuBuilding2 />
          Áreas y Cargos
        </Tabs.Trigger>
        <Tabs.Trigger value="schedules">
          <LuClock3 />
          Horarios
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="employees">
        <EmployeesPage
          routeBase="/gestiones/organizacion/empleados"
        />
      </Tabs.Content>
      <Tabs.Content value="areas">
        <DepartmentsTab />
      </Tabs.Content>
      <Tabs.Content value="schedules">
        <SchedulesTab />
      </Tabs.Content>
    </Tabs.Root>
  );
}
