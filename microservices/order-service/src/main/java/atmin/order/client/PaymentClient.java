package atmin.order.client;

import atmin.modules.payment.api.InvoiceDto;
import atmin.modules.payment.api.PaymentInternalApi;
import atmin.modules.payment.dto.PaymentRequestDto;
import atmin.modules.payment.service.PaymentService;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "payment-service", path = "/api/v1/internal/payments", fallback = PaymentClientFallback.class)
public interface PaymentClient extends PaymentInternalApi, PaymentService {

    @Override
    @GetMapping("/invoices/{orderId}")
    InvoiceDto getInvoiceByOrderId(@PathVariable("orderId") String orderId);

    @Override
    @PostMapping("/create-link")
    String createPaymentLink(@RequestBody PaymentRequestDto request);
}
