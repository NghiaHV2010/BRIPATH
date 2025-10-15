// VNPay in-memory order mapping (dev/sandbox only)
const vnpayOrderStore: Map<string, { user_id: string; amount: number }> = new Map();

export const vnpayOrderMapping = {
    set(txnRef: string, data: { user_id: string; amount: number }) {
        vnpayOrderStore.set(txnRef, data);
    },
    get(txnRef: string) {
        return vnpayOrderStore.get(txnRef);
    },
    delete(txnRef: string) {
        vnpayOrderStore.delete(txnRef);
    }
};

// Idempotency helper: check if transaction_id exists
export const hasPaymentByTransactionId = async (prisma: any, transactionId?: string): Promise<boolean> => {
    if (!transactionId) return false;
    const existing = await prisma.payments.findFirst({ where: { transaction_id: transactionId } });
    return !!existing;
};

// DB-backed helpers for VNPay order mapping
export const saveVnpOrderMapping = async (prisma: any, txnRef: string, userId: string, amount: number) => {
    await prisma.vnpayOrders.upsert({
        where: { vnp_TxnRef: txnRef },
        update: { user_id: userId, amount: BigInt(amount) },
        create: { vnp_TxnRef: txnRef, user_id: userId, amount: BigInt(amount) }
    });
};

export const getVnpOrderMapping = async (prisma: any, txnRef: string): Promise<{ user_id: string; amount: number } | null> => {
    const rec = await prisma.vnpayOrders.findUnique({ where: { vnp_TxnRef: txnRef } });
    if (!rec) return null;
    return { user_id: rec.user_id, amount: Number(rec.amount) };
};

export const deleteVnpOrderMapping = async (prisma: any, txnRef: string) => {
    await prisma.vnpayOrders.delete({ where: { vnp_TxnRef: txnRef } }).catch(() => {});
};

// ZaloPay mapping helpers (DB)
export const saveZaloOrderMapping = async (prisma: any, appTransId: string, userId: string, amount: number) => {
    await prisma.zalopayOrders.upsert({
        where: { app_trans_id: appTransId },
        update: { user_id: userId, amount: BigInt(amount) },
        create: { app_trans_id: appTransId, user_id: userId, amount: BigInt(amount) }
    });
};

export const getZaloOrderMapping = async (prisma: any, appTransId: string): Promise<{ user_id: string; amount: number } | null> => {
    const rec = await prisma.zalopayOrders.findUnique({ where: { app_trans_id: appTransId } });
    if (!rec) return null;
    return { user_id: rec.user_id, amount: Number(rec.amount) };
};

export const deleteZaloOrderMapping = async (prisma: any, appTransId: string) => {
    await prisma.zalopayOrders.delete({ where: { app_trans_id: appTransId } }).catch(() => {});
};


