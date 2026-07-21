package atmin.modules.payment.api;

public interface PaymentInternalApi {
    InvoiceDto getInvoiceByOrderId(String orderId);
}
