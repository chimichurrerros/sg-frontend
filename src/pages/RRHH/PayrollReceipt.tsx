import { useEffect, useRef } from "react";
import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { parsePrice } from "@/constants/price";
import type { PayrollEmployeeReceiptDto } from "@/api/payroll-processes.api";

interface PayrollReceiptProps {
  receipt: PayrollEmployeeReceiptDto;
  onClose: () => void;
}

function ReceiptHalf({ receipt }: { receipt: PayrollEmployeeReceiptDto }) {
  return (
    <Box className="receipt-half">
      <Box textAlign="center" mb={3}>
        <Text fontSize="xl" fontWeight="bold" letterSpacing="wider">
          {receipt.companyBusinessName}
        </Text>
        <Text fontSize="xs" color="gray.600">
          {receipt.companyAddress} | Tel: {receipt.companyPhone} | CUIT: {receipt.companyCuit}
        </Text>
      </Box>

      <Box textAlign="center" borderTopWidth="1px" borderBottomWidth="1px" py={1} mb={3}>
        <Text fontSize="md" fontWeight="bold">
          RECIBO DE SUELDO - {receipt.period}
        </Text>
      </Box>

      <Box className="receipt-employee" mb={3} fontSize="sm">
        <HStack justify="space-between" flexWrap="wrap">
          <Text><strong>Empleado:</strong> {receipt.employeeName}</Text>
          <Text><strong>Legajo:</strong> {receipt.employeeLegajo}</Text>
        </HStack>
        <HStack justify="space-between" flexWrap="wrap">
          <Text><strong>Documento:</strong> {receipt.employeeDocument}</Text>
          <Text><strong>Cargo:</strong> {receipt.positionName}</Text>
        </HStack>
        <HStack justify="space-between" flexWrap="wrap">
          <Text><strong>Sucursal:</strong> {receipt.branchName || "-"}</Text>
          <Text><strong>Fecha de Pago:</strong> {receipt.payDate || "-"}</Text>
        </HStack>
      </Box>

      <Box className="receipt-concepts" mb={3}>
        <table className="receipt-table">
          <thead>
            <tr>
              <th style={{ textAlign: "left", width: "60%" }}>Concepto</th>
              <th style={{ textAlign: "right", width: "40%" }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {receipt.earnings.filter((e) => e.amount !== 0).length > 0 && (
              <tr>
                <td colSpan={2} style={{ fontWeight: "bold", paddingTop: "6px", color: "#15803d" }}>
                  HABERES
                </td>
              </tr>
            )}
            {receipt.earnings.filter((e) => e.amount !== 0).map((e, i) => (
              <tr key={`e-${i}`}>
                <td>{e.conceptName}</td>
                <td style={{ textAlign: "right" }}>{parsePrice(e.amount)}</td>
              </tr>
            ))}
            {receipt.deductions.filter((d) => d.amount !== 0).length > 0 && (
              <tr>
                <td colSpan={2} style={{ fontWeight: "bold", paddingTop: "6px", color: "#b91c1c" }}>
                  DESCUENTOS
                </td>
              </tr>
            )}
            {receipt.deductions.filter((d) => d.amount !== 0).map((d, i) => (
              <tr key={`d-${i}`}>
                <td>{d.conceptName}</td>
                <td style={{ textAlign: "right" }}>{parsePrice(d.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box className="receipt-totals" mb={3}>
        <table className="receipt-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: "bold" }}>Total Haberes</td>
              <td style={{ textAlign: "right" }}>{parsePrice(receipt.totalEarnings)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold" }}>Total Descuentos</td>
              <td style={{ textAlign: "right" }}>{parsePrice(receipt.totalDeductions)}</td>
            </tr>
            <tr className="receipt-net-row">
              <td style={{ fontWeight: "bold", fontSize: "1.1em" }}>Sueldo Neto</td>
              <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "1.1em" }}>
                {parsePrice(receipt.netSalary)}
              </td>
            </tr>
          </tbody>
        </table>
      </Box>

      <Box className="receipt-signatures" mt={4} fontSize="sm">
        <HStack justify="space-between">
          <Box textAlign="center" flex={1}>
            <Text>________________________</Text>
            <Text fontWeight="medium">Firma del Empleado</Text>
          </Box>
          <Box textAlign="center" flex={1}>
            <Text>________________________</Text>
            <Text fontWeight="medium">Firma de RR.HH.</Text>
          </Box>
        </HStack>
      </Box>

    </Box>
  );
}

export default function PayrollReceipt({ receipt, onClose }: PayrollReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => {
      onClose();
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [onClose]);

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 8mm;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area,
          #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .receipt-no-print {
            display: none !important;
          }
          .receipt-half {
            page-break-inside: avoid;
            padding: 8px 12px;
            font-size: 11px;
          }
          .receipt-half:first-child {
            padding-top: 0;
          }
          .receipt-cut-line {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
        }

        @media screen {
          #receipt-print-area {
            background: white;
            color: black;
            font-family: 'Courier New', monospace;
            max-width: 210mm;
            margin: 0 auto;
          }
          .receipt-half {
            padding: 12px 16px;
            font-size: 12px;
          }
          .receipt-half:first-child {
            padding-top: 0;
          }
          .receipt-cut-line {
            border: none;
            border-top: 2px dashed #666;
            margin: 8px 0;
          }
        }

        .receipt-table {
          width: 100%;
          border-collapse: collapse;
        }
        .receipt-table th {
          border-bottom: 1px solid #333;
          padding: 4px 2px;
          font-size: 0.9em;
        }
        .receipt-table td {
          padding: 2px 2px;
        }
        .receipt-net-row td {
          border-top: 2px solid #333;
          padding-top: 4px;
        }
        .receipt-signatures {
          margin-top: 16px;
        }
      `}</style>

      <Box
        id="receipt-print-area"
        position="fixed"
        inset={0}
        zIndex={9999}
        bg="white"
        overflowY="auto"
        p={4}
      >
        <Box className="receipt-no-print" textAlign="right" mb={2}>
          <Button variant="outline" size="sm" onClick={onClose}>
            <LuX /> Cerrar
          </Button>
        </Box>

        <Box ref={printRef}>
          <ReceiptHalf receipt={receipt} />
          <hr className="receipt-cut-line" />
          <Box textAlign="center" className="receipt-no-print" fontSize="xs" color="gray.500" mb={1}>
            — Línea de corte —
          </Box>
          <ReceiptHalf receipt={receipt} />
        </Box>
      </Box>
    </>
  );
}
