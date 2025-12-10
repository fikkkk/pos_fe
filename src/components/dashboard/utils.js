
export const formatRp = (n) =>
    Number(n ?? 0).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    });

export const formatNumber = (n) => Number(n ?? 0).toLocaleString("id-ID");

export const idFmt = (n) => Number(n ?? 0).toLocaleString("id-ID");

export function getPaymentColor(method) {
    switch (method) {
        case "CASH":
            return "#2BB673";
        case "DEBIT":
            return "#1D8CF8";
        case "KREDIT":
            return "#F6B21C";
        case "QRIS":
            return "#EF5350";
        default:
            return "#999";
    }
}

export function randomColor(key) {
    const colors = [
        "#1E88E5",
        "#29B6F6",
        "#43A047",
        "#81C784",
        "#FDD835",
        "#FB8C00",
        "#E53935",
        "#F06292",
        "#8E24AA",
        "#B0BEC5",
    ];
    return colors[(key?.length ?? 0) % colors.length];
}

export function buildMonthlyYearlyFromTransactions(transactions) {
    const byYear = new Map();

    for (const t of transactions ?? []) {
        if (!t.createdAt) continue;

        const d = new Date(t.createdAt);
        if (isNaN(d)) continue;

        const year = d.getFullYear();
        const monthIndex = d.getMonth();
        const totalItem = Number(t.totalItem ?? 0);

        if (!byYear.has(year)) {
            byYear.set(year, {
                year,
                months: Array.from({ length: 12 }, (_, idx) => ({
                    month: idx + 1,
                    value: 0,
                })),
                totalYear: 0,
            });
        }

        const entry = byYear.get(year);
        entry.months[monthIndex].value += totalItem;
        entry.totalYear += totalItem;
    }

    const yearsArr = Array.from(byYear.values()).sort((a, b) => a.year - b.year);

    return {
        monthly: yearsArr,
        yearly: yearsArr.map((y) => ({
            year: y.year,
            total: y.totalYear,
        })),
    };
}
