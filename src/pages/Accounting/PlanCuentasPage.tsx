import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Grid,
  Stack,
  Tabs,
  Badge,
  Input,
  Checkbox,
  Dialog,
  Portal,
  Field,
  Table,
  HStack,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuPlus,
  LuFolderPlus,
  LuPencil,
  LuTrash2,
  LuCalendar,
  LuLock,
  LuLockOpen,
} from "react-icons/lu";
import { useAllAccountantProcesses, useCreateAccountantProcess, useUpdateAccountantProcess } from "@/queries/accountantProcesses.queries";
import { useAllAccountPlans, useCreateAccountPlan, useUpdateAccountPlan, useDeleteAccountPlan } from "@/queries/accountPlans.queries";
import { LoadingScreen } from "@/components/ui/screens/loading-screen";
import { ErrorScreen } from "@/components/ui/screens/error-screen";
import { SelectWrapper } from "@/components/ui/wrappers/select-wrapper";
import { toaster } from "@/components/ui/toaster";
import { DatePickerWrapper } from "@/components/ui/wrappers/date-picker-wrapper";

export default function PlanCuentasPage() {
  const navigate = useNavigate();

  // Queries & Mutations for Periods
  const {
    data: processData,
    isLoading: isProcessLoading,
    isError: isProcessError,
    error: processError,
    refetch: refetchProcesses,
  } = useAllAccountantProcesses();
  const createProcessMutation = useCreateAccountantProcess();
  const updateProcessMutation = useUpdateAccountantProcess();

  // Queries & Mutations for Accounts
  const {
    data: planData,
    isLoading: isPlanLoading,
    isError: isPlanError,
    error: planError,
    refetch: refetchPlans,
  } = useAllAccountPlans();
  const createAccountMutation = useCreateAccountPlan();
  const updateAccountMutation = useUpdateAccountPlan();
  const deleteAccountMutation = useDeleteAccountPlan();

  // Selected Process filter (for Plan de Cuentas view)
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);

  // Auto-select first process if none selected
  const activeProcess = useMemo(() => {
    if (!processData?.accountantProcesses || processData.accountantProcesses.length === 0) return null;
    if (selectedProcessId) {
      return processData.accountantProcesses.find((p) => p.id === selectedProcessId) || processData.accountantProcesses[0];
    }
    return processData.accountantProcesses[0];
  }, [processData, selectedProcessId]);

  React.useEffect(() => {
    if (activeProcess && !selectedProcessId) {
      setSelectedProcessId(activeProcess.id);
    }
  }, [activeProcess, selectedProcessId]);

  // List of accounts filtered by the selected period
  const filteredAccounts = useMemo(() => {
    if (!planData?.accountPlans || !activeProcess) return [];
    return planData.accountPlans.filter((ap) => ap.accountantProcessId === activeProcess.id);
  }, [planData, activeProcess]);

  // Sort accounts hierarchicaly based on their Code (e.g. 1, 1.1, 1.1.1)
  const sortedAccounts = useMemo(() => {
    return [...filteredAccounts].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }));
  }, [filteredAccounts]);

  // Select dropdown option formatting
  const processOptions = useMemo(() => {
    return processData?.accountantProcesses.map((p) => ({
      label: `${p.name} ${p.isClosed ? "(Cerrado)" : "(Abierto)"}`,
      value: String(p.id),
    })) || [];
  }, [processData]);

  // Modals / Dialog State
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Form State - Period
  const [processForm, setProcessForm] = useState({
    id: null as number | null,
    name: "",
    startDate: "",
    endDate: "",
    isClosed: false,
  });

  // Form State - Account
  const [accountForm, setAccountForm] = useState({
    id: null as number | null,
    code: "",
    name: "",
    order: 0,
    parentId: null as number | null,
    isAcceptor: true,
  });

  // Open creation modal for Period
  const handleOpenProcessModal = (proc?: typeof processForm) => {
    if (proc) {
      setProcessForm(proc);
    } else {
      setProcessForm({
        id: null,
        name: "",
        startDate: "",
        endDate: "",
        isClosed: false,
      });
    }
    setIsProcessModalOpen(true);
  };

  // Open creation modal for Account
  const handleOpenAccountModal = (acc?: Partial<typeof accountForm> & { parentCode?: string }) => {
    setAccountForm({
      id: acc?.id ?? null,
      code: acc?.code ?? "",
      name: acc?.name ?? "",
      order: acc?.order ?? 0,
      parentId: acc?.parentId ?? null,
      isAcceptor: acc?.isAcceptor ?? true,
    });
    setIsAccountModalOpen(true);
  };

  // Save Period
  const handleSaveProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processForm.name || !processForm.startDate || !processForm.endDate) {
      toaster.create({ title: "Por favor complete todos los campos", type: "error" });
      return;
    }

    try {
      if (processForm.id) {
        await updateProcessMutation.mutateAsync({
          id: processForm.id,
          data: { name: processForm.name, isClosed: processForm.isClosed },
        });
        toaster.create({ title: "Período contable actualizado con éxito", type: "success" });
      } else {
        await createProcessMutation.mutateAsync({
          name: processForm.name,
          startDate: processForm.startDate,
          endDate: processForm.endDate,
          isClosed: processForm.isClosed,
        });
        toaster.create({ title: "Período contable creado con éxito", type: "success" });
      }
      setIsProcessModalOpen(false);
      refetchProcesses();
    } catch (err: any) {
      toaster.create({ title: "Error al guardar período contable", description: err.message, type: "error" });
    }
  };

  // Save Account Plan
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name || !accountForm.code) {
      toaster.create({ title: "Por favor ingrese código y nombre", type: "error" });
      return;
    }
    if (!activeProcess) return;

    try {
      if (accountForm.id) {
        await updateAccountMutation.mutateAsync({
          id: accountForm.id,
          data: {
            name: accountForm.name,
            code: accountForm.code,
            order: accountForm.order,
            parentId: accountForm.parentId,
            isAcceptor: accountForm.isAcceptor,
            accountantProcessId: activeProcess.id,
          },
        });
        toaster.create({ title: "Cuenta contable actualizada", type: "success" });
      } else {
        await createAccountMutation.mutateAsync({
          name: accountForm.name,
          code: accountForm.code,
          order: accountForm.order,
          parentId: accountForm.parentId,
          isAcceptor: accountForm.isAcceptor,
          accountantProcessId: activeProcess.id,
        });
        toaster.create({ title: "Cuenta contable creada", type: "success" });
      }
      setIsAccountModalOpen(false);
      refetchPlans();
    } catch (err: any) {
      const errorMsg = err.response?.data?.ErrorMessage || err.message;
      toaster.create({ title: "Error al guardar cuenta", description: errorMsg, type: "error" });
    }
  };

  // Delete Account
  const handleDeleteAccount = async (id: number) => {
    if (!window.confirm("¿Está seguro de eliminar esta cuenta contable? Se eliminarán todas las relaciones.")) return;
    try {
      await deleteAccountMutation.mutateAsync(id);
      toaster.create({ title: "Cuenta contable eliminada con éxito", type: "success" });
      refetchPlans();
    } catch (err: any) {
      const errorMsg = err.response?.data?.ErrorMessage || err.message;
      toaster.create({ title: "Error al eliminar la cuenta", description: errorMsg, type: "error" });
    }
  };

  // Close/Open a period contable directly
  const handleToggleProcessClose = async (proc: any) => {
    try {
      await updateProcessMutation.mutateAsync({
        id: proc.id,
        data: { name: proc.name, isClosed: !proc.isClosed },
      });
      toaster.create({
        title: proc.isClosed ? "Período contable reabierto" : "Período contable cerrado",
        type: "success",
      });
      refetchProcesses();
    } catch (err: any) {
      toaster.create({ title: "Error al cambiar estado del período", description: err.message, type: "error" });
    }
  };

  // Helper to determine depth based on dots in Code (e.g. "1.1.2" has depth 2)
  const getDepth = (code: string) => {
    return (code.match(/\./g) || []).length;
  };

  const isPending =
    createProcessMutation.isPending ||
    updateProcessMutation.isPending ||
    createAccountMutation.isPending ||
    updateAccountMutation.isPending ||
    deleteAccountMutation.isPending;

  if (isProcessLoading || isPlanLoading) {
    return <LoadingScreen message="Cargando datos contables..." height="full" />;
  }

  if (isProcessError || isPlanError) {
    const errorDetails = processError?.message || planError?.message || "Error al conectar con la base de datos";
    return (
      <ErrorScreen
        title="Error de Conexión Contable"
        errorMessage={errorDetails}
        retry={() => {
          refetchProcesses();
          refetchPlans();
        }}
      />
    );
  }

  return (
    <Stack gap={6} paddingInline="5%" py={4}>
      {/* Title block */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
        <Stack gap={1}>
          <Button
            variant="ghost"
            size="sm"
            alignSelf="start"
            onClick={() => navigate("/dash/contabilidad")}
            p={0}
            _hover={{ bg: "transparent", color: "brand.primary" }}
          >
            <LuArrowLeft /> Volver al Panel
          </Button>
          <Heading size="xl" fontWeight="bold">
            Configuración Contable
          </Heading>
        </Stack>
      </Flex>

      {/* Tabs list */}
      <Tabs.Root defaultValue="plan" lazyMount>
        <Tabs.List bg="gray.50" p={1.5} borderRadius="lg" border="1px solid" borderColor="gray.200">
          <Tabs.Trigger value="plan" py={2} px={4} fontSize="sm" fontWeight="semibold" _selected={{ bg: "white", shadow: "xs", borderRadius: "md", color: "brand.primary" }}>
            Plan de Cuentas
          </Tabs.Trigger>
          <Tabs.Trigger value="periodos" py={2} px={4} fontSize="sm" fontWeight="semibold" _selected={{ bg: "white", shadow: "xs", borderRadius: "md", color: "brand.primary" }}>
            Periodos Contables
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab 1: Plan de Cuentas */}
        <Tabs.Content value="plan" mt={4}>
          <Flex direction="column" gap={4}>
            {/* Toolbar block */}
            <Flex justify="space-between" align="center" wrap="wrap" gap={4} bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="xs">
              <HStack gap={4} flex={1} minW="250px">
                <Text fontSize="sm" fontWeight="semibold" color="gray.600" whiteSpace="nowrap">
                  Periodo Activo:
                </Text>
                {processOptions.length > 0 ? (
                  <SelectWrapper
                    options={processOptions}
                    value={String(selectedProcessId)}
                    onValueChange={(val) => setSelectedProcessId(Number(val))}
                    width="260px"
                  />
                ) : (
                  <Text color="red.500" fontSize="sm" fontWeight="bold">
                    No hay períodos contables creados.
                  </Text>
                )}
              </HStack>
              <Button
                bgColor="brand.primary"
                color="white"
                size="md"
                disabled={!activeProcess || activeProcess.isClosed}
                onClick={() => handleOpenAccountModal({ parentId: null })}
                _hover={{ bg: "brand.secondary" }}
                gap={2}
              >
                <LuPlus /> Nueva Cuenta Raíz
              </Button>
            </Flex>

            {/* Closed warning banner */}
            {activeProcess?.isClosed && (
              <Flex align="center" gap={3} p={4} bg="red.50" border="1px solid" borderColor="red.150" borderRadius="xl" color="red.700">
                <LuLock size={20} />
                <Box>
                  <Text fontWeight="bold" fontSize="sm">Período Cerrado</Text>
                  <Text fontSize="xs">Este período está bloqueado para auditoría. No se permiten crear, modificar ni eliminar cuentas o asientos.</Text>
                </Box>
              </Flex>
            )}

            {/* Chart of accounts listing */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs" overflow="hidden">
              <Box p={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                <Text fontSize="sm" fontWeight="bold" color="gray.700">Estructura del Plan de Cuentas</Text>
              </Box>
              
              {sortedAccounts.length === 0 ? (
                <Box p={10} textAlign="center">
                  <Text color="gray.500" fontSize="md">No hay cuentas contables registradas para este período.</Text>
                  {!activeProcess?.isClosed && (
                    <Button mt={4} variant="outline" borderColor="brand.primary" color="brand.primary" size="sm" onClick={() => handleOpenAccountModal({ parentId: null })}>
                      Crear primera cuenta
                    </Button>
                  )}
                </Box>
              ) : (
                <Stack gap={0} py={2}>
                  {sortedAccounts.map((account) => {
                    const depth = getDepth(account.code);
                    return (
                      <Flex
                        key={account.id}
                        align="center"
                        justify="space-between"
                        py={2}
                        px={4}
                        pl={`${(depth * 24) + 16}px`}
                        _hover={{ bg: "gray.50" }}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                        wrap="wrap"
                        gap={2}
                      >
                        <Flex align="center" gap={3}>
                          <Text fontFamily="mono" fontSize="sm" fontWeight="bold" color="brand.primary">
                            {account.code}
                          </Text>
                          <Text fontSize="sm" fontWeight={depth === 0 ? "bold" : "medium"} color="gray.800">
                            {account.name}
                          </Text>
                          {account.isAcceptor ? (
                            <Badge colorPalette="green" size="sm" variant="surface">Imputable</Badge>
                          ) : (
                            <Badge colorPalette="gray" size="sm" variant="outline">Agrupador</Badge>
                          )}
                        </Flex>
                        
                        <Flex gap={2}>
                          {/* Add Subaccount button (only if not acceptor) */}
                          {!account.isAcceptor && !activeProcess?.isClosed && (
                            <Button
                              size="xs"
                              variant="ghost"
                              color="teal.600"
                              _hover={{ bg: "teal.50" }}
                              onClick={() => {
                                // Propose code suggestion (e.g. parentCode + ".")
                                handleOpenAccountModal({ parentId: account.id, code: `${account.code}.` });
                              }}
                              gap={1}
                            >
                              <LuFolderPlus /> Subcuenta
                            </Button>
                          )}
                          
                          {/* Edit button */}
                          {!activeProcess?.isClosed && (
                            <Button
                              size="xs"
                              variant="ghost"
                              color="blue.600"
                              _hover={{ bg: "blue.50" }}
                              onClick={() => handleOpenAccountModal(account)}
                            >
                              <LuPencil />
                            </Button>
                          )}
                          
                          {/* Delete button */}
                          {!activeProcess?.isClosed && (
                            <Button
                              size="xs"
                              variant="ghost"
                              color="red.600"
                              _hover={{ bg: "red.50" }}
                              onClick={() => handleDeleteAccount(account.id)}
                            >
                              <LuTrash2 />
                            </Button>
                          )}
                        </Flex>
                      </Flex>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Flex>
        </Tabs.Content>

        {/* Tab 2: Periodos Contables */}
        <Tabs.Content value="periodos" mt={4}>
          <Flex direction="column" gap={4}>
            {/* Toolbar block */}
            <Flex justify="space-between" align="center" bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="xs">
              <Box>
                <Heading size="md" fontWeight="bold" color="gray.800">Historial de Periodos Contables</Heading>
                <Text fontSize="xs" color="gray.500">Administra los ejercicios anuales y habilita/bloquea el registro contable.</Text>
              </Box>
              <Button
                bgColor="brand.primary"
                color="white"
                size="md"
                onClick={() => handleOpenProcessModal()}
                _hover={{ bg: "brand.secondary" }}
                gap={2}
              >
                <LuPlus /> Crear Nuevo Periodo
              </Button>
            </Flex>

            {/* List of Processes */}
            <Box bg="white" borderRadius="xl" border="1px solid" borderColor="gray.200" shadow="xs" overflow="hidden">
              <Table.Root>
                <Table.Header bg="gray.50">
                  <Table.Row>
                    <Table.ColumnHeader fontWeight="bold">Nombre del Periodo</Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="bold">Fecha Inicio</Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="bold">Fecha Fin</Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="bold">Estado</Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="bold" textAlign="right">Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {processData?.accountantProcesses.map((proc) => {
                    const isClosed = proc.isClosed;
                    return (
                      <Table.Row key={proc.id} _hover={{ bg: "gray.50/50" }}>
                        <Table.Cell fontWeight="semibold">{proc.name}</Table.Cell>
                        <Table.Cell>{proc.startDate}</Table.Cell>
                        <Table.Cell>{proc.endDate}</Table.Cell>
                        <Table.Cell>
                          {isClosed ? (
                            <Badge colorPalette="red" variant="solid" gap={1} display="inline-flex" >
                              <LuLock size={12} /> Cerrado
                            </Badge>
                          ) : (
                            <Badge colorPalette="green" variant="solid" gap={1} display="inline-flex">
                              <LuLockOpen size={12} /> Abierto
                            </Badge>
                          )}
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                          <HStack gap={2} justify="flex-end">
                            {/* Toggle Close/Open Button */}
                            <Button
                              size="xs"
                              variant="surface"
                              colorPalette={isClosed ? "green" : "red"}
                              onClick={() => handleToggleProcessClose(proc)}
                              gap={1}
                            >
                              {isClosed ? <LuLockOpen /> : <LuLock />}
                              {isClosed ? "Reabrir" : "Cerrar"}
                            </Button>
                            
                            {/* Edit Button */}
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleOpenProcessModal({
                                id: proc.id,
                                name: proc.name,
                                startDate: proc.startDate,
                                endDate: proc.endDate,
                                isClosed: proc.isClosed,
                              })}
                            >
                              <LuPencil /> Editar
                            </Button>
                          </HStack>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Box>
          </Flex>
        </Tabs.Content>
      </Tabs.Root>

      {/* Account Plan Create/Edit Modal Dialog */}
      <Dialog.Root open={isAccountModalOpen} onOpenChange={(e) => setIsAccountModalOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
            <Dialog.Content as="form" onSubmit={handleSaveAccount} bg="white" borderRadius="xl" p={6} border="1px solid" borderColor="gray.200" shadow="xl" w="450px">
              <Dialog.Header pb={4}>
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  {accountForm.id ? "Editar Cuenta Contable" : "Nueva Cuenta Contable"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root required>
                    <Field.Label fontWeight="semibold" fontSize="xs">Código Contable (ej: 1.1.01)</Field.Label>
                    <Input
                      placeholder="Ingrese el código jerárquico"
                      value={accountForm.code}
                      onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                      disabled={isPending}
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label fontWeight="semibold" fontSize="xs">Nombre de Cuenta</Field.Label>
                    <Input
                      placeholder="Ingrese el nombre"
                      value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                      disabled={isPending}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontWeight="semibold" fontSize="xs">Orden de Visualización</Field.Label>
                    <Input
                      type="number"
                      value={accountForm.order}
                      onChange={(e) => setAccountForm({ ...accountForm, order: Number(e.target.value) })}
                      disabled={isPending}
                    />
                  </Field.Root>

                  {/* IsAcceptor / Imputable checkbox */}
                  <Checkbox.Root
                    checked={accountForm.isAcceptor}
                    onCheckedChange={(checked) => setAccountForm({ ...accountForm, isAcceptor: Boolean(checked.checked) })}
                    disabled={isPending}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>
                      <Text fontWeight="semibold" fontSize="sm">Cuenta Imputable (Asentable)</Text>
                      <Text fontSize="xs" color="gray.500">Habilita esta cuenta para recibir movimientos en el Libro Diario.</Text>
                    </Checkbox.Label>
                  </Checkbox.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer pt={4} gap={3}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setIsAccountModalOpen(false)} disabled={isPending}>
                    Cancelar
                  </Button>
                </Dialog.ActionTrigger>
                <Button type="submit" bgColor="brand.primary" color="white" size="sm" loading={isPending}>
                  Guardar Cuenta
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Period AccountantProcess Create/Edit Modal Dialog */}
      <Dialog.Root open={isProcessModalOpen} onOpenChange={(e) => setIsProcessModalOpen(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
            <Dialog.Content as="form" onSubmit={handleSaveProcess} bg="white" borderRadius="xl" p={6} border="1px solid" borderColor="gray.200" shadow="xl" w="450px">
              <Dialog.Header pb={4}>
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  {processForm.id ? "Editar Período Contable" : "Crear Período Contable"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Field.Root required>
                    <Field.Label fontWeight="semibold" fontSize="xs">Nombre del Período</Field.Label>
                    <Input
                      placeholder="Ej: Ejercicio Fiscal 2026"
                      value={processForm.name}
                      onChange={(e) => setProcessForm({ ...processForm, name: e.target.value })}
                      disabled={isPending}
                    />
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label fontWeight="semibold" fontSize="xs">Fecha Inicio</Field.Label>
                    <DatePickerWrapper
                    value = { processForm.startDate}
                    onChange={(e) => setProcessForm({ ...processForm, startDate: e[0] })}
                    readOnly={isPending || !!processForm.id}
                    />
                    {/* <Input
                      type="date"
                      value={processForm.startDate}
                      
                      disabled= // Cannot edit start date of existing period
                    /> */}
                  </Field.Root>

                  <Field.Root required>
                    <Field.Label fontWeight="semibold" fontSize="xs">Fecha Fin</Field.Label>
                      <DatePickerWrapper
                    value = { processForm.endDate}
                    onChange={(e) => setProcessForm({ ...processForm, endDate: e[0] })}
                    readOnly={isPending || !!processForm.id}
                    />
                    {/* <Input
                      type="date"
                      value={processForm.endDate}
                      onChange={(e) => setProcessForm({ ...processForm, endDate: e.target.value })}
                      disabled={isPending || !!processForm.id} // Cannot edit end date of existing period
                    /> */}
                  </Field.Root>

                  {/* IsClosed flag */}
                  {!!processForm.id && (
                    <Checkbox.Root
                      checked={processForm.isClosed}
                      onCheckedChange={(checked) => setProcessForm({ ...processForm, isClosed: Boolean(checked.checked) })}
                      disabled={isPending}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>
                        <Text fontWeight="semibold" fontSize="sm">Cerrar período fiscal</Text>
                        <Text fontSize="xs" color="gray.500">Bloquea todas las modificaciones contables del período.</Text>
                      </Checkbox.Label>
                    </Checkbox.Root>
                  )}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer pt={4} gap={3}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setIsProcessModalOpen(false)} disabled={isPending}>
                    Cancelar
                  </Button>
                </Dialog.ActionTrigger>
                <Button type="submit" bgColor="brand.primary" color="white" size="sm" loading={isPending}>
                  Guardar Periodo
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  );
}
