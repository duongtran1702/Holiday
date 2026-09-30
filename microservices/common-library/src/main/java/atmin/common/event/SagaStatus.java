package atmin.common.event;

public enum SagaStatus {
    STARTED,
    STOCK_RESERVING,
    STOCK_RESERVED,
    STOCK_FAILED,
    VOUCHER_APPLYING,
    VOUCHER_APPLIED,
    VOUCHER_FAILED,
    COMPENSATING,
    COMPENSATED,
    SUCCESS
}
