import { shareholderSchema } from '@/lib/validations/schemas';
import { describe, expect, it } from 'vitest';

describe('shareholderSchema', () => {
  it('accepts valid payload', () => {
    const result = shareholderSchema.safeParse({
      name: 'Alice Doe',
      email: 'alice@example.com',
      institution_id: '11111111-1111-1111-1111-111111111111',
      ownership_percent: 10
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid ownership', () => {
    const result = shareholderSchema.safeParse({
      name: 'Alice Doe',
      email: 'alice@example.com',
      institution_id: '11111111-1111-1111-1111-111111111111',
      ownership_percent: 101
    });

    expect(result.success).toBe(false);
  });
});

