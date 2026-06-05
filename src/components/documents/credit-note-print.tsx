import type { ProductDTO } from "@/api/catalog.api";
import { parsePrice } from "@/constants/price";
import creditNoteTemplate from "./nota-credito.png";
import type { CreditNote } from "@/api/credit-notes-api";

interface PrintCreditNoteParams {
    creditNote: CreditNote;
    products: ProductDTO[];
    stamp?: string;
    ruc?: string;
    number?: string;
}

export function usePrintCreditNote() {
    const printCreditNote = ({ creditNote, products, stamp = "9892132", ruc = "10010111-1", number = "" }: PrintCreditNoteParams) => {
        const date = new Date(creditNote.date);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("es-PY", { month: "long" });
        const year = date.getFullYear();

        const field = (top: number, left: number, value: string, extra = "") =>
            `<span style="position:absolute;top:${top}px;left:${left}px;font-size:13px;font-family:Arial;${extra}">${value}</span>`;

        const securePrice = (price: string) => `${price}-`;

        const detailsHtml = creditNote.details.map((detail, index) => {
            const product = products.find(p => p.id === detail.productId);
            const total = detail.quantity * detail.price;
            const taxRate = product?.taxRate ?? 10;
            const rowTop = 281 + index * 20;

            return `
                ${field(rowTop + 2, 18, product?.barcode || "-", "font-size:10px;font-weight:bold")}
                ${field(rowTop, 97, detail.productName || product?.name || "-","font-size:10px")}
                ${field(rowTop, 356, securePrice(parsePrice(detail.price)),"font-size:10px")}
                ${field(rowTop, 496, detail.quantity.toString(),"font-size:10px")}
                ${Number(taxRate) === 0 ? field(rowTop, 595, securePrice(parsePrice(total)),"font-size:10px") : field(rowTop, 595, "---","font-size:10px")}
                ${Number(taxRate) === 5 ? field(rowTop, 685, securePrice(parsePrice(total)),"font-size:10px") : field(rowTop, 685, "---","font-size:10px")}
                ${Number(taxRate) === 10 ? field(rowTop, 770, securePrice(parsePrice(total)),"font-size:10px") : field(rowTop, 770, "---","font-size:10px")}
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
                        <img src="${creditNoteTemplate}" style="width:110%;height:90%;display:block;" />

                        <!-- Header derecho -->
                        ${field(68, 700, ruc)}
                        ${field(84, 705, stamp)}
                        ${field(100, 700, String(creditNote.id), "font-weight:bold;")}

                        <!-- Fecha de emisión -->
                        ${field(148, 154, `${day} de ${month} de ${year}`)}

                        <!-- Cliente -->
                        ${field(167, 589, creditNote.customerName)}
                        ${field(167, 210, creditNote.customerRuc)}

                        <!-- Factura relacionada -->
                        ${field(213, 158, creditNote.billNumber)}

                        <!-- Productos -->
                        ${detailsHtml}

                        <!-- Subtotales -->
                        ${field(600, 530 + 50, securePrice(parsePrice(creditNote.details.filter((_, i) => (products.find(p => p.id === creditNote.details[i].productId)?.taxRate ?? 10) === 0).reduce((s, d) => s + d.quantity * d.price, 0))), "font-size:10px")}
                        ${field(600, 620 + 50, securePrice(parsePrice(creditNote.details.filter((_, i) => (products.find(p => p.id === creditNote.details[i].productId)?.taxRate ?? 10) === 5).reduce((s, d) => s + d.quantity * d.price, 0))), "font-size:10px")}
                        ${field(600, 715 + 50, securePrice(parsePrice(creditNote.details.filter((_, i) => (products.find(p => p.id === creditNote.details[i].productId)?.taxRate ?? 10) === 10).reduce((s, d) => s + d.quantity * d.price, 0))), "font-size:10px")}

                        <!-- Total de la operación -->
                        ${field(616, 202, securePrice(parsePrice(creditNote.total)), "font-size:12px;font-weight:bold;")}

                        <!-- Total en guaraníes -->
                        ${field(616 + 12, 202, securePrice(parsePrice(creditNote.total)), "font-size:12px;font-weight:bold;")}

                        <!-- Liquidación IVA -->
                        ${field(640, 120 + 90, securePrice(parsePrice(creditNote.details.filter((_, i) => (products.find(p => p.id === creditNote.details[i].productId)?.taxRate ?? 10) === 5).reduce((s, d) => s + (d.quantity * d.price * 5 / 105), 0))),"font-size:10px")}
                        ${field(640, 380 + 90, securePrice(parsePrice(creditNote.details.filter((_, i) => (products.find(p => p.id === creditNote.details[i].productId)?.taxRate ?? 10) === 10).reduce((s, d) => s + (d.quantity * d.price * 10 / 110), 0))),"font-size:10px")}
                        ${field(640, 620 + 90, securePrice(parsePrice(
            creditNote.details.filter((_, i) => (products.find(p => p.id === creditNote.details[i].productId)?.taxRate ?? 10) === 5).reduce((s, d) => s + (d.quantity * d.price * 5 / 105), 0) +
            creditNote.details.filter((_, i) => (products.find(p => p.id === creditNote.details[i].productId)?.taxRate ?? 10) === 10).reduce((s, d) => s + (d.quantity * d.price * 10 / 110), 0)
        )), "font-weight:bold;font-size:10px")}
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

    return { printCreditNote };
}