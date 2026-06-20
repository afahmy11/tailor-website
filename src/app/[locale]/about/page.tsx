import { Container, Section } from '@/components/ui';

export default function AboutPage() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="text-4xl mb-6">Craftsmanship</h1>
        <p className="text-muted leading-relaxed mb-4">
          Every abaya is cut and hand-finished to your measurements by experienced tailors.
          We work with carefully sourced fabrics and timeless silhouettes, made to last and
          made to move with you.
        </p>
        <p className="text-muted leading-relaxed">
          From your first measurement to the final stitch, your order is handled with care and
          discretion. Your measurements are private and stored securely.
        </p>
      </Container>
    </Section>
  );
}
