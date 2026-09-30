package atmin.modules.order.dto;

import atmin.modules.payment.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotBlank(message = "Shipping address is required")
    @Size(min = 10, max = 500, message = "Địa chỉ giao hàng phải từ 10 đến 500 ký tự")
    private String shippingAddress;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    @Size(max = 100, message = "Một đơn hàng không được vượt quá 100 dòng sản phẩm")
    private List<OrderItemDto> items;

    private String voucherCode;

    @Data
    public static class OrderItemDto {
        @NotBlank(message = "Product ID is required")
        private String productId;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Số lượng sản phẩm phải lớn hơn 0")
        private Integer quantity;

        @NotBlank(message = "Màu sản phẩm là bắt buộc")
        private String selectedColor;

        @NotBlank(message = "Kích thước sản phẩm là bắt buộc")
        private String selectedSize;
    }
}
