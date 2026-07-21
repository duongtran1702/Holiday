package atmin.modules.payment.api;

import atmin.modules.payment.entity.Invoice;
import atmin.modules.payment.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentInternalApiImpl implements PaymentInternalApi {

    private final InvoiceRepository invoiceRepository;

    @Override
    public InvoiceDto getInvoiceByOrderId(String orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for orderId: " + orderId));
        return InvoiceDto.fromEntity(invoice);
    }
}
