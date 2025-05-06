<x-mail::message>
# Order Receipt

**Order #{{ $order->id }}**

**Items:**
@foreach($order->items as $item)
- {{ $item->item->name }} x {{ $item->quantity }} - ${{ number_format($item->price * $item->quantity, 2) }}
@endforeach

**Total:** ${{ number_format($order->total, 2) }}

**Shipping Details:**
{{ $order->shipping_first_name }} {{ $order->shipping_last_name }}
{{ $order->shipping_address }}

**Payment Method:**
{{ strtoupper($order->payment_method) }}

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>