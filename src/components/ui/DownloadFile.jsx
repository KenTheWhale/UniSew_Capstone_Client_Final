import {parseID} from "../../utils/ParseIDUtil.jsx";
import {formatDateTimeSecond, formatDateTimeSecondForCSV} from "../../utils/TimestampUtil.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // ~32KB
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}

export async function embedUnicodeFont(doc) {
    const res = await fetch("/fonts/NotoSans-Regular.ttf");
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    doc.addFileToVFS("NotoSans-Regular.ttf", base64);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    doc.setFont("NotoSans", "normal");
}

export async function handleDownloadPdf(filteredTransactions, GetPaymentTypeText, GetStatusText) {
    const doc = new jsPDF({unit: "pt", format: "a1", orientation: "landscape"});
    await embedUnicodeFont(doc);

    const margin = 30; // pt
    const pageWidth = doc.internal.pageSize.getWidth();
    const printWidth = pageWidth - margin * 2;

    const ratios = [0.0636, 0.1458, 0.1794, 0.1196, 0.0972, 0.1458, 0.0972, 0.1514];
    const colWidths = ratios.map(r => Math.floor(printWidth * r));

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(14);
    doc.text("UniSew - Transactions Report", margin, 40);

    const head = [["ID", "Sender", "Receiver", "Amount", "Fee", "Type", "Status", "Date"]];
    const body = (filteredTransactions || []).map(trs => ([
        `${parseID(trs.id, "trs")}`,
        (trs.sender && trs.sender.name) ? trs.sender.name : "-",
        (trs.receiver && trs.receiver.name) ? trs.receiver.name : "-",
        new Intl.NumberFormat("vi-VN").format(trs.amount || 0) + " ₫",
        new Intl.NumberFormat("vi-VN").format(trs.serviceFee || 0) + " ₫",
        typeof GetPaymentTypeText === "function" ? GetPaymentTypeText(trs.paymentType) : (trs.paymentType || ""),
        typeof GetStatusText === "function" ? GetStatusText(trs.status) : (trs.status || ""),
        (formatDateTimeSecond(trs.creationDate))
    ]));

    autoTable(doc, {
        startY: 60,
        head,
        body,
        margin: {left: margin, right: margin},
        tableWidth: printWidth,
        theme: "grid",
        styles: {
            font: "NotoSans",
            fontSize: 10,
            cellPadding: 6,
            lineWidth: 0.2,
            overflow: "linebreak",
            textColor: 0
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: 0,
            fontStyle: "bold",
            lineWidth: 0.2
        },
        columnStyles: {
            0: {cellWidth: colWidths[0], halign: "left"},
            1: {cellWidth: colWidths[1], halign: "left"},
            2: {cellWidth: colWidths[2], halign: "left"},
            3: {cellWidth: colWidths[3], halign: "right"},
            4: {cellWidth: colWidths[4], halign: "right"},
            5: {cellWidth: colWidths[5], halign: "left"},
            6: {cellWidth: colWidths[6], halign: "left"},
            7: {cellWidth: colWidths[7], halign: "center"}
        },
        didDrawPage: () => {

            doc.setFontSize(14);
            doc.text("UniSew - Transactions Report", margin, 40);
        }
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;
    doc.setFontSize(10);
    doc.text(`Total Transactions: ${filteredTransactions ? filteredTransactions.length : 0}`, margin, finalY + 20);

    doc.save(`transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export const csvHeaders = [
    {label: "ID", key: "id"},
    {label: "Sender", key: "sender"},
    {label: "Receiver", key: "receiver"},
    {label: "Amount (VND)", key: "amount"},
    {label: "Fee (VND)", key: "fee"},
    {label: "Payment Type", key: "paymentType"},
    {label: "Status", key: "status"},
    {label: "Date (dd/MM/yyyy hh:mm:ss)", key: "date"},
];

export function mapToCsvRows(transactions, GetPaymentTypeText, GetStatusText) {
    return (transactions || []).map(trs => ({
        id: parseID(trs.id, "trs"),
        sender: trs?.sender?.name || "-",
        receiver: trs?.receiver?.name || "-",
        amount: Number(trs?.amount || 0),
        fee: Number(trs?.serviceFee || 0),
        paymentType: typeof GetPaymentTypeText === "function" ? GetPaymentTypeText(trs.paymentType) : (trs.paymentType || ""),
        status: typeof GetStatusText === "function" ? GetStatusText(trs.status) : (trs.status || ""),
        date: formatDateTimeSecondForCSV(trs.creationDate),
    }));
}



