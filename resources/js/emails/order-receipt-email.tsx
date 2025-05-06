import {
    Html,
    Body,
    Container,
    Section,
    Text,
    Hr,
  } from '@react-email/components';
  
  interface OrderReceiptEmailProps {
    order: {
      id: number;
      created_at: string;
      items: Array<{
        item: { name: string };
        quantity: number;
        price: number;
      }>;
      shipping_first_name: string;
      shipping_last_name: string;
      shipping_address: string;
      total: number;
    };
  }
  
  export default function OrderReceiptEmail({ order }: OrderReceiptEmailProps) {
    return (
      <Html>
        <Body style={{ fontFamily: 'sans-serif' }}>
          <Container>
            <Section>
              <Text>Order Receipt #{order.id}</Text>
              <Text>Date: {new Date(order.created_at).toLocaleDateString()}</Text>
            </Section>
            <Hr />
            <Section>
              <Text>Items:</Text>
              {order.items.map((item, index) => (
                <Text key={index}>
                  {item.item.name} x{item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </Text>
              ))}
            </Section>
            <Hr />
            <Section>
              <Text>Shipping Address:</Text>
              <Text>
                {order.shipping_first_name} {order.shipping_last_name}
                <br />
                {order.shipping_address}
              </Text>
            </Section>
            <Hr />
            <Section>
              <Text style={{ fontWeight: 'bold' }}>
                Total: ${order.total.toFixed(2)}
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }