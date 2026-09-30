package atmin.modules.payment.service;

import atmin.modules.payment.dto.PaymentRequestDto;

public interface PaymentService {
    String createPaymentLink(PaymentRequestDto request);
}
