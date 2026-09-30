package atmin.modules.payment.controller;

import atmin.modules.payment.api.InvoiceDto;
import atmin.modules.payment.api.PaymentInternalApi;
import atmin.modules.payment.dto.PaymentRequestDto;
import atmin.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal/payments")
@RequiredArgsConstructor
public class InternalPaymentController {

    private final PaymentInternalApi paymentInternalApi;
    private final PaymentService paymentService;

    @GetMapping("/invoices/{orderId}")
    public InvoiceDto getInvoiceByOrderId(@PathVariable String orderId) {
        return paymentInternalApi.getInvoiceByOrderId(orderId);
    }

    @PostMapping("/create-link")
    public String createPaymentLink(@RequestBody PaymentRequestDto request) {
        return paymentService.createPaymentLink(request);
    }
}
