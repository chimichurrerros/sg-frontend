import type { Bill } from "@/api/sales.api";
import type { ProductDTO } from "@/api/catalog.api";
import { parsePrice } from "@/constants/price";
import type { BillDetail } from "@/types/bill-detail";
import facturaTemplate from "./factura.png";

interface PrintBillParams {
    bill: Bill;
    details: BillDetail[];
    products: ProductDTO[];
    customerName: string;
    customerRuc: string;
}

export function usePrintBill() {
    const printBill = ({ bill, details, products, customerName, customerRuc }: PrintBillParams) => {
        const date = new Date(bill.date);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("es-PY", { month: "long" });
        const year = date.getFullYear();

        const field = (top: number, left: number, value: string, extra = "") =>
            `<span style="position:absolute;top:${top}px;left:${left}px;font-size:13px;font-family:Arial;${extra}">${value}</span>`;

        const detailsHtml = details.map((detail, index) => {
            const product = products.find(p => p.id === detail.productId);
            const total = detail.quantity * detail.price;
            const rowTop = 250 + index * 22;

 return `
    ${field(rowTop, 22,  detail.quantity.toString())}
    ${field(rowTop, 75,  product?.name || "-")}
    ${field(rowTop, 386, parsePrice(detail.price))}
    ${Number(detail.taxRate) === 0  ? field(rowTop, 480, parsePrice(total)) : field(rowTop,500,"----")}
    ${Number(detail.taxRate) === 5  ? field(rowTop, 590, parsePrice(total)) : field(rowTop,600,"----")}
    ${Number(detail.taxRate) === 10 ? field(rowTop, 690, parsePrice(total)) : field(rowTop,700,"----")}
`;
        }).join("");

        const html = `
            <html>
                <head>
                    <style>
                        body { margin: 0; padding: 0; }
                        @media print { button { display: none; } }
                    </style>
                </head>
                <body>
                    <div style="position:relative;width:800px;">
                        <img src="${facturaTemplate}" style="width:100%;display:block;" />

                        <!-- Timbrado -->
                        ${field(34, 570, bill.stamp ? "TIMBRADO : "+ bill.stamp : "SIN TIMBRADO","font-size:18px;font-weight:bold;")}

                        <!-- Número de factura -->
                        ${field(94, 560, bill.number, "font-size:18px;font-weight:bold;color:red")}

                        <!-- Fecha -->
                        ${field(133, 140, day)}
                        ${field(133, 280, month)}
                        ${field(133, 485, year.toString().slice(2))}

                        <!-- Condición de venta -->
                        ${field(133, bill.isCredit ? 779 : 714, "X", "font-size:18px;")}

                        <!-- Cliente -->
                        ${field(150, 210, customerName)}
                        ${field(172, 110, customerRuc)}

                        <!-- Productos -->
                        ${detailsHtml}

                       <!-- Subtotales por columna -->
                        ${field(455, 500, parsePrice(details.filter(d => d.taxRate === 0).reduce((s, d) => s + d.quantity * d.price, 0)))}
                        ${field(455, 610, parsePrice(details.filter(d => d.taxRate === 5).reduce((s, d) => s + d.quantity * d.price, 0)))}
                        ${field(455, 710, parsePrice(details.filter(d => d.taxRate === 10).reduce((s, d) => s + d.quantity * d.price, 0)))}

                        <!-- Total a pagar -->
                        
                        ${field(490,686,parsePrice(bill.total),"font-weight:bold;font-size:17px;")}
                        <!-- Liquidación IVA -->
                        <!--{field(525, 155, parsePrice(details.filter(d => d.taxRate === 5).reduce((s, d) => s + (d.quantity * d.price * 5 / 105), 0)))}-->
                        <!--{field(525, 375, parsePrice(details.filter(d => d.taxRate === 10).reduce((s, d) => s + (d.quantity * d.price * 10 / 110), 0)))}-->
                        ${field(525, 565, parsePrice(bill.taxTotal), "font-weight:bold;")}
                    </div>
                </body>
            </html>
        `;

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(html);
        doc.close();

        iframe.onload = () => {
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 1000);
        };
    };

    return { printBill };
}