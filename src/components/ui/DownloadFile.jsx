import {parseID} from "../../utils/ParseIDUtil.jsx";
import {formatDateTimeSecond, formatDateTimeSecondForCSV} from "../../utils/TimestampUtil.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const getPaymentTypeText = (type) => {
    switch (type) {
        case 'design':
            return 'Design';
        case 'deposit':
            return 'Deposit';
        case 'order':
            return 'Order';
        case 'wallet':
            return 'Top-up';
        case 'withdraw':
            return 'Withdraw';
        case 'order_return':
            return 'Refund';
        case 'design_return':
            return 'Refund';
        default:
            return type;
    }
};

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // ~32KB
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}

async function embedUnicodeFont(doc) {
    const res = await fetch("/fonts/NotoSans-Regular.ttf");
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    doc.addFileToVFS("NotoSans-Regular.ttf", base64);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    doc.setFont("NotoSans", "normal");
}

export const adminPDFHeader = ["ID", "Sender", "Receiver", "Amount", "Fee", "Type", "Status", "Date"]
export const adminPDFBody = (transactions) => {
    return transactions.map(trs => ([
        parseID(trs.id, "trs"),
        trs.sender && trs.sender.name ? trs.sender.name : "-",
        trs.receiver && trs.receiver.name ? trs.receiver.name : "-",
        new Intl.NumberFormat("vi-VN").format(trs.amount || 0) + " ₫",
        new Intl.NumberFormat("vi-VN").format(trs.serviceFee || 0) + " ₫",
        getPaymentTypeText(trs.paymentType),
        trs.status === 'success' ? 'Successful' : 'Failed',
        formatDateTimeSecond(trs.creationDate)
    ]))
}

export const designerPDFHeader = ["ID", "Sender", "Receiver", "Amount", "Fee", "Type", "Status", "Date"]
export const designerPDFBody = (transactions) => {
    return transactions.map(trs => ([
        parseID(trs.id, "trs"),
        trs.sender && trs.sender.name ? trs.sender.name : "-",
        trs.receiver && trs.receiver.name ? trs.receiver.name : "-",
        new Intl.NumberFormat("vi-VN").format(trs.amount || 0) + " ₫",
        new Intl.NumberFormat("vi-VN").format(trs.serviceFee || 0) + " ₫",
        getPaymentTypeText(trs.paymentType),
        trs.status === 'success' ? 'Successful' : 'Failed',
        formatDateTimeSecond(trs.creationDate)
    ]))
}

export const schoolPDFHeader = ["ID", "Sender", "Receiver", "Amount", "Fee", "Type", "Status", "Date"]
export const schoolPDFBody = (transactions) => {
    return transactions.map(trs => ([
        parseID(trs.id, "trs"),
        trs.sender && trs.sender.name ? trs.sender.name : "-",
        trs.receiver && trs.receiver.name ? trs.receiver.name : "-",
        new Intl.NumberFormat("vi-VN").format(trs.amount || 0) + " ₫",
        new Intl.NumberFormat("vi-VN").format(trs.serviceFee || 0) + " ₫",
        getPaymentTypeText(trs.paymentType),
        trs.status === 'success' ? 'Successful' : 'Failed',
        formatDateTimeSecond(trs.creationDate)
    ]))
}

export const garmentPDFHeader = ["ID", "Sender", "Receiver", "Amount", "Fee", "Type", "Status", "Date"]
export const garmentPDFBody = (transactions) => {
    return transactions.map(trs => ([
        parseID(trs.id, "trs"),
        trs.sender && trs.sender.name ? trs.sender.name : "-",
        trs.receiver && trs.receiver.name ? trs.receiver.name : "-",
        new Intl.NumberFormat("vi-VN").format(trs.amount || 0) + " ₫",
        new Intl.NumberFormat("vi-VN").format(trs.serviceFee || 0) + " ₫",
        getPaymentTypeText(trs.paymentType),
        trs.status === 'success' ? 'Successful' : 'Failed',
        formatDateTimeSecond(trs.creationDate)
    ]))
}


export async function handleDownloadPdf(
    transactions,
    inputHeader = [],
    inputBody,
) {
    const doc = new jsPDF({unit: "pt", format: "a1", orientation: "landscape"});
    await embedUnicodeFont(doc);

    const margin = 30; // pt
    const pageWidth = doc.internal.pageSize.getWidth();
    const printWidth = pageWidth - margin * 2;

    const numberOfColumns = inputHeader.length;
    const uniformRatio = 1 / numberOfColumns;
    const ratios = Array(numberOfColumns).fill(uniformRatio);
    const colWidths = ratios.map(r => Math.floor(printWidth * r));

    doc.setFont("NotoSans", "normal");
    doc.setFontSize(14);
    doc.text("UniSew - Transactions Report", margin, 40);

    const head = inputHeader
    const body = inputBody

    const dynamicColumnStyles = Object.fromEntries(
        colWidths.map((width, index) => [
            index,
            {
                cellWidth: width,
                halign: "left"
            }
        ])
    );

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
        columnStyles: dynamicColumnStyles,
        didDrawPage: () => {
            doc.setFontSize(14);
            doc.text("UniSew - Transactions Report", margin, 40);
        }
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;
    doc.setFontSize(10);
    doc.text(`Total Transactions: ${transactions ? transactions.length : 0}`, margin, finalY + 20);

    doc.save(`transactions_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export const adminCsvHeaders = [
    {label: "ID", key: "id"},
    {label: "Sender", key: "sender"},
    {label: "Receiver", key: "receiver"},
    {label: "Amount (VND)", key: "amount"},
    {label: "Fee (VND)", key: "fee"},
    {label: "Payment Type", key: "paymentType"},
    {label: "Status", key: "status"},
    {label: "Date (dd/MM/yyyy hh:mm:ss)", key: "date"},
];
export const adminCsvData = (transaction) => {
    return {
        id: parseID(transaction.id, "trs"),
        sender: transaction?.sender?.name || "-",
        receiver: transaction?.receiver?.name || "-",
        amount: Number(transaction?.amount || 0),
        fee: Number(transaction?.serviceFee || 0),
        paymentType: getPaymentTypeText(transaction.paymentType),
        status: transaction.status === 'success' ? 'Successful' : 'Failed',
        date: formatDateTimeSecondForCSV(transaction.creationDate),
    }
}

export const designerCsvHeaders = [
    {label: "ID", key: "id"},
    {label: "Sender", key: "sender"},
    {label: "Receiver", key: "receiver"},
    {label: "Amount (VND)", key: "amount"},
    {label: "Fee (VND)", key: "fee"},
    {label: "Payment Type", key: "paymentType"},
    {label: "Status", key: "status"},
    {label: "Date (dd/MM/yyyy hh:mm:ss)", key: "date"},
];
export const designerCsvData = (transaction) => {
    return {
        id: parseID(transaction.id, "trs"),
        sender: transaction?.sender?.name || "-",
        receiver: transaction?.receiver?.name || "-",
        amount: Number(transaction?.amount || 0),
        fee: Number(transaction?.serviceFee || 0),
        paymentType: getPaymentTypeText(transaction.paymentType),
        status: transaction.status === 'success' ? 'Successful' : 'Failed',
        date: formatDateTimeSecondForCSV(transaction.creationDate),
    }
}

export const schoolCsvHeaders = [
    {label: "ID", key: "id"},
    {label: "Sender", key: "sender"},
    {label: "Receiver", key: "receiver"},
    {label: "Amount (VND)", key: "amount"},
    {label: "Fee (VND)", key: "fee"},
    {label: "Payment Type", key: "paymentType"},
    {label: "Status", key: "status"},
    {label: "Date (dd/MM/yyyy hh:mm:ss)", key: "date"},
];
export const schoolCsvData = (transaction) => {
    return {
        id: parseID(transaction.id, "trs"),
        sender: transaction?.sender?.name || "-",
        receiver: transaction?.receiver?.name || "-",
        amount: Number(transaction?.amount || 0),
        fee: Number(transaction?.serviceFee || 0),
        paymentType: getPaymentTypeText(transaction.paymentType),
        status: transaction.status === 'success' ? 'Successful' : 'Failed',
        date: formatDateTimeSecondForCSV(transaction.creationDate),
    }
}

export const garmentCsvHeaders = [
    {label: "ID", key: "id"},
    {label: "Sender", key: "sender"},
    {label: "Receiver", key: "receiver"},
    {label: "Amount (VND)", key: "amount"},
    {label: "Fee (VND)", key: "fee"},
    {label: "Payment Type", key: "paymentType"},
    {label: "Status", key: "status"},
    {label: "Date (dd/MM/yyyy hh:mm:ss)", key: "date"},
];
export const garmentCsvData = (transaction) => {
    return {
        id: parseID(transaction.id, "trs"),
        sender: transaction?.sender?.name || "-",
        receiver: transaction?.receiver?.name || "-",
        amount: Number(transaction?.amount || 0),
        fee: Number(transaction?.serviceFee || 0),
        paymentType: getPaymentTypeText(transaction.paymentType),
        status: transaction.status === 'success' ? 'Successful' : 'Failed',
        date: formatDateTimeSecondForCSV(transaction.creationDate),
    }
}

export function mapToCsvRows(transactions, GetCSVData) {
    return transactions.map(trs => GetCSVData(trs))
}

export const filename = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;



