import { Tabs } from "@chakra-ui/react";
import { LuBuilding2, LuClock3, LuUsers, LuUserCog } from "react-icons/lu";
import EmployeesPage from "@/pages/RRHH/Employees/EmployeesPage";
import { DepartmentsTab } from "./DepartmentsTab";
import { PositionsTab } from "./PositionsTab";
import { SchedulesTab } from "./SchedulesTab";

export default function OrganizationPage() {
  return (
    <Tabs.Root defaultValue="employees" lazyMount>
      <Tabs.List>
        <Tabs.Trigger value="employees">
          <LuUsers />
          Empleados
        </Tabs.Trigger>
        <Tabs.Trigger value="positions">
          <LuUserCog />
          Cargos
        </Tabs.Trigger>
        <Tabs.Trigger value="schedules">
          <LuClock3 />
          Horarios
        </Tabs.Trigger>
        <Tabs.Trigger value="areas">
          <LuBuilding2 />
          Áreas
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="employees">
        <EmployeesPage
          routeBase="/gestiones/organizacion/empleados"
          contextLabel="Gestiones / Organización / Empleados"
        />
      </Tabs.Content>
      <Tabs.Content value="positions">
        <PositionsTab />
      </Tabs.Content>
      <Tabs.Content value="schedules">
        <SchedulesTab />
      </Tabs.Content>
      <Tabs.Content value="areas">
        <DepartmentsTab />
      </Tabs.Content>
    </Tabs.Root>
  );
}
