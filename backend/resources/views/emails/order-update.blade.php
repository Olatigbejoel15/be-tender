<x-mail::message>
# {{ $headline }}

{{ $intro }}

**Order {{ $order->reference }}**

<x-mail::table>
| Item | Qty | Price |
| :--- | :-: | ----: |
@foreach ($order->items as $item)
| {{ $item->name }} ({{ $item->color }}, {{ $item->size }}) | {{ $item->quantity }} | ₦{{ number_format($item->unit_price * $item->quantity) }} |
@endforeach
| Delivery | | ₦{{ number_format($order->delivery_fee) }} |
| **Total** | | **₦{{ number_format($order->total) }}** |
</x-mail::table>

**Delivering to:** {{ $order->recipient_name }}, {{ $order->address }}, {{ $order->city }}, {{ $order->state }}

@unless ($forStaff)
<x-mail::button :url="config('shop.frontend_url') . '/order/' . $order->reference">
View your order
</x-mail::button>
@endunless

Thanks,<br>
BE TENDER
</x-mail::message>
