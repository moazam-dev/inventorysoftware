// CSV Export Utilities for Logs

export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const generateYearCSV = async (year, API_URL) => {
    try {
        // Fetch all months for the year
        const monthsRes = await fetch(`${API_URL}/logs/${year}`);
        const monthsData = await monthsRes.json();
        const months = monthsData.data;

        let csvContent = `Year ${year} - Business Logs\n\n`;

        // Summary section
        csvContent += `YEAR SUMMARY\n`;
        csvContent += `Month,Items Sold,Revenue,Expenses,Profit,Loss\n`;

        for (const month of months) {
            if (month.hasData) {
                csvContent += `${month.name},${month.itemsSold},${month.totalRevenue},${month.totalExpenses},${month.totalProfit},${month.totalLoss}\n`;
            }
        }

        csvContent += `\n\nDETAILED MONTHLY BREAKDOWN\n\n`;

        // For each month, get days
        for (const month of months) {
            if (!month.hasData) continue;

            const daysRes = await fetch(`${API_URL}/logs/${year}/${month.month}`);
            const daysData = await daysRes.json();
            const days = daysData.data;

            csvContent += `\n${month.name} ${year}\n`;
            csvContent += `Day,Revenue,Expenses,Profit,Loss,Items Sold\n`;

            for (const day of days) {
                csvContent += `${day.day},${day.totalRevenue},${day.totalExpenses},${day.totalProfit},${day.totalLoss},${day.itemsSold}\n`;
            }
        }

        return csvContent;
    } catch (error) {
        console.error('Error generating year CSV:', error);
        return null;
    }
};

export const generateMonthCSV = async (year, month, monthName, API_URL) => {
    try {
        const daysRes = await fetch(`${API_URL}/logs/${year}/${month}`);
        const daysData = await daysRes.json();
        const days = daysData.data;

        let csvContent = `${monthName} ${year} - Business Logs\n\n`;

        // Summary
        csvContent += `MONTH SUMMARY\n`;
        csvContent += `Day,Date,Revenue,Expenses,Profit,Loss,Items Sold,Items Returned\n`;

        for (const day of days) {
            csvContent += `${day.day},${day.date},${day.totalRevenue},${day.totalExpenses},${day.totalProfit},${day.totalLoss},${day.itemsSold},${day.itemsReturned}\n`;
        }

        csvContent += `\n\nDETAILED DAILY TRANSACTIONS\n\n`;

        // For each day, get transactions
        for (const day of days) {
            const detailsRes = await fetch(`${API_URL}/logs/${year}/${month}/${day.day}`);
            const detailsData = await detailsRes.json();
            const details = detailsData.data;

            if (details.transactions && details.transactions.length > 0) {
                csvContent += `\nDay ${day.day} - ${day.date}\n`;
                csvContent += `Time,Type,Description,Amount,Party Name\n`;

                for (const txn of details.transactions) {
                    const time = new Date(txn.date || txn.createdAt).toLocaleTimeString();
                    const type = txn.type.replace(/_/g, ' ').toUpperCase();
                    const description = txn.description || txn.partyName || 'N/A';
                    const amount = txn.amount || txn.totalAmount || 0;
                    const party = txn.partyName || 'N/A';

                    csvContent += `${time},${type},${description},${amount},${party}\n`;
                }
            }
        }

        return csvContent;
    } catch (error) {
        console.error('Error generating month CSV:', error);
        return null;
    }
};

export const generateDayCSV = (dayDetails, year, month, day) => {
    try {
        let csvContent = `Day ${day} - ${month}/${year} - Business Logs\n\n`;

        // Summary
        csvContent += `DAY SUMMARY\n`;
        csvContent += `Revenue,Expenses,Profit,Loss\n`;
        csvContent += `${dayDetails.totalRevenue},${dayDetails.totalExpenses},${dayDetails.totalProfit},${dayDetails.totalLoss}\n\n`;

        // Transactions
        csvContent += `TRANSACTIONS\n`;
        csvContent += `Time,Type,Description,Party Name,Amount,Items,Notes\n`;

        if (dayDetails.transactions) {
            for (const txn of dayDetails.transactions) {
                const time = new Date(txn.date || txn.createdAt).toLocaleTimeString();
                const type = txn.type.replace(/_/g, ' ').toUpperCase();
                const description = txn.description || 'N/A';
                const party = txn.partyName || 'N/A';
                const amount = txn.amount || txn.totalAmount || 0;
                const items = txn.items ? txn.items.map(i => `${i.productName || i.product?.name}(${i.quantity})`).join('; ') : 'N/A';
                const notes = (txn.notes || '').replace(/,/g, ';');

                csvContent += `${time},${type},${description},${party},${amount},"${items}",${notes}\n`;
            }
        }

        return csvContent;
    } catch (error) {
        console.error('Error generating day CSV:', error);
        return null;
    }
};

export const generateSupplierLedgerCSV = (supplierData, supplierName) => {
    try {
        let csvContent = `Supplier Ledger - ${supplierName}\n\n`;

        // Summary
        csvContent += `SUMMARY\n`;
        csvContent += `Total Purchased,Total Returned,Net Volume\n`;
        csvContent += `${supplierData.stats.totalPurchased},${supplierData.stats.totalReturned},${supplierData.stats.netVolume}\n\n`;

        // Transaction History
        csvContent += `TRANSACTION HISTORY\n`;
        csvContent += `Date,Time,Type,Description,Amount,Notes\n`;

        if (supplierData.ledger && supplierData.ledger.length > 0) {
            for (const entry of supplierData.ledger) {
                // Format date and time properly
                const dateObj = new Date(entry.date);
                const date = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
                const hours = dateObj.getHours();
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                const time = `${hours}:${minutes}:${seconds}`;

                // Get type and description based on entry type
                let type = '';
                let description = '';
                let amount = 0;
                let notes = '';

                if (entry.type === 'purchase') {
                    type = 'PURCHASE';
                    description = entry.description || 'Stock Purchase';
                    amount = entry.amount || 0;
                    notes = (entry.notes || '').replace(/,/g, ';');
                } else if (entry.type === 'return') {
                    type = 'RETURN';
                    description = entry.description || 'Return to Supplier';
                    amount = entry.amount || 0;
                    notes = (entry.notes || '').replace(/,/g, ';');
                }

                csvContent += `${date},${time},${type},"${description}",${amount},"${notes}"\n`;
            }
        }

        return csvContent;
    } catch (error) {
        console.error('Error generating supplier ledger CSV:', error);
        return null;
    }
};
